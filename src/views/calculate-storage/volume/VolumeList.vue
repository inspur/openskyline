<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" @condition-value-changed="handleConditionValueChanged" />
    <div class="divider clearfix"></div>
    <div class="operation-panel" @mousedown="detailMouseDown">
      <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus" :operateMore="operateMore">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="volumeTable" :data="totalData" highlight-current-row border stripe style="width: 100%;" slot="empty" :default-sort="{prop: 'created_at', order: 'descending'}" row-key="id" @selection-change="handleSelectionChange" @sort-change="sortChange">
      <el-table-column reserve-selection type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" sortable="custom" min-width="100">
        <template slot-scope="scope">
          <el-button @click="vmDetail(scope.row)" type="text" size="small">
            <span>{{scope.row.name == null || scope.row.name == "" ? scope.row.id : scope.row.name}}</span>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('showVId') >= 0" prop="id" label="ID" sortable="custom" min-width="100">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('size') >= 0" prop="size" align="left" sortable="custom" :label="$t('storage.size')" min-width="60">
        <template slot-scope="scope">
          <span>{{scope.row.size + " GB"}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" align="left" :label="$t('lang.status')" sortable="custom" min-width="60">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.status)">
            <span v-html="volumeStatusRender(scope.row.status, scope.row)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('volume_project') >= 0 && isAdmin()" prop="volume_project" align="left" :label="$t('lang.project')" min-width="60">
        <template slot-scope="scope">
          <span v-html="volumeProjectRender(scope.row['os-vol-tenant-attr:tenant_id'], scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('volume_owner') >= 0" prop="volume_owner" align="left" :label="$t('storage.owner')" min-width="60">
        <template slot-scope="scope">
          <span v-html="volumeUserRender(scope.row.user_id, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('volume_type') >= 0" prop="volume_type" align="left" :label="$t('lang.type')" min-width="60">
        <template slot-scope="scope">
          <span v-html="volumeTypeRender(scope.row.volume_type, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('source') >= 0 && isUser()" prop="source" :label="$t('storage.origin')" min-width="100">
        <template slot-scope="scope">
          <el-button @click="showSourceInfo(scope.row.source)" type="text" size="small">
            <span>{{scope.row.source.name}}</span>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('movestatus') >= 0" prop="movestatus" align="left" :label="$t('storage.migrationStatus')" min-width="60">
        <template slot-scope="scope">
          <span v-html="volumeMoveStatus(scope.row.migration_status, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('bootable') >= 0" prop="bootable" sortable="custom" align="left" :label="$t('storage.bootable')" min-width="60">
        <template slot-scope="scope">
          <span v-html="volumeBootableRender(scope.row.bootable, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('multiattach') >= 0" prop="multiattach" sortable="custom" :label="$t('calcStorLang.shared')" min-width="70" align="left">
        <template slot-scope="scope">
          <span v-if="scope.row.multiattach">{{$t('lang.yes')}}</span>
          <span v-else>{{$t('lang.no')}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('encrypted') >= 0" prop="encrypted" :label="$t('storage.encrypt')" min-width="70" align="left">
        <template slot-scope="scope">
          <span v-if="scope.row.encrypted">{{$t('lang.yes')}}</span>
          <span v-else>{{$t('lang.no')}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('links') >= 0" prop="links" :show-overflow-tooltip="false" align="left" :label="$t('storage.connectTo')" min-width="80">
        <template slot-scope="scope">
          <el-popover placement="top" ref="pop" v-if="scope.row.attachments.length" trigger="hover" class="cover-pop">
            <div class="cover-pop">
              <p v-for="item in instancePopoverRender(scope.row)" :key="item">{{item}}</p>
            </div>
          </el-popover>
          <span v-popover:pop v-if="scope.row.attachments.length" style="white-space: nowrap;">{{instanceRender(scope.row)}}</span>
          <span v-if="!scope.row.attachments.length">{{"-"}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('availability_zone') >= 0" prop="availability_zone" sortable="custom" align="left" :label="$t('storage.region')" min-width="60">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('date') >= 0" prop="created_at" :label="$t('calcStorLang.createTime')" sortable="custom" min-width="70" align="left">
        <template slot-scope="scope">
          <span v-html="dateRender(scope.row.created_at, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('description') >= 0" prop="description" :label="$t('lang.desc')" min-width="100">
        <template slot-scope="scope">
          <span>{{scope.row.description}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc("lang.item", multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <!-- <page :totalData="totalData"  @getCurrentData="getCurrentData"></page> -->
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
        </el-col>
      </el-row>
      <ul style="list-style-type: disc; list-style-position: inside;">
        <li><span>{{$t('calcStorLang.volumeListTip')}}</span></li>
        <!-- <li><span>{{$t('calcStorLang.volumeListTip1')}}</span></li> -->
      </ul>
      <create-instance
        v-if="createInstanceDialog.visible"
        :preset-data="createInstanceDialog"
        @close="createInstanceDialog.visible = false"
        @refresh="gotoInstanceList"
      />
      <revert-by-snapshot ref="newVolume" v-if="revertBySnapshotFlag" @handleShow="handleRevertShow" :volume="volumeInfo"></revert-by-snapshot>
      <new-volume ref="newVolume" v-if="newVolumeFlg" :entranceCode="newVolumeCode" :volumeInfo="volumeInfo" @handleShow="handleShow" @getData="onRefresh"></new-volume>
      <volume-managment ref="VolumeManagment" v-if="volumeManagmentFlg" @handleShow="handleManagementShow" @getData="onRefresh"></volume-managment>
      <apply-volume ref="applyVolume" v-if="applyVolumeFlg" @handleShow="handleApplyShow" @getData="onRefresh"></apply-volume>
      <edit-volume ref="editVolume" :volumeTempId="volumeTempId" :volumeEntity="volumeEntity" v-if="editVolumeFlg" @handlerEditShow="handlerEditShow" @onRefresh="onRefresh"></edit-volume>
      <expand-volume ref="expandVolume" v-if="expandVolumeFlg" :dialogTittle="dialogTittle" :detailVolume="detailVolume" @onRefresh="onRefresh" @handleShow="hideExpandVolume"></expand-volume>
      <transfer-volume ref="transferVolume" v-if="transferVolumeFlg" :vId="vId" @onRefresh="onRefresh" @handleShow="hideTransferVolume"></transfer-volume>
      <edit-volume-type ref="editVolumeType" v-if="editVolumeTypeFlg"></edit-volume-type>
      <volume-type-change ref="editVolumeType" v-if="updateTypeFlg" :detailVolume="detailVolume" @hide="updateTypeFlg=false" @refresh="onRefresh"></volume-type-change>
      <accept-transfer ref="acceptTransfer" v-if="acctransferVolumeFlg" @onRefresh="onRefresh" @handleShow="hideAccTransferVolume"></accept-transfer>
      <volume-move ref="volumeMove" v-if="volumeMoveFlg" @handleVolumeMove="handleVolumeMove" @onRefresh="onRefresh" :detailVolume="detailVolume"></volume-move>
      <manage-link ref="manageLink" v-if="manageLinkFlg" @handleManageLink="handleManageLink" @onRefresh="onRefresh" :detailVolume="detailVolume"></manage-link>
      <volume-image ref="volumeImage" v-if="volumeImageFlg" @handlerAddImage="handlerAddImage" @hrefTomrriorPage="hrefTomrriorPage" :volumeTempId="volumeTempId" :temp_volume_name="temp_volume_name" :detailVolume="detailVolume"></volume-image>
      <volume-snapshot ref="volumeSnapshot" v-if="volumeSnapshotFlg" :vId="vId" @handleShow="hideSnapshot" :detailVolume="detailVolume" @hrefToSnapshotPage="hrefToSnapshotPage"></volume-snapshot>
      <add-volume-bak ref="addVolumeBak" v-if="addVolumeBakFlg" :vId="vId" :vStatus="vStatus" :detailVolume="detailVolume" @handlerBak="handlerBak"></add-volume-bak>
      <refresh-metadata ref="refreshMetadata" v-if="refreshMetadataFlg"></refresh-metadata>
      <refresh-status ref="refreshStatus" v-if="refreshStatusFlg" @refreshStatusFun="refreshStatusFun" :volumeTempId="volumeTempId" :temp_volume_name="temp_volume_name"></refresh-status>
      <clone-volume ref="cloneVolume" v-if="cloneVolumeFlg" :volumeInfo="volumeInfo" @handleShow="handleShow" @getData="onRefresh"></clone-volume>
      <qos-volume-manage ref="qosManage" v-if="qosVolumeFlg" :volumeInfo="volumeInfo" @handleShow="handleShow" @getData="onRefresh"></qos-volume-manage>
      <transition name="slide-right" mode="out-in">
        <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
          <panel style="height: 100%">
            <div slot="title" class="clearfix">
              <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
            </div>
            <div>
              <volume-detail ref="detail" :detailVolume="detailVolume" :userName="detailUserName" :vmpName="detailProjectName" :deviceUN="detailDeviceName"></volume-detail>
            </div>
          </panel>
        </div>
        <div style="width: 800px;" class="slide-panel" v-if="sourceInfoFlag">
          <panel style="height: 100%">
            <div slot="title" class="clearfix">
              <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
            </div>
            <div>
              <Volume-Source-Info ref="volumeSourceInfo" :sourceInfo="sourceInfo"></Volume-Source-Info>
            </div>
          </panel>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import CreateInstance from "../instance/create-instance";
import NewVolume from "./NewVolume";
import EditVolume from "./VolumeEdit";
import TransferVolume from "./VolumeTransfer";
import ExpandVolume from "./VolumeExpansion";
import EditVolumeType from "./EditVolumeType";
import AcceptTransfer from "./AcceptTransfer";
import VolumeMove from "./VolumeMove";
import ManageLink from "./ManageLink";
import VolumeImage from "./VolumeImage";
import VolumeManagment from "./VolumeManagment";
import VolumeSnapshot from "./VolumeSnapshot";
import AddVolumeBak from "./AddVolumeBak";
import RefreshMetadata from "./RefreshMetadata";
import RefreshStatus from "./RefreshStatus";
import VolumeDetail from "./VolumeDetail";
import ApplyVolume from "./ApplyVolume";
import VolumeTypeChange from "./VolumeTypeChange";
import RevertBySnapshot from "./RevertBySnapShot";
import VolumeSourceInfo from "./VolumeSourceInfo";
import OperationMenu from "./VolumeListOperationMenu";
import CloneVolume from "./CloneVolume";
import QosVolumeManage from "./QosVolumeManage"
export default {
  name: "VolumeList",
  data() {
    return {
      sortObj: {
        sortOrder: "desc",
        sortField: "created_at"
      },
      queryParams: {},
      projectlist: [],
      projectMap: new Map(),
      userList: [],
      userMap: new Map(),
      statusList: [],
      volumeTypeList: [],
      volumeType: "",
      volume_id: "",
      volumeInfo:"",
      volumeProject: "",
      projectName: "",
      projectOwner: "",
      volumeUser: "",
      volumeStatus: "",
      volume_name: "",
      temp_volume_name: "",
      volumeTempId: "",
      newVolumeCode:"",
      sourceInfo: {},
      sourceInfoFlag: false,
      newInstance: false,
      newVolumeFlg: false,
      editVolumeFlg: false,
      expandVolumeFlg: false,
      transferVolumeFlg: false,
      editVolumeTypeFlg: false,
      acctransferVolumeFlg: false,
      updateTypeFlg: false,
      revertBySnapshotFlag: false,
      applyVolumeFlg: false,
      manageLinkFlg: false,
      detailFlag: false,
      volumeImageFlg: false,
      volumeMoveFlg: false,
      volumeManagmentFlg: false,
      volumeSnapshotFlg: false,
      addVolumeBakFlg: false,
      refreshMetadataFlg: false,
      refreshStatusFlg: false,
      cloneVolumeFlg: false,
      qosVolumeFlg: false,
      multipleSelection: [],
      instanceMaps: new Map(),
      volumeMaps: new Map(),
      detailVolume: "",
      dialogTittle:"",
      detailProjectName: "",
      detailUserName: "",
      detailDeviceName: "",
      operateMore: true,
      vId: "",
      vStatus: "",
      volumeEntity: "",
      totalData: [],
      operationMenus: OperationMenu.bind(this)(),
      loading: false,
      columnsChecked: [
        "name",
        "size",
        "status",
        "volume_project",
        "volume_owner",
        "bootable",
        "volume_type",
        "source",
        "movestatus",
        "date",
        "multiattach",
        "links",
        "availability_zone"
      ],
      columns: [
        {
          prop: "name",
          label: this.$t("lang.name")
        },
        {
          prop: "showVId",
          label: "ID"
        },
        {
          prop: "size",
          label: this.$t("storage.size")
        },
        {
          prop: "status",
          label: this.$t("lang.status")
        },
        {
          prop: "volume_owner",
          label: this.$t("storage.owner")
        },
        {
          prop: "volume_type",
          label: this.$t("lang.type")
        },
        {
          prop: "movestatus",
          label: this.$t("storage.migrationStatus")
        },
        {
          prop: "bootable",
          label: this.$t("storage.bootable")
        },
        {
          prop: "multiattach",
          label: Vue.t("calcStorLang.shared")
        },
        {
          prop: "encrypted",
          label: Vue.t("storage.encrypt")
        },
        {
          prop: "links",
          label: this.$t("storage.connectTo")
        },
        {
          prop: "availability_zone",
          label: this.$t("storage.region")
        },
        {
          prop: "date",
          label: Vue.t("calcStorLang.createTime")
        },
        {
          prop: "description",
          label: this.$t("lang.desc")
        }
      ],
      currentPage: 1,
      pageSize: 10,
      pageSizes: [5, 10, 20, 30, 40, 60, 80, 100],
      total: 1,
      searchBar: {
        conditions: {
          // name: {
          //   label: this.$t('lang.name'),
          //   type: 'input',
          //   validator: (value) => {
          //     if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
          //       throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
          //     }
          //   }
          // },
          id: {
            label: 'ID',
            type: 'input',
            validator: (value) => {
              if (!/^[a-fA-F0-9\-]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyUUIDKeyword'));
              }
            }
          },
          project_id: {
            label: this.$t('lang.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          },
          user_id: {
            label: this.$t('storage.owner'),
            options: [],
            visible: String(Vue.roleType) != '3',
            type: 'select'
          },
          status: {
            label: this.$t('lang.status'),
            type: 'select',
            options: []
          },
          encrypt:{
            label: this.$t('storage.encrypt'),
            type: 'select',
            options: [
               {"label": this.$t('lang.yes'), "value": "True"},
               {"label": this.$t('lang.no'), "value": "False"}
            ]
          },
          volume_type_id: {
            label: this.$t('lang.type'),
            type: 'select',
            options: []
          }
        },
        validatedParams: {}
      },
      createInstanceDialog: {
        visible: false,
        projectIdLocked: true,
        canSelectSource: false,
        projectId: '',
        sourceType: 'volume',
        sourceId: '',
        sourceName: '',
        sourceOSDistro: '',
        sourceMinRam: 0,
        sourceMinDisk: 0,
        sourceImageFormat: '',
        sourceSize: 0
      }
    };
  },
  beforeDestroy() {
    if (this.interVmValid != null) {
      clearInterval(this.interVmValid);
    }
  },
  watch: {
    totalData: {
      immediate: false,
      handler: function (list) {
        var self = this;
        self.reloadTblFlag = false;
        if (list != null) {
          for (var t = 0; t < list.length; t++) {
            var obj = list[t];
            if (
              obj["status"] == "creating" ||
              obj["status"] == "deleting" ||
              obj["status"] == "data-copying" ||
              obj["status"] == "attaching" ||
              obj["status"] == "detaching" ||
              obj["status"] == "downloading" ||
              obj["status"] == "extending" ||
              obj["status"] == "uploading" ||
              obj["status"] == "backing-up" ||
              obj["status"] == "unmanaging" ||
              obj["status"] == "retyping" ||
              obj["status"] == "soft_deleted" ||
              obj["status"] == "soft_deleting" ||
              obj["status"] == "reverting" ||
              obj["status"] == "restoring-backup" ||
              obj["status"] == "cloning" ||
              obj["status"] == "reserved" ||
              obj["status"] == "maintenance" ||
              obj["migration_status"] == "maintenance" ||
              obj["migration_status"] == "starting" ||
              obj["migration_status"] == "migrating"
            ) {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.interVmValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interVmValid = setInterval(() => {
            self.loadData(self.queryParams);
          }, 5000);
        }
      }
    }
  },
  mounted() {
    var self = this;
    if (self.isUser() && self.columns) {
      let obj = {
        prop: "source",
        label: this.$t("storage.origin")
      };
      self.columns.splice(6, 0, obj);
    }
    if (self.isAdmin() && self.columns) {
      let obj = {
        prop: "volume_project",
        label: this.$t("lang.project")
      };
      self.columns.splice(4, 0, obj);
    }
    Promise.all([
      self.buildStatusList(),
      self.handleSearch({}),
      self.loadInstanceList(),
      self.loadProjectList(),
      self.loadUserList(),
      self.loadUserListTitle(),
      self.loadVolumeType()
    ]).then(function (result) {
      self.loadData(self.queryParams);
    });
  },
  methods: {
    dateRender(value, rowData) {
      var self = this;
      if (value.lastIndexOf("Z") < 0 && value.lastIndexOf(".") >= 0) {
        value = value.substring(0, value.lastIndexOf(".")) + "Z";
      }
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
        S: date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
      }
      if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length > 1
            ? RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468"
            : ""
        );
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ("00" + o[k]).substr(("" + o[k]).length)
          );
        }
      }
      return fmt;
    },
    async loadImageDetail(id) {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/glance/v2/images/" + id,
          showErrMsg: false
        });
        return result;
      } catch (res) {
        return false;
      }
    },
    async showSourceInfo(info) {
      let self = this;
      this.sourceInfoFlag = false;
      this.detailFlag = false;
      this.sourceInfo = info;
      if (info.canOpen) {
        if (info.type === "Image" || info.type === "InstanceSolt") {
          let existed = await self.loadImageDetail(info.sourceInfo.image_id);
          if (!existed) {
            this.$message.error(this.$t('storage.VOLUME_SOURCE_DELETED'));
            return false;
          } else {
             this.sourceInfo.sourceInfo = {"image_id" : existed.id, "image_name" : existed.name, ...existed};
          }
        }
        this.sourceInfoFlag = true;
        this.$nextTick(() => {
          this.$refs.volumeSourceInfo.show();
        });
      } else {
        if (info.type != "new") {
          this.$message.error(this.$t('storage.VOLUME_SOURCE_DELETED'));
        }
      }
    },
    detailMouseDown() {
      var self = this;
      self.detailFlag = false;
      self.sourceInfoFlag = false;
    },
    handleConditionValueChanged({key, value}) {
      if (key === 'project_id') {
        this.loadUserList(value);
        this.loadUserListTitle(value);
      }
    },
    sortChange(column) {
      var self = this;
      var keyOrder = "desc";
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
      self.loadData(self.queryParams);
    },
    isAdmin() {
      var roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        return false;
      }
      return true;
    },
    isUser() {
      var roleType = Vue.roleType + "";
      if ("3" == roleType) {
        return false;
      }
      return true;
    },
    async loadData(params) {
      var self = this;
      this.loading = true;
      var projectId = this.$cookie.get("pid");
      var roleType = Vue.roleType + "";
      let data = {
        limit: self.pageSize,
        with_count: "True",
        offset: self.pageSize * (self.currentPage - 1),
        sort_key: self.sortObj.sortField,
        sort_dir: self.sortObj.sortOrder,
        ...params
      };
      if ("0" == roleType) {
        data["all_tenants"] = "True";
      }
      if ("3" == roleType) {
         data["user_id"] = Vue.userId;
      }
      // data['soft_deleted'] = "False";
      let url = "api/cinderv3/v3/" + projectId + "/volumes/detail?" + $.param(data);
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: false,
          headers: {
            "OpenStack-API-Version": "volume 3.45"
          }
        });
        self.total = result["count"];
        let resultData = result["volumes"];
        resultData.forEach(item => {
          let source = {
            "type" : "new",
            "name" : self.$t("storage.new"),
            "canOpen": false,
            "sourceInfo" : {}
          };
          if (item["glance_metadata"] && JSON.stringify(item["glance_metadata"]) != "{}") {
            let sourceInfo = item["glance_metadata"];
            source.sourceInfo = sourceInfo;
            source.canOpen = true;
            if (sourceInfo["image_type"] === "snapshot" || sourceInfo["image_type"] === "backup") {
              source.type = "InstanceSolt";
              source.name =`${self.$t('storage.VOLUME_SOURCE_INSTANCE_SNAPSHOT')}(${sourceInfo["image_id"]})`;
            } else {
              source.type = "Image";
              source.name = `${self.$t('storage.VOLUME_SOURCE_IMAGE')}(${sourceInfo["image_id"]})`;
            }
          }
          if (item["backup_id"]) {
            source.type = "VolumeBackup";
            source.sourceInfo = item["backup"];
            source.name = `${self.$t('storage.VOLUME_SOURCE_VOLUME_BACKUP')}(${item["backup_id"]})`;
            source.canOpen = false;
            if (item["backup"]) {
              source.canOpen = true;
            }
          }
          if (item["source_volid"]) {
            source.type = "Volume";
            source.sourceInfo = item["volume"];
            source.name = `${self.$t('storage.VOLUME_SOURCE_VOLUME')}(${item["source_volid"]})`;
            source.canOpen = false;
            if (item["volume"]) {
              source.canOpen = true;
            }
          }
          if (item["snapshot_id"]) {
            source.type = "VolumeSnapSolt";
            source.sourceInfo = item["snapshot"];
            source.name = `${self.$t('storage.VOLUME_SOURCE_VOLUME_SNAPSHOT')}(${item["snapshot_id"]})`;
            source.canOpen = false;
            if (item["snapshot"]) {
              source.canOpen = true;
            }
          }
          item.source = source;
        });
        self.totalData = JSON.parse(JSON.stringify(resultData));
        var vEntity = "";
        for (let v = 0; v < resultData.length; v++) {
          vEntity = resultData[v];
          self.volumeMaps.set(vEntity.id, vEntity);
        }
      } catch (res) {
        self.loading = false;
      }
    },
    buildStatusList() {
      this.statusList.push(
        { value: "available", label: this.$t("storage.available") },
        { value: "creating", label: this.$t("storage.creating") },
        { value: "in-use", label: this.$t("storage.inUsing") },
        { value: "reserved", label: this.$t("storage.reserved") },
        { value: "attaching", label: this.$t("storage.installing") },
        { value: "detaching", label: this.$t("storage.uninstaling") },
        { value: "maintenance", label: this.$t("storage.migrationing") },
        { value: "deleting", label: this.$t("storage.deleting") },
        { value: "error", label: this.$t("storage.error") },
        { value: "extending", label: this.$t("storage.extendingStatus") },
        { value: "error_extending", label: this.$t("storage.extendingError") },
        { value: "error_restoring", label: this.$t("storage.bakRecoveryError") },
        { value: "error_deleting", label: this.$t("storage.errorDeleting") },
        { value: "error_managing", label: this.$t("storage.errorManaging") },
        { value: "error_unmanaging", label: this.$t("storage.errorUnmanaging") },
        { value: "unmanaging", label: this.$t("storage.unmanaging") },
        { value: "soft_deleting", label: this.$t("storage.soft_deleting") },
        { value: "backing-up", label: this.$t("storage.backUping") },
        { value: "error-backing-up", label: this.$t("storage.backUPError") },
        { value: "restoring-backup", label: this.$t("storage.bakRecoverying") },
        { value: "downloading", label: this.$t("storage.downloadImaging") },
        { value: "uploading", label: this.$t("storage.uploadImaging") },
        { value: "awaiting-transfer", label: this.$t("storage.waitTransfering") },
        { value: "data-copying", label: this.$t("storage.dataCopying") },
        { value: "reverting", label: this.$t("storage.reverting") },
        { value: "cloning", label: this.$t("storage.CLONGING") },
        { value: "clone_error", label: this.$t("storage.clone_error") }
      );
      this.searchBar.conditions.status.options = JSON.parse(JSON.stringify(this.statusList));
    },
    async loadInstanceList() {
      //查询主机列表
      let self = this;
      let roleType = Vue.roleType + "";
      let projectId = this.$cookie.get("pid");
      let url = "api/nova/v2.1/servers/detail?all_tenants=1";
      if ("2" == roleType || "3" == roleType) {
        url = "api/nova/v2.1/servers/detail?project_id=" + projectId;
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          showErrMsg: false
        });
        let servers = result['servers'];
        let serverList = [];
        for (let q = 0; q < servers.length; q++) {
          let tempServer = servers[q];
          /* 区分云主机和云物理机*/
          if (tempServer["tags"] && tempServer["tags"].includes("@")) {
            self.instanceMaps.set(tempServer.id, {type:"physicalHost", data: tempServer});
          } else {
            self.instanceMaps.set(tempServer.id, {type:"instance", data: tempServer});
          }
        }
      } catch (res) {
        self.loading = false;
      }
    },
    async loadProjectList() {
      //查询所有的项目列表
      var self = this;
      var roleType = Vue.roleType + "";
      let projectlist = [];
      //当前登录用户参与和管理的项目列表
      const joinedProjecList = Vue.projectList;
      if (roleType != "0") {
        for (let i = 0; i < joinedProjecList.length; i++) {
          let project = joinedProjecList[i];
          if (project['roleId'] != "SuperAdmin") {
            self.projectMap.set(project.id, project.name);
            projectlist.push({
              label: project.name,
              value: project.id
            });
          }
        }
        self.projectlist = projectlist;
        return false;
      }
      let url = "api/keystone/v3/projects?domain_id=default";
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: false
        });
        let projects = result["projects"];
        for (let q = 0; q < projects.length; q++) {
          self.projectMap.set(projects[q].id, projects[q].name);
          projectlist.push({
            label: projects[q].name,
            value: projects[q].id
          });
        }
        self.projectlist = projectlist;
        self.searchBar.conditions.project_id.options = JSON.parse(JSON.stringify(self.projectlist));
      } catch (res) {
        self.loading = false;
      }
    },
    async loadUserList(projectId) {
      var self = this;
      let roleType = Vue.roleType + "";
      let url = "";
      if ("2" == roleType || "3" == roleType) {
        url = "api/keystone/v3/users?project_id=" + self.$cookie.get("pid");
      } else {
        url = "api/keystone/v3/users?domain_id=default";
        if (projectId) {
          url = "api/keystone/v3/users?domain_id=default&project_id=" + projectId;
        }
      }
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: false
        });
        var users = result["users"];
        let userList = [];
        users.forEach(item => {
          userList.push({
            "label": item["name"],
            "value": item["id"]
          });
        });
        self.userList = userList;
        self.searchBar.conditions.user_id.options = JSON.parse(JSON.stringify(self.userList));
      } catch (res) {
        self.loading = false;
      }
    },
    async loadUserListTitle(projectId) {
      var self = this;
      let roleType = Vue.roleType + "";
      let url = "";
      if ("2" == roleType || "3" == roleType) {
        url = "api/keystone/v3/users?project_id=" + self.$cookie.get("pid");
      } else {
        url = "api/keystone/v3/users?domain_id=default";
        if (projectId) {
          url = "api/keystone/v3/users?domain_id=default&project_id=" + projectId;
        }
      }
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: false
        });
        var users = result["users"];
        let userList = [];
        users.forEach(item => {
          self.userMap.set(item["id"], item["name"]);
        });
      } catch (res) {
        self.loading = false;
      }
    },
    async loadVolumeType() {
      var self = this;
      self.volumeTypeList = [];
      var projectId = self.$cookie.get("pid");
      var url =
        "api/cinderv3/v3/" + self.$cookie.get("pid") + "/types?is_public=None";
      if ("2" == roleType || "3" == roleType) {
        //超级
        url = "api/cinderv3/v3/" + projectId + "/types";
      }
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: false
        });
        let volumeTypeList = [{"label": "-", "value": "None"}];
        result["volume_types"].forEach(item => {
          volumeTypeList.push({
            "label": item["name"],
            "value": item["id"]
          });
        });
        self.volumeTypeList = volumeTypeList;
        self.searchBar.conditions.volume_type_id.options = JSON.parse(JSON.stringify(this.volumeTypeList));
      } catch (res) {
        self.loading = false;
      }
    },
    async deleteVolumeTransfer(volumeInfo) {
      var self = this;
      self.loading = true;
      var projectId = self.$cookie.get("pid");

      //查询项目所有的列表
      var transferId = "";
      var queryUrl =
        "api/cinderv3/v3/" + self.$cookie.get("pid") + "/os-volume-transfer";
      try {
        var queryResult = await self.$ajax({
          type: "get",
          url: queryUrl
        });
        var transferList = queryResult["transfers"];
        for (var i = 0; i < transferList.length; i++) {
          var temp = transferList[i];
          if (volumeInfo.id == temp["volume_id"]) {
            transferId = temp["id"];
            break;
          }
        }
      } catch (res) {
        self.loading = false;
      }
      if ("" == transferId) {
        self.$message({
          showClose: true,
          message: Vue.t("storage.notAllowCancleAgain"),
          type: "warning"
        });
        return;
      }
      var logName = volumeInfo.name;
      if (
        "" == volumeInfo.name ||
        typeof volumeInfo.name == "undefined" ||
        null == volumeInfo.name
      ) {
        logName = volumeInfo.id + "(" + volumeInfo.id + ")";
      } else {
        logName = volumeInfo.name + "(" + volumeInfo.id + ")";
      }
      self
        .$sequence({
          type: "delete",
          url:
          "api/cinderv3/v3/" +
          self.$cookie.get("pid") +
          "/os-volume-transfer/{id}",
          params: [{ id: transferId, name: logName }],
          successMsg: this.$t("storage.cancleTransferSuccess"),
          errorKey: "badRequest",
          log: {
            description: {
              en: "Cancel transfer",
              zh_cn: "取消转让"
            },
            key: "name",
            target: Vue.logTarget.storage_volume
          },
          successFun: function () {
            self.loading = true;
            self.$refs.volumeTable.clearSelection();
            self.currentPage = 1;
            setTimeout(function () {
              self.loadData(self.queryParams);
              self.loading = false;
            }, 1000);
          }
        })
        .then(data => { })
        .catch(err => { });
    },
    isHasApplyExpansion(volumeId) {
      var url = "api/leo/v1/order/get_resource_order";
      var body = { resource_type: "VOLUME.UPDATE", instance_id: volumeId };
      body = JSON.stringify(body);
      try {
        let ret = this.$ajax({
          url: url,
          data: body,
          type: "put",
          showErrMsg: true
        });
        var code = ret["code"];
        if (0 != code) {
          self.$message({
            showClose: true,
            message: Vue.t("storage.pleaseWaitUntilApproved"),
            type: "info"
          });
          return true;
        }
      } catch (data) {
        this.loading = false;
        this.isDisabled = false;
        __DEV__ && console.error(data);
      }
      return false;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.loadData(this.queryParams);
      this.clearSelOption();
    },
    handleSearch(params) {
      const self = this;
      self.queryParams = params;
      self.currentPage = 1;
      self.$refs.volumeTable.clearSelection();
      self.loadData(self.queryParams);
    },
    handleManageLink() {
      this.manageLinkFlg = false;
    },
    vmDetail(row) {
      this.detailVolume = row;
      this.detailProjectName = this.volumeProjectRender(
        row["os-vol-tenant-attr:tenant_id"],
        row
      );
      this.detailUserName = this.volumeUserRender(row.user_id, row);
      this.detailDeviceName = this.instanceRender(row);
      this.detailFlag = true;
      this.sourceInfoFlag = false;
      this.$nextTick(() => {
        this.$refs.detail.show();
      });
      // this.$refs.umTable.clearSelection();
    },
    onBack() {
      this.detailFlag = false;
      this.sourceInfoFlag = false;
    },
    handlerEditShow() {
      this.editVolumeFlg = false;
    },
    handleVolumeMove(volumeId) {
      this.volumeMoveFlg = false;
      for (var q = 0; q < self.totalData; q++) {
        var tempvm = self.totalData[q];
        if (tempvm.id == volumeId) {
          tempvm.status = "maintenance";
        }
      }
    },
    handleCreateInsShow() {
      this.newInstance = false;
    },
    handleShow() {
      this.newVolumeFlg = false;
      this.cloneVolumeFlg = false;
      this.qosVolumeFlg = false;
    },
    handleManagementShow() {
      this.volumeManagmentFlg = false;
    },
    handleRevertShow() {
      this.revertBySnapshotFlag = false;
      this.loadData(this.queryParams);
    },
    handleApplyShow() {
      this.applyVolumeFlg = false;
    },
    hideExpandVolume() {
      this.expandVolumeFlg = false;
    },
    hideTransferVolume() {
      this.transferVolumeFlg = false;
    },
    hideAccTransferVolume() {
      this.acctransferVolumeFlg = false;
    },
    hideSnapshot() {
      this.volumeSnapshotFlg = false;
    },
    handlerAddImage() {
      this.volumeImageFlg = false;
      this.loadData(this.queryParams);
    },
    handlerBak() {
      this.addVolumeBakFlg = false;
      this.loadData(this.queryParams);
    },
    refreshStatusFun() {
      let self = this;
      self.refreshStatusFlg = false;
      setTimeout(function () {
        self.handleSearch(self.queryParams);
      }, 1000);
    },
    instanceRender(rowData) {
      let self = this;
      let vmList = rowData["attachments"];
      if (vmList != null) {
        let vms = [];
        for (let m = 0; m < vmList.length; m++) {
          let entity = vmList[m];
          let server = self.instanceMaps.get(entity["server_id"]);
          if (server) {
            let data = server.data;
            let serverName = data.name
            if (!serverName) {
              serverName = entity["server_id"];
            }
            if (server.type == "instance") {
              vms.push(self.$t("calcStorLang.instance") + ": " + serverName);
            }
            if (server.type == "physicalHost") {
              vms.push(self.$t("calcStorLang.physicalHost") + ": " + serverName);
            }
          }
        }
        if (vms.length > 0) {
          return vms.join(",");
        } else {
          return "-"
        }
      } else {
        return "-";
      }
    },
    instancePopoverRender (rowData) {
      let self = this;
      let vmList = rowData["attachments"];
      if (vmList != null) {
        let instanceList = [];
        let physicalHostList = [];
        let result = [];
        for (let m = 0; m < vmList.length; m++) {
          let entity = vmList[m];
          let server = self.instanceMaps.get(entity["server_id"]);
          if (server) {
            let data = server.data;
            let serverName = data.name
            if (!serverName) {
              serverName = entity["server_id"];
            }
            if (server.type == "instance") {
              instanceList.push(serverName);
            }
            if (server.type == "physicalHost") {
              physicalHostList.push(serverName);
            }
          }
        }
        if (instanceList.length != 0) {
          result = [...result, self.$t("calcStorLang.instance") + ": ", ...instanceList];
        }
        if (physicalHostList.length != 0) {
          result = [...result, self.$t("calcStorLang.physicalHost") + ": ", ...physicalHostList];
        }
        if (result.length > 0) {
          return result;
        } else {
          return "-"
        }
      } else {
        return "-";
      }
    },
    volumeProjectRender(value, rowData) {
      var name = this.projectMap.get(value);
      if (null == name || "" == name) {
        return value;
      } else {
        return name;
      }
    },
    volumeUserRender(value, rowData) {
      var name = this.userMap.get(value);
      if (null == name || "" == name) {
        return value;
      } else {
        return name;
      }
    },
    volumeTypeRender(value, rowData) {
      if ("" == value || null == value) {
        return "-";
      }
      return value;
    },
    statusTagRender(status) {
      if ("-" == status) {
        return "info";
      }
      if ("available" == status || "reserved" == status) {
        return "success";
      } else if ("deleting" == status) {
        return "gray";
      } else if (
        "creating" == status ||
        "attaching" == status ||
        "extending" == status ||
        "data-copying" == status ||
        "detaching" == status
      ) {
        return "info";
      } else if (
        "error" == status ||
        "error_deleting" == status ||
        "error_extending" == status ||
        "ERROR" == status ||
        "UNKNOW" == status
      ) {
        return "danger";
      } else if (
        "in-use" == status ||
        "reverting" == status ||
        "backing-up" == status ||
        "restoring-backup" == status
      ) {
        return "info";
      } else if ("maintenance" == status) {
        return "warning";
      } else if ("downloading" == status || "uploading" == status) {
        return "info";
      } else {
        return "info";
      }
    },
    volumeMoveStatus(value, rowData) {
      if (
        null != rowData["migration_status"] &&
        typeof rowData["migration_status"] != "undefined"
      ) {
        if ("error" == rowData["migration_status"]) {
          return this.$t("storage.migrationFailed");
        } else if ("maintenance" == rowData["migration_status"]) {
          return this.$t("storage.migrationing");
        } else if ("starting" == rowData["migration_status"]) {
          return this.$t("storage.beginMigration");
        } else if ("migrating" == rowData["migration_status"]) {
          return this.$t("storage.migrating");
        } else if ("success" == rowData["migration_status"]) {
          return this.$t("storage.migratesuccess");
        } else if ("deleting" == rowData["migration_status"]) {
          return this.$t("storage.deleting");
        } else if ("completing" == rowData["migration_status"]) {
          return this.$t("storage.completing");
        } else {
          var tempMS = rowData["migration_status"];
          if (tempMS.indexOf("target") >= 0) {
            var tas = rowData["migration_status"].split(":");
            var pre = this.$t("storage.migratetarget");
            return pre + ":" + tas[1];
          }
          return rowData["migration_status"];
        }
      } else {
        return "-";
      }
    },
    volumeStatusRender(value, rowData) {
      if (value != null) {
        let r = value;
        for (let i = 0; i < this.statusList.length; i++) {
          if (this.statusList[i].value == value) {
            r = this.statusList[i].label;
            break;
          }
        }
        return r;
      } else {
        return "-";
      }
    },
    volumeBootableRender(value, rowData) {
      if ("true" == value) {
        return this.$t("storage.yes");
      } else {
        return this.$t("storage.no");
      }
    },
    hrefToSnapshotPage() {
      this.$router.push({
        path: "/calculate-storage/snapshot/volumesolt"
      });
    },
    clearSelOption() {
      var self = this;
      self.$refs.volumeTable.clearSelection();
    },
    hrefTomrriorPage() {
      this.$router.push({
        path: "/calculate-storage/image-list"
      });
    },
    getCurrentData(param) {
      this.totalData = param;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.loadData(this.queryParams);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.loadData(this.queryParams);
    },
    gotoInstanceList() {
      this.$router.push({
        path: '/calculate-storage/instances-list'
      });
    }
  },
  components: {
    CreateInstance,
    NewVolume,
    ExpandVolume,
    EditVolume,
    TransferVolume,
    EditVolumeType,
    AcceptTransfer,
    VolumeMove,
    ManageLink,
    VolumeImage,
    VolumeSnapshot,
    AddVolumeBak,
    RefreshMetadata,
    RefreshStatus,
    VolumeDetail,
    ApplyVolume,
    VolumeTypeChange,
    RevertBySnapshot,
    VolumeSourceInfo,
    VolumeManagment,
    CloneVolume,
    QosVolumeManage
  }
};
</script>
<style scoped>
  .cover-pop{
    overflow-y: auto;
    max-height: 400px;
  }
</style>
