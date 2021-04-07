<template>
  <el-dialog :title="$t('storage.createSnapshot')" :visible.sync="visible" :before-close="cancelFun">
    <el-form ref="shareSnapshotForm" class="me-required-form" :model="shareSnapshot" label-width="80px" label-position="left" :rules="rules">
      <el-form-item :label="$t('storage.snapshotName')" prop="name" class="is-required">
        <el-input class="col-8" v-model="shareSnapshot.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-8" v-model="shareSnapshot.description" auto-complete="off" type="textarea"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelFun">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"shareSnapshot",
  props: ['editShareData'],
  data() {
    return {
      shareSnapshot:{
        name:"",
        description:""
      },
      size:2,
      visible:true,
      soltFlag:false,
      imageFlag:false,
      saving: false,
      volumeFlag:false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 255 },
          { type: 'onlyLetter_MinusNumber' }
        ],
        description: [
          { type: '', trigger: 'blur change' },
          { type: 'maxSize', value: 255 }
        ]
      }
    }
  },
  mounted() {
  },
  methods:{
    confirmFun() {
       this.$refs.shareSnapshotForm.validate(async(valid) => {
        if (valid) {
          this.saving = true;
          this.loading = true;
          var logVolName = "";
          if (typeof (this.editShareData.name) == "undefined" || null == this.editShareData.name) {
          } else {
            logVolName = this.editShareData.name + "(" + this.editShareData.id + ")";
          }
          let projectId = this.$cookie.get('pid');
          let name = this.shareSnapshot.name;
          let description = encodeURI(this.shareSnapshot.description);
          let vId = this.editShareData.id;
          let oldProjectId = this.editShareData['project_id'];
          let oldUserId = this.editShareData['user_id'];
          let url = "api/manila/v2/" + projectId + "/snapshots";
          let type = "post";
          let msg = this.$t('storage.sendShareStorageSnapshotSuccess');
          let body = {"snapshot": {"name": name, "share_id":vId, "description":description, "force":true}};
          if ("0" == roleType && oldProjectId != projectId) {
            url = "api/manila/v2/" + projectId + "/inspur-snapshots";
            body = {"snapshot": {"name": name, "project_id": oldProjectId, "user_id": oldUserId, "share_id": vId, "description": description, "force": true}};
          }
          body = JSON.stringify(body);
          try {
              let ret = await this.$ajax({
                url: url,
                data: body,
                type: type,
                successMsg: msg,
                log:{
                  description:{
                    en:"Send create share snapshot:" + name + " form share of:" + logVolName,
                    zh_cn:"发送文件存储:" + logVolName + "创建文件存储快照:" + name
                  },
                  target:Vue.logTarget.storage_share
                }
              });
            this.loading = false;
            this.saving = false;
            this.$emit("handleShow", {});
            this.$emit("hrefToSnapshotPage", {});
          } catch (data) {
            this.saving = false;
            this.loading = false;
            __DEV__ && console.error(data);
          }
        } else {
          this.saving = false;
          return false;
        }
      });
    },
    cancelFun() {
      this.$emit("handleShow", {});
    }
  }
}
</script>