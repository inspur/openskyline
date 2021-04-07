<template>
  <el-row>
    <el-col :span="24">
      <el-collapse v-model="activeNames" style="text-align:left">
        <el-collapse-item :title="$t('calcStorLang.instDetailBaseproperty')" name="baseProperty">
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="odd">
                    <th class="idatath">{{$t('lang.name')}}：</th>
                    <td class="idatatd">
                      <el-tooltip :content="Instance_name" v-show="Instance_name.length > 20">
                        <span>{{Instance_name.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="Instance_name.length <= 20">{{Instance_name}}</span>
                    </td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('calcStorLang.status')}}：</th>
                    <td class="idatatd">{{Instance_status}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('calcStorLang.createTime')}}：</th>
                    <td class="idatatd">{{Instance_time}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('calcStorLang.instDetailUserName')}}：</th>
                    <td class="idatatd">
                      <el-tooltip :content="Instance_user" v-show="Instance_user.length > 20">
                        <span>{{Instance_user.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="Instance_user.length <= 20">{{Instance_user}}</span>
                    </td>
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
                    <th class="idatath">{{$t('lang.desc')}}：</th>
                    <td class="idatatd">
                      <el-tooltip :content="Instance_remark" v-show="Instance_remark.length > 20">
                        <span>{{Instance_remark.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="Instance_remark.length <= 20">{{Instance_remark}}</span>
                    </td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('calcStorLang.bareMachine')}}：</th>
                    <td class="idatatd">{{Instance_host}}</td>
                  </tr>
                  <!-- <tr class="odd">
                    <th class="idatath">操作系统：</th>
                    <td class="idatatd">
                       <el-tooltip :content="Instance_os" v-show="Instance_os.length > 20">
                        <span>{{Instance_os.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="Instance_os.length <= 20">{{Instance_os}}</span>
                    </td>
                  </tr> -->
                  <tr class="odd">
                    <th class="idatath">{{$t('lang.projectName')}}：</th>
                    <td class="idatatd">
                       <el-tooltip :content="Instance_project" v-show="Instance_project.length > 20">
                        <span>{{Instance_project.substring(0, 15) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="Instance_project.length <= 20">{{Instance_project}}</span>
                    </td>
                  </tr>
                  <tr class="even" v-show="Instanc_errorMsg !='' ">
                    <th class="idatath">{{$t('calcStorLang.instDetailFault')}}：</th>
                    <td class="idatatd">
                      <el-tooltip :content="Instanc_errorMsg" v-show="Instanc_errorMsg.length > 20">
                        <span>{{Instanc_errorMsg.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="Instanc_errorMsg.length <= 20">{{Instanc_errorMsg}}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <el-col :span="24">
      <el-collapse v-model="activeNames" style="text-align:left">
        <el-collapse-item :title="$t('calcStorLang.instDetailHardwareInfo')" name="disk">
          <el-col :span="24">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="odd">
                    <th class="idatath" style="width:181px">cpu：</th>
                    <td class="idatatd">{{Instance_flavor_cpu}} {{$t('calcStorLang.core')}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('calcStorLang.memory')}}：</th>
                    <td class="idatatd">{{sizeRender(Instance_flavor_ram)}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('calcStorLang.instDetailStartupDisk')}}：</th>
                    <td class="idatatd">{{Instance_flavor_disk}} GB</td>
                  </tr>
                  <tr class="odd" v-show="isShowVolumeFlag != ''">
                    <th class="idatath">{{$t('calcStorLang.createInstDelInstDelVolume')}}：</th>
                    <td class="idatatd">
                      <el-switch v-model="isDelVolume" :on-text="$t('lang.yes')" :off-text="$t('lang.no')"></el-switch>
                      <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstDiskTip2')">
                        <i class="el-icon-fa-question-circle"></i>
                      </el-tooltip>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
          <el-col :span="12" v-show="isShowVolumeFlag != ''">
            <el-button type="primary" @click="confirmSave" size="small">{{$t('calcStorLang.instDetailSave')}}</el-button>
          </el-col>
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <el-col :span="24">
      <el-collapse v-model="activeNames" style="text-align:left" @change="collapseChange">
        <el-collapse-item :title="$t('calcStorLang.instDetailNetDetail')" name="netaddr">
          <el-form :inline="true" v-model="formInline" class="">
            <el-table id="netcardTbl" ref="specTable" :data="tableData" highlight-current-row border stripe style="width: 100%;" row-key="key">
              <el-table-column prop="netname" :label="$t('calcStorLang.instNetworkName')" align="left">
              </el-table-column>
              <el-table-column prop="ip" align="left" :label="$t('calcStorLang.IP')">
              </el-table-column>
              <!-- <el-table-column prop="fip" align="left" label="浮动IP">
              </el-table-column> -->
              <el-table-column prop="mac" align="left" label="MAC">
              </el-table-column>
            </el-table>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <el-col :span="24">
      <el-collapse v-model="activeNames" style="text-align:left" @change="collapseChange">
        <el-collapse-item :title="$t('calcStorLang.instDetailDiskDetail')" name="volumesalldata">
          <el-form :inline="true" v-model="formInline" class="">
            <el-table ref="volumeTable" :data="volumesData" highlight-current-row border stripe style="width: 100%;" max-height='500' row-key="key">
              <el-table-column prop="volumeName" :label="$t('calcStorLang.instDetailDiskName')" align="left" min-width="100" :show-overflow-tooltip="volTipShow">
                <template slot-scope="scope">
                  <el-popover ref="volDetailPop" placement="top" trigger="click">
                    <div class="table_panel" style="width:410px">
                      <table class="table table-content table-hover idatatable table-bordered" border="1">
                        <tbody>
                        <tr>
                          <th class="idatath" style="width:80px">{{$t('lang.name')}}:</th>
                          <td class="idatatd">
                            <span>{{scope.row.volumeName || scope.row.id}}</span>
                          </td>
                        </tr>
                        <tr>
                          <th class="idatath">ID:</th>
                          <td class="idatatd">
                            <span>{{scope.row.id}}</span>
                          </td>
                        </tr>
                        <tr>
                          <th class="idatath">{{$t('storage.volumetype')}}:</th>
                          <td class="idatatd">
                            <span>{{scope.row.volume_type || "-"}}</span>
                          </td>
                        </tr>
                        <tr v-if="(roleType + '') == '0'">
                          <th class="idatath">{{$t('storage.position')}}:</th>
                          <td class="idatatd">
                            <span>{{scope.row.position}}</span>
                          </td>
                        </tr>
                        <tr>
                          <th class="idatath">{{$t('storage.bootable')}}:</th>
                          <td class="idatatd">
                            <span>{{(scope.row.bootable + "")=="true"?$t('storage.yes'):$t('storage.no')}}</span>
                          </td>
                        </tr>
                        <tr>
                          <th class="idatath">{{$t('lang.createTime')}}:</th>
                          <td class="idatatd">
                            <span>{{dateRender(scope.row.created_at)}}</span>
                          </td>
                        </tr>
                        <!-- <tr>
                          <th class="idatath">{{ $t('calcStorLang.INSTANCE_DETAIL_DEIVE') }}:</th>
                          <td class="idatatd">
                            <span>-</span>
                          </td>
                        </tr> -->
                        </tbody>
                      </table>
                    </div>
                  </el-popover>
                  <el-button v-popover:volDetailPop type="text">{{scope.row.volumeName}}</el-button>
                </template>
              </el-table-column>
              <el-table-column prop="size" align="left" :label="$t('calcStorLang.volumeDiskSize')" min-width="100">
              </el-table-column>
              <el-table-column prop="type" align="left" :label="$t('calcStorLang.type')" min-width="30">
                <template slot-scope="scope">
                  <span>{{typeRender(scope.row.type)}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="volumeDelOnTermination" align="left" :label="$t('calcStorLang.createInstDelInstDelVolume')" min-width="80">
                <template slot-scope="scope">
                  <el-switch v-model="scope.row.volumeDelOnTermination" :on-text="$t('lang.yes')" :off-text="$t('lang.no')"></el-switch>
                  <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstDiskTip2')">
                    <i class="el-icon-fa-question-circle"></i>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" v-show="volumesData != ''" @click="confirmSave2" size="small" :disabled="isLocked" :loading="saving" style="margin-top: 5px;">{{$t('calcStorLang.instDetailSave')}}</el-button>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-col>
  </el-row>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: "detail",
  props: ["InstanceId", "projectMaps", "userMaps", "flavorMaps", "networkMaps"],
  data() {
    return {
      roleType: Vue.roleType + "",
      volTipShow:false,
      Instance_detail: "",
      saving: false,
      isLocked: false,
      tableData: [],
      volumesData: [],
      volumes: [],
      loading: false,
      Instance_name: "",
      Instance_remark: "",
      Instance_host: "",
      Instance_status: "",
      Instance_Status_value: "",
      Instance_os: "",
      Instance_time: "",
      Instance_project: "",
      Instance_user: "",
      Instance_flavor_cpu: "",
      Instance_flavor_ram: "",
      Instance_flavor_disk: "",
      Instance_net: "",
      Instanc_errorMsg: "",
      ipmacMaps: new Map(),
      activeNames: ['baseProperty', 'netaddr', 'disk', 'volumesalldata'],
      formInline: '',
      isShowVolumeFlag: '',
      isDelVolume: false
    }
  },
  watch: {
    InstanceId: {
      handler: function(rows, oldVal) {
        var self = this;
        self.Instanc_errorMsg = "";
        Promise.all([self.getVolumes()]).then(function(result) {
          self.getVolumesData();
        });
        self.getData();
      }
    }
  },
  mounted() {
    var self = this;
    Promise.all([self.getVolumes(), self.getData()]).then(function(result) {
        self.getVolumesData();
    });
  },
  methods: {
    typeRender(value) {
      var self = this;
      if (value == "1") {
        return Vue.t('calcStorLang.instSystemDisk');
      } else {
        return Vue.t('calcStorLang.instDataDisk');
      }
    },
    loadVolumeType(volumeId) {
      var self = this;
      var systemDisk = self.Instance_detail['root_bdm'];
      var type = "2"; //1：系统盘 2：数据盘
      if (systemDisk != null && systemDisk['volume_id'] == volumeId) {
        type = "1";
      }
      return type;
    },
    async confirmSave2() {
      var self = this;
      var flagValue;
      var vmStatus = self.Instance_Status_value;
      var logMsgZh = "";
      var logMsgEn = "";
      if (vmStatus == 'ACTIVE' || vmStatus == 'SHUTOFF' || vmStatus == 'SUSPENDED' || vmStatus == 'PAUSED') {
        var vList = self.volumesData;
        var body = {
          server: {}
        };
        for (let d = 0; d< vList.length; d++) {
          var vEntity = vList[d];
          var volumeType = self.loadVolumeType(vEntity.id);
          var delFlag = ((vEntity.volumeDelOnTermination + "") == "true")?"True":"False";
          if ("True" == delFlag) {
            logMsgZh += (vEntity.volumeName ? vEntity.volumeName : vEntity.id) + ":" + "是; ";
            logMsgEn += (vEntity.volumeName ? vEntity.volumeName : vEntity.id) + ":" + "Yes; ";
          } else {
            logMsgZh += (vEntity.volumeName ? vEntity.volumeName : vEntity.id) + ":" + "否; ";
            logMsgEn += (vEntity.volumeName ? vEntity.volumeName : vEntity.id) + ":" + "No; ";
          }
          if ("1" == volumeType) {
            body.server['root_dev_del_on_termination'] = delFlag;
          } else {
            if (!body.server.hasOwnProperty('data_disks_del_on_termination')) {
              body.server['data_disks_del_on_termination'] = [];
            }
            body.server.data_disks_del_on_termination.push({
              volume_id: vEntity.id,
              del_on_termination: delFlag
            });
          }
        }
        try {
          self.saving = true;
          let ret = await this.$ajax({
            url: "api/nova/v2.1/servers-inspur/" + this.InstanceId,
            data: JSON.stringify(body),
            type: 'put',
            log: {
              description: {
                en: "Delete Instance (" + self.Instance_name + ") while deleting disk config" + logMsgEn,
                zh_cn: "删除云物理机 (" + self.Instance_name + ") 时删除云硬盘配置:" + logMsgZh
              },
              key: "name",
              target: Vue.logTarget.computePhysical
            },
            successMsg: Vue.t('calcStorLang.instAlterConfigSuccess')
          });
          self.saving = false;
          await self.getData();
          this.loading = false;
        } catch (data) {
          self.saving = false;
          this.loading = false;
          __DEV__ && console.error(data);
        }
      } else {
        self.$message({
          showClose: true,
          message: Vue.t('calcStorLang.alterInstDetailTip'),
          type: 'warning'
        });
        return false;
      }
    },
    //样式问题的修改，待优化
    collapseChange() {
      $("#netcardTbl").find("table").attr("style", "width:753px");
      $("#netcardTbl").find("div.cell.el-tooltip").attr("style", "width:180px");
    },
    async getData() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/nova/v2.1/servers-inspur/" + this.InstanceId,
          complete: function(XMLHttpRequest, textStatus) {},
          headers: {
            'X-OpenStack-Nova-API-Version': 2.73
          }
        });
        let result1 = await self.$ajax({
          type: 'get',
          url: "api/nova/v2.1/servers/" + this.InstanceId,
          complete: function(XMLHttpRequest, textStatus) {}
        });
        let Instance1 = result1['server'];
        let Instance = result['server'];
        if (Vue.roleType + "" != "0") {
          self.isLocked = Instance['locked'];
        }
        self.Instance_detail = result['server'];
        self.Instance_name = Instance["name"];
        self.Instance_remark = Instance["description"] || "";
        self.Instance_host = "-";
        if (Instance["OS-EXT-SRV-ATTR:hypervisor_hostname"] && Instance["OS-EXT-SRV-ATTR:hypervisor_hostname"] != null && Instance["OS-EXT-SRV-ATTR:hypervisor_hostname"] != "") {
          let result2 = await self.$ajax({
            type: 'get',
            headers: {
              'x-openstack-ironic-api-version': 1.31
            },
            url: "api/ironic/nodes/" + Instance["OS-EXT-SRV-ATTR:hypervisor_hostname"],
            complete: function(XMLHttpRequest, textStatus) {}
          });
          self.Instance_host = result2["name"] || "-";
        }
        self.Instance_status = self.statusRender(Instance['status']);
        self.Instance_Status_value = Instance['status'];
        self.Instance_os = Instance["system_metadata"]['image_os_distro'] || "-";
        //self.flavorRender(Instance['flavor'].id);
        self.Instance_time = self.dateRender(Instance['created']);
        self.Instance_project = self.projectRender(Instance['tenant_id']);
        self.Instance_user = self.ownerRender(Instance['user_id']);
        if (Instance1['fault'] != null) {
          self.Instanc_errorMsg = Instance1['fault'].message || "";
        }
        self.Instance_flavor_cpu = Instance['vcpus'] || "-";
        self.Instance_flavor_ram = Instance['memory_mb'] || "-";
        self.Instance_flavor_disk = Instance['root_gb'] || "-";
        self.isShowVolumeFlag = Instance['root_bdm'] || "";
        if (Instance['root_bdm'] && "" != Instance['root_bdm']) {
          self.isDelVolume = Instance['root_bdm']['root_dev_del_on_termination'];
          self.Instance_flavor_disk = Instance['root_bdm']['volume_size'];
        }
        //self.Instance_addr = self.ipAddressRender(Instance['addresses']);
        var address = Instance['addresses'];
        var ipmacs = [];
        var netfloat = '';
        for (let a in address) {
           for ( let i in address[a]) {
            if (address[a][i]['OS-EXT-IPS:type'] == 'floating') {
               netfloat = address[a][i];
            }
           }
        }
        for (let a in address) {
           for ( let i in address[a]) {
            if (address[a][i]['OS-EXT-IPS:type'] == 'fixed') {
               var fip = '';
               if (netfloat && netfloat['OS-EXT-IPS-MAC:mac_addr'] == address[a][i]['OS-EXT-IPS-MAC:mac_addr']) {
                fip = netfloat['addr'];
               }
               var netDetailName = this.networkMaps.get(address[a][i]['network_id']);
               ipmacs.push({
                netname: netDetailName,
                ip: address[a][i]['addr'],
                fip: fip || '-',
                mac: address[a][i]['OS-EXT-IPS-MAC:mac_addr']
              })
            }
           }
        }
        this.tableData = ipmacs;
      } catch (res) {
        // self.$message.error('获取失败!');
      }
    },
    async confirmSave() {
      var self = this;
      var flagValue;
      var vmStatus = self.Instance_Status_value;
      var logMsgZh = "";
      var logMsgEn = "";
      if (self.isDelVolume + "" == "true") {
        flagValue = "True";
        logMsgZh = "是";
        logMsgEn = "Yes";
      } else {
        flagValue = "False";
        logMsgZh = "否";
        logMsgEn = "No";
      }
      if (vmStatus == 'ACTIVE' || vmStatus == 'SHUTOFF' || vmStatus == 'SUSPENDED' || vmStatus == 'PAUSED') {
        var body = { "server": { "root_dev_del_on_termination": flagValue } };
        body = JSON.stringify(body);
        try {
          let ret = await this.$ajax({
            url: "api/nova/v2.1/servers-inspur/" + this.InstanceId,
            data: body,
            type: 'put',
            log: {
              description: {
                en: "Delete Instance (" + self.Instance_name + ") while deleting disk:" + logMsgEn,
                zh_cn: "删除云主机 (" + self.Instance_name + ") 时删除云硬盘:" + logMsgZh
              },
              key: "name",
              target: Vue.logTarget.computeInstance
            },
            successMsg: Vue.t('calcStorLang.instAlterConfigSuccess')
          });
          self.getData();
        } catch (data) {
          this.loading = false;
          __DEV__ && console.error(data);
        }
      } else {
        self.$message({
          showClose: true,
          message: Vue.t('calcStorLang.alterInstDetailTip'),
          type: 'warning'
        });
        return false;
      }
    },
    async getVolumes() {
      var self = this;
        try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/nova/v2.1/servers/" + this.InstanceId + "/os-volume_attachments",
          showErrMsg: false,
          headers: {
            'X-OpenStack-Nova-API-Version': '2.67'
          },
          complete: function(XMLHttpRequest, textStatus) {}
        });
        self.volumes = result['volumeAttachments'];
        } catch (data) {
        }
    },
    loadInitVolumeDetail(volumeId) {
      var self = this;
      var list = self.Instance_detail['os-extended-volumes-inspur:volumes_attached'];
      for (let i = 0; i < list.length; i++) {
        var obj = list[i];
        if (obj.id == volumeId) {
          return obj['delete_on_termination'];
        }
      }
    },
    async getVolumesData() {
      var self = this;
      var alldata = [];
      var thevolumes = this.volumes;
      try {
        if (thevolumes && thevolumes.length > 0) {
          for (let i = 0; i < thevolumes.length; i++) {
            let result = await self.$ajax({
              type: 'get',
              url: 'api/cinderv3/v3/' + this.$cookie.get('pid') + "/volumes/" + thevolumes[i]['volumeId'],
              showErrMsg: false,
              complete: function(XMLHttpRequest, textStatus) {}
            });
            if (result) {
              const uuid = thevolumes[i].volumeId;
              const volumeDelOnTermination = self.loadInitVolumeDetail(uuid);
              alldata.push({
                volumeName: result['volume']['name'] ? result['volume']['name'] : thevolumes[i]['volumeId'],
                size: result['volume']['size'],
                device: thevolumes[i]['device'],
                id: result['volume']['id'],
                volume_type: result['volume']['volume_type'],
                position: result['volume']['os-vol-host-attr:host'],
                bootable: result['volume']['bootable'],
                created_at: result['volume']['created_at'],
                volumeDelOnTermination: volumeDelOnTermination
              })
            }
          }
        }
        this.volumesData = alldata;
        } catch (data) {
        }
    },
   statusRender(value) {
      if (value == "BUSY") { //自定义状态
        return "<i class='el-icon-loading'></i>";
      } else if (value == "ACTIVE") {
        return Vue.t('calcStorLang.running');
      } else if (value == "BUILD") {
        return Vue.t('calcStorLang.build');
      } else if (value == "DELETED") {
        return Vue.t('calcStorLang.instDetailDeleted');
      } else if (value == "SOFT_DELETED") {
        return Vue.t('calcStorLang.instDetailSoftDeleted');
      } else if (value == "ERROR") {
        return Vue.t('calcStorLang.error');
      } else if (value == "REBOOT") {
        return Vue.t('calcStorLang.instDetailReboot');
      } else if (value == "HARD_REBOOT") {
        return Vue.t('calcStorLang.instDetailHardReboot');
      } else if (value == "PAUSED") {
        return Vue.t('calcStorLang.paused');
      } else if (value == "MIGRATING") {
        return Vue.t('calcStorLang.migrating');
      } else if (value == "PASSWORD") {
        return Vue.t('calcStorLang.password');
      } else if (value == "REBUILD") {
        return Vue.t('calcStorLang.rebuild');
      } else if (value == "RESCUE") {
        return Vue.t('calcStorLang.rescue');
      } else if (value == "REVERT_RESIZE") {
        return Vue.t('calcStorLang.revert_resize');
      } else if (value == "SHELVED") {
        return Vue.t('calcStorLang.shelved_offloaded');
      } else if (value == "SHELVED_OFFLOADED") {
        return Vue.t('calcStorLang.shelved_offloaded');
      } else if (value == "SHUTOFF") {
        return Vue.t('calcStorLang.closed');
      } else if (value == "SUSPENDED") {
        return Vue.t('calcStorLang.suspended');
      } else if (value == "UNKNOW") {
        return Vue.t('calcStorLang.unknow');
      } else if (value == "VERIFY_RESIZE") {
        return Vue.t('calcStorLang.verify_resize');
      } else {
        return "-";
      }
    },
    dateRender(value) {
      var self = this;
      var time = Date.parse(new Date(value));
      return self.formatTimeStamp(time, "yyyy-MM-dd HH:mm:ss");
    },
    sizeRender(value) {
      var self = this;
      var size = 0;
      var unitFlag = " MB";
      if (value >= 1024) {
        value = value / 1024;
        unitFlag = " GB";
      }
      if (value) {
        value = value.toFixed(0);
      } else {
        value = 0;
      }
      size = value + unitFlag;
      return size;
    },
    formatTimeStamp(timeStamp, fmt) {
      if (!timeStamp) {
        return "";
      }
      var date = new Date();
      date.setTime(timeStamp);
      var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时
        "H+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
      }
      if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : ""));
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
      }
      return fmt;
    },
    async flavorRender(value) {
      var self = this;
      var uuid = value;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/nova/v2.1/flavors/" + uuid
        });
        let flavor = result['flavor'];
        self.Instance_flavor_cpu = flavor['vcpus'];
        self.Instance_flavor_ram = flavor['ram'];
        self.Instance_flavor_disk = flavor['disk'];
      } catch (res) {}
    },
    ownerRender(value) {
      var self = this;
      var userId = value;
      return self.userMaps.get(userId) || "-";
    },
    projectRender(value) {
      var self = this;
      if (Vue.roleType == "3") {
        var showName = '-';
        var pList = Vue.projectList;
        for (let p = 0; p < pList.length; p++) {
           var obj = pList[p];
           if (obj.id == value) {
            showName = obj.name;
            break;
           }
        }
        return showName;
      } else {
        var projectId = value;
        return self.projectMaps.get(projectId) || "-";
      }
    }
  }
}

</script>
<style scoped>
.el-button--small {
  margin-bottom: 5px;
}
.table {
  table-layout: fixed;
}
</style>
