var operateRows = function(rows, type, callback, centerId, conditions, resourceName) {
    //0：确认告警 1：取消确认告警 2：全部确认告警 3 公认告警 4 取消公认 5 删除 6 清空
    let paramObj = {
        0:{confirm: "1"},
        1:{confirm: "0"},
        2:{confirm: "1"},
        3:{public: "1"},
        4:{public: "0"},
        5:{deleted: "1"},
        6:{deleted: "1"}
    }
    let susMsgObj = {
        0:Vue.t('monitor.confirmAlarmSus'),
        1:Vue.t('monitor.concelConfirmSus'),
        2:Vue.t('monitor.allConfirmSus'),
        3:Vue.t('monitor.publicAlarmSus'),
        4:Vue.t('monitor.cancelPublicSus'),
        5:Vue.t('base.deleteSuccess'),
        6:Vue.t('monitor.clearSus')
    }
    let confirmMsgObj = {
        0:Vue.t('monitor.promp6'),
        1:Vue.t('monitor.promp7'),
        2:Vue.t('monitor.promp8'),
        3:Vue.t('monitor.promp9'),
        4:Vue.t('monitor.promp10'),
        5:Vue.t('monitor.promp11'),
        6:Vue.t('monitor.promp12')
    }
    let deflg = !!resourceName;
    if (!resourceName) {
        let nameArr = [];
        rows.forEach(function(item) {
            let index = nameArr.findIndex((citem) => {
                return citem == item.resource_name
            })
            if (index<0) {
                nameArr.push(item.resource_name);
            }
        })
        resourceName = nameArr.join(';');
    }
    let log = {
        0:{
            zh:"资源("+resourceName+")确认告警",
            en:"resource("+resourceName+")confirm alarm"
        },
        1:{
            zh:"资源("+resourceName+")取消确认告警",
            en:"resource("+resourceName+")cancel confirm alarm"
        },
        2:{
            zh:deflg?("资源("+resourceName+")全部确认告警"):"所有资源全部确认告警",
            en:deflg?("资源("+resourceName+") all confirm alarm"):"all resouces all confirm alarm"
        },
        3:{
            zh:"资源("+resourceName+")公认告警",
            en:"resource("+resourceName+")public alarm"
        },
        4:{
            zh:"资源("+resourceName+")取消公认告警",
            en:"resource("+resourceName+")cancel public alarm"
        },
        5:{
            zh:"资源("+resourceName+")删除告警",
            en:"resource("+resourceName+")delete alarm"
        },
        6:{
            zh:deflg?("资源("+resourceName+")清空告警"):"所有资源清空告警",
            en:deflg?("资源("+resourceName+") clear alarm"):"all resouces clear alarm"
        }
    }
    var params = {
        params:paramObj[type]
    }
    if (conditions) {
        params.conditions = conditions;
    } else {
        let alertIds = [];
        rows.forEach(function(item, index) {
            alertIds.push(item.alert_id);
        })
        params.alert_ids = alertIds;
    }
    this.$ajax({
        type:"patch",
        headers: {
            'FORWARD_UNION': centerId
        },
        confirmMsg:confirmMsgObj[type],
        url: "api/pluto/v1/alert/resources/alerts",
        data:JSON.stringify(params),
        successMsg:susMsgObj[type],
        successFun() {
            callback();
        },
        log: {
            description: {
                en: log[type].en,
                zh_cn: log[type].zh
            },
            target: Vue.logTarget.monitor
        }
    })
}
var alarmLevelList = {
    "OK": Vue.t('base.normal'),
    "OK_RECOVERY":Vue.t('base.troubleRepair'),
    "WARNING": Vue.t('base.slightAlarm'),
    "CRITICAL": Vue.t('base.critAlarm'),
    "LOST":Vue.t('base.lostAlarm')
};
var alarmLevelListButOK = {
    "OK_RECOVERY":Vue.t('base.troubleRepair'),
    "WARNING": Vue.t('base.slightAlarm'),
    "CRITICAL": Vue.t('base.critAlarm'),
    "LOST":Vue.t('base.lostAlarm')
};
var alarmLevel = function (level) {
    return this.alarmLevelList[level] || "-";
}
var alarmLevelTag = function (level) {
    let r = "";
    switch (level) {
        case "OK": case "OK_RECOVERY":
            r = "success";
            break;
        case "LOST":
            r = "danger";
            break;
        case "CRITICAL":
            r = "critical";
            break;
        case "WARNING":
            r = "warning";
            break;
    }
    return r;
}
var formatSecond = function(time) {
    time = parseInt(time);
    let ftime = "";
    if (time>24*3600) {
        let n = parseInt(time/(24*3600));
        ftime += n + Vue.t('monitor.days');
        time = time - n * 24 * 3600;
    }
    if (time>60*60) {
        let m = parseInt(time/(60*60));
        ftime += m + Vue.t('monitor.hours');
        time = time - m * 60 * 60;
    }
    if (time>60) {
        let k = parseInt(time/60);
        ftime += k + Vue.t('monitor.minutes');
        time = time - k * 60;
    }
    ftime += time + Vue.t('monitor.seconds');
    return ftime;
}
/**
 * 自动选择多语言
 * @param cn 中文
 * @param en 英文
 */
var chooseNamebyLan = function (cn, en) {
    return Vue.config.lang == "zh-cn"?cn:en;
}
export {operateRows, alarmLevelList, alarmLevelListButOK, alarmLevelTag, alarmLevel, formatSecond, chooseNamebyLan}
