<template>
  <el-dialog :title="$t('calcStorLang.setBios')" :visible.sync="dialogVisible" :before-close="handleClose" size="tiny">
    <el-form ref="biosForm" :model="biosForm" label-width="100px" :rules="rules" v-loading="isDisabled">
      <el-form-item :label="$t('calcStorLang.guideOption')" prop="guide" class="is-required">
        <el-select v-model="biosForm.guide" class="col-8" filterable clearable :placeholder="$t('calcStorLang.pleaseSelect')">
          <el-option v-for="item in guideOptions" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.lasting')" prop="lasting" class="is-required">
        <el-switch v-model="biosForm.lasting" :on-text="$t('lang.yes')" :off-text="$t('lang.no')"></el-switch>
        <el-tooltip placement="right" trigger="hover" :content="$t('calcStorLang.setBiosLastingTips')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAddSpec" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  props: ['id', 'name'],
  data() {
    return {
      biosForm: {
        guide: '',
        lasting: false
      },
      dialogVisible: true,
      saving: false,
      guideOptions: [],
      rules: {
        guide: [
          { type: 'required', trigger: 'blur change' }
        ]
      }
    }
  },
  mounted() {
    this.getGuides();
    this.initData();
  },
  methods: {
    async initData() {
      var self = this;
      try {
        let ret = await this.$ajax({
          url: "api/ironic/v1/nodes/" + self.id + "/management/boot_device",
          type: 'get'
        });
        this.biosForm.guide = ret['boot_device'];
        this.biosForm.lasting = ret['persistent'];
      } catch (data) {
      }
    },
    async getGuides() {
      var self = this;
      try {
        let ret = await this.$ajax({
          url: "api/ironic/v1/nodes/" + self.id + "/management/boot_device/supported",
          type: 'get'
        });
        let result = ret['supported_boot_devices'];
        self.guideOptions = result;
      } catch (data) {
      }
    },
    handleCancel() {
      this.$emit("hide", {});
    },
    handleClose(done) {
      this.$emit("hide", {});
      done();
    },
    confirmAddSpec() {
      this.$refs.biosForm.validate(async (valid) => {
        if (valid) {
          this.saving = true;
          let url = "api/ironic/v1/nodes/" + this.id + "/management/boot_device";
          let body = { "boot_device": this.biosForm.guide, "persistent": this.biosForm.lasting };
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: 'PUT',
              successMsg: Vue.t("calcStorLang.setSuccess") + "！",
              log: {
                description: {
                  en: "Baremachine:" + this.name +" set boot option",
                  zh_cn: Vue.t("calcStorLang.bareMachine") + ":" + this.name + Vue.t("calcStorLang.setBios")
                },
                target: Vue.logTarget.bareMachine
              }
            });
            this.saving = false;
            this.$emit("hide", {});
            this.$emit("onRefresh");
          } catch (data) {
            this.saving = false;
          }
        } else {
          return false;
        }
      });
    }
  }
}
</script>
