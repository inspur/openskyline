<template>
  <div>
    <icos-page-header :title="$t('base.DETAIL_PAGE')" :show-back="true" @back="pageHeaderBackHandle" :show-bottom-border="false" />
    <el-collapse :value="['1', '2', '3', '4']">
      <el-collapse-item :title="name + $t('monitor.OPENSTACK_API_STATUS_WHOLE')" name="1">
        <el-table :data="api.detail">
          <el-table-column
            prop="sv"
            :render-header="serviceHeaderRender"
            :label="$t('monitor.OPENSTACK_API_STATUS_SERVICE')"
          ></el-table-column>
          <el-table-column prop="status" :label="$t('monitor.STATUS')"></el-table-column>
        </el-table>
      </el-collapse-item>
      <el-collapse-item :title="$t('monitor.sysRunStatus')" name="2">
        <icos-chart-time-select
          ref="timeSelect"
          :realTime="0"
          :last24Hour="1"
          :setTimeoutDelay="1000*60*5"
          @handler="timeSelectHandler"
        ></icos-chart-time-select>
        <chart ref="chart" />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import moment from "moment";
import IcosChartTimeSelect from "../../public/components/IcosChartTimeSelect";
import { utils } from "../../public/utils";
import Chart from "./chart/Chart";

export default {
  name: "Detail",
  components: { IcosChartTimeSelect, Chart },
  watch: {},
  data() {
    return {
      name: this.$route.params.name,
      api: {}
    };
  },
  methods: {
    pageHeaderBackHandle(v) {
      let route = this.$route || {};
      let matched = route.matched || [];
      let p = matched[matched.length - 1].parent || {};
      this.$router.push({ path: p.path });
    },
    timeSelectHandler(v) {
      this.$refs.chart.loadData(Object.assign({ name: this.name }, v));
    },
    async loadApi() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: "get",
          url: `api/pluto/v1/monitor/openstackapi/status?name=${$this.name}`
        });
        this.api = res.apilist;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },

    serviceHeaderRender(h, { column, $index }) {
      return h("div", [
        column.label,
        h(
          "el-tooltip",
          {
            props: {
              trigger: "hover",
              placement: "top"
            }
          },
          [
            h("div", {
              slot: "content",
              domProps: {
                innerHTML: Vue.t(`monitor.OPENSTACK_API_STATUS_SERVICE_TIPS`)
              }
            }),
            h("i", {
              style: {
                marginLeft: "5px"
              },
              class: "el-icon-fa-question-circle"
            })
          ]
        )
      ]);
    }
  },
  mounted() {
    this.loadApi();
    this.$refs.chart.init({ name: this.name });
    this.$refs.timeSelect.query({ type: Vue.t("base.last24Hour") });
  }
};
</script>

<style scoped>
</style>
