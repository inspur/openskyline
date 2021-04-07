<template>
  <el-dialog title="更新元数据" :visible.sync="visible" v-dialogDrag>
    <el-form ref="refreshMetadataForm" :model="refreshMetadata" label-width="100px" :rules="rules">
      <el-form-item label="" prop="" class="is-required">
        <el-transfer 
          filterable 
          v-model="valueT"
          :titles="['所有可用主机' , '选中的主机']"
          :data="data">
        </el-transfer>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">取 消</el-button>
      <el-button type="primary" @click="confirmFun">确 定</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"refreshMetadata",
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
      valueT: [1, 4],
      visible:false,
      refreshMetadata: {},
      dialogVisible: false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 20 }
        ],
        domain: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 20 }
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.hostCreateForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.initDialog();
  },
  methods:{
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      let me = this;
      this.$emit("addData");
    },
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    handleCancel() {
      this.$emit("handleShow", {});
    },
    handleClose(done) {
      this.$emit("handleShow", {});
      done();
    }
  }
}
</script>