<!-- 潘启宝 2020年10月23日 16:45:05 中国济南 -->
<template>
  <div class="detection" v-loading="loading">
    <el-table v-loading="tableLoading" :data="tableData" border style="width:100%">
      <el-table-column prop="class" :label="$t('base.resouceType')">
        <template slot-scope="scope">
          <span>{{isCN?scope.row.class.name_cn:scope.row.class.name_en}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="metrics" :label="$t('operationAnalysis.METRICE')">
        <template slot-scope="scope">
          <span>{{isCN?scope.row.metrics.name_cn:scope.row.metrics.name_en}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="seasonl" :label="$t('operationAnalysis.SEASON')">
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.seasonl"
            @change="seasonlChange"
            filterable
            :disabled="isTrain"
          >
            <el-option
              v-for="(v, i) in scope.row.seasonls"
              :key="i"
              :label="v.name"
              :value="v.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="operating" :label="$t('base.operating')">
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="saveClick(scope)"
            size="small"
            :disabled="isTrain"
          >{{$t('base.save')}}</el-button>
          <el-button
            type="text"
            @click="trainClick(scope)"
            size="small"
            :disabled="isTrain"
          >{{scope.row.operating.text}}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top:15px;">
      {{isCN?'提示：若不点击“训练”按钮则后台任务进行定时训练，点击“训练”按钮进行即时训练':"notice: If you dont't click the training button,the background task will be given regular training, and click the training button button for instant training."}}
    </div>
    <div style="margin-top:15px;">
      {{isCN?'如果页面置灰表示后台有训练任务正在训练，不允许操作，训练结束后将恢复可操作状态。':"if the page is grayed out, it means that there is training data in the background."}}
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  name: "setting",
  components: {},
  data() {
    return {
      isCN: String(Vue.config.lang) === "zh-cn",
      loading: false,
      tableLoading: false,
      isTrain: false,
      tableData: [],
      setTimeoutID: 0,
      operating: null
    };
  },
  watch: {
    $route(to, from) {}
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {});
  },
  beforeRouteUpdate(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  created() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  beforeDestroy() {
    clearTimeout(this.setTimeoutID);
  },
  mounted() {
    this.loadData();
    this.getTrainStats();
  },
  computed: {
    ...mapGetters({})
  },
  methods: {
    async saveClick(v) {
      const r = await this.$ajax({
        type: "get",
        url: `api/earth/ntd/tp/update`,
        data: {
          class_id: v.row.class.id,
          metrics_id: v.row.metrics.id,
          seasonl: v.row.seasonl
        },
        log: {
          description: {
            // en:"Save:"+ en,
            zh_cn: "保存-class_id:" + v.row.class.id
          },
          target: Vue.logTarget.operationAnalysis
        }
      });
      if (r.data === "ok") {
        this.$notify({
          title: Vue.t("base.prompt"),
          type: "success",
          message: Vue.t("base.saveSuccess")
        });
      } else {
        // fail
        this.$notify({
          title: Vue.t("base.prompt"),
          type: "error",
          message: this.isCN ? "保存失败" : "failed"
        });
      }
    },
    async trainClick(v) {
      this.operating = v.row.operating;
      this.operating.text = this.isCN ? '训练中' : 'training';
      this.isTrain = true;
      const r = await this.$ajax({
        type: "get",
        url: `api/earth/ntd/tp/train`,
        data: {
          class_id: v.row.class.id,
          metrics_id: v.row.metrics.id,
          seasonl: v.row.seasonl
        },
        log: {
          description: {
            // en:"Save:"+ en,
            zh_cn: "训练-class_id:" + v.row.class.id
          },
          target: Vue.logTarget.operationAnalysis
        }
      });
      // this.isTrain = false;
      // if (r.data === "ok") {
      //   this.$notify({title: Vue.t('base.prompt'), type: 'success', message: this.isCN ? '训练完成' : 'train success'});
      // } else {
      //   this.$notify({title: Vue.t('base.prompt'), type:'error', message: this.isCN ? '训练失败' : 'failed'});
      // }
    },
    async getTrainStats(v) {
      const r = await this.$ajax({
        type: "get",
        url: `api/earth/ntd/tp/train_stats`,
        data: {}
      });

      let data = r.data || '';
      if (data.toLowerCase() === 'ok') {
        this.isTrain = false;
        this.operating && (this.operating.text = this.$t('operationAnalysis.TRAIN'));
        // this.$notify({title: Vue.t('base.prompt'), type: 'success', message: this.isCN ? '训练完成' : 'train success'});
      } else if (data.toLowerCase() === 'training') {
        this.isTrain = true;
        // this.operating && (this.operating.text = this.isCN ? '训练中' : 'training');
      }

      clearTimeout(this.setTimeoutID);
      this.setTimeoutID = setTimeout(() => {
        this.getTrainStats();
      }, 3000);
    },
    seasonlChange() {},
    async loadData() {
      this.tableLoading = true;
      const r = await this.$ajax({
        type: "get",
        url: `api/earth/ntd/tp/params`
      });
      let d = r.data || [];
      d.forEach((v) => {
        v.seasonls = [
          { name: Vue.t("operationAnalysis.PREDICT_12H"), value: "12h" },
          { name: Vue.t("operationAnalysis.PREDICT_24H"), value: "24h" },
          { name: Vue.t("operationAnalysis.PREDICT_1W"), value: "1w" },
          { name: Vue.t("operationAnalysis.PREDICT_UNLIMIT"), value: "0" }
        ];
        v.operating = {
          text : this.$t('operationAnalysis.TRAIN')
        };
      });
      this.tableData = d;
      this.tableLoading = false;
    }
  }
};
</script>

 <style scoped>
div >>> .el-button.is-disabled,
div >>> .el-button.is-disabled:focus,
div >>> .el-button.is-disabled:hover {
  color: #ccc;
}
</style>



