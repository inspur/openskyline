// 潘启宝 2020年07月29日 16:45:05 中国济南

import { mapGetters, mapMutations } from 'vuex';
import moment from 'moment';
import { utils } from 'views/intelligentMonitoring/public/utils';
import IcosDashboard from "../../intelligentMonitoring/public/components/IcosDashboard";
import Setting from "./setting.vue";

export default {
  name: 'trendpredict',
  components: { IcosDashboard, Setting },
  data() {
    return {
      smape: '',
      seasonl: '',
      loading: false,
      chartLoading: false,
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
        metricUnit: '',
        metricName: '',
        models: [],
        model: ''
      },
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
        model: [
          {
            required: true,
            message: '请选择模型'
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
            name: Vue.t('operationAnalysis.PREDICT_RAW_VALUE'),
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
            name: Vue.t('operationAnalysis.PREDICT_TREND_VALUE'),
            data: [],
            smooth: false,
            type: 'line',
            // lineStyle: { normal: { width: 0, opacity: 0 } },
            // itemStyle: { normal: { color: '#ff0000' } },
            // symbol: 'circle',
            // symbolSize: 7,
            // showSymbol: true,
            // showAllSymbol: true,
            // tooltip: {
            //   show: false
            // },
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
      dashboardOption: $.extend(
        true,
        JSON.parse(JSON.stringify(utils.echartsOption)),
        {
          percent: 85,
          title: {
            text: ""
          },
          style: 2,
          content: {
            text: '-',
            subText: Vue.t('operationAnalysis.PREDICT_LEFT_TIME')
          }
        }
      ),
      restTimeLoading: false,
      settingShow: false
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
    ...mapGetters({})
  },
  methods: {
    transitionend(v) {
      // if (v.propertyName === 'left' && v.target === this.$refs.detect) {
      // }
    },
    seasonSetting(v) {
      this.settingShow = v.direction === 'left';
      if (this.settingShow) {
        this.$refs.carousel.setActiveItem(1);
      } else {
        this.$refs.carousel.setActiveItem(0);
      }
    },
    init(v) {
      this.form.time = new Date();
      this.chartLoading = false;
    },
    query(v) {
      this.loadData();
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
      this.loadmodel();
    },
    async loadmodel(v) {
      this.form.model = '';
      let url = `api/earth/ntd/tp/model`;
      const r = await this.$ajax({
        type: 'get',
        data: {
          class_id: this.form.resourceType,
          host_id: this.form.hostID,
          instance_id: this.form.instanceID,
          metrics_id: this.form.metricID
        },
        url: `${url}`
      });
      let d = r.data || {};
      this.form.models = d.smape;
      let o = {
        '0': Vue.t('operationAnalysis.PREDICT_UNLIMIT'),
        '12h': Vue.t('operationAnalysis.PREDICT_12H'),
        '24h': Vue.t('operationAnalysis.PREDICT_24H'),
        '1w': Vue.t('operationAnalysis.PREDICT_1W')
      }
      this.seasonl = o[String(d.seasonl)];
    },
    async modelChange(v) {
      this.smape = this.form.models[v] + ' %';
    },
    async loadResourceTypes() {
      this.form.queryButtonDisabled = true;
      let url = 'api/earth/ntd/tp/class';
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
      let url = 'api/earth/ntd/tp/host';
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
      let url = 'api/earth/ntd/tp/instance';
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
      let url = 'api/earth/ntd/tp/metrics_sub';
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

        let data = {
          class_id: this.form.resourceType,
          host_id: this.form.hostID,
          instance_id: this.form.instanceID,
          metrics_id: this.form.metricID,
          model: this.form.model
        }
        // data = {
        //   class_id: 'host',
        //   host_id: 'inspurcloudos-node201',
        //   instance_id: 'inspurcloudos-node201',
        //   metrics_id: 'host_cpu_utilization',
        //   model: 'holt_winters'
        // }

        this.chartLoading = true;
        let url = 'api/earth/ntd/tp/predict';
        // url = './static/json/detection.json'; // TODO 用于开发测试阶段

        let r = await this.$ajax({
          type: 'get',
          url: `${url}`,
          data: data
        }).catch(v => { });

        data = r['data'] || {};

        let label = data.label || {};
        let raw = data.raw || [];
        let trend = data.trend || [];

        this.chartLoading = false;

        this.setSeries({ option: this.option, data: JSON.parse(JSON.stringify(data)) });
      });
    },
    setSeries(v) {
      let data = v.data || {};
      let label = data.label || {};
      let raw = data.raw || [];
      let trend = data.trend || [];

      let option = v.option;

      if (raw.length < 1 && trend.length < 1) { // 接口返回的数据空数据时提示无数据
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

      if (raw) {
        raw = raw.map((item, index) => {
          return [new Date(item.time).getTime(), item.value];
        });
        // option.legend['data'][0].name = this.metricName;
        // option.xAxis['data'] = [];
        option.yAxis[0].name = this.metricUnit;

        // option.xAxis.min = raw[0][0];
        // option.xAxis.max = raw[raw.length - 1][0];

        option.series[0].data = raw;
        option.series[1].data = [];// 正常数据重置的时候，要将异常点的数据重置为空
      }

      if (trend) {
        trend = trend.map((item, index) => {
          return [new Date(item.time).getTime(), item.value];
        });
        // option.legend['data'][1].name = Vue.t('operationAnalysis.ERROR_POINT');

        option.series[1].data = trend;
        // option.legend.show =
        //   (data && data.length) || (abnomalDot && abnomalDot.length);
      }
    },
    async loadRestTime() {
      const $this = this;
      if (!/^[0-9]+$/.test($this.dashboardOption.percent + '')) {
        $this.$message.error(Vue.t('operationAnalysis.PREDICT_INVALID_VALUE'));
      } else {
        const threshold = parseInt($this.dashboardOption.percent);
        if (threshold > 100 || threshold < 1) {
          $this.$message.error(Vue.t('operationAnalysis.PREDICT_INVALID_VALUE'));
        } else {
          $this.restTimeLoading = true;
          let data = {
            class_id: this.form.resourceType,
            host_id: this.form.hostID,
            instance_id: this.form.instanceID,
            metrics_id: this.form.metricID,
            model:  this.form.model,
            threshold: this.dashboardOption.percent
          }
          // data = {
          //   class_id: 'host',
          //   host_id: 'inspurcloudos-node201',
          //   instance_id: 'inspurcloudos-node201',
          //   metrics_id: 'host_cpu_utilization',
          //   model: 'holt_winters',
          //   threshold: 85
          // }
          const res = await $this.$ajax({
            type: 'get',
            url: `api/earth/ntd//tp/time`,
            data: data
          })
          $this.dashboardOption.content.text = '-'
          data = res.data || {};
          if (data && data.hasOwnProperty('avalible')) {
            $this.dashboardOption.content.text = data.avalible;
            if ($this.dashboardOption.content.text >= 180) {
              $this.dashboardOption.content.text = '180+';
            }
            $this.dashboardOption.content.text += Vue.t('operationAnalysis.PREDICT_DAYS');
          }
          $this.restTimeLoading = false;
        }
      }
    }
  }
};
