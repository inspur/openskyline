<template>
  <el-dialog
    :title="$t('container.pushImage')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
      <!-- <el-alert title='推送一个镜像到当前项目的参考命令。' type='info' :closable='false' show-icon></el-alert> -->
      <div class="text-regular module-desc" style="">{{$t('container.pushImageTip')}}</div>
      <el-form ref="imagePushInfoForm" :model="imagePushInfoForm" label-width="170px" label-position="left" class="me-form" style="text-align:left; margin-top:10px;">
        <div class="table_panel">
          <table class="table table-content table-hover idatatable" border="1">
            <tbody>
              <tr class="odd">
                <th class="idatath" style="width:20%">{{$t('container.dockerTag')}}</th>
                <td class="idatatd" style="width:80%">{{imagePushInfoForm.dockerTag}}</td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('container.dockerPush')}}</th>
                <td class="idatatd">{{imagePushInfoForm.dockerPush}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel" type="primary">{{$t('lang.confirm')}}</el-button>
      </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "ImagePushInfo",
    props:{
      serverAddr:String,
      groupName:String
    },
    data() {
      return {
        imagePushInfoForm: {
          dockerTag:"",
          dockerPush: ""
        },
        dialogVisible: true
      }
    },
    methods: {
      show() {
        this.dialogVisible = true;
        this.initFormData();
      },
      initFormData() {
        let self = this;
        let serverIp = self.serverAddr.split(":")[0];
        self.imagePushInfoForm.dockerTag = "docker tag SOURCE_IMAGE[:TAG] " + serverIp + "/" + self.groupName + "/IMAGE[:TAG]";
        self.imagePushInfoForm.dockerPush = "docker push " + serverIp + "/" + self.groupName + "/IMAGE[:TAG]";
      },
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      },
      cancel() {
        var self = this;
        self.dialogVisible = false;
      }
    }
  }
</script>
<style scoped>

</style>