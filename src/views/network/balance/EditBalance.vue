<template>
  <el-dialog :title="$t('lang.modify')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
    <el-form label-width="80px" :rules="rule" v-loading="loading" ref="editform" :model="editform" class="me-required-form">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input v-model="editform.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" v-model="editform.description"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.ipaddress')">
        <el-input :disabled="true" v-model="editform.ipaddress"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.subnet')">
        <el-input :disabled="true" v-model="editform.subnet"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="handleEditConfirm" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: "EditBalance",
  props: ["edit_id", "edit_name", "edit_description", "edit_ipaddress", "edit_subnet"],
  data() {
    return {
      dialogVisible: false,
      editform: {
        name: "",
        description: "",
        ipaddress: "",
        subnet: ""
      },
      loading: false,
      isDisabled: false,
      roleType: Vue.roleType + "",
      rule: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: "requiredNet"},
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
      let self = this;
      self.dialogVisible = true;
      self.editform.name = self.edit_name;
      self.editform.description = self.edit_description;
      self.editform.ipaddress = self.edit_ipaddress;
      let subnets = Vue.subnetsList;
      for (let i = subnets.length - 1; i >= 0; i--) {
        let subnet = subnets[i];
        if (subnet.id === self.edit_subnet) {
          self.editform.subnet = subnet.name;
        }
      }
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    handleEditConfirm() {
      let self = this;
      let reqdata = {
        "loadbalancer":{
          "name": self.editform.name,
          "description": self.editform.description
        }
      };
      try {
        self.$refs.editform.validate(async(valid) => {
          if (valid) {
            self.isDisabled = true;
            self.loading = true;
            self.$ajax({
              type: 'PUT',
              url: "api/octavia/v2.0/lbaas/loadbalancers/"+self.edit_id,
              data: JSON.stringify(reqdata),
              successMsg: Vue.t("network.saveSuccess"),
              complete:function(XMLHttpRequest, textStatus) {
                self.loading = false;
                self.isDisabled = false;
                self.$emit("handleEditShow", {});
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en:"Before edit Balance name:"+self.edit_name+", After edit Balance name:"+self.editform.name,
                  zh_cn:"负载均衡器名称修改前："+self.edit_name+"，负载均衡器名称修改后:"+self.editform.name
                },
                target:Vue.logTarget.balance
              }
            });
            return true;
          } else {
            return false;
          }
        });
      } catch (res) {
        console.log("error");
      }
    }
  }
}
</script>