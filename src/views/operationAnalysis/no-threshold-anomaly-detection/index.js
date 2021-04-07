// 潘启宝 2020年07月29日 16:45:05 中国济南

import { mapGetters, mapMutations } from 'vuex';
import moment from 'moment';
import { utils } from 'views/intelligentMonitoring/public/utils';
import { exportJsonToExcel } from 'utils/Export2Excel';
// import detect from 'assets/img/no-threshold-anomaly-detection/detect.jpg';
// import train from 'assets/img/no-threshold-anomaly-detection/train.jpg';

export default {
  name: 'noThresholdAnomalyDetection',
  components: {},
  data() {
    return {
      // detectIMG: detect,
      // trainIMG: train,
      loading: false,
      chartLoading: false,
      chart2Loading: false,
      loadingOpts: JSON.parse(JSON.stringify(utils.loadingOpts)),
      roleType: Vue.roleType + '',
      isCN: String(Vue.config.lang) === 'zh-cn',
      form: {
        loading: false,
        queryButtonDisabled: false,
        resourceType: '',
        resourceTypes: [],
        hostID: '',
        hosts: [],
        instanceID: '',
        instances: [],
        metricID: '',
        metrics: [],
        time: new Date(),
        pickerOptions: {
          // shortcuts: {},
          // disabledDate: (v) => {
          //   let ft = new Date(v).getTime();
          //   let r = 3 * 24 * 60 * 60 * 1000;
          //   let t = new Date().getTime();
          //   if (ft + r < t) {
          //     return true;
          //   }
          //   return false;
          // }
          // selectableRange: `00:00:00 - ${new Date().toTimeString()}`
        },
        metricUnit: '',
        metricName: ''
      },
      isTrainView: false,
      detectionsDisabled: false,
      detected: false,
      trainloading: false,
      detectionsScore: 0,
      trainScore: 0,
      fileExist: 0,
      detections: [],
      abnomalDots: [],
      rules: {
        resourceType: [
          {
            required: true,
            message: Vue.t(
              'monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_RESOURCE_TYPE'
            )
          }
        ],
        hostID: [
          {
            required: true,
            message: Vue.t('monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_HOST')
          }
        ],
        instanceID: [
          {
            required: true,
            message: Vue.t('monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_INSTANCE')
          }
        ],
        metricID: [
          {
            required: true,
            message: Vue.t('monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_METRICS')
          }
        ],
        time: [
          {
            required: true,
            message: Vue.t('monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_TIME')
          },
          {
            validator: (rule, value, callback) => {
              const now = moment()
                .utc()
                .unix();
              if (this.startTime > now || this.endTime > now) {
                callback(
                  new Error(
                    Vue.t(
                      'monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_NO_TIME_FUTURE'
                    )
                  )
                );
              } else {
                callback();
              }
            }
          },
          {
            validator: (rule, value, callback) => {
              if (value[0] === null || value[1] === null) {
                callback(
                  new Error(Vue.t('monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_TIME'))
                );
              } else {
                callback();
              }
            }
          }
        ]
      },
      option: {
        title: {
          text: '',
          left: 15,
          top: 10
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        // legend: {
        //   data: [
        //     {
        //       name: '',
        //       icon: utils.echartsOption.legend.icon
        //     },
        //     {
        //       name: '',
        //       icon: utils.echartsOption.legend.icon
        //     }
        //   ]
        // },
        xAxis: {
          type: 'time',
          boundaryGap: false,
          data: [],
          axisLabel: {
            rotate: 30,
            formatter: function (val) {
              return moment
                .utc(val)
                .local()
                .format('MM-DD HH:mm');
            }.bind(this)
          },
          axisPointer: {
            label: {
              formatter(params) {
                return `${moment(params.value).format('YYYY-MM-DD HH:mm')}`;
              }
            }
          },
          splitLine: {
            show: false,
            lineStyle: {
              type: 'dashed'
            }
          },
          splitNumber: 30,
          minInterval: 60 * 1000,
          maxInterval: 3600 * 24 * 1000
        },
        yAxis: [
          {
            type: 'value',
            name: ''
          }
        ],
        dataset: {
          source: []
        },
        grid: {
          bottom: 50,
          left: 70,
          containLabel: true
        },
        series: [
          {
            name: '',
            data: [],
            smooth: false,
            type: 'line',
            connectNulls: false,
            showSymbol: false,
            areaStyle: {
              normal: {
                color: '#ddeffe'
              }
            },
            animation: true
          },
          {
            name: Vue.t('operationAnalysis.ERROR_POINT'),
            data: [],
            smooth: false,
            type: 'line',
            lineStyle: { normal: { width: 0, opacity: 0 } },
            itemStyle: { normal: { color: '#ff0000' } },
            symbol: 'circle',
            symbolSize: 7,
            showSymbol: true,
            showAllSymbol: true,
            tooltip: {
              show: false
            },
            animation: true,
            connectNulls: false
          }
        ],
        dataZoom: [
          {
            type: 'slider',
            show: false,
            start: 0,
            end: 100,
            handleSize: 8,
            xAxisIndex: [0],
            height: '20px',
            filterMode: 'filter',
            maxSpan: 100,
            minSpan: 20,
            bottom: '0%'
          },
          {
            type: 'slider',
            show: false,
            filterMode: 'empty',
            width: 12,
            height: '70%',
            start: 0,
            end: 100,
            showDataShadow: false,
            left: '93%',
            handleSize: 8,
            yAxisIndex: 0
          },
          {
            type: 'inside',
            start: 0,
            end: 100
          }
        ]
      },
      option2: {
        series: [
          {
            animation: true
          },
          {
            itemStyle: { normal: { color: '#9c27b0' } },
            symbolSize: 11,
            animation: false
          }
        ]
      }
    };
  },
  watch: {
    $route(to, from) { }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => { });
  },
  beforeRouteUpdate(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  created() {
    this.option = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.option
    );
    this.option2 = $.extend(
      true,
      JSON.parse(JSON.stringify(this.option)),
      this.option2
    );
  },
  beforeMount() { },
  beforeUpdate() { },
  updated() { },
  activated() { },
  beforeDestroy() {
    // this.$refs.detect.removeEventListener('transitionend', this.transitionend);
    // this.$refs.train.removeEventListener('transitionend', this.transitionend);
  },
  mounted() {
    // this.$refs.detect.addEventListener('transitionend', this.transitionend);
    // this.$refs.train.addEventListener('transitionend', this.transitionend);
    this.loadResourceTypes();
  },
  computed: {
    ...mapGetters({}),
    startTime() {
      return moment(new Date(this.form.time.getTime() - 1000 * 60 * 60 * 3))
        .utc()
        .unix();
    },
    endTime() {
      return moment(this.form.time)
        .utc()
        .unix();
    }
  },
  methods: {
    transitionend(v) {
      // if (v.propertyName === 'left' && v.target === this.$refs.detect) {
      //   if (!this.isTrainView) {
      //   }
      // }
    },
    changeView(v) {
      this.isTrainView = v.direction === 'left';
      if (this.isTrainView) {
        this.initTrainData();
        this.calibration();
        this.$refs.carousel.next();
      } else {
        this.$refs.carousel.prev();
      }
    },
    init(v) {
      this.form.time = new Date();
      this.isTrainView = this.detectionsDisabled = this.detected = this.chartLoading = this.chart2Loading = false;
      this.detectionsScore = this.trainScore = 0;
    },
    initDetectData() {
      this.detectionsScore = 0;
      this.isTrainView = this.detected = this.chartLoading = false;
    },
    initTrainData() {
      this.trainScore = 0;
      this.trainloading = this.chart2Loading = false;
    },
    dateChange(v) {
      // if (!this.isTrainView) {
      //   return;
      // }
      // this.$refs.form.validate(async valid => {
      //   if (!valid) {
      //     return;
      //   }
      //   this.calibration({ from: 'manual' });
      // });
    },
    query(v) {
      if (this.isTrainView) {
        this.calibration();
      } else {
        this.loadData();
      }
    },
    async resourceTypeChange(v) {
      if (!v) {
        return;
      }
      this.loadHosts();
    },
    async hostChange(v) {
      if (!v) {
        return;
      }
      this.loadInstances();
    },
    async instanceChange(v) {
      if (!v) {
        return;
      }
      this.loadMetrics();
    },
    async metricChange(v) {
      if (!v) {
        return;
      }
      let r =
        this.form.metrics.find(v_ => {
          return v_.id === v;
        }) || {};

      this.metricUnit = r['unit'] || '';
      this.metricName = r['name'] || '';
    },
    async loadResourceTypes() {
      this.form.queryButtonDisabled = true;
      let url = 'api/earth/ntd/metrics/class';
      const r = await this.$ajax({
        type: 'get',
        url: `${url}`
      });
      // let r = {
      //   classes: [
      //     { id: 'host', name_cn: '主机', name_en: 'host' },
      //     { id: 'docker', name_cn: '容器', name_en: 'docker' }
      //   ]
      // };
      let data = r['data'] || {};
      this.form.resourceTypes = (data.classes || []).map(item => {
        item.name = Vue.config.lang === 'zh-cn' ? item.name_cn : item.name_en;
        return item;
      });
      this.form.queryButtonDisabled = false;
    },
    async loadHosts() {
      this.form.queryButtonDisabled = true;
      let url = 'api/earth/ntd/metrics/host';
      const r = await this.$ajax({
        type: 'get',
        url: `${url}`,
        data: { class_id: this.form.resourceType }
      });
      let data = r['data'] || {};
      // let r = {
      //   hosts: [
      //     'inspurcloudos-node201',
      //     'inspurcloudos-node202',
      //     'inspurcloudos-node203',
      //     'inspurcloudos-node204'
      //   ]
      // };
      this.form.instances = this.form.metrics = [];
      this.form.hostID = this.form.instanceID = this.form.metricID = '';

      this.form.hosts = data.hosts || [];
      this.form.queryButtonDisabled = false;
    },
    async loadInstances() {
      this.form.queryButtonDisabled = true;
      let url = 'api/earth/ntd/metrics/instance';
      const r = await this.$ajax({
        type: 'get',
        url: `${url}`,
        data: { class_id: this.form.resourceType, host_id: this.form.hostID }
      });
      let data = r['data'] || {};
      // let r = {
      //   instances: [
      //     { name: 'inspurcloudos-node201', value: 'inspurcloudos-node201' }
      //   ]
      // };

      this.form.metrics = [];
      this.form.instanceID = this.form.metricID = '';

      this.form.instances = data.instances || [];
      this.form.queryButtonDisabled = false;
    },
    async loadMetrics() {
      this.form.queryButtonDisabled = true;
      let url = 'api/earth/ntd/metrics/metrics_sub';
      const r = await this.$ajax({
        type: 'get',
        url: `${url}`,
        data: {
          class_id: this.form.resourceType,
          host_id: this.form.hostID,
          instance_id: this.form.instanceID
        }
      });
      // let r = {
      //   metrics: [
      //     {
      //       has_sub: '77',
      //       id: 'host_cpu_guest_usage',
      //       name_cn: 'cpu guest时间占比',
      //       name_en: 'cpu guest time usage',
      //       unit: '%'
      //     },
      //     {
      //       has_sub: '27',
      //       id: 'host_cpu_utilization',
      //       name_cn: 'cpu使用率',
      //       name_en: 'cpu utilization',
      //       unit: '%'
      //     }
      //   ]
      // };
      let data = r['data'] || {};

      this.form.metricID = '';

      this.form.metrics = (data.metrics || []).map(item => {
        item.name = Vue.config.lang === 'zh-cn' ? item.name_cn : item.name_en;
        return item;
      });
      this.form.queryButtonDisabled = false;
    },
    async loadData() { // 开始加载数据
      this.$refs.form.validate(async valid => {
        if (!valid) {
          return;
        }
        this.initDetectData();
        this.chartLoading = true;
        let url = 'api/earth/ntd/metrics/data';
        // url = './static/json/detection.json'; // TODO 用于开发测试阶段

        let r = await this.$ajax({
          type: 'post',
          url: `${url}`,
          data: JSON.stringify({
            class_id: this.form.resourceType,
            host_id: this.form.hostID,
            instance_id: this.form.instanceID,
            metrics_id: this.form.metricID,
            start_time: this.startTime,
            end_time: this.endTime
          })
        }).catch(v => { });

        let data = r['data'] || {};

        this.detectionsScore = data.score || 0;
        this.detections = data['data'] || [];

        this.detectionsDisabled = this.detections.length > 0;
        this.chartLoading = false;

        this.setSeries({ option: this.option, data: JSON.parse(JSON.stringify(this.detections)) });
      });
    },
    async detect(v) { // 检测
      let url = 'api/earth/ntd/detect';
      // url = './static/json/detect.json'; // TODO 用于开发测试阶段

      let r = await this.$ajax({
        type: 'post',
        url: `${url}`,
        data: JSON.stringify({
          class_id: this.form.resourceType,
          host_id: this.form.hostID,
          instance_id: this.form.instanceID,
          metrics_id: this.form.metricID,
          start_time: this.startTime,
          end_time: this.endTime
        })
      }).catch(v => { });

      this.abnomalDots = r['data'] || [];

      this.detected = true;
      if (this.isTrainView) { // 防止点击请求后，网络慢返回结果迟，当切换到别的视图上时，破坏新视图数据
        return;
      }
      this.setSeries({ option: this.option, abnomalDot: JSON.parse(JSON.stringify(this.abnomalDots)) });
    },
    _export(v) { // 导出
      let keys = [this.isCN ? '指标时间' : 'time', this.isCN ? '指标值' : 'value', this.isCN ? '是否异常' : 'Is it abnormal'];
      let ad = Array.from(this.abnomalDots);
      let d = Array.from(this.detections).map(v => {
        let a = [String(v.time), String(v.value), '0'];
        if (ad.find(v_ => { return v.time === v_.time; })) {
          a[2] = '1';
        }
        return a;
      });

      exportJsonToExcel({
        header: keys,
        data: d,
        filename: `${this.form.instanceID} ${this.form.metricID}`
      });
    },
    async calibration(v) { // 跳到训练视图
      this.chart2Loading = true;
      let url = 'api/earth/ntd/calibration';
      // url = './static/json/calibration.json'; // TODO 用于开发测试阶段

      let r = await this.$ajax({
        type: 'post',
        url: `${url}`,
        data: JSON.stringify({
          class_id: this.form.resourceType,
          host_id: this.form.hostID,
          instance_id: this.form.instanceID,
          metrics_id: this.form.metricID,
          start_time: this.startTime,
          end_time: this.endTime
        })
      }).catch(v => { });

      let data = r['data'] || {};

      this.trainScore = data.score || 0;
      this.fileExist = data.file_exist || 0;
      this.chart2Loading = false;
      this.setSeries({ option: this.option2, data: data['data'] || [], abnomalDot: data['abnomal_dot'] || [] });
    },
    async trainStart(v = {}) { // 开始训练
      let url = 'api/earth/ntd/train';

      let ads = Array.from(
        (this.option2.series[1] && this.option2.series[1]['data']) || []
      ).map(v => {
        let t = new Date(v[0]).toISOString();// 将时间格式整体转换成后端需要的iso时间格式
        return { time: t, value: v[1] };
      });
      this.trainloading = true;
      this.trainStartType = v.type;
      let r = await this.$ajax({
        type: 'post',
        url: `${url}`,
        data: JSON.stringify({
          class_id: this.form.resourceType,
          host_id: this.form.hostID,
          instance_id: this.form.instanceID,
          metrics_id: this.form.metricID,
          start_time: this.startTime,
          end_time: this.endTime,
          abnomal_dot: ads,
          flag: this.trainStartType === 'restart' ? 1 : 0
        })
      }).catch(v => { });

      if (!this.isTrainView) { // 如果已经切换为检测视图，测不继续执行如下代码
        return;
      }

      let data = r['data'] || {};
      this.trainScore = data.score || 0;
      if ((data && data['result'] && String(data['result']).toLowerCase() === 'ok')) {
        this.trainloading = false;
        this.$confirm(Vue.t('operationAnalysis.TRAINING_COMPLETED_CONTINUE'), Vue.t('base.prompt'), {
          confirmButtonText: Vue.t('base.yes'),
          cancelButtonText: Vue.t('base.no'),
          type: 'success'
        })
          .then(async () => {
            // 训练完成，点击确认按钮后，继续训练，时间往前平移3个小时。
            this.form.time = new Date(
              this.form.time.getTime() - 1000 * 60 * 60 * 3
            );
            this.calibration({ from: '', type: v.type });
          })
          .catch(v => { });
      } else {
        this.trainloading = false;
        this.$alert(Vue.t('operationAnalysis.TRAINING_FAILURE'), Vue.t('base.prompt'), {
          confirmButtonText: Vue.t('base.confirm'),
          callback(v) { }
        });
      }
    },
    async trainReStart(v) { // 重复训练
      this.$confirm(
        Vue.t('operationAnalysis.RETRAINING_TIP'),
        Vue.t('base.prompt'),
        {
          confirmButtonText: Vue.t('base.confirm'),
          cancelButtonText: Vue.t('base.cancel'),
          type: 'warning'
        }
      )
        .then(async () => {
          this.trainStart({ type: 'restart' });
        })
        .catch(v => { });
    },
    async trainKill(v) { // 结束训练
      this.loadData();
    },
    _delete(v) { // 删除
      this.$confirm(this.isCN ? '删除历史会删除历史模型和历史标注数据，确定删除？' : 'deleting history will delete the historical model and historical annotation data. are you sure to delete?', Vue.t('base.prompt'), {
        confirmButtonText: Vue.t('base.confirm'),
        cancelButtonText: Vue.t('base.cancel'),
        type: 'warning'
      })
        .then(async () => {
          this.fileExist = 0;
          this.trainScore = 0;
          let url = 'api/earth/ntd/delete/all';
          let r = await this.$ajax({
            type: 'post',
            url: `${url}`,
            data: JSON.stringify({
              class_id: this.form.resourceType,
              metrics_id: this.form.metricID
            })
          }).catch(v => { });
        })
        .catch(v => { });
    },
    echart(v) {
      if (!this.isTrainView) {
        return;
      }
      switch (v.type) {
        case 'click': {
          let a = v['data'] || [0, 0];
          let i = this.option2.series[1]['data'].findIndex(v => {
            return String(v[0]) === String(a[0]) && String(v[1]) === String(a[1]);
          });
          if (i !== -1) {
            this.option2.series[1]['data'].splice(i, 1);
          } else {
            this.option2.series[1]['data'].push(a);
          }
          break;
        }
        case 'mouseup': {
          break;
        }
        default: {
          break;
        }
      }
    },
    setSeries(v) {
      let option = v.option;
      let data = v['data'];
      let abnomalDot = v.abnomalDot;

      if (data && data.length < 1) { // 接口返回的数据空数据时提示无数据
        option.title = {
          text: this.$t('base.noData'),
          left: 'center',
          top: 'middle'
        };
      } else {
        option.title = {
          text: this.metricName,
          left: 15,
          top: 10
        };
      }

      if (data) {
        data = data.map((item, index) => {
          return [new Date(item.time).getTime(), item.value];
        });
        // option.legend['data'][0].name = this.metricName;
        // option.xAxis['data'] = [];
        option.yAxis[0].name = this.metricUnit;

        // option.xAxis.min = data[0][0];
        // option.xAxis.max = data[data.length - 1][0];

        option.series[0].data = data;
        option.series[0].name = this.metricName;
        option.series[1].data = [];// 正常数据重置的时候，要将异常点的数据重置为空
      }

      if (abnomalDot) {
        abnomalDot = abnomalDot.map((item, index) => {
          return [new Date(item.time).getTime(), item.value];
        });
        // option.legend['data'][1].name = Vue.t('operationAnalysis.ERROR_POINT');

        option.series[1].data = abnomalDot;
        // option.legend.show =
        //   (data && data.length) || (abnomalDot && abnomalDot.length);
      }
    }
  }
};
