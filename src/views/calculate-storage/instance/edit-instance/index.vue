<template>
  <div>
    <el2-dialog
      :before-close="handleBeforeClose"
      :title="$t('calcStorLang.EDIT_INSTANCE') + ' - ' + instance.name"
      :visible="true"
      width="850px">
      <div v-loading="loading">
        <el-form label-position="right" label-width="120px">
          <el-form-item :label="$t('calcStorLang.EDIT_INSTANCE_AUTOBOOT')">
            <el-select v-model="formData.autobootPriority">
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_AUTOBOOT_NONE')" value="none" />
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_AUTOBOOT_LOW')" value="low" />
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_AUTOBOOT_MEDIUM')" value="medium" />
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_AUTOBOOT_HIGH')" value="high" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.EDIT_INSTANCE_BLOCK_IO_PRIORITY')" v-if="$archIs('x86')">
            <el-select v-model="formData.blockIO">
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_BLOCK_IO_NONE')" value="" />
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_BLOCK_IO_LOW')" value="low" />
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_BLOCK_IO_MEDIUM')" value="medium" />
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_BLOCK_IO_HIGH')" value="high" />
            </el-select>
            <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.EDIT_INSTANCE_BLOCK_IO_TIPS')">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.EDIT_INSTANCE_VNC_PROXY')">
            <el-select v-model="formData.vncProxy">
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_VNC_PROXY_ENABLE')" :value="true" />
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_VNC_PROXY_DISABLE')" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.EDIT_INSTANCE_PANIC_POLICY')" v-if="$archIs('x86')">
            <el-select v-model="formData.panic">
              <el-option value="default" :label="$t('calcStorLang.EDIT_INSTANCE_PANIC_POLICY_NONE')">{{ $t('calcStorLang.EDIT_INSTANCE_PANIC_POLICY_NONE') }}</el-option>
              <el-option value="reboot" :label="$t('calcStorLang.EDIT_INSTANCE_PANIC_POLICY_REBOOT')">{{ $t('calcStorLang.EDIT_INSTANCE_PANIC_POLICY_REBOOT') }}</el-option>
              <el-option value="shutdown" :label="$t('calcStorLang.EDIT_INSTANCE_PANIC_POLICY_SHUTDOWN')">{{ $t('calcStorLang.EDIT_INSTANCE_PANIC_POLICY_SHUTDOWN') }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.EDIT_INSTANCE_DISK_BUS')">
            <el-select v-model="formData.inspurDiskBus">
              <el-option v-if="origin.inspurDiskBus === ''" :label="$t('calcStorLang.EDIT_INSTANCE_BATCH_DISK_BUS_SELF_ADAPTIVE')" value=""></el-option>  <!-- 仅原值为空时，才可以设置为空 -->
              <!-- <el-option label="ide" value="ide">ide</el-option> -->
              <el-option label="virtio-scsi" value="scsi">virtio-scsi</el-option>
              <el-option label="virtio-blk" value="virtio">virtio-blk</el-option>
            </el-select>
            <el-tooltip v-if="isWindows" placement="top" trigger="hover" :content="$t('calcStorLang.EDIT_INSTANCE_DISK_BUS_IS_WINDOWS')">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="QoS" v-if="!$archIs('mips')">
            <operation-panel-new :select-rows="selectedQos" :operation-menus="qosOperationMenus" style="display:inline;" />
            <el-table ref="qosTable" :data="formData.qos" row-key="key" @selection-change="handleSelectedQoSChange" style="margin-top: 5px;">
              <el-table-column reserve-selection type="selection" width="55" />
              <el-table-column :label="$t('calcStorLang.EDIT_INSTANCE_QOS_KEY')">
                <template slot-scope="scope">
                  {{ getQoSKeyLabel(scope.row.key) }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('calcStorLang.EDIT_INSTANCE_QOS_VALUE')">
                <template slot-scope="scope">
                  <div v-if="scope.row.key === 'cpu_shares'">
                    <span v-if="String(scope.row.value) === '2048'">{{ $t('calcStorLang.EDIT_INSTANCE_QOS_HIGH') }}</span>
                    <span v-if="String(scope.row.value) === '1024'">{{ $t('calcStorLang.EDIT_INSTANCE_QOS_MEDIUM') }}</span>
                    <span v-if="String(scope.row.value) === '512'">{{ $t('calcStorLang.EDIT_INSTANCE_QOS_LOW') }}</span>
                  </div>
                  <div v-else>
                    {{ scope.row.value }}
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" @click="save" :disabled="loading || !dirty" :loading="saving">{{$t('lang.confirm')}}</el-button>
      </div>
    </el2-dialog>
    <edit-qos
      v-if="editQoSDialog.visible"
      @submit="handleEditQosSubmit"
      @close="editQoSDialog.visible = false"
      :type="editQoSDialog.type"
      :specified-data="editQoSDialog.specifiedData"
      :existing-keys="editQoSDialog.existingKeys"
      :cpu-quota-max="editQoSDialog.cpuQuotaMax"
    />
  </div>
</template>

<script>
import _ from 'underscore';
import QoSKeys from './QoSKeys';
import QoSOperationMenus from './QoSOperationMenus';
import EditQoS from './EditQoS';
export default {
  name: 'EditInstance',
  components: {
    'edit-qos': EditQoS
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
      origin: {
        autobootPriority: 'none',
        panic: 'default',
        qos: [],
        blockIO: '',
        vncProxy: false,
        inspurDiskBus: ''
      },
      formData: {
        autobootPriority: 'none',
        panic: 'default',
        qos: [],
        blockIO: '',
        vncProxy: false,
        inspurDiskBus: ''
      },
      editQoSDialog: {
        visible: false,
        type: 'add',
        specifiedData: {},
        existingKeys: [],
        cpuQuotaMax: 2200
      },
      selectedQos: [],
      qosKeys: QoSKeys,
      qosOperationMenus: QoSOperationMenus.bind(this)()
    };
  },
  methods: {
    handleBeforeClose(done) {
      const $this = this;
      done();
      $this.handleClose();
    },
    handleClose() {
      const $this = this;
      $this.$emit('close');
    },
    async loadData() {
      const $this = this;
      $this.loading = true;
      Promise.all([
        $this.loadQoS(),
        $this.loadBlockIO()
      ]).then((res) => {
        if ('panic' in $this.instance.metadata) {
          $this.origin.panic = $this.instance.metadata.panic;
          $this.formData.panic = $this.instance.metadata.panic;
        }
        if ('auto_boot' in $this.instance.metadata && 'boot_priority' in $this.instance.metadata) {
          $this.origin.autobootPriority = $this.instance.metadata.boot_priority;
          $this.formData.autobootPriority = $this.instance.metadata.boot_priority;
        }
        $this.origin.vncProxy = !$this.instance.tags.includes('closevnc');
        $this.formData.vncProxy = !$this.instance.tags.includes('closevnc');
        $this.origin.inspurDiskBus = $this.instance.system_metadata.image_hw_disk_bus ? $this.instance.system_metadata.image_hw_disk_bus : '';
        $this.formData.inspurDiskBus = $this.instance.system_metadata.image_hw_disk_bus ? $this.instance.system_metadata.image_hw_disk_bus : '';
        $this.loading = false;
      });
    },
    async loadQoS() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/os-instance_qos`
        });
        let qos = [];
        Object.keys(res).forEach(key => {
          if (key === 'cpu_quota_max' && res['cpu_quota_max'] !== null) {
            $this.editQoSDialog.cpuQuotaMax = res['cpu_quota_max'];
          } else {
            qos.push({
              key: key,
              value: res[key]
            });
          }
        });
        qos = qos.filter(item => item.value !== null);
        $this.origin.qos = JSON.parse(JSON.stringify(qos));
        $this.formData.qos = JSON.parse(JSON.stringify(qos));
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadBlockIO() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/os-block-io`
        });
        if (res.blockio_priority === null) {
          $this.origin.blockIO = '';
          $this.formData.blockIO = '';
        } else {
          $this.origin.blockIO = res.blockio_priority;
          $this.formData.blockIO = res.blockio_priority;
        }
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    save() {
      const $this = this;
      $this.$confirm(Vue.t('calcStorLang.EDIT_INSTANCE_WARNING'), Vue.t('base.prompt'), {
        confirmButtonText: Vue.t('base.confirm'),
        cancelButtonText: Vue.t('base.cancel'),
        type: 'warning'
      }).then(() => {
        $this.saving = true;
        Promise.all([
          $this.savePanic(),
          $this.saveQoS(),
          $this.saveAutobootPriority(),
          $this.setBlockIO(),
          $this.setVNCProxy(),
          $this.setDiskBus()
        ]).then(async res => {
          await $this.hardRestart();
          $this.$message.success($this.$t('calcStorLang.EDIT_INSTANCE_SUCCESS'));
          $this.$emit('refresh');
          $this.handleClose();
        }).catch(err => {
          __DEV__ && console.error(err);
          $this.saving = false;
          $this.hardRestart();
        });
      });
    },
    async savePanic() {
      const $this = this;
      if ($this.$archIs('x86') && $this.panicDirty) {
        const res = await $this.$ajax({
          type: 'post',
          url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/os-panic_policy`,
          headers: {
            'X-OpenStack-Nova-API-Version': '2.41'
          },
          showErrMsg: true,
          data: JSON.stringify({
            panicPolicy: {
              panic: $this.formData.panic
            }
          }),
          log: {
            description: {
              en: `Edit Instance: ${$this.instance.id}, Set Panic Policy: ${$this.formData.panic}`,
              zh_cn: `编辑云主机：ID: ${$this.instance.id}，设置蓝屏策略：${$this.formData.panic}`
            },
            target: Vue.logTarget.computeInstance
          }
        });
      }
    },
    async saveQoS() {
      const $this = this;
      if ($this.qosDirty) {
        // 要被设置的QoS
        const qosListToBeSet = $this.formData.qos;
        // 要被删除的QoS
        const qosListToBeDeleted = $this.origin.qos.filter(item => !$this.formData.qos.map(q => q.key).includes(item.key));

        if (qosListToBeSet.length > 0) {
          await $this.setQoS(qosListToBeSet);
        }
        if (qosListToBeDeleted.length > 0) {
          await $this.deleteQoS(qosListToBeDeleted);
        }
      }
    },
    async setQoS(qosList) {
      const $this = this;
      const qosObject = {};
      qosList.forEach(item => {
        qosObject[item.key] = item.value;
      });
      qosObject['cpu_quota_max'] = String($this.editQoSDialog.cpuQuotaMax);
      let qosStrZhCn = '';
      let qosStrEn = '';
      qosList.forEach(item => {
        let keyLabelZhCn = '';
        let keyLabelEn = '';
        switch (item.key) {
          case 'cpu_shares':
            keyLabelZhCn = 'CPU份额';
            keyLabelEn = 'cpu_shares';
            break;
          case 'cpu_quota':
            keyLabelZhCn = 'CPU限制';
            keyLabelEn = 'cpu_quota';
            break;
          case 'soft_limit':
            keyLabelZhCn = '内存限额';
            keyLabelEn = 'soft_limit';
            break;
          default:
            keyLabelZhCn = item.key;
            keyLabelEn = item.key;
        }
        qosStrZhCn += `${keyLabelZhCn}=${item.value} `;
        qosStrEn += `${keyLabelEn}=${item.value} `;
      });
      const res = await $this.$ajax({
        type: 'post',
        url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/os-instance_qos`,
        headers: {
          'X-OpenStack-Nova-API-Version': '2.41'
        },
        showErrMsg: true,
        data: JSON.stringify({
          set_instance_qos: qosObject
        }),
        log: {
          description: {
            en: `Edit Instance: ${$this.instance.id}, Set QoS: ${qosStrEn}`,
            zh_cn: `编辑云主机：ID: ${$this.instance.id}，设置QoS：${qosStrZhCn}`
          },
          target: Vue.logTarget.computeInstance
        }
      });
    },
    async deleteQoS(qosList) {
      const $this = this;
      for (let i = 0; i < qosList.length; i++) {
        const qos = qosList[i];
        let keyLabelZhCn = '';
        let keyLabelEn = '';
        switch (qos.key) {
          case 'cpu_shares':
            keyLabelZhCn = 'CPU份额';
            keyLabelEn = 'cpu_shares';
            break;
          case 'cpu_quota':
            keyLabelZhCn = 'CPU限制';
            keyLabelEn = 'cpu_quota';
            break;
          case 'soft_limit':
            keyLabelZhCn = '内存限额';
            keyLabelEn = 'soft_limit';
            break;
          default:
            keyLabelZhCn = qos.key;
            keyLabelEn = qos.key;
        }
        const res = await $this.$ajax({
          type: 'delete',
          url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/os-instance_qos/${qos.key}`,
          headers: {
            'X-OpenStack-Nova-API-Version': '2.41'
          },
          showErrMsg: true,
          log: {
            description: {
              zh_cn: `编辑云主机：ID: ${$this.instance.id}，删除QoS：${keyLabelZhCn}`,
              en: `Edit Instance: ${$this.instance.id}, Delete QoS: ${keyLabelEn}`
            },
            target: Vue.logTarget.computeInstance
          }
        });
      }
    },
    async saveAutobootPriority() {
      const $this = this;
      if ($this.autobootPriorityDirty) {
        const res = $this.$ajax({
          type: 'post',
          url: `api/nova/v2.1/${$this.$cookie.get('pid')}/os-auto-boots`,
          data: JSON.stringify({
            setAutoBoot: {
              auto_boot: $this.formData.autobootPriority === 'none' ? 'no' : 'yes',
              boot_priority: $this.formData.autobootPriority,
              instance_list: [$this.instance.id]
            }
          }),
          headers: {
            'OpenStack-API-Version': 'compute 2.41'
          },
          log: {
            description: {
              en: `Edit Instance: ${$this.instance.id}, Set Auto Boot: ${$this.formData.autobootPriority}`,
              zh_cn: `编辑云主机：ID: ${$this.instance.id}，设置自动启动优先级：${$this.formData.autobootPriority}`
            },
            target: Vue.logTarget.computeInstance
          }
        });
      }
    },
    async setBlockIO() {
      const $this = this;
      if ($this.blockIODirty) {
        if ($this.formData.blockIO !== '') {
          await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers-inspur/os-block-io`,
            data: JSON.stringify({
              setBlockIo: {
                block_io: $this.formData.blockIO,
                instance_id: $this.instance.id
              }
            }),
            log: {
              'description': {
                en: `Edit Instance: ${$this.instance.id}, Set Block IO Priority: ${$this.formData.blockIO}`,
                zh_cn: `编辑云主机：ID: ${$this.instance.id}，设置IO优先级：${$this.formData.blockIO}`
              },
              target: Vue.logTarget.computeInstance
            }
          });
        } else {
          await $this.$ajax({
            type: 'delete',
            url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/os-block-io/block_io`,
            log: {
              'description': {
                en: `Edit Instance: ${$this.instance.id}, Delete Block IO Priority`,
                zh_cn: `编辑云主机：ID: ${$this.instance.id}，清除IO优先级`
              },
              target: Vue.logTarget.computeInstance
            }
          });
        }
      }
    },
    async setVNCProxy() {
      const $this = this;
      if ($this.vncProxyDirty) {
        if ($this.formData.vncProxy === false) {
          await $this.$ajax({
            url: `api/nova/v2.1/${$this.$cookie.get('pid')}/servers/${$this.instance.id}/tags/closevnc`,
            type: 'PUT',
            headers: {
              'OpenStack-API-Version': 'compute 2.41',
              'X-OpenStack-Nova-API-Version': 2.41
            },
            log: {
              'description': {
                en: `Edit Instance: ${$this.instance.id}, Turn Off VNC Switch`,
                zh_cn: `编辑云主机：ID: ${$this.instance.id}，关闭VNC开关`
              },
              target: Vue.logTarget.computeInstance
            }
          });
        } else {
          await $this.$ajax({
            url: `api/nova/v2.1/${$this.$cookie.get('pid')}/servers/${$this.instance.id}/tags/closevnc`,
            type: 'DELETE',
            headers: {
              'OpenStack-API-Version': 'compute 2.41',
              'X-OpenStack-Nova-API-Version': 2.41
            },
            log: {
              'description': {
                  en: `Edit Instance: ${$this.instance.id}, Turn On VNC Switch`,
                  zh_cn: `编辑云主机：ID: ${$this.instance.id}，打开VNC开关`
              },
              target: Vue.logTarget.computeInstance
            }
          })
        }
      }
    },
    async setDiskBus() {
      const $this = this;
      if ($this.inspurDiskBusDirty) {
        let diskBusString = '';
        if ($this.formData.inspurDiskBus === 'scsi') {
          diskBusString = 'virtio-scsi';
        } else if ($this.formData.inspurDiskBus === 'virtio') {
          diskBusString = 'virtio-blk';
        }
        await $this.$ajax({
          url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/action`,
          type: 'post',
          data: JSON.stringify({
            mutationDiskBus: {
              inspur_disk_bus: $this.formData.inspurDiskBus
            }
          }),
          log: {
            'description': {
              en: `Edit Instance: ${$this.instance.id}, Set Disk Bus: ${diskBusString}`,
              zh_cn: `编辑云主机：ID: ${$this.instance.id}，设置存储控制器类型：${diskBusString}`
            },
            target: Vue.logTarget.computeInstance
          },
          errorKey: 'conflictingRequest'
        });
      }
    },
    async hardRestart() {
      const $this = this;
      $this.$ajax({
        url: `api/nova/v2.1/servers/${$this.instance.id}/action`,
        type: 'post',
        data: JSON.stringify({
          reboot: {
            type: 'HARD'
          }
        }),
        errorKey: 'conflictingRequest'
      });
    },
    handleSelectedQoSChange(params) {
      this.selectedQos = params;
    },
    showEditQosDialog(type='add', specifiedData={}) {
      this.editQoSDialog.type = type;
      this.editQoSDialog.specifiedData = specifiedData;
      this.editQoSDialog.existingKeys = this.formData.qos.map(item => item.key);
      this.editQoSDialog.visible = true;
    },
    handleEditQosSubmit(type, key, value) {
      const $this = this;
      if (type === 'add') {
        $this.formData.qos.push({
          key, value
        });
      } else {
        const existingQoS = $this.formData.qos.find(item => item.key === key);
        if (existingQoS) {
          existingQoS.value = value;
        }
      }
      this.$refs.qosTable.clearSelection();
    },
    getQoSKeyLabel(key) {
      let qosKey = this.qosKeys.find(item => item.key === key);
      if (qosKey) {
        return this.$t(qosKey.label);
      } else {
        return key;
      }
    }
  },
  computed: {
    dirty() {  // 是否有脏数据，如果存在则可以保存
      const $this = this;
      return $this.panicDirty ||
             $this.qosDirty ||
             $this.autobootPriorityDirty ||
             $this.blockIODirty ||
             $this.vncProxyDirty ||
             $this.inspurDiskBusDirty;
    },
    panicDirty() {
      const $this = this;
      return $this.formData.panic !== $this.origin.panic;
    },
    qosDirty() {
      const $this = this;
      const currentData = _.sortBy($this.formData.qos, 'key');
      const originData = _.sortBy($this.origin.qos, 'key');
      return JSON.stringify(currentData) !== JSON.stringify(originData);
    },
    autobootPriorityDirty() {
      const $this = this;
      return $this.formData.autobootPriority !== $this.origin.autobootPriority;
    },
    blockIODirty() {
      const $this = this;
      return $this.formData.blockIO !== $this.origin.blockIO;
    },
    vncProxyDirty() {
      const $this = this;
      return $this.formData.vncProxy !== $this.origin.vncProxy;
    },
    inspurDiskBusDirty() {
      const $this = this;
      return $this.formData.inspurDiskBus !== $this.origin.inspurDiskBus;
    },
    isWindows() {
      const $this = this;
      if ($this.instance.system_metadata && $this.instance.system_metadata.image_os_type && $this.instance.system_metadata.image_os_type.toLowerCase() === 'windows') {
        return true;
      }
      return false;
    }
  },
  mounted() {
    const $this = this;
    $this.loadData();
  }
}
</script>

<style scoped>
.margin-bottom-15 {
  margin-bottom: 15px;
}
.func-panel {
  margin: 5px 0 15px 0;
  padding: 15px;
  background: #ecf2f6;
  border: 1px solid #d1dbe5;
}
</style>
