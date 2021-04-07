<template>
  <div>
    <icos-page-header :title="$t('calcStorLang.physicalHost')" />
    <icos-page>
      <icos-search-bar
        :conditions="searchBar.conditions"
        @search="handleSearch"
        @condition-value-changed="handleConditionValueChanged" />
      <div class="divider clearfix"></div>
      <div class="operation-panel" @mousedown="detailMouseLeave">
        <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus" :operateMore="operateMore">
        </operation-panel>
      </div>
      <div class="divider clearfix"></div>
      <el-table ref="umTable" :data="tableData" v-loading="loading" highlight-current-row stripe border style="width: 100%" :default-sort="{prop: 'created', order: 'descending'}" row-key="id" @row-click="rowClick" @selection-change="handleSelectionChange"  @sort-change="sortChange">
        <el-table-column
          reserve-selection
          type="selection"
          width="55"
          align="center"
          :selectable="function(row, index) { return !['soft-deleting', 'soft_deleting', 'deleting'].includes(row['OS-EXT-STS:task_state']) }">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('console') >= 0 && $archIs('x86')" prop="console" :label="$t('calcStorLang.console')" min-width="30" align="center">
          <template slot-scope="scope">
            <el-button icon="fa-desktop" v-if="scope.row.status=='ACTIVE' || scope.row.status=='RESCUE'" style="color:#2196F3" class="el-button el-button--small" @click="vmConsolePage(scope.row)"></el-button>
            <el-button icon="fa-desktop" v-if="scope.row.status!='ACTIVE' && scope.row.status!='RESCUE'" class="el-button el-button--small"></el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" align="left" sortable="custom" min-width="80">
          <template slot-scope="scope">
            <el-button @click="vmDetail(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('id') >= 0" label="ID" prop="id" align="left" min-width="80">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('mirrorName') >= 0" prop="mirrorName" :label="$t('calcStorLang.source')" align="left" min-width="120">
          <template slot-scope="scope">
            <el-popover ref="sourceDetailPop" placement="top" trigger="click">
              <div class="table_panel" style="width:410px">
                <table class="table table-content table-hover idatatable table-bordered" border="1">
                  <tbody>
                  <tr class="odd">
                    <th class="idatath" style="width:80px">{{$t('lang.name')}}:</th>
                    <td class="idatatd">
                      <span>{{sourceDetailEntity.name || sourceDetailEntity.id ||"-"}}</span>
                    </td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">ID:</th>
                    <td class="idatatd">
                      <span>{{sourceDetailEntity.id || "-"}}</span>
                    </td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('calcStorLang.size')}}:</th>
                    <td class="idatatd">
                      <span>{{sourceDetailEntity.size || "-"}}</span>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </el-popover>
            <el-button v-popover:sourceDetailPop type="text" @click="sourceDetailTip(scope.row)">
              <span v-html="imageRender(scope.row.mirrorName, scope.row)"></span>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('address') >= 0" :label="$t('calcStorLang.IP')" align="left" prop="address">
          <template slot-scope="scope">
            <span v-html="ipAddressRender(scope.row.addresses, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" :label="$t('lang.status')" sortable="custom" min-width="50" align="left">
          <template slot-scope="scope">
            <span v-if="statusRender(scope.row.status, scope.row)==='-'">-</span>
            <el-tag v-else :type="statusTagRender(scope.row.status)">
              <span v-html="statusRender(scope.row.status, scope.row)"></span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('taksType') >= 0" prop="OS-EXT-STS:task_state" :label="$t('calcStorLang.task')" min-width="50" align="left">
          <template slot-scope="scope">
            <span v-html="taskRender(scope.row.owner, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('flavor') >= 0" prop="flavor" :label="$t('calcStorLang.bareSpec')" min-width="50">
          <template slot-scope="scope">
            <span v-html="flavorRender(scope.row.flavor, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('domain') >= 0" prop="domain" :label="$t('calcStorLang.az')" min-width="50">
          <template slot-scope="scope">
            <span v-html="domainRender(scope.row.domain, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="(columnsChecked.indexOf('project') >= 0) && roleType != '3'" prop="project" :label="$t('lang.project')" min-width="50">
          <template slot-scope="scope">
            <span v-html="projectRender(scope.row.project, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('owner') >= 0" prop="owner" :label="$t('calcStorLang.owner')" min-width="50">
          <template slot-scope="scope">
            <span v-html="ownerRender(scope.row.owner, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('task') >= 0" prop="task" :label="$t('calcStorLang.task')" min-width="50" align="left">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('powerStatus') >= 0" prop="powerStatus" :label="$t('calcStorLang.powerStatus')" min-width="60" align="left">
          <template slot-scope="scope">
            <el-tag :type="powerStatusTagRender(scope.row)">
              <span v-html="powerStatusRender(scope.row.powerStatus, scope.row)"></span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('date') >= 0" prop="created" :label="$t('calcStorLang.time')" sortable="custom" min-width="70" align="left">
          <template slot-scope="scope">
            <span v-html="dateRender(scope.row.created, scope.row)"></span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onRefresh">
            </el-button>
            <span> {{$t('lang.currentSelected') + multipleSelection.length + " " + $tc('lang.item', multipleSelection.length)}}</span>
            <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" class="name-wrapper">
                <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
              </div>
            </el-popover>
          </el-col>
          <el-col :span="19">
            <page ref="pageComponent" :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
          </el-col>
        </el-row>
        <volume-manage v-if="volumeFlag" @handleVolumeFlag="handleVolumeFlag" :hostEntity="hostEntity" :volumeMaps="volumeMaps"></volume-manage>
        <add-instance ref="addInstance" v-if="addFlag" @handleAddShow="handleAddShow" @onRefresh="onRefresh" @reloadVolume="reloadVolume"></add-instance>
        <apply-physical-host ref="applyPhysical" v-if="applyFlag" @handleApplyShow="handleApplyShow" @onRefresh="onRefresh"></apply-physical-host>
        <edit-instance @handleShow="handleShow" @onRefresh="onRefresh" ref="editInstance" :instUuid="instUuid" :instName="instanceName" v-if="editFlag"></edit-instance>
        <change-password @handleChangePassword="handleChangePassword" @onRefresh="onRefresh" ref="editInstance" :instUuid="instUuid" :instName="instanceName" v-if="changePasswordFlag"></change-password>
        <revise-instance v-if="reviseFlag" @handleReviseConfig="handleReviseConfig" :instFlavorId="instFlavorId" :instUuid="instUuid" :instProjectId="instProjectId" :instName="instanceName" :instFlavorEmpty="instFlavorEmpty" @onRefresh="onRefresh"></revise-instance>
        <netcard-config v-if="cardFlag" @handleCardFlag="handleCardFlag" @onRefresh="onRefresh" :hostEntity="hostEntity"></netcard-config>
        <reconstruction v-if="reconFlag" @handleReconFlag="handleReconFlag" :instUuid="instUuid" :instProjectId="instProjectId" :instName="instanceName" @onRefresh="onRefresh"></reconstruction>
        <floating-ip :projectId="projectId" :originFlag="'phy'" :instUuid="instUuid" v-if="floatFlag" @handleFloatIpFlag="handleFloatIpFlag" :instanceName="instanceName"></floating-ip>
        <qos v-if="qosFlag" @handleQosFlag="handleQosFlag"></qos>
        <migrate v-if="migrateFlag" @handleMigrateFlag="handleMigrateFlag" :instUuid="instUuid" :instName="instanceName" @onRefresh="onRefresh"></migrate>
        <rescue v-if="rescueFlag" @handleRescueFlag="handleRescueFlag" :instUuid="instUuid" :instProjectId="instProjectId" :instName="instanceName" :instImageId="instImageId" :instSource="instSource" @onRefresh="onRefresh"></rescue>
        <edit-securitygroup ref="editsecuritygroup" v-if="securityGroupFlag" @handleSecurityGroupFlag="handleSecurityGroupFlag" :instUuid="instUuid" :projectId="projectId" :instanceName="instanceName"></edit-securitygroup>
        <delete-instances v-if="deleteInstancesDialog.visible" :instances="deleteInstancesDialog.instances" @close="deleteInstancesDialog.visible = false" @refresh="onRefresh" />
        <transition name="slide-right" mode="out-in">
          <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
            <panel style="height: 100%">
              <div slot="title" class="clearfix">
                <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
              </div>
              <div>
                <instance-detail :InstanceId="InstanceId" :projectMaps="projectMaps" :userMaps="userMaps" :flavorMaps="flavorMaps" :networkMaps="networkMaps"></instance-detail>
              </div>
            </panel>
          </div>
        </transition>
      </div>
    </icos-page>
  </div>
</template>
<script>
import formatFileSize from 'utils/formatFileSize';
import { mapGetters, mapMutations } from 'vuex';
import OperateInstance from './OperateInstance';
import AddInstance from './AddPhysicalHost';
import ReviseInstance from '../instance/ReviseInstance';
import EditInstance from './EditPhysicalHost';
import ChangePassword from './ChangePassword';
import NetcardConfig from './NetcardConfig';
import InstanceDetail from './InstanceDetail';
import Reconstruction from '../instance/Reconstruction';
import FloatingIp from './FloatingIp';
import VolumeManage from './VolumeManage';
import Qos from '../instance/Qos';
import Migrate from '../instance/Migrate';
import EditSecuritygroup from '../instance/EditSecuritygroup';
import Rescue from '../instance/Rescue';
import ApplyPhysicalHost from './ApplyPhysicalHost';
import DeleteInstances from './DeleteInstances';
export default {
  name: "Instances",
  components: {
    ChangePassword,
    EditInstance,
    AddInstance,
    InstanceDetail,
    NetcardConfig,
    Reconstruction,
    FloatingIp,
    VolumeManage,
    Qos,
    ReviseInstance,
    Migrate,
    EditSecuritygroup,
    Rescue,
    ApplyPhysicalHost,
    DeleteInstances
  },
  data() {
    return {
      sourceDetailEntity: {},
      sortObj:{
        sortOrder:"descending",
        sortField:"created"
      },
      deleteInstancesDialog: {
        instances: [],
        visible: false
      },
      InstanceId: '',
      currentPage: 1,
      projectUserList: '',
      projectUsersOptions: [],
      instanceName: '',
      instUuid: '',
      instProjectId: '',
      instFlavorId: '',
      instImageId: '',
      instSource: '',
      instFlavorEmpty: false,
      roleType: Vue.roleType + "",
      loading: false,
      loadingText: Vue.t("lang.loading"),
      addFlag: false,
      applyFlag:false,
      editFlag: false,
      changePasswordFlag: false,
      configFlag: false,
      reviseFlag: false,
      diskFlag: false,
      cardFlag: false,
      detailFlag: false,
      reconFlag: false,
      floatFlag: false,
      volumeFlag: false,
      qosFlag: false,
      creIsoFlag: false,
      migrateFlag: false,
      rescueFlag: false,
      totalData: [],
      reloadTblFlag: false,
      securityGroupFlag: false,
      hostEntity: '',
      userMaps: new Map(),
      projectMaps: new Map(),
      imageMaps: new Map(),
      flavorMaps: new Map(),
      instanceMaps: new Map(),
      volumeMaps: new Map(),
      volumeSnapMaps: new Map(),
      templateMaps: new Map(),
      networkMaps: new Map(),
      projectId: null,
      selectTblRow: '',
      columns: [{
        prop: "name",
        label: Vue.t("lang.name")
      }, {
        prop: "id",
        label: "ID"
      }, {
        prop: "mirrorName",
        label: Vue.t("calcStorLang.source")
      }, {
        prop: "address",
        label: Vue.t("calcStorLang.IP")
      }, {
        prop: "status",
        label: Vue.t("lang.status")
      }, {
        prop: "taksType",
        label: Vue.t("calcStorLang.task")
      }, {
        prop: "flavor",
        label: Vue.t("calcStorLang.bareSpec")
      }, {
        prop: "domain",
        label: Vue.t("calcStorLang.az")
      }, {
        prop: "project",
        label: Vue.t("lang.project")
      }, {
        prop: "owner",
        label: Vue.t("calcStorLang.owner")
      }, {
        prop: "powerStatus",
        label: Vue.t("calcStorLang.powerStatus")
      }, {
        prop: "date",
        label: Vue.t("calcStorLang.time")
      }],
      columnsChecked: ['name', 'mirrorName', 'address', 'taksType', 'flavor', 'project', 'owner', 'status', 'powerStatus', 'date'],
      tableData: [],
      multipleSelection: [],
      operationMenus: OperateInstance.bind(this)(),
      operateMore: true,
      searchBar: {
        conditions: {
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          },
          status: {
            label: this.$t('lang.status'),
            type: 'select',
            options: [{
              label: this.$t('calcStorLang.running'),
              value: 'ACTIVE'
            }, {
              label: this.$t('calcStorLang.closed'),
              value: 'SHUTOFF'
            }, {
              label: this.$t('calcStorLang.error'),
              value: 'ERROR'
            }, {
              label: this.$t('calcStorLang.build'),
              value: 'BUILD'
            }]
          },
          project_id: {
            label: this.$t('lang.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          },
          user_id: {
            label: this.$t('calcStorLang.owner'),
            type: 'select',
            visible: String(Vue.roleType) !== '3',
            options: []
          },
          source: {
            label: this.$t('calcStorLang.source'),
            type: 'input',
            validator: (value) => {
              if (!/^[a-fA-F0-9\-]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyUUIDKeyword'));
              }
            }
          },
          ip: {
            label: this.$t('calcStorLang.IP'),
            type: 'input',
            validator: (value) => {
              if (!/^[\.0-9]*$/.test(value)) {
                throw new Error(this.$t('validation.ip'));
              }
            }
          }
        },
        validatedParams: {}
      }
    }
  },
  beforeDestroy() {
    if (this.interVmValid != null) {
      clearInterval(this.interVmValid);
    }
  },
  watch: {
    columnsChecked: {
      handler: function(rows, oldVal) {
        this.columnsChecked = rows;
      },
      deep: true
    },
    tableData: {
      immediate: false,
      handler: function(list) {
        var self = this;
        self.reloadTblFlag = false;
        if (list != null) {
          for (var t = 0; t < list.length; t++) {
            var obj = list[t];
            if (obj['OS-EXT-STS:task_state'] != null || obj['status'] == "BUILD") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.interVmValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interVmValid = setInterval(() => {
              this.getData()
            }, 5000);
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      routers: 'getRouters'
    })
  },
  mounted() {
    var self = this;
    var roleType = Vue.roleType + "";
    if (this.$archIs('x86')) {
      this.columnsChecked = ['console', 'name', 'mirrorName', 'address', 'taksType', 'flavor', 'project', 'owner', 'status', 'powerStatus', 'date'];
      this.columns.splice(0, 0, {
        prop: "console",
        label: Vue.t('calcStorLang.console')
      })
    }
    if ("0" == roleType || "2" == roleType) {
      Promise.all([self.loadProjectList(), self.loadUserList(), self.loadFlavorList()]).then(function(result) {
        self.getData();
      });
    } else {
      self.columns.splice(8, 1);
      Promise.all([self.loadUserList(), self.loadFlavorList()]).then(function(result) {
        self.getData();
      });
    }
    self.loadNetListData();
    self.loadVolumeList();
  },
  methods: {
    async loadImageDetail(id) {
      const self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/nova/v2.1/images/" + id,
          showErrMsg: true
        });
        self.sourceDetailEntity = result['image'];
        self.sourceDetailEntity.size = formatFileSize(result['image']['OS-EXT-IMG-SIZE:size'], "Byte");
        self.sourceDetailEntity.type = "";
      } catch (res) {
        self.sourceDetailEntity = "";
        self.loading = false;
      }
    },
    sourceDetailTip(row) {
      const self = this;
      self.sourceDetailEntity = {};
      let uuId = "";
      uuId = row['image'].id;
      self.loadImageDetail(uuId);
    },
    detailMouseLeave() {
      var self = this;
      self.detailFlag = false;
    },
    operateFlag(row) {
       var flag = true;
       if (row['status'] == "VERIFY_RESIZE") {
         flag = false;
       }
       return flag;
    },
    sortChange(column) {
       var self = this;
       if (!column.prop) { return; }
       self.sortObj = {
         sortOrder:column.order,
         sortField:column.prop
       };
       /*var key = column.prop;
       var keyOrder = column.order;
       if (keyOrder != null && self.totalData != null) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder));
       }*/
    },
    async loadNetListData() {
      var self = this;
      var url = "api/neutron/v2.0/networks";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false,
          complete: function(XMLHttpRequest, textStatus) {}
        });
        var list = result['networks'];
        for (let v = 0; v < list.length; v++) {
          var obj = list[v];
          var network = obj.name || obj.id;
          self.networkMaps.set(obj.id, network);
        }
        } catch (data) {
        }
    },
    autoReloadData() {
      var self = this;
      if (self.interVmValid != null) {
        clearInterval(self.interVmValid);
      }
      if (self.reloadTblFlag && !self._isDestroyed) {
        self.interVmValid = setInterval(() => {
          this.getData()
        }, 5000);
      }
    },
    reloadVolume() {
     /* var self = this;
      setTimeout( function() {
        self.loadVolumeList();
      }, 10000);*/
    },
    async loadVolumeList() {
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/cinderv2/v3/" + this.$cookie.get("pid") + "/volumes/detail?all_tenants=True";
      if ("2" == roleType || "3" == roleType) {
        url = "api/cinderv2/v3/" + this.$cookie.get("pid") + "/volumes/detail";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        var volumeList = result['volumes'];
        for (let v = 0; v < volumeList.length; v++) {
          var volume = volumeList[v];
          var name = volume.name || volume.id;
          self.volumeMaps.set(volume.id, name);
          //self.volumeListMaps.set(volume.id, volume);
        }
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    async getData() {
      var self = this;
      //查询条件
      var vmName = self.searchBar.validatedParams.name ? encodeURI(self.searchBar.validatedParams.name) : '';
      var vmStatus = self.searchBar.validatedParams.status || '';
      var vmProjectId = self.searchBar.validatedParams.project_id || '';
      var vmOwnerId = self.searchBar.validatedParams.user_id || '';
      var vmImageSource = self.searchBar.validatedParams.source || '';
      var vmIpAddress = self.searchBar.validatedParams.ip || '';
      var roleType = Vue.roleType + "";
      var url = "";
      let reg = /^[_\-0-9a-zA-Z\u4e00-\u9fa5@]+$/;
      var searchNameByUI = vmName !== '';
      if ("2" == roleType || "3" == roleType) { //超级
        if (searchNameByUI) {
          url = "api/nova/v2.1/servers-inspur/detail?project_id=" + this.$cookie.get("pid") + "&tags=@";
        } else {
          if (vmName == "" || vmName == null) {
            url = "api/nova/v2.1/servers-inspur/detail?project_id=" + this.$cookie.get("pid") + "&tags=@";
          } else {
            url = "api/nova/v2.1/servers-inspur/detail?project_id=" + this.$cookie.get("pid") + "&name=" + vmName + "&tags=@";
          }
        }
      } else {
        if (searchNameByUI) {
          url = "api/nova/v2.1/servers-inspur/detail?all_tenants=1" + "&tags=@";
        } else {
          if (vmName == "" || vmName == null) {
            url = "api/nova/v2.1/servers-inspur/detail?all_tenants=1" + "&tags=@";
          } else {
            url = "api/nova/v2.1/servers-inspur/detail?all_tenants=1&name=" + vmName + "&tags=@";
          }
        }
      }
      url = self.loadUrlKeySearch([
                                    {"value": vmStatus, "label":"status"},
                                    {"value": vmProjectId, "label":"project_id"},
                                    {"value": vmOwnerId, "label":"user_id"},
                                    {"value": vmIpAddress, "label": "ip"}
                                   ], url);
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          showErrMsg: true
        });
        var vmList = result['servers'];
        var searchlist = [];
        for (let i = 0; i < vmList.length; i++) {
            var obj = vmList[i];
            var source = self.imageRender(obj.mirrorName, obj) || "";
            if (vmImageSource != "") {
              if (source == "" || (source != "" && source.indexOf(vmImageSource) < 0)) {
                 continue;
              }
            }
            if (roleType == "2" && self.projectUserList != "" && (obj.user_id != self.projectUserList)) {
               continue;
            }
            if (roleType == "3" && obj.user_id != Vue.userId) {
               continue;
            }
            if (searchNameByUI && obj.name.toLowerCase().indexOf(vmName.toLowerCase().substring(0, 20)) < 0) {
               continue;
            }
            obj.sourceType = self.templateMaps.get(obj.id);
            self.instanceMaps.set(obj.id, obj);
            searchlist.push(obj);
        }
        self.totalData = searchlist; //result['servers']
        self.total = result['servers'].length;
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    loadUrlKeySearch(keyList, url) {
       var self = this;
       for (let k = 0; k < keyList.length; k++) {
          var key = keyList[k];
          if (key['value'] != "") {
            url = url + "&" + key['label'] + "=" + key['value'];
          }
       }
         return url;
    },
    async loadProjectList() {
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/keystone/v3/projects?domain_id=default";
      if ("2" == roleType) {
        url = "api/keystone/v3/users/" + Vue.userId + "/projects";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        self.searchBar.conditions.project_id.options = result.projects.map(item => {
          return {
            value: item.id,
            label: item.name
          };
        });
        var list = result['projects'];
        for (var p = 0; p < list.length; p++) {
          var obj = list[p];
          self.projectMaps.set(obj.id, obj.name);
        }
      } catch (res) {
      }
    },
    async loadUserList(projectId) {
      const $this = this;
      const roleType = String(Vue.roleType);
      let users = [];
      if (roleType === '0' && (projectId === '' || projectId === null || projectId === undefined)) {
        try {
          const res = await $this.$ajax({
            type: 'get',
            url: 'api/keystone/v3/inspur/users?dir=asc&field=name&domain_id=default'
          });
          users = res.users;
        } catch (res) {
          __DEV__ && console.error(res);
        }
      } else {
        try {
          if (roleType !== '0') {
            projectId = $this.$cookie.get('pid');
          }
          const res = await $this.$ajax({
            type: 'get',
            url: `api/keystone/v3/inspur/assignments/projects/${projectId}/users`
          });
          users = res.users.map(item => item.user);
        } catch (res) {
          __DEV__ && console.error(res);
        }
      }
      if ($this.projectUsersOptions.length === 0) {
        $this.projectUsersOptions = users;
        for (var u = 0; u < users.length; u++) {
          var obj = users[u];
          $this.userMaps.set(obj.id, obj.name);
        }
      }
      $this.searchBar.conditions.user_id.options = users.map(item => {
        return {
          label: item.name,
          value: item.id
        };
      });
    },
    async loadFlavorList() {
      var self = this;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/flavors'
        });
        var list = result['flavors'];
        for (var u = 0; u < list.length; u++) {
          var obj = list[u];
          self.flavorMaps.set(obj.id, obj.name);
        }

        let result1 = await self.$ajax({
              type: 'get',
              data: {"is_public": false},
              url: 'api/nova/v2.1/flavors/detail',
              showErrMsg: true
        });
        var list1 = result1['flavors'];
        for (var u1 = 0; u1 < list1.length; u1++) {
          var obj1 = list1[u1];
          self.flavorMaps.set(obj1.id, obj1.name);
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    alterConfigOperate(value) {
       var self = this;
       if ("certain" == value) {
          self.confirmOperate(self.selectTblRow);
       } else if ("cancel" == value) {
          self.cancelOperate(self.selectTblRow);
       }
    },
    async confirmOperate(row) {
      var self = this;
      self.loading = true;
      var body = { "confirmResize": null };
      body = JSON.stringify(body);
      try {
        let result = await self.$ajax({
          type: 'post',
          url: 'api/nova/v2.1/servers/' + row.id + '/action',
          data: body,
          showErrMsg: true,
          errorKey: "badRequest",
          log: {
            description: {
              en: "Certain Migrate Instance:" + row['name'],
              zh_cn: "确认调整/迁移云主机:" + row['name']
            },
            key: "name",
            target: Vue.logTarget.computeInstance
          },
          successFun: function() {
            var instance = self.instanceMaps.get(row.id);
            instance['OS-EXT-STS:task_state'] = "BUSY";
            self.$message("确认更改发送成功！");
            setTimeout(function() {
              self.onRefresh();
            }, 5000);
          },
          errFun: function() {
            self.loading = false;
          }
        });
      } catch (res) {
      }
    },
    async cancelOperate(row) {
      var self = this;
      var body = { "revertResize": null };
      body = JSON.stringify(body);
      try {
        let result = await self.$ajax({
          type: 'post',
          url: 'api/nova/v2.1/servers/' + row.id + '/action',
          data: body,
          showErrMsg: true,
          errorKey: "badRequest",
          log: {
            description: {
              en: "Cancel Migrate Instance:" + row['name'],
              zh_cn: "废弃调整/迁移云主机:" + row['name']
            },
            target: Vue.logTarget.computeInstance
          },
          successFun: function() {
            var instance = self.instanceMaps.get(row.id);
            instance['OS-EXT-STS:task_state'] = "BUSY";
            self.$message("取消更改发送成功！");
            setTimeout(function() {
              self.onRefresh();
            }, 5000);
          }
        });
      } catch (res) {
        self.loading = false;
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleDisplay(key) {
      switch (key) {
        case 'addFlag':
          this.addFlag = false;
          break
        case 'volumeFlag':
          this.volumeFlag = false;
          break
      }
    },
    searchInstance() {
      const self = this;
      self.$refs.phyForm.validate((valid) => {
        if (valid) {
          self.$refs.umTable.clearSelection();
          self.getData();
        }
      });
    },
    async vmConsolePage(row) {
      var self = this;
      var body = { "os-getVNCConsole": { "type": "novnc" } };
      body = JSON.stringify(body);
      try {
        let result = await self.$ajax({
          type: 'get',
          // data: body,
          url: 'api/ironic/v1/nodeinstances/' + row['id'],
          showErrMsg: true
        });
        var data = result.console_info.url;
        // var consoleToken = data.substring(data.indexOf("token") + 6, data.length);
        // self.$cookie.set('vmConsoleToken', data);
        window.open(data, '_blank');
      } catch (res) {
        self.loading = false;
      }
    },
    vmDetail(row) {
      this.detailFlag = true;
      this.InstanceId = row['id'];
      this.$refs.umTable.clearSelection();
    },
    handleAddShow() {
      this.addFlag = false;
    },
    handleApplyShow() {
      this.applyFlag = false;
    },
    handleShow() {
      this.editFlag = false;
    },
    handleChangePassword() {
      this.changePasswordFlag = false;
    },
    handleConfig() {
      this.configFlag = false;
    },
    handleReviseConfig() {
      this.reviseFlag = false;
    },
    handleFlag() {
      this.diskFlag = false;
    },
    handleCardFlag() {
      this.cardFlag = false;
    },
    handleReconFlag() {
      this.reconFlag = false;
    },
    handleVolumeFlag() {
      this.volumeFlag = false;
    },
    handleFloatIpFlag() {
      let self = this;
      this.floatFlag = false;
      this.$refs.umTable.clearSelection();
      setTimeout(function() {
        self.getData({
          page: 1
        });
      }, 2000);
    },
    handleQosFlag() {
      this.qosFlag = false;
    },
    handlerCreIsoFlag() {
      this.creIsoFlag = false;
    },
    hrefToSnapshotPage() {
      this.$router.push({
            path: '/calculate-storage/snapshot/instancesolt'
          });
    },
    handleMigrateFlag() {
      this.migrateFlag = false;
    },
    handleRescueFlag() {
      this.rescueFlag = false;
    },
    handleSecurityGroupFlag() {
      this.securityGroupFlag = false;
    },
    rowClick(row) {
      this.selectTblRow = row;
      this.$refs.umTable.toggleRowSelection(row);
    },
    taskRender(value, rowData) {
      var taskType = rowData['OS-EXT-STS:task_state'];
      var taskMsg = "";
      if (taskType != null) {
        switch (taskType.toUpperCase()) {
        case "BUSY":
          taskMsg = this.$t('calcStorLang.task_busying');
          break;
        case "SCHEDULING":
          taskMsg = this.$t('calcStorLang.task_scheduling');
          break;
        case "BLOCK_DEVICE_MAPPING":
          taskMsg = this.$t('calcStorLang.task_block_device_mapping');
          break;
        case "NETWORKING":
          taskMsg = this.$t('calcStorLang.task_networking');
          break;
        case "SPAWNING":
          taskMsg = this.$t('calcStorLang.task_spawning');
          break;
        case "IMAGE_SNAPSHOT":
          taskMsg = this.$t('calcStorLang.task_image_snapshot');
          break;
        case "IMAGE_SNAPSHOT_PENDING":
          taskMsg = this.$t('calcStorLang.task_image_snapshot_pending');
          break;
        case "IMAGE_PENDING_UPLOAD":
          taskMsg = this.$t('calcStorLang.task_image_pending_upload');
          break;
        case "IMAGE_UPLOADING":
          taskMsg = this.$t('calcStorLang.task_image_uploading');
          break;
        case "IMAGE_BACKUP":
          taskMsg = this.$t('calcStorLang.task_image_backup');
          break;
        case "UPDATING_PASSWORD":
          taskMsg = this.$t('calcStorLang.task_updating_password');
          break;
        case "RESIZE_PREP":
          taskMsg = this.$t('calcStorLang.task_resize_prep');
          break;
        case "RESIZE_MIGRATING":
          taskMsg = this.$t('calcStorLang.task_resize_migrating');
          break;
        case "RESIZE_MIGRATED":
          taskMsg = this.$t('calcStorLang.task_resize_migrated');
          break;
        case "RESIZE_FINISH":
          taskMsg = this.$t('calcStorLang.task_resize_finish');
          break;
        case "RESIZE_REVERTING":
          taskMsg = this.$t('calcStorLang.task_resize_reverting');
          break;
        case "RESIZE_CONFIRMING":
          taskMsg = this.$t('calcStorLang.task_resize_confirming');
          break;
        case "REBOOTING":
          taskMsg = this.$t('calcStorLang.task_rebooting');
          break;
        case "REBOOT_PENDING":
          taskMsg = this.$t('calcStorLang.task_reboot_pending');
          break;
        case "REBOOT_STARTED":
          taskMsg = this.$t('calcStorLang.task_reboot_started');
          break;
        case "REBOOTING_HARD":
          taskMsg = this.$t('calcStorLang.task_rebooting_hard');
          break;
        case "REBOOT_PENDING_HARD":
          taskMsg = this.$t('calcStorLang.task_reboot_pending_hard');
          break;
        case "REBOOT_STARTED_HARD":
          taskMsg = this.$t('calcStorLang.task_reboot_starting');
          break;
        case "PAUSING":
          taskMsg = this.$t('calcStorLang.task_pausing');
          break;
        case "UNPAUSING":
          taskMsg = this.$t('calcStorLang.task_unpausing');
          break;
        case "SUSPENDING":
          taskMsg = this.$t('calcStorLang.task_suspending');
          break;
        case "RESUMING":
          taskMsg = this.$t('calcStorLang.task_resuming');
          break;
        case "POWERING_OFF":
          taskMsg = this.$t('calcStorLang.task_powering_off');
          break;
        case "POWERING-OFF":
          taskMsg = this.$t('calcStorLang.task_powering_off');
          break;
        case "POWERING_ON":
          taskMsg = this.$t('calcStorLang.task_powering_on');
          break;
        case "POWERING-ON":
          taskMsg = this.$t('calcStorLang.task_powering_on');
          break;
        case "RESCUING":
          taskMsg = this.$t('calcStorLang.task_rescuing');
          break;
        case "UNRESCUING":
          taskMsg = this.$t('calcStorLang.task_unrescuing');
          break;
        case "REBUILDING":
          taskMsg = this.$t('calcStorLang.task_rebuilding');
          break;
        case "REBUILD_BLOCK_DEVICE_MAPPING":
          taskMsg = this.$t('calcStorLang.task_rebuild_block_device_mapping');
          break;
        case "REBUILD_SPAWNING":
          taskMsg = this.$t('calcStorLang.task_rebuild_spawning');
          break;
        case "MIGRATING":
          taskMsg = this.$t('calcStorLang.task_migrating');
          break;
        case "DELETING":
          taskMsg = this.$t('calcStorLang.task_deleting');
          break;
        case "SOFT_DELETING":
          taskMsg = this.$t('calcStorLang.task_soft_deleting');
          break;
        case "RESTORING":
          taskMsg = this.$t('calcStorLang.task_restoring');
          break;
        case "SHELVING":
          taskMsg = this.$t('calcStorLang.task_shelving');
          break;
        case "SHELVING_IMAGE_PENDING_UPLOAD":
          taskMsg = this.$t('calcStorLang.task_shelving_image_pending_upload');
          break;
        case "SHELVING_IMAGE_UPLOADING":
          taskMsg = this.$t('calcStorLang.task_shelving_image_uploading');
          break;
        case "SHELVING_OFFLOADING":
          taskMsg = this.$t('calcStorLang.task_shelving_offloading');
          break;
        case "UNSHELVING":
          taskMsg = this.$t('calcStorLang.task_unshelving');
          break;
        default:
          break;
        }
      } else {
        taskMsg = "-";
      }
      return taskMsg;
    },
    imageRender(value, rowData) {
      const self = this;
      let imageId = rowData['image'].id;
      self.templateMaps.set(rowData['id'], "1");
      if (imageId) {
        return Vue.t('calcStorLang.image') + "(" + imageId + ")";
      } else {
        return "-";
      }
    },
/*    sourceTemplateType(rowData) {
       var self = this;
       var imageId = rowData['image'].id;
       var type = "";
       if (typeof imageId != "undefined") {
        var isImageFlag = self.imageMaps.get(imageId);
        if (isImageFlag != null) {
          type = "-1"; //mirror或主机快照
        } else {
          type = "";
        }
       }
         return type;
    },*/
    ownerRender(value, rowData) {
      var self = this;
      var userId = rowData['user_id'];
      return self.userMaps.get(userId) || "-";
    },
    projectRender(value, rowData) {
      var self = this;
      var projectId = rowData['tenant_id'];
      return self.projectMaps.get(projectId) || "-";
    },
    ipAddressRender(value, rowData) {
      var address = rowData['addresses'];
      var list = Object.keys(address).map(function(el) {
          return address[el];
      });
      if (list != null) {
         if (list.length > 1) {
           var ipShow = "";
           for (let addr in address) {
             var ipList = address[addr];
             var ips = "";
             for (let n = 0; n < ipList.length; n++) {
               var net = ipList[n];
               var type = net['OS-EXT-IPS:type'];
               if (type == "floating") {
                 ips += net.addr + "(" + Vue.t('calcStorLang.floatIP') + ")" + "<br>";
               } else {
                 ips += net.addr + "<br>";
               }
             }
             ipShow += addr + "<br>" + ips;
           }
           return ipShow;
         } else if (list.length == 0) {
            return "-";
         } else {
           var ipShow2 = "";
           for (let addr in address) {
             var ipList2 = address[addr];
             var ips2 = "";
             for (let n = 0; n < ipList2.length; n++) {
               var net2 = ipList2[n];
               var type2 = net2['OS-EXT-IPS:type'];
               if (type2 == "floating") {
                 ips2 += net2.addr + "(" + Vue.t('calcStorLang.floatIP') + ")" + "<br>";
               } else {
                 ips2 += net2.addr + "<br>";
               }
             }
             ipShow2 += ips2;
           }
           return ipShow2;
         }
      } else {
         return "-";
      }
    },
    statusTagRender(status) {
        if ("ACTIVE" == status) {
           return "success";
        } else if ("SHUTOFF" == status) {
           return "gray";
        } else if ("BUILD" == status) {
           return "info";
        } else if ("DELETED" == status || "SOFT_DELETED" == status || "ERROR" == status || "UNKNOW" == status) {
           return "danger";
        } else if ("SHUTOFF" == status) {
           return "info";
        } else if ("SUSPENDED" == status) {
           return "warning";
        } else if ("HARD_REBOOT" == status || "REBOOT" == status || "MIGRATING" == status || "RESCUE" == status || "REVERT_RESIZE" == status || "REBUILD" == status) {
           return "info";
        } else {
          return "";
        }
    },
    powerStatusTagRender(row) {
      var status = row['OS-EXT-STS:power_state'] + "";
      if ("0" == status) {
        return 'gray';
      } else if ("1" == status) {
        return 'success';
      } else if ("3" == status) {
        return 'info';
      } else if ("4" == status) {
        return 'gray';
      } else if ("6" == status) {
        return 'danger';
      } else if ("7" == status) {
        return 'danger';
      } else {
        return '-';
      }
    },
    statusRender(value, rowData) {
      if (value == "BUSY") { //自定义状态,删除“软删除”和“已删除”状态
        return "<i class='el-icon-loading'></i>";
      } else if (value == "ACTIVE") {
        return this.$t('calcStorLang.running');
      } else if (value == "BUILD") {
        return this.$t('calcStorLang.build');
      } else if (value == "ERROR") {
        return this.$t('calcStorLang.error');
      } else if (value == "REBOOT") {
        return this.$t('calcStorLang.reboot');
      } else if (value == "HARD_REBOOT") {
        return this.$t('calcStorLang.rebooting');
      } else if (value == "PAUSED") {
        return this.$t('calcStorLang.paused');
      } else if (value == "MIGRATING") {
        return this.$t('calcStorLang.migrating');
      } else if (value == "PASSWORD") {
        return this.$t('calcStorLang.password');
      } else if (value == "REBUILD") {
        return this.$t('calcStorLang.rebuild');
      } else if (value == "RESCUE") {
        return this.$t('calcStorLang.rescue');
      } else if (value == "REVERT_RESIZE") {
        return this.$t('calcStorLang.revert_resize');
      } else if (value == "SHELVED") {
        return this.$t('calcStorLang.shelved_offloaded');
      } else if (value == "SHELVED_OFFLOADED") {
        return this.$t('calcStorLang.shelved_offloaded');
      } else if (value == "SHUTOFF") {
        return this.$t('calcStorLang.closed');
      } else if (value == "SUSPENDED") {
        return this.$t('calcStorLang.suspended');
      } else if (value == "UNKNOW") {
        return this.$t('calcStorLang.unknow');
      } else if (value == "VERIFY_RESIZE") {
        return this.$t('calcStorLang.verify_resize');
      } else {
        return "-";
      }
    },
    powerStatusRender(value, rowData) {
      var status = rowData['OS-EXT-STS:power_state'] + "";
      if ("0" == status) {
        return '-';
      } else if ("1" == status) {
        return this.$t('calcStorLang.running');
      } else if ("3" == status) {
        return this.$t('calcStorLang.paused');
      } else if ("4" == status) {
        return this.$t('calcStorLang.closed');
      } else if ("6" == status) {
        return this.$t('calcStorLang.inst_collapse');
      } else if ("7" == status) {
        return this.$t('calcStorLang.suspended');
      } else {
        return '-';
      }
    },
    domainRender(value, rowData) {
      return rowData['OS-EXT-AZ:availability_zone'];
    },
    keyRender(value, rowData) {
      var keyNmae = rowData['key_name'];
      if (null != keyNmae) {
        return keyNmae;
      }
      return "-";
    },
    dateRender(value, rowData) {
      var self = this;
      var time = Date.parse(new Date(value));
      return self.formatTimeStamp(time, "yyyy-MM-dd HH:mm:ss");
    },
    /**
     * 将时间戳格式化的方法
     * @param timeStamp时间戳值
     * @param fmt 要生成的格式，如yyyy-MM-dd HH:mm:ss
     * @returns
     */
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
    flavorRender(value, rowData) {
       var self = this;
       var uuid = rowData['flavor'].id;
       return self.flavorMaps.get(uuid) || "不可用";
    },
    onBack() {
      this.detailFlag = false;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.$refs.umTable.clearSelection();
      this.getData();
    },
    handleConditionValueChanged({key, value}) {
      if (key === 'project_id') {
        this.loadUserList(value);
      }
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.$refs.umTable.clearSelection();
      this.$refs.pageComponent.setCurrentPage(1);
      this.getData();
    }
  }
}

</script>
<style scoped>


</style>
