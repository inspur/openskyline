<template>
  <div>
    <!-- <icos-page-header :title="$t('base.cluster')" /> -->
  <icos-page>
    <!-- <el-form :inline="true" class="form-inline" v-if="roleType=='0'">
      <el-form-item :label="$t('lang.project')">
        <el-select v-model="projectId">
          <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form> -->
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" :advanced-disabled="true"/>
    <div class="divider clearfix" v-if="roleType!='0'"></div>
    <operation-panel class="margin-tb5" v-if="roleType!='0'" :select-rows="multipleSelection" :operation-menus="operationMenus">
    </operation-panel>
    <div class="divider clearfix"></div>
    <el-table ref="table" 
      :data="tableData" 
      v-loading="loading" 
      :element-loading-text="$t('lang.loading')"
      highlight-current-row stripe
      row-key="id" @row-click="rowClick"
      :default-sort="{prop: 'created_at', order: 'descending'}" 
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column reserve-selection type="selection" align="center" width="55" v-if="roleType!='0'">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('container.clusterName')" show-overflow-tooltip sortable="custom" min-width="150" align="left">
        <template slot-scope="scope">
          <el-button @click="showDetail(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('id') >= 0" prop="id" label="ID" show-overflow-tooltip align="left" min-width="150">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('project_name') >= 0 && roleType=='0'" prop="project_name" :label="$t('lang.project')" show-overflow-tooltip min-width="100" align="left">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" :label="$t('lang.status')" show-overflow-tooltip sortable="custom" min-width="100" align="left">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.status)">
            <span v-html="statusRender(scope.row.status)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('created_at') >= 0" prop="created_at" :label="$t('storage.createdTime')" min-width="100" sortable align="left">
        <template slot-scope="scope">
          <span v-html="dateRender(scope.row.created_at, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('description') >= 0" prop="description" :label="$t('lang.desc')" align="left" min-width="100">
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
    <create-cluster-guide
      ref="createStep"
      v-if="createTemplateFlag"
      @handleAddShow="handleAddShow"
      @refreshData="getData"
    ></create-cluster-guide>
    <!-- <transition name="slide-right" mode="out-in">
      <div style="width: 1000px;" class="slide-panel" v-if="detailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix" >
           <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
          </div>
          <div>
           <detail-tabs :clusterId="clusterId" ref="clusterdetail" @onBack="onBack"></detail-tabs>
          </div>
        </panel>
      </div>
    </transition> -->
  </icos-page>  
  </div>
</template>
<script>
import CreateClusterGuide from "./CreateClusterGuide";
import DetailTabs from "./DetailTabs";
export default {
  name: 'CloudCluster',
  components: {
    CreateClusterGuide
  },
  data() {
    return {
      roleType: Vue.roleType,
      clusterId: "",
      projectId: this.$cookie.get('pid'),
      projectList: [],
      allProjectsName: {},
      createTemplateFlag: false,
      modifyTemplateFlag: false,
      reloadTblFlag: false,
      detailFlag: false,
      columns: [],
      columnsChecked: ["name", "id", "project_name", "status", "description", "created_at"],
      tableData: [],
      totalData: [],
      multipleSelection: [],
      sortObj: {
        sortOrder: "desc",
        sortField: "created_at"
      },
      searchBar: {
        conditions: {
          name: {
           label: this.$t("container.clusterName"),
            type: "input",
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z]+$/.test(value)) {
                throw new Error(
                  this.$t("validation.onlyLetter_MinusNumber")
                );
              }
            }
          }
        }
      },
      searchBarValidatedParams: {},
      loading: false,
      operationMenus: [{
        icon: "fa-play",
        name: this.$t('cloudData.START_CLUSTER'),
        showflg: true,
        readOnly: true,
        handler: function() {
          this.createTemplateFlag = true;
        }.bind(this)
      }, {
        icon: "fa-remove",
        name: this.$t('cloudData.DELETE_CLUSTER'),
        showflg: true,
        readOnly: false,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          let self = this;
          self.$prompt(Vue.t('network.confirmDelete'), Vue.t('cloudData.DELETE_CONFIRM'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            inputPattern:/^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage:Vue.t('lang.onlyAcceptYesOrNo'),
            closeOnClickModal: false
          }).then(async({ value }) => {
            if ("yes" == value.toLowerCase()) {
              this.$sequence({
                type:'delete',
                url:"api/sahara/v2/"+self.projectId+"/clusters/{id}",
                params:selectedRows,
                log:{
                  description:{
                    en:"Delete cluster:{name}",
                    zh_cn:"删除集群:{name}"
                  },
                  target:Vue.logTarget.containerImage
                },
                successMsg:this.$t('container.deleteSuccessMsg'),
                successFun:() => {
                  this.getData(true, true);
                },
                errFun:() => {
                  this.getData(true, true);
                }
              })
            }
          }).catch(() => {
          })
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
            if (data['status'] === "Deleting" || data['status'] ==="Spawning" || data['status'] == "Validating") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.reloadTabelInterval);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.reloadTabelInterval = setInterval(() => {
            this.getData(false, true);
          }, 10000);
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
    this.loadData();
  },
  methods: {
    loadData() {
      let self = this;
      if (self.roleType == "0") {
        Promise.all([self.getProjectList()]).then(function(result) {
          self.getData(true, true);
        });
      } else {
        self.getData(true, true);
      }
    },
    async getData(isClear = true, isInterval = false) {
      let self = this;
      if (!isInterval) {
        self.loading = true;
      }
      try {
        let ajaxParam = {
          type: 'GET',
          url: "api/sahara/v1.1/"+self.projectId+"/clusters"
        };
        let ret = await this.$ajax(ajaxParam);
        self.loading = false;
        let dataList = ret.clusters;
        let dataList2 = [];
        for (let i=0; i<dataList.length; i++) {
          let row = dataList[i];
          dataList2.push(row)
        }
        // if (self.roleType == "0") {
        //   dataList2.forEach(function(obj, index) {
        //     obj["project_name"] = self.allProjectsName.get(obj.tenant_id);
        //   });
        // }
        self.totalData = this.filterFun(dataList2);
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
      if (self.roleType == "0") {
        let projectFilteredData = [];
        if (self.projectId== undefined || self.projectId == "") {
          projectFilteredData = nameFilteredData;
        } else {
          nameFilteredData.forEach(function(obj) {
            if (obj.project_id == self.projectId) {
              projectFilteredData.push(obj);
            }
          });
        }
        return projectFilteredData;
      }
      return nameFilteredData;
    },
    handleSearch(params) {
      this.searchBarValidatedParams = params;
      this.getData();
    },
    async getProjectList() {
      let self = this;
      try {
        let url = `api/keystone/v3/projects?domain_id=default`;
        let projectRet = await self.$ajax({
          url: url,
          type: 'get',
          showErrMsg: false
        });
        let allProjects = projectRet["projects"];
        self.allProjectsName = new Map();
        for (let i = 0; i<allProjects.length; i++) {
          let temp = allProjects[i];
          self.projectList.push({
            id: temp['id'],
            name: temp['name']
          });
          self.allProjectsName.set(temp['id'], temp['name']);
          if (temp['name'] == "admin") {
            self.projectId = temp['id'];
          }
        }
      } catch (e) {
        self.projectList = [];
        self.projectList = "";
        self.allProjectsName = {};
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
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
    onRefresh() {
      this.getData(false, true);
    },
    handleAddShow() {
      this.createTemplateFlag = false;
    },
    onBack() {
      this.detailFlag = false;
    },
    showDetail(row) {
      this.detailFlag = true;
      this.clusterId = row["id"];
      this.$router.push({
        path:"/clouddata/cluster/" + this.clusterId +"/clusterTabs"
      });
    },
    statusRender(value) {
      if (value=="Deleting") {
        return this.$t('storage.deleting')
      } else if (value=="Active") {
        return this.$t('lang.ACTIVE')
      } else if (value == "Validating") {
        return this.$t('container.CHECK_IN_PROGRESS')
      } else if (value == "Spawning") {
        return this.$t('calcStorLang.task_spawning')
      } else if (value == "Error") {
        return this.$t('base.error')
      } else if (value == "Starting") {
        return this.$t('storage.applying')
      } else if (value == "Configuring") {
        return this.$t('storage.applying')
      } else {
        return value
      }
    },
    statusTagRender(value) {
      let tagType = "";
      if (value === "Active") {
        tagType = "success";
      } else if (value === "Deleting" || value === "Validating" || value === "Spawning") {
        tagType = "info";
      } else if (value === "unavailable") {
        tagType = "gray"
      } else if (value === "Error") {
        tagType = "danger"
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
    }
  }
};

</script>
<style scoped>
</style>
