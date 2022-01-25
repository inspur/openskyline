<template>
  <span>{{ source }}</span>
</template>

<script>
export default {
  name: 'InstanceSource',
  props: {
    instance: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      source: ''
    };
  },
  watch: {
    instance: {
      deep: true,
      immediate: true,
      async handler(newValue) {
        const type = newValue['metadata']['source_type'];
        let sourceId = '';
        if (type === "image") {
          sourceId = newValue['image'].id;
          this.source = `${Vue.t('calcStorLang.image')}(${sourceId})`;
        } else if (type === "snapshot") {
          sourceId = newValue['image'].id;
        this.source = `${Vue.t('calcStorLang.instanceshot')}(${sourceId})`;
        } else if (type === "volume") {
          const volumeList = newValue['os-extended-volumes:volumes_attached'];
          for (let volume of volumeList) {
            const res = await this.$ajax({
              type: 'get',
              url: `api/cinderv2/v3/${newValue.tenant_id}/volumes/${volume.id}`
            });
            if (res.volume.bootable === 'true') {
              sourceId = res.volume.id;
              break;
            }
          }
          this.source = `${Vue.t('calcStorLang.volume')}(${sourceId})`;
        } else {
          this.source = '-';
        }
      }
    }
  }
}
</script>

<style>

</style>
