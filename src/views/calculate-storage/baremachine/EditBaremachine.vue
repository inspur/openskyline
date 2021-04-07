<template>
  <el-dialog :title="$t('calcStorLang.editBaremachine')" :visible.sync="visible" :before-close="handleClose">
    <el-form ref="editBaremachineForm" class="me-required-form" :model="editBaremachineForm" label-position="left" label-width="150px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-11" v-model="editBaremachineForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="CPU" prop="cpu" class="is-required">
        <el-input class="col-11" v-model="editBaremachineForm.cpu" auto-complete="off"></el-input>
        <span>{{$t('calcStorLang.core')}}</span>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.memory')" prop="memory" class="is-required">
        <el-input class="col-11" v-model="editBaremachineForm.memory" auto-complete="off"></el-input>&nbspG
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.ROOT_DISK')" prop="diskInformation" class="is-required">
        <el-input class="col-11" v-model="editBaremachineForm.diskInformation" auto-complete="off"></el-input>&nbspG
      </el-form-item>
      <el-collapse class="col-24">
        <el-collapse-item :title="$t('calcStorLang.advanceOptions')" label-width="100px">
          <el-form-item :label="$t('calcStorLang.deployImageKernal')" prop="kernal" class="is-required">
            <el-select v-model="editBaremachineForm.kernal" @change="getkernalName" class="col-11" filterable clearable :placeholder="$t('calcStorLang.pleaseSelect')">
              <el-option v-for="item in kernalOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.userImageMomerydisk')" prop="ramdisk" class="is-required">
            <el-select v-model="editBaremachineForm.ramdisk" @change="getRamdiskName" class="col-11" filterable clearable :placeholder="$t('calcStorLang.pleaseSelect')">
              <el-option v-for="item in ramdiskOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "editBaremachine",
  props: ["id", "volumeBakEntity"],
  data() {
    return {
      addFlag: false,
      hightConfigShow: true,
      kernalOptions: [],
      ramdiskOptions: [],
      kernalName: '',
      ramdiskName: '',
      oldKernalName: '',
      oldRamdiskName: '',
      editBaremachineForm: {
        name: "",
        cpu: "",
        memory: "",
        diskInformation: "",
        kernal: '',
        ramdisk: '',
        oldName: "",
        oldCpu: "",
        oldMemory: "",
        oldDiskInformation: ""
      },
      visible: false,
      loading: false,
      saving: false,
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 40},
          {type: 'onlyLetter_MinusNumber'}
        ],
        cpu: [
          { type: 'required', trigger: 'blur change' },
          { type: 'integer' },
          { type: 'min', value: 1 },
          { type: 'max', value: 2147483647 }
        ],
        memory: [
          { type: 'required', trigger: 'blur change' },
          { type: 'integer' },
          { type: 'min', value: 1 },
          { type: 'max', value: 2094151 }
        ],
        diskInformation: [
          { type: 'required', trigger: 'blur change' },
          { type: 'integer' },
          { type: 'min', value: 1 },
          { type: 'max', value: 2147483647 }
        ],
        kernal: [
          { type: 'required', trigger: 'blur change' }
        ],
        ramdisk: [
          { type: 'required', trigger: 'blur change' }
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
  },
  methods: {
    getkernalName(vId) {
      if (!vId) {
        return;
      }
      let kernalOption = this.kernalOptions.find((item) => {
        return item.value === vId;
      });
      let obj = kernalOption || {};
      if (!this.oldKernalName) {
        this.oldKernalName = obj.label;
      }
      this.kernalName = obj.label;
    },
    getRamdiskName(vId) {
      if (!vId) {
        return;
      }
      let ramdiskOption = this.ramdiskOptions.find((item) => {
        return item.value === vId;
      });
      let obj = ramdiskOption || {};
      if (!this.oldRamdiskName) {
        this.oldRamdiskName = obj.label;
      }
      this.ramdiskName = obj.label;
    },
    async initDialog() {
      let self = this;
      self.visible = true;
      try {
        let ret = await this.$ajax({
          url: "api/ironic/v1/nodes/" + self.id,
          type: 'get'
        });
        this.editBaremachineForm.name = this.editBaremachineForm.oldName = ret['name'];
        this.editBaremachineForm.cpu = this.editBaremachineForm.oldCpu = ret['properties']['cpus'] || "";
        this.editBaremachineForm.memory = this.editBaremachineForm.oldMemory = ret['properties']['memory_mb']/1024 || "";
        this.editBaremachineForm.diskInformation = this.editBaremachineForm.oldDiskInformation = ret['properties']['local_gb'] || "";
        if (this.editBaremachineForm.cpu && this.editBaremachineForm.memory && this.editBaremachineForm.diskInformation) {
          this.addFlag = false;
        } else {
          this.addFlag = true;
        }
        let {deploy_kernel: deployKernel, deploy_ramdisk: deployRamdisk} = ret.driver_info;
        let imagesResult = await self.$ajax({
          type: 'get',
          url: "api/glance/v2/images?limit=9999999&tag=$",
          complete: function(XMLHttpRequest, textStatus) {
          }
        });
        let images = imagesResult.images;
        self.kernalOptions = [];
        self.ramdiskOptions = [];
        for (let i in images) {
          let image = images[i];
          if (image["name"] != null && image["disk_format"] && image["disk_format"] == 'aki') {
            self.kernalOptions.push({value:image["id"], label:image["name"]});
          }
          if (image["name"] != null && image["disk_format"] && image["disk_format"] == 'ari') {
            self.ramdiskOptions.push({value:image["id"], label:image["name"]});
          }
        }
        self.editBaremachineForm.ramdisk = self.editBaremachineForm.oldRamdisk = deployRamdisk;
        self.editBaremachineForm.kernal = self.editBaremachineForm.oldKernal = deployKernel;
      } catch (data) {
      }
    },
    show() {
      this.visible = true;
    },
    handleCancel() {
      this.$emit("hide", {});
    },
    handleClose(done) {
      this.$emit("hide", {});
      done();
    },
    confirmFun() {
      let self = this;
      self.$refs.editBaremachineForm.validate(async (valid) => {
        if (valid) {
          self.saving = true;
          let op = (self.addFlag) ? "add" : "replace";
          let body = [
            {
              "op": op,
              "path":"/name",
              "value":self.editBaremachineForm.name
            },
            {
              "op": op,
              "path":"/properties/cpus",
              "value":self.editBaremachineForm.cpu
            },
            {
              "op": op,
              "path":"/properties/memory_mb",
              "value":self.editBaremachineForm.memory * 1024
            },
            {
              "op": op,
              "path":"/properties/local_gb",
              "value":self.editBaremachineForm.diskInformation
            },
            {
              "op": op,
              "path":"/driver_info/deploy_kernel",
              "value":self.editBaremachineForm.kernal
            },
            {
              "op": op,
              "path":"/driver_info/deploy_ramdisk",
              "value":self.editBaremachineForm.ramdisk
            }];
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: "api/ironic/v1/nodes/" + self.id,
              data: body,
              type: 'PATCH',
              errorKey: "message",
              headers: {
                "X-Openstack-Ironic-Api-Version": 1.46
              },
              log: {
                description: {
                  en: "Edit Baremachine " + "[Before is :" + "Name:" + self.editBaremachineForm.oldName +
                    ",CPU:" + self.editBaremachineForm.oldCpu + " Core(s)" + ",Memory" + self.editBaremachineForm.oldMemory + " G" +
                    ",Disk:" + self.editBaremachineForm.oldDiskInformation + " G" +",DeployImage-kernel:" + self.oldKernalName +
                    ",DeployImage-ramdisk:" + self.oldRamdiskName +
                    ",after editing:" + "Name:" + self.editBaremachineForm.name + ",CPU:" + self.editBaremachineForm.cpu+ " Core(s)" + ",Memory" + self.editBaremachineForm.memory + " G" +
                    ",Disk:" + self.editBaremachineForm.diskInformation + " G" + ",DeployImage-kernel:" + self.kernalName +
                    ",DeployImage-ramdisk:" + self.ramdiskName+ "]",
                  zh_cn: "编辑裸机" + "[编辑前:" + "名称:" + self.editBaremachineForm.oldName +
                    ",CPU:" + self.editBaremachineForm.oldCpu + " 核" +",内存" + self.editBaremachineForm.oldMemory + " G" +
                    ",硬盘:" + self.editBaremachineForm.oldDiskInformation + " G" + ",部署镜像-kernel:" + self.oldKernalName +
                    ",部署镜像-ramdisk:" + self.oldRamdiskName + ",编辑后:" + "名称:" + self.editBaremachineForm.name + ",CPU:" + self.editBaremachineForm.cpu + " 核" + ",内存" + self.editBaremachineForm.memory + " G" +
                    ",硬盘:" + self.editBaremachineForm.diskInformation + " G" + ",部署镜像-kernel:" + self.kernalName +
                    ",部署镜像-ramdisk:" + self.ramdiskName + "]"
                },
                target: Vue.logTarget.bareMachine
              },
              successMsg: Vue.t("calcStorLang.updateSuccess"),
              successFun: () => {
                self.$emit("hide", {});
                self.$emit("onRefresh", {});
              },
              errFun: () => {
                self.saving = false;
              }
            });
          } catch (data) {
            self.saving = false;
            __DEV__ && console.error(data);
          }
        } else {
          return false;
        }
      });
    }
  }
}
</script>
