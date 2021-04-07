<template>
  <div>
    <el-table :data="tableData" v-loading="loading">
      <el-table-column v-if="checkedColumns.includes('id')" label="ID" prop="id" width="100" />
      <el-table-column v-if="checkedColumns.includes('name')" :label="$t('calcStorLang.GPU_PRODUCT_NAME')" prop="name" />
      <el-table-column v-if="checkedColumns.includes('hostname')" :label="$t('calcStorLang.GPU_HOST_NAME')" width="200" prop="hostname" />
      <el-table-column v-if="checkedColumns.includes('in_use')" :label="$t('calcStorLang.GPU_IN_USE')" width="100" align="left">
        <template slot-scope="scope">
          {{ scope.row.in_use | inUse }}
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('type')" :label="$t('calcStorLang.GPU_TYPE')" prop="type" />
      <el-table-column v-if="checkedColumns.includes('vendor')" :label="$t('calcStorLang.GPU_VENDOR')" prop="vendor_value" />
      <el-table-column v-if="checkedColumns.includes('product_id')" :label="$t('calcStorLang.GPU_PRODUCT_ID')" prop="product_id" />
    </el-table>
    <el-row style="margin-top: 10px;">
      <el-col :span="5">
        <icos-column-selector
          name="GPUList"
          @refresh="loadData"
          @column-checked="handleColumnChecked"
          :columns="[
        {
          prop: 'id',
          label: 'ID',
          visible: true,
          defaultChecked: true
        }, {
          prop: 'name',
          label: $t('calcStorLang.GPU_PRODUCT_NAME'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'hostname',
          label: $t('calcStorLang.GPU_HOST_NAME'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'in_use',
          label: $t('calcStorLang.GPU_IN_USE'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'type',
          label: $t('calcStorLang.GPU_TYPE'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'vendor',
          label: $t('calcStorLang.GPU_VENDOR'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'product_id',
          label: $t('calcStorLang.GPU_PRODUCT_ID'),
          visible: true,
          defaultChecked: false
        }]" />
      </el-col>
      <el-col :span="19">
        <page :totalData="totalData" @getCurrentData="getCurrentData" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'GPUList',
  data() {
    return {
      loading: false,
      totalData: [],
      tableData: [],
      checkedColumns: []
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/cyborg/v2/devices`,
          showErrMsg: true,
          errorKey: 'error_message'
        });
        res.devices.forEach(item => {
          item.vendor_value = item.vendor_value ? item.vendor_value.toUpperCase() : '';
          item.product_id = item.product_id ? item.product_id.toUpperCase() : '';
        });
        $this.totalData = res.devices;
        $this.loading = false;
      } catch (e) {
        $this.loading = false;
        __DEV__ && console.error(e);
      }
    },
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    getCurrentData(data) {
      this.tableData = data;
    }
  },
  filters: {
    inUse(value) {
      if (value) {
        return Vue.t('calcStorLang.GPU_IN_USE_TRUE');
      } else {
        return Vue.t('calcStorLang.GPU_IN_USE_FALSE');
      }
    }
  }
}
</script>

<style>

</style>