<template>
  <el-dialog :title="$t('base.edit')" :visible.sync="visible">
    <el-form ref="editLeaseForm" label-width="100px" :model="leaseObj" :rules="rules" v-loading="loading" :element-loading-text="$t('base.sendingData')">
      <el-form-item :label="$t('base.timeLength')" prop="duration" v-if="leaseObj.unit!='F'">
        <el-input-number :min="1" :max="99999999" v-model="leaseObj.duration" style="width:280px;"></el-input-number>
        <span>
          <el-tooltip effect="dark" :content="$t('base.enterRange')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </span>
      </el-form-item>
      <el-form-item :label="$t('base.unit')">
        <el-select v-model="leaseObj.unit" style="width:280px;">
          <el-option :label="$t('base.day')" value="D"></el-option>
          <el-option :label="$t('base.week')" value="W"></el-option>
          <el-option :label="$t('base.month')" value="M"></el-option>
          <el-option :label="$t('base.quarter')" value="Q"></el-option>
          <el-option :label="$t('base.year')" value="Y"></el-option>
          <el-option :label="$t('base.forever')" value="F"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun">{{$t('base.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"editLease",
  props:["id"],
  data() {
    return {
      visible:false,
      leaseObj: {
        duration:1,
        unit: "D"
      },
      rules:{
        duration:[
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
      this.leaseObj = $.extend({}, this.leaseObj, obj);
    },
    confirmFun() {
      let me = this;
      this.$refs.editLeaseForm.validate((valid) => {
        if (!valid&&this.leaseObj.unit=="F") {
          return;
        }
        me.loading = true;
        let ret = this.$ajax({
          type: 'patch',
          url: "api/keystone/v3/inspur/tenancy/duration/param/"+this.id,
          data:JSON.stringify({
            param:{
              "duration":(this.leaseObj.duration==null?null:this.leaseObj.duration)+"",
              "unit":this.leaseObj.unit
            }
          }),
          successMsg:Vue.t('base.saveSuccess'),
          successFun() {
            me.loading = false;
            me.visible = false;
            me.$emit("refreshData")
          },
          errFun() {
            me.loading = false;
          },
          log:{
            description:{
              en:"long term parameters of edit lease term",
              zh_cn:"编辑租期时长参数"
            },
            target:Vue.logTarget.parameterSetting
          }
        });
      })
    }
  }
}
</script>