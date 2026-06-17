import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

export interface WeekSummary {
  year: number
  weekNumber: number
}

export class FileService {
  private get userDataPath(): string {
    return app.getPath('userData')
  }

  private get weeksDir(): string {
    return path.join(this.userDataPath, 'weeks')
  }

  /** 获取某周的文件路径 */
  getWeekFilePath(year: number, weekNumber: number): string {
    const paddedWeek = weekNumber.toString().padStart(2, '0')
    const filename = `week-${year}-W${paddedWeek}.json`
    return path.join(this.weeksDir, filename)
  }

  /** 确保周数据目录存在 */
  private ensureWeeksDir(): void {
    if (!fs.existsSync(this.weeksDir)) {
      fs.mkdirSync(this.weeksDir, { recursive: true })
    }
  }

  /** 读取周数据 */
  async loadWeek(year: number, weekNumber: number): Promise<unknown | null> {
    try {
      const filePath = this.getWeekFilePath(year, weekNumber)
      if (!fs.existsSync(filePath)) {
        return null
      }
      const content = fs.readFileSync(filePath, 'utf-8')

      // 空文件处理
      if (!content.trim()) {
        return null
      }

      try {
        return JSON.parse(content)
      } catch (parseError) {
        // JSON 损坏：备份原文件并返回 null
        console.error(
          `[FileService] 周数据文件损坏: ${filePath}`,
          parseError
        )
        const backupPath = filePath + '.corrupted-' + Date.now()
        fs.copyFileSync(filePath, backupPath)
        console.warn(`[FileService] 已备份损坏文件到: ${backupPath}`)
        return null
      }
    } catch (error) {
      console.error(`[FileService] 读取周数据失败:`, error)
      return null
    }
  }

  /** 保存周数据（原子写入：先写 .tmp 再 rename） */
  async saveWeek(
    year: number,
    weekNumber: number,
    data: unknown
  ): Promise<void> {
    this.ensureWeeksDir()
    const filePath = this.getWeekFilePath(year, weekNumber)
    const tmpPath = filePath + '.tmp'

    // 原子写入：先写临时文件，再重命名
    const json = JSON.stringify(data, null, 2)
    fs.writeFileSync(tmpPath, json, 'utf-8')
    fs.renameSync(tmpPath, filePath)
  }

  /** 获取所有已存在的周文件列表 */
  async listWeeks(): Promise<WeekSummary[]> {
    try {
      this.ensureWeeksDir()
      const files = fs.readdirSync(this.weeksDir)
      const weeks: WeekSummary[] = []

      const regex = /^week-(\d{4})-W(\d{2})\.json$/
      for (const file of files) {
        const match = file.match(regex)
        if (match) {
          weeks.push({
            year: parseInt(match[1], 10),
            weekNumber: parseInt(match[2], 10),
          })
        }
      }

      return weeks.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.weekNumber - a.weekNumber
      })
    } catch (error) {
      console.error(`[FileService] 列出周文件失败:`, error)
      return []
    }
  }

  /** 获取 userData 路径（供渲染进程查询） */
  getUserDataPath(): string {
    return this.userDataPath
  }

  // ==================== 全局 DDL ====================

  /** 获取全局 DDL 文件路径 */
  private getDeadlinesFilePath(): string {
    return path.join(this.userDataPath, 'deadlines.json')
  }

  /** 读取全局 DDL 数据 */
  async loadDeadlines(): Promise<unknown[]> {
    try {
      const filePath = this.getDeadlinesFilePath()
      if (!fs.existsSync(filePath)) {
        return []
      }
      const content = fs.readFileSync(filePath, 'utf-8')
      if (!content.trim()) return []
      return JSON.parse(content)
    } catch (error) {
      console.error('[FileService] 读取 DDL 数据失败:', error)
      return []
    }
  }

  /** 保存全局 DDL 数据（原子写入） */
  async saveDeadlines(data: unknown): Promise<void> {
    const filePath = this.getDeadlinesFilePath()
    const tmpPath = filePath + '.tmp'
    const json = JSON.stringify(data, null, 2)
    fs.writeFileSync(tmpPath, json, 'utf-8')
    fs.renameSync(tmpPath, filePath)
  }
}

export const fileService = new FileService()
