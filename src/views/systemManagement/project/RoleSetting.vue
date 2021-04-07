<template>
  <el-dialog :title="title" :visible.sync="visible">
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "newDepart",
  data() {
    return {
      visible: false,
      title: Vue.t("base.SETING_ROLE")
    };
  },
  mounted() {},
  methods: {
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      this.visible = false;
    }
  }
};
</script>