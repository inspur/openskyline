<template>
  <el-dialog
    :title="$t('heat.applyTemplate')"
    :visible.sync="dialogVisible">
    <!-- <el-alert title='该模板中包含的主机、路由器、负载均衡、云硬盘等设备，以及设备的配置、附加资源（如IP、硬盘、路由器配置）等都会按同等配置创建一份。'
      type='info' :closable='false' show-icon></el-alert> -->
    <div class="text-regular module-desc" style="">{{$t('heat.applyTemplateDesc')}}</div>
    <el-form
      ref="applyTemplateForm"
      :model="applyTemplateForm"
      :rules=rules
      v-loading="loading"
      label-width="150px" style="margin-top:5px;" class="me-required-form">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-12" v-model="applyTemplateForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('heat.timeoutMin')" prop="timeout" class="is-required">
        <el-input-number class="col-12" v-model="applyTemplateForm.timeout" :min="0" :max="120"></el-input-number>
        <el-tooltip placement="right-start">
          <div slot="content">{{$t('heat.timeoutDesc')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="" prop="rollback">
        <el-checkbox v-model="applyTemplateForm.rollback">{{$t('heat.rollbackOnFail')}}</el-checkbox>
        <el-tooltip placement="right-start">
          <div slot="content">{{$t('heat.rollbackOnFailDesc')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="hide">{{$t("lang.cancel")}}</el-button>
      <el-button @click="confirm" type="primary" :disabled="loading">{{$t("lang.confirm")}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "ApplyTemplate",
    props:{
      selectedRowData:{
        type:Object,
        default:function () {
          return {}
        }
      }
    },
    data() {
      return {
        dialogVisible: false,
        loading:false,
        applyTemplateForm: {
          name: '',
          timeout:'',
          rollback:false
        },
        rules: {
          name: [
            {type: 'required', trigger: 'blur change'},
            {type: 'startwithLetter_NoChinese'},
            {type: 'maxSize', value: 40}
          ],
          timeout: [
            {type: 'required', trigger: 'blur change'}
          ]
        }
      }
    },
    mouted() {
    },
    methods: {
      show(id, name) {
        this.dialogVisible = true;
      },
      hide() {
        this.dialogVisible = false;
        this.$emit("handleAddShow");
      },
      confirm() {
        this.$refs.applyTemplateForm.validate((valid) => {
          if (valid) {
            let rowData = this.selectedRowData;
            let formData = {};
            formData.file = {};
            formData.stack_name = this.applyTemplateForm.name;
            formData.timeout_mins = this.applyTemplateForm.timeout;
            formData.disable_rollback = !this.applyTemplateForm.rollback;
            formData.parameters = rowData.parameters;
            let templateContent = rowData.template;
            if (templateContent.indexOf("neutron.publicnetwork") >= 0) {
              templateContent = templateContent.replace(/neutron.publicnetwork/g, "neutron.network");
            }
            let originalTemplate = JSON.parse(templateContent);
            let resources = originalTemplate.resources;
            let keys = Object.keys(resources);
            if (keys.indexOf("replace_vm_name") >= 0) {
              resources[rowData.parameters.vm_name] = resources.replace_vm_name;
              delete resources.replace_vm_name;
            }
            // 删除自定义的类型
            if (originalTemplate.parameters) {
              let parameters = originalTemplate.parameters;
              let paramKeys = Object.keys(parameters);
              paramKeys.forEach(pk => {
                if (pk.indexOf("volume_type") >= 0) {
                  delete parameters[pk].constraints;
                }
                //删除所有校验
                if (parameters[pk].constraints) {
                  delete parameters[pk].constraints
                }
              });
            }
            formData.template = originalTemplate;

            this.loading = true;
            this.$ajax({
              type:"post",
              url:"api/heat/v1/" + rowData.tenant + "/stacks",
              data:JSON.stringify(formData),
              successMsg:this.$t('heat.applyTemplateSuccess'),
              log:{
                description:{
                  en:"Apply heat template:" + formData.stack_name,
                  zh_cn:"生成编排:" + formData.stack_name
                },
                target:Vue.logTarget.heatTemplate
              },
              successFun:() => {
                this.hide();
                this.loading = false;
                this.$router.push({
                  path:'/service-orchestration/orchestrationList'
                });
              },
              errFun:() => {
                this.loading = false;
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
