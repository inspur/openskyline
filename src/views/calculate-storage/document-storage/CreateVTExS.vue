<template>
  <el-dialog :title="$t('storage.createExtendSpec')" :visible.sync="visible" :before-close="hide" v-dialogDrag>
    <el-form ref="createVTExSForm" :model="createVTExSForm" label-width="150px" :rules="rules" label-position="right">
      <el-form-item :label="$t('storage.key')" prop="key" class="is-required">
        <el-input class="col-8" v-model="createVTExSForm.key" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.value')" prop="value" class="is-required">
        <el-input class="col-8" v-model="createVTExSForm.value" auto-complete="off"></el-input>  
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="hide">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmCreateFun">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "createVTExS",
  props: ["shareTypeId", "existedKeyList"],
  data() {
    return {
      createVTExSForm: {
        key: "",
        value: ""
      },
      extraspecsList:["create_share_from_snapshot_support", "revert_to_snapshot_support", "mount_snapshot_support", "snapshot_support", "driver_handles_share_servers", "share_backend_name"],
      visible: false,
      rules: {
        key: [
          { type: "required", trigger: "blur change" },
          { type: "onlyLetter_MinusNumber" },
          { type: "maxSize", value: 255 }
        ],
        value: [
          { type: "required", trigger: "blur change" },
          { type: "onlyLetter_MinusNumber" },
          { type: "maxSize", value: 255 }
        ]
      }
    };
  },
  mounted() {
    let self =this;
    self.extraspecsList= Array.from(new Set(self.extraspecsList.concat(self.existedKeyList)));
    console.log(self.extraspecsList);
  },
  methods: {
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
      this.$emit("handleShow", {});
    },
    async confirmCreateFun() {
      let self = this;
      this.$refs.createVTExSForm.validate(async valid => {
        if (valid) {
          if (self.extraspecsList.indexOf(self.createVTExSForm.key) > -1) {
            self.$message.error(Vue.t("container.keyExistError"));
            return false;
          }
          let url= "api/manila/v2/" + this.$cookie.get("pid") + "/types/" + self.shareTypeId + "/extra_specs";
          let {key, value} = self.createVTExSForm;
          let extraSpecs = {};
          extraSpecs[key] = value;
          var body = { "extra_specs" : extraSpecs };
          body = JSON.stringify(body);
          try {
            let result = await self.$ajax({
              type: "post",
              data: body,
              url: url,
              showErrMsg: true,
              successMsg: Vue.t('storage.successCreatedExtraSpec'),
              log: {
                description: {
                  en: "Create extra specification: key is " + self.createVTExSForm.key + ", value is" + self.createVTExSForm.value,
                  zh_cn: "创建扩展规格: 键为" + self.createVTExSForm.key + ", 值为" + self.createVTExSForm.value
                },
                target: Vue.logTarget.storage_share_type
              }
            });
            self.visible = false;
            this.$emit("handleShow", {});
            this.$emit("addData", {});
          } catch (res) {
            self.loading = false;
          }
        }
      });
    }
  }
};
</script>