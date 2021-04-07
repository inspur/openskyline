<template>
  <div v-loading="loading" style="margin-top: 15px;">
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" style="margin-bottom: 5px;" />
    <el-table :data="tableData" @row-click="handleRowClick" :empty-text="tableEmptyText" :default-sort="{prop: 'created_at', order: 'descending'}" @sort-change="handleSortChanged">
      <el-table-column width="35">
        <template slot-scope="scope">
          <el-radio v-model="selectedVolumeSnapshotId" :label="scope.row.id">&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('name')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_NAME')" prop="name" sortable="custom" />
      <el-table-column v-if="checkedColumns.includes('size')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_SIZE')" prop="size" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.size * 1024 * 1024 * 1024 | fileSize }}
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('min_ram')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_RAM')" prop="min_ram" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.min_ram * 1024 * 1024 | fileSize }}
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('created_at')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_CREATE_TIME')" prop="created_at" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.created_at | createTime }}
        </template>
      </el-table-column>
    </el-table>
    
    <el-row type="flex" justify="space-between" align="center">
      <icos-column-selector @refresh="loadVolumeSnapshots" @column-checked="handleColumnChecked" :selected-length="selectedVolumeSnapshotId === '' ? 0 : 1" :columns="[{
        prop: 'name',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_NAME'),
        visible: true,
        defaultChecked: true
      }, {
        prop: 'size',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_SIZE'),
        visible: true,
        defaultChecked: true
      }, {
        prop: 'min_ram',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_RAM'),
        visible: true,
        defaultChecked: true
      }, {
        prop: 'created_at',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_CREATE_TIME'),
        visible: true,
        defaultChecked: true
      }]" />
      <div>
        <page
          :totalData="totalData"
          :objStorFlag="true"
          :sortObj="sortObj"
          :pageCount="5"
          @getCurrentData="handleGetCurrentData" />
      </div>
    </el-row>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  props: {
    projectId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      roleType: String(Vue.roleType),
      loading: false,
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
      totalData: [],
      tableData: [],
      sortObj: {
        sortOrder: 'descending',
        sortField: 'created_at',
        sortType: 'string'
      },
      selectedVolumeSnapshotId: ''
    };
  },
  methods: {
    async loadVolumeSnapshots(page=1) {
      const $this = this;
      if ($this.projectId !== '') {
        $this.loading = true;
        try {
          $this.currentPage = page;
          let params = {
            status: 'available'
          };
          let queryString = Object.keys(params).map(key => {
            return `${key}=${params[key]}`;
          }).join('&');
          let url = `api/cinderv3/v3/${$this.$cookie.get('pid')}/snapshots?all_tenants=True&project_id=${$this.projectId}&${queryString}`
          if ($this.roleType === '2' || $this.roleType === '3') {
            url = `api/cinderv3/v3/${$this.$cookie.get('pid')}/snapshots?${queryString}`;
          }
          const res = await $this.$ajax({
            type: 'get',
            url: url
          });
          $this.loading = false;
          let volumeSnapshots = res.snapshots;
          volumeSnapshots.forEach(item => {
            if (!('name' in item) || item.name === '' || item.name === null) {
              item.name = item.id;
            }
            if ('glance_metadata' in item.volume && 'min_ram' in item.volume.glance_metadata) {
              item.min_ram = parseInt(item.volume.glance_metadata.min_ram);
            } else {
              item.min_ram = 0;
            }
          });
          volumeSnapshots = volumeSnapshots.filter(item => {
            if ('name' in $this.searchBar.validatedParams) {
              return item.name.toLowerCase().includes($this.searchBar.validatedParams.name.toLowerCase());
            }
            return item.volume.bootable;
          });
          $this.totalData = volumeSnapshots;
          $this.selectedVolumeSnapshotId = '';
          $this.$emit('volume-snapshot-selected', {id: ''});
        } catch (res) {
          $this.loading = false;
        }
      }
    },
    handleRowClick(row) {
      this.selectedVolumeSnapshotId = row.id;
      let osDistro = '';
      if (row.volume && row.volume.glance_metadata && row.volume.glance_metadata.os_distro) {
        osDistro = row.volume.glance_metadata.os_distro;
      }
      this.$emit('volume-snapshot-selected', {
        id: row.id,
        name: row.name ? row.name : row.id,
        osDistro: osDistro,
        minRam: row.min_ram ? row.min_ram : 0,
        minDisk: 0,
        format: '',
        size: row.size ? row.size : 0
      });
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.loadVolumeSnapshots();
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
        sortField: column.prop,
        sortType: ['name'].includes(column.prop) ? 'string' : 'number'
      };
    }
  },
  watch: {
    projectId: {
      immediate: true,
      handler(newValue) {
        this.loadVolumeSnapshots();
      }
    }
  },
  computed: {
    tableEmptyText() {
      if (this.projectId === '') {
        return this.$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_PROJECT_FIRST');
      } else {
        return this.$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_EMPTY');
      }
    }
  },
  filters: {
    createTime(val) {
      const time = moment.utc(val);
      time.local();
      return time.format('YYYY-MM-DD HH:mm:ss');
    }
  }
}
</script>

<style>

</style>