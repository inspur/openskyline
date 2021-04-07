<template>
  <el-dialog :title="title" :visible="true" :before-close="handleClose" :show-close="!loading">
    <div v-loading="loading">
      <el-form ref="form" label-width="120px" class="me-required-form" label-position="left">
        <el-form-item :label="$t('calcStorLang.REVISE_INSTANCE_QUOTA')" prop="name">
          <p>{{ quotaVCPUsStr }}</p>
          <p>{{ quotaRamStr }}</p>
        </el-form-item>
        <el-form-item v-if="instances.length === 1" :label="$t('calcStorLang.REVISE_INSTANCE_CURRENT_FLAVOR')" prop="name">
          <span>{{ $t('calcStorLang.REVISE_INSTANCE_CURRENT_FLAVOR_STR', currentFlavor.vcpus, currentFlavor.ram / 1024, currentFlavor.disk) }}</span>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.REVISE_INSTANCE_CPU')" prop="vcpus" class="is-required">
          <el-radio-group v-model="formData.vcpus" size="large" @change="handleVCPUsChanged">
            <el-radio-button class="clearfix" v-for="(vcpus, index) in vcpuses" :key="index" :label="vcpus" :disabled="!vcpusAvailable(vcpus)">
              {{ vcpus }}
            </el-radio-button>
          </el-radio-group>
          <el-tooltip placement="top" v-if="hotplug">
            <div slot="content">{{ $t('calcStorLang.REVISE_INSTANCE_HOST_NUMA_NODE_TIPS', hostNumaNodeCount) }}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.REVISE_INSTANCE_RAM')" prop="ram" class="is-required">
          <el-radio-group v-model="formData.ram" size="large" @change="handleRamChanged">
            <el-radio-button class="clearfix" v-for="(ram, index) in rams" :key="index" :label="ram" :disabled="!ramAvailable(ram)">
              {{ ram / 1024 }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.REVISE_INSTANCE_DISK')" prop="disk" class="is-required">
          <el-radio-group v-model="formData.disk" size="large" @change="handleDiskChanged">
            <el-radio-button class="clearfix" v-for="(disk, index) in disks" :key="index" :label="disk" :disabled="!diskAvailable(disk)">
              {{ disk }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.REVISE_INSTANCE_SPEC')" class="is-required">
          <el-select v-model="formData.flavorId" class="col-10" filterable>
            <el-option v-for="item in matchedFlavors" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <metadata-detail :flavorId="formData.flavorId" />
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.REVISE_INSTANCE_REMARK')" v-if="!hotplug">
          <span v-html="$t('calcStorLang.REVISE_INSTANCE_REMARK_TIPS')"></span>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.REVISE_INSTANCE_REMARK')" v-if="hotplug">
          <span v-html="$t('calcStorLang.REVISE_INSTANCE_REMARK_HOTPLUG_TIPS')"></span>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close" v-show="!loading">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="handleSubmit" :disabled="formData.flavorId === ''" :loading="loading">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import _ from 'underscore';
import MetadataDetail from './MetadataDetail';
export default {
  name: 'ReviseInstance',
  components: { MetadataDetail },
  props: {
    instances: { // 云主机实例
      type: Array,
      default: () => []
    },
    hotplug: { // 是否是热扩容界面
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      roleType: Vue.roleType + '',
      init: false,
      quota: {
        vcpusUsed: 0,
        vcpus: 0,
        ramUsed: 0,
        ram: 0
      },
      hostNumaNodeCount: 1,
      hostMaxCPUCount: 1024,
      vcpuses: [],
      rams: [],
      disks: [],
      matchedFlavors: [],
      minRam: 0,
      minDisk: 0,
      currentFlavor: {
        vcpus: 0,
        ram: 0,
        disk: 0,
        flavorId: '',
        hotplug: false  // 是否已开启热扩容？
      },
      formData: {
        vcpus: 0,
        ram: 0,
        disk: 0,
        flavorId: ''
      },
      flavors: [],
      loading: false,
      dialogVisible: false
    }
  },
  methods: {
    handleClose(done) {
      done();
      this.close();
    },
    close() {
      this.$emit('close');
    },
    async loadQuota() {
      const res = await this.$ajax({
        url: `api/nova/v2.1/os-quota-sets/${this.instances[0].tenant_id}/detail`,
        type: 'get'
      });
      let quotaSet = res.quota_set;
      this.quota.vcpusUsed = quotaSet.cores.in_use;
      this.quota.vcpus = quotaSet.cores.limit;
      this.quota.ramUsed = quotaSet.ram.in_use;
      this.quota.ram = quotaSet.ram.limit;
    },
    async getAllFlavors() { // 加载所有的flavor信息，只执行一次
      const $this = this;
      let projectIds = new Set();
      $this.instances.forEach(instance => {
        projectIds.add(instance.tenant_id);
      });
      let projectId = '';
      if (projectIds.size === 1) {
        projectId = `?project_id=${[...projectIds][0]}`;
      }
      const res = await $this.$ajax({
        url: `api/nova/v2.1/flavors-inspur/detail${projectId}`,
        method: 'get'
      });
      let flavors = res.flavors;
      flavors.forEach(item => {
        item.available = true;
      });
      flavors = flavors.filter(item => !item.name.startsWith('Bare@'));
      let vcpuses = _.uniq(_.pluck(flavors, 'vcpus'));
      $this.vcpuses = vcpuses.sort((a, b) => a - b);
      let rams = _.uniq(_.pluck(flavors, 'ram'));
      $this.rams = rams.sort((a, b) => a - b);
      let disks = _.uniq(_.pluck(flavors, 'disk'));
      $this.disks = disks.sort((a, b) => a - b);
      $this.flavors = flavors;
    },
    initFlavorList() { // 重新计算可用的flavor信息，不可用的均available置为false
      const $this = this;
      $this.flavors.forEach(item => {
        item.available = true;
        if ($this.currentFlavor.hotplug) {
          if (item.vcpus % 2 !== 0) { // 开启了热扩容的云主机，仅支持偶数个vcpus
            item.available = false;
          }
        }
        if ($this.hotplug) {
          if (item.vcpus % $this.hostNumaNodeCount !== 0) { // 只允许vcpus根据numa node成倍热扩容
            item.available = false;
          }
          if (item.vcpus > $this.hostMaxCPUCount) {
            item.available = false;
          }
          if (item.vcpus < $this.currentFlavor.vcpus) { // 热扩容只允许变大
            item.available = false;
          }
          if (item.ram < $this.currentFlavor.ram) { // 热扩容只允许变大
            item.available = false;
          }
          if (item.disk < $this.currentFlavor.disk) { // 热扩容只允许变大
            item.available = false;
          }
        }
        if (item.ram < $this.minRam) {
          item.available = false;
        }
        if (item.disk < $this.minDisk) {
          item.available = false;
        }
      });
      const availableVCPUs = $this.flavors.filter(item => item.available === true)
                                          .map(item => item.vcpus);
      $this.formData.vcpus = 0; // 先改为0，以便触发下一个change
      $this.$nextTick(() => {
        if (!$this.init && $this.vcpusAvailable($this.currentFlavor.vcpus)) {
          $this.formData.vcpus = $this.currentFlavor.vcpus;
        } else {
          $this.formData.vcpus = _.min(availableVCPUs);
        }
      });
    },
    handleVCPUsChanged(vcpus) {
      const $this = this;
      const availableRams = $this.flavors.filter(item => item.vcpus === vcpus &&
                                                         item.available === true)
                                         .map(item => item.ram);
      $this.formData.ram = 0; // 先改为0，以便触发下一个change
      $this.$nextTick(() => {
        if (!$this.init && $this.ramAvailable($this.currentFlavor.ram)) {
          $this.formData.ram = $this.currentFlavor.ram;
        } else {
          $this.formData.ram = _.min(availableRams);
        }
      });
    },
    handleRamChanged(ram) {
      const $this = this;
      const availableDisks = $this.flavors.filter(item => item.vcpus === $this.formData.vcpus &&
                                                          item.ram === ram &&
                                                          item.available === true)
                                          .map(item => item.disk);
      $this.formData.disk = 0; // 先改为0，以便触发下一个change
      $this.$nextTick(() => {
        if (!$this.init && $this.diskAvailable($this.currentFlavor.disk)) {
          $this.formData.disk = $this.currentFlavor.disk;
        } else {
          $this.formData.disk = _.min(availableDisks);
        }
      });
    },
    handleDiskChanged(disk) {
      const $this = this;
      $this.$nextTick(() => {
        $this.matchedFlavors = $this.flavors.filter(item => item.vcpus === $this.formData.vcpus &&
                                                            item.ram === $this.formData.ram &&
                                                            item.disk === disk &&
                                                            item.available === true);
        if ($this.matchedFlavors.length > 0) {
          if (!$this.init) {
            if ($this.matchedFlavors.findIndex(item => item.id === $this.currentFlavor.flavorId) > -1) {
              $this.formData.flavorId = $this.currentFlavor.flavorId;
            } else {
              $this.formData.flavorId = $this.matchedFlavors[0].id;
            }
          } else {
            $this.formData.flavorId = $this.matchedFlavors[0].id;
          }
        }
      });
    },
    vcpusAvailable(vcpus) {
      const $this = this;
      if ($this.flavors.findIndex(item => item.vcpus === vcpus &&
                                          item.available === true) > -1) {
        return true;
      }
      return false;
    },
    ramAvailable(ram) {
      const $this = this;
      if ($this.flavors.findIndex(item => item.vcpus === $this.formData.vcpus &&
                                          item.ram === ram &&
                                          item.available === true) > -1) {
        return true;
      }
      return false;
    },
    diskAvailable(disk) {
      const $this = this;
      if ($this.flavors.findIndex(item => item.vcpus === $this.formData.vcpus &&
                                          item.ram === $this.formData.ram &&
                                          item.disk === disk &&
                                          item.available === true) > -1) {
        return true;
      }
      return false;
    },
    checkQuota() {
      const $this = this;
      if ($this.quota.vcpus !== -1) {
        if (($this.formData.vcpus * $this.instances.length) > $this.quota.vcpus - $this.quota.vcpusUsed) {
          return false;
        }
      }
      if ($this.quota.ram !== -1) {
        if (($this.formData.ram * $this.instances.length) > $this.quota.ram - $this.quota.ramUsed) {
          return false;
        }
      }
      return true;
    },
    async loadNumaInfo() {
      const $this = this;
      let instance = $this.instances[0];
      try {
        let res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers-inspur/${instance.id}/numa_count`
        });
        $this.hostNumaNodeCount = res.numa_count || 1;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadMaxCPUCount() {
      const $this = this;
      let instance = $this.instances[0];
      try {
        let res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/os-hypervisors-inspur/${instance['OS-EXT-SRV-ATTR:hypervisor_hostname']}/get_host_numainfo`
        });
        $this.hostMaxCPUCount = res.cpu_count || 1024;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async handleSubmit() {
      const $this = this;
      if ($this.checkQuota() === false) {
        $this.$message.error($this.$t('calcStorLang.REVISE_INSTANCE_QUOTA_NOT_ENOUGH'));
      } else if ($this.instances.length === 1 && $this.formData.flavorId === $this.currentFlavor.flavorId) {
        $this.$message.error($this.$t('calcStorLang.REVISE_INSTANCE_FLAVOR_NOT_CHANGED'));
      } else {
        let h = $this.$createElement;
        let hotplugConfirm = h('div', [h('p', `云主机进行热扩容将有可能导致以下情况发生：`),
          h('p', `1.CPU绑定关系失效；`),
          h('p', `2.CPU和内存NUMA拓扑发生改变；`),
          h('p', `3.通过资源规格配置的QoS信息丢失。`),
          h('p', `是否继续？`)]);
        let reviseConfirm = Vue.t('calcStorLang.REVISE_INSTANCE_CONFIRM');
        $this.$confirm($this.hotplug ? hotplugConfirm : reviseConfirm, Vue.t('calcStorLang.confirm'), {
          type: 'warning'
        }).then(async () => {
          if ($this.roleType === '3') {
            await $this.apply();
          } else {
            await $this.submit();
          }
        });
      }
    },
    // 提交更改配置
    async submit() {
      const $this = this;
      $this.loading = true;
      let body = {};
      if ($this.hotplug) {
        body = {
          live_resize: {
            flavorRef: $this.formData.flavorId
          }
        };
      } else {
        body = {
          resize: {
            flavorRef: $this.formData.flavorId
          }
        };
      }

      let hasError = false;
      for (let i = 0; i < $this.instances.length; i++) {
        const instance = $this.instances[i];
        if (instance.flavor.id === $this.formData.flavorId) {
          continue;
        }
        try {
          let result = await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers-inspur/${instance.id}/action`,
            data: JSON.stringify(body),
            showErrMsg: true,
            errorKey: 'badRequest',
            log: {
              description: {
                en: ($this.hotplug ? 'Online Expansion:' : 'Alter Configuration:') + instance.name,
                zh_cn: ($this.hotplug ? '在线扩容:' : '更改配置:') + instance.name
              },
              target: Vue.logTarget.computeInstance
            }
          });
        } catch (e) {
          hasError = true;
          __DEV__ && console.error(e);
        }
      }
      if (!hasError) {
        if ($this.hotplug) {
          $this.$message($this.$t('calcStorLang.REVISE_INSTANCE_HOTPLUG_SENT_SUCCESSFULLY'));
        } else {
          $this.$message($this.$t('calcStorLang.REVISE_INSTANCE_ALTER_CONFIGURATION_SENT_SUCCESSFULLY'));
        }
      }
      $this.$emit('refresh');
      $this.$emit('close');
    },
    // 申请更改配置
    async apply() {
      const $this = this;
      $this.loading = true;
      let body = {
        resize: {
          flavorRef: $this.formData.flavorId
        }
      };

      let hasError = false;
      for (let i = 0; i < $this.instances.length; i++) {
        const instance = $this.instances[i];
        try {
          let orderData = {
            data: JSON.stringify(body),
            instance_id: instance.id,
            instance_name: instance.name
          };
          orderData = JSON.stringify(orderData);
          let applyData = {
            applicant_id: Vue.userId,
            order_data: orderData,
            project_id: $this.$cookie.get('pid'),
            resource_type: 'VM.UPDATE',
            op_desc: ''
          };
          let ret = await this.$ajax({
            url: 'api/leo/v1/order/create_order',
            data: JSON.stringify(applyData),
            type: 'post',
            log: {
              description: {
                en: `Apply Modify Instance: ${instance.name}`,
                zh_cn: `申请修改云主机: ${instance.name}`
              },
              target: Vue.logTarget.process_manage
            },
            errorKey: 'badRequest'
          });
        } catch (e) {
          __DEV__ && console.error(e);
          $this.loading = false;
        }
      }
      if (!hasError) {
        $this.$message(Vue.t('calcStorLang.REVISE_INSTANCE_APPLY_SENT_SUCCESSFULLY'));
      }
      $this.$emit('refresh');
      $this.$emit('close');
    }
  },
  computed: {
    title() {
      let title = '';
      if (this.roleType === '3') {
        title = this.$t('calcStorLang.REVISE_INSTANCE_APPLY');
      } else {
        if (this.hotplug) {
          title = this.$t('calcStorLang.REVISE_INSTANCE_HOTPLUG');
        } else {
          title = this.$t('calcStorLang.REVISE_INSTANCE');
        }
      }
      return title;
    },
    quotaVCPUsStr() {
      const vcpusStr = this.quota.vcpus === -1 ? this.$t('calcStorLang.REVISE_INSTANCE_QUOTA_VCPUS_UNLIMITED', this.quota.vcpusUsed) : this.$t('calcStorLang.REVISE_INSTANCE_QUOTA_VCPUS', this.quota.vcpus, this.quota.vcpusUsed);
      return vcpusStr;
    },
    quotaRamStr() {
      const ramStr = this.quota.ram === -1 ? this.$t('calcStorLang.REVISE_INSTANCE_QUOTA_RAM_UNLIMITED', this.quota.ramUsed / 1024) : this.$t('calcStorLang.REVISE_INSTANCE_QUOTA_RAM', this.quota.ram / 1024, this.quota.ramUsed / 1024);
      return ramStr;
    }
  },
  async mounted() {
    this.loading = true;
    this.loadQuota();
    if (this.hotplug === true) {
      await this.loadNumaInfo();
      await this.loadMaxCPUCount();
    }
    await this.getAllFlavors();
    this.instances.forEach(instance => {  // 循环将所有instances的vcpus、ram、disk中最大值当做基准值使用
      const currentFlavor = this.flavors.find(flavor => flavor.id === instance.flavor.id);
      if (currentFlavor) {
        this.currentFlavor.vcpus = Math.max(currentFlavor.vcpus, this.currentFlavor.vcpus);
        this.currentFlavor.ram = Math.max(currentFlavor.ram, this.currentFlavor.ram);
        this.currentFlavor.disk = Math.max(currentFlavor.disk, this.currentFlavor.disk);
        this.currentFlavor.flavorId = currentFlavor.id;
        this.minDisk = Math.max(this.currentFlavor.disk, this.minDisk);
      }
      if ('system_metadata' in instance && 'image_min_ram' in instance.system_metadata) {
        let minRam = parseInt(instance.system_metadata.image_min_ram);
        this.minRam = Math.max(minRam, this.minRam);
      }
      if (instance.tags.includes('HOTPLUG')) {
        this.currentFlavor.hotplug = true;
      }
    });
    this.initFlavorList();
    this.loading = false;
  }
}

</script>
<style scoped>
.el-radio-button {
  padding-bottom: 2px;
}

</style>
