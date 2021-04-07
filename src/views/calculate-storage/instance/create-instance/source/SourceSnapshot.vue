<template>
  <div v-loading="loading" style="margin-top: 15px;">
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" style="margin-bottom: 5px;" />
    <el-table :data="tableData" @row-click="handleRowClick" :empty-text="tableEmptyText" :default-sort="{prop: 'created_at', order: 'descending'}" @sort-change="handleSortChanged">
      <el-table-column width="35">
        <template slot-scope="scope">
          <el-radio v-model="selectedSnapshotId" :label="scope.row.id">&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('name')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_NAME')" prop="name" sortable="custom" />
      <el-table-column v-if="checkedColumns.includes('size')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_SIZE')" prop="size" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.size | fileSize }}
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('os_distro')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_OS')" prop="os_distro" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.os_distro !== '' ? scope.row.os_distro : '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('min_ram')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_RAM')" prop="min_ram" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.min_ram * 1024 * 1024 | fileSize }}
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('min_disk')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_DISK')" prop="min_disk" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.min_disk * 1024 * 1024 * 1024 | fileSize }}
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('created_at')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_CREATE_TIME')" prop="created_at" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.created_at | dateTimeFormatter }}
        </template>
      </el-table-column>
    </el-table>
    
    <el-row type="flex" justify="space-between" align="middle">
      <icos-column-selector @refresh="loadSnapshots" @column-checked="handleColumnChecked" :selected-length="selectedSnapshotId === '' ? 0 : 1" :columns="[{
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
        prop: 'os_distro',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_OS'),
        visible: true,
        defaultChecked: true
      }, {
        prop: 'min_ram',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_RAM'),
        visible: true,
        defaultChecked: true
      }, {
        prop: 'min_disk',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_DISK'),
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
      selectedSnapshotId: ''
    };
  },
  methods: {
    async loadSnapshots() {
      const $this = this;
      if ($this.projectId !== '') {
        $this.loading = true;
        try {
          const res = await $this.$ajax({
            type: 'get',
            url: `api/glance/v2/images?limit=99999&&status=active`
          });
          $this.loading = false;
          let images = res.images;
          let snapshots = images.filter(item => {
            if ('name' in $this.searchBar.validatedParams) {
              return item.name.toLowerCase().includes($this.searchBar.validatedParams.name.toLowerCase());
            }
            if (item.visibility === 'private' && item.owner !== $this.projectId) {
              return false;
            } else {
              if ('block_device_mapping' in item) {
                return true;
              }
              if ('image_type' in item && (item.image_type === 'snapshot' || item.image_type == 'backup')) {
                return true;
              }
            }
            return false;
          });
          snapshots.forEach(item => {
            if (!('os_distro' in item)) {
              item['os_distro'] = '';
            }
          });
          $this.totalData = snapshots;
          $this.selectedSnapshotId = '';
          $this.$emit('snapshot-selected', {id: ''});
        } catch (res) {
          $this.loading = false;
        }
      }
    },
    handleRowClick(row) {
      this.selectedSnapshotId = row.id;
      this.$emit('snapshot-selected', {
        id: row.id,
        name: row.name ? row.name : row.id,
        osDistro: row.os_distro ? row.os_distro : '',
        minRam: row.min_ram ? row.min_ram : 0,
        minDisk: row.min_disk ? row.min_disk : 0,
        format: '',
        size: row.size ? row.size : 0
      });
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.loadSnapshots();
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
        sortType: ['name', 'os_distro'].includes(column.prop) ? 'string' : 'number'
      };
    }
  },
  watch: {
    projectId: {
      immediate: true,
      handler(newValue) {
        this.loadSnapshots();
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