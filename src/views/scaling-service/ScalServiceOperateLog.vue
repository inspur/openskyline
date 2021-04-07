<template>
  <div>
    <!-- <el-form ref="scalingServiceForm" label-width="100px"> -->
    <el-form ref="scalingLogForm" label-width="100px">
      <el-row>
        <el-col :span="10" class="titlespan"><span>{{$t('scalingService.logList')}}</span></el-col>
      </el-row>
      <el-row :gutter="20">
        <div class="divider clearfix"></div>
      </el-row>
      <el-table ref="logTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="id" @selection-change="handleSelectionChange">
        <el-table-column align="left" v-if="columnsChecked.indexOf('oname') >= 0" prop="oname" :label="$t('scalingService.eventName')"  min-width="40">
        <template slot-scope="scope">
        <span>{{scope.row.oname}}</span>
        </template>        
        </el-table-column>
        <el-table-column align="left" v-if="columnsChecked.indexOf('otype') >= 0" prop="otype" :label="$t('scalingService.eventType')" min-width="50">
        <template slot-scope="scope">
        <span>{{scope.row.otype}}</span>
        </template>   
        </el-table-column>
        <el-table-column align="left" v-if="columnsChecked.indexOf('status') >= 0" prop="status" :label="$t('scalingService.eventStatus')" min-width="30">
        <template slot-scope="scope">
        <span>{{scope.row.status}}</span>
        </template>  
        </el-table-column>
        <el-table-column align="left" v-if="columnsChecked.indexOf('status_reason') >= 0" prop="status_reason" :label="$t('scalingService.statusReason')" min-width="100">
        <template slot-scope="scope">
        <span>{{scope.row.status_reason}}</span>
        </template>  
        </el-table-column>
        <el-table-column align="left" v-if="columnsChecked.indexOf('action') >= 0" prop="action" :label="$t('scalingService.operate')" min-width="80">
        <template slot-scope="scope">
        <span>{{scope.row.action}}</span>
        </template>  
        </el-table-column>
        <el-table-column align="left" v-if="columnsChecked.indexOf('timestamp') >= 0" prop="timestamp" :label="$t('scalingService.operateTime')" min-width="80">
        <template slot-scope="scope">
        <span v-html="dateRender(scope.row.timestamp, scope.row)"></span>
        </template>
        </el-table-column>
        <el-table-column align="left" v-if="columnsChecked.indexOf('user') >= 0" prop="user" :label="$t('scalingService.user')" min-width="40">
        <template slot-scope="scope">
        <span v-html="userRender(scope.row.user, scope.row)"></span>
        </template>        
        </el-table-column>
        <el-table-column align="left" v-if="columnsChecked.indexOf('project') >= 0" prop="project" :label="$t('lang.project')" min-width="40">
        <template slot-scope="scope">
        <span v-html="projectRender(scope.row.project, scope.row)"></span>
        </template>
        </el-table-column>
      </el-table>
    </el-form>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <!-- <span>共 {{multipleSelection.length}} 条</span> -->
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
        <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
          <!-- <el-pagination :current-page="currentPage" :page-sizes="[5, 10, 20, 30]" :page-size="5" layout="total, sizes, prev, pager, next, jumper" :total="10">
          </el-pagination> -->
        </el-col>
      </el-row>
    </div>
    <!-- <span >伸缩曲线</span>
    <div style="height:190px;width:100%">
      <IEcharts :option="line"></IEcharts>
    </div> -->
  </div>
</template>
<script>
export default {
  name: 'ScalServiceOperateLog',
  props:["clusterId", "projectId"],
  data() {
    return {
      projectlist: [],
      projectMap: new Map(),
      userList: [],
      userMap: new Map(),
      currentPage: 1,
      columns: [{
        prop: "oname",
        label:this.$t('scalingService.eventName')
      }, {
        prop: "otype",
        label:this.$t('scalingService.eventType')
      }, {
        prop: "status",
        label:this.$t('scalingService.eventStatus')
      }, {
        prop: "status_reason",
        label:this.$t('scalingService.statusReason')
      }, {
        prop: "action",
        label:this.$t('scalingService.operate')
      }, {
        prop: "timestamp",
        label:this.$t('scalingService.operateTime')
      }, {
        prop: "user",
        label:this.$t('scalingService.user')
      }, {
        prop: "project",
        label: this.$t('lang.project')
      }],
      columnsChecked: ['oname', 'otype', 'status', 'status_reason', 'action', 'timestamp', 'user', 'project'],
      tableData: [],
      multipleSelection: [],
      totalData: []
      /*,
      line: {
        series: []
      }*/
    }
  },
  mounted() {
    var self = this;
    Promise.all([self.loadProjectList(), self.loadUserList()]).then(function(result) {
        self.getEventsList();
    });
  },
  methods: {
    async getEventsList() {
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/senlin/v1/events?global_project=true&sort=timestamp:desc&cluster_id="+ self.clusterId;
      if ("2" == roleType || "3" == roleType) { //项目
        url = "api/senlin/v1/events?sort=timestamp:desc&cluster_id="+ self.clusterId;
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        self.loading = false;
        self.totalData = result['events'];
        //self.tableData = result['events'];
        self.total = result['events'].length;
      } catch (res) {
        self.loading = false;
        //self.$message.error('获取失败!');
      }
    },
    // getData(page = 1) {
    //   let data = [];

    //   function getNum() {
    //     return Math.floor(Math.random() * 10000 + 1);
    //   }
    //   for (let i = 0; i < 5; i++) {
    //     data.push({
    //       selectable: function() {
    //         return true;
    //       },
    //       action: "CLUSTER_ATTACH_POLICY",
    //       operate: i % 2 == 0 ? '增加1' : "缩减1",
    //      // status:"start",
    //       statusReason:"CLUSTER_CREATE: number of active nodes is equal or above desired_capacity (2).",
    //       generatedAt: "2017年10月16日 06:10",
    //       userId: '4a4d0d8f484743e98aa01d9c406a3111'
    //     })
    //   }
    //   return data;
    // },
    getCurrentData(param) {
      this.tableData = param;
    },
    onRefresh() {
      this.getEventsList();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    comStatusReason (statusReason) {
      if (statusReason) {
        return statusReason.replace(/,/g, ",<br/>").replace(/\./g, ".<br/>");
      } else {
        return '';
      }
    },
    async loadUserList() {
      var self = this;
      self.loading = true;
      self.userList = [];
      var roleType = Vue.roleType + "";
      var projectId = self.projectId;
      var url = "api/keystone/v3/users";
      if ("2" == roleType || "3" == roleType) {
        url = "api/keystone/v3/inspur/users?project_id=" + self.$cookie.get('pid');
      } else {
        url = "api/keystone/v3/inspur/users";
        if ("" != projectId && "0" != projectId) {
          url += "?project_id=" + projectId;
        }
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        var users = result['users'];
        for (var q = 0; q < users.length; q++) {
          self.userMap.set(users[q].id, users[q].name);
        }
        self.loading = false;
        self.userList.push({"name":this.$t('lang.all'), "id":"0"});
        self.userList = self.userList.concat(result['users']);
      } catch (res) {
        self.loading = false;
      }
    },
    userRender(value, rowData) {
      var name = this.userMap.get(value);
      if (null == name || "" == name) {
        return value;
      } else {
        return name;
      }
    },
    async loadProjectList() {
      //查询所有的项目列表
      var self = this;
      self.loading = true;
      var roleType = Vue.roleType + "";
      var url = "api/keystone/v3/projects";
      if ("2" == roleType || "3" == roleType) { //非超级管理员，查询一个项目信息
        url = "api/keystone/v3/projects/" + this.$cookie.get("pid");
      }
       try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        self.loading = false;
        if ("2" == roleType || "3" == roleType) {
          self.projectlist.push(result['project']);
          self.projectMap.set(result['project'].id, result['project'].name);
        } else {
          //self.projectlist = result['projects'];
          var projects = result['projects'];
          for (var q = 0; q < projects.length; q++) {
            self.projectMap.set(projects[q].id, projects[q].name);
          }
          self.projectlist.push({"name":this.$t('lang.all'), "id":"0"});
          self.projectlist = self.projectlist.concat(result['projects']);
        }
      } catch (res) {
        self.loading = false;
      }
    },
    projectRender(value, rowData) {
      var name = this.projectMap.get(value);
      if (null == name || "" == name) {
        return value;
      } else {
        return name;
      }
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
    }
  }
}
</script>
<style scoped>
  .titlespan {
    font-size: 20px;
    text-align: left;
  }
</style>
