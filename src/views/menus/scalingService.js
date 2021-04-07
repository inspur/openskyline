module.exports = function() {
  return {
    // flg: Vue.archIs('x86') && Vue.AuthList["m.senlin"],
    flg: Vue.AuthList["m.senlin"],
    key: "scaling-service-list",
    path: "/scaling-service/scaling-service-list",
    iconType: "el-icon-fa-link",
    name: Vue.t("scalingService.scalingService")
  };
}
