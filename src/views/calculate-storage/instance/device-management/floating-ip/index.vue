<template>
  <div>
    <div>
      <el-form label-width="120px" label-position="right">
        <el-form-item :label="$t('calcStorLang.DEVICE_MANAGEMENT_FLOATING_IP_MOUNT')">
          <el-button type="primary" icon="fa-plus" size="small" @click="showBindFloatingIPDialog">{{ $t('calcStorLang.DEVICE_MANAGEMENT_FLOATING_IP_BIND') }}</el-button>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.DEVICE_MANAGEMENT_FLOATING_IP_MOUNTED')">
          <el-table :data="tableData">
            <el-table-column prop="ip" align="left" label="IP">
              <template slot-scope="scope">
                <template v-if="scope.row.ip.length > 0">
                  <div v-for="obj in scope.row.ip" :key="obj">
                    <span>{{ obj }}</span>
                  </div>
                </template>
                <template v-else>
                  <div>-</div>
                </template>
              </template>
            </el-table-column>
            <el-table-column prop="fip" align="left" :label="$t('network.floatingIP')">
              <template slot-scope="scope">
                <template v-if="scope.row.fip !== ''">
                  <div>{{ scope.row.fip }}</div>
                </template>
                <template v-else>
                  <div>-</div>
                </template>
              </template>
            </el-table-column>
            <el-table-column :label="$t('base.action')">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="unbindFloatingIP(scope.row.fip)">{{ $t('calcStorLang.DEVICE_MANAGEMENT_FLOATING_IP_UNBIND') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin: 10px 0; position: relative">
            <el-row>
              <el-col :span="5">
                <el-button type="text" icon="fa-refresh" @click="loadData">
                </el-button>
              </el-col>
              <el-col :span="19">
                <page :totalData="totalData" @getCurrentData="handleGetCurrentData"></page>
              </el-col>
            </el-row>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <bind-floating-ip
      v-if="bindFloatingIPDialog.visible"
      :projectId="instance.tenant_id"
      :instUuid="instance.id"
      :instanceName="instance.name"
      :originFlag="'sky'"
      @refresh="loadData"
      @handleFloatIpFlag="bindFloatingIPDialog.visible = false"
    />
  </div>
</template>
<script>
import BindFloatingIP from './BindFloatingIP';
export default {
  name: 'FloatingIPList',
  components: {
    'bind-floating-ip': BindFloatingIP
  },
  props: ['instance'],
  data() {
    return {
      totalData: [],
      tableData: [],
      bindFloatingIPDialog: {
        visible: false
      }
    }
  },
  mounted() {
    const $this = this;
    $this.loadData();
  },
  methods: {
    async loadData() {
      const $this = this;
      const res = await $this.$ajax({
        type: 'get',
        url: `api/nova/v2.1/servers-inspur/${$this.instance.id}`
      });
      const addresses = res.server.addresses;
      const netCards = [];  // 最终的网卡列表，包含fixed IP列和浮动IP列
      // 思路：以network_id和mac为key，分行显示网络信息。
      // 首先遍历floaing_at，确定netCards的规模，然后再根据fixed_ip遍历，进行补充。
      for (let key in addresses) {
        for (let i = 0; i < addresses[key].length; i++) {
          const address = addresses[key][i];
          if (address['OS-EXT-IPS:type'] === 'floating') { // 只有类型为floating的进入显示列表
            netCards.push({
              id: address.network_id,
              ip: [],
              fip: address.addr,
              mac: address['OS-EXT-IPS-MAC:mac_addr']
            });
          }
        }
      }
      for (let key in addresses) {
        for (let i = 0; i < addresses[key].length; i++) {
          const address = addresses[key][i];
          let netCard = netCards.find(item => item.id === address.network_id && item.mac === address['OS-EXT-IPS-MAC:mac_addr']);
          // 相同netCard，不同IP的情况，只增加IP
          if (netCard) {
            if (address['OS-EXT-IPS:type'] === 'fixed') {
              netCard.ip.push(address.addr); // IP单独形成一个array，用于查询
            }
          }
        }
      }
      this.totalData = netCards;
    },
    showBindFloatingIPDialog() {
      this.bindFloatingIPDialog.visible = true;
    },
    handleGetCurrentData(tableData) {
      this.tableData = tableData;
    },
    async unbindFloatingIP(floatingIP) {
      const $this = this;
      $this.$confirm(
        Vue.t('calcStorLang.unBingFloatIpConfirm'),
        Vue.t('network.attention'),
      {
        confirmButtonText: Vue.t('lang.confirm'),
        cancelButtonText: Vue.t('lang.cancel'),
        type: "warning"
      }).then(async () => {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/floatingips?floating_ip_address=${floatingIP}&project_id=${$this.instance.tenant_id}`
        });
        const floatingIPId = res.floatingips[0].id;
        await $this.$ajax({
          type: 'PUT',
          url: `api/neutron/v2.0/floatingips/${floatingIPId}`,
          data: JSON.stringify({
            floatingip: {
              port_id: null
            }
          }),
          log: {
            description: {
              en: `${$this.instance.name} Remove floating IP: ${floatingIP}`,
              zh_cn: `${$this.instance.name} 解除绑定浮动IP:: ${floatingIP}`
            },
            target: Vue.logTarget.computeInstance,
            errorKey: 'NeutronError'
          }
        });
        setTimeout(() => {
          $this.$message.success(Vue.t('calcStorLang.instRecyFloatIpSucess'));
          $this.loadData();
        }, 2000);
      });
    }
  }
}

</script>
<style scoped>


</style>
