<template>
  <div>
    <el-table
      ref="table"
      :data="nodetableData"
      highlight-current-row
      stripe
      :default-sort="{prop: 'created_at', order: 'descending'}"
      row-key="instance_id">
      <el-table-column
        v-if="columnsChecked.indexOf('step_name') >= 0"
        prop="step_name"
        label="步骤详情"
        show-overflow-tooltip
        min-width="150">
        <template slot-scope="scope">
          <span v-html="nameRender(scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('created_at') >= 0"
        prop="created_at"
        :label="$t('storage.createdTime')"
        min-width="100"
        align="left">
        <template slot-scope="scope">
          <span v-html="dateRender(scope.row.created_at)"></span>
        </template>
      </el-table-column>
      <!-- <el-table-column
        v-if="columnsChecked.indexOf('created_at') >= 0"
        prop="created_at"
        label="持续时长"
        show-overflow-tooltip
        align="left"
        min-width="100"
      ></el-table-column> -->
      <el-table-column
        v-if="columnsChecked.indexOf('total') >= 0"
        prop="total"
        label="进行"
        align="left"
        min-width="100"
      ></el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('successful') >= 0"
        prop="successful"
        label="状态"
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="successRender(scope.row.successful)"></span>
        </template></el-table-column>
    </el-table>
  </div>
</template>
<script>
import moment from "moment";
export default {
  name: "NodeList",
  props: ["clusterId"],
  data() {
    return {
      nodetableData: [],
      columnsChecked: [
        "step_name",
        "created_at",
        "total",
        "successful"
      ],
      projectId: this.$cookie.get("pid")
    };
  },
  watch: {
    clusterId: {
      handler: function (rows, oldVal) {
        const $this = this;
        $this.initDetail();
      }
    }
  },
  mounted() {
    this.initDetail();
  },
  methods: {
    initDetail() {
      let self = this;
      let a = [];
      self.$ajax({
        type: "GET",
        url: "api/sahara/v1.1/" + self.projectId + "/clusters/" + self.clusterId,
        data: {},
        success: function (result) {
          let provisionprogress = result["cluster"]["provision_progress"];
          self.nodetableData = provisionprogress;
        },
        errFun() {}
      });
    },
    dateRender(utc) {
      return moment.utc(utc).local().format("YYYY-MM-DD HH:mm:ss");
    },
    nameRender(row) {
      return row["step_name"] + "<br>" + row["step_type"];
    },
    successRender(val) {
      return val;
      // if (val) {
      //   return "成功完成";
      // } else {
      //   return "失败";
      // }
    }
  }
};
</script>
<style scoped>
.idatath {
  width: 100px;
}
</style>