function getInstanceStatusName(status) {
  if (status === 'BUSY') {
    return '<i class="el-icon-loading"></i>';
  } else if (status === 'ACTIVE') {
    return Vue.t('calcStorLang.running');
  } else if (status === 'BUILD') {
    return Vue.t('calcStorLang.build');
  } else if (status === 'ERROR') {
    return Vue.t('calcStorLang.error');
  } else if (status === 'REBOOT') {
    return Vue.t('calcStorLang.reboot');
  } else if (status === 'HARD_REBOOT') {
    return Vue.t('calcStorLang.hard_reboot');
  } else if (status === 'PAUSED') {
    return Vue.t('calcStorLang.paused');
  } else if (status === 'MIGRATING') {
    return Vue.t('calcStorLang.migrating');
  } else if (status === 'PASSWORD') {
    return Vue.t('calcStorLang.password');
  } else if (status === 'REBUILD') {
    return Vue.t('calcStorLang.rebuild');
  } else if (status === 'RESCUE') {
    return Vue.t('calcStorLang.rescue');
  } else if (status === 'REVERT_RESIZE') {
    return Vue.t('calcStorLang.revert_resize');
  } else if (status === 'SHELVED') {
    return Vue.t('calcStorLang.shelved_offloaded');
  } else if (status === 'SHELVED_OFFLOADED') {
    return Vue.t('calcStorLang.shelved_offloaded');
  } else if (status === 'SHUTOFF') {
    return Vue.t('calcStorLang.closed');
  } else if (status === 'SUSPENDED') {
    return Vue.t('calcStorLang.suspended');
  } else if (status === 'UNKNOWN') {
    return Vue.t('calcStorLang.unknow');
  } else if (status === 'VERIFY_RESIZE') {
    return Vue.t('calcStorLang.verify_resize');
  } else if (status === 'CRASHED') {
    return Vue.t('calcStorLang.crashed');
  } else if (status === 'SOFT_DELETED') {
    return Vue.t('calcStorLang.instDetailSoftDeleted');
  } else {
    return '-';
  }
}

function getInstanceTaskName(task) {
  let taskMsg = '';
  if (task !== null) {
    switch (task.toUpperCase()) {
    case 'BUSY':
      taskMsg = this.$t('calcStorLang.task_busying');
      break;
    case 'SCHEDULING':
      taskMsg = this.$t('calcStorLang.task_scheduling');
      break;
    case 'BLOCK_DEVICE_MAPPING':
      taskMsg = this.$t('calcStorLang.task_block_device_mapping');
      break;
    case 'NETWORKING':
      taskMsg = this.$t('calcStorLang.task_networking');
      break;
    case 'SPAWNING':
      taskMsg = this.$t('calcStorLang.task_spawning');
      break;
    case 'IMAGE_SNAPSHOT':
      taskMsg = this.$t('calcStorLang.task_image_snapshot');
      break;
    case 'IMAGE_SNAPSHOT_PENDING':
      taskMsg = this.$t('calcStorLang.task_image_snapshot_pending');
      break;
    case 'IMAGE_PENDING_UPLOAD':
      taskMsg = this.$t('calcStorLang.task_image_pending_upload');
      break;
    case 'IMAGE_UPLOADING':
      taskMsg = this.$t('calcStorLang.task_image_uploading');
      break;
    case 'IMAGE_BACKUP':
      taskMsg = this.$t('calcStorLang.task_image_backup');
      break;
    case 'UPDATING_PASSWORD':
      taskMsg = this.$t('calcStorLang.task_updating_password');
      break;
    case 'RESIZE_PREP':
      taskMsg = this.$t('calcStorLang.task_resize_prep');
      break;
    case 'RESIZE_MIGRATING':
      taskMsg = this.$t('calcStorLang.task_resize_migrating');
      break;
    case 'RESIZE_MIGRATED':
      taskMsg = this.$t('calcStorLang.task_resize_migrated');
      break;
    case 'RESIZE_FINISH':
      taskMsg = this.$t('calcStorLang.task_resize_finish');
      break;
    case 'RESIZE_REVERTING':
      taskMsg = this.$t('calcStorLang.task_resize_reverting');
      break;
    case 'RESIZE_CONFIRMING':
      taskMsg = this.$t('calcStorLang.task_resize_confirming');
      break;
    case 'REBOOTING':
      taskMsg = this.$t('calcStorLang.task_rebooting');
      break;
    case 'REBOOT_PENDING':
      taskMsg = this.$t('calcStorLang.task_reboot_pending');
      break;
    case 'REBOOT_STARTED':
      taskMsg = this.$t('calcStorLang.task_reboot_started');
      break;
    case 'REBOOTING_HARD':
      taskMsg = this.$t('calcStorLang.task_rebooting_hard');
      break;
    case 'REBOOT_PENDING_HARD':
      taskMsg = this.$t('calcStorLang.task_reboot_pending_hard');
      break;
    case 'REBOOT_STARTED_HARD':
      taskMsg = this.$t('calcStorLang.task_reboot_started_hard');
      break;
    case 'PAUSING':
      taskMsg = this.$t('calcStorLang.task_pausing');
      break;
    case 'UNPAUSING':
      taskMsg = this.$t('calcStorLang.task_unpausing');
      break;
    case 'SUSPENDING':
      taskMsg = this.$t('calcStorLang.task_suspending');
      break;
    case 'RESUMING':
      taskMsg = this.$t('calcStorLang.task_resuming');
      break;
    case 'POWERING_OFF':
      taskMsg = this.$t('calcStorLang.task_powering_off');
      break;
    case 'POWERING-OFF':
      taskMsg = this.$t('calcStorLang.task_powering_off');
      break;
    case 'POWERING_ON':
      taskMsg = this.$t('calcStorLang.task_powering_on');
      break;
    case 'POWERING-ON':
      taskMsg = this.$t('calcStorLang.task_powering_on');
      break;
    case 'RESCUING':
      taskMsg = this.$t('calcStorLang.task_rescuing');
      break;
    case 'UNRESCUING':
      taskMsg = this.$t('calcStorLang.task_unrescuing');
      break;
    case 'REBUILDING':
      taskMsg = this.$t('calcStorLang.task_rebuilding');
      break;
    case 'REBUILD_BLOCK_DEVICE_MAPPING':
      taskMsg = this.$t('calcStorLang.task_rebuild_block_device_mapping');
      break;
    case 'REBUILD_SPAWNING':
      taskMsg = this.$t('calcStorLang.task_rebuild_spawning');
      break;
    case 'MIGRATING':
      taskMsg = this.$t('calcStorLang.task_migrating');
      break;
    case 'DELETING':
      taskMsg = this.$t('calcStorLang.task_deleting');
      break;
    case 'SOFT_DELETING':
      taskMsg = this.$t('calcStorLang.task_soft_deleting');
      break;
    case 'SOFT-DELETING':
      taskMsg = this.$t('calcStorLang.task_soft_deleting');
      break;
    case 'RESTORING':
      taskMsg = this.$t('calcStorLang.task_restoring');
      break;
    case 'SHELVING':
      taskMsg = this.$t('calcStorLang.task_shelving');
      break;
    case 'SHELVING_IMAGE_PENDING_UPLOAD':
      taskMsg = this.$t('calcStorLang.task_shelving_image_pending_upload');
      break;
    case 'SHELVING_IMAGE_UPLOADING':
      taskMsg = this.$t('calcStorLang.task_shelving_image_uploading');
      break;
    case 'SHELVING_OFFLOADING':
      taskMsg = this.$t('calcStorLang.task_shelving_offloading');
      break;
    case 'UNSHELVING':
      taskMsg = this.$t('calcStorLang.task_unshelving');
      break;
    case 'BACKUPING':
      taskMsg = this.$t('calcStorLang.task_backuping');
      break;
    default:
      break;
    }
  } else {
    taskMsg = '-';
  }
  return taskMsg;
}

export { getInstanceStatusName, getInstanceTaskName };
