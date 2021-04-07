<template>
  <el-dialog title="可用域" :visible.sync="dialogVisible" :before-close="handleClose" size="tiny">
    <el-form ref="addResSpecForm" :model="domain" label-width="80px" :rules="rules">
      <el-form-item label="名称" class="is-required" prop="name">
        <el-input v-model="domain.name" class="col-20"></el-input>
      </el-form-item>
      <el-form-item label="是否启用"  class="is-required" prop="enabled">
        <el-switch v-model ="domain.enabled" on-text="是" off-text="否" @change="changeFlagValue"></el-switch>
      </el-form-item>
      <el-form-item label="描述" class="" prop="description">
        <el-input type="textarea" v-model="domain.description" class="col-20" :row="2"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="confirmAdd">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'DomainOperate',
  props: ['domainId', 'umTable'],
  data() {
    return {
      domain: {
        name: '',
        enabled: true,
        description: ''
      },
      dialogVisible: false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 20 }
        ],
        description: [
          { trigger: 'blur change' },
          { type: 'maxSize', value: 200 }
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.addResSpecForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.initDialog();
    if (this.domainId != "") {
       this.initData();
    }
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
              url: 'api/keystone/v3/domains/' + this.domainId,
              type: 'get'
            });
            let result = ret['domain'];
            this.domain.name = result['name'];
            this.domain.enabled = result['enabled'];
            this.domain.description = result['description'];
          } catch (data) {
            this.loading = false;
            __DEV__ && console.error(data);
          }
    },
    handleCancel() {
      this.$emit("handleShow", {});
    },
    handleClose(done) {
      this.$emit("handleShow", {});
      done();
    },
    changeFlagValue(value) {
        this.domain.enabled = value;
    },
    confirmAdd() {
      this.$refs.addResSpecForm.validate(async(valid) => {
        if (valid) {
          this.loading = true;
          let name = this.domain.name;
          let enabled = this.domain.enabled;
          let description = this.domain.description;
          let id = "";
          let url = "api/keystone/v3/domains";
          let type = "post";
          let msg = "成功添加域！";
          if (this.domainId != "") {
             id = this.specUuid;
             url = "api/keystone/v3/domains/" + this.domainId;
             type = "patch";
             msg = "成功修改域！";
          }
          let body = {"domain": {"name": name, "enabled":enabled, "description":description}};
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: type,
              successMsg: msg
            });
            this.loading = false;
            this.$emit("clearSelOption", {});
            this.$emit("handleShow", {});
            this.$emit("getData", {});
          } catch (data) {
            this.loading = false;
            __DEV__ && console.error(data);
          }
        } else {
          return false;
        }
      });
    }
  }
}
</script>
