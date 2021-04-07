<template>
  <el-dialog :title="$t('storage.createShareStorage')" :visible.sync="visible" :before-close="cancelFun">
    <el-form ref="createShareStorageForm" :model="createShareStorage" v-loading="loading" label-width="100px" label-position="left" :rules="rules" class="me-required-form">
      <el-form-item :label="$t('lang.project')" prop="project" class="is-required">
        <el-select v-model="createShareStorage.project" v-bind:style="widthStyle" :disabled="roleType=='2'|| roleType=='3'">
          <el-option v-for="item in proList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="createShareStorage.name" auto-complete="off" v-bind:style="widthStyle"></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.shareStorageType')" prop="type" class="is-required">
        <el-select v-model="createShareStorage.type" v-bind:style="widthStyle" :disabled="isImageFlag==false || soltFlag == true">
          <el-option v-for="item in shareTypeList" :key="item.id" :title="item.name" :label="item.name.length>20?item.name.substring(0, 20) + '...':item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.number')" prop="count" class="is-required">
        <el-row v-bind:style="widthStyle">
          <el-col :span="6">
             <el-input-number v-model="createShareStorage.count" :min="1" :max="100" size="small" :disabled ="!!!isUser()"></el-input-number>
          </el-col>
          <el-col :span="15">
            <el-progress :text-inside="true" :stroke-width="18" :percentage="countpercentage"  v-bind:style="{top:'10px'}" :status="countproStatus"></el-progress>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="30">
            <div class="sub-tittle">{{$t('storage.total')}}{{quota.totalC}}{{$t('storage.pc')}}, {{$t('storage.used')}}{{quota.in_useC}}{{$t('storage.pc')}}</div>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item :label="$t('storage.capabilityGB')" prop="size" class="is-required">
        <el-row>
          <el-col :span="5">
             <el-input-number v-model="createShareStorage.size" :min="1" :max="999999" size="small" ></el-input-number>
          </el-col>
          <el-col :span="12">
            <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage" :status="proStatus" v-bind:style="{top:'8px'}"></el-progress>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <div class="sub-tittle">{{$t('storage.total')}}{{quota.totalGB}}GB，{{$t('storage.haveUsed')}}{{quota.in_useGB}}GB</div>
          </el-col>
        </el-row>
        <!-- <el-slider v-model="size" show-input v-bind:style="widthStyle" @change="sizeChange"></el-slider> -->
      </el-form-item>
      <!-- <el-form-item label="路径" prop="export" class="is-required">
        <el-input class="col-8" v-model="createShareStorage.export" auto-complete="off" v-bind:style="widthStyle" placeholder="例如：/shares/doc"></el-input>
      </el-form-item> -->
      <el-form-item :label="$t('storage.protocol')" prop="protocol" class="is-required">
        <el-select v-model="createShareStorage.protocol" v-bind:style="widthStyle">
          <el-option v-for="item in protocolOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-collapse class="col-24">
      <el-collapse-item title="高级选项" name="11"> -->
      <el-form-item :label="$t('storage.origin')" prop="origin" class="is-required" v-if="isImageFlag">
        <el-select v-model="createShareStorage.origin" @change="originChange" v-bind:style="widthStyle">
          <el-option v-for="item in originOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.shareStorageSnapshot')" prop="solt" class="is-required" v-if="soltFlag">
        <el-select v-model="createShareStorage.solt" v-bind:style="widthStyle" filterable clearable @change="originSolfChange">
          <el-option v-for="item in soltOptions" :key="item.id" :value="item.id" :label="item.name" :title="getSelectOptionTitle(item.name)">
            <span style="float:left">{{getSelectOptionName(item.name)}}</span>
            <span style="float:left;color:#8492a6;">{{item.size}}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="云硬盘快照" prop="solt" class="is-required" v-show="soltFlag">
        <el-select v-model="newVolume.solt" v-bind:style="widthStyle" filterable clearable>
          <el-option v-for="item in soltOptions" :key="item.id" :value="item.id" :label="item.name" :title="getSelectOptionTitle(item.name)">
            <span style="float:left">{{getSelectOptionName(item.name)}}</span>
            <span style="float:left;color:#8492a6;">{{item.size}}</span>
          </el-option>
        </el-select>
      </el-form-item> -->
     <!--  </el-collapse-item></el-collapse> -->
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-8" v-model="createShareStorage.description" auto-complete="off" type="textarea" v-bind:style="widthStyle"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelFun" :disabled="isDisabled">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="loadingBtn">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"createShareStorage",
  props: ["snapshotId"],
  data() {
    return {
      createShareStorage:{
        project:this.$cookie.get('pid'),
        user:"",
        domain:"",
        name:"",
        description:"",
        count: 1,
        type:"",
        size:1,
        origin:"1",
        volumes:"",
        image:"",
        protocol:"",
        solt:"",
        export:""
      },
      quota: {
        totalGB:0,
        in_useGB:0,
        totalC:0,
        in_useC:0
      },
      loading: false,
      loadingBtn: false,
      isDisabled: false,
      visible: true,
      size:2,
      maxCapacity:0,
      shareTypeList:[],
      isImageFlag:true,
      soltFlag:false,
      imageFlag:false,
      volumeFlag:false,
      roleType: Vue.roleType + "",
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'onlyLetter_MinusNumber' },
          { validator: (rule, value, cb) => {
            if (this.createShareStorage.count > 1 && value.length > 251) {
              cb(this.$t("validation.maxSizes", 251));
            } else if (this.createShareStorage.count <= 1 && value.length > 255) {
              cb(this.$t("validation.maxSizes", 255));
            } else {
              cb();
            }
          }}
        ],
        description: [
          { type: 'maxSize', value: 255 },
          { type: 'no_Chinese_mark' }
        ],
        user: [
          {type: 'required'}
        ],
        size: [
          { type: 'required', trigger: 'blur change' },
          { type: 'integer' }
        ],
        count: [
          { type: 'required', trigger: 'blur change' },
          { type: 'integer' }
        ],
        protocol: [
          {type: 'required'}
        ],
        type: [
          {type: 'required'}
        ]
      },
      widthStyle:{
        width:"80%"
      },
      proList:[],
      protocolOptions:[{value:'nfs', label:'NFS'}, {value:'cifs', label:'CIFS'}],
      typeOptions:[{value:'1', label:'share类型'}],
      originOptions:[{value:'1', label:this.$t('lang.add')}, {value:'2', label:this.$t('storage.shareStorageSnapshot')}],
      soltOptions:[],
      soltMap: new Map(),
      imageOptions:[{value:'1', label:'镜像'}],
      volumesOptions:[{value:'1', label:'卷'}],
      countpercentage:50,
      countproStatus:"success",
      percentage:50,
      proStatus:"success"
    }
  },
  watch: {
    createShareStorage: {
      deep: true,
      handler: function(list) {
        this.$refs.createShareStorageForm.validateField("name");
      }
    }
  },
  mounted() {
    let self = this;
    self.loading = true;
    self.disabled = false;
    this.loadProjectQuota();
    this.loadShareTypeList();
    var roleType = Vue.roleType + "";
    if ("0" == roleType) {
      this.getProjectList();
    } else if ("2" == roleType || "3" == roleType) {
      this.getSoltOptions();
      this.proList = Vue.projectList.filter(item => item.id === self.$cookie.get('pid') && item["roleId"] != "SuperAdmin");
    }
  },
  methods:{
    isUser() {
      var roleType = Vue.roleType + "";
      if ("3" == roleType) {
        return false;
      }
      return true;
    },
    async getSoltOptions() {
      var self = this;
      var resultData = [];
      var projectId = this.$cookie.get('pid');
      var selectProjectId = self.createShareStorage.project;
      let data = [];
      //判断是否为超级管理员
      var roleType = Vue.roleType + "";
      var url = "api/manila/v2/" + projectId+ "/snapshots/detail?all_tenants=True";
      if ("2" == roleType || "3" == roleType) { //超级
          url= "api/manila/v2/" + projectId+ "/snapshots/detail";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });

        let snapshots = result['snapshots'];
        this.soltMap = new Map();
        for (var i = 0; i < snapshots.length; i++) {
          let snapshot = snapshots[i];
          let name = snapshot['name'];
          let size = snapshot['size'];
          if ("0" == roleType && selectProjectId != snapshot['project_id']) {
            continue;
          }
          this.soltMap.set(snapshot['id'], snapshot['share_id']);
          resultData.push({
            id: snapshot['id'],
            name: name,
            size: '(' + size + ' GB)',
            sizeGB: size
          });
         // this.soltSizeMap.set(snapshot['id'], size);
        }
        this.soltOptions = resultData;
      } catch (data) {
        self.loading = false;
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
    getSelectOptionTitle(value) {
      if (typeof (value) == "undefined" || null == value) {
        return value;
      }
      if (value.length > 80) {
        return value;
      }
      return '';
    },
    confirmFun() {
      var self = this;
      var checkFlag = false;
      var checkMsg = "";
      this.$refs.createShareStorageForm.validate(async(valid) => {
        if (valid) {
          //数据有效性检查
          let count = self.createShareStorage.count;
          if (count < 0 || count > 100) {
            this.$message({
              showClose: true,
              message: this.$t('storage.min1Max100'),
              type: 'error'
            });
            return false;
          }
          if (-1 != self.quota.totalC) {
            //需要进行数量判断
            if ((self.quota.in_useC + self.createShareStorage.count) > self.quota.totalC) {
              //配额数量不足
              checkMsg = this.$t('storage.freeNumNotEnough');
              checkFlag = true;
            }
          }
          //容量判断
          if (-1 != self.quota.totalGB) {
            if (self.quota.totalGB < (self.quota.in_useGB + self.createShareStorage.size * self.createShareStorage.count)) {
              //容量不足
              checkFlag = true;
              if ("" != checkMsg) {
                checkMsg = checkMsg + ";";
              }
              checkMsg = checkMsg + this.$t('storage.freeCapabilityNotEnough');
            }
          }
          if (checkFlag) {
            this.$message({
              showClose: true,
                message: checkMsg,
                type: 'warning'
              });
            return false;
          }
          let msg = this.$t('storage.addshareStorageSuccess');
          var name = this.createShareStorage.name;
          var shareTypeD = this.createShareStorage.type;
          var size = this.createShareStorage.size;
          var description = this.createShareStorage.description;
          var tenantId = this.createShareStorage.project;
          var shareProto = this.createShareStorage.protocol;
          var isPublict = false;
          var body = {"share":{"description": description, "name": name, "share_type": shareTypeD, "size": size, "share_proto": shareProto, "is_publict": isPublict}}
          var url = "api/manila/v2/" + this.$cookie.get("pid") + "/shares";
          var type = "post";
          if (this.createShareStorage.origin == "2") {
              body = {};
              let soltId = this.createShareStorage.solt;
              if (!soltId) {
                this.$message({
                    showClose: true,
                    message: this.$t('storage.originSnapshotCannotBeNull'),
                    type: 'warning'
                  });
                  return false;
              }
              var soltSize = this.getSoltSize(soltId);
              if (soltSize > size) {
                //快照大小大于文件存储的大小
                this.$message({
                    showClose: true,
                    message: this.$t('storage.shareStoragecapabilityLessThanTheSizeOfSnapshot'),
                    type: 'warning'
                  });
                return false;
              }
              body = {"share":{"description": description, "name": name, "share_type": shareTypeD, "size": size, "share_proto": shareProto, "snapshot_id": soltId, "is_publict": isPublict}};
          }
          if (this.isImageFlag == false) {
              body = {};
              let snapsoltId = this.snapshotId;
              let soltSize = this.getSoltSize(snapsoltId);
              if (soltSize > size) {
                //快照大小大于文件存储的大小
                this.$message({
                    showClose: true,
                    message: this.$t('storage.shareStoragecapabilityLessThanTheSizeOfSnapshot'),
                    type: 'warning'
                  });
                  return false;
              }
              body = {"share":{"description": description, "name": name, "share_type": shareTypeD, "size": size, "share_proto": shareProto, "snapshot_id": snapsoltId, "is_publict": isPublict}};
          }
          if (self.isDisabled === true) {
            return false;
          }
          self.isDisabled = true;
          self.loadingBtn = true;
          let closeFun =function () {
            self.loadingBtn = false;
            self.isDisabled = false;
            self.loading = false;
            if (self.isImageFlag == false) {
              self.$router.push({
                  path: '/calculate-storage/document-storage/shareStorage'
                });
              self.hide();
            } else {
              self.$emit("handleShow", {});
              self.$emit("onRefresh", {});
            }
          }
          if (this.createShareStorage.count == 1) {
            try {
              body = JSON.stringify(body);
              let ret = await this.$ajax({
                url: url,
                data: body,
                type: type,
                successMsg: msg,
                successFun: function(data) {
                  setTimeout(function () {
                    closeFun();
                  }, 1000);
                },
                log:{
                  description:{
                    en:"Create storage share:" + name,
                    zh_cn:"创建文件存储:" + name
                  },
                  target:Vue.logTarget.storage_share
                }
              });
            } catch (data) {
              self.isDisabled = false;
              self.loadingBtn = false;
              this.loading = false;
              __DEV__ && console.error(data);
            }
          } else {
            try {
              let storageShares = [];
              for (let i = 1; i <= this.createShareStorage.count; i++) {
                let tempName = name + "-000";
                tempName = tempName.substr(0, tempName.length - i.toString().length) + i.toString();
                if (tempName.length > 255) {
                  this.$message({
                    showClose: true,
                    message: Vue.t('storage.storageShareMaxSize'),
                    type: 'warning'
                  });
                  this.isDisabled = false;
                 return;
                }
                storageShares.push({"storageShare" : tempName});
              }
              body.share.name = "{storageShare}";
              let logObj = {
                description: {
                  en: "Create storage share",
                  zh_cn: "创建文件存储"
                },
                key: "storageShare",
                target: Vue.logTarget.storage_share
              };
              this.$sequence({
                type: 'post',
                url: url,
                params: storageShares,
                datas:body,
                paramKeys:["storageShare"],
                log: logObj
              }).then((data) => {
                self.$message(msg);
                closeFun();
              }).catch((err) => {
                closeFun();
                console.log(err);
              });
            } catch (data) {
              closeFun();
              __DEV__ && console.error(data);
            }
          }
        } else {
          //有数据不合法
          return false;
        }
      });
    },
    getSoltSize(soltId) {
      for (var q = 0; q < this.soltOptions.length; q++) {
        var soltTemp = this.soltOptions[q];
        if (soltId == soltTemp.id) {
          return soltTemp.sizeGB;
        }
      }
      return 0;
    },
    originChange(val) {
      if (val == '1') {
        //新建来源
        this.soltFlag = false;
        this.imageFlag = false;
        this.volumeFlag = false;
      } else if (val == '2') {
        //快照创建
        this.soltFlag = true;
        this.imageFlag = false;
        this.volumeFlag = false;
      } else if (val == '3') {
        this.soltFlag = false;
        this.imageFlag = true;
        this.volumeFlag = false;
      } else if (val == '4') {
        this.soltFlag = false;
        this.imageFlag = false;
        this.volumeFlag = true;
      }
    },
    originSolfChange(val) {
      //val snapshot id
      var self = this;
      var shareId = self.soltMap.get(val);
      var shareTypeId = self.queryShareInfo(shareId);
      //self.createShareStorage.type = shareTypeId;
    },
    async queryShareInfo(shareId) {
      var self = this;
      var url = "api/manila/v2/" + this.$cookie.get('pid') + "/shares/" + shareId;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        self.loading = false;
        let shareInfo = result['share'];
        self.createShareStorage.type = shareInfo.share_type;
        return shareInfo.share_type;
      } catch (res) {
        self.loading = false;
      }
      return "";
    },
    sizeChange(val) {
      var p = ((Number(val) + 1948)/2048).toFixed(4) * 100;
      this.proStatus = p > 100 ? "exception" : "success";
      this.percentage = p > 100 ? 100 : p;
    },
    async loadShareTypeList() {
      //查询所有的项目列表
      var self = this;
      self.loading = true;
      var url = "api/manila/v2/" + this.$cookie.get("pid") + "/types";
       try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        self.loading = false;
        //self.shareTypeList = [{"id":"", "name":""}];
        self.shareTypeList = result['share_types']; //self.shareTypeList.concat(result['share_types']);
        if (self.shareTypeList.length > 0 && isImageFlag) {
          self.createShareStorage.type = self.shareTypeList[0].id || "";
        }
      } catch (res) {
        self.loading = false;
      }
    },
    async loadProjectQuota() {
      var self = this;
      self.loading = true;
      var roleType = Vue.roleType + "";
      //var url = "api/manila/v2/" + this.$cookie.get("pid") + "/os-quota-sets/" + this.$cookie.get("pid") + "/detail";
      var url = "api/manila/v2/" + this.$cookie.get("pid") + "/limits";
       try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        var quotaSet = result['limits'].absolute;
        self.quota.totalGB = quotaSet.maxTotalShareGigabytes;
        self.quota.in_useGB = quotaSet.totalShareGigabytesUsed;
        self.quota.totalC = quotaSet.maxTotalShares;
        self.quota.in_useC = quotaSet.totalSharesUsed;
        //容量判断
        var p = 0;
        if (-1 == self.quota.totalGB) {
          p = 0;
          this.percentage = 0;
          self.quota.totalGB = this.$t('storage.infinite');
          this.maxCapacity = self.quota.totalGB;
        } else {
          p = (self.quota.in_useGB/self.quota.totalGB).toFixed(4) * 100;
          this.maxCapacity = self.quota.totalGB - self.quota.in_useGB;
        }
        this.proStatus = p > 100 ? "exception" : "success";
        this.percentage = p > 100 ? 100 : p;
        //数量判断
        var q = 0;
        if (-1 == self.quota.totalC) {
          q = 0;
          this.countpercentage =0;
          self.quota.totalC =this.$t('storage.infinite');
        } else {
          q = (self.quota.in_useC/self.quota.totalC).toFixed(4) * 100;
          //this.countpercentage = (self.quota.in_useC/self.quota.totalC).toFixed(2) * 100;
        }
        this.countproStatus = q > 100 ? "exception" : "success";
        this.countpercentage = q > 100 ? 100 : q;
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    async getProjectList() {
      var self = this;
      var resultData = [];
      self.loading = true;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/keystone/v3/projects?domain_id=default"
        });
        let projects = ret.projects;
        for (let i = 0; i < projects.length; i++) {
          let project = projects[i];
          let name = project['name'];
          resultData.push({
            id: project['id'],
            name: project['name']
          })
        }
        this.proList = resultData;
      } catch (data) {
        self.loading = false;
      }
    },
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    cancelFun() {
      if (this.isDisabled === true) {
        this.$message.warning(this.$t('base.inProgress'));
        return false;
      }
      if (this.isImageFlag == false) {
        this.hide();
      } else {
        this.$emit("handleShow");
      }
    }
  }
}
</script>