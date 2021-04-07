<template>
  <div style="height: 100%;width:100%;position: relative;">
    <el-row style="height:100%;" :gutter="5">
      <el-col style="height:100%;" :span="3">
        <div class="vir-part">
          <div class="vir-part-t">{{projectNum}}</div>
          <div class="vir-part-b">{{$t('base.project')}}</div>
        </div>
      </el-col>
      <el-col style="height:100%;" :span="3">
        <div class="vir-part">
          <div class="vir-part-t">{{vmNum}}</div>
          <div class="vir-part-b">{{$t('base.cloudHost')}}</div>
        </div>
      </el-col>
      <el-col style="height:100%;" :span="3">
        <div class="vir-part">
          <div class="vir-part-t">{{networksNum}}</div>
          <div class="vir-part-b">{{$t('base.network')}}</div>
        </div>
      </el-col>
      <el-col style="height:100%;" :span="3">
        <div class="vir-part">
          <div class="vir-part-t">{{userNum}}</div>
          <div class="vir-part-b">{{$t('base.user')}}</div>
        </div>
      </el-col>
      <el-col style="height:100%;" :span="3">
        <div class="vir-part">
          <div class="vir-part-t">{{firewallNum}}</div>
          <div class="vir-part-b">{{$t('base.firewall')}}</div>
        </div>
      </el-col>
      <el-col style="height:100%;" :span="3">
        <div class="vir-part">
          <div class="vir-part-t">{{lbNum}}</div>
          <div class="vir-part-b">{{$t('network.balance')}}</div>
        </div>
      </el-col>
      <el-col style="height:100%;" :span="3">
        <div class="vir-part">
          <div class="vir-part-t">{{volumeNum}}</div>
          <div class="vir-part-b">{{$t('base.cloudDisk')}}</div>
        </div>

      </el-col>
      <el-col style="height:100%;" :span="3">
        <div class="vir-part">
          <div class="vir-part-t">{{imageNum}}</div>
          <div class="vir-part-b">{{$t('base.image')}}</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  name:"resourceStatistics",
  data() {
    return {
      projectNum:"1",
      userNum:0,
      vmNum:0,
      imageNum:0,
      volumeNum:0,
      networksNum:0,
      firewallNum:0,
      lbNum:0
    }
  },
  mounted() {
    this.getProjectList();
    this.getUserList();
    this.getVmList();
    this.getLblanceList();
    this.getImageList();
    this.getVolumeNum();
    this.getNetworkNum();
    setTimeout(() => {
      this.getProjectList();
      this.getUserList();
      this.getVmList();
      this.getLblanceList();
      this.getImageList();
      this.getVolumeNum();
      this.getNetworkNum();
      }, 10000);
  },
  methods:{
    getProjectList() {
      let self = this;
      let projectUrl = "api/keystone/v3/inspur/projects?" + $.param({limit:1, page:1, domain_id:"default"});
      if (Vue.roleType!="0") {
        //项目个数，租户为1
        self.projectNum = "1";
      } else {
        //项目个数，超级管理员
        self.$ajax({
          type: 'get',
          url: projectUrl,
          successFun(data) {
            if (data) {
              self.projectNum = data.total;
            } else {
              self.projectNum = "-"
            }
          }
        });
      }
    },
    async getUserList() {
      let self = this;
      let pid = this.$cookie.get('pid');
      if (Vue.roleType=="2") {
        await self.$ajax({
          type: 'get',
          url: 'api/keystone/v3/inspur/assignments/projects/' + pid + '/users',
          successFun(data) {
            if (data) {
              self.userNum = data.users.length;
            } else {
              self.userNum = "-";
            }
          }
        })
      } else if (Vue.roleType == "3") {
        self.userNum = "1";
      } else {
        await self.$ajax({
          type: 'get',
          url: "api/keystone/v3/inspur/users?"+ $.param({limit:1, page:1, domain_id:"default"}),
          successFun(data) {
            if (data) {
              self.userNum = data.total;
            } else {
              self.userNum = "-";
            }
          }
        })
      }
    },
    async getVmList() {
      let self = this;
      let pid = this.$cookie.get('pid');
      let novaUrl = "api/nova/v2.1/servers-inspur/detail?all_tenants=1&limit=99999999&not-tags=%40";
      if (Vue.roleType!="0") {
        novaUrl = "api/nova/v2.1/servers-inspur/detail?limit=99999999&not-tags=%40&project_id="+pid;
      }
      await self.$ajax({
        type: 'get',
        url: novaUrl,
        headers: {
          'X-OpenStack-Nova-API-Version': 2.67
        },
        successFun(data) {
          if (data && data.all_instances_info) {
            self.vmNum = data.all_instances_info.total_instances;
          } else {
            self.vmNum = "-"
          }
        }
      });
    },
    async getLblanceList() {
      let self = this;
      let pid = this.$cookie.get('pid');
      let lbanceUrl = "api/octavia/v2.0/lbaas/loadbalancers";
      if (Vue.roleType!="0") {
        lbanceUrl = "api/octavia/v2.0/lbaas/loadbalancers?project_id="+ pid;
      }
      await self.$ajax({
        type: 'get',
        url: lbanceUrl,
        successFun(data) {
          if (data) {
            self.lbNum = data.loadbalancers.length;
          } else {
            self.lbNum = 0;
          }
        }
      });
    },
    async getImageList() {
      let self = this;
      await self.$ajax({
        type: 'get',
        url: "api/glance/v2/images?limit=99999",
        successFun(data) {
          let images = data.images;
          let num = 0;
          for (let i = 0; i < images.length; i++) {
            let image = images[i];
            if (image['name'].indexOf("Bare@") >= 0) {
              continue;
            }
            if ("snapshot" == image['image_type'] || "backup" == image['image_type'] || typeof (image['block_device_mapping']) != "undefined") {
              continue;
            }
            num++;
          }
          self.imageNum = num;
        }
      });
    },
    async getVolumeNum() {
      let pid = this.$cookie.get('pid');
      let self = this;
      if (Vue.roleType == "0") {
        await self.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/"+pid+"/inspur-volumes/inspur/volumecount?all_tenants=True",
          successFun(data) {
            if (data) {
              self.volumeNum = data.count;
            }
          }
        });
      } else {
        await self.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + pid + "/inspur-volumes/detail",
          successFun(data) {
            if (data) {
              self.volumeNum = data["volumes"].length;
            }
          }
        });
      }
    },
    async getNetworkNum() {
      let me = this;
      let pid = this.$cookie.get('pid');
      if (Vue.roleType == "0") {
        this.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/inspur/networkextension/net/network_resource",
          successFun(data) {
            me.firewallNum = data.firewall;
            me.networksNum = data.networks;
          }
        });
      } else {
        me.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/networks?project_id="+pid+"&shared=false",
          errorKey: "NeutronError",
          successFun(response1) {
            me.$ajax({
              type: 'get',
              url: "api/neutron/v2.0/networks?shared=true",
              errorKey: "NeutronError",
              successFun(response2) {
                me.networksNum = response1['networks'].length + response2['networks'].length;
              }
            });
          }
        });
        me.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/fw/firewalls?project_id="+pid,
          errorKey: "NeutronError",
          successFun(response3) {
            me.firewallNum = response3["firewalls"].length;
          }
        });
      }
    }
  }
}
</script>