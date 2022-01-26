<template>
  <el-dialog :title="$t('storage.migration')" :visible.sync="visible" :before-close="cancelFun" v-dialogDrag>
    <el-form ref="editVolumeForm" class="me-required-form" :model="editVolumeForm" label-position="left" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('calcStorLang.volumetype')" prop="type" class="is-required">
        <el-select v-model="editVolumeForm.type" filterable >
          <el-option v-for="item in typeOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelFun">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "VolumeMigration",
  props: ["detailVolume"],
  data() {
    return {
      editVolumeForm: {
        type: ""
      },
      saving: false,
      visible: true,
      loading: false,
      typeOptions: [],
      rules: {
        type: [
          { type: 'required', trigger: 'blur change' }
        ]
      }
    }
  },
  mounted() {
    this.getTypeList();
  },
  methods: {
    async getTypeList() {
      var self = this;
      this.loading = true;
      var projectId = this.$cookie.get('pid');
      let G2BackendList = await this.getPools();
      let url = "api/cinderv3/v3/" + projectId + "/types?is_public=None";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        let typeOptions = result['volume_types'];
        typeOptions.forEach(item => {
          if (item["name"] == self.detailVolume.volume_type) {
            return false
          }
          let extraSpecs = item["extra_specs"];
          //过滤掉绑定的存储后端不为G2，以及共享的卷类型。
          if (self.detailVolume.status == "in-use" && extraSpecs["multiattach"] === "<is> True") {
            return false
          }
          self.typeOptions.push(item);
        });
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    async getPools() {
      var self = this;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + self.$cookie.get("pid") + "/scheduler-stats/get_pools?detail=true"
        });
        var data = ret['pools'];
        if (data != null && data.length > 0) {
          let G2BackendList = []
          data.forEach(pool => {
            let capabilities = pool["capabilities"];
            if (capabilities && capabilities["location_info"] && capabilities["location_info"].indexOf("InStorageMCSDriver") === 0) {
              G2BackendList.push(capabilities["volume_backend_name"]);
            }
          });
          return G2BackendList;
        }
      } catch (data) {
        return [];
      }
    },
    confirmFun() {
      let self = this;
      self.$refs.editVolumeForm.validate(async (valid) => {
        if (valid) {
          let type = self.editVolumeForm.type;
          let typeObj = self.typeOptions.find(function (item) {
            return item.id === type;
          });
          if (!self.editVolumeForm.encrypted && typeObj["encrypt"]) {
            self.$message.error(Vue.t("storage.TYPE_CHANGE_NOTE"));
            return
          }
          if (typeObj && typeObj.name === self.detailVolume.volume_type) {
            self.$message(Vue.t("storage.TYPE_UNCHANGE"));
            return;
          }
          var Pid = this.$cookie.get('pid');
          let url = "api/cinderv3/v3/" + Pid + "/volumes/" + self.detailVolume.id + "9";
          let body = {
            "os-retype": {
              "new_type": type,
              "migration_policy": "on-demand"
            }
          }
          self.loading = true;
          self.saving = true;
          body = JSON.stringify(body);
          let onlineFlag = self.detailVolume.status == "in-use";
          let onlineDesCh = onlineFlag?"在线":"离线";
          let onlineDesEn = onlineFlag?"Online":"Offline";
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: 'post',
              errorKey: "message",
              log: {
                description: {
                  en: onlineDesEn + "Migrate volume: " + self.detailVolume.name + "(" +self.detailVolume.id + ")" +"to volume Type" + typeObj.name + "(" + type + ")",
                  zh_cn: onlineDesCh + "迁移云硬盘: " + self.detailVolume.name + "(" +self.detailVolume.id + ")" +"到云硬盘类型" + typeObj.name + "(" + type + ")"
                },
                target: Vue.logTarget.storage_volume
              },
              successMsg: Vue.t("storage.updateSuccess"),
              successFun: () => {
                self.loading = false;
                self.saving = false;
                this.$emit("hide");
                this.$emit("refresh");
              },
              errFun: () => {
                self.loading = false;
                self.saving = false;
              }
            });
          } catch (data) {
            self.loading = false;
            self.saving = false;
          }
        } else {
          return false;
        }
      });
    },
    cancelFun() {
      this.$emit("hide");
    }
  }
}
</script>