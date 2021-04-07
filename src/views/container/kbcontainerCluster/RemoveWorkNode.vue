<template>
  <div>
    <el-dialog :title="$t('container.removeNode')" :visible.sync="visible" :before-close="cancel" v-dialogDrag>
      <el-form ref="addNodeForm" :model="addNodeForm" :rules="rules" class="margin-tb20 me-required-form" v-loading="loading" label-width="140px">
        <el-form-item :label="$t('container.oldMasterNumber')">
          <el-input class="col-12" v-model="addNodeForm.master_count" auto-complete="off" disabled></el-input>
        </el-form-item>
       <el-form-item :label="$t('container.oldNodeCount')">
          <el-input class="col-12" v-model="addNodeForm.worker_count" auto-complete="off" disabled></el-input>
        </el-form-item>
        <el-form-item :label="$t('container.removeNodeNumber')" prop="size" class="is-required">
          <el-input class="col-12" v-model="addNodeForm.size" auto-complete="off" :disabled="sizeDisabled"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button @click="submitForm" type="primary" :loading="loading">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "AddNode",
  props: ["clusterInfo"],
  data() {
    return {
      addNodeForm: {
        size: 1,
        master_count: this.clusterInfo.master_count,
        worker_count: this.clusterInfo.worker_count
      },
      visible: true,
      sizeDisabled: false,
      rules: {
        size: [
          { type: "integer" },
          { type: 'required', trigger: 'blur change' },
          { type: "min", value: 1 },
          { type: "max", value: this.clusterInfo.worker_count-1 }
        ]
      },
      loading: false
    };
  },
  mounted() {
    if (this.clusterInfo.worker_count == 2) {
      this.size = 1;
      this.sizeDisabled = true;
    }
  },
  methods: {
    submitForm() {
      this.$refs.addNodeForm.validate(async valid => {
        if (valid) {
          try {
            let self = this;
            let leftNode = parseInt(this.clusterInfo.worker_count) - parseInt(this.addNodeForm.size);
            if ( leftNode < 1 ) {
              self.$message.error(Vue.t('container.removeworkNote'));
              return;
            }
            let body = {
              cluster_id: this.clusterInfo.uuid,
              worker_count: leftNode,
              project_id: self.$cookie.get('pid')
            };
            this.loading = true;
            let ret = await this.$ajax({
              url: "api/cetus/v1/cluster/modify_cluster_node",
              data: JSON.stringify(body),
              type: "POST",
              log: {
                description: {
                  en: `cluster:${this.clusterInfo.name},add ${this.addNodeForm.size} nodes`,
                  zh_cn: `集群${this.clusterInfo.name},减少${this.addNodeForm.size}个节点`
                },
                target: Vue.logTarget.containerCluster
              },
              successFun:(response) => {
                this.$message({
                  showClose: true,
                  message: Vue.t('container.dontRepeatSubmit'),
                  type: 'warning'
                });
              }
            });
            this.loading = false;
            this.$emit("cancelAddNode", {});
            this.$emit("refreshData", {});
          } catch (data) {
            this.loading = false;
            __DEV__ && console.error(data);
          }
        }
      });
    },
    cancel() {
      var self = this;
      this.$emit("cancelAddNode", {});
    }
  }
};
</script>
