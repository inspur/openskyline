<template>
  <el-dialog class="host-dialog" :title="$t('calcStorLang.create') + $t('calcStorLang.hostAggregation')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="hostCreateForm" class="me-required-form" label-position="left" :model="hostCreateForm" label-width="100px"  :rules="rules">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input v-model="hostCreateForm.name" class="col-8"></el-input>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.az')" prop="domain">
        <el-input v-model="hostCreateForm.domain" class="col-8"></el-input>
      </el-form-item>
      <el-form-item label="" prop="" class="is-required">
        <el-transfer
          class="wide-transfer"
          filterable
          v-model="valueT"
          :titles="[$t('calcStorLang.allUsableHost') , $t('calcStorLang.selectedHost')]"
          :data="hosts">
        </el-transfer>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAddHost" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'AddHost',
  props: ['addedHosts'],
  data() {
    const generateData = _ => {
      const data = [];
      for (let i = 1; i <= 15; i++) {
        data.push({
          key: i,
          label: `node ${i}`,
          disabled: i % 4 === 0
        })
      }
      return data;
    };
    return {
      data: generateData(),
      saving: false,
      valueT: [],
      hostCreateForm: {
        name: '',
        domain: ''
      },
      hosts :[],
      dialogVisible: false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'onlyLetter_MinusNumberChinese' }, //onlyLetter_MinusPointBracketNumberChinese
          { type: 'maxSize', value: 255 }
        ],
        domain: [
          { type: 'onlyLetter_MinusNumberChinese' },
          { type: 'maxSize', value: 255 }
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.hostCreateForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
      self.loadHosts();
    },
    async loadHosts() {
       var self = this;
       self.hosts = [];
       var m = new Map();
       try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-hosts',
          showErrMsg: true
        });
        for (let i = 0; i <= result['hosts'].length; i++) {
          let sg = result['hosts'][i];
          if (sg["service"] != "compute") {
            continue;
          }
          if (m.get(sg["host_name"]) && m.get(sg["host_name"]) != null) {
            continue;
          }
          var name = sg["host_name"];
          self.hosts.push({
            key: name,
            label: name
          });
          m.set(name, name);
        }
      } catch (res) {
      }
    },
    handleCancel() {
      this.$emit("handleShow", {});
      this.$emit("getData", {});
      this.$emit("reaz", {});
    },
    handleClose(done) {
      this.$emit("handleShow", {});
      this.$emit("getData", {});
      this.$emit("reaz", {});
      done();
    },
    confirmAddHost() {
      let self = this;
      self.$refs.hostCreateForm.validate(async(valid) => {
        if (valid) {
          self.saving = true;
          let name = self.hostCreateForm.name;
          let domain = self.hostCreateForm.domain;
          let url = "api/nova/v2.1/os-aggregates";
          let type = "post";
          let msg = Vue.t('calcStorLang.successAdd') + Vue.t('calcStorLang.hostAggregation');
          let body = {};
          if (domain == "") {
            body = {"aggregate": {"name": name}};
          } else {
            body = {"aggregate": {"name": name, "availability_zone": domain}};
          }
          body = JSON.stringify(body);
          try {
            let result = await self.$ajax({
              url: url,
              data: body,
              type: type,
              successMsg: msg,
              log: {
                description: {
                  en: "Add Hoseaggregation:" + name,
                  zh_cn: "创建主机聚合:" + name
                },
                target: Vue.logTarget.hostaggregation
              },
              successFun:async function(response) {
                let hosts = self.valueT;
                if (hosts.length > 0) {
                  let aggId = response.aggregate["id"];
                  var hostIds = [];
                  for (let i = 0; i < hosts.length; i++) {
                    hostIds.push({hostId:hosts[i]});
                  }
                  self.$sequence({
                    type: 'post',
                    url: 'api/nova/v2.1/os-aggregates/' + aggId + '/action',
                    params: hostIds,
                    datas:{
                      "add_host":{
                        "host":"{hostId}"
                      }
                    },
                    paramKeys:["hostId"],
                    log: {
                        description: {
                        en: "Add host",
                        zh_cn: "主机聚合:" + name + " 添加主机"
                        },
                        key: "hostId",
                        target: Vue.logTarget.hostaggregation
                    }
                  }).then((data) => {
                    self.$message(Vue.t('calcStorLang.successAdd') + Vue.t('calcStorLang.host'));
                    self.$emit("handleShow", {});
                    self.$emit("getData", {});
                    self.$emit("reaz", {});
                  }).catch((err) => {
                    self.saving = false;
                    __DEV__ && console.error(err);
                    self.$emit("handleShow", {});
                    self.$emit("getData", {});
                    self.$emit("reaz", {});
                  });
                } else {
                  self.$emit("handleShow", {});
                  self.$emit("getData", {});
                  self.$emit("reaz", {});
                }
              }
            });
          } catch (data) {
            self.saving = false;
            __DEV__ && console.error(e);
          }
        } else {
          return false;
        }
      });
    }
  }
}

</script>

<style scoped>
.wide-transfer >>> .el-transfer-panel {
  width: 460px;
}
.host-dialog >>> .el-dialog {
  width: 1200px;
}
</style>