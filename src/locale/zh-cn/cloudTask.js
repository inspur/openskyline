export default {
  task: {
    cloudTaskManage: "云计划任务管理",
    cloudTask: "云计划任务",
    cloudTaskDesc: "云计划任务是指执行某种操作的任务，例：云主机开机或关机。" +
      "项目管理员可维护所属项目的云计划任务，超级管理员需要切入到具体项目并拥有该项目的项目管理员权限才能维护。",
    task: "任务",
    taskLog: "任务日志",
    taskLogDesc: "任务日志是指云计划任务执行过程和结果。项目管理员可维护所属项目的任务日志，超级管理员需要切入到具体项目并拥有该项目的项目管理员权限才能维护。",
    logDetail: "日志详情",
    detail: "详情",
    subtaskLog: "子任务日志信息",
    cycle: "周期",
    exeTime: "设定时间",
    repeatExecution: "重复执行",
    performOnce: "执行一次",
    create: "创建",
    deleteSuccessMsg: "删除成功",
    everyDay: "每天",
    everyNDay: "每N天",
    everyNHour: "每N小时",
    everyWeek: "每周",
    everyMonth: "每月",
    sunday: "周日",
    saturday: "周六",
    friday: "周五",
    thursday: "周四",
    wednesday: "周三",
    tuesday: "周二",
    monday: "周一",
    every: "每",
    day: "天",
    hour: "小时",
    hao: "号",
    createCloudTask: "创建云计划任务",
    date: "日期",
    dayNumber: "天数",
    dayNumberDesc: "每N天执行一次，其中N的取值范围1-100",
    hourNumber: "小时",
    hourNumberDesc: "每N小时执行一次，其中N的取值范围1-24",
    time: "时间",
    earlyThanCurrentTimeErrorMsg: "时间不能早于当前时间",
    createSuccessMsg: "创建成功",
    createTask: "创建任务",
    cloudHost: "云主机",
    selectCloudHost: "选择云主机",
    snapshotSaveCount: "自动快照保留个数",
    snapshotSaveCountDesc: "当同一云主机有多个自动快照任务存在时，快照保留数目不定，以最近一次执行任务时传入的值为准。",
    snapshotTaskTip: "(备注：建议同一云主机只配置一个自动快照任务！)",
    cloudDisk: "云硬盘",
    selectCloudDisk: "选择云硬盘",
    resource: "资源",
    view: "查看",
    nextExeTime: "下次执行时间",
    firstExeTime: "首次执行时间",
    taskName: "任务名称",
    taskType: "任务类型",
    startExeTime: "开始执行时间",
    endTime: "结束时间",
    inputData: "输入",
    outputData: "输出",
    success: "成功",
    error: "失败",
    running: "执行中",
    startVm: "开启云主机",
    stopVm: "关闭云主机",
    startTime: "开始时间",
    errorReason: "失败原因",
    findVm: "查找云主机",
    findVolume: "查找云硬盘",
    createDiskSnapshot: "创建云硬盘快照",
    resourceType: "资源类型",
    resourceName: "资源名称",
    taskDetail: "云计划任务详情",
    operate: "操作",
    add: "添加",
    onlyCreateCloudTaskConfirmMsg: "确认只创建云计划任务，该操作不会创建任务。",
    prompt: "当周期选择每N小时时，小时固定为08点",
    prompt1: "云主机快照大小为0kb，不能执行自动快照",
    periodreport: "周期报表",
    excuteFrequency: "执行次数",
    createcloudiskbackup: "创建云硬盘备份",
    everyGe: "每隔",
    snapshotDiskDesc: "如果已有的云硬盘快照个数大于设置的保留个数时，任务执行时会删除掉多余的云硬盘快照",
    errorTaskNote1: "任务名称重复或执行内容重复",
    errorTaskNote2: "云计划名称重复",
    errorTaskNote22: "与云计划名称重复",
    errorTaskNote3: "已经对该资源创建了一条相同类型的任务",
    errorTaskNote4: "已有相同名称的云计划任务",
    clouddiskError: "注：同一块云硬盘快照任务跟备份任务执行时间相同或者相近时，前一个任务未执行完后一个任务会执行失败。",
    clouddiskWarn:"同一块云硬盘只能有一个云硬盘备份任务(增量备份或全量备份只能选一个)。<br>全量备份：每次备份时将整个云硬盘进行备份。<br>增量备份：只将新增的容量进行备份",
    backupmax: "最多备份数"
  }
};
