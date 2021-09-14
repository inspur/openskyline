<template>
<div>
  <el-dialog :title="dialogTitle" :visible.sync="visible" :before-close="hide" v-dialogDrag>
    <el-form ref="newVolumeForm" class="me-required-form" :model="newVolume" label-width="100px" :rules="rules" v-loading="loading"  label-position="left">
      <!-- 项目 -->
      <el-form-item :label="$t('lang.project')" prop="project" class="is-required">
        <el-input v-if="projectShowType==='popup'" auto-complete="off" icon="" v-bind:style="widthStyle" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="newVolume.projectName"></el-input>
        <el-input v-if="projectShowType==='input'" v-bind:style="widthStyle" :readonly="true" v-model="newVolume.projectName" :disabled="true"></el-input>
        <el-select v-if="projectShowType==='select'" v-model="newVolume.project" v-bind:style="widthStyle" @change="projectChange" filterable>
          <el-option v-for="p in projectOptions" :key="p.id" :value="p.id" :label="p.name">{{ p.name }}</el-option>
        </el-select>
      </el-form-item>
      <!--用户-->
      <el-form-item :label="$t('storage.user')" prop="project" class="is-required">
         <el-select v-model="newVolume.userId" v-bind:style="widthStyle" filterable>
          <el-option v-for="item in userList" :key="item.id" :label="getSelectOptionName(item.name)" :value="item.id" :title="item.name.length > 80?item.name:''">
          </el-option>
        </el-select>
      </el-form-item>
      <!--云硬盘名称-->
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input v-model="newVolume.name" auto-complete="off" v-bind:style="widthStyle"></el-input>
      </el-form-item>
      <!--是否为共享云硬盘-->
      <el-form-item :label="$t('calcStorLang.shared')" class="is-required" prop="isShared" v-if="!(originChangeFlag == 'volumeSnapshot' || originChangeFlag === 'volume')" >
        <el-switch v-model="newVolume.isShared" :on-text="$t('storage.yes')" :off-text="$t('storage.no')" @change="changeSharedFun" :disabled="originChangeFlag != 'new'" />
      </el-form-item>
      <!--选择云硬盘类型-->
      <el-form-item :label="$t('lang.type')" prop="type" v-if="!(originChangeFlag == 'volumeSnapshot' || originChangeFlag === 'volume')">
        <el-select v-model="newVolume.type" v-bind:style="widthStyle" filterable clearable>
          <el-option v-for="item in volumeTypeOptions" :key="item.id" :label="getSelectOptionName(item.name)" :value="item.id" :title="getSelectOptionTitle(item.name)"></el-option>
        </el-select>
      </el-form-item>
      <!--数量-->
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
      <!--容量-->
      <el-form-item :label="$t('storage.capabilityGB')" prop="size" class="is-required">
        <el-row v-bind:style="widthStyle">
          <el-col :span="6">
             <el-input-number v-model="newVolume.size" :min="1" :max="oneMaxCap" size="small" @change="numberToInt" :disabled="entranceCode === 'CloneVolume'"></el-input-number>
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
      <!--来源-->
      <el-form-item :label="$t('storage.origin')" prop="origin" class="is-required" v-if="isShowOriginFlag">
        <el-select v-model="newVolume.origin" @change="originChange" v-bind:style="widthStyle">
          <el-option v-for="item in originOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <!--云硬盘快照-->
      <el-form-item :label="$t('storage.volSnapshot')" prop="solt" class="is-required" v-if="isShowOriginFlag && originChangeFlag === 'volumeSnapshot'">
        <el-select v-model="newVolume.solt" v-bind:style="widthStyle" filterable clearable>
          <el-option v-for="item in soltOptions" :key="item.id" :value="item.id" :label="item.name" :title="getSelectOptionTitle(item.name)">
            <span style="float:left">{{getSelectOptionName(item.name)}}</span>
            <span style="float:left;color:#8492a6;">{{item.size}}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <!--镜像-->
      <el-form-item :label="$t('storage.image')" prop="image" class="is-required" v-if="isShowOriginFlag && originChangeFlag === 'image'">
        <el-select v-model="newVolume.image" v-bind:style="widthStyle" filterable clearable>
          <el-option v-for="item in imageOptions" :key="item.id" :label="item.name" :value="item.id" :title="getSelectOptionTitle(item.name)">
            <span style="float:left">{{getSelectOptionName(item.name)}}</span>
            <span style="float:left;color:#8492a6;">{{item.size}}</span>
          </el-option>
        </el-select>
        <el-tooltip placement="top" trigger="hover" :content="$t('storage.volSizeMoreThanTenimagesSize')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
      </el-form-item>
      <!--云硬盘-->
      <el-form-item :label="$t('storage.volume')" prop="volumes" class="is-required" v-if="isShowOriginFlag && originChangeFlag === 'volume'">
        <el-select v-model="newVolume.volumes" v-bind:style="widthStyle" filterable clearable>
          <el-option v-for="item in volumesOptions" :key="item.id" :label="item.name" :value="item.id" :title="getSelectOptionTitle(item.name)">
            <span style="float:left">{{getSelectOptionName(item.name)}}</span>
            <span style="float:left;color:#8492a6;">{{item.size}}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <!--云主机快照-->
      <el-form-item :label="$t('storage.instanceSolt')" prop="instanceSolt" class="is-required" v-if="isShowOriginFlag && originChangeFlag === 'instanceSolt'">
        <el-select v-model="newVolume.instanceSolt" v-bind:style="widthStyle" filterable clearable>
          <el-option v-for="item in instanceSoltOptions" :key="item.id" :label="item.name" :value="item.id" :title="getSelectOptionTitle(item.name)">
            <span style="float:left">{{getSelectOptionName(item.name)}}</span>
            <span style="float:left;color:#8492a6;">{{item.size}}</span>
          </el-option>
        </el-select>
        <el-tooltip placement="top" trigger="hover" :content="$t('storage.volSizeMoreThanTeninstanceSoltSize')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
      </el-form-item>
      <!--可用域-->
      <el-form-item :label="$t('storage.volumeZone')" prop="domain" v-if="originChangeFlag != 'volumeSnapshot'" class="is-required">
        <el-select v-model="newVolume.domain" v-bind:style="widthStyle" filterable>
          <el-option v-for="item in zoneOptions" :key="item.value" :label="item.zoneName" :value="item.zoneName"></el-option>
        </el-select>
      </el-form-item>
      <!--描述-->
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-8" v-model="newVolume.description" auto-complete="off" type="textarea" v-bind:style="widthStyle" ></el-input>
      </el-form-item>
    </el-form>
     <!-- </el-col>
   <el-col :span="12">

    </el-col> -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="hide" :disabled="isDisabled">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="beforeComfirmFun" :loading="isDisabled">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
  <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
 </div>
</template>
<script>
export default {
  name:"newVolume",
  props: ["entranceCode", "projectInfo", "instancelSoltInfo", "imageInfo", "volumeInfo"],
  data() {
    return {
      newVolume:{
        project:"",
        projectName:"",
        user:"",
        userId:"",
        name:"",
        isShared: false,
        type:"",
        count:1,
        size:1,
        origin:"1",
        volumes:"",
        image:"",
        solt:"",
        instanceSolt:"",
        domain:"",
        description:""
      },
      dialogTitle: "",
      volumeName:"",
      originName:"",
      projectShowType: "popup",
      roleType: Vue.roleType + "",
      projectList: '',
      originChangeFlag: "new",
      loginId: Vue.userId,
      projectOwner: "",
      selProjectFlg: false,
      selUserFlg: false,
      close2: "",
      projecNameMap: "",
      projectListMap: "",
      loading: false,
      isDisabled: false,
      visible:false,
      isShowOriginFlag:true,
      zoneOptions:[],
      volumeBackendNameMap: [],
      maxCount: 1,
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
      proList: [],
      userList: [],
      volumeTypeOptions:[],
      typeFullOptions: [],
      countpercentage:0,
      countproStatus:"success",
      percentage:0,
      proStatus:"success",
      soltOptions: [],
      imageOptions: [],
      instanceSoltOptions: [],
      volumesOptions: [],
      imageSizeMap: new Map(),
      volumeSizeMap: new Map(),
      soltSizeMap: new Map(),
      projectOptions: [],
      originOptions:[],
      noShareDiskOptions:[
        {value:'1', label:this.$t('storage.new')},
        {value:'2', label:this.$t('storage.volSnapshot')},
        {value:'3', label:this.$t('storage.image')},
        //story#29912 {value:'4', label:this.$t('storage.volume')},
        {value:'5', label:this.$t('storage.instanceSolt')}
      ],
      shareDiskOptions:[
        {value:'1', label:this.$t('storage.new')},
        {value:'2', label:this.$t('storage.volSnapshot')}
      ],
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
        origin: [
          {type: 'required'}
        ],
        image: [
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
  // watch: {
  //   newVolume: {
  //     deep: true,
  //     handler: function(list) {
  //       this.$refs.newVolumeForm.validateField("name");
  //     }
  //   }
  // },
  async mounted() {
    /**
     * 根据业务入口entranceCode来分离逻辑，适应不同场景
     * entranceCode命名方式为vue文件名或者组件name字段
     * entranceCode:"NewVolume" 为云硬盘列表下，创建云硬盘按钮
     * entranceCode:"InstanceSolt" 为快照-云主机快照列表下，创建云硬盘按钮
     * entranceCode:"ImageList" 为镜像列表下，创建云硬盘按钮
     * entranceCode:"CloneVolume" 为云硬盘列表下，更多操作里，克隆云硬盘按钮
     */
    let $this = this;
    try {
      $this.loading = true;
      //可用域卷类型 与项目角色，业务入口无关
      this.initZones();
      this.getVolumeType();
      $this.dialogTitle = this.$t('storage.createVolume');
      if ($this.entranceCode === "NewVolume") {
        $this.initFun1();
      }
      if ($this.entranceCode === "ImageList") {
        $this.initFun2();
      }
      if ($this.entranceCode === "InstanceSolt") {
        $this.initFun3();
      }
      if ($this.entranceCode === "CloneVolume") {
        $this.dialogTitle = this.$t('storage.cloneVolume');
        $this.initFun4();
      }
      $this.loading = false;
    } catch (error) {
      $this.loading = false;
    }
  },
  methods:{
    //$this.entranceCode === "NewVolume"
    initFun1() {
      let self = this;
      //当前登录用户参与和管理的项目列表
      const joinedProjecList = Vue.projectList;
      //self.newVolume.origin = 1;
      if (self.roleType === "0") {
        self.projectShowType = "popup";
      }
      if (self.roleType === "2") {
        self.projectShowType = "input";
        self.newVolume.project = self.$cookie.get("pid");
        for (let i = 0; i < joinedProjecList.length; i++) {
          let project = joinedProjecList[i];
          if (project['id'] === self.newVolume.project && project['roleId'] != "SuperAdmin") {
            self.newVolume.projectName = project['name'];
            break;
          }
        }
        this.newVolume.userId = this.loginId;
        this.getcountValueLimit();
        this.getVolumeSoltOptions();
        this.getInstanceSoltOptions();
        this.getImageOptions();
        this.getVolumesOptions();
      }
    },
    //$this.entranceCode === "ImageList"
    async initFun2() {
      let self = this;
      const imageInfo = self.imageInfo;
       //当前登录用户参与和管理的项目列表
      const joinedProjecList = Vue.projectList;
      self.newVolume.image = imageInfo.id;
      self.newVolume.project = imageInfo.owner;
      self.newVolume.projectName = imageInfo.projectName;
      self.newVolume.origin = 3;
      self.originChangeFlag = "image";
      if (self.roleType === "0") {
        if (imageInfo["visibility"] === "private") {
          self.projectShowType = "input";
        }
        if (imageInfo["visibility"] === "public") {
          self.projectShowType = "popup";
        }
        if (imageInfo["visibility"] === "shared") {
          self.projectShowType = "select";
          const projectListMap = await this.loadProjectList();
          const sharedProjects = await this.loadSharedProject();
          let tempProjects = [{"member_id" : imageInfo.owner}];
          tempProjects = tempProjects.concat(sharedProjects);
          self.projectOptions = [];
          tempProjects.forEach(item => {
            let pid = item["member_id"];
            if (projectListMap[pid]) {
              self.projectOptions.push({
                "id" : pid,
                "name" : self.projecNameMap[pid]
              });
            }
          });
          self.newVolume.project = self.projectOptions[0].id;
          self.newVolume.projectName = self.projectOptions[0].name;
        }
        self.loadUserList();
        self.getCountValue();
        self.isShowOriginFlag = false;
      }
      if (self.roleType === "2") {
        self.isShowOriginFlag = false;
        self.projectShowType = "input";
        self.newVolume.project = self.$cookie.get("pid");
        for (let i = 0; i < joinedProjecList.length; i++) {
          let project = joinedProjecList[i];
          if (project['id'] === self.newVolume.project && project['roleId'] != "SuperAdmin") {
            self.newVolume.projectName = project['name'];
            break;
          }
        }
        self.getcountValueLimit();
        this.newVolume.userId = this.loginId;
      }
    },
    //$this.entranceCode === "InstanceSolt"
    initFun3() {
      let self = this;
      const instancelSoltInfo = self.instancelSoltInfo;
      //需要将快照所属项目,配额，以及项目下的用户，初始化到界面上
      self.newVolume.project = instancelSoltInfo.owner;
      self.newVolume.projectName = instancelSoltInfo.projectName || instancelSoltInfo["owner_project_name"];
      self.originChangeFlag = "instanceSolt";
      //超级管理员下，公共快照可用于其他项目
      if (self.roleType === "0") {
        self.projectShowType = "input";
        if ("public" == instancelSoltInfo.visibility) {
          self.projectShowType = "popup";
        }
        self.loadUserList();
        self.getCountValue();
      }
      if (self.roleType === "2") {
        self.projectShowType = "input";
        self.newVolume.userId = self.loginId;
        self.getcountValueLimit();
      }
      self.isShowOriginFlag = false;
      self.newVolume.origin = 5;
      self.newVolume.instanceSolt = instancelSoltInfo.id;
    },
    //$this.entranceCode === "CloneVolume"
    async initFun4() {
      let self = this;
      const volumeInfo = self.volumeInfo;
      const joinedProjecList = Vue.projectList;
      self.projectShowType = "input";
      self.originChangeFlag = "volume";
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
      self.isShowOriginFlag = false;
      self.originName = this.$t('storage.volume');
      self.volumeName = volumeInfo["name"];
      self.newVolume.origin = 4;
      self.newVolume.volumes = volumeInfo.id;
      self.newVolume.size = volumeInfo["size"];
      self.oldSize = volumeInfo["size"];
    },
    //过滤云硬盘类型，区分共享和非共享
    changeSharedFun() {
      let self = this;
      let tempArry = [];
      self.newVolume.type="";
      if ("NewVolume" === self.entranceCode) {
        if (self.newVolume.isShared) {
          self.originOptions = self.shareDiskOptions;
          tempArry = self.typeFullOptions.filter(function(item) {
            return item["extra_specs"]["multiattach"] === "<is> True" && !item["encrypt"];//加密的共享卷类型创建卷有问题，暂时屏蔽掉，需求
          })
        } else {
          self.originOptions = self.noShareDiskOptions;
          tempArry = self.typeFullOptions.filter(function(item) {
            return item["extra_specs"]["multiattach"] != "<is> True";
          })
        }
      } else {
        self.originOptions = self.noShareDiskOptions;
        tempArry = self.typeFullOptions.filter(function(item) {
          return item["extra_specs"]["multiattach"] != "<is> True";
        })
      }
      self.volumeTypeOptions = tempArry;
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    //查询共享镜像下的共享的项目列表
    async loadSharedProject() {
      const $this = this;
      try {
        let res = await $this.$ajax({
          type: "get",
          url: `api/glance/v2/images/${$this.newVolume.image}/members`
        });
        return res.members;
      } catch (res) {
        return [];
      }
    },
    //查询所有的项目列表
    async loadProjectList() {
      let self = this;
      // try {
        self.loading = true;
        let result = await self.$ajax({
          type: 'get',
          url: `api/keystone/v3/projects?domain_id=default`,
          showErrMsg: false
        });
        let projects = result['projects'] || [];
        let projecNameMap = {};
        let projectListMap = {};
        projects.forEach(item => {
           projecNameMap[item.id] = item.name;
           projectListMap[item.id] = item;
        });
        self.projecNameMap = projecNameMap;
        self.projectListMap = projectListMap;
        self.loading = false;
        return self.projectListMap;
      // } catch (res) {
      //   self.loading = false;
      // }
    },
    getSelProjects(id, name) {
      this.projectList = id;
      this.newVolume.project = id;
      this.newVolume.projectName = name;
      this.projectChange();
      this.loading = false;
    },
    onIconClick() {
      this.projectList = '';
      this.newVolume.project = '';
      this.newVolume.projectName = '';
    },
    selectUser() {
      if (this.newVolume.project) {
        this.selUserFlg = true;
        this.$nextTick(() => {
        this.$refs.selectUser.show();
      });
      }
    },
    getSelUser(id, name) {
      this.newVolume.userId = id;
      this.projectOwner = name;
      this.close2 = 'close';
    },
    onIconClick2() {
      this.newVolume.userId = '';
      this.projectOwner = '';
      this.close2 = '';
    },
    show() {
      this.visible = true;
    },
    numberToInt(value) {
      return Math.floor(value);
    },
    hide() {
      this.$emit("handleShow", {});
    },
    async getcountValueLimit() {
      let self = this;
      let projectId = self.newVolume.project;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + self.$cookie.get("pid") + "/limits?usages=True"
        });
        let data = ret['limits'].absolute;
        self.analyzeQuotaCountData(data['maxTotalVolumes'], data['totalVolumesUsed']);
        //let data2 = ret['limits'].absolute;
        self.analyzeQuotaSizeData(data['maxTotalVolumeGigabytes'], data['totalGigabytesUsed']);
      } catch (data) {
        self.loading = false;
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
        self.loading = false;
      }
    },
    analyzeQuotaCountData(maxTotalVolumes, totalVolumesUsed) {
      let self = this;
      //self.loading = true;
      self.inUsedCount = totalVolumesUsed;
      if (self.realInUsedCount != self.inUsedCount) {
        if (self.realInUsedCount != -1) {
          self.inUsedCount = self.realInUsedCount;
          //self.syncQuota();
        }
      }
      if (maxTotalVolumes == "-1") {
        self.maxCount = 99999;
        self.totalCount = this.$t('storage.infinite');
        self.freeCount = this.$t('storage.infinite');
        self.countpercentage = 0;
      } else {
        self.maxCount = maxTotalVolumes - self.inUsedCount;
        self.totalCount = maxTotalVolumes;
        self.freeCount = self.totalCount - self.inUsedCount;
        self.countpercentage = ((self.inUsedCount/maxTotalVolumes) * 100).toFixed(2) * 1;
      }
        self.inUsedOldCount = self.inUsedCount;
        //self.loading = false;
    },
    analyzeQuotaSizeData(maxTotalVolumes, totalVolumesUsed) {
      let self = this;
      //容量
      self.usedSize = totalVolumesUsed;
      if (self.realInUsedSizeGB != self.usedSize) {
        if (self.realInUsedSizeGB != -1) {
          self.usedSize = self.realInUsedSizeGB;
          //self.syncQuota();
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
    async syncQuota() {
      let self = this;
      let projectId = self.newVolume.project;
      let url = "api/cinderv3/v3/" + self.$cookie.get("pid") + "/volumes/" + projectId + "/syncquota"
      try {
        let ret = await this.$ajax({
          type: 'POST',
          url: url
        });
       //return data;
      } catch (data) {
        self.loading = false;
      }
      return -1;
    },
    async getProjectList() {
      let self = this;
      let resultData = [];
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
    async loadUserList() {
      let self = this;
      self.loading = true;
      self.userList = [];
      self.newVolume.userId = "";
      let projectId = self.newVolume.project;
      if ( !self.newVolume.project ) {
        return false;
      }
      let url = 'api/keystone/v3/users';
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        let users = result['users'];
        console.log(users);
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
    async getVolumeSoltOptions() {
      let self = this;
      let resultData = [];
      let projectId = this.$cookie.get('pid');
      let roleType = Vue.roleType + "";
      let selectProjectId = self.newVolume.project;
      let url = "api/cinderv3/v3/" + projectId + "/snapshots/detail?all_tenants=True&status=available";
      if ("2" == roleType || "3" == roleType) {
          url= "api/cinderv3/v3/" + projectId + "/snapshots/detail?status=available";
      }
      try {
        let ret = await this.$ajax({
          type: 'get',
          //url: "api/cinderv3/v3/" + projectId + "/snapshots/detail?status=available"
          url: url
        });
        let snapshots = ret.snapshots;
        for (let i = 0; i < snapshots.length; i++) {
          let snapshot = snapshots[i];
          let name = snapshot['name'];
          let size = snapshot['size'];
          if ("0" == roleType && selectProjectId != snapshot['os-extended-snapshot-attributes:project_id']) {
            continue;
          }
          resultData.push({
            id: snapshot['id'],
            name: name,
            size: '(' + size + ' GB)',
            sizeGB: size
          });
          this.soltSizeMap.set(snapshot['id'], size);
        }
        this.soltOptions = resultData;
      } catch (data) {
        self.loading = false;
      }
    },
    async getInstanceSoltOptions() {
      let self = this;
      let instanceSoltList = [];
      let imageList = [];
      let roleType = Vue.roleType + "";
      let selectProjectId = self.newVolume.project;
      try {
        if ("2" == roleType || "3" == roleType) {
          let ret = await this.$ajax({
            type: 'get',
            url: "api/glance/v2/images?limit=99999&status=active"
          });
          let images = ret.images;
          for (let i = 0; i < images.length; i++) {
            let image = images[i];
            let name = image['name'];
            let size = image['size'];
            if (("snapshot" != image['image_type'] && "backup" != image['image_type']) || size == 0) {
              continue;
            }
            if ("private" == image['visibility'] && selectProjectId != image['owner']) {
              continue;
            }
            let tempObj ={
              "id" : image['id'],
              "name" : name,
              "size" : '(' + self.sizeRender(size) + "," + image['disk_format'] + ')',
              "sizeB" : size
            }
            instanceSoltList.push(tempObj);
          }
        } else {
          //超级管理员组合查询，先查询项目私有的，然后查询公共的
          let owner = "";
          if ("" != selectProjectId ) {
            owner = "&owner=" + selectProjectId + "";
          }
          let ret = await this.$ajax({
            type: 'get',
            url: "api/glance/v2/images?limit=99999&status=active&visibility=private" + owner
          });
          let ret1 = await this.$ajax({
            type: 'get',
            url: "api/glance/v2/images?limit=99999&status=active&visibility=public"
          });
          let images = ret.images;
          let images1 = ret1.images;
          images = [...images, ...images1];
          for (let i = 0; i < images.length; i++) {
            let image = images[i];
            let name = image['name'];
            let size = image['size'];
            if (("snapshot" != image['image_type'] && "backup" != image['image_type']) || size == 0) {
              continue;
            }
            if (image.tags.indexOf('*') > -1) {
              continue;
            }
            let tempObj ={
              "id" : image['id'],
              "name" : name,
              "size" : '(' + self.sizeRender(size) + "," + image['disk_format'] + ')',
              "sizeB" : size
            }
            instanceSoltList.push(tempObj);
          }
        }
        this.instanceSoltOptions = instanceSoltList;
      } catch (data) {
        self.loading = false;
      }
    },
     async getImageOptions() {
      try {
        let self = this;
        let imageList = [];
        let roleType = Vue.roleType + "";
        let selectProjectId = self.newVolume.project;
        let obj = {
          id: "",
          name: "",
          size: "",
          sizeB: "",
          inspur_virtual_size: "",
          min_disk: ""
        };
        let body ={
          project_id : selectProjectId
        };
        if ("0" == roleType) {
          body.user_id = Vue.userId
       }
        let ret = await this.$ajax({
          type: 'post',
          url: 'api/glance/v2/images/list?limit=99999&status=active',
          data: JSON.stringify(body)
        });
        let images = ret.images;
        for (let i = 0; i < images.length; i++) {
          let image = images[i];
          let name = image['name'];
          let size = image['size'];
          let virtialSize= image["inspur_virtual_size"] || 0;
          if (image.tags.indexOf('*') > -1) {
            continue;
          }
          if (size == 0) {
            continue;
          }
          let tempObj = Object.assign({}, obj);
          tempObj.id = image['id'];
          tempObj.name = name;
          if (virtialSize > 0) {
            tempObj.size = '(' + self.sizeRender(size) + ",虚拟:" + self.sizeRender(virtialSize) +"," + image['disk_format'] + ')';
          } else {
            tempObj.size = '(' + self.sizeRender(size) + "," + image['disk_format'] + ')';
          }
          tempObj.sizeB =size;
          tempObj.inspur_virtual_size = image["inspur_virtual_size"] || 0;
          tempObj.min_disk = image["min_disk"] || 0;
          if ("snapshot" != image['image_type'] && image['image_type'] != "backup") {
            imageList.push(tempObj);
          }
        }
        this.imageOptions = imageList;
      } catch (data) {
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
    async getVolumesOptions() {
      let self = this;
      let resultData = [];
      let projectId = this.$cookie.get('pid');
      let selectProjectId = self.newVolume.project;
      let url = "api/cinderv2/v2/" + projectId + "/volumes/detail?project_id="+ selectProjectId + "&all_tenants=True";
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: url
        });
        let volumes = ret.volumes;
        for (let i = 0; i < volumes.length; i++) {
          let volume = volumes[i];
          let status = volume['status'];
          if (status == "available" || status == "in-use") {
            let volId = volume['id'];
            let vtname = volume['name'];
            if (typeof (volume['name']) == "undefined" || vtname == "" || null == vtname) {
              vtname = volId;
            }
            let size = volume['size'];
            resultData.push({
              id: volId,
              name: vtname,
              size: '(' + size + ' GB)',
              sizeGB: size
            });
            this.volumeSizeMap.set(volId, size);
          }
        }
        this.volumesOptions = resultData;
      } catch (data) {
        self.loading = false;
      }
    },
    async getVolumeType() {
      let self = this;
      self.loading = true;
      let projectId = this.$cookie.get('pid');
      let url = "api/cinderv3/v3/" + projectId + "/types";
      //存储后端类型和项目和权限不挂钩
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.typeFullOptions = result['volume_types'];
        //需要过滤出共享和不共享的云硬盘类型
        self.changeSharedFun();
        self.loading = false;
      } catch (res) {
        self.loading = false;
        self.$message.error( Vue.t('storage.getFailed'));
      }
    },
    beforeComfirmFun() {
       if (this.newVolume.origin == "4" && this.entranceCode === "CloneVolume" && this.volumeInfo["status"]==="in-use") {
        this.$confirm(this.$t('storage.coloneVolumeMsg'), this.$t('lang.confirm'), {
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
    /**
     *如果"无卷类型"被选中, 卷被创建的时候将没有卷类型。
     */
    confirmFun() {
      this.$refs.newVolumeForm.validate(async(valid) => {
        if (valid) {
          this.isDisabled = true;
          let name = this.newVolume.name;
          let projectId = this.$cookie.get('pid');
          let userId = this.newVolume.userId;
          let size = this.newVolume.size;
          let isShared = this.newVolume.isShared;
          let zone = this.newVolume.domain;
          let description = this.newVolume.description;
          let vType = this.newVolume.type;
          let selectProjectId = this.newVolume.project;
          let url = "api/cinderv3/v3/" + projectId + "/volumes";
          let type = "post";
          let msg = this.$t('storage.createVolSuccess');
          let body = {"volume": {"name": name, "size": size, "description": description, "multiattach": isShared, "volume_type": vType, "availability_zone": zone}};
          //超级管理员选择项目
          let roleType = Vue.roleType + "";
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
          if ("0" == roleType) {
            url = "api/cinderv3/v3/" + projectId + "/volumes";
            body = {"volume": {"name": name, "size": size, "description": description, "multiattach": isShared, "volume_type": vType, "project_id": selectProjectId, "user_id": userId, "availability_zone": zone}};
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
          if (this.newVolume.origin == "2") {
             body = {};
             let soltId = this.newVolume.solt;
             if (!soltId) {
                this.$message({
                    showClose: true,
                    message: Vue.t('storage.originSnapshotCannotBeNull'),
                    type: 'warning'
                 });
                 this.isDisabled = false;
                 return;
             }
             let soltSize = this.getSoltSize(soltId);
             if (soltSize > size) {
                //镜像大小大于卷的大小
                this.$message({
                    showClose: true,
                    message: Vue.t('storage.volCapaLessThanShot'),
                    type: 'warning'
                 });
                 this.isDisabled = false;
                 return;
             }
             if ("0" == roleType) {
              body = {"volume": {"name": name, "size": size, "description": description, "snapshot_id": soltId, "project_id": selectProjectId, "user_id": userId, "availability_zone": zone}};
             } else {
              body = {"volume": {"name": name, "size": size, "description": description, "snapshot_id": soltId, "availability_zone": zone}};
             }
          }
          if (this.newVolume.origin == "3") {
             let imageId = this.newVolume.image;
             if (!imageId) {
                this.$message({
                    showClose: true,
                    message: Vue.t('storage.imageNotAllowNull'),
                    type: 'warning'
                 });
                 this.isDisabled = false;
                 return;
             }
             if (this.isShowOriginFlag) {
              let imageSize = this.getImageSize(imageId);
              if (imageSize > size * 1024 * 1024 * 1024) {
                  //镜像大小大于卷的大小
                  this.$message({
                      showClose: true,
                      message: Vue.t('storage.volCapaLessThanimage'),
                      type: 'warning'
                  });
                  this.isDisabled = false;
                  return;
              }
              let mindisk = this.getImageMinDisk(imageId);
              if (mindisk!=0 && mindisk > size) {
                this.$message({
                      showClose: true,
                      message: this.$t('storage.VOLUME_MUST_GREATER_THAN_MIN_DISK'),
                      type: 'warning'
                  });
                  this.isDisabled = false;
                  return;
              }
              let virtualImageSize = this.getImageVirtualSize(imageId);
              if (virtualImageSize!=0 && virtualImageSize > size * 1024 * 1024 * 1024) {
                  this.$message({
                      showClose: true,
                      message: Vue.t("storage.VOLUME_EXCEED_SIZE"),
                      type: 'warning'
                  });
                  this.isDisabled = false;
                  return;
              }
             } else {
               let imageSize = this.imageInfo["size"] || 0;
               if (imageSize!=0 && imageSize > size * 1024 * 1024 * 1024) {
                this.$message({
                      showClose: true,
                      message: Vue.t('storage.volCapaLessThanimage'),
                      type: 'warning'
                  });
                  this.isDisabled = false;
                  return;
               }
               let mindisk = this.imageInfo["min_disk"] || 0;
               if (mindisk!=0 && mindisk > size) {
                this.$message({
                      showClose: true,
                      message: this.$t('storage.VOLUME_MUST_GREATER_THAN_MIN_DISK'),
                      type: 'warning'
                  });
                  this.isDisabled = false;
                  return;
               }
               let virtualImageSize = this.imageInfo["inspur_virtual_size"] || 0;
               if (virtualImageSize!=0 && virtualImageSize > size * 1024 * 1024 * 1024) {
                  this.$message({
                      showClose: true,
                      message: Vue.t("storage.VOLUME_EXCEED_SIZE"),
                      type: 'warning'
                  });
                  this.isDisabled = false;
                  return;
               }
             }
             body.volume['imageRef'] = imageId;
          }
          if (this.newVolume.origin == "5") {
             let imageId = this.newVolume.instanceSolt;
             if (!imageId) {
                this.$message({
                    showClose: true,
                    message: Vue.t('storage.instanceSoltNotAllowNull'),
                    type: 'warning'
                 });
                 this.isDisabled = false;
                 return;
             }
             let instanceSolt = this.getInstanceSoltSize(imageId);
             if (instanceSolt > size * 1024 * 1024 * 1024) {
                //云主机快照大小大于卷的大小
                this.$message({
                    showClose: true,
                    message: Vue.t('storage.volCapaLessThaninstanceSolt'),
                    type: 'warning'
                 });
                 this.isDisabled = false;
                 return;
             }
             body.volume['imageRef'] = imageId;
          }

         if (this.newVolume.origin == "4" && this.newVolume.origin == 4) {
             body = {};
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
             if (this.oldSize > size) {
                //镜像大小大于卷的大小
                this.$message({
                    showClose: true,
                    message: Vue.t('storage.volCapaLessThanOriginVol'),
                    type: 'warning'
                 });
                 this.isDisabled = false;
                 return;
             }
             if ("0" == roleType) {
              body = {"volume": {"name": name, "size": size, "description": description, "source_volid": svolId, "project_id": selectProjectId, "user_id": userId, "availability_zone": zone}};
             } else {
              body = {"volume": {"name": name, "size": size, "description": description, "source_volid": svolId, "availability_zone": zone}};
             }
          }
          if (this.newVolume.count == 1) {
            body = JSON.stringify(body);
            try {
              let logObj = {
                description:{
                  en:"create volume" + name,
                  zh_cn:"创建云硬盘:" + name
                },
                target: Vue.logTarget.storage_volume
              };
              if (this.entranceCode === "CloneVolume") {
                logObj = {
                  description: {
                    en:"Volume clone:" + name,
                    zh_cn:"通过云硬盘克隆创建云硬盘:" + name
                  },
                  key: "diskname",
                  target: Vue.logTarget.storage_volume
                };
              }
              let ret = await this.$ajax({
                url: url,
                data: body,
                type: type,
                successMsg: msg,
                log: logObj
              });
              this.$emit("handleShow", {});
              this.$emit("getData", {});
              if (!this.isShowOriginFlag) {
                this.$emit("hrefToVolumeListPage", {});
              }
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
              body.volume['name'] = "{diskname}";
              try {
                let logObj = {
                       description: {
                        en: "create volume",
                        zh_cn: "创建云硬盘"
                        },
                       key: "diskname",
                       target: Vue.logTarget.storage_volume
                       };
                if (this.entranceCode === "CloneVolume") {
                  logObj = {
                       description: {
                        en: "Volume clone",
                        zh_cn: "通过云硬盘克隆创建云硬盘"
                        },
                       key: "diskname",
                       target: Vue.logTarget.storage_volume
                       };
                }
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
                     if (!this.isShowOriginFlag) {
                        this.$emit("hrefToVolumeListPage", {});
                      }
                  }).catch((err) => {
                    this.loading = false;
                    this.isDisabled = false;
                    __DEV__ && console.error(err);
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
    getSoltSize(soltId) {
      for (let q = 0; q < this.soltOptions.length; q++) {
        let soltTemp = this.soltOptions[q];
        if (soltId == soltTemp.id) {
          return soltTemp.sizeGB;
        }
      }
      return 0;
    },
    getImageSize(imageId) {
      for (let q = 0; q < this.imageOptions.length; q++) {
        let imageTemp = this.imageOptions[q];
        if (imageId == imageTemp.id) {
          return imageTemp.sizeB;
        }
      }
      return 0;
    },
    getImageVirtualSize(imageId) {
      for (let q = 0; q < this.imageOptions.length; q++) {
        let imageTemp = this.imageOptions[q];
        if (imageId == imageTemp.id) {
          return imageTemp["inspur_virtual_size"] || 0;
        }
      }
      return 0;
    },
    getImageMinDisk(imageId) {
      for (let q = 0; q < this.imageOptions.length; q++) {
        let imageTemp = this.imageOptions[q];
        if (imageId == imageTemp.id) {
          return imageTemp["min_disk"] || 0;
        }
      }
      return 0;
    },
    getInstanceSoltSize(instanceSoltId) {
      for (let q = 0; q < this.instanceSoltOptions.length; q++) {
        let instanceSoltTemp = this.instanceSoltOptions[q];
        if (instanceSoltId == instanceSoltTemp.id) {
          return instanceSoltTemp.sizeB;
        }
      }
      return 0;
    },
    getSvolSize(svolId) {
      for (let q = 0; q < this.volumesOptions.length; q++) {
        let svolTemp = this.volumesOptions[q];
        if (svolId == svolTemp.id) {
          return svolTemp.sizeGB;
        }
      }
      return 0;
    },
    projectChange() {
      let selectProjectId = this.newVolume.project;
      if (typeof (selectProjectId) == "undefined" || null == selectProjectId || '' == selectProjectId) {
        return;
      }
      this.getCountValue();
      this.loadUserList();
      //只有云硬盘界面，创建云硬盘不需要查询快照，云硬盘等信息。
      if (this.entranceCode === "NewVolume") {
        this.getInstanceSoltOptions();
        this.newVolume.instanceSolt = "";
        this.getImageOptions();
        this.newVolume.image = "";
        this.getVolumeSoltOptions();
        this.newVolume.volumes = "";
        this.getVolumesOptions();
        this.newVolume.solt = "";
      }
      this.newVolume.count = 1;
      this.newVolume.size = 1;
    },
    originChange(val) {
      switch (val) {
        case "1": this.originChangeFlag = "new"; break;//新建
        case "2": this.originChangeFlag = "volumeSnapshot"; break;//云硬盘快照
        case "3": this.originChangeFlag = "image"; break;//镜像
        case "4": this.originChangeFlag = "volume"; break;//云硬盘
        case "5": this.originChangeFlag = "instanceSolt"; break;//云主机快照
        default: break;
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
    }
  }
}
</script>
