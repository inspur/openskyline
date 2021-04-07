<template>
  <div>
    <el-dialog
      :title="$t('calcStorLang.INSTANCE_CLONE')"
      size="middle"
      :show-close="!saving"
      :before-close="handleClose"
      :visible="true">
      <div>
        <el-progress
          :show-text="true"
          :text-inside="true"
          :stroke-width="26"
          :percentage="percentage" />
        <el-input
          style="margin-top: 15px;"
          type="textarea"
          readonly
          :rows="15"
          v-model="result" />
      </div>
      <span slot="footer">
        <el-button type="primary" :loading="saving" @click="close">{{ saving ? $t('calcStorLang.BATCH_CREATE_INSTANCE_PROCESSING') : $t('calcStorLang.BATCH_CREATE_INSTANCE_DONE') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'underscore';
export default {
  name: 'StepTwo',
  props: ['clones'],
  data() {
    return {
      saving: true,
      total: 0,
      current: 0,
      percentage: 0,
      result: ''
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    handleClose(done) {
      done();
      this.close();
    },
    init() {
      this.current = 0;
      this.total = this.clones.length;
    },
    async save() {
      let $this = this;
      $this.saving = true;
      $this.clones.map(item => {
        item.saveStatus = 1
      });
      for (let i = 0; i < $this.clones.length; i++) {
        const clone = $this.clones[i];
        try {
          clone.saveStatus = 1;
          let data = {
            clone: {
              basename: clone.basename,
              count: clone.count
            }
          };
          if (clone.loginType === 2) {
            data.clone.key_name = clone.keyPair;
          }
          if (clone.loginType === 3) {
            data.clone.adminPass = clone.password;
          }
          let res = await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers-inspur/${clone.id}/action`,
            data: JSON.stringify(data),
            showErrMsg: false,
            headers: {
              'X-OpenStack-Nova-API-Version': 2.67
            },
            log: {
              description: {
                en: `Clone Instance: ${clone.name}(${clone.id})`,
                zh_cn: `克隆云主机: ${clone.name}(${clone.id})`
              },
              target: Vue.logTarget.computeInstance
            },
            errFun (xhr, status, msg) {
              clone.saveStatus = 2;
              if ('error_message' in xhr.responseJSON) {
                clone.errMsg = JSON.parse(xhr.responseJSON.error_message).faultstring || xhr.responseJSON.error_message;
              } else {
                clone.errMsg = JSON.stringify(xhr.responseJSON);
              }
            }
          });
          clone.saveStatus = 3;
        } catch (e) {
          __DEV__ && console.error(e);
        }

        if (clone.saveStatus === 3) {
          $this.result += $this.$t('calcStorLang.INSTANCE_CLONE_RESULT_SUCCESS', i + 1, $this.total, clone.name);
        }
        if (clone.saveStatus === 2) {
          $this.result += $this.$t('calcStorLang.INSTANCE_CLONE_RESULT_FAIL', i + 1, $this.total, clone.name, clone.errMsg);
        }
        $this.current = i + 1;
        $this.percentage = Math.floor($this.current / $this.total * 100);
      }
      $this.saving = false;
    }
  },
  async mounted() {
    this.init();
    await this.save();
  }
}
</script>

<style>

</style>
