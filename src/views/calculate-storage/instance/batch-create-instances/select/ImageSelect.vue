<template>
  <div>
    <el-dialog
      class="select-dialog"
      :title="$t('base.select') + $t('calcStorLang.BATCH_CREATE_INSTANCE_IMAGE')"
      :show-close="!saving"
      :before-close="handleClose"
      :visible="visible">
      <div>
        <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" style="margin-bottom: 5px;" />
        <el-table :data="tableData" @row-click="handleRowClick" @sort-change="handleSortChanged" @row-dblclick="save">
          <el-table-column width="35">
            <template slot-scope="scope">
              <el-radio v-model="selectedImageId" :label="scope.row.id">&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column v-if="checkedColumns.includes('name')" :label="$t('lang.name')" prop="name" sortable="costom" />
          <el-table-column v-if="checkedColumns.includes('disk_format')" :label="$t('calcStorLang.imageType')" prop="disk_format" sortable="costom" />
          <el-table-column v-if="checkedColumns.includes('os_distro')" :label="$t('calcStorLang.os')" prop="os_distro" sortable="costom">
            <template slot-scope="scope">
              {{ scope.row.os_distro || '-' }}
            </template>
          </el-table-column>
          <el-table-column v-if="checkedColumns.includes('min_disk')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_DISK')" prop="min_disk" sortable="costom">
            <template slot-scope="scope">
              {{ scope.row.min_disk * 1024 * 1024 * 1024 | fileSize }}
            </template>
          </el-table-column>
          <el-table-column v-if="checkedColumns.includes('min_ram')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_RAM')" prop="min_ram" sortable="costom">
            <template slot-scope="scope">
              {{ scope.row.min_ram * 1024 * 1024 | fileSize }}
            </template>
          </el-table-column>
          <el-table-column v-if="checkedColumns.includes('inspur_virtual_size')" :label="$t('calcStorLang.IMAGE_VIRTUAL_SIZE')" prop="inspur_virtual_size" sortable="costom">
            <template slot-scope="scope">
              <span v-if="scope.row.inspur_virtual_size">
                {{ scope.row.inspur_virtual_size | fileSize }}
              </span>
              <span v-else>
                -
              </span>
            </template>
          </el-table-column>
          <el-table-column v-if="checkedColumns.includes('size')" :label="$t('calcStorLang.size')" prop="size" sortable="costom">
            <template slot-scope="scope">
              {{ scope.row.size | fileSize }}
            </template>
          </el-table-column>
        </el-table>
        
        <el-row type="flex" justify="space-between" align="middle">
          <icos-column-selector @refresh="loadData" @column-checked="handleColumnChecked" :selected-length="selectedImageId === '' ? 0 : 1" :columns="[
          {
            prop: 'name',
            label: $t('lang.name'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'disk_format',
            label: $t('calcStorLang.imageType'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'os_distro',
            label: $t('calcStorLang.os'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'min_disk',
            label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_DISK'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'min_ram',
            label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_RAM'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'inspur_virtual_size',
            label: $t('calcStorLang.IMAGE_VIRTUAL_SIZE'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'size',
            label: $t('calcStorLang.size'),
            visible: true,
            defaultChecked: false
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
        <el-button type="primary" @click="save" :disabled="selectedImageId === ''" :loading="saving">{{ $t('base.confirm') }}</el-button>
      </span>
    </el-dialog>
   </div>
</template>

<script>
import _ from 'underscore';
export default {
  name: 'ImageSelect',
  props: {
    images: {
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
      selectedImageId: '',
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
        sortOrder: 'descending',
        sortField: 'created_at',
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
      this.selectedImageId = '';
    },
    handleClose(done) {
      done();
      this.close();
    },
    async save() {
      const $this = this;
      const selectedImage = $this.images.find(item => item.id === $this.selectedImageId);
      $this.$emit('select', selectedImage);
      $this.close();
    },
    loadData() {
      const $this = this;
      let searchName = '';
      if ($this.searchBar.validatedParams.name) {
        searchName = $this.searchBar.validatedParams.name.toLowerCase();
      }
      $this.totalData = $this.images.filter(item => item.name && item.name.toLowerCase().includes(searchName));
      $this.selectedImageId = '';
    },
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    handleRowClick(row) {
      this.selectedImageId = row.id;
    },
    handleGetCurrentData(data) {
      this.tableData = data;
    },
    handleSortChanged(column) {
      this.sortObj = {
        sortOrder: column.order,
        sortField: column.prop,
        sortType: ['name', 'disk_format', 'os_distro'].includes(column.prop) ? 'string' : 'number'
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
