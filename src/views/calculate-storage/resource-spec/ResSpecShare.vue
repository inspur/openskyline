<template>
  <el-dialog :title="$t('calcStorLang.specShare')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="resSpecShareForm" :model="resSpecShare" label-width="100px"   label-position="left" v-bind:style="{top:'10px'}">
      <el-form-item :label="$t('lang.project')" prop="project" >
        <el-select v-model="resSpecShare.project" filterable>
          <el-option v-for="item in showprojectList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-button type="primary" @click="addFun">{{$t('lang.addTo')}}</el-button>
      </el-form-item>
    </el-form>
    <div>
      <el-table
        ref="shTable"
        :data="tableData"
        v-loading="loading"
        :element-loading-text="$t('calcStorLang.dataLoading')"
        highlight-current-row
        border
        stripe
        style="width: 100%;"
        slot="empty"
        max-height='500'
        row-key="id">
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
          prop="tenant_id"
          :label="$t('lang.project')+$t('lang.name')"
          align="left"
          min-width="100">
          <template slot-scope="scope">
              <span v-html="nameRender(scope.row.tenant_id, scope.row)"></span>
            </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('operation') >= 0"
          prop="tenant_id"
          align="left"
          :label="$t('base.action')"
          min-width="100">
          <template slot-scope="scope">
              <el-button @click="handleDel(scope.row.tenant_id)" type="text" size="small">{{$t('lang.delete')}}</el-button>
            </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <page style="float-right" :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
        </el-row>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.close')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'resSpecShare',
  props: ['specUuid', 'flavorName'],
  data() {
    return {
      showprojectList:[],
      projectList: [],
      valueT: [],
      addTenantList: [],
      removeTenantList: [],
      totalData: [],
      tableData: [],
      loading: false,
      multipleSelection:[],
      columnsChecked:["name", "operation"],
      resSpecShare: {
        project: []
      },
      dialogVisible: false,
      rules: {
        project: [
          { type: 'required', trigger: 'blur change' }
        ]
      }
    }
  },
  mounted() {
    var self = this;
    this.initForm = Object.assign({}, this.hostCreateForm);
    this.ruleStore = Object.assign({}, this.rules);
    Promise.all([this.getProjectList()]).then(function(result) {
        self.initData();
    });
  },
  /*updated() {
    var self = this;multipleSelection
  },*/
  methods: {
    async getProjectList() {
      var self = this;
      var resultData = [];
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/keystone/v3/projects?domain_id=default"
        });
        let projects = ret.projects;
        for (let i = 0; i < projects.length; i++) {
          let project = projects[i];
          let name = project['name'];
          resultData.push({
            value: project['id'],
            label: project['name']
            /*,
                        disabled: i % 4 === 0*/
          })
        }
        this.projectList = resultData;
        this.showprojectList = this.projectList;
      } catch (data) {
        self.loading = false;
      }
    },
    async initData() {
      var self = this;
       // self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/flavors/' + this.specUuid + '/os-flavor-access',
          showErrMsg: true,
          successFun:function() {
            // self.loading = false;
          }
        });
        // self.loading = false;
        //this.showprojectList = this.projectList;

        self.resSpecShare.project = "";
        self.tableData = result.flavor_access;
        self.totalData = result.flavor_access;
        if ( result.flavor_access.length > 0 ) {
          for (let i = 0; i < result.flavor_access.length; i++) {
            var newlist = this.showprojectList.filter(t => t.value != result.flavor_access[i]['tenant_id']);
            this.showprojectList = newlist;
          }
        }
      } catch (res) {
        self.loading = false;
        self.$message.error(Vue.t('calcStorLang.getError'));
      }
    },
    async handleDel(id) {
      var self = this;
      let body = {"removeTenantAccess": {"tenant": id}};
      body = JSON.stringify(body);
      let name = this.projectList.find(item => item.value === id)["label"];
      let flavorName = this.flavorName
      try {
        let result = await self.$ajax({
          type: 'post',
          url: 'api/nova/v2.1/flavors/' + this.specUuid + '/action',
          data: body,
          confirmMsg: Vue.t('calcStorLang.deleteConfirmComm') + Vue.t('lang.project') + "？",
          showErrMsg: true,
          log: {
            description: {
              en: "Delete project" + name + " with flavor:" + flavorName,
              zh_cn: "删除资源规格" + flavorName + "绑定的项目:" + name
            },
            target: Vue.logTarget.computeSpec
          },
          successFun:function() {
            self.$message(Vue.t('calcStorLang.deleteSuccess'));
          }
        });
        self.initData();
        this.showprojectList.push({
            value: id,
            label: name
          });
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    handleCancel() {
      this.$emit("handleShareShow", {});
    },
    handleClose(done) {
      this.$emit("handleShareShow", {});
      done();
    },
    show() {
      this.dialogVisible = true;
    },
    hide() {
      this.dialogVisible = false;
    },
    async addFun() {
      var self = this;
      this.$refs.resSpecShareForm.validate(async(valid) => {
        if (valid) {
        let selectedPro = self.resSpecShare.project;
        let key = selectedPro;
        let name = this.projectList.find(item => item.value === key)["label"];
        let body = {"addTenantAccess": {"tenant": key}};
        let flavorName = this.flavorName
        body = JSON.stringify(body);
        try {
          let result = await self.$ajax({
            type: 'post',
            url: 'api/nova/v2.1/flavors/' + this.specUuid + '/action',
            data: body,
            showErrMsg: true,
            log: {
              description: {
                en: "Add project" + name + " with flavor." + flavorName,
                zh_cn: "添加项目" + name + "到资源规格" + flavorName
              },
              target: Vue.logTarget.computeSpec
            },
            successFun:function() {
              self.$message(Vue.t('calcStorLang.successAdd'));
            }
          });
          self.initData();
          //var newlist = this.showprojectList.filter(t => t.value != key);
          //this.showprojectList = newlist;
        } catch (res) {
          self.loading = false;
        }
      }
    });
    },
    nameRender(val, row) {
       //var newlist = this.showprojectList.filter(t => t.value != val);
       //this.showprojectList = newlist;
      return this.projectList.find(item => item.value === val)["label"];
    },
    getCurrentData(param) {
        this.tableData = param;
    }
  }
}

</script>
