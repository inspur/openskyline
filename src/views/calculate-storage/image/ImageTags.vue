<template>
  <div v-loading="loading">
    <el-dialog :visible="dialogVisible" :before-close="handleClose" :title="$t('calcStorLang.IMAGE_TAGS_MANAGE')" size="small">
      <el-form inline :model="newTag" :rules="rules" ref="newTagForm" onsubmit="return false;" style="margin-bottom: 15px;">
        <el-form-item prop="value">
          <el-input style="width: 400px;" v-model="newTag.value" :placeholder="$t('calcStorLang.IMAGE_TAGS_PLEASE_INPUT_TAG')" />
        </el-form-item>
        <el-form-item>
          <el-button @click="addTag" size="small" type="primary" native-type="submit">{{ $t('calcStorLang.IMAGE_TAGS_ADD') }}</el-button>
        </el-form-item>
      </el-form>
      <div>
        <el-tag type="primary" v-for="(tag, index) in tags" v-show="tag.operator !== 'delete'" :key="index" @close="deleteTag(tag.name)" :close-transition="true" :closable="true" style="margin: 5px 5px 0 0;">{{ tag.name }}</el-tag>
      </div>
      <span slot="footer">
        <el-button @click="cancel()">{{ $t('base.cancel') }}</el-button>
        <el-button type="primary" @click="save()" :loading="saving">{{ $t('base.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const MAX_TAGS_NUM = 50;
const MAX_TAGS_CHAR = 60;
import _ from 'underscore';
export default {
  name: "image-tags",
  props: ['imageId'],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      saving: false,
      tags: [],
      newTag: {
        value: ''
      },
      rules: {
        value: [
          { required: true, message: Vue.t('calcStorLang.IMAGE_TAGS_ERR_EMPTY'), trigger: 'change' },
          { max: MAX_TAGS_CHAR, message: Vue.t('calcStorLang.IMAGE_TAGS_ERR_CHAR_MAX', [MAX_TAGS_CHAR]), trigger: 'change' },
          { validator: (rule, value, callback) => {
              if (!/^[a-zA-Z0-9\u4e00-\u9fa5]*$/.test(value)) {
                callback(Vue.t('calcStorLang.IMAGE_TAGS_ERR_INVALID'))
              } else if (this.tags.find(item => item.name.toLowerCase() === value.toLowerCase() && item.operator !== 'delete')) {
                callback(Vue.t('calcStorLang.IMAGE_TAGS_ERR_EXISTS'));
              } else {
                callback();
              }
            },
            trigger: 'change' }
        ]
      }
    };
  },
  methods: {
    async loadData() {
      const $this = this;
      $this.loading = true;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/glance/v2/images/${$this.imageId}`,
          headers: {
            'OpenStack-API-Version': 'compute 2.41',
            'X-OpenStack-Nova-API-Version': '2.41'
          }
        });
        $this.tags = res.tags.map(item => {
          return {
            name: item,
            operator: '', //操作符：add 新增 delete 删除 ''不操作
            origin: true  //是否是原有的标签
          }
        });
        $this.tags = _.sortBy($this.tags, item => -item.name.length);
        $this.loading = false;
      } catch (e) {
        $this.loading = false;
      }
    },
    addTag() {
      this.$refs['newTagForm'].validate((valid) => {
        if (valid) {
          const tag = this.newTag.value;
          if (this.tags.filter(item => item.operator !== 'delete').length >= MAX_TAGS_NUM) {
            this.$message.error(Vue.t('calcStorLang.IMAGE_TAGS_ERR_NUM_MAX', [MAX_TAGS_NUM]))
          } else {
            const existingTag = this.tags.find(item => item.name === tag);
            if (!existingTag) {
              this.tags.push({
                name: this.newTag.value,
                operator: 'add',
                origin: false
              })
            } else {
              if (existingTag.operator === 'delete' && existingTag.origin === true) {
                existingTag.operator = '';
              } else if (existingTag.operator === 'delete' && existingTag.origin === false) {
                existingTag.operator = 'add';
              }
            }
            this.newTag.value = '';
            this.$refs['newTagForm'].resetFields();
          }
        } else {
          return false;
        }
      });
    },
    deleteTag(name) {
      const index = this.tags.findIndex(item => item.name === name)
      if (index > -1) {
        const existingTag = this.tags[index];
        if (existingTag) {
          if (existingTag.origin === true) {
            existingTag.operator = 'delete';
          } else {
            this.tags.splice(index, 1);
          }
        }
      }
    },
    show() {
      this.dialogVisible = true;
    },
    cancel() {
      this.$emit("close");
    },
    handleClose(done) {
      this.$emit("close");
      done();
    },
    async save() {
      const $this = this;
      $this.saving = true;
      if ($this.tags.findIndex(item => item.operator !== '') === -1) {
        $this.cancel();
      } else {
        let allSuccess = true;
        for (let i = 0; i < $this.tags.length; i++) {
          const tag = $this.tags[i];
          if (tag.operator !== 'add' && tag.operator !== 'delete') {
            continue;
          }
          try {
            const res = await $this.$ajax({
              url: `api/glance/v2/images/${$this.imageId}/tags/${encodeURIComponent(tag.name)}`,
              headers: {
                'OpenStack-API-Version': 'compute 2.41',
                'X-OpenStack-Nova-API-Version': 2.41
              },
              type: tag.operator === 'add' ? 'PUT' : 'DELETE',
              log: {
                description: {
                  en: tag.operator === 'add' ? `Add Image Tag: ${tag.name}, Image ID: ${$this.imageId}` : `Delete Image Tag: ${tag.name}, Image ID: ${$this.imageId}`,
                  zh_cn: tag.operator === 'add' ? `添加镜像标签：${tag.name}，镜像ID：${$this.imageId}` : `删除镜像标签：${tag.name}，镜像ID：${$this.imageId}`
                },
                key: "name",
                target: Vue.logTarget.computeMirror
              }
            });
          } catch (e) {
            allSuccess = false;
            __DEV__ && console.log(e);
          }
        }
        $this.saving = false;
        if (allSuccess) {
          $this.$message.success(Vue.t('calcStorLang.IMAGE_TAGS_SUCCESS_SAVED'));
        }
        $this.$emit('refresh');
        $this.cancel();
      }
    },
    async initDialog() {
      const $this = this;
      $this.show();
      $this.loadData();
    }
  },
  mounted() {
    this.initDialog();
  },
  created() {}
};
</script>

<style scoped>
</style>
