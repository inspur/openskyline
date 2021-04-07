<template>
  <el-dialog :title="$t('storage.encryptManage')" :visible.sync="visible" :before-close="onClose" v-dialogDrag>
    <el-row>
      <el-col :span="12" >
        <div style="margin-bottom:15px">
          <el-button v-if="showAddFlag" @click="onClickAdd" type="primary" icon="fa-plus" size="small">{{$t('lang.setting')}}</el-button>
          <el-button v-if="showMdifyFlag" @click="onClickModfity" type="primary" icon="fa-pencil-square-o" size="small">{{$t('lang.modify')}}</el-button>
          <el-button v-if="showDeleteFlag" @click="onClickDelete" type="primary" icon="fa-times" size="small">{{$t('lang.delete')}}</el-button>
          <el-button v-if="!(showAddFlag||showMdifyFlag||showDeleteFlag)" @click="onClickBack" type="primary" icon="fa-reply" size="small">{{$t('storage.back')}}</el-button>
          <el-button v-if="!(showAddFlag||showMdifyFlag||showDeleteFlag)" @click="onClickSubmit" type="primary" icon="fa-check" size="small">{{$t('storage.submit')}}</el-button>
        </div>
        <el-form ref="encryptionForm" v-if="showFormFlag" :model="encryption" label-width="100px" :rules="rules"  label-position="left">
          <el-form-item :label="$t('storage.volumeType')" prop="name">
            <el-tooltip placement="top" trigger="hover" :content="volumeType.name">
              <div class="volume_type-name width90">{{volumeType.name}}</div>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('storage.provider')" class="is-required" prop="provider">
            <el-select v-model="encryption.provider" class="width90" :disabled="formDisabled" filterable clearable>
              <el-option v-for="item in providerOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('storage.controlPosition')" class="is-required" prop="controlPosition">
            <el-select v-model="encryption.controlPosition" class="width90" :disabled="formDisabled" filterable clearable>
              <el-option v-for="item in cLocationOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('storage.encryptAlgorithm')" class="is-required" prop="cipher">
            <el-select v-model="encryption.cipher" class="width90" :disabled="formDisabled" filterable clearable>
              <el-option v-for="item in cipherOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('storage.keySize')" class="is-required" prop="keySize">
            <el-select v-model="encryption.keySize" class="width90" :disabled="formDisabled" filterable clearable>
              <el-option v-for="item in keySizeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div v-if="!showFormFlag" style="height: auto; text-align: center; padding-top: 50px;">
          <i class="el-icon-fa-unlock" style="font-size: 50px; color: #f7ba2a;"></i>
          <div>{{ $t('storage.ENCRYPT_NO_SETTINGS') }}</div>
        </div>
      </el-col>
      <el-col :span="12">
        <div style="margin-top:45px; border-left:1px #dfdfdf solid; padding-left: 7%">
          <div style="font-size: 16px; font-weight: 600;">{{ $t('storage.ENCRYPT_DESC') }}</div>
          <ul>
            <li>{{ $t('storage.ENCRYPT_DESC_MAIN') }}</li>
            <li><b>{{$t('storage.provider')}}</b>{{ $t('storage.ENCRYPT_DESC_FOR_PROVIDER') }}</li>
            <li><b>{{$t('storage.controlPosition')}}</b>{{ $t('storage.ENCRYPT_DESC_FOR_CONTROL_POSITION') }}</li>
            <li><b>{{$t('storage.encryptAlgorithm')}}</b>{{ $t('storage.ENCRYPT_DESC_FOR_ENCRYPT_ALGORITHM') }}</li>
            <li><b>{{$t('storage.keySize')}}</b>{{ $t('storage.ENCRYPT_DESC_FOR_KEY_SIZE') }}</li>
          </ul>
        </div>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="onClose">{{$t('lang.close')}}</el-button>
    </div>
 </el-dialog>
</template>;
<script>
export default {
  name:"EncryptionManage",
  props: ["volumeType"],
  data() {
    return {
      encryption:{
        provider:"",
        controlPosition:"",
        cipher:"",
        keySize:""
      },
      operType: "",
      encryption_id: "",
      loading: false,
      visible: true,
      lastSetting: "",
      showFormFlag: false,
      formDisabled: false,
      showAddFlag: false,
      showMdifyFlag: false,
      showDeleteFlag: false,
      providerOptions:[
        {value:'luks', label:'luks'}
      ],
      cLocationOptions:[
        {value:'front-end', label: Vue.t('storage.ENCRYPT_CONTROL_POSITION_FRONT_END')}
      ],
      cipherOptions:[
        {value:'aes-xts-plain64', label:'aes-xts-plain64'}
      ],
      keySizeOptions:[
        // {value:'128', label:'128'},
        {value:'256', label:'256'}
      ],
      rules: {
        provider: [
          {type: 'required'}
        ],
        controlPosition: [
          {type: 'required'}
        ],
        cipher: [
          {type: 'required'}
        ],
        keySize: [
          {type: 'required'}
        ]
      }
    }
  },
  mounted() {
    this.showAddFlag = true;
    this.loadEncryptSetting();
  },
  methods:{
    loadEncryptSetting() {
      let self = this;
      self.loading = true;
      try {
        self.$ajax({
          type: 'get',
          url: `api/cinder/v3/${self.$cookie.get("pid")}/types/${self.volumeType.id}/encryption`,
          successFun(result) {
            if (result && result["encryption_id"]) {
              self.encryption_id = result["encryption_id"];
              self.encryption = {
                provider: result["provider"],
                controlPosition: result["control_location"],
                cipher: result["cipher"],
                keySize: result["key_size"]
              };
              self.lastSetting = JSON.parse(JSON.stringify(self.encryption));
              self.showAddFlag = false;
              self.showMdifyFlag = true;
              self.showDeleteFlag = true;
              self.formDisabled = true;
              self.showFormFlag = true;
            } else {
              self.encryption = {
                provider:"",
                controlPosition:"",
                cipher:"",
                keySize:""
              };
              self.lastSetting = JSON.parse(JSON.stringify(self.encryption));
              self.showAddFlag = true;
              self.showMdifyFlag = false;
              self.showDeleteFlag = false;
              self.formDisabled = false;
              self.showFormFlag = false;
            }
          }
        });
        self.loading = false;
      } catch (error) {
        self.loading = false;
      }
    },
    confirmFun() {
      let me = this;
      this.$emit("addData");
    },
    onClickBack() {
      let self = this;
      if (self.operType === "add") {
        self.encryption = self.lastSetting;
        self.showAddFlag = true;
        self.showMdifyFlag = false;
        self.showDeleteFlag = false;
        self.formDisabled = false;
        self.showFormFlag = false;
      }
      if (self.operType === "modify") {
        self.encryption = self.lastSetting;
        self.showAddFlag = false;
        self.showMdifyFlag = true;
        self.showDeleteFlag = true;
        self.formDisabled = true;
        self.showFormFlag = true;
      }
    },
    onClickSubmit() {
      let self = this;
      this.$refs.encryptionForm.validate(async (valid) => {
        if (valid) {
          if (self.operType === "add") {
            self.onAddSubmit();
          }
          if (self.operType === "modify") {
            self.onModifySubmit();
          }
        }
      });
    },
    onClickAdd() {
      let self = this;
      self.operType = "add";
      self.showAddFlag = false;
      self.showMdifyFlag = false;
      self.showDeleteFlag = false;
      self.showFormFlag = true;
      self.formDisabled = false;
    },
    onClickModfity() {
      let self = this;
      self.operType = "modify";
      self.showAddFlag = false;
      self.showMdifyFlag = false;
      self.showDeleteFlag = false;
      self.showFormFlag = true;
      self.formDisabled = false;
    },
    onClickDelete() {
      let self = this;
      self.$confirm(this.$t('storage.deleteEncryptSettingMsg'), self.$t('base.confirm'), {
        confirmButtonText: self.$t('base.confirm'),
        cancelButtonText: self.$t('base.cancel'),
        type: 'warning'
      }).then(async() => {
        self.$ajax({
          type: 'delete',
          url: `api/cinder/v3/${self.$cookie.get("pid")}/types/${self.volumeType.id}/encryption/${self.encryption_id}`,
          showErrMsg: true,
          log: {
            description: {
              en: `Delete the encryption setting of volume type(${self.volumeType.name})`,
              zh_cn: `删除云硬盘类型(${self.volumeType.name})的加密设置`
            },
            target: Vue.logTarget.storage_volume_type
          },
          successFun(rtn) {
            self.loadEncryptSetting();
          }
        });
      });
    },
    onAddSubmit() {
      let self = this;
      let encryptionInfo = {};
      encryptionInfo["provider"] = self.encryption.provider;
      encryptionInfo["control_location"] = self.encryption.controlPosition;
      encryptionInfo["key_size"] = self.encryption.keySize;
      encryptionInfo["cipher"] = self.encryption.cipher;
      let body = {
        "encryption":encryptionInfo
      };
      body = JSON.stringify(body);
      self.$ajax({
        type: 'post',
        url: `api/cinder/v3/${self.$cookie.get("pid")}/types/${self.volumeType.id}/encryption`,
        data: body,
        log: {
          description: {
            en: `Add the encryption setting of volume type(${self.volumeType.name})`,
            zh_cn: `新增云硬盘类型(${self.volumeType.name})的加密设置`
          },
          target: Vue.logTarget.storage_volume_type
        },
        showErrMsg: true,
        // errFun(xhr, status, msg) {
        //   console.log(xhr);
        // },
        successFun(rtn) {
          self.loadEncryptSetting();
        }
      });
    },
    onModifySubmit() {
      let self = this;
      let encryptionInfo = {};
      encryptionInfo["provider"] = self.encryption.provider;
      encryptionInfo["control_location"] = self.encryption.controlPosition;
      encryptionInfo["key_size"] = self.encryption.keySize;
      encryptionInfo["cipher"] = self.encryption.cipher;
      let body = {
        "encryption":encryptionInfo
      };
      body = JSON.stringify(body);
      self.$ajax({
        type: 'put',
        url: `api/cinder/v3/${self.$cookie.get("pid")}/types/${self.volumeType.id}/encryption/${self.encryption_id}`,
        data: body,
        log: {
          description: {
            en: `Modify the encryption setting of volume type(${self.volumeType.name})`,
            zh_cn: `修改云硬盘类型(${self.volumeType.name})的加密设置`
          },
          target: Vue.logTarget.storage_volume_type
        },
        showErrMsg: true,
        // errFun(xhr, status, msg) {
        //   console.log(xhr);
        // },
        successFun(rtn) {
          self.loadEncryptSetting();
        }
      });
    },
    onClose() {
      this.$emit("handleClose", {});
    }
  }
}
</script>
<style scoped>
.volume_type-name {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.width90 {
  width: 90%;
}
</style>
