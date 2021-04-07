<template >
  <el-dialog :title="$t('lang.SERVER')" :visible.sync="visible">
    <ztree-perf ref="ztreeProcess" @onTreeNodeClick="onTreeNodeClick" ></ztree-perf>
    <!-- <div slot="footer" class="dialog-footer"> -->
      <!-- <el-button type="primary" @click="handleCancel">{{$t('lang.close')}}</el-button> -->
    <!-- </div> -->
  </el-dialog>
</template>
<script>
import ZtreeProcess from './ZtreeProcess'
export default {
  data() {
    return {
      visible: false,
      initFlg: false,
      activeId: ""
    };
  },

  mounted() {
  },

  methods: {
    onTreeNodeClick(treeNode) {
      this.$emit('onTreeNodeClick', treeNode);
    },
    show(id) {
      this.visible = true;
      this.activeId = id;
      if (this.initFlg) {
        return;
      }
      this.initFlg = true;
      this.$nextTick(() => {
        this.$refs.ztreePerf.init(this.activeId);
      })
    },
    handleCancel() {
      this.visible = false;
    }
  },
  components: {
    ZtreeProcess
  }
};
</script>
