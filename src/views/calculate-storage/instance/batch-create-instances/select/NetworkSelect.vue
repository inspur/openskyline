<template>
  <div>
    <el-dialog
      class="select-dialog"
      :title="$t('base.select') + $t('calcStorLang.BATCH_CREATE_INSTANCE_NETWORK')"
      :show-close="!saving"
      :before-close="handleClose"
      :visible="visible">
      <div>
        <div style="display: flex; flex-direction: row; margin-bottom: 5px;">
          <el-select v-model="selectedNetworkType" class="network-type-select">
            <el-option v-for="item in networkTypes" :key="item" :value="item" :label="item" />
          </el-select>
          <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" />
        </div>
        <el-table :data="tableData" @row-click="handleRowClick" @sort-change="handleSortChanged" @row-dblclick="save">
          <el-table-column width="35">
            <template slot-scope="scope">
              <el-radio v-model="selectedNetworkId" :label="scope.row.id">&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column width="200" v-if="checkedColumns.includes('name')" :label="$t('lang.name')" prop="name" sortable="custom" />
          <el-table-column v-if="checkedColumns.includes('subnet')" :label="$t('calcStorLang.instSubnet')">
            <template slot-scope="scope">
              <div v-for="subnet in scope.row.subnets" :key="subnet.id">
                {{ subnet.name }} ({{ subnet.cidr }})
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <el-row type="flex" justify="space-between" align="middle">
          <icos-column-selector @refresh="loadData" @column-checked="handleColumnChecked" :selected-length="selectedNetworkId === '' ? 0 : 1" :columns="[
          {
            prop: 'name',
            label: $t('lang.name'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'subnet',
            label: $t('calcStorLang.instSubnet'),
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
        <el-button type="primary" @click="save" :disabled="selectedNetworkId === ''" :loading="saving">{{ $t('base.confirm') }}</el-button>
      </span>
    </el-dialog>
   </div>
</template>

<script>
import _ from 'underscore';
export default {
  name: 'NetworkSelect',
  props: {
    networkTypes: {
      type: Array,
      default: () => {
        return [];
      }
    },
    networks: {
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
      selectedNetworkType: 'vlan',
      selectedNetworkId: '',
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
        sortOrder: 'descending',
        sortField: 'created_at'
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
      this.selectedNetworkId = '';
    },
    handleClose(done) {
      done();
      this.close();
    },
    async save() {
      const $this = this;
      const selectedNetwork = $this.networks.find(item => item.id === $this.selectedNetworkId);
      $this.$emit('select', selectedNetwork);
      $this.close();
    },
    loadData() {
      const $this = this;
      let searchName = '';
      if ($this.searchBar.validatedParams.name) {
        searchName = $this.searchBar.validatedParams.name.toLowerCase();
      }
      let totalData = $this.networks.filter(item => item['provider:network_type'] === $this.selectedNetworkType);
      totalData = totalData.filter(item => item.name && item.name.toLowerCase().includes(searchName));
      $this.selectedNetworkId = '';
      $this.totalData = totalData;
    },
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    handleRowClick(row) {
      this.selectedNetworkId = row.id;
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
  },
  watch: {
    selectedNetworkType(newValue) {
      this.loadData();
    }
  }
}
</script>

<style scoped>
.select-dialog >>> .el-dialog {
  width: 800px;
}

.network-type-select {
  height: 32px;
  width: 100px;
  margin-right: 5px;
}

.network-type-select >>> input {
  height: 32px;
}
</style>
