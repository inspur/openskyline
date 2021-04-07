<template>
  <el-dialog :title="$t('calcStorLang.addKeyPair')" :visible.sync="dialogVisible" :before-close="handleClose" size="tiny">
    <el-form ref="addResSpecForm" :model="keyPair" label-width="80px" :rules="rules">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input v-model="keyPair.name" class="col-20"></el-input>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.theWay')" class="is-required">
        <el-radio class="radio" v-model="keyPair.type" label="1">{{$t('calcStorLang.createKeyPair')}}</el-radio>
        <el-radio class="radio" v-model="keyPair.type" label="2">{{$t('calcStorLang.useExistPair')}}</el-radio>
      </el-form-item>
      <!-- <el-form-item label="加密方法" class="is-required" v-if="keyPair.type==1">
        <el-select v-model="keyPair.option">
        	<el-option  label="ssh-rsa" value="ssh"></el-option>
        	<el-option  label="x509" value="x509"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item :label="$t('calcStorLang.publicKey')" class="is-required" prop="publicKey" v-show="keyPair.type==2">
        <el-input v-model="keyPair.publicKey" class="col-20" type="textarea"></el-input>
        <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.warnKeyPair')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="" v-show="keyPair.type==2">
        <span>{{$t('calcStorLang.prompt')}}</span>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAddSpec" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'AddKeyPair',
  data() {
    return {
      saving: false,
      keyPair: {
        name: '',
        type: '1',
        option: 'ssh',
        publicKey: ''
      },
      isShow: false,
      dialogVisible: false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 255 },
          { type: 'startwithLetter_NoChineseDot' } //onlyLetter_MinusNumberChineseSp
        ],
        publicKey: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 500 }
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.addResSpecForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.initDialog();
  },
  updated() {
    var self = this;
    if (this.keyPair.type==2) {
       this.rules.publicKey = [{ type: 'required', trigger: 'blur change' }, { type: 'maxSize', value: 500 }];
    } else {
      this.rules.publicKey = [];
    }
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    handleCancel() {
      this.$emit("handleShow", {});
    },
    handleClose(done) {
      this.$emit("handleShow", {});
      done();
    },
    confirmAddSpec() {
      this.$refs.addResSpecForm.validate(async(valid) => {
        if (valid) {
          this.saving = true;
          let name = this.keyPair.name;
          let type = this.keyPair.option;
          let key = "";
          if (type == "2") {
            key = this.keyPair.publicKey;
          }
          if (this.keyPair.type == "2") {
            if (this.keyPair.publicKey.substring(0, 8) != "ssh-rsa ") {
              this.$message({
                showClose: true,
                message: Vue.t('calcStorLang.warnKeyPairMsg'),
                type: 'warning'
              });
              this.saving = false;
              return false;
            }
          }
          let url = "api/nova/v2.1/os-keypairs";
          var body = {"keypair": {"name": name}}; // "type":type, "public_key": key, "user_id":""
          if (this.keyPair.type == "2") {
            body.keypair['public_key'] = this.keyPair.publicKey;
          }
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: 'post',
              successMsg: Vue.t('calcStorLang.addKeyPairSuccess'),
              log: {
                description: {
                  en: "Add KeyPair:" + name,
                  zh_cn: Vue.t('calcStorLang.addKeyPair') + name
                },
                target: Vue.logTarget.computeKeyPair
              }
            });
            if (this.keyPair.type == "1") {
              var priKey = ret.keypair['private_key'];
              this.$emit("handlerPriKeyShow", {priKey});
            }
            this.$emit("handleShow", {});
            this.$emit("getData", {});
          } catch (data) {
            this.saving = false;
            __DEV__ && console.error(data);
          }
        } else {
          return false;
        }
      });
    }
  }
}
</script>
