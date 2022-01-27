<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel" @mousedown="detailMouseDown">
      <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="shTable" v-loading="loading" :data="tableData" highlight-current-row border stripe style="width: 100%;" row-key="id" :default-sort="{prop: 'created_at', order: 'descending'}" @sort-change="sortChange" @selection-change="handleSelectionChange">
      <el-table-column reserve-selection type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" align="left" sortable="custom" min-width="100">
        <template slot-scope="scope">
          <span>{{scope.row.name == null || scope.row.name == "" ? scope.row.id : scope.row.name}}</span>
        </template>      
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('id') >= 0" prop="id" :label="$t('storage.snapShotId')" align="left" sortable="custom" min-width="130">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('project_id') >= 0 && roleType == '0'" :label="$t('lang.project')" prop="project_id" align="left" min-width="40">
        <template slot-scope="scope">
          <span v-html="projectRender(scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('volume_owner') >= 0" prop="volume_owner" align="left" :label="$t('storage.owner')" min-width="60">
        <template slot-scope="scope">
          <span v-html="volumeUserRender(scope.row.user_id)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('volume_size') >= 0" prop="volume_size" align="left" :label="$t('storage.size')" sortable="custom" min-width="60">
        <template slot-scope="scope">
          <span>{{scope.row.size + " GB"}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" align="left" :label="$t('lang.status')" sortable="custom" min-width="60">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.status)">
            <span v-html="statusRender(scope.row.status)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('volume_id') >= 0" prop="volume_id" :label="$t('calcStorLang.fvolumeName')" align="left" min-width="100">
        <template slot-scope="scope">
          <el-button @click="vmDetail(scope.row)" type="text" size="small">
            <span v-html="idToNameRender(scope.row)"></span>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('created_at') >= 0" prop="created_at" sortable="custom" align="left" :label="$t('lang.createTime')" min-width="100">
        <template slot-scope="scope">
          <span>{{dateRender(scope.row.created_at, scope.row)}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('description') >= 0" prop="description" :label="$t('lang.desc')" align="left" min-width="100">
        <template slot-scope="scope">
          <span>{{scope.row.description}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onTblRefresh">
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
          <el-pagination
              class="right"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :page-sizes="[5, 10, 20, 30, 40, 60, 80, 100]"
              :current-page="currentPage"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
        </el-col>
      </el-row>
      <!-- <volume-list ref="VolumeList"  v-if="createVolSoltFlag" @handlecreateShow="handlecreateShow"></volume-list> -->
      <create-volume ref="createVolume" v-if="createVolumeFlag" @handleAddShow="handleAddShow" :volumSoltId="volumSoltId" :projectId="projectId" :projectMap="showProjectInfo" :volumSoltName="volumSoltName" :soltSize="soltSize" @hrefToVolumeListPage="hrefToVolumeListPage" @onRefresh="onRefresh"></create-volume>
      <volume-solt-edit ref="VolumeSoltEdit" v-if="volumeSoltEditFlag" :volumSoltId="volumSoltId" :volumSoltName="volumSoltName" :volumSoltDesc="volumSoltDesc" @onRefresh="onRefresh" @handlEditShow="handlEditShow"></volume-solt-edit>
      <refresh-status ref="RefreshStatus" v-if="refreshStatusFlag" :volumSoltId="volumSoltId" :volumSoltName="volumSoltName" @onRefresh="onRefresh" @handleShow="handleShow">
      </refresh-status>
      <transition name="slide-right" mode="out-in">
        <div style="width: 800px;" class="slide-panel" v-if="voldetailFlag">
          <panel style="height: 100%">
            <div slot="title" class="clearfix">
              <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
            </div>
            <div>
              <volume-detail :detailVolume="detailVolume" :userName="showUserInfo.name" :vmpName="showProjectInfo.name" :deviceUN="vmNames"></volume-detail>
            </div>
          </panel>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import CreateVolume from './CreateVolume';
import VolumeSoltEdit from './VolumeSoltEdit';
import RefreshStatus from './RefreshStatus';
import VolumeDetail from '../volume/VolumeDetail'
export default {
  name: "VolumeSolt",
  components: {
    CreateVolume, VolumeSoltEdit, RefreshStatus, VolumeDetail
  },
  data() {
    return {
      searchBar: {
        conditions: {
          soltName: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[-_0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_NumberChinese'));
              }
            }
          },
          volumeName: {
            label: this.$t('calcStorLang.fvolumeName'),
            type: 'input',
            validator: (value) => {
              if (!/^[-_0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_NumberChinese'));
              }
            }
          },
          snapshotId: {
            label: this.$t('calcStorLang.snapshotId'),
            type: 'input',
            validator: (value) => {
              if (!/^[a-fA-F0-9\-]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyUUIDKeyword'));
              }
            }
          }
        }
      },
      queryParams: {},
      sortObj: {
        sortOrder: "descending",
        sortField: "created_at"
      },
      currentPage: 1,
      pageSize: 10,
      total: 0,
      projectId :"",
      projectInfo:{},
      loading:false,
      roleType: Vue.roleType + "",
      showProjectInfo: '',
      showUserInfo: '',
      vmNames: '',
      multipleSelection: [],
      tableData: [],
      userList: [],
      createVolSoltFlag: false,
      createVolumeFlag: false,
      volumeSoltEditFlag: false,
      volumSoltId: '',
      soltSize: '',
      volumSoltName: '',
      refreshStatusFlag: false,
      refreshMetadataFlg: false,
      voldetailFlag: false,
      reloadTblFlag: false,
      //  tzTimeFormatter: this.$tzTimeFormatter,
      totalData: [],
      hasInited:false,
      projectMap: new Map(),
      scvMaps: new Map(),
      userMap: new Map(),
      instanceMaps: new Map(),
      detailVolume: '',
      columnsChecked: ["name", "project_id", "volume_owner", "volume_size", "status", "volume_id", "created_at"],
      columns: [{
        prop: "name",
        label: this.$t('lang.name')
      }, {
        prop: "id",
        label: this.$t('storage.snapShotId')
      }, {
        prop: "project_id",
        label: this.$t('lang.project')
      }, {
        prop: "volume_owner",
        label: this.$t("storage.owner")
      }, {
        prop: "volume_size",
        label: this.$t('storage.size')
      }, {
        prop: "status",
        label: this.$t('lang.status')
      }, {
        prop: "volume_id",
        label: this.$t('calcStorLang.fvolumeName')
      }, {
        prop: "created_at",
        label: this.$t('lang.createTime')
      }, {
        prop: "description",
        label: this.$t('lang.desc')
      }],
      operationMenus: [/*{
        icon: "fa-plus",
        name: "创建快照",
        showflg: true,
        multi: false,
        readOnly: true,
         handler: function(selectRows) {
          let me = this;
          me.createVolSoltFlag = true;
        }.bind(this)
      }, */{
        icon: "fa-pencil",
        name: this.$t('storage.editSnapShot'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return (rowData['status'] + "" == "available");
        },
        handler: function (selectRows) {
          let self = this;
          self.volumSoltId = selectRows[0].id;
          if (typeof (selectRows[0].name) == "undefined" || null == selectRows[0].name || '' == selectRows[0].name) {
            self.volumSoltName = selectRows[0].id;
          } else {
            self.volumSoltName = selectRows[0].name;
          }
          self.volumSoltDesc = selectRows[0].description;
          self.volumeSoltEditFlag = true;
        }.bind(this)
      }, {
        icon: "fa-plus",
        name: this.$t('storage.createVolume'),
        showflg: (Vue.roleType + "" != "3"),
        multi: false,
        enable(rowData) {
          return (rowData['status'] + "" == "available");
        },
        handler: function (selectRows) {
          this.createVolumeFlag = true;
          this.projectId = selectRows[0]["os-extended-snapshot-attributes:project_id"];
          this.showProjectInfo =this.projectMap.get(this.projectId);
          this.volumSoltId = selectRows[0].id;
          this.volumSoltName = selectRows[0].name;
          self.soltSize = selectRows[0].size;
        }.bind(this)
      }, {
        icon: "fa-refresh",
        name: this.$t('storage.refreshStatus'),
        showflg: (Vue.roleType + "" == "0"),
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          let self = this;
          self.volumSoltId = selectRows[0].id;
          self.volumSoltName = selectRows[0].name;
          this.refreshStatusFlag = true;
          this.$nextTick(() => {
            this.$refs.RefreshStatus.show();
          });
        }.bind(this)
      }, {
        icon: "fa-refresh",
        name: this.$t('storage.refreshMetaData'),
        showflg: false,
        multi: false,
        enable(rowData) {
          return (rowData['status'] + "" == "0");
        },
        handler: function (selectRows) {
          this.refreshMetadataFlg = true;
          this.$nextTick(() => {
            this.$refs.RefreshMetadata.show();
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          if (Vue.roleType == "0") {
            return ["deleting", "error_deleting", "error", "available"].includes(rowData["status"]);
          } else {
            return ["error", "available"].includes(rowData["status"]);
          }
        },
        handler: function (selectRows) {
          let row = selectRows[0];
          let self = this;
          let url = "";
          let data = null
          let type = "";
          type = "delete";
          url = "api/cinderv3/v3/" + this.$cookie.get('pid') + "/snapshots/{id}";
          this.$prompt(this.$t('lang.inputYesToContinue'), this.$t('lang.confirm'), {
            confirmButtonText: this.$t('lang.confirm'),
            cancelButtonText: this.$t('lang.cancel'),
            inputPattern: /^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage: this.$t('lang.onlyAcceptYesOrNo')
          }).then(async ({ value }) => {
            if ("yes" == value.toLowerCase()) {
              self.$sequence({
                type: type,
                url: url,
                params: selectRows,
                data:data,
                log: {
                  description: {
                    en: "Send delete volume snapshot ",
                    zh_cn: "发送删除云硬盘快照"
                  },
                  key: "name",
                  target: Vue.logTarget.storage_volume_snapshot
                }
              }).then((data) => {
                self.loading = true;
                self.$message(Vue.t('storage.sendDeleteSuccess'));
                for (let r = 0; r < selectRows.length; r++) {
                  selectRows[r].status = "deleting";
                }
                self.$refs.shTable.clearSelection();
                setTimeout(function () {
                  self.getData(self.queryParams);
                  self.loading = false;
                }, 5000);
              }).catch((err) => { });
            }
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('storage.forceDelete'), //强制删除按钮
        showflg: Vue.roleType + "" === "0",
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          let self = this;
          let pid = this.$cookie.get('pid');
          let status = this.statusRender(selectRows[0]["status"]);
          let { id : snapshotId = "", name : snapshotName = "" } = selectRows[0];
          if (snapshotName) {
            snapshotName = `${snapshotName}(${snapshotId})`;
          } else {
            snapshotName = snapshotId;
          }
          let body = {
            "os-force_delete" : {}
          };
          body = JSON.stringify(body);
          let content = '';
          if ("backing-up" == selectRows[0]["status"]) {
            content = `${this.$t('storage.forceDeleteBackupVolSoltMsg', status)},${this.$t('lang.inputYesToContinue')}`;
          } else {
            content = `${this.$t('storage.forceDeleteVolSoltMsg', status)},${this.$t('lang.inputYesToContinue')}`;
          }
          this.$prompt(content, this.$t('lang.confirm'), {
            confirmButtonText: this.$t('lang.confirm'),
            cancelButtonText: this.$t('lang.cancel'),
            inputPattern: /^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage: this.$t('lang.onlyAcceptYesOrNo')
          }).then(async ({ value }) => {
            if ("yes" == value.toLowerCase()) {
              //try {
                let result = await self.$ajax({
                  type: "post",
                  url: `api/cinderv3/v3/${pid}/snapshots/${snapshotId}/action`,
                  showErrMsg: false,
                  data: body,
                  successFun() {
                    self.$message(self.$t('storage.sendDeleteSuccess'));
                    self.$refs.shTable.clearSelection();
                    setTimeout(function () {
                      self.getData(self.queryParams);
                      self.loading = false;
                    }, 5000);
                  },
                  log: {
                    description: {
                      en: "Send delete volume snapshot " + snapshotName,
                      zh_cn: "发送删除云硬盘快照" + snapshotName
                    },
                    target: Vue.logTarget.storage_volume_snapshot
                  }
                });
              // } catch (res) {
              // }
            }
          }).catch(() => {
            //取消
          });
        }.bind(this)
      }]
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
      handler: function (list) {
        var self = this;
        self.reloadTblFlag = false;
        if (list != null) {
          for (var t = 0; t < list.length; t++) {
            var obj = list[t];
            if (obj['OS-EXT-STS:task_state'] != null || obj['status'] == "creating" || obj['status'] == "attaching" || obj['status'] == "detaching" || obj['status'] == "deleting" || obj['status'] == "backing-up" || obj['status'] == "restoring-backup" || obj['status'] == "retyping") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.interVmValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interVmValid = setInterval(() => {
            self.getData(self.queryParams);
          }, 5000);
        }
      }
    }
  },
  mounted() {
    var self = this;
    self.loading = true;
    self.queryParams= {

    }
    Promise.all([
      self.loadProjectList(),
      self.loadUserList(),
      self.loadInstanceList()
    ]).then(function (result) {
      self.loadData();
    });
    var roleType = Vue.roleType + "";
    if ("2" == roleType || "3" == roleType) {
      self.columns.splice(2, 1);
    }
    self.loading = false;
  },
  methods: {
    async loadProjectList() {
      //查询所有的项目列表
      var self = this;
      self.loading = true;
      var roleType = Vue.roleType + "";
      //当前登录用户参与和管理的项目列表
      const joinedProjecList = Vue.projectList;
      if (roleType != "0") {
        for (let i = 0; i < joinedProjecList.length; i++) {
          let project = joinedProjecList[i];
          if (project['roleId'] != "SuperAdmin") {
            self.projectMap.set(project.id, project);
          }
        }
        return false;
      }
      let url = "api/keystone/v3/inspur/projects?domain_id=default";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        self.loading = false;
        let projects = result['projects'];
        for (let q = 0; q < projects.length; q++) {
          let projectInfo = projects[q];
          self.projectMap.set(projectInfo.id, projectInfo);
        }
      } catch (res) {
        self.loading = false;
      }
    },
    handleSearch(params) {
      this.queryParams = params;
      this.$refs.shTable.clearSelection();
      this.loadData();
    },
    detailMouseDown() {
      var self = this;
      self.voldetailFlag = false;
    },
    sortChange(column) {
      var self = this;
      var keyOrder = "desc";
      if ("descending" == column.order) {
        keyOrder = "desc";
      } else {
        keyOrder = "asc";
      }
      if (!column.prop) {
        return;
      }
      self.sortObj = {
        sortOrder: keyOrder,
        sortField: column.prop
      };
      self.getData(self.queryParams);
    },
    isHasCreateVolume(snapshotId) {
      var volumeId = this.scvMaps.get(snapshotId);
      if (null == volumeId || "" == volumeId || typeof (volumeId) == "undefined") {
        return false;
      }
      return true;
    },
    loadData() {
      this.currentPage = 1;
      this.getData(this.queryParams);
    },
    async getData(params) {
      let self = this;
      let Pid = this.$cookie.get('pid');
      let roleType = Vue.roleType + "";
      let sortField = self.sortObj.sortField;
      let sortOrder = self.sortObj.sortOrder;
      let data = {
        // id: params.snapshotId==undefined?"":params.snapshotId,
        // display_name: params.soltName==undefined?"":params.soltName,
        // vol_name: params.volumeName==undefined?"":params.volumeName,
        limit: self.pageSize,
        with_count: "True",
        offset: self.pageSize * (self.currentPage - 1),
        sort_key: sortField,
        sort_dir: sortOrder
      };
      let url = "api/cinderv3/v3/" + Pid + "/snapshots/detail?all_tenants=True&";
      if ("2" == roleType || "3" == roleType) {
        url = "api/cinderv3/v3/" + Pid + "/snapshots/detail?";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url + $.param(data),
          headers: {
            "OpenStack-API-Version": "volume 3.45"
          }
        });
        let snapshotsData = result['snapshots'];
        self.totalData = [];
        self.total = result["count"];
        let len = snapshotsData.length;
        for (let i = 0; i < len; i++) {
            //项目用户登陆，需要判断是否由该用户创建的云硬盘
            if (!self.isUser() && tempVolInfo.user_id != Vue.userId) {
              continue;
            }
          self.totalData.push(snapshotsData[i]);
        }
        self.tableData = self.totalData;
        self.hasInited = true;
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    async deleteVolumeSolt(row) {
      var self = this;
      var Pid = this.$cookie.get('pid');
      try {
        let result = await this.$ajax({
          type: 'delete',
          url: 'api/cinderv3/v3/' + Pid + '/snapshots/' + row['id'],
          data: {},
          confirmMsg: this.$t('storage.deleteVolSnapShotConfirm'),
          successMsg: this.$t('storage.deleteVolSnapShotSuccess'),
          successFun() {
            self.$refs.shTable.clearSelection();
            self.getData(this.queryParams);
          },
          errFun(error) {
          }
        });
      } catch (data) {
        __DEV__ && console.error(data);
      }
    },
    isUser() {
      var roleType = Vue.roleType + "";
      if ("3" == roleType) {
        return false;
      }
      return true;
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
    statusRender(value) {
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
      } else if (value == "clone_error") {
        return this.$t('storage.clone_error');
      }
    },
    async loadUserList() {
      var self = this;
      self.loading = true;
      self.userList = [];
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
        self.userList = self.userList.concat(result["users"]);
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    volumeUserRender(userId) {
      let user = this.userMap.get(userId);
      if (user) {
        return user["name"];
      } else {
        return "--"
      }
    },
    handleShow() {
      this.refreshStatusFlag = false;
    },
    handleAddShow() {
      this.createVolumeFlag = false;
    },
    handlEditShow() {
      this.volumeSoltEditFlag = false;
    },
    handlecreateShow() {
      this.createVolSoltFlag = false;
    },
    handleMetaDataShow() {
      this.refreshMetadataFlg = false;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onTblRefresh() {
      this.$refs.shTable.clearSelection();
    },
    onRefresh() {
      let self = this;
      self.getData(this.queryParams);
      self.onTblRefresh();
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData(this.queryParams);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getData(this.queryParams);
    },
    async vmDetail(rowData) {
      let self = this;
      let pid = rowData['os-extended-snapshot-attributes:project_id'];
      //获取项目信息
      self.showProjectInfo = this.projectMap.get(pid);
      if (!self.showProjectInfo) {
        self.showProjectInfo={
          name : pid
        };
      }
      //获取卷所属用户信息
      self.showUserInfo = this.userMap.get(rowData["user_id"]);
      //获取卷详情
      let volumeInfo = await this.qryVolumeById(rowData["volume_id"])
      self.detailVolume = volumeInfo;
      //获取卷关联主机详情
      this.vmNames = this.volumeMountInfo(volumeInfo);
      this.voldetailFlag = true;
    },
    async qryVolumeById(volumeId) {
      var self = this;
      try {
        let result = await self.$ajax({
          type: "get",
          url: "api/cinderv3/v3/" + this.$cookie.get('pid') + "/volumes/" + volumeId,
          showErrMsg: false
        });
        return result["volume"];
      } catch (res) {
      }
    },
    onBack() {
      this.voldetailFlag = false;
    },
    projectRender(rowData) {
      let pid = rowData['os-extended-snapshot-attributes:project_id'];
      if ("" == pid) {
        return "--";
      }
      let objPro = this.projectMap.get(pid);
      if (objPro) {
        return objPro["name"] || pid;
      } else {
        return pid;
      }
    },
    idToNameRender(rowData) {
      return rowData["name"] || rowData["volume_id"];
    },
    hrefToVolumeListPage() {
      this.$router.push({
        path: '/calculate-storage/volume/VolumeList'
      });
    },
    async loadInstanceList() {
      //查询主机列表
      let self = this;
      let roleType = Vue.roleType + "";
      let projectId = this.$cookie.get("pid");
      let url = "api/nova/v2.1/servers/detail?all_tenants=1";
      if ("2" == roleType || "3" == roleType) {
        url = "api/nova/v2.1/servers/detail?project_id=" + projectId;
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          showErrMsg: false
        });
        let servers = result['servers'];
        let serverList = [];
        for (let q = 0; q < servers.length; q++) {
          let tempServer = servers[q];
          /* 区分云主机和云物理机*/
          if (tempServer["tags"] && tempServer["tags"].includes("@")) {
            self.instanceMaps.set(tempServer.id, {type:"physicalHost", data: tempServer});
          } else {
            self.instanceMaps.set(tempServer.id, {type:"instance", data: tempServer});
          }
        }
      } catch (res) {
        self.loading = false;
        console.log(res);
      }
    },
    volumeMountInfo(voInfo) {
      var self = this;
      var vmList = voInfo["attachments"];
      if (vmList != null) {
        let vms = [];
        for (let m = 0; m < vmList.length; m++) {
          let entity = vmList[m];
          let server = self.instanceMaps.get(entity["server_id"]);
          if (server) {
            let data = server.data;
            let serverName = data.name
            if (!serverName) {
              serverName = entity["server_id"];
            }
            if (server.type == "instance") {
              vms.push(self.$t("calcStorLang.instance") + ": " + serverName);
            }
            if (server.type == "physicalHost") {
              vms.push(self.$t("calcStorLang.physicalHost") + ": " + serverName);
            }
          }
        }
        if (vms.length > 0) {
          return vms.join(",");
        } else {
          return "-"
        }
      } else {
        return "-";
      }
    }
  }
}
</script>