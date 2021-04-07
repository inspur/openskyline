// 工作流管理
module.exports = function() {
  return {
    flg: Vue.AuthList["m.workflow"],
    key: "workflow",
    path: "/workflow/",
    iconType: "el-icon-fa-tasks",
    name: Vue.t('task.cloudTaskManage'),
    subMenus: [
    {
      flg: Vue.AuthList["m.workflow.task"],
      key: "workflowtriggertaskguide",
      path: "workflowtriggertaskguide",
      iconType: "el-icon-fa-cubes",
      name: Vue.t('task.cloudTask')
    }
    ]
  };
}
