<template>
  <el-dialog
  @close="closeFun"
  :title="$t('monitor.selResource')"
  :visible.sync="dialogVisible"
 >
  <div class="divider clearfix"></div>
    <el-form :inline="true" class="form-inline" :model="formInline">
        <el-form-item :label="$t('base.resourceName')">
          <el-input v-model="formInline.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.address')">
          <el-input v-model="formInline.address"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon='fa-search' size="small" @click="query">{{$t('base.query')}}</el-button>
        </el-form-item>
    </el-form>
    <el-table
      ref="table"
      :data="seltableData"  v-loading="loading1"
      :element-loading-text="$t('base.loadingData')"
      highlight-current-row
      style="width: 100%"
      row-key="resource_id"
      @row-click="rowClick"
      @selection-change="handleSelectionChange1">
      <el-table-column
        reserve-selection
        type="selection"
        align="center"
        width="55">
      </el-table-column>
      <el-table-column
        prop="resource_name"
        :label="$t('base.resourceName')"
        min-width="100">
        <template slot-scope="scope">
          <span>{{chooseNamebyLan(scope.row.resource_name_cn, scope.row.resource_name_en)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="resource_address"
        :label="$t('base.address')"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="resource_sc_name"
        :label="$t('base.resouceType')"
        min-width="100">
        <template slot-scope="scope">
          <span>{{chooseNamebyLan(scope.row.resource_sc_name_cn, scope.row.resource_sc_name_en)}}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="collect_flag"
        align="left"
        :label="$t('base.monitorStatus')"
        min-width="100">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.collect_flag=='1'">{{$t('base.on')}}</el-tag>
          <el-tag type="danger" v-if="scope.row.collect_flag=='0'">{{$t('base.off')}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
      prop="alarm_flag"
      align="left"
      :label="$t('monitor.alarmStatus')"
      min-width="100">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.alert_flag=='1'">{{$t('base.on')}}</el-tag>
          <el-tag type="danger" v-if="scope.row.alert_flag=='0'">{{$t('base.off')}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="notice_flag"
        align="left"
        :label="$t('base.notificationStatus')"
        min-width="100">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.notice_flag===''||scope.row.notice_flag=='1'">{{$t('base.on')}}</el-tag>
          <el-tag type="danger" v-if="scope.row.notice_flag=='0'">{{$t('base.off')}}</el-tag>
        </template>
      </el-table-column> -->
      </el-table>
      <div style="margin: 10px 0; position: relative;text-align: right;">
        <el-pagination
          style="float:none;"
          @size-change="handleSizeChange1"
          @current-change="handleCurrentChange1"
          :current-page="currentPage"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeFun">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAddIppool">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import {chooseNamebyLan} from '../public/public.js'
export default {
  name: 'Config',
  props: ['selectedRow', 'centerId', 'classId', 'from', 'project'],
  data() {
    return {
      chooseNamebyLan,
      formInline:{
        name:"",
        address:""
      },
      seltableData:[],
      loading1:false,
      dialogVisible: false,
      currentPage:1,
      pageSize: 10,
      total: 0,
      multipleSelection1:[],
      columns: [{
        prop: "resource_name",
        label: Vue.t('base.resourceName')
      }, {
        prop: "resource_address",
        label: Vue.t('base.address')
      }, {
        prop: "resource_sc_cname",
        label: Vue.t('base.resouceType')
      }, {
        prop: "collect_flag",
        label: Vue.t('base.monitorStatus')
      }, {
        prop: "alarm_flag",
        label: Vue.t('monitor.alarmStatus')
      }, {
        prop: "notice_flag",
        label: Vue.t('base.notificationStatus')
      }]
      // columnsChecked:["resource_name", "resource_address", "resource_sc_cname", "collect_flag", "alarm_flag", "notice_flag"]
    }
  },
  mounted() {
  },
  computed: {
    defaultNameDisabled() {
      return this.roleType == '2' && this.info.name == 'default';
    }
  },
  methods: {
    show() {
      let self = this;
      self.dialogVisible = true;
      this.formInline.name = "";
      this.formInline.address = "";
      this.clearSelection();
      this.getTableData();
    },
    clearSelection(v) {
      try {
        this.$refs.table.clearSelection();
      } catch (error) {
      }
    },
    query() {
      this.clearSelection();
      this.getTableData();
    },
    async getTableData() {
      var id = this.selectedRow.resource_id;
      var param = {subclass_id: this.classId, excluded_ids:id, page_size:this.pageSize, current_page:this.currentPage};
      if (this.formInline.name!="") {
        param.resource_name = this.formInline.name;
      }
      if (this.formInline.address!="") {
        param.resource_address = this.formInline.address;
      }
      if (Vue.roleType == "2") {
        param.project_id = this.$cookie.get("pid");
      }
      if (Vue.roleType == "0" && this.project) {
        param.project_id = this.project;
      }
      if (this.from != 'add' && this.selectedRow.project_id != "-1") {
        param.project_id = this.selectedRow.project_id;
      }
      this.loading1 = true;
      let ret = await this.$ajax({
        type: 'get',
        headers: {
          'FORWARD_UNION': this.centerId
        },
        url: "api/pluto/v1/monitor/resources?"+ $.param(param)
      })
      this.loading1 = false;
      this.seltableData = ret.resources.resource_list;
      this.total = ret.resources.total;
    },
    rowClick(row) {
      this.$refs.table.toggleRowSelection(row);
    },
    handleSelectionChange1(val) {
      this.multipleSelection1 = val;
    },
    handleSizeChange1(val) {
      this.pageSize = val;
      this.getTableData(false);
    },
    handleCurrentChange1(val) {
      this.currentPage = val;
      this.getTableData(false);
    },
    async confirmAddIppool() {
      var self = this;
      var resources = [];
      var resNamesCh = [];
      var resNameEn = [];
      if (self.multipleSelection1.length == 0) {
         self.$notify({
          message:Vue.t('monitor.selectResourcePrompt'),
          type:'warning'
        });
        return;
      }

      if (this.from === 'add') {
        this.$emit("updateData", this.multipleSelection1);
        this.closeFun();
        return;
      }

      this.multipleSelection1.forEach((item, index) => {
        resources.push(item.resource_id);
        resNamesCh.push(item.resource_name_cn);
        resNameEn.push(item.resource_name_en);
      });
      var body = { "ids": resources, "template_id": self.selectedRow.id };
      self.loading = true;
      try {
        let ret = await this.$ajax({
          url: "api/pluto/v1/template/add/resources",
          data: JSON.stringify(body),
          headers: {
            'FORWARD_UNION': self.centerId
            },
          type: 'post',
          confirmMsg:Vue.t("monitor.batchConfigTip2"),
          successMsg: Vue.t('base.saveSuccess'),
          log: {
            description: {
              en: "Config batch,Template:" + this.selectedRow.name + ",Resources:" + resNameEn.join(";"),
              zh_cn: "批量配置，模板：" + this.selectedRow.name + "，运用到的资源：" + resNamesCh.join(";")
            },
            target: Vue.logTarget.monitor
          }
        });
        self.loading = false;
        this.closeFun();
        this.$emit("refreshData", true);
      } catch (data) {
        this.loading = false;
        __DEV__ && console.error(data);
      }
    },
    closeFun() {
      this.dialogVisible = false;
      this.$emit("closeFun");
    }
  }
}
</script> 