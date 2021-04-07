<template>
<div v-loading="finishMask">
  <el-form class="margin-tb20 me-required-form" ref="createTemplateForm" :model="createTemplateForm" v-loading="loading" :rules=rules label-width="100px">
    <el-form-item :label="$t('container.imageLibray')" prop="insecure_registry" class="is-required">
      <el-select class="col-12" v-model="createTemplateForm.insecure_registry">
        <el-option v-for="item in imageServerListOptions" :key="item.id" :label="item.name" :value="item.ip"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('container.timeout')" prop="create_timeout" class="is-required">
      <el-input-number class="col-12" v-model="createTemplateForm.create_timeout" :min="1" :max="99999">
      </el-input-number>{{$t('container.minute')}}
    </el-form-item>
    <el-form-item label="" prop="disable_rollback">
      <el-checkbox v-model="createTemplateForm.disable_rollback">{{$t('heat.rollbackOnFail')}}</el-checkbox>
      <el-tooltip placement="right-start">
        <div slot="content">{{$t('heat.rollbackOnFailDesc')}}</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
  </el-form>
  <div class="me-form-footer">
    <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    <el-button @click="prevStep" type="primary" >{{$t('lang.preStep')}}</el-button>
    <el-button @click="nextStep" type="primary" >{{$t('lang.finish')}}</el-button>
  </div>
</div>
</template>
<script>
  export default {
    name: "CreateContainerClusterStepFour",
    data() {
      return {
        createTemplateForm: {
          insecure_registry:"",
          create_timeout: '60',
          disable_rollback: false
        },
        loading:false,
        finishMask:false,
        serverAddr:"",
        imageServerListOptions:[],
        imageListOptions:[],
        imageTagOptions:[],
        rules: {
          insecure_registry: [
            {type: 'required'}
          ],
          create_timeout: [
            {type: 'required', trigger: 'blur change'},
            {type:'integer'}
          ]
        }
      }
    },
    mounted() {
      this.getImageServerList();
    },
    methods: {
      async getImageServerList() {
        var self = this;
        self.loading = true;
        try {
          let ajaxParam = {
            type: 'post',
            url: "api/cetus/v1/harbor/index",
            data:JSON.stringify({
              "filed":"", "dir":""
            })
          };
          let ret = await this.$ajax(ajaxParam);
          self.loading = false;
          let result = ret.result;
          let dataList = [];
          result.forEach(function(item, index) {
            if (item.status == "OK") {
              dataList.push(item);
            }
          });
          self.imageServerListOptions = dataList;
          self.createTemplateForm.insecure_registry = dataList[0].ip;
        } catch (data) {
          self.loading = false;
        }
      },
      prevStep() {
        this.$emit("prevStep", 2);
      },
      nextStep() {
        this.$refs.createTemplateForm.validate((valid) => {
          if (valid) {
            this.createTemplateForm.disable_rollback = !this.createTemplateForm.disable_rollback;
            this.$emit("stepFourDone", this.createTemplateForm);
          } else {
            return false;
          }
        });
      },
      cancel() {
        this.$emit("cancel");
      },
      showFinishMask() {
        this.finishMask = true;
      },
      hideFinishMask() {
        this.finishMask = false;
      }
    }
  }
</script>
<style scoped>

</style>