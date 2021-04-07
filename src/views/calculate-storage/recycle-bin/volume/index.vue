<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" @condition-value-changed="handleConditionValueChanged" />
    <div class="divider clearfix"></div>
    <div class="operation-panel">
      <operation-panel-new ref="operationOperate" :select-rows="multipleSelection" :operation-menus="operationMenus" :operateMore="false" style="display:inline;">
      </operation-panel-new>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="volumeTable" :data="totalData" v-loading="loading" highlight-current-row border stripe style="width: 100%;" slot="empty" :default-sort="{prop: 'deleted_at', order: 'descending'}" row-key="id" @selection-change="handleSelectionChange" @sort-change="sortChange">
      <el-table-column
        reserve-selection
        type="selection"
        align="center"
        width="55"
        :selectable="function(row, index) { return !['deleting'].includes(row['status']) }">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" sortable="custom" min-width="100">
        <template slot-scope="scope">
          <!-- <el-button @click="vmDetail(scope.row)" type="text" size="small"> -->
          <span>{{scope.row.name == null || scope.row.name == "" ? scope.row.id : scope.row.name}}</span>
          <!-- </el-button> -->
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
      <el-table-column v-if="columnsChecked.indexOf('availability_zone') >= 0" prop="availability_zone" sortable="custom" align="left" :label="$t('storage.region')" min-width="60">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('deleted_at') >= 0" prop="deleted_at" :label="$t('calcStorLang.RECYCLE_BIN_ESTIMATED_DELETE_TIME')" sortable="custom" min-width="90" align="left">
        <template slot-scope="scope">
          <span>{{estimatedDeleteTimeRender(scope.row)}}</span>
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
          <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
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
      <transition name="slide-right" mode="out-in">
        <div style="width: 800px;" class="slide-panel" v-if="showDetailFlag">
          <panel style="height: 100%">
            <div slot="title" class="clearfix">
              <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
            </div>
            <div>
              <volume-detail ref="detail" :detailVolume="detailVolume" :userName="detailUserName" :vmpName="detailProjectName" :deviceUN="detailDeviceName"></volume-detail>
            </div>
          </panel>
        </div>
        <div style="width: 800px;" class="slide-panel" v-if="showSourceInfoFlag">
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
import VolumeDetail from "../../volume/VolumeDetail";
import VolumeSourceInfo from "../../volume/VolumeSourceInfo";
import OperationMenu from "./OperationMenu";
import moment from 'moment';
export default {
  name: "VolumeList",
  components: {
    VolumeDetail,
    VolumeSourceInfo
  },
  data() {
    return {
      sortObj: {
        sortOrder: "desc",
        sortField: "deleted_at"
      },
      queryParams: {},
      projectlist: [],
      projectMap: new Map(),
      userList: [],
      userMap: new Map(),
      snapshotMap: new Map(),
      volumeTypeList: [],
      volumeType: "",
      volume_id: "",
      volumeProject: "",
      projectName: "",
      projectOwner: "",
      volumeUser: "",
      volume_name: "",
      sourceInfo: {},
      showSourceInfoFlag: false,
      showDetailFlag: false,
      multipleSelection: [],
      volumeMaps: new Map(),
      detailVolume: "",
      detailProjectName: "",
      detailUserName: "",
      detailDeviceName: "-",
      operateMore: true,
      totalData: [],
      operationMenus: OperationMenu.bind(this)(),
      loading: false,
      columnsChecked: [
        "name",
        "size",
        "volume_project",
        "volume_owner",
        "volume_type",
        "source",
        "bootable",
        "multiattach",
        "deleted_at",
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
          prop: "volume_owner",
          label: this.$t("storage.owner")
        },
        {
          prop: "volume_type",
          label: this.$t("lang.type")
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
          prop: "availability_zone",
          label: this.$t("storage.region")
        },
        {
          prop: "deleted_at",
          label: Vue.t("calcStorLang.RECYCLE_BIN_ESTIMATED_DELETE_TIME")
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
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          },
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
          volume_type_id: {
            label: this.$t('lang.type'),
            type: 'select',
            options: []
          }
        },
        validatedParams: {}
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
        self.reloadTblFlag = true;
        clearInterval(self.interVmValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interVmValid = setInterval(() => {
            this.loadData(this.queryParams);
          }, 5000);
        }
      }
    }
  },
  mounted() {
    var self = this;
    self.loading = true;
    if (self.isUser() && self.columns) {
      let obj = {
        prop: "source",
        label: this.$t("storage.origin")
      };
      self.columns.splice(5, 0, obj);
    }
    if (self.isAdmin() && self.columns) {
      let obj = {
        prop: "volume_project",
        label: this.$t("lang.project")
      };
      self.columns.splice(3, 0, obj);
    }
    Promise.all([
      self.handleSearch(),
      self.loadProjectList(),
      self.loadUserList(),
      self.loadVolumeType(),
      self.loadSoltData()
    ]).then(function (result) {
      self.loadData(self.queryParams);
      self.loading = false;
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
    handleSearch(params) {
      const self = this;
      self.queryParams = params;
      self.currentPage = 1;
      self.$refs.volumeTable.clearSelection();
      self.loadData(self.queryParams);
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
      this.showSourceInfoFlag = false;
      this.showDetailFlag = false;
      this.sourceInfo = info;
      if (info.canOpen) {
        if (info.type === "Image" || info.type === "InstanceSolt") {
          let existed = await self.loadImageDetail(info.sourceInfo.image_id);
          if (!existed) {
            this.$message.error("该来源已被删除");
            return false;
          } else {
             this.sourceInfo.sourceInfo = {"image_id" : existed.id, "image_name" : existed.name, ...existed};
          }
        }
        this.showSourceInfoFlag = true;
        this.$nextTick(() => {
          this.$refs.volumeSourceInfo.show();
        });
      } else {
        if (info.type != "new") {
          this.$message.error("该来源已被删除");
        }
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
      data['soft_deleted'] = "True";
      var url =
        "api/cinderv3/v3/" + projectId + "/inspur-volumes/detail?metadata={'store_image_data':'False'}&" + $.param(data);
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: false,
          headers: {
            "OpenStack-API-Version": "volume 3.45"
          }
        });
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
            if (sourceInfo["image_type"] && sourceInfo["image_type"] === "snapshot") {
              source.type = "InstanceSolt";
              source.name =`云主机快照(${sourceInfo["image_id"]})`;
            } else {
              source.type = "Image";
              source.name = `镜像(${sourceInfo["image_id"]})`;
            }
          }
          if (item["backup_id"]) {
            source.type = "VolumeBackup";
            source.sourceInfo = item["backup"];
            source.name = `云硬盘备份(${item["backup_id"]})`;
            source.canOpen = false;
            if (item["backup"]) {
              source.canOpen = true;
            }
          }
          if (item["source_volid"]) {
            source.type = "Volume";
            source.sourceInfo = item["volume"];
            source.name = `云硬盘(${item["source_volid"]})`;
            source.canOpen = false;
            if (item["volume"]) {
              source.canOpen = true;
            }
          }
          if (item["snapshot_id"]) {
            source.type = "VolumeSnapSolt";
            source.sourceInfo = item["snapshot"];
            source.name = `云硬盘快照(${item["snapshot_id"]})`;
            source.canOpen = false;
            if (item["snapshot"]) {
              source.canOpen = true;
            }
          }
          item.source = source;
        });
        self.totalData = resultData;
        self.total = result["count"];
        var vEntity = "";
        for (let v = 0; v < resultData.length; v++) {
          vEntity = resultData[v];
          self.volumeMaps.set(vEntity.id, vEntity);
        }
      } catch (res) {
        self.loading = false;
      }
    },
    async loadProjectList() {
      //查询所有的项目列表
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/keystone/v3/projects?domain_id=default";
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: false
        });
        let projects = result["projects"];
        let projectlist = [];
        for (var q = 0; q < projects.length; q++) {
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
        url = "api/keystone/v3/inspur/users?project_id=" + self.$cookie.get("pid");
      } else {
        url = "api/keystone/v3/inspur/users?domain_id=default";
        if (projectId) {
          url = "api/keystone/v3/inspur/users?domain_id=default&project_id=" + projectId;
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
    async loadSoltData() {
      var Pid = this.$cookie.get("pid");
      var self = this;
      let data = [];
      //判断是否为超级管理员
      var roleType = Vue.roleType + "";
      var url = "api/cinderv3/v3/" + Pid + "/snapshots?all_tenants=True";
      if ("2" == roleType || "3" == roleType) {
        //超级
        url = "api/cinderv3/v3/" + Pid + "/snapshots";
      }
      try {
        let result = await self.$ajax({
          type: "get",
          url: url
        });

        let snapshotsQuery = result["snapshots"];
        for (var i = snapshotsQuery.length - 1; i >= 0; i--) {
          self.snapshotMap.set(
            snapshotsQuery[i].volume_id,
            snapshotsQuery[i].id
          );
        }
      } catch (res) {
        self.loading = false;
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.loadData(this.queryParams);
      this.clearSelOption();
    },
    vmDetail(row) {
      this.detailVolume = row;
      this.detailProjectName = this.volumeProjectRender(
        row["os-vol-tenant-attr:tenant_id"],
        row
      );
      this.detailUserName = this.volumeUserRender(row.user_id, row);
      this.showDetailFlag = true;
      this.showSourceInfoFlag = false;
      this.$nextTick(() => {
        this.$refs.detail.show();
      });
      // this.$refs.umTable.clearSelection();
    },
    onBack() {
      this.showDetailFlag = false;
      this.showSourceInfoFlag = false;
    },
    volumeProjectRender(value, rowData) {
      var name = this.projectMap.get(value);
      if (null == name || "" == name) {
        return value;
      } else {
        return name;
      }
    },
    estimatedDeleteTimeRender(row) {
      const m = moment.utc(row.deleted_at);
      m.local();
      m.add(row.reclaim_interval, 's');
      return m.format('YYYY-MM-DD HH:mm:ss');
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
    volumeBootableRender(value, rowData) {
      if ("true" == value) {
        return this.$t("storage.yes");
      } else {
        return this.$t("storage.no");
      }
    },
    handleConditionValueChanged({key, value}) {
      if (key === 'project_id') {
        this.loadUserList(value);
      }
    },
    clearSelOption() {
      var self = this;
      self.$refs.volumeTable.clearSelection();
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
    }
  }
};
</script>
<style scoped>

</style>