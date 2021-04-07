<template>
  <div>
    <icos-search-bar
      :conditions="searchBar.conditions"
      @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel">
      <operation-panel :select-rows="selectedRows" :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="table" v-loading="loading" :data="pagedData" stripe border style="width: 100%" row-key="backup_id" @selection-change="handleSelectionChange">
      <el-table-column
        reserve-selection
        type="selection"
        width="55"
        align="center"
        :selectable="function(row, index) { return !['deleting'].includes(row['status']) }">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('display_name') >= 0" prop="display_name" :label="$t('calcStorLang.backupName')">
        <template slot-scope="scope">
          <el-popover placement="top-start">
            <el-table :data="scope.row.backupVolumeInfos">
              <el-table-column label="UUID" prop="id"></el-table-column>
              <el-table-column :label="$t('calcStorLang.volumeName')" prop="name"></el-table-column>
              <el-table-column :label="$t('calcStorLang.volumeMount')" prop="path"></el-table-column>
              <el-table-column :label="$t('calcStorLang.type')">
                <template slot-scope="scope2">
                  {{ scope2.row.path == '/dev/vda' ? $t('calcStorLang.instSystemDisk') : $t('calcStorLang.instDataDisk') }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('calcStorLang.volumeDiskSize')" prop="size">
                <template slot-scope="scope2">
                  {{ scope2.row.size }} GB
                </template>
              </el-table-column>
            </el-table>
            <el-button size="small" type="text" slot="reference">{{ scope.row.display_name }}</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column align="left" v-if="columnsChecked.indexOf('backup_id') >= 0" prop="backup_id" :label="$t('calcStorLang.backupId')">
      </el-table-column>
      <el-table-column align="left" v-if="columnsChecked.indexOf('created_at') >= 0" prop="created_at" :label="$t('calcStorLang.createTime')">
        <template slot-scope="scope">
          {{ scope.row.created_at | createTime }}
        </template>
      </el-table-column>
      <el-table-column align="left" v-if="columnsChecked.indexOf('owner') >= 0" prop="owner" :label="$t('calcStorLang.owner')">
      </el-table-column>
      <el-table-column align="left" v-if="columnsChecked.indexOf('instance_uuid') >= 0" prop="instance_uuid" :label="$t('calcStorLang.sourceInstanceId')">
        <template slot-scope="scope">
          <el-button size="small" type="text" @click="vmDetail(scope.row)">{{ scope.row.instance_uuid }}</el-button>
        </template>
      </el-table-column>
      <el-table-column align="left" v-if="columnsChecked.indexOf('status') >= 0" prop="status" :label="$t('calcStorLang.status')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status == 'creating'" type="loading" :close-transition="true">{{ $t('calcStorLang.backupStatusCreating') }}</el-tag>
          <el-tag v-if="scope.row.status == 'available'" type="success" :close-transition="true">{{ $t('calcStorLang.backupStatusAvailable') }}</el-tag>
          <el-tag v-if="scope.row.status == 'deleting'" type="loading" :close-transition="true">{{ $t('calcStorLang.backupStatusDeleting') }}</el-tag>
          <el-tag v-if="scope.row.status == 'error'" type="danger" :close-transition="true">{{ $t('calcStorLang.backupStatusError') }}</el-tag>
          <el-tag v-if="scope.row.status == 'restoring'" type="loading" :close-transition="true">{{ $t('calcStorLang.backupStatusRestoring') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('display_description') >= 0" prop="display_description" :label="$t('calcStorLang.backupDescription')">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="loadData(false, true)">
          </el-button>
          <span>{{$t('calcStorLang.currentSelect')}} {{selectedRows.length}} {{$t('calcStorLang.bar')}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :objStorFlag="currentPageReset"></page>
        </el-col>
      </el-row>
    </div>

    <create-instance-backup
      v-if="createInstanceBackupShow"
      @handleClose="onCreateInstanceBackupClose"
      @handleConfirm="onCreateInstanceBackupConfirm"
    />

    <edit-instance-backup
      v-if="editInstanceBackupShow"
      :id="editInstanceBackupId"
      :instanceName="editInstanceBackupInstanceName"
      @handleClose="onEditInstanceBackupClose"
      @handleConfirm="onEditInstanceBackupConfirm"
    />

    <create-instance
      v-if="createInstanceDialog.visible"
      :preset-data="createInstanceDialog"
      @close="createInstanceDialog.visible = false"
      @refresh="gotoInstanceList"
    />

    <restore-to-source-instance
      v-if="restoreToSourceInstanceDialog.visible"
      :instanceId="restoreToSourceInstanceDialog.instanceId"
      :backupId="restoreToSourceInstanceDialog.backupId"
      @close="restoreToSourceInstanceDialog.visible = false"
      @restore-to-new-instance="showCreateInstanceByBackup"
      @refresh="loadData(false, true)"
    />

    <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix">
            <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t("lang.back")}}</el-button>
          </div>
          <div>
            <instance-detail :instanceId="instanceId" :projectMaps="projectMap" :userMaps="userMaps"></instance-detail>
          </div>
        </panel>
      </div>
    </transition>
  </div>
</template>

<script>
import _ from 'underscore';
import CreateInstanceBackup from './CreateInstanceBackup';
import EditInstanceBackup from './EditInstanceBackup';
import InstanceDetail from '../instance/InstanceDetail';
import CreateInstance from '../instance/create-instance';
import RestoreToSourceInstance from './RestoreToSourceInstance';
import moment from 'moment'
export default {
  name: "InstanceBackup",
  components: {
    CreateInstanceBackup,
    EditInstanceBackup,
    InstanceDetail,
    CreateInstance,
    RestoreToSourceInstance
  },
  data() {
    return {
      loading: false,
      selectedRows: [],
      projectList: [],
      projectMap: new Map(),
      createInstanceBackupShow: false,
      editInstanceBackupShow: false,
      editInstanceBackupId: '',
      editInstanceBackupInstanceName: '',
      detailFlag: false,
      instanceId: '',
      projectMaps: new Map(),
      userMaps: new Map(),
      operationMenus: [{
        icon: "fa-plus",
        name:  Vue.t('calcStorLang.create'),
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.createInstanceBackupShow = true;
        }.bind(this)
      }, {
        icon: "fa-rotate-left",
        name: this.$t('calcStorLang.backupRestore'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return rowData.status == 'available';
        },
        handler: function(selectRows) {
          const backup = selectRows[0];
          this.restoreToSourceInstanceDialog.backupId = backup.backup_id;
          this.restoreToSourceInstanceDialog.instanceId = backup.instance_uuid;
          this.restoreToSourceInstanceDialog.visible = true;
          // this.showCreateInstanceByBackup(backup.backup_id);
        }.bind(this)
      }, {
        icon: "fa-edit",
        name:  Vue.t('lang.edit'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          const row = selectRows[0];
          this.editInstanceBackupId = row.backup_id;
          this.editInstanceBackupInstanceName = row.backupMeta.name;
          this.editInstanceBackupShow = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return rowData.status === 'available' || rowData.status === 'error' || rowData.status === 'creating';
        },
        handler: function(selectRows) {
          const $this = this;
          const projectId = $this.$cookie.get('pid');
          $this.$sequence({
            type: 'delete',
            url: `api/nova/v2.1/${projectId}/os-server-backups/{backup_id}`,
            params: selectRows,
            confirmMsg: Vue.t('calcStorLang.backupDeleteComfirm'),
            log: {
              description: {
                en: `Delete Instance Backup`,
                zh_cn: `删除云主机备份`
              },
              key: "display_name",
              target: Vue.logTarget.instanceBackup
            }
          }).then((data) => {
            selectRows.forEach(item => {
              item['status'] = 'deleting';
            });
            $this.$message(Vue.t('calcStorLang.backupDeletedSuccess'));
            $this.$refs.table.clearSelection();
            $this.loadData();
          }).catch((err) => {
            __DEV__ && console.error(err);
          });
        }.bind(this)
      }],
      columnsChecked: ['backup_id', 'instance_uuid', 'created_at', 'owner', 'display_name', 'status', 'display_description'],
      columns: [],
      totalData: [],
      currentPageReset: false,
      filteredData: [],
      pagedData: [],
      users: [],
      refreshHandler: null,
      searchBar: {
        conditions: {
          backup_id: {
            label: this.$t('calcStorLang.backupId'),
            type: 'input',
            validator: (value) => {
              if (!/^[a-fA-F0-9\-]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyUUIDKeyword'));
              }
            }
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
          display_name: {
            label: this.$t('calcStorLang.backupName'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          }
        },
        validatedParams: {}
      },
      createInstanceDialog: {
        visible: false,
        canSelectSource: false,
        sourceType: 'backup',
        sourceId: '',
        sourceName: '',
        sourceOSDistro: '',
        sourceMinRam: 0,
        sourceMinDisk: 0,
        sourceImageFormat: '',
        sourceSize: 0,
        vcpus: 0,
        ram: 0,
        disk: 0,
        flavorId: '',
        networks: [],
        projectId: '',
        projectIdLocked: true,
        userId: ''
      },
      restoreToSourceInstanceDialog: {
        visible: false,
        instanceId: '',
        backupId: ''
      }
    };
  },
  methods: {
    async startLoadData(currentPageReset=false) {
      const $this = this;
      $this.loading = true;
      await $this.loadData(currentPageReset);
      $this.loading = false;
    },
    async loadData(currentPageReset=false, clearSel=false) {
      const $this = this;
      let url = `api/nova/v2.1/${$this.$cookie.get("pid")}/os-server-backups?`;
      url += Object.keys($this.searchBar.validatedParams).map(key => {
        return `${key}=${$this.searchBar.validatedParams[key]}`;
      }).join('&');
      const result = await $this.$ajax({
        type: 'get',
        url: url,
        errFun: function() {
          $this.loading = false;
        },
        headers: {
          'X-OpenStack-Nova-API-Version': 2.41
        }
      });
      if (_.difference($this.totalData.map(item => item.backup_id), result.backups.map(item => item.backup_id)).length > 0) {
        $this.$refs.table.clearSelection();
      }
      if (currentPageReset) {
        $this.currentPageReset = true;
      }
      $this.totalData = result.backups;
      $this.$nextTick(() => {
        $this.currentPageReset = false;
      });
      if (clearSel) {
        $this.$refs.table.clearSelection();
      }
      $this.totalData.map(backup => {
        backup.backupMeta = backup.backup_meta;
        if (JSON.stringify(backup.backup_volume_info) !== '{}') {
          const backupVolumeInfoFromJSON = backup.backup_volume_info;
          const backupVolumeInfos = [];
          //转换成扁平的数组结构
          backupVolumeInfoFromJSON.forEach(item => {
            for (let key in item) {
              backupVolumeInfos.push({
                path: key,
                id: item[key].id,
                name: item[key].name,
                size: item[key].size
              });
            }
          });
          backup.backupVolumeInfos = backupVolumeInfos.sort((a, b) => {
            if (a.path > b.path) {
              return 1;
            } else if (a.path < b.path) {
              return -1;
            } else {
              return 0;
            }
          });
        } else {
          backup.backupVolumeInfos = [];
        }
        const user = $this.users.find(item => item.id === backup.user_id);
        if (user !== null && user !== undefined) {
          backup.owner = user.name;
        } else {
          backup.owner = '-';
        }
      });
      if ($this.totalData.findIndex(item => item.status == 'creating' || item.status == 'deleting' || item.status == 'restoring') > -1) {
        const refreshHandler = setTimeout(() => {
          $this.loadData();
        }, 5000);
        $this.refreshHandler = refreshHandler;
      }
    },
    async loadUsers() {
      const $this = this;
      let res = await this.$ajax({
        type: 'get',
        url: `api/keystone/v3/inspur/users`
      })
      $this.users = res.users;
    },
    rowClick() {},
    handleSelectionChange(selectedRows) {
      const $this = this;
      $this.selectedRows = selectedRows;
    },
    getCurrentData(pagedData) {
      const $this = this;
      $this.pagedData = pagedData;
    },
    sortChange() {},
    onCreateInstanceBackupClose() {
      const $this = this;
      $this.createInstanceBackupShow = false;
    },
    onCreateInstanceBackupConfirm() {
      const $this = this;
      $this.loadData();
    },
    onEditInstanceBackupClose() {
      const $this = this;
      $this.editInstanceBackupShow = false;
    },
    onEditInstanceBackupConfirm() {
      const $this = this;
      $this.loadData();
    },
    async vmDetail(row) {
      const $this = this;
      try {
        let result = await $this.$ajax({
          type: 'get',
          url: "api/nova/v2.1/servers-inspur/" + row.instance_uuid,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.41
          },
          showErrMsg: false
        });
        $this.instanceId = row.instance_uuid;
        $this.detailFlag = true;
      } catch (e) {
        $this.$message({
          message: Vue.t('calcStorLang.instanceNotFound'),
          type: 'error'
        });
      }
    },
    async loadUserList() {
      var $this = this;
      var url = "api/keystone/v3/inspur/users?dir=asc&field=name&domain_id=default";
      var roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        url = "api/keystone/v3/inspur/users?project_id=" + $this.$cookie.get('pid');
      }
      try {
        let result = await $this.$ajax({
          type: 'get',
          url: url
        });
        var list = result['users'];
        var usersList = list;
        // usersList.push({"id": "all", "name": "所有"});
        for (var u = 0; u < list.length; u++) {
          var obj = list[u];
          $this.userMaps.set(obj.id, obj.name);
        }
        $this.projectUsersOptions = usersList;
        for (let aa = 0; aa < $this.totalData.length; aa++) {
          var aaObject = $this.totalData[aa];
          aaObject.ownerName = $this.userMaps.get(aaObject['user_id']);
        }
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    onBack() {
      this.detailFlag = false;
    },
    async loadProjectList() {
      //查询所有的项目列表
      var $this = this;
      var roleType = Vue.roleType + "";
      var url = "api/keystone/v3/projects?domain_id=default";
      if ("2" == roleType || "3" == roleType) {
        //非超级管理员，查询一个项目信息
        url = "api/keystone/v3/projects/" + this.$cookie.get("pid");
      }
      try {
        let result = await $this.$ajax({
          type: "get",
          url: url,
          showErrMsg: false
        });
        if ("2" == roleType || "3" == roleType) {
          $this.projectList.push(result["project"]);
          $this.projectMap.set(result["project"].id, result["project"].name);
        } else {
          //$this.projectList = result['projects'];
          var projects = result["projects"];
          for (var q = 0; q < projects.length; q++) {
            $this.projectMap.set(projects[q].id, projects[q].name);
          }
          //$this.projectList.push({"name":"", "id":""});
          $this.projectList = $this.projectList.concat(result["projects"]);
        }
      } catch (res) {
        console.error(res);
      }
    },
    handleConditionValueChanged({key, value}) {
      if (key === 'project_id') {
        this.loadFilteredUsers(value);
      }
    },
    handleSearch(params) {
      const $this = this;
      $this.searchBar.validatedParams = params;
      $this.$refs.table.clearSelection();
      $this.startLoadData(true, true);
    },
    showCreateInstanceByBackup(backupId) {
      const $this = this;
      const backup = $this.totalData.find(item => item.backup_id === backupId);
      const projectId = this.$cookie.get('pid');
      let minDisk = 0;
      backup.backupVolumeInfos.forEach(volume => {
        // 系统盘
        if (volume.path === '/dev/vda') {
          minDisk = volume.size;
        }
      });
      this.createInstanceDialog.sourceId = backup.backup_id;
      this.createInstanceDialog.sourceName = backup.display_name;
      this.createInstanceDialog.sourceMinRam = backup.backupMeta.flavor.ram;
      this.createInstanceDialog.sourceMinDisk = minDisk;
      this.createInstanceDialog.sourceImageFormat = '';
      this.createInstanceDialog.sourceSize = minDisk;
      this.createInstanceDialog.vcpus = backup.backupMeta.flavor.vcpu;
      this.createInstanceDialog.ram = backup.backupMeta.flavor.ram;
      this.createInstanceDialog.disk = minDisk;
      this.createInstanceDialog.flavorId = backup.backupMeta.flavor.id;
      this.createInstanceDialog.projectId = projectId;
      this.createInstanceDialog.networks = backup.backupMeta.networks;
      this.createInstanceDialog.userId = backup.user_id;
      this.createInstanceDialog.visible = true;
    },
    gotoInstanceList() {
      this.$router.push({
        path: '/calculate-storage/instances-list'
      });
    }
  },
  beforeDestroy() {
    clearTimeout(this.refreshHandler);
  },
  async mounted() {
    const $this = this;
    $this.$refs.table.$children.forEach((item, index) => {
      if (item.label && item.prop) {
        $this.columns.push({
          prop: item.prop,
          label: item.label
        });
      }
    });
    $this.loading = true;
    Promise.all([$this.loadUsers(), $this.loadProjectList(), $this.loadUserList()]).then(res => {
      $this.startLoadData();
    });
  },
  filters: {
    createTime(val) {
      const time = moment.utc(val);
      time.local();
      return time.format('YYYY-MM-DD HH:mm:ss');
    }
  }
};
</script>

<style>
</style>
