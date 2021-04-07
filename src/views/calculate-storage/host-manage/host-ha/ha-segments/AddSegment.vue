<template>
  <div>
    <el-dialog :visible="dialogVisible" :before-close="handleClose" :title="$t('calcStorLang.addSegment')" size="tiny" custom-class="add-segment">
      <el-form ref="form" class="me-required-form" :rules="rules" :model="formData" label-width="100px" label-position="right">
        <el-form-item :label="$t('calcStorLang.segmentName')" class="is-required">
          <el-col :span="6">
            <el-form-item prop="az">
              <el-select v-model="formData.az">
                <el-option v-for="(item, index) in az" :key="index" :value="item" :label="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="1">@</el-col>
          <el-col :span="11">
            <el-form-item prop="name" class="is-require">
              <el-input v-model="formData.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="1">
            <el-tooltip placement="right">
              <div slot="content" v-html="$t('calcStorLang.HA_SEGMENT_TIPS')"></div>
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-col>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.recoveryMethod')" prop="recovery_method" class="is-required">
          <el-select v-model="formData.recovery_method" class="col-18">
            <el-tooltip effect="dark" :content="$t('calcStorLang.editSegmentTip1')" placement="right">
              <el-option :label="$t('calcStorLang.editSegmentAuto')" value="auto"></el-option>
            </el-tooltip>
            <el-tooltip effect="dark" :content="$t('calcStorLang.editSegmentTip2')" placement="right">
              <el-option :label="$t('calcStorLang.editSegmentReservedHost')" value="reserved_host"></el-option>
            </el-tooltip>
            <!-- <el-tooltip effect="dark" :content="$t('calcStorLang.editSegmentTip3')" placement="right">
                <el-option :label="$t('calcStorLang.editSegmentAutoPriority')" value="auto_priority"></el-option>
            </el-tooltip> -->
            <el-tooltip effect="dark" :content="$t('calcStorLang.editSegmentTip4')" placement="right">
              <el-option :label="$t('calcStorLang.editSegmentRHPriority')" value="rh_priority"></el-option>
            </el-tooltip>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.haSwitch')" prop="enable">
            <el-switch v-model="formData.enable" />
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.serviceType')" prop="service_type" v-if="false">
          <el-select v-model="formData.service_type" class="col-18">
            <el-option label="COMPUTE" value="compute"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('lang.desc')" prop="description">
          <el-input v-model="formData.description" type="textarea" class="col-18"></el-input>
        </el-form-item>
        <el-collapse>
          <el-collapse-item :title="$t('calcStorLang.segmentCurrentLimition')">
            <el-form-item :label="$t('calcStorLang.HOST_HA_SEGMENT_VM_EVACUATION_CONCURRENCY')" label-width="170px" prop="limition.vm_evacuation_concurrency">
              <el-input v-model="formData.limition.vm_evacuation_concurrency" class="col-18"></el-input>
              <el-tooltip placement="top" trigger="hover">
                <span slot="content" v-html="$t('calcStorLang.HOST_HA_SEGMENT_VM_EVACUATION_CONCURRENCY_TIPS', formData.limition.vm_evacuation_concurrency)" />
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('calcStorLang.HOST_HA_SEGMENT_VM_EVACUATION_FAILED_NUMBER')" label-width="170px" prop="limition.vm_evacuation_failed_number">
              <el-input v-model="formData.limition.vm_evacuation_failed_number" class="col-18"></el-input>
              <el-tooltip placement="top" trigger="hover">
                <span slot="content" v-html="$t('calcStorLang.HOST_HA_SEGMENT_VM_EVACUATION_FAILED_NUMBER_TIPS', formData.limition.vm_evacuation_failed_number)" />
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('calcStorLang.HOST_HA_SEGMENT_HOST_RECOVERY_CONCURRENCY')" label-width="170px" prop="limition.host_recovery_concurrency">
              <el-input v-model="formData.limition.host_recovery_concurrency" class="col-18"></el-input>
              <el-tooltip placement="top" trigger="hover">
                <span slot="content" v-html="$t('calcStorLang.HOST_HA_SEGMENT_HOST_RECOVERY_CONCURRENCY_TIPS', formData.limition.host_recovery_concurrency)" />
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('calcStorLang.HOST_HA_SEGMENT_HOST_RECOVERY_STATISTICAL_PERIOD')" label-width="170px" prop="limition.host_recovery_statistical_period">
              <el-input v-model="formData.limition.host_recovery_statistical_period" class="col-18"></el-input>
            </el-form-item>
            <el-form-item :label="$t('calcStorLang.HOST_HA_SEGMENT_HOST_RECOVERY_FAILED_NUMBER')" label-width="170px" prop="limition.host_recovery_failed_number">
              <el-input v-model="formData.limition.host_recovery_failed_number" class="col-18"></el-input>
              <el-tooltip placement="top" trigger="hover">
                <span slot="content" v-html="$t('calcStorLang.HOST_HA_SEGMENT_HOST_RECOVERY_FAILED_NUMBER_TIPS', formData.limition.host_recovery_statistical_period, formData.limition.host_recovery_failed_number)" />
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>
      <span slot="footer">
        <el-button @click="cancel()">{{ $t('base.cancel') }}</el-button>
        <el-button type="primary" @click="save()" :loading="saving">{{ $t('base.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AddSegment',
  data() {
    return {
      dialogVisible: false,
      saving: false,
      az: [],
      formData: {
        name: '',
        service_type: 'compute',
        recovery_method: '',
        enable: true,
        description: '',
        az: '',
        limition: {
          host_recovery_concurrency: 1,
          host_recovery_statistical_period: 60,
          host_recovery_failed_number: 2,
          vm_evacuation_concurrency: 3,
          vm_evacuation_failed_number: 2
        }
      },
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'onlyLetter_MinusNumberChinese' },
          { type: 'maxSize', value: 255 }
        ],
        recovery_method: [
          { type: 'required', trigger: 'blur change' }
        ],
        az: [
          { type: 'required', trigger: 'blur change' }
        ],
        description:[
          { type: 'maxSize', value: 255 }
        ],
        'limition.host_recovery_concurrency': [
          { type: 'unsignedPositiveInteger' }
        ],
        'limition.host_recovery_statistical_period': [
          { type: 'unsignedPositiveInteger' }
        ],
        'limition.host_recovery_failed_number': [
          { type: 'unsignedPositiveInteger' }
        ],
        'limition.vm_evacuation_concurrency': [
          { type: 'unsignedPositiveInteger' }
        ],
        'limition.vm_evacuation_failed_number': [
          { type: 'unsignedPositiveInteger' }
        ]
      }
    }
  },
  methods: {
    show() {
      this.dialogVisible = true;
    },
    cancel() {
      this.$emit('handleClose');
    },
    handleClose(done) {
      this.$emit('handleClose');
      done();
    },
    async getAZ() {
      const $this = this;
      try {
        let res = await $this.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-availability-zone/detail'
        });
        $this.loading = false;
        $this.az = res.availabilityZoneInfo
          .filter(item => item.zoneName !== 'ironic' && item.zoneName !== 'internal' && item.zoneState.available === true)
          .map(item => item.zoneName);
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    save() {
      const self = this;
      self.saving = true;
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          try {
            self.saving = true;
            const name = `${self.formData.az}@${self.formData.name}`;
            let ret = await self.$ajax({
              type: 'post',
              data: JSON.stringify({
                segment: {
                  name,
                  recovery_method: self.formData.recovery_method,
                  enable: self.formData.enable,
                  service_type: self.formData.service_type,
                  description: self.formData.description,
                  limition: {
                    host_recovery_concurrency: parseInt(self.formData.limition.host_recovery_concurrency),
                    host_recovery_statistical_period: parseInt(self.formData.limition.host_recovery_statistical_period),
                    host_recovery_failed_number: parseInt(self.formData.limition.host_recovery_failed_number),
                    vm_evacuation_concurrency: parseInt(self.formData.limition.vm_evacuation_concurrency),
                    vm_evacuation_failed_number: parseInt(self.formData.limition.vm_evacuation_failed_number)
                  }
                }
              }),
              successMsg: Vue.t('calcStorLang.addSegmentSuccessTip'),
              url: 'api/masakari/v1/segments',
              log: {
                target: Vue.logTarget.hostHa,
                level: {
                  en: "info",
                  zh_cn: "信息"
                },
                description: {
                  en: `Create HA Segments: ${name}`,
                  zh_cn: `创建高可用集群: ${name}`
                }
              }
            });
            self.saving = false;
            self.$emit('handleClose');
            self.$emit('handleAddSegment');
          } catch (data) {
            __DEV__ && console.error(data);
            self.saving = false;
          }
        } else {
          self.saving = false;
          return false;
        }
      })
    },
    initDialog() {
      this.show();
    }
  },
  mounted() {
    this.initDialog();
    this.getAZ();
  }
}
</script>

<style scoped>
.line {
  text-align: center;
}
</style>

<style>
.add-segment {
  width: 850px;
}
</style>
