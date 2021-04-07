<template>
  <div>
  <el-table :data="tableData" highlight-current-row border stripe style="width: 100%;" row-key="id">
    <el-table-column prop="type" :label="$t('network.type')" align="left" min-width="50"></el-table-column>
    <el-table-column prop="direction" :label="$t('network.direction')" align="left" min-width="50"></el-table-column>
    <el-table-column prop="max_kbps" :label="$t('network.maxkbpx')" align="left" min-width="50">
      <template slot-scope="scope">
        <span v-html="KbToKB(scope.row.max_kbps)"></span>
      </template>
    </el-table-column>
    <el-table-column prop="max_burst_kbps" :label="$t('network.burstkbps')" align="left" min-width="50">
      <template slot-scope="scope">
        <span v-html="KbToKB(scope.row.max_burst_kbps)"></span>
      </template>
    </el-table-column>
  </el-table>

  <el-table :data="dscp" stripe border style="width: 100%;">
    <el-table-column :label="$t('network.type')" prop="type" min-width="100" align="left">
      <template slot-scope="scope">
        <span>DSCP</span>
      </template>
    </el-table-column>
    <el-table-column :label="$t('network.direction')" prop="direction" min-width="100" align="left">
      <template slot-scope="scope">
        <span>{{$t('network.chukou')}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="dscp_mark" :label="$t('network.dscpmark')" min-width="100" align="left">
    </el-table-column>
  </el-table>
  </div>
</template>
<script>
export default {
  props: ['id'],
  data() {
    return {
      dscp: [],
      tableData: []
    }
  },
  mounted() {
    this.loadRegularDetail();
  },
  methods: {
    async loadRegularDetail() {
      var self = this;
      var url = 'api/neutron/v2.0/qos/policies/' + self.id + "/bandwidth_limit_rules";
      url = 'api/neutron/v2.0/qos/policies/' + self.id;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        var list = [];
        var regularList = result['bandwidth_limit_rules'];
        if (regularList == null || regularList.length == 0) {
          self.tableData = [];
        } else {
          for (var i = 0; i < result['bandwidth_limit_rules'].length; i++) {
            var rData = result['bandwidth_limit_rules'][i];
            if (rData != null) {
              rData.type = "Bandwidth";
              if (rData.direction == "egress") {
                rData.direction = Vue.t('network.chukou');
              } else {
                rData.direction = Vue.t('network.entrance');
              }
              list.push(rData);
              self.tableData = list;
            } else {
              self.tableData = [];
            }
          }
        }
        let a = result.policy["rules"] || [];
        self.tableData = a.filter(v => v.type === "bandwidth_limit");
        self.tableData.forEach(v => {
          v.type = "Bandwidth";
          if (v.direction == "egress") {
            v.direction = Vue.t('network.chukou');
          } else {
            v.direction = Vue.t('network.entrance');
          }
        })
        self.dscp = a.filter(v => v.type === "dscp_marking");
      } catch (res) {
      }
    },
    KbToKB(value) {
      let KBValue = 0;
      KBValue = parseInt(parseInt(value)/8)
      return KBValue;
    }
  }
}

</script>
