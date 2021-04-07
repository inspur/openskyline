<template>
  <div>
    <el-collapse v-model="activeNamesQos" style="text-align:left">
      <el-collapse-item :title="$t('network.netConfigQosPloy') + qosName" name="qosProperty">
        <el-col :span="24">
          <div class="table_panel">
            <el-table ref="ruleTable" :data="ruleTableData" highlight-current-row stripe border style="width: 100%" row-key="id" v-loading="loading">
              <el-table-column v-if="columnsChecked.indexOf('type') >= 0" :label="$t('network.type')" prop="type" min-width="100">
                <template slot-scope="scope">
                  <span>Bandwidth</span>
                </template>
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('direction') >= 0" :label="$t('network.direction')" prop="direction" min-width="100">
                <template slot-scope="scope">
                  <span v-if="scope.row.direction==='ingress'">{{$t('network.entrance')}}</span>
                  <span v-if="scope.row.direction==='egress'">{{$t('network.chukou')}}</span>
                </template>
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('max_kbps') >= 0" prop="max_kbps" :label="$t('network.maxkbpx')" min-width="100">
                <template slot-scope="scope">
                  <span v-html="KbToKB(scope.row.max_kbps)"></span>
                </template>
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('max_burst_kbps') >= 0" prop="max_burst_kbps" :label="$t('network.burstkbps')" min-width="100">
                <template slot-scope="scope">
                  <span v-html="KbToKB(scope.row.max_burst_kbps)"></span>
                </template>
              </el-table-column>
            </el-table>

            <el-table :data="dscp" stripe border style="width: 100%;" v-loading="loading">
              <el-table-column :label="$t('network.type')" prop="type" min-width="100">
                <template slot-scope="scope">
                  <span>DSCP</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('network.direction')" prop="direction" min-width="100">
                <template slot-scope="scope">
                  <span>{{$t('network.chukou')}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="dscp_mark" :label="$t('network.dscpmark')" :render-header="dscpmarkRenderHeader" min-width="100">
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script type="text/javascript">
  export default {
    name: "QosDetail",
    props: {
      strategyData :{
        type: Object,
        default: {}
      }
    },
    data() {
      return {
        activeNamesQos: "qosProperty",
        loading: false,
        dialogVisible: false,
        addRuleFlag: false,
        editRuleFlag: false,
        addDisabled: false,
        editRow: "",
        qosName: "",
        columns: [
          {
            prop: "type",
            label: Vue.t("network.type")
          },
          {
            prop: "direction",
            label: Vue.t("network.direction")
          },
          {
            prop: "max_kbps",
            label: Vue.t("network.maxkbpx")
          },
          {
            prop: "max_burst_kbps",
            label: Vue.t("network.burstkbps")
          }
        ],
        columnsChecked: ["direction", "type", "max_kbps", "max_burst_kbps"],
        ruleTableData: [],
        dscp: [],
        totalData: [],
        multipleSelection: []
      };
    },
    mounted() {
      this.getData();
    },
    watch: {
      strategyData: {
        handler: function (rows, oldVal) {
          this.getData();
        },
        deep: true
      }
    },
    methods: {
      getQosName() {
        if (this.strategyData.qos_policy_name) {
          this.qosName = '(' + this.strategyData.qos_policy_name + ')';
        } else {
          this.qosName = "";
        }
      },
      async getData() {
        let self = this;
        this.getQosName();
        try {
          self.loading = true;
          self.totalData = [];
          this.qosName = "";
          if (this.strategyData.qos_policy_id) {
            let result = await self.$ajax({
              type: "GET",
              url:
                "api/neutron/v2.0/qos/policies/" +
                this.strategyData.qos_policy_id,
              errorKey: "NeutronError",
              showErrMsg: false
            });
            this.qosName = result.policy.name || "";
            if (this.qosName) {
              this.qosName = '(' + this.qosName + ')';
            }

            let a = result.policy["rules"] || [];
            self.ruleTableData = a.filter(v => v.type === "bandwidth_limit");
            self.dscp = a.filter(v => v.type === "dscp_marking");
           }
          self.loading = false;
          self.$refs.ruleTable.clearSelection();
        } catch (res) {
          self.loading = false;
        }
      },
      getCurrentData(param) {
        this.ruleTableData = param;
      },
      onRefresh() {
        this.getData();
      },
      KbToKB(value) {
        let KBValue = 0;
        KBValue = parseInt(parseInt(value)/8)
        return KBValue;
      },
      dscpmarkRenderHeader(h, {column, $index}) {
        return h('span', [
          h('span', {
            style:"margin-right:5px;"
          }, column.label),
          h('el-tooltip', {
            effect:"dark",
            placement:"top"}, [
              h('div', {
                slot:"content"
              }, [h('span', {
                  domProps: {
                    innerHTML:Vue.t('network.DSCP_MARKING_TIP')
                  }
                })]),
              h('i', {
                class:"el-icon-fa-question-circle"
              })
            ])
        ]);
      }
    }
  };
</script>


<style scoped>
div >>> .el-table+.el-table{
  margin-top: 30px;
}
</style>