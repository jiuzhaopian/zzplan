import { app, BrowserWindow } from 'electron'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'http'
import { randomBytes, randomUUID, timingSafeEqual } from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import { IPC_CHANNELS } from '../../shared/ipcChannels'
import type {
  AgentApiInfo,
  AgentImportRequest,
  AgentImportStatus,
} from '../../shared/planImport'

const HOST = '127.0.0.1'
const PRODUCTION_PORT = 47831
const DEVELOPMENT_PORT = 47832
const MAX_BODY_BYTES = 512 * 1024
const REQUEST_TTL_MS = 24 * 60 * 60 * 1000
const MAX_PENDING_IMPORTS = 20

interface StoredImport extends AgentImportRequest {
  status: AgentImportStatus
  resolvedAt?: string
  result?: unknown
}

interface AgentConfig {
  token: string
}

export class AgentApiService {
  private server: Server | null = null
  private mainWindow: BrowserWindow | null = null
  private token = ''
  private error: string | undefined
  private readonly imports = new Map<string, StoredImport>()

  private get port(): number {
    return app.isPackaged ? PRODUCTION_PORT : DEVELOPMENT_PORT
  }

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  async start(window: BrowserWindow): Promise<void> {
    this.setMainWindow(window)
    if (this.server) return
    this.token = this.loadOrCreateToken()

    const server = createServer((request, response) => {
      void this.handleRequest(request, response)
    })

    await new Promise<void>((resolve) => {
      const handleError = (error: NodeJS.ErrnoException) => {
        this.error = error.code === 'EADDRINUSE'
          ? `端口 ${this.port} 已被占用`
          : error.message
        resolve()
      }
      server.once('error', handleError)
      server.listen(this.port, HOST, () => {
        server.removeListener('error', handleError)
        this.server = server
        this.error = undefined
        resolve()
      })
    })
  }

  stop(): void {
    this.server?.close()
    this.server = null
  }

  getInfo(): AgentApiInfo {
    return {
      enabled: this.server !== null,
      endpoint: `http://${HOST}:${this.port}/v1`,
      token: this.token,
      error: this.error,
    }
  }

  listPendingImports(): AgentImportRequest[] {
    this.removeExpiredImports()
    return [...this.imports.values()]
      .filter((item) => item.status === 'pending')
      .map(({ id, payload, createdAt }) => ({ id, payload, createdAt }))
  }

  resolveImport(id: string, status: Exclude<AgentImportStatus, 'pending'>, result?: unknown): boolean {
    const item = this.imports.get(id)
    if (!item || item.status !== 'pending') return false
    item.status = status
    item.result = result
    item.resolvedAt = new Date().toISOString()
    return true
  }

  private get configPath(): string {
    return path.join(app.getPath('userData'), 'agent-api.json')
  }

  private loadOrCreateToken(): string {
    try {
      if (fs.existsSync(this.configPath)) {
        const config = JSON.parse(fs.readFileSync(this.configPath, 'utf-8')) as Partial<AgentConfig>
        if (typeof config.token === 'string' && /^[a-f0-9]{64}$/.test(config.token)) {
          return config.token
        }
      }
    } catch (error) {
      console.error('[AgentAPI] 读取配置失败，将重新生成令牌:', error)
    }

    const token = randomBytes(32).toString('hex')
    fs.writeFileSync(this.configPath, JSON.stringify({ token }, null, 2), 'utf-8')
    return token
  }

  private async handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
    try {
      if (request.headers.origin) {
        this.sendJson(response, 403, { error: 'Browser-origin requests are not allowed' })
        return
      }

      const url = new URL(request.url ?? '/', `http://${HOST}:${this.port}`)
      if (request.method === 'GET' && url.pathname === '/v1/status') {
        this.sendJson(response, 200, {
          name: 'zzplan-agent-api',
          version: app.getVersion(),
          status: this.server ? 'ready' : 'unavailable',
        })
        return
      }

      if (!this.isAuthorized(request)) {
        this.sendJson(response, 401, { error: 'Invalid or missing bearer token' })
        return
      }

      if (request.method === 'GET' && url.pathname === '/v1/schema') {
        this.sendJson(response, 200, this.getSchemaDocument())
        return
      }

      if (request.method === 'POST' && url.pathname === '/v1/imports') {
        if (!request.headers['content-type']?.toLowerCase().includes('application/json')) {
          this.sendJson(response, 415, { error: 'Content-Type must be application/json' })
          return
        }
        this.removeExpiredImports()
        const pendingCount = [...this.imports.values()].filter(
          (item) => item.status === 'pending'
        ).length
        if (pendingCount >= MAX_PENDING_IMPORTS) {
          this.sendJson(response, 429, { error: 'Too many pending import requests' })
          return
        }
        const payload = await this.readJsonBody(request)
        const item: StoredImport = {
          id: randomUUID(),
          payload,
          createdAt: new Date().toISOString(),
          status: 'pending',
        }
        this.imports.set(item.id, item)
        const publicRequest: AgentImportRequest = {
          id: item.id,
          payload: item.payload,
          createdAt: item.createdAt,
        }
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send(IPC_CHANNELS.AGENT_IMPORT_REQUESTED, publicRequest)
        }
        this.sendJson(response, 202, {
          id: item.id,
          status: item.status,
          statusUrl: `/v1/imports/${item.id}`,
        })
        return
      }

      const match = url.pathname.match(/^\/v1\/imports\/([0-9a-f-]+)$/i)
      if (request.method === 'GET' && match) {
        const item = this.imports.get(match[1])
        if (!item) {
          this.sendJson(response, 404, { error: 'Import request not found' })
          return
        }
        this.sendJson(response, 200, {
          id: item.id,
          status: item.status,
          createdAt: item.createdAt,
          resolvedAt: item.resolvedAt,
          result: item.result,
        })
        return
      }

      this.sendJson(response, 404, { error: 'Not found' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const status = message.includes('512 KB') || message.includes('JSON') ? 400 : 500
      this.sendJson(response, status, { error: message })
    }
  }

  private isAuthorized(request: IncomingMessage): boolean {
    const authorization = request.headers.authorization
    if (!authorization?.startsWith('Bearer ') || !this.token) return false
    const supplied = Buffer.from(authorization.slice(7))
    const expected = Buffer.from(this.token)
    return supplied.length === expected.length && timingSafeEqual(supplied, expected)
  }

  private async readJsonBody(request: IncomingMessage): Promise<unknown> {
    const chunks: Buffer[] = []
    let total = 0
    for await (const chunk of request) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      total += buffer.length
      if (total > MAX_BODY_BYTES) throw new Error('Request body exceeds 512 KB')
      chunks.push(buffer)
    }
    const text = Buffer.concat(chunks).toString('utf-8')
    if (!text.trim()) throw new Error('JSON body is required')
    try {
      return JSON.parse(text)
    } catch {
      throw new Error('Invalid JSON body')
    }
  }

  private sendJson(response: ServerResponse, status: number, value: unknown): void {
    const body = JSON.stringify(value)
    response.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body),
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    })
    response.end(body)
  }

  private removeExpiredImports(): void {
    const cutoff = Date.now() - REQUEST_TTL_MS
    for (const [id, item] of this.imports) {
      if (new Date(item.createdAt).getTime() < cutoff) this.imports.delete(id)
    }
  }

  private getSchemaDocument(): unknown {
    return {
      schemaVersion: 2,
      endpoint: 'POST /v1/imports',
      authentication: 'Authorization: Bearer <token>',
      note: 'The request remains pending until the user confirms it in zzplan.',
      compatibility: 'Legacy schemaVersion 1 single-week payloads remain supported.',
      example: {
        schemaVersion: 2,
        weeks: [
          {
            target: { year: 2026, weekNumber: 38 },
            tasks: [
              { day: 'monday', title: '完成项目方案', priority: 'high', timeOfDay: 'morning' },
            ],
            timeBlocks: [
              { day: 'monday', title: '深度工作', category: 'work', start: '09:00', end: '11:00' },
            ],
            habits: [{ name: '阅读' }],
            deadlines: [],
          },
        ],
      },
    }
  }
}

export const agentApiService = new AgentApiService()
