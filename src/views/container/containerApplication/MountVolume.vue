<template>
  <el2-dialog
    :title="$t('container.deviceConnect')"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    width="60%">
    <div>
    <div>
      <el-form ref="editInstanceForm" label-width="80px" label-position="right" v-loading="loading" :element-loading-text="loadingText">
        <el-form-item :label="$t('container.mountVolume')" prop="name">
          <el-button type="primary" icon='fa-plus' size="small" @click="mountVolume">{{$t('calcStorLang.volumeMount')}}</el-button>
        </el-form-item>
        <el-form-item :label="$t('container.mountedVolumeList')" class="">
          <el-table ref="umTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="id" @selection-change="handleSelectionChange">
            <el-table-column v-if="columnsChecked.indexOf('volume_name') >= 0" prop="volume_name" :label="$t('lang.name')" min-width="80" align="left">
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('volume_size') >= 0" prop="volume_size" :label="$t('container.volumeSizeGB')" min-width="70" align="left">
              <template slot-scope="scope">
                <span>{{sizeRender(scope.row.volume_size)}}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('volume_status') >= 0" prop="volume_status" :label="$t('lang.status')" min-width="60" align="left">
              <template slot-scope="scope">
                <el-tag :type="statusTagRender(scope.row.volume_status, scope.row)">
                  <span>{{statusToCH(scope.row.volume_status, scope.row)}}</span>
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('mount_status') >= 0"
              prop="mount_status"
              :label="$t('container.mountstatus')"
              show-overflow-tooltip
              align="left"
              min-width="80">
              <template slot-scope="scope">
                <el-tag :type="statusTagRender(scope.row.mount_status, scope.row)">
                  <span>{{mountstatusToCH(scope.row.mount_status, scope.row)}}</span>
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('operate') >= 0" prop="status" :label="$t('calcStorLang.instOperate')" min-width="50">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="unmountVolume(scope.row)" :disabled="scope.row.mount_status !='mounted' || scope.row.volume_status !='Bound'">{{$t('calcStorLang.voluemUnmount')}}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin: 10px 0; position: relative">
            <el-row>
              <el-col :span="5">
                <el-button type="text" icon="fa-refresh" @click="onRefresh">
                </el-button>
              </el-col>
              <el-col :span="19">
                <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
              </el-col>
            </el-row>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <select-volume
      ref="selectVolume"
      v-if="selVolumeFlg"
      @close="selVolumeFlg = false"
      @refreshData="getVolumeData()"
      @handleVolumeShow="handleVolumeShow"
      :selVolumeEntity="selVolumeEntity"
    />
  </div>
  </el2-dialog>
</template>
<script>
import SelectVolume from './SelectVolume';
import uuid from 'uuid';
export default {
  name: "MountVolume",
  components: {
    SelectVolume
  },
  props:["selectedRowData"],
  data() {
    return {
      roleType: Vue.roleType + '',
      loading: false,
      loadingText: Vue.t('calcStorLang.dataLoading'),
      reloadTblFlag: false,
      volumeOptions: '',
      volumeLabel: '',
      volumeMap: new Map(),
      volume: '',
      close: "",
      selVolumeEntity:this.selectedRowData,
      columns: [{
        prop: "volume_name",
        label: Vue.t('lang.name')
      }, {
        prop: "volume_size",
        label: Vue.t('container.volumeSizeGB')
      }, {
        prop: "volume_status",
        label: Vue.t('calcStorLang.status')
      }, {
        prop: "mount_status",
        label: Vue.t('container.mountstatus')
      }, {
        prop: "operate",
        label: Vue.t('calcStorLang.instOperate')
      }],
      columnsChecked: ['volume_name', 'volume_size', 'volume_status', 'mount_status', 'operate'],
      tableData: [],
      totalData: [],
      multipleSelection: [],
      dialogVisible: false,
      selVolumeFlg: false,
      createVolumeDialog: {
        visible: false,
        projectId: '',
        userId: '',
        az: '',
        instanceId: '',
        instanceName: ''
      }
    }
  },
  watch: {
     tableData: {
      immediate: false,
      handler: function(dataList) {
        var self = this;
        self.reloadTblFlag = false;
        if (dataList.length > 0) {
          // for (let i=0; i<dataList.length; i++) {
          //   let rowData = dataList[i];
          //   if (rowData["volume_status"] != "Bound" || rowData["mount_status"]=="operating") {
          //     self.reloadTblFlag = true;
          //   }
          // }
          self.reloadTblFlag = true;
        }
        clearInterval(self.interVolumeValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interVolumeValid = setInterval(() => {
              this.getVolumeData(true)
            }, 8000);
        }
      }
     }
  },
  beforeDestroy() {
    if (this.interVolumeValid != null) {
      clearInterval(this.interVolumeValid);
    }
  },
  mounted() {
    let self = this;
    self.initDialog();
    self.getVolumeData()
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
    },
    async getVolumeData(isInterval = false) {
      let self = this;
      let url = "api/cetus/v1/storage/list_volumes_by_app";
      let attachParams = {
        "app_name": self.selectedRowData.name,
        "app_type": self.selectedRowData.type,
        "rancher_cluster_id": self.selectedRowData.rancher_cluster_id,
        "user_id":  self.selectedRowData.namespace
      };
      try {
        if (!isInterval) {
          self.loading = true;
        }
        let result = await self.$ajax({
          type: 'post',
          url: url,
          data:JSON.stringify(attachParams)
        });
        self.loading = false;
        let rList = result['volumes'];
        let dataList = [];
        for (let i=0; i<rList.length; i++) {
          let volume = rList[i];
          dataList.push(volume);
        }
        self.totalData = dataList;
      } catch (res) {
      }
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      var self = this;
      self.dialogVisible = false;
      this.$emit("handleAddShow", {});
    },
    mountVolume() {
      this.selVolumeFlg = true;
      this.$nextTick(() => {
        this.$refs.selectVolume.show();
      });
    },
    async loadAllVolumeList() {
      var self = this;
      var projectId = self.hostEntity.tenant_id;
      // self.volumeMap.clear();
      var url = "api/cinderv3/v3/" + self.$cookie.get("pid") + "/volumes/detail?all_tenants=True&limit=99999&project_id=" + projectId;
      // self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        var list = result['volumes'];
        self.volumeMap.clear();
        for (let j = 0; j < list.length; j++) {
          var obj = list[j];
          if (obj.name === undefined || obj.name === '' || obj.name === null) {
            obj.name = obj.id;
          }
          self.volumeMap.set(obj.id, obj);
        }
        var vList = self.totalData;
        for (let v = 0; v < vList.length; v++) {
          var vId = vList[v].volumeId;
          var entity = self.volumeMap.get(vId);
          vList[v].size = entity.size || "-";
          vList[v].status = entity.status;
        }
        // self.loading = false;
      } catch (res) {
        // self.loading = false;
      }
    },
    async loadMountList() {
      var self = this;
      var projectId = self.hostEntity.tenant_id;
      var url = "api/cinderv3/v3/" + self.$cookie.get("pid") + "/volumes/detail?all_tenants=True&status='available'&project_id=" + projectId;
      // self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        /*var list = result['volumes'];
        var rets = [];
        for (var v = 0; v < list.length; v++) {
          var vObj = list[v];
          if (vObj.status == "available") {
            rets.push(vObj);
          }
        }*/
        self.volumeOptions = result['volumes'];
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    handleVolumeShow() {
      this.selVolumeFlg = false;
      this.$emit("refreshData", {});
    },
    handleCancel() {
      this.$emit("handleVolumeFlag");
    },
    async unmountVolume(row) { //
      this.$confirm(this.$t('container.detachVolumeConfirmMsg'), this.$t('lang.confirm'), {
        confirmButtonText: this.$t('lang.confirm'),
        cancelButtonText: this.$t('lang.cancel'),
        type: 'warning'
      }).then(() => {
        let self = this;
        let attachParams = {
          "app_name": row["mount_info"]["app_name"],
          // "app_type": self.selectedRowData.type,
          "rancher_cluster_id": self.selectedRowData.rancher_cluster_id,
          "user_id": row['user_id'],
          "volume_name": row["volume_name"]
        };
        let traceId = 'req-'+uuid.v1();
        let reponse = this.$ajax({
          type: 'post',
          url: "api/cetus/v1/storage/detach_volume",
          data: JSON.stringify(attachParams),
          headers: {
            'X-Openstack-Request-Id': traceId
          },
          // successMsg:this.$t('container.detachSuccessMsg'),
          successFun:(response) => {
            if (response.result == "success") {
              self.$recordLog({
                target: Vue.logTarget.applicationManage,
                level: {
                  en: "info",
                  zh_cn: "信息"
                },
                description: {
                  en: "Unmount container volume:" + row["volume_name"],
                  zh_cn: "容器卷:" + row["volume_name"] + "从应用:"+row["mount_info"]["app_name"] + "卸载"
                },
                trace_id: traceId
              });
              self.$notify({
                message: self.$t('container.detachSuccessMsg'),
                type: "success"
              });
              self.getVolumeData(true);
            } else {
              self.$recordLog({
                target: Vue.logTarget.applicationManage,
                level: {
                  en:"error",
                  zh_cn:"错误"
                },
                description: {
                  en: "Unmount container volume:" + row["volume_name"]+response.result,
                  zh_cn: "容器卷:" + row["volume_name"] + "从应用:"+row["mount_info"]["app_name"] + "卸载错误："+response.result
                },
                trace_id: traceId
              });
              self.$notify({
                message: response.result,
                type: "error"
              });
            }
          }
        });
      }).catch(() => {});
    },
    async reloadVolumeStatus(id) {
      var self = this;
      var projectId = self.hostEntity.tenant_id;
      var url = "api/cinderv3/v3/" + self.$cookie.get("pid") + "/volumes/" + id;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        var volume = result['volume'];
        var entity = self.volumeMap.get(id);
        entity.status = volume['status'];
      } catch (res) {
      }
    },
    sizeRender(size) {
      return size.substring(0, size.length -2 );
    },
    statusToCH(status, row) {
      if (status == "Bound") {
        return this.$t('opt.usable');
      } else {
        return this.$t('container.processing');
      }
    },
    mountstatusToCH(status, row) {
      if (status == "unmounted") {
        return this.$t('container.unmounted');
      } else if (status == "mounted") {
        return this.$t('container.attached');
      } else if (status=="operating") {
        return this.$t('container.processing');
      } else {
        return status;
      }
    },
    statusTagRender(status, row) {
      if (status == "unmounted" || status=="Bound") {
        return 'info';
      } else if (status == "mounted") {
        return 'success';
      } else {
        return 'info';
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.getVolumeData()
    }
  }
}
</script>

