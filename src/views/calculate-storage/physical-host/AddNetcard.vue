 <template>
  <div>
    <el-dialog
      :title="$t('calcStorLang.netConfigAddCard')"
      :visible.sync="dialogVisible"
      :before-close="close"
    >
      <el-form
        ref="netConfigForm"
        :model="netConfigForm"
        label-width="100px"
        :rules="rules"
        label-position="left"
      >
        <el-form-item :label="$t('calcStorLang.type')" class="is-required">
          <el-radio-group v-model="netConfigForm.type" @change="netTypeChange">
            <el-radio class="radio" label="1">{{$t('calcStorLang.net')}}</el-radio>
            <el-radio class="radio" label="2">{{$t('lang.port')}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div v-loading="loading" v-show="netConfigForm.type === '1'">
        <el-form :inline="true" onsubmit="return false;">
          <el-form-item :label="$t('lang.name')">
            <el-input :placeholder="$t('lang.name')" size="small" v-model="networkParam.name"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="fa-search"
              size="small"
              @click="filterNetworkData"
              native-type="submit"
            >{{$t('lang.query')}}</el-button>
          </el-form-item>
        </el-form>

        <el-table
          :data="pagedNetworkData"
          @selection-change="handleNetworkSelectionChange"
          ref="networkTable"
        >
          <el-table-column reserve-selection type="selection"></el-table-column>
          <el-table-column label="名称" prop="name"></el-table-column>
          <el-table-column label="已连接子网" prop="subnets">
            <template slot-scope="scope">
              <span v-html="renderSubnet(scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column label="IP分配">
            <template slot-scope="scope">
              <div style="margin:5px 0px">
                <el-input
                  :placeholder="$t('calcStorLang.createInstIpTip1')"
                  size="small"
                  v-model="scope.row.ip"
                ></el-input>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="管理状态" prop="admin_state_up">
            <template slot-scope="scope">
              <span v-html="managestatusRender(scope.row.admin_state_up)"></span>
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status">
            <template slot-scope="scope">
              <span v-html="subnetStatusRender(scope.row.shared, scope.row)"></span>
            </template>
          </el-table-column>
        </el-table>

        <el-row style="margin: 10px 0; position: relative">
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="loadNetwork"></el-button>
            <span>{{$t("lang.currentSelected")}} {{ multipleNetworkSelection.length }}{{$tc('lang.item', multipleNetworkSelection.length)}}</span>
            <!-- <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
            </el-popover>-->
          </el-col>

          <el-col :span="19">
            <page
              :totalData="filteredNetworkData"
              @getCurrentData="setPagedNetworkData"
              :pageCount="5"
              :current-page="networkParam.pageNum"
            ></page>
          </el-col>
        </el-row>
      </div>

      <div v-loading="loading" v-show="netConfigForm.type === '2'">
        <el-table
          :data="pagedPortData"
          @selection-change="handlePortSelectionChange"
          ref="portTable"
        >
          <el-table-column reserve-selection type="selection"></el-table-column>
          <el-table-column label="名称" prop="name"></el-table-column>
          <el-table-column label="IP地址">
            <template slot-scope="scope">{{ scope.row.fixed_ips[0].ip_address }}</template>
          </el-table-column>
          <el-table-column label="管理状态" prop="admin_state_up">
            <template slot-scope="scope">
              <span v-html="managestatusRender(scope.row.admin_state_up)"></span>
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status">
            <template slot-scope="scope">
              <span v-html="subnetStatusRender(scope.row.shared, scope.row)"></span>
            </template>
          </el-table-column>
        </el-table>

        <el-row style="margin: 10px 0; position: relative">
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="loadNetPortList"></el-button>
            <span>{{$t("lang.currentSelected")}} {{ multiplePortSelection.length }}{{$tc('lang.item', multiplePortSelection.length)}}</span>
            <!-- <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
            </el-popover>-->
          </el-col>

          <el-col :span="19">
            <page
              :totalData="totalPortData"
              @getCurrentData="setPagedPortData"
              :pageCount="5"
              :current-page="portParam.pageNum"
            ></page>
          </el-col>
        </el-row>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button
          type="primary"
          @click="mountNetcard"
          :disabled="loading"
          :loading="saving"
        >{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "addnetcard",
  props: ["hostEntity"],
  data() {
    return {
      netConfigForm: {
        type: "1",
        ipAddress: ""
      },
      networkParam: {
        name: "",
        pageNum: 1
      },
      portParam: {
        pageNum: 1
      },
      totalNetworkData: [],
      filteredNetworkData: [],
      pagedNetworkData: [], //分页后的网络数据
      multipleNetworkSelection: [],
      totalPortData: [],
      pagedPortData: [],
      multiplePortSelection: [],
      loadingText: Vue.t("calcStorLang.dataLoading"),
      subNetOptions: [],
      cardValue: "",
      portValue: "",
      subNetValue: "",
      netCardMaps: new Map(),
      portCardMaps: new Map(),
      loading: false,
      saving: false,
      dialogVisible: false,
      ipTypeSel: "DHCP",
      rules: {
        ipAddress: [
          { type: "required", trigger: "blur change" },
          { type: "ipv4" }
        ]
      }
    };
  },
  mounted() {
    var $this = this;
    $this.dialogVisible = true;
    $this.loadNetwork();
  },
  methods: {
    async loadNetwork() {
      const $this = this;
      $this.loading = true;
      await $this.loadSubNetList();
      await $this.loadNetworkList();
      $this.filterNetworkData();
      $this.loading = false;
    },
    async loadSubNetList() {
      var $this = this;
      try {
        let result = await $this.$ajax({
          type: "get",
          url: "api/neutron/v2.0/subnets",
          showErrMsg: true
        });
        var subNets = result["subnets"];
        $this.subNetOptions = subNets;
      } catch (res) {}
    },
    async loadNetworkList() {
      const $this = this;
      let data1 = await $this.loadProjectCardList();
      let data2 = await $this.loadSharedNetList();
      let networks = data1.concat(data2);
      networks = networks.filter(network => network.admin_state_up === true && network.status === 'ACTIVE' )
      networks.map(network => {
        network.ip = "";
      });
      $this.totalNetworkData = networks;
    },
    async loadProjectCardList() {
      var $this = this;
      var url = `api/neutron/v2.0/networks?project_id=${$this.hostEntity["tenant_id"]}&shared=false&status=ACTIVE` + '&router:external=false&not-tags=bm_deploy';
      try {
        let result = await $this.$ajax({
          type: "get",
          url: url,
          showErrMsg: true
        });
        return result["networks"];
      } catch (res) {}
    },
    async loadSharedNetList() {
      var $this = this;
      try {
        let result = await $this.$ajax({
          type: "get",
          url: "api/neutron/v2.0/networks?not-tags=bm_deploy", //shared=true
          showErrMsg: true
        });
        var list = result["networks"];
        var sharedList = [];
        for (let n = 0; n < list.length; n++) {
          var obj = list[n];
          if ("true" == obj.shared + "") {
            sharedList.push(obj);
          }
          $this.netCardMaps.set(obj.id, obj.name);
        }
        return sharedList;
      } catch (res) {}
    },
    async loadNetPortList() {
      var $this = this;
      $this.loading = true;
      var url = `api/neutron/v2.0/ports?project_id=${$this.hostEntity["tenant_id"]}&admin_state_up=true&status=DOWN`;
      try {
        let result = await $this.$ajax({
          type: "get",
          url: url,
          showErrMsg: true
        });
        var pList = result["ports"];
        // 过滤掉device_owner为network:reserved的数据 -- 预留地址功能支持
        pList = pList.filter((port) => {
          return port['device_owner'] !== 'network:reserved';
        });
        var portResult = [];
        for (let p = 0; p < pList.length; p++) {
          var entity = pList[p];
          if (entity["fixed_ips"] == "" || entity["fixed_ips"] == null || entity["binding:host_id"] != "") {
            continue;
          }
          portResult.push(entity);
        }
        let networkidArr = [];
        for (let i = 0; i < $this.totalNetworkData.length; i++) {
          networkidArr.push($this.totalNetworkData[i].id);
        }
        let portResultTmp = [];
        for (let v of portResult) {
          let networkId = v.network_id;
          if (networkidArr.includes(networkId)) {
            portResultTmp.push(v);
          }
        }
        $this.totalPortData = portResultTmp;
        $this.$refs.portTable.clearSelection();
        $this.loading = false;
      } catch (res) {
        $this.loading = false;
      }
    },
    filterNetworkData() {
      const $this = this;
      $this.filteredNetworkData = $this.totalNetworkData.filter(network =>
        network.name.includes($this.networkParam.name)
      );
      $this.networkParam.pageNum = 1;
      $this.$refs.networkTable.clearSelection();
    },
    async mountNetcard() {
      var $this = this;
      $this.saving = true;
      var type = $this.netConfigForm.type;
      var body = "";
      var netCardName = "";
      if ("2" == type) {
        let ports = $this.multiplePortSelection;
        if (ports.length === 0) {
          $this.$message.warning(Vue.t("calcStorLang.netConfigChoosePort"));
          return false;
        } else {
          let suc = true;
          for (const port of ports) {
            const data = {
              interfaceAttachment: {
                port_id: port.id
              }
            };
            try {
              await $this.$ajax({
                type: "post",
                url: `api/nova/v2.1/servers/${$this.hostEntity["id"]}/os-interface`,
                data: JSON.stringify(data),
                showErrMsg: true,
                log: {
                  description: {
                    en: `Add Netcard(port:${port.name}):${
                      $this.hostEntity["name"]
                    }`,
                    zh_cn: `网卡配置:添加网卡(端口:${port.name})到云主机:${
                      $this.hostEntity["name"]
                    }`
                  },
                  target: Vue.logTarget.computeInstance
                },
                errFun: function() {
                  suc = false;
                }
              });
            } catch (err) {
              suc = false;
            }
          }
          if (suc) {
            $this.$emit("addhideEdit");
            $this.$emit("onRefresh");
            $this.saving = false;
            $this.$message.success(
              Vue.t("calcStorLang.netConfigAddCardSuccess")
            );
          } else {
            $this.$emit("onRefresh");
            $this.saving = false;
          }
        }
      } else {
        let networks = $this.multipleNetworkSelection;
        if (networks.length === 0) {
          $this.$message.warning(Vue.t("calcStorLang.netConfigChooseNet"));
          return false;
        } else {
          let info = "";
          let datas = [];
          for (const network of networks) {
            if (network.ip !== "") {
              //非DHCP的情况
              try {
                await $this.checkIpValid(network.ip, network.id);
                datas.push({
                  network: network,
                  payload: {
                    interfaceAttachment: {
                      net_id: network.id,
                      fixed_ips: [
                        {
                          ip_address: network.ip
                        }
                      ]
                    }
                  }
                });
              } catch (err) {
                $this.saving = false;
                info += err;
              }
            } else {
              datas.push({
                network: network,
                payload: {
                  interfaceAttachment: {
                    net_id: network.id
                  }
                }
              });
            }
          }

          if (info !== "") {
            $this.$message.warning(info);
            return false;
          } else {
            let suc = true;
            for (const data of datas) {
              try {
                await $this.$ajax({
                  type: "post",
                  url: `api/nova/v2.1/servers/${$this.hostEntity["id"]}/os-interface`,
                  data: JSON.stringify(data.payload),
                  showErrMsg: true,
                  log: {
                    description: {
                      en: `Add Netcard(net:${data.network.name}):${
                        $this.hostEntity["name"]
                      }`,
                      zh_cn: `网卡配置:添加网卡(网络:${
                        data.network.name
                      })到云主机:${$this.hostEntity["name"]}`
                    },
                    target: Vue.logTarget.computeInstance
                  },
                  errFun: function(xhr, status, msg) {}
                });
              } catch (err) {
                suc = false;
              }
            }

            if (suc) {
              $this.$emit("addhideEdit");
              $this.$emit("onRefresh");
              $this.$message.success(
                Vue.t("calcStorLang.netConfigAddCardSuccess")
              );
              $this.saving = false;
            } else {
              $this.$emit("onRefresh");
              $this.saving = false;
            }
          }
        }
      }
    },
    ipIsInSubnetsRange(ip, subnets) {
      let flag = false;
      for (const subnet of subnets) {
        if (subnet.total_ip_details.includes(ip)) {
          flag = true;
          break;
        }
      }
      return flag;
    },
    async checkIPInRange(ip, netId) {
      const $this = this;
      try {
        let result = await $this.$ajax({
          type: 'post',
          url: 'api/neutron/v2.0/inspur/networkextension/validate_ip_in_net',
          data: JSON.stringify({
            ip, netId
          }),
          showErrMsg: true
        });
        return result;
      } catch (res) {
        return false;
      }
    },
    netTypeChange(value) {
      var $this = this;
      $this.netConfigForm.ipAddress = "";
      if ("1" == value) {
        $this.loadNetwork();
      } else {
        $this.loadNetPortList();
      }
    },
    async loadSubmitNetData(body, netCardName) {
      var $this = this;
      body = JSON.stringify(body);
    },
    handleNetworkSelectionChange(val) {
      this.multipleNetworkSelection = val;
    },
    handlePortSelectionChange(val) {
      this.multiplePortSelection = val;
    },
    setPagedNetworkData(data) {
      this.pagedNetworkData = data;
    },
    setPagedPortData(data) {
      this.pagedPortData = data;
    },
    async checkIpValid(ip, networkId) {
      var $this = this;
      let result = await $this.$ajax({
        type: "get",
        url: "api/neutron/v2.0/network-ip-availabilities/" + networkId
      });
      var list = result["network_ip_availability"]["subnet_ip_availability"];
      if (list != null) {
        if (!await $this.checkIPInRange(ip, networkId)) {
          throw new Error(`IP ${ip} 格式不正确或不在子网IP范围。 `);
        } else {
          for (var i = 0; i < list.length; i++) {
            var obj = list[i];
            var usedIps = obj["used_ip_details"];
            if (usedIps.indexOf(ip) >= 0) {
              throw new Error(`IP ${ip} 已被使用。 `);
            }
          }
        }
      }
      return true;
    },
    managestatusRender(value) {
      if (value == true) {
        return "UP";
      } else {
        return "DOWN";
      }
    },
    subnetStatusRender(value, row) {
      if (row["status"] === "ACTIVE") {
        return this.$t("calcStorLang.runningStatus");
      } else if (row["status"] === "DOWN") {
        return this.$t("lang.DOWN");
      } else if (row["status"] === "BUILD") {
        return this.$t("lang.BUILD");
      } else if (row["status"] === "ERROR") {
        return this.$t("lang.ERROR");
      }
    },
    async loadAllPortList() {
      var $this = this;
      var url = "api/neutron/v2.0/ports";
      $this.loading = true;
      try {
        let result = await $this.$ajax({
          type: "get",
          url: url,
          showErrMsg: true
        });
        $this.loading = false;
        var pList = result["ports"];
        // 过滤掉device_owner为network:reserved的数据 -- 预留地址功能支持
        pList = pList.filter((port) => {
          return port['device_owner'] !== 'network:reserved';
        });
        for (let p = 0; p < pList.length; p++) {
          var entity = pList[p];
          var portShow = entity.name || entity.id;
          $this.portCardMaps.set(entity.id, entity);
        }
      } catch (res) {
        $this.loading = false;
      }
    },
    close(done) {
      this.cancel();
      done();
    },
    cancel() {
      this.$emit("addhideEdit", {});
      this.$emit("onRefresh");
    },
    renderSubnet(net) {
      let subnets = this.subNetOptions.filter(
        subnet => subnet.network_id === net.id
      );
      let html = "";
      subnets.forEach((subnet, index) => {
        if (index > 0) {
          html += "\n<br>";
        }
        html += `${subnet.name} (${subnet.cidr})`;
      });
      return html;
    }
  },
  computed: {
    filteredPorts() {
      return this.totalPortData.filter(port => port["binding:host_id"] === "");
    }
  }
};
</script>


