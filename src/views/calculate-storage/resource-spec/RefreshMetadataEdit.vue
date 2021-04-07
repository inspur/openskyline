<template>
  <div>
    <el-dialog :title="theTitle" :visible="true" :before-close="handleBeforeClose">
      <el-form ref="form" :model="formData" label-width="140px" :rules="rules">
        <el-form-item :label="$t('calcStorLang.key')" prop="key" class="is-required">
          <el-select v-model="formData.key" class="col-18" filterable :disabled="type === 'edit'" @change="handleKeyChange">
            <el-option v-for="item in keys" :key="item" :label="item" :value="item" ></el-option>
          </el-select>
          <el-tooltip v-if="tips !== ''" placement="top" trigger="hover" :content="tips">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :ref="'formitem-'+item.key" :label="item.label" :key="item.key" :prop="'values.'+index+'.value'" v-for="(item, index) in formData.values" class="is-required">
          <el-input v-if="item.type === 'input'" class="col-18" v-model="item.value" auto-complete="off"></el-input>
          <el-select v-if="item.type === 'select'" class="col-18" v-model="item.value">
            <el-option v-for="(option, optionIndex) in item.options" :key="optionIndex" :label="option.label" :value="option.value" />
          </el-select>
          {{ item.unit }}
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" :loading="saving" @click="save">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'RefreshMetadataEdit',
  props: {
    type: {
      type: String,
      default: 'add'
    },
    selectedKey: {
      type: String,
      default: ''
    },
    incomingValues: {
      type: Array,
      default: () => {
        return [];
      }
    },
    existingKeys: {
      type: Array,
      default: () => {
        return [];
      }
    },
    numaNodes: {
      type: Number,
      default: 0
    },
    flavor: {
      type: Object,
      default: () => {
        return {
          id: '',
          name: '',
          vcpus: 0,
          ram: 0,
          disk: 0
        };
      }
    }
  },
  data() {
    return {
      theTitle: Vue.t('calcStorLang.create') + Vue.t('calcStorLang.metadata'),
      saving: false,
      keys: [
        'aggregate_instance_extra_specs:hpgs',
        'aggregate_instance_extra_specs:pinned',
        'capabilities:hypervisor_type',
        'hw:cpu_cores/hw:cpu_threads/hw:cpu_sockets',
        'hw:cpu_policy',
        'hw:mem_page_size',
        'hw:numa_nodes',
        'hw:numa_cpus.n',
        'hw:numa_mem.n',
        'hw:pci_numa_affinity_policy',
        'hw_set_cdrom',
        'pci_passthrough:alias',
        'resources:VGPU'
      ],
      formData: {
        key: '',
        values: []
      },
      options: [],
      rules: {},
      tips: ''
    };
  },
  methods: {
    async save() {
      const $this = this;
      $this.$refs.form.validate(async valid => {
        if (valid) {
          if ($this.formData.key === 'hw:numa_nodes' && $this.type === 'edit') {
            $this.$confirm($this.$t('calcStorLang.resourceSpecMetedataTip17'), Vue.t("base.prompt"), {
              confirmButtonText: Vue.t("base.confirm"),
              cancelButtonText: Vue.t("base.cancel"),
              type: "warning"
            }).then(async () => {
              try {
                $this.saving = true;
                await $this.performSave();
                await $this.performDeleteNumaNodes();
                $this.close();
                $this.$emit('refresh');
              } catch (e) {
                $this.saving = false;
                __DEV__ && console.error(e);
              }
            });
          } else {
            try {
              $this.saving = true;
              await $this.performSave();
              $this.close();
              $this.$emit('refresh');
            } catch (e) {
              $this.saving = false;
              __DEV__ && console.log(e);
            }
          }
        } else {
          return false;
        }
      });
    },
    async performSave() {
      const $this = this;
      let extraspecs = {};
      let logStr = '';
      $this.formData.values.forEach(item => {
        extraspecs[item.key] = item.value;
        logStr += `${item.key}=${item.value} `;
      });
      let ret = await this.$ajax({
        url: `api/nova/v2.1/flavors/${this.flavor.id}/os-extra_specs`,
        data: JSON.stringify({ extra_specs: extraspecs }),
        type: 'post',
        successMsg: Vue.t("calcStorLang.configSuccess"),
        log: {
          description: {
            en: `Edit Flavor Metadata: ${$this.flavor.name} ${logStr}`,
            zh_cn: `修改资源规格元数据：${$this.flavor.name} ${logStr}`
          },
          target: Vue.logTarget.computeSpec
        }
      });
    },
    async performDeleteNumaNodes() {
      const $this = this;
      let res = await $this.$ajax({
        type: 'get',
        url: `api/nova/v2.1/flavors/${this.flavor.id}/os-extra_specs`
      });
      for (let i = 0; i < Object.keys(res.extra_specs).length; i++) {
        try {
          let key = Object.keys(res.extra_specs)[i];
          if (key.startsWith('hw:numa_cpus.') || key.startsWith('hw:numa_mem.')) {
            await $this.$ajax({
              type: 'delete',
              url: `api/nova/v2.1/flavors/${this.flavor.id}/os-extra_specs/${key}`
            });
          }
        } catch (e) {
          __DEV__ && console.error(e);
        }
      }
    },
    handleKeyChange() {
      const $this = this;
      const key = $this.formData.key;
      $this.formData.values = [];
      $this.tips = '';
      $this.rules = {
        key: [{ type: 'required' }]
      };
      switch (key) {
        case 'aggregate_instance_extra_specs:hpgs':
          $this.formData.values = [{
            type: 'select',
            label: $this.$t('calcStorLang.value'),
            key: key,
            value: '',
            unit: '',
            options: [
              { label: 'true', value: 'true' },
              { label: 'false', value: 'false' }
            ]
          }];
          $this.rules[`values.0.value`] = [{ type: 'required' }];
          $this.tips = $this.$t('calcStorLang.resourceSpecMetedataTip8');
          break;
        case 'aggregate_instance_extra_specs:pinned':
          $this.formData.values = [{
            type: 'select',
            label: $this.$t('calcStorLang.value'),
            key: key,
            value: '',
            unit: '',
            options: [
              { label: 'true', value: 'true' },
              { label: 'false', value: 'false' }
            ]
          }];
          $this.rules[`values.0.value`] = [{ type: 'required' }];
          $this.tips = $this.$t('calcStorLang.resourceSpecMetedataTip3');
          break;
        case 'capabilities:hypervisor_type':
          $this.formData.values = [{
            type: 'select',
            label: $this.$t('calcStorLang.value'),
            key: key,
            value: '',
            unit: '',
            options: [
              { label: 'ironic', value: 'ironic' },
              { label: 'QEMU', value: 'QEMU' }
            ]
          }];
          $this.rules[`values.0.value`] = [{ type: 'required' }];
          $this.tips = $this.$t('calcStorLang.resourceSpecMetedataTip1');
          break;
        case 'hw:cpu_cores/hw:cpu_threads/hw:cpu_sockets':
          ['hw:cpu_cores', 'hw:cpu_threads', 'hw:cpu_sockets'].forEach((item, index) => {
            $this.formData.values.push({
              type: 'input',
              label: item,
              key: item,
              value: '',
              unit: ''
            });
            let rules = [
              { type: 'required' },
              { type: 'unsignedPositiveInteger' },
              { validator: (rule, value, callback) => {
                  let cpuCores = Number($this.formData.values[0].value);
                  let cpuThreads = Number($this.formData.values[1].value);
                  let cpuSockets = Number($this.formData.values[2].value);
                  if (cpuCores * cpuThreads * cpuSockets !== this.flavor.vcpus) {
                    callback(Vue.t("calcStorLang.resourceSpecMetedataTip9", this.flavor.vcpus));
                  } else {
                    $this.$refs['formitem-hw:cpu_cores'][0].validateState = '';
                    $this.$refs['formitem-hw:cpu_cores'][0].validateMessage = '';
                    $this.$refs['formitem-hw:cpu_threads'][0].validateState = '';
                    $this.$refs['formitem-hw:cpu_threads'][0].validateMessage = '';
                    $this.$refs['formitem-hw:cpu_sockets'][0].validateState = '';
                    $this.$refs['formitem-hw:cpu_sockets'][0].validateMessage = '';
                    callback();
                  }
                }
              }
            ];
            if (item === 'hw:cpu_threads') {
              rules.unshift({ validator: (rule, value, callback) => {
                if (String(value) !== '1') {
                  callback($this.$t('calcStorLang.resourceSpecMetedataTip16'));
                } else {
                  callback();
                }
              }});
            }
            $this.rules[`values.${index}.value`] = rules;
          });
          $this.tips = $this.$t('calcStorLang.resourceSpecMetedataTip15');
          break;
        case 'hw_set_cdrom':
          $this.formData.values = [{
            type: 'input',
            label: $this.$t('calcStorLang.value'),
            key: key,
            value: '',
            unit: ''
          }];
          $this.rules[`values.0.value`] = [
            { type: 'required' },
            { type: 'maxSize', value: 255 }
          ];
          $this.tips = $this.$t('calcStorLang.addResSpecTip6');
          break;
        case 'hw:mem_page_size':
          $this.formData.values = [{
            type: 'select',
            label: $this.$t('calcStorLang.value'),
            key: key,
            value: '',
            unit: '',
            options: [
              { label: '2MB', value: '2MB' },
              { label: '1GB', value: '1GB' }
            ]
          }];
          $this.rules[`values.0.value`] = [{ type: 'required' }];
          $this.tips = $this.$t('calcStorLang.resourceSpecMetedataTip2');
          break;
        case 'hw:numa_nodes':
          $this.formData.values = [{
            type: 'input',
            label: $this.$t('calcStorLang.value'),
            key: key,
            value: '',
            unit: ''
          }];
          $this.rules[`values.0.value`] = [
            { type: 'required' },
            { type: 'unsignedPositiveInteger' },
            { type: 'max', value: 99999999 }
          ];
          $this.tips = $this.$t('calcStorLang.resourceSpecMetedataTip5');
          break;
        case 'hw:numa_cpus.n':
          for (let i = 0; i < $this.numaNodes; i++) {
            $this.formData.values.push({
              type: 'input',
              label: 'hw:numa_cpus.'+i,
              key: 'hw:numa_cpus.'+i,
              value: '',
              unit: ''
            });
            $this.rules[`values.${i}.value`] = [
              { type: 'required' },
              { validator: (rule, value, callback) => {
                  let splitedValues = value.split(',');
                  let hasErr = false;
                  splitedValues.forEach(splitedValue => {
                    splitedValue = splitedValue.trim();
                    if (/^[\^]?(0|[1-9][0-9]*)$/.test(splitedValue)) {
                      // pass
                    } else if (/^(0|[1-9][0-9]*)\-(0|[1-9][0-9]*)$/.test(splitedValue)) {
                      let numbers = splitedValue.split('-');
                      let a = Number(numbers[0]);
                      let b = Number(numbers[1]);
                      if (a > b) {
                        hasErr = true;
                      }
                    } else {
                      hasErr = true;
                    }
                  });
                  if (hasErr) {
                    callback($this.$t('calcStorLang.resourceSpecMetedataTip13'));
                  } else {
                    callback();
                  }
                }
              }
            ];
          }
          $this.tips = $this.$t('calcStorLang.resourceSpecMetedataTip11');
          break;
        case 'hw:numa_mem.n':
          for (let i = 0; i < $this.numaNodes; i++) {
            $this.formData.values.push({
              type: 'input',
              label: 'hw:numa_mem.'+i,
              key: 'hw:numa_mem.'+i,
              value: '',
              unit: 'MB'
            });
            $this.rules[`values.${i}.value`] = [
              { type: 'required' },
              { type: 'unsignedPositiveInteger' },
              { validator: (rule, value, callback) => {
                  let memSum = 0;
                  $this.formData.values.forEach(item => {
                    memSum += Number(item.value);
                  });
                  if (memSum !== this.flavor.ram) {
                    callback(Vue.t("calcStorLang.resourceSpecMetedataTip10", this.flavor.ram));
                  } else {
                    for (let j = 0; j < $this.numaNodes; j++) {
                      $this.$refs['formitem-hw:numa_mem.'+j][0].validateState = '';
                      $this.$refs['formitem-hw:numa_mem.'+j][0].validateMessage = '';
                    }
                    callback();
                  }
                }
              }
            ];
          }
          $this.tips = $this.$t('calcStorLang.resourceSpecMetedataTip12');
          break;
        case 'hw:pci_numa_affinity_policy':
          $this.formData.values = [{
            type: 'select',
            label: $this.$t('calcStorLang.value'),
            key: key,
            value: '',
            unit: '',
            options: [
              { label: 'required', value: 'required' },
              { label: 'preferred', value: 'preferred' },
              { label: 'legacy', value: 'legacy' }
            ]
          }];
          $this.rules[`values.0.value`] = [{ type: 'required' }];
          $this.tips = '';
          break;
        case 'hw:cpu_policy':
          $this.formData.values = [{
            type: 'select',
            label: $this.$t('calcStorLang.value'),
            key: key,
            value: '',
            unit: '',
            options: [
              { label: 'dedicated', value: 'dedicated' }
            ]
          }];
          $this.rules[`values.0.value`] = [{ type: 'required' }];
          $this.tips = $this.$t('calcStorLang.resourceSpecMetedataTip6');
          break;
        case 'pci_passthrough:alias':
          $this.formData.values = [{
            type: 'input',
            label: $this.$t('calcStorLang.value'),
            key: key,
            value: '',
            unit: ''
          }];
          $this.rules[`values.0.value`] = [
            { type: 'required' },
            { type: 'maxSize', value: 255 }
          ];
          $this.tips = $this.$t('calcStorLang.resourceSpecMetedataTip4');
          break;
        case 'resources:VGPU':
          $this.formData.values = [{
            type: 'select',
            label: $this.$t('calcStorLang.value'),
            key: key,
            value: '',
            unit: '',
            options: [
              { label: '1', value: '1' }
            ]
          }];
          $this.rules[`values.0.value`] = [{ type: 'required' }];
          $this.tips = $this.$t('calcStorLang.resourceSpecMetedataTip7');
          break;
        default:
          $this.formData.values = [{
            type: 'input',
            label: $this.$t('calcStorLang.value'),
            key: key,
            value: '',
            unit: ''
          }];
      }
    },
    close() {
      this.$emit('close');
    },
    handleBeforeClose(done) {
      done();
      this.close();
    }
  },
  mounted() {
    const $this = this;
    if ($this.type === 'add') {
      $this.theTitle = Vue.t('calcStorLang.create') + Vue.t('calcStorLang.metadata');
      $this.keys = $this.keys.filter(item => {
        if ($this.existingKeys.includes(item)) {
          return false;
        }
        if (item === 'hw:cpu_cores/hw:cpu_threads/hw:cpu_sockets') {
          return !($this.existingKeys.includes('hw:cpu_cores') || $this.existingKeys.includes('hw:cpu_threads') || $this.existingKeys.includes('hw:cpu_sockets'));
        }
        if (item === 'hw:numa_cpus.n') {
          if ($this.numaNodes === 0) {
            return false;
          }
          if ($this.existingKeys.find(existingKey => existingKey.startsWith('hw:numa_cpus.'))) {
            return false;
          }
        }
        if (item === 'hw:numa_mem.n') {
          if ($this.numaNodes === 0) {
            return false;
          }
          if ($this.existingKeys.find(existingKey => existingKey.startsWith('hw:numa_mem.'))) {
            return false;
          }
        }
        return true;
      });
      if ($this.keys.length > 0) {
        $this.formData.key = $this.keys[0];
        $this.handleKeyChange();
      }
    } else {
      $this.theTitle = Vue.t('lang.edit') + Vue.t('calcStorLang.metadata');
      $this.formData.key = $this.selectedKey;
      $this.handleKeyChange();
      for (let i = 0; i < $this.formData.values.length; i++) {
        let v = $this.formData.values[i];
        if ($this.incomingValues[i] !== undefined) {
          v.value = $this.incomingValues[i];
        }
      }
    }
  }
};
</script>