<template>
  <div>
    <el-dialog :title="$t('calcStorLang.selectVolume')" :visible.sync="visible" class="custom-dialog">
      <el-form :inline="true" :model="formInline" class="form-inline">
        <el-form-item :label="$t('base.name')">
          <el-input v-model="formInline.name" @blur="blurFun('name')" style="width:150px;"></el-input>
        </el-form-item>
        <el-form-item label="ID">
          <el-input v-model="formInline.vId" @blur="blurFun('id')" style="width:150px;"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.status')">
          <el-select v-model="formInline.volumeStatus" style="width:100px;" size="small" filterable clearable>
            <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('lang.type')">
          <el-select v-model="formInline.volumeType" style="width:150px;" size="small" filterable clearable>
            <el-option v-for="item in volumeTypeList" :value="item.id" :key="item.id" :label="item.name.length > 50?item.name.substring(0, 50):item.name" :title="item.name.length > 50?item.name:''">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" icon='fa-search' @click="getTableData">{{$t('base.query')}}</el-button>
        </el-form-item>
      </el-form>
      <el-table ref="deTable" :data="tableData" v-loading="tableLoading" :element-loading-text="$t('base.loadingData')" highlight-current-row max-height="400" style="width:100%;" row-key="id" @current-change="handleCurrentSelectionChange">
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('base.name')" min-width="50">
          <template slot-scope="scope">
            <span>{{scope.row.name == null || scope.row.name == "" ? scope.row.id : scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('id') >= 0" prop="id" label="ID" min-width="50">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('volume_type') >= 0" prop="volume_type" align="left" :label="$t('lang.type')" min-width="60">
          <template slot-scope="scope">
            <span v-html="volumeTypeRender(scope.row.volume_type, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" align="left" :label="$t('lang.status')" min-width="60">
          <template slot-scope="scope">
            <el-tag :type="statusTagRender(scope.row.status)">
              <span v-html="volumeStatusRender(scope.row.status, scope.row)"></span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('size') >= 0" prop="size" align="left" :label="$t('calcStorLang.volumeDiskSize')" min-width="60">
          <template slot-scope="scope">
            <span>{{scope.row.size}}</span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative;">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="refreshData">
            </el-button>
            <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
            <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
              </div>
            </el-popover>
          </el-col>
          <el-col :span="19">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
            <!-- <page :totalData="totalData" @getCurrentData="getCurrentData"></page> -->
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="visible=false">{{$t('base.cancel')}}</el-button>
        <el-button type="primary" @click="confirmFun">{{$t('base.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'SelectVolume',
  props: ['volproId'],
  data() {
    return {
      visible: false,
      desc: "asc",
      field: "name",
      formInline: {
        type: "",
        name: "",
        vId: "",
        volumeStatus: "",
        volumeType: ""
      },
      multipleSelection: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      tableData: [],
      totalData: [],
      volumeTypeList: [],
      tableLoading: false,
      columns: [{
        prop: "name",
        label: this.$t('base.name')
      }, {
        prop: "id",
        label: "ID"
      }, {
        prop: "volume_type",
        label: this.$t('lang.type')
      }, {
        prop: "status",
        label: this.$t('lang.status')
      }, {
        prop: "size",
        label: this.$t('calcStorLang.volumeDiskSize')
      }],
      pageSizes: [5, 10, 20, 30, 40, 60, 80, 100],
      sortObj: {
        sortOrder: "desc",
        sortField: "created_at"
      },
      columnsChecked: ["name", "id", "size", "volume_type", "status"],
      statusList: [
        { value: "available", label: this.$t("storage.available") },
        { value: "creating", label: this.$t("storage.creating") },
        { value: "in-use", label: this.$t("storage.inUsing") },
        { value: "reserved", label: this.$t("storage.reserved") },
        { value: "attaching", label: this.$t("storage.installing") },
        //{ value: "retyping", label: this.$t("storage.retyping") },
        { value: "detaching", label: this.$t("storage.uninstaling") },
        { value: "maintenance", label: this.$t("storage.migrationing") },
        { value: "deleting", label: this.$t("storage.deleting") },
        { value: "error", label: this.$t("storage.error") },
        { value: "extending", label: this.$t("storage.extendingStatus") },
        { value: "error_extending", label: this.$t("storage.extendingError") },
        { value: "error_restoring", label: this.$t("storage.bakRecoveryError") },
        { value: "error_deleting", label: this.$t("storage.errorDeleting") },
        { value: "soft_deleting", label: this.$t("storage.soft_deleting") },
        // { value: "soft_deleted", label: this.$t("storage.soft_deleted") },
        { value: "backing-up", label: this.$t("storage.backUping") },
        { value: "error-backing-up", label: this.$t("storage.backUPError") },
        { value: "restoring-backup", label: this.$t("storage.bakRecoverying") },
        { value: "downloading", label: this.$t("storage.downloadImaging") },
        { value: "uploading", label: this.$t("storage.uploadImaging") },
        { value: "awaiting-transfer", label: this.$t("storage.waitTransfering") },
        { value: "data-copying", label: this.$t("storage.dataCopying") },
        // { value: "removing", label: this.$t("storage.removing") },
        // { value: "unmanaging", label: this.$t("storage.removing") },
        { value: "reverting", label: this.$t("storage.reverting") }
      ]
    };
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    show() {
      document.getElementsByTagName("body")[0].focus();
      this.visible = true;
      this.currentPage = 1;
      this.loadVolumeType();
      this.getTableData();
    },
    async getTableData() {
      var self = this;
      var roleType = Vue.roleType + "";
      self.tableLoading = true;
      var sName = self.formInline.name;
      var sId = self.formInline.vId;
      var projectId = self.volproId;
      var queryVType = self.formInline.volumeType;
      var queryStatus = self.formInline.volumeStatus;
      let data = {
        limit: self.pageSize,
        with_count: "True",
        offset: self.pageSize * (self.currentPage - 1),
        sort_key: self.sortObj.sortField,
        sort_dir: self.sortObj.sortOrder,
        all_tenants: "True"
      };
      if ("" != sName) {
        data["name"] = sName;
      }
      if ("" != sId) {
        data["id"] = sId;
      }
      if ("" != projectId) {
        data["project_id"] = projectId;
      }
      if ("" != queryVType) {
        data["volume_type_id"] = queryVType;
      }
      if ("" != queryStatus) {
        data["status"] = queryStatus;
      }
      if (roleType == "3") {
        data["user_id"] = Vue.userId;
      }
      if ("0" == roleType) {
        data["all_tenants"] = "True";
      }
      data['soft_deleted'] = "False";
      let url = "api/cinderv3/v3/" + this.$cookie.get("pid") + "/inspur-volumes/detail?metadata={'store_image_data':'False'}&" + $.param(data);
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true,
          headers: {
            "OpenStack-API-Version": "volume 3.45"
          }
        });
        var list = result['volumes'];
        for (let v = 0; v < list.length; v++) {
          var vEntity = list[v];
          vEntity['name'] = vEntity['name'] || vEntity['id'];
        }
        self.tableData = list;
        self.total = result["count"];
        self.tableLoading = false;
      } catch (res) {
        self.tableLoading = false;
      }
    },
    async loadVolumeType() {
      var self = this;
      self.loading = true;
      // self.volumeTypeList = [];
      self.volumeTypeList = [{ name: "-", id: "None" }];
      var projectId = self.$cookie.get("pid");
      var url =
        "api/cinderv3/v3/" + self.$cookie.get("pid") + "/types?is_public=None";
      if ("2" == roleType || "3" == roleType) {
        //超级
        url = "api/cinderv3/v3/" + projectId + "/types";
      }
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: false
        });
        self.loading = false;
        //self.volumeTypeList.push({"name":"", "id":"0"});
        self.volumeTypeList = self.volumeTypeList.concat(
          result["volume_types"]
        );
      } catch (res) {
        self.loading = false;
      }
    },
    volumeTypeRender(value, rowData) {
      if ("" == value || null == value) {
        return "-";
      }
      return value;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTableData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getTableData();
    },
    refreshData() {
      this.multipleSelection = [];
      this.getTableData();
    },
    handleCurrentSelectionChange(val) {
      if (val == null) {
        this.multipleSelection = []
      } else {
        this.multipleSelection = [];
        this.multipleSelection.push(val);
      }
    },
    confirmFun() {
      if (this.multipleSelection.length == 0) {
        this.$message({
          message: Vue.t('calcStorLang.selectVolumeTip'),
          type: "warning"
        });
        return;
      }
      var labelShow = "";
      if (this.multipleSelection[0].name == "") {
        labelShow = this.multipleSelection[0].id;
      } else {
        labelShow = this.multipleSelection[0].name + " (" + this.multipleSelection[0].id + " )";
      }
      let allowStatus = ["in-use", "available"];
      if (allowStatus.indexOf(this.multipleSelection[0].status) < 0) {
        this.$message({
          type: "warning",
          message: this.$t('storage.volumeBakOnlyAvailInUse')
        });
        return;
      }
      this.multipleSelection[0].labelShow = labelShow;
      this.$emit('getSelectVolumes', this.multipleSelection[0]);
      this.$emit('getIncreVolumeHost', this.multipleSelection[0]);
      this.visible = false;
    },
    blurFun(key) {
      let num = 255;
      if (this.formInline[key].length > num) {
        this.formInline[key] = '';
        this.$message({
          message: Vue.t('base.ultraLong'),
          type: 'warning'
        });
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    statusTagRender(status) {
      if ("-" == status) {
        return "info";
      }
      if ("available" == status || "reserved" == status) {
        return "success";
      } else if ("deleting" == status) {
        return "gray";
      } else if (
        "creating" == status ||
        "attaching" == status ||
        "detaching" == status
      ) {
        return "";
      } else if (
        "error" == status ||
        "error_deleting" == status ||
        "error_extending" == status ||
        "ERROR" == status ||
        "UNKNOW" == status
      ) {
        return "danger";
      } else if (
        "in-use" == status ||
        "backing-up" == status ||
        "restoring-backup" == status
      ) {
        return "info";
      } else if ("maintenance" == status) {
        return "warning";
      } else if ("downloading" == status || "uploading" == status) {
        return "info";
      } else {
        return "";
      }
    },
    volumeStatusRender(value, rowData) {
      if (value != null) {
        let r = value;
        for (let i = 0; i < this.statusList.length; i++) {
          if (this.statusList[i].value == value) {
            r = this.statusList[i].label;
            break;
          }
        }
        return r;
      } else {
        return "-";
      }
    }
  }
}
</script>
<style>
.custom-dialog .el-dialog {
  width: 850px !important;
}
</style>
