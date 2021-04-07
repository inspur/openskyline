<template>
  <div v-loading="loading">
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" style="margin-bottom: 5px;" />
    <el-table ref="table" max-height="300" :data="templates" row-key="id" @row-click="handleRowClick" :default-sort="{prop: 'created_at', order: 'descending'}">
      <el-table-column width="35">
        <template slot-scope="scope">
          <el-radio v-model="selectedTemplateId" :label="scope.row.id">&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_NAME')" prop="name" sortable />
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK')" prop="network_name" />
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_SUB_NET')" prop="subnet_name">
        <template slot-scope="scope">
          <span v-if="'subnet_name' in scope.row && scope.row.subnet_name !== ''">{{ scope.row.subnet_name }}({{ scope.row.cidr }})</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_QOS')" prop="qos_policy_name">
        <template slot-scope="scope">
          <span v-if="'qos_policy_name' in scope.row && scope.row.qos_policy_name !== ''">{{ scope.row.qos_policy_name }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_NET_SAFE_GROUP')" prop="security_groups">
        <template slot-scope="scope">
          <span v-if="scope.row.safeGroups.length > 0">{{ scope.row.safeGroups.map(sg => sg.name).join(', ') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_CREATED_AT')" prop="created_at" sortable>
        <template slot-scope="scope">
          {{ scope.row.created_at | dateTimeFormatter }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_NET_SAFE_GROUP_DESCRIPTION')" prop="description" />
    </el-table>
    <div style="display: flex; flex-direction: row; justify-content: space-between; item-align: center;">
      <div>
        <el-button type="text" icon="fa-refresh" @click="loadTemplates" />
        {{ $t('calcStorLang.NG_CREATE_INSTANCE_SELECTED', selectedTemplateId === '' ? 0 : 1) }}
      </div>
      <div>
        {{ $t('calcStorLang.NG_CREATE_INSTANCE_TOTAL', templates.length) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    projectId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
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
          }
        },
        validatedParams: {}
      },
      templates: [],
      selectedTemplateId: ''
    };
  },
  methods: {
    async getProjectNetworks(projectId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/networks?project_id=${projectId}&shared=false&status=ACTIVE&router:external=false&not-tags=bm_deploy`
        });
        return res.networks;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async getSharedNetworks() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/networks?shared=true&status=ACTIVE&not-tags=bm_deploy`
        });
        return res.networks;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async getNetworks(projectId) {
      const $this = this;
      return new Promise((resolve, reject) => {
        Promise.all([$this.getProjectNetworks(projectId), $this.getSharedNetworks()]).then((res) => {
          let networks = res[0].concat(res[1]);
          resolve(networks);
        }).catch(e => {
          reject(e);
        });
      });
    },
    async loadTemplates() {
      const $this = this;
      try {
        $this.loading = true;
        const netSafeGroups = await this.loadNetSafeGroups();
        let params = {
          state: 'valid',
          project_id: $this.projectId
        };
        const networks = await this.getNetworks($this.projectId);
        Object.assign(params, $this.searchBar.validatedParams);
        const queryString = Object.keys(params).map(key => {
          return `${key}=${params[key]}`;
        }).join('&');
        const res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/inspur/network_policy_templates?${queryString}`,
          showErrMsg: true
        });
        let templates = res.network_policy_templates;
        templates = templates.filter(item => {
          let network = networks.find(n => n.id === item.network_id);
          if (!network || network.tags.includes('bm_deploy')) {
            return false;
          }
          return true;
        });
        templates.forEach(item => {
          const safeGroups = [];
          item.security_groups.forEach(sg => {
            safeGroups.push(netSafeGroups.find(n => n.id === sg));
          });
          item.safeGroups = safeGroups;
        });
        $this.templates = templates;
        $this.selectedTemplateId = '';
        $this.$emit('data-change', {});
        $this.loading = false;
      } catch (e) {
        $this.loading = false;
        __DEV__ && console.error(e);
      }
    },
    async loadNetSafeGroups() {
      const $this = this;
      if ($this.projectId !== '') {
        try {
          $this.loading = true;
          const res = await $this.$ajax({
            type: 'get',
            url: `api/neutron/v2.0/security-groups?tenant_id=${$this.projectId}`
          });
          let netSafeGroups = res.security_groups;
          return netSafeGroups;
        } catch (e) {
          __DEV__ && console.error(e);
        }
      }
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.loadTemplates();
    },
    handleRowClick(row) {
      this.selectedTemplateId = row.id;
      this.$emit('data-change', row);
    },
    doLayout() {
      this.$nextTick(() => {
        this.$refs.table.doLayout();
      });
    }
  },
  watch: {
    projectId: {
      immediate: true,
      handler(newValue) {
        this.$nextTick(async () => {
          await this.loadTemplates();
        });
      }
    }
  }
}
</script>

<style>

</style>