<template>
  <el-dialog :title="$t('network.editFirewallStrategy')" :visible.sync="dialogVisible" :before-close="handleClose" size="tiny">
    <el-form ref="editform" :model="editform" class="me-required-form" label-width="100px" :rules="rule" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input  v-model="editform.name"></el-input>
      </el-form-item>
      <el-row><el-col :span="24">
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" v-model="editform.description"></el-input>
      </el-form-item>
      </el-col></el-row>
      <el-form-item :label="$t('network.whetherAudit')">
        <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="editform.audited"></el-switch>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="editConfirm" :disabled="isDiasbled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name:"EditStrategy",
  props: ["editId", "editName", "editDesc", "editaudited", "editshared"],
  data() {
    return {
      dialogVisible: false,
      loading:false,
      isDiasbled:false,
      editform: {
        name: "",
        description: "",
        shared: false,
        audited: false
      },
      rule: {
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
      this.$parent.$parent.active = "firewallStrategy";
      this.initDialog();
      this.editform.name = this.editName;
      this.editform.description = this.editDesc;
      this.editform.audited = this.editaudited;
    },
    methods: {
      initDialog() {
        var self = this;
        self.dialogVisible = true;
      },
      handleClose(done) {
        this.$emit("handleEditCancelShow", {});
        done();
      },
      cancel() {
        this.$emit("handleEditCancelShow", {});
      },
      editConfirm() {
        var self = this;
        var reqdata = {
          "firewall_policy":{
            "name": self.editform.name,
            "description": self.editform.description,
            "shared": self.editshared,
            "audited": self.editform.audited
          }
        };
        try {
        self.$refs.editform.validate(async(valid) => {
          if (valid) {
            self.loading = true;
            self.isDiasbled = true;
            let result = await self.$ajax({
              type: 'PUT',
              url: "api/neutron/v2.0/fw/firewall_policies/"+self.editId,
              data: JSON.stringify(reqdata),
              success: function(result) {
                self.$message.success(Vue.t('network.saveSuccess'));
                self.loading = false;
                self.isDiasbled = false;
                self.$emit("handleEditShow", {});
              },
              errFun(xhr, status) {
                if (xhr.status == "404") {
                  self.$emit("handleEditShow", {});
                }
                self.loading = false;
                self.isDiasbled = false;
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en:"Before edit firewall strategy name:" + self.editName + "After:" + self.editform.name,
                  zh_cn:"防火墙策略修改前:" + self.editName + "修改后：" + self.editform.name
                },
                target:Vue.logTarget.firewallStrategy
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