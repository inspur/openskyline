<template>
  <div>
    <el-dialog
      :before-close="handleBeforeClose"
      :title="$t('calcStorLang.DELETE_INSTANCES')"
      :visible="visible"
      class="delete-dialog">
      <el-row type="flex" justify="start" align="middle">
        <i class="el-icon-warning big-warning-icon" />
        <el-form class="flex-1">
          <el-form-item class="margin-bottom-0">
            <span v-if="!completelyDelete">{{ $t('calcStorLang.SOFT_DELETE_CONFIRM') }}</span>
            <span v-if="completelyDelete">{{ $t('calcStorLang.COMPLETELY_DELETE_CONFIRM') }}</span><br>
            <el-checkbox v-model="completelyDelete" v-if="showCompletelyDelete" :disabled="!canSoftDelete">
              {{ $t('calcStorLang.COMPLETELY_DELETE') }}
            </el-checkbox>
            <el-tooltip v-if="!canSoftDelete && showCompletelyDelete" placement="right" trigger="hover" :content="$t('calcStorLang.SOFT_LIMIT_BANNED_TIPS')">
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
      roleType: String(Vue.roleType),
      visible: false,
      saving: false,
      completelyDelete: false
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
    getDeleteFunc(instance) {
      const $this = this;
      return new Promise((resolve, reject) => {
        $this.$ajax({
          type: 'delete',
          url: `api/nova/v2.1/servers/${instance.id}`,
          log: {
            description: {
              en: `Delete Instance(Instance ID: ${instance.id}, Instance Name: ${instance.name})`,
              zh_cn: `删除云主机（云主机ID：${instance.id}，云主机名：${instance.name}）`
            },
            key: 'name',
            target: Vue.logTarget.computeInstance
          },
          showErrMsg: true,
          successFun() {
            instance['OS-EXT-STS:task_state'] = 'deleting';
            resolve();
          },
          errFun() {
            reject();
          }
        });
      });
    },
    getSoftDeleteFunc(instance) {
      const $this = this;
      return new Promise((resolve, reject) => {
        this.$ajax({
          type: 'delete',
          url: `api/nova/v2.1/servers-inspur/${instance.id}/delete-type?type=soft-delete`,
          log: {
            description: {
              en: `Soft Delete Instance(Instance ID: ${instance.id}, Instance Name: ${instance.name})`,
              zh_cn: `软删除云主机（云主机ID：${instance.id}，云主机名：${instance.name}）`
            },
            key: `name`,
            target: Vue.logTarget.computeInstance
          },
          showErrMsg: true,
          successFun() {
            instance['OS-EXT-STS:task_state'] = 'soft-deleting';
            resolve();
          },
          errFun() {
            reject();
          }
        });
      });
    },
    save() {
      const $this = this;
      if ($this.completelyDelete) {
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
              deleteQueue.push($this.getDeleteFunc(instance));
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
            if (!$this.showCompletelyDelete) {
              $this.handleClose();
            }
          }
        }).catch(() => {
          if (!$this.showCompletelyDelete) {
            $this.handleClose();
          }
        });
      } else {
        $this.saving = true;
        let softDeleteQueue = [];
        for (let instance of $this.instances) {
          softDeleteQueue.push($this.getSoftDeleteFunc(instance));
        }
        Promise.all(softDeleteQueue).then(res => {
          $this.$message.success($this.$t('calcStorLang.SOFT_DELETE_SENT_SUCCESSFULLY'));
          $this.$emit('refresh');
          $this.handleClose();
        }).catch(e => {
          __DEV__ && console.error(e);
          $this.saving = false;
        });
      }
    }
  },
  mounted() {
    if (!this.canSoftDelete) {
      this.completelyDelete = true;
    }
    if (this.roleType === '3') {
      this.save();
    } else {
      this.visible = true;
    }
  },
  computed: {
    canSoftDelete() {
      if (this.roleType === '3') { // 项目用户不可以软删除
        return false;
      }
      if (this.instances.findIndex(instance => instance.status !== 'ACTIVE' && instance.status !== 'SHUTOFF') === -1) { // 如果有非运行且非关机状态的云主机，则不能软删除
        return true;
      } else {
        return false;
      }
    },
    showCompletelyDelete() {
      return this.roleType !== '3';
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
