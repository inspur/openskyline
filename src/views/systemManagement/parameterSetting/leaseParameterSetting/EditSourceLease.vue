<template>
  <el-dialog :title="$t('base.edit')" :visible.sync="visible">
    <el-form ref="editForm" label-width="120px" v-loading="loading" :element-loading-text="$t('base.sendingData')" :rules="rules" :model="obj">
      <el-form-item :label="$t('base.resouceType')">
        <span>{{obj.type==1?$t('base.cloudHost'):(obj.type==2?$t('base.cloudPhysiceMachine'):$t('base.cloudDisk'))}}</span>
      </el-form-item>
      <el-form-item :label="$t('base.expirationReminder')" prop="remaining_days">
        <el-input-number :min="1" :max="30" v-model="obj.remaining_days" style="width:160px;"></el-input-number>
        <span>
          <el-tooltip effect="dark" :content="$t('base.enterRangeTitle')+':1~30'">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </span>
      </el-form-item>
      <el-form-item :label="$t('base.reminderMode')">
        <el-select v-model="obj.remind_manner" style="width:160px;">
          <el-option :label="$t('base.mail')" :value="1"></el-option>
          <el-option :label="$t('base.shortMessage')" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('base.treatmentMode')">
        <el-select v-model="obj.handle_manner" style="width:160px;">
          <el-option :label="$t('base.automaticallyDisable')" :value="1"></el-option>
          <el-option :label="$t('base.automaticallyRecovery')" :value="2"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false" :disabled="btnFlg">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :disabled="btnFlg">{{$t('base.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"editSourceLease",
  props:["id"],
  data() {
    return {
      visible:false,
      btnFlg:false,
      obj:{
        name:"",
        remaining_days:0,
        remind_manner:"",
        handle_manner:""
      },
      rules:{
        remaining_days:[
          {type: 'integer'}
        ]
      }
    }
  },
  mounted() {
  },
  methods:{
    show(obj) {
      this.visible = true;
      this.btnFlg = false;
      this.obj = $.extend({}, obj);
    },
    confirmFun() {
      let me = this;
      this.$refs.editForm.validate((valid) => {
        if (!valid) {
          return;
        }
        this.loading = true;
        this.btnFlg = true;
        let ret = this.$ajax({
          type: 'PATCH',
          url: "api/keystone/v3/inspur/tenancy/resource/param/"+this.id,
          data: JSON.stringify({
            param:{
              "remaining_days":this.obj.remaining_days,
              "remind_manner":this.obj.remind_manner,
              "handle_manner":this.obj.handle_manner
            }
          }),
          successMsg:Vue.t('saveSuccess'),
          successFun() {
            me.loading = false;
            me.btnFlg = false;
            me.visible = false;
            me.$emit("refreshData");
          },
          errFun() {
            me.loading = false;
            me.btnFlg = false;
          },
          log:{
            description:{
              en:"resource lease parameter setting modification",
              zh_cn:"资源租期参数设置修改"
            },
            target:Vue.logTarget.parameterSetting
          }
        })
      })
    }
  }
}
</script>