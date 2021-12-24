<template>
  <div>
    <el-dialog :title="$t('storage.createvolumeBak')" :visible.sync="visible" :before-close="cancelFun" v-dialogDrag>
      <el-row type="flex" :gutter="20">
        <el-col :span="14">
          <el-form ref="volumeBakForm" :model="volumeBak" label-width="100px" :rules="rules" label-position="left" class="me-required-form">
            <el-form-item :label="$t('lang.project')" prop="projectName" class="is-required" v-if="projectFlag">
              <el-input auto-complete="off" icon="" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="projectName" class="col-20"></el-input>
            </el-form-item>
            <el-form-item :label="$t('calcStorLang.fvolume')" prop="volume" class="is-required" v-if="volumeFlag">
              <el-input auto-complete="off" class="col-20" :on-icon-click="onvolIconClick" @focus="handleVolumeShow" v-model="volumeBak.volume" :placeholder="$t('calcStorLang.pleaseChoose')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
              <el-input class="col-20" v-model="volumeBak.name" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item :label="$t('lang.type')" class="is-required" prop="net">
              <el-radio-group v-model="volumeBak.bakType" @change="getIncreVolumeHost">
                <el-radio name="alRadio" class="radio" label="false">{{$t('storage.allBackUp')}}</el-radio>
                <el-radio name="inRadio" class="radio" label="true">{{$t('storage.increaseBackUp')}}</el-radio>
              </el-radio-group>
              <el-tooltip placement="top" trigger="hover">
                 <div slot="content">{{$t('storage.inBakMustAfterAllBak')}}<br/>{{ $t('storage.inBakMustAfterAllBak2') }}</div>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('lang.desc')" prop="description">
              <el-input class="col-20" v-model="volumeBak.description" @keydown.native="noEnter($event)" auto-complete="off" type="textarea"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="10">
          <el-form>
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <thead>
                  <tr class="even">
                    <th class="is-left is-leaf">
                      <el-tag type="primary">{{$t('calcStorLang.objectNum')}}</el-tag>
                    </th>
                    <th class="is-left is-leaf"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="even">
                    <th class="idatath">{{$t('base.cloudHardDiskBakNum')}}：</th>
                    <td class="idatatd">{{cloudDiskBakNum}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('base.cloudDiskAndBakSizeNum')}}：</th>
                    <td class="idatatd">{{cloudDiskBakSize}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-form>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelFun" :disabled="isDisabled">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" @click="confirmFun" :loading="isDisabled">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
    <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
    <select-volume ref="selectVolume" v-if="selVolumeFlg" @getSelectVolumes="getSelectVolumes" :volproId="volproId"></select-volume>
  </div>
</template>
<script>
import SelectVolume from './SelectVolume';
export default {
  name: "volumeBak",
  components: {
    SelectVolume
  },
  props: ["vId", "vStatus", "detailVolume"],
  data() {
    return {
      volumeBak: {
        name: "",
        description: "",
        bakType: "false",
        volume: "",
        target_host: ""
      },
      hostOptions: [],
      increHostFlag: false,
      cloudDiskBakNum: "-",
      cloudDiskBakSize: "-",
      freeCount: 0,
      freeSize: 0,
      visible: true,
      isDisabled: false,
      selVolumeFlg: false,
      selProjectFlg: false,
      projectFlag: false,
      volumeFlag: false,
      roleType: Vue.roleType + "",
      projectList: '',
      projectName: '',
      volproId: "",
      volumeId: '',
      volumesOptions: [],
      detailBakVolume: {},
      rules: {
        projectName: [{ type: 'required', trigger: 'blur change' }],
        volume: [{ type: 'required', trigger: 'blur change' }],
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 255 },
          { type: 'onlyLetter_NumberChinese' }
        ],
        bakType: [
          { type: 'required' }
        ],
        host: [{ type: 'required', trigger: 'blur change' }],
        description: [
          { type: 'maxSize', value: 255 }
        ]
      }
    }
  },
  mounted() {
    if (this.vId) {
      this.volumeId = this.vId;
    }
    if (!this.vId && this.roleType != '2') {
      this.projectFlag = true;
    }
    if (!this.vId) {
      this.volumeFlag = true;
    }
    this.getCountValue();
    if (!this.vId && this.roleType == '2') {
      this.projectList = this.$cookie.get('pid');
      this.getVolumesOptions();
    }
    this.loadHostList();
  },
  methods: {
    async loadHostList() {
      let self = this;
      self.hostOptions = [];
      self.loading = true;
      let projectId = self.$cookie.get("pid");
      let url = "api/cinderv3/v3/" + self.$cookie.get("pid") + "/os-services?binary=cinder-backup";
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: false
        });
        self.loading = false;
        let hosts = result.services;
        if (result.services.length>0) {
          for (var i = 0; i < hosts.length; i++) {
            let host = hosts[i];
            if (host["state"] === "up") {
              self.hostOptions.push(host);
            }
          }
          self.volumeBak.target_host = self.hostOptions[0].host;
        }
      } catch (res) {
        self.loading = false;
      }
    },
    async getIncreVolumeHost () {
      let self = this;
      if (self.volumeBak.bakType === "true") {
        self.hostOptions = [];
        let projectId = this.$cookie.get('pid');
        let selectProjectId = this.projectList;
        let volumeId = self.detailVolume["id"];
        let metadata = JSON.stringify({"is_incremental": "True"});
        var roleType = Vue.roleType + "";
        var url = "";
        if ("2" === roleType || "3" === roleType) {
          url = "api/cinderv3/v3/" + projectId + "/backups/detail?volume_id=" + volumeId + "&with_count=True&metadata=" +metadata+"&limit=1";
        } else {
          url = "api/cinderv3/v3/" + projectId + "/backups/detail?all_tenants=True&volume_id=" + volumeId + "&with_count=True&metadata=" +metadata+"&limit=1";
        }
        try {
          let ret = await this.$ajax({
            type: 'get',
            url: url,
            headers: {
              "OpenStack-API-Version": "volume 3.45"
            }
          });
          if (ret.backups.length>0) {
            let increVolum = ret.backups[0];
            self.increHostFlag = true;
            self.hostOptions.push(increVolum);
            self.volumeBak.target_host = self.hostOptions[0].host;
          } else {
            self.loadHostList();
          }
        } catch (data) {
          self.loading = false;
        }
      } else {
        self.increHostFlag = false;
        self.loadHostList();
      }
    },
    isIncremental() {
      if (this.volumeBak.bakType === "true") {
        return true;
      } else {
        return false;
      }
    },
    noEnter(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        return false;
      }
    },
    onIconClick() {
      this.projectList = "";
      this.projectName = "";
      this.onvolIconClick();
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.projectList = id;
      this.projectName = name;
      this.projectChange();
      this.getCountValue();
    },
    projectChange() {
      var selectProjectId = this.projectList;
      if (typeof (selectProjectId) == "undefined" || null == selectProjectId || '' == selectProjectId) {
        return;
      }
      var roleType = Vue.roleType + "";
      var self = this;
      this.getVolumesOptions();
    },
    getSelectVolumes(vol) {
      this.volumeId = vol.id;
      this.volumeBak.volume = vol.labelShow;
      this.detailBakVolume.size = vol.size;
      this.detailBakVolume.id = vol.id;
      this.detailBakVolume.name = vol.name;
      this.detailBakVolume.status = vol.status;
    },
    handleVolumeShow() {
      this.selVolumeFlg = true;
      if (this.projectFlag) {
        if (this.projectList == "") {
          this.$message({
            type: "warning",
            message: this.$t('base.selectProject')
          });
          return;
        }
        this.volproId = this.projectList;
      } else {
        this.volproId = this.$cookie.get('pid');
      }
      this.$nextTick(() => {
        this.$refs.selectVolume.show();
      });
    },
    onvolIconClick() {
      this.volumeId = "";
      this.volumeBak.volume = "";
      this.close = '';
    },
    async getVolumesOptions() {
      var self = this;
      var resultData = [];
      var projectId = this.$cookie.get('pid');
      var selectProjectId = this.projectList;
      var url = "api/cinderv3/v3/" + projectId + "/volumes/detail?project_id=" + selectProjectId + "&all_tenants=True";
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: url,
          headers: {
            "OpenStack-API-Version": "volume 3.45"
          }
        });
        let volumes = ret.volumes;
        for (var i = 0; i < volumes.length; i++) {
          let volume = volumes[i];
          let status = volume['status'];
          if (status == "available" || status == "in-use") {
            let volId = volume['id'];
            var vtname = volume['name'];
            if (typeof (volume['name']) == "undefined" || vtname == "" || null == vtname) {
              vtname = volId;
            }
            let size = volume['size'];
            resultData.push({
              id: volId,
              name: vtname,
              size: '(' + size + ' GB)',
              sizeGB: size,
              status: status
            });
          }
        }
        self.volumesOptions = resultData;
      } catch (data) {
        self.loading = false;
      }
    },
    confirmFun() {
      this.$refs.volumeBakForm.validate(async (valid) => {
        if (valid) {
          //判断是否满足条件
          let self = this;
          if (self.detailVolume) {
            self.detailBakVolume.size = self.detailVolume.size
            self.detailBakVolume.id = self.detailVolume.id
            self.detailBakVolume.name = self.detailVolume.name
          }
          if (self.vStatus) {
            self.detailBakVolume.status = self.vStatus
          }
          if (self.freeSize != -1) {
            if (self.freeSize < self.detailBakVolume.size) {
              //配额容量不足
              self.$message({
                showClose: true,
                message: Vue.t('storage.capabilityNotEnough'),
                type: 'warning'
              });
              // self.$emit("handlerBak", {});
              return false;
            }
          }
          if (self.freeCount != -1) {
            if (self.freeCount < 1) {
              //配额数量不足
              self.$message({
                showClose: true,
                message: Vue.t('storage.numNotEnough'),
                type: 'warning'
              });
              // self.$emit("handlerBak", {});
              return false;
            }
          }
          let name = this.volumeBak.name;
          let description = this.volumeBak.description;
          var pUuid = this.$cookie.get("pid");
          let url = "api/cinderv3/v3/" + pUuid + "/backups";
          let type = "post";
          let msg = this.$t('storage.sendCreateVolBakSuccess');
          var logVolName = "";
          if (this.detailBakVolume.status != "available" && this.detailBakVolume.status != "in-use") {
            this.$emit("handlerBak", {});
            return false;
          }
          if (typeof (this.detailBakVolume.name) == "undefined" || null == this.detailBakVolume.name) {
            logVolName = this.detailBakVolume.id + "(" + this.detailBakVolume.id + ")";
          } else {
            logVolName = this.detailBakVolume.name + "(" + this.detailBakVolume.id + ")";
          }
          this.isDisabled = true;
          let urlc = 'api/cinderv3/v3/' + this.$cookie.get('pid') + '/volumes/' + this.volumeId;
          await self.$ajax({
            url: urlc,
            type: 'GET',
            sync: true,
            errFun: function () {
              self.isDisabled = false;
            },
            success: function (ret) {
              this.vStatus = ret['volume'].status;
              let increment = self.isIncremental();
              let logZh = "全量备份";
              let logEn = " full backup ";
              if (increment == true) {
                logZh = "增量备份";
                logEn = " incremental backup";
              }
              if (this.vStatus != 'available' && this.vStatus != 'in-use') {
                self.$message({
                  showClose: true,
                  message: Vue.t('storage.canNotExeBak'),
                  type: 'warning'
                });
                self.$emit("handlerBak", {});
                this.isDisabled = false;
                return false;
              } else if (this.vStatus == 'in-use') {
                try {
                  var body = {
                    "backup": {
                      "name": name,
                      "description": description,
                      "volume_id": self.volumeId,
                      "force": true,
                      "incremental": increment
                    }
                  };
                  body = JSON.stringify(body);
                  let ret = self.$ajax({
                    url: url,
                    data: body,
                    type: type,
                    confirmMsg: self.$t('storage.coloneVolumeBakConfirmMsg'),
                    successMsg: msg,
                    cancelFun: function() {
                      self.isDisabled = false
                    },
                    success: function (ret) {
                      self.$emit("handlerBak", {});
                      self.hrefToBaKPage();
                      self.isDisabled = false;
                    },
                    errFun: function () {
                      self.isDisabled = false;
                    },
                    log: {
                      description: {
                        en: "Create volume" + logEn + name + " form volume of:" + logVolName,
                        zh_cn: "云硬盘" + logVolName + "创建云硬盘" + logZh + name
                      },
                      target: Vue.logTarget.storage_volume_backup
                    }
                  });
                } catch (data) {
                  self.isDisabled = false;
                  __DEV__;
                }
              } else if (this.vStatus == 'available') {
                body = {
                  "backup": {
                    "name": name,
                    "description": description,
                    "volume_id": self.volumeId,
                    "incremental": increment
                  }
                };
                body = JSON.stringify(body);
                try {
                  let ret = self.$ajax({
                    url: url,
                    data: body,
                    type: type,
                    successMsg: msg,
                    success: function (ret) {
                      self.$emit("handlerBak", {});
                      self.hrefToBaKPage();
                    },
                    errFun: function () {
                      self.isDisabled = false;
                    },
                    log: {
                      description: {
                        en: "Send create volume" + logEn + name + " form volume of:" + logVolName,
                        zh_cn: "发送云硬盘" + logVolName + "创建云硬盘" + logZh + name
                      },
                      target: Vue.logTarget.storage_volume_backup
                    }
                  });
                } catch (data) {
                  self.isDisabled = false;
                  __DEV__;
                }
              }
            }
          });
          // setTimeout(this.vBackup(), 1000);
        }
      });
    },
    volumeChange() {
      var self = this;
      this.volumeId = this.volumeBak.volume
      for (var i = 0; i < self.volumesOptions.length; i++) {
        if (self.volumesOptions[i].id == self.volumeBak.volume) {
          self.detailBakVolume.size = self.volumesOptions[i].sizeGB;
          self.detailBakVolume.id = self.volumesOptions[i].id;
          self.detailBakVolume.name = self.volumesOptions[i].name;
          self.detailBakVolume.status = self.volumesOptions[i].status;
        }
      }
    },
    hrefToBaKPage() {
      this.$router.push({
        path: '/calculate-storage/snapshot/volumebak'
      });
    },
    cancelFun() {
      this.$emit("handlerBak");
    },
    checkBackupExists() {
      var url = 'api/cinderv3/v3/' + this.$cookie.get('pid') + '/backups/detail?volume_id=' + this.volumeId;
      var roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        url = 'api/cinderv3/v3/' + this.$cookie.get('pid') + '/backups/detail?volume_id=' + this.volumeId;
      } else {
        url = 'api/cinderv3/v3/' + this.$cookie.get('pid') + '/backups/detail?all_tenants=True&volume_id=' + this.volumeId;
      }
      this.$ajax({
        url: url,
        type: 'GET',
        success: function (ret) {
          let val = ret['backups'];
          if (val.length <= 0) {
            console.log('=== No backups ===')
            $("input:radio[name='inRadio']").attr("disabled", true);
          }
        }
      });
    },
    async getCountValue() {
      var self = this;
      var projectId = "";
      if (this.projectFlag) {
        projectId = this.projectList;
      } else {
        if (self.detailVolume) {
          projectId = self.detailVolume['os-vol-tenant-attr:tenant_id'];
        } else {
          projectId = self.$cookie.get("pid");
        }
      }
      if (!projectId) {
        return;
      }
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + self.$cookie.get("pid") + "/os-quota-sets/" + projectId + "?usage=true"
        });
        var data = ret['quota_set'].backups;
        let a = "";
        let b = "";
        if (data['limit'] == "-1") {
          self.freeCount = -1;
          a = Vue.t("calcStorLang.instUnlimited");
        } else {
          self.freeCount = data['limit'] - data['in_use'];
          a = data['limit'];
        }
        self.cloudDiskBakNum = data['in_use'] + "/" + a;
        //容量
        var data2 = ret['quota_set'].backup_gigabytes;
        if (data2['limit'] == "-1") {
          self.freeSize = "-1";
          b = Vue.t("calcStorLang.instUnlimited");
        } else {
          var size = data2.limit;
          self.freeSize = size - data2['in_use'];
          b = data2['limit'];
        }
        self.cloudDiskBakSize = data2['in_use'] + "/" + b;
      } catch (data) {
        self.loading = false;
      }
    },
    vBackup() {
      let name = this.volumeBak.name;
      let description = this.volumeBak.description;
      var pUuid = this.$cookie.get("pid");
      let url = "api/cinderv3/v3/" + pUuid + "/backups";
      let type = "post";
      let msg = this.$t('storage.sendCreateVolBakSuccess');
      var logVolName = "";
      if (this.vStatus != "available" && this.vStatus != "in-use") {
        this.$emit("handlerBak", {});
        return false;
      }
      if (typeof (this.detailBakVolume.name) == "undefined" || null == this.detailBakVolume.name) {
        logVolName = this.detailBakVolume.id + "(" + this.detailBakVolume.id + ")";
        //name = resultData[i].id;
      } else {
        logVolName = this.detailBakVolume.name + "(" + this.detailBakVolume.id + ")";
      }
      let body = {};
      if (this.vStatus == "available") {
        body = {
          "backup": {
            "name": name,
            "description": description,
            "volume_id": this.volumeId,
            "incremental": this.isIncremental()
          }
        };
        body = JSON.stringify(body);
        try {
          let ret = this.$ajax({
            url: url,
            data: body,
            type: type,
            successMsg: msg,
            log: {
              description: {
                en: "Send create volume backup" + name + " form volume of:" + logVolName,
                zh_cn: "发送云硬盘" + logVolName + "创建云硬盘备份" + name
              },
              target: Vue.logTarget.storage_volume_backup
            }
          });
          this.$emit("handlerBak", {});
          this.hrefToBaKPage();
        } catch (data) {
          this.isDisabled = false;
          __DEV__;
        }
      } else {
        // try {
        //  body = {"backup": {"name": name, "description": description, "volume_id": this.vId, "force": true}};
        //  body = JSON.stringify(body);
        //  let ret = this.$ajax({
        //    url: url,
        //    data: body,
        //    type: type,
        //    confirmMsg: "云硬盘的状态为正在使用，确定强制备份？",
        //    successMsg: msg,
        //    log:{
        //     description:{
        //     en:"Send create volume backup " + name + " form volume of : " + logVolName,
        //     zh_cn:"发送云硬盘" + logVolName + "创建云硬盘备份" + name
        //     },
        //     target:Vue.logTarget.storage_volume_backup
        //   }
        //  });
        //  this.$emit("handlerBak", {});
        //  this.hrefToBaKPage();
        //  this.isDisabled = false;
        // } catch (data) {
        // this.isDisabled = false;
        // __DEV__;
        // }
      }
    }
  }
}
</script>