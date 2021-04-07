<template>
  <el-row>
    <el-col :span="24">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('network.subnetName')}}：</th>
                  <td class="idatatd">{{subnetname}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('network.subnet')+'ID'}}：</th>
                  <td class="idatatd">{{subnetid}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('network.networkName')}}：</th>
                  <td class="idatatd">{{netname}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('network.ipversion')}}：</th>
                  <td class="idatatd">{{ipversion}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">CIDR：</th>
                  <td class="idatatd">{{cidr}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('network.ipaddresspool')}}：</th>
                  <td class="idatatd"><span v-for="(index, item) in ippool">{{index}}<br/></span></td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('network.hostrouter')}}：</th>
                  <td class="idatatd"><span v-for="(index, item) in hostrouter">{{index}}<br/></span></td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('network.dnsserver')}}：</th>
                  <td class="idatatd"><span v-for="(index, item) in dnsserver">{{index}}<br/></span></td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('network.gatewayip')}}：</th>
                  <td class="idatatd">{{gatewayip}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('network.dhcpused')}}：</th>
                  <td class="idatatd">{{dhcpstatus}}</td>
                </tr>
                <tr class="even" v-if="ipversion=='IPv6'">
                  <th class="idatath">{{$t('network.ipv6addressconfig')}}：</th>
                  <td class="idatatd">{{ipv6mode}}</td>
                </tr>
              </tbody>
            </table>
          </div>
    </el-col>
  </el-row>
</template>
<script>
export default {
  name: "detail",
  props: ["editSubid"],
  data() {
    return {
      activeNames: 'baseProperty',
      formDetail: {},
      subnetname: "",
      subnetid:"",
      netname: "",
      ipversion: "IPv4",
      cidr: "",
      ippool: [],
      gatewayip: "",
      hostrouter: [],
      dnsserver: [],
      dhcpstatus: true,
      ipv6mode:""
    }
  },
  mounted() {
    this.initDetail();
  },
  methods: {
    initDetail() {
      let self = this;
      try {
        self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/subnets/"+this.editSubid,
          data: {},
          success: function(result) {
            let subnet = result["subnet"];
            self.networkIdtoname(subnet["network_id"]);
            self.subnetname = subnet["name"];
            self.subnetid = subnet["id"];
            if (subnet["ip_version"] == 4) {
              self.ipversion = "IPv4";
            } else {
              self.ipversion = "IPv6";
            }
            self.cidr = subnet["cidr"];
            self.gatewayip = subnet["gateway_ip"];
            self.dhcpstatus = subnet["enable_dhcp"];
            if (subnet["ipv6_address_mode"] == null && subnet["ipv6_ra_mode"] == null) {
              self.ipv6mode = Vue.t('network.nothing');
            } else if (subnet["ipv6_address_mode"] == "slaac" && subnet["ipv6_ra_mode"] == "slaac") {
              self.ipv6mode = Vue.t('network.ipv6config1');
            } else if (subnet["ipv6_address_mode"] == "slaac" && subnet["ipv6_ra_mode"] == null) {
              self.ipv6mode = Vue.t('network.ipv6config2');
            } else if (subnet["ipv6_address_mode"] == "dhcpv6-stateless" && subnet["ipv6_ra_mode"] == "dhcpv6-stateless") {
              self.ipv6mode = Vue.t('network.ipv6config4');
            }
            self.ippool = [];
            let allocationpools = subnet["allocation_pools"];
            for (let i = 0; i < allocationpools.length; i++) {
              let obj = allocationpools[i];
              self.ippool.push(Vue.t('network.beginaddress')+":"+obj["start"]+","+Vue.t('network.endaddress')+":"+obj["end"]);
            }
            self.hostrouter = [];
            let hostrouters = subnet["host_routes"];
            for (let i = 0; i < hostrouters.length; i++) {
              let obj = hostrouters[i];
              self.hostrouter.push(Vue.t('network.targetCidr')+":"+obj["destination"]+","+Vue.t('network.nextJump')+":"+obj["nexthop"]);
            }
            self.dnsserver = [];
            let dns = subnet["dns_nameservers"];
            for (let i = dns.length - 1; i >= 0; i--) {
              self.dnsserver.push(dns[i]);
            }
          },
          errorKey: "NeutronError",
          errFun() {
            self.$emit("onBack", {});
          }
        });
      } catch (res) {
      }
    },
    networkIdtoname(netid) {
      let self = this;
      this.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/networks/" + netid,
        success: function(result) {
          let network = result["network"];
          console.log();
          self.netname = network.name;
        }
      });
    }
  }
}
</script>