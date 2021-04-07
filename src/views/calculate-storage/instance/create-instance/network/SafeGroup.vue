<template>
  <div v-loading="loading">
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" style="margin-bottom: 5px;" />
    <el-table ref="table" max-height="200" :data="netSafeGroups" row-key="id" @selection-change="handleSelectionChanged">
      <el-table-column reserve-selection type="selection" width="55" />
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_NET_SAFE_GROUP_NAME')" prop="name" />
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_NET_SAFE_GROUP_DESCRIPTION')" prop="description" />
    </el-table>
    <div style="display: flex; flex-direction: row; justify-content: space-between; item-align: center;">
      <div>
        <el-button type="text" icon="fa-refresh" @click="loadNetSafeGroups" />
        {{ $t('calcStorLang.NG_CREATE_INSTANCE_SELECTED', selectedSafeGroups.length) }}
      </div>
      <div>
        {{ $t('calcStorLang.NG_CREATE_INSTANCE_TOTAL', netSafeGroups.length) }}
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
    },
    sourceType: {
      type: String,
      default: 'image'
    },
    presetSafeGroupIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      init: false,
      netSafeGroups: [],
      selectedSafeGroups: [],
      searchBar: {
        conditions: {
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetterNumber_Chinese'));
              }
            }
          }
        },
        validatedParams: {}
      }
    };
  },
  methods: {
    async loadNetSafeGroups() {
      const $this = this;
      if ($this.projectId !== '') {
        try {
          $this.loading = true;
          const res = await $this.$ajax({
            type: 'get',
            url: `api/neutron/v2.0/security-groups?project_id=${$this.projectId}`
          });
          let netSafeGroups = res.security_groups;
          netSafeGroups = netSafeGroups.filter(item => {
            if ($this.searchBar.validatedParams.name) {
              let searchName = $this.searchBar.validatedParams.name.toLowerCase();
              return item.name.toLowerCase().includes(searchName);
            }
            return true;
          });
          $this.netSafeGroups = netSafeGroups;
          $this.$refs.table.clearSelection();
          if (!$this.init) {
            $this.netSafeGroups.forEach(item => {
              if (item.name === 'default') {
                $this.$refs.table.toggleRowSelection(item, true);
              }
            });
            if ($this.sourceType === 'backup') {
              $this.netSafeGroups.forEach(item => {
                if ($this.presetSafeGroupIds.includes(item.id)) {
                  $this.$refs.table.toggleRowSelection(item, true);
                }
              });
            }
            $this.init = true;
          }
          $this.loading = false;
        } catch (e) {
          $this.loading = false;
          __DEV__ && console.error(e);
        }
      }
    },
    handleSelectionChanged(params) {
      this.selectedSafeGroups = params;
      this.$emit('data-change', params);
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.loadNetSafeGroups();
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
      handler(newValue, oldValue) {
        if (newValue !== '') {  // 如果新projectId为空则不继续，用来处理直接打开创建云主机的情况
          this.init = false;  // 监听projectId变化，直接取消初始化标记，以便和手动刷新数据的行为进行区分
          this.$nextTick(() => {
            this.loadNetSafeGroups();
          });
        }
      }
    }
  }
}
</script>

<style>

</style>