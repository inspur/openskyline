<template>
  <el-form class="margin-tb20" ref="createByCustomForm" :model="createByCustomForm" :rules=rules label-position="right" label-width="100px">
    <el-form-item :label="$t('heat.template_file')" class="is-required">
      <el-upload
        class="col-12"
        ref="upload"
        accept=".yaml"
        action=""
        :multiple="false"
        :file-list="fileList"
        :auto-upload="false"
        :on-change="handleChange"
        :on-preview="handlePreview">
        <el-button slot="trigger" size="small" type="primary">{{$t('base.pleaseSelectFile')}}</el-button>
      </el-upload>
    </el-form-item>
    <el-form-item :label="$t('heat.template_data')" prop="templateData" class="is-required">
      <el-input type="textarea" :autosize="{minRows:2,maxRows:10}" class="col-12" readonly
        v-model="createByCustomForm.templateData" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button @click="nextStep" type="primary" >{{$t('lang.nextStep')}}</el-button>
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
  import yaml from "js-yaml";
  Vue.use(yaml);
  export default {
    name: "CreateByCustomStepOne",
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
        createByCustomForm: {
          templateData: ""
        },
        templateContent:this.templateDetail,
        fileList: [],
        rules: {
          templateData: [
            {type: 'required'}
          ]
        }
      }
    },
    mounted() {
       this.initForm = Object.assign({}, this.createByCustomForm);
    },
    methods: {
      handleChange(file, fileList) {
        this.fileList = fileList.slice(-1);
        let fielName = file.name;
        this.createByCustomForm.templateData = "";
        let suffix = fielName.substring(fielName.lastIndexOf("."), fielName.length);
        if (suffix != ".yaml") {
          this.$message.error(Vue.t('heat.selectyaml'));
          this.fileList = [];
          this.$refs.upload.clearFiles();
          return false;
        }
        try {
          let fr = new FileReader();
          fr.onload = (e) => {
            try {
              this.createByCustomForm.templateData = fr.result;
              let doc = yaml.safeLoad(fr.result);
              this.templateContent = doc;
            } catch (e1) {
              let msg = e1.message.length>50?e1.message.substring(0, 50):e1.message
              this.$message.error(Vue.t('heat.template_file_error')+":"+msg);
            }
          };
          fr.readAsText(file.raw, 'utf8');
        } catch (e) {
          this.$message.error(Vue.t('heat.template_file_error'));
        }
      },
      handlePreview(file) {
        try {
          let fr = new FileReader();
          fr.onload = (e) => {
            try {
            this.createByCustomForm.templateData = fr.result;
            let doc = yaml.safeLoad(fr.result);
            this.templateContent = doc;
          } catch (e1) {
            let msg = e1.message.length>50?e1.message.substring(0, 50):e1.message
            this.$message.error(Vue.t('heat.template_file_error')+":"+msg);
          }
          };
          fr.readAsText(file.raw, 'utf8');
        } catch (e) {
          this.$message.error(Vue.t('heat.template_file_error'));
        }
      },
      nextStep() {
        this.$refs.createByCustomForm.validate((valid) => {
          let me = this;
          if (valid) {
            // YAML文件格式验证
            let yamlValidate = true;
            try {
              let templateYaml = yaml.safeLoad(this.createByCustomForm.templateData);
              this.templateContent = templateYaml;
              if (typeof this.templateContent != "object") {
                yamlValidate = false;
              } else {
                let keyList = Object.keys(this.templateContent);
                if ((keyList.includes("HeatTemplateFormatVersion") || keyList.includes("heat_template_version") ||
                    keyList.includes("AWSTemplateFormatVersion")) && keyList.includes("resources")) {
                  yamlValidate = true;
                } else {
                  yamlValidate = false;
                }
              }
            } catch (e) {
              yamlValidate = false;
            }
            if (!yamlValidate) {
              this.$message.error(Vue.t('heat.template_data_error'));
              return false;
            }
            this.$emit("stepOneDone", this.templateContent);
          }
        });
      },
      cancel() {
        this.$emit("cancel");
      }
    }
  }
</script>
<style scoped>

</style>