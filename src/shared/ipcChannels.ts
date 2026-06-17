export const IPC_CHANNELS = {
  // 文件读写
  FILE_LOAD_WEEK: 'file:loadWeek',
  FILE_SAVE_WEEK: 'file:saveWeek',
  FILE_LIST_WEEKS: 'file:listWeeks',

  // 对话框
  DIALOG_CONFIRM: 'dialog:confirm',

  // 应用
  APP_VERSION: 'app:version',
  APP_USERDATA_PATH: 'app:userDataPath',

  // 窗口关闭
  APP_BEFORE_CLOSE: 'app:beforeClose',
  APP_READY_TO_CLOSE: 'app:readyToClose',

  // 全局 DDL
  DEADLINES_LOAD: 'deadlines:load',
  DEADLINES_SAVE: 'deadlines:save',
} as const
