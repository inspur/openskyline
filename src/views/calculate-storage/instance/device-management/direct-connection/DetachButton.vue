<template>
  <el-button @click="detach" size="small" :loading="detaching" type="text">{{ $t('calcStorLang.DIRECT_CONNECT_DETACH') }}</el-button>
</template>

<script>
export default {
  props: {
    instance: {
      type: Object,
      default: {}
    },
    disk: {
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
      $this.$confirm($this.$t('calcStorLang.DIRECT_CONNECT_DETACH_CONFIRM'), Vue.t('base.prompt'), {
        confirmButtonText: Vue.t('base.confirm'),
        cancelButtonText: Vue.t('base.cancel'),
        type: 'warning'
      }).then(async () => {
        const disk = $this.disk;
        $this.detaching = true;
        try {
          const res = await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/action`,
            data: JSON.stringify({
              passthruDetach: {
                passthru_vol_id: $this.disk.volume_id
              }
            }),
            log: {
              description: {
                en: `Detach Direct Connect Disk (Insntace: ${$this.instance.name} UUID: ${$this.instance.id} Addr: ${disk.addr} Name: ${disk.volume_name})`,
                zh_cn: `卸载直通盘 （云主机：${$this.instance.name} UUID：${$this.instance.id} 地址：${disk.addr} 盘名：${disk.volume_name}）`
              },
              target: Vue.logTarget.computeInstance,
              errorKey: 'NeutronError'
            }
          });
          $this.$message.success($this.$t('calcStorLang.DIRECT_CONNECT_DETACH_SUCCESS'));
          setTimeout(() => {
            $this.$emit('refresh');
            $this.detaching = false;
          }, 2000);
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