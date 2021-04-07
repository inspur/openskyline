<template>
  <div>
    <el2-dialog
      :before-close="handleBeforeClose"
      :title="$t('calcStorLang.CPU_PIN') + ' - ' + instance.name"
      :visible="true"
      :close-on-click-modal="false"
      width="800px">
      <div v-loading="loading">
        <el-table :data="formData.cpuPins">
          <el-table-column :label="$t('calcStorLang.CPU_PIN_VCPU')" prop="vcpu">
            <template slot-scope="scope">
              Node{{ scope.row.node }} - CPU{{ scope.row.vcpu }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.CPU_PIN_PCPU')" prop="pcpu">
            <template slot-scope="scope">
              <span v-if="scope.row.pcpu !== -1">
                <el-tag
                  @close="handleUnsetCPUPin(scope.row)"
                  :closable="true"
                  :close-transition="true">
                  CPU{{ scope.row.pcpu }}
                </el-tag>
              </span>
              <span v-else>
                -
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.CPU_PIN_ACTION')">
            <template slot-scope="scope">
              <el-button size="small" type="text" @click="showEditCPUPinDialog(scope.row)">{{ $t('calcStorLang.CPU_PIN_ACTION_EDIT') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 5px;" v-html="$t('calcStorLang.CPU_PIN_TIPS')" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" :disabled="!dirty" :loading="saving" @click="save">{{ $t('base.confirm') }}</el-button>
      </div>
    </el2-dialog>
    <edit-cpu-pin
      v-if="editCPUPinDialog.visible"
      :instance="editCPUPinDialog.instance"
      :vcpu="editCPUPinDialog.vcpu"
      :pcpu="editCPUPinDialog.pcpu"
      :exclude-pcpus="editCPUPinDialog.excludePcpus"
      :include-pcpus="editCPUPinDialog.includePcpus"
      @submit="handleEditCPUPinDialogSubmit"
      @close="editCPUPinDialog.visible = false"
    />
  </div>
</template>

<script>
import _ from 'underscore';
import EditCPUPin from './EditCPUPin';
export default {
  name: 'CPUPin',
  components: {
    'edit-cpu-pin': EditCPUPin
  },
  props: {
    instance: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loading: true,
      saving: false,
      cpuPins: [],
      formData: {
        cpuPins: [],
        maxCPU: 0
      },
      editCPUPinDialog: {
        visible: false,
        instance: {},
        vcpu: -1,
        pcpu: -1,
        excludePcpus: [],
        includePcpus: []
      }
    };
  },
  methods: {
    handleBeforeClose(done) {
      done();
      this.close();
    },
    close() {
      this.$emit('close');
    },
    showEditCPUPinDialog({ vcpu, pcpu=-1 }) {
      this.editCPUPinDialog.instance = this.instance;
      this.editCPUPinDialog.vcpu = vcpu;
      this.editCPUPinDialog.pcpu = pcpu;
      this.editCPUPinDialog.excludePcpus = this.formData.cpuPins.map(item => item.pcpu).filter(item => item !== -1);
      this.editCPUPinDialog.includePcpus = this.cpuPins.map(item => item.pcpu).filter(item => !this.editCPUPinDialog.excludePcpus.includes(item));
      this.editCPUPinDialog.visible = true;
    },
    async loadData() {
      const $this = this;
      $this.loading = true;
      Promise.all([
        $this.loadCPUTopology(),
        $this.loadPCPUs()
      ]).then((res) => {
        $this.loading = false;
      });
    },
    async loadPCPUs() {
      const $this = this;
      try {
        let res = await this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/os-hypervisors-inspur/${$this.instance['OS-EXT-SRV-ATTR:hypervisor_hostname']}/get_host_numainfo`
        });
        let allPCPUs = [];
        res.numa_info.forEach((numaNode, index) => {
          let children = numaNode.split(' ').map(pcpu => {
            return {
              id: parseInt(pcpu),
              node: index,
              label: 'CPU'+pcpu
            };
          });
          allPCPUs = allPCPUs.concat(children);
        });
        $this.formData.maxCPU = allPCPUs.length;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadCPUTopology() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers/${$this.instance.id}/topology`,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.78
          }
        });
        const cpuPins = [];
        const nodes = res.nodes;
        if (nodes.length === 0) { // 如果没有numa node信息，则根据虚拟机vcpus值循环出虚拟CPU
          const vcpuCount = $this.instance.vcpus;
          for (let i = 0; i < vcpuCount; i++) {
            cpuPins.push({
              vcpu: i,
              pcpu: -1,
              node: 0
            });
          }
        } else { // 如果有numa node信息
          if (JSON.stringify(nodes[0].cpu_pinning) === '{}') { // 如果没有钉选信息
            for (let i = 0; i < nodes.length; i++) {
              const node = nodes[i];
              node.vcpu_set.forEach(vcpu => {
                cpuPins.push({
                  vcpu: vcpu,
                  pcpu: -1,
                  node: node.host_node
                });
              });
            }
          } else { // 如果有钉选信息
            for (let i = 0; i < nodes.length; i++) {
              const node = nodes[i];
              for (let vcpu in node.cpu_pinning) {
                cpuPins.push({
                  vcpu: parseInt(vcpu),
                  pcpu: node.cpu_pinning[vcpu],
                  node: node.host_node
                });
              }
            }
          }
        }
        $this.cpuPins = JSON.parse(JSON.stringify(cpuPins));
        $this.formData.cpuPins = JSON.parse(JSON.stringify(cpuPins));
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    handleEditCPUPinDialogSubmit({ vcpu, pcpu }) {
      const $this = this;
      let cpuPin = $this.formData.cpuPins.find(item => item.vcpu === vcpu);
      if (cpuPin) {
        cpuPin.pcpu = pcpu;
      }
    },
    handleUnsetCPUPin(cpuPin) {
      cpuPin.pcpu = -1;
    },
    async setCPUPin(vcpus, pcpus, maxCPU) {
      const $this = this;
      const res = await $this.$ajax({
        type: 'put',
        url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/os-set-cpu-pin`,
        data: JSON.stringify({
          setcpupin: {
            vcpus: vcpus,
            pcpus: pcpus,
            max_cpu: maxCPU,
            mode: 'Engrossed-pinning'
          }
        }),
        log: {
          description: {
            en: `Instace (ID: ${$this.instance.id} Name: ${$this.instance.name}) Set CPU Pin.`,
            zh_cn: `云主机 (ID: ${$this.instance.id} 名称: ${$this.instance.name}) 设置CPU绑定。`
          },
          target: Vue.logTarget.computeInstance
        }
      });
    },
    async unsetCPUPin(vcpus, maxCPU) {
      const $this = this;
      const res = await $this.$ajax({
        type: 'put',
        url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/os-unset-cpu-pin`,
        data: JSON.stringify({
          unsetcpupin: {
            vcpus: vcpus,
            max_cpu: maxCPU
          }
        }),
        log: {
          description: {
            en: `Instace (ID: ${$this.instance.id} Name: ${$this.instance.name}) Unset CPU Pin.`,
            zh_cn: `云主机 (ID: ${$this.instance.id} 名称: ${$this.instance.name}) 解除CPU绑定。`
          },
          target: Vue.logTarget.computeInstance
        }
      });
    },
    async save() {
      const $this = this;
      let vcpus = $this.formData.cpuPins.map(item => item.vcpu);
      let pcpus = $this.formData.cpuPins.map(item => item.pcpu)
                                        .filter(item => item !== -1);
      if (pcpus.length === vcpus.length) {
        try {
          $this.saving = true;
          if ($this.cpuPins.map(item => item.pcpu).filter(item => item !== -1).length > 0) {
            await $this.unsetCPUPin(vcpus, $this.formData.maxCPU);
          }
          await $this.setCPUPin(vcpus, pcpus, $this.formData.maxCPU);
          $this.$message.success($this.$t('calcStorLang.CPU_PIN_SUCCESS'));
          $this.close();
        } catch (e) {
          $this.saving = false;
          __DEV__ && console.error(e);
        }
      } else if (pcpus.length === 0) {
        try {
          $this.saving = true;
          await $this.unsetCPUPin(vcpus, $this.formData.maxCPU);
          $this.$message.success($this.$t('calcStorLang.CPU_PIN_UNPIN_SUCCESS'));
          $this.close();
        } catch (e) {
          $this.saving = false;
          __DEV__ && console.error(e);
        }
      } else {
        $this.$message.error($this.$t('calcStorLang.CPU_PIN_PLEASE_ENSURE_EACH_PIN_OR_UNPIN'));
      }
    }
  },
  computed: {
    dirty() {
      return JSON.stringify(this.cpuPins) !== JSON.stringify(this.formData.cpuPins);
    }
  },
  mounted() {
    const $this = this;
    $this.loadData();
  }
}
</script>

<style scoped>
</style>

<style>
</style>
