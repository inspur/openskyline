<template>
  <el-dialog :title="$t('storage.revertSnapshot')" :visible.sync="visible" :before-close="close" v-dialogDrag>
    <el-form ref="snapshotForm" :model="snapshotForm" :inline="true" label-position="left">
      <el-form-item :label="$t('lang.name')">
        <el-input v-model="snapshotForm.name" :placeholder="$t('lang.name')" size="small"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' size="small" @click="queryClick()">{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form>
    <div class="divider clearfix"></div>
    <div>
      <el-table ref="deTable"
        :data="tableData"
        v-loading="loading"
        highlight-current-row
        border stripe
        style="width: 100%;"
        max-height='500'
        row-key="id"
        :default-sort="{prop: 'created_at', order: 'descending'}"
        @current-change="handleCurrentChange"
        @sort-change="sortChange"
      >
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" align="left" sortable="custom" min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('user_id') >= 0" prop="user_id" align="left" :label="$t('storage.owner')" min-width="100">
          <template slot-scope="scope">
            <span v-html="userRender(scope.row.user_id)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('size') >= 0" prop="size" align="left" :label="$t('storage.size')" min-width="100">
          <template slot-scope="scope">
            <span >{{scope.row.size + "G"}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" align="left" :label="$t('lang.status')" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="statusTagRender(scope.row.status)">
              <span v-html="statusRender(scope.row.status, scope.row)"></span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('created_at') >= 0" prop="created_at" align="left" :label="$t('lang.createTime')" sortable="custom" min-width="100">
          <template slot-scope="scope">
            <span>{{dateRender(scope.row.created_at, scope.row)}}</span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="queryClick">
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
            <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
          </el-col>
        </el-row>
      </div>
    </div>
    <div style="font-size: 12px; color: red;">{{$t('calcStorLang.dontOperateInstance')}}</div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmEditFun()" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "RevertBySnapShot",
  props: ['volume'],
  data() {
    return {
      snapshotForm: {
        name:""
      },
      sortObj:{
        sortOrder:"descending",
        sortField:"name"
      },
      visible: true,
      loading: false,
      noContinue:false,
      saving: false,
      totalData: [],
      tableData: [],
      multipleSelection: [],
      userMap: new Map(),
      columnsChecked: ["name", "user_id", "size", "status", "created_at"],
      columns: [{
        prop: "name",
        label: this.$t('lang.name')
      }, {
        prop: "user_id",
        label: this.$t('storage.owner')
      }, {
        prop: "size",
        label: this.$t('storage.size')
      }, {
        prop: "status",
        label: this.$t('lang.status')
      }, {
        prop: "created_at",
        label: this.$t('lang.createTime')
      }]
    };
  },
  mounted() {
    let self = this;
    self.loading = true;
    Promise.all([
      self.querServer(),
      self.loadUserList()
    ]).then(function (result) {
      self.initFrom();
      self.loading = false;
    });
  },
  methods: {
    close() {
      this.$emit("handleShow", {});
    },
    queryClick() {
      let self = this;
      self.loading = true;
      self.multipleSelection = [];
      self.$refs.deTable.clearSelection();
      Promise.all([
        self.loadUserList(),
        self.querServer()
      ]).then(function (result) {
        self.initFrom();
      });
      self.loading = false;
    },
    async initFrom() {
      let self = this;
      try {
        let link = `api/cinderv3/v3/${this.$cookie.get('pid')}/snapshots/detail?`;
        if (Vue.roleType == "0") {
          link = link + `all_tenants=True&`;
        };
        let result = await self.$ajax({
          type: 'get',
          url: link + `volume_id=${this.volume.id}`,
          headers: {
            "OpenStack-API-Version": "volume 3.45"
          }
        });
        let totalData = result['snapshots'];
        self.totalData = [];
        totalData.forEach(item => {
          if (item["status"] === "available" && item.name.indexOf(self.snapshotForm.name) > -1) {
            self.totalData.push(item);
          }
        });
      } catch (res) {
        self.loading = false;
        __DEV__ && console.error(res);
      }
    },
    async confirmEditFun() {
      var self = this;
      if (this.noContinue) {
        self.$message.error({message: Vue.t('storage.needShutoffToContinue')});
        return false;
      }
      if (!this.multipleSelection || this.multipleSelection.length === 0) {
        self.$message.error({message: Vue.t('storage.selectRowVolumeSolt')});
        return false;
      }
      self.saving = true;
      let snapshotName = self.multipleSelection[0].name;
      if (!snapshotName) {
        snapshotName = self.multipleSelection[0].id;
      }
      let url = `api/cinder/v3/${this.$cookie.get('pid')}/inspur-volumes/${self.volume.id}/action`;
      let body = {
        "revert": {
            "snapshot_id" : this.multipleSelection[0].id
        }
      };
      body = JSON.stringify(body);
      self.volume.name = self.volume.name || self.volume.id;
      try {
        let result = await self.$ajax({
          type: "post",
          data: body,
          url: url,
            headers: {
            "OpenStack-API-Version": "volume 3.40"
          },
          showErrMsg: true,
          successMsg: Vue.t('storage.sendApplySuccess'),
          log: {
            description: {
              en: `volume(${self.volume.name})request to revert the snapshot:(${snapshotName})`,
              zh_cn: `云硬盘(${self.volume.name})请求恢复快照(${snapshotName})`
            },
            target: Vue.logTarget.storage_volume
          }
        });
        self.saving = false;
        this.$emit("handleShow", {});
      } catch (res) {
        self.saving = false;
        __DEV__ && console.error(res);
      }
    },
    //查询云硬盘挂载的云主机列表
    async querServer() {
      let self = this;
      this.noContinue = false;
      let link = `api/nova/v2.1/servers-inspur/detail?project_id=${this.volume['os-vol-tenant-attr:tenant_id']}`;
      if (Vue.roleType == '0') {
        link = link + `&all_tenants=1`;
      }
      let result = await self.$ajax({
        type: 'get',
        url: link
      });
      let serverlist = result["servers"] || [];
      let attachments = this.volume.attachments || [];
      if (serverlist instanceof Array && serverlist.length>0 && attachments.length >0) {
        serverlist.forEach(element => {
          attachments.forEach(item => {
            if (element.id == item.server_id && element["status"] != "SHUTOFF") {
              this.noContinue = true;
            }
          });
        });
      }
    },
    async loadUserList() {
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/keystone/v3/inspur/users?domain_id=default";
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: false
        });
        var users = result["users"];
        for (var q = 0; q < users.length; q++) {
          self.userMap.set(users[q].id, users[q]);
        }
      } catch (res) {
        self.loading = false;
      }
    },
    userRender(userId) {
      let user = this.userMap.get(userId);
      if (user) {
        return user["name"];
      } else {
        return "--"
      }
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
    },
    handleCurrentChange(row) {
      if (row) {
        this.multipleSelection = [row];
      }
    },
    statusTagRender(status) {
      if ("available" == status) {
        return "success";
      } else if ("deleted" == status) {
        return "gray";
      } else if ("error" == status || "error_deleting" == status) {
        return "danger";
      } else if ("creating" == status || "backing-up" == status || "unmanaging" == status || "restoring" == status || "deleting" == status) {
        return "info";
      } else {
        return "";
      }
    },
    statusRender(value, rowData) {
      if (value == "creating") {
        return this.$t('storage.creating');
      } else if (value == "available") {
        return this.$t('storage.available');
      } else if (value == "backing-up") {
        return this.$t('storage.backUping');
      } else if (value == "deleting") {
        return this.$t('storage.deleting');
      } else if (value == "error") {
        return this.$t('storage.error');
      } else if (value == "deleted") {
        return this.$t('storage.deleted');
      } else if (value == "unmanaging") {
        return this.$t('storage.unmanageStarting');
      } else if (value == "restoring") {
        return this.$t('storage.reverting');
      } else if (value == "error_deleting") {
        return this.$t('storage.errorDeleting');
      }
    },
    dateRender(value, rowData) {
      var self = this;
      var createTime = rowData['created_at'];
      if (createTime.lastIndexOf("Z") < 0 && createTime.lastIndexOf(".") >= 0) {
        createTime = createTime.substring(0, createTime.lastIndexOf(".")) + "Z";
      }
      var time = Date.parse(new Date(createTime));
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
      // timeStamp = timeStamp + 0; //北京时间比格林时间早八个小时
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
    getCurrentData(param) {
      this.tableData = param;
    }
  }
};
</script>