<template>
  <div>
    <icos-page-header :title="$t('opt.customizeProcess')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="true" />
    <icos-page>
    <el-form
      v-loading="loading"
      class="me-required-form"
      :element-loading-text="$t('opt.dataLoading')"
      :model="processAdd"
      :rules="rules"
      ref="processAddForm"
      label-width="140px">
      <el-form-item :label="$t('opt.name')" prop="processName" class="is-required">
        <el-input class="col-12" v-model="processAdd.processName" auto-complete="off" style="width:600px"></el-input>
      </el-form-item>
      <el-row><el-col :span="24">
      <el-form-item :label="$t('opt.description')" prop="processAlias" class="">
        <el-input type="textarea" class="col-12" v-model="processAdd.processAlias" auto-complete="off" style="width:600px"></el-input>
      </el-form-item>
      </el-col></el-row>
      <el-form-item :label="$t('opt.project')" prop="project" class="is-required" style="width:720px" v-show="isAdmin()">
        <el-input :placeholder="$t('opt.inputKeywordsForFilter')" v-model="filterText">
        </el-input>
        <div style="height: 150px;overflow: auto;">
          <el-tree
          class="filter-tree"
          ref="treePoject"
          node-key="id"
          :data="treeData"
          style="position: relative;"
          :props="defaultProps"
          :filter-node-method="filterNode"
          show-checkbox
          default-expand-all>
          </el-tree>
        </div>
      </el-form-item>
      <el-form-item :label="$t('opt.resourceType')" prop="type" class="is-required">
        <treeProcess ref="treeProcess" ></treeProcess>
      </el-form-item>
       <el-form-item :label="$t('opt.approvalLevel')" prop="selectLevel" class="is-required">
        <el-select v-model="selectLevel" @change="onChanged">
          <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-checkbox v-model="autoChecked">{{$t('opt.automaticApproval')}}</el-checkbox>
      </el-form-item>
      <el-form-item :label="$t('opt.approvalHierarchy')" prop="approveLevel" class="is-required">
        <el-form :inline="true" :model="dynamicNodeForm" ref="dynamicNodeForm">
          <el-form-item
            v-for="(node, index) in dynamicNodeForm.nodes"
            :key="node.key"
            :prop="'nodes.'+index+'.value'"
            :label="$t('opt.approvalHierarchy')+(index+1)" style="display:block;">
            <el-select v-model="node.applyNodePolicy" style="width:110px" :placeholder="$t('opt.approveRule')">
              <el-option :label="$t('opt.allPass')" value="ALLPASS" ></el-option>
              <el-option :label="$t('opt.anyPass')" value="ANYPASS"></el-option>
            </el-select> 
            <el-input :placeholder="$t('opt.addApprover')" v-model="node.input1" :disabled="true" style="width:200px"></el-input>
            <el-button @click="addPerson(index)">{{$t('opt.addApprover')}}</el-button>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item style="text-align: left;">
        <el-button @click="resetForm" :disabled="isDisabled">{{$t('opt.cancel')}}</el-button>
        <el-button type="primary" @click="submitForm" :loading="isDisabled">{{$t('opt.submit')}}</el-button>
      </el-form-item>
    </el-form>
    <add-person @cancel="addPersonCancel" ref="addPerson" v-if="addPersonFlg" @addData="addData" :parentRole2="crRole"></add-person>
    </icos-page>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import treeProcess from './TreeProcess'
import addPerson from './AddPerson'
export default {
  name: 'processAdd',
  data() {
    return {
      processAdd: {
        processName: "",
        processAlias: ""
      },
      dynamicNodeForm: {
        nodes: [{
          applyNodePolicy: '',
          key: ''
        }]
      },
      isDisabled: false,
      addPersonFlg: false,
      autoChecked: true,
      levelOptions:[{
        value: 1,
        label: Vue.t('opt.level1Approval')
      }, {
        value: 2,
        label: Vue.t('opt.level2Approval')
      }, {
        value: 3,
        label: Vue.t('opt.level3Approval')
      }, {
        value: 4,
        label: Vue.t('opt.level4Approval')
      }, {
        value: 5,
        label: Vue.t('opt.level5Approval')
      }],
      selectLevel: 1,
      levels: 0,
      crRole: '',
      rules: {
        processName: [
          { type: 'required' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        processAlias: [
          { type: 'maxSize', value: 255 }
        ],
        project: [
          { type: 'required' }
        ],
        type: [
          { type: 'required' }
        ],
        selectLevel: [
          { type: 'required' }
        ],
        approveLevel: [
          { type: 'required' }
        ]
      },
      loading: false,
      creatorRole: Vue.roleType,
      filterText: "",
      treeData: [{
        id: 1,
        label: this.$t('opt.allResType'),
        children: []
      }],
      defaultProps: {
        children: "children",
        label: "label"
      }
    }
  },
  watch: {
    filterText(val) {
      this.$refs.treePoject.setCheckedKeys([]);
      this.$refs.treePoject.filter(val);
    }
  },
  mounted() {
    var self = this;
    self.init();
    var roleType = Vue.roleType + "";
    if ("0" == roleType) {
      self.getProjectList();
    }
  },
  methods: {
    async init() {
      this.dynamicNodeForm.nodes = [];
      this.dynamicNodeForm.nodes.push({
        input1: "",
        inputIds: "",
        applyNodePolicy: '',
        key: Date.now()
      });
    },
    filterNode(value, data, node) {
      if (!value) {
        node.data.disabled = false;
        return true
      };
      if (data.label.indexOf(value) !== -1) {
        node.data.disabled = false;
        return true;
      } else {
        if (node.data.id != "1") {
          node.data.disabled = true;
        }
        return false;
      }
    },
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
            id: project['id'],
            label: project['name']
          })
        }
        this.treeData[0].children = resultData;
      } catch (data) {
        self.loading = false;
      }
    },
    onChanged(item) {
      this.levels = this.selectLevel;
      var index = this.dynamicNodeForm.nodes.length;
      if (index < 6) {
        if (index < this.levels) {
          let temp = this.levels - index;
          for (let i= 0; i< temp; i++) {
            this.dynamicNodeForm.nodes.push({
              input1: '',
              inputIds: '',
              applyNodePolicy: '',
              key: Date.now()
            });
          }
        } else if (index > this.levels) {
          let temp2 = index - this.levels;
          this.dynamicNodeForm.nodes.splice(this.levels, temp2);
        } else {
        }
      }
    },
    addPerson(index) {
      this.addPersonFlg = true;
      let flg = 0;
      if (index == this.selectLevel - 1) {
        flg = 1;
      } else {
        flg = 0;
      }
      this.crRole = this.creatorRole;
      this.$nextTick(() => {
        this.$refs.addPerson.parentIndex = index;
        this.$refs.addPerson.parentItem = flg;
        this.$refs.addPerson.parentRole = this.crRole;
        this.$refs.addPerson.parentId = this.projectId;
        this.$refs.addPerson.getSelectCol(this.dynamicNodeForm.nodes[index].input1, this.dynamicNodeForm.nodes[index].inputIds);
      });
    },
    addPersonCancel() {
      this.addPersonFlg = false;
    },
    submitForm() {
      let self = this;
      var roleType = Vue.roleType + "";
      let processName = self.processAdd.processName;
      let processAlias = self.processAdd.processAlias;
      let projectReturn = "";
      if ("0" == roleType) {
        let project = self.$refs.treePoject.getCheckedNodes();
        if (project != "" && project != null) {
          for (var i = 0; i < project.length; i++) {
            if (i == 0) {
                projectReturn += project[i].id;
            } else {
                projectReturn += "," + project[i].id;
            }
          }
          if (project[0].id == 1) {
              projectReturn = "all";
          }
        } else {
          self.$notify({
            message: this.$t('opt.projectCannotEmpty'),
            type: "warning"
          });
          return;
        }
      } else {
        projectReturn = self.$cookie.get("pid");
      }
      let type = self.$refs.treeProcess.getTreeNodeId();
      if (!type) {
        return;
      }
      let selectLevel = self.selectLevel;
      let autoChecked = self.autoChecked;
      let nodeInfoArr = [];
      for (var j = 0; j < this.dynamicNodeForm.nodes.length; j++) {
        let ruleAndIds = {
          "node_rule": this.dynamicNodeForm.nodes[j].applyNodePolicy,
          "approvers_ids": this.dynamicNodeForm.nodes[j].inputIds
        };
        if (!ruleAndIds.node_rule || !ruleAndIds.approvers_ids) {
          self.$notify({
            message: this.$t('opt.approverAndRuleCannotEmpty'),
            type: "warning"
          });
          return;
        } else {
          nodeInfoArr.push(ruleAndIds);
        }
      }
      self.isDisabled = true;
      let reqdata = {
        "name": processName,
        "node_number": selectLevel,
        "auto_approve": autoChecked,
        "op_desc": processAlias,
        "creator_role": Vue.roleType,
        "project_ids": projectReturn,
        "resource_ids":type,
        "node_info":nodeInfoArr
      };
      this.$refs.processAddForm.validate(async(valid) => {
        if (valid) {
          try {
            let result = self.$ajax({
              type: "POST",
              url: "api/leo/v1/flow/create_flow",
              data: JSON.stringify(reqdata),
              success: function(result) {
                self.$message.success(Vue.t('opt.addProcessSuccess'));
                let parentPath = self.$route.matched[1].path;
                self.isDisabled = false;
                // self.$router.push({
                //   path: '/operations/flow-manage'
                // });
                self.loading = false;
                self.$emit("handleAddShow");
              },
              errFun: function() {
                self.isDisabled = false;
              },
              log:{
                description:{
                  en:"Create process:"+processName,
                  zh_cn:self.$t('opt.createProcess')+processName
                },
                target:Vue.logTarget.process_manage
              },
              errorKey: "NeutronError"
            });
          } catch (res) {
            self.isDisabled = false;
          }
        } else {
          self.isDisabled = false;
          return false;
        }
      });
    },
    isAdmin() {
      var roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        return false;
      }
      return true;
    },
    resetForm() {
      this.$refs.processAddForm.resetFields();
      let parentPath = this.$route.matched[1].path;
      this.$emit("handleCancelShow");
      // this.$router.push({
      //   path: '/operations/flow-manage'
      // });
    },
    addData({selectedPersonnel, selectedPersonIds, index}) {
      this.dynamicNodeForm.nodes[index].input1 = selectedPersonnel.toString();
      this.dynamicNodeForm.nodes[index].inputIds = selectedPersonIds.toString();
      this.addPersonFlg = false;
    },
    handlePageHeaderBack () {
      this.$refs.processAddForm.resetFields();
      let parentPath = this.$route.matched[1].path;
      // this.$router.push({
      //   path: '/operations/flow-manage'
      // });
      this.$emit("handleCancelShow");
    }
  },
  components: {
    treeProcess,
    addPerson
  }
}
</script>
<style scoped>
</style>
