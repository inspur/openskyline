<template>
  <el-dialog :title="$t('lang.selectDepartment')" :visible.sync="visible">
    <ztree
      ref="deZtree"
      :data="treeData"
      :setting="setting"
      style="position: relative; min-height: 300px;max-height: 400px;"
      :element-loading-text="$t('base.loadingData')"
    ></ztree>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "",
  data() {
    return {
      visible: false,
      setting: {
        check: {
          enable: false
        },
        data: {
          simpleData: {
            enable: true
          },
          key: {
            name: "name"
          }
        }
      },
      treeData: []
    };
  },
  async mounted() {
    let ret = await this.$ajax({
      type: "get",
      url: "api/keystone/v3/inspur/departments"
    });
    var arr = ret.departments;
    arr.forEach(function(item, key) {
      item.pId = item.parent_id ? item.parent_id : "default";
      item.icon = "./static/img/ztree/department.png";
    });
    arr.unshift({
      id: "default",
      name: Vue.t("base.all"),
      icon: "./static/img/ztree/department.png"
    });
    this.treeData = arr;
    this.$nextTick(() => {
      let node = (node = this.$refs.deZtree.action(
        "getNodesByParam",
        "level",
        0
      )[0]);
      this.$refs.deZtree.action("selectNode", node);
      this.$refs.deZtree.action("expandNode", node);
    });
  },
  methods: {
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      var nodes = this.$refs.deZtree.action("getSelectedNodes");
      if (nodes.length == 0 || (nodes.length > 0 && nodes[0].level == 0)) {
        this.$message({
          message: Vue.t('base.selectDepartmentWarn'),
          type: "warning"
        });
        return;
      }
      this.visible = false;
      let id = nodes[0].id;
      this.$emit(
        "setDepartment",
        id == "default" ? "" : id,
        id == "default" ? "" : nodes[0].name
      );
    }
  }
};
</script>