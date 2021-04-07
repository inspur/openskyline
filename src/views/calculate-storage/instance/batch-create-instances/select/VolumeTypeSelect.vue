<template>
  <div>
    <el-dialog
      class="select-dialog"
      :title="$t('base.select') + $t('calcStorLang.BATCH_CREATE_INSTANCE_BACKEND_STORAGE_TYPE')"
      :show-close="!saving"
      :before-close="handleClose"
      :visible="visible">
      <div>
        <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" style="margin-bottom: 5px;" />
        <el-table :data="tableData" @row-click="handleRowClick" @sort-change="handleSortChanged" @row-dblclick="save">
          <el-table-column width="35">
            <template slot-scope="scope">
              <el-radio v-model="selectedVolumeTypeId" :label="scope.row.id">&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column v-if="checkedColumns.includes('name')" :label="$t('lang.name')" prop="name" sortable="custom" />
        </el-table>
        
        <el-row type="flex" justify="space-between" align="middle">
          <icos-column-selector @refresh="loadData" @column-checked="handleColumnChecked" :selected-length="selectedVolumeTypeId === '' ? 0 : 1" :columns="[
          {
            prop: 'name',
            label: $t('lang.name'),
            visible: true,
            defaultChecked: true
          }]" />
          <div>
            <page
              ref="pageComponent"
              :totalData="totalData"
              :sortObj="sortObj"
              :pageCount="10"
              @getCurrentData="handleGetCurrentData" />
          </div>
        </el-row>
      </div>
      <span slot="footer">
        <el-button @click="close" :disabled="saving">{{ $t('base.cancel') }}</el-button>
        <el-button type="primary" @click="save" :disabled="selectedVolumeTypeId === ''" :loading="saving">{{ $t('base.confirm') }}</el-button>
      </span>
    </el-dialog>
   </div>
</template>

<script>
import _ from 'underscore';
export default {
  name: 'VolumeTypeSelect',
  props: {
    volumeTypes: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      saving: false,
      visible: true,
      totalData: [],
      tableData: [],
      selectedVolumeTypeId: '',
      checkedColumns: [],
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
      },
      sortObj: {
        sortOrder: 'ascending',
        sortField: 'name'
      }
    }
  },
  methods: {
    show() {
      const $this = this;
      $this.visible = true;
      $this.$nextTick(() => {
        $this.loadData();
      })
    },
    close() {
      this.visible = false;
      this.selectedVolumeTypeId = '';
    },
    handleClose(done) {
      done();
      this.close();
    },
    async save() {
      const $this = this;
      const selectedVolumeType = $this.volumeTypes.find(item => item.id === $this.selectedVolumeTypeId);
      $this.$emit('select', selectedVolumeType);
      $this.close();
    },
    loadData() {
      const $this = this;
      let searchName = '';
      if ($this.searchBar.validatedParams.name) {
        searchName = $this.searchBar.validatedParams.name.toLowerCase();
      }
      $this.totalData = $this.volumeTypes.filter(item => item.name && item.name.toLowerCase().includes(searchName));
      $this.selectedVolumeTypeId = '';
    },
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    handleRowClick(row) {
      this.selectedVolumeTypeId = row.id;
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
    handleSearch(params) {
      const $this = this;
      $this.searchBar.validatedParams = params;
      $this.loadData();
      $this.$refs.pageComponent.setCurrentPage(1);
    }
  }
}
</script>

<style scoped>
.select-dialog >>> .el-dialog {
  width: 800px;
}
</style>
