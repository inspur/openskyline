<template>
  <div>
    <el-dialog :visible="dialogVisible" :before-close="handleClose" :title="$t('calcStorLang.editHost')" size="tiny">
      <el-form ref="form" class="me-required-form" :rules="rules" :model="formData" label-width="100px" label-position="left">
        <el-form-item :label="$t('calcStorLang.hostName')" prop="name" class="is-required">
          <el-input v-model="formData.name" :disabled="true" class="col-16"></el-input>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.reserved')" prop="reserved">
          <el-select v-model="formData.reserved" class="col-16">
            <el-option :label="$t('base.yes')" :value="true"></el-option>
            <el-option :label="$t('base.no')" :value="false"></el-option>
          </el-select>
          <el-tooltip placement="right">
              <div slot="content" v-html="$t('calcStorLang.editHostTip1')"></div>
              <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.type')" prop="type" class="is-required" v-if="false">
          <el-select v-model="formData.type" class="col-16">
            <el-option label="COMPUTE" value="COMPUTE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.controlAttributes')" prop="control_attributes" class="is-required" v-if="false">
          <el-select v-model="formData.control_attributes" class="col-16">
            <el-option label="SSH" value="SSH"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.onMaintenance')" prop="on_maintenance" v-if="false">
          <el-select v-model="formData.on_maintenance" class="col-16">
            <el-option :label="$t('base.yes')" :value="true"></el-option>
            <el-option :label="$t('base.no')" :value="false"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.haSwitch')" prop="ha_switch">
          <el-select v-model="formData.on_maintenance" class="col-16">
            <el-option :label="$t('calcStorLang.switchOn')" :value="false"></el-option>
            <el-option :label="$t('calcStorLang.switchOff')" :value="true"></el-option>
          </el-select>
          <el-tooltip placement="right">
            <div slot="content" v-html="$t('calcStorLang.editHostTip2')"></div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="cancel()">{{ $t('base.cancel') }}</el-button>
        <el-button type="primary" @click="save()" :loading="saving">{{ $t('base.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "EditHost",
  props: ["segment_id", "host_id"],
  data() {
    return {
      dialogVisible: false,
      saving: false,
      formData: {
        name: "",
        reserved: true,
        type: "COMPUTE",
        control_attributes: "SSH",
        on_maintenance: false
      },
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'onlyLetter_MinusNumberChinese' },
          { type: 'maxSize', value: 255 }
        ],
        type: [
          { type: 'required', trigger: 'blur change' }
        ],
        control_attributes: [
          { type: 'required', trigger: 'blur change' }
        ]
      }
    };
  },

  methods: {
    show() {
      this.dialogVisible = true;
    },
    cancel() {
      this.$emit("handleClose");
    },
    handleClose(done) {
      this.$emit("handleClose");
      done();
    },
    save() {
      const self = this;
      self.saving = true;
      this.$refs["form"].validate(async valid => {
        if (valid) {
          try {
            self.saving = true;
            let ret = await self.$ajax({
              type: "put",
              data: JSON.stringify({
                host: self.formData
              }),
              successMsg: Vue.t('calcStorLang.editHostSuccessTip'),
              url: `api/masakari/v1/segments/${this.segment_id}/hosts/${
                this.host_id
              }`,
              log: {
                target: Vue.logTarget.hostHa,
                level: {
                  en: "info",
                  zh_cn: "信息"
                },
                description: {
                  en: "HA Segment Edit Host : " + self.formData.name,
                  zh_cn: "高可用集群编辑主机:" + self.formData.name
                }
              }
            });
            self.saving = false;
            self.$emit("handleClose");
            self.$emit("handleEditHost");
          } catch (data) {
            self.saving = false;
          }
        } else {
          self.saving = false;
          return false;
        }
      });
    },
    async initDialog() {
      const self = this;
      let ret = await self.$ajax({
        type: "get",
        url: `api/masakari/v1/segments/${self.segment_id}/hosts/${self.host_id}`
      });
      this.formData = {
        name: ret.host.name,
        reserved: ret.host.reserved,
        type: ret.host.type,
        control_attributes: ret.host.control_attributes,
        on_maintenance: ret.host.on_maintenance
      };
      this.show();
    }
  },

  mounted() {},

  created() {}
};
</script>

<style scoped>
</style>
