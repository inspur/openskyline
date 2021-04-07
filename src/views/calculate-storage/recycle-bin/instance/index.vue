<template>
  <div>
    <icos-search-bar
      :conditions="searchBar.conditions"
      @search="handleSearch"
      @condition-value-changed="handleConditionValueChanged" />
    <div class="divider clearfix"></div>
    <div class="operation-panel">
      <operation-panel-new ref="operationOperate" :select-rows="multipleSelection" :operation-menus="operationMenus" :operateMore="false" style="display:inline;" />
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="table" :data="tableData" v-loading="loading" highlight-current-row @selection-change="handleSelectionChange" row-key="id" style="margin-top: 5px;">
      <el-table-column
        reserve-selection
        type="selection"
        width="55"
        align="center"
        :selectable="function(row, index) { return !['restoring', 'deleting'].includes(row['OS-EXT-STS:task_state']) }" />
      <el-table-column :label="$t('calcStorLang.RECYCLE_BIN_NAME')" v-if="checkedColumns.includes('name')" prop="name" />
      <el-table-column :label="$t('calcStorLang.RECYCLE_BIN_SOURCE')" v-if="checkedColumns.includes('source')">
        <template slot-scope="scope">
          <source-popover :instance="scope.row" />
        </template>
      </el-table-column>
      <el-table-column label="IP" v-if="checkedColumns.includes('ip')">
        <template slot-scope="scope">
          <p v-for="(netCard, index) in getNetCards(scope.row)" :key="index">
            {{ netCard.ip }}
            <span v-if="netCard.fip !== null"><br>({{ $t('calcStorLang.RECYCLE_BIN_FLOATING_IP') }} {{ netCard.fip }})</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.RECYCLE_BIN_FLAVOR')" v-if="checkedColumns.includes('flavor')">
        <template slot-scope="scope">
          <flavor-popover :flavor="getFlavor(scope.row.flavor.id)" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.RECYCLE_BIN_OWNER')" v-if="checkedColumns.includes('user')">
        <template slot-scope="scope">
          {{ getUserName(scope.row.user_id) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.RECYCLE_BIN_PROJECT')" v-if="roleType === '0' && checkedColumns.includes('project')">
        <template slot-scope="scope">
          {{ getProjectName(scope.row.tenant_id) }}
        </template>
      </el-table-column>
      <el-table-column label="ID" prop="id" v-if="checkedColumns.includes('id')" />
      <el-table-column :label="$t('calcStorLang.RECYCLE_BIN_HOST')" v-if="checkedColumns.includes('host')">
        <template slot-scope="scope">
          {{ scope.row['OS-EXT-SRV-ATTR:host'] | textOrMinus }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.RECYCLE_BIN_TASK')" align="left" v-if="checkedColumns.includes('task')">
        <template slot-scope="scope">
          <span v-if="scope.row['OS-EXT-STS:task_state'] === null">-</span>
          <el-tag v-else :close-transition="true" type="warning"><i class="el-icon-loading"></i> {{ scope.row['OS-EXT-STS:task_state'] | task }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.RECYCLE_BIN_ESTIMATED_DELETE_TIME')" v-if="checkedColumns.includes('estimatedDeleteTime')">
        <template slot-scope="scope">
          {{ scope.row.estimatedDeleteTime }}
        </template>
      </el-table-column>
    </el-table>
    <el-row style="margin-top: 10px;">
      <el-col :span="5">
        <icos-column-selector name="RecycleBin" @refresh="handleRefresh" @column-checked="handleColumnChecked" :selected-length="multipleSelection.length" :columns="[{
          prop: 'name',
          label: $t('calcStorLang.RECYCLE_BIN_NAME'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'source',
          label: $t('calcStorLang.RECYCLE_BIN_SOURCE'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'ip',
          label: 'IP',
          visible: true,
          defaultChecked: true
        }, {
          prop: 'flavor',
          label: $t('calcStorLang.RECYCLE_BIN_FLAVOR'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'user',
          label: $t('calcStorLang.RECYCLE_BIN_OWNER'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'project',
          label: $t('calcStorLang.RECYCLE_BIN_PROJECT'),
          visible: roleType === '0',
          defaultChecked: true
        }, {
          prop: 'id',
          label: 'ID',
          visible: true,
          defaultChecked: true
        }, {
          prop: 'host',
          label: $t('calcStorLang.RECYCLE_BIN_HOST'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'task',
          label: $t('calcStorLang.RECYCLE_BIN_TASK'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'estimatedDeleteTime',
          label: $t('calcStorLang.RECYCLE_BIN_ESTIMATED_DELETE_TIME'),
          visible: true,
          defaultChecked: true
        }]" />
      </el-col>
      <el-col :span="19">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[5, 10, 20, 30, 40, 60, 80, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import _ from 'underscore';
import moment from 'moment';
import SourcePopover from './SourcePopover';
import FlavorPopover from './FlavorPopover';
export default {
  name: 'RecycleBin',
  components: { SourcePopover, FlavorPopover },
  data() {
    return {
      roleType: Vue.roleType + '',
      loading: false,
      checkedColumns: [],
      currentParams: {},
      projects: [],
      users: [],
      filteredUsers: [],
      flavors: [],
      markers: [],
      tableData: [],
      queryTimes: 0,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      multipleSelection: [],
      operationMenus: [{
        icon: 'fa-repeat',
        name: this.$t('calcStorLang.RECYCLE_BIN_RESTORE'),
        showflg: true,
        multi: true,
        enable: function(instance) {
          return instance['OS-EXT-STS:task_state'] === null;
        },
        handler: async function(selectRows) {
          const $this = this;
          $this.$confirm(this.$t('calcStorLang.RECYCLE_BIN_RESTORE_CONFIRM'), $this.$t('base.confirm'), {
            confirmButtonText: $this.$t('base.confirm'),
            cancelButtonText: $this.$t('base.cancel'),
            type: 'warning'
          }).then(async() => {
            let hasError = false;
            for (let i = 0; i < selectRows.length; i++) {
              try {
                const instance = selectRows[i];
                const res = await $this.$ajax({
                  type: 'post',
                  url: `api/nova/v2.1/servers-inspur/${instance.id}/action`,
                  data: JSON.stringify({
                    restore: ''
                  }),
                  log: {
                    description: {
                      en: `Restore Soft Deleted Instance(Instance ID: ${instance.id}, Instance Name: ${instance.name})`,
                      zh_cn: `恢复软删除的云主机（云主机ID：${instance.id}，云主机名：${instance.name}）`
                    },
                    key: `name`,
                    target: Vue.logTarget.computeInstance
                  }
                });
                instance['OS-EXT-STS:task_state'] = 'restoring';
              } catch (e) {
                __DEV__ && console.error(e);
                hasError = true;
              }
            }
            $this.$refs.table.clearSelection();
            $this.loadData($this.currentParams, $this.currentPage, true, false);
            if (!hasError) {
                $this.$message($this.$t('calcStorLang.RECYCLE_BIN_RESTORE_SENT_SUCCESSFULLY'));
            }
          });
        }.bind(this)
      }, {
        icon: 'fa-ban',
        name: this.$t('calcStorLang.RECYCLE_BIN_FORCE_DELETE'),
        showflg: true,
        multi: true,
        enable: function(instance) {
          return instance['OS-EXT-STS:task_state'] === null;
        },
        handler: async function(selectRows) {
          const $this = this;
          $this.$prompt(Vue.t('lang.inputYesToContinue'), Vue.t('calcStorLang.confirm'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            inputPattern:/^YES$|^NO$/i,
            inputValue: 'NO',
            customClass: 'promptConfirmDel',
            inputErrorMessage:Vue.t('lang.onlyAcceptYesOrNo')
          }).then(async({ value }) => {
            if (value.toLowerCase() === 'yes') {
              let hasError = false;
              for (let i = 0; i < selectRows.length; i++) {
                try {
                  const instance = selectRows[i];
                  const res = await $this.$ajax({
                    type: 'delete',
                    url: `api/nova/v2.1/servers-inspur/${instance.id}/delete-type?type=force-delete`,
                    data: JSON.stringify({
                      restore: ''
                    }),
                    log: {
                      description: {
                        en: `Force Delete Instance(Instance ID: ${instance.id}, Instance Name: ${instance.name})`,
                        zh_cn: `彻底删除云主机（云主机ID：${instance.id}，云主机名：${instance.name}）`
                      },
                      key: `name`,
                      target: Vue.logTarget.computeInstance
                    }
                  });
                  instance['OS-EXT-STS:task_state'] = 'deleting';
                } catch (e) {
                  __DEV__ && console.error(e);
                  hasError = true;
                }
              }
              $this.$refs.table.clearSelection();
              $this.loadData($this.currentParams, $this.currentPage, true, false);
              if (!hasError) {
                $this.$message($this.$t('calcStorLang.RECYCLE_BIN_FORCE_DELETE_SENT_SUCCESSFULLY'));
              }
            }
          });
        }.bind(this)
      }],
      refreshTimeOut: null,
      searchBar: {
        conditions: {
          name: {
            label: this.$t('calcStorLang.RECYCLE_BIN_NAME'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          },
          uuid: {
            label: 'ID',
            type: 'input',
            validator: (value) => {
              if (!/^[0-9a-fA-F\-]*$/.test(value)) {
                throw new Error(this.$t('calcStorLang.RECYCLE_BIN_RULE_UUID_MESSAGE'));
              }
            }
          },
          ip: {
            label: 'IP',
            type: 'input',
            validator: (value) => {
              if (!/^[\.0-9]*$/.test(value)) {
                throw new Error(this.$t('calcStorLang.RECYCLE_BIN_RULE_IP_MESSAGE'));
              }
            }
          },
          project_id: {
            label: this.$t('calcStorLang.RECYCLE_BIN_PROJECT'),
            type: 'select',
            options: [],
            visible: roleType === '0'
          },
          user_id: {
            label: this.$t('calcStorLang.RECYCLE_BIN_OWNER'),
            options: [],
            type: 'select'
          },
          host: {
            label: this.$t('calcStorLang.RECYCLE_BIN_HOST'),
            options: [],
            type: 'select'
          }
        }
      }
    };
  },
  methods: {
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    handleSizeChange(val) {
      const $this = this;
      $this.pageSize = val;
      $this.currentPage = 1;
      $this.loadData($this.currentParams, 1);
    },
    handleCurrentChange(val) {
      const $this = this;
      $this.currentPage = val;
      $this.loadData($this.currentParams, $this.currentPage);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleRefresh() {
      this.loadData(this.currentParams, this.currentPage, true);
    },
    getUserName(userId) {
      const user = this.users.find(item => item.id === userId);
      if (user !== null && user !== undefined) {
        return user.name;
      } else {
        return '-';
      }
    },
    getProjectName(projectId) {
      const project = this.projects.find(item => item.id === projectId);
      if (project !== null && project !== undefined) {
        return project.name;
      } else {
        return '-';
      }
    },
    getFlavor(flavorId) {
      const flavor = this.flavors.find(item => item.id === flavorId);
      if (flavor === null || flavor === undefined) {
        return null;
      } else {
        return flavor;
      }
    },
    getNetCards(instance) {
      // 思路：以网络ID、MAC地址、IP地址为key进行列举。
      // 列举固定IP以后，将浮动IP附加在后面
      const netCards = [];
      const addresses = instance.addresses;
      for (let key in addresses) {
        for (let i = 0; i < addresses[key].length; i++) {
          const address = addresses[key][i];
          if (address['OS-EXT-IPS:type'] === 'fixed') {
            let netCard = netCards.find(item => item.ip === address.addr);
            if (!netCard) {
              netCards.push({
                id: address.network_id,
                mac: address['OS-EXT-IPS-MAC:mac_addr'],
                ip: address.addr,
                fip: null
              });
            }
          }
        }
      }
      for (let key in addresses) {
        for (let i = 0; i < addresses[key].length; i++) {
          const address = addresses[key][i];
          if (address['OS-EXT-IPS:type'] === 'floating') {
            let IPv4Pattern = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
            let netCard = netCards.find(item =>
                                        item.id === address.network_id &&
                                        item.mac === address['OS-EXT-IPS-MAC:mac_addr'] &&
                                        IPv4Pattern.test(item.ip));
            if (netCard) {
              netCard.fip = address.addr;
            }
          }
        }
      }
      return netCards;
    },
    handleConditionValueChanged({key, value}) {
      if (key === 'project_id') {
        this.loadFilteredUsers(value);
      }
    },
    handleSearch(params) {
      const $this = this;
      if ($this.roleType === '0') {
        params['all_tenants'] = 1;
      }
      params['not-tags'] = encodeURIComponent('@');
      params['sort_dir'] = 'desc';
      params['sort_key'] = 'deleted_at';
      params['soft_deleted'] = true;
      params['status'] = 'SOFT_DELETED';
      $this.loadData(params, 1, true, true);
    },
    async loadData(params = {}, page = 1, clearSel=false, setLoading=true) {
      const $this = this;
      // 暂存当前的条件，供翻页使用
      $this.currentParams = JSON.parse(JSON.stringify(params));

      // 设置当前请求的顺序号，如果请求返回时，顺序已落后，则不执行回调 // FIXME: 应通过结束request的方法进行
      const queryIndex = $this.queryTimes + 1;
      $this.queryTimes++;

      if (setLoading) {
        $this.loading = true;
      }
      if (page > 1 && $this.markerList.length > page - 2) {
        params['marker'] = $this.markerList[page - 2];
      } else {
        delete params['marker'];
      }
      if (clearSel) {
        $this.$refs.table.clearSelection();
      }
      params['limit'] = $this.pageSize;
      let queryString = Object.keys(params).map(key => {
        return `${key}=${params[key]}`
      }).join('&');
      try {
        const res = await $this.$ajax({
          method: 'get',
          url: `api/nova/v2.1/servers-inspur/detail?${queryString}`,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          }
        });

        if (queryIndex === $this.queryTimes) {
          res.servers.forEach(item => {
            if (item['OS-EXT-STS:task_state'] === 'null') {
              item['OS-EXT-STS:task_state'] = null;
            }
            const deletedAt = moment(item.deleted_at).local();
            item.deleted_at = deletedAt.format('YYYY-MM-DD HH:mm:ss');
            item['estimatedDeleteTime'] = deletedAt.add(item.reclaim_interval, 's').format('YYYY-MM-DD HH:mm:ss');
          });
          $this.tableData = res.servers;
          if ('all_instances_info' in res) {
            $this.markerList = res.all_instances_info.marker_list;
            $this.total = res.all_instances_info.total_instances;
          }
          if (res.servers.findIndex(item => item['OS-EXT-STS:task_state'] !== null) !== -1) {
            $this.refreshTimeOut = setTimeout(() => {
              // 自动刷新时，不能改变条件
              $this.loadData(params, $this.currentPage, false, false);
            }, 2000);
          }
        }
      } catch (e) {
        __DEV__ && console.error(e);
      }
      $this.loading = false;
    },
    async loadProjects() {
      const $this = this;
      try {
        let res = await $this.$ajax({
          type: 'get',
          url: 'api/keystone/v3/projects?domain_id=default'
        });
        $this.projects = res.projects;
        $this.searchBar.conditions.project_id.options = res.projects.map(item => {
          return {
            value: item.id,
            label: item.name
          };
        });
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    async loadFilteredUsers(projectId) {
      const $this = this;
      if (this.roleType === '0' && (projectId === '' || projectId === null || projectId === undefined)) {
        try {
          const res = await $this.$ajax({
            type: 'get',
            url: 'api/keystone/v3/inspur/users?dir=asc&field=name&domain_id=default'
          });
          if ($this.users.length === 0) {
            $this.users = res.users;
          }
          $this.filteredUsers = res.users;
          $this.searchBar.conditions.user_id.options = res.users.map(item => {
            return {
              value: item.id,
              label: item.name
            };
          });
        } catch (res) {
          __DEV__ && console.error(res);
        }
      } else {
        try {
          if (roleType !== '0') {
            projectId = $this.$cookie.get('pid');
          }
          const res = await $this.$ajax({
            type: 'get',
            url: `api/keystone/v3/inspur/assignments/projects/${projectId}/users`
          });
          $this.users = res.users.map(item => item.user);
          $this.filteredUsers = res.users.map(item => item.user);
          $this.searchBar.conditions.user_id.options = res.users.map(item => {
            return {
              label: item.user.name,
              value: item.user.id
            };
          });
        } catch (res) {
          __DEV__ && console.error(res);
        }
      }
    },
    async loadFlavors() {
      let $this = this;
      try {
        let res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/flavors-inspur/detail`
        });
        let flavors = res.flavors;
        $this.flavors = flavors;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadHosts() {
      const $this = this;
      const res = await $this.$ajax({
        type: 'get',
        url: `api/nova/v2.1/os-hypervisors-inspur/detail`
      });
      let hosts = res.hypervisors.filter(item => item.hypervisor_type !== 'ironic');
      hosts = _.sortBy(hosts, 'hypervisor_hostname');
      $this.searchBar.conditions.host.options = hosts.map(item => {
        return {
          value: item.hypervisor_hostname,
          label: item.hypervisor_hostname
        };
      });
    }
  },
  async mounted() {
    this.loading = true;
    if (this.roleType === '0') {
      await this.loadProjects();
    }
    await this.loadFilteredUsers();
    await this.loadHosts();
    await this.loadFlavors();
    await this.handleSearch({});
  },
  beforeDestroy() {
    if (this.refreshTimeOut !== null) {
      clearTimeout(this.refreshTimeOut);
    }
  },
  filters: {
    textOrMinus(value) {
      if (value === '' || value === undefined || value === null) {
        return '-';
      }
      return value;
    },
    task(value) {
      if (value !== null) {
        value = value.toUpperCase();
      }
      switch (value) {
        case 'BUSY':
          return Vue.t('calcStorLang.RECYCLE_BIN_TASK_BUSY');
        case 'RESTORING':
          return Vue.t('calcStorLang.RECYCLE_BIN_TASK_RESTORING');
        case 'DELETING':
          return Vue.t('calcStorLang.RECYCLE_BIN_TASK_DELETING');
        default:
          return '-';
      }
    }
  }
}
</script>

<style>

</style>
