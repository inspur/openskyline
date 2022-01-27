<template>
  <el-form class="margin-tb20 me-required-form" label-position="left" :model="projectCreateForm" :rules=rules ref="projectCreateForm" label-width="170px">
    <el-form-item :label="$t('calcStorLang.createInstTempSource')" class="is-required" v-show="detailConfig.roleType != '3'">
      <el-radio-group v-model="projectCreateForm.type" @change="templateTypeChange">
        <el-radio class="radio" label="1" :disabled="loading">{{$t('calcStorLang.image')}}</el-radio>
        <el-radio class="radio" label="2" :disabled="loading || detailConfig.count + '' !== '1'">{{$t('calcStorLang.volume')}}</el-radio>
        <el-radio class="radio" label="3" :disabled="loading">{{$t('calcStorLang.volumeSnapshot')}}</el-radio>
        <el-radio class="radio" label="4" :disabled="loading">{{$t('calcStorLang.instanceshot')}}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="" class="is-required" label-width="10px">
      <span>{{$t('lang.name')}}</span>
      <el-input :class="colClass" v-model="searchName" auto-complete="off"></el-input>
      <span v-show="projectCreateForm.type=='1' || projectCreateForm.type=='4'">{{$t('calcStorLang.os')}}</span>
      <!--<el-select v-model="osType" @change="osTypeChange">
        <el-option class="clearfix" v-for="(os, index) in operSystemOptions" :value="os.value" :key="os.value" :label="os.label">
        </el-option>
      </el-select> -->
      <el-input :class="colClass" v-model="osType" auto-complete="off" v-show="projectCreateForm.type=='1' || projectCreateForm.type=='4'"></el-input>
      <span v-show="projectCreateForm.type=='1'">{{$t('calcStorLang.visibility')}}</span>
      <el-select v-model="visibleValue" :class="colClass" clearable v-show="projectCreateForm.type=='1'">
        <!-- <el-option :label="$t('lang.all')" value="0"></el-option> -->
        <el-option :label="$t('lang.public')" value="public"></el-option>
        <el-option :label="$t('lang.private')" value="private"></el-option>
        <el-option :label="$t('calcStorLang.shared')" value="shared"></el-option>
      </el-select>
      <el-button type="primary" icon='fa-search' size="small" @click="queryClick()">{{$t('lang.query')}}</el-button>
    </el-form-item>
    <el-table ref="acTable" :data="tableData" highlight-current-row border stripe row-key="id" @current-change="handleTabCurrentChange" v-loading="loading" :element-loading-text="$t('calcStorLang.dataLoading')"  @sort-change="sortChange">
      <el-table-column type="expand" align="left" width="55">
        <template slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item :label="$t('calcStorLang.minDisk')" v-if="projectCreateForm.type == '1' || projectCreateForm.type == '4'">
              <span>{{scope.row.min_disk || '-'}}</span>
            </el-form-item>
            <el-form-item :label="$t('calcStorLang.minMemory')" v-if="projectCreateForm.type == '1' || projectCreateForm.type == '4'">
              <span>{{scope.row.min_ram || '-'}}</span>
            </el-form-item>
            <el-form-item :label="$t('calcStorLang.minMemory')" v-if="projectCreateForm.type == '2' || projectCreateForm.type == '3'">
              <span v-html="minMemoryRender(scope.row)"></span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" show-overflow-tooltip sortable="custom" min-width="60">
        <template slot-scope="scope">
          <span v-html="nameRender(scope.row.name, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('size') >= 0" prop="size" align="left" :label="$t('calcStorLang.size')" show-overflow-tooltip min-width="50">
        <template slot-scope="scope">
          <span v-html="diskRender(scope.row.size, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('os') >= 0 && (projectCreateForm.type == 1 || projectCreateForm.type == 4)" prop="os_distro" show-overflow-tooltip  :label="$t('calcStorLang.os')" min-width="50">
        <template slot-scope="scope">
          <span v-html="osRender(scope.row.size, scope.row)"></span>
        </template>
      </el-table-column>
      <!-- <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" show-overflow-tooltip align="left" label="状态" min-width="50">
      </el-table-column> -->
      <!-- <el-table-column v-if="columnsChecked.indexOf('password') >= 0" prop="password" show-overflow-tooltip align="left" label="原始密码" min-width="50">
        <template slot-scope="scope">
          <el-tooltip placement="top">
            <div slot="content">默认管理员root,密码p12cgepWd。创建后请务必修改密码!</div><el-button type="text">***</el-button>
          </el-tooltip>
        </template>
      </el-table-column> -->
      <el-table-column v-if="columnsChecked.indexOf('visibility') >= 0 && projectCreateForm.type == 1" prop="visibility" align="left" :label="$t('calcStorLang.visibility')" show-overflow-tooltip min-width="50">
        <template slot-scope="scope">
          <span v-html="visibilityRender(scope.row.visibility, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('snapshotType') >= 0 && projectCreateForm.type == 3" prop="visibility" align="left" :label="$t('lang.type')" show-overflow-tooltip min-width="50">
        <template slot-scope="scope">
          <span v-html="snapshotTypeRender(scope.row.type, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('date') >= 0" prop="created_at" align="left" :label="$t('lang.createTime')" show-overflow-tooltip min-width="50">
        <template slot-scope="scope">
          <span>{{tzTimeFormatter(scope.row)}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <!-- <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>当前选中 {{multipleSelection}}条</span> -->
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
          </el-popover>
        </el-col>
        <el-col :span="24">
          <page v-if="projectCreateForm.type!='2'" :totalData="totalData" @getCurrentData="getCurrentData" :pageCount="pageCount"></page>
          <el-pagination v-if="projectCreateForm.type=='2'" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
        </el-col>
      </el-row>
    </div>
    <el-collapse class="col-24" v-if="hightConfigShow">
      <el-collapse-item :title="$t('calcStorLang.advanceOptions')" name="11" label-width="200px">
        <el-form-item :label="$t('calcStorLang.createInstNewVolume')" prop="dns1" v-show="projectCreateForm.type=='1' || projectCreateForm.type=='4'">
          <el-switch v-model="projectCreateForm.isNewVolume" :on-text="$t('lang.yes')" :off-text="$t('lang.no')" @change="createVolume"></el-switch>
          <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstDiskTip3')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
          <span v-show="(projectCreateForm.type=='1' || projectCreateForm.type=='4') && projectCreateForm.isNewVolume + '' == 'true' " style="color:#737373">({{$t('calcStorLang.createInstDiskTip1')}})</span>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.createInstDiskSize')" prop="size" v-show="projectCreateForm.volumeSizeFlag && (projectCreateForm.type=='1' || projectCreateForm.type=='4')" class="is-required">
          <el-input v-model="projectCreateForm.size" auto-complete="off" class="col-8"></el-input>
          <span>GB</span>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.createInstVolumeName')" prop="volumeName" v-show="projectCreateForm.volumeSizeFlag && (projectCreateForm.type=='1' || projectCreateForm.type=='4')">
          <el-input v-model="projectCreateForm.volumeName" class="col-8" />
        </el-form-item>
        <el-form-item :label="$t('lang.type')"  v-show="projectCreateForm.volumeSizeFlag && (projectCreateForm.type=='1' || projectCreateForm.type=='4')">
          <el-select v-model="projectCreateForm.newVolumeType"  filterable clearable>
            <el-option v-for="item in typeOptions" :key="item.id" :label="getSelectOptionName(item.name)" :value="item.id" :title="getSelectOptionTitle(item.name)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.createInstDelInstDelVolume')" prop="dns2" v-show="(projectCreateForm.volumeSizeFlag && (projectCreateForm.type=='1' || projectCreateForm.type=='4') ||(projectCreateForm.type=='2' || projectCreateForm.type=='3'))">
          <el-switch v-model="projectCreateForm.isDelVolume" :on-text="$t('lang.yes')" :off-text="$t('lang.no')"></el-switch>
          <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstDiskTip2')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.createHotPlug')" prop="dns3" v-show="projectCreateForm.type=='1' || projectCreateForm.type=='4'">
          <el-switch v-model="projectCreateForm.isHotPlug" :on-text="$t('lang.yes')" :off-text="$t('lang.no')"></el-switch>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.createInstLoginType')" class="" v-show="sizeFlag && (projectCreateForm.type=='1' || projectCreateForm.type=='4') || (projectCreateForm.type=='2' || projectCreateForm.type=='3')">
          <el-radio-group v-model="projectCreateForm.defaultType" @change="keyPairType">
            <el-radio class="radio" :label="1">{{$t('calcStorLang.oldPassword')}}</el-radio>
            <el-radio class="radio" :label="2" :disabled="keyShowFlg || isCreateDisk || (projectCreateForm.type=='2' || projectCreateForm.type=='3')">{{$t('calcStorLang.keypair')}}</el-radio>
            <el-radio class="radio" :label="3" :disabled="resetPassFlg">{{$t('lang.resetPassword')}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('lang.userName')" prop="userName" class="is-required" v-show="key2Flag && (projectCreateForm.type=='1' || projectCreateForm.type=='4' || projectCreateForm.type=='2' || projectCreateForm.type=='3') && sizeFlag && projectCreateForm.defaultType!='2'">
          <!-- <span>超级管理员账户</span> -->
          <el-input class="col-8" v-model="projectCreateForm.userName" auto-complete="off" disabled></el-input>
          <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstLoginTip1')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('lang.password')" prop="userPass" class="is-required" v-show="key3Flag && (projectCreateForm.type=='1' || projectCreateForm.type=='4' || projectCreateForm.type=='2' || projectCreateForm.type=='3') && sizeFlag">
          <el-input class="col-8" v-model="projectCreateForm.userPass" auto-complete="off" type="password"></el-input>
          <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstLoginTip2')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('lang.confirmPassword')" prop="userConfirmPass" class="is-required" v-show="key3Flag && (projectCreateForm.type=='1' || projectCreateForm.type=='4' || projectCreateForm.type=='2' || projectCreateForm.type=='3') && sizeFlag">
          <el-input class="col-8" v-model="projectCreateForm.userConfirmPass" auto-complete="off" type="password"></el-input>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.keypair')" prop="userKey" class="is-required" v-show="key4Flag && (projectCreateForm.type=='1' || projectCreateForm.type=='4') && sizeFlag">
          <el-select v-model="projectCreateForm.keyPairValue">
            <el-option v-for="key in keyList" :key="key" :value="key" :label="unitKeyInfo(key)" :title="unitKeyInfo(key, 'title')">
            </el-option>
          </el-select>
        </el-form-item>
      </el-collapse-item>
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
import formatFileSize from 'utils/formatFileSize';
export default {
  name: 'StepTwo',
  props: ['detailConfig', 'projectId'],
  data() {
    return {
      activeIndex: 1,
      projectCreateForm: {
        type: '1',
        netmask: '',
        gateway: '',
        vlan: '',
        userName: 'Administrator/root',
        userPass: '',
        userConfirmPass: '',
        imageRef: '',
        keyPairValue: '',
        defaultType: 1,
        snapshotType: '',
        isNewVolume: false,
        isHotPlug:false,
        isDelVolume: false,
        volumeSizeFlag: false,
        volumeName: '',
        size: '',
        newVolumeType: ''
      },
      templateEntity:'',
      typeOptions: [],
      colClass:this.$cookie.get("defaultLanguage")=="en"?"col-3":"col-5",
      sizeFlag: true,
      leftVolumeSize: -1,
      isVlanshow: '',
      totalData: [],
      imageList: [],
      templateList: [],
      dialogVisible: false,
      searchFlag: true,
      keyList: '',
      key2Flag: false,
      key3Flag: false,
      key4Flag: false,
      keyShowFlg: false,
      resetPassFlg: false,
      isCreateDisk: false,
      volumeMaps: new Map(),
      visibleValue: "",
      searchName: '',
      hightConfigShow: true,
      formatFileSize: formatFileSize,
      systemsSupportHotPlug: ['CentOS7-64', 'WinSer2012Standard', 'WinSer2012Datacenter', 'WinSer2016Standard', 'WinSer2016Datacenter'], //支持热扩容的系统
      currentSystemSupportHotPlug: false,
      sortObj: {
        sortOrder: "desc",
        sortField: "name"
      },
      operSystemOptions: [{ value: '0', label: '所有' }, { value: 'linux', label: 'Linux' }, { value: 'window', label: 'window' }, { value: 'other', label: 'other' }],
      osType: '',
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
        size: [
          { type: 'integer' },
          { type: 'min', value: 1 },
          { type: 'max', value: 131072 }
        ],
        volumeName: [
          { type: 'maxSize', value: 250 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ]
      },
      currentPage: 1,
      showBorder: true,
      pageCount: 5,
      pageSizes: [5, 10, 20],
      pageSize: 5,
      total: 0,
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "size",
        label: Vue.t('calcStorLang.size')
      }, {
        prop: "status",
        label: Vue.t('calcStorLang.status')
      }, {
        prop: "os",
        label: Vue.t('calcStorLang.os')
      }, {
        prop: "snapshotType",
        label: Vue.t('calcStorLang.type')
      }, {
        prop: "visibility",
        label: Vue.t('calcStorLang.visibility')
      }, {
        prop: "date",
        label: Vue.t('calcStorLang.createTime')
      }, {
        prop: "password",
        label: Vue.t('calcStorLang.oldPassword')
      }],
      columnsChecked: ['name', 'size', 'os', 'snapshotType', 'visibility', 'date', 'password'],
      tableData: [],
      multipleSelection: 0,
      queryParam: {
        "page": 1,
        "pageSize": 5,
        field: "",
        dir: ""
      },
      loading: false
    }
  },
  watch: {
    projectId() {
      this.initForm = Object.assign({}, this.projectCreateForm);
      this.ruleStore = Object.assign({}, this.rules);
      this.init();
      //加载项目剩余量
      this.loadProjectResUsage();
    },
    'detailConfig.proUserId': {
      handler: function(rows, oldVal) {
        var self = this;
        var keyPairType = self.projectCreateForm.defaultType;
        if ("2" == keyPairType) {
          self.projectCreateForm.keyPairValue = "";
          self.loadKeyPair();
        }
      }
    },
    'detailConfig.count': {
      handler: function(value) {
        const $this = this;
        if (parseInt(value) > 1 && $this.projectCreateForm.type === '2') {
          $this.projectCreateForm.type = '1';
        }
      }
    },
    'projectCreateForm.isHotPlug'(newVal, oldVal) {
      if (newVal === true && this.currentSystemSupportHotPlug === false) {
        this.$message.error(Vue.t('calcStorLang.currentSystemNotSupportHotPlug'));
        this.projectCreateForm.isHotPlug = false;
      }
    },
    currentSystemSupportHotPlug(newVal, oldVal) {
      if (newVal === false) {
        this.projectCreateForm.isHotPlug = false;
      }
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
  async mounted() {
    const $this = this;
    if ($this.detailConfig.roleType == '3') {
      $this.initForm = Object.assign({}, this.projectCreateForm);
      $this.ruleStore = Object.assign({}, this.rules);
      $this.init();
    }
  },
  methods: {
    sortChange(column) {
       var self = this;
       var key = column.prop;
       var keyOrder = column.order;
       if (self.projectCreateForm.type + "" == "2") { //云硬盘
          if ("descending" == column.order) {
            keyOrder = "desc";
          } else {
            keyOrder = "asc";
          }
          if (!column.prop) {
            return;
          }
          self.sortObj = {
            sortOrder: keyOrder,
            sortField: column.prop
          };
          self.loadVolumeTypeList();
       } else {
        if (keyOrder != null && self.totalData.length > 0) {
            self.totalData.sort(this.$sortFormatter(key, keyOrder));
        }
       }
    },
    async init() {
      var self = this;
      self.totalData = [];
      var url = "";
      var keyFlag = "images";
      switch (self.projectCreateForm.type + "") {
        case "1":
          /*var visible = self.visibleValue == "0" ? "" : self.visibleValue;
          var osType = self.osType == "0" ? "" : self.osType;
          if (visible != "" && osType != "") {
            url = "api/glance/v2/images?visibility=" + visible + "&os_distro=" + osType;
          } else if (visible != "" && osType == "") {
            url = "api/glance/v2/images?visibility=" + visible;
          } else if (visible == "" && osType != "") {
            url = "api/glance/v2/images?os_distro=" + osType;
          } else if (visible == "" && osType == "") {
            url = "api/glance/v2/images";
          }*/
          self.searchFlag = true;
          self.loadImageTypeList();
          break;
        case "2":
          var projectUuid = this.projectId;
          if (self.detailConfig.roleType == '3') {
            projectUuid = this.$cookie.get("pid");
          }
          url = "api/cinderv2/v3/" + projectUuid + "/volumes/detail?bootable=true&status=available?";
          keyFlag = "volumes";
          self.searchFlag = false;
          self.loadVolumeTypeList();
          break;
        case "3":
          url = "api/glance/v2/images?image_type=snapshot";
          self.searchFlag = false;
          self.loadSnapshotTypeList();
          break;
        case "4":
          self.searchFlag = false;
          self.loadVmSnapshotTypeList();
          break;
        default:
          // url = "api/glance/v2/images";
      }
    },
    //镜像类型列表
    loadImageTypeList() {
      var self = this;
      var middleList = [];
      var images = [];
      var projectUuId = self.projectId;
      if (self.detailConfig.roleType == "3") {
        projectUuId = self.$cookie.get("pid");
      }
      Promise.all([self.loadPublicImageList()]).then(function(result) {
        var data1 = result[0];
        // var data2 = result[1];
        middleList = data1;
        for (let m = 0; m < middleList.length; m++) { //遍历提出snap类型的镜像
          var obj = middleList[m];
          if (obj.name.indexOf("Bare@") >= 0) {
            continue;
          }
          if ((obj.hasOwnProperty("image_type") && obj['image_type'] == "snapshot") || typeof (obj['block_device_mapping']) != "undefined" || "backup" == obj['image_type']) {
            continue;
          } else {
            if ("private" == obj['visibility'] && projectUuId != obj['owner']) {
              continue;
            } else {
              images.push(obj);
            }
          }
        }
        self.totalData = images;
        self.imageList = images;
        self.templateList = images;
      });
    },
    async loadVolumeTypeList() {
      var self = this;
      self.loading = true;
      var roleType = Vue.roleType + "";
      let data = {
        limit: self.pageSize,
        with_count: "True",
        offset: self.pageSize * (self.currentPage - 1),
        sort_key: self.sortObj.sortField,
        sort_dir: self.sortObj.sortOrder,
        status:"available",
        bootable:true,
        all_tenants:"True",
        project_id:self.projectId
      };
      let queryName = self.searchName;
      if ("" != queryName) {
        data["name"] = queryName;
      }
      var url = "api/cinderv3/v3/" + this.$cookie.get("pid") + "/volumes/detail?" + $.param(data);
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true,
          headers: {
            "OpenStack-API-Version": "volume 3.45"
          }
        });
        self.loading = false;
        var volumeList = result['volumes'];
        self.total = result["count"];
        for (let v = 0; v < volumeList.length; v++) {
            var volume = volumeList[v];
            if (volume['name'] == "") {
               volume['name'] = volume['id'];
            }
        }
        self.tableData = volumeList;
        self.templateList = volumeList;
      } catch (res) {
        self.loading = false;
      }
    },
    loadSnapshotTypeList() {
      var self = this;
      var snapshots = [];
      //卷快照
      Promise.all([self.loadVolumeSnapshot(), self.loadSnapshotVolumeList()]).then(function(result) {
        var data1 = result[0]; //卷快照
        for (let a = 0; a < data1.length; a++) {
          var entity1 = data1[a];
          entity1.snapshotType = "volume"; //卷快照类型
          var snapVoluId = entity1['volume_id'];
          if (self.volumeMaps.get(snapVoluId) != null) {
            var volumeEntity = self.volumeMaps.get(snapVoluId);
            if (typeof volumeEntity['volume_image_metadata'] != "undefined") {
                entity1['volume_image_metadata'] = volumeEntity['volume_image_metadata'];
            }
            snapshots.push(entity1);
          }
        }
        // snapshots = data1.concat(data2);
        self.totalData = snapshots;
        self.templateList = snapshots;
      });
    },
    //硬盘快照下可用的硬盘列表过滤
    async loadSnapshotVolumeList() {
      var self = this;
      self.loading = true;
      var roleType = Vue.roleType + "";
      var url = "api/cinderv2/v3/" + this.$cookie.get("pid") + "/volumes/detail?bootable=true&all_tenants=True&project_id=" + self.projectId;
      if ("2" == roleType || "3" == roleType) {
        url = "api/cinderv2/v3/" + this.$cookie.get("pid") + "/volumes/detail?bootable=true";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        var volumeList = result['volumes'];
        for (let v = 0; v < volumeList.length; v++) {
          var entity = volumeList[v];
          self.volumeMaps.set(entity.id, entity);
        }
        return volumeList;
      } catch (res) {
        self.loading = false;
      }
    },
    loadVmSnapshotTypeList() {
      var self = this;
      var snapshots = [];
      //主机快照
      Promise.all([self.loadInstanceSnapshot(), self.loadSnapshotBlockType()]).then(function(result) {
        var data1 = result[0];
        // var data2 = result[1]; //主机快照
        snapshots = data1;
        for (let b = 0; b < snapshots.length; b++) {
          var entity2 = snapshots[b];
          entity2.snapshotType = "host"; //主机快照类型
          // entity2.size = (entity2.size / (1024 * 1024 * 1024)).toFixed(2);
        }
        // snapshots = data2;
        self.totalData = snapshots;
        self.templateList = snapshots;
      });
    },
    //查询项目下私有镜像 不要传owner 会过滤掉相关其他数据, 不加limit漏数据
    async loadProjectImageList() {
      var self = this;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/glance/v2/images?limit=99999&visibility=private&status=active",
          showErrMsg: true
        });
        self.loading = false;
        return result['images'];
      } catch (res) {
        self.loading = false;
      }
    },
    //public的镜像列表
    async loadPublicImageList() {
      var self = this;
      self.loading = true;
      var body = { "project_id": self.projectId, "user_id": self.detailConfig.proUserId };
      body = JSON.stringify(body);
      try {
          let result = await self.$ajax({
            type: 'post',
            url: "api/glance/v2/images/list?limit=99999&status=active",
            data: body,
            showErrMsg: true
          });
          self.loading = false;
          return result['images'];
        } catch (res) {
          self.loading = false;
        }
    },
    //主机快照
    async loadInstanceSnapshot() {
      var self = this;
      let projectUuid = this.$cookie.get('pid');
      var resultData = [];
      var roleType = Vue.roleType + "";
      let ret = await this.$ajax({
        type: 'get',
        url: "api/glance/v2/images?limit=99999&&status=active"//image_type=snapshot
      });
      var list = ret.images;
      var rets = [];
      if (list != null) {
        for (let r = 0; r < list.length; r++) {
          var obj = list[r];
          if (typeof (obj['block_device_mapping']) != "undefined") {
            if ("private" == obj['visibility'] && self.projectId != obj['owner']) {
              continue;
            }
              rets.push(obj);
          } else {
            if (typeof (obj['image_type']) != "undefined" && (obj['image_type'] == "snapshot" || obj['image_type'] == "backup")) {
               if ("private" == obj['visibility'] && self.projectId != obj['owner']) {
                 continue;
               }
               rets.push(obj);
            }
          }
        }
      }
      return rets;
    },
    //云主机快照block类型的
    async loadSnapshotBlockType() {
      let projectUuid = this.$cookie.get('pid');
      var self = this;
      var resultData = [];
      var roleType = Vue.roleType + "";
      let ret = await this.$ajax({
        type: 'get',
        url: "api/glance/v2/images?limit=99999&status=active&owner=" + self.projectId
      });
      var list = ret.images;
      var rets = [];
      if (list != null) {
        for (let r = 0; r < list.length; r++) {
          var obj = list[r];
          if (typeof (obj['block_device_mapping']) != "undefined") {
            if ("2" == roleType || "3" == roleType) {
              if ("private" == obj['visibility'] && projectUuid != obj['owner']) {
                continue;
              }
            }
            rets.push(obj);
          }
        }
      }
      return rets;
    },
    //卷快照
    async loadVolumeSnapshot() {
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/cinderv3/v3/" + self.$cookie.get("pid") + "/snapshots?all_tenants=True&status=available&project_id=" + self.projectId; //超级管理员
      if ("2" == roleType || "3" == roleType) {
        url = "api/cinderv3/v3/" + self.$cookie.get("pid") + "/snapshots?status=available";
      }
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        return result['snapshots'];
      } catch (res) {
        self.loading = false;
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
    createVolume(value) {
      this.projectCreateForm.defaultType = 1;
      this.detailConfig.tempIsNewVolume = value;
      if (true === value) {
        this.projectCreateForm.volumeSizeFlag = true;
        this.isCreateDisk = true;
        this.loadVolumeType();
      } else {
        this.projectCreateForm.volumeSizeFlag = false;
        this.isCreateDisk = false;
      }
    },
    async loadProjectResUsage() {
      var self = this;
      if (self.projectId != "" && self.projectId != null) {
        try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + self.$cookie.get("pid") + "/os-quota-sets/" + self.projectId + "?usage=true"
        });
        var data = ret['quota_set'].gigabytes;
        var limit = data['limit'] + "";
        if ("-1" != limit) {
          self.leftVolumeSize = parseInt(limit) - parseInt(data['in_use']);
        } else {
          self.leftVolumeSize = -1;
        }
        } catch (data) {
        self.loading = false;
        }
      }
    },
    /*visibleChange(value) {
      var self = this;
      var result = self.loadSearchByKey();
      self.totalData = result;
    },*/
    queryClick(value) {
      var self = this;
      // var result = self.loadSearchByKey();
      var result = self.loadSearchTemplateList();
      if (self.projectCreateForm.type != '2') {
        self.totalData = result;
      } else {
        self.loadVolumeTypeList();
      }
    },
    loadSearchTemplateList() {
       var self = this;
       var searchKeyList = self.initSearchKey();
       var sourceTemplateList = self.templateList;
       var templates = [];
       for (let t = 0; t < sourceTemplateList.length; t++) {
          var obj = sourceTemplateList[t];
          var matchCount = 0;
          for (let k = 0; k < searchKeyList.length; k++) {
             var sObj = searchKeyList[k];
             var sKey = sObj['key'];
             var sValue = sObj['value'];
             sValue = sValue.toLowerCase();
             if ( typeof (obj[sKey]) != "undefined" && obj[sKey].toLowerCase().indexOf(sValue) >= 0) {
                ++matchCount;
             } else {
                break;
             }
          }
          if (matchCount == searchKeyList.length) {
              templates.push(obj);
          }
       }
           return templates;
    },
    initSearchKey() {
       var self = this;
       var sourceType = self.projectCreateForm.type;
       var sourceName = self.searchName;
       var sourceOs = self.osType;
       var sourceVisiable = self.visibleValue;
       var searchList = [];
       if ("1" == sourceType) { //镜像
          if (sourceName != "") {
             searchList.push({"key": "name", "value": sourceName});
          }
          if (sourceOs != "") {
             searchList.push({"key": "os_distro", "value": sourceOs});
          }
          if (sourceVisiable != "") {
             searchList.push({"key": "visibility", "value": sourceVisiable});
          }
       } else if ("2" == sourceType || "3" == sourceType) { //云硬盘 Or 云硬盘快照
          if (sourceName != "") {
            searchList.push({"key": "name", "value": sourceName});
          }
       } else if ("4" == sourceType) { //云主机快照
          if (sourceName != "") {
            searchList.push({"key": "name", "value": sourceName});
          }
          if (sourceOs != "") {
             searchList.push({"key": "os_distro", "value": sourceOs});
          }
       }
         return searchList;
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
          self.projectCreateForm.keyPairValue = keys[0];
        }
      } catch (res) {
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
    nameRender(value, rowData) {
      var self = this;
      var type = self.projectCreateForm.type;
      if (type == "2") {
        return rowData['name'] || rowData['id'];
      } else {
        return value;
      }
    },
    templateTypeChange(value) {
      var self = this;
      self.searchName = "";
      self.osType = "";
      self.visibleValue = "";
      self.detailConfig.sizeUnit = '';
      self.detailConfig.templateType = value;
      self.loadParamInit();
      self.init();
      if ((self.projectCreateForm.type == 2 || self.projectCreateForm.type == 3) && self.projectCreateForm.defaultType == 2) {
        self.projectCreateForm.defaultType = 1;
        self.projectCreateForm.keyPairValue = "";
      }
    },
    minMemoryRender(row) {
       if (typeof row['volume_image_metadata'] == "undefined") {
          return "-";
       } else {
          return row['volume_image_metadata']['min_ram'] || "-";
       }
    },
    passwordRender() {
      return '<el-tooltip placement="top"><div slot="content">ffsddf</div><el-button>***</el-button></el-tooltip>';
    },
    nextStep() {
      var self = this;
      this.$refs.projectCreateForm.validate((valid) => {
        if (valid) {
          if (self.projectCreateForm.imageRef == "") {
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateChooseTemp'),
              type: 'warning'
            });
            return false;
          } else {
            if (self.projectCreateForm.defaultType == "2" && self.projectCreateForm.keyPairValue == "") {
               self.$message({
                  showClose: true,
                  message: Vue.t('calcStorLang.instCreateChooseKeyPair'),
                  type: 'warning'
                });
                return false;
            }
            if ((self.projectCreateForm.type == "1" || self.projectCreateForm.type == "4") && self.projectCreateForm.isNewVolume) {
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
                var minDiskSize = self.detailConfig.min_disk || 0;
                self.detailConfig.tempVolumeSize = volumeSize;
                if (Number(volumeSize) < Number(templateSize)) {
                  self.$message({
                    showClose: true,
                    message: Vue.t('calcStorLang.instCreateNewDiskTip1'),
                    type: 'warning'
                  });
                  return false;
                } else if (parseInt(volumeSize) < parseInt(minDiskSize)) {
                   self.$message({
                    showClose: true,
                    message: Vue.t('calcStorLang.instCreateNewDiskTip2'),
                    type: 'warning'
                  });
                  return false;
                } else if ((self.leftVolumeSize != -1) && parseInt(volumeSize) > parseInt(self.leftVolumeSize)) {
                  self.$message({
                    showClose: true,
                    message: Vue.t('calcStorLang.instCreateNewDiskTip3') + self.leftVolumeSize + "GB",
                    type: 'warning'
                  });
                  return false;
                }
              }
            }
            if (self.projectCreateForm.type == "1" && self.templateEntity['disk_format'] == "iso" && self.detailConfig.count > 1) {
               self.$message({
                    showClose: true,
                    message: Vue.t('calcStorLang.isoImageTip'),
                    type: 'warning'
                  });
               return false;
            }
            this.$emit("stepTwoDone", this.projectCreateForm);
          }
        } else {
          return false;
        }
      });
    },
    prevStep() {
      this.$emit("prevStep", 0);
    },
    unitKeyInfo(name, key) {
      var titleMsg = name;
      var results = "";
      if (titleMsg.length > 80) {
        if (key != null && key == "title") {
           results = titleMsg;
        } else {
           results = titleMsg.substring(0, 80) + "...";
        }
      } else {
         results = titleMsg;
      }
      return results;
    },
    osRender(value, rowData) {
      var osName = rowData['os_distro'];
      if (osName == null || osName == "") {
        return '-';
      } else {
        return osName;
      }
    },
    snapshotTypeRender(value, rowData) {
      var snapType = rowData['snapshotType'];
      if ("volume" == snapType) {
        return Vue.t('calcStorLang.volumeSnapshot');
      } else if ("host" == snapType) {
        return Vue.t('calcStorLang.instanceshot');
      } else {
        return '-';
      }
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
    tzTimeFormatter(row) {
      var self = this;
      var createTime = row['created_at'];
      if (createTime.lastIndexOf("Z") < 0 && createTime.lastIndexOf(".") >= 0) {
        createTime = createTime.substring(0, createTime.lastIndexOf(".")) + "Z";
      }
      var time = Date.parse(new Date(createTime));
      return self.formatTimeStamp(time, "yyyy-MM-dd HH:mm:ss");
    },
    formatTimeStamp(timeStamp, fmt) {
      if (!timeStamp) {
        return "";
      }
      var date = new Date();
      date.setTime(timeStamp);
      var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时
        "H+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
      }
      if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : ""));
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
      }
      return fmt;
    },
    memoryRender(value, row) {
      return value + "MB";
    },
    diskRender(value, row) {
      var self = this;
      var size = row['size'];
      if ((this.projectCreateForm.type + "") == "2") {
        return self.formatFileSize(size, "GB");
      } else {
        if (row['snapshotType'] == "volume") {
          return self.formatFileSize(size, "GB");
        } else {
          return self.formatFileSize(size, "Byte");
          // return (size / (1024 * 1024 * 1024)).toFixed(2) + "GB";
        }
      }
    },
    visibilityRender(value, row) {
      if ("public" == value) {
        return Vue.t('lang.public');
      } else if ("shared" == value) {
        return Vue.t('calcStorLang.shared');
      } else if ("private" == value) {
        return Vue.t('lang.private');
      } else {
        return "-";
      }
    },
    cancel() {
      this.$emit("cancel");
    },
    handleTabCurrentChange(val) {
      var self = this;
      self.projectCreateForm.defaultType = 1;
      self.hightConfigShow = true;
      if (val != null) {
        self.templateEntity = val;
        self.multipleSelection = 1;
        self.projectCreateForm.imageRef = val.id;
        if (self.projectCreateForm.type==1||self.projectCreateForm.type==4) {
          if (val.os_distro != null) {
            var osDesc = val.os_distro;
            if (osDesc.toLocaleLowerCase().indexOf("win") >= 0) { //osDesc == "other"
              self.keyShowFlg = true;
            } else {
              self.keyShowFlg = false;
            }
            self.resetPassFlg = false;
            // self.projectCreateForm.userName = "administrator"
            if (self.systemsSupportHotPlug.find(system => val.os_distro.indexOf(system) > -1)) {
              self.currentSystemSupportHotPlug = true;
            } else {
              self.currentSystemSupportHotPlug = false;
            }
          } else {
            // self.projectCreateForm.userName = "root";
            self.keyShowFlg = true;
            self.resetPassFlg = true;
            self.currentSystemSupportHotPlug = false; //镜像中不包含系统的话，则不允许热扩容
          }
        } else {
            self.resetPassFlg = false;
        }
        self.detailConfig.iso = val.name;
        var sourceTemplateType = self.projectCreateForm.type + "";
        if ("1" == sourceTemplateType || "4" == sourceTemplateType) {
           self.detailConfig['min_disk'] = val['min_disk'];
           self.detailConfig['min_ram'] = val['min_ram'];
        } else {
           if (typeof val['volume_image_metadata'] == "undefined") {
              self.detailConfig['min_ram'] = null;
           } else {
              self.detailConfig['min_ram'] = val['volume_image_metadata']['min_ram'] || 0;
           }
        }
        if ((self.projectCreateForm.type + "") == "2") {
          self.detailConfig.size = val.size;
          self.detailConfig.sizeUnit = self.formatFileSize(val.size, "GB");
        } else if ((self.projectCreateForm.type + "") == "3") {
          if (val.snapshotType == "host") {
            self.detailConfig.size = (val.size / (1024 * 1024 * 1024)).toFixed(2);
            self.detailConfig.sizeUnit = self.formatFileSize(val.size, "Byte");
            self.projectCreateForm.snapshotType = "host";
          } else {
            self.detailConfig.size = val.size;
            self.detailConfig.sizeUnit = self.formatFileSize(val.size, "GB");
            self.projectCreateForm.snapshotType = "volume";
          }
        } else {
          if (val.size <= 0) {
             self.sizeFlag = false;
          } else {
             self.sizeFlag = true;
          }
          self.detailConfig.size = (val.size / (1024 * 1024 * 1024)).toFixed(2);
          self.detailConfig.sizeUnit = self.formatFileSize(val.size, "Byte");
          if ((self.projectCreateForm.type + "") == "4" && !self.sizeFlag) {
            self.projectCreateForm.isNewVolume = false;
            self.hightConfigShow = false;
          }
        }
      } else {
        self.sizeFlag = true;
        self.templateEntity = "";
      }
    },
    loadParamInit() {
      var self = this;
      self.multipleSelection = 0;
      self.projectCreateForm.imageRef = "";
      self.detailConfig.iso = "";
      self.$refs.acTable.clearSelection();
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    onRefresh() {
      this.loadParamInit();
      this.init();
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.loadVolumeTypeList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.loadVolumeTypeList();
    }
  }
}

</script>
<style scoped>


</style>
