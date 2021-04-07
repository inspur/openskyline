<template>
  <div>
    <el-collapse v-model="activeNamesSafe" style="text-align:left">
      <el-collapse-item :title="$t('network.securityTeam') + safeName" name="safeProperty">
        <el-col :span="24">
          <div class="table_panel">
            <el-table
              ref="ruleTable"
              :data="ruleTableData"
              highlight-current-row
              stripe
              border
              style="width: 100%"
              row-key="id"
              v-loading="loading"
            >
              <el-table-column
                v-if="columnsChecked.indexOf('direction') >= 0"
                :label="$t('network.direction')"
                prop="direction"
                min-width="100">
                <template slot-scope="scope">
                  <span v-html="directionRender(scope.row.direction)"></span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="columnsChecked.indexOf('ethertype') >= 0"
                prop="ethertype"
                :label="$t('network.ethertype')"
                min-width="100">
              </el-table-column>
              <el-table-column
                v-if="columnsChecked.indexOf('protocol') >= 0"
                prop="protocol"
                :label="$t('network.ipprotocol')"
                min-width="100">
                <template slot-scope="scope">
                  <span v-html="protocolRender(scope.row.protocol)"></span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="columnsChecked.indexOf('port_range_min') >= 0"
                prop="port_range_min"
                :label="$t('network.portRange')"
                min-width="100">
                <template slot-scope="scope">
                  <span v-html="portrangeRender(scope.row)"></span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="columnsChecked.indexOf('remote_ip_prefix') >= 0"
                prop="remote_ip_prefix"
                :label="$t('network.removeipprefix')"
                min-width="80">
                <template slot-scope="scope">
                  <span v-html="getRemoveipprefix(scope.row)"></span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="columnsChecked.indexOf('security_group_id') >= 0"
                prop="security_group_id"
                :label="$t('network.securityGroup')"
                min-width="100">
                <template slot-scope="scope">
                  <span v-html="getSecurityGroupName(scope.row)"></span>
                </template>
              </el-table-column>
            </el-table>
            <div style="margin: 10px 0; position: relative">
              <el-row>
                <el-col :span="5">
                  <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
                  <!--<span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>-->
                  <el-popover
                    placement="right"
                    trigger="click">
                    <el-checkbox-group class="vertical"
                                       v-model="columnsChecked">
                      <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                      </el-checkbox>
                    </el-checkbox-group>
                    <div slot="reference" class="name-wrapper">
                      <el-tag>{{$t('network.columnSelected')}}</el-tag>
                    </div>
                  </el-popover>
                </el-col>
                <el-col :span="19">
                  <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-col>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script type="text/javascript">
  export default {
    name: "SafeDetail",
    props: {
      safeId: {
        type: String,
        default: ""
      },
      strategyData :{
        type: Object,
        default: {}
      }
    },
    components: {
    },
    data() {
      return {
        safeName: "",
        activeNamesSafe: "safeProperty",
        loading: false,
        dialogVisible: false,
        addFlag: false,
        columns: [{prop: "direction", label: Vue.t('network.direction')},
          {prop: "ethertype", label: Vue.t('network.ethertype')},
          {prop: "protocol", label: Vue.t('network.ipprotocol')},
          {prop: "port_range_min", label: Vue.t('network.portRange')},
          {prop: "remote_ip_prefix", label: Vue.t('network.removeipprefix')},
          {prop: "security_group_id", label: Vue.t('network.securityGroup')}
        ],
        editId: "",
        editprojectId: "",
        columnsChecked: ['direction', 'ethertype', 'protocol', 'port_range_min', 'remote_ip_prefix', 'security_group_id'],
        ruleTableData: [],
        totalData: [],
        multipleSelection: [],
        securityGroupList: []
      }
    },
    mounted() {
       this.getTableData();
    },
    watch: {
      strategyData: {
        handler: function (rows, oldVal) {
          this.getTableData();
        },
        deep: true
      }
    },
    methods: {
      getTableData() {
        const self = this;
        self.getData();
      },
      async getData() {
        let self = this;
        try {
          self.loading = true;
          self.totalData = [];
          this.safeName = "";
          if (this.safeId) {
            await self.getSecurityGroups();
            let result = await self.$ajax({
              type: "GET",
              url: "api/neutron/v2.0/security-groups/" + this.safeId,
              errorKey: "NeutronError"
            });
            self.totalData = result.security_group["security_group_rules"];
            this.safeName = result.security_group.name || "";
            if (this.safeName) {
              this.safeName = "(" + this.safeName + ")";
            }
          }
          self.$refs.ruleTable.clearSelection();
          self.loading = false;
        } catch (res) {
          self.loading = false;
        }
      },
      getCurrentData(param) {
        this.ruleTableData = param;
      },
      async getSecurityGroups() {
        let self = this;
        try {
          let result = await self.$ajax({
            type: "GET",
            url: "api/neutron/v2.0/security-groups",
            errorKey: "NeutronError"
          });
          self.securityGroupList = result["security_groups"];
        } catch (res) {
        }
      },
      getSecurityGroupName(row) {
        var self = this;
        let groupId = row["remote_group_id"];
        let proList = self.securityGroupList;
        let name = groupId;
        for (let i=0; i<proList.length; i++) {
          if (groupId === proList[i].id) {
            name = proList[i].name;
            break;
          }
        }
        return name;
      },
      getRemoveipprefix(row) {
        let self = this;
        let remotegroupid = row["remote_group_id"];
        let remoteipprefix = row["remote_ip_prefix"];
        if (remotegroupid == null && remoteipprefix == null) {
          if (row["ethertype"] == "IPv4") {
            return "0.0.0.0/0";
          } else {
            return "::/0";
          }
        } else {
          return row["remote_ip_prefix"];
        }
      },
      handleClose(done) {
        this.$emit("handleManageRuleShow", {});
        done();
      },
      handleAddShow() {
        this.addFlag = false;
        this.getData();
      },
      cancel() {
        this.$emit("handleManageRuleShow", {});
      },
      onRefresh() {
        var self = this;
        self.getData();
      },
      handleSelectionChange(val) {
        // val.forEach((row, index) => {
        //   if (index === val.length - 1) return;
        //   this.$refs.ruleTable.toggleRowSelection(row, false);
        // });
        this.multipleSelection = val;
      },
      rowClick(row) {
        this.$refs.ruleTable.toggleRowSelection(row);
      },
      portrangeRender(row) {
        let range = "";
        if (row.protocol == "icmp") { //icmp单独处理 ICOS-R bug399
          //如果port_range_max和port_range_min都是null，显示“任何”。
          if (row["port_range_min"] === null && row["port_range_max"] === null) {
            return Vue.t('network.anythings');
          }
          //如果二者有一个为null，另一个为数字，比如port_range_min=55,port_range_max=null, 则显示：类型：55，编码：任何
          if (row["port_range_min"] === null && row["port_range_max"] !== null) {
            return Vue.t('network.type') + ":" + Vue.t('network.anythings') + "," + Vue.t('network.coding') + ":" + row["port_range_max"];
          }
          if (row["port_range_min"] !== null && row["port_range_max"] === null) {
            return Vue.t('network.type') + ":" + row["port_range_min"] + "," + Vue.t('network.coding') + ":" + Vue.t('network.anythings');
          }
          //如果二者都为数字，比如port_range_min=55,port_range_max=47, 则显示：类型：55，编码：47
          if (row["port_range_min"] !== null && row["port_range_max"] !== null) {
            return Vue.t('network.type') + ":" + row["port_range_min"] + "," + Vue.t('network.coding') + ":" + row["port_range_max"];
          }
        }
        if (row["port_range_min"] === "" || row["port_range_min"] === null) {
          return Vue.t('network.anythings');
        }
        if (row["port_range_min"] === row["port_range_max"]) {
          range = row["port_range_min"];
        } else {
          if (row["port_range_max"] === null) {
            range = row["port_range_min"] + " - " + 'None';
          } else {
            range = row["port_range_min"] + " - " + row["port_range_max"];
          }
        }
        if (row["port_range_min"] == "53") {
          range = "53(DNS)";
        } else if (row["port_range_min"] == "80") {
          range = "80(HTTP)";
        } else if (row["port_range_min"] == "443") {
          range = "443(HTTPS)";
        } else if (row["port_range_min"] == "143") {
          range = "143(IMAP)";
        } else if (row["port_range_min"] == "993") {
          range = "993(IMAPS)";
        } else if (row["port_range_min"] == "389") {
          range = "389(LDAP)";
        } else if (row["port_range_min"] == "1433") {
          range = "1433(MS SQL)";
        } else if (row["port_range_min"] == "3306") {
          range = "3306(MYSQL)";
        } else if (row["port_range_min"] == "110") {
          range = "110(POP3)";
        } else if (row["port_range_min"] == "995") {
          range = "995(POP3S)";
        } else if (row["port_range_min"] == "3389") {
          range = "3389(RDP)";
        } else if (row["port_range_min"] == "25") {
          range = "25(SMTP)";
        } else if (row["port_range_min"] == "465") {
          range = "465(SMTPS)";
        } else if (row["port_range_min"] == "22") {
          range = "22(SSH)";
        }
        return range;
      },
      directionRender(value) {
        if (value==="ingress") {
          return Vue.t('network.entrance');
        } else {
          return Vue.t('network.chukou');
        }
      },
      protocolRender(value) {
        if (value === null) {
          return Vue.t('network.anythings');
        } else {
          return value;
        }
      }
    }
  }
</script>
