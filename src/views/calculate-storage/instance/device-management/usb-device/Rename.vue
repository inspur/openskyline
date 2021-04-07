<template>
  <div>
    <el2-dialog
      :visible="true"
      :before-close="handleBeforeClose"
      :append-to-body="true"
      :close-on-click-modal="false"
      :title="$t('calcStorLang.rename')"
      width="550px">
      <el-form :model="formData" :rules="rules" ref="form" onsubmit="return false;" label-width="60px" label-position="right">
        <el-form-item :label="$t('base.name')" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="close()">{{ $t('base.cancel') }}</el-button>
        <el-button type="primary" @click="submit">{{ $t('base.confirm') }}</el-button>
      </span>
    </el2-dialog>
  </div>
</template>

<script>
export default {
  name: 'USBDeviceRename',
  props: {
    device: {
      type: Object,
      default: () => {}
    },
    hostname: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      formData: {
        name: ''
      },
      rules: {
        name: [{
          type: 'required',
          trigger: 'blur change'
        }, {
          type: 'maxSize',
          value: 40,
          trigger: 'blur change'
        }, {
          type: 'onlyLetter_MinusNumberChinese',
          trigger: 'blur change'
        }]
      }
    };
  },
  methods: {
    handleBeforeClose(done) {
      done();
      this.close();
    },
    close(done) {
      this.$emit('close');
    },
    submit() {
      const $this = this;
      $this.$refs.form.validate(async (valid) => {
        if (valid) {
          const res = await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers-inspur/os-usb-name`,
            data: JSON.stringify({
              setUsbName: {
                host: $this.hostname,
                product_id: $this.device.product,
                vendor_id: $this.device.vendor,
                display_name: $this.formData.name
              }
            })
          });
          $this.$emit('refresh');
          $this.close();
        }
      });
    }
  },
  async mounted() {
    const $this = this;
    if ('display_name' in $this.device) {
      $this.formData.name = $this.device.display_name;
    }
  }
};
</script>

<style scoped>
</style>
