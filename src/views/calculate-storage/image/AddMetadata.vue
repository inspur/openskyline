<template>
  <div>
    <el-dialog :visible="true" :before-close="handleBeforeClose" :title="$t('calcStorLang.IMAGE_METADATA_LIST_ADD_METADATA')" size="tiny">
      <el-form :model="formParam" :rules="rules" ref="form" label-width="80px" label-position="right">
        <el-form-item prop="key" :label="$t('calcStorLang.IMAGE_METADATA_KEY')" class="is-required">
          <el-input v-model="formParam.key" class="col-12" />
        </el-form-item>
        <el-form-item prop="value" :label="$t('calcStorLang.IMAGE_METADATA_VALUE')">
          <el-input v-model="formParam.value" class="col-12" />
        </el-form-item>
        <el-form-item>
          {{ $t('calcStorLang.IMAGE_METADATA_LIST_METADATA_TIPS') }}
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="close()">{{ $t('base.cancel') }}</el-button>
        <el-button type="primary" @click="save()" :loading="saving">{{ $t('base.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import reservedMetadata from './ReservedMetadata';  // 保留的元数据，对用户不可见
export default {
  name: 'AddMetadata',
  props: ['imageId'],
  data() {
    return {
      metadata: {},
      formParam: {
        key: '',
        value: ''
      },
      saving: false,
      rules: {
        key: [{
          type: 'required',
          trigger: 'blur'
        }, {
          type: 'maxSize',
          value: 60
        }, {
          type: 'onlyLetter_MinusNumber'
        }, {
          validator: (rule, value, callback) => {
            if (reservedMetadata.map(item => item.toLowerCase()).includes(value.toLowerCase())) {
              callback(Vue.t('calcStorLang.IMAGE_METADATA_LIST_ADD_METADATA_RESERVED'));
            } else if (Object.keys(this.metadata).map(item => item.toLowerCase()).includes(value.toLowerCase())) {
              callback(Vue.t('calcStorLang.IMAGE_METADATA_LIST_ADD_METADATA_EXISTS'));
            } else {
              callback();
            }
          }
        }],
        value: [{
          type: 'maxSize',
          value: 60
        }, {
          type: 'onlyLetter_MinusNumberSp'
        }]
      }
    };
  },
  methods: {
    close() {
      this.$emit("close");
    },
    handleBeforeClose(done) {
      this.close();
      done();
    },
    async loadMetadataList() {
      const $this = this;
      const res = await $this.$ajax({
        url: `api/glance/v2/images/${$this.imageId}`,
        type: 'get'
      });
      $this.metadata = res;
    },
    async save() {
      const $this = this;
      await $this.$refs.form.validate(async (valid) => {
        if (valid) {
          $this.saving = true;
          try {
            const res = await $this.$ajax({
              url: `api/glance/v2/images/${this.imageId}`,
              type: 'patch',
              data: JSON.stringify([{
                'op': 'add',
                'path': `/${$this.formParam.key}`,
                'value': $this.formParam.value
              }]),
              contentType: 'application/openstack-images-v2.1-json-patch',
              log: {
                description: {
                  en: `Add Image Metadata: uuid ${$this.imageId} key ${$this.formParam.key} value ${$this.formParam.value}`,
                  zh_cn: `添加镜像元数据: uuid ${$this.imageId} key ${$this.formParam.key} value ${$this.formParam.value}`
                },
                target: Vue.logTarget.computeMirror
              }
            })
            $this.$message.success(Vue.t('calcStorLang.IMAGE_METADATA_LIST_ADD_METADATA_SUCCESS'))
            $this.$emit('refresh');
            $this.close();
          } catch (e) {
            __DEV__ && console.error(e);
          }
          $this.saving = false;
          return true;
        } else {
          return false;
        }
      })
    }
  },
  async mounted() {
    await this.loadMetadataList();
  }
}
</script>

<style>

</style>
