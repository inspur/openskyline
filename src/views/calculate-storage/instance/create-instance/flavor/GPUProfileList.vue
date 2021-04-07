<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" />
    <el-table ref="table" :data="tableData" row-key="uuid" @row-click="handleGPUProfileRowClick" v-loading="loading" style="margin-top: 5px;">
      <el-table-column width="35">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.selected" style="pointer-events: none;" />
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('name')" width="100" :label="$t('calcStorLang.GPU_NAME')" prop="name" />
      <el-table-column v-if="checkedColumns.includes('gpu_group')" :label="$t('calcStorLang.GPU_GROUP')">
        <template slot-scope="scope">
          <gpu-group-info :groups="scope.row.show_groups" :devices="gpuDevices" />
        </template>
      </el-table-column>
    </el-table>
    
    <el-row type="flex" justify="space-between" align="middle">
      <icos-column-selector @refresh="loadData" @column-checked="handleColumnChecked" :selected-length="selectedGPUProfiles.length" :columns="[{
        prop: 'name',
        label: $t('calcStorLang.GPU_NAME'),
        visible: true,
        defaultChecked: true
      }, {
        prop: 'gpu_group',
        label: $t('calcStorLang.GPU_GROUP'),
        visible: true,
        defaultChecked: true
      }]" />
      <div>
        <page
          ref="pageComponent"
          :totalData="gpuProfiles"
          :sortObj="sortObj"
          :pageCount="5"
          @getCurrentData="handleGetCurrentData" />
      </div>
    </el-row>
  </div>
</template>

<script>
import GPUGroupInfo from '../../../high-config/gpu/gpu-profile/GroupInfo';
export default {
  name: 'GPUProfileList',
  props: {
    projectId: {
      type: String,
      default: ''
    },
    hosts: {
      type: Array,
      default: () => []
    }
  },
  components: {
    'gpu-group-info': GPUGroupInfo
  },
  data() {
    return {
      roleType: String(Vue.roleType),
      loading: false,
      gpuDevices: [],
      gpuProfiles: [],
      selectedGPUProfiles: [],
      checkedColumns: [],
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
      tableData: [],
      sortObj: {
        sortOrder: 'descending',
        sortField: 'created_at'
      },
      selectedBackupId: ''
    };
  },
  methods: {
    async loadGPUDeviceProfiles() {
      const $this = this;
      $this.loading = true;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/cyborg/v2/device_profiles`,
          showErrMsg: true,
          errorKey: 'error_message'
        });
        res.device_profiles.forEach(item => {
          item.selected = false;
        });
        let searchName = '';
        if ($this.searchBar.validatedParams.name) {
          searchName = $this.searchBar.validatedParams.name.toLowerCase();
        }
        let gpuProfiles = res.device_profiles.filter(item => item.name.toLowerCase().includes(searchName));
        gpuProfiles = gpuProfiles.filter(gpuProfile => {
          let includes = false;
          $this.hosts.forEach(host => {
            if (gpuProfile.hosts.includes(host)) {
              includes = true;
            }
          });
          return includes;
        });
        $this.gpuProfiles = gpuProfiles;
        $this.$emit('select', '');
        $this.loading = false;
      } catch (e) {
        $this.loading = false;
        __DEV__ && console.error(e);
      }
    },
    async loadGPUDevices() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/cyborg/v2/devices`,
          showErrMsg: true,
          errorKey: 'error_message'
        });
        res.devices.forEach(item => {
          item.vendor_value = item.vendor_value.toUpperCase();
          item.product_id = item.product_id.toUpperCase();
        });
        $this.gpuDevices = res.devices;
      } catch (e) {
        $this.loading = false;
        __DEV__ && console.error(e);
      }
    },
    async loadData() {
      const $this = this;
      $this.loading = true;
      await $this.loadGPUDevices();
      await $this.loadGPUDeviceProfiles();
      $this.selectedGPUProfiles = [];
      $this.loading = false;
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.loadData();
      this.$refs.pageComponent.setCurrentPage(1);
    },
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    handleGetCurrentData(data) {
      this.tableData = data;
    },
    handleSortChanged(column) {
      this.sortObj = {
        sortOrder: column.order,
        sortField: column.prop
      };
    },
    handleGPUProfileRowClick(row) {
      const name = row.name;
      this.gpuProfiles.forEach(item => {
        if (item.name === name) {
          item.selected = !item.selected;
          if (item.selected) {
            this.selectedGPUProfiles = [item];
            this.$emit('select', name);
          } else {
            this.selectedGPUProfiles = [];
            this.$emit('select', '');
          }
        } else {
          item.selected = false;
        }
      });
    }
  },
  async mounted() {
    const $this = this;
    await $this.loadData();
  },
  filters: {
    createTime(val) {
      const time = moment.utc(val);
      time.local();
      return time.format('YYYY-MM-DD HH:mm:ss');
    }
  },
  watch: {
    hosts(newValue) {
      const $this = this;
      $this.loadGPUDeviceProfiles();
    }
  }
}
</script>

<style>

</style>