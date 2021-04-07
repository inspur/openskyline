<template>
  <div v-loading="loading" style="margin-top: 15px;">
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" style="margin-bottom: 5px;" />
    <el-table :data="tableData" @row-click="handleRowClick" :empty-text="tableEmptyText" :default-sort="{prop: 'created_at', order: 'descending'}" @sort-change="handleSortChanged">
      <el-table-column width="35">
        <template slot-scope="scope">
          <el-radio v-model="selectedBackupId" :label="scope.row.backup_id">&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column
        v-if="checkedColumns.includes('display_name')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_NAME')" prop="display_name" sortable="custom" />
      <el-table-column
        v-if="checkedColumns.includes('created_at')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_CREATE_TIME')" prop="created_at" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.created_at | createTime }}
        </template>
      </el-table-column>
    </el-table>
    
    <el-row type="flex" justify="space-between" align="middle">
      <icos-column-selector @refresh="loadBackups" @column-checked="handleColumnChecked" :selected-length="selectedBackupId === '' ? 0 : 1" :columns="[{
        prop: 'display_name',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_NAME'),
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
          display_name: {
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
      selectedBackupId: ''
    };
  },
  methods: {
    async loadBackups() {
      const $this = this;
      if ($this.projectId !== '') {
        $this.loading = true;
        try {
          let params = $this.searchBar.validatedParams;
          let queryString = Object.keys(params).map(key => {
            return `${key}=${params[key]}`;
          }).join('&');
          const res = await $this.$ajax({
            type: 'get',
            url: `api/nova/v2.1/${$this.projectId}/os-server-backups?${queryString}`
          });
          $this.loading = false;
          let backups = res.backups.filter(item => {
            return item.status === 'available';
          });
          backups.forEach(backup => {
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
              backup.backupVolumeInfos = backupVolumeInfos;
            } else {
              backup.backupVolumeInfos = [];
            }
          });
          $this.totalData = backups;
          $this.selectedBackupId = '';
          $this.$emit('backup-selected', {id: ''});
        } catch (res) {
          $this.loading = false;
        }
      }
    },
    handleRowClick(row) {
      console.log(row);
      this.selectedBackupId = row.backup_id;
      let minDisk = 0;
      row.backupVolumeInfos.forEach(volume => {
        // 系统盘
        if (volume.path === '/dev/vda') {
          minDisk = volume.size;
        }
      });
      this.$emit('backup-selected', {
        id: row.backup_id,
        name: row.display_name ? row.display_name : row.backup_id,
        osDistro: '',
        minRam: row.backup_meta.flavor.ram,
        minDisk: minDisk,
        format: '',
        size: minDisk,
        vcpus: row.backup_meta.flavor.vcpu,
        ram: row.backup_meta.flavor.ram,
        disk: row.backup_meta.flavor.disk,
        flavorId: row.backup_meta.flavor.id,
        networks: row.backup_meta.networks
      });
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.loadBackups();
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
        sortType: 'string'
      };
    }
  },
  watch: {
    projectId: {
      immediate: true,
      handler(newValue) {
        this.loadBackups();
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