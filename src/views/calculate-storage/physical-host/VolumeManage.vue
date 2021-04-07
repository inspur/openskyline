<template>
<div>
  <el-dialog :title="$t('network.volumeMountOrUnmountToInst')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="editInstanceForm" label-width="100px" v-loading="loading" :element-loading-text="loadingText">
      <el-form-item :label="$t('calcStorLang.volumeAvailableDisk')" class="is-required" prop="name">
        <el-input auto-complete="off" class="col-10" :icon="close" :on-icon-click="onIconClick" @focus="selectVolume" v-model="volumeLabel"  :placeholder="$t('calcStorLang.pleaseChoose')"></el-input>
        <el-button type="primary" icon='fa-plus' size="small" @click="mountVolume">{{$t('calcStorLang.volumeMount')}}</el-button>
        <el-button type="primary" size="small" icon='fa-plus' @click="showCreateVolumeDialog();" v-if="roleType !== '3'">{{ $t('calcStorLang.CREATE_AND_ATTACH_VOLUME_BUTTON') }}</el-button>
        <el-tooltip placement="top" trigger="hover" :content="$t('baremachine.MOUNT_VOLUME_TIP')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.volumeMountDisk')" class="">
        <el-table ref="umTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="id" @selection-change="handleSelectionChange">
          <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" min-width="110">
            <template slot-scope="scope">
              <span v-html="nameRender(scope.row.name, scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('size') >= 0" prop="size" :label="$t('calcStorLang.volumeDiskSize')">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" :label="$t('calcStorLang.status')" min-width="60" align="left">
            <template slot-scope="scope">
              <span v-html="statusRender(scope.row.status, scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('type') >= 0" prop="type" :label="$t('calcStorLang.type')" min-width="60" align="left">
            <template slot-scope="scope">
              <span v-html="typeRender(scope.row.size, scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('operate') >= 0" prop="status" :label="$t('calcStorLang.instOperate')" min-width="50">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="handleClick(scope.row)">{{$t('calcStorLang.voluemUnmount')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="onRefresh">
              </el-button>
              <el-popover placement="right" trigger="click">
                <el-checkbox-group class="vertical" v-model="columnsChecked">
                  <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                  </el-checkbox>
                </el-checkbox-group>
                <div slot="reference" class="name-wrapper">
                  <el-tag>{{$t('network.columnSelected')}}</el-tag>
                </div>
              </el-popover>
            </el-col>
            <el-col :span="19">
              <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
            </el-col>
          </el-row>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
  <create-volume
    ref="createVolume"
    v-if="createVolumeDialog.visible"
    @close="createVolumeDialog.visible = false"
    @done="handleCreateVolumeDone"
    :projectId="createVolumeDialog.projectId"
    :userId="createVolumeDialog.userId"
    :az="createVolumeDialog.az"
    :instanceId="createVolumeDialog.instanceId"
    :instanceName="createVolumeDialog.instanceName"
  />
  <select-volume ref="selectVolume"  v-if="selVolumeFlg" @close="selVolumeFlg = false" @refresh="onRefresh()" @getSelectVolumes="getSelectVolumes" :hostEntity="selVolumeEntity"></select-volume>
</div>
</template>
<script>
import CreateEmptyVolumeAutoAttach from './CreateEmptyVolumeAutoAttach';
import SelectVolume from './SelectVolume';
export default {
  name: 'LoadDisk',
  components: {
    'create-volume': CreateEmptyVolumeAutoAttach,
    SelectVolume
  },
  props: ['hostEntity', 'volumeMaps'],
  data() {
    return {
      roleType: Vue.roleType + '',
      currentPage: 1,
      loading: false,
      loadingText: Vue.t('calcStorLang.dataLoading'),
      reloadTblFlag: false,
      volumeOptions: '',
      volumeLabel: '',
      volumeMap: new Map(),
      volume: '',
      close: "",
      selVolumeEntity:this.hostEntity,
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "size",
        label: Vue.t('calcStorLang.volumeDiskSize')
      }, {
        prop: "status",
        label: Vue.t('calcStorLang.status')
      }, {
        prop: "type",
        label: Vue.t('calcStorLang.type')
      }, {
        prop: "operate",
        label: Vue.t('calcStorLang.instOperate')
      }],
      columnsChecked: ['name', 'size', 'type', 'status', 'operate'],
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
      handler: function(list) {
        var self = this;
        self.reloadTblFlag = false;
        if (list != null) {
          for (var t = 0; t < list.length; t++) {
            var obj = list[t];
            let volumeId = obj.volumeId;
            var entity = self.volumeMap.get(volumeId);
            if (entity != null && entity['status'] != null && (entity['status'] == "detaching" || entity['status'] == "available" || entity['status'] == "attaching" || entity['status'] == "mounting" || entity['status'] == "uninstall")) {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.interVolumeValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interVolumeValid = setInterval(() => {
              this.onRefresh()
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
    var self = this;
    self.initDialog();
    Promise.all([self.getData()]).then(function(result) {
      self.loadAllVolumeList();
    });
    self.loadMountList();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    selectVolume() {
      this.handleVolumeShow();
      // if (Vue.roleType + "" == "0") {
      // }
    },
    onIconClick() {
      this.projectCreateForm.projectList = '';
      this.projectCreateForm.projectId = '';
      this.projectCreateForm.projectName = '';
      this.close = '';
    },
    unitVolumeInfo(name, id, key) {
      var titleMsg = name + "(" + id + ")";
      var results = "";
      if (titleMsg.length > 80) {
        if (key != null && key == "title") {
           results = titleMsg;
        } else {
           results = titleMsg.substring(0, 80) + "...";
        }
      } else {
         results = titleMsg;
      }
      return results;
    },
    volumeChange(item) {
      var volumeObj = this.volumeMap.get(item);
      if (volumeObj.name == null || volumeObj.name == "") {
         this.volumeLabel = volumeObj.id;
      } else {
         this.volumeLabel = volumeObj.name + " (" + volumeObj.id + ")";
      }
    },
    async getData() {
      var self = this;
      var url = "api/nova/v2.1/servers/" + self.hostEntity.id + "/os-volume_attachments";
      // self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        var rList = result['volumeAttachments'];
        var results = [];
        if (rList != null && rList.length > 0) {
        for (let r = 0; r < rList.length; r++) {
          var obj = rList[r];
          var entity = self.volumeMap.get(obj.id);
          if (entity != null) {
            obj.status = entity.status;
            obj.size = entity.size;
            obj.type = entity['volume_type'];
          } else {
            obj.status = "";
            obj.size = "";
            obj.type = "";
          }
          results.push(obj);
        }
      }
        // self.loading = false;
        self.totalData = results;
      } catch (res) {
        self.loading = false;
      }
      // self.totalData = self.hostEntity['os-extended-volumes:volumes_attached'];
    },
    async loadAllVolumeList() {
      var self = this;
      var projectId = self.hostEntity.tenant_id;
      var url = "api/cinderv3/v3/" + self.$cookie.get("pid") + "/volumes/detail?all_tenants=True&limit=99999&project_id=" + projectId;
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
          vList[v].type = entity['volume_type'] || "-";
        }
      } catch (res) {
      }
    },
    async loadMountList() {
      var self = this;
      var projectId = self.hostEntity.tenant_id;
      var url = "api/cinderv3/v3/" + self.$cookie.get("pid") + "/volumes/detail?all_tenants=True&status='available'&project_id=" + projectId;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.volumeOptions = result['volumes'];
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    async mountVolume() {
      var self = this;
      if (self.volume == "") {
        self.$message({
          showClose: true,
          message: Vue.t('calcStorLang.volumeMountTip'),
          type: 'warning'
        });
        return;
      } else {
        self.loading = true;
        var body = { "volumeAttachment": { "volumeId": self.volume } };
        body = JSON.stringify(body);
        try {
          let result = await self.$ajax({
            type: 'post',
            url: "api/nova/v2.1/servers-inspur/" + self.hostEntity.id + "/os-inspur-volume_attachments",
            data: body,
            headers:{
              "Openstack-Api-Version":"compute 2.65"
            },
            showErrMsg: true,
            log: {
              description: {
                en: "Physical " + self.hostEntity['name'] + " mount disk:" + self.volumeLabel,
                zh_cn: "云物理机" + self.hostEntity['name'] + " 挂载云硬盘:" + self.volumeLabel + "请求已发送"
              },
              target: Vue.logTarget.computePhysical
            },
            successFun: function(data) {
              self.$message({
                showClose: true,
                message: Vue.t('calcStorLang.volumeMountSendSuccess'),
                type: 'info'
              });
              var mountEntity = self.volumeMap.get(self.volume);
              if (mountEntity != null) {
                mountEntity.status = "mounting";
              }
              self.getData();
              self.loadMountList();
              self.loading = false;
            },
            errFun: function() {
              self.loading = false;
            }
          });
          self.volume = "";
          self.volumeLabel = "";
        } catch (res) {
          self.loading = false;
        }
      }
    },
    getSelectVolumes(id, name) {
       var self = this;
       self.volume = id;
       self.volumeLabel = name;
    },
    handleVolumeShow() {
      this.selVolumeFlg = true;
      this.$nextTick(() => {
        this.$refs.selectVolume.show();
      });
    },
    handleCancel() {
      this.$emit("handleVolumeFlag");
    },
    handleClose(done) {
      this.$emit("handleVolumeFlag");
      done();
    },
    async handleClick(entity) {
      var self = this;
      var volumeId = entity.volumeId;
      if (self.volumeMap.get(volumeId).status != "in-use") {
          self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.volumeUnMountTip'),
              type: 'warning'
            });
          return;
      }
      let volList = self.hostEntity["os-extended-volumes-inspur:volumes_attached"];
      let isroot = false;
      for (let i=0; i<volList.length; i++) {
        if (volList[i].id == entity.volumeId) {
          isroot = volList[i].boot_disk;
          break;
        }
      }
      if (isroot) {
        self.$message({
          showClose: true,
          message: Vue.t('storage.rootDiskDeleteTip'),
          type: 'warning'
        });
        return;
      }
      var url = "api/nova/v2.1/servers/" + self.hostEntity.id + "/os-volume_attachments/" + entity.id;
      // self.loading = true;
      var logVolumeEntity = self.volumeMap.get(volumeId);
      var logVolumeName = "";
      if (logVolumeEntity.name == null || logVolumeEntity.name == "") {
         logVolumeName = logVolumeEntity.id;
      } else {
         logVolumeName = logVolumeEntity.name + " (" +logVolumeEntity.id + ")";
      }
      logVolumeEntity.status = "uninstall";
      try {
        let result = await self.$ajax({
          type: 'delete',
          url: url,
          showErrMsg: true,
          log: {
              description: {
                en: "Physical " + self.hostEntity['name'] + " unmount disk:" + logVolumeName,
                zh_cn: "云物理机" + self.hostEntity['name'] + " 卸载云硬盘:" + logVolumeName
              },
              target: Vue.logTarget.computePhysical
          },
          successFun: function(data) {
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.volumeUnMountSuccess'),
              type: 'info'
            });
            self.getData();
            self.loadMountList();
          },
          errFun: function() {
            self.loading = false;
          }
        });
      } catch (res) {}
    },
    async confirmAddDisk() {
      var self = this;
      if (self.multipleSelection.length === 0) {
        self.$message({
          showClose: true,
          message: Vue.t('calcStorLang.volumeMountTip'),
          type: 'warning'
        });
      } else {
        var url = "api/cinderv3/v3/" + self.$cookie.get("pid") + "/volumes/" + Vue.userId + "/action";
        self.loading = true;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: url,
            showErrMsg: true
          });
          self.totalData = result['servers'];
          self.total = result['servers'].length;
          self.loading = false;
          self.$emit("handleFlag", {});
          self.$message(Vue.t('calcStorLang.volumeMountSuccess'));
        } catch (res) {
          self.loading = false;
        }
      }
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
    nameRender(value, row) {
      const $this = this;
      const id = row.volumeId;
      let name = $this.volumeMap.has(id) ? $this.volumeMap.get(id).name : '-'
      return name;
    },
    statusRender(value, rowData) {
      var self = this;
      var entity = self.volumeMap.get(rowData['volumeId']) || "";
      if ("" == value) {
        return '-';
      } else {
        var statusLabel = self.volumeStatusRender(entity.status);
        return statusLabel;
      }
    },
    sizeRender(value, rowData) {
      var self = this;
      var entity = self.volumeMap.get(rowData['volumeId']) || "";
      if ("" == entity) {
        return '-';
      } else {
        return entity.size;
      }
    },
    typeRender(value, rowData) {
      var self = this;
      var entity = self.volumeMap.get(rowData['volumeId']) || "";
      if ("" == entity) {
        return '-';
      } else {
        return entity['volume_type'] || "-";
      }
    },
    volumeStatusRender(value, rowData) {
      if ("available" == value) {
        return this.$t('calcStorLang.active');
      } else if ("creating" == value) {
        return this.$t('calcStorLang.volumeCreating');
      } else if ("in-use" == value) {
        return this.$t('calcStorLang.volumeUsing');
      } else if ("reserved" == value) {
        return this.$t('calcStorLang.volumeReserved');
      } else if ("attaching" == value) {
        return this.$t('calcStorLang.volumeAttaching');
      } else if ("detaching" == value) {
        return this.$t('calcStorLang.volumeDetaching');
      } else if ("maintenance" == value) {
        return this.$t('calcStorLang.volumeMaintenance');
      } else if ("deleting" == value) {
        return this.$t('calcStorLang.volumeDeleting');
      } else if ("error" == value) {
        return this.$t('calcStorLang.error');
      } else if ("error_deleting" == value) {
        return value
      } else if ("backing-up" == value) {
        return this.$t('calcStorLang.volumeBacking');
      } else if ("restoring-backup" == value) {
        return value;
      } else if ("mounting" == value) {
        return this.$t('calcStorLang.instVolumeMounting');
      } else if ("uninstall" == value) {
        return this.$t('calcStorLang.instVolumeUninstall');
      } else {
        if (value != null) {
          return value;
        } else {
          return '-';
        }
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      var self = this;
      Promise.all([self.getData()]).then(function(result) {
        self.loadAllVolumeList();
      });
    },
    showCreateVolumeDialog() {
      this.createVolumeDialog.projectId = this.hostEntity.tenant_id;
      this.createVolumeDialog.userId = this.hostEntity.user_id;
      this.createVolumeDialog.az = this.hostEntity['OS-EXT-AZ:availability_zone'];
      this.createVolumeDialog.instanceId = this.hostEntity.id;
      this.createVolumeDialog.instanceName = this.hostEntity.name;
      this.createVolumeDialog.visible = true;
    },
    async handleCreateVolumeDone(id) {
      this.createVolumeDialog.visible = false;
      await this.loadAllVolumeList();
      this.volumeMap.get(id).status = 'mounting';
      await this.getData();
    }
  }
}

</script>
<style scoped>


</style>
