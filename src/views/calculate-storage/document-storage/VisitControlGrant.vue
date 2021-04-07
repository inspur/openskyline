<template>
  <el-dialog :title="$t('lang.addTo')" :visible.sync="visible" :before-close="hide">
    <el-form ref="vistGrantForm" :model="allowAccess" label-width="100px" :rules="rules" style="" class="is-required" label-position="right" v-loading="saving">
      <el-form-item :label="$t('storage.level')" prop="aclevel" class="is-required">
        <el-select v-model="allowAccess.aclevel" class="width80">
          <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-tooltip placement="top" trigger="hover" :content="$t('storage.visitReadWriteControlSelect')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
       <el-form-item :label="$t('lang.type')" prop="actype" class="is-required" v-show='true'>
        <el-select v-model="allowAccess.actype" class="width80">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-tooltip placement="top" trigger="hover" :content="$t('storage.visitReadWriteControlTypeSelect')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('storage.visit')" prop="accessTo" class="is-required" v-show='true'>
        <el-input class="width80" v-if="storeType == 'NFS'" v-model="allowAccess.accessTo" auto-complete="off"></el-input>
        <el-select v-else class="width80"  v-model="allowAccess.accessTo" filterable>
          <el-option v-for="item in userOptions" :key="item" :label="item" :value="item"></el-option>
        </el-select>
        <el-tooltip placement="top" trigger="hover" :content="info">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
       </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="hide">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"visitControlGrant",
  data() {
    return {
      allowAccess:{
        aclevel:'',
        actype: '',
        accessTo:"",
        shareId: '',
        protoType: ''
      },
      storeType:"",
      info: this.$t('storage.accessToVisitCert'),
      visible: false,
      saving: false,
      rules: {
        aclevel: [
          { type: 'required', trigger: 'blur change' }
        ],
        actype: [
          { type: 'required', trigger: 'blur change' }
        ],
        accessTo: [
          { type: 'required', trigger: 'blur change' }
        ]
      },
      userOptions:[],
      typeOptions:[{value:"ip", label:'ip'}, {value:"user", label:'user'}, {value:"cert", label:'cert'}],
      levelOptions:[{value:"ro", label:this.$t('storage.readonly')}, {value:"rw", label:this.$t('storage.readWrite')}]
    }
  },
  mounted() {
  },
  methods:{
    show(editData, storeType) {
      this.visible = true;
      this.storeType = storeType;
      this.allowAccess.shareId = editData.id;
      this.allowAccess.protoType = editData.share_proto;
      if (storeType == "NFS") {
        this.typeOptions.splice(1, 2);
      } else {
        this.typeOptions = [{value:"user", label:'user'}];
        this.loadAllUser();
      }
      //this.editShareType.stname = this.editData.name;
    },
    hide() {
      this.visible = false;
      this.$emit("handleShow", {});
    },
    confirmFun() {
       this.$refs.vistGrantForm.validate(async(valid) => {
        if (valid) {
          var projectId = this.$cookie.get('pid');
          //必选项已经填写，发送创建的api
          var body = {"allow_access":{"access_level":this.allowAccess.aclevel, "access_type": this.allowAccess.actype, "access_to": this.allowAccess.accessTo}};
          body = JSON.stringify(body);
          var url = "api/manila/v2/" + projectId + "/shares/" + this.allowAccess.shareId + "/action";
          var type = "post";
          var msg = this.$t('storage.sendAddVisitAccessToSuccess');
          try {
            this.saving = true;
          let ret = await this.$ajax({
            url: url,
            data: body,
            type: type,
            successMsg: msg,
            log:{
              description:{
                en:"Set Share Vist Controller" + this.allowAccess.accessTo,
                zh_cn:"配置文件存储访问控制记录" + this.allowAccess.accessTo
             },
              target:Vue.logTarget.storage_share
            }
          });
          this.saving = false;
          this.$emit("handleShow", {});
          this.$emit("onRefresh", {});
        } catch (data) {
          this.saving = false;
          this.isDisabled = false;
          __DEV__ && console.error(data);
        }
        } else {
          return false;
        }
      });
    },
    async loadAllUser() {
      let self = this;
      let projectId = self.$cookie.get('pid');
      let url = `api/manila/v2/${projectId}/os-user-manage/query_user`;
      try {
        let ret = await self.$ajax({
          type: 'GET',
          url: url
        });
        let user = ret["users"]
        let result = [];
        for (let i = 0; i < user.length; i++) {
          const item = user[i];
          result.push(item["name"]);
        }
        self.userOptions = result;
      } catch (data) {
        this.saving = false;
      }
    },
    originChange(val) {
      }
    }
  }
</script>
<style  scoped>
.width80 {
  width: 80%;
}
</style>
