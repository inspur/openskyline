<template>
  <el-dialog :title="$t('calcStorLang.imageShared')" :visible.sync="dialogVisible"  :before-close="handleClose">
   <el-form ref="resSpecShareForm" :model="resSpecShare" label-width="100px" v-loading="loading" label-position="left">
      <el-form-item :label="$t('lang.project')">
       <el-select v-model="resSpecShare.project" filterable clearable>
        <el-option v-for="item in projectList" :key="item.value" :label="item.label" :value="item.value"></el-option>
       </el-select>
       <el-button type="primary" @click="addFun" size="small">{{$t('calcStorLang.shared')}}</el-button>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.sharedProjectList')">
        <el-table
          ref="shTable"
          :data="tableData"
          highlight-current-row
          border
          stripe
          style="width: 100%;"
          row-key="member_id">
           <el-table-column v-if="columnsChecked.indexOf('id') >= 0"
             prop="member_id"
             label="ID"
             align="left"
             min-width="80">
           </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
            prop="tenant_id"
            :label="$t('lang.project')+$t('lang.name')"
            align="left"
            min-width="80">
            <template slot-scope="scope">
              <span v-html="nameRender(scope.row.tenant_id, scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('operate') >= 0"
            prop="operate"
            align="left"
            :label="$t('calcStorLang.instOperate')"
            min-width="50">
            <template slot-scope="scope">
              <el-button @click="handleDel(scope.row.member_id)" type="text" size="small">{{$t('calcStorLang.imageUnShared')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="onRefresh">
              </el-button>
              <el-popover placement="right" trigger="click">
                <el-checkbox-group class="vertical" v-model="columnsChecked">
                  <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                  </el-checkbox>
                </el-checkbox-group>
                <div slot="reference" class="name-wrapper">
                  <el-tag>{{$t('network.columnSelected')}}</el-tag>
                </div>
              </el-popover>
            </el-col>
            <el-col :span="19">
              <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
            </el-col>
          </el-row>
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleCancel">{{$t('lang.close')}}</el-button>
    </div>
 </el-dialog>
 </template>
<script>
export default {
  name: "imageShare",
  props: ["imageInfo", "projecNameMap"],
  data() {
    return {
      projectList: [],
      totalData: [],
      tableData: [],
      loading: false,
      multipleSelection: [],
      columns: [{
        prop: "id",
        label: "ID"
      }, {
        prop: "name",
        label: Vue.t('lang.project') + Vue.t('lang.name')
      }, {
        prop: "operate",
        label: Vue.t('calcStorLang.instOperate')
      }],
      columnsChecked: ["id", "name", "operate"],
      resSpecShare: {
        project: []
      },
      sharedMap: new Map(),
      dialogVisible: false
    };
  },
  mounted() {
    var self = this;
    self.dialogVisible = true;
    Promise.all([self.initData()]).then(function(result) {
      self.getProjectList();
    });
  },
  methods: {
    async getProjectList() {
      var self = this;
      var resultData = [];
      try {
        let ret = await this.$ajax({
          type: "get",
          url: "api/keystone/v3/projects?domain_id=default"
        });
        let projects = ret.projects;
        for (let i = 0; i < projects.length; i++) {
          let project = projects[i];
          if (self.sharedMap.get(project["id"]) == null && self.imageInfo.owner != project["id"]) {
            resultData.push({
                value: project["id"],
                label: project["name"]
              });
          }
        }
        this.projectList = resultData;
      } catch (data) {
        self.loading = false;
      }
    },
    async initData() {
      var self = this;
      self.loading = true;
      self.sharedMap.clear();
      try {
        let result = await self.$ajax({
          type: "get",
          url: "api/glance/v2/images/" + this.imageInfo.id + "/members",
          showErrMsg: true,
          successFun: function() {}
        });
        self.resSpecShare.project = "";
        var list = result.members;
        self.totalData = list;
        for (let t = 0; t < list.length; t++) {
          var obj = list[t];
          self.sharedMap.set(obj['member_id'], obj);
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
        self.$message.error(Vue.t("calcStorLang.getError"));
      }
    },
    async handleDel(id) {
      var self = this;
      self.$confirm(Vue.t('calcStorLang.imageUnSharedMsgTip'), Vue.t('base.prompt'), {
        confirmButtonText: Vue.t('base.confirm'),
        cancelButtonText: Vue.t('base.cancel'),
        type: 'warning'
      }).then(() => {
        Promise.all([self.loadSendUnShare(id)]).then(function(result) {
          if (result[0] == "pending") {
            self.loadAcceptUnShare(id);
            self.moveModal();
          }
        });
      }).catch(() => {
        self.moveModal();
      });
    },
    async addFun() {
      var self = this;
      if (self.resSpecShare.project == "") {
        self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.imageSharedTip'),
              type: 'warning'
            });
          return;
      } else {
        self.$confirm(Vue.t('calcStorLang.imageShareMsgTip'), Vue.t('base.prompt'), {
          confirmButtonText: Vue.t('base.confirm'),
          cancelButtonText: Vue.t('base.cancel'),
          type: 'warning'
      }).then(() => {
        Promise.all([self.loadSendShare()]).then(function(result) {
            if (result[0] == "pending") {
              self.loadAcceptShare();
            }
            self.moveModal();
         });
        }).catch(() => {
          self.moveModal();
        });
      }
    },
    async loadSendShare() {
      var self = this;
      let selectedPro = self.resSpecShare.project;
      var shareProjectName = self.projecNameMap.get(selectedPro) || selectedPro;
      let key = selectedPro;
      let body = { member: selectedPro };
      body = JSON.stringify(body);
      try {
        let result = await self.$ajax({
          type: "post",
          url: "api/glance/v2/images/" + this.imageInfo.id + "/members ",
          data: body,
          showErrMsg: true,
          successFun: function() {},
          errFun: function(res) {
            self.$recordLog({
                target:Vue.logTarget.computeMirror,
                level:{
                  en:"error",
                  zh_cn:"错误"
                },
                description:{
                  en:"Mirror:" + self.imageInfo.name + " add project shared name:" + shareProjectName + "(" + res.responseJSON.message + ")",
                  zh_cn:"镜像:" + self.imageInfo.name + "添加共享项目:" + shareProjectName + "(" + res.responseJSON.message + ")"
                }
              });
          }
        });
        return result["status"];
      } catch (res) {
        self.loading = false;
        return "";
      }
    },
    async loadAcceptShare() {
      var self = this;
      self.loading = true;
      let selectedPro = self.resSpecShare.project;
      let body = { status: "accepted" };
      body = JSON.stringify(body);
      var shareProjectName = self.projecNameMap.get(selectedPro) || selectedPro;
      try {
        let result = await self.$ajax({
          type: "PUT",
          url:
            "api/glance/v2/images/" + this.imageInfo.id + "/members/" + selectedPro,
          data: body,
          showErrMsg: true,
          log: {
            description: {
              en: "Mirror:" + self.imageInfo.name + " add project shared name:" + shareProjectName,
              zh_cn: "镜像:" + self.imageInfo.name + "添加共享项目:" + shareProjectName
            },
            target: Vue.logTarget.computeMirror
          },
          successFun: function() {
            setTimeout(function() {
              Promise.all([self.initData()]).then(function(result) {
                self.getProjectList();
              });
              self.loading = false;
            }, 5000);
          }
        });
      } catch (res) {
        self.loading = false;
      }
    },
    async loadSendUnShare(id) {
      var self = this;
      var shareProjectName = self.projecNameMap.get(id) || id;
      let body = { status: "pending" };
      body = JSON.stringify(body);
      try {
        let result = await self.$ajax({
          type: "put",
          url: "api/glance/v2/images/" + this.imageInfo.id + "/members/" + id,
          data: body,
          showErrMsg: true,
          errFun: function(res) {
            self.$recordLog({
                target:Vue.logTarget.computeMirror,
                level:{
                  en:"error",
                  zh_cn:"错误"
                },
                description:{
                  en:"Mirror:" + self.imageInfo.name + " unshared project name:" + shareProjectName + "(" + res.responseJSON.message + ")",
                  zh_cn:"镜像:" + self.imageInfo.name + "解除共享项目:" + shareProjectName + "(" + res.responseJSON.message + ")"
                }
              });
          }
        });
        return result["status"];
      } catch (res) {
        self.loading = false;
        return "";
      }
    },
    async loadAcceptUnShare(id) {
      var self = this;
      var shareProjectName = self.projecNameMap.get(id) || id;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: "delete",
          url: "api/glance/v2/images/" + this.imageInfo.id + "/members/" + id,
          showErrMsg: true,
          log: {
            description: {
              en: "Mirror:" + self.imageInfo.name + " unshared project name:" + shareProjectName,
              zh_cn: "镜像:" + self.imageInfo.name + "解除共享项目:" + shareProjectName
            },
            target: Vue.logTarget.computeMirror
          },
          successFun: function() {
            setTimeout(function() {
              Promise.all([self.initData()]).then(function(result) {
                self.getProjectList();
              });
              self.loading = false;
            }, 5000);
          }
        });
      } catch (res) {
        self.loading = false;
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    onRefresh() {
      var self = this;
      Promise.all([self.initData()]).then(function(result) {
        self.getProjectList();
      });
    },
    handleCancel() {
      $(".v-modal").remove();
      this.$emit("handleImageShareShow", {});
    },
    handleClose(done) {
      $(".v-modal").remove();
      this.$emit("handleImageShareShow", {});
      done();
    },
    nameRender(val, row) {
      var projectId = row["member_id"];
      return this.projecNameMap.get(projectId) || projectId;
      // return this.projectList.find(item => item.value === val)["label"];
    },
    moveModal() {
      let modal = $("body").children(".v-modal");
      let clone = modal.clone();
      modal.remove();
      let dia = $(".el-dialog__wrapper");
      dia.nextAll(".v-modal").remove();
      dia.after(clone);
    }
  }
};
</script>