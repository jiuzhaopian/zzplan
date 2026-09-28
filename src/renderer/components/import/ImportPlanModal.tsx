import { useEffect, useMemo, useRef, useState } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useWeekStore } from '../../store/weekStore'
import { createPlanImportExample, validatePlanImport } from '../../services/planImport'
import { showToast } from '../shared/Toast'
import type {
  AgentApiInfo,
  AgentImportRequest,
  PlanImportMode,
} from '../../../shared/planImport'

type ImportTab = 'json' | 'agent'

export default function ImportPlanModal() {
  const importPanelOpen = useUIStore((state) => state.importPanelOpen)
  const setImportPanelOpen = useUIStore((state) => state.setImportPanelOpen)
  const { currentYear, currentWeekNumber } = useUIStore()
  const importPlan = useWeekStore((state) => state.importPlan)
  const [tab, setTab] = useState<ImportTab>('json')
  const [jsonText, setJsonText] = useState('')
  const [mode, setMode] = useState<PlanImportMode>('merge')
  const [errors, setErrors] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [parsedValue, setParsedValue] = useState<unknown>(null)
  const [agentInfo, setAgentInfo] = useState<AgentApiInfo | null>(null)
  const [agentRequests, setAgentRequests] = useState<AgentImportRequest[]>([])
  const [activeAgentRequest, setActiveAgentRequest] = useState<AgentImportRequest | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const addRequest = (request: AgentImportRequest) => {
      setAgentRequests((current) =>
        current.some((item) => item.id === request.id) ? current : [...current, request]
      )
      setImportPanelOpen(true)
    }

    void window.electronAPI.getAgentApiInfo().then(setAgentInfo)
    void window.electronAPI.listPendingAgentImports().then((requests) => {
      requests.forEach(addRequest)
    })
    return window.electronAPI.onAgentImportRequested(addRequest)
  }, [setImportPanelOpen])

  useEffect(() => {
    if (importPanelOpen) void window.electronAPI.getAgentApiInfo().then(setAgentInfo)
  }, [importPanelOpen])

  useEffect(() => {
    if (activeAgentRequest || agentRequests.length === 0) return
    const request = agentRequests[0]
    setActiveAgentRequest(request)
    setParsedValue(request.payload)
    setJsonText(JSON.stringify(request.payload, null, 2))
    setErrors([])
    setTab('json')
  }, [activeAgentRequest, agentRequests])

  const validation = useMemo(
    () =>
      parsedValue === null
        ? null
        : validatePlanImport(parsedValue, currentYear, currentWeekNumber),
    [parsedValue, currentYear, currentWeekNumber]
  )

  if (!importPanelOpen) return null

  const finishAgentRequest = async (
    status: 'accepted' | 'rejected' | 'failed',
    result?: unknown
  ) => {
    if (!activeAgentRequest) return
    await window.electronAPI.resolveAgentImport(activeAgentRequest.id, status, result)
    setAgentRequests((current) => current.filter((item) => item.id !== activeAgentRequest.id))
    setActiveAgentRequest(null)
  }

  const close = () => {
    if (activeAgentRequest) void finishAgentRequest('rejected', { reason: 'User rejected the import' })
    setImportPanelOpen(false)
    setErrors([])
    setParsedValue(null)
  }

  const parseText = (text: string) => {
    try {
      const value = JSON.parse(text)
      setParsedValue(value)
      setErrors([])
    } catch (error) {
      setParsedValue(null)
      setErrors([`JSON 解析失败：${(error as Error).message}`])
    }
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (file.size > 512 * 1024) {
      setErrors(['文件不能超过 512 KB'])
      return
    }
    const text = await file.text()
    setJsonText(text)
    parseText(text)
  }

  const handleImport = async () => {
    if (!validation?.plan) return
    setIsImporting(true)
    try {
      const result = await importPlan(validation.plan, mode)
      const addedTotal = Object.values(result.added).reduce((sum, count) => sum + count, 0)
      const skippedTotal = Object.values(result.skipped).reduce((sum, count) => sum + count, 0)
      showToast(
        'success',
        `已写入 ${result.weeks} 周、导入 ${addedTotal} 项${skippedTotal ? `，跳过 ${skippedTotal} 项重复或超限内容` : ''}`
      )
      if (activeAgentRequest) {
        await finishAgentRequest('accepted', result)
      }
      setJsonText('')
      setParsedValue(null)
      setErrors([])
      setImportPanelOpen(false)
    } catch (error) {
      const message = (error as Error).message || '未知错误'
      setErrors([`导入失败：${message}`])
      showToast('error', `导入失败：${message}`)
      if (activeAgentRequest) {
        await finishAgentRequest('failed', { error: message })
      }
    } finally {
      setIsImporting(false)
    }
  }

  const copyAgentConnection = async () => {
    if (!agentInfo?.enabled) return
    const connection = {
      type: 'zzplan-local-agent-api',
      schema: `${agentInfo.endpoint}/schema`,
      import: `${agentInfo.endpoint}/imports`,
      authorization: `Bearer ${agentInfo.token}`,
      note: 'POST application/json to import; the user must confirm inside zzplan.',
    }
    try {
      await navigator.clipboard.writeText(JSON.stringify(connection, null, 2))
      showToast('success', 'Agent 连接信息已复制')
    } catch {
      showToast('error', '复制失败，请手动选择连接信息')
    }
  }

  const previewCounts = validation?.plan
    ? {
        tasks: validation.plan.weeks.reduce((sum, week) => sum + week.tasks.length, 0),
        timeBlocks: validation.plan.weeks.reduce((sum, week) => sum + week.timeBlocks.length, 0),
        habits: validation.plan.weeks.reduce((sum, week) => sum + week.habits.length, 0),
        deadlines: validation.plan.weeks.reduce((sum, week) => sum + week.deadlines.length, 0),
      }
    : null

  const previewRange = validation?.plan
    ? {
        first: validation.plan.weeks[0]?.target,
        last: validation.plan.weeks[validation.plan.weeks.length - 1]?.target,
      }
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
      <div className="w-full max-w-3xl max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-[#dde3ee] flex flex-col overflow-hidden">
        <div className="h-14 px-5 border-b border-[#dde3ee] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-[17px] font-[600] text-[#1e293b]">导入计划</h2>
            <p className="text-[12px] text-[#64748b]">
              当前视图：{currentYear} 年第 {currentWeekNumber} 周；导入文件可包含多周
            </p>
          </div>
          <button onClick={close} className="p-2 rounded-lg text-[#64748b] hover:bg-gray-100" aria-label="关闭导入面板">✕</button>
        </div>

        <div className="flex border-b border-[#dde3ee] px-5 shrink-0">
          {([
            ['json', 'JSON 导入'],
            ['agent', 'Agent 接入'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-[14px] font-[500] border-b-2 ${
                tab === key ? 'border-primary-500 text-primary-600' : 'border-transparent text-[#64748b]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'json' ? (
          <div className="flex-1 overflow-auto p-5 space-y-4">
            {activeAgentRequest && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-[13px] text-amber-800">
                本地 Agent 请求导入此计划。请求编号：{activeAgentRequest.id}
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-lg bg-primary-500 text-white text-[14px] font-[500] hover:bg-primary-600"
              >
                选择 JSON 文件
              </button>
              <button
                onClick={() => {
                  const example = createPlanImportExample(currentYear, currentWeekNumber)
                  setJsonText(example)
                  parseText(example)
                }}
                className="px-3 py-2 rounded-lg border border-[#dde3ee] text-[14px] text-[#64748b] hover:bg-gray-50"
              >
                填入示例
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => void handleFile(event.target.files?.[0])}
              />
            </div>

            <textarea
              value={jsonText}
              onChange={(event) => {
                setJsonText(event.target.value)
                setParsedValue(null)
                setErrors([])
              }}
              readOnly={Boolean(activeAgentRequest)}
              placeholder="在此粘贴 JSON 计划；schemaVersion 2 支持 weeks 多周数组……"
              className="w-full h-60 resize-y rounded-xl border border-[#dde3ee] bg-[#f8fafc] p-3 font-mono text-[13px] leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary-400"
            />

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => parseText(jsonText)}
                disabled={!jsonText.trim()}
                className="px-4 py-2 rounded-lg border border-primary-300 text-primary-600 text-[14px] font-[500] hover:bg-primary-50 disabled:opacity-40"
              >
                校验并预览
              </button>
              <div className="flex items-center gap-3 text-[14px]">
                <label className="flex items-center gap-1.5">
                  <input type="radio" checked={mode === 'merge'} onChange={() => setMode('merge')} />
                  合并并去重
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="radio" checked={mode === 'replace'} onChange={() => setMode('replace')} />
                  替换涉及周
                </label>
              </div>
            </div>

            {(errors.length > 0 || validation?.errors.length) && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-[13px] text-red-700 space-y-1">
                {[...errors, ...(validation?.errors ?? [])].map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}

            {previewCounts && validation?.plan && (
              <div className="rounded-xl bg-primary-50 border border-primary-200 p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="text-[14px] font-[600] text-[#1e293b]">导入预览</div>
                  <div className="text-[12px] text-[#64748b]">
                    {validation.plan.weeks.length} 周
                    {previewRange?.first && previewRange.last
                      ? ` · ${previewRange.first.year}年第${previewRange.first.weekNumber}周—${previewRange.last.year}年第${previewRange.last.weekNumber}周`
                      : ''}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    ['任务', previewCounts.tasks],
                    ['时间块', previewCounts.timeBlocks],
                    ['习惯', previewCounts.habits],
                    ['DDL', previewCounts.deadlines],
                  ].map(([label, count]) => (
                    <div key={label} className="bg-white rounded-lg border border-primary-100 px-2 py-3">
                      <div className="text-xl font-[600] text-primary-600">{count}</div>
                      <div className="text-[12px] text-[#64748b]">{label}</div>
                    </div>
                  ))}
                </div>
                {mode === 'replace' && (
                  <p className="mt-3 text-[12px] text-amber-700">
                    替换会清空导入文件涉及的 {validation.plan.weeks.length} 周的任务、时间块和习惯，
                    并替换这些周日期范围内的 DDL；其他周、日记和复盘会保留。
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-6">
            <div className="rounded-xl bg-[#f8fafc] border border-[#dde3ee] p-5 space-y-4">
              <h3 className="text-[15px] font-[600] text-[#1e293b]">本地 Agent 接口</h3>
              <div className="flex items-center gap-2 text-[14px]">
                <span className={`w-2 h-2 rounded-full ${agentInfo?.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{agentInfo?.enabled ? '接口已启动' : '接口不可用'}</span>
                {agentRequests.length > 0 && (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {agentRequests.length} 个待确认请求
                  </span>
                )}
              </div>
              {agentInfo?.error && <div className="text-[13px] text-red-600">{agentInfo.error}</div>}
              <div>
                <div className="text-[12px] text-[#64748b] mb-1">导入地址</div>
                <code className="block rounded-lg bg-white border border-[#dde3ee] px-3 py-2 text-[13px] break-all">
                  {agentInfo ? `${agentInfo.endpoint}/imports` : '正在读取……'}
                </code>
              </div>
              <div>
                <div className="text-[12px] text-[#64748b] mb-1">Bearer Token（仅提供给可信本地 Agent）</div>
                <code className="block rounded-lg bg-white border border-[#dde3ee] px-3 py-2 text-[12px] break-all select-all">
                  {agentInfo?.token || '正在读取……'}
                </code>
              </div>
              <div className="text-[13px] leading-relaxed text-[#64748b]">
                Agent 先访问 <code>{agentInfo?.endpoint}/schema</code> 获取格式，然后向导入地址 POST JSON，并携带
                <code> Authorization: Bearer &lt;token&gt;</code>。请求不会自动写入，必须回到 zzplan 确认。
              </div>
              <button
                onClick={() => void copyAgentConnection()}
                disabled={!agentInfo?.enabled}
                className="w-fit px-3 py-2 rounded-lg bg-primary-500 text-white text-[14px] font-[500] hover:bg-primary-600 disabled:bg-gray-300"
              >
                复制 Agent 连接信息
              </button>
            </div>
          </div>
        )}

        <div className="px-5 py-3 border-t border-[#dde3ee] flex items-center justify-end gap-2 shrink-0">
          <button onClick={close} className="px-4 py-2 text-[14px] text-[#64748b] hover:bg-gray-100 rounded-lg">取消</button>
          {tab === 'json' && (
            <button
              onClick={() => void handleImport()}
              disabled={!validation?.plan || isImporting}
              className="px-4 py-2 text-[14px] font-[500] text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 rounded-lg"
            >
              {isImporting ? '正在导入…' : '确认导入'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
