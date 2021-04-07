<template>
 <div>
  <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
  <div class="divider clearfix"></div>
  <div class="operation-panel" @mousedown="detailMouseDown">
    <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus"> </operation-panel>
  </div>
  <div class="divider clearfix"></div>
  <el-table
    ref="volumeBakTable"
    :data="tableData"
    highlight-current-row
    border
    stripe
    style="width: 100%;"
    slot="empty"
    max-height='500'
    row-key="id"
    :default-sort="{prop: 'created_at', order: 'descending'}"
    @selection-change="handleSelectionChange"
    @sort-change="sortChange">
    <el-table-column
      reserve-selection
      type="selection"
      align="center"
      width="55"
      :selectable="function(row, index) { return !['deleting'].includes(row['status']) }">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
      prop="name"
      :label="$t('lang.name')"
      align="left"
      sortable="custom"
      min-width="100">
      <template slot-scope="scope">
        <el-button @click="vmBakDetail(scope.row)" type="text" size="small">
          <span>{{scope.row.name}}</span>
        </el-button>
       </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('showId') >= 0"
      prop="showId"
      label="ID"
      align="left"
      min-width="100">
      <template slot-scope="scope">
        <span>{{scope.row.id}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('size') >= 0"
      prop="size"
      align="left"
      :label="$t('storage.size')"
      sortable="custom"
      min-width="100">
      <template slot-scope="scope">
        <span>{{scope.row.size + " GB"}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('status') >= 0"
      prop="status"
      align="left"
      :label="$t('lang.status')"
      sortable="custom"
      min-width="100">
      <template slot-scope="scope">
        <el-tag :type="statusTagRender(scope.row.status)">
          <span v-html="volumeStatusRender(scope.row.status, scope.row)"></span>
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('incremental') >= 0"
      prop="incremental"
      align="left"
      :label="$t('storage.bakType')"
      min-width="100">
      <template slot-scope="scope">
        <span>{{scope.row.is_incremental?$t('storage.increaseNum'):$t('storage.allNum')}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('parentid') >= 0"
      prop="parentid"
      align="left"
      :label="$t('lang.parentid')"
      min-width="100">
      <template slot-scope="scope">
        <span v-html="parentidRender(scope.row.parent_id)"></span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('volumeName') >= 0"
      prop="volumeName"
      align="left"
     :label="$t('calcStorLang.fvolumeName')"
      min-width="100">
       <template slot-scope="scope">
        <el-button @click="vmDetail(scope.row)" type="text" size="small">
          <span v-html="volumeNameRender(scope.row)"></span>
        </el-button>
       </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('project') >= 0 && isAdmin()"
      prop="project"
      :label="$t('lang.project')"
      align="left"
      min-width="100">
      <template slot-scope="scope">
        <span v-html="getProjectName(scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('container') >= 0"
      prop="container"
      align="left"
      :label="$t('storage.container')"
      min-width="100">
       <template slot-scope="scope">
          <span>{{getContainer(scope.row)}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('host') >= 0"
     prop="host"
     align="left"
     :label="$t('storage.host')"
     min-width="100">
   </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('created_at') >= 0"
      prop="created_at"
      align="left"
      sortable="custom"
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
     <volume-bakRecovery ref="volumeBakRecovery" v-if="volumeBakRecoveryFlg" :bak="bak" @getData="getData" @handlRestore="handlRestore"></volume-bakRecovery>
     <refresh-bakStatus ref="refreshBakStatus" v-if="refreshBakStatusFlg" :bakId="bakId" :backName="handlerBackupName" @onRefresh="getData" @handlRestore="handlRefreshBakStatus"></refresh-bakStatus>
     <add-volume-bak ref="addVolumeBak" v-if="addVolumeBakFlg" @handlerBak="handlerBak"></add-volume-bak>
     <edit-volume-bak ref="editVolumeBak" :volumeBakId="volumeBakId" :volumeBakEntity="volumeBakEntity" v-if="editVolumeBakFlg" @handlerEditShow="handlerEditShow" @onRefresh="getData"></edit-volume-bak>
     <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="voldetailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix" >
           <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
          </div>
          <div>
            <volume-detail :detailVolume="detailVolume" :userName="showUserInfo.name"
             :vmpName="showProjectInfo.name" :deviceUN="vmNames"></volume-detail>
          </div>
        </panel>
      </div>
      <div style="width: 800px;" class="slide-panel" v-if="vmBakdetailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix" >
           <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
          </div>
          <div>
            <volume-bak-detail :detailBak="detailBak" :detailProject="detailProject"
             :vmpName="showProjectInfo.name" :deviceUN="vmNames"></volume-bak-detail>
          </div>
        </panel>
      </div>
    </transition>
  </div>
 </div>
</template>
<script>
import VolumeBakRecovery from './VolumeBakRecovery.vue'
import AddVolumeBak from './AddVolumeBak'
import EditVolumeBak from './EditVolumeBak'
import RefreshBakStatus from './RefreshBakStatus'
import VolumeDetail from './VolumeDetail'
import VolumeBakDetail from './VolumeBakDetail'
export default {
  name: "VolumeBak",
  data() {
    return {
      sortObj:{
        sortOrder:"descending",
        sortField:"created_at"
      },
      searchBar: {
        conditions: {
          projectName: {
            label: this.$t('lang.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          },
          bakName: {
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
          volumeStatus: {
            label: this.$t('lang.status'),
            type: 'select',
            options: []
          }
        }
      },
      detailProject: '',
      queryParams: {},
      currentPage: 1,
      pageSize: 10,
      total: 0,
      hasInited: false,
      projectId :"",
      projectInfo:{},
      volumeBakRecoveryFlg:false,
      addVolumeBakFlg:false,
      editVolumeBakFlg: false,
      refreshBakStatusFlg:false,
      totalData: [],
      showProjectInfo: '',
      showUserInfo: '',
      vmNames: '',
      close:"",
      bakId: '',
      volumeId: "",
      volumeBakEntity: "",
      volumeBakId: "",
      voldetailFlag: false,
      vmBakdetailFlag: false,
      oldpro: '',
      olduser: '',
      detailVolume: '',
      detailBak: '',
      handlerSrcVolumeName:"",
      handlerBackupName:"",
      selectClear:true,
      volumeBakMaps: new Map(),
      instanceMaps: new Map(),
      projectlist: [],
      volumeBakStatusList: [],
      multipleSelection:[],
      tableData:[],
      loading:false,
      columnsChecked:["name", "size", "status", "incremental", "parentid", "volumeName", "project", "container", "created_at"],
      columns:[{
        prop:"name",
        label:this.$t('lang.name')
      }, {
        prop:"showId",
        label:"ID"
      }, {
        prop:"size",
        label:this.$t('storage.size')
      }, {
        prop:"status",
        label:this.$t('lang.status')
      }, {
        prop:"incremental",
        label:this.$t('storage.bakType')
      }, {
        prop:"parentid",
        label:this.$t('lang.parentid')
      }, {
        prop:"volumeName",
        label:this.$t('calcStorLang.fvolumeName')
      }, {
        prop:"container",
        label:this.$t('storage.container')
      }, {
        prop:"host",
        label:this.$t('storage.host')
      }, {
        prop:"created_at",
        label:this.$t('lang.createTime')
      }, {
        prop:"description",
        label:this.$t('lang.desc')
      }],
      operationMenus:[{
        icon: "fa-plus",
        name: this.$t("storage.createvolumeBak"),
        readOnly: true,
        showflg: true,
        enable(rowData) {
          return (
            rowData["status"] == "available" || rowData["status"] == "in-use"
          );
        },
        handler: function (selectRows) {
          let me = this;
          me.addVolumeBakFlg = true;
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: this.$t("lang.edit"),
        showflg: true,
        enable(rowData) {
          return (
            rowData["status"] == "available" || rowData["status"] == "in-use"
          );
        },
        handler: function (selectRows) {
          let me = this;
          me.volumeBakEntity = selectRows[0];
          me.editVolumeBakFlg = true;
          me.$nextTick(() => {
            me.$refs.editVolumeBak.show();
            me.volumeBakId = selectRows[0].id;
          });
        }.bind(this)
      }, {
        icon: "fa-rotate-left",
        name: this.$t('storage.recovery'),
        showflg: true,
        enable(rowData) {
          return (rowData['status'] == "available");
        },
         handler: function(selectRows) {
          let self = this;
          let row = selectRows[0];
          self.bak = row;
          self.volumeBakRecoveryFlg = true;
        }.bind(this)
      }, {
        icon: "fa-refresh",
        name: this.$t('storage.refreshStatus'),
        showflg: this.isAdmin(),
        enable(rowData) {
            return true;
        },
         handler: function(selectRows) {
          let self = this;
          let row = selectRows[0];
          self.bakId = row['id'];
          self.handlerBackupName = row['name'];
          self.refreshBakStatusFlg = true;
          self.$nextTick(() => {
            //self.$refs.refreshBakStatus.status = row['status'];
            self.$refs.refreshBakStatus.show();
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('lang.delete'),
        multi: true,
        showflg: true,
        enable(rowData) {
          return ((rowData['status'] == "available" || rowData['status'] == "error"));
        },
         handler: function(selectRows) {
           let increCount = 0;
           let fullCount = 0;
           for (let i in selectRows) {
            if (selectRows[i].is_incremental) {
              increCount++;
            } else {
              fullCount++;
            }
          }
          if (fullCount>0&&increCount>0) { //暂不支持同时批量删除全量备份和增量备份
            this.$message({
              showClose: true,
              message: Vue.t('storage.mutiIncreAndFullAlert'),
               type: 'warning'
            });
            return;
          } else if (fullCount==0&&increCount>=2) { //不支持批量删除增量备份
            this.$message({
              showClose: true,
              message: Vue.t('storage.mutiIncreAlert'),
               type: 'warning'
            });
            return;
          }
           for (let delV in selectRows) {
            if (this.isHasIncrementalBack(selectRows[delV].volume_id, selectRows[delV].id)) {
              this.$message({
                showClose: true,
                message: Vue.t('storage.volBakWillBeUsed')+ selectRows[delV].name + Vue.t('storage.dontDelete'),
                 type: 'warning'
              });
              return;
            }
           }
           let self = this;
           self.$prompt(this.$t('lang.inputYesToContinue'), this.$t('lang.confirm'), {
                        confirmButtonText:this.$t('lang.confirm'),
                        cancelButtonText:this.$t('lang.cancel'),
                        inputPattern:/^YES$|^NO$/i,
                        inputValue: "NO",
                        customClass: "promptConfirmDel",
                        inputErrorMessage:this.$t('lang.onlyAcceptYesOrNo')
                  }).then(async({ value }) => {
                    if ("yes" == value.toLowerCase()) {
                       self.$sequence({
                          type: 'delete',
                          url: 'api/cinderv3/v3/' + this.$cookie.get('pid') + "/backups/{id}",
                          params: selectRows,
                          successMsg: this.$t('storage.sendDeleteSuccess'),
                          errorKey: "badRequest",
                          log:{
                            description:{
                              en:"Delete volume backup",
                              zh_cn:"删除云硬盘备份"
                            },
                            key: "name",
                            target:Vue.logTarget.storage_volume_backup
                          },
                          successFun: function() {
                            for (let r = 0; r < selectRows.length; r++) {
                              let row = selectRows[r];
                              let volumeBak = self.volumeBakMaps.get(row.id);
                              row['status'] = 'deleting';
                              volumeBak['status'] = "deleting";
                            }
                          self.$refs.volumeBakTable.clearSelection();
                          self.currentPage = 1;
                          setTimeout( function() {
                            self.getData();
                          }, 1000);
                          }
                          // successMsg: "删除发送成功",
                        }).then((data) => {

                        }).catch((err) => {});
                      }
                  }).catch(() => {
                    //取消
                  });
          }.bind(this)
        }
      ]
    }
  },
  beforeDestroy() {
    if (this.interVmValid != null) {
      clearInterval(this.interVmValid);
    }
  },
  watch: {
    columnsChecked: {
      handler: function (rows, oldVal) {
        this.columnsChecked = rows;
      },
      deep: true
    },
    sortObj() {
      if (this.sortObj&&this.sortObj.sortOrder&&this.sortObj.sortField && this.hasInited) {
        this.getData();
      }
    },
    tableData: {
      immediate: false,
      handler: function(list) {
        let self = this;
        self.reloadTblFlag = false;
        if (list != null) {
          for (let t = 0; t < list.length; t++) {
            let obj = list[t];
            if (obj['status'] == "creating" || obj['status'] == "deleting" || obj['status'] == "restoring" || obj['status'] == "error_restoring") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.interVmValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interVmValid = setInterval(() => {
              this.selectClear =false;
              self.loadInstanceList();
              Promise.all([self.loadProjectList()]).then(function(result) {
                  self.loadData();
              });
            }, 5000);
        }
      }
    }
  },
  mounted() {
    let self = this;
    if (self.isAdmin() && self.columns) {
      let obj = {
        prop:"project",
        label:this.$t('lang.project')
      };
      self.columns.splice(7, 0, obj);
    }
    self.initVolumeBackStatus();
    self.loadInstanceList();
    Promise.all([self.loadProjectList()]).then(function(result) {
        self.getData();
    });
  },
  methods: {
    parentidRender(value) {
      if (value == "" || value == null || value == "null") {
        return "-";
      } else {
        return value;
      }
    },
    getContainer(row) {
      if (row.container) {
        return row.container;
      } else {
        return "-";
      }
    },
    detailMouseDown() {
      let self = this;
      self.voldetailFlag = false;
      self.vmBakdetailFlag = false;
    },
    isHasIncrementalBack(volumeId, deleteId) {
      let self = this;
      let hasFlag = false;
      let lastTime = null;
      for (let ivb in self.totalData) {
        //当云硬盘有正在创建的增量备份时，返回true
        let tempVolumeBack = self.totalData[ivb];
        if (tempVolumeBack.volume_id != volumeId) {
          continue;
        }
        if (null == lastTime) {
          if (tempVolumeBack.status == "available") {
            lastTime = tempVolumeBack;
          }
        } else {
          if (lastTime.created_at < tempVolumeBack.created_at && tempVolumeBack.status == "available") {
            lastTime = tempVolumeBack
          }
        }
        if (!tempVolumeBack.is_incremental) {
          //不是增量
          continue;
        }
        if (tempVolumeBack.status == "creating") {
          hasFlag = true;
        }
      }
      if (hasFlag) {
        //有正在创建的增量备份
        if (null == lastTime) {
          return false;
        } else if (lastTime.id == deleteId) {
          //删除的是可能即将使用的
          return true;
        }
      }
      return false;
    },
    handleSearch(params) {
      this.queryParams = params;
      this.$refs.volumeBakTable.clearSelection();
      this.loadData();
    },
    getData () {
      this.currentPage = 1;
      this.loadData();
    },
    async loadData() {
      let self = this;
      self.volumeBakMaps.clear();
      self.loading = true;
      let data = {
        limit: self.pageSize,
        with_count: "True",
        offset: self.pageSize * (self.currentPage - 1),
        sort_key: self.sortObj.sortField
      };
      if (self.sortObj.sortOrder == "descending") {
        data.sort_dir = "desc";
      } else {
        data.sort_dir = "asc";
      }
      //筛选条件若为空则不传
      if (self.queryParams.bakName) {
        data.name = self.queryParams.bakName;
      }
      if (self.queryParams.volumeStatus) {
        data.status = self.queryParams.volumeStatus;
      }
      if (self.queryParams.volumeName) {
        data.vol_name = self.queryParams.volumeName;
      }
      if (self.queryParams.projectName) {
        data.project_id = self.queryParams.projectName;
      }
      let Pid = this.$cookie.get('pid');
      let url = "";
      if ("2" == Vue.roleType || "3" == Vue.roleType) {
        url = "api/cinderv3/v3/" + Pid + "/inspur-backups/detail?";
      } else {
        url = "api/cinderv3/v3/" + Pid + "/inspur-backups/detail?all_tenants=True&";
      }
      let result = await self.$ajax({
        type: 'get',
        url: url + $.param(data),
        headers:{
          "openstack-api-version":"volume 3.45"
        }
      });
      let rusultData = result['backups'];
      for (let v = 0; v < rusultData.length; v++) {
        let vEntity = rusultData[v];
        self.volumeBakMaps.set(vEntity.id, vEntity);
      }
      self.totalData = rusultData;
      self.tableData = self.totalData;
      self.hasInited = true;
      self.loading = false;
      self.total = result['count'];
    },
    async loadProjectList() {
      //查询所有的项目列表
      let self = this;
      let roleType = Vue.roleType + "";
      try {
        let url = "api/keystone/v3/projects?domain_id=default";
        if ("2" == roleType || "3" == roleType) { //非超级管理员，查询一个项目信息
          url = "api/keystone/v3/projects/" + this.$cookie.get("pid");
        }
        self.loading = true;
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        if ("2" == roleType || "3" == roleType) {
          self.projectlist.push(result['project']);
        } else {
          let projects = result['projects'];
          self.projectlist = self.projectlist.concat(result['projects']);
          self.searchBar.conditions.projectName.options = result['projects'].map(item => {
            return {
              label: item.name,
              value: item.id
            };
          });
        }
      } catch (res) {
      }
    },
    getProjectName(rowData) {
      let projectId = rowData['os-backup-project-attr:project_id'];
      if (null == projectId || "" == projectId) {
        return "-";
      }
      let projects = this.projectlist;
      for (let q = 0; q < projects.length; q++) {
        if (projects[q].id == projectId) {
          return projects[q].name;
        }
      }
      return "-";
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handlRefreshBakStatus() {
      this.refreshBakStatusFlg = false;
    },
    onRefresh() {
      let self = this;
      Promise.all([self.loadProjectList()]).then(function(result) {
        self.loadData();
      });
      this.clearSelOption();
    },
    onQuery() {
      let self = this;
      Promise.all([self.loadProjectList()]).then(function(result) {
        self.getData();
      });
    },
    handlRestore() {
       this.volumeBakRecoveryFlg = false;
    },
    isAdmin() {
      let roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        return false;
      }
      return true;
    },
    isUser() {
      let roleType = Vue.roleType + "";
      if ("3" == roleType) {
        return false;
      }
      return true;
    },
    vmBakDetail(row) {
      if (!row) {
        this.$message.error(Vue.t('calcStorLang.deletedfvolume'));
        return false;
      }
      this.detailBak = row;
      let pidObj = {};
      if (row["os-backup-project-attr:project_id"]) {
        this.detailProject = this.getProjectName(row);
      } else if (row['volume']) {
        let vInfo = row["volume"];
        pidObj["os-backup-project-attr:project_id"] = vInfo['project_id'];
        this.detailProject = this.getProjectName(pidObj);
      } else {
        pidObj["os-backup-project-attr:project_id"] = this.$cookie.get('pid');
        this.detailProject = this.getProjectName(pidObj);
      }
      this.vmBakdetailFlag = true;
    },
    async vmDetail(row) {
      if (!row || !row["volume"]) {
        this.$message.error(Vue.t('calcStorLang.deletedfvolume'));
        return false;
      }
      //查询卷的挂载、卷所在项目、卷所属用户的信息
      let volumeInfo = await this.qryVolumeById(row["volume_id"])
      this.detailVolume = volumeInfo;
      let vInfo = row["volume"];
      if (!this.detailVolume) {
        this.$message.error(Vue.t('calcStorLang.deletedfvolume'));
        return false;
      }
      this.showProject(vInfo['project_id']);
      this.showUser(vInfo['user_id']);
      this.vmNames = this.volumeMountInfo(volumeInfo);
      this.voldetailFlag = true;
      // this.$refs.umTable.clearSelection();
    },
    async qryVolumeById(volumeId) {
      let self = this;
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
    async showUser(userId) {
      let self = this;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/keystone/v3/users/' + userId,
          showErrMsg: false
        });
        self.loading = false;
        self.showUserInfo = result['user'];
      } catch (res) {
        self.loading = false;
      }
    },
     onBack() {
      this.voldetailFlag = false;
      this.vmBakdetailFlag = false;
    },
    async showProject(pid) {
      let self = this;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/keystone/v3/projects/' + pid,
          showErrMsg: false
        });
        self.loading = false;
        self.showProjectInfo = result['project'];
      } catch (res) {
        self.loading = false;
      }
    },
    volumeNameRender(rowData) {
      if (!rowData || !rowData["volume"]) {
        return '--';
      }
      let name = rowData["volume"]["display_name"];
      let id = rowData["volume"]["id"];
      if (!name) {
        name = id;
      }
      return name;
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
    statusTagRender(status) {
        if ("available" == status || "reserved" == status) {
           return "success";
        } else if ("deleting" == status) {
           return "gray";
        } else if ("creating" == status || "attaching" == status || "detaching" == status) {
           return "info";
        } else if ("error" == status || "error_deleting" == status || "ERROR" == status || "UNKNOW" == status) {
           return "danger";
        } else if ("in-use" == status || "backing-up" == status || "restoring-backup" == status || "restoring" == status) {
           return "info";
        } else if ("maintenance" == status) {
           return "warning";
        } else if ("downloading" == status || "uploading" == status ) {
           return "info";
        } else {
          return "";
        }
    },
    volumeStatusRender(value, rowData) {
       if ("available" == value) {
         return this.$t('storage.available');
       } else if ("creating" == value) {
         return this.$t('storage.creating');
       } else if ("deleting" == value) {
         return this.$t('storage.deleting');
       } else if ("error" == value) {
         return this.$t('storage.error');
       } else if ("error_deleting" == value) {
         return this.$t('storage.errorDeleting');
       } else if ("restoring" == value) {
         return this.$t('storage.recoverying');
       } else if ("error_restoring" == value) {
         return this.$t('storage.recoveryError');
       } else if ("clone_error" == value) {
        return this.$t('storage.clone_error');
       } else {
          if (value != null) {
            return value;
          } else {
            return '-';
          }
       }
    },
    initVolumeBackStatus() {
      this.volumeBakStatusList = [
      {"id":"available", "name":this.$t('storage.available')},
      {"id":"creating", "name":this.$t('storage.creating')},
      {"id":"deleting", "name":this.$t('storage.deleting')},
      {"id":"error_deleting", "name":this.$t('storage.errorDeleting')},
      {"id":"error", "name":this.$t('storage.error')},
      {"id":"restoring", "name":this.$t('storage.recoverying')},
      {"id":"error_restoring", "name":this.$t('storage.recoveryError')}];
      this.searchBar.conditions.volumeStatus.options = this.volumeBakStatusList.map(item => {
        return {
          label: item.name,
          value: item.id
        };
      });
    },
    getCurrentData(param) {
        this.tableData = param;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.loadData();
    },
    clearSelOption() {
      let self = this;
      self.$refs.volumeBakTable.clearSelection();
    },
    handlerBak() {
      this.addVolumeBakFlg = false;
      this.getData(true);
      // this.onRefresh();
    },
    handlerEditShow() {
      this.editVolumeBakFlg = false;
    },
    sortChange(column) {
      let self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder: column.order,
        sortField: column.prop
      };
      this.currentPage = 1;
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
      let self = this;
      let vmList = voInfo["attachments"];
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
   },
  components: {
    AddVolumeBak,
    VolumeBakRecovery,
    RefreshBakStatus,
    VolumeDetail,
    EditVolumeBak,
    VolumeBakDetail
  }
}
</script>
