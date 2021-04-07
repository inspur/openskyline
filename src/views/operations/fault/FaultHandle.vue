<template>
  <div>
    <el-dialog :title="$t('opt.faultHandle')" :visible.sync="dialogVisible" @open="openFun" :before-close="handleClose" >
      <el-card>
        <div>
          <el-form label-width="125px" class="me-required-form" :model="faultListForm" ref="faultListForm">
            <el-form-item :label="$t('opt.oddNumber')" prop="businessNum" style="margin-bottom:3px">
              <el-input class="col-24" auto-complete="off" disabled size="middle" v-model="faultListForm.businessNum"></el-input>
            </el-form-item>
            <el-form-item :label="$t('opt.handleFeedback')" prop="notes" style="margin-bottom:2px">
              <el-row>
                <el-col>
                  <div id="editorElem" v-model="faultListForm.notes"></div>
                </el-col>
              </el-row>
              <span>{{faultListForm.note_describe}}</span>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit" :loading="isDisabled" v-show="isNotAdmin()">{{$t('opt.reference2')}}</el-button>
        <el-button @click="handleCancel">{{$t('opt.close')}}</el-button>
        <el-button type="primary" @click="handleReceive" :loading="isDisabled">{{$t('opt.submit')}}</el-button> 
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { mapGetters, mapMutations } from 'vuex';
  import E from 'wangeditor';
  export default {
    name:"handleFault",
    components: {},
    data() {
      return {
        dialogVisible: false,
        isDisabled: false,
        editor:null,
        faultListForm:{
          businessId: "",
          businessNum: "",
          note_describe: this.$t('opt.nameAndOpinion'),
          notes: this.$t('opt.templateContent')
        }
      }
    },
    mounted () {
      var self = this;
      self.dialogVisible = true;
    },
    methods: {
      ...mapMutations({
        setOrderInfo: 'setOrderInfo'
      }),
      async getOrderNum () {
        var self = this;
        var approverId = Vue.userId;
        var projectId = "";
          if (Vue.roleType == "0") {
            projectId = "";
          } else {
            projectId = this.$cookie.get('pid');
        };
        var params = {
          "approver_id": approverId,
          "role_type": Vue.roleType,
          "project_id": projectId
        };
        params = JSON.stringify(params);
        var approvingOrderNum;
        var approvingFaultNum;
        try {
          let ret = await self.$ajax({
            type: "PUT",
            data: params,
            polling: true,
            url: "api/leo/v1/order/get_approve_order_amount"
          });
          approvingOrderNum = ret.data.flow_order_approve_amount;
          approvingFaultNum = ret.data.work_order_approve_amount;
        } catch (res) {
          console.log(self.$t('opt.getFaultNumberFailed'));
        };
        self.setOrderInfo({faultNum: approvingOrderNum, orderNum: approvingFaultNum});
      },
      isNotAdmin() {
        var roleType = Vue.roleType + "";
        if ("2" == roleType || "3" == roleType) {
          return true;
        }
        return false;
      },
      handleCancel() {
        this.$emit("handleShow", {});
      },
      handleClose(done) {
        this.$emit("handleShow", {});
      },
      show() {
        this.dialogVisible = true;
      },
      hide() {
        this.dialogVisible = false;
      },
      openFun() {
        this.$nextTick(() => {
          document.getElementById('editorElem').innerHTML = '';
          var editor = new E('#editorElem');
          editor.customConfig.menus = [
            'head', //标题
            'bold',
            "italic",
            "underline",
            "strikeThrough",
            "foreColor",
            "backColor",
            "link",
            "justify",
            "undo",
            "redo"
          ];
          editor.create();
          this.editor = editor;
          editor.txt.html(this.faultListForm.notes);
        });
      },
      async handleReceive() {
        var self = this;
        let text = this.editor.txt.text();
        if (text) { //处理空格
          text = text.replace(/&nbsp;/g, '').trim();
        }
        if (text.length>255) {
          this.$message({
            message: Vue.t('opt.handleFeedbackLength'),
            type: "warning"
          });
          return;
        }
        self.isDisabled = true;
        let reqdata = {
          "order_id":self.faultListForm.businessId,
          "approver_id":Vue.userId,
          "approver_role":Vue.roleType + "",
          "approver_result":"HANDLED",
          "approve_opinion":this.editor.txt.html()
        };
        try {
          let ret = await this.$ajax({
            type: 'put',
            url: "api/leo/v1/order/handle_fault_order",
            data:JSON.stringify(reqdata),
            success: function(result) {
              self.$message.success(Vue.t('opt.faultHandledSuccess'));
              let parentPath = self.$route.matched[2].path;
              self.$router.push({
                path: '/operations/fault/handling'
              });
              self.loading = false;
            },
            log:{
              description:{
                en:"Confirm FaultType:"+self.faultListForm.businessNum,
                zh_cn:self.$t('opt.confirmFault')+self.faultListForm.businessNum
              },
              target:Vue.logTarget.Fault_manage
            }
          });
          this.loading = false;
          self.isDisabled = false;
          this.getOrderNum();
        } catch (data) {
          this.loading = false;
          self.isDisabled = true;
        }
        this.$emit("handleShow", {});
        this.$emit("onRefresh", {});
        this.$emit("clearSelOption", {});
      },
      async handleSubmit() {
        var self = this;
        let text = this.editor.txt.text();
        if (text) { //处理空格
          text = text.replace(/&nbsp;/g, '').trim();
        }
        if (text.length>255) {
          this.$message({
            message: Vue.t('opt.handleFeedbackLength'),
            type: "warning"
          });
          return;
        }
        self.isDisabled = true;
        let reqdata = {
          "order_id":self.faultListForm.businessId,
          "approver_id":Vue.userId,
          "approver_role":Vue.roleType + "",
          "approver_result":"COMMIT",
          "approve_opinion":this.editor.txt.html()
        };
        try {
          let ret = await this.$ajax({
            type: 'put',
            url: "api/leo/v1/order/handle_fault_order",
            data:JSON.stringify(reqdata),
            success: function(result) {
              self.$message.success(Vue.t('opt.faultCommitSuccess'));
              let parentPath = self.$route.matched[2].path;
              self.$router.push({
                path: '/operations/fault/handling'
              });
              self.loading = false;
            },
            log:{
              description:{
                en:"Commit Fault:"+self.faultListForm.businessNum,
                zh_cn:self.$t('opt.commitFault')+self.faultListForm.businessNum
              },
              target:Vue.logTarget.Fault_manage
            }
          });
          this.getOrderNum();
          this.loading = false;
          self.isDisabled = false;
        } catch (data) {
          this.loading = false;
          self.isDisabled = true;
        }
        this.$emit("handleShow", {});
        this.$emit("onRefresh", {});
        this.$emit("clearSelOption", {});
      }
    }
  }
</script>
<style scoped>
</style>
