<template>
  <el-dialog :title="$t('calcStorLang.privateKeyDetails')" :visible.sync="dialogVisible" :before-close="handleClose" size="tiny">
    <el-form ref="addResSpecForm" label-width="20px">
      <el-form-item label="" class="">
        <el-alert :title="$t('calcStorLang.pleaseSavePrivateKey')" type="info" show-icon :closable="false"></el-alert>
      </el-form-item>
      <el-form-item label="">
        <el-input type="textarea" disabled v-model="key" :autosize="{minRows:2, maxRows:6}" id="privateKeyCon"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" v-clipboard:copy="key" v-clipboard:success="onCopy" v-clipboard:error="onError">{{$t('calcStorLang.pasteContent')}}</el-button>
      <el-button @click="handleCancel">{{$t('lang.close')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import VueClipboard from 'vue-clipboard2';
Vue.use(VueClipboard);
export default {
  name: 'AddKeyPair',
  props: ['privateKeyValue'],
  data() {
    return {
      privateKey: '',
      dialogVisible: false,
      key: ''
    }
  },
  mounted() {
    var self = this;
    self.dialogVisible = true;
    self.key = self.privateKeyValue.priKey;
  },
  methods: {
    handleClose(done) {
      this.$emit("handlerPriKeyShow2", {});
      done();
    },
    handleCancel() {
      this.$emit("handlerPriKeyShow2", {});
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
    copyKey() {
      self.$message({
        showClose: true,
        message: Vue.t('calcStorLang.copySuccess'),
        type: 'info'
      });
    }
  }
}
</script>
<style scoped>
</style>
