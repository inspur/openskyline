<template>
  <div>
    <el-dialog :title="$t('baremachine.MANAGE_PHYSICAL')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag directive="true">
      <el-form ref="addManageForm" :model="addManageForm" label-width="140px" :rules="rules" class="me-required-form margin-tb20" v-loading="loading">
        <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
          <el-input class="col-10" v-model="addManageForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.bmcIP')" prop="ip" class="is-required">
          <el-input class="col-10" v-model="addManageForm.ip" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.bmcUserName')" prop="bmcusername" class="is-required">
          <el-input class="col-10" v-model="addManageForm.bmcusername" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.bmcPassword')" prop="bmcpsw" class="is-required">
          <el-input type="password" class="col-10" v-model="addManageForm.bmcpsw" auto-complete="off"></el-input>
        </el-form-item>
        <div class="me-form-footer">
          <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
          <el-button @click="addManage" type="primary" :loading="saving">{{$t('lang.confirm')}}</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>
<script type="text/javascript">
export default {
  name: "AddManage",
  data() {
    return {
      dialogVisible: false,
      saving: false,
      roleType: Vue.roleType + "",
      loading: false,
      close: "",
      addManageForm: {
        name: '',
        ip: '',
        bmcusername: '',
        bmcpsw: ''
      },
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 40},
          {type: 'onlyLetter_MinusNumber'}
        ],
        ip: [
          { type: 'ipv4' },
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 }
        ],
        bmcusername: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 }
        ],
        bmcpsw: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 }
        ]
      }
    };
  },
  mounted() {
    this.initDialog();
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
    },
    async addManage() {
      let self = this;
      self.$refs.addManageForm.validate(async(valid) => {
          if (valid) {
            self.saving = true;
            let name = this.addManageForm.name;
            let ip = this.addManageForm.ip;
            let bmcusername = this.addManageForm.bmcusername;
            let bmcpsw = this.addManageForm.bmcpsw;
            let url = "api/ironic/v1/nodes_inspur";
            let body = {
              "name": name,
              "driver": "ipmi",
              "driver_info": {
                "ipmi_username": bmcusername,
                "ipmi_password": bmcpsw,
                "ipmi_address": ip
              },
              "properties": {
                "is_adopt": "yes"
              }
            };
            body = JSON.stringify(body);
            try {
              await this.$ajax({
                url: url,
                data: body,
                headers: {
                  "X-Openstack-Ironic-Api-Version": "1.46"
                },
                type: 'post',
                successMsg: Vue.t('baremachine.MANAGE_PHYSICAL_SUCESS'),
                showErrMsg: false,
                log: {
                  description: {
                    en: "manage physical:" + name,
                    zh_cn: Vue.t('baremachine.MANAGE_PHYSICAL') + Vue.t('baremachine.EXTERNAL_PHYSICAL_SERVER') + ":" + name
                  },
                  target: Vue.logTarget.bareMachine
                },
                errFun: (res) => {
                  let errorMessage = res.responseJSON.error_message && JSON.parse(res.responseJSON.error_message) && JSON.parse(res.responseJSON.error_message).faultstring;
                  if (errorMessage) {
                    self.$message.error(errorMessage);
                  } else {
                    self.$message.error(res.responseJSON.error_message || "error");
                  }
                }
              });
              self.saving = false;
              self.$message(Vue.t('calcStorLang.submitCompleted'));
              self.$emit("handleAddShow");
            } catch (data) {
              self.saving = false;
              __DEV__ && console.error(data);
            }
          }
      })
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    }
  }
};
</script>
