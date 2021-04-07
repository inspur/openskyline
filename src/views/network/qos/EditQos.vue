<template>
  <el-dialog :title="$t('network.editQosstrategy')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-12"  v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
         <el-input class="col-12" type="textarea"  v-model="form.description"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="confirmEdit" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>  
</template>
<script type="text/javascript">
export default {
  name:"EditQos",
  props: ["editRow"],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      isDisabled: false,
      form: {
        name: "",
        description: ""
      },
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: 'requiredNet'},
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
      this.dialogVisible = true;
      this.form.name = this.editRow["name"];
      this.form.description = this.editRow["description"];
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    confirmEdit() {
      let self = this;
      let name = self.form.name;
      let desc = self.form.description;
      let reqdata = {"policy":{"name": name, "description": desc}};
      self.$refs.form.validate(async(valid) => {
        if (valid) {
          try {
            self.isDisabled = true;
            self.loading = true;
            let result = self.$ajax({
              type: "PUT",
              url: "api/neutron/v2.0/qos/policies/"+self.editRow["id"],
              data: JSON.stringify(reqdata),
              successMsg: Vue.t('network.saveSuccess'),
              complete: function(XMLHttpRequest, textStatus) {
                self.loading = false;
                self.isDisabled = false;
                self.$emit("handleEditShow", {});
              },
              success: function(result) {
                self.$emit("handleEditShow", {});
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en:"Before edit QoS:"+self.editRow["name"]+", After edit QoS:" + name,
                  zh_cn:"QoS策略名称修改前："+self.editRow["name"]+"，QoS策略名称修改后:" + name
                },
                target:Vue.logTarget.qosList
              }
            });
          } catch (res) {
          }
        } else {
          return false;
        }
     });
    }
  }
}
</script>