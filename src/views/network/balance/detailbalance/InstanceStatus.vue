<template>
  <span v-if="getStatusContent()==='-'">-</span>
  <el-tag v-else :type="getStatusTagType()">
  <!-- <el-tag :type="getStatusTagType()"> -->
    <span v-html="getStatusContent()"></span>
  </el-tag>
</template>

<script>
export default {
  name: 'InstanceStatus',
  props: {
    status: {
      type: String,
      default: ''
    }
  },
  data() {
    return {

    };
  },
  methods: {
    getStatusContent() {
      const status = this.status;
      if (status === 'BUSY') {
        return '<i class="el-icon-loading"></i>';
      } else if (status === 'ACTIVE') {
        return this.$t('calcStorLang.running');
      } else if (status === 'BUILD') {
        return this.$t('calcStorLang.build');
      } else if (status === 'ERROR') {
        return this.$t('calcStorLang.error');
      } else if (status === 'REBOOT') {
        return this.$t('calcStorLang.reboot');
      } else if (status === 'HARD_REBOOT') {
        return this.$t('calcStorLang.hard_reboot');
      } else if (status === 'PAUSED') {
        return this.$t('calcStorLang.paused');
      } else if (status === 'MIGRATING') {
        return this.$t('calcStorLang.migrating');
      } else if (status === 'PASSWORD') {
        return this.$t('calcStorLang.password');
      } else if (status === 'REBUILD') {
        return this.$t('calcStorLang.rebuild');
      } else if (status === 'RESCUE') {
        return this.$t('calcStorLang.rescue');
      } else if (status === 'REVERT_RESIZE') {
        return this.$t('calcStorLang.revert_resize');
      } else if (status === 'SHELVED') {
        return this.$t('calcStorLang.shelved_offloaded');
      } else if (status === 'SHELVED_OFFLOADED') {
        return this.$t('calcStorLang.shelved_offloaded');
      } else if (status === 'SHUTOFF') {
        return this.$t('calcStorLang.closed');
      } else if (status === 'SUSPENDED') {
        return this.$t('calcStorLang.suspended');
      } else if (status === 'UNKNOWN') {
        return this.$t('calcStorLang.unknow');
      } else if (status === 'VERIFY_RESIZE') {
        return this.$t('calcStorLang.verify_resize');
      } else if (status === 'CRASHED') {
        return this.$t('calcStorLang.crashed');
      } else if (status === 'SOFT_DELETED') {
        return this.$t('calcStorLang.instDetailSoftDeleted');
      } else if (status === 'RETRIEVE_FAILED') {
        return this.$t('network.RETRIEVE_FAILED');
      } else {
        return '-';
      }
    },
    getStatusTagType() {
      const status = this.status;
      if (status === 'ACTIVE') {
          return 'success';
      } else if (status === 'SHUTOFF') {
          return 'gray';
      } else if (status === 'BUILD') {
          return '';
      } else if (status === 'DELETED' || status === 'SOFT_DELETED' || status === 'ERROR' || status === 'UNKNOWN' || status === 'CRASHED' || status === "RETRIEVE_FAILED") {
          return 'danger';
      } else if (status === 'SHUTOFF') {
          return 'info';
      } else if (status === 'SUSPENDED') {
          return 'warning';
      } else if (status === 'HARD_REBOOT' || status === 'REBOOT' || status === 'MIGRATING' || status === 'RESCUE' || status === 'REVERT_RESIZE' || status === 'REBUILD') {
          return 'primary';
      } else {
        return '-';
      }
    }
  }
}
</script>

<style>

</style>
