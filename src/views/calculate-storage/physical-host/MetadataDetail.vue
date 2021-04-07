<template>
  <div>
    <el-table ref="specTable" :data="tableData" v-loading="loading" element-loading-text="数据加载中" highlight-current-row border stripe style="width: 100%;" row-key="key">
      <el-table-column prop="key" align="left" label="键" min-width="80">
      </el-table-column>
      <el-table-column prop="value" label="值" align="left" min-width="80">
      </el-table-column>
      <!-- <el-table-column prop="value" align="left" min-width="50">
        <template slot-scope="scope">
          <span v-html="typeRender(scope.row.key, scope.row)"></span>
        </template>
      </el-table-column> -->
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'Metadata',
  props: ["flavorId"],
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
      if (this.flavorId != "") {
        let self = this;
        self.tableData = [];
        var url = "api/nova/v2.1/flavors/" + this.flavorId + "/os-extra_specs";
        try {
          let result = await self.$ajax({
            type: 'get',
            url: url
          });
          self.loading = false;
          let resultObject = result['extra_specs'];
          for (var item in resultObject) {
            self.tableData.push({
              key: item,
              value: resultObject[item]
            })
          }
        } catch (res) {
          self.loading = false;
        }
      }
    },
    typeRender(value) {
      if (value && value.indexOf("quota") >= 0) {
        return "QoS";
      } else {
        return "元数据";
      }
    }
  }
}

</script>
