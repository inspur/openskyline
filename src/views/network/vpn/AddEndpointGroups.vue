<template>
  <div>
    <el-dialog :title="$t('network.ADD_ENDPOINT')" :visible.sync="dialogVisible" :before-close="handleClose">
      <el-row>
        <el-col :span="16">
          <el-form ref="form" :model="form" class="me-required-form" label-width="180px" :rules="rules" v-loading="loading">
            <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
              <el-input class="col-20" v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item :label="$t('lang.project')" class="is-required" prop="projectName" v-if="roleType == '0'">
              <el-input auto-complete="off" class="col-20" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="form.projectName"></el-input>
            </el-form-item>
            <el-form-item :label="$t('lang.desc')" prop="description">
              <el-input type="textarea" class="col-20" v-model="form.description"></el-input>
            </el-form-item>
            <el-form-item :label="$t('network.type')" class="is-required" prop="type">
              <el-select class="col-20" v-model="form.type">
                <el-option v-for="item in typeOption" :key="item.value" :label="item.name" :value="item.value"></el-option>
              </el-select>
              <el-tooltip effect="dark" :content="$t('network.endpointTypeTip')" placement="top">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('network.remotepeercidrs')" v-if="form.type == 'cidr'" class="is-required" prop="cidr">
              <el-input class="col-20" v-model="form.cidr"></el-input>
              <el-tooltip effect="dark" :content="$t('network.externalSystemCIDRsTip')" placement="top">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item v-if="form.type == 'subnet'" :label="$t('network.localsubnets')" class="is-required" prop="subnet">
              <el-select class="col-20 localsubnet" v-model="form.subnet" multiple filterable @visible-change="selectSubnet($event)">
                <el-option v-for="item in subnetList" :key="item.id" :label="item.name + '(' + item.cidr + ')'" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" @click="saveAdd" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
      </span>
    </el-dialog>
    <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script type="text/javascript">
export default {
  name: "AddVPNServer",
  data() {
    return {
      dialogVisible: false,
      loading: false,
      selProjectFlg: false,
      close: "",
      form: {
        name: "",
        description: "",
        project_id: "",
        projectName: "",
        type: "cidr",
        cidr: "",
        subnet: []
      },
      subnetList: [],
      roleType: Vue.roleType + "",
      query_porject: Vue.projectListforNet,
      typeOption: [
        { value: "cidr", name: "cidr" },
        { value: "subnet", name: "subnet" }
      ],
      isDisabled: false,
      rules: {
        name: [
          { type: "onlyLetterNumber_Chinese" },
          { type: "requiredNet" },
          { type: "maxSize", value: 40 }
        ],
        projectName: [{ type: "requiredNet" }],
        type: [{ type: "requiredNet" }],
        cidr: [{ type: "required" }],
        subnet: [{ type: "required" }],
        description: [{ type: "maxSize", value: 255 }]
      }
    };
  },
  mounted() {
    // this.$parent.$parent.active = "VpnList";
    this.initDialog();
  },
  methods: {
    selectSubnet (visible) {
      if (!visible) {
        $(".localsubnet .el-select__tags-text").each(function(i, v) {
          let $item = $(v);
          $item[0].setAttribute("title", $item.text());
        });
      }
    },
    initDialog() {
      this.dialogVisible = true;
      let roleType = Vue.roleType + "";
      if (roleType != "0") {
        this.form.project_id = Vue.cookie.get("pid");
        this.getsubnetList(this.form.project_id);
      }
    },
    handleClose(done) {
      this.$emit("handlerCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handlerCancelShow", {});
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.getsubnetList(id);
      this.form.project_id = id;
      this.form.projectName = name;
      this.close = "close";
    },
    async getProjectNetworks(projectId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/networks?project_id=${projectId}&shared=false&status=ACTIVE&router:external=false&not-tags=bm_deploy`
        });
        return res.networks;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async getSharedNetworks() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/networks?shared=true&status=ACTIVE&not-tags=bm_deploy`
        });
        return res.networks;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async getNetworks(projectId) {
      const $this = this;
      return new Promise((resolve, reject) => {
        Promise.all([$this.getProjectNetworks(projectId), $this.getSharedNetworks()]).then((res) => {
          let networks = res[0].concat(res[1]);
          resolve(networks);
        }).catch(e => {
          reject(e);
        });
      });
    },
    async getsubnetList(projectid) {
      let self = this;
      self.form.subnet = [];
      try {
        let networks = await self.getNetworks(projectid);
        let networkIds = networks.map(item => item.id);
        self.subnetList = [];
        let resultData = await self.$ajax({
          type: "post",
          data: JSON.stringify({ project_id: projectid }),
          url:
            "api/neutron/v2.0/inspur/networkextension/get_subnets_by_project_id"
        });
        resultData = resultData.filter(item => networkIds.includes(item.net_id));
        self.subnetList = resultData;
      } catch (res) {}
    },
    uniqueIds(arr) {
      let allArray = [];
      for (let i = 0; i < arr.length; i++) {
        var flag = true;
        for (let j = 0; j < allArray.length; j++) {
          if (allArray[j].id === arr[i].id) {
            flag = false;
          }
        }
        if (flag) {
          allArray.push(arr[i]);
        }
      }
      return allArray;
    },
    onIconClick() {
      this.form.project_id = "";
      this.form.projectName = "";
      this.close = "";
    },
    saveAdd() {
      let self = this;
      self.$refs.form.validate(async valid => {
        if (valid) {
          let endpoint = [];
          if (self.form.type == "subnet") {
            endpoint = self.form.subnet;
          } else {
            endpoint = self.form.cidr.split(",");
            let cidrsMap = new Map();
            for (let e = 0; e < endpoint.length; e++) {
              if (cidrsMap.has(endpoint[e])) {
                self.$message(Vue.t("network.samecidr"));
                return;
              } else {
                cidrsMap.set(endpoint[e], endpoint[e]);
              }
            }
          }
          if (endpoint.length > 6) {
            self.$message(Vue.t("network.cidr6"));
            return;
          }
          self.loading = true;
          self.isDisabled = true;
          let reqdata = {
            endpoint_group: {
              name: self.form.name,
              description: self.form.description,
              project_id: self.form.project_id,
              type: self.form.type,
              endpoints: endpoint
            }
          };
          self.$ajax({
            type: "POST",
            url: "api/neutron/v2.0/vpn/endpoint-groups",
            data: JSON.stringify(reqdata),
            errorKey: "NeutronError",
            successMsg: Vue.t("network.saveSuccess"),
            success: function(result) {
              self.loading = false;
              self.isDisabled = false;
              self.$emit("handleAddShow", {});
            },
            errFun() {
              self.loading = false;
              self.isDisabled = false;
            },
            log: {
              description: {
                en: "Add EndpointGroups Server:" + self.form.name,
                zh_cn: "创建Endpoint组:" + self.form.name
              },
              target: Vue.logTarget.endpointGroup
            }
          });
          return true;
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style type="text/css">
  .localsubnet .el-tag--primary{
    width: 100%;
  }
  .localsubnet .el-select__tags-text{
    width: 90%;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
  }
  .localsubnet .el-icon-close{
    top: -7px
  }
  .el-select-dropdown__item span{
    padding-right: 20px;
  }
</style>
