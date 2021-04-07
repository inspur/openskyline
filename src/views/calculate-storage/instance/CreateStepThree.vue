<template>
  <el-form class="margin-tb20 me-required-form" label-position="left"  label-width="150px">
    <!-- <el-form-item label="" prop="cpu" class="">
      <el-table ref="acTable" :data="regularTableData" highlight-current-row stripe border style="width: 100%" row-key="id" @selection-change="handleSelectionChange" :default-sort="{prop: 'name', order: 'ascending'}">
        <el-table-column reserve-selection fixed="left" type="selection" width="55">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" label="名称" prop="name" min-width="50" sortable>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('vcpus') >= 0" prop="vcpus" label="CPU(核)" min-width="50" sortable>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('ram') >= 0" prop="ram" label="内存(G)" min-width="50" sortable>
          <template slot-scope="scope">
            <span v-html="memoryRender(scope.row.ram, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('disk') >= 0" prop="disk" label="硬盘(G)" min-width="50" sortable>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('public') >= 0" prop="os-flavor-access:is_public" label="是否公有" min-width="50" sortable>
          <template slot-scope="scope">
            <span v-html="statusRender(scope.row.public, scope.row)"></span>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item> -->
    <el-form-item :label="$t('calcStorLang.cpuCore')" prop="cpu" class="is-required">
      <el-radio-group v-model="cpuValue" size="large" @change="cpuValueChange">
        <el-radio-button class="clearfix" v-for="(cpu, index) in projectCreateForm.cpuMap" :key="cpu.value" :label="cpu.value" :disabled="cpu.disabled" :command="index">
          {{cpu.value}}
        </el-radio-button>
      </el-radio-group>
      <!-- <el-button type="text" size="small" @click="hightConfig" v-show="!hightFlag">高级</el-button>
      <el-button type="text" size="small" @click="baseConfig" v-show="hightFlag">基本</el-button> -->
    </el-form-item>
    <!-- <el-form-item label="" prop="cpu" class="" v-show="hightFlag">
      <el-checkbox-group v-model="checkList">
        <el-checkbox label="CPU映射"></el-checkbox>
        <el-checkbox label="内存大页"></el-checkbox>
        <el-checkbox label="GPU透传"></el-checkbox>
        <el-checkbox label="Numa"></el-checkbox>
      </el-checkbox-group>
    </el-form-item> -->
    <el-form-item :label="$t('calcStorLang.memGB')" prop="memory" class="is-required">
      <el-radio-group v-model="memValue" size="large" @change="memoryValueChange">
        <el-radio-button class="clearfix" v-for="(memory, index) in projectCreateForm.memoryMap" :key="memory.value" :label="memory.value" :disabled="memory.disabled" :command="index">
          {{memory.value}}
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.diskGB')" prop="disk" class="is-required">
      <el-radio-group v-model="diskValue" size="large" @change="diskValueChange">
        <el-radio-button class="clearfix" v-for="(disk, index) in projectCreateForm.diskMap" :key="disk.value" :label="disk.value" :disabled="disk.disabled" :command="index">
          {{disk.value}}
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.resourcespec')" prop="" class="is-required">
      <el-select v-model="resourceSpec"  class="col-10" @change="resSpecChange" filterable>
        <el-option v-for="item in specOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.metadata')" prop="">
      <metadata-detail  :flavorId="resourceSpec"></metadata-detail>
      <!-- <el-select v-model="resourceMetaData"  class="col-10" filterable>
        <el-option v-for="item in metaDataOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select> -->
    </el-form-item>
    <el-collapse class="col-24">
      <el-collapse-item :title="$t('calcStorLang.advanceOptions')" v-show="isoCofigFlag">
        <el-form class="margin-tb20" label-position="left" label-width="170px" :model="projectCreateForm" :rules=rules ref="projectCreateForm">
          <el-form-item :label="$t('calcStorLang.createInstNewVolume')" prop="dns1" v-show="!volumeCreateFlag">
            <el-switch v-model="projectCreateForm.isNewVolume" :on-text="$t('lang.yes')" :off-text="$t('lang.no')" @change="createVolume"></el-switch>
            <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstDiskTip3')">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
            <span v-show="projectCreateForm.isNewVolume + '' == 'true' " style="color:#737373">({{$t('calcStorLang.createInstDiskTip1')}})</span>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.createInstDiskSize')" prop="size" v-show="volumeSizeFlag" class="is-required">
            <el-input v-model="projectCreateForm.size" auto-complete="off" class="col-8"></el-input>
            <span>GB</span>
          </el-form-item>
          <el-form-item :label="$t('lang.type')"  v-show="volumeSizeFlag">
            <el-select v-model="projectCreateForm.newVolumeType"  filterable clearable>
              <el-option v-for="item in typeOptions" :key="item.id" :label="getSelectOptionName(item.name)" :value="item.id" :title="getSelectOptionTitle(item.name)"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.createInstDelInstDelVolume')" prop="dns2" v-show="volumeSizeFlag || volumeCreateFlag">
            <el-switch v-model="projectCreateForm.isDelVolume" :on-text="$t('lang.yes')" :off-text="$t('lang.no')"></el-switch>
            <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstDiskTip2')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
          </el-form-item>
          <!-- <el-form-item label="数据盘" prop="dns2">
            <el-input v-model="projectCreateForm.size" auto-complete="off" class="col-8"></el-input>
            <span>GB</span>
          </el-form-item> -->
        <el-form-item :label="$t('calcStorLang.createInstLoginType')" class="" v-show="isoCofigFlag" id="loginTypeShow">
          <el-radio-group v-model="projectCreateForm.defaultType" @change="keyPairType">
            <el-radio class="radio" :label="1">{{$t('calcStorLang.oldPassword')}}</el-radio>
            <el-radio class="radio" :label="2" :disabled="keyShowFlg || isCreateDisk || volumeCreateFlag">{{$t('calcStorLang.keypair')}}</el-radio>
            <el-radio class="radio" :label="3" :disabled="resetPassFlg">{{$t('lang.resetPassword')}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('lang.userName')" prop="userName" class="is-required" v-show="key2Flag && projectCreateForm.defaultType !=2">
          <el-input class="col-8" v-model="projectCreateForm.userName" auto-complete="off" disabled></el-input>
          <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstLoginTip1')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('lang.password')" prop="userPass" class="is-required" v-show="key3Flag">
          <el-input class="col-8" v-model="projectCreateForm.userPass" auto-complete="off" type="password"></el-input>
          <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstLoginTip2')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('lang.confirmPassword')" prop="userConfirmPass" class="is-required" v-show="key3Flag">
          <el-input class="col-8" v-model="projectCreateForm.userConfirmPass" auto-complete="off" type="password"></el-input>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.keypair')" prop="userKey" class="is-required" v-show="key4Flag">
          <el-select v-model="keyPairValue">
            <el-option v-for="key in keyList" :key="key" :label="key" :value="key">
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
export default {
  name: 'StepThree',
  props: ['detailConfig', 'projectId'],
  components: { MetadataDetail },
  data() {
    return {
      activeIndex: 2,
      cpuValue: '',
      memValue: '',
      diskValue: '',
      hightFlag: false,
      diskPartition: "ssh",
      volumeSizeFlag: false,
      isoCofigFlag: false,
      volumeCreateFlag: false,
      checkList: [],
      dispatch: "1",
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
        cpu: '',
        memory: '',
        netcard: '',
        harddisk: '',
        size: '',
        userName: 'Administrator/root',
        userPass: '',
        userConfirmPass:'',
        flavorsUuid: "",
        cpuMap: [],
        memoryMap: [],
        diskMap: [],
        flavorList: [],
        isDelVolume: false,
        defaultType: 1,
        isNewVolume: false,
        newVolumeType: ''
      },
      typeOptions: [],
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
        ],
        size: [{ type: 'integer' }, { type: 'min', value: 1 }, { type: 'max', value: 9999 }]
      },
      currentPage: 1,
      showBorder: true,
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "size",
        label: Vue.t('calcStorLang.size')
      }, {
        prop: "type",
        label: Vue.t('calcStorLang.type')
      }],
      columnsChecked: ['name', 'vcpus', 'ram', 'disk', 'public'],
      tableData: [],
      regularTableData: [],
      multipleSelection: [],
      loading: false
    }
  },
  updated() {
    var self = this;
    if (self.projectCreateForm.defaultType == 1) {
      self.rules.userPass = [];
      self.rules.userConfirmPass = [];
      self.rules.userKey = [];
    } else if (self.projectCreateForm.defaultType == 2) {
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
            }
        }
      }
    },
    'detailConfig.proUserId': {
      handler: function(rows, oldVal) {
        var self = this;
        var keyPairType = self.projectCreateForm.defaultType;
        if (self.isoCofigFlag && "2" == keyPairType) {
          self.keyPairValue = "";
          self.loadKeyPair();
        }
      }
    },
    'detailConfig.isHotPlug': {
      handler: function(newValue, oldVal) {
        const $this = this;
        Promise.all([$this.init(this.currentPage)]).then(function(result) {
          if ($this.projectCreateForm.cpuMap != null) {
            $this.cpuValue = $this.projectCreateForm.cpuMap[0].value;
          }
        });
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
        var specs = result['flavors'];
        var fResults = [];
        for (let s = 0; s < specs.length; s++) {
           var obj = specs[s];
           if (obj.name.indexOf("Bare@") >= 0) {
              continue;
           }
           fResults.push(obj);
        }
        self.projectCreateForm.flavorList = fResults;
        self.loadPropertyList(result['flavors']);
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
        if (self.detailConfig.isHotPlug === true) {
          if (obj.vcpus % 2 === 0) {
            cpu.push(obj.vcpus);
          }
        } else {
          cpu.push(obj.vcpus);
        }
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
        const hypervisorIndex = list.findIndex(item => item.name === 'capabilities:hypervisor_typeQEMU');
        if (hypervisorIndex > -1) {
          list.splice(hypervisorIndex, 1);
        }

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
      this.projectCreateForm.defaultType = 1;
      this.detailConfig.tempIsNewVolume = value;
      if (true === value) {
        this.volumeSizeFlag = true;
        this.isCreateDisk = true;
        this.loadVolumeType();
      } else {
        this.volumeSizeFlag = false;
        this.isCreateDisk = false;
      }
    },
    async loadVolumeType() {
      var self = this;
      var projectId = self.$cookie.get('pid');
      let data = [];
      var url = "";
      var roleType = Vue.roleType + "";
      url = "api/cinderv3/v3/" + projectId + "/types?is_public=None";
      if ("2" == roleType || "3" == roleType) { //超级
        url= "api/cinderv3/v3/" + projectId + "/types";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        var emptyV = [{"id":"", "name":""}];
        self.typeOptions = [{"id":"", "name":""}];
        self.typeOptions = self.typeOptions.concat(result['volume_types']);
        //self.loading = false;
      } catch (res) {
        self.loading = false;
        self.$message.error( Vue.t('storage.getFailed'));
      }
    },
    nextStep() {
      var self = this;
      self.$refs.projectCreateForm.validate((valid) => {
        if (valid) {
          if (self.resourceSpec == "") {
            self.$message.warning(Vue.t('calcStorLang.instCreateChooseSpec'));
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
                      message: Vue.t('calcStorLang.instCreateSpecTip1'),
                      type: 'warning'
                    });
                  return false;
               }
            }
            if (nextFlag) {
              if (self.isoCofigFlag) {
                if (self.projectCreateForm.defaultType == "2" && self.keyPairValue == "") {
                  self.$message({
                    showClose: true,
                    message: Vue.t('calcStorLang.instCreateChooseKeyPair'),
                    type: 'warning'
                  });
                  return false;
                }
                if (self.projectCreateForm.isNewVolume) {
                  if (self.projectCreateForm.size == "") {
                    self.$message({
                      showClose: true,
                      message: Vue.t('calcStorLang.instCreateEnterDiskSize'),
                      type: 'warning'
                    });
                    return false;
                  } else {
                    var volumeSize = self.projectCreateForm.size;
                    var templateSize = self.detailConfig.size;
                    if (Number(volumeSize) < Number(templateSize)) {
                      self.$message({
                        showClose: true,
                        message: Vue.t('calcStorLang.diskshouldbiggerthanTem'),
                        type: 'warning'
                      });
                      return false;
                    } else {
                      self.findFlavorByValue();
                      self.$emit("stepThreeDone", this.projectCreateForm);
                    }
                  }
                } else {
                  self.findFlavorByValue();
                  self.$emit("stepThreeDone", this.projectCreateForm);
                }
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
      var tempSize = parseFloat(self.detailConfig.size); //镜像大小
      var tempType = self.detailConfig.templateType; //模板类型
      var tempIsNewvolume = self.detailConfig.tempIsNewVolume + ""; //是否创建新卷
      if (self.isoCofigFlag) {
        self.detailConfig.tempVolumeSize = parseFloat(self.projectCreateForm.size);
      }
      var tempVolumeSize = parseFloat(self.detailConfig.tempVolumeSize);
      var flavorDisk = parseFloat(self.diskValue);
      var flavorMemory = self.memValue * 1024; //转为MB
      if ("true" == tempIsNewvolume) { //新建卷
        if (minDisk > 0 && minMemory > 0) {
          if (flavorMemory < minMemory) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateSpecTip1'),
              type: 'warning'
            });
          } else if (flavorDisk < tempVolumeSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateSpecTip2'),
              type: 'warning'
            });
          } else if (tempVolumeSize < tempSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateNewDiskTip1'),
              type: 'warning'
            });
          } else if (tempVolumeSize < minDisk) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateNewDiskTip2'),
              type: 'warning'
            });
          }
        } else if (minDisk > 0 && minMemory == 0) {
          if (flavorDisk < tempVolumeSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateSpecTip2'),
              type: 'warning'
            });
          } else if (tempVolumeSize < tempSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateNewDiskTip1'),
              type: 'warning'
            });
          } else if (tempVolumeSize < minDisk) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateNewDiskTip2'),
              type: 'warning'
            });
          }
        } else if (minDisk == 0 && minMemory > 0) {
          if (flavorMemory < minMemory) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateSpecTip1'),
              type: 'warning'
            });
          } else if (tempVolumeSize < tempSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateNewDiskTip1'),
              type: 'warning'
            });
          } else if (flavorDisk < tempVolumeSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateSpecTip2'),
              type: 'warning'
            });
          }
        } else if (minDisk == 0 && minMemory == 0) {
          if (tempVolumeSize < tempSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateNewDiskTip1'),
              type: 'warning'
            });
          } else if (flavorDisk < tempVolumeSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateSpecTip2'),
              type: 'warning'
            });
          }
        }
      } else {
        if (minDisk > 0 && minMemory > 0) {
          if (flavorMemory < minMemory) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateSpecTip1'),
              type: 'warning'
            });
          } else if (flavorDisk < tempSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateSpecTip4'),
              type: 'warning'
            });
          } else if (flavorDisk < minDisk) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateSpecTip3'),
              type: 'warning'
            });
          }
        } else if (minDisk > 0 && minMemory == 0) {
          if (flavorDisk < tempSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateSpecTip4'),
              type: 'warning'
            });
          } else if (flavorDisk < minDisk) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateSpecTip3'),
              type: 'warning'
            });
          }
        } else if (minDisk == 0 && minMemory > 0) {
          if (flavorMemory < minMemory) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateSpecTip1'),
              type: 'warning'
            });
          } else if (flavorDisk < tempSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateSpecTip4'),
              type: 'warning'
            });
          }
        } else if (minDisk == 0 && minMemory == 0) {
          if (flavorDisk < tempSize) {
            flag = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateSpecTip4'),
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
      self.detailConfig.cpu = value;
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
    },
    memoryValueChange(value) {
      var self = this;
      self.detailConfig.memory = value;
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
    },
    diskValueChange(value) {
      this.findFlavorsAndMetaList();
      this.detailConfig.disk = value;
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
    handleSelectionChange(val) {
      val.forEach((row, index) => {
        if (index === val.length - 1) return;
        this.$refs.acTable.toggleRowSelection(row, false);
      })
      this.projectCreateForm.flavorsUuid = val[0].id;
      this.multipleSelection = val;
    },
    handleSizeChange(val) {
      this.currentPage = 1;
      this.init({
        page: this.currentPage,
        pageSize: val
      });
    },
    //分页
    handleCurrentChange(val) {
      this.currentPage = val;
      this.init({
        page: val
      });
    },
    onRefresh() {
      this.init();
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
