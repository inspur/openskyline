<template>
  <el-dialog :title="$t('base.edit')" :visible.sync="visible">
    <el-form ref="editGroupFom" label-width="100px" :rules="rules" :model="groupObj" class="me-required-form">
      <el-form-item :label="$t('base.name')" class="is-required" prop="name">
        <el-input auto-complete="off" v-model="groupObj.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.desc')" prop="description">
        <el-input auto-complete="off" type="textarea" v-model="groupObj.description"></el-input>
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
  name:"EditOrg",
  data() {
    return {
      visible:false,
      saving: false,
      groupObj:{
        name: "",
        description: ""
      },
      rules: {
        name: [
          {type: 'required'},
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        description:[
          { type: 'maxSize', value: 255 }
        ]
      }
    }
  },
  mounted() {
  },
  methods:{
    show(obj) {
      this.visible = true;
      this.groupObj = $.extend({}, obj);
    },
    confirmFun() {
      let me = this;
      this.$refs.editGroupFom.validate(async (valid) => {
        if (!valid) {
          return;
        }
        me.saving = true;
        try {
          let ret = await this.$ajax({
            type: 'patch',
            url: "api/keystone/v3/groups/"+this.groupObj.id,
            data: JSON.stringify({
              group: {
                name: this.groupObj.name,
                description: this.groupObj.description
              }
            }),
            log:{
              description:{
                en:"edit group"+"("+this.groupObj.name+")",
                zh_cn:"编辑组"+"("+this.groupObj.name+")"
              },
              target:Vue.logTarget.group
            }
          });
          me.$emit("refreshData");
          me.saving = false;
          me.visible = false;
        } catch (e) {
          me.saving = false;
          __DEV__ && console.error(e);
        }
      })
    }
  }
}
</script>