<template>
  <div>
  <el-form class="margin-tb20 me-required-form" ref="createTemplateForm" :model="createTemplateForm" :rules=rules label-width="120px">
    <el-form-item label="Folating IP" prop="floating_ip_enabled">
      <el-switch :on-text="$t('lang.enable')" :off-text="$t('lang.disable')" v-model="createTemplateForm.floating_ip_enabled" @change="floatingipChange"></el-switch>
    </el-form-item>
    <el-form-item :label="$t('container.externalNetwork')" prop="external_network_id" class="is-required" v-if="createTemplateForm.floating_ip_enabled==true" key="external_network_id">
      <el-select class="col-12" filterable v-model="createTemplateForm.external_network_id">
        <el-option v-for="item in externalListOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select>
      <el-tooltip placement="right-start">
        <div slot="content">{{$t('container.externalNetworkDesc')}}</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('container.clusterNetwork')" prop="fixed_network" :class="createTemplateForm.floating_ip_enabled==true?'':'is-required'" key="fixed_network">
      <el-select class="col-12" v-model="createTemplateForm.fixed_network" @change="fixedNetChange" clearable filterable >
        <el-option v-for="item in fixedNetListOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select>
      <el-tooltip placement="right-start">
        <div slot="content" v-html="$t('container.fixedNetworkDesc')"></div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('container.clusterSubnetwork')" prop="fixed_subnet" :class="createTemplateForm.floating_ip_enabled==true?'':'is-required'" key="fixed_subnet">
      <el-select class="col-12" v-model="createTemplateForm.fixed_subnet" @change="fixedsubnetChange" clearable filterable>
        <el-option v-for="item in fixedSubnetListOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select>
      <div class="el-form-item__error" id="fixed_subnet_error" hidden>{{$t('container.required')}}</div>
      <el-tooltip placement="right-start">
        <div slot="content" v-html="$t('container.subnetNote1')+createTemplateForm.cluster_cidr+$t('container.or')+createTemplateForm.service_cidr+$t('container.subnetNote2')"></div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('container.cniPlus')" prop="network_driver" class="is-required" key="network_driver">
      <el-select class="col-12" filterable v-model="createTemplateForm.network_driver">
        <el-option label="flannel" value="flannel"></el-option>
        <el-option label="calico" value="calico"></el-option>
      </el-select>
      <el-tooltip placement="right-start">
        <div slot="content" v-html="$t('container.cniTips')"></div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    
    <el-collapse v-model="activeName" @change="collapseChange">
      <el-collapse-item :title="$t('container.advanceSet')" name="1">
        <el-form-item label="Pod CIDR" prop="cluster_cidr" class="is-required">
          <el-input class="col-12" v-model="createTemplateForm.cluster_cidr" auto-complete="off"></el-input>
          <el-tooltip placement="right-start">
            <div slot="content" v-html="$t('container.podcidrNote')"></div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="Service CIDR" prop="service_cidr" class="is-required">
          <el-input class="col-12" v-model="createTemplateForm.service_cidr" auto-complete="off"></el-input>
          <el-tooltip placement="right-start">
            <div slot="content" v-html="$t('container.servercidrNote')"></div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="DNS Server IP" prop="dns_server_ip" class="is-required">
          <el-input class="col-12" v-model="createTemplateForm.dns_server_ip" auto-complete="off"></el-input>
          <el-tooltip placement="right-start">
            <div slot="content" v-html="$t('container.dnsserveripNote')"></div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>    
  </el-form>
  <div class="me-form-footer">
    <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    <el-button @click="prevStep" type="primary" >{{$t('lang.preStep')}}</el-button>
    <el-button @click="nextStep" type="primary" >{{$t('lang.nextStep')}}</el-button>
  </div>
  </div>
</template>
<script>
  export default {
    name: "CreateContainerClusterStepThree",
    data() {
      return {
        createTemplateForm: {
          floating_ip_enabled:true,
          external_network_id:"",
          fixed_network:"",
          fixed_subnet:"",
          cluster_cidr:"10.42.0.0/16",
          service_cidr:"10.43.0.0/16",
          dns_server_ip:"10.43.0.10",
          network_driver:"flannel"
        },
        fixed_network_Label:'',
        externalListOptions:[],
        fixedNetListOptions:[],
        fixedSubnetListOptions:[],
        networkAdvance:false,
        activeName:[],
        rules: {
          external_network_id: [
            {type: 'required'}
          ],
          fixed_network:[],
          cluster_cidr: [
            {type: 'required'},
            {type: "cidr4cidr6"}
          ],
          service_cidr: [
            {type: 'required'},
            {type: "cidr4cidr6"}
          ],
          dns_server_ip: [
            {type: 'required'},
            {type: "ipv4oripv6"}
          ]
        }
      }
    },
    created() {
       this.getNetworkList();
    },
    methods: {
      fixedNetChange(val) {
        if (val) {
          this.getSubnetList(val);
          let obj = {};
          obj = this.fixedNetListOptions.find((item) => {
            return item.id === val;
          });
          this.fixed_network_Label = obj.id;
          this.rules.fixed_network = [{type: 'required'}];
          if (this.createTemplateForm.fixed_subnet == "") {
            $("#fixed_subnet_error").show();
            return false;
          } else {
            $("#fixed_subnet_error").hide();
          }
        } else {
          this.fixed_network_Label = "";
          this.createTemplateForm.fixed_subnet = "";
          if (this.createTemplateForm.floating_ip_enabled) {
            this.rules.fixed_network = [];
          } else {
            this.rules.fixed_network = [{type: 'required'}];
          }
          this.fixedSubnetListOptions = [];
          $("#fixed_subnet_error").hide();
        }
        this.$refs.createTemplateForm.validateField('fixed_network');
        this.$refs.createTemplateForm.validateField('fixed_subnet');
        return true;
      },
      fixedsubnetChange(val) {
        if (this.createTemplateForm.fixed_network == "") {
          $("#fixed_subnet_error").hide();
        } else {
          if (val) {
            $("#fixed_subnet_error").hide();
          } else {
            $("#fixed_subnet_error").show();
            return false;
          }
        }
        return true;
      },
      floatingipChange(val) {
        if (val == false) {
          this.rules.fixed_network = [{type: 'required', trigger:'change'}];
        } else {
          this.rules.external_network_id = [{type: 'required', trigger:'change'}];
          this.rules.fixed_network = [];
          this.$refs.createTemplateForm.resetFields();
        }
        $("#fixed_subnet_error").hide();
      },
      async getNetworkList() {
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/networks"
          });
          let dataList = response.networks;

          if (dataList && dataList.length > 0) {
            let projectid = this.$cookie.get("pid");
            for (let i = 0; i < dataList.length; i++) {
              let publicnetwork = dataList[i];
              if (publicnetwork["router:external"] === true &&
                (publicnetwork["project_id"] === projectid || publicnetwork["shared"] === true )) {
                this.externalListOptions.push(publicnetwork);
              } else if (publicnetwork["router:external"] === false &&
                (publicnetwork["project_id"] === projectid || publicnetwork["shared"] === true )) {
                this.fixedNetListOptions.push(publicnetwork);
              }
            }
          }
        } catch (data) {
        }
      },
      async getSubnetList(netId) {
        this.createTemplateForm["fixed_subnet"] = "";
        if (netId) {
          try {
            let response = await this.$ajax({
              type: 'get',
              url: "api/neutron/v2.0/subnets?network_id=" + netId
            });
            let dataList = response.subnets;
            this.fixedSubnetListOptions = dataList;
          } catch (data) {
          }
        }
      },
      collapseChange(val) {
        if (val == "1") {
          this.networkAdvance = true;
        }
      },
      prevStep() {
        this.$emit("prevStep", 1);
      },
      nextStep() {
        let self = this;
        this.$refs.createTemplateForm.validate((valid) => {
          if (valid) {
            if (!self.fixedsubnetChange(self.createTemplateForm.fixed_subnet)) {
              return false;
            }
            let newFormData = Object.assign({}, this.createTemplateForm);
            if (this.fixed_network_Label === "") {
              newFormData.fixed_network = null;
            } else {
              newFormData.fixed_network = this.fixed_network_Label;
            }
            if (this.createTemplateForm.fixed_subnet === "") {
              newFormData.fixed_subnet = null;
            }
            if (this.networkAdvance) {
              let regCIDR = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2}((\/[1-9])|(\/[12][0-9])|(\/3[012])))|(2[0-4][0-9])((\/[1-9])|(\/[12][0-9])|(\/3[012]))|(25[0-5])((\/[1-9])|(\/[12][0-9])|(\/3[012])))$/;
              let regIP = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
              let regIPv6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
              let dnsServerIp = self.createTemplateForm.dns_server_ip;
              if (regIP.test(dnsServerIp)) {
                dnsServerIp = self.removeZerofromip(dnsServerIp);
              } else {
                dnsServerIp = self.removeZerofromipv6(dnsServerIp);
              }
              let cidrFront = self.createTemplateForm.service_cidr.split("/")[0];
              let serviceCidr = self.createTemplateForm.service_cidr;
              if (regIP.test(cidrFront)) {
                serviceCidr = self.removeZerofromCidr(serviceCidr);
              } else {
                let cidrback = self.createTemplateForm.service_cidr.split("/")[1];
                serviceCidr = self.removeZerofromipv6(cidrFront) + "/" + parseInt(cidrback);
              }
              let gatewayObj = {
                ip:dnsServerIp,
                cidr:serviceCidr
              };
              self.$ajax({
                type: "POST",
                url: "api/neutron/v2.0/inspur/networkextension/validate_ip_in_cidr",
                data: JSON.stringify(gatewayObj),
                showErrMsg:false,
                success: function(resultcheck) {
                  if (resultcheck == true) {
                    self.$emit("stepThreeDone", newFormData);
                  } else {
                    self.$notify({
                      message: Vue.t("container.networkNoteCheck"),
                      type: "error"
                    });
                  }
                }
              });
            } else {
              newFormData.dns_server_ip = self.removeZerofromip(newFormData.dns_server_ip);
              newFormData.service_cidr = self.removeZerofromCidr(newFormData.service_cidr);
              self.$emit("stepThreeDone", newFormData);
            }
          }
        });
      },
      cancel() {
        this.$emit("cancel");
      },
      removeZerofromCidr(ip) {
        let self = this;
        let newaddress = "";
        let address0 = ip.split("/");
        let address1 = address0[0];
        newaddress = self.removeZerofromip(address1) + "/" + address0[1];
        return newaddress;
      },
      removeZerofromip(ip) {
        let newaddress = "";
        let address2 = ip.split(".");
        for (let i = 0; i < address2.length; i++) {
          if (address2[i].length == 2) {
            if (address2[i].substr(0, 1) == "0") {
              address2[i] = address2[i].substr(1);
            }
          } else if (address2[i].length == 3) {
            if (address2[i].substr(0, 1) == "0" && address2[i].substr(1, 1) == "0") {
              address2[i] = address2[i].substr(2);
            } else if (address2[i].substr(0, 1) == "0" && address2[i].substr(1, 1) != "0") {
              address2[i] = address2[i].substr(1);
            }
          }
          if (i != 3) {
            newaddress += address2[i] + ".";
          } else {
            newaddress += address2[i];
          }
        }
        return newaddress;
      },
      removeZerofromipv6(ip) {
        let newaddress = "";
        let address = ip.split(":");
        for (let i = 0; i < address.length; i++) {
          if (address[i].length == 2) {
            if (address[i].substr(0, 1) == "0") {
              address[i] = address[i].substr(1);
            }
          } else if (address[i].length == 3) {
            if (address[i].substr(0, 1) == "0" && address[i].substr(1, 1) == "0") {
              address[i] = address[i].substr(2);
            } else if (address[i].substr(0, 1) == "0" && address[i].substr(1, 1) != "0") {
              address[i] = address[i].substr(1);
            }
          } else if (address[i].length == 4) {
            if (address[i].substr(0, 1) == "0" && address[i].substr(1, 1) == "0" && address[i].substr(2, 1) == "0") {
              address[i] = address[i].substr(3);
            } else if (address[i].substr(0, 1) == "0" && address[i].substr(1, 1) == "0" && address[i].substr(2, 1) != "0") {
              address[i] = address[i].substr(2);
            } else if (address[i].substr(0, 1) == "0" && address[i].substr(1, 1) != "0") {
              address[i] = address[i].substr(1);
            }
          }
          if (i != address.length-1) {
            newaddress += address[i] + ":";
          } else {
            newaddress += address[i];
          }
        }
        return newaddress;
      }
    }
  }
</script>
<style scoped>

</style>