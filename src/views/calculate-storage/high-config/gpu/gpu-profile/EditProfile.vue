<template>
  <div>
    <el-dialog
      :before-close="handleBeforeClose"
      :title="$t('calcStorLang.GPU_PROFILE')"
      :visible="true"
      custom-class="gpu-profile">
      <div v-loading="loading">
        <el-form ref="form" :model="formData" :rules="rules" label-position="right" label-width="120px">
          <el-form-item :label="$t('calcStorLang.GPU_NAME')" prop="name">
            <el-input v-model="formData.name" class="col-20" :disabled="type !== 'add'" />
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.GPU_GROUP')" prop="groups">
            <operation-panel-new :select-rows="selectedGroups" :operation-menus="editProfileOperationMenus" style="display:inline;" />
            <el-table ref="groupsTable" :data="formData.groups" @selection-change="handleSelectedProfileGroupsChange" style="margin-top: 5px;">
              <el-table-column reserve-selection type="selection" width="55" align="center"/>
              <el-table-column :label="$t('calcStorLang.GPU_TYPE')">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.type">
                    <el-option v-for="(item, index) in getTypes(scope.row.product_id)" :key="index" :value="item" :label="item" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column :label="$t('calcStorLang.GPU_VENDOR')">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.vendor" :disabled="scope.row.type === ''">
                    <el-option v-for="(item, index) in getVendors(scope.row.type, scope.row.product_id)" :key="index" :value="item" :label="item" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column :label="$t('calcStorLang.GPU_PRODUCT_NAME')">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.product_id" :disabled="scope.row.type === '' || scope.row.vendor === ''">
                    <el-option v-for="(item, index) in getProducts(scope.row.type, scope.row.vendor, scope.row.product_id)" :key="index" :value="item.product_id" :label="`${item.name}_${item.product_id}`" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column :label="$t('calcStorLang.GPU_AMOUNT')">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.amount" />
                </template>
              </el-table-column>
            </el-table>
            <el-tooltip placement="right" trigger="hover">
              <div slot="content" v-html="$t('calcStorLang.GPU_SAME_HOST_TIPS')" />
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" @click="save" :disabled="loading" :loading="saving">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'underscore';
import EditProfileOperationMenus from './EditProfileOperationMenus';
export default {
  name: 'EditProfile',
  props: {
    type: {
      type: String,
      default: 'add'
    },
    profile: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      loading: false,
      saving: false,
      devices: [],
      formData: {
        name: '',
        groups: []
      },
      rules: {
        name: [
          { type: 'required' },
          { type: 'onlyLetter_MinusNumberChinese' },
          { type: 'maxSize', value: 40 }
        ],
        groups: [
          { type: 'arrayNotEmpty', trigger: 'blur change' }
        ]
      },
      selectedGroups: [],
      editProfileOperationMenus: EditProfileOperationMenus.bind(this)()
    };
  },
  methods: {
    handleBeforeClose(done) {
      const $this = this;
      done();
      $this.handleClose();
    },
    handleClose() {
      const $this = this;
      $this.$emit('close');
    },
    handleSelectedProfileGroupsChange(params) {
      this.selectedGroups = params;
    },
    // 获取所有主机上可用的GPU设备
    async loadAllMountedDevices() {
      const $this = this;
      const res = await $this.$ajax({
        type: 'get',
        url: 'api/cyborg/v2/devices'
      });
      let devices = res.devices;
      devices.forEach(item => {
        item.product_id = item.product_id.toUpperCase();
        item.vendor_value = item.vendor_value.toUpperCase();
      });
      $this.devices = devices;
    },
    getFreeDevices(includeProductId) {
      const $this = this;
      let devices = [];
      $this.devices.forEach(device => {
        if (device.product_id === includeProductId && devices.findIndex(item => item.product_id === includeProductId) === -1) {
          devices.push(device);
        } else if ($this.formData.groups.findIndex(group => device.product_id === group.product_id) === -1) {
          devices.push(device);
        }
      });
      return devices;
    },
    getTypes(includeProductId) {
      const $this = this;
      let devices = $this.getFreeDevices(includeProductId);
      return _.uniq(_.pluck(devices, 'attribute_type'));
    },
    getVendors(type, includeProductId) {
      const $this = this;
      let devices = $this.getFreeDevices(includeProductId);
      devices = devices.filter(item => item.attribute_type === type);
      return _.uniq(_.pluck(devices, 'vendor_value'));
    },
    getProducts(type, vendor, includeProductId) {
      const $this = this;
      let devices = $this.getFreeDevices(includeProductId);
      devices = devices.filter(item => item.attribute_type === type && item.vendor_value === vendor);
      let uniqDevices = [];
      devices.forEach(device => {
        if (uniqDevices.findIndex(uniqDevice => uniqDevice.product_id === device.product_id) === -1) {
          uniqDevices.push(device);
        }
      });
      return uniqDevices;
    },
    checkGroups() {
      const $this = this;
      for (let i = 0; i < $this.formData.groups.length; i++) {
        const group = $this.formData.groups[i];
        if (group.type === '') {
          throw new Error($this.$t('calcStorLang.GPU_PROFILE_RULE_TYPE_NOT_EMPTY', i + 1));
        } else if (group.vendor === '') {
          throw new Error($this.$t('calcStorLang.GPU_PROFILE_RULE_VENDOR_NOT_EMPTY', i + 1));
        } else if (group.product_id === '') {
          throw new Error($this.$t('calcStorLang.GPU_PROFILE_RULE_PRODUCT_ID_NOT_EMPTY', i + 1));
        } else if (!/^[1-9]{1}[0-9]*$/.test(group.amount)) {
          throw new Error($this.$t('calcStorLang.GPU_PROFILE_RULE_AMOUNT_POSITIVE_INTEGER', i + 1));
        } else {
          let amount = parseInt(group.amount);
          let devices = $this.devices.filter(item => item.attribute_type === group.type &&
            item.vendor_value === group.vendor &&
            item.product_id === group.product_id);
          if (amount > devices.length) {
            throw new Error($this.$t('calcStorLang.GPU_PROFILE_RULE_AMOUNT_MAX', i + 1, devices.length));
          }
        }
      }
    },
    async save() {
      const $this = this;
      $this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            $this.checkGroups();
          } catch (e) {
            $this.$message.error(e.message);
            return;
          }
          $this.saving = true;
          let formData = {
            groups: []
          };
          $this.formData.groups.forEach(item => {
            let newGroup = {};
            let typeInTrait = item.type;
            if (typeInTrait === 'PGPU') {
              typeInTrait = 'GPU';
            }
            if (typeInTrait === 'CUSTOM_SSD') {
              typeInTrait = 'SSD';
            }
            newGroup[`resources:${item.type}`] = parseInt(item.amount);
            newGroup[`trait:CUSTOM_${typeInTrait}_${item.vendor}`] = 'required';
            newGroup[`trait:CUSTOM_${typeInTrait}_PRODUCT_ID_${item.product_id}`] = 'required';
            formData.groups.push(newGroup);
          });
          if ($this.type === 'add') {
            try {
              formData['name'] = $this.formData.name;
              const res = await $this.$ajax({
                type: 'post',
                url: `api/cyborg/v2/device_profiles`,
                data: JSON.stringify([formData]),
                showErrMsg: false,
                errorKey: 'error_message',
                log: {
                  description: {
                    en: `Create GPU Profile: ${$this.formData.name}`,
                    zh_cn: `创建加速器规格：${$this.formData.name}`
                  },
                  target: Vue.logTarget.computeGPU
                }
              });
              $this.$emit('close');
              $this.$emit('refresh');
              $this.saving = false;
            } catch (e) {
              const message = JSON.parse(e);
              $this.$notify.error(message.faultstring);
              $this.saving = false;
              __DEV__ && console.error(e);
            }
          } else {
            try {
              const res = await $this.$ajax({
                type: 'patch',
                url: `api/cyborg/v2/device_profiles/${$this.profile.uuid}`,
                data: JSON.stringify(formData),
                showErrMsg: true,
                errorKey: 'error_message',
                log: {
                  description: {
                    en: `Edit GPU Profile: ${$this.formData.name}`,
                    zh_cn: `编辑加速器规格：${$this.formData.name}`
                  },
                  target: Vue.logTarget.computeGPU
                }
              });
              $this.$emit('close');
              $this.$emit('refresh');
              $this.saving = false;
            } catch (e) {
              $this.saving = false;
              __DEV__ && console.error(e);
            }
          }
        }
      })
    }
  },
  mounted() {
    const $this = this;
    Promise.all([
      $this.loadAllMountedDevices()
    ]).then(res => {
      if ($this.type === 'edit') {
        $this.formData.name = $this.profile.name;
        $this.profile.show_groups.forEach(group => {
          let newGroup = {
            type: '',
            vendor: '',
            product_id: '',
            amount: 0
          };
          Object.keys(group).map(key => {
            if (/^trait:CUSTOM_(GPU|FPGA|SSD)_PRODUCT_ID_(.*)$/.test(key)) {
              newGroup.product_id = key
                .match(/^trait:CUSTOM_(GPU|FPGA|SSD)_PRODUCT_ID_(.*)$/)[2]
                .toUpperCase();
            } else if (/^trait:CUSTOM_(GPU|FPGA|SSD)_(.*)$/.test(key)) {
              newGroup.vendor = key
                .match(/^trait:CUSTOM_(GPU|FPGA|SSD)_(.*)$/)[2]
                .toUpperCase();
            } else if (/^resources:(.*)$/.test(key)) {
              newGroup.type = key
                .match(/^resources:(.*)$/)[1]
                .toUpperCase();
              newGroup.amount = group[key];
            }
          });
          $this.formData.groups.push(newGroup);
        });
      }
    });
  }
}
</script>

<style scoped>
.margin-bottom-15 {
  margin-bottom: 15px;
}
.gpu-profile >>> .el-dialog {
  width: 850px;
}
</style>
