<template>
  <el-dialog :title="$t('network.addIPpare')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
    <el-alert :title="$t('network.ippareNote1')" type="info" show-icon :closable="false"></el-alert>
    <el-form ref="ipareform" :model="ipareform" label-width="110px" :rules="rules" class="me-required-form" style="padding:10px;" v-loading="loading">
      <el-form-item :label="$t('network.iporcidr')" class="is-required" prop="ipaddress">
        <el-input class="col-15" v-model="ipareform.ipaddress" ></el-input>
        <el-tooltip  effect="dark" :content="$t('network.singleip')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.macAddress')" prop="mac">
        <el-input class="col-15" v-model="ipareform.mac"></el-input>
        <el-tooltip  effect="dark" :content="$t('network.ippareNote2')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="addaddressClick" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>  
</template>
<script>
export default {
  name: 'AddIPare',
  props: ["totalData", "portId"],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      isDisabled: false,
      ipareform: {
        ipaddress: "",
        mac: ""
      },
      rules: {
        ipaddress: [
          {type: 'requiredNet'},
          {type: 'allip'}
        ],
        mac: [
          {type: 'mac'}
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
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    addaddressClick() {
      let self = this;
      self.$refs.ipareform.validate(async(valid) => {
        if (valid) {
          self.isDisabled = true;
          let alloweAddress = [];
          if (self.ipareform.ipaddress === "") {
            return;
          }
          if (self.ipareform.mac==="") {
            alloweAddress.push({
              "ip_address": self.ipareform.ipaddress
            });
          } else {
            alloweAddress.push({
              "ip_address": self.ipareform.ipaddress,
              "mac_address": self.ipareform.mac
            });
          }
          for (let i = self.totalData.length - 1; i >= 0; i--) {
            let obj = self.totalData[i];
            let newobj = {};
            newobj["ip_address"] = obj["ip_address"];
            newobj["mac_address"] = obj["mac_address"];
            alloweAddress.push(newobj);
          }
          let reqdata = {"port":{
            "allowed_address_pairs": alloweAddress
            }
          };
          self.loading = true;
          self.$ajax({
            type: "PUT",
            url: "api/neutron/v2.0/ports/"+this.portId,
            data: JSON.stringify(reqdata),
            success: function(result) {
              self.$notify({
                message: Vue.t('network.saveSuccess'),
                type: "success"
              });
              self.$emit("handleAddpareShow", {});
              self.loading = false;
            },
            errFun() {
              self.loading = false;
              self.isDisabled = false;
            },
            errorKey: "NeutronError",
            log:{
              description:{
                en:"Add IP Pair:"+self.ipareform.ipaddress,
                zh_cn:"新增可用地址对:"+self.ipareform.ipaddress
              },
              target:Vue.logTarget.port
            }
          });
          return true;
        } else {
          return false;
        }
      });
    }
  }
}
</script>
