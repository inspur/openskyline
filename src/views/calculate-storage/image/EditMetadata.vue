<template>
  <div>
    <el-dialog :visible="true" :before-close="handleBeforeClose" :title="$t('calcStorLang.IMAGE_METADATA_LIST_EDIT_METADATA')" size="tiny">
      <el-form :model="formParam" :rules="rules" ref="form" label-width="80px" label-position="right">
        <el-form-item prop="key" :label="$t('calcStorLang.IMAGE_METADATA_KEY')" class="is-required">
          <el-input v-model="formParam.key" :disabled="true" class="col-12" />
        </el-form-item>
        <el-form-item prop="value" :label="$t('calcStorLang.IMAGE_METADATA_VALUE')">
          <el-input v-if="enums.length === 0" v-model="formParam.value" class="col-12" />
          <el-select v-else v-model="formParam.value" class="col-12">
            <el-option v-for="(item, index) in enums" :key="index" :value="item" :label="item" />
          </el-select>
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
export default {
  name: 'EditMetadata',
  props: ['imageId', 'enums', 'oriKey', 'oriValue'],
  data() {
    return {
      formParam: {
        key: '',
        value: ''
      },
      saving: false,
      rules: {
        key: [{
          type: 'required',
          trigger: 'blur'
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
      this.$emit('onRefresh');
      this.$emit("close");
    },
    handleBeforeClose(done) {
      this.close();
      done();
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
                'op': 'replace',
                'path': `/${$this.formParam.key}`,
                'value': $this.formParam.value
              }]),
              contentType: 'application/openstack-images-v2.1-json-patch',
              log: {
                description: {
                  en: `Edit Image Metadata: uuid ${$this.imageId} key ${$this.formParam.key} value ${$this.formParam.value}`,
                  zh_cn: `编辑镜像元数据: uuid ${$this.imageId} key ${$this.formParam.key} value ${$this.formParam.value}`
                },
                target: Vue.logTarget.computeMirror
              }
            })
            $this.$message.success(Vue.t('calcStorLang.IMAGE_METADATA_LIST_EDIT_METADATA_SUCCESS'))
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
      });
    }
  },
  mounted() {
    this.formParam.key = this.oriKey;
    this.formParam.value = this.oriValue;
  }
}
</script>

<style>

</style>
