<template>
  <el-dialog
  title="编辑实例"
  :visible.sync="dialogVisible"
  :before-close="handleClose">
    <el-form ref="editInstanceForm" :model="Instance" label-width="100px" :rules="rules">
      <el-form-item  label="名称" class="is-required" prop="name">
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
  name: 'EditInstance',
  props: ['instName'],
  data() {
    return {
      Instance: {
        name: ""
      },
      dialogVisible: false,
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 20}
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.editInstanceForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.Instance.name = this.instName;
      self.dialogVisible = true;
    },
    handleCancel() {
      this.$emit("handleShow", {});
    },
    handleClose(done) {
      this.$emit("handleShow", {});
      done();
    },
    confirmAddIppool() {
      this.$emit("handleShow", {});
    }
  }
}
</script> 