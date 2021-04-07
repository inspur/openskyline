<template>
  <div>
    <icos-page-header :title="$t('container.kubernetesCluster')" />
    <icos-page>
      <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" :advanced-disabled="roleType!='0'"/>
      <div class="divider clearfix" v-if="roleType!='0'"></div>
      <!-- <el-button icon="fa-desktop" style="color:#2196F3" class="el-button el-button--small" @click="containerConsolePage()"></el-button> -->
      <operation-panel class="margin-tb5" v-if="roleType!='0'" :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
      <div class="divider clearfix"></div>
      <el-table ref="table" 
        :data="tableData" 
        v-loading="loading" 
        :element-loading-text="$t('lang.loading')"
        highlight-current-row stripe
        row-key="uuid" @row-click="rowClick"
        :default-sort="{prop: 'created_at', order: 'descending'}" 
        @sort-change="sortChange"
        @selection-change="handleSelectionChange">
        <el-table-column reserve-selection type="selection" align="center" width="55" v-if="roleType!='0'">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('console') >= 0" prop="console" :label="$t('calcStorLang.console')" min-width="55" align="center">
          <template slot-scope="scope">
            <el-button icon="fa-desktop" v-if="(scope.row.status === 'active')" style="color:#2196F3" class="el-button el-button--small" @click="ContainerConsoleView(scope.row)"></el-button>
            <el-button icon="fa-desktop" v-if="(scope.row.status !== 'active')" class="el-button el-button--small"></el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('container.clusterName')" show-overflow-tooltip sortable="custom" min-width="150" align="left">
          <template slot-scope="scope">
            <el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('uuid') >= 0" prop="uuid" label="ID" show-overflow-tooltip align="left" min-width="150">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('project_name') >= 0" prop="project_name" :label="$t('lang.project')" show-overflow-tooltip min-width="100" align="left">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" :label="$t('lang.status')" show-overflow-tooltip sortable="custom" min-width="100" align="left">
          <template slot-scope="scope">
            <el-tag :type="statusTagRender(scope.row.status)">
              <span v-html="statusRender(scope.row.status)"></span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('master_count') >= 0" prop="master_count" :label="$t('container.masterNodeCount')" align="left" min-width="50">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('worker_count') >= 0" prop="worker_count" :label="$t('container.nodeCount')" align="left" min-width="50">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('keypair_id') >= 0" prop="keypair_id" :label="$t('container.keypair')" min-width="50" align="left">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('created_at') >= 0" prop="created_at" :label="$t('storage.createdTime')" min-width="100" sortable align="left">
          <template slot-scope="scope">
            <span v-html="dateRender(scope.row.created_at, scope.row)"></span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onRefresh">
            </el-button>
            <span  v-if="roleType!='0'">{{$t('lang.currentSelected')}} {{multipleSelection.length}} {{$tc('lang.item', multipleSelection.length)}}</span>
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
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
        </el-row>
      </div>
      <create-cluster ref="CreateTemplate" v-if="createTemplateFlag" @handleAddShow="handleAddShow" @refreshData="loadData"></create-cluster>
      <add-work-node ref="addNode" v-if="addNodeFlag" :clusterInfo="clusterInfo" @refreshData="loadData"  @cancelAddNode="cancelAddNode"></add-work-node>
      <remove-work-node ref="removeNode" v-if="removeNodeFlag" :clusterInfo="clusterInfo" @refreshData="loadData"  @cancelAddNode="cancelAddNode"></remove-work-node>
      <container-console v-if="consoleFlag" ref='console' @cancelAddNode="cancelAddNode" :clusterInfo="clusterInfo"></container-console>
      <confirm-dialog ref="confirmdialog" v-if="confirmFlag" @handleAddShow="handleAddShow" @refreshData="loadData" :selectedRows="multipleSelection"></confirm-dialog>
    </icos-page>
  </div>
</template>
<script>
import CreateCluster from "./CreateContainerClusterGuide"
import ContainerClusterDetail from "./ContainerClusterDetail"
import AddWorkNode from "./AddWorkNode"
import RemoveWorkNode from "./RemoveWorkNode"
import ContainerConsole from "./console/ContainerConsole"
import ConfirmDialog from "./ConfirmDialog"
export default {
  name: 'ContainerCluster',
  components: {
    CreateCluster,
    ContainerClusterDetail,
    AddWorkNode,
    RemoveWorkNode,
    ContainerConsole,
    ConfirmDialog
  },
  data() {
    return {
      terminal: {
        cols: 400,
        rows: 400,
        pid: 1,
        name: "terminal"
      },
      roleType: Vue.roleType,
      allProjectsName: {},
      allImagesMap: null,
      detailRowDataId: "",
      createTemplateFlag: false,
      modifyTemplateFlag: false,
      reloadTblFlag: false,
      detailFlag: false,
      addNodeFlag: false,
      removeNodeFlag: false,
      iframgFlg: true,
      consoleFlag: false,
      confirmFlag: false,
      clusterInfo:{},
      total: 0,
      statusTag: '',
      statusCh: '',
      projectName: '',
      columns: [],
      columnsChecked: ["name", "uuid", "project_name", "status", "keypair_id", "master_count", "worker_count", "created_at", "console"],
      tableData: [],
      totalData: [],
      multipleSelection: [],
      expands:[],
      sortObj: {
        sortOrder: "desc",
        sortField: "created_at"
      },
      searchBar: {
        conditions: {
          name: {
            label: this.$t('container.clusterName'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          },
          projectName: {
            label: this.$t('lang.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          }
        }
      },
      searchBarValidatedParams: {},
      loading: false,
      operationMenus: [{
        icon: "fa-plus",
        name: this.$t('container.create'),
        showflg: true,
        readOnly: true,
        handler: function() {
          this.createTemplateFlag = true;
          this.detailFlag = false;
        }.bind(this)
      }, {
        icon: "fa-remove",
        name: this.$t('lang.delete'),
        showflg: true,
        readOnly: false,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          this.detailFlag = false;
          this.confirmFlag = true;
        }.bind(this)
      // }, {
      //   icon: "fa-remove",
      //   name: this.$t('lang.delete'),
      //   showflg: true,
      //   readOnly: false,
      //   multi: true,
      //   enable(rowData) {
      //     return true;
      //   },
      //   handler: function(selectedRows) {
      //     this.detailFlag = false;
      //     this.$prompt(Vue.t('lang.ifDeleteData'), Vue.t('lang.confirm'), {
      //       confirmButtonText: Vue.t('lang.confirm'),
      //       cancelButtonText: Vue.t('lang.cancel'),
      //       inputPattern:/^YES$|^NO$/i,
      //       inputValue: "NO",
      //       customClass: "promptConfirmDel",
      //       inputErrorMessage:Vue.t('lang.onlyAcceptYesOrNo'),
      //       closeOnClickModal: false
      //     }).then(async({ value }) => {
      //       if ("yes" == value.toLowerCase()) {
      //         let me = this;
      //         me.$sequence({
      //           type: 'delete',
      //           url: 'api/cetus/v1/cluster/{uuid}',
      //           params: selectedRows,
      //           log:{
      //             description:{
      //               en:"Delete Kubernetes cluster:{name}",
      //               zh_cn:"删除Kubernetes集群:{name}"
      //             },
      //             target:Vue.logTarget.containerCluster
      //           },
      //           successFun: function() {
      //             me.$message.success(me.$t('container.deleteRequest'));
      //             setTimeout(() => { me.getData(true); }, 8000);
      //           },
      //           errCluTmpFun: function() {

      //           },
      //           error: function() {
      //             me.loadData();
      //           }
      //         })
      //       }
      //     }).catch(() => {});
      //   }.bind(this)
      }, {
        icon: "fa-plus",
        name: this.$t('container.addNode'),
        showflg: Vue.roleType != "0",
        readOnly: false,
        multi: false,
        enable: function(rowData) {
          if (rowData["status"] == "active" || rowData["status"] === "CREATE_COMPLETE" || rowData["status"] === "INIT_COMPLETE" ||
              rowData["status"] === "RESUME_COMPLETE" || rowData["status"] === "ROLLBACK_COMPLETE" ||
              rowData["status"] == "UPDATE_COMPLETE" || rowData["status"] == "ROLLBACK_FAILED" || rowData["status"] == "UPDATE_FAILED") {
            return true;
          } else {
            return false;
          }
        },
        handler: function(selectedRows) {
          this.clusterInfo = selectedRows[0];
          this.addNodeFlag = true;
          this.detailFlag = false;
        }.bind(this)
      }, {
        icon: "fa-minus",
        name: this.$t('container.removeNode'),
        showflg: Vue.roleType != "0",
        readOnly: false,
        multi: false,
        enable: function(rowData) {
          if (rowData["status"] == "active" || rowData["status"] === "CREATE_COMPLETE" || rowData["status"] === "INIT_COMPLETE" ||
              rowData["status"] === "RESUME_COMPLETE" || rowData["status"] === "ROLLBACK_COMPLETE" ||
              rowData["status"] == "UPDATE_COMPLETE" || rowData["status"] == "ROLLBACK_FAILED" || rowData["status"] == "UPDATE_FAILED") {
              if (rowData["worker_count"] <= 1) {
                return false;
              } else {
                return true;
              }
          } else {
            return false;
          }
        },
        handler: function(selectedRows) {
          this.clusterInfo = selectedRows[0];
          this.removeNodeFlag = true;
          this.detailFlag = false;
        }.bind(this)
      }]
    };
  },
  beforeDestroy() {
    if (this.reloadTabelInterval != null) {
      clearInterval(this.reloadTabelInterval);
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
      handler: function(dataList) {
        let self = this;
        self.reloadTblFlag = false;
        if (dataList != null) {
          for (let t = 0; t < dataList.length; t++) {
            let data = dataList[t];
            if (data['status'] === "CREATE_IN_PROGRESS" || data['status'] === "DELETE_IN_PROGRESS" ||
                data['status'] === "RESUME_IN_PROGRESS" || data['status'] === "ROLLBACK_IN_PROGRESS" ||
                data['status'] === "SUSPEND_IN_PROGRESS" || data['status'] == "UPDATE_IN_PROGRESS" ||
                data['status'] == "provisioning" || data['status'] == "removing" || data['status'] == "updating") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.reloadTabelInterval);

        if (self.reloadTblFlag && !self._isDestroyed) {
          self.reloadTabelInterval = setInterval(() => {
            this.getData(false, true);
          }, 8000);
        }
      }
    }
  },
  mounted() {
    let self = this;
    let table = this.$refs.table;
    table.$children.forEach((item, index) => {
      if (item.label && item.prop) {
        this.columns.push({
          prop: item.prop,
          label: item.label
        });
      }
    });
    this.loadData();
  },
  methods: {
    loadData() {
      let self = this;
      Promise.all([self.gerProjecrList()]).then(function(result) {
        self.getData(true, true);
      });
      setTimeout(() => {
        self.getData(false, true);
      }, 3000)
    },
    handleSearch(params) {
      this.searchBarValidatedParams = params;
      this.getData();
    },
    async getData(isClear = true, isInterval = false) {
      let self = this;
      if (!isInterval) {
        self.loading = true;
      }
      let param = {};
      if (Vue.roleType + ""!= "0") {
        param["project_id"] = this.$cookie.get('pid');
      }
      let data = Object.assign(param);
      try {
        let ajaxParam = {
          type: 'POST',
          url: "api/cetus/v1/cluster/index",
          data: JSON.stringify(data)
        };
        let ret = await this.$ajax(ajaxParam);
        self.loading = false;
        let dataList = ret.result;
        dataList.forEach(function(obj, index) {
          obj["project_name"] = self.allProjectsName.get(obj.project_id);
        });
        self.totalData = this.filterFun(dataList);
        self.total = ret.total_count;
      } catch (data) {
        self.loading = false;
      }
      if (isClear) {
        self.$refs.table.clearSelection();
      }
    },
    filterFun(allData) {
      let self = this;
      let nameFilteredData = [];
      if (self.searchBarValidatedParams.name == undefined || self.searchBarValidatedParams.name == "") {
        nameFilteredData = allData;
      } else {
        allData.forEach(function(obj) {
          if (obj.name.indexOf(self.searchBarValidatedParams.name) > -1) {
            nameFilteredData.push(obj);
          }
        });
      }
      let projectFilteredData = [];
      if (self.searchBarValidatedParams.projectName== undefined || self.searchBarValidatedParams.projectName == "") {
        projectFilteredData = nameFilteredData;
      } else {
        nameFilteredData.forEach(function(obj) {
          if (obj.project_id == self.searchBarValidatedParams.projectName) {
            projectFilteredData.push(obj);
          }
        });
      }
      return projectFilteredData;
    },
    async gerProjecrList() {
      let self = this;
      try {
        let url = `api/keystone/v3/projects?domain_id=default`;
        if (Vue.roleType != '0') {
          url = 'api/keystone/v3/users/' + Vue.userId + '/projects?domain_id=default';
        }
        let projectRet = await self.$ajax({
          url: url,
          type: 'get',
          showErrMsg: false
        });
        let allProjects = projectRet["projects"];
        self.allProjectsName = new Map();
        for (let i = 0; i<allProjects.length; i++) {
          let temp = allProjects[i];
          self.allProjectsName.set(temp['id'], temp['name']);
        }
        self.searchBar.conditions.projectName.options = projectRet.projects.map(item => {
          return {
            label: item.name,
            value: item.id
          };
        });
      } catch (e) {
        self.allProjects = [];
        self.allProjectsName = {};
      }
    },
    async getImageList() {
      let self = this;
      self.allImagesMap = {};
      let imageRet = await this.$ajax({
        url: 'api/glance/v2/images?limit=99999',
        type: 'get'
      });
      let imagesList = imageRet.images;
      imagesList.forEach(function(obj, index) {
        self.allImagesMap[obj['id']] = obj['name'];
      });
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    //多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    //排序
    sortChange(column) {
      let self = this;
      let key = column.prop;
      let keyOrder = column.order;
      self.sortObj = {
        sortOrder: keyOrder,
        sortField: column.prop
      };
      if (keyOrder != null && self.totalData != null) {
        self.totalData.sort(self.$sortFormatter(key, keyOrder));
      }
    },
    rowClick(row) {
      this.$refs.table.toggleRowSelection(row);
    },
    //刷新
    onRefresh() {
      this.getData(false, true);
    },
    orderAdapt(order) {
      if ('descending' === order) {
        return 'desc';
      } else if ('ascending' === order) {
        return 'asc';
      }
    },
    rowNameClick(rowIndex, rowData) {
      this.detailRowDataId = rowData.uuid;
      let rancherclusterid = rowData["rancher_cluster_id"];
      this.$router.push({
        path:"/container/kbcontainerCluster/" + this.detailRowDataId + "/"+rancherclusterid+"/"+rowData["project_id"]+"/"+rowData["project_name"]+"/clusterDetail"
      });
    },
    handleAddShow() {
      this.createTemplateFlag = false;
      this.modifyTemplateFlag = false;
      this.confirmFlag = false;
    },
    cancelAddNode() {
      this.addNodeFlag=false;
      this.removeNodeFlag = false;
      this.consoleFlag = false;
    },
    onDetailPanelBack() {
      this.detailFlag = false;
    },
    statusRender(value) {
      if (value=="CREATE_IN_PROGRESS") {
        return this.$t('container.CREATE_IN_PROGRESS')
      } else if (value=="CREATE_FAILED") {
        return this.$t('container.CREATE_FAILED')
      } else if (value=="CREATE_COMPLETE") {
        return this.$t('container.CREATE_COMPLETE')
      } else if (value=="DELETE_IN_PROGRESS") {
        return this.$t('container.DELETE_IN_PROGRESS')
      } else if (value=="DELETE_COMPLETE") {
        return this.$t('container.DELETE_COMPLETE')
      } else if (value=="DELETE_FAILED") {
        return this.$t('container.DELETE_FAILED')
      } else if (value=="SUSPEND_IN_PROGRESS") {
        return this.$t('container.SUSPEND_IN_PROGRESS')
      } else if (value=="SUSPEND_COMPLETE") {
        return this.$t('container.SUSPEND_COMPLETE')
      } else if (value=="SUSPEND_FAILED") {
        return this.$t('container.SUSPEND_FAILED')
      } else if (value=="RESUME_IN_PROGRESS") {
        return this.$t('container.RESUME_IN_PROGRESS')
      } else if (value=="RESUME_COMPLETE") {
        return this.$t('container.RESUME_COMPLETE')
      } else if (value=="RESUME_FAILED") {
        return this.$t('container.RESUME_FAILED')
      } else if (value=="ROLLBACK_IN_PROGRESS") {
        return this.$t('container.ROLLBACK_IN_PROGRESS')
      } else if (value=="ROLLBACK_COMPLETE") {
        return this.$t('container.ROLLBACK_COMPLETE')
      } else if (value=="ROLLBACK_FAILED") {
        return this.$t('container.ROLLBACK_FAILED')
      } else if (value=="UPDATE_IN_PROGRESS") {
        return this.$t('container.UPDATE_IN_PROGRESS')
      } else if (value=="UPDATE_COMPLETE") {
        return this.$t('container.UPDATE_COMPLETE')
      } else if (value=="UPDATE_FAILED") {
        return this.$t('container.UPDATE_FAILED')
      } else if (value=="unavailable") {
        return this.$t('container.unavailable')
      } else if (value=="provisioning") {
        return this.$t('container.provisioning')
      } else if (value=="active") {
        return this.$t('container.active')
      } else if (value=="removing") {
        return this.$t('container.removing')
      } else if (value=="waiting") {
        return this.$t('container.provisioning')
      } else if (value=="updating") {
        return this.$t('container.UPDATE_IN_PROGRESS')
      } else {
        return value
      }
    },
    statusTagRender(value) {
      let tagType = "";
      if (value === "CREATE_COMPLETE" || value === "INIT_COMPLETE" ||
        value === "RESUME_COMPLETE" || value === "ROLLBACK_COMPLETE" || value === "SUSPEND_COMPLETE" ||
        value == "UPDATE_COMPLETE" || value == "active") {
        tagType = "success";
      } else if (value === "CREATE_IN_PROGRESS" || value === "DELETE_IN_PROGRESS" ||
        value === "RESUME_IN_PROGRESS" || value === "ROLLBACK_IN_PROGRESS" || value === "SUSPEND_IN_PROGRESS" ||
        value == "UPDATE_IN_PROGRESS" || value == "provisioning" || value == "removing" || value == "updating" || value == "waiting") {
        tagType = "info"; /*tag类型由primary统一改为了info*/
      } else if (value === "CREATE_FAILED" || value === "DELETE_FAILED" ||
        value === "RESUME_FAILED" || value === "ROLLBACK_FAILED" ||
        value === "SUSPEND_FAILED" || value == "UPDATE_FAILED") {
        tagType = "danger";
      } else if (value === "unavailable") {
        tagType = "gray" /*增加了unavailable的状态*/
      }
      return tagType;
    },
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
    ContainerConsoleView(row) {
      this.clusterInfo = row;
      this.consoleFlag = true;
    }
  }
};

</script>
<style scoped>
</style>
