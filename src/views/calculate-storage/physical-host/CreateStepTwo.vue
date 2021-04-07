<template>
  <el-form class="margin-tb20 me-required-form" label-position="left" :model="projectCreateForm" :rules=rules ref="projectCreateForm" label-width="170px">
    <el-form-item :label="$t('calcStorLang.template') + $t('calcStorLang.source')" class="is-required" v-show="false">
      <el-radio-group v-model="projectCreateForm.type" @change="templateTypeChange">
        <el-radio class="radio" label="1">{{$t('calcStorLang.image')}}</el-radio>
        <el-radio class="radio" label="2">{{$t('calcStorLang.volume')}}</el-radio>
        <el-radio class="radio" label="3">{{$t('calcStorLang.volumeSnapshot')}}</el-radio>
        <el-radio class="radio" label="4">{{$t('calcStorLang.instanceshot')}}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="" class="is-required" label-width="10px">
      <span>{{$t("lang.name")}}</span>
      <el-input class="col-5" v-model="searchName" auto-complete="off"></el-input>
      <el-button type="primary" icon='fa-search' size="small" @click="queryClick()">{{$t("lang.query")}}</el-button>
    </el-form-item>
    <span>{{ $t('calcStorLang.CREATE_BARE_METAL_AGENT_TIPS') }}</span>
    <el-table ref="acTable" :data="tableData" highlight-current-row border stripe :default-sort="{prop: 'name', order: 'ascending'}" row-key="id" highlight-current-row @current-change="handleTabCurrentChange" v-loading="loading" :element-loading-text="$t('lang.dataLoading')"  @sort-change="sortChange">
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
      <el-table-column v-if="columnsChecked.indexOf('visibility') >= 0 && projectCreateForm.type == 1" prop="visibility" align="left" :label="$t('calcStorLang.visibility')" show-overflow-tooltip min-width="50">
        <template slot-scope="scope">
          <span v-html="visibilityRender(scope.row.visibility, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('snapshotType') >= 0 && projectCreateForm.type == 3" prop="visibility" align="left" :label="$t('calcStorLang.type')" show-overflow-tooltip min-width="50">
        <template slot-scope="scope">
          <span v-html="snapshotTypeRender(scope.row.type, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('date') >= 0" prop="created_at" align="left" :label="$t('calcStorLang.createTime')" show-overflow-tooltip min-width="50">
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
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
          </el-popover>
        </el-col>
        <el-col :span="24">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :pageCount="pageCount" :sortObj="sortObj"></page>
        </el-col>
      </el-row>
    </div>
    <el-collapse class="col-24" v-if="hightConfigShow">
      <el-collapse-item :title="$t('calcStorLang.advanceOptions')" name="11" label-width="200px">
        <el-form-item :label="$t('calcStorLang.createInstLoginType')" class="" v-show="sizeFlag && (projectCreateForm.type=='1' || projectCreateForm.type=='4') || (projectCreateForm.type=='2' || projectCreateForm.type=='3')">
          <el-radio-group v-model="projectCreateForm.defaultType" @change="keyPairType">
            <el-radio class="radio" :label="1">{{$t('calcStorLang.oldPassword')}}</el-radio>
            <el-radio class="radio" v-if="$archIs('x86')" :label="3" :disabled="resetPassFlg">{{$t('lang.resetPassword')}}</el-radio>
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
          <el-tooltip placement="top" trigger="hover" :content="$t('network.createInstLoginTip2')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('lang.confirmPassword')" prop="userConfirmPass" class="is-required" v-show="key3Flag && (projectCreateForm.type=='1' || projectCreateForm.type=='4' || projectCreateForm.type=='2' || projectCreateForm.type=='3') && sizeFlag">
          <el-input class="col-8" v-model="projectCreateForm.userConfirmPass" auto-complete="off" type="password"></el-input>
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
      hightConfigShow: true,
      activeIndex: 1,
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
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
        isDelVolume: false,
        volumeSizeFlag: false,
        size: ''
      },
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
      visibleValue: "0",
      searchName: '',
      formatFileSize: formatFileSize,
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
        size: [{ type: 'integer' }, { type: 'min', value: 1 }, { type: 'max', value: 9999 }]
      },
      currentPage: 1,
      showBorder: true,
      pageCount: 5,
      pageSizes: [5, 10, 20],
      pageSize: 5,
      total: 0,
      columns: [{
        prop: "name",
        label: Vue.t("lang.name")
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
  mounted() {
    var self = this;
    if (self.detailConfig.roleType == '3') {
      self.initForm = Object.assign({}, this.projectCreateForm);
      self.ruleStore = Object.assign({}, this.rules);
      self.init();
    }
  },
  methods: {
    sortChange(column) {
       var self = this;
       var key = column.prop;
       var keyOrder = column.order;
       self.sortObj = {
          sortOrder:keyOrder,
          sortField:key
        };
       if (keyOrder != null && self.totalData.length > 0) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder));
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
      Promise.all([self.loadProjectImageList(), self.loadPublicImageList()]).then(function(result) {
        var data1 = result[0];
        var data2 = result[1];
        middleList = data1.concat(data2);
        for (let m = 0; m < middleList.length; m++) { //遍历提出snap类型的镜像
          var obj = middleList[m];
          if ((obj.hasOwnProperty("image_type") && obj['image_type'] == "snapshot") || typeof (obj['block_device_mapping']) != "undefined") {
            continue;
          } else {
            if ("private" == obj['visibility'] && self.projectId != obj['owner']) {
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
      var url = "api/cinderv2/v3/" + this.$cookie.get("pid") + "/volumes/detail?bootable=true&status=available&all_tenants=True&project_id=" + self.projectId;
      if ("2" == roleType || "3" == roleType) {
        url = "api/cinderv2/v3/" + this.$cookie.get("pid") + "/volumes/detail?bootable=true&status=available";
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
            var volume = volumeList[v];
            if (volume['name'] == "") {
               volume['name'] = volume['id'];
            }
        }
        self.totalData = volumeList;
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
          url: "api/glance/v2/images?limit=99999&visibility=private&status=active&tag=@",
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
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/glance/v2/images?limit=99999&visibility=public&status=active&tag=@",
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
            if (typeof (obj['image_type']) != "undefined" && obj['image_type'] == "snapshot") {
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
    createVolume(value) {
      this.projectCreateForm.defaultType = 1;
      this.detailConfig.tempIsNewVolume = value;
      if (true === value) {
        this.projectCreateForm.volumeSizeFlag = true;
        this.isCreateDisk = true;
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
      self.totalData = result;
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
       var sourceVisiable = self.visibleValue + "" == "0"?"":self.visibleValue;
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
      self.visibleValue = "0";
      self.detailConfig.templateType = value;
      self.loadParamInit();
      self.init();
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
              message: Vue.t("calcStorLang.pleaseChoose") + Vue.t("calcStorLang.template"),
              type: 'warning'
            });
            return false;
          } else {
            if (self.projectCreateForm.defaultType == "2" && self.projectCreateForm.keyPairValue == "") {
               self.$message({
                  showClose: true,
                  message: Vue.t("calcStorLang.pleaseChoose") + Vue.t("calcStorLang.keypair"),
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
        return Vue.t("calcStorLang.volumeSnapshot");
      } else if ("host" == snapType) {
        return Vue.t("calcStorLang.instanceshot");
      } else {
        return '-';
      }
    },
    keyPairType(value) {
      if (1 === value) {
        this.key2Flag = false;
        this.key3Flag = false;
        this.key4Flag = false;
        this.projectCreateForm.userPass = "";
        this.projectCreateForm.userConfirmPass = "";
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
      if ("shared" == value || "public" == value) {
        return Vue.t("lang.public");
      } else if ("private" == value) {
        return Vue.t("lang.private");
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
      if (val != null) {
        self.multipleSelection = 1;
        self.projectCreateForm.imageRef = val.id;
        if (val.os_distro != null) {
          var osDesc = val.os_distro;
          if (osDesc.toLocaleLowerCase().indexOf("win") >= 0) { //osDesc == "other"
             self.keyShowFlg = true;
          } else {
             self.keyShowFlg = false;
          }
          self.resetPassFlg = false;
          // self.projectCreateForm.userName = "administrator";
        } else {
          // self.projectCreateForm.userName = "root";
          self.keyShowFlg = true;
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
        }
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
    }
  }
}

</script>
<style scoped>


</style>
