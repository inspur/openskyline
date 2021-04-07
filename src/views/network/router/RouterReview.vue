<template>
  <el-row>
    <el-col :span="24">
      <el-collapse v-model="activeNames" style="text-align:left">
        <el-collapse-item :title="$t('network.overview')" name="1">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('lang.name')}}：</th>
                  <td class="idatatd">{{name}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">ID：</th>
                  <td class="idatatd">{{id}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('lang.desc')}}：</th>
                  <td class="idatatd">{{description}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('lang.status')}}：</th>
                  <td class="idatatd">{{status}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('network.manageStatus')}}：</th>
                  <td class="idatatd">{{adminstatus}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('network.domainuse')}}：</th>
                  <td class="idatatd">{{area}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-collapse-item>
        <el-collapse-item :title="$t('network.outGateway')" name="2" v-if="outgetestatus">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('network.networkName')}}：</th>
                  <td class="idatatd">{{networkname}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('network.networkId')}}：</th>
                  <td class="idatatd">{{networkid}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">SNAT：</th>
                  <td class="idatatd">{{snat}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('network.externalIp')}}：</th>
                  <td class="idatatd"><span>{{externalIp}}</span><span v-if="havefixededip">{{$t('network.nothing')}}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-col>
  </el-row>
</template>
<script type="text/javascript">
  export default {
    name: "RouterReview",
    props: ["router_Id"],
    data() {
      return {
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
      }
    },
    watch: {
      router_Id: {
        immediate: true,
        handler: function(value) {
          this.getRouterInfo();
          this.activeNames = ["1", "2"];
        }
      }
    },
    mounted() {
      if (this.router_Id!="" && this.router_Id!=null) {
        // this.getRouterInfo();
      }
    },
    methods: {
      async getRouterInfo() {
        var self = this;
        try {
            let result = await self.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/routers/"+this.router_Id,
            errorKey: "NeutronError",
            errFun() {
              self.$router.push({
                path: '/net/routerNet'
              });
            }
          });
          let routerInfo = result['router'];
          self.name = routerInfo['name'];
          self.id = routerInfo['id'];
          self.description = routerInfo['description'];
          let statusTem = routerInfo['status'];
          if (statusTem === "ACTIVE") {
            self.status = Vue.t('lang.ACTIVE')
          } else {
            self.status = Vue.t('network.inactive');
          }
          let adminTem = routerInfo['admin_state_up'];
          if (adminTem == true) {
            self.adminstatus = "UP"
          } else {
            self.adminstatus = "DOWN"
          }
          self.area = routerInfo['availability_zones'];
          let externalGatewayTemp = routerInfo['external_gateway_info'];
          if (externalGatewayTemp!=null) {
            self.outgetestatus = true;
            let snat = externalGatewayTemp['enable_snat'];
            if (snat == true) {
              self.snat = Vue.t('network.active');
            } else {
              self.snat = Vue.t('network.unactive');
            }
            let fixedIps = externalGatewayTemp["external_fixed_ips"];
            if (fixedIps.length === 0) {
              self.havefixededip = true;
            } else {
              self.externalIp = "";
              for (let i = fixedIps.length - 1; i >= 0; i--) {
                let ips = fixedIps[i];
                // self.fixedIP.push({
                //   value: ips["ip_address"],
                //   key: ips["subnet_id"]
                // });
                self.externalIp += Vue.t('network.ipaddress')+":"+ips["ip_address"]+"，"
                self.$ajax({
                  type: "GET",
                  url: "api/neutron/v2.0/subnets/"+ips["subnet_id"],
                  data: {},
                  success: function(result) {
                    let subnet = result["subnet"];
                    // self.subnetList.push({
                    //   value: subnet["name"],
                    //   key: subnet["name"]
                    // });
                    self.externalIp += Vue.t('network.subnet')+":"+subnet["name"]
                  },
                  errorKey: "NeutronError"
                });
              }
            }
            self.networkid = externalGatewayTemp['network_id'];
            self.$ajax({
              type: 'get',
              url: "api/neutron/v2.0/networks/"+externalGatewayTemp['network_id'],
              success: function(result) {
                let networkInfo = result['network'];
                self.networkname = networkInfo["name"];
              },
              errorKey: "NeutronError"
            });
          } else {
            self.outgetestatus = false;
          }
        } catch (res) {

        }
      }
    }
  }
</script>
<style type="text/css">
  .idatath {
    width: 100px;
  }
</style>