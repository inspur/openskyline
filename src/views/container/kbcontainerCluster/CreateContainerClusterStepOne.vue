<template>
  <div>
  <el-form class="margin-tb20 me-required-form" ref="createTemplateForm" :model="createTemplateForm" :rules=rules label-width="100px">
    <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
      <el-input class="col-12" v-model="createTemplateForm.name" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item :label="$t('lang.desc')" prop="description">
      <el-input class="col-12" type="textarea"  v-model="createTemplateForm.description"></el-input>
    </el-form-item>
  </el-form>
  <div class="me-form-footer">
    <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    <el-button @click="nextStep" type="primary" >{{$t('lang.nextStep')}}</el-button>
  </div>
  </div>
</template>
<script>
  export default {
    name: "CreateContainerClusterStepOne",
    data() {
      return {
        createTemplateForm: {
          name:"",
          description: ""
        },
        rules: {
          name: [
            { type: 'required', trigger: 'blur change' },
            { type: 'maxSize', value: 40 },
            { type: 'onlyLetter_MinusNumberChinese' }
          ],
          description: [
            {type: 'maxSize', value:255}
          ]
        }
      }
    },
    methods: {
      nextStep() {
        this.$refs.createTemplateForm.validate((valid) => {
          if (valid) {
            this.$emit("stepOneDone", this.createTemplateForm);
          } else {
            return false;
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