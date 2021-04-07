<template>
  <el-dialog :title="$t('storage.bakRecovery')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="volumeBakRecoveryForm" class="me-required-form" label-position="left" :model="volumeBakRecovery" label-width="110px" :rules="rules">
      <el-form-item :label="$t('storage.checkRecoveryWay')" prop="volume">
        <el-select class="col-8" v-model="volumeBakRecovery.recoveryMode" :disabled="recoveryFlag" @change="styleChange">
          <el-option v-for="item in recoveryModeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-tooltip v-show="recoveryFlag" placement="top" trigger="hover" :content="$t('storage.unUsedVolCanotRecovery')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('storage.volumeType')" prop="volumeType" v-if="volumeTypeFlag">
        <el-select v-model="volumeBakRecovery.volumeType" class="col-8" filterable clearable>
          <el-option v-for="item in volumeTypeOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.volName')" class="is-required" prop="name" v-if="nameFlag">
        <el-input class="col-8" v-model="volumeBakRecovery.name" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel" :disabled="isDisabled">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="isDisabled">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"volumeBakRecovery",
  props: ["bak"],
  data() {
    return {
      volumeTypeOptions:[],
      recoveryModeOptions:[{value:'1', label:this.$t('storage.recoveryToNewVol')}, {value:'2', label:this.$t('storage.recoveryToResVol')}],
      volumeBakRecovery:{
        recoveryMode:"1",
        volumeType:"",
        name: ''
      },
      visible:true,
      isDisabled: false,
      volumeTypeFlag: false,
      nameFlag: false,
      recoveryFlag: false,
      volume: {},
      roleType: Vue.roleType + "",
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 255},
          {type: 'onlyLetter_NumberChinese'}
        ]
      }
    }
  },
  mounted() {
    var self = this;
    self.businessCheck();
    self.getVolumeType();
  },
  methods:{
    businessCheck() {
      let self = this;
      self.volume = self.bak.volume;
      //初始化默认恢复到原云硬盘，不可以设置云硬盘名字，不能选云硬盘类型
      self.volumeBakRecovery.recoveryMode = '2';
      self.recoveryFlag = false;
      self.volumeTypeFlag = false;
      self.nameFlag = false;
      //如果原云硬盘被删除或者原云硬盘的状态不是available，则不能恢复到原云硬盘
      if (!self.volume || (self.volume['status'] != 'available')) {
        self.volumeBakRecovery.recoveryMode = '1';
        self.recoveryFlag = true;
        self.volumeTypeFlag = true;
        self.nameFlag = true;
        // self.$message.warning(Vue.t('storage.unUsedVolCanotRecovery'));
        // //如果是项目用户则弹窗不允许操作并退出
        // if (self.isUser()) {
        //   self.handleCancel();
        // }
      }
      //如果备份是加密的那么不允许选择新的云硬盘类型
      if (self.bak.encrypt) {
        self.volumeTypeFlag = false;
      }
    },
    volumeNameRender(rowData) {
      if (!rowData || !rowData["volume"]) {
        return '--';
      }
      let name = rowData["volume"]["display_name"];
      let id = rowData["volume"]["id"];
      if (!name) {
        name = id;
      }
      return name;
    },
    isUser() {
      var roleType = Vue.roleType + "";
      if ("3" == roleType) {
        return true;
      }
      return false;
    },
    handleClose() {
      this.$emit("handlRestore", {});
      this.$emit("getData");
    },
    handleCancel() {
      this.$emit("handlRestore", {});
    },
    async getVolumeType() {
      let self = this;
      let projectId = this.$cookie.get('pid');
      let roleType = Vue.roleType + "";
      let url = "api/cinderv3/v3/" + projectId + "/inspur-types";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.totalData = [];
        let volTypes = result['volume_types'];
        if (this.bak["volume"] != null && this.bak["volume"]["bootable"]) {
          self.volumeTypeOptions = volTypes.filter(function(item) {
            return item["extra_specs"]["multiattach"] != "<is> True" && !item["encrypt"];
            });
          } else {
            self.volumeTypeOptions = volTypes.filter(function(item) {
              return !item["encrypt"];
            });
          }
      } catch (res) {
        self.loading = false;
        self.$message.error(Vue.t('storage.getFailed'));
      }
    },
    confirmFun() {
      let self = this;
      this.$refs.volumeBakRecoveryForm.validate(async(valid) => {
        if (valid) {
          this.isDisabled = true;
          let pid = this.$cookie.get('pid');
          let volumeName = "";
          let volumeId = "";
          let {name, recoveryMode, volumeType} = this.volumeBakRecovery;
          let {name: backName, id: bakId} = this.bak;
          let sourcePId = this.bak["os-backup-project-attr:project_id"];
          let sourceUserId = this.bak["os-backup-user-attr:user_id"];
          let logInfo = { en: "", zh_cn: "" };
          if (recoveryMode == 1) {
            logInfo.zh_cn = `恢复云硬盘备份${backName}(${bakId})到新的云硬盘${name}`;
            logInfo.en = `Restore backup ${backName}(${bakId}) of volume to new volume ${name}`;
          } else {
            volumeId = this.bak.volume.id;
            volumeName = this.volumeNameRender(this.bak);
            logInfo.zh_cn = `恢复云硬盘备份${backName}(${bakId})到源云硬盘: ${volumeName}(${volumeId})`;
            logInfo.en = `Restore backup ${backName}(${bakId}) of volume to source volume: ${volumeName}(${volumeId})`;
          }
          let restore = {};
          //超级管理员可以管理全部项目下的备份，若备份所属项目和超管根项目(一般admin)不同，需要传入备份所属项目id
          if ("0" == roleType && sourcePId != pid) {
            if (recoveryMode == 1) {
              restore= {"name": name, "project_id": sourcePId, "user_id": sourceUserId};
            } else {
              restore = {"project_id": sourcePId, "volume_id": volumeId, "user_id": sourceUserId};
            }
          } else {
            if (recoveryMode == 1) {
              restore = {"name": name};
            } else {
              restore = {"volume_id": volumeId};
            }
          }
          if (volumeType) {
            restore.volume_type = volumeType;
          }
          let body = { "restore" : restore };
          try {
            let ret = await this.$ajax({
              url: `api/cinderv3/v3/${pid}/inspur-backups/${bakId}/restore`,
              data: JSON.stringify(body),
              type: "post",
              successMsg: this.$t('storage.sendRecoverySuccess'),
              log:{
                description:logInfo,
                target:Vue.logTarget.storage_volume_backup
              }
            });
            this.$emit("handlRestore", {});
            this.hrefTovolumePage();
            this.isDisabled = false;
          } catch (data) {
            this.isDisabled = false;
            __DEV__ && console.error(data);
          }
        } else {
          this.isDisabled = false;
          return false;
        }
      });
    },
    hrefTovolumePage() {
      this.$router.push({
            path: '/calculate-storage/volume/volumelist'
          });
    },
    styleChange(val) {
      if (val == '1') {
        this.volumeTypeFlag = true;
        this.nameFlag = true;
      } else if (val == '2') {
        this.volumeTypeFlag = false;
        this.nameFlag = false;
      }
      //如果备份是加密的那么不能选择云硬盘类型
      if (this.bak.encrypt) {
        this.volumeTypeFlag = false;
      }
    }
  }
}
</script>