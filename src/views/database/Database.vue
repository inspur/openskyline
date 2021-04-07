<template>
  <div>
    <icos-page-header :title="$t('db.databaseService')" :show-bottom-border="true" />
    <icos-page>
      <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" :advanced-disabled="roleType!='0'"/>
      <div class="divider clearfix" v-if="roleType==2"></div>
      <operation-panel v-if="roleType==2"
        class="margin-tb5"
        :select-rows="multipleSelection"
        :operation-menus="operationMenus">
      </operation-panel>
      <div class="divider clearfix"></div>
      <el-table
        ref="table"
        :data="tableData"
        v-loading="loading"
        :element-loading-text="$t('lang.loading')"
        highlight-current-row
        border
        stripe
        :default-sort = "{prop: 'name', order: 'ascending'}"
        row-key="id"
        @row-click="rowClick"
        @sort-change="sortChange"
        @selection-change="handleSelectionChange">
        <el-table-column
          reserve-selection
          type="selection"
          align="center"
          width="55">
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('name') >= 0"
          prop="name"
          :label="$t('lang.name')"
          show-overflow-tooltip
          sortable="custom"
          min-width="100">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status === 'ACTIVE' && scope.row.datastoreType !== 'redis'" 
              @click="rowNameClick(scope.$index, scope.row)" 
              type="text" size="small">{{scope.row.name}}</el-button>
            <span v-else>{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('tenant_id') >= 0"
          prop="tenant_id"
          :label="$t('lang.project')"
          show-overflow-tooltip
          min-width="100">
          <template slot-scope="scope">
            <span>{{projectNameRender(scope.row.tenant_id)}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('datastoreType') >= 0"
          prop="datastoreType"
          :label="$t('db.databaseType')"
          show-overflow-tooltip
          align="left"
          sortable="custom"
          min-width="100">
         <!--  <template slot-scope="scope">
            <span>{{scope.row.datastore.type}}</span>
          </template> -->
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('datastoreVersion') >= 0"
          prop="datastoreVersion"
          :label="$t('db.databaseVersion')"
          show-overflow-tooltip
          align="left"
          sortable="custom"
          min-width="100">
          <!-- <template slot-scope="scope">
            <span>{{scope.row.datastore.version}}</span>
          </template> -->
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('ip') >= 0"
          prop="ip"
          label="IP"
          show-overflow-tooltip
          align="left"
          min-width="100">
          <template slot-scope="scope">
            <span v-html="datastoreIPRender(scope.row.ip)"></span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('flavor') >= 0"
          prop="flavor"
          :label="$t('db.flavor')"
          show-overflow-tooltip
          min-width="100">
          <template slot-scope="scope">
            <span>{{flavorNameRender(scope.row.flavor.id)}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('diskSize') >= 0"
          prop="diskSize"
          :label="$t('db.diskSizeGB')"
          show-overflow-tooltip
          align="left"
          min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.volume.size}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('status') >= 0"
          prop="status"
          :label="$t('lang.status')"
          show-overflow-tooltip
          align="left"
          sortable="custom"
          min-width="100">
          <template slot-scope="scope">
            <!-- <span>{{statusRender(scope.row.status)}}</span> -->
            <el-tag :type="statusTagRender(scope.row.status)">
              <span>{{statusRender(scope.row.status, scope.row)}}</span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('created') >= 0"
          prop="created"
          :label="$t('lang.createTime')"
          show-overflow-tooltip
          align="left"
          min-width="100">
          <template slot-scope="scope">
            <span>{{dateFormatter(scope.row.created)}}</span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onRefresh">
            </el-button>
            <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
            <el-popover
              placement="right"
              trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
              </div>
            </el-popover>
          </el-col>
          <el-col :span="19">
            <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj" ref="pageComponent"></page>
          </el-col>
        </el-row>
      </div>
    <create-instance ref="createInstance" v-if="createInstanceFlag" @handleAddShow="handleAddShow" @refreshData="getData"></create-instance>
    <modify-instance ref="modifyInstance" v-if="modifyInstanceFlag" @handleAddShow="handleAddShow" @refreshData="getData" :dbInstanceDetail="selectedRowData"></modify-instance>
    <create-database ref="createDatabase" v-if="createDatabaseFlag" @handleAddShow="handleAddShow" @refreshData="getData" :dbInstanceDetail="selectedRowData" :createByService="true"></create-database>
    <modify-volume ref="modifyVolume" v-if="modifyVolumeFlag" @handleAddShow="handleAddShow" @refreshData="getData" :dbInstanceDetail="selectedRowData"></modify-volume>
    </icos-page>
  </div>
</template>
<script>
  import CreateInstance from "./CreateDBInstanceGuide"
  import ModifyInstance from "./ModifyDBInstanceFlavor"
  import CreateDatabase from "./CreateDatabase"
  import ModifyVolume from "./ModifyVolume"
  import moment from "moment"
  export default {
    name: 'DatabaseInstance',
    components: {
      CreateInstance, ModifyInstance, CreateDatabase, ModifyVolume
    },
    data () {
      return {
        close:"",
        searchBar: {
          conditions: {
            name: {
              label: this.$t('lang.name'),
              type: 'input',
              validator: (value) => {
                if (!/^[_0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                  throw new Error(this.$t('validation.onlyLetterNumber_Chinese'));
                }
                if (value.length > 40) {
                  throw new Error(this.$t('heat.fortyCharacterMaximum'));
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
        queryParams: {},
        roleType: Vue.roleType,
        selectedRowData:{},
        selProjectFlg:false,
        createInstanceFlag:false,
        modifyInstanceFlag:false,
        createDatabaseFlag:false,
        modifyVolumeFlag:false,
        projectOptions: [],
        projectMap:{},
        flavorMap:{},
        columns: [],
        columnsChecked:["tenant_id", "name", "datastoreType", "datastoreVersion", "ip", "flavor", "diskSize", "status", "created"],
        tableData: [],
        totalData:[],
        multipleSelection: [],
        sortObj: {
          sortOrder:"descending",
          sortField:"name"
        },
        reloadTblFlag: false,
        reloadTabelInterval:"",
        loading: false,
        operationMenus: [{
          icon: "fa-plus",
          name: this.$t('db.createDatabaseInstance'),
          showflg: true,
          readOnly: true,
          handler: function() {
            this.createInstanceFlag = true;
          }.bind(this)
        }, {
          icon: "fa-plus",
          name: this.$t('db.createDatabase'),
          showflg: true,
          readOnly: false,
          enable(rowData) {
            return rowData.status === "ACTIVE"&&rowData.datastoreType!='redis';
          },
          handler: function(rowDatas) {
            this.selectedRowData = rowDatas[0];
            this.createDatabaseFlag = true;
          }.bind(this)
        }, {
          icon: "fa-edit",
          name: this.$t('db.modifyFlavor'),
          showflg: true,
          readOnly:false,
          enable(rowData) {
            return rowData.status === "ACTIVE";
          },
          handler: function(rowDatas) {
            this.selectedRowData = rowDatas[0];
            this.modifyInstanceFlag = true;
          }.bind(this)
        }, {
          icon: "fa-edit",
          name: this.$t('db.modifyHardDisk'),
          showflg: true,
          readOnly: false,
          enable(rowData) {
            return rowData.status === "ACTIVE";
          },
          handler: function(rowDatas) {
            this.selectedRowData = rowDatas[0];
            this.modifyVolumeFlag = true;
          }.bind(this)
        }, {
          icon: "fa-remove",
          name: this.$t('lang.delete'),
          multi:true,
          showflg: true,
          readOnly: false,
          enable(rowData) {
            return rowData.status !== "BUILD" && rowData.status !== "RESIZE";
          },
          handler: function(selectedRows) {
            let self = this;
            self.$prompt(this.$t('db.deleteDatabaseInstanceConfirmMsg'), this.$t('lang.confirm'), {
              confirmButtonText: this.$t('lang.confirm'),
              cancelButtonText: this.$t('lang.cancel'),
              inputPattern:/^YES$|^NO$/i,
              inputValue: "NO",
              customClass: "promptConfirmDel",
              inputErrorMessage: this.$t('lang.onlyAcceptYesOrNo')
            }).then(async({ value }) => {
              if ("yes" == value.toLowerCase()) {
                self.deleteDatabaseInstance(selectedRows);
              }
            }).catch(() => {
              //取消
            });
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
        handler: function (rows, oldVal) {
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
              if (data['status'] == "BUILD" || data['status'] == "RESIZE" || data['status'] == "SHUTDOWN") {
                self.reloadTblFlag = true;
                break;
              }
            }
          }
          clearInterval(self.reloadTabelInterval);

          if (self.reloadTblFlag && !self._isDestroyed) {
            self.reloadTabelInterval = setInterval(() => {
              this.getData(this.sortObj, false);
            }, 5000);
          }
        }
      }
    },
    mounted() {
      let table = this.$refs.table;
      table.$children.forEach((item, index) => {
        if (item.label && item.prop) {
          this.columns.push({
            prop: item.prop,
            label: item.label
          });
        }
      });
      let self = this;
      Promise.all([self.getProjectList(), self.getFlavorList()]).then(function(result) {
          self.getData();
      });
    },
    methods: {
      dateFormatter(date) {
        if (date) {
          let dateJson = new Date(date).toJSON();
          let newDate = moment(+new Date(dateJson) + 8*3600*1000).format("YYYY-MM-DD HH:mm:ss");
          return newDate;
        } else {
          return "";
        }
      },
      async getData(param, isClear = true) {
        let self = this;
        try {
          if (isClear) {
            // 是否清空选中
            self.$nextTick(() => {
              self.$refs.table.clearSelection();
            });
          }

          let projectId = this.$cookie.get("pid");
          let reqUrl = "api/trove/v1.0/" + projectId + "/all/instances";
          if (self.roleType == "0") {
            reqUrl = "api/trove/v1.0/" + projectId + "/all/instances";
          } else {
            reqUrl = "api/trove/v1.0/" + projectId + "/instances";
          }
          let ret = await this.$ajax({
            type: 'get',
            url: reqUrl
          });

          //超级管理员查询所有项目云主机
          let vmDic = {};
          if (self.roleType == "0") {
            self.loading = true;
            let vmUrl = "api/nova/v2.1/servers/detail?all_tenants=1";
            let vms = await this.$ajax({
              type: 'get',
              url: vmUrl
            });
            let vmServers = vms.servers;
            for (let i = 0; i < vmServers.length; i++) {
              let ips = [];
              let vmAddress = vmServers[i].addresses;
              let vmTempId = vmServers[i].id;
              for (let k in vmAddress) {
                for (let s = 0; s < vmAddress[k].length; s++) {
                  ips.push(vmAddress[k][s].addr);
                }
              }
              vmDic[vmTempId] = ips;
            }
          }

          self.loading = false;
          let dataList = ret.instances;
          let tableDataList = [];
          dataList.forEach(data => {
            data.datastoreType = data.datastore.type;
            data.datastoreVersion = data.datastore.version;
            if (self.roleType == "0") {
              data.ip = vmDic[data.compute_instance_id];
            }
            tableDataList.push(data);
          });
          self.totalData = self.filterList(tableDataList);
        } catch (data) {
          self.loading = false;
        }
      },
      filterList(allData) {
        let self = this;
        let nameFilteredData = [];
        if (self.queryParams.name) {
          allData.forEach(function(obj) {
            if (obj.name.indexOf(self.queryParams.name) > -1) {
              nameFilteredData.push(obj);
            }
          });
        } else {
          nameFilteredData = allData;
        }
        // 项目过滤
        let projectFilteredData = [];
        if (self.queryParams.projectName) {
          nameFilteredData.forEach(function(obj) {
            if (obj.tenant_id === self.queryParams.projectName) {
              projectFilteredData.push(obj);
            }
          });
        } else {
          projectFilteredData = nameFilteredData;
        }
        return projectFilteredData;
      },
      handleSearch(params) {
        this.queryParams = params;
        this.getData();
      },
      async getProjectList() {
        let self = this;
        try {
          let url = 'api/keystone/v3/users/' + Vue.userId + '/projects?domain_id=default';
          if (self.roleType == '0') {
            url = 'api/keystone/v3/projects?domain_id=default';
          }
          let result = await self.$ajax({
            type: "GET",
            url: url
          });
          let projectList = result["projects"];
          self.projectOptions = projectList;
          projectList.forEach(function(project, index) {
            self.projectMap[project.id] = project.name;
          });
          self.searchBar.conditions.projectName.options = result["projects"].map(item => {
            return {
              label: item.name,
              value: item.id
            };
          });
        } catch (res) {
          console.log("获取项目列表失败");
        }
      },
      // 获取实例规格
      async getFlavorList() {
        let self = this;
        try {
          let publicFlavor = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/flavors/detail?is_public=true"
          });
          let privateFlavor = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/flavors/detail?is_public=false"
          });
          let dataList = [];
          let idList = [];
          publicFlavor.flavors.forEach(function(obj, index) {
            dataList.push(obj);
            idList.push(obj['id']);
          });
          privateFlavor.flavors.forEach(function(obj, index) {
            if (idList.indexOf(obj['id']) == -1) {
              dataList.push(obj);
            }
          });
          // 遍历数据，转换为{id:name}对象
          for (let i = 0; i < dataList.length; i++) {
            let data = dataList[i];
            let detail = data.name + ' (' + data.vcpus + this.$t('db.cores') + ', ' +
                        (data.ram / 1024) + 'GB ' + this.$t('db.memory') + ', ' + data.disk + 'GB ' + this.$t('db.hardDisk') + ')';
            self.flavorMap[data.id] = detail;
          }
        } catch (data) {
        }
      },
      async deleteDatabaseInstance(selectedDatas) {
        try {
          await this.$sequence({
            type: 'DELETE',
            url: "api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/{id}",
            params: selectedDatas,
            paramKeys: ["id"],
            successMsg: this.$t('db.deleteRequestSuccessMsg'),
            log:{
              description:{
                en:"Delete database instance:{name}",
                zh_cn:"删除数据库服务实例:{name}"
              },
              target:Vue.logTarget.databaseService
            },
            successFun: () => {
              this.getData();
            },
            errFun: () => {
              this.getData();
            }
          });
        } catch (data) {
          console.log('删除失败');
        }
      },
      projectNameRender(value) {
        if (this.projectMap[value]) {
          return this.projectMap[value];
        } else {
          return value;
        }
      },
      flavorNameRender(id) {
        if (this.flavorMap[id]) {
          return this.flavorMap[id];
        } else {
          return "-";
        }
      },
      statusRender(value) {
        // BUILD ERROR ACTIVE
        if (value === "BUILD") {
          return this.$t('db.creating');
        } else if (value === "ERROR" || value === "FAILED") {
          return this.$t('db.error');
        } else if (value === "ACTIVE") {
          return this.$t('db.active');
        } else if (value === "SHUTDOWN") {
          return this.$t('db.shutdown');
        } else if (value === "RESIZE") {
          return this.$t('db.resize');
        } else {
          return "-";
        }
      },
      statusTagRender(value) {
        if (value === "BUILD" || value === "RESIZE") {
          return "info";
        } else if (value === "ERROR" || value === "FAILED") {
          return "danger";
        } else if (value === "ACTIVE") {
          return "success";
        } else if (value === "SHUTDOWN") {
          return "gray";
        } else {
          return "info";
        }
      },
      userHostRender(value) {
        if (value && value.indexOf('%') > -1) {
          value = value.replace("%", "*");
        }
        return value;
      },
      datastoreIPRender(value) {
        let iplist = "";
        if (value) {
          value.forEach((obj, index) => {
            iplist += obj + "<br/>";
          });
        }
        // 如果ip是空则先是-符号
        if (iplist == "") {
          iplist = "-";
        }
        return iplist;
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
        if (!column.prop) { return; }
        self.sortObj = {
          sortOrder:column.order,
          sortField:column.prop
        };
      },
      rowClick(row) {
        this.$refs.table.toggleRowSelection(row);
      },
      //刷新
      onRefresh() {
        this.getData(this.sortObj);
      },
      rowNameClick(rowIndex, rowData) {
        this.$router.push({
          path: '/databaseService/databaseInstance/databaseInstanceDetail/' + rowData.id + '/databaseList'
        });
      },
      handleAddShow() {
        this.createInstanceFlag = false;
        this.createDatabaseFlag = false;
        this.modifyInstanceFlag = false;
        this.modifyVolumeFlag = false;
      }
    }
  };
</script>
<style scoped>

</style>
