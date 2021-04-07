<template>
  <div>
    <el-dialog title="Kubeconfig File" :visible.sync="visible" :before-close="cancel" v-dialogDrag size="large">
      <el-form ref="addNodeForm" :model="addNodeForm" class="margin-tb20 me-required-form"  label-width="0px" v-loading="loading">
        <el-form-item label="">
          <el-input type="textarea" class="col-24" v-model="addNodeForm.fileContent" :autosize="{ minRows: 20, maxRows: 100}"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-clipboard:copy="addNodeForm.fileContent" v-clipboard:success="onCopy" v-clipboard:error="onError">{{$t('calcStorLang.pasteContent')}}</el-button>
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import VueClipboard from 'vue-clipboard2';
  Vue.use(VueClipboard);
export default {
  name: "AddNode",
  props: ["clusterId"],
  data() {
    return {
      addNodeForm: {
        fileContent: ""
      },
      visible: true,
      loading: false
    };
  },
  mounted() {
    this.getConfigFile();
  },
  methods: {
    async getConfigFile() {
      let self = this;
      let body = { "rancher_cluster_id": self.clusterId, "role_type": Vue.roleType };
      body = JSON.stringify(body);
      await self.$ajax({
        type: 'POST',
        url:'api/cetus/v1/prom/cluster_config',
        data: body,
        showErrMsg: true,
        successFun(response) {
          let filetext = "";
          filetext = "apiVersion: v1" + "\n";
          filetext+= "clusters: " + "\n";
          filetext+= "- cluster: " + "\n";
          filetext+= "    certificate-authority-data: " + response["ca.crt"] + "\n";
          filetext+= "    server: " + response["server"] + "\n";
          filetext+= "  name: " + response["cluster"] + "\n";
          filetext+= "contexts: " + "\n";
          filetext+= "- context: " + "\n";
          filetext+= "    cluster: " + response["cluster"] + "\n";
          filetext+= "    user: " + response["user"] + "\n";
          filetext+= "  name: " + response["context"] + "\n";
          filetext+= "current-context: " + response["context"] + "\n";
          filetext+= "kind: Config" + "\n";
          filetext+= "preferences: {}" + "\n";
          filetext+= "users: " + "\n";
          filetext+= "- name: " + response["user"] + "\n";
          filetext+= "  user: " + "\n";
          filetext+= "    token: " + response["token"] + "\n";
          self.addNodeForm.fileContent = filetext;
        },
        errFun() {
        }
      });
    },
    onCopy() {
      var self = this;
      self.$message({
        showClose: true,
        message: Vue.t('calcStorLang.copySuccess'),
        type: 'info'
      });
    },
    onError() {
      var self = this;
      self.$message.error( Vue.t('calcStorLang.copyFailed'));
    },
    cancel() {
      this.$emit("cancelShow", {});
    }
  }
};
</script>
