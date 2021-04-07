<template>
  <el-dialog :title="$t('network.editSafeteam')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="100px" :rules="rules">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="sgName">
        <el-input class="col-12"  v-model="form.sgName"></el-input>
      </el-form-item>
      <el-row><el-col :span="24">
      <el-form-item :label="$t('lang.desc')" prop="description">
         <el-input class="col-12" type="textarea"  v-model="form.description"></el-input>
      </el-form-item>
      </el-col></el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="confirmEdit">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>  
</template>
<script type="text/javascript">
export default {
  name:"EditSafeteam",
  props: ["edit_name", "edit_desc", "edit_id"],
  data() {
    return {
      flag: false,
      dialogVisible: false,
      form: {
        sgName: "",
        description: ""
      },
      rules: {
        sgName: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: 'required'},
          {type: 'maxSize', value: 40}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
      self.form.sgName = this.edit_name;
      self.form.description = this.edit_desc;
      console.log("ID:"+this.edit_id);
    },
    handleClose(done) {
      this.$emit("handleEditShow", {});
      done();
    },
    cancel() {
      this.$emit("handleEditShow", {});
    },
    confirmEdit() {
      var self = this;
      let name = self.form.sgName;
      let desc = self.form.description;
      let editid = this.edit_id;
      let reqdata = {"security_group":{"name": name, "description": desc}};
      this.$refs.form.validate(async(valid) => {
      if (valid) {
          try {
            let result = self.$ajax({
              type: "PUT",
              url: "api/neutron/v2.0/security-groups/"+editid,
              data: JSON.stringify(reqdata),
              success: function(result) {
                self.$message.success(Vue.t('network.saveSuccess'));
                self.cancel();
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en:"Before edit Security Group:"+self.edit_name+", After edit Security Group:" + name,
                  zh_cn:"安全组修改前"+self.edit_name+"，安全组修改后:" + name
                },
                target:Vue.logTarget.securityGroup
              }
            });
          } catch (res) {
            console.log("Failed");
          }
        } else {
          return false;
        }
     });
    }
  }
}
</script>