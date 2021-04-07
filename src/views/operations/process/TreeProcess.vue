<template>
  <div>
    <el-card style="position: relative; height: 150px; width: 600px; overflow: auto;" >
      <el-tree
        class="filter-tree"
        :data="data2"
        :props="dprops"
        node-key="id"
        show-checkbox
        default-expand-all
        ref="treeType">
      </el-tree>
    </el-card>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  name: 'treeProcess',
  data() {
    return {
      data2: [{
        id: 1,
        label: this.$t('opt.allResType'),
        children: []
      }],
      dprops: {
        label: 'label',
        children: 'children'
      },
      selected: ["123"]
    };
  },
  mounted() {
    this.getResourceTypeList();
  },
  methods: {
    async getResourceTypeList() {
      var self = this;
      var resultData = [];
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/leo/v1/resource/get_flow_resource"
        });
        let resources = ret.resource;
        for (let i = 0; i < resources.length; i++) {
          let type = resources[i];
          let name = "";
          if (type['resource_type'] == 'VM') {
            name = self.$t('opt.cloudHost');
          } else if (type['resource_type'] == 'VOLUME') {
            name = self.$t('opt.cloudHardDisk');
          } else if (type['resource_type'] == 'HOST'&&Vue.service.ironic) {
            name = self.$t('opt.cloudPhysicalHost');
          }
          if (name) {
            // if (Vue.roleType + "" === "2" && type['resource_type'] === 'HOST') {
            //   continue;
            // }
            resultData.push({
              id: type['id'],
              label: name
            })
          }
        }
        this.data2[0].children = resultData;
      } catch (data) {
        self.loading = false;
      }
    },
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

        self.data = treeData;
        self.$nextTick(() => {
              //TODO
        });
      } catch (data) {
        self.$message.error(Vue.t('opt.getTreeDataFail'));
      }
    },
    getTreeNodeId() {
      let nodeId = this.$refs.treeType.getCheckedNodes();
      let typeResult = "";
      if (nodeId != "" && nodeId != null) {
        for (var i = 0; i < nodeId.length; i++) {
          if (i == 0) {
              typeResult += nodeId[i].id;
          } else {
              typeResult += "," + nodeId[i].id;
          }
        }
        return typeResult;
      } else {
        this.$notify({
          message: this.$t('opt.resourceTypeCannotEmpty'),
          type: "warning"
        });
        return false;
      }
    }
  }
}
</script>
<style scoped>
</style>
