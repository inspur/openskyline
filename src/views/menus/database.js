//数据库服务菜单
module.exports = function() {
  return {
    flg: Vue.archIs('x86') && Vue.AuthList["m.database"],
    key: "databaseInstance",
    path: "/databaseService",
    iconType: "el-icon-fa-database",
    name: Vue.t('db.databaseService')
  };
}

