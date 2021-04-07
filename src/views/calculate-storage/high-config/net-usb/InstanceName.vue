<template>
  <div>
    <el-popover
      ref="volDetailPop"
      placement="top"
      trigger="click">
      {{ $t('storage.instanceId') }}: {{ id }}
    </el-popover>
    <span v-if="id === null || id === undefined || id === ''">-</span>
    <el-button v-else v-popover:volDetailPop type="text" slot="reference">{{ name }}</el-button>
    <i class="el-icon-loading" v-if="loading" />
  </div>
</template>

<script>
export default {
  name: 'InstanceName',
  props: {
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      name: ''
    };
  },
  methods: {
    async getInstanceById(id) {
      const $this = this;
      $this.loading = true;
      try {
        let result = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers/${id}`,
          showErrMsg: false
        });
        $this.name = result.server.name;
        $this.loading = false;
      } catch (e) {
        name = id;
        $this.loading = false;
        __DEV__ && console.error(e);
      }
    }
  },
  mounted() {
    if (this.id !== null && this.id !== undefined && this.id !== '') {
      this.getInstanceById(this.id);
    }
  }
}
</script>

<style>

</style>