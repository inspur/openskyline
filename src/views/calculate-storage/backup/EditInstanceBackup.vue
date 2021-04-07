<template>
  <el-dialog
    :title="$t('calcStorLang.editInstanceBackup')"
    :visible.sync="dialogVisible"
    :before-close="onBeforeClose"
    size="tiny"
    :loading="loading">
    <el-form label-width="80px" :model="formData" class="me-required-form" ref="form" :rules="rules">
      <el-form-item :label="$t('calcStorLang.backupSourceInstance')" class="is-required" prop="server_id">
        <el-input v-model="instanceName" class="col-20" disabled></el-input>
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
      <el-button type="primary" @click="save" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    'id': String,
    'instanceName': String
  },
  data() {
    return {
      loading: false,
      saving: false,
      dialogVisible: false,
      formData: {
        display_name: '',
        display_description: ''
      },
      rules: {
        server_id: [
          { type: 'required', trigger: 'blur' }
        ],
        display_name: [
          { type: 'required', trigger: 'blur' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        display_description: [
          { type: 'maxSize', value: 255 }
        ]
      }
    };
  },
  methods: {
    initDialog() {
      const $this = this;
      $this.dialogVisible = true;
      $this.load();
    },
    onBeforeClose() {
      const $this = this;
      $this.close();
    },
    close() {
      const $this = this;
      $this.dialogVisible = false;
      $this.$emit('handleClose');
    },
    save() {
      const $this = this;
      $this.$refs['form'].validate(async function (valid) {
        if (valid) {
          $this.saving = true;
          const url = `api/nova/v2.1/os-server-backups/${$this.id}`;
          const data = {
            display_name: $this.formData.display_name,
            display_description: $this.formData.display_description
          };
          try {
            let result = await $this.$ajax({
              type: 'put',
              url: url,
              data: JSON.stringify(data),
              headers: {
                'X-OpenStack-Nova-API-Version': 2.41
              },
              showErrMsg: true,
              log: {
                description: {
                  en: `Edit Instance Backup: ${$this.formData.display_name}`,
                  zh_cn: `编辑云主机备份：${$this.formData.display_name}`
                },
                key: "display_name",
                target: Vue.logTarget.instanceBackup
              }
            });
            $this.saving = false;
            $this.$message(Vue.t('calcStorLang.backupEditSuccess'));
          } catch (res) {
            $this.saving = false;
          }
          $this.saving = false;
          $this.close();
          $this.$emit('handleConfirm');
        } else {
          return false;
        }
      })
    },
    async load() {
      const $this = this;
      $this.loading = true;
      const url = `api/nova/v2.1/os-server-backups/${$this.id}`;
      try {
        let result = await $this.$ajax({
          type: 'get',
          url: url,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.41
          },
          showErrMsg: true
        });
        $this.formData.display_name = result.instance_backup_detail.display_name;
        $this.formData.display_description = result.instance_backup_detail.display_description;
        $this.loading = false;
      } catch (res) {
        $this.loading = false;
      }
    }
  },
  mounted() {
    const $this = this;
    $this.initDialog();
  }
};
</script>

<style>
</style>
