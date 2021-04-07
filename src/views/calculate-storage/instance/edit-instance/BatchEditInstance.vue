<template>
  <div>
    <el2-dialog
      :before-close="handleBeforeClose"
      :title="$t('calcStorLang.EDIT_INSTANCE_BATCH')"
      :visible="true"
      width="850px">
      <div>
        <el-form label-position="right" label-width="120px">
          <el-form-item :label="$t('calcStorLang.EDIT_INSTANCE_AUTOBOOT')">
            <div>
              <el-checkbox v-model="autobootPriorityDirty"></el-checkbox>
              <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.EDIT_INSTANCE_BATCH_AUTOBOOT')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </div>
            <el-select v-if="autobootPriorityDirty" v-model="formData.autobootPriority">
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_AUTOBOOT_NONE')" value="none" />
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_AUTOBOOT_LOW')" value="low" />
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_AUTOBOOT_MEDIUM')" value="medium" />
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_AUTOBOOT_HIGH')" value="high" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.EDIT_INSTANCE_BLOCK_IO_PRIORITY')">
            <div>
              <el-checkbox v-model="blockIODirty"></el-checkbox>
              <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.EDIT_INSTANCE_BATCH_BLOCK_IO') + ' ' + $t('calcStorLang.EDIT_INSTANCE_BLOCK_IO_TIPS')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </div>
            <el-select v-if="blockIODirty" v-model="formData.blockIO">
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_BLOCK_IO_NONE')" value="" />
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_BLOCK_IO_LOW')" value="low" />
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_BLOCK_IO_MEDIUM')" value="medium" />
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_BLOCK_IO_HIGH')" value="high" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.EDIT_INSTANCE_VNC_PROXY')">
            <div>
              <el-checkbox v-model="vncProxyDirty"></el-checkbox>
              <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.EDIT_INSTANCE_BATCH_VNC_PROXY')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </div>
            <el-select v-if="vncProxyDirty" v-model="formData.vncProxy">
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_VNC_PROXY_ENABLE')" :value="true" />
              <el-option :label="$t('calcStorLang.EDIT_INSTANCE_VNC_PROXY_DISABLE')" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.EDIT_INSTANCE_PANIC_POLICY')" v-if="$archIs('x86')">
            <div>
              <el-checkbox v-model="panicDirty"></el-checkbox>
              <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.EDIT_INSTANCE_BATCH_PANIC')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </div>
            <el-select v-if="panicDirty" v-model="formData.panic">
              <el-option value="default" :label="$t('calcStorLang.EDIT_INSTANCE_PANIC_POLICY_NONE')">{{ $t('calcStorLang.EDIT_INSTANCE_PANIC_POLICY_NONE') }}</el-option>
              <el-option value="reboot" :label="$t('calcStorLang.EDIT_INSTANCE_PANIC_POLICY_REBOOT')">{{ $t('calcStorLang.EDIT_INSTANCE_PANIC_POLICY_REBOOT') }}</el-option>
              <el-option value="shutdown" :label="$t('calcStorLang.EDIT_INSTANCE_PANIC_POLICY_SHUTDOWN')">{{ $t('calcStorLang.EDIT_INSTANCE_PANIC_POLICY_SHUTDOWN') }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.EDIT_INSTANCE_DISK_BUS')">
            <div>
              <el-checkbox v-model="inspurDiskBusDirty"></el-checkbox>
              <el-tooltip lacement="top" trigger="hover">
                <span slot="content">
                  <span>{{ $t('calcStorLang.EDIT_INSTANCE_BATCH_DISK_BUS') }}</span>
                  <p v-if="hasWindows"></p>
                  <span v-if="hasWindows">{{ $t('calcStorLang.EDIT_INSTANCE_BATCH_DISK_BUS_HAS_WINDOWS') }}</span>
                </span>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </div>
            <el-select v-if="inspurDiskBusDirty" v-model="formData.inspurDiskBus">
              <!-- <el-option label="ide" value="ide">ide</el-option> -->
              <el-option label="virtio-scsi" value="scsi">virtio-scsi</el-option>
              <el-option label="virtio-blk" value="virtio">virtio-blk</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="QoS" v-if="false"> <!-- 由于cpu_quota的最大值，和host有关，因此先隐藏批量编辑，待确定需求后再打开 -->
            <div>
              <el-checkbox v-model="qosDirty"></el-checkbox>
              <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.EDIT_INSTANCE_BATCH_QOS')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </div>
            <operation-panel-new v-if="qosDirty" :select-rows="selectedQos" :operation-menus="qosOperationMenus" style="display:inline;" />
            <el-table v-if="qosDirty" ref="qosTable" :data="formData.qos" row-key="key" @selection-change="handleSelectedQoSChange" style="margin-top: 5px;">
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
        <el-button type="primary" @click="save" :disabled="!dirty" :loading="saving">{{$t('lang.confirm')}}</el-button>
      </div>
    </el2-dialog>
    <edit-qos
      v-if="editQoSDialog.visible"
      @submit="handleEditQosSubmit"
      @close="editQoSDialog.visible = false"
      :type="editQoSDialog.type"
      :specified-data="editQoSDialog.specifiedData"
      :existing-keys="editQoSDialog.existingKeys"
    />
  </div>
</template>

<script>
import _ from 'underscore';
import QoSKeys from './QoSKeys';
import QoSOperationMenus from './QoSOperationMenus';
import EditQoS from './EditQoS';
export default {
  name: 'BatchEditInstance',
  components: {
    'edit-qos': EditQoS
  },
  props: {
    instances: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      saving: false,
      autobootPriorityDirty: false,
      panicDirty: false,
      qosDirty: false,
      blockIODirty: false,
      vncProxyDirty: false,
      inspurDiskBusDirty: false,
      formData: {
        autobootPriority: 'none',
        panic: 'default',
        qos: [],
        blockIO: '',
        vncProxy: true,
        inspurDiskBus: 'virtio'
      },
      editQoSDialog: {
        visible: false,
        type: 'add',
        specifiedData: {},
        existingKeys: []
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
    async save() {
      const $this = this;
      $this.$confirm(Vue.t('calcStorLang.EDIT_INSTANCE_WARNING'), Vue.t('base.prompt'), {
        confirmButtonText: Vue.t('base.confirm'),
        cancelButtonText: Vue.t('base.cancel'),
        type: 'warning'
      }).then(async () => {
        $this.saving = true;
        let hasError = false;
        for (let i = 0; i < $this.instances.length; i++) {
          const instance = $this.instances[i];
          if (!(await $this.saveOne(instance))) {
            hasError = true;
          }
        }
        if (!hasError) {
          $this.$message.success($this.$t('calcStorLang.EDIT_INSTANCE_BATCH_SUCCESS'));
        }
        $this.$emit('refresh');
        $this.$emit('close');
      });
    },
    async saveOne(instance) {
      const $this = this;
      let noError = true;
      try {
        await $this.saveAutobootPriority(instance);
      } catch (e) {
        __DEV__ && console.error(e);
        noError = false;
      }
      try {
        await $this.setBlockIO(instance);
      } catch (e) {
        __DEV__ && console.error(e);
        noError = false;
      }
      try {
        await $this.setVNCProxy(instance);
      } catch (e) {
        __DEV__ && console.error(e);
        noError = false;
      }
      try {
        await $this.savePanic(instance)
      } catch (e) {
        __DEV__ && console.error(e);
        noError = false;
      }
      try {
        await $this.setQoS(instance);
      } catch (e) {
        __DEV__ && console.error(e);
        noError = false;
      }
      try {
        await $this.setDiskBus(instance);
      } catch (e) {
        __DEV__ && console.error(e);
        noError = false;
      }
      try {
        await $this.hardRestart(instance);
      } catch (e) {
        __DEV__ && console.error(e);
        noError = false;
      }
      return noError;
    },
    async savePanic(instance) {
      const $this = this;
      if ($this.panicDirty) {
        const res = await $this.$ajax({
          type: 'post',
          url: `api/nova/v2.1/servers-inspur/${instance.id}/os-panic_policy`,
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
              en: `Edit Instance: ${instance.id}, Set Panic Policy: ${$this.formData.panic}`,
              zh_cn: `编辑云主机：ID: ${instance.id}，设置蓝屏策略：${$this.formData.panic}`
            },
            target: Vue.logTarget.computeInstance
          }
        });
      }
    },
    async setQoS(instance) {
      const $this = this;
      if ($this.qosDirty) {
        const qosObject = {};
        $this.formData.qos.forEach(item => {
          qosObject[item.key] = item.value;
        });
        let qosStrZhCn = '';
        let qosStrEn = '';
        $this.formData.qos.forEach(item => {
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
            default:
              keyLabelZhCn = item.key;
              keyLabelEn = item.key;
          }
          qosStrZhCn += `${keyLabelZhCn}=${item.value} `;
          qosStrEn += `${keyLabelEn}=${item.value} `;
        });
        const res = await $this.$ajax({
          type: 'post',
          url: `api/nova/v2.1/servers-inspur/${instance.id}/os-instance_qos`,
          headers: {
            'X-OpenStack-Nova-API-Version': '2.41'
          },
          showErrMsg: true,
          data: JSON.stringify({
            set_instance_qos: qosObject
          }),
          log: {
            description: {
              en: `Edit Instance: ${instance.id}, Set QoS: ${qosStrEn}`,
              zh_cn: `编辑云主机：ID: ${instance.id}，设置QoS：${qosStrZhCn}`
            },
            target: Vue.logTarget.computeInstance
          }
        });
      }
    },
    async saveAutobootPriority(instance) {
      const $this = this;
      if ($this.autobootPriorityDirty) {
        const res = await $this.$ajax({
          type: 'post',
          url: `api/nova/v2.1/${$this.$cookie.get('pid')}/os-auto-boots`,
          data: JSON.stringify({
            setAutoBoot: {
              auto_boot: $this.formData.autobootPriority === 'none' ? 'no' : 'yes',
              boot_priority: $this.formData.autobootPriority,
              instance_list: [instance.id]
            }
          }),
          headers: {
            'OpenStack-API-Version': 'compute 2.41'
          },
          log: {
            description: {
              en: `Edit Instance: ${instance.id}, Set Auto Boot: ${$this.formData.autobootPriority}`,
              zh_cn: `编辑云主机：ID: ${instance.id}，设置自动启动优先级：${$this.formData.autobootPriority}`
            },
            target: Vue.logTarget.computeInstance
          }
        });
      }
    },
    async setBlockIO(instance) {
      const $this = this;
      if ($this.blockIODirty) {
        if ($this.formData.blockIO !== '') {
          await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers-inspur/os-block-io`,
            data: JSON.stringify({
              setBlockIo: {
                block_io: $this.formData.blockIO,
                instance_id: instance.id
              }
            }),
            log: {
              'description': {
                en: `Edit Instance: ${instance.id}, Set Block IO Priority: ${$this.formData.blockIO}`,
                zh_cn: `编辑云主机：ID: ${instance.id}，设置IO优先级：${$this.formData.blockIO}`
              },
              target: Vue.logTarget.computeInstance
            }
          });
        } else {
          try {
            await $this.$ajax({
              type: 'delete',
              url: `api/nova/v2.1/servers-inspur/${instance.id}/os-block-io/block_io`,
              log: {
                'description': {
                  en: `Edit Instance: ${instance.id}, Delete Block IO Priority`,
                  zh_cn: `编辑云主机：ID: ${instance.id}，清除IO优先级`
                },
                target: Vue.logTarget.computeInstance
              },
              showErrMsg: false
            });
          } catch (e) {
            __DEV__ && console.error(e);
          }
        }
      }
    },
    async setVNCProxy(instance) {
      const $this = this;
      if ($this.vncProxyDirty) {
        try {
          if ($this.formData.vncProxy === false) {
            await $this.$ajax({
              url: `api/nova/v2.1/${$this.$cookie.get('pid')}/servers/${instance.id}/tags/closevnc`,
              type: 'PUT',
              headers: {
                'OpenStack-API-Version': 'compute 2.41',
                'X-OpenStack-Nova-API-Version': 2.41
              },
              log: {
                'description': {
                  en: `Edit Instance: ${instance.id}, Turn Off VNC Switch`,
                  zh_cn: `编辑云主机：ID: ${instance.id}，关闭VNC开关`
                },
                target: Vue.logTarget.computeInstance
              },
              showErrMsg: false
            });
          } else {
            await $this.$ajax({
              url: `api/nova/v2.1/${$this.$cookie.get('pid')}/servers/${instance.id}/tags/closevnc`,
              type: 'DELETE',
              headers: {
                'OpenStack-API-Version': 'compute 2.41',
                'X-OpenStack-Nova-API-Version': 2.41
              },
              log: {
                'description': {
                    en: `Edit Instance: ${instance.id}, Turn On VNC Switch`,
                    zh_cn: `编辑云主机：ID: ${instance.id}，打开VNC开关`
                },
                target: Vue.logTarget.computeInstance
              },
              showErrMsg: false
            });
          }
        } catch (e) {
          __DEV__ && console.error(e);
        }
      }
    },
    async setDiskBus(instance) {
      const $this = this;
      if ($this.inspurDiskBusDirty) {
        let diskBusString = '';
        if ($this.formData.inspurDiskBus === 'scsi') {
          diskBusString = 'virtio-scsi';
        } else if ($this.formData.inspurDiskBus === 'virtio') {
          diskBusString = 'virtio-blk';
        }
        await $this.$ajax({
          url: `api/nova/v2.1/servers-inspur/${instance.id}/action`,
          type: 'post',
          data: JSON.stringify({
            mutationDiskBus: {
              inspur_disk_bus: $this.formData.inspurDiskBus
            }
          }),
          log: {
            'description': {
              en: `Edit Instance: ${instance.id}, Set Disk Bus: ${diskBusString}`,
              zh_cn: `编辑云主机：ID: ${instance.id}，设置存储控制器类型：${diskBusString}`
            },
            target: Vue.logTarget.computeInstance
          },
          errorKey: 'conflictingRequest'
        });
      }
    },
    async hardRestart(instance) {
      const $this = this;
      $this.$ajax({
        url: `api/nova/v2.1/servers/${instance.id}/action`,
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
    dirty() {  // 复用脏数据逻辑，判断是否可以保存
      const $this = this;
      return $this.panicDirty ||
             $this.qosDirty ||
             $this.autobootPriorityDirty ||
             $this.blockIODirty ||
             $this.vncProxyDirty ||
             $this.inspurDiskBusDirty;
    },
    hasWindows() {
      const $this = this;
      let has = false;
      for (let i = 0; i < $this.instances.length; i++) {
        let instance = $this.instances[i];
        if (instance.system_metadata && instance.system_metadata.image_os_type && instance.system_metadata.image_os_type.toLowerCase() === 'windows') {
          has = true;
          break;
        }
      }
      return has;
    }
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
