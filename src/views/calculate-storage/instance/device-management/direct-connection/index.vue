<template>
  <div>
    <el-form label-position="right" label-width="120px">
      <el-form-item :label="$t('calcStorLang.DIRECT_CONNECT_DISK')">
        <el-select v-model="formData.addr">
          <el-option-group :label="$t('calcStorLang.DIRECT_CONNECT_SCSI_DISKS')" v-if="scsiDisks.length > 0">
            <el-option v-for="(item, index) in scsiDisks" :key="index" :value="item.addr" :label="item.name+' ('+item.addr+')'" />
          </el-option-group>
          <el-option-group :label="$t('calcStorLang.DIRECT_CONNECT_NVME_DISKS')" v-if="nvmeDisks.length > 0">
            <el-option v-for="(item, index) in nvmeDisks" :key="index" :value="item.addr" :label="item.name+' ('+item.addr+')'" />
          </el-option-group>
        </el-select>
        <el-button type="primary" icon="fa-plus" size="small" @click="attach" :disabled="formData.addr === ''" :loading="attaching">{{ $t('calcStorLang.DIRECT_CONNECT_ATTACH') }}</el-button>
        <el-tooltip placement="right" trigger="hover">
          <div slot="content" v-html="$t('calcStorLang.DIRECT_CONNECT_NVME_DISKS_ATTACH_TIPS')" />
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.DIRECT_CONNECT_CONNETCED_DISK')">
        <el-table :data="instanceAttachedDisks">
          <el-table-column v-if="checkedColumns.includes('name')" :label="$t('calcStorLang.DIRECT_CONNECT_NAME')" prop="name" />
          <el-table-column v-if="checkedColumns.includes('type')" :label="$t('calcStorLang.DIRECT_CONNECT_DISK_TYPE')" prop="type" />
          <el-table-column v-if="checkedColumns.includes('addr')" :label="$t('calcStorLang.DIRECT_CONNECT_ADDR')" prop="addr" />
          <el-table-column v-if="checkedColumns.includes('action')" :label="$t('calcStorLang.DIRECT_CONNECT_ACTION')">
            <template slot-scope="scope">
              <detach-button :instance="instance" :disk="scope.row" @refresh="loadData" />
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 10px;">
          <icos-column-selector name="DirectConnectDisk" @refresh="loadData" @column-checked="handleColumnChecked" :columns="[{
            prop: 'name',
            label: $t('calcStorLang.DIRECT_CONNECT_NAME'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'type',
            label: $t('calcStorLang.DIRECT_CONNECT_DISK_TYPE'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'addr',
            label: $t('calcStorLang.DIRECT_CONNECT_ADDR'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'action',
            label: $t('calcStorLang.DIRECT_CONNECT_ACTION'),
            visible: true,
            defaultChecked: true
          }]" />
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import DetachButton from './DetachButton';
export default {
  name: 'DirectConnection',
  props: {
    instance: {
      type: Object,
      default: {}
    }
  },
  components: {
    DetachButton
  },
  data() {
    return {
      loading: false,
      instanceAttachedDisks: [],
      hostAttachedDisks: [],
      scsiDisks: [],
      nvmeDisks: [],
      attaching: false,
      formData: {
        addr: ''
      },
      checkedColumns: []
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    async loadData() {
      Promise.all([
        this.loadInstanceAttachedDisks(),
        this.loadHostAttachedDisks()
      ]).then(res => {
        this.loadSCSIDisks();
        this.loadNVMEDisks();
      });
    },
    /**
     * 获取当前虚拟机已挂载的直通盘
     */
    async loadInstanceAttachedDisks() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/os-inspur-passthrus`,
          showErrMsg: true
        });
        let instanceAttachedDisks = $this.instance.id in res ? res[$this.instance.id] : [];
        instanceAttachedDisks.forEach(item => {
          item.connection_info = JSON.parse(item.connection_info);
          if (item.connection_info.driver_volume_type === 'passthru_mapping' || item.connection_info.driver_volume_type === 'passthru_scsi') {
            item.type = 'scsi';
            item.addr = item.connection_info.passthru_disk_id;
          } else if (item.connection_info.driver_volume_type === 'passthru_nvme') {
            item.type = 'nvme';
            item.addr = item.connection_info.passthru_quad;
          }
          item.name = item.volume_name.split(':')[1];
        });
        $this.instanceAttachedDisks = instanceAttachedDisks;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    /**
     * 获取当前虚拟机所在主机所有挂载的直通盘
     */
    async loadHostAttachedDisks() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'post',
          url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/action`,
          data: JSON.stringify({
            passthruPoll: null
          }),
          showErrMsg: true
        });
        let hostAttachedDisks = 'passthru' in res ? res.passthru : [];
        hostAttachedDisks.forEach(item => {
          item.connection_info = JSON.parse(item.connection_info);
          if (item.connection_info.driver_volume_type === 'passthru_mapping' || item.connection_info.driver_volume_type === 'passthru_scsi') {
            item.type = 'scsi';
            item.addr = item.connection_info.passthru_disk_id;
          } else if (item.connection_info.driver_volume_type === 'passthru_nvme') {
            item.type = 'nvme';
            item.addr = item.connection_info.passthru_quad;
          }
          item.name = item.volume_name.split(':')[1];
        });
        $this.hostAttachedDisks = hostAttachedDisks;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    /**
     * 获取当前虚拟机所在主机所有的scsi盘
     */
    async loadSCSIDisks() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'post',
          url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/action`,
          data: JSON.stringify({
            listHostDisk: 'scsi'
          })
        });
        let scsiDisks = res.disks.filter(item => !$this.hostAttachedDisks.map(disk => disk.addr).includes(item.addr));
        scsiDisks = scsiDisks.filter(item => /^sd[a-z]{1,2}$/.test(item.name));
        scsiDisks.forEach(item => {
          item['type'] = 'scsi';
        });
        $this.scsiDisks = scsiDisks;
        $this.formData.addr = '';
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    /**
     * 获取当前虚拟机所在主机所有的nvme盘
     */
    async loadNVMEDisks() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'post',
          url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/action`,
          data: JSON.stringify({
            listHostDisk: 'nvme'
          })
        });
        let nvmeDisks = res.disks.filter(item => item !== null);
        nvmeDisks = nvmeDisks.filter(item => !$this.hostAttachedDisks.map(disk => disk.addr).includes(item.addr));
        nvmeDisks.forEach(item => {
          item['type'] = 'nvme';
        });
        $this.nvmeDisks = nvmeDisks;
        $this.formData.addr = '';
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async attach() {
      const $this = this;
      const disk = $this.scsiDisks.find(item => item.addr === $this.formData.addr) || $this.nvmeDisks.find(item => item.addr === $this.formData.addr);
      if (disk) {
        $this.attaching = true;
        try {
          let data = {};
          if (disk.type === 'scsi') {
            data = {
              passthruAttach: {
                scsi: {
                  addr: disk.addr,
                  name: disk.name,
                  quad: disk.quad
                }
              }
            };
          }
          if (disk.type === 'nvme') {
            data = {
              passthruAttach: {
                nvme: {
                  addr: disk.addr,
                  name: disk.name
                }
              }
            };
          }
          const res = await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/action`,
            data: JSON.stringify(data),
            log: {
              description: {
                en: `Attach Direct Connect Disk (Insntace: ${$this.instance.name} UUID: ${$this.instance.id} Addr: ${disk.addr} Name: ${disk.volume_name})`,
                zh_cn: `挂载直通盘 （云主机：${$this.instance.name} UUID：${$this.instance.id} 地址：${disk.addr} 盘名：${disk.volume_name}）`
              },
              target: Vue.logTarget.computeInstance,
              errorKey: 'NeutronError'
            }
          });
          $this.$message.success($this.$t('calcStorLang.DIRECT_CONNECT_ATTACH_SUCCESS'));
          setTimeout(() => {
            $this.loadData();
            $this.attaching = false;
          }, 5000);
        } catch (e) {
          __DEV__ && console.error(e);
          $this.attaching = false;
        }
      }
    }
  }
}
</script>

<style>

</style>