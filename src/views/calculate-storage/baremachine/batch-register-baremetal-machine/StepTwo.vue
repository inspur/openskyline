<template>
  <div>
    <el-dialog
      :title="$t('calcStorLang.BAREMETAL_BATCH_REGISTER')"
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
  props: ['machines'],
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
      this.total = this.machines.length;
    },
    async save() {
      let $this = this;
      $this.saving = true;
      $this.machines.map(item => {
        item.saveStatus = 1
      });
      for (let i = 0; i < $this.machines.length; i++) {
        const machine = $this.machines[i];
        try {
          machine.saveStatus = 1;
          let data = {
            name: machine.name,
            driver: 'ipmi',
            driver_info: {
              ipmi_username: machine.bmcusername,
              ipmi_password: machine.bmcpsw,
              ipmi_address: machine.ip,
              deploy_kernel: machine.kernel,
              deploy_ramdisk: machine.ramdisk
            },
            properties: {
              is_adopt: 'no'
            },
            network_interface: machine.nettype
          };
          let res = await $this.$ajax({
            type: 'post',
            url: `api/ironic/v1/nodes`,
            data: JSON.stringify(data),
            showErrMsg: false,
            headers: {
              'X-OpenStack-Nova-API-Version': 2.67
            },
            log: {
              description: {
                en: `Batch Register Baremetal Machine: ${machine.name}`,
                zh_cn: `批量注册裸机: ${machine.name}`
              },
              target: Vue.logTarget.bareMachine
            },
            errFun (xhr, status, msg) {
              machine.saveStatus = 2;
              if ('error_message' in xhr.responseJSON) {
                machine.errMsg = JSON.parse(xhr.responseJSON.error_message).faultstring || xhr.responseJSON.error_message;
              } else {
                machine.errMsg = JSON.stringify(xhr.responseJSON);
              }
            }
          });
          machine.saveStatus = 3;
        } catch (e) {
          __DEV__ && console.error(e);
        }

        if (machine.saveStatus === 3) {
          $this.result += $this.$t('calcStorLang.BAREMETAL_BATCH_REGISTER_RESULT_SUCCESS', i + 1, $this.total, machine.name);
        }
        if (machine.saveStatus === 2) {
          $this.result += $this.$t('calcStorLang.BAREMETAL_BATCH_REGISTER_RESULT_FAIL', i + 1, $this.total, machine.name, machine.errMsg);
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
