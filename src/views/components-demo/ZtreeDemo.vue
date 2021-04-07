<template>
  <div>
  <ztree
    ref="rmZtree"
    :data=data
    :setting="setting"
    :extraSetting="extraSetting"
    ></ztree>
    <audio src="static/sound/alarm1.mp3" controls="controls">
    </audio>
  </div>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: 'ZtreeDemo',
  data() {
    return {
      setting: {
        view: {
          addHoverDom: this.addHoverDom,
          removeHoverDom: this.removeHoverDom,
          selectedMulti: false
        },
        edit: {
          enable: true,
          editNameSelectAll: false,
          showRemoveBtn: this.showRemoveBtn,
          showRenameBtn: this.showRenameBtn
        },
        data: {
          simpleData: {
            enable: true
          }
        },
        callback: {
          onClick: this.onClick,
          beforeEditName: this.beforeEditName,
          beforeRemove: this.beforeRemove,
          beforeRename: this.beforeRename,
          onRename: this.onRename
        }
      },
      data: [
        {id: 1, pId: 0, name: "父节点1 - 展开", open: true},
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
        {id:3, pId:0, name:"父节点3 - 没有子节点", isParent:true}
      ],
      extraSetting: {}
    }
  },
  mounted() {
    let rmZtree = this.$refs.rmZtree;
  },
  methods: {
    onClick(event, treeId, treeNode, clickFlag) {
      this.$message.warning("TreeNode: " + treeNode.name);
    },
    beforeRemove(treeId, treeNode) {
      this.$confirm("确认删除 节点 -- " + treeNode.name + " 吗？", '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.rmZtree.action('removeNode', treeNode);
        this.$message.warning("当前删除节点: " + treeNode.name);
      }).catch(() => {
      });
    },
    beforeEditName(treeId, treeNode) {
      this.$refs.rmZtree.action('selectNode', treeNode);
      if (treeNode.id == 1) {
        this.$message.error(Vue.t('lang.thisNodecannotRename'));
        return false;
      }
      return true;
    },
    beforeRename(treeId, treeNode, newName, isCancel) {
      let self = this;
      var reg = /^[_\-0-9a-zA-Z\u4e00-\u9fa5\ ]+$/;
      if (newName.length == 0) {
        this.$message.error(Vue.t('lang.thisNodeNameisnotNull'));

        setTimeout(function() {
          self.$refs.rmZtree.action('editName', treeNode);
        }, 10);
        return false;
      } else if (newName.length > 20) {
        this.$message.error(Vue.t('lang.thisNodeNameisnotexpandtenwty'));
        return false;
      } else if (reg.test(newName) == false) {
        this.$message.error(Vue.t('lang.businessNameRequired'));
        return false;
      }
      return true;
    },
    onRename(e, treeId, treeNode, isCancel) {
      this.$message.warning("当前编辑的节点: " + treeNode.name);
    },
    addHoverDom(treeId, treeNode) {
      var sObj = $("#" + treeNode.tId + "_span");
      if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
      var addStr = "<span class='button add_node'id='addBtn_" +
        treeNode.tId + "' title='add node' onfocus='this.blur();'></span>";
      sObj.after(addStr);
      var btn = $("#addBtn_"+treeNode.tId);
      if (btn) {
        btn.bind("click", () => {
          let newNodes = this.$refs.rmZtree.action('addNodes', treeNode, {
            id: '',
            pId: treeNode.id,
            name: "new node"
          });
          if (newNodes) {
            this.$refs.rmZtree.action('editName', newNodes[0]);
          }
          return false;
        });
      }
    },
    removeHoverDom(treeId, treeNode) {
      $("#addBtn_"+treeNode.tId).unbind().remove();
    },
    showRemoveBtn(treeId, treeNode) {
      return !treeNode.isFirstNode;
    },
    showRenameBtn(treeId, treeNode) {
      return !treeNode.isLastNode;
    }
  }
}
</script>
<style scoped>
</style>
