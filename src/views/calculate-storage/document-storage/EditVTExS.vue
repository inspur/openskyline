<template>
  <el-dialog :title="$t('storage.editExtendSpec')" :visible.sync="visible" :before-close="close" v-dialogDrag>
    <el-form ref="editVTExSForm" :model="editVTExSForm" label-width="150px" :rules="rules" label-position="right">
      <el-form-item :label="$t('storage.custom')+$t('storage.key')" prop="i18n_key" class="is-required" v-if="!isShowBackendFlag">
        <el-input class="col-8" v-model="editVTExSForm.i18n_key" auto-complete="off" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.value')" prop="value" class="is-required" v-if="!isShowBackendFlag">
        <el-input class="col-8" v-model="editVTExSForm.value" auto-complete="off"></el-input>
      </el-form-item>
      <!--------------------------------------------------------------------------------------->
      <el-form-item :label="$t('storage.share_backend_name')" prop="exvalue" class="is-required" v-if="isShowBackendFlag">
        <el-select class="col-8" v-model="editVTExSForm.value" @change="handleChange">
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
      <el-button type="primary" @click="confirmEditFun()">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "editVTExS",
  props: ["shareTypeId", "editVTExS"],
  data() {
    return {
      editVTExSForm: {
        key: "",
        value: "",
        i18n_key:""
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
      isShowBackendFlag:false,
      extraspecsList : ["share_backend_name"],
      visible: false,
      backendOptions:[],
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
    this.initFrom();
  },
  methods: {
    show() {
      this.visible = true;
    },
    close() {
      this.visible = false;
      this.$emit("handleEdit", {});
      this.$emit("handleClose", {});
    },
    initFrom() {
      let self = this;
      self.editVTExSForm=self.editVTExS;
      this.isShowBackendFlag =false;
      if (self.extraspecsList.indexOf(self.editVTExS.key) > -1) {
        this.isShowBackendFlag =true;
      }
      if (this.isShowBackendFlag) {
        self.oldBackend=self.editVTExS.value;
        this.loadBackendOptions();
      }
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
        this.handleChange();
      } catch (data) {
        this.loading = false;
        this.isDisabled = false;
        __DEV__ && console.error(data);
      }
    },
    async confirmEditFun() {
      this.$refs.editVTExSForm.validate(async(valid) => {
        if (valid) {
          var self = this;
          if (this.isShowBackendFlag && this.oldBackend == this.editVTExSForm.value) {
            self.$message.error(Vue.t('storage.plsSelctNewBakendname'));
            return false;
          }
          let {key, value, i18n_key} = self.editVTExSForm;
          let url = "api/manila/v2/" + this.$cookie.get('pid') + "/types/" + self.shareTypeId + "/extra_specs";
          let extraSpecs = {};
          extraSpecs[key] = value;
          if (this.isShowBackendFlag) {
            let { driver, msnapshot, rsnapshot, csnapshot, ssnapshot } =this.editShareType;
            extraSpecs = {
              ...extraSpecs,
              "driver_handles_share_servers" : driver.toString(),
              "mount_snapshot_support" : msnapshot.toString(),
              "revert_to_snapshot_support" : rsnapshot.toString(),
              "create_share_from_snapshot_support" : csnapshot.toString(),
              "snapshot_support" : ssnapshot.toString()
            }
          }
          let body = { "extra_specs": extraSpecs };
          body = JSON.stringify(body);
          console.log(body);
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
                  en: "Edit extra specification: key is " + self.editVTExSForm.key + ", value is" + self.editVTExSForm.value,
                  zh_cn: "编辑扩展规格: 键为" + self.editVTExSForm.key + ", 值为" + self.editVTExSForm.value
                },
                target: Vue.logTarget.storage_share_type
              }
            });
            self.visible = false;
            this.$emit("handleEdit", {});
          } catch (res) {
          }
        }
      })
    },
    handleChange() {
      let item = this.backendOptions.find((item) => item.value == this.editVTExSForm.value);
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