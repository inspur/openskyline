<template>
  <el-dialog :title="title" :visible.sync="visible">
    <el-form ref="iPForm" label-width="100px" :model="ipModel" :rules="rules">
      <el-form-item :label="$t('base.ipAddress')" class="is-required" prop="ipAddress">
        <el-input auto-complete="off" v-model="ipModel.ipAddress"></el-input>
      </el-form-item>
      <el-form-item>
        <span>{{$t('base.ipBlackListRule')}}</span>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('base.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"addBlackIP",
  data() {
    return {
      title:this.$t('base.add'),
      visible:false,
      saving: false,
      ipModel: {
        ipAddress:"",
        id:""
      },
      type:"add",
      rules: {
        ipAddress: [
          {type: 'required'}
        ]
      }
    }
  },
  mounted() {
  },
  methods:{
    show(type, ipAddress, id) {
      this.visible = true;
      this.type = type;
      if (type!="add") {
        this.title = this.$t('base.edit');
        this.ipModel.ipAddress = ipAddress;
        this.ipModel.id = id;
      } else {
        this.title = Vue.t('base.add');
        this.ipModel= {ipAddress:"", id:""};
        if (this.$refs.iPForm) {
          this.$refs.iPForm.resetFields();
        }
      }
    },
    confirmFun() {
      let me = this;
      this.$refs.iPForm.validate(async (valid) => {
        if (!valid) {
          return;
        }
        me.saving = true;
        try {
          if (this.type=="add") { //新增
            await this.$ajax({
              type: 'post',
              url: "api/keystone/v3/inspur/system/ipblacklist",
              data:JSON.stringify({
                ip_blacklist:{ip_rule:this.ipModel.ipAddress}
              }),
              log:{
                description:{
                  en:"add black ip",
                  zh_cn:"添加黑名单"
                },
                target:Vue.logTarget.ipSetting
              }
            });
          } else { //编辑
            await this.$ajax({
              type: 'patch',
              url: "api/keystone/v3/inspur/system/ipblacklist/"+this.ipModel.id,
              data:JSON.stringify({
                ip_blacklist:{ip_rule:this.ipModel.ipAddress}
              }),
              log:{
                description:{
                  en:"edit black ip",
                  zh_cn:"编辑黑名单"
                },
                target:Vue.logTarget.ipSetting
              }
            });
          }
          this.visible = false;
          this.$emit("refreshData");
          me.saving = false;
        } catch (e) {
          me.saving = false;
          __DEV__ && console.error(e);
        }
      });
    }
  }
}
</script>