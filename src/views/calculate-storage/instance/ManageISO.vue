<template>
  <div v-loading="loading">
    <el-dialog :visible="true" :before-close="handleClose" :title="$t('calcStorLang.INSTANCE_ISO_MANAGE')" size="small">
      <el-form :model="formData" :rules="rules" ref="form" onsubmit="return false;" label-width="100px" label-position="right">
        <el-form-item :label="$t('calcStorLang.INSTANCE_ISO_INJECT_IMAGE')">
          <el-row>
            <el-col :span="12">
              <el-select v-model="formData.imageId" style="width: 100%;">
                <el-option v-for="(item, index) in images" :key="index" :value="item.id" :label="item.name" />
              </el-select>
            </el-col>
            <el-col :span="12">
              <el-button :loading="injecting" @click="injectImage()" type="primary" size="small" style="margin-left: 10px;" :disabled="formData.imageId === '' || cdromId !== null">{{ $t('calcStorLang.INSTANCE_ISO_INJECT') }}</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.INSTANCE_ISO_CURRENT_IMAGE')">
          <template v-if="cdromId !== null">
            <div style="display: flex; flex-direction: row; align-items: center;">
              <div>{{ cdromName }}</div>
              <el-button type="text" @click="ejectImage()" :loading="ejecting" size="small" style="margin-left: 10px;">{{ $t('calcStorLang.INSTANCE_ISO_EJECT') }}</el-button>
            </div>
          </template>
          <template v-else>
            {{ $t('calcStorLang.INSTANCE_ISO_NULL') }}
          </template>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="close()">{{ $t('base.cancel') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'manage-iso',
  props: ['instanceId'],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      saving: false,
      injecting: false,
      ejecting: false,
      cdromId: null,
      cdromName: null,
      formData: {
        imageId: ''
      },
      rules: {
      },
      images: []
    };
  },
  methods: {
    async loadCDROM() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          url: `api/nova/v2.1/servers-inspur/${this.instanceId}/os-cdrom`,
          type: 'get',
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          showErrMsg: false
        });
        this.cdromId = res.cdrom.cdrom_id;
        if (this.cdromId === '') {
          this.cdromId = null;
        }
        if (this.cdromId === null) {
          this.cdromName = null;
        } else {
          const image = $this.images.find(item => item.id === this.cdromId);
          if (image) {
            this.cdromName = image.name;
          }
        }
      } catch (e) {
        this.cdromId = null;
        this.cdromName = null;
        __DEV__ && console.error(e);
      }
    },
    async loadImages() {
      const $this = this;
      const res = await $this.$ajax({
        url: 'api/glance/v2/images?limit=99999&disk_format=iso',
        type: 'get'
      });
      const images = res.images.filter(item => item.status === 'active');
      $this.images = images;
    },
    handleClose(done) {
      done();
      this.close();
    },
    close(done) {
      this.$emit('close');
    },
    async ejectImage() {
      const $this = this;
      try {
        $this.ejecting = true;
        const res = await $this.$ajax({
          url: `api/nova/v2.1/servers-inspur/${this.instanceId}/action`,
          type: 'post',
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          data: JSON.stringify({
            cdromEject: null
          }),
          log: {
            description: {
              en: `Eject CDROM: Instance ID ${$this.instanceId}`,
              zh_cn: `卸载ISO镜像：云主机ID ${$this.instanceId}`
            },
            key: 'name',
            target: Vue.logTarget.computeInstance
          }
        });
        setTimeout(async () => {
          $this.ejecting = false;
          await $this.loadCDROM();
          $this.$message.success($this.$t('calcStorLang.INSTANCE_ISO_EJECT_SUCCESSFULLY'));
        }, 2000);
      } catch (e) {
        $this.ejecting = false;
        __DEV__ && console.error(e);
      }
    },
    async injectImage() {
      const $this = this;
      try {
        $this.injecting = true;
        const res = await $this.$ajax({
          url: `api/nova/v2.1/servers-inspur/${this.instanceId}/action`,
          type: 'post',
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          data: JSON.stringify({
            cdromInject: {
              cdrom_id: $this.formData.imageId
            }
          }),
          log: {
            description: {
              en: `Inject CDROM: ${$this.formData.imageId} (Instance ID ${$this.instanceId})`,
              zh_cn: `挂载ISO镜像：${$this.formData.imageId} (云主机ID ${$this.instanceId})`
            },
            key: 'name',
            target: Vue.logTarget.computeInstance
          }
        });
        setTimeout(async () => {
          $this.injecting = false;
          $this.formData.imageId = '';
          await $this.loadCDROM();
          $this.$message.success($this.$t('calcStorLang.INSTANCE_ISO_INJECT_SUCCESSFULLY'));
        }, 2000);
      } catch (e) {
        $this.injecting = false;
        __DEV__ && console.error(e);
      }
    }
  },
  async mounted() {
    const $this = this;
    await $this.loadImages();
    await $this.loadCDROM();
  }
};
</script>

<style scoped>
</style>
