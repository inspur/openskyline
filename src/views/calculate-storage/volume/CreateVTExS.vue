<template>
  <el-dialog
    :title="$t('storage.createExtendSpec')"
    :visible.sync="visible"
    :before-close="hide"
    v-dialogDrag
  >
    <el-form
      ref="createVTExSForm"
      :model="createVTExS"
      label-width="150px"
      :rules="rules"
      label-position="right"
    >
      <el-form-item :label="$t('storage.key')" prop="selectedKey" class="is-required">
        <el-select class="col-8" @change="handleChangeKeyType" v-model="createVTExS.selectedKey">
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
        <el-tooltip placement="top" trigger="hover" :content="$t('storage.driversRsizeDesc')"  v-if="createVTExS.customKey">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('storage.custom')+$t('storage.key')" prop="key" v-if="createVTExS.customKey" class="is-required">
        <el-input class="col-8" v-model="createVTExS.key" auto-complete="off"></el-input>
      </el-form-item>
       <el-form-item :label="$t('storage.custom')+$t('storage.value')" prop="value" v-if="createVTExS.customKey" class="is-required">
        <el-input class="col-8" v-model="createVTExS.value" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.value')" prop="exvalue" class="is-required" v-if="createVTExS.key === 'volume_backend_name'">
        <el-select class="col-8" v-model="createVTExS.exvalue">
          <el-option v-for="(host, index) in osHosts" :key="index" :value="host.host_name" :label="host.host_name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.value')" prop="exvalue" class="is-required" v-else-if="createVTExS.key === 'multiattach'">
        <el-select class="col-8" v-model="createVTExS.exvalue" disabled>
          <el-option value="<is> True" :label="$t('storage.multiattachSupport')"></el-option>
        </el-select>
      </el-form-item>
     
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="hide">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmCreateFun()" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "createVTExS",
  props: ["volTypeId"],
  data() {
    var customKeyValidator = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('container.required')));
      } else if (value.length>255) {
        return callback(new Error(this.$t('calculateStorage.INSTANCE_LOCK_MAX_LEN')));
      } else {
        let regex = /^[\w_\:\-]+$/;
        if (!regex.test(value)) {
          return callback(new Error(this.$t('storage.colonsVal')));
        } else {
          callback();
        }
      }
    }
    return {
      saving: false,
      createVTExS: {
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
        key: [
          { validator: customKeyValidator, trigger: "blur change" }
        ],
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
    this.getOSHosts()
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
      this.$refs.createVTExSForm.validate(async valid => {
        if (valid) {
          var self = this;
          self.saving = true;
          var Pid = this.$cookie.get("pid");
          var url =
            "api/cinderv3/v3/" +
            Pid +
            "/types/" +
            self.volTypeId +
            "/extra_specs";
          var kv = new Map();
          if (self.createVTExS.customKey) {
            self.createVTExS.exvalue = self.createVTExS.value;
          }
          kv.set(self.createVTExS.key, self.createVTExS.exvalue);
          let obj = Object.create(null);
          for (let [k, v] of kv) {
            obj[k] = v;
          }
          var body = { extra_specs: obj };
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
                  en: "Create extra specification:" + JSON.stringify(obj),
                  zh_cn: "创建扩展规格:" + JSON.stringify(obj)
                },
                target: Vue.logTarget.storage_volume_type
              }
            });
            self.visible = false;
            this.$emit("handleShow", {});
            this.$emit("addData", {});
          } catch (res) {
            self.saving = false;
          }
        }
      });
    },
    originChange(val) {},
    handleChangeKeyType(val) {
      this.createVTExS.key = val
      this.createVTExS.customKey = val === ''
      if (val === 'multiattach') {
        this.createVTExS.exvalue = '<is> True'
      } else {
        this.createVTExS.exvalue = ''
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