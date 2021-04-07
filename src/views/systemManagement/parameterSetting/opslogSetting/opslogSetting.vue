<template>
<div>
  <el-row :gutter="10" v-loading="loading" :element-loading-text="text">
    <el-col :span="12">
      <el-card>
        <div slot="header" class="clearfix">
          <span>{{$t('operationAnalysis.logdataPeriod')}}</span>
          <el-switch v-if="false" v-model="obj.deleteSwitch" style="float:right;" @change="deleteLogChange"></el-switch>
        </div>
        <el-form ref="logSettingForm" label-width="50px" :rules="rules" :model="obj">
          <el-form-item :label="$t('base.timeLength')" prop="log_auto_delete_days">
            <el-input-number :controls="false" :min="1" :max="365" style="width:214px;" v-model="obj.log_auto_delete_days" :disabled="!(obj.deleteSwitch)"></el-input-number>
            <span>{{$t('base.day')}}</span>
            <span>
              <el-tooltip effect="dark" :content="$t('operationAnalysis.deleteLogWarn')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </span>
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" @click="recordSettingClick" :disabled="!(obj.deleteSwitch)">{{$t('base.confirm')}}</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</div>
</template>
<script>
export default {
  name:"project",
  data() {
    return {
      text:Vue.t('base.loadingData'),
      loadText:Vue.t('base.loadingData'),
      saveText:Vue.t('base.sendingData'),
      loading:false,
      obj:{
        deleteSwitch:true,
        log_auto_delete_days:""
      },
      rules:{
        log_auto_delete_days:[
          {type: 'integer'}
        ]
      }
    }
  },
  components: {
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      let me = this;
      this.loading = true;
      let ret = this.$ajax({
        type: 'get',
        url: "api/venus/v1/custom_config?id=es_index_length",
        successFun(data) {
          if (data) {
            me.obj.log_auto_delete_days = data.value;
          }
        },
        complete: function(XMLHttpRequest, textStatus) {
          me.loading = false;
        }
      })
    },
    recordSettingClick() {
      let me = this;
      this.$refs.logSettingForm.validate((valid) => {
        if (!valid) {
          return;
        }
        me.loading = true;
        me.text = me.saveText;
        let ret = this.$ajax({
          type: 'POST',
          url: "api/venus/v1/custom_config",
          data:JSON.stringify({
            id:"es_index_length",
            value:me.obj.log_auto_delete_days
          }),
          successMsg:Vue.t('base.saveSuccess'),
          successFun(data) {
            me.loading = false;
          },
          errFun() {
            me.loading = false;
          },
          log:{
            description:{
              en:"Operation log set",
              zh_cn:"运维日志设置"
            },
            target:Vue.logTarget.parameterSetting
          }
        })
      })
    },
    deleteLogChange(value) {
    }
  }
}
</script>
