<template>
  <el-dialog :title="$t('storage.createSnapshot')" :visible.sync="visible" :before-close="cancelFun" v-dialogDrag>
    <el-form ref="volumeSnapshotForm" class="me-required-form" :model="volumeSnapshot" label-width="90px" label-position="left" :rules="rules">
      <el-form-item :label="$t('storage.snapshotName')" prop="name" class="is-required">
        <el-input class="col-8" v-model="volumeSnapshot.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-8" v-model="volumeSnapshot.description" @keydown.native="noEnter($event)" auto-complete="off" type="textarea"></el-input>
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
  name:"volumeSnapshot",
  props: ['vId', 'detailVolume'],
  data() {
    return {
      volumeSnapshot:{
        name:"",
        description:""
      },
      size:2,
      visible:false,
      soltFlag:false,
      imageFlag:false,
      saving: false,
      volumeFlag:false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 255 },
          { type: 'onlyLetter_MinusNumberChineseSp' }
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
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    //屏蔽回车键事件
    noEnter(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        return false;
      }
    },
    confirmFun() {
       this.$refs.volumeSnapshotForm.validate(async(valid) => {
        if (valid) {
          this.saving = true;
          this.loading = true;
          var logVolName = "";
          if (typeof (this.detailVolume.name) == "undefined" || null == this.detailVolume.name) {
          } else {
            logVolName = this.detailVolume.name + "(" + this.detailVolume.id + ")";
          }
          let projectId = this.$cookie.get('pid');
          let name = this.volumeSnapshot.name;
          let description = this.volumeSnapshot.description;
          let vId = this.vId;
          let oldProjectId = this.detailVolume['os-vol-tenant-attr:tenant_id'];
          let oldUserId = this.detailVolume['user_id'];
          let url = "api/cinderv3/v3/" + projectId + "/snapshots";
          let type = "post";
          let msg = this.$t('storage.sendVolSapshotSuccess');
          let body = {"snapshot": {"name": name, "volume_id":vId, "description":description, "force":true}};
          if (this.detailVolume["status"] == "in-use") {
            if (oldProjectId != projectId) {
              url = "api/cinderv3/v3/" + projectId + "/inspur-snapshots";
              body = {"snapshot": {"name": name, "project_id": oldProjectId, "user_id": oldUserId, "volume_id": vId, "description": description, "force": true, "freeze": true}};
            } else {
              url = "api/cinderv3/v3/" + projectId + "/inspur-snapshots";
              body = {"snapshot": {"name": name, "volume_id": vId, "description": description, "force": true, "freeze": true}};
            }
          }
          if (this.detailVolume.status == "available" && Vue.roleType == "0") {
            if (oldProjectId != projectId) {
              url = "api/cinderv3/v3/" + projectId + "/inspur-snapshots";
              body = {"snapshot": {"name": name, "project_id": oldProjectId, "user_id": oldUserId, "volume_id": vId, "description": description, "force": true, "freeze": true}};
            }
          }
          body = JSON.stringify(body);
          try {
            if (this.detailVolume.status == "in-use") {
              let ret = await this.$ajax({
                url: url,
                confirmMsg: this.$t('storage.createVolSnapShotConfirm'),
                data: body,
                type: type,
                successMsg: msg,
                log:{
                  description:{
                    en:"Send create volume snapshot " + name + " form volume of:" + logVolName,
                    zh_cn:"发送云硬盘" + logVolName + "创建云硬盘快照" + name
                  },
                  target:Vue.logTarget.storage_volume
                }
              });
            } else {
              let ret = await this.$ajax({
                url: url,
                data: body,
                type: type,
                successMsg: msg,
                log:{
                  description:{
                    en:"Send create volume snapshot " + name + " form volume of:" + logVolName,
                    zh_cn:"发送云硬盘" + logVolName + "创建云硬盘快照" + name
                  },
                  target:Vue.logTarget.storage_volume
                }
              });
            }
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