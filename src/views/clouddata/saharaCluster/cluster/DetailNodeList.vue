<template>
  <div>
    <el-table
        ref="table"
        :data="nodetableData"
        highlight-current-row
        stripe
        :default-sort="{prop: 'instance_name', order: 'ascending'}"
        row-key="instance_id">
        <el-table-column reserve-selection type="selection" align="center" width="55"></el-table-column>
        <el-table-column
        v-if="columnsChecked.indexOf('instance_name') >= 0"
        prop="instance_name"
        :label="$t('lang.name')"
        show-overflow-tooltip
        min-width="100">
        </el-table-column>
        <el-table-column
        v-if="columnsChecked.indexOf('instance_id') >= 0"
        prop="instance_id"
        label="ID"
        show-overflow-tooltip
        align="left"
        min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('created_at') >= 0" prop="created_at" :label="$t('storage.createdTime')" min-width="100" align="left">
        <template slot-scope="scope">
            <span v-html="dateRender(scope.row.created_at)"></span>
        </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('management_ip') >= 0" prop="management_ip" label="管理IP" align="left" min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('internal_ip') >= 0" prop="internal_ip" label="内部IP" align="left" min-width="100">
        </el-table-column>
    </el-table>
  </div>
</template>
<script>
import moment from 'moment';
export default {
  name: "NodeList",
  props: ["clusterId"],
  data() {
    return {
      nodetableData: [],
      columnsChecked: ["instance_name", "instance_id", 'created_at', "management_ip", "internal_ip"],
      projectId: this.$cookie.get('pid')
    }
  },
  watch: {
    clusterId: {
      handler: function(rows, oldVal) {
        const $this = this;
        $this.initDetail();
      }
    }
  },
  mounted() {
    this.initDetail()
  },
  methods: {
    initDetail() {
      let self = this;
      let a = [];
      self.$ajax({
        type: "GET",
        url: "api/sahara/v2/"+self.projectId+"/clusters/"+self.clusterId,
        data: {},
        success: function(result) {
          let cluster = result["cluster"];
          let nodegroups = cluster["node_groups"];
          for (let i=0; i<nodegroups.length; i++) {
            let instances = nodegroups[i].instances;
            if (instances.length > 0) {
              for (let j=0; j<instances.length; j++) {
                a.push(instances[j]);
              }
            }
          }
          self.nodetableData = a;
          console.log(a)
        },
        errFun() {
        }
      });
    },
    dateRender(utc) {
      return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
    }
  }
}
</script>
<style scoped>
  .idatath {
    width: 100px;
  }
</style>