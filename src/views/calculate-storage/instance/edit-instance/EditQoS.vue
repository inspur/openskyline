<template>
  <div>
    <el2-dialog :visible="true" :before-close="handleClose" :append-to-body="true" :close-on-click-modal="false" :title="title" width="600px">
      <el-form :model="formData" :rules="rules" ref="form" onsubmit="return false;" label-width="60px" label-position="right">
        <el-form-item :label="$t('calcStorLang.EDIT_INSTANCE_QOS_KEY')" prop="key" class="is-required">
          <el2-select v-model="formData.key" style="width: 90%;" :disabled="type === 'edit'" @change="handleKeyChanged">
            <el2-option v-for="item in keys" :key="item.key" :value="item.key" :label="$t(item.label)" />
          </el2-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.EDIT_INSTANCE_QOS_VALUE')" prop="value" class="is-required">
          <el2-select v-model="formData.value" v-if="formData.key === 'cpu_shares'" style="width: 90%;">
            <el2-option value="2048" :label="$t('calcStorLang.EDIT_INSTANCE_QOS_HIGH')" />
            <el2-option value="1024" :label="$t('calcStorLang.EDIT_INSTANCE_QOS_MEDIUM')" />
            <el2-option value="512" :label="$t('calcStorLang.EDIT_INSTANCE_QOS_LOW')" />
          </el2-select>
          <el-input v-model="formData.value" :placeholder="computedUnit" style="width: 90%;" v-if="['cpu_period', 'cpu_quota', 'soft_limit'].includes(formData.key)" />
          <el-tooltip placement="right">
            <div slot="content" v-html="$t('calcStorLang.EDIT_INSTANCE_QOS_TIPS_CPU_SHARES')"></div>
            <i v-show="formData.key === 'cpu_shares'" class="el-icon-fa-question-circle"></i>
          </el-tooltip>
          <el-tooltip placement="right">
            <div slot="content" v-html="$t('calcStorLang.EDIT_INSTANCE_QOS_TIPS_CPU_PERIOD')"></div>
            <i v-show="formData.key === 'cpu_period'" class="el-icon-fa-question-circle"></i>
          </el-tooltip>
          <el-tooltip placement="right">
            <div slot="content" v-html="$t('calcStorLang.EDIT_INSTANCE_QOS_TIPS_CPU_QUOTA')"></div>
            <i v-show="formData.key === 'cpu_quota'" class="el-icon-fa-question-circle"></i>
          </el-tooltip>
          <el-tooltip placement="right">
            <div slot="content" v-html="$t('calcStorLang.EDIT_INSTANCE_QOS_TIPS_SOFT_LIMIT')"></div>
            <i v-show="formData.key === 'soft_limit'" class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="close()">{{ $t('base.cancel') }}</el-button>
        <el-button type="primary" @click="submit">{{ $t('base.confirm') }}</el-button>
      </span>
    </el2-dialog>
  </div>
</template>

<script>
import QoSKeys from './QoSKeys';
export default {
  name: 'EditQoS',
  props: {
    type: {
      type: String,
      default: 'add'
    },
    specifiedData: {
      type: Object,
      default: {}
    },
    existingKeys: {
      type: Array,
      default: []
    },
    cpuQuotaMax: {
      type: Number,
      default: 2200
    },
    hideCpuQuota: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      title: '',
      formData: {
        key: '',
        value: '',
        unit: ''
      },
      rules: {
        value: [
          { type: 'required' },
          { type: 'unsignedPositiveInteger' },
          { validator: (rule, value, callback) => {
            if (this.formData.key === 'cpu_period') {
              if (Number(value) < 1000 || Number(value) > 100000) {
                callback(this.$t('calcStorLang.EDIT_INSTANCE_QOS_RULE_TIPS_CPU_PERIOD'));
              } else {
                callback();
              }
            } else if (this.formData.key === 'cpu_quota') {
              if (Number(value) < this.cpuQuotaMax / 100 || Number(value) > this.cpuQuotaMax) {
                callback(this.$t('calcStorLang.EDIT_INSTANCE_QOS_RULE_TIPS_CPU_QUOTA', [this.cpuQuotaMax / 100, this.cpuQuotaMax]));
              } else {
                callback();
              }
            } else if (this.formData.key === 'soft_limit') {
              if (Number(value) < 1 || Number(value) > 8388608) {
                callback(this.$t('calcStorLang.EDIT_INSTANCE_QOS_RULE_TIPS_SOFT_LIMIT'));
              } else {
                callback();
              }
            } else {
              callback();
            }
          }}
        ]
      }
    };
  },
  methods: {
    handleClose(done) {
      done();
      this.close();
    },
    close(done) {
      this.$emit('close');
    },
    submit() {
      const $this = this;
      $this.$refs.form.validate((valid) => {
        if (valid) {
          $this.$emit('submit', $this.type, $this.formData.key, $this.formData.value);
          $this.close();
        }
      });
    },
    // 使用字符串比较数字大小
    greaterThan(a, b) {
      a = String(a);
      b = String(b);
      if (!/^[0-9]+$/.test(a) || !/^[0-9]+$/.test(b)) {
        throw new Error('the two invalue must be Number.');
      } else {
        if (a.length > b.length) {
          return true;
        } else if (a.length < b.length) {
          return false;
        } else {
          return a > b;
        }
      }
    },
    handleKeyChanged() {
    }
  },
  computed: {
    computedUnit() {
      const $this = this;
      if ($this.formData.unit === '') {
        return '';
      } else {
        return '单位：'+$this.formData.unit;
      }
    },
    keys() {
      const $this = this;
      if ($this.hideCpuQuota) {
        return QoSKeys.filter(item => item.key !== 'cpu_quota');
      }
      return QoSKeys;
    }
  },
  watch: {
    'formData.key'(newValue) {
      const $this = this;
      if ($this.type === 'add') {
        $this.formData.value = '';
      }
      let k = $this.keys.find(item => item.key === newValue);
      if (k) {
        $this.formData.unit = k.unit || '';
      }
    }
  },
  async mounted() {
    const $this = this;
    if ($this.type === 'add') {
      $this.title = $this.$t('calcStorLang.EDIT_INSTANCE_ADD_QOS');
      $this.keys = $this.keys.filter(item => {
        return !$this.existingKeys.includes(item.key);
      });
      $this.formData.key = $this.keys[0].key;
    } else {
      $this.title = $this.$t('calcStorLang.EDIT_INSTANCE_EDIT_QOS');
      $this.formData.key = $this.specifiedData.key;
      $this.formData.value = $this.specifiedData.value;
    }
  }
};
</script>

<style scoped>
</style>
