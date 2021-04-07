<template>
  <el-dialog
    :title="$t('lang.modify')+$t('monitor.alias')"
    :visible.sync="visible"
    class="tag-dialog"
    @close="close"
  >
    <el-form :inline="true" :model="data" :rules="rules" ref="form">
      <el-form-item :label="$t('monitor.alias')" prop="text">
        <el-input v-model="data.text"></el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="close">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirm" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { utils } from "../../public/utils";
export default {
  name: "IcosEditTag",
  props: {},
  components: {},
  watch: {
    $route(to, from) {},
    "data.xxx": function(v) {}
  },
  computed: {},
  data() {
    return {
      visible: false,
      saving: false,
      rules: {
        text: [
          { type: "maxSize", value: 40 },
          { type: "onlyLetter_NumberChinese", value: 40 }
        ]
      },
      data: {
        text: "",
        oldText: ""
      }
    };
  },
  created() {},
  mounted() {},
  methods: {
    close(v) {
      this.visible = false;
      this.$emit("handler", { type: "close", data: this.data });
    },
    show(v) {
      let t = v.tag.text || "";
      Object.assign(this.data, v, { text: t, oldText: t });
      this.visible = true;
      this.$emit("handler", { type: "show", data: this.data });
    },
    confirm(v) {
      this.$refs["form"].validate(v => {
        if (!v) {
          return;
        }
        this.close();
        this.editTag(this.data);
      });
    },
    editTag(v = {}) {
      let vm = this;
      let ldnc = vm.data.logDescNameCN || "";
      let ldne = vm.data.logDescNameEN || "";
      let iid = vm.data.resourceID || "";
      let text = vm.data.oldText;
      vm.saving = true;
      vm.$ajax({
        url: "api/pluto/v1/monitor/resources/info/base",
        data: JSON.stringify({
          resources: [v["resourceID"]],
          params: {
            tags: v["text"]
          }
        }),
        type: "patch",
        log: {
          description: {
            en: `Update ${ldne}(${iid}) Alias From: ${text} To ${v["text"]}`,
            zh_cn: `修改${ldnc}（${iid}）的别名：${text}为${v["text"]}`
          },
          target: Vue.logTarget.resourceMonitor
        },
        successFun(data) {
          vm.saving = false;
          vm.$emit("handler", { type: "success", data: vm.data });
          vm.$message({
            showClose: true,
            message: Vue.t("base.saveSuccess"),
            type: "success"
          });
        },
        errFun() {
          vm.saving = false;
          vm.$emit("handler", { type: "error", data: vm.data });
          vm.$message({
            showClose: true,
            message: Vue.t("monitor.TAG_EDIT_FAILED"),
            type: "error"
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.tag-dialog {
  overflow: hidden;
  text-align: center;
}
.tag-dialog::after {
  content: "";
  display: inline-block;
  vertical-align: middle;
  height: 100%;
  width: 0;
}
.tag-dialog >>> .el-dialog {
  width: 320px;
  display: inline-block;
  vertical-align: middle;
  position: unset;
  transform: unset;
  margin-bottom: unset;
  text-align: left;
}
.tag-dialog >>> .el-dialog__body {
  text-align: center;
}
.tag-dialog >>> .el-dialog__body .el-form-item__error {
  text-align: left;
}
.tag-dialog >>> .el-form .el-form-item .el-form-item__label {
  cursor: unset;
}
.tag-dialog >>> .el-form .el-form-item {
  margin-bottom: 20px;
  display: block;
}
.tag-dialog >>> .el-button.el-button--default:not(.el-button--primary):hover {
  background-color: #fff;
}
</style>