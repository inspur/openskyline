<template>
  <div>
    <div style="margin: 15px; min-height: 400px;">
      <el-form ref="form" :rules="rules" :model="formData" label-position="right" label-width="120px">
        <el-card class="margin-bottom-10" :body-style="{ 'margin-bottom': '-20px' }" v-if="roleType !== '3'">
          <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_SERVER_GROUP')">
            <el-select :disabled="incomingData.host !== ''" v-model="formData.serverGroup" :placeholder="$t('calcStorLang.NG_CREATE_INSTANCE_SERVER_GROUP_EMPTY')" clearable>
              <el-option v-for="(item, index) in serverGroups" :key="index" :label="item.name+'('+item.policyStr+')'" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-card>
        <el-card class="margin-bottom-10" :body-style="{ 'margin-bottom': '-20px' }" v-if="$archIs('x86')">
          <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_BLUE')">
            <el-select v-model="formData.panicStrategy">
              <el-option :label="$t('calcStorLang.NG_CREATE_INSTANCE_BLUE_NONE')" value="" />
              <el-option :label="$t('calcStorLang.NG_CREATE_INSTANCE_BLUE_SHUDOWN')" value="shutdown" />
              <el-option :label="$t('calcStorLang.NG_CREATE_INSTANCE_BLUE_REBOOT')" value="reboot" />
            </el-select>
          </el-form-item>
        </el-card>
        <el-card class="margin-bottom-10" :body-style="{ 'margin-bottom': '-12px' }" v-if="roleType !== '3'">
          <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE')">
            <el-select v-model="formData.cpuMode">
              <el-option :label="$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_HOST_PASSTHROUGH')" value="host-passthrough" />
              <el-option :label="$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_HOST_MODEL')" value="host-model" />
              <el-option :label="$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_NONE')" value="none" />
              <el-option :label="$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_CUSTOM')" value="custom" />
              <el-option :label="$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_EMPTY')" value="" />
            </el-select>
            <el-tooltip placement="top" trigger="hover">
              <div slot="content" v-html="$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_TIPS')" />
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODEL')" prop="cpuModel" v-if="formData.cpuMode === 'custom'">
            <el-select v-model="formData.cpuModel">
              <el-option label="Nehalem" value="Nehalem" />
              <el-option label="Westmere" value="Westmere" />
              <el-option label="SandyBridge" value="SandyBridge" />
              <el-option label="IvyBridge" value="IvyBridge" />
            </el-select>
            <el-tooltip placement="top" trigger="hover">
              <div slot="content" v-html="$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODEL_TIPS')" />
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
        </el-card>
        <el-card class="margin-bottom-10" :body-style="{ 'margin-bottom': '-12px' }">
          <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_VNC_PASSWORD')" prop="vncPassword" :class="{ 'is-required': forceVNCPassword }">
            <el-input type="password" v-model="formData.vncPassword" class="col-18" />
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_CONFIRM_VNC_PASSWORD')" prop="confirmVNCPassword" :class="{ 'is-required': forceVNCPassword }">
            <el-input type="password" v-model="formData.confirmVNCPassword" class="col-18" />
          </el-form-item>
        </el-card>
        <el-card v-if="roleType !== '3'" class="margin-bottom-10" :body-style="{ 'margin-bottom': '-12px' }">
          <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_USER_DATA')" prop="userData">
            <el-input type="textarea" v-model="formData.userData" :rows="5" class="col-18" />
            <el-tooltip placement="top" trigger="hover">
              <div slot="content" v-html="$t('calcStorLang.NG_CREATE_INSTANCE_USER_DATA_TIPS')" />
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
        </el-card>
        <el-collapse v-if="roleType !== '3' && !$archIs('mips')">
          <el-collapse-item title="QoS">
            <qos @data-changed="handleQoSDataChanged" :cpu-quota-max="cpuQuotaMax" />
          </el-collapse-item>
        </el-collapse>
      </el-form>
    </div>
    <div class="el-dialog__footer ng-create-instance-footer">
      <el-button @click="handleClose">{{ $t('calcStorLang.NG_CREATE_INSTANCE_CLOSE') }}</el-button>
      <el-button @click="handlePrev">{{ $t('calcStorLang.NG_CREATE_INSTANCE_PREV') }}</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">{{ $t('calcStorLang.NG_CREATE_INSTANCE_SUBMIT') }}</el-button>
    </div>
  </div>
</template>

<script>
import QoS from './addition/QoS';
export default {
  name: 'StepAddition',
  props: {
    incomingData: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  components: {
    'qos': QoS
  },
  data() {
    return {
      saving: false,
      roleType: String(Vue.roleType),
      formData: {
        serverGroup: '',
        panicStrategy: '',
        cpuMode: 'host-model',
        cpuModel: '',
        vncPassword: '',
        confirmVNCPassword: '',
        userData: '',
        qos: []
      },
      cpuQuotaMax: 2200,
      serverGroups: [],
      rules: {
        vncPassword: [{
          type: 'passwordLegal',
          trigger: 'blur change'
        }],
        confirmVNCPassword: [{
          type: 'passwordEquals',
          context: this,
          value: 'formData.vncPassword',
          trigger: 'blur change'
        }],
        cpuModel: [{
          type: 'required'
        }],
        userData: [{
          type: 'base64LengthMax',
          value: 65536
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
      $this.$refs.form.validate((valid) => {
        if (valid) {
          $this.$emit('prev', $this.formData);
        }
      });
    },
    handleSubmit() {
      const $this = this;
      $this.saving = true;
      $this.$refs.form.validate((valid) => {
        if (valid) {
          $this.$emit('submit', $this.formData);
        } else {
          $this.saving = false;
          return false;
        }
      });
    },
    async loadServerGroups() {
      const $this = this;
      if ($this.incomingData.projectId !== '') {
        try {
          const res = await $this.$ajax({
            type: 'get',
            url: `api/nova/v2.1/os-server-groups?all_projects=True`,
            headers: {
              'X-OpenStack-Nova-API-Version': 2.13
            }
          });
          let serverGroups = res.server_groups;
          serverGroups = serverGroups.filter(item => item.project_id === $this.incomingData.projectId);
          serverGroups.forEach(item => {
            let policyStr = '';
            switch (item.policies[0]) {
              case 'affinity':
                policyStr = $this.$t('calcStorLang.NG_CREATE_INSTANCE_SERVER_GROUP_AFFINITY');
                break;
              case 'soft-affinity':
                policyStr = $this.$t('calcStorLang.NG_CREATE_INSTANCE_SERVER_GROUP_ANTI_AFFINITY');
                break;
              case 'anti-affinity':
                policyStr = $this.$t('calcStorLang.NG_CREATE_INSTANCE_SERVER_GROUP_ANTI_AFFINITY');
                break;
              default:
                policyStr = item.policies[0];
            }
            item.policyStr = policyStr;
          });
          $this.serverGroups = serverGroups;
          $this.formData.serverGroup = '';
        } catch (e) {
          __DEV__ && console.error(e);
        }
      }
    },
    handleQoSDataChanged(qos) {
      this.formData.qos = JSON.parse(JSON.stringify(qos));
    }
  },
  mounted() {
    const $this = this;
    if ($this.forceVNCPassword) {
      $this.rules.vncPassword.push({ type: 'required' });
      $this.rules.confirmVNCPassword.push({ type: 'required' });
    }
    $this.$on('save-error', () => {
      $this.saving = false;
    });
  },
  watch: {
    'incomingData.projectId': {
      immediate: true,
      handler(newValue) {
        this.loadServerGroups();
      }
    },
    'incomingData.host': {
      immediate: true,
      handler(newValue) {
        if (newValue !== '') {
          this.formData.serverGroup = '';
        }
      }
    },
    'incomingData.vcpus': {
      immediate: false,
      handler(newValue) {
        if (newValue) {
          this.cpuQuotaMax = 2200 * newValue;
        }
      }
    }
  },
  computed: {
    forceVNCPassword() {
      return Vue.forceVNCPassword;
    }
  }
}
</script>

<style scoped>
.margin-bottom-10 {
  margin-bottom: 10px;
}
</style>
