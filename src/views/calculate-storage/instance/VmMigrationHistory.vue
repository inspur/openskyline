<template>
  <div>
    <el-table :data="histories" v-loading="loading" :default-sort="{prop: 'created_at', order: 'ascending'}">
      <el-table-column :label="$t('calcStorLang.VM_MIGRATION_TYPE')" align="left">
        <template slot-scope="scope">
          {{ scope.row.migration_type | migrationType }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.VM_MIGRATION_RESULT')" width="100" align="left">
        <template slot-scope="scope">
          <el-tag v-if="['finished'].findIndex(item => item === scope.row.status) > -1" type="warning" :close-transition="true">{{ $t('calcStorLang.VM_MIGRATION_RESULT_NOT_CONFIRMED') }}</el-tag>
          <el-tag v-if="['completed', 'confirmed', 'done'].findIndex(item => item === scope.row.status) > -1" type="success" :close-transition="true">{{ $t('calcStorLang.VM_MIGRATION_RESULT_SUCCESS') }}</el-tag>
          <el-tag v-if="['error'].findIndex(item => item === scope.row.status) > -1" type="danger" :close-transition="true">{{ $t('calcStorLang.VM_MIGRATION_RESULT_FAIL') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.VM_MIGRATION_SOURCE_NODE')" align="left">
        <template slot-scope="scope">
          {{ scope.row | sourceNode }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.VM_MIGRATION_DEST_NODE')" align="left">
        <template slot-scope="scope">
          {{ scope.row | destNode }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.VM_MIGRATION_START_TIME')" prop="created_at" align="left" sortable>
        <template slot-scope="scope">
          {{ scope.row.created_at | timeFormat }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.VM_MIGRATION_TIME_CONSUMING')" align="left">
        <template slot-scope="scope">
          {{ calcTimeDiff(scope.row.created_at, scope.row.updated_at) }} s
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'VmMigrationHistory',
  props: ['instanceId'],
  data() {
    return {
      loading: false,
      histories: []
    }
  },
  methods: {
    async loadHistories() {
      const $this = this;
      $this.loading = true;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/os-migrations?instance_uuid=${$this.instanceId}`,
          headers: {
            'OpenStack-API-Version': 'compute 2.41',
            'X-OpenStack-Nova-API-Version': 2.41
          }
        })
        // 过滤掉不成功的迁移
        $this.histories = res.migrations.filter(item => item.status === 'completed' || item.status === 'confirmed' || item.status === 'finished' || item.status === 'done' || item.status === 'error');
        // 过滤掉resize且源主机等于目标主机的
        $this.histories = $this.histories.filter(item => !(item.migration_type === 'resize' && item.source_node === item.dest_node));
        $this.loading = false;
      } catch (e) {
        console.log(e);
        $this.$message.error(Vue.t('calcStorLang.VM_MIGRATION_FETCH_ERR'));
        $this.loading = false;
      }
    },
    calcTimeDiff(start, end) {
      const startMoment = moment(start);
      const endMoment = moment(end);
      return endMoment.diff(startMoment, 'seconds');
    }
  },
  filters: {
    migrationType(type) {
      switch (type) {
        case 'live-migration':
          return Vue.t('calcStorLang.VM_MIGRATION_TYPE_LIVE_MIGRATION');
        case 'migration':
          return Vue.t('calcStorLang.VM_MIGRATION_TYPE_MIGRATION');
        case 'resize':
          return Vue.t('calcStorLang.VM_MIGRATION_TYPE_RESIZE');
        case 'evacuation':
          return Vue.t('calcStorLang.VM_MIGRATION_TYPE_EVAVTUE');
        default:
          return '-';
      }
    },
    sourceNode(migrationHistory) {
      if ('source_node' in migrationHistory && migrationHistory.source_node !== null) {
        return migrationHistory.source_node;
      }
      if ('source_compute' in migrationHistory && migrationHistory.source_compute !== null) {
        return migrationHistory.source_compute;
      }
      return '-'
    },
    destNode(migrationHistory) {
      if ('dest_node' in migrationHistory && migrationHistory.dest_node !== null) {
        return migrationHistory.dest_node;
      }
      if ('dest_compute' in migrationHistory && migrationHistory.dest_compute !== null) {
        return migrationHistory.dest_compute;
      }
      return '-'
    },
    timeFormat(utc) {
      return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
    }
  },
  watch: {
    instanceId(newValue) {
      this.loadHistories();
    }
  },
  mounted() {
    const $this = this
    $this.loadHistories();
  }
}
</script>

<style>

</style>
