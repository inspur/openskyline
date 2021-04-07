<template>
  <div class="performance">
    <el-collapse v-model="activeNames">
      <el-collapse-item :title="$t('base.performanceIndex')" name="1" style="text-align: left;">
        <el-row :gutter="10">
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr>
                    <th class="idatath">{{$t('base.CPUUtilization')}}：</th>
                    <td class="idatatd">{{profileData.cpu_utilzation}}</td>
                  </tr>
                  <tr>
                    <th class="idatath">{{$t('base.diskReadRate')}}(MB/s)：</th>
                    <td class="idatatd">{{profileData.diskout}}</td>
                  </tr>
                  <tr>
                    <th class="idatath">{{$t('base.networkInflowSpeed')}}(KB/s)：</th>
                    <td class="idatatd">{{profileData.netin}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr>
                    <th class="idatath">{{$t('base.memUtilization')}}：</th>
                    <td class="idatatd">{{profileData.mem_utilzation}}</td>
                  </tr>
                  <tr>
                    <th class="idatath">{{$t('base.diskWriteRate')}}(MB/s)：</th>
                    <td class="idatatd">{{profileData.diskin}}</td>
                  </tr>
                  <tr>
                    <th class="idatath">{{$t('base.networkOutflowSpeed')}}(KB/s)：</th>
                    <td class="idatatd">{{profileData.netout}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item
        :title="$t('base.performanceCurve')+'('+timeTitle+')'"
        name="2"
        style="text-align: left;"
      >
        <icos-chart-time-select
          ref="timeSelect"
          :lastHalfHour="1"
          :last24Hour="1"
          :realTimeInterval="30*60*1000"
          :setTimeoutDelay="1000*60"
          @handler="timeSelectHandler"
        ></icos-chart-time-select>

        <div class="divider clearfix"></div>
        <el-row>
          <el-col :span="12">
            <cpu-chart
              ref="cpuChart"
              :chartData="{uuid:instanceID,titleText:$t('base.cpuUsHisCur')}"
              style="height:300px"
            />
          </el-col>
          <el-col :span="12">
            <mem-chart
              ref="memChart"
              :chartData="{uuid:instanceID,titleText:$t('base.memUsHisCur')}"
              style="height:300px"
            />
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <net-chart
              ref="netChart"
              :chartData="{uuid:instanceID,titleText:$t('base.networkIOHisCur')}"
              style="height:300px"
            />
          </el-col>
          <el-col :span="12">
            <disk-chart
              ref="diskChart"
              :chartData="{uuid:instanceID,titleText:$t('base.diskRWHisCur')}"
              style="height:300px"
            />
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import IcosChartTimeSelect from "../../../intelligentMonitoring/public/components/IcosChartTimeSelect";
import CpuChart from "./CpuChart";
import MemChart from "./MemChart";
import NetChart from "./NetChart";
import DiskChart from "./DiskChart";

export default {
  components: { IcosChartTimeSelect, CpuChart, MemChart, NetChart, DiskChart },
  props: ["instanceID"],
  data() {
    return {
      activeNames: ["1", "2"],
      baseinfoLoading: false,
      hisLoading: false,
      profileData: {
        cpu_utilzation: "",
        diskin: "",
        diskout: "",
        mem_utilzation: "",
        netin: "",
        netout: ""
      },
      timeTitle: Vue.t("base.last24Hour")
    };
  },
  mounted() {
    this.getProfileData();
    this.$refs.timeSelect.query({ type: Vue.t("base.lastHalfHour") });
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    getProfileData(v) {
      let me = this;
      me.loading = true;

      me.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: me.centerId
        },
        url: "api/pluto/v1/monitor/cpms/" + me.instanceID,
        successFun(data) {
          me.loading = false;
          let o = data || {};
          if (o["cpu_utilzation"] !== "" && !isNaN(o["cpu_utilzation"])) {
            o["cpu_utilzation"] = o["cpu_utilzation"].toFixed(2) + "%";
          }
          if (o["mem_utilzation"] !== "" && !isNaN(o["mem_utilzation"])) {
            o["mem_utilzation"] = o["mem_utilzation"].toFixed(2) + "%";
          }
          for (let i in o) {
            me.profileData[i] = o[i];
          }
        }
      });
    },
    timeSelectHandler(v) {
      let vm = this;
      vm.timeTitle = v.timeTitle;
      let search = `&starttime=${v.startTime}&endtime=${v.endTime}&is_history=${v.isHistory}`;
      let data = Object.assign({ search }, v);

      vm.$refs.cpuChart.getData(data);
      vm.$refs.memChart.getData(data);
      vm.$refs.netChart.getData(data);
      vm.$refs.diskChart.getData(data);
    }
  }
};
</script>

<style  scoped>
.performance >>> .chart {
  position: relative;
}
.performance >>> .chart .chart-select {
  position: absolute;
  right: 25px;
  top: 20px;
  width: 150px;
}
</style>