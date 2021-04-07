<template>
  <el-dialog
    :title="$t('storage.editExtendSpec')"
    :visible.sync="visible"
    :before-close="close"
    v-dialogDrag
  >
    <el-form
      ref="editVTExSForm"
      :model="editVTExS"
      label-width="150px"
      :rules="rules"
      label-position="right"
    >
      <el-form-item :label="$t('storage.key')" prop="selectedKey" class="is-required">
        <el-select class="col-8" @change="handleChangeKeyType" v-model="editVTExS.selectedKey" disabled>
          <el-tooltip effect="dark" :content="$t('storage.volumeBackendNameTip')" placement="right">
            <el-option :label="$t('storage.volumeBackendName')" value="volume_backend_name"></el-option>
          </el-tooltip>
          <el-tooltip effect="dark" :content="$t('storage.multiattachTip')" placement="right">
            <el-option :label="$t('storage.multiattach')" value="multiattach"></el-option>
          </el-tooltip>
          <el-tooltip effect="dark" :content="$t('storage.customTip')" placement="right">
            <el-option :label="$t('storage.custom')" value=""></el-option>
          </el-tooltip>
        </el-select>
        <el-tooltip placement="top" trigger="hover" :content="$t('storage.driversRsizeDesc')"  v-if="editVTExS.customKey">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('storage.custom')+$t('storage.key')" prop="key" v-if="editVTExS.customKey" class="is-required">
        <el-input class="col-8" v-model="editVTExS.key" auto-complete="off" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.custom')+$t('storage.value')" prop="value" v-if="editVTExS.customKey" class="is-required">
        <el-input class="col-8" v-model="editVTExS.value" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.value')" prop="exvalue" class="is-required" v-if="editVTExS.key === 'volume_backend_name'">
        <el-select class="col-8" v-model="editVTExS.exvalue">
          <el-option v-for="(host, index) in osHosts" :key="index" :value="host.host_name" :label="host.host_name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.value')" prop="exvalue" class="is-required" v-else-if="editVTExS.key === 'multiattach'">
        <el-select class="col-8" v-model="editVTExS.exvalue" disabled>
          <el-option value="<is> True" :label="$t('storage.multiattachSupport')"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmEditFun()" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "editVTExS",
  props: ["volTypeId", "selectedKey", "value"],
  data() {
    return {
      saving: false,
      editVTExS: {
        selectedKey: 'volume_backend_name',
        customKey: false,
        key: "volume_backend_name",
        exvalue: "",
        value:""
      },
      osHosts: [],
      size: 2,
      visible: false,
      rules: {
        value: [
          { type: "required", trigger: "blur change" },
          { type: "onlyLetter_MinusNumber" },
          { type: "maxSize", value: 255 }
        ],
        exvalue: [
          { type: "required", trigger: "blur change" },
          { type: "maxSize", value: 255 }
        ]
      }
    };
  },
  mounted() {
    this.getOSHosts();
    if (this.selectedKey === 'volume_backend_name') {
      this.editVTExS.selectedKey = this.selectedKey;
      this.editVTExS.key = this.selectedKey;
      this.editVTExS.exvalue = this.value;
    } else if (this.selectedKey === 'multiattach') {
      this.editVTExS.selectedKey = this.selectedKey;
      this.editVTExS.key = this.selectedKey;
      this.editVTExS.exvalue = this.value;
    } else {
      this.editVTExS.selectedKey = '';
      this.editVTExS.key = this.selectedKey;
      this.editVTExS.value = this.value;
      this.editVTExS.customKey = true;
    }
  },
  methods: {
    show() {
      this.visible = true;
    },
    close() {
      this.visible = false;
      this.$emit("handleClose", {});
    },
    async confirmEditFun() {
      this.$refs.editVTExSForm.validate(async (valid) => {
        if (valid) {
          var self = this;
          self.saving = true;
          var Pid = this.$cookie.get('pid');
          var url = "api/cinderv3/v3/" + Pid + "/types/" + self.volTypeId + "/extra_specs";
          var kv = new Map();
          if (self.editVTExS.customKey) {
            self.editVTExS.exvalue = self.editVTExS.value;
          }
          kv.set(self.editVTExS.key, self.editVTExS.exvalue);
          let obj = Object.create(null);
          for (let [k, v] of kv) {
            obj[k] = v;
          }

          var body = { "extra_specs": obj };
          body = JSON.stringify(body);
          try {
            let result = await self.$ajax({
              type: 'post',
              data: body,
              url: url,
              showErrMsg:false,
              successMsg: Vue.t('storage.successEditedExtraSpec'),
              errFun:function(xhr, status, msg) {
                let resp = xhr.responseJSON;
                //---当Http状态码为400时，返回的顶级对象为badRequest。
                if (resp.badRequest && resp.badRequest.message === "Volume Type is currently in use.") {
                  self.$message.error(Vue.t('calcStorLang.VolumeTypeisUsed'));//当前卷类型已被使用
                } else {
                  //没处理过的返回值均直接展示，方便发现问题。
                  self.$errMsg(xhr.responseJSON?xhr.responseJSON:"", xhr.status, true);
                }
              },
              log: {
                description: {
                  en: "Edit extra specification:" + JSON.stringify(obj),
                  zh_cn: "编辑扩展规格:" + JSON.stringify(obj)
                },
                target: Vue.logTarget.storage_volume_type
              }
            });
            this.$emit("handleEdit", {});
          } catch (res) {
            self.saving = false;
          }
        }
      });
    },
    originChange(val) {},
    handleChangeKeyType(val) {
      this.editVTExS.key = val
      this.editVTExS.customKey = val === ''
      if (val === 'multiattach') {
        this.editVTExS.exvalue = '<is> True'
      } else {
        this.editVTExS.exvalue = ''
      }
    },
    async getOSHosts() {
      let pId = this.$cookie.get("pid");
      let result = await this.$ajax({
        type: "get",
        url: `api/cinder/v3/${pId}/os-hosts`
      });
      this.osHosts = [];
      result.hosts
        .filter(host => host.service === 'cinder-volume' && host['service-status'] === 'available')
        .forEach(host => {
          host.host_name = host.host_name.split('@')[1]
          this.osHosts.push(host)
        })
    }
  }
};
</script>