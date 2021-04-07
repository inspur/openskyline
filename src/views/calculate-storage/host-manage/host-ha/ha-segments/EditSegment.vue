<template>
  <div>
    <el-dialog :visible="dialogVisible" :before-close="handleClose" :title="$t('calcStorLang.editSegment')" size="tiny" custom-class="edit-segment">
      <el-form ref="form" class="me-required-form" :rules="rules" :model="formData" label-width="100px" label-position="right">
        <el-form-item :label="$t('calcStorLang.segmentName')" prop="name" class="is-required">
          <el-input :disabled="true" v-model="formData.name" class="col-18"></el-input>
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
          <el-tooltip placement="right">
            <div slot="content" v-html="showTooltip()"></div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
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
  name: 'EditSegment',
  props: ['segment_id'],
  data() {
    return {
      dialogVisible: false,
      saving: false,
      formData: {
        name: '',
        service_type: 'compute',
        recovery_method: '',
        enable: true,
        description: '',
        limition: {
          host_recovery_concurrency: 1,
          host_recovery_statistical_period: 60,
          host_recovery_failed_number: 2,
          vm_evacuation_concurrency: 3,
          vm_evacuation_failed_number: 2
        }
      },
      rules: {
        recovery_method: [
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
      this.dialogVisible = true
    },
    cancel() {
      this.$emit('handleClose')
    },
    handleClose(done) {
      this.$emit('handleClose')
      done()
    },
    showTooltip() {
      let temp ="";
      switch (this.formData.recovery_method) {
        case "auto" : temp = Vue.t('calcStorLang.editSegmentTip1'); break;
        case "reserved_host" : temp = Vue.t('calcStorLang.editSegmentTip2'); break;
        case "auto_priority" : temp = Vue.t('calcStorLang.editSegmentTip3'); break;
        case "rh_priority" : temp = Vue.t('calcStorLang.editSegmentTip4'); break;
        default: temp = "";
      }
      return temp;
    },
    save() {
      const self = this
      self.saving = true
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          try {
            self.saving = true
            let ret = await self.$ajax({
              type: 'put',
              data: JSON.stringify({
                segment: {
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
              successMsg: Vue.t('calcStorLang.editSegmentSuccessTip'),
              url: 'api/masakari/v1/segments/' + self.segment_id,
              log: {
                target: Vue.logTarget.hostHa,
                level: {
                  en: "info",
                  zh_cn: "信息"
                },
                description: {
                  en: "Edit Segments : " + self.formData.name + "Success",
                  zh_cn: "编辑高可用集群:" + self.formData.name +"成功"
                }
              }
            })
            self.saving = false
            self.$emit('handleClose')
            self.$emit('handleEditSegment')
          } catch (data) {
            self.saving = false
          }
        } else {
          self.saving = false
          return false
        }
      })
    },
    async initDialog() {
      const self = this
      let ret = await self.$ajax({
        type: 'get',
        url: 'api/masakari/v1/segments/' + self.segment_id
      })
      this.formData = {
        name: ret.segment.name,
        service_type: ret.segment.service_type,
        recovery_method: ret.segment.recovery_method,
        enable: ret.segment.enable,
        description: ret.segment.description,
        limition: {
          host_recovery_concurrency: ret.segment.limition.host_recovery_concurrency || 1,
          host_recovery_statistical_period: ret.segment.limition.host_recovery_statistical_period || 60,
          host_recovery_failed_number: ret.segment.limition.host_recovery_failed_number || 2,
          vm_evacuation_concurrency: ret.segment.limition.vm_evacuation_concurrency || 3,
          vm_evacuation_failed_number: ret.segment.limition.vm_evacuation_failed_number || 2
        }
      }
      this.show()
    }
  },

  mounted() {
  },

  created() {
  }
}
</script>

<style scoped>

</style>

<style>
.edit-segment {
  width: 850px;
}
</style>
