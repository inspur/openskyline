<template>
  <div v-loading="loading" style="margin-top: 15px;">
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" style="margin-bottom: 5px;" />
    <el-table :data="tableData" @row-click="handleRowClick" :empty-text="tableEmptyText" :default-sort="{prop: 'created_at', order: 'descending'}" @sort-change="handleSortChanged">
      <el-table-column width="35">
        <template slot-scope="scope">
          <el-radio v-model="selectedVolumeId" :label="scope.row.id">&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('name')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_NAME')" prop="name" sortable="custom" />
      <el-table-column v-if="checkedColumns.includes('size')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_SIZE')" prop="size" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.size * 1024 * 1024 * 1024 | fileSize }}
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('min_ram')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_RAM')" prop="min_ram">
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
      <div>
        <icos-column-selector @refresh="loadVolumes" @column-checked="handleColumnChecked" :selected-length="selectedVolumeId === '' ? 0 : 1" :columns="[{
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
      </div>
      <div>
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="currentPage"
          :page-sizes="[5, 10, 20, 30, 40, 60, 80, 100]"
          :page-size="pageSize"
          :total="total"
          @size-change="handleSizeChanged"
          @current-change="handleCurrentChanged"
        />
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
      currentPage: 1,
      pageSize: 5,
      total: 0,
      tableData: [],
      sortKey: 'created_at',
      sortOrder: 'desc',
      selectedVolumeId: ''
    };
  },
  methods: {
    async loadVolumes(page=1) {
      const $this = this;
      if ($this.projectId !== '') {
        $this.loading = true;
        try {
          $this.currentPage = page;
          let params = {
            limit: $this.pageSize,
            offset: (page - 1) * $this.pageSize,
            with_count: 'True',
            status: 'available',
            bootable: true,
            project_id: $this.projectId,
            sort_key: $this.sortKey,
            sort_dir: $this.sortOrder
          };
          if ($this.roleType === '0') {
            params.all_tenants = 'True';
          }
          Object.assign(params, $this.searchBar.validatedParams);
          let queryString = Object.keys(params).map(key => {
            return `${key}=${params[key]}`;
          }).join('&');
          const res = await $this.$ajax({
            type: 'get',
            url: `api/cinderv3/v3/${$this.$cookie.get('pid')}/volumes/detail?${queryString}`,
            headers: {
              'OpenStack-API-Version': 'volume 3.45'
            }
          });
          $this.loading = false;
          let volumes = res.volumes;
          volumes.forEach(item => {
            if (!('name' in item) || item.name === '' || item.name === null) {
              item.name = item.id;
            }
            if ('volume_image_metadata' in item) {
              item.min_ram = item.volume_image_metadata.min_ram;
            } else {
              item.min_ram = 0;
            }
          });
          $this.total = res.count;
          $this.tableData = volumes;
          $this.selectedVolumeId = '';
          $this.$emit('volume-selected', {id: ''});
        } catch (res) {
          $this.loading = false;
        }
      }
    },
    handleRowClick(row) {
      this.selectedVolumeId = row.id;
      let osDistro = '';
      if (row.glance_metadata && row.glance_metadata.os_distro) {
        osDistro = row.glance_metadata.os_distro;
      }
      this.$emit('volume-selected', {
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
      this.loadVolumes();
    },
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    handleSizeChanged(size) {
      this.pageSize = size;
      this.loadVolumes(1);
    },
    handleCurrentChanged(currentPage) {
      this.currentPage = currentPage;
      this.loadVolumes(currentPage);
    },
    handleSortChanged(column) {
      this.sortOrder = column.order === 'descending' ? 'desc' : 'asc';
      this.sortKey = column.prop;
      this.loadVolumes(1);
    }
  },
  watch: {
    projectId: {
      immediate: true,
      handler(newValue) {
        this.loadVolumes();
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
