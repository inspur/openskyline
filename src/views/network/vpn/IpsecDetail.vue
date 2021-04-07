<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix" style="text-align:left;">
        <span>{{$t('network.ipsecdetail')}}</span>
      </div>
      <div class="table_panel">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr class="odd">
              <th class="idatath">{{$t('lang.name')}}：</th>
              <td class="idatatd">{{name}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('lang.desc')}}：</th>
              <td class="idatatd">{{description}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">ID：</th>
              <td class="idatatd">{{id}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('lang.project')}}：</th>
              <td class="idatatd">{{project_name}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.authalgorithm')}}：</th>
              <td class="idatatd">{{auth_algorithm}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.fengzhuang')}}：</th>
              <td class="idatatd">{{encapsulation_mode}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.encryptionalgorithm')}}：</th>
              <td class="idatatd">{{encryption_algorithm}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.ikeunits')}}：</th>
              <td class="idatatd">{{lifetime_units}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.lifetime')}}：</th>
              <td class="idatatd">{{lifetime_value}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.psf')}}：</th>
              <td class="idatatd">{{pfs}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.transformprotocol')}}：</th>
              <td class="idatatd">{{transform_protocol}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.ipsecstation')}}：</th>
              <td class="idatatd">{{ipsec_site_connections}}</td>
            </tr>
          </tbody>
        </table>
      </div>    
    </el-card>
  </div>  
</template>
<script>
export default {
  name: "IpsecDetail",
  props: ["ipsecid"],
  data() {
    return {
      name: "",
      description: "",
      id: "",
      project_name: "",
      project_id: "",
      auth_algorithm: "",
      encapsulation_mode: "",
      encryption_algorithm: "",
      lifetime_units: "",
      lifetime_value: "",
      pfs: "",
      transform_protocol: "",
      ipsec_site_connections: ""
    }
  },
  mounted() {
    // this.initDetail();
  },
  methods: {
    async initDetail() {
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/vpn/ipsecpolicies/"+this.ipsecid,
        data: {},
        success: function(result) {
          let ipsecpolicy = result["ipsecpolicy"];
          self.name = ipsecpolicy["name"];
          self.description = ipsecpolicy["description"];
          self.id = ipsecpolicy["id"];
          self.projectIdToName(ipsecpolicy["project_id"]);
          self.auth_algorithm = ipsecpolicy["auth_algorithm"];
          self.encapsulation_mode = ipsecpolicy["encapsulation_mode"];
          self.encryption_algorithm = ipsecpolicy["encryption_algorithm"];
          self.lifetime_units = ipsecpolicy["lifetime"]["units"];
          self.lifetime_value = ipsecpolicy["lifetime"]["value"];
          self.pfs = ipsecpolicy["pfs"];
          self.transform_protocol = ipsecpolicy["transform_protocol"];
          let connetcions = ipsecpolicy["ipsec_site_connections"];
          if (connetcions.length === 0) {
             self.ipsec_site_connections = Vue.t('network.nothing');
          } else {
            self.ipsec_site_connections = '';
            for (let i = 0; i < connetcions.length; i++) {
              if (i+1 === connetcions.length) {
                self.ipsec_site_connections += connetcions[i].name;
              } else {
                self.ipsec_site_connections += connetcions[i].name + ",  ";
              }
            }
          }
        },
        errorKey: "NeutronError",
        errFun() {
          self.$emit("onBackRefresh", {});
        }
      });
    },
    projectIdToName(projectId) {
      let self = this;
      this.$ajax({
        type: "GET",
        url: "api/keystone/v3/projects/" + projectId,
        success: function(result) {
          let project = result["project"];
          self.project_name = project.name;
        },
        errFun: function() {
          self.project_name = "";
        }
      });
    }
  }
}
</script>
<style scoped>
  .idatath {
    width: 110px;
  }
</style>