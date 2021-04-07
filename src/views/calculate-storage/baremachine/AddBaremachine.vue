<template>
<el-dialog
  :title="$t('calcStorLang.baremachineRegister')"
  :visible.sync="dialogVisible"
  :before-close="handleClose">
  <el-form class="margin-tb20 me-required-form" :model="newBaremachine" :rules="rules" ref="newBaremachineForm"  label-position="left" label-width="160px">
    <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
      <el-input class="col-10" v-model="newBaremachine.name" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.bmcIP')" prop="ip" class="is-required">
      <el-input class="col-10" v-model="newBaremachine.ip" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.bmcUserName')" prop="bmcusername" class="is-required">
      <el-input class="col-10" v-model="newBaremachine.bmcusername" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.bmcPassword')" prop="bmcpsw" class="is-required">
      <el-input type="password" class="col-10" v-model="newBaremachine.bmcpsw" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.deployImageKernal')" prop="kernal" class="is-required">
      <el-select v-model="newBaremachine.kernal" class="col-10" filterable clearable :placeholder="$t('calcStorLang.pleaseSelect')">
        <el-option v-for="item in kernalOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.deployImageMomerydisk')" prop="ramdisk" class="is-required">
      <el-select v-model="newBaremachine.ramdisk" class="col-10" filterable clearable :placeholder="$t('calcStorLang.pleaseSelect')">
        <el-option v-for="item in ramdiskOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </el-form-item>
    <!-- <el-form-item :label="$t('calcStorLang.netType')" prop="nettype" class="is-required">
      <el-select v-model="newBaremachine.nettype" class="col-10" filterable clearable :placeholder="$t('calcStorLang.pleaseSelect')">
        <el-option label="flat" value="Flat"></el-option>
        <el-option label="vlan" value="Vlan"></el-option>
      </el-select>
    </el-form-item> -->
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
  </div>
</el-dialog>
</template>
<script>
export default {
  name: 'AddBaremachine',
  data() {
    return {
      // flag: false,
      dialogVisible: false,
      imageUrl:"",
      loading: false,
      saving: false,
      roleType: Vue.roleType + "",
      newBaremachine: {
        name: '',
        ip: '',
        bmcusername: '',
        bmcpsw: '',
        ipmiport: "",
        framework:'x86_64',
        drive:'ipmi',
        kernal:"",
        ramdisk:"",
        nettype:"Vlan"
      },
      barespecOptions:[],
      kernalOptions:[],
      nettypeOptions:[],
      fList: [],
      fileDisabled: false,
      fileFlag: true,
      netTypeOptions:[{value:'qcow2', label:'qcow2'}, {value:'raw', label:'raw'}, {value:'aki', label:'aki'}, {value:'ari', label:'ari'}],
      operSystemOptions:[],
      architectureOptions:[{value:'1', label:'架构1'}, {value:'2', label:'架构2'}, {value:'3', label:'架构3'}],
      coreOptions:[],
      ramdiskOptions:[],
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 40},
          {type: 'onlyLetter_MinusNumber'}
        ],
        ip: [
          { type: 'ipv4' },
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 }
        ],
        bmcusername: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 }
        ],
        bmcpsw: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 }
        ],
        ipmiport: [
          { type: 'validatePort' },
          { type: 'required', trigger: 'blur change' },
          { type: 'min', value:  0 },
          { type: 'max', value:  65535 }
        ],
        framework: [
          { type: 'required', trigger: 'blur change' }
        ],
        drive: [
          { type: 'required', trigger: 'blur change' }
        ],
        kernal: [
          { type: 'required', trigger: 'blur change' }
        ],
        ramdisk: [
          { type: 'required', trigger: 'blur change' }
        ],
        nettype: [
          { type: 'required', trigger: 'blur change' }
        ]
      },
      widthStyle:{
        width:"80%"
      },
      diskpercentage:50,
      diskproStatus:"success",
      storepercentage:20,
      storeproStatus:"success"
    }
  },
  mounted() {
    this.loadspec();
    this.loadimgs();
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    async confirmFun() {
      var self = this;
      self.saving = true;
      self.$refs.newBaremachineForm.validate(async (valid) => {
        if (valid) {
          try {
            let restNodeNum = await self.getRestNodeCount();
            if (restNodeNum <= 0) {
              self.$message.error(self.$t('calcStorLang.BARE_METAL_LICENSE_NODE_NOT_ENOUGH'));
              self.saving = false;
              return;
            }
          } catch (e) {
            __DEV__ && console.error(e);
            return;
          }
          var name = self.newBaremachine.name;
          var ip = self.newBaremachine.ip;
          var bmcusername = self.newBaremachine.bmcusername;
          var bmcpsw = self.newBaremachine.bmcpsw;
          var ipmiport = self.newBaremachine.ipmiport;
          var framework = self.newBaremachine.framework;
          var drive = "ipmi";
          var kernal = self.newBaremachine.kernal;
          var ramdisk = self.newBaremachine.ramdisk;
          var nettype = self.newBaremachine.nettype;
          var url = "api/ironic/v1/nodes";
          var body = {
            "name": name,
            "driver": drive,
            "driver_info": {
              "ipmi_username": bmcusername,
              "ipmi_password": bmcpsw,
              "ipmi_address": ip,
              "deploy_kernel": kernal,
              "deploy_ramdisk": ramdisk
            },
            "properties": {
              /*"cpus": cpu,
              "memory_mb": memory,
              "local_gb": disk,*/
              "is_adopt": "no"
            }
          };
          if (nettype == "Vlan") {
            body['network_interface'] = "neutron";
          }
          if ("Flat" === nettype) {
            body['network_interface'] = "flat";
          }
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: 'post',
              successMsg: Vue.t('calcStorLang.bareRegisterSuccess'),
              errorKey: "badRequest",
              showErrMsg: false,
              errFun: (res) => {
                self.saving = false;
                let errorMessage = res.responseJSON.error_message && JSON.parse(res.responseJSON.error_message) && JSON.parse(res.responseJSON.error_message).faultstring;
                if (errorMessage) {
                  self.$message.error(errorMessage);
                } else {
                  self.$message.error(res.responseJSON.error_message || "error");
                }
              },
              log: {
                description: {
                  en: "Register Baremetal Machine:" + name,
                  zh_cn: "注册裸机:" + name
                },
                target: Vue.logTarget.bareMachine
              }
            });
            self.saving = false;
            self.$message(Vue.t('calcStorLang.submitCompleted'));
            self.$emit("handleAddShow");
            self.$emit("getDataList");
          } catch (data) {
            self.saving = false;
            __DEV__ && console.error(data);
          }
        } else {
          self.saving = false;
          return false;
        }
      });
    },
    async getRestNodeCount() {
      let $this = this;
      let hostCount = 0;
      let baremetalMachineCount = 0;
      for (let region in Vue.regionServices) {
        if ('nova' in Vue.regionServices[region]) {
          let hypervisorsRes = await $this.$ajax({
            regionId: region,
            type: 'get',
            url: 'api/nova/v2.1/os-hypervisors/detail'
          });
          hostCount += hypervisorsRes.hypervisors.filter(item => item.hypervisor_type === 'QEMU').length;
        }
        if ('ironic' in Vue.regionServices[region]) {
          let baremetalRes = await $this.$ajax({
            regionId: region,
            type: 'get',
            url: 'api/ironic/v1/nodes_inspur?is_adopt=no&detail=True'
          });
          baremetalMachineCount += baremetalRes.nodes.length;
        }
      }
      let serialNumberRes = await $this.$ajax({
        type: 'get',
        url: 'api/keystone/v3/inspur/serialnumber'
      });
      let serialNumberNodeNum = serialNumberRes.sn_detail.node_num;
      return serialNumberNodeNum - hostCount - baremetalMachineCount;
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      this.$emit("handleAddShow", {});
    },
    onRefreshData() {
      this.$emit("onRefresh", {});
    },

    async loadimgs() {
      let self = this;
      let result = await self.$ajax({
        type: 'get',
        url: "api/glance/v2/images?limit=9999999&tag=*",
        complete: function(XMLHttpRequest, textStatus) {
        }
      });
      let images = result.images;
      self.kernalOptions = [];
      self.ramdiskOptions = [];
      self.coreOptions = [];
      for (var i in images) {
        let image = images[i];
        if (image["disk_format"] && image["disk_format"] == 'aki') {
          self.coreOptions.push({value:image["name"], label:image["name"]});
          self.kernalOptions.push({value:image["id"], label:image["name"]});
        }
        if (image["disk_format"] && image["disk_format"] == 'ari') {
          self.ramdiskOptions.push({value:image["id"], label:image["name"]});
        }
      }
    },
    async loadspec() {
      let self = this;
      let result = await self.$ajax({
        type: 'get',
        data: {"is_public": true},
        url: 'api/nova/v2.1/flavors/detail',
        showErrMsg: true
      });
      let result1 = await self.$ajax({
        type: 'get',
        data: {"is_public": false},
        url: 'api/nova/v2.1/flavors/detail',
        showErrMsg: true
      });
      self.loading = false;
      var dataResult = result['flavors'];
      var dataResult1 = [];
      for (let i = 0; i < dataResult.length; i++) {
        if (dataResult[i]['os-flavor-access:is_public'] == true) {
          dataResult1.push(dataResult[i]);
        }
      }
      var middleData1 = dataResult1.concat(result1['flavors']);
      self.barespecOptions = [];
      for (let i in middleData1) {
        if (middleData1[i].name.indexOf("Bare@") >= 0) {
          self.barespecOptions.push({value:middleData1[i].id, label:middleData1[i].name, cpu:middleData1[i].vcpus, mem:middleData1[i].ram, disk:middleData1[i].disk});
        }
      }
    }
  }
}
</script>
<style scoped>
</style>
