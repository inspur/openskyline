 <template>
  <el-dialog :title="$t('storage.manageConnection')" :visible.sync="visible" :before-close="handleClose">
    <el-form ref="manageLinkForm" :model="manageLinkForm" label-width="100px"  label-position="left" v-bind:style="{top:'10px'}" :rules=rules  v-loading="loading">
      <el-form-item :label="$t('storage.descoludInstance')" prop="server" class="is-required">
        <el-select v-model="manageLinkForm.server" class="col-16" filterable clearable>
          <el-option class="clearfix" v-for="item in serverOptions" :value="item.id" :label="item.name" :key="item.index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.shareStoragePath')" prop="exportLocations" class="is-required">
        <el-select v-model="manageLinkForm.exportLocations" class="col-16" filterable clearable>
          <el-option class="clearfix" v-for="item in totalData" :value="item.id" :label="item.path" :key="item.index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.mountedPath')" prop="mountedPath" class="is-required">
        <el-input class="col-16" v-model="manageLinkForm.mountedPath" auto-complete="off">
          <template slot="prepend">/mnt</template>
        </el-input>
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="confirmFun">{{$t('container.attach')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="attachTable"
      :data="attachData" @row-click="handleSelectionChange"
      highlight-current-row border stripe style="width: 100%;" max-height='500' row-key="attachment_id">
      <el-table-column prop="name" align="center" :label="$t('lang.name')"  min-width="100">
      </el-table-column>
      <el-table-column prop="path" align="center" :label="$t('storage.path')" min-width="100">
      </el-table-column>
      <el-table-column  prop="mountpoint" align="center" :label="$t('storage.mountedPath')" min-width="100">
      </el-table-column>
      <el-table-column prop="operation" align="center" :label="$t('storage.operation')" min-width="100">
        <template slot-scope="scope">
          <el-button @click="unmountToVM(scope.row)" type="text" size="small">{{$t('storage.uninstall')}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh2">
          </el-button>
          <span v-if="false">{{$t('lang.currentSelected')}} {{multipleSelection2}} {{$tc("lang.item", multipleSelection2)}}</span>
        </el-col>
        <el-col :span="19">
          <page :totalData="attachments" @getCurrentData="getCurrentData2"></page>
        </el-col>
      </el-row>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="default" @click="handleClose">{{$t('storage.close')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name:"ManageVM",
  props: ['editShareData'],
  volumeInfo:'',
  data() {
    return {
      manageLinkForm: {
        server: '',
        exportLocations: '',
        mountedPath: ''
      },
      visible:true,
      loading:false,
      disabled:false,
      volumestatus: false,
      showFormFlag:true,
      multiattachFlag: false,
      connectFlag: false,
      uninstallFlag: true,
      totalData: [],
      serverOptions: [],
      serverMap: new Map(),
      attachments: [],
      oldattachments: [],
      rules: {
        server: [
          {type: 'required', trigger: 'blur change'}
        ],
        exportLocations: [
          {type: 'required', trigger: 'blur change'}
        ],
        mountedPath: [
          {type: 'required', trigger: 'blur change'},
          {type: 'linuxpath'},
          {type: 'maxSize', value: 200}
        ]
      },
      attachData: [],
      multipleSelection2: 0,
      columnsChecked2:["name", "path", "mountpoint", "operation"],
      columns2:[{
        prop:"name",
        label:this.$t('lang.name')
      }, {
        prop:"path",
        label:this.$t('storage.path')
      }, {
        prop:"mountpoint",
        label:this.$t('storage.mountedPath')
      }, {
        prop:"operation",
        label:this.$t('storage.operation')
      }]
    }
  },
  mounted() {
    let self = this;
  },
  methods:{
    init() {
      let self = this;
      if (self.editShareData["attachments"].length > 0) {
        self.oldattachments = self.editShareData["attachments"];
      }
      self.loadShareExportLocations();
      self.loadInstanceList();
    },
    async loadInstanceList() {
      let self = this;
      let roleType = Vue.roleType + "";
      let projectId = self.editShareData['project_id'];
      let url = "api/nova/v2.1/servers-inspur/detail?all_tenants=1&project_id=" + projectId;
      if ("0" != roleType) {
        url = "api/nova/v2.1/servers-inspur/detail?project_id=" + projectId;
      }
      try {
        self.loading = true;
        let result = await self.$ajax({
          type: 'get',
          url: url,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          showErrMsg: false
        });
        self.loading = false;
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
            /**只有开机状态下且Linux系统的云主机可以被挂载 */
            let addFlag=true;
            if (tempServer.status == "ACTIVE" && tempServer.system_metadata && tempServer.system_metadata["image_os_type"] =="linux") {
              if (self.attachments.length == 0) {
                for (let i=0; i<self.oldattachments.length; i++) {
                  if (self.oldattachments[i].instance_id == tempServer.id) {
                    addFlag = false;
                  }
                }
              } else {
                for (let i=0; i<self.attachments.length; i++) {
                  if (self.attachments[i].instance_id == tempServer.id) {
                    addFlag = false;
                  }
                }
              }
              if (addFlag) {
                serverList.push(tempServer);
              }
            }
          }
        }
        self.serverOptions = JSON.parse(JSON.stringify(serverList));
        if (self.attachments.length == 0) {
          for (let i=0; i<self.oldattachments.length; i++) {
            let server = this.serverMap.get(self.oldattachments[i].instance_id);
            if (server !=null) {
              self.oldattachments[i]["name"] = server.data.name;
              self.attachments.push(self.oldattachments[i]);
            }
          }
        } else {
          for (let i=0; i<self.attachments.length; i++) {
            let server = self.serverMap.get(self.attachments[i].instance_id);
            if (server !=null) {
            self.attachments[i]["name"] = server.data.name;
            }
          }
        }
      } catch (res) {
      }
    },
    async loadShareExportLocations() {
      try {
        var url = "api/manila/v2/" + this.$cookie.get("pid") + "/shares/" + this.editShareData.id + "/export_locations";
        let result = await this.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        this.totalData = result['export_locations'];
      } catch (res) {
      }
    },
    async confirmFun() {
      let self = this;
      self.$refs.manageLinkForm.validate(async valid => {
        if (valid) {
          self.mountToVM();
        }
      });
    },
    async mountToVM() {
      let self = this;
      let attach = {"instanceId":"", "exportLocationId": "", "mountpoint": ""};
      let body = {"attach_share_inspur":attach};
      attach["mountpoint"] = "/mnt" + self.manageLinkForm.mountedPath;
      attach["instanceId"] = self.manageLinkForm.server;
      attach["exportLocationId"] = self.manageLinkForm.exportLocations;
      let server = self.serverMap.get(self.manageLinkForm.server);
      self.loading = true;
      try {
      let result = await self.$ajax({
        type: 'post',
        url: "api/manila/v2/" + self.$cookie.get("pid") + "/inspur-shares/"+self.editShareData.id +"/action",
        data: JSON.stringify(body),
        showErrMsg: false,
        successMsg:this.$t('calcStorLang.volumeMountSendSuccess'),
        errFun: function(res) {
          let responseJSON = res["responseJSON"]
          self.$message.error(self.$t('container.attachError')+":"+responseJSON["badRequest"]["message"]);
        },
        log:{
          description:{
            en:"Send Mount volume: " + self.editShareData.name + "To instacne" + server.data.name,
            zh_cn:"挂载文件存储:" + self.editShareData.name + "到云主机" + server.data.name
          },
          target:Vue.logTarget.storage_share
        }
      });
      self.loading = false;
      this.$refs.manageLinkForm.resetFields();
      self.onRefresh2();
      } catch (error) {
      self.loading = false;
      }
    },
    async unmountToVM(row) {
      let self = this;
      let attach = {"attachmentId":row["attachment_id"]};
      let body = {"detach_share_inspur":attach};
      self.loading = true;
      try {
      let result = await self.$ajax({
        type: 'post',
        url: "api/manila/v2/" + self.$cookie.get("pid") + "/inspur-shares/"+self.editShareData.id +"/action",
        data: JSON.stringify(body),
        showErrMsg: false,
        successMsg:this.$t('calcStorLang.volumeUnMountSuccess'),
        errFun: function() {
          self.$message.error(self.$t('container.detachError'));
        },
        log:{
          description:{
            en:"Send UnMount volume: " + self.editShareData.name + "To instacne" + row["name"],
            zh_cn:"文件存储:" + self.editShareData.name + "从云主机" + row["name"] + "卸载"
          },
          target:Vue.logTarget.storage_share
        }
      });
      self.loading = false;
      self.onRefresh2();
      } catch (error) {
      self.loading = false;
      }
    },
    async onRefresh2() {
      let self = this;
      self.manageLinkForm.server = "";
      self.manageLinkForm.exportLocations = "";
      self.manageLinkForm.mountedPath = "";
      let url = "api/manila/v2/" + self.$cookie.get("pid") + "/inspur-shares/detail?all_tenants=True";
      let ret = await this.$ajax({
        type: 'GET',
        url: url,
        headers: {
          "X-Openstack-Manila-Api-Version": "2.40"
        }
      });
      let shares = ret['shares'];
      for (let i=0; i<shares.length; i++) {
        if (self.editShareData.id == shares[i]["id"]) {
          self.oldattachments = shares[i]["attachments"];
          self.attachments = [];
        }
      }
      this.multipleSelection2 = 0;
      self.loadInstanceList();
    },
    getCurrentData2(param) {
      this.attachData = param;
    },
    handleSelectionChange(val) {
      this.multipleSelection2 = 1;
    },
    handleClose () {
      this.$emit("handleShow", {});
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
