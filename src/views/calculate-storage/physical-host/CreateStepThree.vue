<template>
  <el-form class="margin-tb20 me-required-form" label-position="left"  label-width="150px">
    <el-form-item :label="$t('calcStorLang.cpuCore')" prop="cpu" class="is-required">
      <el-radio-group v-model="cpuValue" size="large" @change="cpuValueChange">
        <el-radio-button class="clearfix" v-for="(cpu, index) in projectCreateForm.cpuMap" :key="cpu.value" :label="cpu.value" :disabled="cpu.disabled" :command="index">
          {{cpu.value}}
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.memGB')" prop="memory" class="is-required">
      <el-radio-group v-model="memValue" size="large" @change="memoryValueChange">
        <el-radio-button class="clearfix" v-for="(memory, index) in projectCreateForm.memoryMap" :key="memory.value" :label="memory.value" :disabled="memory.disabled" :command="index">
          {{memory.value}}
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.diskGB')" prop="disk" class="is-required">
      <el-radio-group v-model="diskValue" size="large" @change="diskValueChange">
        <el-radio-button class="clearfix" v-for="(disk, index) in projectCreateForm.diskMap" :key="disk.value" :label="disk.value" :disabled="disk.disabled||memValue==''" :command="index">
          {{disk.value}}
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.bareSpec')" prop="" class="is-required">
      <el-select v-model="resourceSpec"  class="col-10" @change="resSpecChange" filterable>
        <el-option v-for="item in specOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select>
      <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.bareSpecTip')">
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.bareMetals')" class="is-required">
      <el-radio-group v-model="projectCreateForm.type" @change="phyTypeSel">
        <el-radio class="radio" label="1">{{$t('calcStorLang.createInstAuto')}}</el-radio>
        <el-radio class="radio" label="2">{{$t('calcStorLang.createInstManual')}}</el-radio>
      </el-radio-group>
      <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createPhyAutoTip')">
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item label="" class="is-required">
      <el-input :placeholder="$t('calcStorLang.bareMetals') + $t('lang.name')" size="small" class="col-10" v-model="hostName" style="margin-bottom: 8px"></el-input>
      <el-button type="primary" icon='fa-search' size="small"  @click="searchHost">{{$t('lang.query')}}</el-button>
      <el-table ref="acTable" :data="tableData" @row-click="rowClick" highlight-current-row stripe border style="width: 100%" row-key="id" @current-change="handleSelectionChange" :default-sort="{prop: 'name', order: 'ascending'}" @sort-change="sortChange">
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" min-width="50" sortable="custom">
          <template slot-scope="scope">
            <span v-html="scope.row.name"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('cpus') >= 0" prop="cpus" :label="$t('calcStorLang.cpuCore')" min-width="80" sortable="custom">
          <template slot-scope="scope">
            <span v-html="cpuUsedRender(scope.row.cpus)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('local_gb') >= 0" prop="local_gb" :label="$t('calcStorLang.ROOT_DISK')" min-width="80" sortable="custom">
          <template slot-scope="scope">
            <span v-html="memUsedRender(scope.row.local_gb)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('memory_mb') >= 0" prop="memory_mb" :label="$t('calcStorLang.memory')" min-width="80" sortable="custom">
          <template slot-scope="scope">
            <span v-html="diskUsedRender(scope.row.memory_mb)"></span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
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
    <el-form-item :label="$t('calcStorLang.count')" prop="count" class="is-required">
      <el-input-number v-model="number" :min="1" :max="200" class="col-10" @change="countRender" @keyup.native="countKeyUp" :disabled="isManual"></el-input-number>
    </el-form-item>
    <el-collapse class="col-24">
      <el-collapse-item :title="$t('calcStorLang.advanceOptions')" v-show="isoCofigFlag">
        <el-form class="margin-tb20" label-position="left" label-width="170px" :model="projectCreateForm" :rules=rules ref="projectCreateForm">
          <el-form-item label="创建新云硬盘" prop="dns1">
            <el-switch v-model="projectCreateForm.isNewVolume" on-text="是" off-text="否" @change="createVolume"></el-switch>
            <el-tooltip placement="top" trigger="hover" content="创建新云硬盘为系统盘">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
            <span v-show="projectCreateForm.isNewVolume + '' == 'true' " style="color:#737373">(创建云主机成功后，模板来源为云硬盘)</span>
          </el-form-item>
          <el-form-item label="云硬盘大小" v-show="volumeSizeFlag" class="is-required">
            <el-input v-model="projectCreateForm.size" auto-complete="off" class="col-8"></el-input>
            <span>GB</span>
          </el-form-item>
          <el-form-item label="删除云主机时删除云硬盘" prop="dns2" v-show="volumeSizeFlag">
            <el-switch v-model="projectCreateForm.isDelVolume" on-text="是" off-text="否"></el-switch>
            <el-tooltip placement="top" trigger="hover" content="有云硬盘快照的云硬盘不能删除">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
          </el-form-item>
          <el-form-item label="登录方式" class="">
          <el-radio-group v-model="defaultType" @change="keyPairType">
            <el-radio class="radio" :label="1">原始密码</el-radio>
            <el-radio class="radio" :label="2" :disabled="keyShowFlg || isCreateDisk">密钥对</el-radio>
            <el-radio class="radio" :label="3" :disabled="resetPassFlg || isCreateDisk">重置密码</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用户名" prop="userName" class="is-required" v-show="key2Flag && defaultType !=2">
          <el-input class="col-8" v-model="projectCreateForm.userName" auto-complete="off" disabled></el-input>
          <el-tooltip placement="top" trigger="hover" content="Windows系统为Administrator账户，Linux系统为root账户">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="密码" prop="userPass" class="is-required" v-show="key3Flag">
          <el-input class="col-8" v-model="projectCreateForm.userPass" auto-complete="off" type="password"></el-input>
          <el-tooltip placement="top" trigger="hover" content="Windows系统注入的密码需包含字母、数字和符号">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="确认密码" prop="userConfirmPass" class="is-required" v-show="key3Flag">
          <el-input class="col-8" v-model="projectCreateForm.userConfirmPass" auto-complete="off" type="password"></el-input>
        </el-form-item>
        <el-form-item label="密钥对" prop="userKey" class="is-required" v-show="key4Flag">
          <el-select v-model="keyPairValue">
            <el-option v-for="(key, index) in keyList" :key="key" :label="key" :value="key">
            </el-option>
          </el-select>
        </el-form-item>
        </el-form>
      </el-collapse-item>
      <!-- <el-collapse-item title="密钥配置" v-show="isoCofigFlag">
      </el-collapse-item> -->
    </el-collapse>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="prevStep" type="primary">{{$t('lang.preStep')}}</el-button>
      <el-button @click="nextStep" type="primary">{{$t('lang.nextStep')}}</el-button>
    </div>
  </el-form>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import MetadataDetail from './MetadataDetail';
import formatFileSize from 'utils/formatFileSize';
export default {
  name: 'StepThree',
  props: ['detailConfig', 'projectId', "domain"],
  components: { MetadataDetail },
  data() {
    return {
      formatFileSize:formatFileSize,
      hostName: '',
      totalData: [],
      hostList: [],
      isManual: false,
      number: '1',
      numberForAuto: 1,
      activeIndex: 2,
      cpuValue: '',
      memValue: '',
      diskValue: '',
      hightFlag: false,
      diskPartition: "ssh",
      volumeSizeFlag: false,
      isoCofigFlag: false,
      checkList: [],
      dispatch: "1",
      defaultType: 1,
      keyPairValue: '',
      keyList: '',
      key2Flag: false,
      key3Flag: false,
      key4Flag: false,
      keyShowFlg: false,
      resetPassFlg: false,
      isCreateDisk: false,
      showFlag: true,
      resourceSpec: '',
      resourceMetaData: '',
      specOptions: [],
      metaDataOptions: [],
      projectCreateForm: {
        nodeHostName: "",
        bareUUID: "",
        type: "1",
        cpu: '',
        memory: '',
        netcard: '',
        harddisk: '',
        size: '',
        userName: 'Administrator/root',
        userPass: '',
        flavorsUuid: "",
        cpuMap: [],
        memoryMap: [],
        diskMap: [],
        flavorList: [],
        isDelVolume: false,
        isNewVolume: false
      },
      dialogVisible: false,
      rules: {
        userPass: [
          { type: 'required', trigger: 'blur change' },
          { type: 'passwordLegal' }
        ],
        userConfirmPass: [
          { type: 'required', trigger: 'blur change' },
          { type: 'passwordEquals', context: this, value: "projectCreateForm.userPass" }
        ],
        userKey: [
          { type: 'required', trigger: 'blur change' }
        ]
      },
      currentPage: 1,
      showBorder: true,
      columns: [],
      columnsChecked: ['name', 'cpus', 'local_gb', 'memory_mb'],
      tableData: [],
      regularTableData: [],
      multipleSelection: [],
      loading: false
    }
  },
  updated() {
    var self = this;
    if (self.defaultType == 1) {
      self.rules.userPass = [];
      self.rules.userConfirmPass = [];
      self.rules.userKey = [];
    } else if (self.defaultType == 2) {
      self.rules.userPass = [];
      self.rules.userConfirmPass = [];
      self.rules.userKey = [{ type: 'required', trigger: 'blur change' }];
    } else {
      self.rules.userPass = [{ type: 'required', trigger: 'blur change' }, { type: 'passwordLegal' }];
      self.rules.userConfirmPass = [{ type: 'required', trigger: 'blur change' }, { type: 'passwordEquals', context: this, value: "projectCreateForm.userPass" }];
      self.rules.userKey = [];
    }
  },
  watch: {
    number(value) {
      this.number = parseInt(value);
      this.detailConfig.count = parseInt(value) || 1;
    },
    "domain": {
      immediate: false,
      handler: function(val, oldVal) {
        this.multipleSelection = [];
        this.totalData = [];
       this.initHostList();
      }
    },
     'projectCreateForm.memoryMap': {
      immediate: false,
      deep: true,
      handler: function(rows, oldVal) {
        var self = this;
        if (this.cpuValue != "") {
          var list = this.projectCreateForm.memoryMap;
          if (list != null) {
          for (let m = 0; m < list.length; m++) {
             var obj = list[m];
             if ( (obj.disabled + "") == "false" ) {
                self.memValue = obj.value;
                self.memoryValueChange(obj.value);
                break;
             }
          }
        }
        }
      }
    },
    'projectCreateForm.diskMap': {
      immediate: false,
      deep: true,
      handler: function(rows, oldVal) {
        var self = this;
        if (this.cpuValue != "" && this.memValue != "") {
            var list = this.projectCreateForm.diskMap;
            if (list != null) {
              for (let m = 0; m < list.length; m++) {
                var obj = list[m];
                if ( (obj.disabled + "") == "false" ) {
                  self.diskValue = obj.value;
                  break;
                }
              }
            }
            if (self.diskValue != "" && self.memValue != "" && self.cpuValue != "") {
              self.findFlavorsAndMetaList();
              self.initHostList();
            }
        }
      }
    },
    'detailConfig.proUserId': {
      handler: function(rows, oldVal) {
        var self = this;
        var keyPairType = self.defaultType;
        if (self.isoCofigFlag && "2" == keyPairType) {
          self.keyPairValue = "";
          self.loadKeyPair();
        }
      }
    },
    projectId() {
      var self = this;
      if (Vue.roleType + "" == "0") {
        Promise.all([self.init(this.currentPage)]).then(function(result) {
          if (self.projectCreateForm.cpuMap != null) {
            self.cpuValue = self.projectCreateForm.cpuMap[0].value;
          }
        });
      }
    }
  },
  mounted() {
    var self = this;
    if (Vue.roleType + "" != "0" || self.$route.name == "image-list" || self.$route.name == "instancesolt") {
      Promise.all([self.init(this.currentPage)]).then(function(result) {
        if (self.projectCreateForm.cpuMap != null) {
          self.cpuValue = self.projectCreateForm.cpuMap[0].value;
        }
      });
    }
  },
  methods: {
    rowClick() {
      if (this.projectCreateForm.type === "1") {
        return;
      }
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
    handleSelectionChange(val) {
      if (this.projectCreateForm.type === "1") {
        this.$refs.acTable.setCurrentRow();
        this.multipleSelection = [];
        this.projectCreateForm.nodeHostName = "";
        this.projectCreateForm.bareUUID = "";
        return;
      }
      if (val != null) {
        let list = [];
        list.push(val);
        this.multipleSelection = list;
        this.projectCreateForm.nodeHostName = val['name'];
        this.projectCreateForm.bareUUID = val.uuid;
      }
    },
    onRefresh() {
      this.initHostList();
    },
    getCurrentData(param) {
      this.tableData = param;
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
    searchHost() {
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
    },
    countKeyUp(value) {
      const self = this;
      self.number = parseInt(value);
    },
    countRender(value) {
      this.detailConfig.count = value;
    },
    phyTypeSel(value) {
      let self = this;
      self.projectCreateForm.bareUUID = "";
      this.multipleSelection = [];
      this.$refs.acTable.setCurrentRow();
      if ("1" == value) {
        this.number = this.numberForAuto || 1;
        self.isManual = false;
      } else {
        this.numberForAuto = this.number;
        this.number = 1;
        self.isManual = true;
        //self.initHostList();
      }
    },
    async initHostList() {
      const self = this;
      if (!(self.diskValue && self.memValue && self.cpuValue)) {
        return;
      }

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
          if (v.zoneName === self.domain) {
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
          headers: {
            "X-Openstack-Ironic-Api-Version": "latest"
          },
          url: 'api/ironic/v1/nodes_inspur?detail=True&provision_state=available&maintenance=false' + `&cpu=${self.cpuValue}&mem_mb=${self.memValue * 1024}&disk=${self.diskValue}`
        });
        self.loading = false;
        self.totalData = [];
        self.hostList = [];
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
    },
    async init(page = 1) {
      var self = this;
      self.projectCreateForm.flavorList = [];
      self.projectCreateForm.cpuMap = [];
      self.projectCreateForm.memoryMap = [];
      self.projectCreateForm.diskMap = [];
      self.cpuValue = "";
      self.memValue = "";
      self.diskValue = "";
      var url = "api/nova/v2.1/flavors-inspur/detail?project_id=" + self.projectId;
      if (Vue.roleType + "" != "0") {
        url = "api/nova/v2.1/flavors/detail";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        let list = [];
        let flavors = result['flavors']
        for (let i in flavors) {
          if (flavors[i].name != null && flavors[i].name.indexOf("Bare@") >= 0) {
            list.push(flavors[i]);
          }
        }
        self.projectCreateForm.flavorList = list;
        self.loadPropertyList(list);
      } catch (res) {
        self.loading = false;
      }
    },
    loadPropertyList(list) {
      var self = this;
      var cpu = [];
      var memory = [];
      var disk = [];
      for (var i = 0; i < list.length; i++) {
        var obj = list[i];
        cpu.push(obj.vcpus);
        memory.push(obj.ram / 1024);
        disk.push(obj.disk);
      }
      var list1 = Array.from(new Set(cpu)).sort(self.sortFlavorNumber);
      var list2 = Array.from(new Set(memory)).sort(self.sortFlavorNumber);
      var list3 = Array.from(new Set(disk)).sort(self.sortFlavorNumber);
      self.reloadFlavorData(list1, "cpuMap");
      self.reloadFlavorData(list2, "memoryMap");
      self.reloadFlavorData(list3, "diskMap");
    },
    reloadFlavorData(list, flag) {
      var self = this;
      for (let c = 0; c < list.length; c++) {
        let obj = { "value": list[c], "disabled": false };
        self.projectCreateForm[flag].push(obj);
      }
    },
    findDataByKey(mapList, key) {
      var self = this;
      var results = [];
      var list = self.projectCreateForm[key];
      for (let k = 0; k < list.length; k++) {
        var obj = list[k];
        if (mapList.get(obj.value) == null) {
          obj.disabled = true;
        } else {
          obj.disabled = false;
        }
      }
    },
    getOption(val) {
      var options = this.specOptions;
      var r = null;
      for (let i in options) {
        if (options[i].id == val) {
          r = options[i];
        }
      }
      return r;
    },
    findFlavorByValue() {
      var self = this;
      /*var list = self.projectCreateForm.flavorList;
      for (let l = 0; l < list.length; l++) {
        var obj = list[l];
        if (obj.vcpus == self.cpuValue && (obj.ram / 1024) == self.memValue && obj.disk == self.diskValue) {
          self.projectCreateForm.flavorsUuid = obj.id;
          break;
        }
      }*/
      self.projectCreateForm.flavorsUuid = self.resourceSpec;
    },
    findFlavorsAndMetaList() {
      var self = this;
      var list = self.projectCreateForm.flavorList;
      var specList = [];
      for (let m = 0; m < list.length; m++) {
        var obj = list[m];
        if (obj.vcpus == self.cpuValue && (obj.ram / 1024) == self.memValue && obj.disk == self.diskValue) {
          specList.push(obj);
          // self.projectCreateForm.flavorsUuid = obj.id;
          // break;
        }
      }
        self.specOptions = specList;
        if (specList != null && specList.length > 0) {
           self.resourceSpec = specList[0].id;
           // self.findMetaDataList(specList[0].id);
        }
    },
    async findMetaDataList(id) {
       var self = this;
       self.resourceMetaData = "";
       try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/flavors/' + id + '/os-extra_specs'
        });
        self.loading = false;
        var specList = result['extra_specs'];
        var list = Object.keys(specList).map(function(el) {
          var metaObj = {"id": el + specList[el], "name": el + specList[el], "option": el, "value": specList[el]};
          return metaObj;
        });
        if (list != null && list.length > 0) {
          self.resourceMetaData = list[0].id;
        }
        self.metaDataOptions = list;
      } catch (res) {
        self.loading = false;
      }
    },
    resSpecChange(value) {
      this.findMetaDataList(value);
    },
    sortFlavorNumber(a, b) {
      return a - b;
    },
    createVolume(value) {
      this.defaultType = 1;
      if (true === value) {
        this.volumeSizeFlag = true;
        this.isCreateDisk = true;
      } else {
        this.volumeSizeFlag = false;
        this.isCreateDisk = false;
      }
    },
    nextStep() {
      var self = this;
      self.$refs.projectCreateForm.validate((valid) => {
        if (valid) {
          [self.detailConfig.cpu, self.detailConfig.memory, self.detailConfig.disk] = [self.cpuValue, self.memValue, self.diskValue];
          if (self.projectCreateForm.type == "2" && !self.multipleSelection.length) {
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateChoosePhy'),
              type: 'warning'
            });
            return false;
          }
          if (self.projectCreateForm.type == "1" && (self.totalData.length < self.number)) {
            self.$message({
              showClose: true,
              message: Vue.t('network.IN_BARE'),
              type: 'warning'
            });
            return false;
          }
          if (self.cpuValue == "" || self.memValue == "" ||
            self.diskValue == "") {
            self.$message.warning(Vue.t("calcStorLang.pleaseChoose") + Vue.t("calcStorLang.bareSpec") + '!');
          } else {
            var nextFlag = true;
            var templateType = self.detailConfig.templateType;
            if ("1" == templateType || "4" == templateType || self.isoCofigFlag == true) {
              var minDiskSize = self.detailConfig.min_disk || 0;
              var minMemSize = self.detailConfig.min_ram || 0;
              nextFlag = self.loadFlavorVerify(minDiskSize, minMemSize);
            } else if ("2" == templateType || "3" == templateType) {
               var minMemSize2 = self.detailConfig.min_ram || 0;
               if ( (self.memValue)*1024 < minMemSize2) {
                  self.$message({
                      showClose: true,
                      message: Vue.t("calcStorLang.memshouldbigger") + "," + Vue.t("calcStorLang.pleaseReChoose") + "!",
                      type: 'warning'
                    });
                  return false;
               }
            }
            if (nextFlag) {
              if (self.isoCofigFlag) {
                if (self.defaultType == "2" && self.keyPairValue == "") {
                  self.$message({
                    showClose: true,
                    message: Vue.t("calcStorLang.pleaseChoose") + Vue.t("calcStorLang.keypair"),
                    type: 'warning'
                  });
                  return false;
                }
                self.findFlavorByValue();
                self.$emit("stepThreeDone", this.projectCreateForm);
              } else {
                self.findFlavorByValue();
                self.$emit("stepThreeDone", this.projectCreateForm);
              }
            } else {
              return false;
            }
          }
        } else {
          return false;
        }
      });
    },
    //统一的比较大小的提示判断 参考创建vm源及其flavor的比较问题
    loadFlavorVerify(minDisk, minMemory) {
      var self = this;
      var flag = true;
      var tempSize = self.detailConfig.size; //镜像大小
      var tempType = self.detailConfig.templateType; //模板类型
      var tempIsNewvolume = self.detailConfig.tempIsNewVolume + ""; //是否创建新卷
      var tempVolumeSize = self.detailConfig.tempVolumeSize;
      var flavorDisk = self.diskValue;
      var flavorMemory = self.memValue * 1024; //转为MB
      if ("true" == tempIsNewvolume) { //新建卷
        if (minDisk > 0 && minMemory > 0) {
          if (flavorMemory < minMemory) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t("calcStorLang.memshouldbigger") + "," + Vue.t("calcStorLang.pleaseReChoose") + "!",
              type: 'warning'
            });
          } else if (flavorDisk < tempVolumeSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: "硬盘不能小于新建云硬盘大小, 请重新选择!",
              type: 'warning'
            });
          }
        } else if (minDisk > 0 && minMemory == 0) {
          if (flavorDisk < tempVolumeSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: "硬盘不能小于新建云硬盘大小, 请重新选择!",
              type: 'warning'
            });
          }
        } else if (minDisk == 0 && minMemory > 0) {
          if (flavorMemory < minMemory) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t("calcStorLang.memshouldbigger") + "," + Vue.t("calcStorLang.pleaseReChoose") + "!",
              type: 'warning'
            });
          }
        } else if (minDisk == 0 && minMemory == 0) {
            //不做任何比较，以新建大小为主
        }
      } else {
        if (minDisk > 0 && minMemory > 0) {
          if (flavorMemory < minMemory) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t("calcStorLang.memshouldbigger") + "," + Vue.t("calcStorLang.pleaseReChoose") + "!",
              type: 'warning'
            });
          } else if (flavorDisk < tempSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t("calcStorLang.diskshouldbiggerthanTem") + "," + Vue.t("calcStorLang.pleaseReChoose") + "!",
              type: 'warning'
            });
          } else if (flavorDisk < minDisk) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t("calcStorLang.diskshouldbigger") + "," + Vue.t("calcStorLang.pleaseReChoose") + "!",
              type: 'warning'
            });
          }
        } else if (minDisk > 0 && minMemory == 0) {
          if (flavorDisk < tempSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t("calcStorLang.diskshouldbiggerthanTem") + "," + Vue.t("calcStorLang.pleaseReChoose") + "!",
              type: 'warning'
            });
          } else if (flavorDisk < minDisk) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t("calcStorLang.diskshouldbigger") + "," + Vue.t("calcStorLang.pleaseReChoose") + "!",
              type: 'warning'
            });
          }
        } else if (minDisk == 0 && minMemory > 0) {
          if (flavorMemory < minMemory) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t("calcStorLang.memshouldbigger") + "," + Vue.t("calcStorLang.pleaseReChoose") + "!",
              type: 'warning'
            });
          }
        } else if (minDisk == 0 && minMemory == 0) {
          if (flavorDisk < tempSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t("calcStorLang.diskshouldbiggerthanTem") + "," + Vue.t("calcStorLang.pleaseReChoose") + "!",
              type: 'warning'
            });
          }
        }
      }
      return flag;
    },
    prevStep() {
      this.$emit("prevThreeStep", 0);
    },
    cancel() {
      this.$emit("cancel");
    },
    cpuValueChange(value) {
      var self = this;
      //self.detailConfig.cpu = value;
      self.memValue = "";
      self.diskValue = "";
      self.configStatusRender("cpu");
      var memorys = new Map();
      var disks = new Map();
      var list = this.projectCreateForm.flavorList;
      for (let c = 0; c < list.length; c++) {
        var obj = list[c];
        if (obj.vcpus == value) {
          memorys.set(obj.ram / 1024, obj.id);
          disks.set(obj.disk, obj.id);
        }
      }
      Promise.all([self.findDataByKey(memorys, 'memoryMap')]).then(function(result) {
        // self.findDataByKey(disks, 'diskMap');
      });
      self.initHostList();
    },
    memoryValueChange(value) {
      var self = this;
      //self.detailConfig.memory = value;
      self.configStatusRender("memory");
      self.diskValue = "";
      var disks = new Map();
      var list = this.projectCreateForm.flavorList;
      for (let c = 0; c < list.length; c++) {
        var obj = list[c];
        if (obj.vcpus == self.cpuValue && (obj.ram / 1024) == value) {
          disks.set(obj.disk, obj.id);
        }
      }
      self.findDataByKey(disks, 'diskMap');
      self.initHostList();
    },
    diskValueChange(value) {
      this.findFlavorsAndMetaList();
      //this.detailConfig.disk = value;
      this.initHostList();
    },
    configStatusRender(module) {
      var self = this;
      if ("cpu" == module) {
        var list1 = self.projectCreateForm.memoryMap;
        var list2 = self.projectCreateForm.diskMap;
        for (let a = 0; a < list1.length; a++) {
          var entity = list1[a];
          entity.disabled = false;
        }
        for (let b = 0; b < list2.length; b++) {
          var entity2 = list2[b];
          entity2.disabled = false;
        }
      } else {
        var list3 = self.projectCreateForm.diskMap;
        for (let c = 0; c < list3.length; c++) {
          var entity3 = list3[c];
          entity3.disabled = false;
        }
      }
    },
    hightConfig() {
      this.hightFlag = true;
    },
    baseConfig() {
      this.hightFlag = false;
    },
    isoCofigShow() {
      this.isoCofigFlag = true;
    },
    keyPairType(value) {
      if (1 === value) {
        this.key2Flag = false;
        this.key3Flag = false;
        this.key4Flag = false;
      } else if (2 === value) {
        this.key2Flag = true;
        this.key3Flag = false;
        this.key4Flag = true;
        this.loadKeyPair();
      } else if (3 === value) {
        this.key2Flag = true;
        this.key3Flag = true;
        this.key4Flag = false;
      }
    },
    async loadKeyPair() {
      var self = this;
      var roleType = Vue.roleType + "";
      var url = 'api/nova/v2.1/os-keypairs?user_id=' + self.detailConfig.proUserId;
      if (roleType == "2" || roleType == "3") {
         url = 'api/nova/v2.1/os-keypairs'
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.41
          }
        });
        self.loading = false;
        var list = result['keypairs'];
        var keys = [];
        for (let k = 0; k < list.length; k++) {
          var key = list[k];
          keys.push(key['keypair'].name);
        }
        self.keyList = keys;
        if (list != null && list.length > 0) {
          self.keyPairValue = keys[0];
        }
      } catch (res) {
        self.loading = false;
      }
    },
    memoryRender(value, row) {
      return value / 1024;
    },
    statusRender(value, row) {
      if ("false" == (row['os-flavor-access:is_public'] + "")) {
        return "No";
      } else {
        return "Yes";
      }
    },
    handleSizeChange(val) {
      this.currentPage = 1;
      this.init({
        page: this.currentPage,
        pageSize: val
      });
    }
  }
}

</script>
<style scoped>
.el-form-item__label {
  text-align: right;
}

.el-radio-button {
  padding-bottom: 2px;
}

</style>
