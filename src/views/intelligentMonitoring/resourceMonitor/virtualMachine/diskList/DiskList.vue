<template>
  <div>
    <el-table
      ref="deTable"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('base.loadingData')"
      highlight-current-row
      style="width: 100%">
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
        prop="device"
        :label="$t('base.name')"
        align="center"
        min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('total') >= 0"
        prop="total"
        :label="$t('monitor.totalSize')"
        align="center"
        min-width="100">
        <template slot-scope="scope">
          {{scope.row.total}}GB
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('used') >= 0"
        prop="used"
        :label="$t('monitor.used')"
        align="center"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.used}}GB
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('useRate') >= 0"
        prop="useRate"
        :label="$t('base.utilization')"
        align="center"
        min-width="80">
        <template slot-scope="scope">
          {{scope.row.percent}}%
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <!-- <el-button type="text" icon="fa-refresh" @click="getTableData">
          </el-button> -->
            <el-popover
              placement="right"
              trigger="click">
              <el-checkbox-group class="vertical"
                v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
              </div>
            </el-popover>
        </el-col>
        <el-col :span="19">
          <el-pagination
            class="right"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
export default {
  props:["vmId", "centerId"],
  data() {
    return {
      tableData:[],
      currentPage:1,
      pageSize: 10,
      total: 0,
      loading:false,
      formInline:{
        name:"",
        id:"",
        pName:"",
        uName:"",
        status:""
      },
      columns: [{
        prop: "name",
        label: Vue.t('base.name')
      }, {
        prop: "total",
        label: Vue.t('monitor.totalSize')
      }, {
        prop: "used",
        label: Vue.t('monitor.used')
      }, {
        prop: "useRate",
        label: Vue.t('base.utilization')
      }],
      columnsChecked:["name", "total", "used", "useRate"]
    }
  },
  mounted() {
    this.getTableData();
  },
  methods: {
    getTableData() {
      let me = this;
      me.$ajax({
        type: 'get',
        headers: {
          'FORWARD_UNION': this.centerId
        },
        url: "api/pluto/v1/monitor/vms/" + me.vmId + "/disk",
        successFun(rtn) {
          me.tableData = rtn.data;
          me.total = rtn.size;
        }
      })
    },
    statusRender(value) {
      if (value == "BUSY") {
        return "<i class='el-icon-loading'></i>";
      } else if (value == "ACTIVE") {
        return this.$t('calcStorLang.running');
      } else if (value == "BUILD") {
        return this.$t('calcStorLang.build');
      } else if (value == "ERROR") {
        return this.$t('calcStorLang.error');
      } else if (value == "REBOOT") {
        return this.$t('calcStorLang.reboot');
      } else if (value == "HARD_REBOOT") {
        return this.$t('calcStorLang.hard_reboot');
      } else if (value == "PAUSED") {
        return this.$t('calcStorLang.paused');
      } else if (value == "MIGRATING") {
        return this.$t('calcStorLang.migrating');
      } else if (value == "PASSWORD") {
        return this.$t('calcStorLang.password');
      } else if (value == "REBUILD") {
        return this.$t('calcStorLang.rebuild');
      } else if (value == "RESCUE") {
        return this.$t('calcStorLang.rescue');
      } else if (value == "REVERT_RESIZE") {
        return this.$t('calcStorLang.revert_resize');
      } else if (value == "SHELVED") {
        return this.$t('calcStorLang.shelved_offloaded');
      } else if (value == "SHELVED_OFFLOADED") {
        return this.$t('calcStorLang.shelved_offloaded');
      } else if (value == "SHUTOFF") {
        return this.$t('calcStorLang.closed');
      } else if (value == "SUSPENDED") {
        return this.$t('calcStorLang.suspended');
      } else if (value == "UNKNOW") {
        return this.$t('calcStorLang.unknow');
      } else if (value == "VERIFY_RESIZE") {
        return this.$t('calcStorLang.verify_resize');
      } else {
        return "-";
      }
    },
    statusTagRender(status) {
        if ("ACTIVE" == status) {
           return "success";
        } else if ("SHUTOFF" == status) {
           return "gray";
        } else if ("BUILD" == status) {
           return "";
        } else if ("DELETED" == status || "SOFT_DELETED" == status || "ERROR" == status || "UNKNOW" == status) {
           return "danger";
        } else if ("SHUTOFF" == status) {
           return "info";
        } else if ("SUSPENDED" == status) {
           return "warning";
        } else if ("HARD_REBOOT" == status || "REBOOT" == status || "MIGRATING" == status || "RESCUE" == status || "REVERT_RESIZE" == status || "REBUILD" == status) {
           return "info";
        } else {
          return "";
        }
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTableData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getTableData();
    },
    blurFun(key) {
      let num = (key=="id"?50:40);
      if (this.formInline[key].length>num) {
        this.formInline[key] = '';
        this.$notify({
          message:Vue.t('base.ultraLong'),
          type:'warning'
        });
      }
    },
    onQuery() {
      this.getTableData();
    },
    vmNameClick(row) {
    }
  }
}
</script>
