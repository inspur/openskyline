<template>
  <div>
    <el2-dialog
      :before-close="handleBeforeClose"
      :title="roleType !== '3' ? $t('calcStorLang.NG_CREATE_INSTANCE') : $t('calcStorLang.NG_CREATE_INSTANCE_APPLY')"
      :visible="true"
      :close-on-click-modal="false"
      width="1300px"
      custom-class="ng-create-instance">
      <el-row>
        <el-col :span="18">
          <el-steps
            :active="currentStep - 1"
            :center="true"
            finish-status="success"
            style="margin-bottom: 20px; padding: 20px;">
            <el-step :title="$t('calcStorLang.NG_CREATE_INSTANCE_STEP_SOURCE')" />
            <el-step :title="$t('calcStorLang.NG_CREATE_INSTANCE_STEP_BASIC')" />
            <el-step :title="$t('calcStorLang.NG_CREATE_INSTANCE_STEP_FLAVOR')" />
            <el-step :title="$t('calcStorLang.NG_CREATE_INSTANCE_STEP_NETWORK')" />
            <el-step :title="$t('calcStorLang.NG_CREATE_INSTANCE_STEP_ADDTION')" />
          </el-steps>
          <step-source
            v-show="currentStep === 1"
            ref="stepSource"
            :incoming-data="formData"
            @project-id-change="handleProjectIdChanged"
            @close="handleClose()"
            @next="handleNext" />
          <step-basic
            v-show="currentStep === 2"
            ref="stepBasic"
            :incoming-data="formData"
            :quota="quota"
            @close="handleClose()"
            @prev="handlePrev"
            @next="handleNext" />
          <step-flavor
            v-show="currentStep === 3"
            ref="stepFlavor"
            :incoming-data="formData"
            @close="handleClose()"
            @prev="handlePrev"
            @next="handleNext" />
          <step-network
            v-show="currentStep === 4"
            ref="stepNetwork"
            :incoming-data="formData"
            @close="handleClose()"
            @prev="handlePrev"
            @next="handleNext"
            @submit="handleSubmit" />
          <step-addition
            v-show="currentStep === 5"
            ref="stepAddition"
            :incoming-data="formData"
            @close="handleClose()"
            @prev="handlePrev"
            @submit="handleSubmit" />
        </el-col>
        <el-col :span="6" class="ng-create-instance-detail">
          <div>
            {{ $t('calcStorLang.NG_CREATE_INSTANCE_DETAIL') }}
            <table class="table table-content table-hover idatatable" style="width: 100%;" border="1">
              <tr>
                <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_TYPE') }}</th>
                <td class="idatatd" v-if="formData.sourceType === 'image'">{{ $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_TYPE_IMAGE') }}</td>
                <td class="idatatd" v-if="formData.sourceType === 'volume'">{{ $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_TYPE_VOLUME') }}</td>
                <td class="idatatd" v-if="formData.sourceType === 'volumeSnapshot'">{{ $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_TYPE_VOLUME_SNAPSHOT') }}</td>
                <td class="idatatd" v-if="formData.sourceType === 'snapshot'">{{ $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_TYPE_SNAPSHOT') }}</td>
                <td class="idatatd" v-if="formData.sourceType === 'backup'">{{ $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_TYPE_INSTANCE_BACKUP') }}</td>
              </tr>
              <tr>
                <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_NAME') }}</th>
                <td class="idatatd">{{ formData.sourceName }}</td>
              </tr>
              <tr>
                <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_NAME') }}</th>
                <td class="idatatd">
                  <span v-if="formData.name === ''">-</span>
                  <span v-else>{{ formData.name }}</span>
                </td>
              </tr>
              <tr>
                <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_FLAVOR_CPU') }}</th>
                <td class="idatatd">
                  <span v-if="formData.vcpus === 0">- {{ $t('calcStorLang.NG_CREATE_INSTANCE_FLAVOR_CORES') }}</span>
                  <span v-else>{{ formData.vcpus }} {{ $t('calcStorLang.NG_CREATE_INSTANCE_FLAVOR_CORES') }}</span>
                </td>
              </tr>
              <tr>
                <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_FLAVOR_RAM') }}</th>
                <td class="idatatd">
                  <span v-if="formData.ram === 0">- GB</span>
                  <span v-else>{{ formData.ram / 1024 }} GB</span>
                </td>
              </tr>
              <tr>
                <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_FLAVOR_DISK') }}</th>
                <td class="idatatd">
                  <span v-if="formData.sourceType === 'volume' || formData.sourceType === 'volumeSnapshot' || formData.sourceType === 'backup'">{{ formData.sourceSize }} GB</span>
                  <span v-else-if="formData.createNewVolume">{{ formData.newVolumeSize }} GB</span>
                  <span v-else-if="formData.disk !== 0">{{ formData.disk }} GB</span>
                  <span v-else>- GB</span>
                </td>
              </tr>
              <tr>
                <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_AMOUNT') }}</th>
                <td class="idatatd">{{ formData.amount }}</td>
              </tr>
            </table>
            <br>
            {{ $t('calcStorLang.NG_CREATE_INSTANCE_QUOTA') }}
            <table class="table table-content table-hover idatatable" style="width: 100%;" border="1" v-loading="quota.loading">
              <tr>
                <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_QUOTA_INSTANCE') }}</th>
                <td class="idatatd">{{ quota.instances.used }}/{{ quota.instances.limit | quotaLimit }}</td>
              </tr>
              <tr>
                <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_QUOTA_CORES') }}</th>
                <td class="idatatd">{{ quota.cores.used }}/{{ quota.cores.limit | quotaLimit }}</td>
              </tr>
              <tr>
                <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_QUOTA_RAM') }}</th>
                <td class="idatatd">{{ quota.ram.used / 1024 }}/{{ quota.ram.limit / 1024 | quotaLimit }}</td>
              </tr>
              <tr>
                <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_QUOTA_PORT') }}</th>
                <td class="idatatd">{{ quota.port.used }}/{{ quota.port.limit | quotaLimit }}</td>
              </tr>
              <tr>
                <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_QUOTA_VOLUME') }}</th>
                <td class="idatatd">{{ quota.volumes.used }}/{{ quota.volumes.limit | quotaLimit }}</td>
              </tr>
              <tr>
                <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_QUOTA_GIGABYTES') }}</th>
                <td class="idatatd">{{ quota.gigabytes.used }}/{{ quota.gigabytes.limit | quotaLimit }}</td>
              </tr>
            </table>
          </div>
        </el-col>
      </el-row>
    </el2-dialog>
  </div>
</template>

<script>
import StepSource from './StepSource';
import StepBasic from './StepBasic';
import StepFlavor from './StepFlavor';
import StepNetwork from './StepNetwork';
import StepAddition from './StepAddition';
export default {
  name: 'NGCreateInstance',
  props: {
    presetData: {
      type: Object,
      default: () => {}
    }
  },
  components: { StepSource, StepBasic, StepFlavor, StepNetwork, StepAddition },
  data() {
    return {
      roleType: String(Vue.roleType),
      currentStep: 1,
      formData: {
        projectIdLocked: false,
        projectId: '',
        projectName: '',
        userId: '',
        userName: '',
        canSelectSource: true,
        sourceType: 'image',
        sourceId: '',
        sourceName: '',
        sourceOSDistro: '',
        sourceMinRam: 0,
        sourceMinDisk: 0,
        sourceImageFormat: '',
        sourceSize: 0,
        sourceVirtualSize: 0,
        createNewVolume: true,
        newVolumeType: '',
        newVolumeName: '',
        newVolumeSize: 100,
        volumeDeleteOnTermination: false,
        inspurDiskBus: '',
        hotplug: false,
        loginType: 1,
        keyPair: '',
        password: '',
        confirmPassword: '',
        name: '',
        description: '',
        az: '',
        host: '',
        amount: 1,
        vcpus: 0,
        ram: 0,
        disk: 0,
        diskVisible: true,
        flavorId: '',
        gpuProfileName: '',
        networkType: 'network',
        networks: [],
        ports: [],
        networkStrategyTemplate: {},
        safeGroups: [],
        qos: [],
        serverGroup: '',
        panicStrategy: '',
        cpuMode: 'host-model',
        cpuModel: '',
        vncPassword: '',
        confirmVNCPassword: '',
        userData: ''
      },
      quota: {
        loading: false,
        instances: {
          limit: -1,
          used: 0,
          remain: 0
        },
        cores: {
          limit: -1,
          used: 0,
          remain: 0
        },
        ram: {
          limit: -1,
          used: 0,
          remain: 0
        },
        volumes: {
          limit: -1,
          used: 0,
          remain: 0
        },
        gigabytes: {
          limit: -1,
          used: 0,
          remain: 0
        },
        port: {
          limit: -1,
          used: 0,
          remain: 0
        }
      }
    };
  },
  methods: {
    handleBeforeClose(done) {
      const $this = this;
      done();
      $this.handleClose();
    },
    handleNext(formData) {
      const $this = this;
      Object.assign($this.formData, formData);
      $this.currentStep = $this.currentStep + 1;
    },
    handlePrev(formData) {
      const $this = this;
      if ($this.currentStep === 5) {  // 第五步在点击“上一步”时，需要将数据合并，以确保在第四步点击“提交”时数据无误
        Object.assign($this.formData, formData);
      }
      $this.currentStep = $this.currentStep - 1;
    },
    handleClose() {
      const $this = this;
      $this.$emit('close');
    },
    async handleSubmit(formData) {
      const $this = this;
      Object.assign($this.formData, formData);
      $this.checkQuotaAndSave();
    },
    handleProjectIdChanged(projectId) {
      this.formData.projectId = projectId;
    },
    async loadNovaQuotas() {
      const $this = this;
      const result = await $this.$ajax({
        type: 'get',
        url: `api/nova/v2/os-quota-sets/${$this.formData.projectId}/detail`
      });
      $this.quota.instances.limit = result.quota_set.instances.limit;
      $this.quota.instances.used = result.quota_set.instances.in_use;
      $this.quota.instances.remain = $this.quota.instances.limit !== -1 ? $this.quota.instances.limit - $this.quota.instances.used : -1;
      $this.quota.cores.limit = result.quota_set.cores.limit;
      $this.quota.cores.used = result.quota_set.cores.in_use;
      $this.quota.cores.remain = $this.quota.cores.limit !== -1 ? $this.quota.cores.limit - $this.quota.cores.used : -1;
      $this.quota.ram.limit = result.quota_set.ram.limit;
      $this.quota.ram.used = result.quota_set.ram.in_use;
      $this.quota.ram.remain = $this.quota.ram.limit !== -1 ? $this.quota.ram.limit - $this.quota.ram.used : -1;
      return result;
    },
    async loadCinderV2Quotas() {
      const $this = this;
      const result = await $this.$ajax({
        type: 'get',
        url: `api/cinderv2/v3/${$this.$cookie.get('pid')}/os-quota-sets/${$this.formData.projectId}?usage=true`
      });
      $this.quota.volumes.limit = result.quota_set.volumes.limit;
      $this.quota.volumes.used = result.quota_set.volumes.in_use;
      $this.quota.volumes.remain = $this.quota.volumes.limit !== -1 ? $this.quota.volumes.limit - $this.quota.volumes.used : -1;
      $this.quota.gigabytes.limit = result.quota_set.gigabytes.limit;
      $this.quota.gigabytes.used = result.quota_set.gigabytes.in_use;
      $this.quota.gigabytes.remain = $this.quota.gigabytes.limit !== -1 ? $this.quota.gigabytes.limit - $this.quota.gigabytes.used : -1;
      return result;
    },
    async loadNeutronQuotas() {
      const $this = this;
      const result = await $this.$ajax({
        type: 'get',
        url: `api/neutron/v2.0/quotas/${$this.formData.projectId}/details.json`
      });
      $this.quota.port.limit = result.quota.port.limit;
      $this.quota.port.used = result.quota.port.used;
      $this.quota.port.remain = $this.quota.port.limit !== -1 ? $this.quota.port.limit - $this.quota.port.used : -1;
      return result;
    },
    async loadQuota() {
      const $this = this;
      $this.quota.loading = true;
      Promise.all([
        $this.loadNovaQuotas(),
        $this.loadCinderV2Quotas(),
        $this.loadNeutronQuotas()
      ]).then(res => {
        $this.quota.loading = false;
      }).catch(e => {
        $this.quota.loading = false;
      });
    },
    async checkQuotaAndSave() {
      const $this = this;
      let instances = $this.formData.amount;
      let cores = $this.formData.amount * $this.formData.vcpus;
      let ram = $this.formData.amount * $this.formData.ram;
      let port = 0;
      if ($this.formData.networkType === 'network') {
        port = $this.formData.amount * $this.formData.networks.length;
      } else if ($this.formData.networkType === 'template') {
        port = $this.formData.amount;
      }
      let volumes = 0;
      let gigabytes = 0;
      if ($this.formData.createNewVolume === true) {
        volumes = $this.formData.amount;
        gigabytes = $this.formData.amount * parseInt($this.formData.newVolumeSize);
      }
      if ($this.quota.instances.limit !== -1 && $this.quota.instances.remain < instances) {
        $this.$message.error($this.$t('calcStorLang.NG_CREATE_INSTANCE_QUOTA_INSTANCE_TIPS'));
        $this.$refs.stepNetwork.$emit('save-error');
        $this.$refs.stepAddition.$emit('save-error');
        return false;
      } else if ($this.quota.cores.limit !== -1 && $this.quota.cores.remain < cores) {
        $this.$message.error($this.$t('calcStorLang.NG_CREATE_INSTANCE_QUOTA_CORES_TIPS'));
        $this.$refs.stepNetwork.$emit('save-error');
        $this.$refs.stepAddition.$emit('save-error');
        return false;
      } else if ($this.quota.ram.limit !== -1 && $this.quota.ram.remain < ram) {
        $this.$message.error($this.$t('calcStorLang.NG_CREATE_INSTANCE_QUOTA_RAM_TIPS'));
        $this.$refs.stepNetwork.$emit('save-error');
        $this.$refs.stepAddition.$emit('save-error');
        return false;
      } else if ($this.quota.port.limit !== -1 && $this.quota.port.remain < port) {
        $this.$message.error($this.$t('calcStorLang.NG_CREATE_INSTANCE_QUOTA_PORT_TIPS'));
        $this.$refs.stepNetwork.$emit('save-error');
        $this.$refs.stepAddition.$emit('save-error');
        return false;
      } else if ($this.quota.volumes.limit !== -1 && $this.quota.volumes.remain < volumes) {
        $this.$message.error($this.$t('calcStorLang.NG_CREATE_INSTANCE_QUOTA_VOLUME_TIPS'));
        $this.$refs.stepNetwork.$emit('save-error');
        $this.$refs.stepAddition.$emit('save-error');
        return false;
      } else if ($this.quota.gigabytes.limit !== -1 && $this.quota.gigabytes.remain < gigabytes) {
        $this.$message.error($this.$t('calcStorLang.NG_CREATE_INSTANCE_QUOTA_GIGABYTES_TIPS'));
        $this.$refs.stepNetwork.$emit('save-error');
        $this.$refs.stepAddition.$emit('save-error');
        return false;
      }
      await $this.save();
    },
    async save() {
      const $this = this;
      let body = {
        server: {
          // projectId: $this.formData.projectId,
          // userId: $this.formData.userId,
          name: $this.formData.name,
          description: $this.formData.description,
          min_count: 1,
          max_count: String($this.formData.amount),
          tags: $this.formData.hotplug === true ? ['HOTPLUG'] : [],
          imageRef: '',
          flavorRef: $this.formData.flavorId,
          availability_zone: $this.formData.az + ($this.formData.host === '' ? '' : `::${$this.formData.host}`),
          metadata: {
            panic: $this.formData.panicStrategy
          }
        }
      };
      // if ($this.formData.inspurDiskBus !== '') {
      //   body.server.metadata.inspur_disk_bus = $this.formData.inspurDiskBus;
      // }
      // if ($this.formData.cpuMode !== '') {
      //   body.server.metadata.cpu_mode = $this.formData.cpuMode;
      // }
      // if ($this.formData.cpuMode === 'custom') {
      //   body.server.metadata.cpu_model = $this.formData.cpuModel;
      // }
      // 来源及云硬盘
      let deviceName = 'vda';
      if ($this.formData.inspurDiskBus === 'scsi') {
        deviceName = 'sda';
      }
      if ($this.formData.inspurDiskBus === 'ide') {
        deviceName = 'hda';
      }
      if ($this.formData.sourceType === 'image') {
        if (!$this.formData.createNewVolume) {
          body.server.imageRef = $this.formData.sourceId;
        } else {
          let volumeList = [{
            boot_index: 0,
            uuid: $this.formData.sourceId,
            source_type: 'image',
            device_name: deviceName,
            volume_type: $this.formData.newVolumeType,
            volume_size: $this.formData.newVolumeSize,
            destination_type: 'volume',
            delete_on_termination: $this.formData.volumeDeleteOnTermination
          }];
          if ($this.formData.newVolumeName !== '') {
            volumeList[0].volume_name = $this.formData.newVolumeName;
          }
          body.server['block_device_mapping_v2'] = volumeList;
          body.server['OS-DCF:diskConfig'] = 'AUTO';
        }
      } else if ($this.formData.sourceType === 'volume') {
        let volumeList = [{
          volume_id: $this.formData.sourceId,
          device_name: deviceName,
          delete_on_termination: $this.formData.volumeDeleteOnTermination
        }];
        body.server['block_device_mapping'] = volumeList;
        body.server['OS-DCF:diskConfig'] = 'AUTO';
      } else if ($this.formData.sourceType === 'volumeSnapshot') {
        let volumeList = [{
          snapshot_id: $this.formData.sourceId,
          device_name: deviceName,
          delete_on_termination: $this.formData.volumeDeleteOnTermination
        }];
        body.server['block_device_mapping'] = volumeList;
        body.server['OS-DCF:diskConfig'] = 'AUTO';
      } else if ($this.formData.sourceType === 'snapshot') {
        if (!$this.formData.createNewVolume) {
          body.server.imageRef = $this.formData.sourceId;
        } else {
          let volumeList = [{
            boot_index: 0,
            uuid: $this.formData.sourceId,
            source_type: 'image',
            device_name: deviceName,
            volume_type: $this.formData.newVolumeType,
            volume_size: $this.formData.newVolumeSize,
            destination_type: 'volume',
            delete_on_termination: $this.formData.volumeDeleteOnTermination
          }];
          if ($this.formData.newVolumeName !== '') {
            volumeList[0].volume_name = $this.formData.newVolumeName;
          }
          body.server['block_device_mapping_v2'] = volumeList;
          body.server['OS-DCF:diskConfig'] = 'AUTO';
        }
      } else if ($this.formData.sourceType === 'backup') {
        body.server.backupRef = $this.formData.sourceId;
      }
      if ($this.formData.loginType === 2) {
        body.server.key_name = $this.formData.keyPair;
      } else if ($this.formData.loginType === 3) {
        body.server.adminPass = $this.formData.password;
      }
      // 基础
      if ($this.formData.host !== '') {
        body['OS-SCH-HNT:scheduler_hints'] = {
          _nova_check_type: true
        };
      }
      // 加速器
      // if ($this.formData.gpuProfileName !== '') {
      //   body.server['dp_name'] = $this.formData.gpuProfileName;
      // }
      // 网络
      if ($this.formData.networkType === 'network') {
        let networks = [];
        $this.formData.networks.forEach(item => {
          let network = {
          };
          if (item.fixedSubNetId !== '') {
            network.subnet_id = item.fixedSubNetId;
          } else {
            network.uuid = item.id;
          }
          if (item.fixedIP !== '') {
            network.fixed_ip = item.fixedIP;
          }
          if (item.fixedMAC !== '') {
            network.fixed_mac = item.fixedMAC;
          }
          networks.push(network);
        });
        body.server.networks = networks;
        body.server.security_groups = $this.formData.safeGroups.map(item => {
          return {
            name: item.id
          };
        });
      } else if ($this.formData.networkType === 'port') {
        let ports = [];
        $this.formData.ports.forEach(item => {
          ports.push({
            port: item.id
          });
        });
        body.server.networks = ports;
        body.server.security_groups = $this.formData.safeGroups.map(item => {
          return {
            name: item.id
          };
        });
      } else if ($this.formData.networkType === 'template') {
        const template = $this.formData.networkStrategyTemplate;
        let network = {
          security_groups: template.security_groups
        };
        if (template.qos_policy_id !== null) {
          network.qos_policy_id = template.qos_policy_id;
        }
        if (template.subnet_id) {
          network.subnet_id = template.subnet_id;
        } else {
          network.uuid = template.network_id;
        }
        body.server.networks = [network];
        body.server.security_groups = [];
      }
      // VNC密码
      // if ($this.formData.vncPassword !== '') {
      //   body.server.metadata.vncpasswd = $this.formData.vncPassword;
      // }
      // 用户脚本
      // if ($this.formData.userData !== '') {
      //   body.server.user_data = btoa($this.formData.userData);
      // }
      // QoS
      // if ($this.formData.qos.length !== 0) {
      //   $this.formData.qos.forEach(item => {
      //     body.server.metadata[item.key] = item.value;
      //   });
      //   if ($this.formData.qos.find(item => item.key === 'cpu_quota')) {
      //     body.server.metadata['cpu_quota_max'] = '2200';
      //   }
      // }
      // 亲和性策略（服务器组）
      if ($this.formData.serverGroup !== '') {
        body['os:scheduler_hints'] = {
          group: $this.formData.serverGroup
        };
      }

      if ($this.roleType !== '3') {
        try {
          let logDescription = {
            en: `Create Instance(s) (Name: ${$this.formData.name}, Amount: ${$this.formData.amount})`,
            zh_cn: `创建云主机(云主机名：${$this.formData.name}，数量：${$this.formData.amount})`
          };
          if ($this.formData.sourceType === 'backup') {
            logDescription = {
              en: `Create Instance From Backup (Name: ${$this.formData.name}, Backup Name: ${$this.formData.sourceName}, Backup ID: ${$this.formData.sourceId})`,
              zh_cn: `通过云主机备份创建云主机(云主机名：${$this.formData.name}，备份名：${$this.formData.sourceName}，备份ID：${$this.formData.sourceId})`
            };
          }
          const res = await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers`,
            data: JSON.stringify(body),
            headers: {
              'X-OpenStack-Nova-API-Version': 2.67
            },
            log: {
              description: logDescription,
              target: Vue.logTarget.computeInstance
            }
          });
          $this.$message.success($this.$t('calcStorLang.NG_CREATE_INSTANCE_SUCCESSFULLY'));
          $this.$emit('refresh');
          $this.handleClose();
        } catch (e) {
          $this.$refs.stepNetwork.$emit('save-error');
          $this.$refs.stepAddition.$emit('save-error');
          __DEV__ && console.error(e);
        }
      } else {
        try {
          const res = await $this.$ajax({
            type: 'post',
            url: `api/leo/v1/order/create_order`,
            data: JSON.stringify({
              applicant_id: $this.formData.userId,
              op_desc: $this.formData.description,
              order_data: JSON.stringify(body),
              project_id: $this.formData.projectId,
              resource_type: 'VM.CREATE'
            }),
            headers: {
              'X-OpenStack-Nova-API-Version': 2.67
            },
            log: {
              description: {
                en: `Apply For Instance (Name: ${$this.formData.name}, Amount: ${$this.formData.amount})`,
                zh_cn: `申请云主机(云主机名：${$this.formData.name}，数量：${$this.formData.amount})`
              },
              target: Vue.logTarget.computeInstance
            }
          });
          $this.$message.success($this.$t('calcStorLang.NG_CREATE_INSTANCE_APPLY_SUCCESSFULLY'));
          $this.handleClose();
        } catch (e) {
          $this.$refs.stepNetwork.$emit('save-error');
          $this.$refs.stepAddition.$emit('save-error');
          __DEV__ && console.error(e);
        }
      }
    }
  },
  mounted() {
    const $this = this;
    Object.assign($this.formData, $this.presetData);
    $this.currentStep = 1;
  },
  filters: {
    quotaLimit(value) {
      if (value < 0) {
        return Vue.t('calcStorLang.NG_CREATE_INSTANCE_QUOTA_UNLIMIT');
      } else {
        return value;
      }
    }
  },
  watch: {
    'formData.projectId': {
      immediate: false,
      handler(newValue) {
        this.loadQuota();
      }
    },
    currentStep: {
      immediate: false,
      handler(newValue) {
        if (newValue === 1) {
          this.$refs.stepSource.$emit('did-show');
        }
        if (newValue === 2) {
          this.$refs.stepBasic.$emit('did-show');
        }
        if (newValue === 3) {
          this.$refs.stepFlavor.$emit('did-show');
        }
        if (newValue === 4) {
          this.$refs.stepNetwork.$emit('did-show');
        }
        if (newValue === 5) {
          this.$refs.stepAddition.$emit('did-show');
        }
      }
    }
  }
}
</script>
