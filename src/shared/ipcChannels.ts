export const IPC_CHANNELS = {
  // 文件读写
  FILE_LOAD_WEEK: 'file:loadWeek',
  FILE_SAVE_WEEK: 'file:saveWeek',
  FILE_SAVE_PLAN_BATCH: 'file:savePlanBatch',
  FILE_LIST_WEEKS: 'file:listWeeks',

  // 对话框
  DIALOG_CONFIRM: 'dialog:confirm',

  // 应用
  APP_VERSION: 'app:version',
  APP_USERDATA_PATH: 'app:userDataPath',

  // 窗口关闭
  APP_SAVE_REQUESTED: 'app:saveRequested',
  APP_BEFORE_CLOSE: 'app:beforeClose',
  APP_CLOSE_GUARD_READY: 'app:closeGuardReady',
  APP_READY_TO_CLOSE: 'app:readyToClose',

  // 全局 DDL
  DEADLINES_LOAD: 'deadlines:load',
  DEADLINES_SAVE: 'deadlines:save',

  // 本地 Agent 导入
  AGENT_API_INFO: 'agent:apiInfo',
  AGENT_IMPORT_PENDING: 'agent:importPending',
  AGENT_IMPORT_REQUESTED: 'agent:importRequested',
  AGENT_IMPORT_RESOLVE: 'agent:importResolve',
} as const
