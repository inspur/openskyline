<template>
  <el-dialog
    :title="$t('container.createHarbor')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
      <el-form ref="createHarborForm" :model="createHarborForm" :rules=rules label-width="100px" class="me-required-form" v-loading="loading">
        <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
          <el-input class="col-12" v-model="createHarborForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.ipAddress')" prop="ip" class="is-required">
          <el-input class="col-12" v-model="createHarborForm.ip" auto-complete="off"></el-input>
          <el-tooltip placement="right-start">
            <div slot="content">{{$t('container.harborIPDesc')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('lang.port')" prop="port" class="is-required">
          <el-input class="col-12" v-model="createHarborForm.port"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.userName')" prop="username" class="is-required">
          <el-input class="col-12" v-model="createHarborForm.username"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.password')" prop="passwd" class="is-required">
          <el-input class="col-12" type="password" v-model="createHarborForm.passwd"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.certificate')" prop="harbor_ca" class="is-required">
          <el-input class="col-12" type="textarea" v-model="createHarborForm.harbor_ca"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.desc')" prop="description">
          <el-input class="col-12" type="textarea" v-model="createHarborForm.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button @click="createHarbor" type="primary" :loading="loading">{{$t('lang.confirm')}}</el-button>
      </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "CreateHarbor",
    data() {
      return {
        createHarborForm: {
          name:"",
          ip: "",
          port: "443",
          username: "",
          passwd: "",
          harbor_ca: "",
          description:""
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
    mouted() {
       // this.initForm = Object.assign({}, this.createHarborForm);
    },
    methods: {
      show() {
        this.dialogVisible = true;
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
      createHarbor() {
        this.$refs.createHarborForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            let data = JSON.stringify(this.createHarborForm);
            let ret = this.$ajax({
              type: 'post',
              url: "api/cetus/v1/harbor",
              data: data,
              log:{
                description:{
                  en:"Add container image server:" + this.createHarborForm.name,
                  zh_cn:"添加容器镜像私服:" + this.createHarborForm.name
                },
                target:Vue.logTarget.containerImage
              },
              successMsg:this.$t('container.createSuccessMsg'),
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
      }
    }
  }
</script>
