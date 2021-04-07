<template>
  <el-form class="margin-tb20 me-required-form" label-position="left" :model="projectCreateForm" :rules=rules ref="projectCreateForm" :label-width="labelWidth">
    <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
      <el-input v-model="projectCreateForm.name" auto-complete="off" @change="nameRender"  class="col-10"></el-input>
    </el-form-item>
    <el-form-item :label="$t('lang.desc')" prop="description" class="">
      <el-input v-model="projectCreateForm.description" auto-complete="off" class="col-10" type="textarea"></el-input>
    </el-form-item>
    <el-form-item :label="$t('lang.project')" prop="projectList" class="is-required" v-if="detailConfig.roleType != '3'" >
      <!-- <el-select v-model="projectCreateForm.projectList" @change="projectChange"  :disabled="detailConfig.roleType == '2'||detailConfig.private == true"  filterable  class="col-10">
        <el-option v-for="item in projectOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select> -->
      <el-input auto-complete="off" class="col-10" :icon="close" :on-icon-click="onIconClick" @focus="selectProject" v-model="projectCreateForm.projectName" :disabled="detailConfig.roleType == '2'||detailConfig.private == true" :placeholder="$t('calcStorLang.pleaseChoose')"></el-input>
    </el-form-item>
    <el-form-item :label="$t('lang.project')" class="is-required" v-if="detailConfig.roleType == '3'">
      <el-select v-model="projectCreateForm.userProject" :disabled="detailConfig.roleType=='3'"  filterable  class="col-10">
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.user')" prop="userUuId" class="is-required"  v-if="detailConfig.roleType == '0'" >
      <el-select v-model="projectCreateForm.userUuId"  filterable  class="col-10">
        <el-option v-for="item in projectUserOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.az')" prop="domain" class="is-required">
      <el-select v-model="projectCreateForm.domain"  class="col-10" @change="domainChange">
        <el-option v-for="item in zoneOptions" :key="item.value" :label="item.zoneName" :value="item.zoneName"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('lang.host')" class="is-required"  v-if="detailConfig.roleType == '0'">
      <el-radio-group v-model="projectCreateForm.type" @change="phyTypeSel">
        <el-radio class="radio" label="1">{{$t('calcStorLang.createInstAuto')}}</el-radio>
        <el-radio class="radio" label="2">{{$t('calcStorLang.createInstManual')}}</el-radio>
      </el-radio-group>
      <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstHostTip')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
    </el-form-item>
    <el-form-item label="" class="is-required" v-show="phySelectFlag">
      <el-input :placeholder="$t('lang.host') + $t('lang.name')" size="small" class="col-10" v-model="hostName"></el-input>
      <el-button type="primary" icon='fa-search' size="small"  @click="searchHost">{{$t('lang.query')}}</el-button>
      <el-table ref="acTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="id" @current-change="handleSelectionChange" :default-sort="{prop: 'name', order: 'ascending'}" @sort-change="sortChange">
        <!-- <el-table-column reserve-selection type="selection" width="55">
        </el-table-column> -->
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="hypervisor_hostname" min-width="50" sortable="custom">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('os') >= 0" prop="vcpus_used" :label="$t('calcStorLang.createInstCpuUsed')" min-width="80" sortable="custom">
          <template slot-scope="scope">
            <span v-html="cpuUsedRender(scope.row.vcpus, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('vcpus') >= 0" prop="memory_mb_used" :label="$t('calcStorLang.createInstMemoryUsed')" min-width="80" sortable="custom">
          <template slot-scope="scope">
            <span v-html="memUsedRender(scope.row.memory_mb, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('ram') >= 0" prop="local_gb_used" :label="$t('calcStorLang.createInstStorUsed')" min-width="80" sortable="custom">
          <template slot-scope="scope">
            <span v-html="diskUsedRender(scope.row.local_gb, scope.row)"></span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <!-- <el-button type="text" icon="fa-refresh" @click="onRefresh">
            </el-button>
            <span>当前选中 {{multipleSelection.length}}条</span> -->
            <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
            </el-popover>
          </el-col>
          <el-col :span="24">
            <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
          </el-col>
        </el-row>
      </div>
    </el-form-item>
    <!-- <el-form-item :label="$t('calcStorLang.createInstConsoleTip1')" prop="vncPassword">
      <el-input :placeholder="$t('calcStorLang.createInstConsoleTip2')" size="small" v-model="projectCreateForm.vncPassword" type="password" class="col-10"></el-input>
      <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstancePasWarn')">
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item> -->
    <el-form-item :label="$t('calcStorLang.count')" prop="count" class="is-required">
      <el-input-number v-model="number" :min="1" :max="projectCreateForm.maxInst" @change="countRender" :disabled="countDisabled"></el-input-number>
      <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstCountTip')">
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="nextStep" type="primary">{{$t('lang.nextStep')}}</el-button>
    </div>
  </el-form>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import formatFileSize from 'utils/formatFileSize';
export default {
  name: 'StepOne',
  props: ['detailConfig'],
  data() {
    return {
      activeIndex: 0,
      labelWidth:this.$cookie.get("defaultLanguage")=="en"?"140px":"120px",
      projectCreateForm: {
        name: '',
        projectName: '',
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
        userProject:'',
        vncPassword:'',
        maxInst: 200
      },
      countDisabled: false,
      close: "",
      azoneMaps: new Map(),
      formatFileSize:formatFileSize,
      hostName: '',
      totalData: [],
      hostList: [],
      phySelectFlag: false,
      number: '1',
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
        projectList: [
          { type: 'required', trigger: 'blur change' }
        ],
        userUuId: [
          { type: 'required', trigger: 'blur change' }
        ],
        domain: [
          { type: 'required', trigger: 'blur change' }
        ],
        vncPassword: [
          { type: 'passwordLegal' }
        ]
      },
      currentPage: 1,
      showBorder: true,
      columns: [],
      columnsChecked: ['name', 'hostname', 'os', 'vcpus', 'ram', 'disk'],
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
  /*watch:{
    number(value) {
      this.number = parseInt(value);
      this.detailConfig.count = parseInt(value) || 1;
    }
  },*/
  mounted() {
    var self = this;
    self.initForm = Object.assign({}, this.projectCreateForm);
    var pUuid = this.$cookie.get("pid");
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
        self.changeQuota(proid);
      } else {
        self.loadProjectDetail();
        /*Promise.all([self.initProjects()]).then(function(result) {
           self.loadUserList();
           self.loadProjectDetail();
        });*/
        self.changeQuota(this.$cookie.get("pid"));
      }
      self.initZones();
    } else if (self.detailConfig.roleType == '2') {
      self.projectCreateForm.projectList = pUuid;
      self.projectCreateForm.projectId = pUuid;
      self.projectOptions = Vue.projectList;
      self.loadProjectName();
      self.initZones();
      self.loadProjectDetail();
    } else if (self.detailConfig.roleType == '3') {
      self.projectCreateForm.projectList = pUuid;
      self.projectCreateForm.projectId = pUuid;
      self.loadProjectDetail();
      self.loadProjectName();
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
          if (key == "vcpus_used" || key == "memory_mb_used" || key == "local_gb_used") {
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
    loadProjectName() {
      var self = this;
      var userPlist = Vue.projectList;
      var pUuid = self.$cookie.get("pid");
      for (let pp = 0; pp < userPlist.length; pp++) {
        var ppObj = userPlist[pp];
        if (ppObj.id == pUuid) {
          if (Vue.roleType + "" == "3") {
            self.projectCreateForm.userProject = ppObj.name;
          } else {
            if (ppObj.roleId == "SuperAdmin") {
              self.projectCreateForm.projectName = "admin";
            } else {
              self.projectCreateForm.projectName = ppObj.name;
            }
          }
          break;
        }
      }
      self.changeQuota(pUuid);
    },
    async loadProjectDetail() {
      var self = this;
      if (self.projectCreateForm.projectList != "" && self.projectCreateForm.projectList != null) {
        var url = "api/nova/v2.1/os-quota-sets/" + self.projectCreateForm.projectList + "/detail";
        try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        self.loading = false;
        var detail = result['quota_set']['instances'];
        var totalInstance = detail['limit'] == "-1"?this.$t('calcStorLang.instUnlimited'):detail['limit'];
        if (detail['limit'] != "-1") {
          var currentValue = parseInt(totalInstance) - parseInt(detail['in_use']);
          self.projectCreateForm.maxInst = (parseInt(currentValue) > 200)?200:parseInt(currentValue);
        } else {
          self.projectCreateForm.maxInst = 200;
        }
        self.detailConfig.proId = self.projectCreateForm.projectList;
        self.detailConfig.instLimit = totalInstance;
        self.detailConfig.instInUse = detail['in_use'];
      } catch (res) {
        self.loading = false;
      }
      }
    },
    async loadUserList() {
      var self = this;
      self.projectCreateForm.userUuId = "";
      self.projectUserOptions = [];
      var projectUuId = self.projectCreateForm.projectList;
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
          }
          self.projectUserOptions = usersList;
          if (list.length > 0) {
            self.projectCreateForm.userUuId = usersList[0].id;
          }
          self.loading = false;
        } catch (res) {
          self.loading = false;
        }
      }
    },
    domainChange(value) {
       var self = this;
       if (self.detailConfig.roleType == '0' && self.projectCreateForm.type == '2') {
          self.multipleSelection = [];
          self.totalData = [];
          self.initHostList();
       }
    },
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
              var arr = self.loadZoneAndHostCompare(zone.hosts);
              if (arr.length > 0) {
                zones.push(zone);
              }
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
          continue;
        } else {
          rets.push(z);
        }
      }
        return rets;
    },
    async initHostList() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-hypervisors/detail'
        });
        self.loading = false;
        var hostResList = [];
        var resList = result['hypervisors'];
        if (resList != null) {
          for (let h = 0; h < resList.length; h++) {
              var host = resList[h];
              if (host['hypervisor_type'] == "ironic" || host['state'] == "down") {
                  continue;
              } else {
                 hostResList.push(host);
              }
          }
        }
        var zoneHostList = self.azoneMaps.get(self.projectCreateForm.domain);
        var list = Object.keys(zoneHostList).map(function(el) {
          return el;
        });
        var zoneHosts = [];
        for (let a = 0; a < list.length; a++) {
            var zoneName = list[a];
            for (let b = 0; b < hostResList.length; b++) {
               var allHostObj = hostResList[b];
               if (allHostObj['hypervisor_hostname'] == zoneName) {
                  zoneHosts.push(allHostObj);
                  break;
               }
            }
        }
        self.totalData = zoneHosts;
        self.hostList = zoneHosts; //hostResList
        // self.total = result['hypervisors'].length;
      } catch (res) {
        self.loading = false;
      }
    },
    //加载az域
    async loadAZoneList() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-availability-zone/detail'
        });
        self.loading = false;
        var hostResList = [];
        var resList = result['availabilityZoneInfo'];
        if (resList != null) {
          for (let h = 0; h < resList.length; h++) {
              var zone = resList[h];
              self.azoneMaps.set(zone.zoneName, zone['hosts']);
          }
        }
      } catch (res) {
        self.loading = false;
      }
    },
    searchHost() {
       var self = this;
       var rets = [];
       var name = self.hostName;
       if ( name != "") {
         for (let t = 0; t < self.hostList.length; t++) {
           var obj = self.hostList[t];
           if (obj['hypervisor_hostname'].indexOf(name) >= 0) {
             rets.push(obj);
           }
         }
           self.totalData = rets;
      } else {
        self.initHostList();
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    projectChange(value) {
      this.projectCreateForm.projectId = value;
      this.projectCreateForm.userUuId = "";
      this.number = 1;
      this.loadUserList();
      this.loadProjectDetail();
    },
    nextStep() {
      var self = this;
      this.$refs.projectCreateForm.validate((valid) => {
        if (valid) {
          if (!Number.isInteger(self.number)) {
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateMustInteger'),
              type: 'warning'
            });
            return;
          } else {
            if (this.projectCreateForm.type == "2" && this.multipleSelection.length === 0) {
              self.$message({
                showClose: true,
                message: Vue.t('calcStorLang.instCreateChooseHost'),
                type: 'warning'
              });
              return false;
            } else {
              this.$emit("stepOneDone", {});
            }
          }
        } else {
          return false;
        }
      });
    },
    selectProject() {
      if (Vue.roleType + "" == "0") {
        this.$emit("handleProjectShow");
      }
    },
    async changeQuota(id) {
      if ((this.detailConfig.roleType == '3' && this.projectCreateForm.userProject == "") || (this.detailConfig.roleType !== '3' && this.projectCreateForm.projectName !== "")) {
        let ret = await this.$ajax({
            url: 'api/nova/v2.1/os-quota-sets/' + id + '/detail',
            type: 'get'
          });
        let result = ret.quota_set;
        this.detailConfig.vCPU = result.cores.in_use + Vue.t('calcStorLang.core') + "/" + (result.cores.limit>0?(result.cores.limit + Vue.t('calcStorLang.core')):Vue.t('base.unlimited'));
        this.detailConfig.mem = Number(result.ram.in_use/1024).toFixed(2) + "GB/" + (result.ram.limit>0?(Number(result.ram.limit/1024).toFixed(2) + "GB"):Vue.t('base.unlimited'));
        this.detailConfig.host = result.instances.in_use + Vue.t('storage.pc') + "/" + (result.instances.limit>0?(result.instances.limit + Vue.t('storage.pc')):Vue.t('base.unlimited'));
      }
    },
    onIconClick() {
      this.projectCreateForm.projectList = '';
      this.projectCreateForm.projectId = '';
      this.projectCreateForm.projectName = '';
      this.close = '';
      this.detailConfig.vCPU = "";
      this.detailConfig.mem = "";
      this.detailConfig.host = "";
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
      return rowData['vcpus_used'] + "/" + value;
    },
    memUsedRender(value, rowData) {
      return this.formatFileSize(rowData['memory_mb_used'], "MB") + "/" + this.formatFileSize(value, "MB");
    },
    diskUsedRender(value, rowData) {
      return this.formatFileSize(rowData['local_gb_used'], "GB") + "/" + this.formatFileSize(value, "GB");
    },
    phyTypeSel(value) {
      var self = this;
      self.detailConfig.type = value;
      if ("1" == value) {
        self.phySelectFlag = false;
      } else {
        self.phySelectFlag = true;
        Promise.all([self.loadAZoneList()]).then(function(result) {
           self.initHostList();
        });
      }
    },
    handleSelectionChange(val) {
      if (val != null) {
        var list = [];
        list.push(val);
        this.multipleSelection = list;
        this.projectCreateForm.nodeHostName = val['hypervisor_hostname'];
      }
      /*val.forEach((row, index) => {
        if (index === val.length - 1) return;
        this.$refs.acTable.toggleRowSelection(row, false);
      })
      this.projectCreateForm.nodeHostName = val[0]['hypervisor_hostname'];
      this.multipleSelection = val;*/
    },
    onRefresh() {
      this.initHostList();
    }
  }
}

</script>
