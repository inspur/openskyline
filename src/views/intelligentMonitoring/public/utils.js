import moment from "moment";
class Utils { //潘启宝写于2020年2月10日 9:19:27
  constructor() {
    this.separator = '|';
  }
  isCN = Vue.config.lang === 'zh-cn';

  levelList = {
    'OK': Vue.t('base.normal'),
    'OK_RECOVERY': Vue.t('base.troubleRepair'),
    'WARNING': Vue.t('base.slightAlarm'),
    'CRITICAL': Vue.t('base.critAlarm'),
    'LOST': Vue.t('base.lostAlarm')
  };
  getLevel(v) {
    return this.levelList[v];
  }

  get virtualMachineStatus() {
    return [
      Vue.t('monitor.NONE'),
      Vue.t('monitor.RUNNING'),
      Vue.t('monitor.BLOCK'),
      Vue.t('monitor.PASUED'),
      Vue.t('monitor.SHUT_DOWN'),
      Vue.t('monitor.SHUT_OFF'),
      Vue.t('monitor.CRASHED'),
      Vue.t('monitor.DYING')
    ];
  }
  getVirtualMachineStatusItem(i) {
    return this.virtualMachineStatus[parseInt(i)] || '-';
  }

  formatterDate(v) {
    return moment(v).format("MM-DD");
  }

  formatterHour(v) {
    return moment(v).format("HH:mm");
  }

  xAxisDataFormatter(v) {
    return moment(v).format("YYYY-MM-DD HH:mm:ss");
  }

  pad0(v) {
    return v < 10 ? '0' + v : v;
  }

  getUTCDate(date) {
    let d = date || new Date();
    let t = d.getTime() + d.getTimezoneOffset() * 60 * 1000;
    return new Date(t);
  }

  dark = Vue.cookie.get('theme') === 'dark';
  lineStyleColor = this.dark ? 'rgba(255,255,255,0.25)' : '#aaaaaa';
  textStyleColor = this.dark ? 'rgba(255,255,255,0.65)' : '#666';
  titleTextStyleColor = this.dark ? '#fff' : '#666';
  maskColor = this.dark ? "rgba(0,0,0,0.5)" : 'rgba(255,255,255,0.5)';

  echartsOption = {
    title: {
      text: '',
      textStyle: {
        color: this.titleTextStyleColor,
        fontSize: 13,
        fontWeight: 'normal'
      },
      left: 15
    },
    color: [
      '#42a5f5',
      '#9ccc65',
      '#ffa726',
      '#ef5350',
      '#26a69a',
      '#26c6da',
      '#78909c',
      '#5c75c0',
      '#0070c4',
      '#7e57c2',
      '#8d6e63',
      '#a76711',
      '#ff7043',
      '#ec407a'
    ],
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      axisLine: {
        lineStyle: {
          color: this.lineStyleColor
        }
      },
      axisLabel: {
        color: this.textStyleColor
      },
      splitLine: {
        lineStyle: {
          color: this.lineStyleColor,
          type: 'dashed'
        }
      },
      nameTextStyle: {
        color: this.textStyleColor
      }
    },
    yAxis: [{
      axisLine: {
        lineStyle: {
          color: this.lineStyleColor
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: this.textStyleColor
      },
      splitLine: {
        lineStyle: {
          color: this.lineStyleColor,
          type: 'dashed',
          width: 1
        }
      },
      nameTextStyle: {
        color: this.textStyleColor
      }
    },
    {
      axisLine: {
        lineStyle: {
          color: this.lineStyleColor
        }
      },
      axisTick: {
        show: true
      },
      axisLabel: {
        color: this.textStyleColor
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: this.lineStyleColor,
          type: 'dashed'
        }
      },
      nameTextStyle: {
        color: this.textStyleColor
      }
    }
    ],
    grid: {
      left: 30,
      top: 60,
      bottom: 30,
      right: 30,
      containLabel: true
    },
    legend: {
      type: 'scroll',
      itemWidth: 6,
      itemHeight: 6,
      bottom: 0,
      icon: 'circle',
      textStyle: {
        color: this.textStyleColor
      },
      data: []
    }
  }

  loadingOpts = {
    text: "loading",
    color: this.echartsOption.color[0],
    textColor: this.textStyleColor,
    maskColor: this.maskColor,
    zlevel: 0
  }
  echartsInitOpts = { renderer: 'svg', devicePixelRatio: window.devicePixelRatio, width: 'auto', height: 'auto' }

  getProgressPercentageStatus(v) {
    v = parseFloat(v) || 0;
    v = Math.max(v, 0); //防止小于0的情况出现
    let c = "";
    if (v < 31) {
      c = "is-success";
    } else if (v > 80) {
      c = "is-exception";
    }
    return {
      value: +v.toFixed(2),
      class: c
    };
  };

  deleteResource(v = {}) {
    const vm = v.vm || {};
    let rid = v.resourceID;
    let callback = v.callback;
    vm.$confirm(
      Vue.t("monitor.DELETE_CONFIRM_MESSAGE"),
      Vue.t("base.prompt"),
      {
        confirmButtonText: Vue.t("lang.confirm"),
        cancelButtonText: Vue.t("lang.cancel"),
        type: "warning"
      }
    )
      .then(v_ => {
        let logDesc = `${Vue.t("monitor.REDISCOVER ") + v.logDesc}，resource ID:${rid}`;
        vm.$ajax({
          type: "delete",
          url: `api/pluto/v1/monitor/resource/${rid}`,
          successFun: function () {
            vm.$message({
              type: "success",
              message: Vue.t("monitor.DELETE_SEND_SUCCESS")
            });

            callback && callback({});
          },
          log: {
            description: {
              en: logDesc,
              zh_cn: logDesc
            },
            target: v.logTarget || Vue.logTarget.resourceMonitor
          }
        });
      })
      .catch(v => {
      });
  }
}

let utils = new Utils();
export {
  utils
};
