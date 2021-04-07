<template>
  <div>
    <el-table ref="specTable" :data="tableData" v-loading="loading" :element-loading-text="$t('calcStorLang.dataLoading')" highlight-current-row border stripe style="width: 100%;" row-key="key">
      <el-table-column prop="key" align="left" min-width="80">
      </el-table-column>
      <el-table-column prop="value" :label="$t('calcStorLang.metadata')" align="left" min-width="80">
        <template slot-scope="scope">
          <span v-html="valueRender(scope.row.value, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column prop="value" align="left" min-width="80">
        <template slot-scope="scope">
          <span v-html="typeRender(scope.row.key, scope.row)"></span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'Metadata',
  props: ["flavorId", "allloading"],
  data() {
    return {
      tableData: [],
      loading: false
    }
  },
  watch: {
    flavorId: {
      immediate: true,
      handler: function(rows, oldVal) {
        this.getData();
      }
    }
  },
  mounted() {
  },
  methods: {
    async getData() {
      let self = this;
      if (self.flavorId != "") {
        let flavorId = self.flavorId;
        let tableData = [];
        var url = "api/nova/v2.1/flavors/" + flavorId + "/os-extra_specs";
        try {
          let result = await self.$ajax({
            type: 'get',
            url: url
          });
          self.loading = false;
          let resultObject = result['extra_specs'];
          for (var item in resultObject) {
            if (item !== 'capabilities:hypervisor_type') {
              tableData.push({
                key: item,
                value: resultObject[item]
              })
            }
          }
          if (flavorId === self.flavorId) {
            self.tableData = tableData;
          }
          self.$emit("allloading");
        } catch (res) {
          self.$emit("allloading");
          self.loading = false;
        }
      }
    },
    doLayout() {
      this.$nextTick(() => {
        this.$refs.specTable.doLayout();
      });
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
