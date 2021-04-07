<template>
  <div class="time-select">
    <el-date-picker
      type="date"
      v-model="startTime"
      :editable="false"
      :placeholder="$t('lang.startDate')"
      :picker-options="datePickerOptions1"
    ></el-date-picker>
    <span>-</span>
    <el-date-picker
      type="date"
      v-model="endTime"
      :editable="false"
      :placeholder="$t('lang.endDate')"
      :picker-options="datePickerOptions2"
    ></el-date-picker>

    <el-button
      type="primary"
      icon="fa-search"
      size="small"
      @click="query({type:'query'})"
    >{{$t('base.query')}}</el-button>

    <el-radio-group v-model="radioGroupSelect" @change="radioGroupChange">
      <el-radio-button v-for="i in radioGroup" :key="i" :label="i"></el-radio-button>
    </el-radio-group>
  </div>
</template>
<script>
import { utils } from "../../public/utils";
import moment from "moment";

export default {
  name: "IcosChartTimeSelect",
  components: {},
  props: {
    realTime: { type: Number, default: 0 },
    lastHalfHour: { type: Number, default: 0 },
    last24Hour: { type: Number, default: 0 },
    lastWeek: { type: Number, default: 1 },
    lastMonth: { type: Number, default: 1 },
    realTimeInterval: { type: Number, default: 24 * 2 * 60 * 60 * 1000 },
    setTimeoutDelay: { type: Number, default: 1000 * 60 }
  },
  data() {
    let radioGroup = [];
    this.realTime && radioGroup.push(Vue.t("base.realTime"));
    this.lastHalfHour && radioGroup.push(Vue.t("base.lastHalfHour"));
    this.last24Hour && radioGroup.push(Vue.t("base.last24Hour"));
    this.lastWeek && radioGroup.push(Vue.t("base.lastWeek"));
    this.lastMonth && radioGroup.push(Vue.t("base.lastMonth"));

    return {
      startTime: "",
      endTime: "",
      datePickerOptions1: {
        disabledDate: time => {
          return time.getTime() > (this.endTime || Date.now());
        }
      },
      datePickerOptions2: {
        disabledDate: time => {
          let b = time.getTime() > Date.now();
          if (this.startTime) {
            return time.getTime() < this.startTime || b;
          }
          return b;
        }
      },
      radioGroupSelect: "",
      radioGroup: radioGroup,
      timeoutID: 0
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeoutID);
  },
  mounted() {},
  beforeCreate() {},
  created() {
    this.radioGroupSelect = "" + this.radioGroup[0];
  },
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  methods: {
    resetData(v) {
      this.startTime = "";
      this.endTime = "";
    },
    radioGroupChange(v) {
      this.query({ type: v });
    },
    query(v) {
      clearTimeout(this.timeoutID);

      if (v.type !== "query" && v.from !== "timeout") {
        this.resetData();
      }

      let date = utils.getUTCDate();
      let endTime = date.getTime();
      let startTime = endTime - this.realTimeInterval;
      let xAxisLabelFormatter = v => moment(v).format("MM-DD");
      let isHistory = 0;
      let timeTitle = v.type;

      switch (v.type) {
        case Vue.t("base.realTime"):
          startTime = endTime - this.realTimeInterval;
          this.timeoutID = setTimeout(() => {
            this.query({ type: v.type, from: "timeout" });
          }, this.setTimeoutDelay);
          break;
        case Vue.t("base.lastHalfHour"):
          startTime = endTime - 1 * 0.5 * 60 * 60 * 1000;
          this.timeoutID = setTimeout(() => {
            this.query({ type: v.type, from: "timeout" });
          }, this.setTimeoutDelay);
          break;
        case Vue.t("base.last24Hour"):
          startTime = endTime - 1 * 24 * 60 * 60 * 1000;
          break;
        case Vue.t("base.lastWeek"):
          startTime = endTime - 7 * 24 * 60 * 60 * 1000;
          break;
        case Vue.t("base.lastMonth"):
          startTime = date.setMonth(date.getMonth() - 1);
          break;
        case "query":
          if (!this.startTime || !this.endTime) {
            this.$message({
              message: Vue.t("base.dataWarn"),
              type: "warning"
            });
            return;
          }

          startTime = utils.getUTCDate(this.startTime).getTime();
          endTime = utils.getUTCDate(this.endTime).getTime();
          endTime += 24 * 60 * 60 * 1000 - 1;
          if (endTime > Date.now()) {
            endTime = Date.now();
          }

          timeTitle = `${this.startTime.getFullYear()}-${utils.pad0(
            this.startTime.getMonth() + 1
          )}-${utils.pad0(
            this.startTime.getDate()
          )}~${this.endTime.getFullYear()}-${utils.pad0(
            this.endTime.getMonth() + 1
          )}-${utils.pad0(this.endTime.getDate())}`;
          isHistory = 1;
          break;
        default:
          break;
      }

      if (endTime - startTime < 3 * 24 * 60 * 60 * 1000) {
        xAxisLabelFormatter = v => moment(v).format("HH:mm");
      }
      let data = {
        endTime: parseInt(endTime / 1000),
        startTime: parseInt(startTime / 1000),
        xAxisLabelFormatter,
        isHistory,
        timeTitle
      };

      this.$emit("handler", data);
    }
  }
};
</script>
<style scoped>
.time-select >>> .el-date-editor {
  position: relative;
  width: 150px;
}
.time-select >>> .el-button,
.time-select >>> .el-radio-button {
  margin: 0 8px;
}
.time-select >>> .el-radio-button .el-radio-button__inner {
  padding: 8px 9px;
  font-size: 12px;
}
.time-select
  >>> .el-radio-button
  .el-radio-button__orig-radio:checked
  + .el-radio-button__inner {
  color: #0087ed;
  background-color: unset;
  border-color: #0087ed;
}
.time-select >>> .el-radio-button .el-radio-button__inner,
.time-select >>> .el-radio-button:last-child .el-radio-button__inner,
.time-select >>> .el-radio-button:first-child .el-radio-button__inner {
  border-radius: 4px;
}
.time-select >>> .el-radio-button .el-radio-button__inner:hover {
  color: unset;
  background-color: unset;
  border: 1px solid #bfcbd9;
}
</style>
