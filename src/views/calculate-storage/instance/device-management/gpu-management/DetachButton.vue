<template>
  <el-button @click="detach" size="small" :loading="detaching" type="text">{{ $t('calcStorLang.GPU_DETACH') }}</el-button>
</template>

<script>
export default {
  props: {
    instance: {
      type: Object,
      default: {}
    },
    device: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      detaching: false
    };
  },
  methods: {
    detach() {
      const $this = this;
      $this.$confirm($this.$t('calcStorLang.GPU_DETACH_CONFIRM'), Vue.t('base.prompt'), {
        confirmButtonText: Vue.t('base.confirm'),
        cancelButtonText: Vue.t('base.cancel'),
        type: 'warning'
      }).then(async () => {
        const device = $this.device;
        $this.detaching = true;
        try {
          const res = await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/action`,
            data: JSON.stringify({
              accelUnbind: {
                accelerators: [{
                  device_rp_uuid: device.device_rp_uuid,
                  addr: device.address,
                  arqs_uuid: device.uuid,
                  device_type: device.attribute_type
                }]
              }
            }),
            log: {
              description: {
                en: `Unbind Accelerator (Insntace: ${$this.instance.name} UUID: ${$this.instance.id} Address: ${device.address} Name: ${device.accel_name})`,
                zh_cn: `解绑加速器（云主机：${$this.instance.name} UUID：${$this.instance.id} 地址：${device.address} 加速器名：${device.accel_name}）`
              },
              target: Vue.logTarget.computeInstance
            }
          });
          $this.$message.success($this.$t('calcStorLang.GPU_DETACH_SUCCESS'));
          $this.$emit('refresh');
          $this.detaching = false;
        } catch (e) {
          __DEV__ && console.error(e);
          $this.detaching = false;
        }
      });
    }
  }
}
</script>

<style>

</style>