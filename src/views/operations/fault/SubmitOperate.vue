<template>
  <el-dialog :title="$t('opt.fault')" :visible.sync="dialogVisible" :before-close="handleClose" size="tiny">
    <el-form class="me-required-form" ref="addFaultListForm" label-width="80px" :rules="rules" :model="addFaultListForm">
      <el-form-item :label="$t('opt.type')" prop="faultType" class="is-required">
        <el-select class="col-20" v-model="addFaultListForm.faultType">
          <el-option :label="item.errorType" :value="item.errorTypeId" v-for="(item, index) in faultTypeList" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('opt.faultLevel')" prop="faultLevel" class="is-required">
        <el-select class="col-20" v-model="addFaultListForm.faultLevel">
          <el-option :label="$t('opt.serious')" value="1"></el-option>
          <el-option :label="$t('opt.commonly')" value="2"></el-option>
          <el-option :label="$t('opt.slight')" value="6"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('opt.description')" prop="remarks" class="is-required">
        <el-input type="textarea" v-model="addFaultListForm.remarks" class="col-20" :row="2"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('opt.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAdd" :loading="saving">{{$t('opt.reference')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'SubmitOperate',
  props: ['submitTable'],
  data() {
    return {
      addFaultListForm: {
        remarks: '',
        descption: '',
        faultLevel: '',
        faultType: ''
      },
      dialogVisible: false,
      saving: false,
      faultTypeList: [],
      rules: {
        faultType: [
          { type: 'required', trigger: 'blur change' }
        ],
        faultLevel: [
          { type: 'required', trigger: 'blur change' }
        ],
        descption: [
          { trigger: 'blur change' },
          { type: 'maxSize', value: 255 }
        ],
        remarks: [
          {type: 'required', trigger: 'blur change'},
          { type: 'maxSize', value: 255 }
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.addFaultListForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
      this.getFaultType();
    },
    async getFaultType() {
      let data = {
        page:"1",
        pageSize: "10000",
        order: "desc"
      };
      let res = await this.$ajax({
        url: "api/leo/v1/fault",
        type: 'get'
      });
      let ret = res.data;
      for (let i = 0; i < ret.length; i++) {
        let obj = {};
        obj.errorTypeId = ret[i].id;
        obj.errorType = ret[i].name;
        this.faultTypeList.push(obj);
      }
    },
    handleCancel() {
      this.$emit("handleShow", {});
    },
    handleClose(done) {
      this.$emit("handleShow", {});
      done();
    },
    async confirmAdd() {
      var self = this;
      this.$refs.addFaultListForm.validate(async(valid) => {
        if (valid) {
          self.saving = true;
          let businessType = this.addFaultListForm.faultType;
          let level = this.addFaultListForm.faultLevel;
          let orderData = {
           "fault_type" : businessType,
           "projectId" : self.$cookie.get("pid"),
           "fault_level" : level
          };
          let notes = this.addFaultListForm.remarks;
          let url = "api/leo/v1/order/create_order";
          let msg = this.$t('opt.successSubmitFault');
          let body = {
            "op_desc": notes,
            "order_data":JSON.stringify(orderData),
            "applicant_id": Vue.userId,
            "applicant_role": Vue.roleType + "",
            "resource_type":"FAULT",
            "order_type":"WORKORDER",
            "project_id":self.$cookie.get("pid")};
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: 'post',
              successMsg: msg,
              log:{
                description:{
                  en:"Create Fault",
                  zh_cn:self.$t('opt.createFault')
                },
                target:Vue.logTarget.Fault_manage
              }
            });
            this.$emit("clearSelOption", {});
            this.$emit("handleShow", {});
            this.$emit("loadData", {});
          } catch (data) {
            self.saving = false;
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
