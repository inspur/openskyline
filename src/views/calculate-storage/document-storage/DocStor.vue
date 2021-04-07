<template>
<div>
  <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch"/>
  <div class="divider clearfix"></div>
  <div class="operation-panel" @mousedown="detailMouseDown">
    <operation-panel
      class="margin-tb5"
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
  </div>
  <div class="divider clearfix"></div>
  <el-table ref="shTable" :data="tableData" :default-sort="{prop: 'created_at', order: 'descending'}" @selection-change="handleSelectionChange" @sort-change="sortChange" highlight-current-row border stripe style="width: 100%;" slot="empty" row-key="id">
    <el-table-column reserve-selection type="selection" align="center" width="55">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('id') >= 0" prop="id" label="ID" align="left" sortable="custom" min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" align="left" sortable="custom" min-width="100">
      <template slot-scope="scope">
        <el-button @click="docDetail(scope.row)" type="text" size="small" >
          <span>{{scope.row.name == null || scope.row.name == "" ? scope.row.id : scope.row.name}}</span>
        </el-button>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('share_type') >= 0" prop="share_type_name" align="left" :label="$t('storage.shareStorageType')" min-width="100">
      <!-- <template slot-scope="scope">
        <span v-html="shareTypeRender(scope.row['share_type'], scope.row)"></span>
      </template> -->
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('project_id') >= 0" prop="project_id" align="left" :label="$t('lang.project')" min-width="100">
      <template slot-scope="scope">
        <span v-html="shareProjectRender(scope.row['project_id'], scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('size') >= 0" prop="size" align="left" :label="$t('storage.size')" min-width="100" sortable="custom">
      <template slot-scope="scope">
        <span>{{scope.row.size + " GB"}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" align="left" :label="$t('lang.status')" sortable="custom" min-width="100">
      <template slot-scope="scope">
        <span v-if="shareStatusRender(scope.row.status, scope.row)==='-'">-</span>
          <el-tag v-else :type="statusTagRender(scope.row.status)">
          <span v-html="shareStatusRender(scope.row.status, scope.row)"></span>
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('share_proto') >= 0" prop="share_proto" align="left" :label="$t('storage.protocol')" min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('created_at') >= 0" prop="created_at" align="left" :label="$t('lang.createTime')" min-width="100" sortable="custom">
      <template slot-scope="scope">
        <span>{{dateRender(scope.row.created_at, scope.row)}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('description') >= 0" prop="description" align="left" :label="$t('lang.desc')" min-width="100">
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh">
        </el-button>
          <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc("lang.item", multipleSelection.length)}}</span>
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
        <el-pagination class="right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :page-sizes="[5, 10, 20, 30, 50, 100, 200]"
          :current-page="currentPage"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-col>
    </el-row>
    <create-share-storage ref="createShareStorage" v-if="createShareStorageFlg" @onRefresh="loadData" @handleShow="addData">
    </create-share-storage>
    <edit-share ref="editShare" v-if="editShareFlag" :editShareData="handleRow" @onRefresh="loadData" @handleShow="editData"></edit-share>
    <edit-share-cap ref="editShareCap" v-if="editShareCapFlag" :editShareData="handleRow" @onRefresh="loadData" @handleShow="editCapData"></edit-share-cap>
    <visit-control ref="visitControl" v-if="visitControlFlg" :editShareData="handleRow" @onRefresh="loadData" @handleShow="visitShow"></visit-control>
    <refreshStatus ref="refreshStatus" v-if="refreshStatusFlg" @refreshStatusFun="refreshStatusFun" :volumeTempId="volumeTempId" :temp_volume_name="temp_volume_name"></refreshStatus>
    <create-share-snapshot ref="createShareSnapshot" v-if="createShareSnapshotFlg" :editShareData="handleRow" @onRefresh="loadData" @handleShow="ceateSnapshotShow" @hrefToSnapshotPage="hrefToSnapshotPage"></create-share-snapshot>
    <mount-vm ref="mountvm" v-if="mountvmFlag" :editShareData="handleRow" @onRefresh="loadData" @handleShow="editData"></mount-vm>
    <transition name="slide-right" mode="out-in">
        <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
          <panel style="height: 100%">
            <div slot="title" class="clearfix">
              <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
            </div>
            <div>
              <share-detail :shareInfo="handleRow" :projectMaps="projectMap" :userMaps="userMap"></share-detail>
            </div>
          </panel>
        </div>
      </transition>
  </div>
  <!-- <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project> -->
 </div>
</template>
<script>
import CreateShareStorage from './CreateShareStorage';
import EditShare from './EditShare';
import EditShareCap from './EditShareCap';
import VisitControl from './VisitControl';
import RefreshStatus from './RefreshStatus';
import CreateShareSnapshot from './CreateShareSnapshot';
import ShareDetail from './ShareDetail';
import MountVm from './MountVM';
export default {
  name: "DocStor",
  data() {
    return {
      sortObj: {
        sortOrder: "descending",
        sortField: "created_at"
      },
      searchBar: {
        conditions: {
          qName: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumber'));
              }
            }
          },
          projectName: {
            label: this.$t('lang.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          },
          qShareSatatus: {
            label: this.$t('lang.status'),
            type: 'select',
            options: []
          },
          qShareType: {
            label: this.$t('storage.shareStorageType'),
            type: 'select',
            options: []
          }
        }
      },
      searchBarValidatedParams: {},
      close: "",
      qShareType: "",
      qProjectId: "",
      qShareSatatus: "",
      handleRow: "",
      reqSource: "auto",
      // project_id:"",
      loading: false,
      hasInited: false,
      detailFlag: false,
      editShareFlag: false,
      selProjectFlg: false,
      visitControlFlg: false,
      editShareCapFlag: false,
      refreshStatusFlg: false,
      createShareStorageFlg: false,
      createShareSnapshotFlg: false,
      mountvmFlag: false,
      total: 0,
      currentPage: 1,
      pageSize: 10,
      statusList: [],
      shareTypeList: [],
      multipleSelection: [],
      userMap: new Map(),
      projectMap: new Map(),
      shareTypeMap: new Map(),
      tableData: [],
      rules: {
        qName: [
          { validator: (rule, value, cb) => {
            let reg = /^[_\-0-9a-zA-Z]+$/;
            if (!value || reg.test(value)) {
              return cb();
            } else {
              cb(this.$t("validation.onlyLetter_MinusNumber"));
            }
          }}
        ]
      },
      columnsChecked: ["name", "share_type", "project_id", "size", "status", "share_proto", "created_at", "description"],
      columns: [{
        prop: "id",
        label: "ID"
      }, {
        prop: "name",
        label: this.$t('lang.name')
      }, {
        prop: "share_type",
        label: this.$t('storage.shareStorageType')
      }, {
        prop: "project_id",
        label: this.$t('lang.project')
      }, {
        prop: "size",
        label: this.$t('storage.size')
      }, {
        prop: "status",
        label: this.$t('lang.status')
      }, {
        prop: "share_proto",
        label: this.$t('storage.protocol')
      }, {
        prop: "created_at",
        label: this.$t('lang.createTime')
      }, {
        prop: "description",
        label: this.$t('lang.desc')
      }],
      operationMenus: [{
        icon: "fa-plus",
        name: this.$t('storage.createShareStorage'),
        showflg: !this.isAdmin(),
        readOnly: true,
        handler: function(selectRows) {
          let me = this;
          me.createShareStorageFlg = true;
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: this.$t('lang.edit'),
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          let me = this;
          me.editShareFlag = true;
          me.$nextTick(() => {
            me.handleRow = selectRows[0];
            me.$refs.editShare.editShare.name = selectRows[0].name;
            if (typeof (selectRows[0].description) === "undefined" || null === selectRows[0].description) {
              me.$refs.editShare.editShare.description = "";
            } else {
              me.$refs.editShare.editShare.description = selectRows[0].description;
            }
            me.$refs.editShare.editShare.isPublic = selectRows[0].is_public;
            me.$refs.editShare.show();
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('lang.delete'),
        showflg: true,
        multi: this.isUser(),
        enable(rowData) {
          if (rowData["attachments"].length > 0) {
            return false;
          }
          return (rowData['status'] === "available" || rowData['status'] === "error" || rowData['status'] === "inactive");
        },
        handler: function(selectRows) {
          let self = this;
          self.$prompt(this.$t('storage.deleteDocStoreConfirmMsg'), this.$t('lang.confirm'), {
            confirmButtonText: this.$t('lang.confirm'),
            cancelButtonText: this.$t('lang.cancel'),
            inputPattern: /^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage: this.$t('lang.onlyAcceptYesOrNo')
          }).then(async({ value }) => {
            if ("yes" === value.toLowerCase()) {
              self.$sequence({
                type: 'delete',
                url: 'api/manila/v2/' + this.$cookie.get('pid') + "/shares/{id}",
                params: selectRows,
                errorKey: "badRequest",
                log: {
                  description: {
                    en: "Delete Share{name}({id})",
                    zh_cn: "删除文件存储{name}({id})"
                  },
                  target: Vue.logTarget.storage_share
                },
                successFun: function() {
                  for (let r = 0; r < selectRows.length; r++) {
                    let row = selectRows[r];
                    //let volume = self.volumeMaps.get(row.id);
                    row['status'] = "deleting";
                  }
                }
                // successMsg: "删除发送成功",
              }).then((data) => {
                this.$message(this.$t('lang.sendDeleteSuccess'));
                self.loading = true;
                self.$refs.shTable.clearSelection();
                setTimeout( function() {
                  //self.queryClick();
                  self.loadData();
                  self.loading = false;
                }, 5000);
              }).catch((err) => {});
            }
          }).catch(() => {
                  //取消
          });
        }.bind(this)
      }, {
        icon: "fa-refresh",
        name: this.$t("storage.refreshStatus"),
        showflg: this.isAdmin(),
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          let me = this;
          let row = selectRows[0];
          me.volumeTempId = row["id"];
          me.temp_volume_name = row["name"];
          me.refreshStatusFlg = true;
          me.$nextTick(() => {
            me.$refs.refreshStatus.show();
          });
        }.bind(this)
      }, {
        icon: "fa-camera",
        name: this.$t('storage.createSnapshot'),
        showflg: (!this.isAdmin() && this.isUser()),
        enable(rowData) {
          return (rowData['status'] === "available");
        },
        handler: function(selectRows) {
          let me = this;
          me.handleRow = selectRows[0];
          me.createShareSnapshotFlg = true;
          /*me.$nextTick(() => {
            me.$refs.createShareSnapshot.show();
          });*/
        }.bind(this)
      }, {
        icon: "fa-clone",
        name: this.$t('storage.refreshStatus'),
        showflg: false && this.isAdmin(),
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          let me = this;
          me.refreshStatusFlg = true;
          me.$nextTick(() => {
            me.$refs.refreshStatus.show();
          });
        }.bind(this)
      }, {
        icon: "fa-clone",
        name: this.$t('storage.updateCapability'),
        showflg: !this.isAdmin(),
        enable(rowData) {
          return (rowData['status'] === "available");
        },
        handler: function(selectRows) {
          let me = this;
          me.editShareCapFlag = true;
          me.handleRow = selectRows[0];
          me.$nextTick(() => {
            me.$refs.editShareCap.editShareCapData.name = selectRows[0].name;
            me.$refs.editShareCap.editShareCapData.cap = selectRows[0].size;
            me.$refs.editShareCap.editShareCapData.oldCap = selectRows[0].size;
            me.$refs.editShareCap.show();
          });
        }.bind(this)
      }, {
        icon: "fa-clone",
        name: this.$t('storage.visitAccess2'),
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          let me = this;
          me.visitControlFlg = true;
          me.handleRow = selectRows[0];
          me.$nextTick(() => {
            me.$refs.visitControl.show(selectRows[0].id, selectRows[0].share_proto);
          });
        }.bind(this)
      }, {
        icon: "fa-gear",
        name: this.$t("storage.manageConnect"),
        showflg: Vue.showManageConnect,
        multi: false,
        enable(rowData) {
          if (rowData["share_proto"] === "NFS" && rowData["status"]==="available") {
            return true;
          }
          return false;
        },
        handler: function(selectRows) {
          let me = this;
          me.mountvmFlag = true;
          me.handleRow = selectRows[0];
          me.$nextTick(() => {
            me.$refs.mountvm.init();
          });
        }.bind(this)
      }]
    };
  },
  beforeDestroy() {
    if (this.interVmValid !== null) {
      clearInterval(this.interVmValid);
    }
  },
  watch: {
    sortObj() {
      if (this.sortObj&&this.sortObj.sortOrder&&this.sortObj.sortField) {
        this.loadData();
      }
    },
    tableData: {
      immediate: false,
      handler: function(list) {
        let self = this;
        self.reloadTblFlag = true;
        clearInterval(self.interVmValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interVmValid = setInterval(() => {
              //this.queryClick();
            this.loadData("auto");
          }, 5000);
        }
      }
    }
  },
  mounted() {
    let self = this;
    self.buildStatusList();
    this.reqSource = "auto";
    self.loadUserList();
    Promise.all([self.loadProjectList(), self.loadShareType()]).then(function(result) {
      self.getData();
    });
  },
  methods: {
    detailMouseDown() {
      let self = this;
      self.detailFlag = false;
    },
    sortChange(column) {
      let self = this;
      if (!column.prop) { return; }
      self.reqSource = "click";
      self.sortObj = {
        sortOrder: column.order,
        sortField: column.prop
      };
    },
    docDetail(colume) {
      this.handleRow = colume;
      this.detailFlag = true;
    },
    buldQryParam() {
      let self = this;
      let qryParam = "";
      if (self.searchBarValidatedParams.projectName) {
        qryParam = qryParam + "&project_id=" + self.searchBarValidatedParams.projectName;
      }
      if (self.searchBarValidatedParams.qShareType) {
        qryParam = qryParam + "&share_type_id=" + self.searchBarValidatedParams.qShareType;
      }
      if (self.searchBarValidatedParams.qShareSatatus) {
        qryParam = qryParam + "&status=" + self.searchBarValidatedParams.qShareSatatus;
      }
      if (self.searchBarValidatedParams.qName) {
        qryParam = qryParam + "&name=" + self.searchBarValidatedParams.qName;
      }
      return qryParam;
    },
    async getData() {
      this.currentPage = 1;
      this.$refs.shTable.clearSelection();
      this.loadData("click");
    },
    /**
     * @param source 为请求的来源，auto是自动刷新，click是操作触发的。
     * this.reqSource 初始化为auto，一旦产生手动刷新改为click，
     * source为click的 请求完成后，会重置this.reqSource 为auto
     * 如果source 为auto，this.reqSource为click，则没发起的请求return false，
     * 已经发出去的请求，等有返回值的的时候也return false；保证自动刷新可以正常使用。
     */
    async loadData(source) {
      let self = this;
      if (this.reqSource === "click" && source ==="auto") {
        return false;
      }
      self.loading = true;
      let projectId = self.$cookie.get('pid');
      let url = "api/manila/v2/" + projectId + "/inspur-shares/detail?all_tenants=True&";
      if ("2" === roleType || "3" === roleType) { //超级
        url= "api/manila/v2/" + projectId + "/inspur-shares/detail?";
      }
      let qryParam = self.buldQryParam();
      let keyOrder = "desc";
      if (self.sortObj.sortOrder !== "descending") {
        keyOrder = "asc";
      }
      let data = {
        with_count: "True",
        limit: self.pageSize,
        sort_dir: keyOrder,
        sort_key: self.sortObj.sortField,
        offset: self.pageSize * (self.currentPage - 1)
      };
      url = url + $.param(data) + qryParam;
      try {
        let ret = await this.$ajax({
          type: 'GET',
          url: url,
          headers: {
            "X-Openstack-Manila-Api-Version": "2.40"
          }
        });
        if (this.reqSource === "click" && source ==="auto") {
          return false;
        }
        if (source !=="auto") {
          this.reqSource = 'auto';
        }
        self.tableData = ret['shares'];
        if (ret['count']) {
          this.total = ret['count'];
        } else {
          this.total = 0;
        }
        this.hasInited = true;
        this.loading = false;
        if (this.reqSource) {}
      } catch (data) {
        this.loading = false;
      }
    },
    handleSearch(params) {
      this.searchBarValidatedParams = params;
      this.getData();
    },
    refreshStatusFun() {
      let self = this;
      self.refreshStatusFlg = false;
      setTimeout(function () {
        self.loadData(true);
      }, 1000);
    },
    async loadProjectList() {
      let self = this;
      try {
        let url = "api/keystone/v3/projects?domain_id=default";
        if (Vue.roleType !== '0') {
          url = "api/keystone/v3/projects/" + this.$cookie.get("pid");
        }
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        if (Vue.roleType !== '0') {
          self.projectMap.set(result['project'].id, result['project'].name);
        } else {
          let projects = result['projects'];
          for (let q = 0; q < projects.length; q++) {
            self.projectMap.set(projects[q].id, projects[q].name);
          }
          self.searchBar.conditions.projectName.options = result.projects.map(item => {
            return {
              label: item.name,
              value: item.id
            };
          });
        }
      } catch (res) {
      }
    },
    async loadUserList(projectId) {
      let self = this;
      let roleType = Vue.roleType + "";
      let url = "";
      if ("2" === roleType || "3" === roleType) {
        url = "api/keystone/v3/users?project_id=" + self.$cookie.get("pid");
      } else {
        url = "api/keystone/v3/users?domain_id=default";
      }
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: false
        });
        let users = result["users"];
        let userList = [];
        users.forEach(item => {
          self.userMap.set(item["id"], item["name"]);
        });
      } catch (res) {
        self.loading = false;
      }
    },
    async loadShareType() {
      this.shareTypeMap = new Map();
      try {
        let result = await this.$ajax({
          type: 'get',
          url: "api/manila/v2/" + this.$cookie.get("pid") + "/types",
          showErrMsg: false
        });
        let shareTypeList = result['share_types'];
        for (let i = shareTypeList.length - 1; i >= 0; i--) {
          this.shareTypeMap.set(shareTypeList[i].id, shareTypeList[i].name);
          this.shareTypeList.push({"id": shareTypeList[i].id, "name": shareTypeList[i].name});
        }
        this.searchBar.conditions.qShareType.options = this.shareTypeList.map(item => {
          return {
            label: item.name,
            value: item.id
          };
        });
      } catch (res) {
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    hrefToSnapshotPage() {
      this.$router.push({
        path: '/calculate-storage/snapshot/dsSnapShot'
      });
    },
    handleSizeChange(val) {
      console.log(val);
      this.reqSource="click";
      this.pageSize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      console.log(val);
      this.reqSource="click";
      this.currentPage = val;
      this.loadData();
    },
    handleClick() {
    },
    handleCommand(c) {
    },
    onBack() {
      this.detailFlag = false;
    },
    addData() {
      this.createShareStorageFlg = false;
    },
    editData() {
      this.editShareFlag = false;
      this.mountvmFlag = false;
    },
    editCapData() {
      this.editShareCapFlag = false;
    },
    visitShow() {
      this.visitControlFlg = false;
    },
    ceateSnapshotShow() {
      this.createShareSnapshotFlg = false;
    },
    shareProjectRender(value, rowData) {
      let name = this.projectMap.get(value);
      if (null === name || "" === name) {
        return value;
      } else {
        return name;
      }
    },
    shareUserRender(value, rowData) {
      let name = this.userMap.get(value);
      if (null === name || "" === name) {
        return value;
      } else {
        return name;
      }
    },
    onRefresh() {
      this.$refs.shTable.clearSelection();
      this.reqSource = "click";
      this.loadData();
    },
    isAdmin() {
      let roleType = Vue.roleType + "";
      if ("2" === roleType || "3" === roleType) {
        return false;
      }
      return true;
    },
    isUser() {
      let roleType = Vue.roleType + "";
      if ("3" === roleType) {
        return false;
      }
      return true;
    },
    shareTypeRender(value, rowData) {
      let name = this.shareTypeMap.get(value);
      if (null === name || "" === name) {
        return value;
      } else {
        return name;
      }
    },
    statusTagRender(status) {
      if ("available" === status || "reserved" === status) {
        return "success";
      } else if ("deleting" === status) {
        return "gray";
      } else if ("creating" === status || "attaching" === status || "detaching" === status || "extending" === status) {
        return "info";
      } else if ("error" === status || "error_deleting" === status || "ERROR" === status || "UNKNOW" === status) {
        return "danger";
      } else if ("in-use" === status || "backing-up" === status || "restoring-backup" === status) {
        return "info";
      } else if ("maintenance" === status) {
        return "warning";
      } else if ("downloading" === status || "uploading" === status ) {
        return "info";
      } else {
        return "stateless";
      }
    },
    shareStatusRender(value, rowData) {
      if ("available" === value) {
        return this.$t('storage.available');
      } else if ("creating" === value) {
        return this.$t('storage.creating');
      } else if ("deleting" === value) {
        return this.$t('storage.deleting');
      } else if ("error" === value) {
        return this.$t('storage.error');
      } else if ("error_deleting" === value) {
        return this.$t('storage.errorDeleting');
      } else if ("extending" === value) {
        return this.$t('storage.extending');
      } else if ("extending_error" === value) {
        return this.$t('storage.extendingError');
      //  } else if ("shrinking" == value) {
      //   return this.$t('storage.shrinking');
      //  } else if ("deleted" == value) {
      //    return this.$t('storage.deleted');
      //  } else if ("inactive" == value) {
      //    return this.$t('storage.inactive');
      //  } else if ("manage_starting" == value) {
      //    return this.$t('storage.managing');
      //  } else if ("manage_error" == value) {
      //    return this.$t('storage.manageError');
      //  } else if ("unmanage_starting" == value) {
      //    return this.$t('storage.unmanageStarting');
      //  } else if ("umanage_error" == value) {
      //    return this.$t('storage.umanageError');
      //  } else if ("unmanaged" == value) {
      //    return this.$t('storage.unmanaged');
      } else {
        if (value !== null) {
          return value;
        } else {
          return '-';
        }
      }
    },
    buildStatusList() {
      this.statusList = [];
      this.statusList.push({"id": "available", "name": this.$t('storage.available')});
      this.statusList.push({"id": "creating", "name": this.$t('storage.creating')});
      this.statusList.push({"id": "deleting", "name": this.$t('storage.deleting')});
      this.statusList.push({"id": "error", "name": this.$t('storage.error')});
      this.statusList.push({"id": "error_deleting", "name": this.$t('storage.errorDeleting')});
      this.statusList.push({"id": "extending", "name": this.$t('storage.extending')});
      this.statusList.push({"id": "extending_error", "name": this.$t('storage.extendingError')});
      // this.statusList.push({"id":"deleted", "name":this.$t('storage.deleted')});
      // this.statusList.push({"id":"manage_starting", "name":this.$t('storage.managing')});
      // this.statusList.push({"id":"manage_error", "name":this.$t('storage.manageError')});
      // this.statusList.push({"id":"unmanage_starting", "name":this.$t('storage.unmanageStarting')});
      // this.statusList.push({"id":"umanage_error", "name":this.$t('storage.umanageError')});
      // this.statusList.push({"id":"unmanaged", "name":this.$t('storage.unmanaged')});
      this.searchBar.conditions.qShareSatatus.options = this.statusList.map(item => {
        return {
          label: item.name,
          value: item.id
        };
      });
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
      let date = new Date();
      date.setTime(timeStamp);
      let o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, //小时
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
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
      }
      return fmt;
    }
  },
  components: {
    CreateShareStorage,
    EditShare,
    EditShareCap,
    VisitControl,
    CreateShareSnapshot,
    RefreshStatus,
    ShareDetail,
    MountVm
  }
};
</script>
<style scoped>

</style>
