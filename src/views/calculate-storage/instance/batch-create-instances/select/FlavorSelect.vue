<template>
  <div>
    <el-dialog
      class="select-dialog"
      :title="$t('base.select') + $t('calcStorLang.BATCH_CREATE_INSTANCE_FLAVOR')"
      :show-close="!saving"
      :before-close="handleClose"
      :visible="visible">
      <div>
        <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" style="margin-bottom: 5px;" />
        <el-table :data="tableData" @row-click="handleRowClick" @sort-change="handleSortChanged" @row-dblclick="save">
          <el-table-column width="35">
            <template slot-scope="scope">
              <el-radio v-model="selectedFlavorId" :label="scope.row.id">&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column v-if="checkedColumns.includes('name')" :label="$t('lang.name')" prop="name" sortable="custom" />
          <el-table-column v-if="checkedColumns.includes('vcpus')" :label="$t('calcStorLang.cpuCore')" prop="vcpus" sortable="custom" />
          <el-table-column v-if="checkedColumns.includes('ram')" :label="$t('calcStorLang.memGB')" prop="ram" sortable="custom">
            <template slot-scope="scope">
              {{ scope.row.ram / 1024 }}
            </template>
          </el-table-column>
          <el-table-column v-if="checkedColumns.includes('disk')" :label="$t('calcStorLang.diskGB')" prop="disk" sortable="custom" />
        </el-table>

        <metadata-detail ref="metadataDetail" :flavorId="selectedFlavorId" style="margin-top: 5px; margin-bottom: 5px;" />
        
        <el-row type="flex" justify="space-between" align="middle">
          <icos-column-selector @refresh="loadData" @column-checked="handleColumnChecked" :selected-length="selectedFlavorId === '' ? 0 : 1" :columns="[
          {
            prop: 'name',
            label: $t('lang.name'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'vcpus',
            label: $t('calcStorLang.cpuCore'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'ram',
            label: $t('calcStorLang.memGB'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'disk',
            label: $t('calcStorLang.diskGB'),
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
        <el-button type="primary" @click="save" :disabled="selectedFlavorId === ''" :loading="saving">{{ $t('base.confirm') }}</el-button>
      </span>
    </el-dialog>
   </div>
</template>

<script>
import _ from 'underscore';
import MetadataDetail from '../../MetadataDetail';
export default {
  name: 'FlavorSelect',
  props: {
    flavors: {
      type: Array,
      default: () => {
        return [];
      }
    },
    minDisk: {
      type: Number,
      default: 0
    },
    minRam: {
      type: Number,
      default: 0
    }
  },
  components: { MetadataDetail },
  data() {
    return {
      saving: false,
      visible: true,
      totalData: [],
      tableData: [],
      selectedFlavorId: '',
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
      sortObj: {
        sortOrder: 'ascending',
        sortField: 'name',
        sortType: 'string'
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
      this.selectedFlavorId = '';
    },
    handleClose(done) {
      done();
      this.close();
    },
    async save() {
      const $this = this;
      const selectedFlavor = $this.flavors.find(item => item.id === $this.selectedFlavorId);
      $this.$emit('select', selectedFlavor);
      $this.close();
    },
    loadData() {
      const $this = this;
      let searchName = '';
      if ($this.searchBar.validatedParams.name) {
        searchName = $this.searchBar.validatedParams.name.toLowerCase();
      }
      let flavors = $this.flavors.filter(item => item.name && item.name.toLowerCase().includes(searchName));
      flavors = flavors.filter(item => item.ram >= $this.minRam);
      flavors = flavors.filter(item => item.disk >= $this.minDisk);
      $this.totalData = flavors;
      $this.selectedFlavorId = '';
    },
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    handleRowClick(row) {
      this.selectedFlavorId = row.id;
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
