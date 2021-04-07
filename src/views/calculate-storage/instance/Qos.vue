<template>
  <el-dialog title="Qos" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="editInstanceForm" :model="Instance" label-width="100px" :rules="rules">
      <el-form-item label="名称" class="is-required" prop="name">
        <el-input v-model="Instance.name" class="col-8"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="confirmAddIppool">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'Qos',
  data() {
    return {
      Instance: {
        name: ""
      },
      dialogVisible: false,
      rules: {
        name: []
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.editInstanceForm);
    this.initDialog();
    this.initData();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    async initData() {
      var self = this;
      try {
        let ret = await this.$ajax({
          url: 'api/nova/v2.1/limits',
          // data: body,
          type: 'get'
          // successMsg: "成功添加密钥对！"
        });
        this.loading = false;
        let result = ret['limits'];
        this.Instance.name = result['absolute'].maxTotalCores;
      } catch (data) {
        this.loading = false;
        __DEV__ && console.error(data);
      }
    },
    handleCancel() {
      this.$emit("handleQosFlag", {});
    },
    handleClose(done) {
      this.$emit("handleQosFlag", {});
      done();
    },
    confirmAddIppool() {
      this.$emit("handleQosFlag", {});
    }
  }
}

</script>
