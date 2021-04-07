<template>
  <div>
    <el-dialog
      class="batch-bmc-set-dialog"
      :title="$t('calcStorLang.BATCH_BMC_SET')"
      :show-close="!saving"
      :before-close="handleClose"
      :visible="visible">
      <div v-loading="loading">
        <el-table :data="currentHosts" height="300" border>
          <el-table-column :label="$t('calcStorLang.HOST_HA_SEGMENT_ADD_HOST_ROW_NUM')" align="left" width="55px">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.hostName')" prop="hypervisor_hostname" width="150px" />
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.bmcIP')" width="150px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.ipmi_ip" />
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.bmcUserName')" width="150px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.ipmi_user" />
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.bmcPassword')" width="150px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.ipmi_passwd" type="password" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.BATCH_BMC_SET_ACTION')" width="80px" fixed="right" align="left">
            <template slot-scope="scope">
              <el-button v-if="!saving" type="danger" size="small" @click="deleteOneByIndex(scope.$index)">{{ $t('lang.delete') }}</el-button>
              <i class="el-icon-loading" v-if="scope.row.status === 1" />
              <i class="el-icon-fa-check" v-if="scope.row.status === 2" />
              <i class="el-icon-fa-times" v-if="scope.row.status === 3" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer">
        <el-button @click="close" :disabled="saving">{{ $t('calcStorLang.HOST_HA_SEGMENT_ADD_HOST_CLOSE') }}</el-button>
        <el-button type="primary" @click="save" :disabled="loading || currentHosts.length === 0" :loading="saving">{{ $t('calcStorLang.HOST_HA_SEGMENT_ADD_HOST_SUBMIT') }}</el-button>
      </span>
    </el-dialog>
   </div>
</template>

<script>
class FieldInvalidError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = 'FieldInvalidError';
  }
}
import _ from 'underscore';
export default {
  name: 'BatchAddHosts',
  props: {
    hosts: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      saving: false,
      loading: true,
      visible: true,
      currentHosts: []
    }
  },
  methods: {
    deleteOneByIndex(index) {
      this.currentHosts.splice(index, 1);
    },
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
    close() {
      this.$emit('close');
    },
    handleClose(done) {
      done();
      this.close();
    },
    async init() {
      const $this = this;
      $this.loading = true;
      let currentHosts = [];
      for (let i = 0; i < $this.hosts.length; i++) {
        let item = $this.hosts[i];
        let currentHost = {
          hypervisor_hostname: item.hypervisor_hostname,
          ipmi_ip: '',
          ipmi_user: '',
          ipmi_passwd: '',
          status: 0 // 0 等待 1 正在进行 2 成功 3 失败
        };
        try {
          let bmcInfo = await $this.getBMCInfo(item.hypervisor_hostname);
          currentHost.ipmi_ip = bmcInfo.ipmi_ip;
          currentHost.ipmi_user = bmcInfo.ipmi_user;
        } catch (e) {
          __DEV__ && console.error(e);
        }
        currentHosts.push(currentHost);
      }
      $this.currentHosts = currentHosts;
      $this.loading = false;
    },
    async validateOne(host) {
      const $this = this;
      let res = await $this.$ajax({
        type: 'post',
        url: 'api/nova/v2.1/os-hypervisor-ipmis/validate',
        data: JSON.stringify({
          ipmi_infos: [{
            hostname: host.hypervisor_hostname,
            ipmi_ip: host.ipmi_ip,
            ipmi_user: host.ipmi_user,
            ipmi_passwd: host.ipmi_passwd
          }]
        })
      });
      if (res.results[0].result === 'failed') {
        let reason = res.results[0].reason;
        if (reason.startsWith('get ipmi addr failed')) {
          reason = $this.$t('calcStorLang.BATCH_BMC_SET_VALIDATE_IPMI_ADDR_FAILED');
        }
        if (reason.startsWith('BMC IP Address not match')) {
          reason = $this.$t('calcStorLang.BATCH_BMC_SET_VALIDATE_IP_NOT_MATCH');
        }
        if (reason.startsWith('ipmi_user or ipmi_passwd incorrect')) {
          reason = $this.$t('calcStorLang.BATCH_BMC_SET_VALIDATE_USER_PASSWD_WRONG');
        }
        throw new FieldInvalidError(`${$this.$t('calcStorLang.BATCH_BMC_SET_HOST')}${host.hypervisor_hostname}：${reason}`);
      }
      return true;
    },
    async getBMCInfo(hostName) {
      const $this = this;
      let res = await $this.$ajax({
        url: 'api/nova/v2.1/os-hypervisor-ipmis/' + hostName,
        type: 'get'
      });
      return res.ipmi_detail;
    },
    async check() {
      const $this = this;
      for (let i = 1; i <= $this.currentHosts.length; i++) {
        let host = $this.currentHosts[i - 1];
        if (host.hypervisor_hostname === '') {
          throw new FieldInvalidError($this.$t('calcStorLang.BATCH_BMC_SET_VALIDATE_HOST_NAME_EMPTY', i));
        }
        if (host.ipmi_ip === '') {
          throw new FieldInvalidError($this.$t('calcStorLang.BATCH_BMC_SET_VALIDATE_IP_EMPTY', host.hypervisor_hostname));
        }
        if (!/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/.test(host.ipmi_ip)) {
          throw new FieldInvalidError($this.$t('calcStorLang.BATCH_BMC_SET_VALIDATE_IP_FORMAT_WRONG', host.hypervisor_hostname));
        }
        if (host.ipmi_user === '') {
          throw new FieldInvalidError($this.$t('calcStorLang.BATCH_BMC_SET_VALIDATE_USERNAME_EMPTY', host.hypervisor_hostname));
        }
        if (host.ipmi_passwd === '') {
          throw new FieldInvalidError($this.$t('calcStorLang.BATCH_BMC_SET_VALIDATE_PASSWORD_EMPTY', host.hypervisor_hostname));
        }
      }
    },
    async validate() {
      const $this = this;
      for (let i = 1; i <= $this.currentHosts.length; i++) {
        let host = $this.currentHosts[i - 1];
        await $this.validateOne(host);
      }
    },
    async save() {
      const $this = this;
      $this.saving = true;
      try {
        $this.currentHosts.forEach(host => {
          host.status = 1;
        });
        await $this.check();  // 字段校验
        await $this.validate();  // 真实性校验
        await $this.submit(); // 下发请求
      } catch (e) {
        __DEV__ && console.error(e);
        $this.currentHosts.forEach(host => {
          host.status = 0;
        });
        if (e.name === 'FieldInvalidError') {
          $this.$message.error(e.message);
        }
        $this.saving = false;
        return false;
      }
    },
    submitOne(index) {
      const $this = this;
      return new Promise(async (resolve, reject) => {
        let host = $this.currentHosts[index];
        try {
          await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/os-hypervisor-ipmis`,
            data: JSON.stringify({
              hypervisor_ipmi: {
                hostname: host.hypervisor_hostname,
                ipmi_ip: host.ipmi_ip,
                ipmi_user: host.ipmi_user,
                ipmi_passwd: host.ipmi_passwd
              }
            }),
            errorKey: 'badRequest',
            showErrMsg: false,
            log: {
              target: Vue.logTarget.hostmanage,
              level: {
                en: 'info',
                zh_cn: '信息'
              },
              key: 'hypervisor_hostname',
              description: {
                en: `Deploy BMC of ${host.hypervisor_hostname}`,
                zh_cn: `${host.hypervisor_hostname} 配置BMC`
              }
            }
          });
          host.status = 2;
          resolve();
        } catch (e) {
          host.status = 3;
          $this.$message.error(e.message);
          reject();
        }
      });
    },
    async submit() {
      const $this = this;
      let submits = [];
      for (let i = 0; i < $this.currentHosts.length; i++) {
        submits.push($this.submitOne(i));
      }
      Promise.all(submits).then(results => {
        $this.$message.success($this.$t('calcStorLang.successBMC'));
        $this.$emit('close');
        $this.$emit('refresh');
      });
    }
  },
  async mounted() {
    const $this = this;
    await $this.init();
  }
}
</script>

<style scoped>
.batch-bmc-set-dialog >>> .el-dialog {
  width: 800px;
}
</style>
