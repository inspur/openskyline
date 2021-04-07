<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" :before-close="handleClose" size="tiny">
  <el-form class="me-required-form " :model="addFaultTypeForm" :rules="rules" ref="addFaultTypeForm" label-width="100px">
      <el-form-item :label="$t('opt.type')" class="is-required" prop="errorType">
        <el-input v-model="addFaultTypeForm.errorType" class="col-20"></el-input>
      </el-form-item>
      <el-form-item :label="$t('opt.description')" prop="descption">
        <el-input type="textarea" v-model="addFaultTypeForm.descption" class="col-20" :rows="5"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('opt.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAdd" :loading="saving">{{$t('opt.submit')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: 'TypeOperate',
  props: ['errorTypeId', 'faultTable'],
  data() {
    return {
      addFaultTypeForm: {
        errorType: '',
        descption: ''
      },
      dialogVisible: false,
      saving: false,
      dialogTitle:'',
      rules: {
        errorType: [
          { type: 'required', trigger: 'blur change' },
          {type: "onlyLetter_MinusNumberChinese"},
          { type: 'maxSize', value: 40 }
        ],
        descption: [
          { trigger: 'blur change' },
          { type: 'maxSize', value: 255 }
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.addFaultTypeForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.initDialog();
  },
  methods: {
    ...mapMutations({
      setOrderInfo: 'setOrderInfo'
    }),
    initDialog() {
      var self = this;
      self.dialogVisible = true;
      if (self.errorTypeId != "") {
         self.dialogTitle = self.$t('opt.editFaultType');
      } else {
        self.dialogTitle = self.$t('opt.createFaultType');
      }
    },
    showData(name, description) {
      this.dialogVisible = true;
      this.addFaultTypeForm.errorType = name;
      this.addFaultTypeForm.descption = description;
    },
    handleCancel() {
      this.$emit("handleShow", {});
    },
    handleClose(done) {
      this.$emit("handleShow", {});
      done();
    },
    async confirmAdd() {
      let me = this;
      this.$refs.addFaultTypeForm.validate(async(valid) => {
        if (valid) {
          me.loading = true;
          me.saving = true;
          let name = this.addFaultTypeForm.errorType;
          let description = this.addFaultTypeForm.descption;
          let url = '';
          let msg = '';
          let body = {};
          let method = '';
          if (this.errorTypeId != "") {
            url = "api/leo/v1/fault/update_fault_type";
            msg = me.$t('opt.modifyFaultType')+ name;
            body = {"id":this.errorTypeId, "name": name, "fault_desc":description};
            body = JSON.stringify(body);
            method = "put";
          } else {
            url = "api/leo/v1/fault/create_fault_type";
            msg = me.$t('opt.createFaultType')+ name;
            body = {"name": name, "fault_desc":description};
            body = JSON.stringify(body);
            method = "post";
          }
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: method,
              successFun(data) {
                if ( data == 305 ) {
                  me.$message({
                    showClose: true,
                    message: me.$t('opt.faultTypeRepeat'),
                    type: 'warning'
                  });
                  me.loading = false;
                } else {
                  me.loading = false;
                  me.$emit("clearSelOption", {});
                  me.$emit("handleShow", {});
                  me.$emit("loadData", {});
                }
              },
              successMsg: msg,
              log:{
                description:{
                  en:this.errorTypeId != ""?"Modify FaultType:"+name:"Create FaultType:"+name,
                  zh_cn:this.errorTypeId != ""?me.$t('opt.modifyfaulttype')+name:me.$t('opt.createfaulttype')+name
                },
                target:Vue.logTarget.Fault_manage
              }
            });
          } catch (data) {
            me.loading = false;
            me.saving = false;
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
