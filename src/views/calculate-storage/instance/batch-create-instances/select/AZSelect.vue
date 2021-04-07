<template>
  <div>
    <el-dialog
      class="select-dialog"
      :title="$t('base.select') + $t('calcStorLang.BATCH_CREATE_INSTANCE_AZ')"
      :show-close="!saving"
      :before-close="handleClose"
      :visible="visible">
      <div>
        <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" style="margin-bottom: 5px;" />
        <el-table :data="tableData" @row-click="handleRowClick" @sort-change="handleSortChanged" @row-dblclick="save">
          <el-table-column width="35">
            <template slot-scope="scope">
              <el-radio v-model="selectedZoneName" :label="scope.row.zoneName">&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column v-if="checkedColumns.includes('zoneName')" :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_AZ')" prop="zoneName" sortable="custom" />
        </el-table>
        
        <el-row type="flex" justify="space-between" align="middle">
          <icos-column-selector @refresh="loadData" @column-checked="handleColumnChecked" :selected-length="selectedZoneName === '' ? 0 : 1" :columns="[
          {
            prop: 'zoneName',
            label: $t('calcStorLang.BATCH_CREATE_INSTANCE_AZ'),
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
        <el-button type="primary" @click="save" :disabled="selectedZoneName === ''" :loading="saving">{{ $t('base.confirm') }}</el-button>
      </span>
    </el-dialog>
   </div>
</template>

<script>
import _ from 'underscore';
export default {
  name: 'AZSelect',
  props: {
    zoneList: {
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
      selectedZoneName: '',
      checkedColumns: [],
      searchBar: {
        conditions: {
          zoneName: {
            label: this.$t('calcStorLang.BATCH_CREATE_INSTANCE_AZ'),
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
      sortObj: {
        sortOrder: 'ascending',
        sortField: 'zoneName'
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
      this.selectedZoneName = '';
    },
    handleClose(done) {
      done();
      this.close();
    },
    async save() {
      const $this = this;
      const selectedZone = $this.zoneList.find(item => item.zoneName === $this.selectedZoneName);
      $this.$emit('select', selectedZone);
      $this.close();
    },
    loadData() {
      const $this = this;
      let searchName = '';
      if ($this.searchBar.validatedParams.zoneName) {
        searchName = $this.searchBar.validatedParams.zoneName.toLowerCase();
      }
      $this.totalData = $this.zoneList.filter(item => item.zoneName && item.zoneName.toLowerCase().includes(searchName));
      $this.selectedZoneName = '';
    },
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    handleRowClick(row) {
      this.selectedZoneName = row.zoneName;
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
