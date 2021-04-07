<template>
<div>
  <icos-page-header :title="$t('base.projectManagement')" />
  <icos-page>
    <el-button type="primary" size="small"
      icon="fa-edit"
      @click="editMember">
      {{$t('base.modifyMembers')}}
    </el-button>
    <el-button type="primary" size="small"
      icon="fa-edit"
      v-if="!isLdap"
      @click="editGroup">
      {{$t('base.modifyGroup')}}
    </el-button>
    <el-collapse v-model="activeNames" style="margin-top:8px;">
      <el-collapse-item :title="$t('base.projectInformation')" name="1">
        <el-row :gutter="10">
          <el-col :span="10">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('base.name')+"："}}</th>
                  <td class="idatatd">{{project.name}}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </el-col>
          <el-col :span="14">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('base.desc')}}：</th>
                  <td class="idatatd">
                    <div v-div-wrap="{minHeight: '34px', expandText: $t('lang.EXPAND'), collapseText: $t('lang.COLLAPSE')}" v-html="project.description">
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item :title="$t('base.permissionDetail')" name="3">
        <div class="table_panel">
        <table class="table table-content table-hover idatatable" border="1" style="table-layout: fixed;">
          <tbody>
            <tr class="odd">
              <th class="idatath" style="width:180px;">{{$t('base.projectAdmin')}}：</th>
              <td class="idatatd">{{projectAdmins}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('base.projectUser')}}：</th>
              <td class="idatatd">{{projectUsers}}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </el-collapse-item>

      <el-collapse-item :title="$t('base.quota')+'('+$t('base.quotaDesc')+')'" name="2">
        <el-row>
          <el-col :span="6">
            <div class="table_panel" v-if="service.nova">
              <table class="custom-pro-table table table-content table-hover idatatable" border="1">
                <tbody>
                  <template v-for="(item,key) in comret.quota_set">
                    <tr>
                      <th class="idatath" :title="item.label">{{item.label}}：</th>
                      <td class="idatatd">
                        {{item.limit==-1?$t('base.unlimited'):item.limit}}({{key!='key_pairs'?item.in_use:'-'}})
                        <el-tooltip v-if="key=='key_pairs'" effect="dark" :content="$t('base.keypairPrompt')">
                          <i class="el-icon-fa-question-circle"></i>
                        </el-tooltip>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="table_panel" v-if="service.neutron">
              <table class="custom-pro-table table table-content table-hover idatatable" border="1">
                <tbody>
                  <template v-for="item in netret.quota">
                    <tr v-if="item.flg">
                      <th class="idatath" :title="item.label">{{item.label}}：</th>
                      <td class="idatatd">{{item.limit==-1?$t('base.unlimited'):item.limit}}({{item.used}})</td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="table_panel" v-if="service.cinderv2">
              <table class="custom-pro-table table table-content table-hover idatatable" border="1">
                <tbody>
                  <template v-for="item in storeret.quota_set">
                    <tr>
                      <th class="idatath" :title="item.label">{{item.label}}：</th>
                      <td class="idatatd">{{item.limit==-1?$t('base.unlimited'):item.limit}}({{item.in_use}})</td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="table_panel" v-if="service.manila">
              <table class="custom-pro-table table table-content table-hover idatatable" border="1">
                <tbody>
                  <template v-for="item in filestoreret.quota_set">
                    <tr>
                      <th class="idatath">{{item.label}}：</th>
                      <td class="idatatd">{{item.limit==-1?$t('base.unlimited'):item.limit}}({{item.in_use}})</td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
    <edit-project ref="editProject" v-if="editProjectFlg" :name="project.name" @refreshData="refreshData">
    </edit-project> 
  </icos-page>
</div>
</template>
<script>
import EditProject from './EditProject'
export default {
  name:"projectManage",
  data() {
    return {
      isLdap:Vue.isLdap,
      service:Vue.service,
      activeNames:["1", "2", "3"],
      editProjectFlg:false,
      project:{
        name:"",
        description:""
      },
      projectAdmins:"",
      projectUsers:"",
      storeret:{
        quota_set:{
          volumes:{
            label:Vue.t('base.cloudHardDiskNum'),
            in_use:"",
            limit:""
          },
          snapshots:{
            label:Vue.t('base.cloudHardDiskSnapshotNum'),
            in_use:"",
            limit:""
          },
          gigabytes:{
            label:Vue.t('base.cloudDiskAndSnapshotSizeNum'),
            in_use:"",
            limit:""
          },
          backups:{
            label:Vue.t('base.cloudHardDiskBakNum'),
            in_use:"",
            limit:""
          },
          backup_gigabytes:{
            label:Vue.t('base.cloudDiskAndBakSizeNum'),
            in_use:"",
            limit:""
          }
        }
      },
      filestoreret:{
        quota_set:{
          shares:{
            label:Vue.t('base.fileStoreNum'),
            in_use:"",
            limit:""
          },
          gigabytes:{
            label:Vue.t('base.fileStoreSizeNum'),
            in_use:"",
            limit:""
          },
          snapshots:{
            label:Vue.t('base.fileStorageSnapshotNum'),
            in_use:"",
            limit:""
          },
          snapshot_gigabytes:{
            label:Vue.t('base.fileStoreSnapshotSizeNum'),
            in_use:"",
            limit:""
          }
        }
      },
      comret:{
        quota_set:{
          cores:{
            in_use:"",
            limit:"",
            label:this.$t('base.VCPUQuantityNum')
          },
          injected_file_content_bytes:{
            in_use:"",
            limit:"",
            label:this.$t('base.injectedFileContentNum')
          },
          injected_file_path_bytes:{
            in_use:"",
            limit:"",
            label:this.$t('base.injectedFilePathLengthNum')
          },
          injected_files:{
            in_use:"",
            limit:"",
            label:this.$t('base.injectedFileNum')
          },
          instances:{
            in_use:"",
            limit:"",
            label:this.$t('base.cloudHostNum')
          },
          key_pairs:{
            in_use:"",
            limit:"",
            label:this.$t('base.keyPairNum')
          },
          metadata_items:{
            in_use:"",
            limit:"",
            label:this.$t('base.metadataEntryNum')
          },
          ram:{
            in_use:"",
            limit:"",
            label:this.$t('base.memorymbNum')
          },
          server_groups:{
            in_use:"",
            limit:"",
            label:this.$t('base.serverGroupNum')
          },
          server_group_members:{
            in_use:"",
            limit:"",
            label:this.$t('base.serverGroupMemberNum')
          }
        }
      },
      netret:{
        quota:{
          floatingip:{
            label:this.$t('base.floatIPNum'),
            limit:"",
            used:"",
            flg:false
          },
          security_group:{
            label:this.$t('base.securityGroupNum'),
            limit:"",
            used:"",
            flg:false
          },
          security_group_rule:{
            label:this.$t('base.securityGroupRuleNum'),
            limit:"",
            used:"",
            flg:false
          },
          network:{
            label:this.$t('base.networkNum'),
            limit:"",
            used:"",
            flg:false
          },
          port:{
            label:this.$t('base.portNum'),
            limit:"",
            used:"",
            flg:false
          },
          router:{
            label:this.$t('base.routeNum'),
            limit:"",
            used:"",
            flg:false
          },
          subnet:{
            label:this.$t('base.subnetNum'),
            limit:"",
            used:"",
            flg:false
          },
          firewall:{
            label:Vue.t('base.firewallNum'),
            limit:"",
            used:"",
            flg:false
          },
          firewall_rule:{
            label:Vue.t('base.firewallRuleNum'),
            limit:"",
            used:"",
            flg:false
          },
          firewall_policy:{
            label:Vue.t('base.firewallStrategy'),
            limit:"",
            used:"",
            flg:false
          },
          loadbalancer:{
            label:Vue.t('base.loadBalancingNum'),
            limit:"",
            used:"",
            flg:false
          }
        }
      }
    }
  },
  async mounted() {
    let pid = this.$cookie.get("pid");
    let ret = await this.$ajax({
      type: 'get',
      url: "api/keystone/v3/projects/" + pid
    });
    this.project = ret.project;
    this.memberFun();
    if (this.service.neutron) {
      let netret = await this.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/quotas/"+pid+"/details.json"
      })
      if (Vue.service.octavia) {
        netret.quota.loadbalancer = {};
        let loadbalancerRtn = await this.$ajax({
          type: 'get',
          url: "api/octavia/v2/lbaas/quotas/"+pid
        })
        let loadbalancerURtn = await this.$ajax({
          type: 'get',
          url: "api/octavia/v2.0/lbaas/loadbalancers?project_id="+pid
        })
        netret.quota.loadbalancer = {
          limit:loadbalancerRtn.quota.load_balancer,
          used:loadbalancerURtn.loadbalancers.length
        };
      }
      let a = 0;
      for (var key in netret.quota) {
        if (this.netret.quota[key]) {
          this.netret.quota[key] = $.extend(this.netret.quota[key], netret.quota[key], {flg:true, cla:a++%2==0?'even':'odd'});
        }
      }
    }
    if (this.service.cinderv2) {
      let storeret = await this.$ajax({
        type: 'get',
        url: "api/cinderv2/v3/"+pid+"/os-quota-sets/"+pid+"?usage=true"
      })
      for (var key1 in storeret.quota_set) {
        if (this.storeret.quota_set[key1]) {
          this.storeret.quota_set[key1] = $.extend(this.storeret.quota_set[key1], storeret.quota_set[key1]);
        }
      }
    }
    if (this.service.nova) {
      let comret = await this.$ajax({
        type: 'get',
        url: "api/nova/v2/os-quota-sets/"+pid+"/detail"
      })
      for (var key2 in comret.quota_set) {
        if (this.comret.quota_set[key2]) {
          this.comret.quota_set[key2] = $.extend(this.comret.quota_set[key2], comret.quota_set[key2]);
        }
      }
    }
    if (this.service.manila) {
      let filestoreret = await this.$ajax({
        type: 'get',
        url: "api/manila/v2/"+pid+"/quota-sets/"+pid+"/detail"
      })
      for (var key3 in filestoreret.quota_set) {
        if (this.filestoreret.quota_set[key3]) {
          this.filestoreret.quota_set[key3] = $.extend(this.filestoreret.quota_set[key3], filestoreret.quota_set[key3]);
        }
      }
    }
  },
  methods: {
    editMember() {
      this.editProjectFlg = true;
      let me = this;
      me.$nextTick(() => {
        me.$refs.editProject.show("second");
      });
    },
    async memberFun() {
      this.projectAdmins = "";
      this.projectUsers = "";

      let uret = await this.$ajax({
        type: 'get',
        url:"api/keystone/v3/inspur/assignments/projects/"+this.$cookie.get("pid")+"/rights"
      });
      uret.project_rights.forEach((item, index) => {
        if (item.role_type==2) { //项目管理员
          this.projectAdmins += item.user_name;
          this.projectAdmins += ",";
        } else if (item.role_type==3) {
          this.projectUsers += item.user_name;
          this.projectUsers += ",";
        }
      })
      this.projectAdmins = this.projectAdmins.substring(0, this.projectAdmins.length-1);
      this.projectUsers = this.projectUsers.substring(0, this.projectUsers.length-1);
    },
    editGroup() {
      this.editProjectFlg = true;
      let me = this;
      me.$nextTick(() => {
        me.$refs.editProject.show("third");
      });
    },
    refreshData() {
      this.memberFun();
    }
  },
  components: {
    EditProject
  }
}
</script>
<style type="text/css">
  .custom-pro-table{
    table-layout: fixed;
  }
  .custom-pro-table th{
    width:70%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .custom-pro-table td{
    width:30%;
  }
</style>
