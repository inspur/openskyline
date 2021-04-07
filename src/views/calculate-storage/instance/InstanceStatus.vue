<template>
  <span v-if="getStatusContent()==='-'">-</span>
  <el-tag v-else :type="getStatusTagType()">
  <!-- <el-tag :type="getStatusTagType()"> -->
    <span v-html="getStatusContent()"></span>
  </el-tag>
</template>

<script>
import { getInstanceStatusName } from '../../../utils/util';
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
      return getInstanceStatusName(status);
    },
    getStatusTagType() {
      const status = this.status;
      if (status === 'ACTIVE') {
          return 'success';
      } else if (status === 'SHUTOFF' || status === 'PAUSED') {
          return 'gray';
      } else if (status === 'DELETED' || status === 'SOFT_DELETED' || status === 'ERROR' || status === 'UNKNOWN' || status === 'CRASHED') {
          return 'danger';
      } else if (status === 'SHUTOFF' || status === 'SHELVED_OFFLOADED' || status === 'BUILD' || status === 'REBUILD' || status === 'SHELVED') {
          return 'info';
      } else if (status === 'SUSPENDED') {
          return 'warning';
      } else if (status === 'HARD_REBOOT' || status === 'REBOOT' || status === 'MIGRATING' || status === 'RESCUE' || status === 'REVERT_RESIZE' || status === 'REBUILD' || status === 'PASSWORD' || status === 'VERIFY_RESIZE') {
          return 'info';//primary
      } else {
        return '';
      }
    }
  }
}
</script>

<style>

</style>