<template>
  <el-dialog
    :title="$t('container.modifyHarbor')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
      <el-form ref="updateHarborForm" :model="updateHarborForm" :rules=rules label-width="100px" class="me-required-form" v-loading="loading">
        <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
          <el-input class="col-12" v-model="updateHarborForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.ipAddress')" prop="ip" class="is-required">
          <el-input class="col-12" v-model="updateHarborForm.ip" auto-complete="off"></el-input>
          <el-tooltip placement="right-start">
            <div slot="content">{{$t('container.harborIPDesc')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('lang.port')" prop="port" class="is-required">
          <el-input class="col-12" v-model="updateHarborForm.port">443</el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.userName')" prop="username" class="is-required">
          <el-input class="col-12" v-model="updateHarborForm.username"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.password')" prop="passwd" class="is-required">
          <el-input class="col-12" type="password" v-model="updateHarborForm.passwd"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.certificate')" prop="harbor_ca" class="is-required">
          <el-input class="col-12" type="textarea" v-model="updateHarborForm.harbor_ca"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.desc')" prop="description">
          <el-input class="col-12" type="textarea" v-model="updateHarborForm.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button @click="updateHarbor" type="primary" :loading="loading">{{$t('lang.confirm')}}</el-button>
      </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "UpdateHarbor",
    props:{
      selectedRowData:{
        type:Object,
        default:function () {
          return {}
        }
      }
    },
    data() {
      return {
        updateHarborForm: {
          name:"",
          ip: "",
          port: "443",
          username: "",
          passwd: "",
          description: "",
          created_at: "",
          harbor_ca: ""
        },
        rules: {
          name: [
            {type: 'required'},
            {type: 'onlyLetterNumber_Chinese'},
            {type: 'maxSize', value:40}
          ],
          ip: [
            {type: 'required'},
            {type: 'ipv4'}
          ],
          username: [
            {type: 'required'},
            {type: 'maxSize', value:40}
          ],
          passwd: [
            {type: 'required'},
            {type: 'maxSize', value:40}
          ],
          port: [
            {type: 'required'},
            {type: 'validatePort'}
          ],
          harbor_ca: [
            {type: 'required'},
            {type: 'no_Chinese_mark'},
            {type: 'maxSize', value:3000}
          ],
          description: [
            {type: 'maxSize', value:255}
          ]
        },
        dialogVisible: true,
        loading:false
      }
    },
    methods: {
      show() {
        this.dialogVisible = true;
        this.initFormData();
      },
      initFormData() {
        let self = this;
        let rowData = self.selectedRowData;
        self.updateHarborForm.name = rowData.name;
        self.updateHarborForm.ip = rowData.ip;
        self.updateHarborForm.port = rowData.port + "";
        self.updateHarborForm.username = rowData.username;
        //self.updateHarborForm.passwd = rowData.passwd;
        self.updateHarborForm.description = rowData.description || "";
        self.updateHarborForm.harbor_ca = rowData.harbor_ca;
        self.updateHarborForm.created_at = rowData.created_at;
      },
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      },
      cancel() {
        var self = this;
        self.dialogVisible = false;
        this.$emit("handleAddShow", {});
      },
      updateHarbor() {
        this.$refs.updateHarborForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            var data = JSON.stringify(this.updateHarborForm);
            let ret = this.$ajax({
              type: 'put',
              url: "api/cetus/v1/harbor/" + this.selectedRowData.id,
              data: data,
              log:{
                description:{
                  en:"Modify container image server:" + this.updateHarborForm.name,
                  zh_cn:"修改容器镜像私服:" + this.updateHarborForm.name
                },
                target:Vue.logTarget.containerImage
              },
              successMsg:this.$t('container.modifySuccessMsg'),
              successFun:() => {
                this.loading = false;
                this.$emit("handleAddShow", {});
                this.$emit("refreshData");
              },
              showErrMsg: false,
              errFun:(err) => {
                this.loading = false;
                let computeFault = err["responseJSON"];
                if (computeFault["computeFault"]["message"] == "X509_ERROR") {
                  this.$notify.error({
                    message: Vue.t('container.X509_ERROR')
                  });
                } else if (computeFault["computeFault"]["message"] == "AUTH_ERROR") {
                  this.$notify.error({
                    message: Vue.t('container.AUTH_ERROR')
                  });
                } else if (computeFault["computeFault"]["message"] == "IP_PORT_ERROR") {
                  this.$notify.error({
                    message: Vue.t('container.IP_PORT_ERROR')
                  });
                } else if (computeFault["computeFault"]["message"] == "HARBOR_SERVER_ERROR") {
                  this.$notify.error({
                    message: Vue.t('container.HARBOR_SERVER_ERROR')
                  });
                } else {
                  this.$notify.error({
                    message: computeFault
                  });
                }
              }
            });
          } else {
            return false;
          }
        });
          console.log(this.selectedRowData);
      }
    }
  }
</script>
<style scoped>

</style>
