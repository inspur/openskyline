<template>
  <el-card style="position: relative; height: 150px; width: 600px; overflow: auto;" >
    <ztree
      ref="ztree"
      :data="data"
      :setting="setting"
      :extraSetting="extraSetting"
      ></ztree>
    <h2 style="text-align: center; min-height: 600px;" v-if="!data || data.length<0">{{emptyText}}</h2>
  </el-card>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  name: 'ZtreeProcess',
  props: {
    currentId: {
      type: String,
      default: ""
    },
    selectNode: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      setting:  {
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
        },
        callback: {
          beforeClick: this.beforeClick,
          onClick: this.onTreeNodeClick
        },
        view: {
          // fontCss: {
          //   color: "white"
          // }
        }
      },
      data: [{id: 1, pId: 0, name: "父节点1 - 展开", open: true},
        {id:11, pId:1, name:"父节点11 - 折叠"},
        {id:111, pId:11, name:"叶子节点111"},
        {id:112, pId:11, name:"叶子节点112"},
        {id:113, pId:11, name:"叶子节点113"},
        {id:114, pId:11, name:"叶子节点114"},
        {id:12, pId:1, name:"父节点12 - 折叠"},
        {id:121, pId:12, name:"叶子节点121"},
        {id:122, pId:12, name:"叶子节点122"},
        {id:123, pId:12, name:"叶子节点123"},
        {id:124, pId:12, name:"叶子节点124"},
        {id:13, pId:1, name:"父节点13 - 没有子节点", isParent:true},
        {id:2, pId:0, name:"父节点2 - 折叠"},
        {id:21, pId:2, name:"父节点21 - 展开", open:true},
        {id:211, pId:21, name:"叶子节点211"},
        {id:212, pId:21, name:"叶子节点212"},
        {id:213, pId:21, name:"叶子节点213"},
        {id:214, pId:21, name:"叶子节点214"},
        {id:22, pId:2, name:"父节点22 - 折叠"},
        {id:221, pId:22, name:"叶子节点221"},
        {id:222, pId:22, name:"叶子节点222"},
        {id:223, pId:22, name:"叶子节点223"},
        {id:224, pId:22, name:"叶子节点224"},
        {id:23, pId:2, name:"父节点23 - 折叠"},
        {id:231, pId:23, name:"叶子节点231"},
        {id:232, pId:23, name:"叶子节点232"},
        {id:233, pId:23, name:"叶子节点233"},
        {id:234, pId:23, name:"叶子节点234"},
        {id:3, pId:0, name:"父节点3 - 没有子节点", isParent:true}],
      extraSetting: {},
      newCount: 1,
      loading: false,
      emptyText: this.$t('lang.noresource')
    }
  },
  mounted() {
  },
  methods: {
    async init(id) {
      var self = this;
      self.loading = true;
      try {
        let data = await self.$ajax({
          type: 'get',
          data: {},
          url: "api/icloudmonitor/v1/performance/resourceclass/" + id + "/resourcegrp/tree"
        });
        self.loading = false;
        var treeData = data.resData;
        if (!treeData) {
          self.data = [];
          return;
        }
        treeData.forEach((node, index) => {
          node['treeShow'] = node["name"];
          if (node.protoType == "resource") {
            node['iconSkin'] = "resource";
          } else if (node.protoType == "group") {
            node['iconSkin'] = "group";
          } else if (node.protoType == "root") {
            node['iconSkin'] = "type";
          }
        });

        if (treeData.length == 1) {
          treeData[0].isParent = false;
          treeData[0]['treeShow'] = treeData[0]["name"];
          treeData[0]['iconSkin'] = "type";
        }

        self.data = treeData;
        self.$nextTick(() => {
          self.$refs.ztree.action('expandAll', true);
          var nodes = self.$refs.ztree.action('getNodes');
          var firstSelected = nodes[0];
          var error = false;
          while (firstSelected.protoType == "root" || firstSelected.protoType == "group") {
            try {
              firstSelected = firstSelected.children[0];
            } catch (e) {
              error = true
              break;
            }
          }
          // self.$refs.ztree.action('selectNode', firstSelected);
          if (!error) {
            // self.$emit("onTreeNodeClick", firstSelected);
          }
        });
      } catch (data) {
        self.$message.error(Vue.t('lang.getTreeDataFail'));
      }
    },
    onTreeNodeClick(event, treeId, treeNode, clickFlag) {
      // var zTree = $.fn.zTree.getZTreeObj(treeId);
      var Info = treeNode["Info"];
      window.sessionStorage.monitorRightDiy = "";
      window.sessionStorage.treeIdOfMonitorView = treeNode.id;
      this.$emit("onTreeNodeClick", treeNode);
    },
    beforeClick(treeId, treeNode, clickFalg) {
      if (treeNode.protoType == "root"||treeNode.protoType == "group") {
        return false;
      }
      return true;
    }
  }
}
</script>
<style scoped>
</style>
