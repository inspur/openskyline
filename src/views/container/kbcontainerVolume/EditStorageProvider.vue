<template>
  <div>
    <el-dialog :title="$t('container.editStorageProvider')" :visible.sync="visible" :before-close="cancel" v-dialogDrag>
      <el-form ref="addNodeForm" :model="addNodeForm" :rules="rules" class="margin-tb20 me-required-form" v-loading="saving" label-width="120px">
        <el-form-item :label="$t('container.cluster')" prop="k8sClusterId" class="is-required">
          <el-input class="col-12" v-model="addNodeForm.clusterName" disabled></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.userName')" prop="userName">
          <el-input class="col-12" v-model="addNodeForm.userName" disabled></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.password')" prop="userPass" class="is-required">
          <el-input class="col-12" v-model="addNodeForm.userPass" auto-complete="off" type="password"></el-input>
          <el-tooltip placement="top" trigger="hover" :content="$t('container.passwordNote')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('lang.confirmPassword')" prop="userConfirmPass" class="is-required">
          <el-input class="col-12" v-model="addNodeForm.userConfirmPass" auto-complete="off" type="password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button @click="submitForm" type="primary" :loading="saving">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import uuid from 'uuid';
export default {
  name: "EditStorageProvider",
  props: ["selectedRowData"],
  data() {
    return {
      addNodeForm: {
        csi_type: "cinder",
        userName: Vue.userName,
        userPass: "",
        userConfirmPass: "",
        k8sClusterId:this.selectedRowData.cluster_id,
        clusterName:this.selectedRowData.cluster,
        rancher_cluster_id:this.selectedRowData.rancher_cluster_id
      },
      k8sClusterOptions: [],
      visible: true,
      saving: false,
      rules: {
        userPass: [
          { type: 'required' },
          {
            validator: (rule, value, callback) => {
              let pattern = new RegExp(this.strategy.password_regex, 'g');
              if (!pattern.test(value)) {
                callback(this.strategy.password_regex_description);
              } else {
                callback();
              }
            }
          }
        ],
        userConfirmPass:  [
          { type: 'required' },
          { type: 'passwordEquals', context: this, value: 'addNodeForm.userPass' },
          {
            validator: (rule, value, callback) => {
              let pattern = new RegExp(this.strategy.password_regex, 'g');
              if (!pattern.test(value)) {
                callback(this.strategy.password_regex_description);
              } else {
                callback();
              }
            }
          }
        ]
      },
      strategy:{
        password_regex: '',
        password_regex_description: ''
      }
    };
  },
  mounted() {
    this.getPassStrategy();
  },
  methods: {
    getPassStrategy() {
      let me = this;
      this.$ajax({
        type: 'get',
        url: 'api/keystone/v3/inspur/system/config/file-conf',
        successFun(data) {
          me.strategy.password_regex = data.password_regex || '';
          if (Vue.language === 'en') {
            me.strategy.password_regex_description = data.password_regex_description || '';
          }
          if (Vue.language === 'zh_cn') {
            me.strategy.password_regex_description = data.password_regex_description_cn ? eval(`"${data.password_regex_description_cn}"`) : '';
          }
        }
      })
    },
    submitForm() {
      this.$refs.addNodeForm.validate(async valid => {
        if (valid) {
          try {
            let self = this;
            let body = {
              csi_type: this.addNodeForm.csi_type,
              project_id: self.$cookie.get('pid'),
              user_name:Vue.userName,
              user_password: this.addNodeForm.userPass,
              rancher_cluster_id: this.addNodeForm.rancher_cluster_id,
              cluster_id: this.addNodeForm.k8sClusterId
            };
            let ret1 = await self.$ajax({
              type: 'post',
              url: 'api/keystone/v3/auth/tokens',
              data:JSON.stringify({
                "auth": {
                  "identity": {
                    "methods": ["password"],
                    "password": {
                      "user": {
                        "name": Vue.userName,
                        "password": this.addNodeForm.userPass,
                        "domain": {
                          "name": Vue.domainName
                        }
                      }
                    }
                  }
                }
              }),
              logout:false,
              showErrMsg: false,
              errFun(resp) {
                if (resp.responseJSON.error.message.indexOf("locked") > -1) {
                  self.$notify({
                    message: self.$t("container.accountLocked"),
                    type: "error"
                  });
                } else {
                  self.$notify({
                    message: self.$t("container.passwordError"),
                    type: "error"
                  });
                }
              },
              success() {
                self.saving = true;
                let traceId = 'req-'+uuid.v1();
                let ret = self.$ajax({
                  url: "api/cetus/v1/csi/update_provider",
                  data: JSON.stringify(body),
                  type: "POST",
                  headers: {
                    'X-Openstack-Request-Id': traceId
                  },
                  successMsg:self.$t('container.modifySuccessMsg'),
                  successFun:(response) => {
                    if (response.code != "200") {
                      self.$notify({
                        message: response.result,
                        type: "error"
                      });
                      self.$recordLog({
                        target: Vue.logTarget.containerVolume,
                        level: {
                          en: "error",
                          zh_cn: "错误"
                        },
                        description: {
                          en: `cluster:${self.addNodeForm.clusterName}edit storage provider`,
                          zh_cn: `集群${self.addNodeForm.clusterName}修改存储提供者`
                        },
                        trace_id: traceId
                      });
                    } else {
                      self.$recordLog({
                        target: Vue.logTarget.containerVolume,
                        level: {
                          en: "info",
                          zh_cn: "信息"
                        },
                        description: {
                          en: `cluster:${self.addNodeForm.clusterName}edit storage provider`,
                          zh_cn: `集群${self.addNodeForm.clusterName}修改存储提供者`
                        },
                        trace_id: traceId
                      });
                    }
                  }
                });
              }
            });
            this.saving = false;
            this.$emit("handleAddShow", {});
            this.$emit("refreshData", {});
          } catch (data) {
            this.saving = false;
            __DEV__ && console.error(data);
          }
        }
      });
    },
    cancel() {
      let self = this;
      this.$emit("handleAddShow", {});
    }
  }
};
</script>
