<template>
  <el-dialog :title="$t('calcStorLang.resourceSpec')" :visible.sync="dialogVisible" :before-close="handleClose" size="tiny">
    <el-form ref="addResSpecForm" :model="spec" label-width="100px" :rules="rules">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input v-model="spec.name" class="col-18"></el-input>
      </el-form-item>
      <el-form-item label="CPU" class="is-required" prop="cpu">
        <el-input v-model="spec.cpu" class="col-18"></el-input>&nbsp;
        <span>{{$t('calcStorLang.core')}}</span>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.memory')" class="is-required" prop="memory">
      <el-row>
        <el-input v-model="spec.memory" class="col-18" v-if="unitMem=='0'"></el-input>
        <el-select v-model="spec.memory" class="col-18" v-if="unitMem=='1'">
          <el-option label="64" value="64"></el-option>
          <el-option label="128" value="128"></el-option>
          <el-option label="256" value="256"></el-option>
          <el-option label="512" value="512"></el-option>
        </el-select>
        <el-select v-model="unitMem" class="col-5" @change="unitType">
          <el-option label="G" value="0"></el-option>
          <el-option label="M" value="1"></el-option>
        </el-select>
      </el-row>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.disk')" class="is-required" prop="disk">
        <el-input v-model="spec.disk" class="col-18"></el-input>&nbsp;G
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.isPublic')" class="is-required" prop="isShare">
        <el-checkbox v-model="spec.isShare"></el-checkbox>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAddSpec" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'AddSpec',
  props: ['resOperType', 'specUuid', 'flavorName'],
  data() {
    return {
      spec: {
        name: '',
        cpu: '',
        memory: '',
        disk: '',
        isShare: true
      },
      unitMem:'0',
      dialogVisible: false,
      saving: false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
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
        disk: [
          { type: 'required', trigger: 'blur change' },
          { type: 'integer' },
          { type: 'min', value: 1 },
          { type: 'max', value: 2147483647 }
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.addResSpecForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.initDialog();
    if (this.resOperType === 2) { //edit
       this.initData();
    }
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    async initData() {
      var self = this;
      try {
            let ret = await this.$ajax({
              url: 'api/nova/v2.1/flavors/' + this.specUuid,
              type: 'get'
            });
            let result = ret['flavor'];
            this.spec.name = result['name'];
            this.spec.cpu = result['vcpus'];
            this.spec.memory = result['ram']/1024;
            this.spec.disk = result['disk'];
          } catch (data) {
            this.loading = false;
            __DEV__ && console.error(data);
          }
    },
    handleCancel() {
      this.$emit("handleShow", {});
    },
    handleClose(done) {
      this.$emit("handleShow", {});
      done();
    },
    unitType() {
      var self = this;
      self.spec.memory = '';
    },
    confirmAddSpec() {
      this.$refs.addResSpecForm.validate(async(valid) => {
        if (valid) {
          this.loading = true;
          this.saving = true;
          let name = this.spec.name;
          let ram = 0;
          if (this.unitMem == '0') {
              ram = this.spec.memory * 1024;
          } else {
            if (this.unitMem == '1') {
              ram = this.spec.memory
            }
          }
          let vcpus = this.spec.cpu;
          let disk = this.spec.disk;
          let isShare = this.spec.isShare;
          let id = "";
          let url = "api/nova/v2.1/flavors";
          if (this.resOperType === 2) {
             id = this.specUuid;
             // url = "api/nova/v2/flavors/" + id + "/update";
          }
          let body = {"flavor": {"name": name, "ram":ram, "vcpus":vcpus, "disk":disk, "os-flavor-access:is_public": isShare}};
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: 'post',
              successMsg: Vue.t('calcStorLang.successAdd') + Vue.t('calcStorLang.resourcespec') + "！",
              log: {
                description: {
                  en: "Add flavor:" + name,
                  zh_cn: "添加资源规格:" + name
                },
                target: Vue.logTarget.computeSpec
              }
            });
            let ret2 = await this.$ajax({
              type: 'post',
              url: `api/nova/v2.1/flavors/${ret.flavor.id}/os-extra_specs`,
              data: JSON.stringify({
                extra_specs: {
                  'capabilities:hypervisor_type': 'QEMU'
                }
              })
            });
            this.loading = false;
            this.saving = false;
            this.$emit("handleShow", {});
            this.$emit("getData");
          } catch (data) {
            this.saving = false;
            this.loading = false;
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
