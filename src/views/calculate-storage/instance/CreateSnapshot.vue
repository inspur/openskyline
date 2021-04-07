<template>
  <el-dialog :title="$t('calcStorLang.instCreateSnapshot')" :visible.sync="dialogVisible" :before-close="handleClose" size="tiny">
    <div v-loading="saving" :element-loading-text="$t('calcStorLang.CREATE_SNAPSHOT_SAVING_TEXT')" style="height: 100px;">
      <el-form ref="editInstanceForm" :model="Instance" label-width="120px" :rules="rules">
        <el-form-item :label="$t('calcStorLang.snapshotName')" class="is-required" prop="name" align="left">
          <el-input v-model="Instance.name"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAddIppool" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'CreateSnapshot',
  props: ['instUuid'],
  data() {
    return {
      Instance: {
        name: ""
      },
      saving: false,
      dialogVisible: false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.editInstanceForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    handleCancel() {
      this.$emit("handlerCreIsoFlag", {});
    },
    handleClose(done) {
      this.$emit("handlerCreIsoFlag", {});
      done();
    },
    confirmAddIppool() {
      this.$refs.editInstanceForm.validate(async (valid) => {
        if (valid) {
          var self = this;
          self.saving = true;
          var body = { "createImage": { "name": self.Instance.name } };
          body = JSON.stringify(body);
          try {
            let result = await self.$ajax({
              type: 'post',
              url: 'api/nova/v2.1/servers-inspur/' + self.instUuid + '/action',
              data: body,
              showErrMsg: true,
              errorKey: "forbidden",
              successMsg:Vue.t('calcStorLang.createSnapSuccess'),
              log: {
                description: {
                  en: "Create Snapshot:" + self.Instance.name,
                  zh_cn: "创建云主机快照:" + self.Instance.name
                },
                target: Vue.logTarget.computeInstance
              },
              successFun: function() {
                self.loading = false;
                self.$emit("handlerCreIsoFlag", {});
               // self.$emit("onRefresh");
                self.$emit("hrefToSnapshotPage", {});
              }
            });
          } catch (res) {
            self.saving = false;
            self.loading = false;
          }
        } else {
          return false;
        }
      });
    }
  }
}

</script>
