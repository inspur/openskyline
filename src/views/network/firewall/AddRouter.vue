<template>
  <el-dialog :title="$t('network.editRouter')"
    :visible.sync="dialogVisible"
    :before-close="handleClose" size="middle">
    <div style="height:510px;">
    <el-col style="padding-bottom:3px;text-align:left;">
      <el-button type="primary" size="small" icon="fa-refresh" @click="onRefresh2">{{$t('network.refresh')}}</el-button>
    </el-col>
    <el-col :span="11">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{$t('network.routerConnected')}}</span>
        </div>
          <el-table
             ref="connectedRouterTable"
             :data="linkedTableData"
             highlight-current-row
             border
             v-loading="loading"
             stripe
             style="width: 100%"
             row-key="id">
            <el-table-column
              v-if="columnsChecked.indexOf('name') >= 0"
              prop="name"
              :label="$t('network.routerName')"
              align="left"
              min-width="100">
            </el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('project_id') >= 0"
              prop="project_id"
              :label="$t('lang.project')"
              align="left"
              min-width="100">
              <template slot-scope="scope">
                <span v-html="projectToName(scope.row)"></span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('network.operation')"
              align="left"
              min-width="50">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="removeRouter(scope.$index, scope.row)">{{$t('network.remove')}}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin: 10px 0; position: relative">
            <el-row>
              <el-col :span="24">
                <el-pagination :page-size="10" @current-change="handleCurrentChange" :current-page="currentPage" layout="total, prev, pager, next" :total="total">
                </el-pagination>
              </el-col>
            </el-row>
          </div>
        </el-card>
    </el-col>
    <el-col :span="13">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{$t('network.allRouters')}}</span>
        </div>
          <el-table
             ref="allRouterTable"
             :data="allTableData"
             highlight-current-row
             border
             stripe
             v-loading="loading"
             style="width: 100%"
             row-key="id">
            <el-table-column
              v-if="columnsChecked.indexOf('name') >= 0"
              prop="name"
              :label="$t('network.routerName')"
              align="left"
              min-width="100">
            </el-table-column>
            <!--
            <el-table-column
              v-if="columnsChecked.indexOf('status') >= 0"
              prop="status"
              label="状态"
              align="left"
              min-width="100">
               <template slot-scope="scope">
                  <span v-html="statusRender(scope.row)"></span>
                </template>
            </el-table-column>
            -->
            <el-table-column
              v-if="columnsChecked.indexOf('project_id') >= 0"
              prop="project_id"
              :label="$t('lang.project')"
              align="left"
              min-width="100">
              <template slot-scope="scope">
                <span v-html="projectToName(scope.row)"></span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('network.operation')"
              align="left"
              min-width="100">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="addRouter(scope.$index, scope.row)">{{$t('lang.addTo')}}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin: 10px 0; position: relative">
            <el-row>
              <el-col :span="24">
                <el-pagination :page-size="10" @current-change="handleCurrentChangeRight" :current-page="currentPageright" layout="total, prev, pager, next" :total="totalright">
                </el-pagination>
              </el-col>
            </el-row>
          </div>
      </el-card>
    </el-col>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.close')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name:"AddRouter",
  props: ["editprojectid", "editId", 'editName'],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      removeFlag: "",
      routerName: "",
      noselecttotalData: [],
      noselecttotalTemp: [],
      selecttotalData: [],
      selecttotalDataOne: [],
      linkedTableData: [],
      allTableData: [],
      columnsChecked: ["name", "project_id"],
      multipleSelection: [],
      columns: [],
      currentPage: 1,
      total: 0,
      pageSize: 10,
      currentPageright: 1,
      totalright: 0
    }
  },
  mounted() {
    this.initDialog();
  },
  methods: {
    initDialog() {
      let self = this;
      self.dialogVisible = true;
      self.selecttotalDataOne = [];
      Promise.all([self.getAllRouters()]).then(function(result) {
        self.getLinkedRouters();
      });
    },
    getSelectCurrentData(param) {
      this.linkedTableData = param;
    },
    getCurrentData(param) {
      this.allTableData = param;
    },
    handleCurrentChange(val) {
      let self = this;
      self.currentPage = val;
      let list = self.tablePageInation(self.selecttotalData);
      self.getSelectCurrentData(list);
    },
    handleCurrentChangeRight(val) {
      let self = this;
      self.currentPageright = val;
      let list = self.tablePageInationRight(self.noselecttotalData);
      self.getCurrentData(list);
    },
    tablePageInation(data) {
      var self = this;
      let array = [];
      this.total = data.length;
      let startNum = 0;
      let endNum = 0;
      startNum = (this.currentPage - 1) * this.pageSize;
      if (this.currentPage * this.pageSize < this.total) {
        endNum = this.currentPage * this.pageSize;
      } else {
        endNum = this.total;
      }
      array = data.slice(startNum, endNum);
      return array;
    },
    tablePageInationRight(data) {
      var self = this;
      let array = [];
      this.totalright = data.length;
      let startNum = 0;
      let endNum = 0;
      startNum = (this.currentPageright - 1) * this.pageSize;
      if (this.currentPageright * this.pageSize < this.totalright) {
        endNum = this.currentPageright * this.pageSize;
      } else {
        endNum = this.totalright;
      }
      array = data.slice(startNum, endNum);
      return array;
    },
    onRefresh1() {
      let self = this;
      Promise.all([self.getAllRouters()]).then(function(result) {
        self.getLinkedRouters();
      });
    },
    onRefresh2() {
      let self = this;
      Promise.all([self.getAllRouters()]).then(function(result) {
        self.getLinkedRouters();
      });
    },
    getLinkedRouters() {
      let self = this;
      let data = [];
      let routerIds = [];
      self.selecttotalData = [];
      let result = self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/fw/firewalls/"+this.editId,
        errorKey: "NeutronError",
        success: function(result2) {
          data = result2['firewall'];
          routerIds = data["router_ids"];
          for (let i = 0; i < self.noselecttotalTemp.length; i++) {
            let selectedrow = self.noselecttotalTemp[i];
            for (let j = 0; j< routerIds.length; j++) {
              if (routerIds[j] == selectedrow.id) {
                self.selecttotalData.push(selectedrow);
              }
            }
          }
          for (let j = 0; j< routerIds.length; j++) {
            for (let i = 0; i < self.noselecttotalData.length; i++) {
              let selectedrow = self.noselecttotalData[i];
              if (routerIds[j] == selectedrow.id) {
                self.noselecttotalData.splice(i, 1);
                break;
              }
            }
          }
          let list = self.tablePageInation(self.selecttotalData);
          self.getSelectCurrentData(list);
          let list2 = self.tablePageInationRight(self.noselecttotalData);
          self.getCurrentData(list2);
        },
        errFun(xhr) {
          self.cancel();
        }
      });
    },
    async getAllRouters() {
      let self = this;
      let data = [];
      let result = await self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/routers?project_id="+this.editprojectid,
        errorKey: "NeutronError"
      });
      self.noselecttotalTemp = [];
      self.noselecttotalTemp = result["routers"];
      self.noselecttotalData = [];
      self.noselecttotalData = result["routers"];
    },
    projectToName(row) {
        let proId = row["project_id"];
        let proList = Vue.projectListforNet;
        for (let i=0; i<proList.length; i++) {
          if (proId === proList[i]["id"]) {
            return proList[i]["name"];
          }
        }
      },
    statusRender(row) {
      if (row["status"]==="ACTIVE") {
        return this.$t('lang.ACTIVE')
      } else if (row["status"]==="DOWN") {
        return this.$t('lang.DOWN')
      } else if (row["status"]==="BUILD") {
        return this.$t('lang.BUILD')
      } else if (row["status"]==="ERROR") {
        return this.$t('lang.ERROR')
      }
    },
    removeRouter(index, row) {
      let self = this;
      for (let i = 0; i < self.selecttotalData.length; i++) {
        let selectedrow = self.selecttotalData[i];
        if (selectedrow.id == row.id) {
          self.selecttotalData.splice(i, 1);
        }
      }
      self.selecttotalDataOne = [];
      if (self.selecttotalData.length == 0) {
        self.selecttotalDataOne.push(row);
      }
      self.noselecttotalData.push(row);
      self.removeFlag = "1";
      self.routerName = row["name"];
      self.addRouterClick();
    },
    addRouter(index, row) {
      let self = this;
      self.selecttotalData.push(row);
      for (let i = self.noselecttotalData.length - 1; i >= 0; i--) {
        let noselected = self.noselecttotalData[i];
        if (noselected.id === row.id) {
          self.noselecttotalData.splice(i, 1);
        }
      }
      self.removeFlag = "0";
      self.routerName = row["name"];
      self.addRouterClick();
    },
    handleClose(done) {
      this.$emit("handleAddRouterCancel", {});
      done();
    },
    cancel() {
      this.$emit("handleAddRouterCancel", {});
    },
    addRouterClick() {
      let self = this;
      if (self.selecttotalData.length === 0 && self.selecttotalDataOne.length === 0) {
        self.$message.error(Vue.t('network.norouterselected'));
        return;
      } else {
        let routerids = [];
        if (self.selecttotalData.length === 0) {
          let rowone = self.selecttotalDataOne[0];
        } else {
          for (let i = 0; i < self.selecttotalData.length; i++) {
            let selectedrow = self.selecttotalData[i];
            routerids.push(selectedrow.id);
          }
        }
        let logMessage = "";
        if (self.removeFlag=="0") {
          logMessage = `路由器:${self.editName},添加路由` + self.routerName;
        } else {
          logMessage = `路由器:${self.editName},移除路由` + self.routerName;
        }
        let reqdata = {
          "firewall": {
            "router_ids": routerids
          }
        }
        let result = self.$ajax({
          type: 'PUT',
          url: "api/neutron/v2.0/fw/firewalls/"+self.editId,
          data: JSON.stringify(reqdata),
          success: function(result) {
            if (self.removeFlag=="0") {
              self.$notify({
                message: Vue.t('network.addrouter')+self.routerName+Vue.t('network.success'),
                type: "success"
              });
            } else {
              self.$notify({
                message: Vue.t('network.removerouter')+self.routerName+Vue.t('network.success'),
                type: "success"
              });
            }
            self.onRefresh2();
          },
          errFun(xhr) {
            if (xhr.status == "404") {
              self.cancel();
            }
            self.initDialog();
          },
          errorKey: "NeutronError",
          log:{
            description:{
              en:"Router:" + self.routerName + " changed success",
              zh_cn:logMessage
            },
            target:Vue.logTarget.firewall
          }
        });
      }
    }
  }
}
</script>
