<template>
  <div>
    <div style="margin: 15px; min-height: 400px;">
      <el-form ref="form" :rules="rules" :model="formData" label-position="right" label-width="100px" v-loading="loading">
        <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_FLAVOR_CPU')" prop="vcpus" class="is-required">
          <el-radio-group v-model="formData.vcpus" size="large" @change="handleVCPUsChanged">
            <el-radio-button class="clearfix" v-for="(vcpus, index) in vcpuses" :key="index" :label="vcpus" :disabled="!vcpusAvailable(vcpus)">
              {{ vcpus }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_FLAVOR_RAM')" prop="ram" class="is-required">
          <el-radio-group v-model="formData.ram" size="large" @change="handleRamChanged">
            <el-radio-button class="clearfix" v-for="(ram, index) in rams" :key="index" :label="ram" :disabled="!ramAvailable(ram)">
              {{ ram / 1024 }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_FLAVOR_DISK')" prop="disk" class="is-required" v-if="!bootFromVolume">
          <el-radio-group v-model="formData.disk" size="large" @change="handleDiskChanged">
            <el-radio-button class="clearfix" v-for="(disk, index) in disks" :key="index" :label="disk" :disabled="!diskAvailable(disk)">
              {{ disk }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_FLAVOR_SPEC')" class="is-required">
          <el-select v-model="formData.flavorId" class="col-10" filterable>
            <el-option v-for="item in matchedFlavors" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <metadata-detail ref="metadataDetail" :flavorId="formData.flavorId" />
        </el-form-item>
        <el-collapse v-if="$archIs('x86') && hasCyborg">
          <el-collapse-item :title="$t('calcStorLang.GPU')">
            <el-form-item :label="$t('calcStorLang.GPU_PROFILE')">
              <gpu-profile-list :hosts="gpuHosts" @select="handleGPUProfileSelected" />
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>
    </div>
    <div class="el-dialog__footer ng-create-instance-footer">
      <el-button @click="handleClose">{{ $t('calcStorLang.NG_CREATE_INSTANCE_CLOSE') }}</el-button>
      <el-button @click="handlePrev">{{ $t('calcStorLang.NG_CREATE_INSTANCE_PREV') }}</el-button>
      <el-button type="primary" @click="handleNext">{{ $t('calcStorLang.NG_CREATE_INSTANCE_NEXT') }}</el-button>
    </div>
  </div>
</template>

<script>
import _ from 'underscore';
import MetadataDetail from '../../instance/MetadataDetail';
import GPUProfileList from './flavor/GPUProfileList';
export default {
  name: 'StepFlavor',
  props: {
    incomingData: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    MetadataDetail,
    'gpu-profile-list': GPUProfileList
  },
  data() {
    return {
      roleType: String(Vue.roleType),
      hasCyborg: 'cyborg' in Vue.service, // 是否部署了cyborg，如果没部署，则不显示加速器
      init: false,  //是否已经完成初始化？部分监听类的功能只有初始化以后才可以生效
      loading: true,
      flavors: [],
      formData: {
        flavorId: '',
        vcpus: 0,
        ram: 0,
        disk: 0,
        gpuProfileName: ''
      },
      rules: {
        flavorId: [{
          type: 'required',
          trigger: 'blur change'
        }]
      },
      vcpuses: [],
      rams: [],
      disks: [],
      matchedFlavors: [],
      gpuHosts: []
    };
  },
  methods: {
    handleClose() {
      const $this = this;
      $this.$emit('close');
    },
    handlePrev() {
      const $this = this;
      $this.$emit('prev', $this.formData);
    },
    handleNext() {
      const $this = this;
      $this.$refs.form.validate((valid) => {
        if (valid) {
          $this.$emit('next', $this.formData);
          return true;
        } else {
          return false;
        }
      });
    },
    async loadFlavors() {
      const $this = this;
      const res = await $this.$ajax({
        url: `api/nova/v2.1/flavors-inspur/detail?project_id=${$this.incomingData.projectId}`,
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
      $this.formData.flavorId = '';
    },
    initFlavors() {
      const $this = this;
      $this.flavors.forEach(item => {
        item.available = true;
        if ($this.incomingData.hotplug) {
          if (item.vcpus % 2 !== 0) {
            item.available = false;
          }
        }
        if (item.ram < $this.incomingData.sourceMinRam) {
          item.available = false;
        }
        if (!$this.bootFromVolume) {
          let sourceSizeGB = parseFloat($this.incomingData.sourceSize) / 1024 / 1024 / 1024;
          let sourceMinDiskGB = parseFloat($this.incomingData.sourceMinDisk);
          let sourceVirtualSizeGB = parseFloat($this.incomingData.sourceVirtualSize) / 1024 / 1024 / 1024;
          let minDisk = Math.max(sourceSizeGB, sourceMinDiskGB, sourceVirtualSizeGB);
          if (item.disk < minDisk) {
            item.available = false;
          }
        }
      });
      const availableVCPUs = $this.flavors.filter(item => item.available === true)
                                          .map(item => item.vcpus);
      if ($this.flavors.findIndex(item => item.available === true && item.id === $this.formData.flavorId) === -1) {
        $this.formData.vcpus = 0;
        $this.$nextTick(() => {
          if (!$this.init) {
            if ($this.vcpusAvailable($this.incomingData.vcpus)) {
              $this.formData.vcpus = $this.incomingData.vcpus;
            } else {
              $this.formData.vcpus = _.min(availableVCPUs);
            }
          } else {
            $this.formData.vcpus = _.min(availableVCPUs);
          }
        });
      } else {
        $this.init = true;
      }
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
    handleVCPUsChanged(vcpus) {
      const $this = this;
      const availableRams = $this.flavors.filter(item => item.vcpus === vcpus &&
                                                         item.available === true)
                                         .map(item => item.ram);
      $this.formData.ram = 0;
      $this.$nextTick(() => {
        if (!$this.init) {
          if ($this.ramAvailable($this.incomingData.ram)) {
            $this.formData.ram = $this.incomingData.ram;
          } else {
            $this.formData.ram = _.min(availableRams);
          }
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
      $this.formData.disk = 0;
      $this.$nextTick(() => {
        if (!$this.bootFromVolume) {
          if (!$this.init) {
            if ($this.diskAvailable($this.incomingData.disk)) {
              $this.formData.disk = $this.incomingData.disk;
            } else {
              $this.formData.disk = _.min(availableDisks);
            }
          } else {
            $this.formData.disk = _.min(availableDisks);
          }
        } else {
          $this.handleDiskChanged(0);
        }
      });
    },
    handleDiskChanged(disk) {
      const $this = this;
      if (!$this.bootFromVolume) {
        $this.matchedFlavors = $this.flavors.filter(item => item.vcpus === $this.formData.vcpus &&
                                                            item.ram === $this.formData.ram &&
                                                            item.disk === disk &&
                                                            item.available === true);
      } else {
        $this.matchedFlavors = $this.flavors.filter(item => item.vcpus === $this.formData.vcpus &&
                                                            item.ram === $this.formData.ram &&
                                                            item.available === true);
      }
      $this.$nextTick(() => {
        if ($this.matchedFlavors.length > 0) {
          if (!$this.init) {
            if ($this.matchedFlavors.findIndex(item => item.id === $this.incomingData.flavorId) > -1) {
              $this.formData.flavorId = $this.incomingData.flavorId;
            } else {
              $this.formData.flavorId = $this.matchedFlavors[0].id;
            }
          } else {
            $this.formData.flavorId = $this.matchedFlavors[0].id;
          }
        }
        $this.init = true;
      });
    },
    handleGPUProfileSelected(gpuProfileName) {
      this.formData.gpuProfileName = gpuProfileName;
    },
    async getHostsByAZ(zoneName) {
      const $this = this;
      if (zoneName !== '') {
        try {
          const res = await $this.$ajax({
            type: 'get',
            url: `api/nova/v2.1/inspur-availability-zone/detail`
          });
          let availableZone = res.availabilityZoneInfo.find(item => item.zoneName === zoneName);
          let hosts = Object.keys(availableZone.hosts);
          return hosts;
        } catch (e) {
          __DEV__ && console.error(e);
        }
      } else {
        return [];
      }
    }
  },
  async mounted() {
    const $this = this;
    $this.$on('did-show', () => {
      $this.$refs.metadataDetail.doLayout();
    });
    $this.loading = true;
    await $this.loadFlavors();
    await $this.initFlavors();
    $this.loading = false;
  },
  watch: {
    'incomingData.sourceId': {
      immediate: false,
      async handler(newValue) {
        this.init = false;
        await this.initFlavors();
      }
    },
    'incomingData.projectId': {
      immediate: true,
      async handler(newValue) {
        this.init = false;
        await this.loadFlavors();
        await this.initFlavors();
      }
    },
    'incomingData.hotplug': {
      immediate: false,
      handler(newValue) {
        this.init = false;
        this.initFlavors();
      }
    },
    'incomingData.az': {
      immediate: true,
      async handler(newValue) {
        const $this = this;
        if ($this.incomingData.host !== '') {
          $this.gpuHosts = [$this.incomingData.host];
        } else {
          $this.gpuHosts = await $this.getHostsByAZ(newValue);
        }
      }
    },
    'incomingData.host': {
      immediate: true,
      async handler(newValue) {
        const $this = this;
        if (newValue !== '') {
          $this.gpuHosts = [newValue];
        } else {
          $this.gpuHosts = await $this.getHostsByAZ($this.incomingData.az);
        }
      }
    },
    bootFromVolume: {
      immediate: false,
      handler(newValue, oldValue) {
        this.init = false;
        this.initFlavors();
        if (newValue === false) { // 切换到非云硬盘启动时，需要将disk重新赋值
          if (this.formData.disk === 0) {
            const availableDisks = this.flavors.filter(item => item.vcpus === this.formData.vcpus &&
                                                               item.ram === this.formData.ram &&
                                                               item.available === true)
                                               .map(item => item.disk);
            this.formData.disk = _.min(availableDisks);
          }
        }
        this.handleDiskChanged(this.formData.disk);
      }
    }
  },
  computed: {
    bootFromVolume() {
      if (this.incomingData.sourceType === 'volume') {
        return true;
      }
      if (this.incomingData.sourceType === 'volumeSnapshot') {
        return true;
      }
      if (this.incomingData.sourceType === 'backup') {
        return true;
      }
      if (this.incomingData.createNewVolume === true) {
        return true;
      }
      return false;
    }
  }
}
</script>

<style>

</style>
