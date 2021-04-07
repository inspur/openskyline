<template>
  <div>
    <el-dialog :title="$t('calcStorLang.CREATE_AND_ATTACH_VOLUME')" :visible="visible" :before-close="handleClose" size="tiny" append-to-body>
      <div>
        <el-form ref="form" label-width="100px" label-position="right" :model="formData" :rules="rules">
          <el-form-item :label="$t('calcStorLang.CREATE_AND_ATTACH_VOLUME_NAME')" prop="name" class="is-required">
            <el-input v-model="formData.name" />
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.CREATE_AND_ATTACH_VOLUME_SIZE')" prop="size" class="is-required">
            <el-row>
              <el-col :span="12">
                <el-input v-model="formData.size" />
              </el-col>
              <el-col :span="11" :offset="1">
                GB
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.CREATE_AND_ATTACH_VOLUME_TYPE')" prop="volume_type">
            <el-select v-model="formData.volume_type" style="width: 100%;" clearable filterable>
              <el-option v-for="(item, index) in volumeTypes" :key="index" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.CREATE_AND_ATTACH_VOLUME_DESCRIPTION')" prop="description">
            <el-input type="textarea" v-model="formData.description" />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">{{ $t('lang.cancel') }}</el-button>
        <el-button type="primary" @click="submit" :loading="saving">{{ saving ? savingTask : $t('lang.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    instanceName: {
      type: String,
      default: ''
    },
    instanceId: {
      type: String,
      default: ''
    },
    projectId: {
      type: String,
      default: ''
    },
    userId: {
      type: String,
      default: ''
    },
    az: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      saving: false,
      savingTask: '',
      formData: {
        name: '',
        description: '',
        size: '',
        volume_type: '',
        multiattach: false
      },
      volumeTypes: '',
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        size: [
          { type: 'required', trigger: 'blur change' },
          { type: 'integer', trigger: 'blur change' },
          { type: 'greaterThan', value: 0 }
        ],
        description: [
          { type: 'maxSize', value: 255 }
        ]
      }
    };
  },
  methods: {
    handleClose(done) {
      done();
      this.close();
    },
    close() {
      this.$emit('close');
    },
    async checkQuota() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/cinderv2/v3/${$this.$cookie.get('pid')}/os-quota-sets/${$this.projectId}?usage=true`
        });
        const volumesRemain = res.quota_set['volumes'].limit - res.quota_set['volumes'].in_use;
        const gigabytesRemain = res.quota_set['gigabytes'].limit - res.quota_set['gigabytes'].in_use;
        if (res.quota_set['volumes'].limit !== -1 && volumesRemain < 1) {
          $this.$message.error($this.$t('calcStorLang.CREATE_AND_ATTACH_VOLUME_VOLUME_COUNT_QUOTA_NOT_ENOUGH', 1));
          throw new Error('QuotaNotEnough');
        }
        if (res.quota_set['gigabytes'].limit !== -1 && gigabytesRemain < $this.formData.size) {
          $this.$message.error($this.$t('calcStorLang.CREATE_AND_ATTACH_VOLUME_VOLUME_SIZE_QUOTA_NOT_ENOUGH', $this.formData.size));
          throw new Error('QuotaNotEnough');
        }
        return true;
      } catch (e) {
        __DEV__ && console.error(e);
        throw e;
      }
    },
    async loadVolumeType() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/cinderv3/v3/${this.$cookie.get('pid')}/inspur-types?is_public=None`,
          showErrMsg: true
        });
        let volumeTypes = res.volume_types;
        volumeTypes = volumeTypes.filter(item => item.encrypt === null);
        $this.volumeTypes = volumeTypes;
      } catch (e) {
        $this.$message.error(e);
        __DEV__ && console.error(e);
        throw e;
      }
    },
    async createVolume() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          url: `api/cinderv3/v3/${$this.$cookie.get('pid')}/inspur-volumes`,
          type: 'post',
          data: JSON.stringify({
            volume: {
              name: $this.formData.name,
              size: $this.formData.size,
              description: $this.formData.description,
              multiattach: $this.formData.multiattach,
              volume_type: $this.formData.volume_type,
              project_id: $this.projectId,
              user_id: $this.userId
            }
          }),
          showErrMsg: false,
          log: {
            description: {
              en: `Create Volume: ${$this.formData.name}`,
              zh_cn: `创建云硬盘：${$this.formData.name}`
            },
            target: Vue.logTarget.computePhysical
          }
        });
        return res;
      } catch (e) {
        $this.$message.error($this.$t('calcStorLang.CREATE_AND_ATTACH_VOLUME_CREATE_ERROR'));
        __DEV__ && console.error(e);
        throw e;
      }
    },
    async getVolumeUntilStatus(volumeId, status) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          url: `api/cinderv3/v3/${$this.$cookie.get('pid')}/volumes/${volumeId}`,
          type: 'get',
          showErrMsg: false
        });
        if (res.volume.status === 'error') {
          $this.$message.error($this.$t('calcStorLang.CREATE_AND_ATTACH_VOLUME_CREATE_ERROR'));
          throw new Error();
        } else if (res.volume.status === status) {
          return res;
        } else {
          await $this.sleep(1000);
          return await $this.getVolumeUntilStatus(volumeId, status);
        }
      } catch (e) {
        $this.$message.error(e);
        __DEV__ && console.error(e);
        throw e;
      }
    },
    async attachVolume(volumeId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'post',
          url: `api/nova/v2.1/servers-inspur/${$this.instanceId}/os-inspur-volume_attachments`,
          data: JSON.stringify({
            volumeAttachment: {
              volumeId: volumeId
            }
          }),
          headers:{
            "Openstack-Api-Version":"compute 2.65"
          },
          showErrMsg: false,
          log: {
            description: {
              en: `Physical ${$this.instanceName} (ID:${$this.instanceId}) Mount disk: ${$this.formData.name} (ID: ${volumeId})`,
              zh_cn: `云物理机 ${$this.instanceName} (ID:${$this.instanceId}) 挂载云硬盘：${$this.formData.name} (ID：${volumeId})请求已发送`
            },
            target: Vue.logTarget.computePhysical
          }
        });
      } catch (e) {
        $this.$message.error($this.$t('calcStorLang.CREATE_AND_ATTACH_VOLUME_ATTACH_ERROR'));
        __DEV__ && console.error(e);
        throw e;
      }
    },
    submit() {
      const $this = this;
      $this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            $this.saving = true;
            $this.savingTask = $this.$t('calcStorLang.CREATE_AND_ATTACH_VOLUME_CHECKING_QUOTA');
            await $this.checkQuota();
            $this.savingTask = $this.$t('calcStorLang.CREATE_AND_ATTACH_VOLUME_CREATING');
            const res = await $this.createVolume();
            await $this.getVolumeUntilStatus(res.volume.id, 'available');
            $this.savingTask = $this.$t('calcStorLang.CREATE_AND_ATTACH_VOLUME_ATTACHING');
            await $this.attachVolume(res.volume.id);
            // await $this.getVolumeUntilStatus(res.volume.id, 'in-use');
            $this.$message.success($this.$t('calcStorLang.CREATE_AND_ATTACH_VOLUME_SUCCESS'));
            $this.$emit('done', res.volume.id);
          } catch (e) {
            $this.saving = false;
            __DEV__ && console.error(e);
          }
        } else {
          return false;
        }
      });
    },
    sleep(milliseconds) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, milliseconds);
      });
    }
  },
  beforeDestory() {
    this.visible = false;
  },
  mounted() {
    this.visible = true;
    this.loadVolumeType();
  }
};
</script>

<style>

</style>
