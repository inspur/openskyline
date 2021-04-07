export default {
  resourceStatusRender(rowData) {
    if (rowData["resourceStatus"] == "0" || rowData["resourceStatus"] == 0) { //正常
      return "<span class='label el-button--success'>" + Vue.t("lang.regular") + "</span>";
    } else if (rowData["resourceStatus"] == "1" || rowData["resourceStatus"] == 1) { //轻微
      return "<span class='label el-button--warning'>" + Vue.t("lang.warn") + "</span>";
    } else if (rowData["resourceStatus"] == "2" || rowData["resourceStatus"] == 2) { //中度
      return "<span class='label el-button--danger'>" + Vue.t("lang.moderateWarning") + "</span>";
    } else if (rowData["resourceStatus"] == "3" || rowData["resourceStatus"] == 3) { //严重
      return "<span class='label el-button--danger' style='background-color:#970202;'>" + Vue.t("lang.serousWarning") + "</span>";
    } else if (rowData["resourceStatus"] == "6" || rowData["resourceStatus"] == 6) { //未监控
      return "<span class='label el-button--danger' style='background-color:#999999;'>" + Vue.t("lang.unsupervised") + "</span>";
    } else {
      return "<font color='red'>" + "-" + "</font>";
    }
  },

  required(val) {
    if (!val) {
      return '---';
    }

    return val;
  }
};
