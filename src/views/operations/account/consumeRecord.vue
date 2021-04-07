<template>
  <div>
    <div>
      <el-row :gutter="6" style="margin-top:5px;">
        <el-col :span="2" style="margin-bottom:10px">
          <div @click="getData" class="charge-log-item">
            <div class="charge-log-item-top">
            <img :src='allCost' style="width:30px;">
              <span>{{$t('opt.all')}}</span>
              <span>{{projectNum}}</span>
            </div>
            <div class="charge-log-item-low">{{projectCost}}</div>
          </div>
        </el-col>
        <el-col :span="2">
          <div @click="getComputeList" class="charge-log-item">
            <div class="charge-log-item-top">
              <img :src='cloudHost' style="width:30px;">
              <span>{{$t('opt.cloudHost')}}</span>
              <span>{{computeNum}}</span>
            </div>
            <div class="charge-log-item-low">{{computeCost}}</div>
          </div>
        </el-col>
        <el-col :span="2">
          <div @click="getVolumeList" class="charge-log-item">
            <div class="charge-log-item-top">
              <img :src='cloudDisk' style="width:30px;">
              <span>{{$t('opt.cloudHardDisk')}}</span>
              <span>{{volumeNum}}</span>
            </div>
            <div class="charge-log-item-low">{{volumeCost}}</div>
          </div>
        </el-col>
        <el-col :span="2">
          <div @click="getImageList" class="charge-log-item">
            <div class="charge-log-item-top">
              <img :src='image' style="width:30px;">
              <span>{{$t('opt.Image')}}</span>
              <span>{{imageNum}}</span>
            </div>
            <div class="charge-log-item-low">{{imageCost}}</div>
          </div>
        </el-col>
        <el-col :span="2">
          <div @click="getFloatIPList" class="charge-log-item">
            <div class="charge-log-item-top">
              <img :src='floatIP' style="width:30px;">
              <span>{{$t('opt.floatIp')}}</span>
              <span>{{floatIpNum}}</span>
            </div>
            <div class="charge-log-item-low">{{floatIpCost}}</div>
          </div>
        </el-col>
      </el-row>
    </div>
    <!--
    <el-form :inline="true" :model="formInline" class="form-inline" v-if="hostTypeFlag">
      <el-form-item :label="$t('opt.projectname')">
        <el-input auto-complete="off" style="width:160px;" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="formInline.projectName"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' @click="queryClick" size="small">{{$t('opt.doQuery')}}</el-button>
      </el-form-item>
    </el-form>
    -->

    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" @search="searchHandle" />

    <div class="divider clearfix"></div>
    <el-table
      ref="deTable"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('opt.dataLoading')"
      highlight-current-row
      border
      stripe
      style="width: 100%"
      row-key="id"
      :default-sort="{prop:'projectName', order:'ascending'}"
      @row-click="rowClick"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column
        v-if="columnsChecked.indexOf('projectName') >= 0"
        prop="projectName"
        :label="$t('opt.projectname')"
        sortable="custom"
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="projectToName(scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('reType') >= 0"
        prop="reType"
        :label="$t('opt.resourceType')"
        sortable="custom"
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="reTypeRender(scope.row.reType, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('consume') >= 0"
        prop="consume"
        :label="$t('opt.consume')"
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="consumeRender(scope.row.consume, scope.row)"></span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
            <el-popover
              placement="right"
              trigger="click">
              <el-checkbox-group class="vertical"
                v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>{{$t('opt.selectColumn')}}</el-tag>
              </div>
            </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
        </el-col>
      </el-row>
      <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
    </div>
  </div>
</template>
<script>
import allCost from 'assets/img/chargePage/allCost.png';
import cloudHost from 'assets/img/chargePage/cloudHost.png';
import cloudDisk from 'assets/img/chargePage/cloudDisk.png';
import image from 'assets/img/chargePage/image.png';
import floatIP from 'assets/img/chargePage/floatIP.png';
import {loadProject} from 'utils/xmlHttpRequestCommon';
export default {
  name:"consumeRecord",
  data() {
    return {
      searchBar: {
        conditions: {
          project: {
            label: this.$t("opt.projectname"),
            type: "select",
            visible: String(Vue.roleType) === "0",
            options: []
          }
        }
      },
      allCost,
      cloudHost,
      cloudDisk,
      image,
      floatIP,
      roleType: Vue.roleType,
      sortObj:{
        sortOrder:"ascending",
        sortField:"projectName"
      },
      formInline: {
        projectName: "",
        project_id:""
      },
      selProjectFlg: false,
      close: "",
      projectOption: [],
      projectData: [],
      totalData: [],
      projectNum:0,
      computeNum:0,
      volumeNum:0,
      imageNum:0,
      floatIpNum:0,
      projectCost:0,
      computeCost:0,
      volumeCost:0,
      imageCost:0,
      floatIpCost:0,
      tableData: [],
      loading: false,
      hostTypeFlag: Vue.roleType == 0,
      multipleSelection: [],
      columns: [{
        prop: "projectName",
        label: this.$t('opt.projectname')
      }, {
        prop:"reType",
        label: this.$t('opt.resourceType')
      }, {
        prop: "consume",
        label: this.$t('opt.consume')
      }],
      columnsChecked: ["reType", "consume", "projectName"]
    }
  },
  async mounted() {
    var self = this;
    var roleType = Vue.roleType + "";
    Promise.all([self.getProjectList(), self.getTypeData(), self.getTypeCost()]).then(function(result) {
      self.getData();
    });

    if (String(Vue.roleType) === "0") {
      loadProject()
        .then(v => {
          this.searchBar.conditions.project.options = Array.from(v, v => {
            return { label: v.name, value: v.id };
          });
        })
        .catch(v => {});
    }
  },
  methods: {
    searchHandle(v = {}) {
      if (Vue.roleType == "0") {
        this.formInline.query_project = v.project ? v.project : '';
      }

      this.queryClick();
    },
    async getTypeData() {
      var self = this;
      try {
        var queryStr = "";
        let url = "";
        let roleType = Vue.roleType + "";
        if (roleType == "2") {
          queryStr += "?project_id="+Vue.cookie.get('pid');
        }
        if (queryStr == "") {
          url = "api/cloudkitty/v1/cost/get_res_num"+queryStr+"?time="+new Date().getTime();
        } else {
          url = "api/cloudkitty/v1/cost/get_res_num"+queryStr+"&time="+new Date().getTime();
        }
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        self.projectNum = result[0].ALL;
        self.computeNum = result[0].compute;
        self.volumeNum = result[0].volume;
        self.imageNum = result[0].image;
        self.floatIpNum = result[0]['network.floating'];
      } catch (res) {
        console.log(self.$t('opt.getResourceTypeNumberFailed'));
      }
    },
    async getTypeCost() {
      var self = this;
      try {
        var queryStr = "";
        let url = "";
        let roleType = Vue.roleType + "";
        if (roleType == "2") {
          queryStr += "?tenant_id="+Vue.cookie.get('pid');
        }
        if (queryStr == "") {
          url = "api/cloudkitty/v1/cost/get_res_cost"+queryStr+"?time="+new Date().getTime();
        } else {
          url = "api/cloudkitty/v1/cost/get_res_cost"+queryStr+"&time="+new Date().getTime();
        }
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        let typeCostData = result['cost_list'];
        for (let i=0; i<typeCostData.length; i++) {
          if (typeCostData[i].res_type == "ALL") {
            self.projectCost = typeCostData[i].rate;
          } else if (typeCostData[i].res_type == "compute") {
            self.computeCost = typeCostData[i].rate;
          } else if (typeCostData[i].res_type == "volume") {
            self.volumeCost = typeCostData[i].rate;
          } else if (typeCostData[i].res_type == "image") {
            self.imageCost = typeCostData[i].rate;
          } else {
            self.floatIpCost = typeCostData[i].rate;
          }
        }
      } catch (res) {
        console.log(self.$t('opt.getResourceTypeConsumeFailed'));
      }
    },
    async getData(page = 1, projectid="") {
      var self = this;
      self.loading = true;
      try {
        var queryStr = "";
        let url = "";
        let roleType = Vue.roleType + "";
        if (roleType == "0") {
          if (projectid != "") {
            queryStr += "?tenant_id="+projectid;
          }
        } else {
          queryStr += "?tenant_id="+Vue.cookie.get('pid');
        }
        if (queryStr == "") {
          url = "api/cloudkitty/v1/cost/get_cost_list"+queryStr+"?time="+new Date().getTime();
        } else {
          url = "api/cloudkitty/v1/cost/get_cost_list"+queryStr+"&time="+new Date().getTime();
        }
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        self.loading = false;
        self.totalData = [];
        let fws = result['cost_list'];
        for (let i=0; i<fws.length; i++) {
          var obj = {
            projectName: "",
            reType: "",
            consume: ""
          };
          obj.projectName = fws[i].tenant_id;
          obj.reType = fws[i].res_type;
          obj.consume = fws[i].rate;
          self.totalData.push(obj);
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
        console.log(self.$t('opt.getProjectConsumeListFailed'));
      }
    },
    async getComputeList() {
      var self = this;
      self.loading = true;
      try {
        var queryStr = "";
        let roleType = Vue.roleType + "";
        if (roleType == "2") {
          queryStr += "&tenant_id="+Vue.cookie.get('pid');
        }
        let result = await self.$ajax({
          type: 'get',
          url: "api/cloudkitty/v1/cost/get_cost_list?res_type=compute"+queryStr+"&time="+new Date().getTime()
        });
        self.loading = false;
        self.totalData = [];
        let fws = result['cost_list'];
        for (let i=0; i<fws.length; i++) {
          var obj = {
            projectName: "",
            reType: "",
            consume: ""
          };
          obj.projectName = fws[i].tenant_id;
          obj.reType = fws[i].res_type;
          obj.consume = fws[i].rate;
          self.totalData.push(obj);
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
        console.log(self.$t('opt.getHostConsumeListFailed'));
      }
    },
    async getVolumeList() {
      var self = this;
      self.loading = true;
      try {
        var queryStr = "";
        let roleType = Vue.roleType + "";
        if (roleType == "2") {
          queryStr += "&tenant_id="+Vue.cookie.get('pid');
        }
        let result = await self.$ajax({
          type: 'get',
          url: "api/cloudkitty/v1/cost/get_cost_list?res_type=volume"+queryStr+"&time="+new Date().getTime()
        });
        self.loading = false;
        self.totalData = [];
        let fws = result['cost_list'];
        for (let i=0; i<fws.length; i++) {
          var obj = {
            projectName: "",
            reType: "",
            consume: ""
          };
          obj.projectName = fws[i].tenant_id;
          obj.reType = fws[i].res_type;
          obj.consume = fws[i].rate;
          self.totalData.push(obj);
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
        console.log(self.$t('opt.getVolumeConsumeListFailed'));
      }
    },
    async getImageList() {
      var self = this;
      self.loading = true;
      try {
        var queryStr = "";
        let roleType = Vue.roleType + "";
        if (roleType == "2") {
          queryStr += "&tenant_id="+Vue.cookie.get('pid');
        }
        let result = await self.$ajax({
          type: 'get',
          url: "api/cloudkitty/v1/cost/get_cost_list?res_type=image"+queryStr+"&time="+new Date().getTime()
        });
        self.loading = false;
        self.totalData = [];
        let fws = result['cost_list'];
        for (let i=0; i<fws.length; i++) {
          var obj = {
            projectName: "",
            reType: "",
            consume: ""
          };
          obj.projectName = fws[i].tenant_id;
          obj.reType = fws[i].res_type;
          obj.consume = fws[i].rate;
          self.totalData.push(obj);
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
        console.log(self.$t('opt.getImageConsumeListFailed'));
      }
    },
    async getFloatIPList() {
      var self = this;
      self.loading = true;
      try {
        var queryStr = "";
        let roleType = Vue.roleType + "";
        if (roleType == "2") {
          queryStr += "&tenant_id="+Vue.cookie.get('pid');
        }
        let result = await self.$ajax({
          type: 'get',
          url: "api/cloudkitty/v1/cost/get_cost_list?res_type=network.floating"+queryStr+"&time="+new Date().getTime()
        });
        self.loading = false;
        self.totalData = [];
        let fws = result['cost_list'];
        for (let i=0; i<fws.length; i++) {
          var obj = {
            projectName: "",
            reType: "",
            consume: ""
          };
          obj.projectName = fws[i].tenant_id;
          obj.reType = fws[i].res_type;
          obj.consume = fws[i].rate;
          self.totalData.push(obj);
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
        console.log(self.$t('opt.getFloatIPConsumeListFailed'));
      }
    },
    async getProjectList() {
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/keystone/v3/projects?domain_id=default";
      if ("2" == roleType) {
        //非超级管理员，查询一个项目信息
        url = "api/keystone/v3/projects/" + this.$cookie.get("pid");
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        if ("2" == roleType) {
          self.projectData = result['project'];
        } else {
          var projects = result['projects'];
          self.projectOption = projects;
        }
      } catch (res) {
        console.log(self.$t('opt.getProjectListFailed'));
      }
    },
    projectToName(row) {
      var result = "";
      let proId = row["projectName"];
      if ("0" == roleType) {
        let proList = this.projectOption;
        for (let i=0; i<proList.length; i++) {
          if (proId === proList[i]["id"]) {
            result = proList[i]["name"];
          }
        }
      } else {
        if (proId === this.projectData.id) {
          result = this.projectData.name;
        }
      }
      return result;
    },
    reTypeRender(value, rowData) {
      let self = this
      let resourceType = rowData['reType'];
      let resourceName = "";
      switch (resourceType) {
        case "compute":
          resourceName = self.$t('opt.cloudHost');
          break;
        case "volume":
          resourceName = self.$t('opt.cloudHardDisk');
          break;
        case "image":
          resourceName = self.$t('opt.Image');
          break;
        case "network.floating":
          resourceName = self.$t('opt.floatIp');
          break;
        default:
          resourceName = "-"
      };
      return resourceName;
    },
    consumeRender(value, rowData) {
      let self = this
      let consume = rowData['consume'];
      let consumeNumber = Number(consume);
      consume = consumeNumber.toFixed(2) || 0;
      return consume;
    },
    onRefresh() {
      this.getData();
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
    },
    onIconClick() {
      this.formInline.project_id = '';
      this.formInline.projectName = '';
      this.close = '';
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.formInline.project_id = id;
      this.formInline.projectName = name;
      this.close = 'circle-close';
    },
    queryClick() {
      var self = this;
      self.getData(1, self.formInline.project_id);
      this.$refs.deTable.clearSelection();
    }
  }
}
</script>
<style type="text/css" scoped>
.charge-log-item {
  border: 1px solid #999;
  border-radius: 3px;
  text-align: center;
  height: 80px;
  width: 110px;
}
.charge-log-item-top {
  height: 55px;
  font-size: 14px;
}
.charge-log-item-top img {
  display: block;
  margin: auto;
}
.charge-log-item-low {
  height: 25px;
  font-size: 14px;
}
</style>