<template>
  <el-dialog :title="$t('base.newDepartment')" :visible.sync="visible">
    <el-form ref="newDepartForm" :model="newDepart" label-width="160px" :rules="rules" class="me-required-form">
      <el-form-item :label="$t('base.superiorDepartment')">
        <!-- <el-input v-model="newDepart.parentDept" auto-complete="off" :readonly="true"></el-input> -->
        <span>{{newDepart.parentDept}}</span>
      </el-form-item>
      <el-form-item :label="$t('base.name')" class="is-required" prop="name">
        <el-input v-model="newDepart.name" auto-complete="off"></el-input>
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
  name: "NewDepart",
  props: { node: {} },
  data() {
    return {
      newDepart: {
        name: "",
        parentDept: ""
      },
      visible: false,
      saving: false,
      rules: {
        name: [
          { type: 'required' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ]
      }
    }
  },
  mounted() {},
  methods: {
    show() {
      this.visible = true;
      if (this.$refs.newDepartForm) {
        this.$refs.newDepartForm.resetFields();
      }
      this.newDepart.parentDept = this.node.name;
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      this.$refs.newDepartForm.validate((valid) => {
        if (!valid) {
          return;
        }
        this.addDept();
      });
    },
    async addDept() {
      let me = this;
      me.saving = true;
      try {
        let ret = await this.$ajax({
          type: 'post',
          url: "api/keystone/v3/inspur/departments",
          data: JSON.stringify({
            department: {
              name: this.newDepart.name,
              parent_id: this.node.id
            }
          }),
          successMsg:Vue.t('base.saveSuccess'),
          log:{
            description:{
              en:"add department"+"("+me.newDepart.name+")",
              zh_cn:"新建部门"+"("+me.newDepart.name+")"
            },
            target:Vue.logTarget.department
          }
        });
        this.$emit("refreshData");
        this.visible = false;
        me.saving = false;
      } catch (e) {
        me.saving = false;
        __DEV__ && console.error(e);
      }
    }
  }
}

</script>
