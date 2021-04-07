<template>
  <div>
    <el-dialog
      :title="$t('calcStorLang.BATCH_CREATE_INSTANCE')"
      size="large"
      :show-close="!saving"
      :before-close="handleClose"
      :visible="true">
      <div v-loading="loading">
        <el-form inline style="margin-bottom: 5px;">
          <el-form-item>
            <el-button icon="fa-plus" size="small" type="primary" @click="addOne">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_ADD') }}</el-button>
          </el-form-item>
          <el-form-item>
            <el-upload
              action=""
              :multiple="false"
              :auto-upload="true"
              :http-request="importExcel"
              :show-file-list="false"
            >
              <el-button icon="fa-upload" size="small" type="primary">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_IMPORT_WITHIN_EXCEL') }}</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button icon="fa-download" size="small" type="primary" @click="downloadTemplate">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_DOWNLOAD_EXCEL_TEMPLATE') }}</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="instances" height="400" row-key="rowId" border>
          <el-table-column :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_ROW_NUM')" width="52px" min-width="52px" fixed >
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_AZ')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.az" :placeholder="$t('calcStorLang.pleaseChoose')" @focus="showAZSelectDialog(scope.$index)" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_HOST')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.host" :icon="scope.row.host !== '' ? 'circle-close' : ''" @click="handleHostClear(scope.$index)" :placeholder="$t('calcStorLang.BATCH_CREATE_INSTANCE_HOST_PLACEHOLDER')" @focus="showHostSelectDialog(scope.$index, scope.row.az)" />
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_NAME')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" :placeholder="$t('calcStorLang.BATCH_CREATE_INSTANCE_NAME')" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_DESCRIPTION')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.description" :placeholder="$t('calcStorLang.BATCH_CREATE_INSTANCE_DESCRIPTION')" />
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_IMAGE')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.imageName" :placeholder="$t('calcStorLang.pleaseChoose')" @focus="showImageSelectDialog(scope.$index)" />
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :show-overflow-tooltip="false" :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_FLAVOR')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.flavorName" :placeholder="$t('calcStorLang.pleaseChoose')" @focus="showFlavorSelectDialog(scope.$index)" />
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :show-overflow-tooltip="false" :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_NETWORK')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.networkName" :placeholder="$t('calcStorLang.pleaseChoose')" @focus="showNetworkSelectDialog(scope.$index)" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_IP_ADDRESS')" width="200px">
            <template slot-scope="scope">
              <el-input size="small" type="primary" v-model="scope.row.fixedIP" :placeholder="$t('calcStorLang.BATCH_CREATE_INSTANCE_IP_ADDRESS_PLACEHOLDER')" />
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_BACKEND_STORAGE_TYPE')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.volumeTypeName" :placeholder="$t('calcStorLang.pleaseChoose')" @focus="showVolumeTypeSelectDialog(scope.$index)" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_RESET_PASSWORD')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.password" :placeholder="$t('calcStorLang.BATCH_CREATE_INSTANCE_RESET_PASSWORD_PLACEHOLDER')" type="password" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_ACTION')" width="80px" fixed="right">
            <template slot-scope="scope">
              <el-button :disabled="saving" type="danger" size="small" @click="deleteOneByIndex(scope.$index)">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_DELETE') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer">
        <el-button @click="close" :disabled="saving">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_CLOSE') }}</el-button>
        <el-button type="primary" @click="checkQuota" :disabled="loading || instances.length === 0" :loading="saving">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_SUBMIT') }}</el-button>
      </span>
    </el-dialog>

    <az-select
      ref="azSelect"
      v-if="azSelectDialog.loaded"
      :zone-list="azList"
      @select="handleAZSelect"
    />

    <host-select
      ref="hostSelect"
      v-if="hostSelectDialog.loaded"
      :hosts="hostSelectDialog.hosts"
      @select="handleHostSelect"
    />

    <image-select
      ref="imageSelect"
      v-if="imageSelectDialog.loaded"
      :images="images"
      @select="handleImageSelect"
    />

    <flavor-select
      ref="flavorSelect"
      v-if="flavorSelectDialog.loaded"
      :flavors="flavors"
      :min-disk="flavorSelectDialog.minDisk"
      :min-ram="flavorSelectDialog.minRam"
      @select="handleFlavorSelect"
    />

    <network-select
      ref="networkSelect"
      v-if="networkSelectDialog.loaded"
      :network-types="networkTypes"
      :networks="networks"
      @select="handleNetworkSelect"
    />

    <volume-type-select
      ref="volumeTypeSelect"
      v-if="volumeTypeSelectDialog.loaded"
      :volumeTypes="volumeTypes"
      @select="handleVolumeTypeSelect"
    />

    <quota-check
      v-if="quotaCheckDialog.visible"
      @close="handleQuotaCheckDialogClose"
      @success="submit"
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
import _ from 'underscore';
import { saveAs } from 'file-saver';
import { exportJsonToExcel } from '../../../../utils/Export2Excel';
import XLSX from 'xlsx'
import AZSelect from './select/AZSelect';
import HostSelect from './select/HostSelect';
import ImageSelect from './select/ImageSelect';
import FlavorSelect from './select/FlavorSelect';
import NetworkSelect from './select/NetworkSelect';
import VolumeTypeSelect from './select/VolumeTypeSelect';
import QuotaCheck from './QuotaCheck';
export default {
  name: 'BatchCreateInstancesStepTwo',
  props: ['projectId', 'userId'],
  components: {
    'az-select': AZSelect,
    HostSelect,
    ImageSelect,
    FlavorSelect,
    NetworkSelect,
    VolumeTypeSelect,
    QuotaCheck
  },
  data() {
    return {
      saving: false,
      loading: true,
      flavors: [],
      treeFlavors: [],
      azList: [],
      hosts: [],
      images: [],
      networkTypes: [],
      networks: [],
      volumeTypes: [],
      netSafeGroups: [],
      instances: [],
      azSelectDialog: {
        loaded: false,
        index: 0
      },
      hostSelectDialog: {
        loaded: false,
        hosts: [],
        index: 0
      },
      imageSelectDialog: {
        loaded: false,
        index: 0
      },
      flavorSelectDialog: {
        loaded: false,
        index: 0,
        minDisk: 0,
        minRam: 0
      },
      networkSelectDialog: {
        loaded: false,
        index: 0
      },
      volumeTypeSelectDialog: {
        loaded: false,
        index: 0
      },
      quotaCheckDialog: {
        visible: false,
        requires: [],
        hasError: false
      },
      nextRowId: 1
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
    close() {
      this.$emit('close');
    },
    handleClose(done) {
      done();
      this.close();
    },
    genNewRow() {
      const $this = this;
      return {
        rowId: $this.nextRowId++, // 行号，用于table区分资源
        az: '',
        name: '',
        description: '',
        host: '',
        imageId: '',
        imageName: '',
        flavorId: '',
        flavorName: '',
        networkType: 'vlan',
        networkId: '',
        networkName: '',
        fixedIP: '',
        number: 1,
        volumeTypeId: '',
        volumeTypeName: '',
        password: '',
        saveStatus: 0, // 保存状态：0 初始状态 1 正在保存 2 指令发送失败 3 指令发送成功
        errMsg: ''  // 保存时错误信息
      };
    },
    addOne() {
      const $this = this;
      $this.instances.push($this.genNewRow());
    },
    deleteOneByIndex(index) {
      this.instances.splice(index, 1);
    },
    async init() {
      this.loading = true;
      this.$nextTick(() => {
        Promise.all([
          this.loadAZ(),
          this.loadHosts(),
          this.loadFlavors(),
          this.loadImages(),
          this.loadNetworkType(),
          this.loadNetworks(),
          this.loadNetSafeGroups(),
          this.loadVolumeType()
        ]).then(res => {
          this.loading = false;
        });
      });
    },
    async loadAZ() {
      let $this = this;
      try {
        let res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/inspur-availability-zone/detail`
        });
        let az = res.availabilityZoneInfo;
        az = az.filter(item => item.zoneName !== 'ironic');
        az = az.filter(item => item.zoneName !== 'internal' && item.zoneState.available === true);
        $this.azList = az;
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
        hosts = hosts.filter(item => item.state.toLowerCase() === 'up' && item.status.toLowerCase() === 'enabled');
        hosts = hosts.filter(item => item.hypervisor_type !== 'ironic' && item.state !== 'down');
        hosts = _.sortBy(hosts, 'hypervisor_hostname');
        $this.hosts = hosts;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadFlavors() {
      let $this = this;
      try {
        let res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/flavors-inspur/detail?project_id=${$this.projectId}`
        });
        let flavors = res.flavors;
        flavors = flavors.filter(item => !item.name.startsWith('Bare@'));
        flavors = _.sortBy(flavors, 'disk');
        flavors = _.sortBy(flavors, 'ram');
        flavors = _.sortBy(flavors, 'vcpus');
        $this.flavors = flavors;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadImages() {
      let $this = this;
      try {
        let res = await $this.$ajax({
          type: 'post',
          url: `api/glance/v2/images/list?limit=99999&status=active`,
          data: JSON.stringify({
            project_id: $this.projectId,
            user_id: $this.userId
          })
        });
        let images = res.images;
        images = images.filter(item => {
          if (item.tags.includes('*')) {
            return false;
          }
          if (item.hasOwnProperty('image_type') && (item.image_type === 'snapshot' || item.image_type === 'backup')) {
            return false;
          }
          if (item.hasOwnProperty('block_device_mapping')) {
            return false;
          }
          if (item.visibility === 'private' && item.owner !== $this.projectId) {
            return false;
          }
          return true;
        });
        $this.images = images;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadNetworks() {
      let $this = this;
      try {
        let resProjectNetworks = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/networks?project_id=${$this.projectId}&shared=false&status=ACTIVE&router:external=false&not-tags=bm_deploy`
        });
        let resSharedNetworks = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/networks?shared=true&status=ACTIVE&not-tags=bm_deploy`
        });
        let resSubNet = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/subnets`
        });
        let networks = resProjectNetworks.networks.concat(resSharedNetworks.networks);
        networks = networks.filter(item => item.admin_state_up === true);
        networks.forEach(item => {
          item.subnets = resSubNet.subnets.filter(subnet => subnet.network_id === item.id);
        });
        networks = networks.filter(item => item.subnets.length !== 0);
        $this.networks = networks;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadNetSafeGroups() {
      let $this = this;
      try {
        let res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/security-groups?tenant_id=${$this.projectId}`
        });
        let netSafeGroups = res.security_groups;
        $this.netSafeGroups = netSafeGroups;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadVolumeType() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/cinderv3/v3/${$this.$cookie.get('pid')}/types`,
          showErrMsg: true
        });
        $this.volumeTypes = res.volume_types;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadNetworkType() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/inspur/networkext/querynetworktype`,
          showErrMsg: true
        });
        $this.networkTypes = res.support_networktype;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    getHosts(azName) {
      const $this = this;
      const az = $this.azList.find(item => item.zoneName === azName);
      if (az) {
        let hosts = [];
        for (let key in az.hosts) {
          const host = $this.hosts.find(item => item.hypervisor_hostname === key);
          if (host) {
            hosts.push(host);
          }
        }
        return hosts;
      } else {
        return [];
      }
    },
    async check() {
      const $this = this;
      let count = 0;
      for (let i = 1; i <= $this.instances.length; i++) {
        const instance = $this.instances[i - 1];
        count += instance.number;
      }
      if (count > 200) {
        throw new FieldInvalidError(Vue.t('calcStorLang.BATCH_CREATE_INSTANCE_CHECK_MAX_COUNT', 200));
      }
      for (let i = 1; i <= $this.instances.length; i++) {
        const instance = $this.instances[i - 1];
        if (instance.az === '') {
          throw new FieldInvalidError(Vue.t('calcStorLang.BATCH_CREATE_INSTANCE_CHECK_NOT_SET_AZ', i));
        }
        if (!/^[0-9a-zA-Z_\-\u4E00-\u9FA5\uF900-\uFA2D]{1,40}$/.test(instance.name)) {
          throw new FieldInvalidError(Vue.t('calcStorLang.BATCH_CREATE_INSTANCE_CHECK_NOT_VALID_NAME', i));
        }
        if (instance.description.length > 255) {
          throw new FieldInvalidError(Vue.t('calcStorLang.BATCH_CREATE_INSTANCE_CHECK_MAX_DESCRIPTION', i));
        }
        if (instance.imageId === '') {
          throw new FieldInvalidError(Vue.t('calcStorLang.BATCH_CREATE_INSTANCE_CHECK_NOT_SET_IMAGE', i));
        }
        if (instance.flavorId === '') {
          throw new FieldInvalidError(Vue.t('calcStorLang.BATCH_CREATE_INSTANCE_CHECK_NOT_SET_FLAVOR', i));
        }
        if (instance.networkId === '') {
          throw new FieldInvalidError(Vue.t('calcStorLang.BATCH_CREATE_INSTANCE_CHECK_NOT_SET_NETWORK', i));
        }
        if (instance.volumeTypeId === '') {
          throw new FieldInvalidError(Vue.t('calcStorLang.BATCH_CREATE_INSTANCE_CHECK_NOT_SET_BACKEND_STORAGE_TYPE', i));
        }
        if (instance.password !== '' && !/^[0-9a-zA-Z!@#$%^&*?_]{8,30}$/.test(instance.password)) {
          throw new FieldInvalidError(Vue.t('calcStorLang.BATCH_CREATE_INSTANCE_CHECK_PASSWORD_NOT_LEGAL', i));
        }
        const flavor = $this.flavors.find(item => item.id === instance.flavorId);
        const image = $this.images.find(item => item.id === instance.imageId);
        let sourceSizeGB = parseFloat(image.size || 0) / 1024 / 1024 / 1024;
        let sourceMinDiskGB = parseFloat(image.min_disk || 0);
        let minDisk = Math.max(sourceSizeGB, sourceMinDiskGB);
        if (image.min_ram / 1024 > (flavor.ram / 1024) || minDisk > flavor.disk) {
          throw new FieldInvalidError(Vue.t('calcStorLang.BATCH_CREATE_INSTANCE_CHECK_FLAVOR_NOT_ENOUGH', i, image.min_ram / 1024, minDisk));
        }
        if (instance.fixedIP !== '') {
          const regV4V6 = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;
          if (!regV4V6.test(instance.fixedIP)) {
            throw new FieldInvalidError(Vue.t('calcStorLang.BATCH_CREATE_INSTANCE_CHECK_IP_NOT_RIGHT', i));
          } else {
            const ipInRange = await $this.checkIPInRange(instance.fixedIP, instance.networkId);
            if (ipInRange === false) {
              throw new FieldInvalidError(Vue.t('calcStorLang.BATCH_CREATE_INSTANCE_CHECK_IP_NOT_IN_RANGE', i));
            }
          }
        }
      }
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
    async checkQuota() {
      const $this = this;
      $this.saving = true;
      try {
        // 首先检查字段是否都填全了
        await $this.check();

        // 准备配额指标
        $this.quotaCheckDialog.requires = [];
        let instances = 0;
        let vcpus = 0;
        let rams = 0;
        let volumes = 0;
        let gigabytes = 0;
        let ports = 0;
        $this.instances.map(item => {
          const flavor = $this.flavors.find(f => f.id === item.flavorId);
          instances += item.number;
          vcpus += flavor.vcpus;
          rams += flavor.ram / 1024;
          volumes += 1;
          gigabytes += flavor.disk;
          ports += 1;
        });

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
        // 端口数量
        $this.quotaCheckDialog.requires.push({ serviceName: 'neutron', itemName: 'port', ports });
        // 进行配额检查
        $this.quotaCheckDialog.visible = true;
      } catch (e) {
        $this.$message.error(e.message);
        $this.saving = false;
        return false;
      }
    },
    handleQuotaCheckDialogClose() {
      this.quotaCheckDialog.visible = false;
    },
    async submit() {
      const $this = this;
      const netSafeGroup = $this.netSafeGroups.find(item => item.name === 'default');
      $this.instances.forEach(instance => {
        instance.netSafeGroupId = netSafeGroup.id;
        const flavor = $this.flavors.find(item => item.id === instance.flavorId);
        instance.disk = flavor.disk;
      });
      $this.$emit('next', $this.instances);
    },
    stringChars(str) { //计算字符串占用的char长度，比如字母数字占1个，中文占2个，用于排版
      let n = 0;
      if (typeof (str) === 'string') {
        for (let i in str) {
          if (str.charCodeAt(i) > 255) {
            n += 2;
          } else {
            n += 1;
          }
        }
      }
      return n;
    },
    importExcel(options) {
      const $this = this;
      const file = options.file;
      const reader = new FileReader();
      reader.onload = function(e) {
        const data = e.target.result;
        const ws = XLSX.read(data, { type: 'binary' });
        if (!('Workbook' in ws)) {
          $this.$message.error($this.$t('calcStorLang.BATCH_CREATE_INSTANCE_IMPORT_WITHIN_EXCEL_ERR_WRONG_FILE'));
        } else {
          const sheetName = ws.SheetNames[0];
          const sheet = ws.Sheets[sheetName];
          const range = String(sheet['!ref']);
          if (!(/^A1:K[1-9]{1}[0-9]*$/.test(range))) {
            $this.$message.error($this.$t('calcStorLang.BATCH_CREATE_INSTANCE_IMPORT_WITHIN_EXCEL_ERR_NOT_TEMPLATE'));
          } else {
            let row = 2; // 第2行为数据
            $this.loading = true;
            setTimeout(() => {
              while (`A${row}` in sheet) {
                if (row === 2 && $this.instances.length === 1) { // 如果是导入数据的第1行，且能执行导入，则判断是否原有表中第1行是系统添加的且为空，是则删除。
                  let compareRow = $this.genNewRow();
                  compareRow.rowId = 1;
                  if (JSON.stringify(compareRow) === JSON.stringify($this.instances[0])) {
                    $this.deleteOneByIndex(0);
                  }
                }
                const newInstance = $this.genNewRow();
                // A 可用域
                const azName = `A${row}` in sheet ? String(sheet[`A${row}`].v) : '';
                // B 宿主机
                const hostName = `B${row}` in sheet ? String(sheet[`B${row}`].v) : '';
                if ($this.azList.findIndex(item => item.zoneName === azName) > -1) {
                  newInstance.az = azName;
                  let host = $this.getHosts(azName).find(item => item.hypervisor_hostname === hostName);
                  if (host) {
                    newInstance.host = hostName;
                  }
                }

                // C 云主机名
                const name = `C${row}` in sheet ? String(sheet[`C${row}`].v) : '';
                newInstance.name = name;

                // D 描述
                const description = `D${row}` in sheet ? String(sheet[`D${row}`].v) : '';
                newInstance.description = description;

                // E 镜像
                const imageName = `E${row}` in sheet ? String(sheet[`E${row}`].v) : '';
                let image = $this.images.find(item => item.name === imageName);
                if (image) {
                  newInstance.imageId = image.id;
                  newInstance.imageName = image.name;
                }

                // F 配置
                const flavorName = `F${row}` in sheet ? String(sheet[`F${row}`].v) : '';
                let flavor = $this.flavors.find(item => item.name === flavorName);
                if (flavor) {
                  let sourceSizeGB = parseFloat(image.size || 0) / 1024 / 1024 / 1024;
                  let sourceMinDiskGB = parseFloat(image.min_disk || 0);
                  let minDisk = Math.max(sourceSizeGB, sourceMinDiskGB);
                  let minRam = image.min_ram || 0;
                  if (minRam <= flavor.ram && minDisk <= flavor.disk) {
                    newInstance.flavorId = flavor.id;
                    newInstance.flavorName = flavor.name;
                  }
                }

                // G 网络类型
                const networkType = `G${row}` in sheet ? String(sheet[`G${row}`].v) : '';
                // H 网络
                const networkName = `H${row}` in sheet ? String(sheet[`H${row}`].v) : '';
                if (['flat', 'vxlan', 'vlan'].includes(networkType)) {
                  newInstance.networkType = networkType;
                  let network = $this.networks.find(item => item['provider:network_type'] === networkType && item.name === networkName);
                  if (network) {
                    newInstance.networkId = network.id;
                    newInstance.networkName = network.name;
                  }
                }

                // I IP地址
                const fixedIP = `I${row}` in sheet ? String(sheet[`I${row}`].v) : '';
                newInstance.fixedIP = fixedIP;

                // J 系统盘类型
                const volumeTypeName = `J${row}` in sheet ? String(sheet[`J${row}`].v) : '';
                let volumeType = $this.volumeTypes.find(item => item.name === volumeTypeName);
                if (volumeType) {
                  newInstance.volumeTypeId = volumeType.id;
                  newInstance.volumeTypeName = volumeType.name;
                }

                // K 重置密码
                const password = `K${row}` in sheet ? String(sheet[`K${row}`].v) : '';
                newInstance.password = password;

                $this.instances.push(newInstance);
                row++;
              }
              $this.$nextTick(() => {
                $this.loading = false;
              });
            }, 1000); // FIXME: 如果能找到办法，让loading状态正常显示，则可以去掉这个1s的延迟。 by ziyu
          }
        }
      };
      reader.readAsBinaryString(file);
    },
    async downloadTemplate() {
      const $this = this;
      try {
        const headers = {
          az: {
            zh_cn: '可用域(必填)',
            en: 'AZ(Required)'
          },
          host: {
            zh_cn: '宿主机',
            en: 'Host'
          },
          instance_name: {
            zh_cn: '云主机名(必填)',
            en: 'Instance Name(Required)'
          },
          description: {
            zh_cn: '描述',
            en: 'Description'
          },
          image: {
            zh_cn: '镜像(必填)',
            en: 'Image(Required)'
          },
          flavor: {
            zh_cn: '配置(必填)',
            en: 'Flavor(Required)'
          },
          network_type: {
            zh_cn: '网络类型(必填)',
            en: 'Network Type(Required)'
          },
          network: {
            zh_cn: '网络(必填)',
            en: 'Network(Required)'
          },
          ip_address: {
            zh_cn: 'IP地址',
            en: 'IP Address'
          },
          volume_type: {
            zh_cn: '系统盘类型(必填)',
            en: 'Volume Type(Required)'
          },
          password: {
            zh_cn: '重置密码',
            en: 'Reset Password'
          }
        };
        exportJsonToExcel({
          header: Object.keys(headers).map(k => headers[k][Vue.language]),
          data: [],
          filename: 'template'
        });
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    showAZSelectDialog(index) {
      const $this = this;
      if ($this.azSelectDialog.loaded === false) {
        $this.azSelectDialog.loaded = true;
      }
      $this.azSelectDialog.index = index;
      $this.$nextTick(() => {
        $this.$refs.azSelect.show();
      });
    },
    handleAZSelect(az) {
      const $this = this;
      const instance = $this.instances[$this.azSelectDialog.index];
      instance.az = az.zoneName;
      instance.host = '';
    },
    handleHostClear() {
      const $this = this;
      const instance = $this.instances[$this.hostSelectDialog.index];
      instance.host = '';
    },
    showHostSelectDialog(index, az) {
      const $this = this;
      if ($this.hostSelectDialog.loaded === false) {
        $this.hostSelectDialog.loaded = true;
      }
      $this.hostSelectDialog.index = index;
      let azItem = $this.azList.find(item => item.zoneName === az);
      if (azItem) {
        let azHostNames = Object.keys(azItem.hosts);
        $this.hostSelectDialog.hosts = $this.hosts.filter(item => {
          if (azHostNames.includes(item.hypervisor_hostname)) {
            return true;
          }
          return false;
        });
      } else {
        $this.hostSelectDialog.hosts = [];
      }
      $this.$nextTick(() => {
        $this.$refs.hostSelect.show();
      });
    },
    handleHostSelect(host) {
      const $this = this;
      const instance = $this.instances[$this.hostSelectDialog.index];
      instance.host = host.hypervisor_hostname;
    },
    showImageSelectDialog(index) {
      const $this = this;
      if ($this.imageSelectDialog.loaded === false) {
        $this.imageSelectDialog.loaded = true;
      }
      $this.imageSelectDialog.index = index;
      $this.$nextTick(() => {
        $this.$refs.imageSelect.show();
      });
    },
    handleImageSelect(image) {
      const $this = this;
      const instance = $this.instances[$this.imageSelectDialog.index];
      instance.imageId = image.id;
      instance.imageName = image.name;
      if (instance.flavorId !== '') { // 如果已经选择了镜像，则判断下镜像是否符合要求
        let flavor = $this.flavors.find(item => item.id === instance.flavorId);
        if (flavor) {
          let sourceSizeGB = parseFloat(image.size || 0) / 1024 / 1024 / 1024;
          let sourceMinDiskGB = parseFloat(image.min_disk || 0);
          let minDisk = Math.max(sourceSizeGB, sourceMinDiskGB);
          let minRam = image.min_ram || 0;
          if (minRam > flavor.ram || minDisk > flavor.disk) {
            instance.flavorId = '';
            instance.flavorName = '';
          }
        }
      }
    },
    showFlavorSelectDialog(index) {
      const $this = this;
      let instance = $this.instances[index];
      $this.flavorSelectDialog.minDisk = 0;
      $this.flavorSelectDialog.minRam = 0;
      let image = $this.images.find(item => item.id === instance.imageId);
      if (image) {
        let sourceSizeGB = parseFloat(image.size || 0) / 1024 / 1024 / 1024;
        let sourceMinDiskGB = parseFloat(image.min_disk || 0);
        $this.flavorSelectDialog.minDisk = Math.max(sourceSizeGB, sourceMinDiskGB);
        $this.flavorSelectDialog.minRam = image.min_ram || 0;
      }
      if ($this.flavorSelectDialog.loaded === false) {
        $this.flavorSelectDialog.loaded = true;
      }
      $this.flavorSelectDialog.index = index;
      $this.$nextTick(() => {
        $this.$refs.flavorSelect.show();
      });
    },
    handleFlavorSelect(flavor) {
      const $this = this;
      const instance = $this.instances[$this.flavorSelectDialog.index];
      instance.flavorId = flavor.id;
      instance.flavorName = flavor.name;
    },
    showNetworkSelectDialog(index) {
      const $this = this;
      if ($this.networkSelectDialog.loaded === false) {
        $this.networkSelectDialog.loaded = true;
      }
      $this.networkSelectDialog.index = index;
      $this.$nextTick(() => {
        $this.$refs.networkSelect.show();
      });
    },
    handleNetworkSelect(network) {
      const $this = this;
      const instance = $this.instances[$this.networkSelectDialog.index];
      instance.networkType = network['provider:network_type'];
      instance.networkId = network.id;
      instance.networkName = network.name;
    },
    showVolumeTypeSelectDialog(index) {
      const $this = this;
      if ($this.volumeTypeSelectDialog.loaded === false) {
        $this.volumeTypeSelectDialog.loaded = true;
      }
      $this.volumeTypeSelectDialog.index = index;
      $this.$nextTick(() => {
        $this.$refs.volumeTypeSelect.show();
      });
    },
    handleVolumeTypeSelect(volumeType) {
      const $this = this;
      const instance = $this.instances[$this.volumeTypeSelectDialog.index];
      instance.volumeTypeId = volumeType.id;
      instance.volumeTypeName = volumeType.name;
    }
  },
  async mounted() {
    this.addOne();
    await this.init();
  }
}
</script>

<style>

</style>
