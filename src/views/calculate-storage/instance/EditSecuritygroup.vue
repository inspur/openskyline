<template>
  <el-dialog title="编辑网卡安全组" :visible.sync="dialogVisible" :before-close="handleClose" size="middle">
    <div style="height:510px;">
    <el-col style="padding-bottom:3px;">
      <el-button size="small" type="primary" icon="fa-refresh" @click="onRefresh1">{{$t('network.refresh')}}</el-button>
      <span>
        <span v-if="data" style="margin:0 20px;">{{$t('calcStorLang.net') +'：'+ data.name}}</span>
        <span>{{$t('lang.port') +'：'+ data.portID}}</span>
      </span>
    </el-col>
    <el-col :span="12">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{$t('calcStorLang.instAvailableSecGroup')}}</span>
        </div>
          <el-table 
             ref="allTable" 
             :data="allgroups"
             v-loading="loading1"
             :element-loading-text="$t('calcStorLang.dataLoading')"
             highlight-current-row
             border
             stripe
             style="width: 100%"
             row-key="id">
            <el-table-column 
              v-if="columnsChecked.indexOf('name') >= 0"
              prop="name" 
              :label="$t('lang.name')"
              align="left" 
              min-width="100">
            </el-table-column>
            <el-table-column 
              v-if="columnsChecked.indexOf('description') >= 0"
              prop="description"
              :label="$t('lang.desc')"
              align="left"
              min-width="100">
            </el-table-column>
            <el-table-column 
              :label="$t('calcStorLang.instOperate')"
              align="left" 
              min-width="50">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="addSg(scope.$index, scope.row)">{{$t('lang.addTo')}}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin: 10px 0; position: relative">
            <el-row>
              <el-col :span="24">
                <el-pagination :page-size="10" @current-change="handleCurrentChangeLeft" :current-page="currentPageleft" layout="total, prev, pager, next" :total="totalleft">
                </el-pagination>
              </el-col>
            </el-row>
          </div>
      </el-card>  
    </el-col>
    <el-col :span="12">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{$t('calcStorLang.instExistSecGroup')}}</span>
        </div>
          <el-table 
             ref="usedTable" 
             :data="usedgroups"
             highlight-current-row
             v-loading="loading2"
             :element-loading-text="$t('calcStorLang.dataLoading')"
             border
             stripe
             style="width: 100%"
             row-key="id">
            <el-table-column 
              v-if="columnsChecked.indexOf('name') >= 0"
              prop="name" 
              :label="$t('lang.name')"
              align="left"
              min-width="100">
            </el-table-column>
            <el-table-column 
              v-if="columnsChecked.indexOf('description') >= 0"
              prop="description" 
              :label="$t('lang.desc')"
              align="left"
              min-width="100">
            </el-table-column>
            <el-table-column 
              :label="$t('calcStorLang.instOperate')"
              align="left" 
              min-width="50">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="removeSg(scope.$index, scope.row)">{{$t('network.remove')}}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin: 10px 0; position: relative">
            <el-row>
              <el-col :span="24">
              <el-pagination :page-size="10" @current-change="handleCurrentChangeRight" :current-page="currentPageright" layout="total, prev, pager, next" :total="totalright"></el-pagination>
              </el-col>
            </el-row>
          </div>
      </el-card>
    </el-col>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('calcStorLang.closed')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: 'EditSecurityGroup',
  props: ["instUuid", "projectId", "instanceName", "portId", 'data'],
  data() {
    return {
      dialogVisible: false,
      loading1: false,
      loading2: false,
      allgroups: [],
      allgroupsTotal: [],
      usedgroups: [],
      usedgroupsTotal: [],
      columnsChecked: ["name", "description"],
      currentPageleft: 1,
      totalleft: 0,
      pageSize: 10,
      currentPageright: 1,
      totalright: 0,
      port: null
    }
  },
  async mounted() {
    let self = this;
    self.dialogVisible = true;
    self.loadSafeGroup();
  },
  methods: {
    async getPortData() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/ports/"+self.portId,
          errorKey: "NeutronError"
        });
        self.port = result["port"];
        return result;
      } catch (e) {
        self.$message.error('获取端口信息失败!');
      }
    },
    async editPort({id, isAdd, log}) {
      let self = this;
      let reqdata = {port: {}};
      try {
        await this.getPortData();
      } catch (e) {
        console.error(e)
      }
      let securityGroups = [].concat(self.port["security_groups"]);
      if (isAdd && (!securityGroups.includes(id))) {
        securityGroups.push(id);
      }
      if (!isAdd) {
        let index = securityGroups.findIndex(function(v) {
          return v === id;
        });
        if (~index) {
          securityGroups.splice(index, 1);
        }
      }
      if (self.port["port_security_enabled"]) {
        reqdata["port"]["security_groups"] = securityGroups;
      } else {
        reqdata["port"]["security_groups"] = [];
      }
      try {
        await self.$ajax({
          type: "PUT",
          url: "api/neutron/v2.0/ports/" + self.portId,
          data: JSON.stringify(reqdata),
          log,
          errorKey: "NeutronError"
        });
      } catch (res) {
        console.error(res);
      }
      return true;
    },
    handleCancel() {
      this.$emit("handleEditSecurityGroupFlag", {});
    },
    handleClose(done) {
      this.$emit("handleEditSecurityGroupFlag", {});
      done();
    },
    async loadServerSafeGroup(allA) {
      let self = this;
      try {
        let portResult = await self.getPortData();
        self.loading1 = false;
        self.loading2 = false;
        let useA = portResult.port['security_groups'];
        self.usedgroupsTotal = [];
        for (let j = 0; j < allA.length; j++) {
          allA[j].show = "0";
          for (let i = 0; i < useA.length; i++) {
            if (useA[i] === allA[j].id) {
              self.usedgroupsTotal.push(allA[j]);
              allA[j].show = "1";
            }
          }
        }
        self.allgroupsTotal = [];
        for (let i = 0; i < allA.length; i++) {
          if (allA[i].show == "0") {
            self.allgroupsTotal.push(allA[i]);
          }
        }
        let list = self.tablePageInationLeft(self.allgroupsTotal);
        self.getAllCurrentData(list);
        let list2 = self.tablePageInationRight(self.usedgroupsTotal);
        self.getusedCurrentData(list2);
      } catch (res) {
      }
    },
    getusedCurrentData(param) {
      this.usedgroups = param;
    },
    uniqueArrays(arr) {
      let newArr = [];
      for (let i=0; i<arr.length; i++) {
        let flag = true;
        for (let j = 0; j < newArr.length; j++) {
          if (arr[i].id == newArr[j].id) {
            flag = false;
          }
        }
        if (flag) {
          newArr.push(arr[i]);
        }
      }
      return newArr;
    },
    //获取当前项目下所有安全组
    async loadSafeGroup() {
      let self = this;
      self.loading1 = true;
      self.loading2 = true;
      let url = 'api/neutron/v2.0/security-groups';
      if (self.projectId) {
         url = 'api/neutron/v2.0/security-groups?project_id=' + self.projectId;
      }
      let result = await self.$ajax({
        type: 'get',
        url: url,
        errFun() {
          self.loading1 = false;
          self.loading2 = false;
        }
      });
      let allg = [];
      allg = result['security_groups'];
      self.loadServerSafeGroup(allg);
    },
    getAllCurrentData(param) {
      this.allgroups = param;
    },
    handleCurrentChangeLeft(val) {
      let self = this;
      self.currentPageleft = val;
      let list = self.tablePageInationLeft(self.allgroupsTotal);
      self.getAllCurrentData(list);
    },
    handleCurrentChangeRight(val) {
      let self = this;
      self.currentPageright = val;
      let list = self.tablePageInationRight(self.usedgroupsTotal);
      self.getusedCurrentData(list);
    },
    tablePageInationLeft(data) {
      var self = this;
      let array = [];
      this.totalleft = data.length;
      let startNum = 0;
      let endNum = 0;
      startNum = (this.currentPageleft - 1) * this.pageSize;
      if (this.currentPageleft * this.pageSize < this.totalleft) {
        endNum = this.currentPageleft * this.pageSize;
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
      this.loadSafeGroup();
    },
    onRefresh2() {
      this.loadSafeGroup();
    },
    async addSg(index, row) {
      let self = this;
      self.loading1 = true;
      self.loading2 = true;
      //检查是否已经添加
      // let result = await self.$ajax({
      //     type: 'get',
      //     url: 'api/nova/v2.1/servers/'+this.instUuid+'/os-security-groups'
      //   });
      // let useA = result['security_groups'];
      // useA = self.uniqueArrays(useA);
      // // self.usedgroupsTotal = [];
      //   for (let i = 0; i < useA.length; i++) {
      //     if (useA[i].id == row["id"]) {
      //       self.loading1 = false;
      //       self.loading2 = false;
      //       self.$message.info(Vue.t('calcStorLang.instFloatingRepeat'));
      //       return;
      //   }
      // }
      self.usedgroupsTotal.push(row);
      self.allgroupsTotal.splice(index, 1);
      let list = self.tablePageInationLeft(self.allgroupsTotal);
      self.getAllCurrentData(list);
      let list2 = self.tablePageInationRight(self.usedgroupsTotal);
      self.getusedCurrentData(list2);
      let body = {
        "addSecurityGroup": {
          "name": row["id"]
        }
      }
      let names = row["name"];
      if (names.length>10) {
        names = names.substring(0, 10)+"..."
      }
      body = JSON.stringify(body);
      let log = {
        description:{
          en:"Add security group:" + row["name"],
            zh_cn:"云主机"+self.instanceName+"添加安全组:" + row["name"]
        },
        target:Vue.logTarget.computeInstance
      };
      try {
        await self.editPort({id:row["id"], isAdd:true, log: log});
        self.$message.success(Vue.t('lang.addTo')+names+Vue.t('calcStorLang.success'))
      } catch (e) {
        console.error(e)
        self.loading1 = false;
        self.loading2 = false;
        self.loadSafeGroup();
      }
      self.loading1 = false;
      self.loading2 = false;
     /* self.$ajax({
        url: 'api/nova/v2.1/servers/'+self.instUuid+'/action',
        data: body,
        type: 'post',
        successMsg: Vue.t('lang.addTo')+names+Vue.t('calcStorLang.success'),
        errFun() {
          self.loadSafeGroup();
        },
        log:{
          description:{
            en:"Add security group:" + row["name"],
            zh_cn:"云主机"+self.instanceName+"添加安全组:" + row["name"]
          },
          target:Vue.logTarget.computeInstance
        }
      });*/
    },
    async removeSg(index, row) {
      let self = this;
      self.allgroupsTotal.push(row);
      self.usedgroupsTotal.splice(index, 1);
      let list = self.tablePageInationLeft(self.allgroupsTotal);
      self.getAllCurrentData(list);
      let list2 = self.tablePageInationRight(self.usedgroupsTotal);
      self.getusedCurrentData(list2);
      self.loading1 = true;
      self.loading2 = true;
      let body = {
        "removeSecurityGroup": {
          "name": row["id"]
        }
      }
      let names = row["name"];
      if (names.length>10) {
        names = names.substring(0, 10)+"..."
      }
      body = JSON.stringify(body);
      let log = {
        description:{
          en:"Remove security group:" + row["name"],
            zh_cn: "云主机"+self.instanceName+"移除安全组:" + row["name"]
        },
        target:Vue.logTarget.computeInstance
      }
      try {
        await self.editPort({id:row["id"], log: log});
        self.$message.success(Vue.t('network.remove')+names+Vue.t('calcStorLang.success'));
      } catch (e) {
        self.loading1 = false;
        self.loading2 = false;
        self.loadSafeGroup();
      }
      self.loading1 = false;
      self.loading2 = false;
    /*  self.$ajax({
        url: 'api/nova/v2.1/servers/'+self.instUuid+'/action',
        data: body,
        type: 'post',
        successMsg: Vue.t('network.remove')+names+Vue.t('calcStorLang.success'),
        errFun() {
          self.loadSafeGroup();
        },
        log:{
          description:{
            en:"Remove security group:" + row["name"],
            zh_cn: "云主机"+self.instanceName+"移除安全组:" + row["name"]
          },
          target:Vue.logTarget.computeInstance
        }
      });*/
    }
  }
}
</script>
