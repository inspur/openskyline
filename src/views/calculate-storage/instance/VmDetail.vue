<template>
  <div>
    <el-collapse v-model="activeNames" style="text-align:left">
      <el-collapse-item :title="$t('calcStorLang.instDetailBaseproperty')" name="baseProperty">
        <el-col :span="12">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1" v-loading="loading">
              <tbody>
                <tr>
                  <th class="idatath">{{ $t('lang.name') }}:</th>
                  <td class="idatatd">
                    <el-tooltip :content="instance.name" v-show="instance.name.length > 20">
                      <span>{{ instance.name.substring(0, 20) + "..." }}</span>
                    </el-tooltip>
                    <span v-show="instance.name.length <= 20">{{ instance.name }}</span>
                  </td>
                </tr>
                <tr>
                  <th class="idatath">{{ $t('calcStorLang.status') }}:</th>
                  <td class="idatatd">{{ statusRender(instance.status) }}</td>
                </tr>
                <tr>
                  <th class="idatath">{{ $t('calcStorLang.createTime') }}:</th>
                  <td class="idatatd">{{ dateRender(instance.created) }}</td>
                </tr>
                <tr>
                  <th class="idatath">{{ $t('calcStorLang.instDetailUserName') }}:</th>
                  <td class="idatatd">
                    <el-tooltip :content="userName" v-show="userName.length > 20">
                      <span>{{userName.substring(0, 20) + "..."}}</span>
                    </el-tooltip>
                    <span v-show="userName.length <= 20">{{userName}}</span>
                  </td>
                </tr>
                <tr v-if="instanceFault !='' ">
                  <th class="idatath">{{ $t('calcStorLang.instDetailFault') }}:</th>
                  <td class="idatatd">
                    <el-tooltip :content="instanceFault" v-show="instanceFault.length > 20">
                      <span>{{ instanceFault.substring(0, 20) + "..." }}</span>
                    </el-tooltip>
                    <span v-show="instanceFault.length <= 20">{{ instanceFault }}</span>
                  </td>
                </tr>
                <tr v-if="$archIs('x86') && from!=='balanceList'">
                  <th class="idatath">{{ $t('calcStorLang.createHotPlug') }}:</th>
                  <td class="idatatd">
                    <span>{{ instance.tags.includes('HOTPLUG') ? $t('lang.yes') : $t('lang.no') }}</span>
                  </td>
                </tr>
                <tr v-if="instance.locked">
                  <th class="idatath">{{ $t('calcStorLang.INSTANCE_LOCK_REASON') }}:</th>
                  <td class="idatatd">
                    <div v-div-wrap="{minHeight: '34px', expandText: $t('lang.EXPAND'), collapseText: $t('lang.COLLAPSE')}" >
                      <span>{{ instance.system_metadata.locked_reason }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1" v-loading="loading">
              <tbody>
                <tr>
                  <th class="idatath">{{$t('calcStorLang.UUID')}}:</th>
                  <td class="idatatd">
                    <span>{{ instanceId }}</span>
                  </td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('lang.desc')}}:</th>
                  <td class="idatatd" @mouseenter="descEditForm.editButtonShown = true" @mouseleave="descEditForm.editButtonShown = false">
                    <div v-show="!descEditForm.editMode">
                      <el-tooltip :content="instance.description" v-show="instance.description.length > 20">
                        <span>{{instance.description.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="instance.description.length <= 20">{{instance.description}}</span>
                      <i class="el-icon-edit" v-if="descEditForm.editButtonShown" @click="handleDescEdit();" style="cursor: pointer;" />
                    </div>
                    <div v-show="descEditForm.editMode">
                      <el-input ref="descEditInput" v-model="descEditForm.desc" type="textarea" @blur="handleDescEditSubmit" :autofocus="true" :disabled="saving" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <th class="idatath">{{ $t('calcStorLang.host') }}:</th>
                  <td class="idatatd">{{ instance['OS-EXT-SRV-ATTR:hypervisor_hostname'] }}</td>
                </tr>
                <tr v-if="from!=='balanceList'">
                  <th class="idatath">{{ $t('calcStorLang.os') }}:</th>
                  <td class="idatatd">
                    <span>{{ instance.system_metadata.image_os_distro }}</span>
                  </td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('base.project')}}:</th>
                  <td class="idatatd">
                    <el-tooltip :content="projectName" v-show="projectName.length > 20">
                      <span>{{projectName.substring(0, 20) + "..."}}</span>
                    </el-tooltip>
                    <span v-show="projectName.length <= 20">{{projectName}}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-col>
      </el-collapse-item>
      <el-collapse-item :title="$t('calcStorLang.instDetailHardwareInfo')" name="disk">
        <el-col :span="24">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1" v-loading="loading">
              <tbody>
                <tr>
                  <th class="idatath" style="width:230px">CPU：</th>
                  <td class="idatatd">
                    {{ instance.vcpus}} {{ $t('calcStorLang.core') }}
                    <el-button type="text" @click="showVCPUInfoDialog" style="float: right;" v-if="roleType !== '3' && from !== 'balanceList'">{{  $t('calcStorLang.VCPU_DETAIL_DETAIL')  }}</el-button>
                  </td>
                </tr>
                <tr>
                  <th class="idatath">{{ $t('calcStorLang.memory') }}：</th>
                  <td class="idatatd">{{ sizeRender(instance.memory_mb) }}</td>
                </tr>
                <tr>
                  <th class="idatath">{{ $t('calcStorLang.instDetailStartupDisk') }}：</th>
                  <td class="idatatd">{{ rootSize }} GB</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-col>
      </el-collapse-item>
      <el-collapse-item :title="$t('calcStorLang.instDetailNetDetail')" name="netaddr">
        <el-table id="netcardTbl" ref="specTable" :data="network.netCards" highlight-current-row border stripe row-key="key" v-loading="network.loading">
          <el-table-column prop="name" :label="$t('calcStorLang.instNetworkName')" align="left">
          </el-table-column>
          <el-table-column prop="ip" align="left" label="IP">
            <template slot-scope="scope">
              <template v-if="scope.row.ip.length > 0">
                <div v-for="obj in scope.row.ip" :key="obj"><span>{{obj}}</span></div>
              </template>
              <template v-else>
                <div>-</div>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="fip" align="left" :label="$t('network.floatingIP')">
            <template slot-scope="scope">
              <template v-if="scope.row.fip.length > 0">
                <div v-for="obj in scope.row.fip" :key="obj"><span>{{obj}}</span></div>
              </template>
              <template v-else>
                <div>-</div>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="mac" align="left" label="MAC" />
        </el-table>
      </el-collapse-item>
      <el-collapse-item :title="$t('calcStorLang.instDetailDiskDetail')" name="volumesalldata" v-if="from!=='balanceList'">
        <el-table ref="volumeTable" :data="volume.volumes" border stripe style="width: 100%;" max-height='500' row-key="key" v-loading="volume.loading">
          <el-table-column :label="$t('calcStorLang.instDetailDiskName')" align="left" min-width="100" :show-overflow-tooltip="volume.tipShow">
            <template slot-scope="scope">
              <el-popover ref="volDetailPop" placement="top" trigger="click">
                <div class="table_panel" style="width:410px">
                  <table class="table table-content table-hover idatatable table-bordered" border="1">
                    <tbody>
                      <tr>
                        <th class="idatath" style="width:80px">{{$t('lang.name')}}:</th>
                        <td class="idatatd">
                          <span>{{ scope.row.name || scope.row.id }}</span>
                        </td>
                      </tr>
                      <tr>
                        <th class="idatath">ID:</th>
                        <td class="idatatd">
                          <span>{{ scope.row.id }}</span>
                        </td>
                      </tr>
                      <tr>
                        <th class="idatath">{{$t('storage.volumetype')}}:</th>
                        <td class="idatatd">
                          <span>{{ scope.row.volume_type || "-" }}</span>
                        </td>
                      </tr>
                      <tr v-if="(roleType + '') == '0'">
                        <th class="idatath">{{$t('storage.position')}}:</th>
                        <td class="idatatd">
                          <span>{{ scope.row.position }}</span>
                        </td>
                      </tr>
                      <tr>
                        <th class="idatath">{{$t('storage.bootable')}}:</th>
                        <td class="idatatd">
                          <span>{{ (scope.row.bootable + "")=="true"?$t('storage.yes'):$t('storage.no') }}</span>
                        </td>
                      </tr>
                      <tr>
                        <th class="idatath">{{$t('lang.createTime')}}:</th>
                        <td class="idatatd">
                          <span>{{ dateRender(scope.row.created_at) }}</span>
                        </td>
                      </tr>
                      <tr>
                        <th class="idatath">{{ $t('calcStorLang.INSTANCE_DETAIL_DEIVE') }}:</th>
                        <td class="idatatd">
                          <span>{{ scope.row.device }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </el-popover>
              <el-button v-popover:volDetailPop type="text">{{scope.row.volumeName}}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="size" align="left" :label="$t('calcStorLang.volumeDiskSize')" min-width="30">
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
        <el-button type="primary" v-show="volume.volumes != ''" @click="confirmSave" size="small" :disabled="!canModify" :loading="saving" style="margin-top: 5px;">{{$t('calcStorLang.instDetailSave')}}</el-button>
      </el-collapse-item>
      <el-collapse-item :title="$t('calcStorLang.VM_DETAIL_DIRECT_CONNECT_DEVICE')" name="directConnectDevices" v-if="from!=='balanceList'">
        <el-table :data="directConnectDevices.devices" v-loading="directConnectDevices.loading">
          <el-table-column :label="$t('calcStorLang.VM_DETAIL_DIRECT_CONNECT_DEVICE_TYPE')" prop="type" width="100" />
          <el-table-column :label="$t('calcStorLang.VM_DETAIL_DIRECT_CONNECT_DEVICE_ADDR')" prop="address" width="100" />
          <el-table-column :label="$t('calcStorLang.VM_DETAIL_DIRECT_CONNECT_DEVICE_NAME')" prop="name">
            <template slot-scope="scope">
              <span v-if="'productId' in scope.row">
                {{ scope.row.name }}_{{ scope.row.productId }}
              </span>
              <span v-else>
                {{ scope.row.name }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
      <el-collapse-item :title="$t('calcStorLang.instDetailTags')" name="instanceTags" v-if="roleType !== '3'&&from!=='balanceList'&&from!=='containerVMList'">
        <div class="table_panel" v-loading="loading">
          <div v-if="instanceTags.length === 0" style="padding: 15px; text-align: center;">{{ $t('calcStorLang.VM_TAGS_NONE') }}</div>
          <div v-else>
            <el-tag type="primary" style="margin: 3.5px;" v-for="tag in instanceTags" :key="tag" :close-transition="true" :closable=true @close="handleDeleteTag(tag)">{{ tag }}</el-tag>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <vcpu-info-dialog v-if="vCPUInfoDialog.visible" :instance="vCPUInfoDialog.instance" @close="closeVCPUInfoDialog" />
  </div>
</template>

<script>
import _ from 'underscore';
import moment from 'moment';
import VmVCPUInfoDialog from './VmVCPUInfoDialog';
import ReservedTags from './ReservedTags.json';
export default {
  name: 'VmDetail',
  props: [
    'from',
    'instanceId',
    'projectMaps',
    'userMaps'
  ],
  components: {
    'vcpu-info-dialog': VmVCPUInfoDialog
  },
  data() {
    return {
      hasCyborg: 'cyborg' in Vue.service, // 是否部署了cyborg，如果没部署，则不显示加速器
      loading: false,
      userName: '',
      projectName: '',
      projectId: '',
      rootSize: '',
      instanceFault: '',
      instance: {
        id: '',
        'OS-EXT-SRV-ATTR:hypervisor_hostname': '',
        name: '',
        description: '',
        vcpus: 0,
        memory_mb: 0,
        root_gb: 0,
        locked: false,
        status: '',
        tenant_id: '',
        tags: [],
        created: 0,
        system_metadata: {
          image_os_distro: '',
          locked_reason: ''
        }
      },
      volumeMaps: new Map(),
      activeNames: ['baseProperty', 'disk', 'netaddr', 'volumesalldata', 'directConnectDevices', 'instanceTags'],
      roleType: String(Vue.roleType),
      saving: false,
      instanceTags: [],
      volume: {
        tipShow: false,
        volumes: [],
        loading: false
      },
      network: {
        networks: [],
        loading: false
      },
      vCPUInfoDialog: {
        instance: {},
        visible: false
      },
      directConnectDevices: {
        devices: [],
        loading: true
      },
      descEditForm: {
        editButtonShown: false,
        editMode: false,
        desc: '',
        saving: false
      }
    }
  },
  watch: {
    instanceId: {
      handler: function(rows, oldVal) {
        const $this = this;
        $this.instanceFault = "";
        $this.getData();
      }
    }
  },
  mounted() {
    const $this = this;
    $this.getData()
  },
  methods: {
    async getData() {
      let $this = this;
      try {
        $this.loading = true;
        $this.volume.loading = true;
        $this.network.loading = true;
        $this.directConnectDevices.loading = true;
        let result = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers-inspur/${this.instanceId}`,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.41
          }
        });
        let instance = result['server'];
        if (instance.description === null) {
          instance.description = '';
        }
        $this.instance = instance;
        $this.projectId = instance['tenant_id'];
        $this.projectName = $this.projectRender(instance['tenant_id']);
        $this.userName = $this.ownerRender(instance['user_id']);
        if (instance['tags']) {
          $this.instanceTags = instance['tags'].filter(item => {
            return ReservedTags.findIndex(r => r.toUpperCase() === item.toUpperCase()) === -1;
          });
          $this.instanceTags = _.sortBy($this.instanceTags, item => -item.length);
        }
        if ('fault' in instance) {
          $this.instanceFault = instance['fault'].message || '';
        }
        if ('root_bdm' in instance) {
          $this.rootSize = instance['root_bdm']['volume_size'];
        } else {
          $this.rootSize = instance.root_gb;
        }
        const addresses = instance['addresses'];
        const netCards = [];  // 最终的网卡列表，包含fixed IP列和浮动IP列
        // 思路：以network_id和mac为key，分行显示网络信息。
        // 首先遍历fixed_ip，确定netCards的规模，然后再根据floating_ip遍历，进行补充。
        for (let key in addresses) {
          for (let i = 0; i < addresses[key].length; i++) {
            const address = addresses[key][i];
            let netCard = netCards.find(item => item.id === address.network_id && item.mac === address['OS-EXT-IPS-MAC:mac_addr']);
            // 相同netCard，不同IP的情况，只增加IP
            if (!netCard) {
              // const networkName = this.networkMaps.get(address.network_id);
              netCard = {
                id: address.network_id,
                name: '-',
                ip: [],
                fip: [],
                mac: ''
              };
              netCards.push(netCard);
            }
            if (address['OS-EXT-IPS:type'] === 'fixed') { // 只有类型为fixed的进入显示列表
              netCard.ip.push(address.addr);
              netCard.mac = address['OS-EXT-IPS-MAC:mac_addr'];
            }
          }
        }
        for (let key in addresses) {
          for (let i = 0; i < addresses[key].length; i++) {
            const address = addresses[key][i];
            let netCard = netCards.find(item => item.id === address.network_id && item.mac === address['OS-EXT-IPS-MAC:mac_addr']);
            // 相同netCard，不同IP的情况，只增加IP
            if (netCard) {
              if (address['OS-EXT-IPS:type'] === 'floating') {
                netCard.fip.push(address.addr); // 浮动IP单独形成一个array，用于查询
              }
            }
          }
        }
        $this.network.netCards = netCards;
        $this.loading = false;
      } catch (e) {
        $this.loading = false;
        __DEV__ && console.error(e);
      }
      $this.getNetworkData();
      $this.getVolumesData();
      $this.loadDirectConnectDevices();
    },
    async confirmSave() {
      var $this = this;
      var logMsgZh = "";
      var logMsgEn = "";
      if (['ACTIVE', 'SHUTOFF', 'SUSPENDED', 'PAUSED'].includes($this.instance.status)) {
        var vList = $this.volume.volumes;
        var body = {
          server: {}
        };
        for (let d = 0; d < vList.length; d++) {
          var volume = vList[d];
          var delFlag = ((volume.volumeDelOnTermination + "") == "true")?"True":"False";
          if ("True" == delFlag) {
            logMsgZh += volume.name + ":" + "是; ";
            logMsgEn += volume.name + ":" + "Yes; ";
          } else {
            logMsgZh += volume.name + ":" + "否; ";
            logMsgEn += volume.name + ":" + "No; ";
          }
          if (volume.type === "1") {
            body.server['root_dev_del_on_termination'] = delFlag;
          } else {
            if (!body.server.hasOwnProperty('data_disks_del_on_termination')) {
              body.server['data_disks_del_on_termination'] = [];
            }
            body.server.data_disks_del_on_termination.push({
              volume_id: volume.id,
              del_on_termination: delFlag
            });
          }
        }
        try {
          $this.saving = true;
          let ret = await this.$ajax({
            url: "api/nova/v2.1/servers-inspur/" + this.instanceId,
            data: JSON.stringify(body),
            type: 'put',
            log: {
              description: {
                en: "Delete instance (" + $this.instance.name + ") while deleting disk config" + logMsgEn,
                zh_cn: "删除云主机 (" + $this.instance.name + ") 时删除云硬盘配置:" + logMsgZh
              },
              key: "name",
              target: Vue.logTarget.computeInstance
            },
            successMsg: Vue.t('calcStorLang.instAlterConfigSuccess')
          });
          $this.saving = false;
          await $this.getData();
        } catch (data) {
          $this.saving = false;
          __DEV__ && console.error(data);
        }
      } else {
        $this.$message({
          showClose: true,
          message: Vue.t('calcStorLang.alterInstDetailTip'),
          type: 'warning'
        });
        return false;
      }
    },
    async getVolumesData() {
      const $this = this;
      $this.volume.loading = true;
      try {
        let volumesWithInfo = [];
        let bdmVolumes = $this.instance['os-extended-volumes-inspur:volumes_attached'];
        bdmVolumes = bdmVolumes.filter(item => item.volume_type !== 'passthru');
        for (let volume of bdmVolumes) {
          const uuid = volume.id;
          const res = await $this.$ajax({
            type: 'get',
            url: `api/cinderv3/v3/${$this.$cookie.get('pid')}/volumes/${uuid}`
          })
          const volumeFromAPI = res.volume;
          if (volumeFromAPI.attachments.find(item => item.server_id === $this.instanceId) == -1) {
            return '';  //如果网络请求返回时，已经切换了其他的云主机，就不再向下执行了。
          }
          volumesWithInfo.push({
            volumeName: volumeFromAPI['name'] || volumeFromAPI['id'],
            size: volumeFromAPI['size'],
            device: volume['device'],
            name: volumeFromAPI['name'] == ""?volumeFromAPI['id']:volumeFromAPI['name'],
            id: volumeFromAPI['id'],
            position: volumeFromAPI['os-vol-host-attr:host'],
            bootable: volumeFromAPI['bootable'],
            created_at: volumeFromAPI['created_at'],
            volume_type: volumeFromAPI['volume_type'],
            volumeDelOnTermination: volume.delete_on_termination,
            type: volume.boot_disk ? '1' : '2'
          })
        }
        $this.volume.volumes = volumesWithInfo;
        $this.volume.loading = false;
      } catch (e) {
        $this.volume.loading = false;
        __DEV__ && console.error(e);
      }
    },
    async getNetworkData() {
      const $this = this;
      $this.network.loading = true;
      for (let netCard of $this.network.netCards) {
        try {
          let res = await $this.$ajax({
            type: 'get',
            url: `api/neutron/v2.0/networks/${netCard.id}`
          });
          netCard.name = res.network.name;
        } catch (e) {
          __DEV__ && console.error(e);
        }
      }
      $this.network.loading = false;
    },
    async getVolumeList() {
      var $this = this;
      var url = "api/cinderv3/v3/" + $this.$cookie.get('pid') + "/volumes/detail?all_tenants=True&limit=99999";
      if ("2" == Vue.roleType || "3" == Vue.roleType) { //超级
          url= "api/cinderv3/v3/" + $this.$cookie.get('pid') + "/volumes/detail?limit=99999";
      }
      try {
        let result = await $this.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false,
          complete: function(XMLHttpRequest, textStatus) {}
        });
        var list = result['volumes'];
        for (let v = 0; v < list.length; v++) {
          var obj = list[v];
          $this.volumeMaps.set(obj.id, obj);
        }
        } catch (data) {
        }
    },
    typeRender(value) {
      var $this = this;
      if (value == "1") {
        return Vue.t('calcStorLang.instSystemDisk');
      } else {
        return Vue.t('calcStorLang.instDataDisk');
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
      return moment.utc(value).local().format('YYYY-MM-DD HH:mm:ss');
    },
    sizeRender(value) {
      var $this = this;
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
    ownerRender(value) {
      var $this = this;
      var userId = value;
      return $this.userMaps.get(userId) || "-";
    },
    projectRender(value) {
      var $this = this;
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
        return $this.projectMaps.get(projectId) || "-";
      }
    },
    async handleDeleteTag(tag) {
      const $this = this;
      await $this.$confirm(Vue.t('calcStorLang.VM_TAGS_DELETE_CONFIRM'), Vue.t('base.prompt'), {
        type: 'warning'
      }).then(async () => {
        try {
          const projectId = Vue.roleType + '' === '0' ? $this.$cookie.get('pid') : $this.projectId;
          const res = await $this.$ajax({
            url: `api/nova/v2.1/${projectId}/servers/${$this.instanceId}/tags/${encodeURIComponent(tag)}`,
            headers: {
              'OpenStack-API-Version': 'compute 2.41',
              'X-OpenStack-Nova-API-Version': 2.41
            },
            type: 'DELETE',
            log: {
              description: {
                en: `Delete instance Tag: ${tag}, instance ID: ${$this.instanceId}`,
                zh_cn: `删除云主机标签：${tag}，云主机ID：${$this.instanceId}`
              },
              key: "name",
              target: Vue.logTarget.computeInstance
            }
          })
          $this.$message.success(Vue.t('calcStorLang.VM_TAGS_SUCCESS_DELETED'));
          $this.$emit('refresh');
          const i = $this.instanceTags.findIndex(item => item === tag);
          if (i > -1) {
            $this.instanceTags.splice(i, 1);
          }
        } catch (e) {
          __DEV__ && console.error(e);
        }
      })
    },
    showVCPUInfoDialog() {
      this.vCPUInfoDialog.instance = this.instance;
      this.vCPUInfoDialog.visible = true;
    },
    closeVCPUInfoDialog() {
      this.vCPUInfoDialog.visible = false;
    },
    async loadDirectConnectDevices() {
      const $this = this;
      $this.directConnectDevices.loading = true;
      $this.directConnectDevices.devices = [];
      Promise.all([
        $this.loadAttachedDirectConnectDisks(),
        $this.loadBoundGPUDevices()
      ]).then((res) => {
        $this.directConnectDevices.loading = false;
      });
    },
    async loadAttachedDirectConnectDisks() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers-inspur/${$this.instanceId}/os-inspur-passthrus`
        });
        let attachedDisks = $this.instanceId in res ? res[$this.instanceId] : [];
        attachedDisks.forEach(item => {
          item.connection_info = JSON.parse(item.connection_info);
          if (item.connection_info.driver_volume_type === 'passthru_mapping' || item.connection_info.driver_volume_type === 'passthru_scsi') {
            item.type = 'scsi';
            item.address = item.connection_info.passthru_disk_id;
          } else if (item.connection_info.driver_volume_type === 'passthru_nvme') {
            item.type = 'nvme';
            item.address = item.connection_info.passthru_quad;
          }
          item.name = item.volume_name.split(':')[1];
        });
        $this.directConnectDevices.devices = attachedDisks.map(item => {
          return {
            name: item.name,
            address: item.address,
            type: item.type
          }
        });
      } catch (e) {
        __DEV__ && console.log(e);
      }
    },
    async loadBoundGPUDevices() {
      const $this = this;
      if ($this.$archIs('x86') && $this.hasCyborg) {
        try {
          const res = await $this.$ajax({
            type: 'get',
            url: `api/cyborg/v2/accelerator_requests?instance=${$this.instanceId}&bind_state=resolved`
          });
          res.arqs.forEach(item => {
            $this.directConnectDevices.devices.push({
              type: item.type,
              address: item.address,
              name: item.accel_name,
              productId: item.product_id
            });
          });
        } catch (e) {
          __DEV__ && console.error(e);
          $this.directConnectDevices.loading = false;
        }
      }
    },
    handleDescEdit() {
      const $this = this;
      $this.descEditForm.desc = $this.instance.description;
      $this.descEditForm.editMode = true;
      $this.$nextTick(() => {
        $this.$refs.descEditInput.$el.children[0].focus();
      });
    },
    async handleDescEditSubmit() {
      const $this = this;
      if ($this.descEditForm.desc === $this.instance.description) {  // 没有变化就直接退出编辑模式，不执行保存逻辑
        $this.descEditForm.editMode = false;
      } else {
        if ($this.descEditForm.desc.length > 255) {
          $this.$message.error($this.$t('calcStorLang.INSTANCE_DETAIL_EDIT_DESC_MAX_LENGTH_TIPS'));
        } else if (/\n/.test($this.descEditForm.desc)) {
          $this.$message.error($this.$t('validation.noNewLine'));
        } else {
          $this.descEditForm.desc = $this.descEditForm.desc.trim();
          try {
            $this.descEditForm.saving = true;
            await $this.$ajax({
              type: 'put',
              url: `api/nova/v2.1/servers/${$this.instanceId}`,
              headers: {
                'X-OpenStack-Nova-API-Version': 2.67
              },
              data: JSON.stringify({
                server: {
                  description: $this.descEditForm.desc
                }
              }),
              log: {
                description: {
                  en: `instance Edit Description (Name: ${$this.instance.name}, Id: ${$this.instanceId})`,
                  zh_cn: `云主机编辑描述(云主机名：${$this.instance.name}, Id: ${$this.instanceId})`
                },
                target: Vue.logTarget.computeInstance
              }
            });
            $this.instance.description = $this.descEditForm.desc;
            $this.descEditForm.saving = false;
            $this.descEditForm.editMode = false;
            $this.$message.success($this.$t('calcStorLang.INSTANCE_DETAIL_EDIT_DESC_SUCCESSFULLY'));
          } catch (e) {
            $this.descEditForm.saving = false;
            __DEV__ && console.error(e);
          }
        }
      }
    }
  },
  computed: {
    canModify() {
      return this.roleType === '0' || this.instance.locked === false;
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
