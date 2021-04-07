<template>
  <div>
    <el2-dialog
      :visible="true"
      :before-close="handleBeforeClose"
      :append-to-body="true"
      :close-on-click-modal="false"
      :title="$t('calcStorLang.CPU_PIN_EDIT')"
      width="600px">
      <el-form :model="formData" ref="form" label-width="100px" label-position="right">
        <el-form-item :label="$t('calcStorLang.CPU_PIN_VCPU')" prop="vcpu">
          <span>CPU{{ formData.vcpu }}</span>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.CPU_PIN_PCPU')" prop="pcpu">
          <div v-loading="loading">
            <el-tree
              default-expand-all
              node-key="id"
              :data="pcpuTree"
              :render-content="renderContent"
              :default-checked-keys="[pcpu]"
              @node-click="handleTreeNodeClicked"
            />
            {{ $t('calcStorLang.CPU_PIN_UNPIN_TIPS') }}
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="close()">{{ $t('base.cancel') }}</el-button>
        <el-button type="primary" @click="submit" :disabled="!dirty">{{ $t('base.confirm') }}</el-button>
      </span>
    </el2-dialog>
  </div>
</template>

<script>
export default {
  name: 'EditPinCPU',
  props: {
    instance: {
      type: Object,
      default: () => {}
    },
    vcpu: {
      type: Number,
      default: -1
    },
    pcpu: {
      type: Number,
      default: -1
    },
    excludePcpus: { // 筛选时要进一步去除的PCPU
      type: Array,
      default: () => {}
    },
    includePcpus: { // 筛选时要进一步保留的PCPU
      type: Array,
      default: () => {}
    }
  },
  data() {
    return {
      loading: false,
      formData: {
        vcpu: -1,
        pcpu: -1,
        node: -1,
        mode: 'Engrossed-pinning'
      },
      allPCPUs: [],
      pcpuTree: []
    };
  },
  methods: {
    handleBeforeClose(done) {
      done();
      this.close();
    },
    close(done) {
      this.$emit('close');
    },
    renderContent(h, { node, data, store }) {
      if (!node.isLeaf) {
        return h('span', node.label);
      } else {
        return h('span', [
          h('el-checkbox', {
            style: {
              marginRight: '5px',
              pointerEvents: 'none'
            },
            attrs: {
              value: node.checked
            }
          }),
          h('span', node.label)
        ]);
      }
    },
    handleTreeNodeClicked(data, node, el) {
      const $this = this;
      if (node.isLeaf) {
        node.parent.parent.childNodes.forEach(p => {
          p.childNodes.forEach(c => {
            if (c !== node) {
              c.checked = false;
            } else {
              c.checked = !c.checked;
              $this.formData.pcpu = c.checked ? data.id : -1;
              $this.formData.node = c.checked ? data.node : -1;
            }
          });
        });
      }
    },
    async loadPCPUs() {
      const $this = this;
      $this.loading = true;
      try {
        let res = await this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/os-hypervisors-inspur/${$this.instance['OS-EXT-SRV-ATTR:hypervisor_hostname']}/get_host_numainfo`
        });
        $this.allPCPUs = [];
        let usedPCPUs = [];
        if ($this.formData.mode === 'Engrossed-pinning') {
          usedPCPUs = await $this.loadUsedPCPUs();
        }
        let pcpuTree = [];
        res.numa_info.forEach((numaNode, index) => {
          let children = numaNode.split(' ').map(pcpu => {
            return {
              id: parseInt(pcpu),
              node: index,
              label: 'CPU'+pcpu
            };
          });
          $this.allPCPUs = $this.allPCPUs.concat(children);
          children = children.filter(item => {
            const pcpu = item.id;
            if (pcpu === $this.pcpu) {
              return true;
            }
            if ($this.includePcpus.includes(pcpu)) {
              return true;
            }
            if ($this.excludePcpus.includes(pcpu)) {
              return false;
            }
            if (usedPCPUs.includes(pcpu)) {
              return false;
            }
            return true;
          });
          if (children.length > 0) {
            pcpuTree.push({
              id: 'Node'+index,
              label: 'Node'+index,
              children: children
            });
          }
        });
        $this.pcpuTree = pcpuTree;
        $this.loading = false;
      } catch (e) {
        $this.loading = false;
        __DEV__ && console.error(e);
      }
    },
    async loadUsedPCPUs() {
      const $this = this;
      try {
        let res = await this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/os-get-host-usedcpu`
        });
        return res;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async submit() {
      const $this = this;
      try {
        $this.$emit('submit', $this.formData);
        $this.close();
      } catch (e) {
        __DEV__ && console.error(e);
      }
    }
  },
  async mounted() {
    const $this = this;
    $this.formData.vcpu = $this.vcpu;
    $this.formData.pcpu = $this.pcpu;
    await $this.loadPCPUs();
  },
  computed: {
    dirty() {
      return this.pcpu !== this.formData.pcpu;
    }
  },
  watch: {
    'formData.mode'() {
      this.loadPCPUs();
    }
  }
};
</script>

<style scoped>
</style>
