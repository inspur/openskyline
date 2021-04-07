<template>
<div>
  <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
  <div class="divider clearfix"></div>
  <operation-panel
    class="margin-tb5"
    :select-rows="multipleSelection"
    :operation-menus="operationMenus">
  </operation-panel>
  <div class="divider clearfix"></div>
  <el-table
    ref="shTable"
    :data="tableData"
    v-loading="loading"
    highlight-current-row
    border
    stripe
    style="width: 100%;"
    slot="empty"
    max-height='500'
    row-key="id"
    :default-sort="{prop: 'name', order: 'descending'}"
    @sort-change="sortChange"
    @selection-change="handleSelectionChange">
    <el-table-column
      reserve-selection
      type="selection"
      align="center"
      width="55"
      :selectable="function(row, index) { return !['deleting'].includes(row['status']) }">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('id') >= 0"
      prop="id"
      label="ID"
      align="left"
      sortable="custom"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
      prop="name"
      :label="$t('lang.name')"
      align="left"
      sortable="custom"
      min-width="100">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('project_id') >= 0 && roleType == '0'"
      :label="$t('lang.project')"
      prop="project_id"
      align="left"
      min-width="40">
      <template slot-scope="scope">
        <span v-html="queryProjecName(scope.row.project_id, scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('size') >= 0"
      prop="size"
      align="left"
      :label="$t('storage.size')"
      min-width="100">
      <template slot-scope="scope">
        <span>{{scope.row.share_size + "GB"}}</span>
      </template>
    </el-table-column>
     <el-table-column v-if="columnsChecked.indexOf('status') >= 0"
      prop="status"
      align="left"
      :label="$t('lang.status')"
      min-width="100">
      <template slot-scope="scope">
        <el-tag :type="statusTagRender(scope.row.status)">
          <span v-html="statusRender(scope.row.status, scope.row)"></span>
        </el-tag>
      </template>
    </el-table-column>
    <!-- <el-table-column v-if="columnsChecked.indexOf('share_proto') >= 0"
      prop="share_proto"
      align="left"
      label="协议"
      min-width="100">
    </el-table-column> -->
    <el-table-column v-if="columnsChecked.indexOf('share_id') >= 0"
      prop="share_id"
      :label="$t('storage.docStoreName')"
      align="left"
      min-width="100">
      <template slot-scope="scope">
        <span>{{idToNameRender(scope.row.share_id, scope.row)}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('created_at') >= 0"
      prop="created_at"
      sortable="custom"
      align="left"
      :label="$t('lang.createTime')"
      min-width="100">
      <template slot-scope="scope">
        <span>{{dateRender(scope.row.created_at, scope.row)}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('description') >= 0"
      prop="description"
      align="left"
      :label="$t('lang.desc')"
      min-width="100">
      <template slot-scope="scope">
        <span>{{decodeURI(scope.row.description)}}</span>
      </template>
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh">
        </el-button>
          <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
      </el-col>
      <el-col :span="19">
        <page :totalData="totalData"  @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
      </el-col>
    </el-row>
    <create-share-storage ref="createShareStorage" v-if="newDosStorFlg" :snapshotId="snapshotId">
    </create-share-storage>
    <refresh-status ref="RefreshStatus"  v-if="refreshFlag" :stat="stat" @handleShow="handleShow">
    </refresh-status>
    <edit-share-solt ref="EditShareSolt" :shareSoltId="shareSoltId" :shareSoltName="shareSoltName" :shareSoltDesc="shareSoltDesc" @onRefresh="onRefresh" v-if="editFlag" @handlEditShow="handlEditShow"></edit-share-solt>
  </div>
 </div>
</template>
<script>
import CreateShareStorage from '../document-storage/CreateShareStorage';
import RefreshStatus from './RefreshStatus';
import EditShareSolt from './DosStorSnapShotEdit';
  export default {
  name: "DocStor",
  components: {
    CreateShareStorage, RefreshStatus, EditShareSolt
  },
  data() {
    return {
      searchBar: {
        conditions: {
          query_name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumber'));
              }
              if (value.length>255) {
                throw new Error(this.$t('storage.inputNameTooLong'));
              }
            }
          },
          query_share_name: {
            label: this.$t('storage.docStoreName'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumber'));
              }
              if (value.length>255) {
                throw new Error(this.$t('storage.inputNameTooLong'));
              }
            }
          }
        }
      },
      queryParams: {},
      sortObj:{
        sortOrder:"descending",
        sortField:"name"
      },
      roleType: Vue.roleType + "",
      newDosStorSlotFlg:false,
      newDosStorFlg:false,
      editFlag:false,
      isImageFlag:false,
      snapshotId: '',
      refreshFlag: false,
      reloadTblFlag: false,
      multipleSelection:[],
      shareMap: new Map(),
      scvMaps: new Map(),
      projecNameMap: new Map(),
      totalData: [],
      query_share_name: '',
      query_name: '',
      shareSoltId: '',
      shareSoltName: '',
      shareSoltDesc: '',
      operationMenus:[{
        icon: "fa-plus",
        name: this.$t('storage.createSnapshot'),
        showflg: false,
        multi: true,
        readOnly: true,
         handler: function(selectRows) {
          let me = this;
          me.newDosStorSlotFlg = true;
        }.bind(this)
      }, {
        icon: "fa-plus",
        name: this.$t('storage.createShareStorage'),
        showflg: !this.isAdmin(),
        multi: false,
        enable(rowData) {
           return (rowData['status'] + "" == "available");
        },
         handler: function(selectRows) {
          let me = this;
          me.snapshotId = selectRows[0].id;
          me.newDosStorFlg = true;
          let shareInfo = this.shareMap.get(selectRows[0].share_id);
          me.$nextTick(() => {
            if (null != shareInfo) {
              me.$refs.createShareStorage.createShareStorage.type = shareInfo.share_type;
            }
            me.$refs.createShareStorage.show();
            me.$refs.createShareStorage.isImageFlag = false;
          });
        }.bind(this)
      }, {
        icon: "fa-plus",
        name: this.$t('lang.edit'),
        showflg: true,
        multi: false,
        enable(rowData) {
           return (rowData['status'] + "" == "available");
        },
         handler: function(selectRows) {
          let self = this;
          self.shareSoltId = selectRows[0].id;
          self.shareSoltName = selectRows[0].name;
          self.shareSoltDesc = selectRows[0].description;
          self.editFlag = true;
        }.bind(this)
      },
      // , {
      //   icon: "fa-refresh",
      //   name: this.$t('storage.refreshStatus'),
      //   showflg: this.isAdmin(),
      //   enable(rowData) {
      //     return true;
      //   },
      //    handler: function(selectRows) {
      //     this.stat = selectRows[0].sta==0?this.$t('storage.available'):this.$t('storage.unableUse');
      //     this.refreshFlag = true;
      //     this.$nextTick(() => {
      //       this.$refs.RefreshStatus.show();
      //     });
      //   }.bind(this)
      // }
       {
        icon: "fa-times",
        name: this.$t('lang.delete'),
        multi: true,
        showflg: true,
        enable(rowData) {
          return (rowData['status'] + "" == "available" || rowData['status'] + "" == "error");
        },
         handler: function(selectRows) {
           let row = selectRows[0];
            let self = this;
            self.$prompt(
              this.$t('lang.inputYesToContinue'),
              this.$t("lang.confirm"),
              {
                confirmButtonText: this.$t("lang.confirm"),
                cancelButtonText: this.$t("lang.cancel"),
                inputPattern: /^YES$|^NO$/i,
                inputValue: "NO",
                customClass: "promptConfirmDel",
                inputErrorMessage: this.$t("lang.onlyAcceptYesOrNo")
              }
            ).then(async ({ value }) => {
              if ("yes" == value.toLowerCase()) {
                self.$sequence({
                  type: 'delete',
                  url: 'api/manila/v2/' + this.$cookie.get('pid') + "/snapshots/{id}",
                  params: selectRows,
                  log:{
                    description:{
                      en:"Send delete docStore snapshot ",
                      zh_cn:"发送删除文件存储快照"
                    },
                    key: "name",
                    target:Vue.logTarget.storage_share_snapshot
                  }
                }).then((data) => {
                  self.$message(Vue.t('storage.sendDeleteSuccess'));
                  for (let r = 0; r < selectRows.length; r++) {
                    selectRows[r].status = "deleting";
                  }
                  self.$refs.shTable.clearSelection();
                  self.currentPage = 1;
                  setTimeout( function() {
                    self.loadData();
                  }, 5000);
                }).catch((err) => {});
              }
            });
        }.bind(this)
      }],
      tableData:[],
      listPara:{
        page:1,
        pageSize:10
      },
      loading:false,
      columnsChecked:["name", "project_id", "status", "size", "share_id", "created_at"],
      columns:[{
        prop:"id",
        label:"ID"
      }, {
        prop:"name",
        label:this.$t('lang.name')
      }, {
        prop:"project_id",
        label:this.$t('lang.project')
      }, {
        prop:"size",
        label:this.$t('storage.size')
      }, {
        prop:"status",
        label:this.$t('lang.status')
      }, {
        prop:"share_id",
        label:this.$t('storage.docStoreName')
      }, {
        prop:"created_at",
        label:this.$t('lang.createTime')
      }, {
        prop:"description",
        label:this.$t('lang.desc')
      }],
      currentPage:1,
      pageSize:10,
      pageSizes:[10, 50, 200],
      total:1
    }
  },
  beforeDestroy() {
    if (this.interVmValid != null) {
      clearInterval(this.interVmValid);
    }
  },
  watch: {
    tableData: {
      immediate: false,
      handler: function(list) {
        let self = this;
        self.reloadTblFlag = false;
        if (list != null) {
          for (let t = 0; t < list.length; t++) {
            let obj = list[t];
            if (obj['status'] == "creating" || obj['status'] == "deleting" || obj['status'] == "attaching" || obj['status'] == "detaching" || obj['status'] == "downloading" || obj['status'] == "uploading" || obj['status'] == "backing-up" || obj['status'] == "restoring-backup") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.interVmValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interVmValid = setInterval(() => {
              self.loadData();
            }, 5000);
        }
      }
    }
  },
  mounted() {
    if ("0" != this.roleType) {
      this.columns.splice(2, 1);
    }
    this.loadData();
  },
  methods: {
    sortChange(column) {
       let self = this;
       if (!column.prop) { return; }
       self.sortObj = {
         sortOrder:column.order,
         sortField:column.prop
       };
    },
    isAdmin() {
      let roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        return false;
      }
      return true;
    },
    handleSearch(params) {
      this.queryParams = params;
      this.$refs.shTable.clearSelection();
      this.loadData();
    },
    async loadData() {
      this.loadProjectList();
      let Pid = this.$cookie.get('pid');
      let self = this;
      let data = [];
      let roleType = Vue.roleType + "";
      let url = "api/manila/v2/" + Pid + "/inspur-shares/detail?all_tenants=True";
      if ("2" == roleType || "3" == roleType) { //超级
          url= "api/manila/v2/" + Pid + "/inspur-shares/detail";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        let shareList = result['shares'];
        for (let a in shareList) {
          let obj = shareList[a];
          self.shareMap.set(obj.id, obj);
          if (typeof (obj.snapshot_id) != "undefined" && null != obj.snapshot_id && "" != obj.snapshot_id) {
            self.scvMaps.set(obj.snapshot_id, obj.id);
          }
        }
        this.getSoltData();
      } catch (res) {
      }
    },
     async getSoltData() {
      let Pid = this.$cookie.get('pid');
      let self = this;
      let data = [];
      //判断是否为超级管理员
      let roleType = Vue.roleType + "";
      let url = "api/manila/v2/" + Pid+ "/snapshots/detail?all_tenants=True";
      if ("2" == roleType || "3" == roleType) { //超级
          url= "api/manila/v2/" + Pid+ "/snapshots/detail";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });

        let snapshotsQuery = result['snapshots'];
        self.totalData = [];
        let name = self.queryParams.query_name==undefined?"":self.queryParams.query_name;
        let sharename = self.queryParams.query_share_name==undefined?"":self.queryParams.query_share_name;
        if (name === "" && sharename == "") {
          self.totalData = snapshotsQuery;
        } else if (name != "" && sharename == "") {
          //模糊查询,快照名称
          for (let i = snapshotsQuery.length - 1; i >= 0; i--) {
            if (snapshotsQuery[i].name.indexOf(name) >= 0) {
              self.totalData.push(snapshotsQuery[i]);
            }
          }
        } else if (name == "" && sharename != "") {
          //模糊查询文件存储名称
          for (let j = snapshotsQuery.length - 1; j >= 0; j--) {
            let temVolInfo = self.shareMap.get(snapshotsQuery[j].share_id);
            if (typeof (temVolInfo) == "undefined") {
              continue;
            }
            let tempVN = temVolInfo.name == "" ? temVolInfo.id : temVolInfo.name;
            if (tempVN.indexOf(sharename) >= 0) {
              self.totalData.push(snapshotsQuery[j]);
            }
          }
        } else {
          for (let q = snapshotsQuery.length - 1; q >= 0; q--) {
            let temVolInfo2 = self.shareMap.get(snapshotsQuery[q].share_id);
            if (typeof (temVolInfo2) == "undefined") {
              continue;
            }
             let tempVN2 = temVolInfo2.name == "" ? temVolInfo2.id : temVolInfo2.name;
            if (tempVN2.indexOf(sharename) >= 0 && snapshotsQuery[q].name.indexOf(name) >= 0) {
              self.totalData.push(snapshotsQuery[q]);
            }
          }
        }
      } catch (res) {
      }
    },
    async loadProjectList() {
      //查询所有的项目列表
      let self = this;
      let roleType = Vue.roleType + "";
      let url = "api/keystone/v3/projects?domain_id=default";
      if ("2" == roleType || "3" == roleType) { //非超级管理员，查询一个项目信息
        url = "api/keystone/v3/projects/" + this.$cookie.get("pid");
      }
       try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        self.projecNameMap = new Map();
        let projects = result['projects'];
        for (let p = 0; p < projects.length; p++) {
          let tempP = projects[p];
          self.projecNameMap.set(tempP.id, tempP.name);
        }
      } catch (res) {
      }
    },
    queryProjecName(value, rowData) {
      return this.projecNameMap.get(value);
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
        return this.$t('storage.restoring');
      } else if (value == "error_deleting") {
        return this.$t('storage.errorDeleting');
      }
    },
     dateRender(value, rowData) {
      let self = this;
      let createTime = rowData['created_at'];
      if (createTime.lastIndexOf("Z") < 0 && createTime.lastIndexOf(".") >= 0) {
        createTime = createTime.substring(0, createTime.lastIndexOf(".")) + "Z";
      }
      let time = Date.parse(new Date(createTime));
      return self.formatTimeStamp(time, "yyyy-MM-dd HH:mm:ss");
    },
    formatTimeStamp(timeStamp, fmt) {
      if (!timeStamp) {
        return "";
      }
      // timeStamp = timeStamp + 0; //北京时间比格林时间早八个小时
      let date = new Date();
      date.setTime(timeStamp);
      let o = {
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
      for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
      }
      return fmt;
    },
    idToNameRender(value, rowData) {
      let obj = this.shareMap.get(value);
      if (null == obj) {
        return value;
      }
      if ("" == obj.name) {
        return obj.id;
      }
      return obj.name;
    },
    isHasCreateShare(snapshotId) {
      let shareId = this.scvMaps.get(snapshotId);
      if (null == shareId || "" == shareId || typeof (shareId) == "undefined") {
        return false;
      }
      return true;
    },
    handleCreate() {
      this.newDosStorSlotFlg = false;
    },
    handleShow() {
      this.refreshFlag = false;
    },
    handlEditShow() {
      this.editFlag = false;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.loadData();
    },
    handleSizeChange(val) {
      this.listPara.pageSize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      this.listPara.page = val;
      this.loadData();
    },
    handleClick() {
    },
    handleCommand(c) {
    },
    addData() {
      this.$refs.newDosStor.hide();
    },
     getCurrentData(param) {
        this.tableData = param;
    }
  }
}
</script>
<style scoped>

</style>
