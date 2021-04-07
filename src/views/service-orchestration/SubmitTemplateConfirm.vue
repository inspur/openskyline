<template>
  <el-dialog
    :title="$t('heat.createCustomTemplate')"
    :visible.sync="dialogVisible"
    :before-close="hide"
    v-dialogDrag>
    <div class="text-regular module-desc">{{$t('heat.submitCustomTemplateDesc')}}</div>
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
    name: "SubmitTemplateConfirm",
    props:{
      templateDetail:{
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
    },
    methods: {
      hide() {
        this.$emit("handleAddShow");
      },
      confirm() {
        this.$refs.submitTemplateForm.validate((valid) => {
          if (valid) {
            let templateDetail = Object.assign({}, this.templateDetail);
            templateDetail.name = this.submitTemplateForm.name;
            templateDetail.description = this.submitTemplateForm.description;
            console.log(templateDetail);
            this.loading = true;
            this.$ajax({
              type:"post",
              url:"api/heat/v1/" + this.$cookie.get('pid') + "/template/create_customize",
              data:JSON.stringify(templateDetail),
              successMsg:this.$t('heat.createSuccessMsg'),
              log:{
                description:{
                  en:"Create custom heat template:" + this.submitTemplateForm.name,
                  zh_cn:"创建自定义模板:" + this.submitTemplateForm.name
                },
                target:Vue.logTarget.heatTemplate
              },
              successFun:() => {
                this.hide();
                this.loading = false;
                this.$router.push({
                  path:'/service-orchestration/orchestrationTemplate'
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