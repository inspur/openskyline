<template>
  <div>
    <el-table
      ref="specTable"
      :data="tableData"
      v-loading="loading"
      border
      stripe
      row-key="key">
      <el-table-column prop="key" align="left" />
      <el-table-column prop="value" :label="$t('calcStorLang.metadata')" align="left">
        <template slot-scope="scope">
          {{ valueRender(scope.row.value, scope.row) }}
        </template>
      </el-table-column>
      <el-table-column prop="value" align="left">
        <template slot-scope="scope">
          {{ typeRender(scope.row.key, scope.row) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'Metadata',
  props: ["flavorId"],
  data() {
    return {
      tableData:[],
      loading: false
    }
  },
  mounted() {
    var self = this;
    self.getData();
    //alert(this.flavorMaps.get("0bfb9417-13ac-49a9-8a62-1f52b1b22651"));
  },
  methods: {
    async getData() {
      let self = this;
      var url = "api/nova/v2.1/flavors/" + this.flavorId + "/os-extra_specs";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        self.loading = false;
        let resultObject = result['extra_specs'];
        for ( var item in resultObject ) {
          self.tableData.push({
            key: item,
            value: resultObject[item]
          })
        }
      } catch (res) {
        self.loading = false;
      }
    },
    typeRender(value) {
      if (value && value.indexOf("quota") >= 0) {
        return "QoS";
      } else {
        return Vue.t('calcStorLang.metadata');
      }
    },
    valueRender(value, rowData) {
      if (rowData["key"] == 'quota:disk_read_bytes_sec' || rowData["key"] == 'quota:disk_write_bytes_sec' || rowData["key"] == 'quota:disk_total_bytes_sec') {
        return `${(value / 1024)} KBps`;
      }
      if (rowData['key'].startsWith('hw:numa_mem.')) {
        return `${value} (MB)`;
      }
      return value;
    }
  }
}
</script>
