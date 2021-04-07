<template>
<div>
  <el-dialog :title="$t('storage.volumeManagment')" :visible.sync="visible" :before-close="closeFun">
    <el-form ref="volumeManagmentForm" class="me-required-form" :model="volumeManagment" label-width="100px" :rules="rules" v-loading="loading"  label-position="left">
      <!-- 项目 -->
      <el-form-item :label="$t('lang.project')" prop="project" class="is-required">
        <el-input auto-complete="off" icon="" v-bind:style="widthStyle" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="volumeManagment.projectName"></el-input>
      </el-form-item>
      <!--用户-->
      <el-form-item :label="$t('storage.user')" prop="project" class="is-required">
         <el-select v-model="volumeManagment.userId" v-bind:style="widthStyle" filterable>
          <el-option v-for="item in userList" :key="item.id" :label="item.name" :value="item.id" :title="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <!--名称-->
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input v-model="volumeManagment.name" auto-complete="off" v-bind:style="widthStyle"></el-input>
      </el-form-item>
      <!--被纳管的卷名称-->
      <el-form-item :label="$t('calcStorLang.fvolumeName')" prop="volumeName" class="is-required">
        <el-input v-model="volumeManagment.volumeName" auto-complete="off" v-bind:style="widthStyle"></el-input>
        <el-tooltip placement="top" trigger="hover">
          <div slot="content">{{$t('storage.volumeManagmentMsg')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
       <!--选择后端存储名称-->
      <el-form-item :label="$t('storage.bakend')" prop="host" class="is-required">
        <el-select v-model="volumeManagment.host" v-bind:style="widthStyle" @change="changeHostFun" filterable>
          <el-option v-for="item in hostOptions" :key="item.name" :label="item.name" :title="item.name" :value="item.name"></el-option>
        </el-select>
      </el-form-item>
       <!--选择云硬盘类型-->
      <el-form-item :label="$t('storage.volumeType')" prop="type">
        <el-select v-model="volumeManagment.type" v-bind:style="widthStyle" filterable clearable>
          <el-option v-for="item in volumeTypeOptions" :key="item.id" :label="item.name" :value="item.id" :title="item.name"></el-option>
        </el-select>
      </el-form-item>
      <!--可用域-->
      <el-form-item :label="$t('storage.volumeZone')" prop="domain" class="is-required">
        <el-select v-model="volumeManagment.domain" v-bind:style="widthStyle" filterable>
          <el-option v-for="item in zoneOptions" :key="item.value" :label="item.zoneName" :value="item.zoneName"></el-option>
        </el-select>
      </el-form-item>
      <!--描述-->
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-8" v-model="volumeManagment.description" auto-complete="off" type="textarea" v-bind:style="widthStyle" ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeFun">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
  <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
 </div>
</template>
<script>
export default {
  name:"volumeManagment",
  props: [],
  data() {
    return {
      volumeManagment:{
        projectId:"",
        projectName:"",
        userId:"",
        name:"",
        volumeName: "",
        host:"",
        type:"",
        domain:"",
        description:""
      },
      loginId: Vue.userId,
      visible: true,
      loading: false,
      roleType: Vue.roleType + "",
      userList: [],
      allTypeOptions: [],
      hostOptions: [],
      projectOptions: [],
      volumeTypeOptions:[],
      zoneOptions:[],
      projectOwner: "",
      selProjectFlg: false,
      selUserFlg: false,
      close2: "",
      saving: false,
      widthStyle:{
        width:"85%"
      },
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 255 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        volumeName: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 255 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        domain: [
          {type: 'required'}
        ],
        host: [
          { type: 'required', trigger: 'blur change' }
        ],
        description: [
          { type: 'maxSize', value: 255 }
        ]
      }
    }
  },
  async mounted() {
    let $this = this;
    try {
      this.loading = true;
      this.initFun();
      $this.loading = false;
    } catch (error) {
      $this.loading = false;
    }
  },
  methods:{
    initFun() {
      let self = this;
      self.loading = true;
      //可用域，卷类型，后端存储名称 与项目角色无关
      this.getHostOptions();
      this.getVolumeType();
      this.getZoneOptions();
      //当前登录用户参与和管理的项目列表
      const joinedProjecList = Vue.projectList;
      self.volumeManagment.projectId = self.$cookie.get("pid");
      for (let i = 0; i < joinedProjecList.length; i++) {
        let project = joinedProjecList[i];
        if (project['id'] === self.volumeManagment.projectId && project['roleId'] != "SuperAdmin") {
          self.volumeManagment.projectName = project['name'];
          break;
        }
      }
      self.volumeManagment.userId = self.loginId;
      self.loadUserList();
    },
    //过滤云硬盘类型，过滤出当前存储后端对应的类型
    changeHostFun() {
      let self = this;
      let tempArry = self.allTypeOptions;
      if (self.volumeManagment.host) {
        let host = self.hostOptions.find(function(item) {
          return item.name === self.volumeManagment.host;
        });
        if (host && host["capabilities"] && host["capabilities"]["volume_backend_name"]) {
          let hostBakendName = host["capabilities"]["volume_backend_name"];
          tempArry = self.allTypeOptions.filter(function(type) {
            return type && type["extra_specs"] && type["extra_specs"]["volume_backend_name"] && (hostBakendName === type["extra_specs"]["volume_backend_name"]);
          })
        } else {
          tempArry = [];
        }
      } else {
        tempArry = [];
      }
      self.volumeManagment.type = "";
      self.volumeTypeOptions = tempArry;
    },
    projectChange() {
      let projectId = this.volumeManagment.projectId;
      if (projectId) {
        this.loadUserList();
      }
    },
    async loadUserList() {
      let self = this;
      self.loading = true;
      self.userList = [];
      self.volumeManagment.userId = "";
      let projectId = self.volumeManagment.projectId;
      if (!self.volumeManagment.projectId) {
        return false;
      }
      let url = 'api/keystone/v3/inspur/assignments/projects/' + projectId + '/users';
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        let users = result['users'];
        let loginUser = "";
        if (users != null) {
          for (let u = 0; u < users.length; u++) {
            let userObj = users[u].user;
            self.userList.push(userObj);
            //判断一下，查询出来用户列表是否包含当前登录账号
            //如果包含，则默认展示i当前登陆用户
            //如果不包含，则展示查询出来的列表的第一个用户
            if (userObj.id === self.loginId) {
              loginUser = userObj;
            }
          }
          self.volumeManagment.userId = self.userList[0].id;
          if (loginUser) {
            self.volumeManagment.userId = loginUser.id;
          }
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    confirmFun() {
      let self = this;
      this.$refs.volumeManagmentForm.validate(async(valid) => {
        if (valid) {
          self.saving = true;
          let {
            name,
            userId,
            host,
            volumeName,
            description,
            type : vType,
            domain : zone,
            projectId : selectProjectId
          } = self.volumeManagment
          if (!userId) {
              self.$message.warning(Vue.t('storage.userNotNull'));
              self.saving = false;
              return;
          }
          if (!selectProjectId) {
              self.$message.warning(Vue.t('storage.projectNotNull'));
              this.saving = false;
              return;
          }
          let body = {
            "volume": {
              "name": name,
              "host": host,
              "user_id": userId,
              "volume_type": vType,
              "availability_zone": zone,
              "description": description,
              "project_id": selectProjectId,
              "ref": {
                "source-name": volumeName
              }
            }
          };
          let roleType = Vue.roleType + "";
          let pId = self.$cookie.get('pid');
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              type: "post",
              url: "api/cinderv3/v3/" + pId + "/os-volume-manage-inspur",
              data: body,
              successMsg: this.$t('storage.sendVolumeManagmentSuccess'),
              log: {
                "description": {
                  en:"Managment volume " + name,
                  zh_cn:"纳管云硬盘:" + name
                },
                "target": Vue.logTarget.storage_volume
              }
            });
            this.loading = false;
            this.saving = false;
            this.$emit("handleShow", {});
            this.$emit("getData", {});
          } catch (data) {
            this.loading = false;
            this.saving = false;
            __DEV__ && console.error(data);
          }
        } else {
          return false;
        }
      });
    },
    async getHostOptions() {
      let self = this;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/cinder/v3/" + this.$cookie.get('pid') + "/scheduler-stats/get_pools?detail=true",
          showErrMsg: false
        });
        let pools = result['pools'];
        self.hostOptions = pools;
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    //卷类型和项目和权限不挂钩
    async getVolumeType() {
      let self = this;
      self.loading = true;
      let projectId = this.$cookie.get('pid');
      self.volumeManagment.type = "";
      let url = "api/cinderv3/v3/" + projectId + "/inspur-types?is_public=None";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        let res = result['volume_types'];
        let allTypeOptions = [];
        for (let i = 0; i < res.length; i++) {
          const element = res[i];
          if (!element.encrypt) {
            allTypeOptions.push(element);
          }
        }
        self.allTypeOptions = allTypeOptions;
        self.loading = false;
      } catch (res) {
        self.loading = false;
        self.$message.error(Vue.t('storage.getFailed'));
      }
    },
    async getZoneOptions() {
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
          self.volumeManagment.domain = zones[0].zoneName || "";
        }
      } catch (res) {
        self.loading = false;
      }
    },
    getOptionName(value) {
      if (typeof (value) == "undefined" || null == value) {
        return value;
      }
      if (value.length > 80) {
        return value.substring(0, 80);
      }
      return value;
    },
    getOptionTitle(value) {
      if (typeof (value) == "undefined" || null == value) {
        return value;
      }
      if (value.length > 80) {
        return value;
      }
      return '';
    },
    closeFun() {
      this.$emit("handleShow", {});
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.volumeManagment.projectId = id;
      this.volumeManagment.projectName = name;
      this.projectChange();
      this.loading = false;
    },
    onIconClick() {
      this.volumeManagment.projectId = '';
      this.volumeManagment.projectName = '';
    }
  }
}
</script>