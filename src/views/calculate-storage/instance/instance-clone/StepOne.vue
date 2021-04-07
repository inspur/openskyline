<template>
  <div>
    <el-dialog
      class="clone-dialog"
      :title="$t('calcStorLang.INSTANCE_CLONE')"
      :visible="visible"
      :before-close="handleBeforeClose">
      <div v-loading="loading">
        <el-table :data="formData.clones">
          <el-table-column :label="$t('calcStorLang.INSTANCE_CLONE_SOURCE_ID')" prop="id" width="150" />
          <el-table-column :label="$t('calcStorLang.INSTANCE_CLONE_SOURCE_NAME')" prop="name" width="150" />
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.NG_CREATE_INSTANCE_NAME')" prop="basename" width="200">
            <template slot-scope="scope">
              <el-input v-model="scope.row.basename" />
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.NG_CREATE_INSTANCE_LOGIN_TYPE')" prop="loginType">
            <template slot-scope="scope">
              <el-row type="flex" align="middle">
                <el-radio-group v-model="scope.row.loginType">
                  <el-radio :label="1">{{ $t('calcStorLang.NG_CREATE_INSTANCE_ORIGIN_PASSWORD') }}</el-radio>
                  <el-radio :label="2">{{ $t('calcStorLang.NG_CREATE_INSTANCE_KEYPAIR') }}</el-radio>
                  <el-radio :label="3">{{ $t('calcStorLang.NG_CREATE_INSTANCE_RESET_PASSWORD') }}</el-radio>
                </el-radio-group>
                <el-select v-if="scope.row.loginType === 2" v-model="scope.row.keyPair" filterable style="margin-left: 15px; width: 200px;">
                  <el-option v-for="(item, index) in keyPairs" :key="index" :label="item" :value="item" />
                </el-select>
                <el-input v-if="scope.row.loginType === 3" type="password" style="margin-left: 15px; width: 200px;" v-model="scope.row.password" />
              </el-row>
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.NG_CREATE_INSTANCE_AMOUNT')" prop="name" width="100">
            <template slot-scope="scope">
              <el-input v-model="scope.row.count" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">{{ $t('lang.close') }}</el-button>
        <el-button type="primary" @click="submit" :loading="saving">{{ $t('lang.confirm') }}</el-button>
      </div>
    </el-dialog>
    <quota-check
      v-if="quotaCheckDialog.visible"
      @close="handleQuotaCheckDialogClose"
      @success="afterCheck"
      @error="saving = false; quotaCheckDialog.hasError = true;"
      :items="quotaCheckDialog.requires"
      :projectId="projectId" />
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
import moment from 'moment';
import QuotaCheck from './QuotaCheck';
export default {
  name: 'StepOne',
  props: {
    instances: {
      type: Array,
      default: () => []
    }
  },
  components: {
    QuotaCheck
  },
  data() {
    return {
      roleType: String(Vue.roleType),
      visible: false,
      saving: false,
      loading: false,
      maxCount: 8,
      formData: {
        clones: []
      },
      keyPairs: [],
      quotaCheckDialog: {
        visible: false,
        requires: [],
        hasError: false
      },
      projectId: ''
    };
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
    close() {
      this.$emit('close');
    },
    handleBeforeClose(done) {
      done();
      this.close();
    },
    async submit() {
      const $this = this;
      try {
        $this.saving = true;
        $this.check();
      } catch (e) {
        __DEV__ && console.error(e);
        $this.$message.error(e.message);
        $this.saving = false;
        return false;
      }
    },
    afterCheck() {
      const $this = this;
      $this.$emit('next', $this.formData.clones);
    },
    async loadKeyPairs() {
      const $this = this;
      if ($this.formData.userId !== '') {
        let url = `api/nova/v2.1/os-keypairs`;
        try {
          let res = await $this.$ajax({
            type: 'get',
            url: url,
            showErrMsg: true,
            headers: {
              'X-OpenStack-Nova-API-Version': 2.41
            }
          });
          $this.keyPairs = res.keypairs.map(item => item.keypair.name);
        } catch (res) {
          __DEV__ && console.error(res);
        }
      }
    },
    async loadInspurConfigs() {
      const $this = this
      const res = await $this.$ajax({
        type: 'get',
        url: `api/nova/v2.1/nova-configs?group=DEFAULT&key=max_clone_count`
      });
      if (res.result.status === 0) {
        $this.maxCount = res.result.DEFAULT.max_clone.count;
      }
    },
    handleQuotaCheckDialogClose() {
      this.quotaCheckDialog.visible = false;
    },
    check() {
      const $this = this;
      let instances = 0;
      let vcpus = 0;
      let rams = 0;
      let volumes = 0;
      let snapshots = 0;
      let gigabytes = 0;
      let ports = 0;

      for (let i = 0; i < $this.formData.clones.length; i++) {
        let clone = $this.formData.clones[i];
        clone.basename = clone.basename.trim();
        if (!/^[0-9a-zA-Z_\-\u4E00-\u9FA5\uF900-\uFA2D]{1,40}$/.test(clone.basename)) {
          throw new FieldInvalidError(Vue.t('calcStorLang.INSTANCE_CLONE_CHECK_NAME_NOT_VALID', [i + 1]));
        }
        if (clone.loginType === 2 && clone.keyPair === '') {
          throw new FieldInvalidError(Vue.t('calcStorLang.INSTANCE_CLONE_CHECK_NOT_SET_KEYPAIR', [i + 1]));
        }
        if (clone.loginType === 3 && !/^[0-9a-zA-Z!@#$%^&*?_]{8,30}$/.test(clone.password)) {
          throw new FieldInvalidError(Vue.t('calcStorLang.INSTANCE_CLONE_CHECK_PASSWORD_NOT_LEGAL', [i + 1]));
        }
        if (!/^[1-9][0-9]*$/.test(clone.count)) {
          throw new FieldInvalidError(Vue.t('calcStorLang.INSTANCE_CLONE_CHECK_NOT_SET_COUNT', [i + 1]));
        }
        if (parseInt(clone.count) > $this.maxCount) {
          throw new FieldInvalidError(Vue.t('calcStorLang.INSTANCE_CLONE_CHECK_MAX_COUNT', [i + 1, $this.maxCount]));
        }
        let count = parseInt(clone.count);
        let cloneGigabytes = 0;
        clone.volumes.forEach(volume => {
          cloneGigabytes += volume.volume_size;
        });
        let clonePorts = 0;
        for (let key in clone.addresses) {
          clonePorts += clone.addresses[key].filter(netCard => netCard['OS-EXT-IPS:type'] === 'fixed').length;
        }
        instances += count;
        vcpus += clone.vcpus * count;
        rams += clone.ram * count;
        volumes += clone.volumes.length * count;
        snapshots += clone.volumes.length * count;
        gigabytes += cloneGigabytes * (count + 1);  // 云硬盘和快照大小，快照占用1倍
        ports += clonePorts * count;
      }
      // 准备配额指标
      $this.quotaCheckDialog.requires = [];
      // 检查云主机数
      $this.quotaCheckDialog.requires.push({ serviceName: 'nova', itemName: 'instances', value: instances });
      // 检查内核
      $this.quotaCheckDialog.requires.push({ serviceName: 'nova', itemName: 'cores', value: vcpus });
      // 检查内存
      $this.quotaCheckDialog.requires.push({ serviceName: 'nova', itemName: 'ram', value: rams });
      // 检查盘数量
      $this.quotaCheckDialog.requires.push({ serviceName: 'cinderV2', itemName: 'volumes', value: volumes });
      // 检查盘容量：
      $this.quotaCheckDialog.requires.push({ serviceName: 'cinderV2', itemName: 'gigabytes', value: gigabytes });
      // 检查云硬盘快照个数：
      $this.quotaCheckDialog.requires.push({ serviceName: 'cinderV2', itemName: 'snapshots', value: snapshots });
      // 端口数量
      $this.quotaCheckDialog.requires.push({ serviceName: 'neutron', itemName: 'port', ports });
      // 进行配额检查
      $this.quotaCheckDialog.visible = true;
    }
  },
  beforeDestory() {
    this.visible = false;
  },
  async mounted() {
    const $this = this;
    $this.loading = true;
    $this.projectId = $this.$cookie.get('pid');
    $this.visible = true;
    $this.formData.clones = $this.instances.map(item => {
      return {
        id: item.id,
        name: item.name,
        loginType: 1,
        keyPair: '',
        password: '',
        count: 1,
        basename: '',
        vcpus: item.vcpus,
        ram: item.memory_mb,
        volumes: item['os-extended-volumes-inspur:volumes_attached'],
        addresses: item.addresses
      };
    });
    Promise.all([
      $this.loadKeyPairs(),
      $this.loadInspurConfigs()
    ]).then(res => {
      $this.loading = false;
    }).catch(res => {
      $this.loading = false;
    });
  }
}
</script>

<style scoped>
.clone-dialog >>> .el-dialog {
  width: 1150px;
}
</style>