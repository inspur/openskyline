<template>
  <div>
    <el-dialog
      class="batch-add-host-dialog"
      :title="$t('calcStorLang.HOST_HA_SEGMENT_ADD_HOST')"
      :show-close="!saving"
      :before-close="handleClose"
      :visible="visible">
      <div v-loading="loading">
        <el-form inline style="margin-bottom: 5px;">
          <el-form-item>
            <el-button icon="fa-plus" size="small" type="primary" @click="addOne('')">{{ $t('calcStorLang.HOST_HA_SEGMENT_ADD_HOST_ADD') }}</el-button>
            <el-button icon="fa-bars" size="small" type="primary" @click="addAll()">{{ $t('calcStorLang.HOST_HA_SEGMENT_ADD_HOST_ONE_KEY_ADD') }}</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="hosts" height="300" border>
          <el-table-column :label="$t('calcStorLang.HOST_HA_SEGMENT_ADD_HOST_ROW_NUM')" align="left" width="50px">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.hostName')" width="200px">
            <template slot-scope="scope">
              <el-select v-model="scope.row.name">
                <el-option v-for="(item, index) in getAvailableHosts(scope.row.name)" :key="index" :label="item.hypervisor_hostname" :value="item.hypervisor_hostname" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :render-header="renderReservedTooltipHeader" :label="$t('calcStorLang.reserved')" width="200px">
            <template slot-scope="scope">
              <el-select v-model="scope.row.reserved">
                <el-option :value="true" :label="$t('lang.yes')" />
                <el-option :value="false" :label="$t('lang.no')" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :render-header="renderHASwitchTooltipHeader" :label="$t('calcStorLang.haSwitch')" width="200px">
            <template slot-scope="scope">
              <el-select v-model="scope.row.on_maintenance">
                <el-option :value="false" :label="$t('lang.yes')" />
                <el-option :value="true" :label="$t('lang.no')" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.HOST_HA_SEGMENT_ADD_HOST_ACTION')" align="left">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="deleteOneByIndex(scope.$index)">{{ $t('calcStorLang.HOST_HA_SEGMENT_ADD_HOST_DELETE') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div>
          <ol v-if="!$archIs('x86')" style="list-style: decimal; padding-left: 15px;">
            <li>{{ $t('calcStorLang.HOST_HA_SEGMENT_ENOUGH_RESOURCE') }}</li>
            <li>{{ $t('calcStorLang.HOST_HA_SEGMENT_15_MAX') }}</li>
          </ol>
        </div>
      </div>
      <span slot="footer">
        <el-button @click="close" :disabled="saving">{{ $t('calcStorLang.HOST_HA_SEGMENT_ADD_HOST_CLOSE') }}</el-button>
        <el-button type="primary" @click="checkAndSubmit" :disabled="loading || hosts.length === 0" :loading="saving">{{ $t('calcStorLang.HOST_HA_SEGMENT_ADD_HOST_SUBMIT') }}</el-button>
      </span>
    </el-dialog>
   </div>
</template>

<script>
import _ from 'underscore';
export default {
  name: 'BatchAddHosts',
  props: {
    segmentId: {
      type: String,
      default: ''
    },
    azName: {
      type: String,
      default: ''
    },
    addedHostNames: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      saving: false,
      loading: true,
      visible: false,
      hosts: [],
      filteredHosts: [],
      az: {
        zoneName: '',
        hosts: {}
      }
    }
  },
  methods: {
    renderRequiredHeader(h, { column, $index }) {
      return h('div', [
        h('span', column.label),
        h('span', {
          style: {
            color: 'red',
            fontSize: '14px'
          },
          domProps: {
            innerHTML: ' *'
          }
        })
      ]);
    },
    renderReservedTooltipHeader(h, { column, $index }) {
      return h('div', [
        h('span', column.label + ' '),
        h('el-tooltip', {
          attrs: {
            placement: 'top',
            trigger: 'hover',
            content: Vue.t('calcStorLang.editHostTip1')
          }
        }, [
          h('i', {
            class: {
              'el-icon-fa-question-circle': true
            }
          })
        ])
      ]);
    },
    renderHASwitchTooltipHeader(h, { column, $index }) {
      return h('div', [
        h('span', column.label + ' '),
        h('el-tooltip', {
          attrs: {
            placement: 'top',
            trigger: 'hover',
            content: Vue.t('calcStorLang.editHostTip2')
          }
        }, [
          h('i', {
            class: {
              'el-icon-fa-question-circle': true
            }
          })
        ])
      ]);
    },
    close() {
      this.$emit('close');
    },
    handleClose(done) {
      done();
      this.close();
    },
    addOne(name='') {
      this.hosts.push({
        name: name,
        type: 'COMPUTE',
        control_attributes: 'SSH',
        reserved: false,
        on_maintenance: false
      });
    },
    addAll() {
      if (this.hosts.length === 1 && this.hosts[0].name === '') {
        this.hosts = [];
      }
      this.getAvailableHosts('').forEach(item => {
        this.addOne(item.hypervisor_hostname);
      });
    },
    deleteOneByIndex(index) {
      this.hosts.splice(index, 1);
    },
    async init() {
      const $this = this;
      $this.loading = true;
      await $this.loadAZ();
      await $this.loadHosts();
      $this.loading = false;
    },
    async loadAZ() {
      const $this = this;
      try {
        let res = await $this.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-availability-zone/detail'
        });
        const azList = res.availabilityZoneInfo
          .filter(item => item.zoneName === $this.azName);
        if (azList.length > 0) {
          $this.az = azList[0];
          $this.visible = true;
        } else {
          $this.$message.error($this.$t('calcStorLang.HOST_HA_SEGMENT_ADD_HOST_NO_AZ', $this.azName));
          $this.$emit('close');
        }
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadHosts() {
      let $this = this;
      try {
        let res = await $this.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-hypervisors/detail'
        });
        let hosts = res.hypervisors;
        hosts = hosts.filter(item => Object.keys($this.az.hosts).includes(item.hypervisor_hostname));
        hosts = hosts.filter(item => !$this.addedHostNames.includes(item.hypervisor_hostname));
        hosts = hosts.filter(item => item.hypervisor_type === 'QEMU');
        hosts = hosts.filter(item => item.hypervisor_type !== 'ironic' && item.state !== 'down');
        hosts = _.sortBy(hosts, 'hypervisor_hostname');
        $this.filteredHosts = hosts;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    getAvailableHosts(includeHostname) {
      const $this = this;
      let hosts = [];
      $this.filteredHosts.forEach(item => {
        if (item.hypervisor_hostname === includeHostname) {
          hosts.push(item);
        } else if (!$this.hosts.map(host => host.name).includes(item.hypervisor_hostname)) {
          hosts.push(item);
        }
      });
      return hosts;
    },
    async checkBMC(hostname) {
      const $this = this;
      const res = await this.$ajax({
        type: 'get',
        url: `api/nova/v2.1/os-hypervisor-ipmis/${hostname}`
      });
      const bmc = res.ipmi_detail;
      if (bmc.ipmi_ip === null || bmc.ipmi_ip === '' || bmc.ipmi_passwd === null || bmc.ipmi_passwd === '' || bmc.ipmi_user === null || bmc.ipmi_user === '') {
        throw new Error($this.$t('calcStorLang.HOST_HA_SEGMENT_ADD_HOST_NO_BMC', hostname));
      }
      return true;
    },
    async checkAndSubmit() {
      const $this = this;
      $this.saving = true;
      try {
        for (let i = 0; i < $this.hosts.length; i++) {
          const host = $this.hosts[i];
          if (host.name === null || host.name === undefined || host.name === '') {
            throw new Error($this.$t('calcStorLang.HOST_HA_SEGMENT_ADD_HOST_PLEASE_CHOOSE_HOST', i+1));
          }
          await $this.checkBMC(host.name);
        }
        if (!$this.$archIs('x86')) {
          if ($this.hosts.length + $this.addedHostNames.length > 15) {
            throw new Error($this.$t('calcStorLang.HOST_HA_SEGMENT_15_MAX'));
          }
        }
        await $this.submit();
      } catch (e) {
        $this.saving = false;
        $this.$message.error(e.message);
      }
    },
    async submit() {
      const $this = this;
      let hasError = false;
      for (let i = 0; i < $this.hosts.length; i++) {
        let host = $this.hosts[i];
        try {
          await $this.$ajax({
            type: 'post',
            url: `api/masakari/v1/segments/${this.segmentId}/hosts`,
            data: JSON.stringify({
              host: host
            }),
            errorKey: 'badRequest',
            showErrMsg: false,
            log: {
              target: Vue.logTarget.hostHa,
              level: {
                en: 'info',
                zh_cn: '信息'
              },
              description: {
                en: `HA Segment Add Host: ${host.name}`,
                zh_cn: `高可用集群添加主机: ${host.name}`
              }
            }
          });
        } catch (e) {
          hasError = true;
          $this.$message.error(e.message);
        }
      }
      if (!hasError) {
        $this.$message.success($this.$t('calcStorLang.addHostSuccessTip'));
      }
      $this.$emit('close');
      $this.$emit('refresh');
    }
  },
  async mounted() {
    const $this = this;
    await $this.init();
    $this.addOne();
  }
}
</script>

<style scoped>
.batch-add-host-dialog >>> .el-dialog {
  width: 800px;
}
</style>
