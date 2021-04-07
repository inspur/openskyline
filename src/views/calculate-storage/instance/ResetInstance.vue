<template>
  <div>
    <el-dialog :title="$t('calcStorLang.RESET_INSTANCE')" :visible="visible" :show-close="false" size="tiny">
      <div>
        <el-table :data="tasks">
          <el-table-column label="ID" prop="id" />
          <el-table-column :label="$t('calcStorLang.RESET_INSTANCE_NAME')" prop="name" />
          <el-table-column :label="$t('calcStorLang.RESET_INSTANCE_STATUS')" align="left">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status === 1" type="primary" :close-transition="true"><i class="el-icon-loading"></i> {{ $t('calcStorLang.RESET_INSTANCE_STATUS_RESETTING') }}</el-tag>
              <el-tag v-if="scope.row.status === 0" type="success" :close-transition="true">{{ $t('calcStorLang.RESET_INSTANCE_STATUS_SUCCESS') }}</el-tag>
              <el-tag v-if="scope.row.status === 2" type="danger" :close-transition="true">{{ $t('calcStorLang.RESET_INSTANCE_STATUS_FAIL') }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close" :loading="saving">{{ saving ? savingTask : $t('lang.close') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    instances: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      visible: false,
      saving: true,
      savingTask: '',
      tasks: []
    };
  },
  methods: {
    close() {
      this.$emit('refresh');
      this.$emit('close');
    },
    async submit() {
      const $this = this;
      $this.saving = true;
      $this.savingTask = $this.$t('calcStorLang.RESET_INSTANCE_STATUS_RESETTING');
      for (let i = 0; i < this.tasks.length; i++) {
        const task = this.tasks[i];
        try {
          const res = await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers-inspur/${task.id}/action`,
            data: JSON.stringify({
              'os-resetState': {
                state: 'active'
              }
            }),
            showErrMsg: false,
            log: {
              description: {
                en: `Reset Instance State (Name: ${task.name} ID: ${task.id})`,
                zh_cn: `重置云主机状态(云主机名：${task.name}，云主机ID：${task.id})`
              },
              target: Vue.logTarget.computeInstance
            }
          });
          task.status = 0;
        } catch (e) {
          task.status = 2;
          __DEV__ && console.error(e);
        }
      }
      $this.saving = false;
      $this.savingTask = $this.$t('calcStorLang.RESET_INSTANCE_CLOSE');
    }
  },
  beforeDestory() {
    this.visible = false;
  },
  mounted() {
    this.visible = true;
    this.instances.forEach(item => {
      this.tasks.push({
        id: item.id,
        name: item.name,
        tenant_id: item.tenant_id,
        status: 1
      });
    });
    this.submit();
  }
};
</script>

<style>

</style>
