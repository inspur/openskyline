<template>
  <el-dialog :title="$t('base.newGroup')" :visible.sync="visible">
    <el-form ref="newGroupForm" label-width="100px" :rules="rules" :model="groupObj" class="me-required-form">
      <el-form-item :label="$t('base.name')" class="is-required" prop="name">
        <el-input auto-complete="off" v-model="groupObj.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.desc')" prop="desc">
        <el-input auto-complete="off" type="textarea" v-model="groupObj.desc"></el-input>
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
  name:"CreateOrg",
  data() {
    return {
      visible:false,
      saving: false,
      groupObj:{
        name: "",
        desc: ""
      },
      rules: {
        name: [
          {type: 'required'},
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        desc:[
          { type: 'maxSize', value: 255 }
        ]
      }
    }
  },
  mounted() {
  },
  methods:{
    show() {
      this.visible = true;
      if (this.$refs.newGroupForm) {
        this.$refs.newGroupForm.resetFields();
      }
    },
    async confirmFun() {
      let me = this;
      this.$refs.newGroupForm.validate(async (valid) => {
        if (!valid) {
          return;
        }
        me.saving = true;
        try {
          let ret = await this.$ajax({
            type: 'post',
            url: "api/keystone/v3/groups",
            data: JSON.stringify({
              group: {
                name: this.groupObj.name,
                description: this.groupObj.desc
              }
            }),
            log:{
              description:{
                en:"add group"+"("+this.groupObj.name+")",
                zh_cn:"新建组"+"("+this.groupObj.name+")"
              },
              target:Vue.logTarget.group
            }
          });
          me.saving = false;
          this.$emit("refreshData");
          me.visible = false;
        } catch (e) {
          me.saving = false;
          __DEV__ && console.error(e);
        }
      });
    }
  }
}
</script>