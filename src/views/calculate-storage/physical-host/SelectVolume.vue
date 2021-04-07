<template>
  <div>
    <el-dialog :title="$t('calcStorLang.selectVolume')" :visible.sync="visible" class="custom-dialog" size="large">
      <el-form :inline="true" :model="formInline" class="form-inline">
        <el-form-item :label="$t('storage.shareType')">
          <el-select v-model="formInline.type" @change="getTableData" style="width:100px;">
            <el-option value="0" :label="$t('calcStorLang.DEVICE_MANAGEMENT_VOLUME_NOT_SHARED')"></el-option>
            <el-option value="1" :label="$t('calcStorLang.DEVICE_MANAGEMENT_VOLUME_SHARED')"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('base.name')">
          <el-input v-model="formInline.name" @blur="blurFun('name')" style="width:100px;"></el-input>
        </el-form-item>
        <el-form-item label="ID">
          <el-input v-model="formInline.vId" @blur="blurFun('id')" style="width:100px;"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.type')">
          <el-select v-model="formInline.volumeType" size="small" filterable clearable style="width:100px;">
            <el-option v-for="item in volumeTypeList" :value="item.id" :key="item.id" :label="item.name.length > 50?item.name.substring(0, 50):item.name" :title="item.name.length > 50?item.name:''">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.volumeDiskSize')">
          <el-input v-model="formInline.size" @blur="blurFun('size')" style="width:100px;"></el-input>
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
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
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
    props: ['hostEntity'],
    data() {
      return {
        volumeTypeList: [],
        roleType: Vue.roleType + '',
        visible: false,
        desc: "asc",
        field: "name",
        formInline: {
          type: "0",
          name: "",
          vId: "",
          size: "",
          volumeType: ""
        },
        multipleSelection: [],
        currentPage: 1,
        pageSize: 10,
        total: 0,
        tableData: [],
        totalData: [],
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
        statusList:[
          { id: "available", name: this.$t("storage.available") },
          { id: "creating", name: this.$t("storage.creating") },
          { id: "in-use", name: this.$t("storage.inUsing") },
          { id: "reserved", name: this.$t("storage.reserved") },
          { id: "attaching", name: this.$t("storage.installing") },
          { id: "retyping", name: this.$t("storage.retyping") },
          { id: "detaching", name: this.$t("storage.uninstaling") },
          { id: "maintenance", name: this.$t("storage.migrationing") },
          { id: "deleting", name: this.$t("storage.deleting") },
          { id: "error", name: this.$t("storage.error") },
          { id: "error_extending", name: this.$t("storage.extendingError") },
          { id: "error_restoring", name: this.$t("storage.bakRecoveryError") },
          { id: "error_deleting", name: this.$t("storage.errorDeleting") },
          { id: "backing-up", name: this.$t("storage.backUping") },
          { id: "error-backing-up", name: this.$t("storage.backUPError") },
          { id: "restoring-backup", name: this.$t("storage.bakRecoverying") },
          { id: "downloading", name: this.$t("storage.downloadImaging") },
          { id: "uploading", name: this.$t("storage.uploadImaging") },
          { id: "awaiting-transfer", name: this.$t("storage.waitTransfering") },
          { id: "removing", name: this.$t("storage.removing") },
          { id: "data-copying", name: this.$t("storage.dataCopying") }
        ]
      };
    },
    watch: {
    },
    mounted() {
      this.loadVolumeType();
    },
    methods: {
      async loadVolumeType() {
        const self = this;
        self.volumeTypeList = [{ name: "-", id: "None" }];
        let projectId = self.$cookie.get("pid");
        let url =
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
          self.volumeTypeList = self.volumeTypeList.concat(
            result["volume_types"]
          );
        } catch (res) {
        }
      },
      show() {
        document.getElementsByTagName("body")[0].focus();
        this.visible = true;
        this.currentPage = 1;
        this.formInline = {
          type: "0",
          name: "",
          vId: "",
          size: ""
        }
        this.getTableData();
      },
      async getTableData() {
        var self = this;
        var roleType = Vue.roleType + "";
        self.tableLoading = true;
        var sName = self.formInline.name;
        var sId = self.formInline.vId;
        var sSize = self.formInline.size;
        var projectId = self.hostEntity.tenant_id;
        let queryVType = self.formInline.volumeType;
        let data = {
          limit: self.pageSize,
          with_count: "True",
          offset: self.pageSize * (self.currentPage - 1),
          sort_key: self.sortObj.sortField,
          sort_dir: self.sortObj.sortOrder,
          all_tenants: "True",
          // storage_type: "iscsi",
          encryption_key_id: "None"
        };
        data['soft_deleted'] = "False";
        if (queryVType) {
          data["volume_type_id"] = queryVType;
        }
        if (self.formInline.type == "0") { //非共享
            data["status"] = "available";
            data["multiattach"] = false;
        } else { //共享
          data["multiattach"] = true;
        }
        if ("" != sName) {
          data["name"] = sName;
        }
        if ("" != sId) {
          data["id"] = sId;
        }
        if ("" != sSize) {
          data["size"] = sSize;
        }
        if ("" != projectId) {
          data["project_id"] = projectId;
        }
        if (roleType == "3") {
          data["user_id"] = Vue.userId;
        }
        let url = "api/cinderv3/v3/" + self.$cookie.get("pid") + "/inspur-volumes/detail?metadata={'store_image_data':'False'}&" + $.param(data);
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
        if (this.formInline.type == "1") {
          let allowStatus = ["in-use", "available"];
          if (allowStatus.indexOf(this.multipleSelection[0].status) < 0) {
            this.$message({
              type:"warning",
              message:"只能挂载可用或正在使用状态的共享云硬盘！"
            });
            return;
          }
        }
        this.$emit('getSelectVolumes', this.multipleSelection[0].id, labelShow);
        this.visible = false;
      },
      blurFun(key) {
        let num = 255;
        if (!key) return;
        if (this.formInline[key].length > num) {
          this.formInline[key] = '';
          this.$notify({
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
            if (this.statusList[i].id == value) {
              r = this.statusList[i].name;
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
    width: 1000px !important;
  }
</style>
