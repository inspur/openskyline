<template>
  <div>
    <el-dialog :title="$t('calcStorLang.createInstanceBackup')" :visible.sync="dialogVisible" :before-close="onBeforeClose" size="tiny">
      <el-form label-width="80px" :model="formData" class="me-required-form" ref="form" :rules="rules" v-loading="saving" :element-loading-text="$t('calcStorLang.CREATE_BACKUP_SAVING_TEXT')">
        <el-form-item :label="$t('calcStorLang.backupSourceInstance')" class="is-required" prop="instance_id">
          <el-select class="col-20" v-model="formData.instance_id" @change="handleInstanceChanged" filterable :loading="loading">
            <el-option v-for="instance in instances" :key="instance.id" :label="instance.name" :value="instance.id">
              <span style="float: left;">{{ instance.name }}</span>
            </el-option>
          </el-select>
          <el-tooltip placement="right" trigger="hover" :content="$t('calcStorLang.createInstanceBackupTip')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.backupName')" class="is-required" prop="display_name">
          <el-input v-model="formData.display_name" class="col-20"></el-input>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.backupDescription')" prop="display_description">
          <el-input v-model="formData.display_description" class="col-20"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" @click="quotaCheck" :loading="saving">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
    <quota-check v-if="quotaCheckDialog.show" @close="handleQuotaCheckDialogClose" @success="createBackup" @error="saving = false; quotaCheckDialog.hasError = true;" :items="quotaCheckDialog.requires" :projectId="quotaCheckDialog.projectId"></quota-check>
  </div>
</template>

<script>
import QuotaCheck from './QuotaCheck'
export default {
  data() {
    return {
      loading: false,
      saving: false,
      dialogVisible: false,
      instances: [],
      formData: {
        project_id: "",
        instance_id: "",
        display_name: "",
        display_description: ""
      },
      quotaCheckDialog: {
        show: false,
        projectId: '',
        hasError: false,
        requires: []
      },
      rules: {
        instance_id: [{ type: "required", trigger: "blur change" }],
        display_name: [
          { type: "required", trigger: "blur" },
          { type: "maxSize", value: 40 },
          { type: "onlyLetter_MinusNumberChinese" }
        ],
        display_description: [
          { type: "maxSize", value: 255 }
        ]
      }
    };
  },
  methods: {
    initDialog() {
      const $this = this;
      $this.dialogVisible = true;
      $this.getInstances();
    },
    onBeforeClose() {
      const $this = this;
      $this.close();
    },
    close() {
      const $this = this;
      $this.dialogVisible = false;
      $this.$emit("handleClose");
    },
    async getInstances() {
      const $this = this;
      $this.loading = true;
      let url = `api/nova/v2.1/servers-inspur/detail?all_tenants=1&sort_key=created_at&sort_dir=desc&not-tags=${encodeURIComponent('@')}`;
      if (Vue.roleType + "" != "0") {
        url = `api/nova/v2.1/servers-inspur/detail?project_id=${$this.$cookie.get("pid")}&sort_key=created_at&sort_dir=desc&not-tags=${encodeURIComponent('@')}`;
      }
      try {
        let result = await $this.$ajax({
          type: "get",
          url: url,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          showErrMsg: true
        });
        let instances = result.servers;
        instances = instances.filter(item => item['OS-EXT-STS:task_state'] === null || item['OS-EXT-STS:task_state'] === '');
        instances = instances.filter(item => item['os-extended-volumes-inspur:volumes_attached'].findIndex(volume => volume.volume_type === 'passthru') === -1);
        instances = instances.filter(item => ['ACTIVE', 'SHUTOFF', 'SUSPENDED'].includes(item.status.toUpperCase()));
        instances = instances.filter(item => item.locked === false);
        instances = instances.filter(instance => {
          if (instance['metadata']['source_type'] === 'volume' && instance['os-extended-volumes-inspur:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
            return false;
          }
          return true;
        })
        $this.instances = instances;
        $this.loading = false;
      } catch (e) {
        __DEV__ && console.error(e);
        $this.loading = false;
      }
    },
    handleQuotaCheckDialogClose() {
      const $this = this;
      $this.quotaCheckDialog.show = false;
      if ($this.quotaCheckDialog.hasError) {
        $this.close();
      }
    },
    async quotaCheck() {
      const $this = this;
      $this.$refs["form"].validate(async function(valid) {
        if (valid) {
          $this.saving = true;
          $this.quotaCheckDialog.show = true;
          $this.quotaCheckDialog.projectId = $this.formData.project_id;
        } else {
          return false;
        }
      });
    },
    async createBackup() {
      const $this = this;
      const url = `api/nova/v2.1/servers-inspur/${$this.formData.instance_id}/action`;
      let data = {
        createBackup: {
          display_name: $this.formData.display_name,
          display_description: $this.formData.display_description
        }
      };
      try {
        let result = await $this.$ajax({
          type: "post",
          url: url,
          data: JSON.stringify(data),
          headers: {
            "X-OpenStack-Nova-API-Version": 2.41
          },
          showErrMsg: true,
          log: {
            description: {
              en: `Create Instance Backup: ${
                $this.formData.display_name
              }, Source UUID: ${$this.formData.instance_id}`,
              zh_cn: `创建云主机备份：${
                $this.formData.display_name
              }，源云主机UUID： ${$this.formData.instance_id}`
            },
            key: "display_name",
            target: Vue.logTarget.instanceBackup
          }
        });
        $this.$message(Vue.t("calcStorLang.backupCreateSuccess"));
        $this.saving = false;
        $this.close();
        $this.$emit("handleConfirm");
      } catch (res) {
        $this.loading = false;
        $this.saving = false;
      }
    },
    handleInstanceChanged(newVal) {
      const instance = this.instances.find(item => item.id == newVal);
      if (instance != null) {
        this.formData.project_id = instance.tenant_id;
        this.quotaCheckDialog.requires = [];
        let volumesQuota = instance['os-extended-volumes-inspur:volumes_attached'].length;
        let gigabytes = 0;
        instance['os-extended-volumes-inspur:volumes_attached'].forEach(volume => {
          gigabytes += volume.volume_size
        })
        if (instance.metadata.source_type === 'snapshot' || instance.metadata.source_type === 'image') {
          volumesQuota += 1;  // 来源为镜像或者快照的，要增加一个系统盘的量
          gigabytes += instance.root_gb;
        }
        this.quotaCheckDialog.requires.push({
          serviceName: 'cinderV2',
          itemName: 'volumes',
          value: volumesQuota
        });
        this.quotaCheckDialog.requires.push({
          serviceName: 'cinderV2',
          itemName: 'snapshots',
          value: volumesQuota
        });
        this.quotaCheckDialog.requires.push({
          serviceName: 'cinderV2',
          itemName: 'gigabytes',
          value: gigabytes
        });
      }
    }
  },
  filters: {
    taskName(val) {
      if (val == null) {
        return "";
      }
      switch (val.toUpperCase()) {
        case "BUSY":
          return Vue.t("calcStorLang.task_busying");
        case "SCHEDULING":
          return Vue.t("calcStorLang.task_scheduling");
        case "BLOCK_DEVICE_MAPPING":
          return Vue.t("calcStorLang.task_block_device_mapping");
        case "NETWORKING":
          return Vue.t("calcStorLang.task_networking");
        case "SPAWNING":
          return Vue.t("calcStorLang.task_spawning");
        case "IMAGE_SNAPSHOT":
          return Vue.t("calcStorLang.task_image_snapshot");
        case "IMAGE_SNAPSHOT_PENDING":
          return Vue.t("calcStorLang.task_image_snapshot_pending");
        case "IMAGE_PENDING_UPLOAD":
          return Vue.t("calcStorLang.task_image_pending_upload");
        case "IMAGE_UPLOADING":
          return Vue.t("calcStorLang.task_image_uploading");
        case "IMAGE_BACKUP":
          return Vue.t("calcStorLang.task_image_backup");
        case "UPDATING_PASSWORD":
          return Vue.t("calcStorLang.task_updating_password");
        case "RESIZE_PREP":
          return Vue.t("calcStorLang.task_resize_prep");
        case "RESIZE_MIGRATING":
          return Vue.t("calcStorLang.task_resize_migrating");
        case "RESIZE_MIGRATED":
          return Vue.t("calcStorLang.task_resize_migrated");
        case "RESIZE_FINISH":
          return Vue.t("calcStorLang.task_resize_finish");
        case "RESIZE_REVERTING":
          return Vue.t("calcStorLang.task_resize_reverting");
        case "RESIZE_CONFIRMING":
          return Vue.t("calcStorLang.task_resize_confirming");
        case "REBOOTING":
          return Vue.t("calcStorLang.task_rebooting");
        case "REBOOT_PENDING":
          return Vue.t("calcStorLang.task_reboot_pending");
        case "REBOOT_STARTED":
          return Vue.t("calcStorLang.task_reboot_started");
        case "REBOOTING_HARD":
          return Vue.t("calcStorLang.task_rebooting_hard");
        case "REBOOT_PENDING_HARD":
          return Vue.t("calcStorLang.task_reboot_pending_hard");
        case "REBOOT_STARTED_HARD":
          return Vue.t("calcStorLang.task_reboot_started_hard");
        case "PAUSING":
          return Vue.t("calcStorLang.task_pausing");
        case "UNPAUSING":
          return Vue.t("calcStorLang.task_unpausing");
        case "SUSPENDING":
          return Vue.t("calcStorLang.task_suspending");
        case "RESUMING":
          return Vue.t("calcStorLang.task_resuming");
        case "POWERING_OFF":
          return Vue.t("calcStorLang.task_powering_off");
        case "POWERING-OFF":
          return Vue.t("calcStorLang.task_powering_off");
        case "POWERING_ON":
          return Vue.t("calcStorLang.task_powering_on");
        case "POWERING-ON":
          return Vue.t("calcStorLang.task_powering_on");
        case "RESCUING":
          return Vue.t("calcStorLang.task_rescuing");
        case "UNRESCUING":
          return Vue.t("calcStorLang.task_unrescuing");
        case "REBUILDING":
          return Vue.t("calcStorLang.task_rebuilding");
        case "REBUILD_BLOCK_DEVICE_MAPPING":
          return Vue.t("calcStorLang.task_rebuild_block_device_mapping");
        case "REBUILD_SPAWNING":
          return Vue.t("calcStorLang.task_rebuild_spawning");
        case "MIGRATING":
          return Vue.t("calcStorLang.task_migrating");
        case "DELETING":
          return Vue.t("calcStorLang.task_deleting");
        case "SOFT_DELETING":
          return Vue.t("calcStorLang.task_soft_deleting");
        case "RESTORING":
          return Vue.t("calcStorLang.task_restoring");
        case "SHELVING":
          return Vue.t("calcStorLang.task_shelving");
        case "SHELVING_IMAGE_PENDING_UPLOAD":
          return Vue.t("calcStorLang.task_shelving_image_pending_upload");
        case "SHELVING_IMAGE_UPLOADING":
          return Vue.t("calcStorLang.task_shelving_image_uploading");
        case "SHELVING_OFFLOADING":
          return Vue.t("calcStorLang.task_shelving_offloading");
        case "UNSHELVING":
          return Vue.t("calcStorLang.task_unshelving");
        case "BACKUPING":
          return Vue.t("calcStorLang.task_backuping");
        default:
          return "";
      }
    },
    statusName(val) {
      switch (val) {
        case "BUSY":
          return Vue.t("calcStorLang.busy");
        case "ACTIVE":
          return Vue.t("calcStorLang.running");
        case "BUILD":
          return Vue.t("calcStorLang.build");
        case "ERROR":
          return Vue.t("calcStorLang.error");
        case "REBOOT":
          return Vue.t("calcStorLang.reboot");
        case "HARD_REBOOT":
          return Vue.t("calcStorLang.hard_reboot");
        case "PAUSED":
          return Vue.t("calcStorLang.paused");
        case "MIGRATING":
          return Vue.t("calcStorLang.migrating");
        case "PASSWORD":
          return Vue.t("calcStorLang.password");
        case "REBUILD":
          return Vue.t("calcStorLang.rebuild");
        case "RESCUE":
          return Vue.t("calcStorLang.rescue");
        case "REVERT_RESIZE":
          return Vue.t("calcStorLang.revert_resize");
        case "SHELVED":
          return Vue.t("calcStorLang.shelved_offloaded");
        case "SHELVED_OFFLOADED":
          return Vue.t("calcStorLang.shelved_offloaded");
        case "SHUTOFF":
          return Vue.t("calcStorLang.closed");
        case "SUSPENDED":
          return Vue.t("calcStorLang.suspended");
        case "UNKNOW":
          return Vue.t("calcStorLang.unknow");
        case "VERIFY_RESIZE":
          return Vue.t("calcStorLang.verify_resize");
        default:
          return "-";
      }
    }
  },
  mounted() {
    const $this = this;
    $this.initDialog();
  },
  components: {
    QuotaCheck
  }
};
</script>

<style>
</style>
