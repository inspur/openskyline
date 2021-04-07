<template>
  <div>
    <el-dialog
      :before-close="handleBeforeClose"
      :title="$t('calcStorLang.BARE_METAL_INSTANCES_TRANSFOR_TO_AVAILABLE')"
      :visible="visible"
      class="delete-dialog">
      <el-row type="flex" justify="start" align="middle">
        <i class="el-icon-warning big-warning-icon" />
        <el-form class="flex-1">
          <el-form-item class="margin-bottom-0">
            <span v-if="!cleanDisks">{{ $t('calcStorLang.BARE_METAL_INSTANCES_TRANSFOR_TO_AVAILABLE_TIPS') }}</span>
            <span v-if="cleanDisks">{{ $t('calcStorLang.BARE_METAL_INSTANCES_TRANSFOR_TO_AVAILABLE_CLEAN_DISKS_TIPS') }}</span><br>
            <el-checkbox v-model="cleanDisks">
              {{ $t('calcStorLang.BARE_METAL_INSTANCES_TRANSFOR_TO_AVAILABLE_CLEAN_DISKS') }}
            </el-checkbox>
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
  name: 'TransferToAvailable',
  props: {
    baremetals: {
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
    getMainFunc(baremetal, cleanDisks) {
      const $this = this;
      return new Promise(async (resolve, reject) => {
        try {
          console.log(baremetal);
          await $this.$ajax({
            type: 'patch',
            url: `api/ironic/v1/nodes/${baremetal.uuid}`,
            data: JSON.stringify([{
              op: 'replace',
              path: '/automated_clean',
              value: cleanDisks ? 'True' : 'False'
            }])
          });
          await $this.$ajax({
            type: 'put',
            url: `api/ironic/v1/nodes/${baremetal.uuid}/states/provision`,
            data: JSON.stringify({
              target: 'provide'
            }),
            log: {
              description: {
                en: `Change available ${baremetal.name}`,
                zh_cn: `裸机转为可用 ${baremetal.name}`
              },
              target: Vue.logTarget.bareMachine
            },
            showErrMsg: true
          });
          // baremetal['OS-EXT-STS:task_state'] = 'deleting';
          resolve();
        } catch (e) {
          __DEV__ && console.error(e);
          reject(e);
        }
      });
    },
    save() {
      const $this = this;
      $this.saving = true;
      let queue = [];
      for (let baremetal of $this.baremetals) {
        queue.push($this.getMainFunc(baremetal, $this.cleanDisks));
      }
      console.log(queue);
      Promise.all(queue).then(res => {
        $this.$message.success(Vue.t("calcStorLang.transferToAvailable") + " " + Vue.t("calcStorLang.sendSuccess") + "," + Vue.t("calcStorLang.pleaseRefreshLater"));
        $this.$emit('refresh');
        $this.handleClose();
      }).catch(e => {
        __DEV__ && console.error(e);
        $this.saving = false;
      });
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
