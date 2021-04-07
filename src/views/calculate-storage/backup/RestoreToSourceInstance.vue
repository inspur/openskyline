<template>
  <div>
    <el-dialog
      :title="$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_TITLE')"
      :visible="visible"
      :before-close="handleBeforeClose"
      size="tiny">
      <el-row type="flex" justify="start" align="middle" v-loading="loading">
        <i class="el-icon-warning big-warning-icon" />
        <el-form class="flex-1">
          <el-form-item>
            <div class="el-form-item__label" v-html="$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_TIPS')">
            </div>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_SOURCE_ID')" class="margin-bottom-0">
            {{ instanceId }}
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_SOURCE_NAME')" class="margin-bottom-0">
            {{ instance.name }}
          </el-form-item>
        </el-form>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
          <div>
            <el-button @click="restoreToNewInstance">{{ $t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_NEW') }}</el-button>
          </div>
          <div>
            <el-button @click="close">{{ $t('lang.cancel') }}</el-button>
            <el-button type="primary" @click="save" :loading="saving">{{ $t('lang.confirm') }}</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'underscore';
export default {
  name: 'RestoreToSourceInstance',
  props: {
    instanceId: {
      type: String,
      default: ''
    },
    backupId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      saving: false,
      visible: true,
      instance: {
        name: '',
        status: '',
        'OS-EXT-STS:task_state': null
      },
      formData: {
        projectId: '',
        instanceId: ''
      }
    };
  },
  methods: {
    async initDialog() {
      const $this = this;
      try {
        $this.loading = true;
        // 加载云主机信息
        await $this.loadInstance();
        if ($this.instance.locked) {
          $this.$confirm($this.$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_WRONG_LOCK'), Vue.t('base.prompt'), {
            type: 'warning'
          }).then(() => {
            $this.restoreToNewInstance();
          }).catch(() => {
            $this.close();
          });
        } else if ($this.instance['OS-EXT-STS:task_state'] !== null) {
          $this.$confirm($this.$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_WRONG_TASK'), Vue.t('base.prompt'), {
            type: 'warning'
          }).then(() => {
            $this.restoreToNewInstance();
          }).catch(() => {
            $this.close();
          });
        }
        $this.loading = false;
      } catch (e) {
        // 加载失败意味着原云主机可能已经不在
        __DEV__ && console.error(e);
        $this.$confirm($this.$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_WRONG_DISAPPARE'), Vue.t('base.prompt'), {
          type: 'warning'
        }).then(() => {
          $this.restoreToNewInstance();
        }).catch(() => {
          $this.close();
        });
      }
    },
    handleBeforeClose() {
      const $this = this;
      $this.close();
    },
    close() {
      const $this = this;
      $this.$emit('close');
    },
    async loadInstance() {
      const $this = this;
      let res = await $this.$ajax({
        type: 'get',
        url: `api/nova/v2.1/servers-inspur/${$this.instanceId}`,
        headers: {
          'X-OpenStack-Nova-API-Version': 2.41
        },
        showErrMsg: false
      });
      $this.instance = res.server;
    },
    async loadMountedISOImage() {
      const $this = this;
      try {
        let res = await $this.$ajax({
          url: `api/nova/v2.1/servers-inspur/${this.instanceId}/os-cdrom`,
          type: 'get',
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          showErrMsg: false
        });
        return res.cdrom.cdrom_id || '';
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadAttachedDirectConnectDisks() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers-inspur/${$this.instanceId}/os-inspur-passthrus`
        });
        return res.disks;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadBoundGPUDevices() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/cyborg/v2/accelerator_requests?instance=${$this.instanceId}&bind_state=resolved`
        });
        return res.arqs;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadBoundUSBDevices() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers-inspur/${$this.instanceId}/os-usb_attachment`
        });
        return res.usbAttachments;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async checkPowerStatus() {
      const $this = this;
      if ($this.instance.status !== 'ACTIVE' && $this.instance.status !== 'SHUTOFF') {
        $this.$message.error($this.$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_CHECK_STATUS_TIPS'));
        throw new Error('instance not active or shutoff status.');
      } else if ($this.instance['OS-EXT-STS:task_state'] !== null && $this.instance['OS-EXT-STS:task_state'] !== '') {
        $this.$message.error($this.$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_CHECK_TASK_TIPS'));
        throw new Error('instance task is not null.');
      }
      return true;
    },
    async checkBoundDevices() {
      const $this = this;
      let [res1, res2, res3, res4] = await Promise.all([
        $this.loadMountedISOImage(),
        $this.loadAttachedDirectConnectDisks(),
        $this.loadBoundGPUDevices(),
        $this.loadBoundUSBDevices()
      ]);
      if (res1 !== '' && res1 !== null) {
        $this.$message.error($this.$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_CHECK_ISO_TIPS'));
        throw new Error('instance mounted iso image.');
      }
      if (res2.length > 0) {
        $this.$message.error($this.$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_CHECK_DIRECT_DISK_TIPS'));
        throw new Error('instance mounted direct connect disk.');
      }
      if (res3.length > 0) {
        $this.$message.error($this.$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_CHECK_GPU_TIPS'));
        throw new Error('instance mounted accelerator.');
      }
      if (res4.length > 0) {
        $this.$message.error($this.$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_CHECK_USB_TIPS'));
        throw new Error('instance mounted usb device.');
      }
      return true;
    },
    async save() {
      const $this = this;
      $this.$confirm($this.$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_CONFIRM'), Vue.t('base.prompt'), {
        type: 'warning'
      }).then(async () => {
        try {
          $this.saving = true;
          await $this.checkPowerStatus();
          // await $this.checkBoundDevices();
          let res = await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers-inspur/${$this.instanceId}/action`,
            headers: {
              'X-OpenStack-Nova-API-Version': 2.41
            },
            data: JSON.stringify({
              'restore-backup': {
                backupRef: $this.backupId
              }
            }),
            log: {
              description: {
                en: `Backup Restore to Instance: Backup Id: ${$this.backupId}, Instance Id: ${$this.instanceId}`,
                zh_cn: `备份还原云主机：备份Id：${$this.backupId}，原云主机Id：${$this.instanceId}`
              },
              key: "display_name",
              target: Vue.logTarget.instanceBackup
            }
          });
          $this.$message.success($this.$t('calcStorLang.BACKUP_RESTORE_TO_SOURCE_SUCCESS'));
          $this.close();
        } catch (e) {
          $this.saving = false;
          __DEV__ && console.error(e);
        }
      });
    },
    async restoreToNewInstance() {
      const $this = this;
      $this.$emit('restore-to-new-instance', $this.backupId);
      $this.$emit('close');
    }
  },
  filters: {
  },
  mounted() {
    const $this = this;
    $this.initDialog();
  }
};
</script>

<style scoped>
.big-warning-icon {
  font-size: 36px;
  color: #f7ba2a;
  width: 50px;
}

.flex-1 {
  flex: 1;
}

.margin-bottom-0 {
  margin-bottom: 0;
}
</style>
