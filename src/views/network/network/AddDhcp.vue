<template>
  <el-dialog :title="$t('base.addTo')+'DHCP Agent'"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <div class="divider clearfix"></div>
    <el-form ref="form" :model="form"  label-width="160px" class="me-required-form margin-tb20">
      <el-form-item :label="$t('network.networkName')" class="is-required">
        <el-input class="col-8" :value="'zjnet0918'+$t('network.OUTER')" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.add')+'DHCP Agent'" class="is-required">
        <el-select v-model="dhcplist" >
          <el-option :label="$t('network.NO_AVAILABLE')+'agents'" value="0"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('base.cancel')}}</el-button>
    	<el-button type="primary" @click="cancel">{{$t('base.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name: 'AddIPAddress',
  data() {
    return {
      dialogVisible: false,
      form: {
      },
      dhcplist: ""
    }
  },
  mounted() {
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      this.$emit("handleAddShow", {});
    }
  }
}
</script>