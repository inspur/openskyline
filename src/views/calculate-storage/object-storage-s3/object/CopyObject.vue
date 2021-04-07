<template>
  <el-dialog :title="$t('calcStorLang.detail')" :visible="true" :before-close="handleClose" v-dialogDrag>
    <div>
      <el-form ref="form" :model="formData" :rules="rules" label-width="100px" label-position="right">
        <el-form-item :label="$t('storage.COPY_OBJECT_ORIGIN_OBJECT')">
          {{ fullPath }}
        </el-form-item>
        <el-form-item :label="$t('storage.COPY_OBJECT_TARGET_BUCKET')">
          <el-select v-model="formData.bucket" @change="handleBucketChanged">
            <el-option v-for="bucket in buckets" :key="bucket.Name" :label="bucket.Name" :value="bucket.Name" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('storage.COPY_OBJECT_TARGET_DIR')">
          <div>
            <el-tree
              ref="pathTree"
              node-key="path"
              :data="paths"
              :props="{label: 'label', children: 'children'}"
              :load="loadNode"
              :lazy="true"
              :highlight-current="true"
              :current-node-key="formData.path"
              :check-strictly="true"
              @node-click="handleTreeNodeClicked"
              style="height: 200px;"
            />
          </div>
        </el-form-item>
        <el-form-item :label="$t('storage.COPY_OBJECT_FILE_NAME')" prop="fileName">
          <el-input v-model="formData.fileName" />
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('lang.close')}}</el-button>
      <el-button type="primary" @click="save" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>

<script>
export default {
  name: 'CopyObject',
  props: {
    fileName: {
      type: String,
      default: ''
    },
    fullPath: {
      type: String,
      default: ''
    },
    defaultBucket: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      saving: false,
      buckets: [],
      paths: [],
      formData: {
        bucket: '',
        path: '',
        fileName: ''
      },
      rules: {
        fileName: [
          { type: 'required', trigger: 'blur change' },
          { type: 'onlyLetter_NumberChinese_Pointer' },
          { type: 'maxByte', value: 255 }
        ]
      }
    }
  },
  mounted() {
    this.loadAllBuckets();
    this.formData.fileName = this.fileName;
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },
    loadAllBuckets() {
      const $this = this;
      Vue.s3.listBuckets({}, function(err, data) {
        if (err) {
          $this.$message.error(Vue.t('lang.queryBucketListFailed'));
        } else {
          let buckets = data['Buckets'];
          $this.buckets = buckets;
          $this.formData.bucket = $this.defaultBucket;
        }
      });
    },
    loadNode(node, resolve) {
      const $this = this;
      let params = {
        Bucket: $this.formData.bucket,
        Prefix: node.level === 1 ? '' : node.data.label, // 根目录前缀为空字符串
        Delimiter: '/'
      };
      Vue.s3.listObjects(params, function(err, data) {
        if (err) {
          __DEV__ && console.error(err);
        } else {
          let prefixes = data.CommonPrefixes;
          resolve(prefixes.map(item => {
            return {
              path: item.Prefix,
              label: item.Prefix,
              children: []
            };
          }));
        }
      });
    },
    handleBucketChanged() {
      const $this = this;
      let params = {
        Bucket: $this.formData.bucket,
        Prefix: '',
        Delimiter: '/'
      };
      Vue.s3.listObjects(params, function(err, data) {
        if (err) {
          __DEV__ && console.error(err);
        } else {
          let prefixes = data.CommonPrefixes;
          let paths = [{
            path: '',
            label: $this.$t('storage.rootPath'),
            children: prefixes.map(item => {
              return {
                path: item.Prefix,
                label: item.Prefix,
                children: []
              };
            })
          }]
          $this.paths = paths;
          $this.formData.path = '';
        }
      });
    },
    handleTreeNodeClicked(data) {
      const $this = this;
      $this.formData.path = data.path;
    },
    save() {
      const $this = this;
      $this.$refs.form.validate((valid) => {
        if (valid) {
          if (`${$this.formData.bucket}/${$this.formData.path}${$this.formData.fileName}` === `${$this.defaultBucket}/${$this.fullPath}`) {
            $this.$message.error($this.$t('storage.COPY_OBJECT_TARGET_SAME'));
          } else {
            $this.saving = true;
            let params = {
              Bucket: $this.formData.bucket,
              Key: `${$this.formData.path}${$this.formData.fileName}`
            };
            Vue.s3.getObject(params, function(err, data) {
              if (err) {
                $this.performCopy();
              } else {
                $this.$confirm($this.$t('storage.COPY_OBJECT_COVERAGE_CONFIRM'), $this.$t('base.prompt'), {
                  type: 'warning'
                }).then(() => {
                  $this.performCopy();
                }).catch(() => {
                  $this.saving = false;
                });
              }
            });
          }
        }
      });
    },
    performCopy() {
      const $this = this;
      let params = {
        Bucket: $this.formData.bucket,
        CopySource: encodeURIComponent(`${$this.defaultBucket}/${$this.fullPath}`),
        Key: `${$this.formData.path}${$this.formData.fileName}`
      };
      Vue.s3.copyObject(params, function(err, data) {
        if (err) {
          if (err.stack.indexOf('QuotaExceeded') > -1) {
            $this.$message.error($this.$t('storage.COPY_OBJECT_BUCKET_QUOTA_EXCEEDED'));
          }
          $this.saving = false;
          __DEV__ && console.error(err);
        } else {
          $this.$recordLog({
            level: {
              en: 'info',
              zh_cn: '信息'
            },
            description: {
              en: `Copy Object: ${$this.defaultBucket}/${$this.fullPath} To ${$this.formData.bucket}/${$this.formData.path}${$this.formData.fileName}`,
              zh_cn: `复制存储桶(${$this.defaultBucket})的对象: ${$this.$t('storage.rootPath')}/${$this.fullPath} 到存储桶(${$this.formData.bucket})的${$this.$t('storage.rootPath')}/${$this.formData.path}${$this.formData.fileName}`
            },
            target:Vue.logTarget.storage_object_storage
          });
          $this.$message.success($this.$t('storage.COPY_OBJECT_SUCCESSFULLY'));
          $this.handleClose();
          $this.$emit('refresh');
        }
      });
    }
  }
}
</script>

<style scoped>
</style>

