<template>
  <el-dialog
    :title="$t('calcStorLang.VCPU_DETAIL')"
    :visible="true"
    :before-close="handleClose"
    size="middle"
    custom-class="vcpu-info-dialog"
  >
    <div v-loading="loading">
      <el-collapse :value="['1', '2', '3']" style="text-align:left">
        <el-collapse-item :title="$t('calcStorLang.VCPU_DETAIL_MAPPING')" name="1">
          <div class="table_panel" style="border: none;">
            <el-table :data="info.cpuPins">
              <el-table-column :label="$t('calcStorLang.CPU_PIN_VCPU')" prop="vcpu">
                <template slot-scope="scope">Node{{ scope.row.node }} - CPU{{ scope.row.vcpu }}</template>
              </el-table-column>
              <el-table-column :label="$t('calcStorLang.CPU_PIN_PCPU')" prop="pcpu">
                <template slot-scope="scope">
                  <span v-if="scope.row.pcpu !== -1">CPU{{ scope.row.pcpu }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-item>
        <el-collapse-item :title="$t('calcStorLang.VCPU_DETAIL_TOPO')" name="2">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">Cores:</th>
                  <td class="idatatd">{{ info.vcpu_topology.cores }}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">Threads:</th>
                  <td class="idatatd">{{ info.vcpu_topology.threads }}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">Sockets:</th>
                  <td class="idatatd">{{ info.vcpu_topology.sockets }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-collapse-item>
        <el-collapse-item :title="$t('calcStorLang.VCPU_DETAIL_MODEL')" name="3">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE') }} :</th>
                  <td class="idatatd">{{ vcpuMode(info.vcpu_model) }}</td>
                </tr>
                <tr class="even" v-if="info.vcpu_model === 'custom'">
                  <th class="idatath">{{ $t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODEL') }}: </th>
                  <td class="idatatd">{{ instance.metadata.cpu_model }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">{{$t('lang.cancel')}}</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'vm-vcpus',
  props: {
    instance: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loading: false,
      info: {
        cpuPins: [],
        vcpu_model: '',
        vcpu_topology: {
          cores: '',
          sockets: '',
          threads: ''
        }
      }
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    handleClose(done) {
      done();
      this.close();
    },
    async loadVCPUsInfo() {
      try {
        const $this = this;
        $this.loading = true;
        const res = await $this.$ajax({
          url: `api/nova/v2.1/servers/${$this.instance.id}/topology`,
          type: 'get',
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
        $this.info.cpuPins = JSON.parse(JSON.stringify(cpuPins));
        $this.info.vcpu_model = res.vcpu_model;
        if (res.vcpu_topology !== null) {
          $this.info.vcpu_topology.cores = res.vcpu_topology.cores;
          $this.info.vcpu_topology.sockets = res.vcpu_topology.sockets;
          $this.info.vcpu_topology.threads = res.vcpu_topology.threads;
        } else {
          $this.info.vcpu_topology.cores = '-';
          $this.info.vcpu_topology.sockets = '-';
          $this.info.vcpu_topology.threads = '-';
        }
        $this.loading = false;
      } catch (e) {
        $this.loading = false;
        __DEV__ && console.error(e);
      }
    },
    CPUPanningToArray(node) {
      return Object.keys(node.cpu_pinning).map(key => {
        return {
          vcpu: key,
          cpu: node.cpu_pinning[key]
        }
      });
    },
    vcpuMode(value) {
      switch (value) {
        case 'host-passthrough':
          return this.$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_HOST_PASSTHROUGH');
        case 'host-model':
          return this.$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_HOST_MODEL');
        case 'none':
          return this.$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_NONE');
        case null:
          return this.$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_NONE');
        case 'custom':
          return this.$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_CUSTOM');
        default:
          return value;
      }
    }
  },
  mounted() {
    const $this = this
    $this.loadVCPUsInfo();
  }
}
</script>

<style>
.vcpu-info-dialog .el-dialog__header {
  text-align: left;
}
</style>
