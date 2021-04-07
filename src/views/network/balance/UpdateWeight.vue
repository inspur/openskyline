<template>
  <el-dialog  :title="$t('network.modify')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="updateWeightForm" label-width="80px" v-loading="loading" class="me-required-form" :model="updateWeightForm" :rules="rules">
      <el-form-item :label="$t('network.weight')">
        <el-input-number class="col-20" v-model="weight" :min="1" :max="256"></el-input-number>
      </el-form-item>
      <el-form-item :label="$t('network.manageStatus')" class="is-required" prop="manageStatus">
        <el-select class="col-20" v-model="updateWeightForm.manageStatus">
          <el-option label="UP" :value=true :key="true"></el-option>
          <el-option label="DOWN" :value=false :key="false"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('base.port')" class="is-required" prop="port">
        <el-input class="col-20" v-model="updateWeightForm.port"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="updateWeightClick" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: "UpdateWeight",
  props: ["weightInfo", "poolsId", "poolsName", "memberInfo"],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      isDisabled: false,
      weight: 1,
      updateWeightForm: {
        manageStatus: "",
        port: ""
      },
      rules: {
        manageStatus: [
           {type: 'requiredNet'}
        ],
        port: [
          {type: 'requiredNet'},
          {type: "integer"},
          {type: "min", value: 1},
          {type: 'max', value:65535}
        ]
      },
      log: {
        weight: "权重",
        manageStatus: "管理状态",
        port: "端口"
      },
      editBefore: {
        weight: "",
        manageStatus: "",
        port: ""
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
      self.editBefore.weight = self.weight = self.weightInfo["weight"];
      self.editBefore.manageStatus = (self.weightInfo.admin_state_up === true) ? "UP" : "DOWN";
      self.editBefore.port = self.weightInfo.protocol_port;
      self.updateWeightForm.manageStatus = self.weightInfo.admin_state_up;
      self.updateWeightForm.port = self.weightInfo.protocol_port;
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
   async updateWeightClick() {
    let self = this;
    try {
      self.$refs.updateWeightForm.validate(async (valid) => {
        if (!valid) {
          return false;
        }
        if (!self.checkPort(self.updateWeightForm.port)) {
          this.$notify.info({
            message: Vue.t("network.addmemberNote") + "(" + this.weightInfo.address + "，" + self.updateWeightForm.port + ")"
          });
          return false;
        }
        self.loading = true;
        self.isDisabled = true;
        let reqdata ={"member":{
          weight:self.weight,
          admin_state_up: self.updateWeightForm.manageStatus,
          protocol_port : self.updateWeightForm.port
        }}
        let editBefore = "";
        let editAfter = "";
        let afterData = {
          weight:self.weight,
          manageStatus: (self.updateWeightForm.manageStatus === true) ? "UP" : "DOWN",
          port: self.updateWeightForm.port
        }
        for (let [k, v] of Object.entries(self.log)) {
          let before = `${v}: ${self.editBefore[k]} `;
          let after = `${v}: ${afterData[k]} `;
          editBefore += before;
          editAfter += after;
        }
        await self.$ajax({
          type: 'PUT',
          url: "api/octavia/v2.0/lbaas/pools/"+self.poolsId+"/members/"+self.weightInfo["id"],
          data: JSON.stringify(reqdata),
          complete: function(XMLHttpRequest, textStatus) {
            self.loading = false;
            self.isDisabled = false;
          },
          success: function() {
            self.$message.success(Vue.t("network.saveSuccess"));
            self.$emit("handleEditShow", {});
          },
          log: {
            description: {
              en: "Modify Pool Member:(IP,PORT)=(" + this.weightInfo.address + "，" + this.weightInfo.protocol_port + ")",
              zh_cn: "更新资源池成员：（IP，PORT）=（" + this.weightInfo.address + "，" + this.weightInfo.protocol_port + "）" + "修改前:" + editBefore + " 修改后:" + editAfter
            },
            key: "name",
            target: Vue.logTarget.balance
          }
        });
        });
      } catch (res) {
      }
    },
    checkPort(port) {
      if (this.memberInfo == 0) {
        return true;
      } else {
        let flg = true;
        for (let i=0; i < this.memberInfo.length; i++) {
          let member = this.memberInfo[i];
          if (this.weightInfo["id"] != member.id) {
            if (this.weightInfo["address"] == member.address && member.protocol_port == port) {
              flg = false;
            }
          }
        }
        return flg;
      }
    }
  }
}
</script>
