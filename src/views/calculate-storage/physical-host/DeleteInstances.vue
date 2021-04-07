<template>
  <div>
    <el-dialog
      :before-close="handleBeforeClose"
      :title="$t('calcStorLang.DELETE_BARE_METAL_INSTANCES')"
      :visible="visible"
      class="delete-dialog">
      <el-row type="flex" justify="start" align="middle">
        <i class="el-icon-warning big-warning-icon" />
        <el-form class="flex-1">
          <el-form-item class="margin-bottom-0">
            <span v-if="!cleanDisks">{{ $t('calcStorLang.DELETE_BARE_METAL_INSTANCES_TIPS') }}</span>
            <span v-if="cleanDisks">{{ $t('calcStorLang.DELETE_BARE_METAL_INSTANCES_CLEAN_DISKS_TIPS') }}</span><br>
            <el-checkbox v-model="cleanDisks" :disabled="cannotCleanDisks">
              {{ $t('calcStorLang.DELETE_BARE_METAL_INSTANCES_CLEAN_DISKS') }}
            </el-checkbox>
            <el-tooltip v-if="cannotCleanDisks" placement="right" trigger="hover" :content="$t('calcStorLang.DELETE_BARE_METAL_INSTANCES_CANNOT_CLEAN_DISKS_TIPS')">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
        </el-form>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" @click="save" :loading="saving">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'underscore';
export default {
  name: 'DeleteInstances',
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
      visible: true,
      saving: false,
      cleanDisks: false
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
    getDeleteFunc(instance, cleanDisks) {
      const $this = this;
      return new Promise(async (resolve, reject) => {
        try {
          if (!$this.cannotCleanDisks) {
            await $this.$ajax({
              type: 'patch',
              url: `api/ironic/v1/nodes/${instance['OS-EXT-SRV-ATTR:hypervisor_hostname']}`,
              data: JSON.stringify([{
                op: 'replace',
                path: '/automated_clean',
                value: cleanDisks ? 'True' : 'False'
              }])
            });
          }
          await $this.$ajax({
            type: 'delete',
            url: `api/nova/v2.1/servers-inspur/${instance.id}`,
            log: {
              description: {
                en: `Delete Baremetal Instance(Baremetal Instance ID: ${instance.id}, Baremetal Instance Name: ${instance.name})`,
                zh_cn: `删除云物理机（云物理机ID：${instance.id}，云物理机名：${instance.name}）`
              },
              key: 'name',
              target: Vue.logTarget.computePhysical
            },
            showErrMsg: true
          });
          instance['OS-EXT-STS:task_state'] = 'deleting';
          resolve();
        } catch (e) {
          __DEV__ && console.error(e);
          reject(e);
        }
      });
    },
    save() {
      const $this = this;
      $this.$prompt(Vue.t('lang.inputYesToContinue'), Vue.t('calcStorLang.confirm'), {
        confirmButtonText: Vue.t('lang.confirm'),
        cancelButtonText: Vue.t('lang.cancel'),
        inputPattern: /^YES$|^NO$/i,
        inputValue: "NO",
        customClass: "promptConfirmDel",
        inputErrorMessage: Vue.t('lang.onlyAcceptYesOrNo')
      }).then(async ({ value }) => {
        if (value.toLowerCase() ==="yes") {
          $this.saving = true;
          let deleteQueue = [];
          for (let instance of $this.instances) {
            deleteQueue.push($this.getDeleteFunc(instance, $this.cleanDisks));
          }
          Promise.all(deleteQueue).then(res => {
            $this.$message.success($this.$t('calcStorLang.deleteSendSuccess'));
            $this.$emit('refresh');
            $this.handleClose();
          }).catch(e => {
            __DEV__ && console.error(e);
            $this.saving = false;
          });
        } else {
          $this.handleClose();
        }
      }).catch(() => {
        $this.handleClose();
      });
    }
  },
  computed: {
    cannotCleanDisks() { // 如果实例中有“无裸机”或不是运行或不是错误的，则不能清理磁盘
      return this.instances.findIndex(item => {
        if (item['OS-EXT-SRV-ATTR:hypervisor_hostname'] === '' || item['OS-EXT-SRV-ATTR:hypervisor_hostname'] === null || !('OS-EXT-SRV-ATTR:hypervisor_hostname' in item)) {
          return true;
        }
        if (item['status'] !== 'ACTIVE' && item['status'] !== 'SHUTOFF' && item['status'] !== 'ERROR') {
          return true;
        }
        return false;
      }) !== -1;
    }
  }
}
</script>

<style scoped>
.big-warning-icon {
  font-size: 36px;
  color: #f7ba2a;
  width: 50px;
}

.flex-1 {
  flex: 1;
}

.margin-bottom-0 {
  margin-bottom: 0;
}

.delete-dialog >>> .el-dialog {
  width: 500px;
}
</style>
