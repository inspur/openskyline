<template>
<div>
  <el-form class="margin-tb20 me-required-form" label-position="left" :model="projectCreateForm" :rules=rules ref="projectCreateForm" label-width="120px">
    <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
      <el-input v-model="projectCreateForm.name" auto-complete="off" @change="nameRender"  class="col-10"></el-input>
    </el-form-item>
    <el-form-item :label="$t('lang.desc')" prop="description" class="">
      <el-input v-model="projectCreateForm.description" auto-complete="off" class="col-10" type="textarea"></el-input>
    </el-form-item>
    <el-form-item :label="$t('lang.project')" prop="projectName" class="is-required"  v-if="detailConfig.roleType === '0'" >
      <el-input auto-complete="off" class="col-10" :icon="close" :on-icon-click="onIconClick" @focus="selectProject" v-model="projectCreateForm.projectName"></el-input>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.user')" prop="projectOwner" class="is-required"  v-if="detailConfig.roleType == '0'" >
      <el-input auto-complete="off" class="col-10" :icon="close2" :on-icon-click="onIconClick2" @focus="selectUser" v-model="projectCreateForm.projectOwner"></el-input>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.az')" prop="domain" class="is-required">
      <el-select v-model="projectCreateForm.domain"  class="col-10">
        <el-option v-for="item in zoneOptions" :key="item.value" :label="item.zoneName" :value="item.zoneName"></el-option>
      </el-select>
    </el-form-item>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="nextStep" type="primary">{{$t('lang.nextStep')}}</el-button>
    </div>
  </el-form>

  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import formatFileSize from 'utils/formatFileSize';
export default {
  name: 'StepOne',
  props: ['detailConfig'],
  data() {
    return {
      isManual: false,
      close:"",
      close2:"",
      activeIndex: 0,
      projectName:"",
      numberForAuto: 1,
      projectCreateForm: {
        name: '',
        description: '',
        domain: '',
        count: '',
        userName: '',
        userPass: '',
        userKey: '',
        enabled: true,
        type: "1",
        nodeHostName: "",
        phyHost: '12',
        projectList: '',
        userUuId: '',
        projectId: '',
        projectOwner:'',
        projectName:'',
        bareUUID: ''
      },
      azoneMaps: new Map(),
      formatFileSize:formatFileSize,
      hostName: '',
      totalData: [],
      hostList: [],
      phySelectFlag: false,
      number: '1',
      projectOwner:'',
      projectOptions: [],
      projectUserOptions: [],
      netTypeOptions: [{ value: '1', label: 'nova' }],
      zoneOptions: [],
      phyOptions: [{ value: '12', label: '裸机12' }, { value: '13', label: '裸机13' }],
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        description: [
          { type: 'maxSize', value: 255 }
        ],
        projectName: [
          { type: 'required', trigger: 'blur change' }
        ],
        projectOwner: [
          { type: 'required', trigger: 'blur change' }
        ],
        domain: [
          { type: 'required', trigger: 'blur change' }
        ]
      },
      currentPage: 1,
      showBorder: true,
      columns: [],
      columnsChecked: ['name', 'cpus', 'local_gb', 'memory_mb'],
      tableData: [],
      multipleSelection: [],
      queryParam: {
        "page": 1,
        "pageSize": 5,
        field: "",
        dir: ""
      },
      loading: true
    }
  },
  watch:{
    number(value) {
      this.number = parseInt(value);
      this.detailConfig.count = parseInt(value) || 1;
    }
  },
  mounted() {
    var self = this;
    self.initForm = Object.assign({}, this.projectCreateForm);
    /*var pList = Vue.projectList;
    self.projectOptions = pList;
    if (pList != null && pList.length > 0) {
      self.projectCreateForm.projectList = pList[0].id;
      self.projectCreateForm.projectId = pList[0].id;
    }*/
    if (self.detailConfig.roleType == '0') {
      if (self.detailConfig.private == true) {
        var proid = self.detailConfig.proId;
        self.projectCreateForm.projectList = proid;
        self.projectCreateForm.projectId = proid;
        self.projectOptions = Vue.projectList;
      } else {
        Promise.all([self.initProjects()]).then(function(result) {
           self.loadUserList();
           self.loadProjectDetail();
        });
      }
      self.initZones();
    } else if (self.detailConfig.roleType == '2') {
      var pUuid = this.$cookie.get("pid");
      self.projectCreateForm.projectList = pUuid;
      self.projectCreateForm.projectId = pUuid;
      self.projectOptions = Vue.projectList;
      self.initZones();
      self.loadProjectDetail();
    } else if (self.detailConfig.roleType == '3') {
      self.initZones();
    }
  },
  methods: {
    countKeyUp(value) {
      var self = this;
      self.number = parseInt(value);
    },
    sortChange(column) {
       var self = this;
       var key = column.prop;
       var keyOrder = column.order;
       if (keyOrder != null && self.totalData != null) {
          if (key == "cpus" || key == "local_gb" || key == "memory_mb") {
             self.totalData.sort(this.$sortFormatter(key, keyOrder, "integer"));
          } else {
            self.totalData.sort(this.$sortFormatter(key, keyOrder));
          }
       }
    },
    async initProjects() {
      var self = this;
      var url = "api/keystone/v3/projects?domain_id=default";
      if (self.detailConfig.roleType == '2' || self.detailConfig.roleType == '3') {
          url = "api/keystone/v3/users/" + Vue.userId + "/projects";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        self.loading = false;
        var pList = result['projects'];
        if (pList != null && pList.length > 0) {
          self.projectCreateForm.projectList = pList[0].id;
          self.projectCreateForm.projectId = pList[0].id;
        }
        self.projectOptions = pList;
      } catch (res) {
        self.loading = false;
      }
    },
    async loadProjectDetail() {
      var self = this;
      var url = "api/nova/v2.1/os-quota-sets/" + self.projectCreateForm.projectId + "/detail";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        self.loading = false;
        var detail = result['quota_set']['instances'];
        var totalInstance = detail['limit'] == "-1"?"无限制":detail['limit'];
        self.detailConfig.instLimit = totalInstance;
        self.detailConfig.instInUse = detail['in_use'];
      } catch (res) {
        self.loading = false;
      }
    },
    async loadUserList() {
      var self = this;
      self.projectCreateForm.userUuId = "";
      self.projectUserOptions = [];
      var projectUuId = self.projectCreateForm.projectId;
      if (projectUuId != "") {
        self.loading = true;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: 'api/keystone/v3/inspur/assignments/projects/' + projectUuId + '/users'
          });
          var list = result['users'];
          var usersList = [];
          if (list != null) {
             for (let u = 0; u < list.length; u++) {
                var userObj = list[u].user;
                usersList.push(userObj);
             }
             self.projectCreateForm.userUuId = usersList[0].id;
          }
          self.projectUserOptions = usersList;
          self.loading = false;
        } catch (res) {
          self.loading = false;
        }
      }
    },
    selectProject() {
      this.$emit("selectProject", {});
      // this.selProjectFlg = true;
      // this.$nextTick(() => {
      //   this.$refs.selectProject.show();
      // });
    },
    /*domainChange(value) {
       const self = this;
       if (self.detailConfig.roleType == '0' && self.projectCreateForm.type == '2') {
          self.multipleSelection = [];
          self.totalData = [];
          self.initHostList();
       }
    },*/
    async initZones() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/inspur-availability-zone/detail'
        });
        self.loading = false;
        var list = result['availabilityZoneInfo'];
        var zones = [];
        if (list != null) {
          for (var z = 0; z < list.length; z++) {
            var zone = list[z];
            var zoneState = zone['zoneState'];
            if (zone['zoneName'] != "internal" && zoneState['available'] == true) {
              zones.push(zone);
              /*var arr = self.loadZoneAndHostCompare(zone.hosts);
              if (arr.length > 0) {
                zones.push(zone);
              }*/
            }
          }
        }
        self.zoneOptions = zones;
        if (zones.length > 0) {
          self.projectCreateForm.domain = zones[0].zoneName || "";
        }
      } catch (res) {
        self.loading = false;
      }
    },
    loadZoneAndHostCompare(list) {
      var rets = [];
      for (var z in list) {
        var obj = list[z];
        if (z.indexOf("ironic") >= 0) {
          rets.push(z);
        }
      }
        return rets;
    },
/*    async initHostList() {
      let self = this;
      self.totalData = [];
      self.hostList = [];
      try {
        let zones = [];
        let UUIDArr = [];
        let zoneInfo = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/inspur-availability-zone/detail'
        });
        let hypervisors = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-hypervisors-inspur/detail'
        });
        let availabilityZoneInfo = zoneInfo.availabilityZoneInfo;
        for (let v of availabilityZoneInfo) {
          if (v.zoneName === self.projectCreateForm.domain) {
            let zoneObj = {};
            let hosts = [];
            zoneObj.zoneName = v.zoneName;
            for (let [hostname, value] of Object.entries(v.hosts)) {
              hosts.push(hostname);
            }
            zoneObj.hosts = hosts;
            zones.push(zoneObj);
          }
        }
        for (let zone of zones) {
          for (let zoneinfo of hypervisors.hypervisors) {
            if (zone.hosts.includes(zoneinfo.service.host)) {
              UUIDArr.push(zoneinfo.hypervisor_hostname);
            }
          }
        }
        let result = await self.$ajax({
          type: 'get',
          url: 'api/ironic/v1/nodes/detail?provision_state=available&maintenance=false'
        });
        self.loading = false;
        let resList = result['nodes'];
        if (resList != null) {
          for (let h = 0; h < resList.length; h++) {
            let UUID = resList[h].uuid;
            if (UUIDArr.includes(UUID)) {
              let host = resList[h].properties;
              host.name = resList[h].name;
              host.uuid = resList[h].uuid;
              self.totalData.push(host);
              self.hostList.push(host);
            }
          }
        }
      } catch (res) {
        self.loading = false;
      }
    },*/
   /* searchHost() {
       let self = this;
       let rets = [];
       let name = self.hostName;
       if ( name != "") {
         for (let t = 0; t < self.hostList.length; t++) {
           let obj = self.hostList[t];
           if (obj.name.indexOf(name) != -1) {
             rets.push(obj);
           }
         }
           self.totalData = rets;
      } else {
        self.initHostList();
      }
    },*/
    getCurrentData(param) {
      this.tableData = param;
    },
    projectChange(value) {
      this.projectCreateForm.projectId = value;
      this.projectCreateForm.userUuId = "";
      this.projectCreateForm.projectOwner = '';
      // this.loadUserList();
      this.loadProjectDetail();
    },
    onIconClick() {
      this.projectCreateForm.projectId = '';
      this.projectCreateForm.projectName = '';
      this.onIconClick2();
      this.close = '';
    },
    onIconClick2() {
      this.projectCreateForm.userUuId = "";
      this.projectCreateForm.projectOwner = '';
      this.close2 = '';
    },
    selectUser() {
      this.$emit("selectUser", {});
      // this.selUserFlg = true;
      // this.$nextTick(() => {
      //   this.$refs.selectUser.show();
      // });
    },
    nextStep() {
      const self = this;
      this.$refs.projectCreateForm.validate((valid) => {
        if (valid) {
          if (self.projectCreateForm.type == "2" && !self.multipleSelection.length) {
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateChoosePhy'),
              type: 'warning'
            });
            return false;
          } else {
            [self.detailConfig.cpu, self.detailConfig.memory, self.detailConfig.disk] = ["--", "--", "--"];
            this.$emit("stepOneDone", {});
          }
        } else {
          return false;
        }
      });
    },
    highOptionClick() {
      var self = this;
    },
    nameRender(value) {
      this.detailConfig.name = value;
    },
    countRender(value) {
      this.detailConfig.count = value;
    },
    cancel() {
      this.$emit("cancel");
    },
    async getData(param) {
      var self = this;
    },
    cpuUsedRender(value, rowData) {
      return value || "0";
    },
    memUsedRender(value, rowData) {
      return value ? (value + "GB") : "0";
    },
    diskUsedRender(value, rowData) {
      return value ? this.formatFileSize(value, "MB") : "0";
    },
    /*phyTypeSel(value) {
      let self = this;
      self.projectCreateForm.bareUUID = "";
      this.multipleSelection = [];
      if ("1" == value) {
        this.number = this.numberForAuto || 1;
        self.phySelectFlag = false;
        self.isManual = false;
      } else {
        this.numberForAuto = this.number
        this.number = 1;
        self.phySelectFlag = true;
        self.isManual = true;
        self.initHostList();
      }
    },*/
    handleSelectionChange(val) {
      if (val != null) {
        let list = [];
        list.push(val);
        this.multipleSelection = list;
        this.projectCreateForm.nodeHostName = val['name'];
        this.projectCreateForm.bareUUID = val.uuid;
      }
    }
    /*onRefresh() {
      this.initHostList();
    }*/
  }
}

</script>
