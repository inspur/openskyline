<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix" style="text-align:left;">
        <span>{{$t('network.ikedetail')}}</span>
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
              <th class="idatath">{{$t('network.encryptionalgorithm')}}：</th>
              <td class="idatatd">{{encryption_algorithm}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.ikeversion')}}：</th>
              <td class="idatatd">{{ike_version}}</td>
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
              <th class="idatath">{{$t('network.ikephase')}}：</th>
              <td class="idatatd">{{phase1_negotiation_mode}}</td>
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
  name: "IkeDetail",
  props: ["ikeId"],
  data() {
    return {
      name: "",
      description: "",
      id: "",
      project_name: "",
      auth_algorithm: "",
      encryption_algorithm: "",
      ike_version: "",
      lifetime_units: "",
      lifetime_value: "",
      pfs: "",
      phase1_negotiation_mode: "",
      ipsec_site_connections: ""
    }
  },
  mounted() {
    // this.initDetail();
  },
  methods: {
    initDetail() {
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/vpn/ikepolicies/"+this.ikeId,
        data: {},
        success: function(result) {
          let ikepolicy = result["ikepolicy"];
          self.name = ikepolicy["name"];
          self.description = ikepolicy["description"];
          self.id = ikepolicy["id"];
          self.projectIdToName(ikepolicy["project_id"]);
          self.auth_algorithm = ikepolicy["auth_algorithm"];
          self.encryption_algorithm = ikepolicy["encryption_algorithm"];
          self.ike_version = ikepolicy["ike_version"];
          self.lifetime_units = ikepolicy["lifetime"]["units"];
          self.lifetime_value = ikepolicy["lifetime"]["value"];
          self.pfs = ikepolicy["pfs"];
          self.phase1_negotiation_mode = ikepolicy["phase1_negotiation_mode"];
          self.ipsec_site_connections = "";
          let connetcions = ikepolicy["ipsec_site_connections"];
          if (connetcions.length === 0) {
             self.ipsec_site_connections = Vue.t('network.nothing');
          } else {
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
    width: 150px;
  }
</style>