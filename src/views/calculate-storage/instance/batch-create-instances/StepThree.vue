<template>
  <div>
    <el-dialog
      :title="$t('calcStorLang.BATCH_CREATE_INSTANCE')"
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
  name: 'BatchCreateInstancesStepThree',
  props: ['projectId', 'userId', 'instances'],
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
      this.total = this.instances.length;
    },
    async save() {
      let $this = this;
      $this.saving = true;
      $this.instances.map(item => {
        item.saveStatus = 1
      });
      for (let i = 0; i < $this.instances.length; i++) {
        const instance = $this.instances[i];
        try {
          instance.saveStatus = 1;
          let az = instance.az;
          if (instance.host !== null && instance.host !== '') {
            az += `::${instance.host}`;
          }
          let server = {
            'OS-DCF:diskConfig': 'AUTO',
            availability_zone: az,
            description: instance.description,
            flavorRef: instance.flavorId,
            imageRef: '',
            block_device_mapping_v2: [{
              boot_index: 0,
              delete_on_termination: false,
              destination_type: 'volume',
              device_name: 'vda',
              source_type: 'image',
              uuid: instance.imageId,
              volume_size: instance.disk,
              volume_type: instance.volumeTypeId
            }],
            max_count: String(instance.number),
            min_count: 1,
            name: instance.name,
            networks: [{
              uuid: instance.networkId
            }],
            projectId: $this.projectId,
            security_groups: [{
              name: instance.netSafeGroupId
            }],
            tags: [],
            userId: $this.userId,
            metadata: {}
          };
          if (instance.password !== '') {
            server.adminPass = instance.password;
          }
          if (instance.fixedIP !== '') {
            server.networks[0].fixed_ip = instance.fixedIP;
          }
          let res = await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers-inspur`,
            data: JSON.stringify({
              'OS-SCH-HNT:scheduler_hints': {
                '_nova_check_type': true
              },
              server
            }),
            showErrMsg: false,
            headers: {
              'X-OpenStack-Nova-API-Version': 2.67
            },
            log: {
              description: {
                en: `Create Instance By Batch Create: ${instance.name}`,
                zh_cn: `通过批量模板创建云主机: ${instance.name}`
              },
              target: Vue.logTarget.computeInstance
            },
            errFun (xhr, status, msg) {
              instance.saveStatus = 2;
              if ('badRequest' in xhr.responseJSON) {
                instance.errMsg = xhr.responseJSON.badRequest.message;
              } else {
                instance.errMsg = JSON.stringify(xhr.responseJSON);
              }
            }
          });
          instance.saveStatus = 3;
        } catch (e) {
          __DEV__ && console.error(e);
        }

        if (instance.saveStatus === 3) {
          $this.result += $this.$t('calcStorLang.BATCH_CREATE_INSTANCE_RESULT_SUCCESS', i + 1, $this.total, instance.name);
        }
        if (instance.saveStatus === 2) {
          $this.result += $this.$t('calcStorLang.BATCH_CREATE_INSTANCE_RESULT_FAIL', i + 1, $this.total, instance.name, instance.errMsg);
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
