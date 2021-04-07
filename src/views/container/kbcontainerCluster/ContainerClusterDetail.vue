<template>
  <div>
    <icos-page-header :title="$t('container.kubernetesCluster')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="false" />
    <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick">
      <el-tab-pane name="vm-list" :label="$t('base.clusterInfo')"></el-tab-pane>
      <el-tab-pane name="monitor-info" :label="$t('container.clusterMonitor')"></el-tab-pane>
    </el-tabs>
    <icos-page>
    <container-vm :clusterId="detailRowDataId" :rancherClusterId="rancherClusterId" :projectId="projectId" :projectName='projectName' ref='containervm' v-if="vmlistFlag"></container-vm>
    <container-monitor :clusterUUID="detailRowDataId" :clusterId="rancherClusterId" ref='containermonitor' v-if="monitorFlag"></container-monitor>
    </icos-page>
  </div>
</template>
<script>
import ContainerVm from "./ContainerVmList"
import ContainerMonitor from './ContainerMonitor'
import moment from 'moment'
  export default {
    name: 'ContainerClusterDetail',
    components: {
      ContainerVm, ContainerMonitor
    },
    data () {
      return {
        activeName: 'vm-list',
        loading:false,
        tzTimeFormatter:this.$tzTimeFormatter,
        roleType: Vue.roleType,
        vmlistFlag: true,
        detailRowDataId:this.$route.params.clusterId,
        projectName:this.$route.params.pName,
        rancherClusterId: this.$route.params.rancherclusterId,
        projectId: this.$route.params.projectId,
        monitorFlag: false
      };
    },
    mounted () {
    },
    methods: {
      onTabClick(tab) {
        this.vmlistFlag = false;
        this.monitorFlag = false;
        switch (tab.name) {
          case 'vm-list':
            this.vmlistFlag = true;
            break
          case 'monitor-info':
            this.monitorFlag = true;
            break
          default:
            break
        }
      },
      handlePageHeaderBack () {
        this.$router.push({
        path:"/container/kbcontainerCluster"
      });
      }
    }
  }
</script>

