<template>
  <el-dialog :title="$t('network.editFirewall')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="editform" :model="editform"  class="me-required-form" label-width="100px" :rules="rule" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-15"  v-model="editform.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.strategy')" prop="strategy">
        <el-select v-model="editform.strategy" class="col-15" filterable>
           <el-option v-for="item in query_strategys"
          :key="item.id"
          :title="item.title"
          :label="item.name"
          :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.manageStatus')" prop="managestatus">
        <el-switch :width="75" on-text="UP" off-text="DOWN" v-model="editform.managestatus"></el-switch>
      </el-form-item>
      <el-row><el-col :span="24">
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" class="col-15"  v-model="editform.description"></el-input>
      </el-form-item>
      </el-col></el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="editConfirm" :disabled="isDiasbled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>  
</template>
<script type="text/javascript">
export default {
  name:"EditFirewall",
  props: ["editId", "editName", "editDesc", "editStrategy", "editAdminstatus", "editprojectid"],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      isDiasbled:false,
      editform: {
        name: "",
        description: "",
        strategy: '',
        managestatus: true
      },
      query_strategys: [],
      rule: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: "requiredNet"},
          {type: 'maxSize', value: 40}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ],
        strategy: [
          {type: "requiredNet"}
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
    this.getStrategys();
    this.editform.strategy = this.editStrategy;
    this.editform.name = this.editName;
    this.editform.description = this.editDesc;
    this.editform.managestatus = this.editAdminstatus;
  },
  methods: {
    initDialog() {
      let self = this;
      self.dialogVisible = true;
    },
    async getStrategys() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/fw/firewall_policies?project_id=" + self.editprojectid,
          errorKey: "NeutronError"
        });
        let allpolices = [];
        allpolices = result["firewall_policies"];
        for (let i = 0; i < allpolices.length; i++) {
          if (allpolices[i].description != "") {
            let des = allpolices[i].description;
            allpolices[i].title = allpolices[i].name+"("+des+")";
            if (des.length>20) {
              des = des.substr(0, 20)+"...";
            }
            allpolices[i].name = allpolices[i].name+"("+des+")";
          }
        }
        self.query_strategys = result["firewall_policies"];
      } catch (res) {
      }
    },
    editConfirm() {
      let self = this;
      let reqdata = {
        "firewall":{
          "name": self.editform.name,
          "description": self.editform.description,
          "firewall_policy_id": self.editform.strategy,
          "admin_state_up": self.editform.managestatus
        }
      };
      try {
        this.$refs.editform.validate(async(valid) => {
          if (valid) {
            self.loading = true;
            self.isDiasbled = true;
            let result = await self.$ajax({
              type: 'PUT',
              url: "api/neutron/v2.0/fw/firewalls/"+self.editId,
              data: JSON.stringify(reqdata),
              success: function(result) {
                self.$notify({
                  message: Vue.t('network.saveSuccess'),
                  type: "success"
                });
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
                  en:"Before edit firewall name:"+self.editName+", After edit firewall name:" + self.editform.name,
                  zh_cn:"防火墙修改前"+self.editName+"，防火墙修改后:" + self.editform.name
                },
                target:Vue.logTarget.firewall
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
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    }
  }
}
</script>