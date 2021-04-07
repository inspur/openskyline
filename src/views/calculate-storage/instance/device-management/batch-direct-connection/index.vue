<template>
  <div>
    <el2-dialog
      :title="$t('calcStorLang.DEVICE_MANAGEMENT')"
      :visible="true"
      :modal-append-to-body="false"
      :before-close="handleBeforeClose"
      :close-on-click-modal="false"
      width="1000px">
      <el-alert v-if="$archIs('mips')" :title="$t('calcStorLang.DEVICE_MANAGEMENT_MIPS_TIPS')" :closable="false" style="margin-bottom: 5px; background-color: #d2dbe2; color: #666666;" />
      <el-tabs>
        <el-tab-pane :label="$t('calcStorLang.BATCH_DIRECT_CONNECT')" />
      </el-tabs>
      <div v-loading="loading">
        <host-container v-for="(host, index) in hosts" :key="index" :name="host.name">
          <instance-list>
            <instance-item
              v-for="(instance, instanceIndex) in host.instances"
              :key="instanceIndex"
              :name="instance.name"
              :show-drop-zone="overInstanceId === instance.id"
              @dragover.native="handleDragOver($event, host, instance)"
              @dragleave.native="overInstanceId = ''"
              @drop.native="handleDrop($event, host, instance)">
              <div>
                <disk
                  v-for="(disk, diskIndex) in instance.scsiDisks"
                  :key="diskIndex"
                  :name="disk.name"
                  :addr="disk.addr"
                  :draggable="true"
                  @dragstart.native="handleDragStart($event, host, instance, disk)"
                  @dragend.native="handleDragEnd($event)" />
              </div>
            </instance-item>
          </instance-list>
          <disk-zone>
            <disk-wrapper
              name="SCSI盘"
              :show-drop-zone="(overHostName === host.name && dragging.disk.type === 'scsi')"
              @dragover.native="handleDragOver($event, host, null)"
              @dragleave.native="overHostName = ''"
              @drop.native="handleDrop($event, host, null)">
              <disk
                v-for="(disk, diskIndex) in host.scsiDisks"
                :key="diskIndex"
                :name="disk.name"
                :addr="disk.addr"
                :draggable="true"
                @dragstart.native="handleDragStart($event, host, null, disk)"
                @dragend.native="handleDragEnd($event)" />
            </disk-wrapper>
          </disk-zone>
        </host-container>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">{{ $t('lang.close') }}</el-button>
        <el-button type="primary" @click="save" :loading="saving">{{ $t('lang.confirm') }}</el-button>
      </div>
    </el2-dialog>
  </div>
</template>

<script>
import HostContainer from './HostContainer';
import InstanceList from './InstanceList';
import InstanceItem from './InstanceItem';
import DiskZone from './DiskZone';
import DiskWrapper from './DiskWrapper';
import Disk from './Disk';
export default {
  name: 'BatchDirectConnect',
  components: {
    HostContainer, InstanceList, InstanceItem, DiskZone, DiskWrapper, Disk
  },
  props: {
    instances: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      roleType: String(Vue.roleType),
      hosts: [],
      dragging: {
        host: '',
        fromInstance: null,
        disk: null
      },
      overInstanceId: '',
      overHostName: '',
      loading: false,
      saving: false
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    handleBeforeClose(done) {
      done();
      this.close();
    },
    handleDragStart(event, host, fromInstance, disk) {
      this.dragging.host = host;
      this.dragging.fromInstance = fromInstance;
      this.dragging.disk = disk;
    },
    handleDragEnd(event) {
      this.dragging.host = '';
      this.dragging.fromInstance = null;
      this.dragging.disk = null;
      this.overHostName = '';
      this.overInstanceId = '';
    },
    handleDragOver(event, host, instance) {
      this.overHostName = '';
      this.overInstanceId = '';
      if (this.dragging.host === host) {
        if (instance !== null) {
          this.overInstanceId = instance.id;
        } else {
          this.overHostName = host.name;
        }
        event.preventDefault();
      }
    },
    handleDrop(event, host, toInstance) {
      if (this.dragging.host === host) {  // 只能同主机拖拽
        let fromInstance = this.dragging.fromInstance;
        if (fromInstance !== toInstance) {  // 同一个云主机就不处理了，相当于没拖拽
          let disk = this.dragging.disk;
          if (fromInstance === null) {  // 从无挂载状态挂载
            let index = host.scsiDisks.indexOf(disk);
            if (index > -1) {
              host.scsiDisks.splice(index, 1);
            }
          } else {  // 从一个云主机卸载，挂载到另一个云主机
            let index = fromInstance.scsiDisks.indexOf(disk);
            if (index > -1) {
              fromInstance.scsiDisks.splice(index, 1);
            }
          }
          if (toInstance === null) {  // 从一个云主机卸载
            this.dragging.disk.targetInstanceId = null;
            host.scsiDisks.push(disk);
          } else {
            this.dragging.disk.targetInstanceId = toInstance.id;
            toInstance.scsiDisks.push(disk);
          }
        }
      }
    },
    async loadSCSIDisks(instanceId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'post',
          url: `api/nova/v2.1/servers-inspur/${instanceId}/action`,
          data: JSON.stringify({
            listHostDisk: 'scsi'
          })
        });
        let scsiDisks = res.disks;
        scsiDisks = scsiDisks.filter(item => /^sd[a-z]{1,2}$/.test(item.name));
        scsiDisks.forEach(item => {
          item['addr'] = item['addr'];
          item['type'] = 'scsi';
        });
        return scsiDisks;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadHostAttachedDisks(instanceId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'post',
          url: `api/nova/v2.1/servers-inspur/${instanceId}/action`,
          data: JSON.stringify({
            passthruPoll: null
          }),
          showErrMsg: true
        });
        let hostAttachedDisks = 'passthru' in res ? res.passthru : [];
        let addrs = [];
        hostAttachedDisks.forEach(item => {
          addrs.push(item.volume_id.split(':')[2]);
        });
        return addrs;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async save() {
      const $this = this;
      $this.saving = true;
      let instances = new Map();
      let scsiDisks = [];
      for (let host of $this.hosts) {
        scsiDisks = scsiDisks.concat(host.scsiDisks);
        for (let instance of host.instances) {
          instances.set(instance.id, instance);
          scsiDisks = scsiDisks.concat(instance.scsiDisks);
        }
      }
      try {
        for (let scsiDisk of scsiDisks.filter(item => item.sourceInstanceId !== item.targetInstanceId)) {
          if (scsiDisk.sourceInstanceId !== null) {
            await $this.detachDisk(instances.get(scsiDisk.sourceInstanceId), scsiDisk);
          }
          if (scsiDisk.targetInstanceId !== null) {
            await $this.attachDisk(instances.get(scsiDisk.targetInstanceId), scsiDisk);
          }
        }
        $this.saving = false;
        $this.$message.success($this.$t('calcStorLang.BATCH_DIRECT_CONNECT_SUCCESS'));
        $this.$emit('refresh');
        $this.close();
      } catch (e) {
        __DEV__ && console.error(e);
        console.error(e);
      }
    },
    async attachDisk(instance, disk) {
      const $this = this;
      let data = {};
      if (disk.type === 'scsi') {
        data = {
          passthruAttach: {
            force: true,
            scsi: {
              addr: disk.addr,
              name: disk.name,
              quad: disk.quad
            }
          }
        };
      }
      const res = await $this.$ajax({
        type: 'post',
        url: `api/nova/v2.1/servers-inspur/${instance.id}/action`,
        data: JSON.stringify(data),
        log: {
          description: {
            en: `Attach Direct Connect Disk (Insntace: ${instance.name} UUID: ${instance.id} Addr: ${disk.addr} Name: ${disk.name})`,
            zh_cn: `挂载直通盘 （云主机：${instance.name} UUID：${instance.id} 地址：${disk.addr} 盘名：${disk.name}）`
          },
          target: Vue.logTarget.computeInstance,
          errorKey: 'NeutronError'
        }
      });
    },
    async detachDisk(instance, disk) {
      const $this = this;
      const res = await $this.$ajax({
        type: 'post',
        url: `api/nova/v2.1/servers-inspur/${instance.id}/action`,
        data: JSON.stringify({
          passthruDetach: {
            passthru_vol_id: disk.volumeId
          }
        }),
        log: {
          description: {
            en: `Detach Direct Connect Disk (Insntace: ${instance.name} UUID: ${instance.id} Addr: ${disk.addr} Name: ${disk.name})`,
            zh_cn: `卸载直通盘 （云主机：${instance.name} UUID：${instance.id} 地址：${disk.addr} 盘名：${disk.name}）`
          },
          target: Vue.logTarget.computeInstance,
          errorKey: 'NeutronError'
        }
      });
    }
  },
  async mounted() {
    const $this = this;
    if ($this.roleType !== '0') {
      $this.$message.error($this.$t('calcStorLang.BATCH_DEVICE_MANAGEMENT_SUPER_ADMIN_TIPS'));
      $this.close();
    } else {
      $this.loading = true;
      let hosts = [];
      for (let instance of $this.instances) {
        let hostName = instance['OS-EXT-SRV-ATTR:hypervisor_hostname'];
        let newInstance = {
          id: instance.id,
          name: instance.name || instance.id,
          host: hostName,
          scsiDisks: [],
          nvmeDisks: [],
          volumes: instance['os-extended-volumes-inspur:volumes_attached']
        };
        let host = hosts.find(item => item.name === hostName);
        if (host) {
          host.instances.push(newInstance);
        } else {
          hosts.push({
            name: hostName,
            scsiDisks: [],
            nvmeDisks: [],
            instances: [newInstance]
          });
        }
      };
      $this.hosts = hosts;
      for (let host of hosts) {
        let hostSCSIDisks = await $this.loadSCSIDisks(host.instances[0].id);
        for (let instance of host.instances) {
          for (let volume of instance.volumes) {
            if ('volume_type' in volume && volume.volume_type === 'passthru') {
              let scsiDisk = hostSCSIDisks.find(item => item.addr.substr(-18) === volume.id.split(':')[2]);
              if (scsiDisk) {
                scsiDisk.hostName = host.name;
                scsiDisk.sourceInstanceId = instance.id;
                scsiDisk.targetInstanceId = instance.id;
                scsiDisk.volumeId = volume.id;
                instance.scsiDisks.push(scsiDisk);
              }
            }
          }
        }
        let hostAttachedDiskAddrs = await $this.loadHostAttachedDisks(host.instances[0].id);
        for (let scsiDisk of hostSCSIDisks) {
          if (hostAttachedDiskAddrs.indexOf(scsiDisk.addr.substr(-18)) === -1) {
            scsiDisk.hostName = host.name;
            scsiDisk.sourceInstanceId = null;
            scsiDisk.targetInstanceId = null;
            host.scsiDisks.push(scsiDisk);
          }
        }
      }
      $this.loading = false;
    }
  }
}
</script>

<style scoped>
.flex-1 {
  flex: 1;
}
</style>