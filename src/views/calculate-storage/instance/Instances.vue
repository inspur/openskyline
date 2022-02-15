<template>
  <div>
    <icos-page-header :title="$t('calcStorLang.instance')" />
    <icos-page>
      <icos-search-bar
        :conditions="searchBar.conditions"
        @search="handleSearch"
        @condition-value-changed="handleConditionValueChanged" />
      <div class="divider clearfix"></div>
      <div class="operation-panel" @mousedown="detailMouseLeave">
        <operation-panel-new ref="operationOperate" :select-rows="multipleSelection" :operation-menus="operationMenus" :operateMore="operateMore" style="display:inline;">
        </operation-panel-new>
      </div>
      <div class="divider clearfix"></div>
      <el-table ref="umTable" :data="totalData" v-loading="loading" highlight-current-row stripe border style="width: 100%" :default-sort="{prop: 'created', order: 'descending'}" row-key="id" @row-click="rowClick" @selection-change="handleSelectionChange" @sort-change="handleSortChange">
        <el-table-column reserve-selection type="selection" width="55" align="center" :selectable="function(row, index) { return !['soft-deleting', 'soft_deleting', 'deleting'].includes(row['OS-EXT-STS:task_state']) }">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('console') >= 0" prop="console" :label="$t('calcStorLang.console')" min-width="35" align="center" :show-overflow-tooltip="false">
          <template slot-scope="scope">
            <el-button icon="fa-desktop" v-if="(scope.row.status === 'ACTIVE' || scope.row.status === 'RESCUE') && !scope.row.tags.includes('closevnc')" style="color:#2196F3" class="el-button el-button--small" @click="vmConsolePage(scope.row)"></el-button>
            <el-button icon="fa-desktop" v-if="(scope.row.status !== 'ACTIVE' && scope.row.status !== 'RESCUE') || scope.row.tags.includes('closevnc')" class="el-button el-button--small"></el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('host') >= 0" :label="$t('base.host')" prop="OS-EXT-SRV-ATTR:hypervisor_hostname" align="left" min-width="50">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" align="left" sortable="custom" min-width="50">
          <template slot-scope="scope">
            <el-button @click="vmDetail(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('id') >= 0" label="ID" prop="id" align="left" min-width="80">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('mirrorName') >= 0" :show-overflow-tooltip="isShowTip" prop="mirrorName" :label="$t('calcStorLang.source')" align="left" min-width="120">
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
            <el-button v-popover:sourceDetailPop type="text" size="small" @click="sourceDetailTip(scope.row)">
              <instance-source :instance="scope.row" />
            </el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('address') >= 0" :label="$t('lang.ipAddress')" align="left" prop="address">
          <template slot-scope="scope">
            <span v-html="ipAddressRender(scope.row.addresses, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" :label="$t('lang.status')" sortable="custom" min-width="50" align="left">
          <template slot-scope="scope">
            <instance-status :status="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('taksType') >= 0" prop="OS-EXT-STS:task_state" :label="$t('calcStorLang.task')" min-width="50" align="left">
          <template slot-scope="scope">
            <span v-html="taskRender(scope.row.owner, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('flavor') >= 0" :show-overflow-tooltip="isShowTip" prop="flavorName" :label="$t('calcStorLang.resourceSpec')" min-width="50">
          <template slot-scope="scope">
            <el-popover ref="volDetailPop" placement="top" trigger="click">
              <div class="table_panel" style="width:410px">
                <table class="table table-content table-hover idatatable table-bordered" border="1">
                  <tbody>
                    <tr class="odd">
                      <th class="idatath" style="width:80px">{{$t('lang.name')}}:</th>
                      <td class="idatatd">
                        <span>{{flavorDetailEntity.original_name || "-"}}</span>
                      </td>
                      </tr>
                      <tr class="even">
                        <th class="idatath">{{$t('calcStorLang.cpuCore')}}:</th>
                        <td class="idatatd">
                          <span>{{flavorDetailEntity.vcpus || "-"}}</span>
                        </td>
                      </tr>
                      <tr class="even">
                        <th class="idatath">{{$t('calcStorLang.memGB')}}:</th>
                        <td class="idatatd">
                          <span>{{ramRender(flavorDetailEntity.ram)}}</span>
                        </td>
                      </tr>
                      <tr class="even">
                        <th class="idatath">{{$t('calcStorLang.diskGB')}}:</th>
                        <td class="idatatd">
                          <span>{{flavorDetailEntity.disk || "-"}}</span>
                        </td>
                      </tr>
                      <tr class="even">
                        <th class="idatath">{{$t('calcStorLang.isPublic')}}:</th>
                        <td class="idatatd">
                          <span>{{flavorDetailStatusRender(flavorDetailEntity)}}</span>
                        </td>
                      </tr>
                  </tbody>
                </table>
              </div>
            </el-popover>
            <el-button v-popover:volDetailPop type="text" size="small" @click="flavorDetail(scope.row.flavor)">
              {{ scope.row.flavor.original_name }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('key') >= 0" prop="key_name" :label="$t('calcStorLang.keypair')" min-width="50">
          <template slot-scope="scope">
            <span v-html="keyRender(scope.row.key_name, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('domain') >= 0" prop="domain" :label="$t('calcStorLang.az')" min-width="50">
          <template slot-scope="scope">
            <span v-html="domainRender(scope.row.domain, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="(columnsChecked.indexOf('project') >= 0) && roleType != '3'" prop="projectName" :label="$t('lang.project')" min-width="50">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('owner') >= 0" prop="ownerName" :label="$t('calcStorLang.owner')" min-width="50">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('task') >= 0" prop="task" :label="$t('calcStorLang.task')" min-width="50" align="left">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('locked') >= 0" prop="locked" :label="$t('calcStorLang.lockorno')" min-width="40" align="left">
          <template slot-scope="scope">
            <span v-html="isLocked(scope.row.locked, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('powerStatus') >= 0" prop="powerStatus" :label="$t('calcStorLang.powerStatus')" min-width="50" align="left">
          <template slot-scope="scope">
            <el-tag v-if="powerStatusRender(scope.row.powerStatus, scope.row)!=='-'" :type="powerStatusTagRender(scope.row)">
              <span v-html="powerStatusRender(scope.row.powerStatus, scope.row)"></span>
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('date') >= 0" prop="created" :label="$t('calcStorLang.createTime')" sortable="custom" min-width="70" align="left">
          <template slot-scope="scope">
            <span v-html="dateRender(scope.row.created, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('os') >= 0" prop="system_metadata.image_os_distro" :label="$t('calcStorLang.VM_OS')">
          <template slot-scope="scope">
            {{ 'image_os_distro' in scope.row.system_metadata ? scope.row.system_metadata.image_os_distro : '-' }}
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="false" v-if="columnsChecked.indexOf('tags') >= 0 && roleType !== '3'" prop="tags" :label="$t('calcStorLang.VM_TAGS')">
          <template slot-scope="scope">
            <expandable-cell>
              <el-tag type="primary" v-for="(tag, index) in scope.row.tagsShown" :key="index" :close-transition="true" style="margin: 0 5px 0 0;">{{ tag }}</el-tag>
            </expandable-cell>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <icos-column-selector @refresh="handleTableRefresh" @column-checked="handleColumnChecked" :selected-length="multipleSelection.length" :columns="columns" />
          </el-col>
          <el-col :span="19">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[5, 10, 20, 30, 40, 60, 80, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
          </el-col>
        </el-row>
        <span v-show="vmStatus=='ACTIVE'||vmStatus=='SHUTOFF'||vmStatus=='ERROR'||vmStatus=='PAUSED'">({{instTipContent}})<br></span>
        <span>({{$t('calcStorLang.instTipContent5')}})</span>
        <create-instance v-if="createInstanceDialog.visible" :preset-data="{}" @close="createInstanceDialog.visible = false" @refresh="onRefresh" />
        <rename-instance @handleShow="handleShow" @onRefresh="onRefresh" ref="renameInstance" :instUuid="instUuid" :instName="instanceName" v-if="renameFlag" />
        <revise-instance v-if="reviseInstanceDialog.visible" :hotplug="reviseInstanceDialog.hotplug" @close="reviseInstanceDialog.visible = false" @refresh="onRefresh" :instances="reviseInstanceDialog.instances" />
        <reconstruction v-if="reconFlag" @handleReconFlag="handleReconFlag" :instUuid="instUuid" :instProjectId="instProjectId" :instUserId="instUserId" :instName="instanceName" @onRefresh="onRefresh" />
        <create-snapshot v-if="creIsoFlag" @handlerCreIsoFlag="handlerCreIsoFlag" :instUuid="instUuid" @onRefresh="onRefresh" @hrefToSnapshotPage="hrefToSnapshotPage" />
        <migrate v-if="migrateDialog.visible" :type="migrateDialog.type" @close="migrateDialog.visible = false;" :instances="migrateDialog.instances" @refresh="onRefresh" />
        <un-shelve v-if="detailFlg" @deatilTempFlg="deatilTempFlg" :instanceMaps="instanceMaps" :selectRows1="selectRows1" @onRefresh="onRefresh" />
        <rescue v-if="rescueFlag" @handleRescueFlag="handleRescueFlag" :instUuid="instUuid" :instProjectId="instProjectId" :instName="instanceName" :instImageId="instImageId" :instSource="instSource" @onRefresh="onRefresh" />
        <instance-tags v-if="instanceTags.show" :projectId="instanceTags.projectId" :instanceId="instanceTags.instanceId" @handleClose="instanceTags.show = false;" @refresh="onRefresh" />
        <modify-password v-if="modifyPasswordDialog.visible" :instanceId="modifyPasswordDialog.instanceId" @close="modifyPasswordDialog.visible = false" />
        <select-netcard v-if="securityGroupFlag" @handleSecurityGroupFlag="handleSecurityGroupFlag" :hostEntity="selectNetCardDialog.instance" @next='editSecuritygroup' />
        <edit-securitygroup ref="editsecuritygroup" v-if="editSecurityGroupFlag" @handleEditSecurityGroupFlag="handleEditSecurityGroupFlag" :portId="portId" :instUuid="instUuid" :projectId="projectId" :instanceName="instanceName" :data="editSecurityGroupData" />
        <batch-create-instances v-if="batchCreateInstances.show" @close="batchCreateInstances.show = false" @refresh="onRefresh" />
        <edit-instance v-if="editInstanceDialog.visible" :instance="editInstanceDialog.instance" @close="editInstanceDialog.visible = false" @refresh="onRefresh" />
        <batch-edit-instance v-if="batchEditInstanceDialog.visible" :instances="batchEditInstanceDialog.instances" @close="batchEditInstanceDialog.visible = false" @refresh="onRefresh" />
        <reset-instance v-if="resetInstanceDialog.visible" :instances="resetInstanceDialog.instances" @close="resetInstanceDialog.visible = false;" @refresh="onRefresh" />
        <device-management v-if="deviceManagementDialog.visible" :instances="deviceManagementDialog.instances" @close="deviceManagementDialog.visible = false;" @refresh="onRefresh" />
        <cpu-pin v-if="cpuPinDialog.visible" :instance="cpuPinDialog.instance" @close="cpuPinDialog.visible = false" @refresh="onRefresh" />
        <instance-clone v-if="instanceCloneDialog.visible" :instances="instanceCloneDialog.instances" @close="instanceCloneDialog.visible = false" />
        <delete-instances v-if="deleteInstancesDialog.visible" :instances="deleteInstancesDialog.instances" @close="deleteInstancesDialog.visible = false" @refresh="onRefresh" />
        <batch-direct-connection v-if="batchDeviceManagementDialog.visible" :instances="batchDeviceManagementDialog.instances" @close="batchDeviceManagementDialog.visible = false" @refresh="onRefresh" />
        <transition name="slide-right" mode="out-in">
          <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
            <panel style="height: 100%">
              <div slot="title" class="clearfix">
                <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t("lang.back")}}</el-button>
              </div>
              <div>
                <instance-detail @refresh="onRefresh" :instanceId="instanceId" :projectMaps="projectMaps" :userMaps="userMaps"></instance-detail>
              </div>
            </panel>
          </div>
        </transition>
      </div>
    </icos-page>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import { getInstanceTaskName } from '../../../utils/util';
import _ from 'underscore';
import formatFileSize from 'utils/formatFileSize';
import osJson from '../image/OsJson.json';
import ReservedTags from './ReservedTags.json';
import InstanceStatus from './InstanceStatus';
import UnShelve from './UnShelve';
import OperateInstance from './OperateInstance';
import ReviseInstance from './ReviseInstance';
import RenameInstance from './RenameInstance';
import InstanceDetail from './InstanceDetail';
import Reconstruction from './Reconstruction';
import CreateSnapshot from './CreateSnapshot';
import Migrate from './Migrate';
import EditSecuritygroup from './EditSecuritygroup';
import Rescue from './Rescue';
import InstanceTags from './InstanceTags';
import ModifyPassword from './ModifyPassword';
import BatchCreateInstances from './batch-create-instances/BatchCreateInstances';
import EditInstance from './edit-instance';
import BatchEditInstance from './edit-instance/BatchEditInstance';
import ResetInstance from './ResetInstance';
import DeviceManagement from './device-management/index';
import CreateInstance from './create-instance/index';
import CPUPin from './cpu-pin';
import SelectNetcard from './SelectNetCard';
import InstanceClone from './instance-clone/index';
import DeleteInstances from './DeleteInstances';
import BatchDirectConnection from './device-management/batch-direct-connection'
import InstanceSource from './InstanceSource'
import { getUsers, getUsersByProjectId } from '../../../utils/common';
export default {
  name: "Instances",
  components: {
    SelectNetcard,
    InstanceStatus,
    RenameInstance,
    UnShelve,
    CreateInstance,
    InstanceDetail,
    Reconstruction,
    CreateSnapshot,
    ReviseInstance,
    Migrate,
    EditSecuritygroup,
    Rescue,
    InstanceTags,
    ModifyPassword,
    BatchCreateInstances,
    EditInstance,
    BatchEditInstance,
    ResetInstance,
    DeviceManagement,
    'cpu-pin': CPUPin,
    InstanceClone,
    DeleteInstances,
    BatchDirectConnection,
    InstanceSource
  },
  data() {
    return {
      portId: "",
      editSecurityGroupFlag: false,
      editSecurityGroupData: {},
      selectRows1:"",
      instTipContent:"",
      instRecyclingFloatIpFlg:false,
      sortKey: 'created_at',
      sortDir: 'desc',
      pageSize: 10,
      total: 0,
      formInline: '',
      instanceId: '',
      instanceStatus:'',
      currentPage: 1,
      showBorder: true,
      popoverFlag: false,
      popoverFlavorFlag: false,
      projectOptions: [],
      vmType: '0',
      selectRow:[],
      instanceName: '',
      ownerName: '',
      instUuid: '',
      instProjectId: '',
      instUserId: '',
      instFlavorId: '',
      instImageId: '',
      instSource: '',
      hostName: '',
      instFlavorEmpty: false,
      vmStatus: '',
      roleType: Vue.roleType + "",
      loading: false,
      loadingText: Vue.t('lang.loading'),
      detailFlg: false,
      addFlag: false,
      renameFlag: false,
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
      hightFlag: false,
      totalData: [],
      reloadTblFlag: false,
      securityGroupFlag: false,
      usbFlag:false,
      hostEntity: '',
      usbEntity:[],
      userMaps: new Map(),
      projectMaps: new Map(),
      imageMaps: new Map(),
      flavorMaps: new Map(),
      instanceMaps: new Map(),
      volumeMaps: new Map(),
      volumeListMaps: new Map(),
      volumeSnapMaps: new Map(),
      templateMaps: new Map(),
      networkMaps: new Map(),
      markerList: [],
      projectId: null,
      selectTblRow: '',
      applyModifySpec: true,
      confirmModifySpec: true,
      flowOrderFlag: true,
      pageReloadFlag: false, //是否重新获得总数等信息
      flavorDetailEntity: '',
      sourceDetailEntity: '',
      formatFileSize:formatFileSize,
      zoneOptions: [],
      isShowTip: true,
      columns: [{
        prop: "console",
        label: Vue.t('calcStorLang.console'),
        visible: true,
        defaultChecked: true
      }, {
        prop: "host",
        label: Vue.t('base.host'),
        visible: roleType === '0',
        defaultChecked: false
      }, {
        prop: "name",
        label: Vue.t('lang.name'),
        visible: true,
        defaultChecked: true
      }, {
        prop: "id",
        label: "ID",
        visible: true,
        defaultChecked: true
      }, {
        prop: "mirrorName",
        label: Vue.t('calcStorLang.source'),
        visible: true,
        defaultChecked: true
      }, {
        prop: "address",
        label: Vue.t('lang.ipAddress'),
        visible: true,
        defaultChecked: true
      }, {
        prop: "status",
        label: Vue.t('lang.status'),
        visible: true,
        defaultChecked: true
      }, {
        prop: "taksType",
        label: Vue.t('calcStorLang.task'),
        visible: true,
        defaultChecked: true
      }, {
        prop: "flavor",
        label: Vue.t('calcStorLang.resourceSpec'),
        visible: true,
        defaultChecked: true
      }, {
        prop: "key",
        label: Vue.t('calcStorLang.keypair'),
        visible: true,
        defaultChecked: false
      }, {
        prop: "domain",
        label: Vue.t('calcStorLang.az'),
        visible: true,
        defaultChecked: false
      }, {
        prop: "project",
        label: Vue.t('lang.project'),
        visible: roleType !== '3',
        defaultChecked: true
      }, {
        prop: "owner",
        label: Vue.t('calcStorLang.owner'),
        visible: true,
        defaultChecked: true
      }, {
        prop: "powerStatus",
        label: Vue.t('calcStorLang.powerStatus'),
        visible: true,
        defaultChecked: true
      }, {
        prop: "date",
        label: Vue.t('calcStorLang.createTime'),
        visible: true,
        defaultChecked: true
      }, {
        prop: "os",
        label: Vue.t('calcStorLang.VM_OS'),
        visible: true,
        defaultChecked: false
      }, {
        prop: "tags",
        label: Vue.t('calcStorLang.VM_TAGS'),
        visible: roleType !== '3',
        defaultChecked: false
      }, {
        prop: "locked",
        label: Vue.t('calcStorLang.lockorno'),
        visible: roleType !== '0',
        defaultChecked: false
      }],
      columnsChecked: [],
      tableData: [],
      multipleSelection: [],
      operationMenus: OperateInstance.bind(this)(),
      operateMore: true,
      instanceTags: {
        show: false,
        projectId: '',
        instanceId: ''
      },
      modifyPasswordDialog: {
        visible: false,
        instanceId: ''
      },
      batchCreateInstances: {
        show: false
      },
      hosts: [],
      editInstanceDialog: {
        visible: false,
        instance: {}
      },
      batchEditInstanceDialog: {
        visible: false,
        instances: []
      },
      manageISODialog: {
        visible: false,
        instanceId: ''
      },
      migrateDialog: {
        visible: false,
        instances: [],
        type: ''
      },
      searchBar: {
        conditions: {
          name: {
            label: this.$t('calcStorLang.NG_FILTER_NAME'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          },
          status: {
            label: this.$t('calcStorLang.NG_FILTER_STATUS'),
            type: 'select',
            options: [{
              label: this.$t('calcStorLang.running'),
              value: 'ACTIVE'
            }, {
              label: this.$t('calcStorLang.closed'),
              value: 'SHUTOFF'
            }, {
              label: this.$t('calcStorLang.suspended'),
              value: 'SUSPENDED'
            }, {
              label: this.$t('calcStorLang.paused'),
              value: 'PAUSED'
            }, {
              label: this.$t('calcStorLang.error'),
              value: 'ERROR'
            }, {
              label: this.$t('calcStorLang.rescue'),
              value: 'RESCUE'
            }, {
              label: this.$t('calcStorLang.build'),
              value: 'BUILD'
            }, {
              label: this.$t('calcStorLang.migrating'),
              value: 'MIGRATING'
            }, {
              label: this.$t('calcStorLang.reboot'),
              value: 'REBOOT'
            }, {
              label: this.$t('calcStorLang.hard_reboot'),
              value: 'HARD_REBOOT'
            }, {
              label: this.$t('calcStorLang.shelved_offloaded'),
              value: 'SHELVED_OFFLOADED'
            }, {
              label: this.$t('calcStorLang.password'),
              value: 'PASSWORD'
            }, {
              label: this.$t('calcStorLang.rebuild'),
              value: 'REBUILD'
            }, {
              label: this.$t('calcStorLang.revert_resize'),
              value: 'REVERT_RESIZE'
            }, {
              label: this.$t('calcStorLang.verify_resize'),
              value: 'VERIFY_RESIZE'
            }, {
              label: this.$t('calcStorLang.crashed'),
              value: 'CRASHED'
            }]
          },
          project_id: {
            label: this.$t('calcStorLang.NG_FILTER_PROJECT'),
            type: 'select',
            options: [],
            visible: roleType === '0'
          },
          user_id: {
            label: this.$t('calcStorLang.NG_FILTER_OWNER'),
            type: 'select',
            options: [],
            visible: roleType !== '3'
          },
          ip: {
            label: this.$t('calcStorLang.NG_FILTER_IPV4'),
            type: 'input',
            validator: (value) => {
              if (!/^[\.0-9]*$/.test(value)) {
                throw new Error(this.$t('calcStorLang.NG_FILTER_IPV4_TIPS'));
              }
            }
          },
          uuid: {
            label: this.$t('calcStorLang.NG_FILTER_ID'),
            type: 'input',
            validator: (value) => {
              if (!/^[\-0-9a-fA-F]*$/.test(value)) {
                throw new Error(this.$t('calcStorLang.NG_FILTER_ID_TIPS'));
              }
            },
            visible: roleType !== '3'
          },
          availability_zone: {
            label: this.$t('calcStorLang.NG_FILTER_AZ'),
            type: 'select',
            options: [],
            visible: roleType === '0'
          },
          host: {
            label: this.$t('calcStorLang.NG_FILTER_HOST'),
            type: 'select',
            options: [],
            visible: roleType === '0'
          },
          tags: {
            label: this.$t('calcStorLang.NG_FILTER_TAGS'),
            type: 'input',
            validator: (value) => {
              if (!/^[a-zA-Z0-9\u4e00-\u9fa5]*$/.test(value)) {
                throw new Error(this.$t('calcStorLang.VM_TAGS_ERR_INVILID'));
              }
            },
            visible: roleType !== '3'
          },
          os: {
            label: this.$t('calcStorLang.os'),
            type: 'cascader',
            options: []
          }
        },
        validatedParams: {}
      },
      refreshTimeout: null,
      queryTimes: 0, //请求次数。如果当前请求序号小于请求次数，则不执行后续代码
      currentParams: {},
      resetInstanceDialog: {
        instances: [],
        visible: false
      },
      reviseInstanceDialog: {
        visible: false,
        instances: {},
        instanceId: '',
        instanceName: '',
        instanceProjectId: '',
        instanceFlavorId: '',
        minRam: 0,
        hotplug: false
      },
      deviceManagementDialog: {
        visible: false,
        instances: null
      },
      selectNetCardDialog: {
        visible: false,
        instance: null
      },
      createInstanceDialog: {
        visible: false
      },
      cpuPinDialog: {
        visible: false,
        instance: {}
      },
      auditDialog: {
        visible: false
      },
      instanceCloneDialog: {
        visible: false,
        instances: []
      },
      deleteInstancesDialog: {
        instances: [],
        visible: false
      },
      batchDeviceManagementDialog: {
        visible: false,
        instances: []
      }
    }
  },
  beforeDestroy() {
    if (this.interVmValid != null) {
      clearInterval(this.interVmValid);
    }
    if (this.refreshTimeout !== null) {
      clearTimeout(this.refreshTimeout);
    }
  },
  computed: {
    ...mapGetters({
      routers: 'getRouters'
    })
  },
  async mounted() {
    let $this = this;
    let roleType = String(Vue.roleType);
    $this.$nextTick(async () => {
      if (roleType === '0') {
        $this.loadFilteredUsers('');
        $this.loadHostList();
        $this.initZones();
      } else {
        $this.loadFilteredUsers($this.$cookie.get('pid'));
      }
      $this.loadProjectList();
      $this.loadFlavorList();
      $this.loadOsList();
    });
  },
  methods: {
    editSecuritygroup(v) {
      this.portId = v.portID;
      this.instUuid = this.selectNetCardDialog.instance["id"];
      this.projectId = this.selectNetCardDialog.instance["tenant_id"];
      this.instanceName = this.selectNetCardDialog.instance["name"];
      this.editSecurityGroupFlag = true;
      this.editSecurityGroupData.name = v.name;
      this.editSecurityGroupData.portID = v.portID;
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
    handleSortChange(column) {
      const $this = this;
      let dir = column.order === 'descending' ? 'desc' : 'asc';
      let key = 'created_at';
      switch (column.prop) {
        case 'name':
          key = 'display_name';
          break;
        case 'status':
          key = 'vm_state';
          break;
        case 'created':
          key = 'created_at';
          break;
        default:
          key = column.prop;
          break;
      }
      $this.sortDir = dir;
      $this.sortKey = key;
      if ($this.currentPage === 1) {
        $this.loadData(1, true);
      } else {
        $this.currentPage = 1;
      }
    },
    async loadProjectList() {
      let $this = this;
      let roleType = Vue.roleType + "";
      let url = "api/keystone/v3/projects?domain_id=default";
      if (roleType === '2' || roleType === '3') {
        url = "api/keystone/v3/users/" + Vue.userId + "/projects";
      }
      try {
        let result = await $this.$ajax({
          type: 'get',
          url: url
        });
        let projects = result.projects.filter(item => item.name !== 'service');
        $this.projectOptions = projects;
        for (let p = 0; p < projects.length; p++) {
          let obj = projects[p];
          $this.projectMaps.set(obj.id, obj.name);
        }
        $this.searchBar.conditions.project_id.options = projects.map(item => {
          return {
            value: item.id,
            label: item.name
          };
        });
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    async loadImageList() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/glance/v2/images?limit=9999'
        });
        var list = result['images'];
        for (var i = 0; i < list.length; i++) {
          var obj = list[i];
          self.imageMaps.set(obj.id, obj);
        }
      } catch (res) {
        __DEV__ && console.error(res);
      }
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
            self.volumeListMaps.set(volume.id, volume);
        }
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    async loadVolumeSnapList() {
       var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/cinderv3/v3/" + self.$cookie.get("pid") + "/snapshots?all_tenants=True";
      if ("2" == roleType || "3" == roleType) { //超级
          url= "api/cinderv3/v3/" + self.$cookie.get("pid")+ "/snapshots";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        var list = result['snapshots'];
        for (let s = 0; s < list.length; s++) {
           var snapshot = list[s];
           var name = snapshot.name || snapshot.id;
           self.volumeSnapMaps.set(snapshot.id, name);
        }
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    async loadUserList() {
      var self = this;
      var url = "api/keystone/v3/inspur/users?dir=asc&field=name&domain_id=default";
      var roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        url = `api/keystone/v3/inspur/assignments/projects/${self.$cookie.get('pid')}/users`;
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        let usersList = [];
        if (roleType === '0') {
          usersList = result.users;
        } else {
          usersList = result.users.map(item => {
            return item.user;
          });
        }
        for (var u = 0; u < usersList.length; u++) {
          var obj = usersList[u];
          self.userMaps.set(obj.id, obj.name);
        }
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    async loadFlavorList() {
      var self = this;
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
        self.totalData.forEach(item => {
          item.flavorName = self.flavorRender(item.flavor.id);
        });
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    async initZones() {
      let $this = this;
      try {
        let result = await $this.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-availability-zone/detail'
        });
        let list = result['availabilityZoneInfo'];
        let zones = [];
        if (list != null) {
          for (let z = 0; z < list.length; z++) {
            let zone = list[z];
            let zoneState = zone['zoneState'];
            if (zone['zoneName'] != "internal") {
              let arr = $this.loadZoneAndHostCompare(zone.hosts);
              if (arr.length > 0) {
                zones.push(zone);
              }
            }
          }
        }
        $this.searchBar.conditions.availability_zone.options = zones.map(item => {
          return {
            label: item.zoneName,
            value: item.zoneName
          };
        });
        $this.zoneOptions = zones;
      } catch (res) {
        __DEV__ && console.error(res);
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
    async flavorDetail(flavor) {
      this.flavorDetailEntity = flavor;
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
          url: 'api/nova/v2.1/servers-inspur/' + row.id + '/action',
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
            self.$message(Vue.t('calcStorLang.confirmRevisionOrMigrateSuccess'));
            self.onRefresh();
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
          url: 'api/nova/v2.1/servers-inspur/' + row.id + '/action',
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
            self.$message(Vue.t('calcStorLang.cancelRevisionOrMigrateSuccess'));
            setTimeout(function() {
              self.onRefresh();
            }, 5000);
          }
        });
      } catch (res) {
        self.loading = false;
      }
    },
    async vmConsolePage(row) {
      const consoles = [{
        protocol: 'vnc',
        type: 'novnc'
      }, {
        protocol: 'spice',
        type: 'spice-html5'
      }]
      for (let console of consoles) {
        try {
          let result = await this.$ajax({
            type: 'post',
            data: JSON.stringify({
              remote_console: console
            }),
            headers: {
              'OpenStack-API-Version': 'compute 2.41',
              'X-OpenStack-Nova-API-Version': 2.41
            },
            url: `api/nova/v2.1/servers/${row.id}/remote-consoles`,
            showErrMsg: false
          });
          const url = result.remote_console.url;
          window.open(`${url}&title=${encodeURIComponent(row['name'])}`, '_blank');
          break;
        } catch (res) {
          // continue;
        }
      }
    },
    vmDetail(row) {
      this.detailFlag = true;
      this.instanceId = row['id'];
      this.instanceStatus = row['status'];
      this.$refs.umTable.clearSelection();
    },
    async applyModefyInstanceHander(list) {
      const $this = this;
      if (list.length > 0) {
        const rowData = list[0];
        let applyModifySpec = false;
        let confirmModifySpec = false;

        if ((rowData.status === "ACTIVE" || rowData.status === "SHUTOFF") && rowData.locked === false) {
          var body = { "resource_type": "VM.UPDATE", "instance_id": rowData.id };
          body = JSON.stringify(body);
          try {
            let result = await $this.$ajax({
              type: 'put',
              url: 'api/leo/v1/order/get_resource_order',
              data: body,
              showErrMsg: true
            });
            if (result['code'] === 0) { //无订单
              applyModifySpec = true;
              confirmModifySpec = false;
            } else if (result['code'] === 1) { //订单审批中
              applyModifySpec = false;
              confirmModifySpec = false;
            } else if (result['code'] === 2) { //审批完成
              $this.$set(rowData, 'applyOrderData', result.data['order_data']);
              $this.$set(rowData, 'applyOrderId', result.data['order_id']);
              applyModifySpec = false;
              confirmModifySpec = true;
            }
          } catch (res) {}
        } else {
          applyModifySpec = false;
          confirmModifySpec = false;
        }
        $this.$set(rowData, 'applyModifySpec', applyModifySpec);
        $this.$set(rowData, 'confirmModifySpec', confirmModifySpec);
      }
    },
    //查询是否有该云主机单子
    async getApplyOrder(row) {
      var self = this;
      var body = { "resource_type":"VM.UPDATE", "instance_id":row.id };
      body = JSON.stringify(body);
      try {
        let result = await self.$ajax({
          type: 'put',
          url: 'api/leo/v1/order/get_resource_order',
          data: body,
          showErrMsg: true
        });
        return result;
      } catch (res) {
      }
    },
    async approveOrder(row) {
      var self = this;
      self.$confirm(Vue.t('calcStorLang.DO_ALTER_CONFIRM'), Vue.t('calcStorLang.confirm'), {
        type: 'warning'
      }).then(() => {
        Promise.all([self.updateApplyOrder(row)]).then(function(result) {
          var orderResult = result[0];
          if (orderResult.code == "1") {
            self.submitReviseBySpec(row);
          }
        });
      });
    },
    async submitReviseBySpec(row) {
      var self = this;
      self.loading = true;
      var submitData = JSON.parse(row.applyOrderData);
      var body = submitData.data;
      try {
        let result = await self.$ajax({
          type: 'post',
          url: 'api/nova/v2.1/servers-inspur/' + submitData['instance_id'] + '/action',
          data: body,
          errorKey: "badRequest",
          log: {
            description: {
              en: "Alter Configuration:" + row.name,
              zh_cn: "更改配置:" + row.name
            },
            target: Vue.logTarget.computeInstance
          },
          successFun: function() {
            self.$message(Vue.t('calcStorLang.instAlterConfigSuccess'));
            var instance = self.instanceMaps.get(submitData['instance_id']);
            instance['OS-EXT-STS:task_state'] = "BUSY";
            self.onRefresh();
          },
          errFun: function() {
            self.loading = false;
          }
        });
      } catch (res) {
        self.loading = false;
      }
    },
    async updateApplyOrder(row) {
      var self = this;
      var body = { "order_id":row.applyOrderId, "order_state":"HANDLED" };
      body = JSON.stringify(body);
      var logContent = {
             "description": {
                "en": "Order approval:" + row.applyOrderId,
                "zh_cn": "订单审批:" + row.applyOrderId
             },
             "target": Vue.logTarget.Order
         };
      try {
        let result = await self.$ajax({
          type: 'put',
          url: 'api/leo/v1/order/update_order',
          data: body,
          // log: logContent,
          showErrMsg: true,
          successFun: function() {
            self.$message(Vue.t('calcStorLang.instOrderApproveFinish'));
          }
        });
        return result;
      } catch (res) {
      }
    },
    handleAddShow() {
      this.addFlag = false;
    },
    handleShow() {
      this.renameFlag = false;
    },
    handleConfig() {
      this.configFlag = false;
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
    handleusbFlag() {
      this.usbFlag = false;
    },
    handleFloatIpFlag() {
      let self = this;
      this.floatFlag = false;
      this.$refs.umTable.clearSelection();
      this.onRefresh();
    },
    handleIRFloatIpFlag() {
      let self = this;
      this.instRecyclingFloatIpFlg = false;
      this.$refs.umTable.clearSelection();
      this.onRefresh();
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
    deatilTempFlg() {
      var self = this;
      self.detailFlg = false;
      self.$refs.umTable.clearSelection();
      self.onRefresh();
    },
    handleRescueFlag() {
      this.rescueFlag = false;
    },
    handleSecurityGroupFlag() {
      this.securityGroupFlag = false;
    },
    handleEditSecurityGroupFlag() {
      this.editSecurityGroupFlag = false;
    },
    rowClick(row) {
      this.selectTblRow = row;
    },
    taskRender(value, rowData) {
      var taskType = rowData['OS-EXT-STS:task_state'];
      return getInstanceTaskName.call(this, taskType);
    },
    imageRender(value, rowData) {
      var self = this;
      var imageId = rowData['image'].id;
      var sourceTempType = ""; //创建出云主机类型（非选择的source类型） 1: 镜像 2: 云硬盘 3：云硬盘快照 4：云主机快照
      self.templateMaps.set(rowData['id'], sourceTempType);
      if (typeof imageId == "undefined") {
        var isVolumeOrSnap = rowData['os-extended-volumes:volumes_attached'];
        if (isVolumeOrSnap != "" && typeof isVolumeOrSnap != "undefined") {
          var vUuid = isVolumeOrSnap[0].id;
          var isVolumeFlag = self.volumeMaps.get(vUuid);
          var isSnapFlag = self.volumeSnapMaps.get(vUuid);
          if (isVolumeFlag != null && isSnapFlag == null) {
             sourceTempType = "2";
             self.templateMaps.set(rowData['id'], sourceTempType);
             return isVolumeFlag + "(" + Vue.t('calcStorLang.volume') + ")";
          } else if (isVolumeFlag == null && isSnapFlag != null) {
             sourceTempType = "3";
             self.templateMaps.set(rowData['id'], sourceTempType);
             return isSnapFlag + "(" + Vue.t('calcStorLang.volumeSnapshot') + ")";
          } else {
            return "-";
          }
        } else {
          return "-";
        }
      } else {
        var isImageFlag = self.imageMaps.get(imageId);
        if (isImageFlag != null) {
          var showName = isImageFlag.name || isImageFlag.id;
          if (isImageFlag['image_type'] == "snapshot" || isImageFlag['size'] == 0 || isImageFlag['image_type'] == "backup") {
             sourceTempType = "4";
             self.templateMaps.set(rowData['id'], sourceTempType);
             return showName + "(" + Vue.t('calcStorLang.instanceshot') + ")";
          } else {
             sourceTempType = "1";
             self.templateMaps.set(rowData['id'], sourceTempType);
             return showName + "(" + Vue.t('calcStorLang.image') + ")";
          }
        } else {
          return "-";
        }
      }
    },
    sourceDetailTip(row) {
      var self = this;
      self.popoverFlag = true;
      var uuId = "";
      var type = row['metadata']['source_type'];
      if ("image" == type) {
        uuId = row['image'].id;
        self.loadImageOrSnapshotDetail(uuId);
      } else if ("snapshot" == type) {
        uuId = row['image'].id;
        self.loadImageOrSnapshotDetail(uuId);
      } else {
        var volumeList = row['os-extended-volumes:volumes_attached'];
        for (let v = 0; v < volumeList.length; v++) {
          var obj = volumeList[v];
          if ((obj['boot_disk'] + "") == "true") {
            uuId = obj.id;
            break;
          }
        }
        self.sourceDetailEntity = '';
        if (uuId !== '' && uuId !== undefined && uuId !== null) {
          self.loadVolumeDetail(uuId);
        }
      }
    },
    async loadImageOrSnapshotDetail(id) {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/nova/v2.1/images/" + id,
          showErrMsg: true
        });
        self.sourceDetailEntity = result['image'];
        self.sourceDetailEntity.size = self.formatFileSize(result['image']['OS-EXT-IMG-SIZE:size'], "Byte");
        self.sourceDetailEntity.type = "";
      } catch (res) {
        self.sourceDetailEntity = "";
        self.loading = false;
      }
    },
    async loadVolumeDetail(id) {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/cinderv2/v3/" + this.$cookie.get("pid") + "/volumes/" + id,
          showErrMsg: true
        });
        self.sourceDetailEntity = result['volume'];
        self.sourceDetailEntity.size = result['volume']['size'] + "GB";
        self.sourceDetailEntity.type = Vue.t('calcStorLang.volume');
      } catch (res) {
        self.sourceDetailEntity = "";
        self.loading = false;
      }
    },
    sourceTemplateType(rowData) {
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
    },
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
                 ips += net.addr + "(" + Vue.t('network.floatingIP') + ")" + "<br>";
               } else {
                 ips += net.addr + "<br>";
               }
             }
            //  ipShow += addr + "<br>" + ips;
             ipShow += ips;
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
                 ips2 += net2.addr + "(" + Vue.t('network.floatingIP') + ")" + "<br>";
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
    instStatusChange(value) {
      var tip = "";
      if (value == "ACTIVE") {
        tip = Vue.t('calcStorLang.instTipContent1');//若云主机处于软/硬重启、重建、扩容、迁移中，底层云主机真实状态处于已经运行的状态，也将查询出来。
      } else if (value == "SHUTOFF") {
        tip = Vue.t('calcStorLang.instTipContent2');//若云主机处于重建、扩容中，底层云主机真实状态处于已经运行的状态，也将查询出来。
      } else if (value == "ERROR") {
        tip = Vue.t('calcStorLang.instTipContent3');//若云主机处于重建中，底层云主机真实状态已经处于错误的状态，也将查询出来。
      } else if (value == "PAUSED") {
        tip = Vue.t('calcStorLang.instTipContent4');//若云主机处于迁移中，底层云主机真实状态已经处于暂停的状态，也将查询出来。
      }
      this.instTipContent = tip;
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
        }
        return '-';
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
    isLocked(value, rowData) {
      var lockStatus = rowData['locked'];
      if (false == lockStatus) {
        return this.$t('lang.no');
      } else if (true == lockStatus) {
        return this.$t('lang.yes');
      } else {
        return "-";
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
    flavorRender(id) {
      const $this = this;
      if ($this.flavorMaps.has(id)) {
        return $this.flavorMaps.get(id);
      }
    },
    ramRender(value) {
      if (value != null) {
        return value/1024;
      } else {
        return "-";
      }
    },
    flavorDetailStatusRender(row) {
      if (row != null) {
        if ("false" == (row['os-flavor-access:is_public'] + "")) {
          return Vue.t('lang.no');
        } else {
          return Vue.t('lang.yes');
        }
      } else {
        return "-";
      }
    },
    onBack() {
      this.detailFlag = false;
    },
    handleSizeChange(val) {
      const $this = this;
      $this.pageSize = val;
      if ($this.currentPage === 1) {
        $this.loadData(1, false);
      } else {
        $this.currentPage = 1;
      }
    },
    handleCurrentChange(val) {
      const $this = this;
      $this.currentPage = val;
      $this.loadData(val, false);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      if (val != null && Vue.service.leo != null) {
        this.applyModefyInstanceHander(val);
      }
    },
    handleTableRefresh() {
      const $this = this;
      $this.loadData($this.currentPage, true);
    },
    onRefresh() {
      const $this = this;
      $this.loadData($this.currentPage, true);
    },
    async loadHostList() {
      const $this = this;
      const res = await $this.$ajax({
        type: 'get',
        url: 'api/nova/v2.1/os-hypervisors/detail'
      });
      let hosts = res.hypervisors.filter(item => item.hypervisor_type !== 'ironic');
      hosts = _.sortBy(hosts, 'hypervisor_hostname');
      $this.hosts = hosts;
      $this.getHosts(); // 赋值到搜索条
    },
    getHosts(azName) {
      const $this = this;
      let filteredHosts = [];
      if (azName !== '' && azName !== undefined && azName !== null) {
        const az = $this.zoneOptions.find(item => item.zoneName === azName);
        if (az) {
          let hosts = [];
          for (let key in az.hosts) {
            const host = $this.hosts.find(item => item.hypervisor_hostname === key);
            if (host) {
              hosts.push(host);
            }
          }
          filteredHosts = hosts;
        } else {
          filteredHosts = [];
        }
      } else {
        filteredHosts = $this.hosts;
      }
      $this.searchBar.conditions.host.options = filteredHosts.map(item => {
        return {
          label: item.hypervisor_hostname,
          value: item.hypervisor_hostname
        };
      });
    },
    loadOsList() {
      let self = this;
      let results = [];
      let list = osJson;
      for (let o = 0; o < list.length; o++) {
        let obj = {"value": list[o].system, "label": list[o].system, "distro": list[o].distro, "osType": list[o].osType};
        if ("fedora-atomic" == list[o].system) {
            obj = {"value": list[o].system, "label": "Fedora-atomic", "distro": list[o].distro, "osType": list[o].osType};
        }
        let distro = results.find(item => item.value === obj.distro);
        if (!distro) {
          distro = {
            value: obj.distro,
            label: obj.distro,
            children: []
          };
          results.push(distro);
        }
        distro.children.push(obj);
      }
      self.searchBar.conditions.os.options = results;
    },
    async loadData(page=1, clearSel=false, setLoading=true) {
      const $this = this;
      let params = {};
      Object.keys($this.searchBar.validatedParams).forEach(key => {
        const value = $this.searchBar.validatedParams[key];
        if (key === 'os') {
          if (JSON.stringify(value) !== JSON.stringify([])) {
            params['system_metadata'] = encodeURIComponent(JSON.stringify({'image_os_distro': value[1]}))
          }
        } else {
          params[key] = value;
        }
      });
      if ($this.roleType === '0') {
        params['all_tenants'] = 1;
      } else {
        if ('all_tenants' in params) {
          delete params.all_tenants;
        }
        params['project_id'] = $this.$cookie.get('pid');
        if ($this.roleType === '3') {
          params['user_id'] = Vue.userId;
        }
      }
      if (page > 1 && $this.markerList.length > page - 2) {
        params['marker'] = $this.markerList[page - 2];
      } else {
        delete params['marker'];
      }
      if (clearSel) {
        $this.$refs.umTable.clearSelection();
      }
      params['limit'] = $this.pageSize;
      params['sort_key'] = $this.sortKey;
      params['sort_dir'] = $this.sortDir;
      params['not-tags-any'] = encodeURIComponent('#,@,~');
      const queryIndex = $this.queryTimes + 1;
      // 总请求次数+1
      $this.queryTimes += 1;
      if ($this.refreshTimeout !== null) {
        clearTimeout($this.refreshTimeout);
      }
      let url = `api/nova/v2.1/servers/detail`;
      let queryString = Object.keys(params).map(key => {
        return `${key}=${params[key]}`
      }).join('&');
      if (setLoading) {
        $this.loading = true;
      }
      try {
        if (page === 1) {
          let allDataUrl = `api/nova/v2.1/servers?sort_key=${params['sort_key']}&sort_dir=${params['sort_dir']}&limit=999999`;
          if ('all_tenants' in params) {
            allDataUrl += `&all_tenants=1`;
          }
          const allDataRes = await $this.$ajax({
            url: allDataUrl,
            type: 'get',
            headers: {
              'X-OpenStack-Nova-API-Version': 2.67
            },
            showErrMsg: true
          });
          const ranges = _.range(-1, allDataRes.servers.length-1, $this.pageSize); // 计算总共有多少marker id要获取
          ranges.splice(0, 1);  // 删除第一个-1
          const markerList = ranges.map(i => {
            return allDataRes.servers[i]['id'];
          });
          $this.markerList = markerList;
          $this.total = allDataRes.servers.length;
        }
        const res = await $this.$ajax({
          url: `${url}?${queryString}`,
          type: 'get',
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          showErrMsg: true
        });
        // 等网络加载完，确保最后一次请求可以得到渲染。
        if ($this.queryTimes === queryIndex) {
          res.servers.forEach(item => {
            item.projectName = $this.projectRender('', item);
            item.ownerName = $this.ownerRender('', item);
            item.flavorName = $this.flavorMaps.size === 0 ? '' : $this.flavorRender(item.flavor.id);
            item.sourceType = $this.templateMaps.get(item.id);
            $this.instanceMaps.set(item.id, item);
            let tagsShown = item.tags.filter(item => {
              return ReservedTags.findIndex(r => r.toUpperCase() === item.toUpperCase()) === -1;
            });
            tagsShown = _.sortBy(tagsShown, 'length');
            item.tagsShown = tagsShown;
          });
          $this.totalData = res.servers;
          $this.handleSelectionChange($this.multipleSelection);
          $this.refreshTimeout = setTimeout(() => {
            if (!$this._isDestroyed) {
              $this.loadData(page, false, false);
            }
          }, 5000);
        }
        if (setLoading) {
          $this.loading = false;
        }
      } catch (e) {
        if (setLoading) {
          $this.loading = false;
        }
        __DEV__ && console.error(e);
      }
    },
    async loadFilteredUsers(projectId) {
      const $this = this;
      let users = [];
      if (projectId === '') {
        users = await getUsers();
      } else {
        users = await getUsersByProjectId(projectId);
      }
      if ($this.userMaps.size === 0) {
        users.forEach(item => {
          $this.userMaps.set(item.id, item.name);
        });
      }
      $this.searchBar.conditions.user_id.options = users.map(item => {
        return {
          value: item.id,
          label: item.name
        };
      });
    },
    async loadAttachedDirectConnectDisks(instanceId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers-inspur/${instanceId}/os-inspur-passthrus`
        });
        return res.disks;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    handleConditionValueChanged({key, value}) {
      if (key === 'project_id') {
        this.loadFilteredUsers(value);
      }
      if (key === 'availability_zone') {
        this.getHosts(value);
      }
    },
    handleSearch(params) {
      const $this = this;
      $this.searchBar.validatedParams = params;
      if ($this.currentPage === 1) {
        $this.loadData($this.currentPage, true);
      } else {
        $this.currentPage = 1;
      }
    },
    handleColumnChecked(val) {
      this.columnsChecked = val;
    }
  }
}

</script>

<style scoped>
.icos-search-bar >>> .el-select .el-input {
  min-width: 100px;
}
</style>
