<template>
  <el-dialog :title="$t('base.edit')" :visible.sync="visible">
    <el-row style="margin-top:10px;">
      <el-col :span="1">
        <span>&nbsp;</span>
      </el-col>
      <el-col :span="10">
        <el-checkbox v-model="editObj.public">{{$t('base.public')}}</el-checkbox>
      </el-col>
      <el-col :span="1">
        <span>&nbsp;</span>
      </el-col>
      <el-col :span="10">
        <el-checkbox v-model="editObj.protected">{{$t('base.protected')}}</el-checkbox>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun">{{$t('base.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"",
  data() {
    return {
      visible:false,
      editObj: {
        namespace: "",
        description:"",
        display_name: "",
        public:false,
        protected:false
      }
    }
  },
  mounted() {
  },
  methods:{
    show(obj) {
      this.visible = true;
      this.editObj = $.extend({}, this.editObj, obj);
      this.editObj.public = obj.visibility=="public";
    },
    confirmFun() {
      this.update();
    },
    async update() {
      try {
        let ret = await this.$ajax({
          type: 'put',
          url: "api/glance/v2/metadefs/namespaces/"+this.editObj.namespace,
          data: JSON.stringify({
            namespace: this.editObj.namespace,
            protected: this.editObj.protected,
            visibility: this.editObj.public?"public":"private",
            description: this.editObj.description,
            display_name: this.editObj.display_name
          }),
          successMsg: Vue.t('base.saveSuccess'),
          log:{
            description:{
              en:"edit metadata"+"("+this.editObj.display_name+")",
              zh_cn:"编辑元数据"+"("+this.editObj.display_name+")"
            },
            target:Vue.logTarget.parameterSetting
          }
        })
        this.visible = false;
        this.$emit('refreshData');
      } catch (data) {
        console.log('更新失败，请联系管理员');
      }
    }
  }
}
</script>