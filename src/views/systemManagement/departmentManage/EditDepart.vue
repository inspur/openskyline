<template>
  <el-dialog :title="$t('lang.edit')" :visible.sync="visible">
    <el-form ref="editDepartForm" :model="editDepart" label-width="100px" :rules="rules" class="me-required-form">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input v-model="editDepart.name" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"EditDepart",
  props:["id"],
  data() {
    return {
      editDepart:{
        name:""
      },
      visible:false,
      saving: false,
      rules: {
        name: [
          {type: 'required'},
          {type: 'maxSize', value: 40},
          {type: 'onlyLetter_MinusNumberChinese'}
        ]
      }
    }
  },
  mounted() {
  },
  methods:{
    show(name) {
      this.visible = true;
      this.editDepart.name = name;
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      let me = this;
      this.$refs.editDepartForm.validate((valid) => {
        if (!valid) {
          return;
        }
        me.saving = true;
        let ret = this.$ajax({
          type: 'patch',
          url: "api/keystone/v3/inspur/departments/"+this.id,
          data:JSON.stringify({
            department:{
              name:this.editDepart.name
            }
          }),
          successMsg:Vue.t('base.saveSuccess'),
          errFun() {
            me.saving = false;
          },
          successFun() {
            me.visible = false;
            me.$emit("refreshData");
            me.saving = false;
          },
          log:{
            description:{
              en:"edit department"+"("+me.editDepart.name+")",
              zh_cn:"编辑部门"+"("+me.editDepart.name+")"
            },
            target:Vue.logTarget.department
          }
        })
      });
    }
  }
}
</script>