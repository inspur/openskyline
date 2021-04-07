<template>
  <div>
    <div style="height: 30px;line-height: 30px;font-size: 14px;text-align: left;">{{$t('base.quotaDesc')}}</div>
    <el-collapse v-model="activeNames" style="text-align:left;height:100%;">
      <el-collapse-item :title="$t('base.computer')" name="1" v-if="service.nova">
        <el-row :gutter="8">
          <el-col :span="12">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('base.metadataEntryNum')+"："}}</th>
                  <td class="idatatd">{{comret.quota_set.metadata_items.limit==-1?$t('base.unlimited'):comret.quota_set.metadata_items.limit}}({{comret.quota_set.metadata_items.in_use}})</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('base.VCPUQuantityNum')+"："}}</th>
                  <td class="idatatd">{{comret.quota_set.cores.limit==-1?$t('base.unlimited'):comret.quota_set.cores.limit}}({{comret.quota_set.cores.in_use}})</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('base.cloudHostNum')+"："}}</th>
                  <td class="idatatd">{{comret.quota_set.instances.limit==-1?$t('base.unlimited'):comret.quota_set.instances.limit}}({{comret.quota_set.instances.in_use}})</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('base.injectedFileNum')+"："}}</th>
                  <td class="idatatd">{{comret.quota_set.injected_files.limit==-1?$t('base.unlimited'):comret.quota_set.injected_files.limit}}({{comret.quota_set.injected_files.in_use}})</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('base.serverGroupNum')+"："}}</th>
                  <td class="idatatd">{{comret.quota_set.server_groups.limit==-1?$t('base.unlimited'):comret.quota_set.server_groups.limit}}({{comret.quota_set.server_groups.in_use}})</td>
                </tr>
              </tbody>
            </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('base.injectedFileContentNum')+"："}}</th>
                  <td class="idatatd">{{comret.quota_set.injected_file_content_bytes.limit==-1?$t('base.unlimited'):comret.quota_set.injected_file_content_bytes.limit}}({{comret.quota_set.injected_file_content_bytes.in_use}})</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('base.keyPairNum')+"："}}</th>
                  <td class="idatatd">
                    {{comret.quota_set.key_pairs.limit==-1?$t('base.unlimited'):comret.quota_set.key_pairs.limit}}(-)
                    <el-tooltip effect="dark" :content="$t('base.keypairPrompt')">
                      <i class="el-icon-fa-question-circle"></i>
                    </el-tooltip>
                  </td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('base.injectedFilePathLengthNum')+"："}}</th>
                  <td class="idatatd">{{comret.quota_set.injected_file_path_bytes.limit==-1?$t('base.unlimited'):comret.quota_set.injected_file_path_bytes.limit}}({{comret.quota_set.injected_file_path_bytes.in_use}})</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('base.memorymbNum')+"："}}</th>
                  <td class="idatatd">{{comret.quota_set.ram.limit==-1?$t('base.unlimited'):comret.quota_set.ram.limit}}({{comret.quota_set.ram.in_use}})</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('base.serverGroupMemberNum')+"："}}</th>
                  <td class="idatatd">{{comret.quota_set.server_group_members.limit==-1?$t('base.unlimited'):comret.quota_set.server_group_members.limit}}({{comret.quota_set.server_group_members.in_use}})</td>
                </tr>
              </tbody>
              </tbody>
            </table>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item :title="$t('base.network')" name="2" v-if="service.neutron">
        <el-row :gutter="8">
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('base.securityGroupNum')+"："}}</th>
                  <td class="idatatd">{{netret.quota.security_group.limit==-1?$t('base.unlimited'):netret.quota.security_group.limit}}({{netret.quota.security_group.used}})</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('base.securityGroupRuleNum')+"："}}</th>
                  <td class="idatatd">{{netret.quota.security_group_rule.limit==-1?$t('base.unlimited'):netret.quota.security_group_rule.limit}}({{netret.quota.security_group_rule.used}})</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('base.floatIPNum')+"："}}</th>
                  <td class="idatatd">{{netret.quota.floatingip.limit==-1?$t('base.unlimited'):netret.quota.floatingip.limit}}({{netret.quota.floatingip.used}})</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('base.networkNum')+"："}}</th>
                  <td class="idatatd">{{netret.quota.network.limit==-1?$t('base.unlimited'):netret.quota.network.limit}}({{netret.quota.network.used}})</td>
                </tr>
                <tr class="odd" v-if="netret.quota.firewall">
                  <th class="idatath">{{$t('base.firewallNum')}}：</th>
                  <td class="idatatd">{{netret.quota.firewall.limit==-1?$t('base.unlimited'):netret.quota.firewall.limit}}({{netret.quota.firewall.used}})</td>
                </tr>
                <tr class="even" v-if="netret.quota.loadbalancer">
                  <th class="idatath">{{$t('base.loadBalancingNum')}}：</th>
                  <td class="idatatd">{{netret.quota.loadbalancer.limit==-1?$t('base.unlimited'):netret.quota.loadbalancer.limit}}({{netret.quota.loadbalancer.used}})</td>
                </tr>
                <!-- <tr class="odd" v-if="netret.quota.pool">
                  <th class="idatath">{{$t('base.resoucePoolNum')}}：</th>
                  <td class="idatatd">{{netret.quota.pool.limit==-1?$t('base.unlimited'):netret.quota.pool.limit}}({{netret.quota.pool.used}})</td>
                </tr> -->
              </tbody>
            </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('base.portNum')+"："}}</th>
                  <td class="idatatd">{{netret.quota.port.limit==-1?$t('base.unlimited'):netret.quota.port.limit}}({{netret.quota.port.used}})</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('base.routeNum')+"："}}</th>
                  <td class="idatatd">{{netret.quota.router.limit==-1?$t('base.unlimited'):netret.quota.router.limit}}({{netret.quota.router.used}})</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('base.subnetNum')+"："}}</th>
                  <td class="idatatd">{{netret.quota.subnet.limit==-1?$t('base.unlimited'):netret.quota.subnet.limit}}({{netret.quota.subnet.used}})</td>
                </tr>
                <tr class="even" v-if="netret.quota.firewall_rule">
                  <th class="idatath">{{$t('base.firewallRuleNum')+"："}}</th>
                  <td class="idatatd">{{netret.quota.firewall_rule.limit==-1?$t('base.unlimited'):netret.quota.firewall_rule.limit}}({{netret.quota.firewall_rule.used}})</td>
                </tr>
                <tr class="odd" v-if="netret.quota.firewall_policy">
                  <th class="idatath">{{$t('base.firewallStrategy')+"："}}</th>
                  <td class="idatatd">{{netret.quota.firewall_policy.limit==-1?$t('base.unlimited'):netret.quota.firewall_policy.limit}}({{netret.quota.firewall_policy.used}})</td>
                </tr>
                <!-- <tr class="even" v-if="netret.quota.listener">
                  <th class="idatath">{{$t('base.monitorNum')+"："}}</th>
                  <td class="idatatd">{{netret.quota.listener.limit==-1?$t('base.unlimited'):netret.quota.listener.limit}}({{netret.quota.listener.used}})</td>
                </tr>
                <tr class="odd" v-if="netret.quota.healthmonitor">
                  <th class="idatath">{{$t('base.healthInspectorNum')+"："}}</th>
                  <td class="idatatd">{{netret.quota.healthmonitor.limit==-1?$t('base.unlimited'):netret.quota.healthmonitor.limit}}({{netret.quota.healthmonitor.used}})</td>
                </tr> -->
              </tbody>
            </table>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item :title="$t('base.storage')" name="3" v-if="service.cinderv2">
        <el-row :gutter="8">
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('base.cloudHardDiskNum')+"："}}</th>
                  <td class="idatatd">{{storeret.quota_set.volumes.limit==-1?$t('base.unlimited'):storeret.quota_set.volumes.limit}}({{storeret.quota_set.volumes.in_use}})</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('base.cloudHardDiskSnapshotNum')+"："}}</th>
                  <td class="idatatd">{{storeret.quota_set.snapshots.limit==-1?$t('base.unlimited'):storeret.quota_set.snapshots.limit}}({{storeret.quota_set.snapshots.in_use}})</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('base.cloudDiskAndSnapshotSizeNum')+"："}}</th>
                  <td class="idatatd">{{storeret.quota_set.gigabytes.limit==-1?$t('base.unlimited'):storeret.quota_set.gigabytes.limit}}({{storeret.quota_set.gigabytes.in_use}})</td>
                </tr>
              </tbody>
            </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('base.cloudHardDiskBakNum')+"："}}</th>
                  <td class="idatatd">{{storeret.quota_set.backups.limit==-1?$t('base.unlimited'):storeret.quota_set.backups.limit}}({{storeret.quota_set.backups.in_use}})</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('base.cloudDiskAndBakSizeNum')+"："}}</th>
                  <td class="idatatd">{{storeret.quota_set.backup_gigabytes.limit==-1?$t('base.unlimited'):storeret.quota_set.backup_gigabytes.limit}}({{storeret.quota_set.backup_gigabytes.in_use}})</td>
                </tr>
              </tbody>
            </table>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item :title="$t('base.fileStorage')" name="4" v-if="service.manila">
        <el-row :gutter="8">
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('base.fileStoreNum')}}：</th>
                  <td class="idatatd">{{filestoreret.quota_set.shares.limit==-1?$t('base.unlimited'):filestoreret.quota_set.shares.limit}}({{filestoreret.quota_set.shares.in_use}})</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('base.fileStoreSizeNum')}}：</th>
                  <td class="idatatd">{{filestoreret.quota_set.gigabytes.limit==-1?$t('base.unlimited'):filestoreret.quota_set.gigabytes.limit}}({{filestoreret.quota_set.gigabytes.in_use}})</td>
                </tr>
              </tbody>
            </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('base.fileStorageSnapshotNum')}}：</th>
                  <td class="idatatd">{{filestoreret.quota_set.snapshots.limit==-1?$t('base.unlimited'):filestoreret.quota_set.snapshots.limit}}({{filestoreret.quota_set.snapshots.in_use}})</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('base.fileStoreSnapshotSizeNum')}}：</th>
                  <td class="idatatd">{{filestoreret.quota_set.snapshot_gigabytes.limit==-1?$t('base.unlimited'):filestoreret.quota_set.snapshot_gigabytes.limit}}({{filestoreret.quota_set.snapshot_gigabytes.in_use}})</td>
                </tr>
              </tbody>
            </table>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
export default {
  name:"",
  props:["id"],
  data() {
    return {
      service:Vue.service,
      activeNames: ["1", "2", "3", "4"],
      storeret:{
        quota_set:{
          volumes:{
            in_use:"",
            limit:""
          },
          snapshots:{
            in_use:"",
            limit:""
          },
          gigabytes:{
            in_use:"",
            limit:""
          }
        }
      },
      comret:{
        quota_set:{
          cores:{
            in_use:"",
            limit:""
          },
          floating_ips:{
            in_use:"",
            limit:""
          },
          injected_file_content_bytes:{
            in_use:"",
            limit:""
          },
          injected_file_path_bytes:{
            in_use:"",
            limit:""
          },
          injected_files:{
            in_use:"",
            limit:""
          },
          instances:{
            in_use:"",
            limit:""
          },
          key_pairs:{
            in_use:"",
            limit:""
          },
          metadata_items:{
            in_use:"",
            limit:""
          },
          ram:{
            in_use:"",
            limit:""
          },
          security_group_rules:{
            in_use:"",
            limit:""
          },
          security_groups:{
            in_use:"",
            limit:""
          },
          server_groups:{
            in_use:"",
            limit:""
          },
          server_group_members:{
            in_use:"",
            limit:""
          }
        }
      },
      filestoreret:{
        quota_set:{
          shares:{
            in_use:"",
            limit:""
          },
          gigabytes:{
            in_use:"",
            limit:""
          },
          snapshots:{
            in_use:"",
            limit:""
          },
          snapshot_gigabytes:{
            in_use:"",
            limit:""
          }
        }
      },
      netret:{
        quota:{
          floatingip:{
            limit:"",
            used:""
          },
          security_group:{
            limit:"",
            used:""
          },
          security_group_rule:{
            limit:"",
            used:""
          },
          network:{
            limit:"",
            used:""
          },
          port:{
            limit:"",
            used:""
          },
          router:{
            limit:"",
            used:""
          },
          subnet:{
            limit:"",
            used:""
          },
          firewall:{
            limit:"",
            used:""
          },
          firewall_rule:{
            limit:"",
            used:""
          },
          firewall_policy:{
            limit:"",
            used:""
          },
          loadbalancer:{
            used:"",
            limit:""
          },
          pool:{
            limit:"",
            used:""
          },
          listener:{
            limit:"",
            used:""
          },
          healthmonitor:{
            limit:"",
            used:""
          }
        }
      }
    }
  },
  mounted() {
  },
  methods:{
    async getData() {
      let pid = this.$cookie.get("pid");
      if (this.service.nova) {
        let comret = await this.$ajax({
          type: 'get',
          url: "api/nova/v2/os-quota-sets/"+this.id+"/detail"
        })
        Object.assign(this.comret, comret);
      }
      if (this.service.neutron) {
        let netret = await this.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/quotas/"+this.id+"/details.json"
        })
        this.netret = netret;
        if (Vue.service.octavia) {
          this.netret.quota.loadbalancer = {};
          let loadbalancerRtn = await this.$ajax({
            type: 'get',
            url: "api/octavia/v2/lbaas/quotas/"+this.id
          })
          let loadbalancerURtn = await this.$ajax({
            type: 'get',
            url: "api/octavia/v2.0/lbaas/loadbalancers?project_id="+this.id
          })
          this.netret.quota.loadbalancer = {
            limit:loadbalancerRtn.quota.load_balancer,
            used:loadbalancerURtn.loadbalancers.length
          }
        }
      }
      if (this.service.cinderv2) {
        let storeret = await this.$ajax({
          type: 'get',
          url: "api/cinderv2/v3/"+pid+"/os-quota-sets/"+this.id+"?usage=true"
        })
        Object.assign(this.storeret, storeret);
      }
      if (this.service.manila) {
        let filestoreret = await this.$ajax({
          type: 'get',
          url: "api/manila/v2/"+pid+"/quota-sets/"+this.id+"/detail"
        })
        Object.assign(this.filestoreret, filestoreret);
      }
    }
  }
}
</script>