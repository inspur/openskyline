<template>
 <div>
 {{$t('calcStorLang.metadata')}}：
  <el-table
    ref="specTable"
    :data="tableData"
    v-loading="loading"
    :element-loading-text="$t('calcStorLang.dataLoading')"
    highlight-current-row
    border
    stripe
    style="width: 100%;"
    slot="empty"
    max-height='500'
    row-key="key">
    <el-table-column
      prop="key"
      :label="$t('calcStorLang.key')"
      align="left"
      min-width="200">
    </el-table-column>
    <el-table-column
      prop="value"
      :label="$t('calcStorLang.value')"
      align="left"
      min-width="200">
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
      }
  }
}
</script> 