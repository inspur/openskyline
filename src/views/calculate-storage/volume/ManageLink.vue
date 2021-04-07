 <template>
  <el-dialog :title="$t('storage.manageConnection')" :visible.sync="visible" :before-close="handleClose">
    <el-form ref="manageLinkForm" :model="manageLinkForm" label-width="100px"  label-position="left" v-bind:style="{top:'10px'}" v-if="showFormFlag">
      <el-form-item :label="$t('storage.descoludInstance')" prop="name" class="is-required">
       <el-select v-model="manageLinkForm.server" v-if="!multiattachFlag" class="col-16" filterable clearable :disabled="disabled">
          <el-option class="clearfix" v-for="item in serverOptions" :value="item.id" :label="item.name" :key="item.index">
            <span style="float:left">{{item.name}}</span>
            <span style="float:left;color:#8492a6;" >{{unitHostName(item.name, item.id)}}</span>
          </el-option>
        </el-select>
        <el-select v-model="manageLinkForm.serverAry" v-if="multiattachFlag" class="col-16" multiple filterable clearable @change="handleOptionClick">
          <el-option class="clearfix" v-for="item in serverOptions" :value="item.id" :label="item.name" :key="item.index">
            <span style="float:left">{{item.name}}</span>
            <span style="float:left;color:#8492a6;" >{{unitHostName(item.name, item.id)}}</span>
          </el-option>
        </el-select>
        <el-button type="primary" @click="confirmFun" :loading="disabled">{{$t('storage.connection')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="shTable" :data="tableData" v-loading="loading" @selection-change="handleSelectionChange" style="width: 100%;" max-height='500' row-key="id" highlight-current-row border stripe>
      <el-table-column v-if="columnsChecked.indexOf('id') >= 0" prop="id" :label="'ID'" align="left" min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" align="left" min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('deviceType') >= 0" prop="deviceType" align="left" :label="$t('storage.device')" min-width="100">
        <template slot-scope="scope">
          <span>
            {{deviceTypeRender(scope.row.deviceType)}}
            <!-- <i :class="iconClassRender(scope.row.status)"></i> -->
          </span>
        </template> </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('operation') >= 0" prop="operation" align="left" :label="$t('storage.operation')" min-width="100">
        <template slot-scope="scope">
          <el-button @click="handleUninstall(scope.row)" v-if="scope.row.deviceType === 'instance'" :disabled="uninstallFlag" type="text" size="small">{{$t('storage.uninstall')}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <!-- 加个空按钮，避免测试提单子 -->
          <el-button type="text" icon="fa-refresh"></el-button>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
        </el-col>
      </el-row>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('storage.close')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name:"ManageLink",
  props: ['detailVolume'],
  volumeInfo:'',
  data() {
    return {
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      manageLinkForm: {
        server: '',
        serverAry: []
      },
      serverTemp: [],
      visible:true,
      loading:false,
      disabled:false,
      volumestatus: false,
      showFormFlag:true,
      multiattachFlag: false,
      connectFlag: false,
      uninstallFlag: true,
      tableData:[],
      totalData:[],
      serverOptions: [],
      attachmentList: [],
      multipleSelection:[],
      serverMap: new Map(),
      columnsChecked:["name", "deviceType", "operation"],
      columns:[{
        prop:"id",
        label:"ID"
      }, {
        prop:"name",
        label:this.$t('lang.name')
      }, {
        prop:"deviceType",
        label:this.$t('storage.device')
      }, {
        prop:"operation",
        label:this.$t('storage.operation')
      }]
    }
  },
  watch: {
    totalData: {
      immediate: false,
      handler: function (list) {
        var self = this;
        clearInterval(self.interVmValid);
        self.reloadTblFlag = true;
        if (self.reloadTblFlag) {
          self.interVmValid = setInterval(() => {
            Promise.all([
              self.loadVolumeDetail()
            ]);
          }, 5000);
        }
      }
    }
  },
  mounted() {
    let self = this;
    let {multiattach, attachments} = self.detailVolume;
    self.attachmentList = attachments;
    self.multiattachFlag = multiattach;
    if (!self.multiattachFlag && self.attachmentList.length > 0) {
      self.showFormFlag = false;
    } else {
      self.showFormFlag = true;
    }
    Promise.all([
      self.loadInstanceList()
    ]).then(function() {
      self.loadVolumeDetail()
    });
  },
  methods:{
    init() {
      let self = this;
      self.manageLinkForm.server = '';
      self.manageLinkForm.serverAry = [];
      Promise.all([
        self.loadInstanceList()
      ]).then(function() {
        self.loadVolumeDetail()
      });
    },
    iconClassRender (status) {
      if (status === "ACTIVE") {
        return "el-icon-fa-circle active";
      } else if (status === "SHUTOFF") {
        return "el-icon-fa-circle shutoff";
      } else {
        return "";
      }
    },
    async loadInstanceList() {
      //查询主机列表
      let self = this;
      let roleType = Vue.roleType + "";
      let projectId = self.detailVolume['os-vol-tenant-attr:tenant_id'];
      let url = "api/nova/v2.1/servers/detail?all_tenants=1&project_id=" + projectId;
      if ("2" == roleType || "3" == roleType) {
        url = "api/nova/v2.1/servers/detail?project_id=" + projectId;
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          showErrMsg: false
        });
        let servers = result['servers'];
        let serverList = [];
        for (let q = 0; q < servers.length; q++) {
          let tempServer = servers[q];
          /* 项目用户下，过滤掉非当前项目用户创建的云主机*/
          if (roleType == "3" && tempServer.user_id != Vue.userId) {
            continue;
          }
          /* 区分云主机和云物理机*/
          if (tempServer["tags"] && tempServer["tags"].includes("@")) {
            self.serverMap.set(tempServer.id, {type:"physicalHost", data: tempServer});
          } else {
            self.serverMap.set(tempServer.id, {type:"instance", data: tempServer});
            /**只有开机和关机状态下的云主机可以被挂载 */
            if (tempServer.status == "ACTIVE" || tempServer.status == "SHUTOFF") {
              //过滤掉已经挂载过的云主机
              let index = self.attachmentList.findIndex(function(item) {
                return item.server_id == tempServer.id;
              })
              if (index == -1) {
                serverList.push(tempServer);
              }
            }
          }
        }
        self.serverOptions = JSON.parse(JSON.stringify(serverList));
      } catch (res) {
        self.loading = false;
      }
    },
    //组装表格数据
    loadTabelData (attachments) {
      let self= this;
      let totalData = [];
      for (let i = 0; i < attachments.length; i++) {
        const item = attachments[i];
        let server = self.serverMap.get(item["server_id"]);
        totalData.push({
          id: server.data["id"],
          name: server.data["name"],
          deviceType: server.type,
          status: server.data["status"],
          operation: "",
          attachmentInfo: item
        });
      }
      self.totalData = totalData;
    },
    deviceTypeRender(type) {
      if (type === "instance") {
        return this.$t("calcStorLang.instance");
      } else {
        return this.$t("calcStorLang.physicalHost");
      }
    },
    async loadVolumeDetail() {
      let self = this;
      let roleType = Vue.roleType + "";
      let url = "api/cinderv3/v3/" + this.$cookie.get("pid") + "/volumes/" + self.detailVolume.id;
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: false
        });
        let volumeInfo = result["volume"];
        self.attachmentList = volumeInfo["attachments"];
        self.multiattachFlag = volumeInfo["multiattach"];
        //控制全部卸载按钮是否可用
        if (volumeInfo["status"] == "in-use" || volumeInfo["status"] == "available") {
          this.uninstallFlag = false;
        } else {
          this.uninstallFlag = true;
        }
        if (!self.multiattachFlag && self.attachmentList.length > 0) {
          self.showFormFlag = false;
        } else {
          self.showFormFlag = true;
        }
        let serverList = [];
        for (let temp of self.serverMap) {
          let tempServer = temp[1].data;
          let tempType = temp[1].type;
          if (tempType == "instance" && (tempServer.status == "ACTIVE" || tempServer.status == "SHUTOFF")) {
            let index = self.attachmentList.findIndex(function(item) {
              return item.server_id == tempServer.id;
            })
            if (index == -1) {
              serverList.push(tempServer);
            }
          }
        }
        self.serverOptions = JSON.parse(JSON.stringify(serverList));
        self.loadTabelData(self.attachmentList);
      } catch (res) {
        self.loading = false;
      }
    },
    async confirmFun() {
      try {
        let self = this;
        let volumeId = self.detailVolume.id;
        let {serverAry, server} = self.manageLinkForm;
        self.serverTemp = self.manageLinkForm.serverAry;
        self.manageLinkForm.serverAry = [];
        let tempS = [];
        if (!self.multiattachFlag && server) {
          tempS = [server];
        } else {
          tempS = self.serverTemp;
        }
        if (tempS.length == 0) {
          self.$message.warning(Vue.t('storage.selectInstance'));
          return;
        }
        if (tempS.length > 10) {
          self.$message.warning(Vue.t('storage.selectMax10Instance'));
          return;
        }
        self.disabled = true;
        for (let i = 0; i < tempS.length; i++) {
          const item = tempS[i];
          let server = self.serverMap.get(item);
          let body = { "volumeAttachment": { "volumeId": volumeId } };
          body = JSON.stringify(body);
          try {
            let result = await self.$ajax({
              type: 'post',
              url: "api/nova/v2.1/servers-inspur/" + item + "/os-inspur-volume_attachments",
              data: body,
              headers:{
                "Openstack-Api-Version":"compute 2.65"
              },
              showErrMsg: true,
              log:{
                description:{
                  en:"Send Mount volume: " + self.detailVolume.name + "(" + volumeId + ")To instacne" + server.data.name,
                  zh_cn:"发送挂载云硬盘:" + self.detailVolume.name + "(" + volumeId + ")到云主机" + server.data.name
                },
                target:Vue.logTarget.storage_volume
              }
            });
          } catch (res) {
            self.disabled = false;
          }
        }
        this.uninstallFlag = true;
        self.$message(Vue.t('storage.sendMountSuccess'));
        self.disabled = false;
        setTimeout(function() {
          self.init();
        }, 2000);
      } catch (error) {
        self.disabled = false;
        this.uninstallFlag = false;
      }
    },
    async handleUninstall(row) {
      try {
        let self = this;
        self.$confirm(self.$t('storage.manageConnectDeleteConfirm'), self.$t('lang.confirm'), {
          confirmButtonText: self.$t('lang.confirm'),
          cancelButtonText: self.$t('lang.cancel'),
          type: 'warning'
        }).then(async({ value }) => {
          self.uninstallFlag = true;
          let info = row.attachmentInfo;
          let resultLock = await self.$ajax({
            type: 'get',
            url: "api/nova/v2.1/servers-inspur/" + info.server_id,
            complete: function(XMLHttpRequest, textStatus) {},
            headers: {
              'X-OpenStack-Nova-API-Version': 2.41
            }
          });
          if (resultLock['server'].locked == true) {
            self.$message.warning(Vue.t('storage.unmountInstanceTip'));
            return;
          }
          let volList = resultLock['server']['os-extended-volumes-inspur:volumes_attached'];
          let isroot = false;
          for (let i=0; i<volList.length; i++) {
            if (volList[i].id == info.volume_id) {
              isroot = volList[i].boot_disk;
              break;
            }
          }
          if (isroot && resultLock.server.status !== 'SHUTOFF') {
            self.$message.warning(Vue.t('storage.rootDiskDeleteTip'));
            return;
          }
          self.doUninstall(row);
        }).catch(() => {
          //取消
          self.uninstallFlag = false;
        });
      } catch (error) {
        self.uninstallFlag = false;
      }
    },
    async doUninstall(row) {
      let self = this;
      let info = row.attachmentInfo;
      self.uninstallFlag = true;
      let url = "api/nova/v2.1/servers/" + info.server_id + "/os-volume_attachments/" + info.volume_id;
      let volumeId = info.volume_id;
      let oper = 0;
      try {
        let result = await self.$ajax({
          type: 'delete',
          url: url,
          showErrMsg: true,
          errorKey: "forbidden",
          successFun: function(data) {
            self.$message.info(Vue.t('storage.sendUninstallSuccess'));
            setTimeout(function() {
              self.init();
            }, 2000);
          },
          errFun: function() {
            self.uninstallFlag = false;
          },
          log:{
            description:{
              en:"Send UNMount volume:" + self.detailVolume.name + "(" + volumeId + ") From" + row.name,
              zh_cn:"发送卸载云硬盘:" + self.detailVolume.name + "(" + volumeId + ")从" + row.name
            },
            target:Vue.logTarget.storage_volume
          }
        });
      } catch (res) {
        self.uninstallFlag = false;
      }
    },
    handleOptionClick(value) {
      this.serverAry = value;
      if (this.serverAry.length > 10) {
        this.$message.warning(Vue.t('storage.selectMax10Instance'));
      }
    },
    unitHostName(name, id) {
      return " (" + id + ")";
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.$$refs.shTable.clearSelection();
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleClose () {
      clearInterval(this.interVmValid);
      this.$emit("handleManageLink", {});
      this.$emit("onRefresh", {});
    }
  }
}
</script>
<style scoped>
.active {
  margin-left: 3px;
  color: #2ee466;
}
.shutoff {
  margin-left: 3px;
  color:gray;
}
.el-button.is-disabled {
  color: #bbbbbb;
}
</style>
