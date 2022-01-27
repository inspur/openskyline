<template>
<div>
  <el-dialog :title="dialogTitle" :visible.sync="visible" :before-close="hide" v-dialogDrag>
    <el-form ref="newVolumeForm" class="me-required-form" :model="newVolume" label-width="100px" :rules="rules" v-loading="loading"  label-position="left">
      <!-- 项目 -->
      <el-form-item :label="$t('lang.project')" prop="project" class="is-required">
        <el-input v-bind:style="widthStyle" :readonly="true" v-model="newVolume.projectName" :disabled="true"></el-input>
      </el-form-item>
      <!--用户-->
      <el-form-item :label="$t('storage.user')" prop="project" class="is-required" v-if="roleType=='0'">
         <el-select v-model="newVolume.userId" v-bind:style="widthStyle" filterable>
          <el-option v-for="item in userList" :key="item.id" :label="getSelectOptionName(item.name)" :value="item.id" :title="item.name.length > 80?item.name:''">
          </el-option>
        </el-select>
      </el-form-item>
      <!--云硬盘名称-->
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input v-model="newVolume.name" auto-complete="off" v-bind:style="widthStyle"></el-input>
      </el-form-item>
      <!--选择卷类型 克隆新增-->
      <el-form-item :label="$t('calcStorLang.volumetype')" prop="volumetype" class="is-required">
        <el-select v-model="newVolume.volumetype" v-bind:style="widthStyle" filterable @change="volumeTypeChange">
          <el-option v-for="item in volumeTypeOptions" :key="item.id" :label="getSelectOptionName(item.name)" :value="item.id" :title="getSelectOptionTitle(item.name)"></el-option>
        </el-select>
      </el-form-item>
      <!--数量-->
      <el-form-item :label="$t('storage.number')" prop="count" class="is-required">
        <el-row v-bind:style="widthStyle">
          <el-col :span="6">
             <el-input-number v-model="newVolume.count" :min="1" :max="100" size="small" :disabled="countDisabled"></el-input-number>
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
      <!--容量-->
      <el-form-item :label="$t('storage.capabilityGB')" prop="size" class="is-required">
        <el-row v-bind:style="widthStyle">
          <el-col :span="6">
             <el-input-number v-model="newVolume.size" :min="1" :max="oneMaxCap" size="small" @change="numberToInt" :disabled="true"></el-input-number>
          </el-col>
          <el-col :span="15">
            <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage" :status="proStatus" v-bind:style="{top:'10px'}"></el-progress>
          </el-col>
          <el-tooltip placement="top" trigger="hover" :content="$t('storage.maxSizeOnevolCapa')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-row>
        <el-row>
          <el-col :span="30">
            <div class="sub-tittle">{{$t('storage.total')}}{{totalSize}}GB，{{$t('storage.used')}}{{usedSize}}GB，{{$t('storage.surplus')}}{{freeSize}}GB</div>
          </el-col>
        </el-row>
      </el-form-item>
      <!--可用域-->
      <el-form-item :label="$t('storage.volumeZone')" prop="domain" class="is-required">
        <el-select v-model="newVolume.domain" v-bind:style="widthStyle" filterable>
          <el-option v-for="item in zoneOptions" :key="item.value" :label="item.zoneName" :value="item.zoneName"></el-option>
        </el-select>
      </el-form-item>
      <!--描述-->
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-8" v-model="newVolume.description" auto-complete="off" type="textarea" v-bind:style="widthStyle" ></el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="hide" :disabled="isDisabled">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="beforeComfirmFun" :loading="isDisabled" :disabled="overStorage">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
 </div>
</template>
<script>
import {getUsersByProjectId} from '../../../utils/common';
export default {
  name:"CloneVolume",
  props: ["projectInfo", "instancelSoltInfo", "imageInfo", "volumeInfo"],
  data() {
    return {
      newVolume:{
        project:"",
        projectName:"",
        userId:"",
        name:"",
        volumetype:"",
        count:1,
        size:1,
        volumes:"",
        domain:"",
        description:""
      },
      dialogTitle: "",
      roleType: Vue.roleType + "",
      projectList: '',
      loginId: Vue.userId,
      projectListMap: "",
      loading: false,
      isDisabled: false,
      visible:false,
      overStorage: false,
      zoneOptions:[],
      oneMaxCap: 128 * 1024,
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
      realInUsedCount: -1,
      realInUsedSizeGB: -1,
      oldSize:"",
      userList: [],
      volumeTypeOptions:[],
      typeFullOptions: [],
      countpercentage:0,
      percentage:0,
      proStatus:"success",
      countDisabled: false,
      widthStyle:{
        width:"85%"
      },
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'onlyLetter_MinusNumberChinese' },
          { validator: (rule, value, cb) => {
            if (this.newVolume.count > 1 && value.length > 251) {
              cb(this.$t("validation.maxSizes", 251));
            } else if (this.newVolume.count <= 1 && value.length > 255) {
              cb(this.$t("validation.maxSizes", 255));
            } else {
              cb();
            }
          }}
        ],
        count: [
          { type: 'required', trigger: 'blur change' },
          { type: "integer" }
        ],
        size: [
          { type: 'required', trigger: 'blur change' },
          { type: "integer" }
        ],
        volumetype: [
          {type: 'required'}
        ],
        domain: [
          {type: 'required'}
        ],
        description: [
          { type: 'maxSize', value: 255 }
        ]
      }
    }
  },
  async mounted() {
    let $this = this;
    $this.loading = true;
    $this.dialogTitle = this.$t('storage.cloneVolume');
    this.initZones();
    this.getVolumeType();
    $this.initFun4();
    $this.loading = false;
  },
  methods:{
    async initZones() {
       let self = this;
       try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/cinder/v2/' + this.$cookie.get('pid') + '/os-availability-zone'
        });
        let list = result['availabilityZoneInfo'];
        let zones = [];
        if (list != null) {
          for (let z = 0; z < list.length; z++) {
            let zone = list[z];
            if (zone['zoneName'] != "internal") {
               zones.push(zone);
            }
          }
        }
        self.zoneOptions = zones;
        if (zones.length > 0) {
          self.newVolume.domain = zones[0].zoneName || "";
        }
      } catch (res) {
        self.loading = false;
      }
    },
    async getVolumeType() {
      let self = this;
      let projectId = this.$cookie.get('pid');
      let url = "api/cinderv3/v3/" + projectId + "/types?is_public=None";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        // let tempArry = [];
        // tempArry = result['volume_types'].filter(function(item) {
        //   return item["extra_specs"]["multiattach"];
        // })
        self.volumeTypeOptions = result['volume_types'];
      } catch (res) {
        console.log(Vue.t('storage.getFailed'));
      }
    },
    async initFun4() {
      let self = this;
      const volumeInfo = self.volumeInfo;
      const joinedProjecList = Vue.projectList;
      self.loadUserList();
      self.newVolume.project = volumeInfo['os-vol-tenant-attr:tenant_id'];
      if (self.roleType === "0") {
        const projectListMap = await this.loadProjectList();
        self.newVolume.projectName = projectListMap[self.newVolume.project]["name"];
        self.getCountValue();
        self.loadUserList();
      } else {
        self.newVolume.userId = self.loginId;
        self.newVolume.project = self.$cookie.get("pid");
        for (let i = 0; i < joinedProjecList.length; i++) {
          let project = joinedProjecList[i];
          if (project['id'] === self.newVolume.project && project['roleId'] != "SuperAdmin") {
            self.newVolume.projectName = project['name'];
            break;
          }
        }
        self.getcountValueLimit();
      }
      self.newVolume.volumes = volumeInfo.id;
      self.newVolume.size = volumeInfo["size"];
      self.oldSize = volumeInfo["size"];
    },
    //查询所有的项目列表
    async loadProjectList() {
      let self = this;
      let result = await self.$ajax({
        type: 'get',
        url: `api/keystone/v3/projects?domain_id=default`,
        showErrMsg: false
      });
      let projects = result['projects'] || [];
      let projectListMap = {};
      projects.forEach(item => {
        projectListMap[item.id] = item;
      });
      self.projectListMap = projectListMap;
      return self.projectListMap;
    },
    show() {
      this.visible = true;
    },
    hide() {
      this.$emit("handleShow", {});
    },
    numberToInt(value) {
      return Math.floor(value);
    },
    async getcountValueLimit() {
      let self = this;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + self.$cookie.get("pid") + "/limits?usages=True"
        });
        let data = ret['limits'].absolute;
        self.analyzeQuotaCountData(data['maxTotalVolumes'], data['totalVolumesUsed']);
        self.analyzeQuotaSizeData(data['maxTotalVolumeGigabytes'], data['totalGigabytesUsed']);
      } catch (data) {
      }
    },
    async getCountValue() {
      let self = this;
      let projectId = self.newVolume.project;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + self.$cookie.get("pid") + "/os-quota-sets/" + projectId + "?usage=true"
        });
        let data = ret['quota_set'].volumes;
        self.analyzeQuotaCountData(data['limit'], data['in_use']);
        let data2 = ret['quota_set'].gigabytes;
        self.analyzeQuotaSizeData(data2['limit'], data2['in_use']);
      } catch (data) {
      }
    },
    analyzeQuotaCountData(maxTotalVolumes, totalVolumesUsed) {
      let self = this;
      self.inUsedCount = totalVolumesUsed;
      if (self.realInUsedCount != self.inUsedCount) {
        if (self.realInUsedCount != -1) {
          self.inUsedCount = self.realInUsedCount;
        }
      }
      if (maxTotalVolumes == "-1") {
        self.totalCount = this.$t('storage.infinite');
        self.freeCount = this.$t('storage.infinite');
        self.countpercentage = 0;
      } else {
        self.totalCount = maxTotalVolumes;
        self.freeCount = self.totalCount - self.inUsedCount;
        self.countpercentage = ((self.inUsedCount/maxTotalVolumes) * 100).toFixed(2) * 1;
      }
        self.inUsedOldCount = self.inUsedCount;
    },
    analyzeQuotaSizeData(maxTotalVolumes, totalVolumesUsed) {
      let self = this;
      //容量
      self.usedSize = totalVolumesUsed;
      if (self.realInUsedSizeGB != self.usedSize) {
        if (self.realInUsedSizeGB != -1) {
          self.usedSize = self.realInUsedSizeGB;
        }
      }
      if (maxTotalVolumes == "-1") {
        self.totalSize = this.$t('storage.infinite');
        self.totalInfinite = true;
        self.freeSize = this.$t('storage.infinite');
        self.percentage = 0;
        self.totalCapacity = 99999;
      } else {
        let size = maxTotalVolumes;
        self.totalSize = maxTotalVolumes;
        self.totalInfinite = false;
        self.freeSize = size - self.usedSize;
        self.percentage = ((self.usedSize/size)*100).toFixed(2) * 1;
        self.totalCapacity = parseInt(size-self.usedSize);
      }
      self.usedOldSize = self.usedSize;
    },
    async loadUserList() {
      let self = this;
      self.loading = true;
      self.userList = [];
      self.newVolume.userId = "";
      let projectId = self.newVolume.project;
      if ( !self.newVolume.project ) {
        return false;
      }
      try {
        let users = await getUsersByProjectId(projectId);
        let loginUser = "";
        if (users != null) {
          for (let u = 0; u < users.length; u++) {
            let userObj = users[u];
            self.userList.push(userObj);
            //判断一下，查询出来用户列表是否包含当前登录账号
            //如果包含，则默认展示i当前登陆用户
            //如果不包含，则展示查询出来的列表的第一个用户
            if (userObj.id === self.loginId) {
              loginUser = userObj;
            }
          }
          self.newVolume.userId = self.userList[0].id;
          if (loginUser) {
            self.newVolume.userId = loginUser.id;
          }
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    sizeRender(value) {
      if (!value || value === 0) {
        return "0 Bytes";
      }
      let sizes = ["Bytes", "KB", "MB", "GB", "TB", "YB"];
      let num = 0;
      while (value >= 1024) {
        value = value / 1024;
        num++;
      }
      return value.toFixed(2) + " " + sizes[num];
    },
    beforeComfirmFun() {
      let vType = this.volumeInfo["volume_type"];
      let currentType = "";
      for (let i=0; i<this.volumeTypeOptions.length; i++) {
        if (this.newVolume.volumetype == this.volumeTypeOptions[i].id) {
          currentType = this.volumeTypeOptions[i].name;
          break;
        }
      }
      if (this.volumeInfo["status"]=="in-use" && currentType==vType) {
        this.$confirm(this.$t('storage.coloneVolumeMsg'), this.$t('lang.confirm'), {
          confirmButtonText: this.$t('lang.confirm'),
          cancelButtonText: this.$t('lang.cancel'),
          type: 'warning'
        }).then(() => {
          this.confirmFun();
        }).catch(() => {
          return false;
        });
      } else if (this.volumeInfo["status"]=="in-use" && currentType!=vType) {
        this.$confirm(this.$t('storage.coloneVolumeTypeMsg'), this.$t('lang.confirm'), {
          confirmButtonText: this.$t('lang.confirm'),
          cancelButtonText: this.$t('lang.cancel'),
          type: 'warning'
        }).then(() => {
          this.confirmFun();
        }).catch(() => {
          return false;
        });
      } else {
        this.confirmFun();
      }
    },
    confirmFun() {
      this.$refs.newVolumeForm.validate(async(valid) => {
        if (valid) {
          this.isDisabled = true;
          let name = this.newVolume.name;
          let projectId = this.$cookie.get('pid');
          let size = this.newVolume.size;
          let zone = this.newVolume.domain;
          let description = this.newVolume.description;
          let vType = this.newVolume.volumetype;
          let selectProjectId = this.newVolume.project;
          let userId = this.newVolume.userId;
          if (!userId) {
            this.$message({
                showClose: true,
                message: Vue.t('storage.userNotNull'),
                type: 'warning'
              });
              this.isDisabled = false;
              return;
          }
          if (!selectProjectId) {
            this.$message({
                showClose: true,
                message: Vue.t('storage.projectNotNull'),
                type: 'warning'
              });
              this.isDisabled = false;
              return;
          }
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
          let svolId = this.newVolume.volumes;
             if (!svolId) {
                this.$message({
                    showClose: true,
                    message: Vue.t('storage.originVolNotAllowNull'),
                    type: 'warning'
                 });
                 this.isDisabled = false;
                 return;
             }
            //  if (this.oldSize > size) {
            //     //镜像大小大于卷的大小
            //     this.$message({
            //         showClose: true,
            //         message: Vue.t('storage.volCapaLessThanOriginVol'),
            //         type: 'warning'
            //      });
            //      this.isDisabled = false;
            //      return;
            //  }
          let url = "api/cinderv3/v3/" + projectId + "/volumes/"+this.volumeInfo.id+"/action";
          let type = "post";
          let msg = this.$t('storage.createVolSuccess');
          let body = {
            "os-retype":{
                "new_type": vType,
                "migration_policy":"on-demand",
                "is_clone": true,
                "display_name": name,
                "user_id": this.newVolume.userId,
                "display_description": description
            }
          };
          if (this.newVolume.count == 1) {
            body = JSON.stringify(body);
            try {
              let logObj = {
                  description: {
                    en:`Volume clone:${name} from ${this.volumeInfo.name}`,
                    zh_cn:`通过云硬盘${this.volumeInfo.name}克隆创建云硬盘:${name}`
                  },
                  key: "diskname",
                  target: Vue.logTarget.storage_volume
              };
              let ret = await this.$ajax({
                url: url,
                data: body,
                type: type,
                successMsg: msg,
                log: logObj
              });
              this.$emit("handleShow", {});
              this.$emit("getData", {});
            } catch (data) {
              this.loading = false;
              this.isDisabled = false;
              __DEV__ && console.error(data);
            }
          } else {
            let disknames = [];
            let tempName = "";
            for (let i = 1; i <= this.newVolume.count; i++) {
            let tempName = name + "-000";
            tempName = tempName.substr(0, tempName.length - i.toString().length) + i.toString();
            if (tempName.length > 255) {
              this.$message({
                showClose: true,
                message: Vue.t('storage.volNameMaxSize'),
                type: 'warning'
              });
              this.isDisabled = false;
              return;
            }
            disknames.push({diskname : tempName});
          }
          body["os-retype"]['display_name'] = "{diskname}";
              try {
                let logObj = {
                  description: {
                    en: `from ${this.volumeInfo.name} Volume clone`,
                    zh_cn: `通过云硬盘${this.volumeInfo.name}克隆创建云硬盘`
                  },
                  key: "diskname",
                  target: Vue.logTarget.storage_volume
                };
                this.$sequence({
                     type: 'post',
                     url: url,
                     params: disknames,
                     datas:body,
                     paramKeys:["diskname"],
                     log: logObj
                }).then((data) => {
                     this.$message(Vue.t('storage.createVolSuccess'));
                     this.$emit("handleShow", {});
                     this.$emit("getData", {});
                }).catch((err) => {
                    this.loading = false;
                    this.isDisabled = false;
                });
              } catch (data) {
                  this.loading = false;
                  this.isDisabled = false;
                  __DEV__ && console.error(data);
              }
          }
        } else {
          this.isDisabled = false;
          return false;
        }
      });
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
    splitLengStr(str) {
      if (str.length <= 50) {
        return str;
      }
      let strArray = str.split("");
      let temp = "";
      for (let i = 1; i <= strArray.length; i++) {
        temp = temp + strArray[i - 1]
        if (i % 50 == 0) {
          temp = temp + "<br/>";
        }
      }
      return temp;
    },
    volumeTypeChange(val) {
      let vTypeTemp = this.volumeInfo["os-vol-host-attr:host"];
      let startIndex = vTypeTemp.indexOf("@");
      let endIndex = vTypeTemp.indexOf("#");
      let vType = vTypeTemp.substring(startIndex+1, endIndex);
      let currentType = "";
      for (let i=0; i<this.volumeTypeOptions.length; i++) {
        if (val == this.volumeTypeOptions[i].id) {
          currentType = this.volumeTypeOptions[i].extra_specs.volume_backend_name==undefined ? this.volumeTypeOptions[i].name:this.volumeTypeOptions[i].extra_specs.volume_backend_name;
          break;
        }
      }
      if (currentType == vType) {
        this.countDisabled = false;
        this.overStorage = false;
      } else {
        if (this.volumeInfo.encrypted||this.volumeInfo.multiattach) {
          this.$message(Vue.t('storage.notAllowedMultiattachClone'));
          this.overStorage = true;
        } else {
          this.overStorage = false;
          this.newVolume.count = 1;
          this.countDisabled = true;
        }
      }
    }
  }
}
</script>