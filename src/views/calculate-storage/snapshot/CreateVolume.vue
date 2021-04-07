<template>
  <el-dialog :title="$t('storage.createVolume')" :visible.sync="visible" :before-close="hide">
    <el-form ref="newVolumeForm" class="me-required-form" :model="newVolume" label-width="100px" :rules="rules">
      <el-form-item :label="$t('lang.project')" prop="project" class="is-required">
         <el-input auto-complete="off" v-bind:style="widthStyle" :disabled="true" v-model="newVolume.volumeProjectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.user')" prop="project" class="is-required" v-show="roleType=='0'">
        <el-select v-model="newVolume.userId" v-bind:style="widthStyle" filterable >
          <el-option v-for="item in userList" :key="item.id" :label="getSelectOptionName(item.name)" :value="item.id" :title="item.name.length > 80?item.name:''">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="newVolume.name" auto-complete="off" v-bind:style="widthStyle"></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.number')" prop="count" class="is-required">
        <el-row v-bind:style="widthStyle">
          <el-col :span="6">
             <el-input-number v-model="newVolume.count" :min="1" :max="100" size="small" ></el-input-number>
          </el-col>
          <el-col :span="15">
            <el-progress :text-inside="true" :stroke-width="18" :percentage="countpercentage"  v-bind:style="{top:'10px'}"></el-progress>
          </el-col>
          <el-tooltip placement="top" trigger="hover" :content="$t('storage.maxSizevolNumOnceCreate')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-row>
        <el-row>
          <el-col :span="30">
            <div class="sub-tittle">{{$t('storage.total')}}{{totalCount}}{{$t('storage.pc')}}，{{$t('storage.used')}}{{inUsedCount}}{{$t('storage.pc')}}，{{$t('storage.surplus')}}{{freeCount}}{{$t('storage.pc')}}</div>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item :label="$t('storage.capabilityGB')" prop="capacity" class="is-required">
        <el-row v-bind:style="widthStyle">
          <el-col :span="6">
             <el-input-number v-model="newVolume.size" :min="minsize" :max="totalCapacity" size="small" ></el-input-number>
          </el-col>
          <el-col :span="15">
            <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage" :status="proStatus" v-bind:style="{top:'10px'}"></el-progress>
          </el-col>     
        </el-row>
        <el-row>
          <el-col :span="8">
            <div class="sub-tittle">{{$t('storage.total')}}{{totalSize}}GB，{{$t('storage.used')}}{{usedSize}}GB，{{$t('storage.surplus')}}{{freeSize}}GB</div>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-8" v-model="newVolume.description" auto-complete="off" type="textarea" v-bind:style="widthStyle" ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="hide">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"CreateVolume",
  props: ["volumSoltId", "projectId", "projectMap", "soltSize", "volumSoltName"],
  data() {
    return {
      newVolume:{
        name:"",
        user:"",
        userId:"",
        description:"",
        count:1,
        size:0,
        volumeProjectName:""
      },
      userList: [],
      visible:true,
      roleType: Vue.roleType + "",
      isDisabled: false,
      minsize: soltSize,
      maxCount: 1,
      totalCount: 0,
      inUsedCount: 0,
      freeCount: 0,
      inUsedOldCount: 0,
      totalCapacity: 1,
      totalSize: '',
      totalInfinite: false,
      usedSize: 0,
      freeSize: 0,
      usedOldSize: 0,
      widthStyle:{
        width:"85%"
      },
      countpercentage:0,
      countproStatus:"success",
      percentage:0,
      proStatus:"success",
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 255 },
          { type: 'onlyLetter_MinusNumberChineseSp' }
        ],
        count: [
          { type: 'required', trigger: 'blur change' }
        ],
        size: [
          {type: 'required'}
        ],
        description: [
          { type: 'maxSize', value: 255 }
        ]
      }
    }
  },
  mounted() {
    var self = this;
    console.log("1");
    self.newVolume.name = this.volumSoltName;
    self.newVolume.size = this.soltSize;
    self.newVolume.volumeProjectName = this.projectMap.name;
    self.getCountValue();
    self.loadUserList();
  },
  methods:{
    async loadUserList() {
      var self = this;
      self.loading = true;
      self.userList = [];
      var roleType = Vue.roleType + "";
      var projectId = self.projectId;
      var url = "api/keystone/v3/users";
      url = "api/keystone/v3/inspur/users?domain_id=default";
      if ("" != projectId && "0" != projectId) {
        url += "&project_id=" + projectId;
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        var users = result['users'];
        self.loading = false;
        self.userList = result['users'];
      } catch (res) {
        self.loading = false;
      }
    },
    async getCountValue() {
      var self = this;
      var projectId = this.projectId;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + self.$cookie.get("pid") + "/os-quota-sets/" + projectId + "?usage=true"
        });
        var data = ret['quota_set'].volumes;
        if (data['limit'] == "-1") {
          self.maxCount = 131072;
          self.totalCount = this.$t('storage.infinite');
          self.inUsedCount = data['in_use'];
          self.freeCount = this.$t('storage.infinite');
          self.countpercentage = 0;
        } else {
          self.maxCount = data['limit'] - data['in_use'];
          self.totalCount = data['limit'];
          self.inUsedCount = data['in_use'];
          self.freeCount = self.totalCount - self.inUsedCount;
          self.countpercentage = ((data['in_use']/data['limit']) * 100).toFixed(2) * 1;
        }
        //容量
        var data2 = ret['quota_set'].gigabytes;
        if (data2['limit'] == "-1") {
           self.totalSize = this.$t('storage.infinite');
           self.totalInfinite = true;
           self.usedSize = data2['in_use'];
           self.freeSize = this.$t('storage.infinite');
           self.percentage = 0;
           self.totalCapacity = 131072;
        } else {
           var size = data2.limit;
           self.totalSize = size;
           self.totalInfinite = false;
           self.usedSize = data2['in_use'];
           self.freeSize = size - data2['in_use'];
           self.percentage = ((data2['in_use']/size)*100).toFixed(2) * 1;
           self.totalCapacity = parseInt(size-data2['in_use']);
        }
        self.inUsedOldCount = self.inUsedCount;
        self.usedOldSize = self.usedSize;
      } catch (data) {
      }
    },
    getSelectOptionName(value) {
      if (typeof (value) == "undefined" || null == value) {
        return value;
      }
      if (value.length > 80) {
        return value.substring(0, 80);
      }
      return value;
    },
    confirmFun() {
      this.$refs.newVolumeForm.validate(async(valid) => {
        if (valid) {
          this.isDisabled = true;
          let name = this.newVolume.name;
          let userId = this.newVolume.userId;
          let projectIdPar = this.$cookie.get('pid');
          let projectId = this.projectId;
          let count = this.newVolume.count;
          let size = this.newVolume.size;
          let description = this.newVolume.description;
          if ("0" == roleType) {
            if (!userId) {
                this.$message({
                    showClose: true,
                    message:  Vue.t('storage.userNotNull'),
                    type: 'warning'
                 });
                 this.isDisabled = false;
                 return;
             }
          }
          if (!Number.isInteger(size)) {
            this.$message({
                    showClose: true,
                    message: Vue.t('storage.capaMustBeInit'),
                    type: 'warning'
                 });
                 this.isDisabled = false;
                 return;
          }
          if (!Number.isInteger(this.newVolume.count)) {
            this.$message({
                    showClose: true,
                    message: Vue.t('storage.numMustBeInit'),
                    type: 'warning'
                 });
                 this.isDisabled = false;
                 return;
          }
          if (this.soltSize > size) {
                //快照大小大于卷的大小
                this.$message({
                    showClose: true,
                    message: Vue.t('storage.volCapaLessThanShot'),
                    type: 'warning'
                 });
                 this.isDisabled = false;
                 return;
          }
             let body; //= {"volume": {"name": name, "size": size, "description": description, "snapshot_id": this.volumSoltId}};
             if ("0" == roleType) {
              body = {"volume": {"name": name, "size": size, "description": description, "snapshot_id": this.volumSoltId, "project_id": projectId, "user_id": userId}};
             } else {
              body = {"volume": {"name": name, "size": size, "description": description, "snapshot_id": this.volumSoltId}};
             }

          let url = "api/cinderv3/v3/" + projectIdPar + "/inspur-volumes";
          let type = "post";
          let msg = this.$t('storage.createVolSuccess');
          if (!this.totalInfinite) {
            if ((size * this.newVolume.count) > this.freeSize) {
              this.$message({
                    showClose: true,
                    message: Vue.t('storage.freeCapabilityNotEnough'),
                    type: 'warning'
                 });
                 this.isDisabled = false;
                 return;
            }
          }
          if (this.freeCount != this.$t('storage.infinite')) {
            if (this.newVolume.count > this.freeCount) {
              this.$message({
                    showClose: true,
                    message: Vue.t('storage.freeNumNotEnough'),
                    type: 'warning'
                 });
                 this.isDisabled = false;
                 return;
            }
          }
          if (this.newVolume.count == 1) {
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: type,
              successMsg: msg,
              log:{
                description:{
                  en:"Create volume:" + name + " from volume snaphsot " + this.volumSoltName + "(" + this.volumSoltId + ")",
                  zh_cn:"自云硬盘快照" + this.volumSoltName + "(" + this.volumSoltId + ")" + "创建云硬盘:" + name
                },
                target:Vue.logTarget.storage_volume
              }
            });
            this.$emit("handleAddShow", {});
            this.$emit("onRefresh", {});
            this.$emit("hrefToVolumeListPage", {});
            /*this.$emit("handleShow", {});
            this.$emit("getData", {});*/
          } catch (data) {
            this.loading = false;
            this.isDisabled = false;
            __DEV__ && console.error(data);
          }
          } else {
              var disknames = [];
              var tempName = "";
              for (let i = 0; i < this.newVolume.count; i++) {
                tempName = name + "-" + (i + 1);
                if (tempName.length > 255) {
                  this.$message({
                    showClose: true,
                    message: Vue.t('storage.volNameMaxSize'),
                    type: 'warning'
                  });
                  this.isDisabled = false;
                 return;
                }
                disknames.push({diskname:name + "-" + (i + 1)});
              }
              body.volume['name'] = "{diskname}";
              // body = JSON.stringify(body);
              try {
                  this.$sequence({
                     type: 'post',
                     url: url,
                     params: disknames,
                     datas:body,
                     paramKeys:["diskname"],
                     log: {
                       description: {
                        en: " from volume snaphsot " + this.volumSoltName + "(" + this.volumSoltId + ")create volume",
                        zh_cn: "自云硬盘快照" + this.volumSoltName + "(" + this.volumSoltId + ")" + "创建云硬盘"
                        },
                       key: "diskname",
                       target: Vue.logTarget.storage_volume
                       }
                  }).then((data) => {
                     this.$message(Vue.t('storage.createVolSuccess'));
                     this.$emit("handleAddShow", {});
                     this.$emit("onRefresh", {});
                     this.$emit("hrefToVolumeListPage", {});
                     /*this.$emit("handleShow", {});
                     this.$emit("getData", {});*/
                  }).catch((err) => {
                    this.loading = false;
                    this.isDisabled = false;
                    console.log(err);
                  });
                 } catch (data) {
                  this.loading = false;
                  this.isDisabled = false;
                  __DEV__ && console.error(data);
                 }
          }
          /*body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: type,
              successMsg: msg,
              log:{
                description:{
                  en:"Create volume: " + name + " from volume snaphsot " + this.volumSoltName + "(" + this.volumSoltId + "(",
                  zh_cn:"自云硬盘快照" + this.volumSoltName + "(" + this.volumSoltId + "(" + "创建云硬盘:" + name
                },
                target:Vue.logTarget.storage_volume
              }
            });
            this.$emit("handleAddShow", {});
            this.$emit("onRefresh", {});
            this.$emit("hrefToVolumeListPage", {});
          } catch (data) {
            this.isDisabled = false;
            __DEV__ && console.error(data);
          }*/
        } else {
          this.isDisabled = false;
          return false;
        }
      });
    },
    hide() {
      this.$emit("handleAddShow", {});
    }
  }
}
</script>