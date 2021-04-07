<template>
  <el-dialog :title="$t('storage.chooseCatalog')" :visible.sync="visible" v-dialogDrag size="tiny">
    <ztree
      ref="deZtree"
      :data="treeData"
      :setting="setting"
      style="position: relative; min-height: 100px;max-height: 150px;"
      :element-loading-text="$t('lang.loading')">
    </ztree>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"getPath",
  props:["selectContainerName"],
  data() {
    return {
      visible:false,
      setting: {
        check : {
          enable : false
        },
        data : {
          simpleData : {
            enable : true
          },
          key:{
            name:"name"
          }
        }
      },
      treeData:[]
    }
  },
  mounted() {
    this.loadCatalogList(this.selectContainerName);
  },
  methods:{
    show() {
      this.visible = true;
      this.loadCatalogList(this.selectContainerName);
    },
    hide() {
      this.visible = false;
    },
    async loadCatalogList(containerName) {
      //this.treeLoading = true;
      var self = this;
      var allListData = [];
      var roleType = Vue.roleType + "";
      var projectId = this.$cookie.get('pid');
      var url = "api/swift/v1/" + projectId + "/" +containerName+"?format=json";
      if ("2" == roleType || "3" == roleType) { //超级
        url = "api/swift/v1/" + projectId + "/" +containerName+"?format=json";
      }
      try {
        let result = await self.$ajax({
          type: 'GET',
          url: url,
          showErrMsg: true
        });
        allListData = result;
        var arr =[];
        for (var i = 0; i < allListData.length; i++) {
          let objectData = allListData[i];
          let name = objectData.name;
          if ((name.substr(name.length-1, 1)) == "/") {
            arr.push(objectData);
          }
        }
        arr.forEach(function(item, key) {
               item.id = item.name;
               item.pId = item.parent_id?item.parent_id:"default";
               item.icon = './static/img/ztree/department.png';
            });
        arr.unshift({id:"default", name:this.$t('storage.rootPath'), icon:"./static/img/ztree/department.png"});
        this.treeData = arr;
        this.$nextTick(() => {
          let node = node = this.$refs.deZtree.action('getNodesByParam', "level", 0)[0];
          this.$refs.deZtree.action("selectNode", node);
          this.$refs.deZtree.action("expandNode", node);
        });
      } catch (res) {
      }
    },
    confirmFun() {
      var nodes = this.$refs.deZtree.action("getSelectedNodes");
      // if (nodes.length==0||(nodes.length>0&&nodes[0].level==0)) {
      //   this.$message({
      //     message: this.$t('storage.pleaseChooseOneCatalog'),
      //     type: "warning"
      //   });
      //   return;
      // }
      this.visible = false;
      let id = nodes[0].id;
      this.$emit("setPath", id, nodes[0].name);
    }
  }
}
</script>