<template>
  <el-dialog :title="$t('storage.extraSpecs')" :visible.sync="visible" :before-close="close" v-dialogDrag>
    <el-form ref="editShareTypeNewForm" :model="editShareTypeNewForm" label-width="150px" :rules="rules" label-position="left">
      <el-form-item :label="$t('storage.share_backend_name')" prop="value" class="is-required">
        <el-select class="col-8" v-model="editShareTypeNewForm.value" @change="handleChange">
          <el-option v-for="item in backendOptions" :key="item.label" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
        <el-tag type="success" v-if='editShareType.csnapshot'>{{$t('storage.create_share_from_snapshot_support')}}</el-tag>
        <el-tag type="success" v-if='editShareType.rsnapshot'>{{$t('storage.revert_to_snapshot_support')}}</el-tag>
        <el-tag type="success" v-if='editShareType.msnapshot'>{{$t('storage.mount_snapshot_support')}}</el-tag>
        <el-tag type="success" v-if='editShareType.ssnapshot'>{{$t('storage.snapshot_support')}}</el-tag>
        <el-tag type="success" v-if='editShareType.driver'>{{$t('storage.driver_handles_share_servers')}}</el-tag>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmEditFun()" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "editShareTypeNew",
  props: ['shareTypeData'],
  data() {
    return {
      editShareTypeNewForm: {
        value: ""
      },
      oldBackend:"",
      editShareType:{
        name:"",
        bakendname:"",
        isPublic:true,
        driver:false,
        msnapshot:false,
        rsnapshot:false,
        csnapshot:false,
        ssnapshot:false,
        extraSpecs:""
      },
      visible: true,
      saving: false,
      backendOptions:[],
      rules: {
        value: [
          { type: "required", trigger: "blur change" }
        ]
      }
    };
  },
  mounted() {
    this.initFrom();
  },
  methods: {
    close() {
      this.$emit("handleClose", {});
    },
    initFrom() {
      let self = this;
      let shareTypeData=self.shareTypeData;
      if (shareTypeData && shareTypeData['extra_specs']) {
        self.oldBackend = shareTypeData['extra_specs']['share_backend_name'];
      }
      this.editShareTypeNewForm.value = self.oldBackend;
      this.loadBackendOptions();
    },
    async loadBackendOptions() {
      let self = this;
      let url = "api/manila/v2/" + this.$cookie.get("pid") + "/scheduler-stats/pools/detail";
      let type = "GET";
      try {
        let ret = await this.$ajax({
          url: url,
          type: type
        });
        let result = ret["pools"];
        result.forEach( (item, index) => {
          let label = item.backend;
          let capabilities = item["capabilities"];
          let value = capabilities["share_backend_name"];
          let tempObj = {label, value, ...capabilities};
          this.backendOptions.push(tempObj);
        });
        if (this.backendOptions.length >0) {
          this.handleChange();
        }
      } catch (data) {
        this.loading = false;
        this.isDisabled = false;
        __DEV__ && console.error(data);
      }
    },
    async confirmEditFun() {
      this.$refs.editShareTypeNewForm.validate(async(valid) => {
        if (valid) {
          var self = this;
          if (this.oldBackend == this.editShareTypeNewForm.value) {
            self.$message.error(Vue.t('storage.plsSelctNewBakendname'));
            return false;
          }
          let url = "api/manila/v2/" + this.$cookie.get('pid') + "/types/" + self.shareTypeId + "/extra_specs";
          let { driver, msnapshot, rsnapshot, csnapshot, ssnapshot } =this.editShareType;
          let extraSpecs = {
            "driver_handles_share_servers" : driver.toString(),
            "mount_snapshot_support" : msnapshot.toString(),
            "revert_to_snapshot_support" : rsnapshot.toString(),
            "create_share_from_snapshot_support" : csnapshot.toString(),
            "snapshot_support" : ssnapshot.toString()
          }
          let body = { "extra_specs": extraSpecs };
          body = JSON.stringify(body);
          self.saving = true;
          try {
            let result = await self.$ajax({
              type: "post",
              data: body,
              url: url,
              showErrMsg: true,
              successMsg: Vue.t('storage.successEditedExtraSpec'),
              errFun: function(xhr, status, msg) {
                let resp = xhr.responseJSON;
                //---当Http状态码为400时，返回的顶级对象为badRequest。
                if (resp.badRequest && resp.badRequest.message === "Volume Type is currently in use.") {
                  self.$message.error(Vue.t('calcStorLang.VolumeTypeisUsed')); //当前卷类型已被使用
                } else {
                  //没处理过的返回值均直接展示，方便发现问题。
                  self.$errMsg(xhr.responseJSON ? xhr.responseJSON: "", xhr.status, true);
                }
              },
              log: {
                description: {
                  en: `Change backend name ${self.oldBackend} to ${self.editShareTypeNewForm.value}`,
                  zh_cn: `切换后端存储${self.oldBackend}到${self.editShareTypeNewForm.value}`
                },
                target: Vue.logTarget.storage_share_type
              }
            });
            this.$emit("handleEdit", {});
          } catch (res) {
            $this.saving = false;
            self.$message.error(Vue.t("storage.editFailed"));
          }
        }
      })
    },
    handleChange() {
      if (!this.editShareTypeNewForm.value) {
        return false;
      }
      let item = this.backendOptions.find((item) => item.value == this.editShareTypeNewForm.value);
      let { share_backend_name : bakendname,
            driver_handles_share_servers : driver,
            mount_snapshot_support : msnapshot,
            revert_to_snapshot_support : rsnapshot,
            create_share_from_snapshot_support : csnapshot,
            snapshot_support : ssnapshot
      } = item;
      this.editShareType ={...this.editShareType, bakendname, driver, msnapshot, rsnapshot, csnapshot, ssnapshot};
    }
  }
};
</script>