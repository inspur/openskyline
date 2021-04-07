<template>
  <el-dialog class="host-dialog" :title="$t('calcStorLang.manageHost')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="addHostForm" :model="host" label-width="100px" :rules="rules">
      <el-form-item label="" prop="" class="is-required">
        <el-transfer
          class="wide-transfer"
          filterable
          v-model="valueT"
          :titles="[$t('calcStorLang.allUsableHost') , $t('calcStorLang.selectedHost')]"
          :data="hosts">
        </el-transfer>
      </el-form-item>
      <el-form-item label="" prop="" class="is-required">
        {{ $t('calcStorLang.manageHostTips') }}
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmHost" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'ManageHost',
  props: ['oldhosts', 'id', 'addedHosts', 'hostName'],
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
      saving: false,
      hosts: [],
      valueT: [],
      host: {
        name: '',
        domain: ''
      },
      dialogVisible: false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 20 }
        ]
      }
    }
  },
  mounted() {
    // this.initForm = Object.assign({}, this.editInstanceForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.initDialog();
    this.loadHosts();
    this.valueT = this.oldhosts;
  },
  methods: {
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
        // self.loading = false;
      }
    },
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    handleCancel() {
      this.$emit("manHandleShow", {});
      this.$emit("getData", {});
    },
    handleClose(done) {
      this.$emit("manHandleShow", {});
      this.$emit("getData", {});
      done();
    },
    confirmHost() {
      var self = this;
      self.saving = true;
      var newhost = self.valueT;
      var ohost = self.oldhosts;
      var addArr = [];
      var deleteArr = [];
      newhost.forEach(function(x, index) {
        if (ohost.indexOf(x) < 0) {
          addArr.push({hostName:x});
        }
      });
      ohost.forEach(function(x, index) {
        if (newhost.indexOf(x) < 0) {
          deleteArr.push({hostName:x});
        }
      });
      self.$sequence({
        type: 'post',
        url: 'api/nova/v2.1/os-aggregates/' + this.id + '/action',
        params: addArr,
        datas:{
          "add_host":{
            "host":"{hostName}"
          }
        },
        log: {
          description: {
            en: "Add host",
            zh_cn: "主机聚合:" + this.hostName + " 添加主机"
          },
          key: "hostName",
          target: Vue.logTarget.hostaggregation
        },
        paramKeys:["hostName"]
      }).then((data) => {
        self.$sequence({
          type: 'post',
          url: 'api/nova/v2.1/os-aggregates/' + this.id + '/action',
          params: deleteArr,
          datas:{
            "remove_host":{
              "host":"{hostName}"
            }
          },
          log: {
            description: {
              en: "Add host",
              zh_cn: "主机聚合:" + this.hostName + " 删除主机"
            },
            key: "hostName",
            target: Vue.logTarget.hostaggregation
          },
          paramKeys:["hostName"]
        }).then((data) => {
          self.$message(Vue.t('lang.addTo') + "/" + Vue.t('calcStorLang.deleteSuccess'));
          self.$emit("manHandleShow", {});
          self.$emit("getData", {});
          self.$emit("reaz", {});
        }).catch((err) => {
          self.saving = false;
          __DEV__ && console.error(err);
          self.$emit("manHandleShow", {});
          self.$emit("getData", {});
        });
      }).catch((err) => {
        self.saving = false;
        __DEV__ && console.error(err);
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