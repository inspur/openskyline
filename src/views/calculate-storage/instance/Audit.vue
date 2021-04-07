<template>
  <div>
    <el-dialog
      size="large"
      :title="$t('calcStorLang.INSTANCE_AUDIT')"
      :visible="visible"
      :before-close="handleBeforeClose">
      <div v-loading="initing">
        <el-form inline>
          <el-form-item :label="$t('calcStorLang.INSTANCE_AUDIT_AUDIT_TIME')">
            <el-row type="flex" align="middle">
              <el-input v-model="formData.period" />
              <div style="width: 50px;">{{ $t('calcStorLang.INSTANCE_AUDIT_AUDIT_HOUR') }}</div>
              <el-tooltip  effect="dark" placement="top">
                <div slot="content">{{$t('calcStorLang.INSTANCE_AUDIT_AUDIT_TIME_TIPS')}}</div>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-row>
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" icon="search" :loading="loading" @click="audit(true)">{{ $t('calcStorLang.INSTANCE_AUDIT_AUDIT') }}</el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" icon="fa-download" :disabled="totalData.length === 0" :loading="exportingExcel" @click="exportExcel">{{ $t('calcStorLang.INSTANCE_AUDIT_EXPORT') }}</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="tableData">
          <el-table-column v-if="checkedColumns.includes('name')" :label="$t('lang.name')" prop="name" align="left" min-width="50" />
          <el-table-column v-if="checkedColumns.includes('id')" label="ID" prop="id" align="left" min-width="50" />
          <el-table-column v-if="checkedColumns.includes('source')" :label="$t('calcStorLang.source')" prop="source" align="left" min-width="50" />
          <el-table-column v-if="checkedColumns.includes('ipAddress')" :label="$t('lang.ipAddress')" prop="ipAddress" align="left" min-width="50">
            <template slot-scope="scope">
              <span v-html="scope.row.ipAddress.replace(/\n\r/, '<br>')" />
            </template>
          </el-table-column>
          <el-table-column v-if="checkedColumns.includes('statusName')" :label="$t('lang.status')" prop="statusName" align="left" min-width="50" />
          <el-table-column v-if="checkedColumns.includes('taskName')" :label="$t('calcStorLang.task')" prop="taskName" min-width="50" align="left" />
          <el-table-column v-if="checkedColumns.includes('flavorName')" :label="$t('calcStorLang.resourceSpec')" prop="flavorName" align="left" min-width="50" />
          <el-table-column v-if="checkedColumns.includes('projectName')" :label="$t('lang.project')" prop="projectName" align="left" min-width="50" />
          <el-table-column v-if="checkedColumns.includes('userName')" :label="$t('calcStorLang.owner')" prop="userName" align="left" min-width="50" />
          <el-table-column v-if="checkedColumns.includes('powerStatusName')" :label="$t('calcStorLang.powerStatus')" prop="powerStatusName" align="left" min-width="50" />
          <el-table-column v-if="checkedColumns.includes('updateTime')" :label="$t('lang.updatedTime')" prop="updateTime" align="left" min-width="50" />
          <el-table-column v-if="checkedColumns.includes('createTime')" :label="$t('calcStorLang.createTime')" prop="createTime" align="left" min-width="50" />
        </el-table>
        <div>{{ $t('calcStorLang.INSTANCE_AUDIT_TIPS') }}</div>
        <el-row style="margin-top: 10px;">
          <el-col :span="5">
            <icos-column-selector
              name="InstanceAudit"
              @refresh="audit"
              @column-checked="handleColumnChecked"
              :hide-selected-items="true"
              :columns="[
            {
              prop: 'name',
              label: $t('lang.name'),
              visible: true,
              defaultChecked: true
            }, {
              prop: 'id',
              label: 'ID',
              visible: true,
              defaultChecked: true
            }, {
              prop: 'source',
              label: $t('calcStorLang.source'),
              visible: true,
              defaultChecked: true
            }, {
              prop: 'ipAddress',
              label: $t('lang.ipAddress'),
              visible: true,
              defaultChecked: true
            }, {
              prop: 'statusName',
              label: $t('lang.status'),
              visible: true,
              defaultChecked: true
            }, {
              prop: 'taskName',
              label: $t('calcStorLang.task'),
              visible: true,
              defaultChecked: true
            }, {
              prop: 'flavorName',
              label: $t('calcStorLang.resourceSpec'),
              visible: true,
              defaultChecked: true
            }, {
              prop: 'projectName',
              label: $t('lang.project'),
              visible: true,
              defaultChecked: true
            }, {
              prop: 'userName',
              label: $t('calcStorLang.owner'),
              visible: true,
              defaultChecked: true
            }, {
              prop: 'powerStatusName',
              label: $t('calcStorLang.powerStatus'),
              visible: true,
              defaultChecked: true
            }, {
              prop: 'updateTime',
              label: $t('lang.updatedTime'),
              visible: true,
              defaultChecked: true
            }, {
              prop: 'createTime',
              label: $t('calcStorLang.createTime'),
              visible: true,
              defaultChecked: true
            }]" />
          </el-col>
          <el-col :span="19">
            <page ref="pageComponent" :totalData="totalData" @getCurrentData="getCurrentData" />
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">{{ $t('lang.close') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment';
import { getInstanceStatusName, getInstanceTaskName } from '../../../utils/util';
import { exportJsonToExcel } from "../../../utils/Export2Excel";
export default {
  name: 'Audit',
  props: {
  },
  data() {
    return {
      roleType: String(Vue.roleType),
      visible: false,
      initing: false,
      loading: false,
      exportingExcel: false,
      maxPeriod: 0,
      formData: {
        period: '1'
      },
      totalData: [],
      tableData: [],
      checkedColumns: [],
      flavors: [],
      projects: [],
      users: []
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    handleBeforeClose(done) {
      done();
      this.close();
    },
    async audit(resetPage = false) {
      const $this = this;
      if (!/^[1-9][0-9]*$/.test($this.formData.period)) {
        $this.$message.error($this.$t('calcStorLang.INSTANCE_AUDIT_AUDIT_TIME_TIPS'));
        return;
      }
      if (parseInt($this.formData.period) > $this.maxPeriod) {
        $this.$message.error($this.$t('calcStorLang.INSTANCE_AUDIT_MAX_PERIOD_TIPS'));
        return;
      }
      $this.loading = true;
      let period = parseInt($this.formData.period) * -1;
      let time = moment().add(period, 'h').utc().toISOString();
      const res = await $this.$ajax({
        type: 'get',
        url: `/api/nova/v2.1/servers-inspur/detail?audit=true&changes-before=${time}`,
        headers: {
          'X-OpenStack-Nova-API-Version': '2.66'
        }
      });
      let totalData = res.servers;
      totalData.forEach(item => {
        item.source = $this.getSource(item);
        item.ipAddress = $this.getIPAddress(item);
        item.statusName = getInstanceStatusName(item.status);
        item.taskName = getInstanceTaskName.call(this, item['OS-EXT-STS:task_state']);
        item.flavorName = $this.getFlavorName(item);
        item.projectName = $this.getProjectName(item);
        item.userName = $this.getUserName(item);
        item.powerStatusName = $this.getPowerStatusName(item);
        item.updateTime = $this.getUpdateTime(item);
        item.createTime = $this.getCreateTime(item);
      });
      $this.totalData = totalData;
      if (resetPage) {
        $this.$refs.pageComponent.setCurrentPage(1);
      }
      $this.loading = false;
    },
    async loadFlavors() {
      const $this = this;
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
    async loadProjects() {
      const $this = this;
      try {
        let res = await $this.$ajax({
          type: 'get',
          url: 'api/keystone/v3/projects?domain_id=default'
        });
        $this.projects = res.projects;
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    async loadUsers(projectId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: 'api/keystone/v3/inspur/users?dir=asc&field=name&domain_id=default'
        });
        $this.users = res.users;
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    getSource(instance) {
      const $this = this;
      let type = instance['metadata']['source_type'];
      let sourceId = '';
      if (type === 'image') {
        sourceId = instance['image'].id;
        return `${$this.$t('calcStorLang.image')}(${sourceId})`;
      } else if (type === 'snapshot') {
        sourceId = instance['image'].id;
        return `${$this.$t('calcStorLang.instanceshot')}(${sourceId})`;
      } else if (type === 'volume') {
        let volumes = instance['os-extended-volumes-inspur:volumes_attached'];
        let bootVolume = volumes.find(item => item.boot_disk === true);
        if (bootVolume) {
          sourceId = bootVolume.id;
          return `${$this.$t('calcStorLang.volume')}(${sourceId})`;
        } else {
          return '-';
        }
      } else {
        return '-';
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
    getIPAddress(instance) {
      const $this = this;
      let ipAddresses = [];
      for (let netCard of $this.getNetCards(instance)) {
        ipAddresses.push(netCard.ip);
        if (netCard.fip !== null) {
          ipAddresses.push(`(${$this.$t('calcStorLang.RECYCLE_BIN_FLOATING_IP')} ${netCard.fip})`);
        }
      }
      return ipAddresses.join('\n\r');
    },
    getFlavorName(instance) {
      const $this = this;
      let flavorId = instance.flavor.id;
      let flavor = $this.flavors.find(item => item.id === flavorId);
      return flavor ? flavor.name : '-';
    },
    getProjectName(instance) {
      const $this = this;
      let projectId = instance.tenant_id;
      let project = $this.projects.find(item => item.id === projectId);
      return project ? project.name : '-';
    },
    getUserName(instance) {
      const $this = this;
      let userId = instance.user_id;
      let user = $this.users.find(item => item.id === userId);
      return user ? user.name : '-';
    },
    getPowerStatusName(instance) {
      let status = String(instance['OS-EXT-STS:power_state']);
      if (status === '0') {
        return '-';
      } else if (status === '1') {
        return this.$t('calcStorLang.running');
      } else if (status === '3') {
        return this.$t('calcStorLang.paused');
      } else if (status === '4') {
        return this.$t('calcStorLang.closed');
      } else if (status === '6') {
        return this.$t('calcStorLang.inst_collapse');
      } else if (status === '7') {
        return this.$t('calcStorLang.suspended');
      } else {
        return '-';
      }
    },
    getUpdateTime(instance) {
      return moment(instance.updated).local().format('YYYY-MM-DD HH:mm:ss');
    },
    getCreateTime(instance) {
      return moment(instance.created).local().format('YYYY-MM-DD HH:mm:ss');
    },
    exportExcel() {
      const $this = this;
      $this.exportingExcel = true;
      try {
        const instances = $this.totalData;
        const headers = {
          name: {
            zh_cn: $this.$t('lang.name', 'zh_cn'),
            en: $this.$t('lang.name', 'en')
          },
          id: {
            zh_cn: 'ID',
            en: 'ID'
          },
          source: {
            zh_cn: $this.$t('calcStorLang.source', 'zh_cn'),
            en: $this.$t('calcStorLang.source', 'en')
          },
          ipAddress: {
            zh_cn: $this.$t('lang.ipAddress', 'zh_cn'),
            en: $this.$t('lang.ipAddress', 'en')
          },
          statusName: {
            zh_cn: $this.$t('lang.status', 'zh_cn'),
            en: $this.$t('lang.status', 'en')
          },
          taskName: {
            zh_cn: $this.$t('calcStorLang.task', 'zh_cn'),
            en: $this.$t('calcStorLang.task', 'en')
          },
          flavorName: {
            zh_cn: $this.$t('calcStorLang.resourceSpec', 'zh_cn'),
            en: $this.$t('calcStorLang.resourceSpec', 'en')
          },
          projectName: {
            zh_cn: $this.$t('lang.project', 'zh_cn'),
            en: $this.$t('lang.project', 'en')
          },
          userName: {
            zh_cn: $this.$t('calcStorLang.owner', 'zh_cn'),
            en: $this.$t('calcStorLang.owner', 'en')
          },
          powerStatusName: {
            zh_cn: $this.$t('calcStorLang.powerStatus', 'zh_cn'),
            en: $this.$t('calcStorLang.powerStatus', 'en')
          },
          updateTime: {
            zh_cn: $this.$t('lang.updatedTime', 'zh_cn'),
            en: $this.$t('lang.updatedTime', 'en')
          },
          createTime: {
            zh_cn: $this.$t('calcStorLang.createTime', 'zh_cn'),
            en: $this.$t('calcStorLang.createTime', 'en')
          }
        };
        const flattenData = instances.map(instance =>
          Object.keys(headers).map(k => {
            return instance[k] || "";
          })
        );
        exportJsonToExcel({
          header: Object.keys(headers).map(k => headers[k][Vue.language]),
          data: flattenData,
          filename: "instances"
        });
        $this.exportingExcel = false;
      } catch (e) {
        $this.exportingExcel = false;
        __DEV__ && console.error(e);
      }
    },
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    getCurrentData(data) {
      this.tableData = data;
    }
  },
  beforeDestory() {
    this.visible = false;
  },
  async mounted() {
    const $this = this;
    $this.visible = true;
    $this.initing = true;
    $this.maxPeriod = parseInt((new Date()).getTime() / 1000 / 60 / 60);
    Promise.all([
      $this.loadFlavors(),
      $this.loadProjects(),
      $this.loadUsers()
    ]).then((res) => {
      $this.initing = false;
      $this.audit(true);
    }).catch(() => {
      $this.initing = false;
    });
  }
}
</script>

<style scoped>
</style>