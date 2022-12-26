<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="onTabClick"  type="border-card" class="tab-pane-no-padding">
      <el-tab-pane name="overviewrouterNet" :label="$t('network.overview')" />
      <el-tab-pane name="interfacerouterNet" :label="$t('network.interface')" />
      <el-tab-pane name="staticrouterNet" :label="$t('network.staticrouter')" />
    </el-tabs>
    <icos-page>
      <router-view :name="activeName" :router_Id="router_Id" :check_project="check_project" :portName="portName" />
    </icos-page>
  </div>
</template>
<script>
export default {
  name: "RouterDetail",
  components: {},
  data () {
    return {
      activeName: "",
      router_Id: "",
      check_project: "",
      portName: '',
      activeNames: ["1", "2"],
      name: "",
      id: "",
      status: "",
      description: "",
      adminstatus: "",
      area: "",
      networkname: "",
      networkid: "",
      snat: "",
      externalIp: "",
      outgetestatus: false,
      fixedIP: [],
      subnetList: [],
      havefixededip: false
    };
  },
  mounted() {
    // this.onTabClick("overviewrouterNet");
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'overviewrouterNet':
          this.activeName = "overviewrouterNet";
          break
        case 'interfacerouterNet':
          this.activeName = "interfacerouterNet";
          break
        case 'staticrouterNet':
          this.activeName = "staticrouterNet";
          break
        default:
          this.activeName = "overviewrouterNet";
      }
    },
    initRouterDetail(id, chechproject, name) {
      this.router_Id = id;
      this.check_project = chechproject;
      this.portName = name;
      this.onTabClick("");
      this.onTabClick("overviewrouterNet");
    }
  }
}
</script>
