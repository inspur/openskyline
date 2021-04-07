<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel" @mousedown="detailMouseDown">
    <operation-panel
      class="margin-tb5"
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table
      ref="shTable"
      :data="tableData"
      :element-loading-text="$t('calcStorLang.dataLoading')"
      highlight-current-row
      border
      stripe
      style="width: 100%;"
      slot="empty"
      row-key="id"
      :default-sort="{prop: 'created_at', order: 'descending'}"
      @selection-change="handleSelectionChange"
      @sort-change="sortChange">
      <el-table-column
        reserve-selection
        type="selection"
        align="center"
        width="55"
        :selectable="function(row, index) { return !['pending_delete'].includes(row['status']) }">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('lang.name')"
        align="left"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
        <el-button @click="snapDetail(scope.row)" type="text" size="small" >
            <span>{{scope.row.name == null || scope.row.name == "" ? scope.row.id : scope.row.name}}</span>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('id') >= 0"
        prop="id"
        :label="$t('calcStorLang.snapshotId')"
        align="left"
        sortable="custom"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('owner') >= 0 && roleType == '0'"
        :label="$t('lang.project')"
        prop="owner"
        align="left"
        min-width="40">
        <template slot-scope="scope">
          <span v-html="queryProjecName(scope.row.owner, scope.row)"></span>
        </template>
      </el-table-column>
      <!-- <el-table-column v-if="columnsChecked.indexOf('description') >= 0"
        prop="description"
        align="left"
        :label="$t('lang.desc')"
        min-width="100">
        <template slot-scope="scope">
            <el-tooltip placement="top">
              <div slot="content" v-html="comDesc(scope.row.description)"></div>
              <span>{{!scope.row.description?"":scope.row.description.length>100?scope.row.description.substring(0,100)+'...':scope.row.description}}</span>
            </el-tooltip>
        </template>
      </el-table-column> -->
      <el-table-column v-if="columnsChecked.indexOf('size') >= 0"
        prop="size"
        align="left"
        sortable="custom"
        :label="$t('calcStorLang.size')"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="sizeRender(scope.row.size, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('smage_state') >= 0"
        prop="status"
        align="left"
        sortable="custom"
        :label="$t('lang.status')"
        min-width="70">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.status)">
            <span v-html="statusRender(scope.row.status, scope.row)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('visibility') >= 0"
        prop="visibility"
        :label="$t('calcStorLang.visibility')"
        align="left"
        sortable="custom"
        min-width="40">
        <template slot-scope="scope">
          <span v-html="visibilityRender(scope.row.visibility, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('protected') >= 0"
        prop="protected"
        :label="$t('calcStorLang.protected')"
        align="left"
        sortable="custom"
        min-width="70">
        <template slot-scope="scope">
          <span v-html="protectedRender(scope.row.protected, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('instance_uuid') >= 0"
        prop="instance_uuid"
        :label="$t('calcStorLang.sourceInstanceId')"
        min-width="100">
        <template slot-scope="scope">
          <el-popover ref="volDetailPop" placement="top" trigger="click">
            <div class="table_panel" style="width:410px">
            <table class="table table-content table-hover idatatable table-bordered" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('calcStorLang.instanceName')}}：</th>
                  <td class="idatatd">
                    {{instanceName|| '-'}}
                  </td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('calcStorLang.instance') + "ID"}}：</th>
                  <td class="idatatd">
                    {{scope.row.instance_uuid|| '-'}}
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </el-popover>
          <el-button v-popover:volDetailPop type="text" @click="snapIdDetail(scope.row.instance_uuid)">{{instanceIdRender(scope.row.instance_uuid, scope.row)}}</el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('created_at') >= 0"
        prop="created_at"
        sortable="custom"
        align="left"
        :label="$t('lang.createTime')"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="dateRender(scope.row.created_at, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('description') >= 0"
        prop="description"
        align="left"
        :label="$t('lang.desc')"
        min-width="80">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onTblRefresh">
          </el-button>
            <span>{{$t('calcStorLang.currentSelect')}} {{multipleSelection.length}} {{$t('calcStorLang.bar')}}</span>
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
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj" :objStorFlag="currentPageReset"></page>
        </el-col>
      </el-row>
      <!-- <instance-list ref="InstanceList" v-if="creInstSoltFlag" @onRefresh="onRefresh" @handleCreate="handleCreate">
      </instance-list> -->
      <edit-image ref="EditImage" v-if="editFlag" :size="size" :imageName="instSoltName" :imageInfo="instSoltInfo" @onRefresh="onRefresh" @handleEditShow="handleEdit">
      </edit-image>
      <create-instance
        v-if="createInstanceDialog.visible"
        :preset-data="createInstanceDialog"
        @close="createInstanceDialog.visible = false"
        @refresh="gotoInstanceList"
      />
      <new-volume ref="NewVolume"  v-if="createFlag" :instancelSoltInfo="instancelSoltInfo" :entranceCode="'InstanceSolt'" @handleShow="handleCreateShow" @hrefToVolumeListPage="hrefToVolumeListPage">   
      </new-volume>
      <transition name="slide-right" mode="out-in">
        <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
          <panel style="height: 100%">
            <div slot="title" class="clearfix" >
            <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
            </div>
            <div>
            <snap-detail :snapInfo="snapInfo" :ownerName="detailOwnerName" :adminId="adminId"></snap-detail> 
            </div>
          </panel>
        </div>
      </transition>
    </div>
    <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script>
import EditImage from '../image/EditImage';
import SnapDetail from './SnapDetail';
import CreateInstance from '../instance/create-instance';
import NewVolume from '../volume/NewVolume';
export default {
  name: "InstanceSolt",
  components: {
    EditImage, CreateInstance, NewVolume, SnapDetail
  },
  data() {
    return {
      sortObj:{
        sortOrder:"descending",
        sortField:"created_at"
      },
      currentPageReset: false,
      adminId:"",
      selProjectFlg:false,
      projectName:"",
      project_id:"",
      isadmin: Vue.roleType == "0",
      roleType: Vue.roleType + "",
      multipleSelection:[],
      projecNameMap: new Map(),
      instancelSoltInfo:"",
      tableData:[],
      instanceName:'',
      detailOwnerName: '',
      snapShotId: '',
      min_ram: '',
      min_disk: '',
      osValue: '',
      size: '',
      proId: this.$cookie.get('pid'),
      instSoltName:'',
      close:"",
      instSoltInfo:'',
      soltProjectName:'',
      privateFlag: false,
      creInstSoltFlag:false,
      rebuildInstSoltFlag:false,
      instSoltToImageFlag :false,
      startFlag: false,
      createFlag: false,
      editFlag: false,
      refreshMetadataFlg: false,
      hightFlag:false,
      reloadTblFlag: false,
      instanceSolt:'',
      totalData: [],
      project: '',
      projectlist: [],
      visiabloe: '',
      detailFlag: false,
      snapInfo:[],
      instanceNameID: '',
      instanceMaps: new Map(),
      operationMenus:[/*{
        icon: "fa-plus",
        name: "创建快照",
        showflg: true,
        readOnly: true,
         handler: function(selectRows) {
          let me = this;
          me.creInstSoltFlag = true;
        }.bind(this)
      }, */{
        icon: "fa-pencil",
        name: Vue.t('calcStorLang.editSnapshot'),
        showflg: true,
        enable(rowData) {
          if (rowData['status'] + "" == "active" && rowData['owner'] == rowData['projectId']) {
            return true;
          }
          return false;
        },
         handler: function(selectRows) {
          let me = this;
          me.size = (((selectRows[0].size)/1024)/1024)/1024;
          me.instSoltName = selectRows[0].name;
          me.instSoltInfo = selectRows[0];
          me.editFlag = true;
          this.$nextTick(() => {
            this.$refs.EditImage.dialogVisible = true;
            this.$refs.EditImage.initDialog();
          });
        }.bind(this)
      }, /* {
        icon: "fa-refresh",
        name: "转为镜像",
        showflg: true,
        multi: false,
        enable(rowData) {
          return (rowData['smage_state'] + "" == "0");
        },
         handler: function(selectRows) {
          let me = this;
          me.instSoltToImageFlag = true;
          me.instSoltName = selectRows[0].name;
        }.bind(this)
      }*/{
        icon: "fa-plus",
        name: Vue.t('calcStorLang.createInstance'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return (rowData['status'] + "" == "active");
        },
        handler: function(selectRows) {
          const snapshot = selectRows[0];
          this.createInstanceDialog.sourceId = snapshot.id;
          this.createInstanceDialog.sourceName = snapshot.name;
          this.createInstanceDialog.sourceOSDistro = snapshot.os_distro ? snapshot.os_distro : '';
          this.createInstanceDialog.sourceMinRam = snapshot.min_ram ? snapshot.min_ram : 0;
          this.createInstanceDialog.sourceMinDisk = snapshot.min_disk ? snapshot.min_disk : 0;
          this.createInstanceDialog.sourceImageFormat = snapshot.disk_format ? snapshot.disk_format : '';
          this.createInstanceDialog.sourceSize = snapshot.size ? snapshot.size : 0;
          this.createInstanceDialog.projectId = snapshot.owner;
          if (snapshot.visibility !== 'public') {
            this.createInstanceDialog.projectIdLocked = true;
          } else {
            this.createInstanceDialog.projectIdLocked = false;
          }
          this.createInstanceDialog.visible = true;
    }.bind(this)
      }, /*{
        icon: "fa-retweet",
        name: "重建",
        showflg: true,
        enable(rowData) {
          return (rowData['smage_state'] + "" == "0");
        },
         handler: function(selectRows) {
          let me = this;
          me.rebuildInstSoltFlag = true;
        }.bind(this)
      }, */{
        icon: "fa-plus",
        name: Vue.t('calcStorLang.createVolume'),
        showflg: Vue.roleType != "3",
        multi: false,
       enable(rowData) {
          if ((rowData['size'] + "") == "0") {
            return false;
          }
          return (rowData['status'] + "" == "active");
       },
       handler: function(selectRows) {
          this.createFlag = true;
          this.instancelSoltInfo = selectRows[0];
          console.log(this.projecNameMap.get(this.instancelSoltInfo.owner));
          this.instancelSoltInfo.projectName = this.queryProjecName(this.instancelSoltInfo.owner, this.instancelSoltInfo);
          this.$nextTick(() => {
            this.$refs.NewVolume.show();
          });
        }.bind(this)
      }, /*{
        icon: "fa-refresh",
        name: "更新元数据",
        showflg: true,
        multi: false,
        enable(rowData) {
          return (rowData['smage_state'] + "" == "0");
        },
         handler: function(selectRows) {
          this.refreshMetadataFlg = true;
          this.$nextTick(() => {
            this.$refs.refreshMetadata.show();
          });
        }.bind(this)
     }, */{
        icon: "fa-times",
        name: Vue.t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return (rowData['protected'] == false);
        },
         handler: function(selectRows) {
          var self = this;
          self.$prompt(Vue.t('lang.inputYesToContinue'), Vue.t('lang.confirm'), {
          confirmButtonText: Vue.t('lang.confirm'),
          cancelButtonText: Vue.t('lang.cancel'),
          inputPattern:/^YES$|^NO$/i,
          inputValue: "NO",
          customClass: "promptConfirmDel",
          inputErrorMessage:Vue.t('lang.onlyAcceptYesOrNo')
        }).then(async({ value }) => {
          if ("yes" == value.toLowerCase()) {
            self.$sequence({
              type: 'delete',
              url: 'api/glance/v2/images/{id}',
              params: selectRows,
              log:{
                description:{
                  en:"Delete InstanceSnapshot:{name}({id})",
                  zh_cn:"删除云主机快照:{name}({id})"
                },
                target:Vue.logTarget.computeInstanceSnapshot
              },
              errFun:function() {
                  self.$refs.shTable.clearSelection();
                  setTimeout( function() {
                    self.loadData(self.query_name);
                    self.loading = false;
                  }, 5000);
               }
              // successMsg: "删除发送成功"
            }).then((data) => {
              selectRows.forEach(item => {
                item['status'] = 'pending_delete';
              });
              self.loading = true;
              self.$refs.shTable.clearSelection();
              self.$message(Vue.t('calcStorLang.deleteSendSuccess'));
              setTimeout( function() {
                self.loadData(self.query_name);
                self.loading = false;
              }, 3000);
            }).catch((err) => {});
          }
        }).catch(() => {
          //取消
        });
        }.bind(this)
      }],
      loading:false,
      columnsChecked:["name", "owner", "visibility", "protected", "size", "smage_state", "instance_uuid", "created_at"],
      columns:[{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "id",
        label: Vue.t('calcStorLang.snapshotId')
      }, {
        prop: "owner",
        label: Vue.t('lang.project')
      }, {
        prop: "size",
        label: Vue.t('calcStorLang.size')
      }, {
        prop: "smage_state",
        label: Vue.t('lang.status')
      }, {
        prop: "visibility",
        label: Vue.t('calcStorLang.visibility')
      }, {
        prop: "protected",
        label: Vue.t('lang.protected')
      }, {
        prop: "instance_uuid",
        label: Vue.t('calcStorLang.sourceInstanceId')
      }, {
        prop: "created_at",
        label: Vue.t('lang.createTime')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      }],
      searchBar: {
        conditions: {
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          },
          owner: {
            label: this.$t('lang.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          },
          visibility: {
            label: this.$t('calcStorLang.visibility'),
            type: 'select',
            options: [{
              label: this.$t('lang.public'),
              value: 'public'
            }, {
              label: this.$t('lang.private'),
              value: 'private'
            }, {
              label: this.$t('calcStorLang.shared'),
              value: 'shared'
            }]
          },
          instance_uuid: {
            label: this.$t('calcStorLang.sourceInstanceId'),
            type: 'input',
            validator: (value) => {
              if (!/^[a-fA-F0-9\-]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyUUIDKeyword'));
              }
            }
          },
          id: {
            label: this.$t('calcStorLang.instanceshot') + ' ID',
            type: 'input',
            validator: (value) => {
              if (!/^[a-fA-F0-9\-]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyUUIDKeyword'));
              }
            }
          }
        },
        validatedParams: {}
      },
      createInstanceDialog: {
        visible: false,
        canSelectSource: false,
        sourceType: 'snapshot',
        sourceId: '',
        sourceName: '',
        sourceOSDistro: '',
        sourceMinRam: 0,
        sourceMinDisk: 0,
        sourceImageFormat: '',
        sourceSize: 0,
        projectId: '',
        projectIdLocked: true
      }
    }
  },
  beforeDestroy() {
    if (this.interVmValid != null) {
      clearInterval(this.interVmValid);
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
      handler: function(list) {
        var self = this;
        self.reloadTblFlag = false;
        if (list != null) {
          for (var t = 0; t < list.length; t++) {
            var obj = list[t];
            if (obj['OS-EXT-STS:task_state'] != null || obj['status'] == "queued" || obj['status'] == "saving" || obj['status'] == "pending_delete") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.interVmValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interVmValid = setInterval(() => {
              self.loadData();
              // this.queryClick()
            }, 5000);
        }
      }
    }
  },
  mounted() {
    var roleType = Vue.roleType + "";
    if ("0" != roleType) {
      this.columns.splice(2, 1);
    }
    this.loadData();
  },
  methods: {
    async snapIdDetail(id) {
      var self = this;
      self.instanceName = "";
      try {
        let insResult = await self.$ajax({
          type: 'get',
          url: "api/nova/v2.1/servers-inspur/" + id,
          complete: function(XMLHttpRequest, textStatus) {},
          headers: {
            'X-OpenStack-Nova-API-Version': 2.41
          }
        });
        var instanceE = insResult["server"];
        self.instanceName = instanceE['name'];
      } catch (res) {
      }
    },
    snapDetail(row) {
      this.detailFlag = true;
      this.snapInfo = row;
      this.detailOwnerName = this.projecNameMap.get(row.owner)
      this.$refs.shTable.clearSelection();
    },
    detailMouseDown() {
      var self = this;
      self.detailFlag = false;
    },
    onBack() {
      this.detailFlag = false;
    },
    sortChange(column) {
       var self = this;
       if (!column.prop) { return; }
       if (column.prop == "size") {
         self.sortObj = {
           sortOrder:column.order,
           sortField:column.prop,
           sortType: "number"
         };
       } else {
         self.sortObj = {
           sortOrder:column.order,
           sortField:column.prop
         };
       }
    },
    async loadData(currentPageReset=false) {
      this.loadProjectList();
      this.getSoltData(currentPageReset);
    },
    getSoltData(currentPageReset=false) {
      var self = this;
      var instSnaps = [];
      var name = 'name' in self.searchBar.validatedParams ? self.searchBar.validatedParams.name : '';
      var instanceNameID = 'instance_uuid' in self.searchBar.validatedParams ? self.searchBar.validatedParams.instance_uuid : '';
      var visiabloe = 'visibility' in self.searchBar.validatedParams ? self.searchBar.validatedParams.visibility : '';
      var projectSecId = 'owner' in self.searchBar.validatedParams ? self.searchBar.validatedParams.owner : '';
      Promise.all([self.loadHostSnapshotList()]).then(function(result) {
        var data1 = result[0];
        // var data2 = result[1];
        instSnaps = data1;
        let totalData = [];
        for (var i in instSnaps) {
          var data = instSnaps[i];
          if (data.name.toLowerCase().indexOf(name.toLowerCase()) === -1) {
            continue;
          }
          if (instanceNameID !== "" && instanceNameID !== null && (typeof data["instance_uuid"] == "undefined" || data["instance_uuid"].indexOf(instanceNameID) < 0)) {
            continue;
          }
          if (visiabloe !== "" && visiabloe !== null && visiabloe != data["visibility"]) {
            continue;
          }
          if (projectSecId !== "" && projectSecId !== null && projectSecId != data["owner"]) {
            continue;
          }
          totalData.push(data);
        }
        if (currentPageReset) {
          self.currentPageReset = true;
        }
        self.totalData = totalData;
        self.$nextTick(() => {
          self.currentPageReset = false;
        });
        self.loading = false;
      });
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.project_id = id;
      this.projectName = name;
      this.close = 'close'
    },
    onIconClick() {
      this.project_id = '';
      this.projectName = '';
      this.close = '';
    },
    async loadHostSnapshotList() {
      let projectId = this.$cookie.get('pid');
      var self = this;
      var resultData = [];
      var roleType = Vue.roleType + "";
      var url = "api/glance/v2/images?limit=99999";

      if ('id' in self.searchBar.validatedParams) {
        url += `&id=${self.searchBar.validatedParams.id}`;
      }
      let ret = await this.$ajax({
        type: 'get',
        url: url
      });
      var list = ret.images;
      var rets = [];
      if (list != null) {
        for (let r = 0; r < list.length; r++) {
          var obj = list[r];
          obj['projectName'] = self.projecNameMap.get(obj['owner']);
          if (typeof (obj['block_device_mapping']) != "undefined") {
            if ("2" == roleType || "3" == roleType) {
              if ("private" == obj['visibility'] && projectId != obj['owner']) {
              continue;
              }
            }
            obj['projectId'] = projectId;
            obj['roleType'] = roleType;
            rets.push(obj);
          } else {
            if (typeof (obj['image_type']) != "undefined" && (obj['image_type'] == "snapshot" || obj['image_type'] == "backup") ) {
              if ("2" == roleType || "3" == roleType) {
              if ("private" == obj['visibility'] && projectId != obj['owner']) {
                  continue;
                }
              }
              obj['projectId'] = projectId;
              obj['roleType'] = roleType;
              rets.push(obj);
            }
          }
        }
      }
      return rets;
    },
    isAdmin() {
      var roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        return false;
      }
      return true;
    },
    async loadProjectList() {
      //查询所有的项目列表
      var self = this;
      self.loading = true;
      var roleType = Vue.roleType + "";
      var url = "api/keystone/v3/projects?domain_id=default";
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
        self.projecNameMap = new Map();
        var projects = result['projects'];
        if (!projects) {
           projects = [];
           projects.push(result["project"]);
        }
        for (var p = 0; p < projects.length; p++) {
          var tempP = projects[p];
          self.projecNameMap.set(tempP.id, tempP.name);
          if (tempP.name=="admin") {
            self.adminId = tempP.id
          };
        }
        //self.projectlist = projects;
        self.projectlist = [];
        if ("2" == roleType || "3" == roleType) {
          self.projectlist.push(result['project']);
        } else {
          // self.projectlist.push({"name":"所有", "id":"0"});
          self.projectlist = self.projectlist.concat(projects);
        }
        self.searchBar.conditions.owner.options = result.projects.map(item => {
          return {
            label: item.name,
            value: item.id
          };
        });
      } catch (res) {
        self.loading = false;
      }
    },
    queryProjecName(value, rowData) {
      return this.projecNameMap.get(value);
    },
    comDesc (desc) {
      if (desc) {
        return desc.replace(/,/g, ",<br/>").replace(/\./g, ".<br/>");
      } else {
        return '';
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleCreateInsShow() {
      var self = this;
      self.startFlag = false;
    },
    handleCreateShow() {
      this.createFlag = false;
    },
    onTblRefresh() {
      this.visiabloe = "";
      this.instanceNameID = "";
      this.project_id = '';
      this.projectName = '';
      this.close = '';
      this.$refs.shTable.clearSelection();
      this.loadData();
    },
    onRefresh() {
      this.$refs.shTable.clearSelection();
      this.loadData();
    },
    handleCreate() {
      this.creInstSoltFlag = false;
    },
    handleEdit() {
      this.editFlag = false;
    },
    handleRebuildCreate() {
      this.rebuildInstSoltFlag = false;
    },
    handleShow() {
      this.instSoltToImageFlag = false;
    },
    handleClick() {
      alert(Vue.t('lang.edit'));
    },
    handleCommand(c) {
      alert(c);
    },
    hrefToVolumeListPage() {
      this.$router.push({
            path: '/calculate-storage/volume/VolumeList'
          });
    },
    sizeRender(value, rowData) {
      var self = this;
      var size = 0;
      var initFlag = 0;
      var unitFlag = " Bytes";
      while (value>=1024) {
        value = value/1024;
        initFlag++;
      }
      switch (initFlag) {
        case 1:
        unitFlag = " KB";
        break;
        case 2:
        unitFlag = " MB";
        break;
        case 3:
        unitFlag = " GB";
        break;
        default:
        break;
      }
      if (value) {
        value = value.toFixed(2);
      } else {
        value = 0;
      }
      size = value+unitFlag;
      return size;
    },
    statusTagRender(status) {
        if ("active" == status || "reserved" == status) {
           return "success";
        } else if ("killed" == status || "pending_delete" == status) {
           return "gray";
        } else if ("queued" == status ) {
           return "info";
        } else if ("deleted" == status) {
           return "danger";
        } else if ("in-use" == status ) {
           return "info";
        } else if ("deactivated" == status) {
           return "warning";
        } else if ("saving" == status ) {
           return "info";
        } else {
          return "";
        }
    },
    statusRender(value, rowData) {
       if (value == "queued") {
           return Vue.t('calcStorLang.queued');
       } else if (value == "saving") {
           return Vue.t('calcStorLang.saving');
       } else if (value == "active") {
           return Vue.t('calcStorLang.active');
       } else if (value == "killed") {
           return Vue.t('calcStorLang.killed');
       } else if (value == "deleted") {
           return Vue.t('calcStorLang.deleted');
       } else if (value == "pending_delete") {
           return Vue.t('calcStorLang.pendingDelete');
       } else if (value == "deactivated") {
           return Vue.t('calcStorLang.deactivated');
       } else {
           return "-";
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
      //timeStamp = timeStamp - 28800000; //北京时间比格林时间早八个小时
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
    },
    protectedRender(value, rowData) {
       if (value == true) {
           return Vue.t('lang.yes');
       } else if (value == false) {
           return Vue.t('lang.no');
       } else {
           return "-";
       }
    },
    visibilityRender(value, rowData) {
       if (value == "private") {
           return Vue.t('lang.private');
       } else if (value == "public") {
           return Vue.t('lang.public');
       } else if (value == "shared") {
           return Vue.t('calcStorLang.shared');
       } else {
           return "-";
       }
    },
    instanceIdRender(value, rowData) {
      if ("" == value || null == value) {
        return "-";
      }
      return value;
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.$refs.shTable.clearSelection();
      this.loadData(true);
    },
    gotoInstanceList() {
      this.$router.push({
        path: '/calculate-storage/instances-list'
      });
    }
  }
}
</script>