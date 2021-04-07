<template>
  <el-collapse v-model="activeNames">
    <el-collapse-item name="item">
      <template slot="title">
        {{ $t('operationAnalysis.HEALTH_STATUS_HOST') }}
        <i class="el-icon-fa-exclamation-triangle" v-if="error" />
        <i class="el-icon-loading" v-if="loading" />
        <span v-if="!loading && !error" class="sub-title">{{ $t('operationAnalysis.HEALTH_STATUS_OK_NOT_OK', okCount, midCount + errCount) }}</span>
      </template>
      <el-table :data="tableData" :show-header="false">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-table :data="scope.row.reason[lang]">
              <el-table-column :label="$t('operationAnalysis.HEALTH_STATUS_EXCEPTION_INFO')">
                <template slot-scope="scopeDetail">
                  {{ scopeDetail.row }}
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operationAnalysis.HEALTH_STATUS_RESOURCE_NAME')" prop="resource_id" />
        <el-table-column :label="$t('operationAnalysis.HEALTH_STATUS_RESOURCE_NAME')">
          <template slot-scope="scope">
            {{ status(scope.row.status) }}
          </template>
        </el-table-column>
        <div slot="append" style="padding-left: 50px;">
          <el-button type="text" @click="tableExpand" v-if="totalCount > Constants.MIN_ROW_COUNT && !expanded">
            <i class="el-icon-fa-angle-double-down" /> {{ $t('operationAnalysis.HEALTH_STATUS_EXPAND', totalCount - Constants.MIN_ROW_COUNT) }}
          </el-button>
          <el-button type="text" @click="tableCollapse" v-if="totalCount > Constants.MIN_ROW_COUNT && expanded">
            <i class="el-icon-fa-angle-double-up" /> {{ $t('operationAnalysis.HEALTH_STATUS_COLLAPSE') }}
          </el-button>
        </div>
      </el-table>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
const Constants = {
  STATUS_OK: 1,
  STATUS_MID: 2,
  STATUS_ERR: 3,
  MIN_ROW_COUNT: 10
}
export default {
  name: 'host-health-status',
  props: [],
  data() {
    return {
      Constants,
      allData: [],
      tableData: [],
      expanded: false,
      errCount: 0,
      midCount: 0,
      okCount: 0,
      totalCount: 0,
      loading: true,
      error: false,
      activeNames: [],
      lang: Vue.language
    }
  },
  methods: {
    async load () {
      const $this = this;
      $this.error = false;
      $this.loading = true;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: 'api/pluto/v1/monitor/health/host'
        });

        $this.allData = res.data;
        $this.tableData = $this.allData.slice(0, Constants.MIN_ROW_COUNT);

        $this.okCount = res.ok_count;
        $this.midCount = res.mid_count;
        $this.errCount = res.err_count;
        $this.totalCount = res.total;

        $this.loading = false;
        // $this.activeNames = ['item'];
        $this.$emit('onLoaded', { okCount: res.ok_count, midCount: res.mid_count, errCount: res.err_count, total: res.total, error: false });
      } catch (e) {
        $this.error = true;
        $this.loading = false;
        $this.$emit('onLoaded', { okCount: 0, midCount: 0, errCount: 0, total: 0, error: true });
        __DEV__ && console.error(e);
      }
    },
    tableExpand () {
      const $this = this;
      $this.tableData = $this.allData;
      $this.expanded = true;
    },
    tableCollapse () {
      const $this = this;
      $this.tableData = $this.allData.slice(0, Constants.MIN_ROW_COUNT);
      $this.expanded = false;
    },
    status (value) {
      switch (value) {
        case Constants.STATUS_OK:
          return this.$t('operationAnalysis.HEALTH_STATUS_OK');
        case Constants.STATUS_MID:
          return this.$t('operationAnalysis.HEALTH_STATUS_NOT_OK');
        case Constants.STATUS_ERR:
          return this.$t('operationAnalysis.HEALTH_STATUS_NOT_OK');
        default:
          return '-';
      }
    }
  },
  mounted () {
    const $this = this;
    setTimeout(() => {
      $this.load();
    }, 500);
  }
}
</script>

<style scoped>
.sub-title {
  font-size: 12px;
  color: #9c9c9c;
}
</style>
