<template>
  <el-dialog
    :title="$t('heat.editSystemTemplate')"
    :visible.sync="dialogVisible"
    :before-close="hide"
    v-dialogDrag>
    <el-form
      ref="submitTemplateForm"
      :model="submitTemplateForm"
      :rules=rules
      v-loading="loading"
      label-width="150px" style="margin-top:5px;" class="me-required-form">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-12" v-model="submitTemplateForm.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" :row="2" class="col-12" v-model="submitTemplateForm.description"></el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="hide">{{$t('lang.cancel')}}</el-button>
      <el-button @click="confirm" type="primary" :disabled="loading">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "EditSubmitTemplateConfirm",
    props:{
      templateDetail:{
        type:Object,
        default:function () {
          return {}
        }
      },
      rowData: {
        type:Object,
        default:function () {
          return {}
        }
      },
      nodeConfigForm: {
        type:Object,
        default:function () {
          return {}
        }
      },
      resources: {
        type:Array,
        default:function () {
          return []
        }
      }
    },
    data() {
      return {
        dialogVisible: false,
        loading:false,
        submitTemplateForm: {
          name: '',
          description:''
        },
        rules: {
          name: [
            {type: 'required', trigger: 'blur change'},
            {type: 'onlyLetterNumberChinese', trigger:"blur change"},
            {type: 'maxSize', value: 40}
          ],
          description: [
            {type: 'maxSize', value: 255}
          ]
        }
      }
    },
    mounted() {
      this.dialogVisible = true;
      this.submitTemplateForm.name = this.rowData.name;
      this.submitTemplateForm.description = this.rowData.description;
    },
    methods: {
      hide() {
        this.$emit("handleAddShow");
      },
      confirm() {
        let self = this;
        this.$refs.submitTemplateForm.validate((valid) => {
          if (valid) {
            let newFormData = Object.assign({}, self.submitTemplateForm);
            newFormData.parameters = self.nodeConfigForm;
            newFormData.parameters.pool_asd_protocol = newFormData.parameters.listener_sda_protocol;
            newFormData.id = this.$route.params.id;
            for (let i = 0; i < self.resources.length; i++) {
              let name = self.resources[i].name;
              let parameters = JSON.parse(self.resources[i].parameters);
              let parametersTmp = {};
              for (let v in parameters) {
                parametersTmp[v] = newFormData.parameters[name + "_" + v];
              }
              self.resources[i].parameters = JSON.stringify(parametersTmp);
            }
            newFormData.stacktemplateresource = self.resources;
            this.$ajax({
              type:"post",
              url:"api/heat/v1/" + this.$route.params.projectId + "/template/update",
              data:JSON.stringify(newFormData),
              successMsg: Vue.$t('storage.updateSuccess'),
              log:{
                description:{
                  en:"Modify heat template:" + newFormData.name,
                  zh_cn:"修改编排模板:" + newFormData.name
                },
                target:Vue.logTarget.heatTemplate
              },
              successFun:() => {
                self.hide();
                this.$router.push({
                  path:"/service-orchestration/orchestrationTemplate"
                });
              }
            });
          } else {
            return false;
          }
        });
      }
    }
  }
</script>
<style scoped>

</style>
