<template>
  <div>
    <div style="margin: 15px; min-height: 400px;">
      <el-form ref="form" :rules="rules" :model="formData" label-position="right" label-width="100px">
        <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_NAME')" class="is-required" prop="name">
          <el-input v-model="formData.name" class="col-18" />
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_DESCRIPTION')" prop="description">
          <el-input v-model="formData.description" class="col-18" type="textarea" />
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_AZ')" class="is-required" prop="az">
          <el-select v-model="formData.az" class="col-10">
            <el-option v-for="(item, index) in availableZones" :key="index" :label="item.zoneName" :value="item.zoneName" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_HOST')" v-if="roleType === '0' && incomingData.sourceType !== 'backup'">
          <el-select v-model="formData.host" class="col-10" filterable clearable>
            <el-option v-for="(item, index) in hosts" :key="index" :label="item.hypervisor_hostname" :value="item.hypervisor_hostname">
              <div style="display: flex; flex-direction: row; justify-content: space-between;">
                <div>
                  <span>{{ item.hypervisor_hostname }}</span>
                </div>
                <div style="margin-left: 15px; font-size: 13px; color: #afd2e4;">CPU {{ item.vcpus_used }}/{{ item.vcpus }} 内存 {{ (item.memory_mb_used / 1024).toFixed(2) }}GB/{{ (item.memory_mb / 1024).toFixed(2) }}GB</div>
              </div>
            </el-option>
          </el-select>
          <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstHostTip')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_AMOUNT')" class="is-required" prop="amount">
          <el-input-number v-model="formData.amount" :disabled="!canEditAmount" :min="1" :max="maxAmount" />
          <el-tooltip v-if="!canEditAmount" placement="top" trigger="hover" :content="'来源为iso格式镜像、云硬盘或云主机备份时，只能创建1台云主机。'">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <div class="el-dialog__footer ng-create-instance-footer">
      <el-button @click="handleClose">{{ $t('calcStorLang.NG_CREATE_INSTANCE_CLOSE') }}</el-button>
      <el-button @click="handlePrev">{{ $t('calcStorLang.NG_CREATE_INSTANCE_PREV') }}</el-button>
      <el-button type="primary" @click="handleNext">{{ $t('calcStorLang.NG_CREATE_INSTANCE_NEXT') }}</el-button>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'StepBasic',
  props: {
    incomingData: {
      type: Object,
      default: () => {}
    },
    quota: {
      type: Object,
      default: {
        instances: {
          limit: -1,
          used: 0,
          remain: 0
        }
      }
    }
  },
  data() {
    return {
      roleType: String(Vue.roleType),
      availableZones: [],
      projects: [],
      hosts: [],
      formData: {
        name: '',
        description: '',
        az: '',
        host: '',
        amount: 1
      },
      rules: {
        name: [{
          type: 'required',
          trigger: 'blur change'
        }, {
          type: 'maxSize',
          value: 40,
          trigger: 'blur change'
        }, {
          type: 'onlyLetter_MinusNumberChinese',
          trigger: 'blur change'
        }],
        description: [{
          type: 'maxSize',
          value: '255',
          trigger: 'blur change'
        }, {
          type: 'noNewLine'
        }],
        az: [{
          type: 'required',
          trigger: 'blur change'
        }]
      }
    };
  },
  methods: {
    handleClose() {
      const $this = this;
      $this.$emit('close');
    },
    handlePrev() {
      const $this = this;
      $this.$emit('prev', $this.formData);
    },
    handleNext() {
      const $this = this;
      $this.$refs.form.validate((valid) => {
        if (valid) {
          $this.$emit('next', $this.formData);
          return true;
        } else {
          return false;
        }
      });
    },
    async loadAZ() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/os-availability-zone/detail`
        });
        let availableZones = res.availabilityZoneInfo;
        availableZones = availableZones.filter(item => item.zoneName !== 'ironic' && item.zoneName !== 'internal' && item.zoneState.available === true);
        $this.availableZones = availableZones;
        if ($this.availableZones.length > 0) {
          $this.formData.az = $this.availableZones[0].zoneName;
        }
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadHosts() {
      const $this = this;
      if ($this.roleType === '0') {
        const result = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/os-hypervisors/detail`
        });
        let hosts = result.hypervisors;
        hosts = hosts.filter(item => item.state.toLowerCase() === 'up' && item.status.toLowerCase() === 'enabled');
        const az = $this.availableZones.find(item => item.zoneName === $this.formData.az);
        hosts = hosts.filter(item => Object.keys(az.hosts).includes(item.hypervisor_hostname));
        $this.hosts = hosts;
        $this.formData.host = '';
      }
    }
  },
  async mounted() {
    const $this = this;
    $this.loadAZ();
  },
  computed: {
    canEditAmount() {
      const $this = this;
      if ($this.incomingData.sourceType === 'image') {
        if ($this.incomingData.sourceImageFormat === 'iso') {
          return false;
        }
      }
      if ($this.incomingData.sourceType === 'volume') {
        return false;
      }
      if ($this.incomingData.sourceType === 'backup') {
        return false;
      }
      return true;
    },
    maxAmount() {
      const $this = this;
      if ($this.quota.instances.limit === -1) {
        return 200;
      } else {
        return $this.quota.instances.remain < 200 ? $this.quota.instances.remain : 200;
      }
    }
  },
  watch: {
    'formData.az'(newValue) {
      this.loadHosts();
    }
  }
}
</script>

<style>

</style>
