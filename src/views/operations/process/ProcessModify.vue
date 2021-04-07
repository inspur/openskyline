<template>
  <div>
    <icos-page-header :title="$t('opt.processManagement')" :show-back="true" @back="resetForm" :show-bottom-border="true" />
    <icos-page>
    <el-form
      v-loading="loading"
      class="me-required-form"
      :rules="rules"
      ref="processModifyForm"
      :model="processModifyForm"
      label-width="140px">
      <el-form-item :label="$t('opt.name')" prop="processName" class="is-required">
        <el-input class="col-12" style="width:600px;" v-model="processModifyForm.processName"></el-input>
      </el-form-item>
      <el-row><el-col :span="24">
      <el-form-item :label="$t('opt.description')" prop="processAlias">
        <el-input type="textarea" class="col-12" style="width:600px;" v-model="processModifyForm.processAlias"></el-input>
      </el-form-item>
      </el-col></el-row>
      <el-form-item :label="$t('opt.approvalLevel')" prop="selectLevel" class="is-required">
        <el-select v-model="selectLevel" @change="onChanged" >
          <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-checkbox v-model="processModifyForm.autoApproval">{{$t('opt.automaticApproval')}}</el-checkbox>
      </el-form-item>
      <el-form-item :label="$t('opt.approvalHierarchy')" prop="approveLevel" class="is-required">
        <el-form :inline="true" :model="dynamicNodeForm" ref="dynamicNodeForm">
          <el-form-item
            v-for="(node, index) in dynamicNodeForm.nodes"
            :key="node.key"
            :prop="'nodes.'+index+'.value'"
            :label="$t('opt.approvalHierarchy')+(index+1)" style="display:block;">
            <el-select v-model="node.applyNodePolicy" style="width:110px" :placeholder="$t('opt.approveRule')">
                <el-option :label="$t('opt.allPass')" value="ALLPASS"></el-option>
                <el-option :label="$t('opt.anyPass')" value="ANYPASS"></el-option>
            </el-select>
            <el-input :placeholder="$t('opt.addApprover')" v-model="node.input1" :disabled="true" style="width:200px"></el-input>
            <el-button @click="addPerson(index)">{{$t('opt.addApprover')}}</el-button>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item>
        <el-button @click="resetForm">{{$t('opt.cancel')}}</el-button>
        <el-button type="primary" @click="submitForm">{{$t('opt.submit')}}</el-button>
      </el-form-item>
      <add-person @cancel="addPersonCancel" ref="addPerson" v-if="addPersonFlg" @addData="addData" :parentRole2="crRole" :parentId2="projectId"></add-person>
    </el-form>
    </icos-page>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import addPerson from './AddPerson'
import dateTimeFormatter from 'utils/dateTimeFormatter';
export default {
  name: 'processModify',
  components: {
    addPerson
  },
  data() {
    return {
      processModifyForm:{
        processName: "",
        processAlias: "",
        autoApproval: ""
      },
      dynamicNodeForm: {
        nodes: [{
          input1: '',
          inputIds: "",
          applyNodePolicy: '',
          key: ''
        }]
      },
      addPersonFlg: false,
      crRole: '',
      roleMaps: new Map(),
      levelOptions: [{
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
      creatorRole: Vue.roleType,
      projectId: "",
      rules: {
        processName: [
          { type: 'required' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        processAlias: [
          { type: 'maxSize', value: 255 }
        ],
        selectLevel: [
          { type: 'required' }
        ],
        approveLevel: [
          { type: 'required' }
        ]
      },
      loading: false
    }
  },
  watch: {
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      let self = this;
      this.dynamicNodeForm.nodes = [];
      let result = await self.$ajax({
        type: 'get',
        url: "api/leo/v1/flow/"+ self.$route.params.id
      });
      let process1 = result.data['flow'];
      let prolevel = result.data['node_info'];
      self.creatorRole = process1["creator_role"];
      self.projectId = process1["project"][0];
      self.processModifyForm.processName = process1["name"];
      self.processModifyForm.processAlias = process1["op_desc"];
      self.processModifyForm.autoApproval = process1["auto_approve"];
      self.selectLevel = process1["node_number"];
      let allData = [];
      let ret = await self.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/users"
      })
      allData = ret.users;
      for (let n=0; n<allData.length; n++) {
        self.roleMaps.set(allData[n].id, allData[n].name);
      }
      this.dynamicNodeForm.nodes = [];
      for (let i=0; i<self.selectLevel; i++) {
        var obj = {};
        var strings = "";
        let approver = [];
        approver = prolevel[i].approvers_ids.split(",");
        for (let m=0; m<approver.length; m++) {
          if (self.roleMaps.has(approver[m])) {
            if (m == approver.length - 1) {
              strings += self.roleMaps.get(approver[m]);
            } else {
              strings += self.roleMaps.get(approver[m]) + ",";
            }
          } else {
            if (m == approver.length - 1) {
              strings += "-";
            } else {
              strings += "-,";
            }
          }
        }
        obj.input1 = strings;
        obj.inputIds = prolevel[i].approvers_ids;
        obj.applyNodePolicy = prolevel[i].node_rule;
        obj.key = Date.now();
        self.dynamicNodeForm.nodes.push(obj);
      }
    },
    onChanged(item) {
      this.levels = this.selectLevel;
      var index = this.dynamicNodeForm.nodes.length;
      if (index < 6) {
        if (index < this.levels) {
          let temp = this.levels - index;
          for (let i = 0; i < temp; i++) {
            this.dynamicNodeForm.nodes.push({
              input1: '',
              inputIds: "",
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
      var self = this;
      let processName = self.processModifyForm.processName;
      let processAlias = self.processModifyForm.processAlias;
      let selectLevel = self.selectLevel;
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
      let reqdata = {
        "role": self.creatorRole,
        "flow_id": self.$route.params.id,
        "name": processName,
        "node_number": selectLevel,
        "auto_approve": self.processModifyForm.autoApproval,
        "op_desc": processAlias,
        "node_info":nodeInfoArr
      };
      this.$refs.processModifyForm.validate(async(valid) => {
        if (valid) {
          try {
            let result = self.$ajax({
              type: "put",
              url: "api/leo/v1/flow/update_flow/",
              data: JSON.stringify(reqdata),
              success: function(result) {
                self.$message.success(Vue.t('opt.updateProcessSuccess'));
                let parentPath = self.$route.matched[1].path;
                self.$router.push({
                  path: '/operations/flow-manage'
                });
                self.loading = false;
              },
              log:{
                description:{
                  en:"Edit process:"+processName,
                  zh_cn:self.$t('opt.modifyProcess')+processName
                },
                target:Vue.logTarget.process_manage
              },
              errorKey: "NeutronError"
            });
          } catch (res) {
          }
          return true;
        } else {
          return false;
        }
      });
    },
    resetForm() {
      this.$refs.processModifyForm.resetFields();
      let parentPath = this.$route.matched[1].path;
      this.$router.push({
        path: '/operations/flow-manage'
      });
    },
    addData({selectedPersonnel, selectedPersonIds, index}) {
      this.dynamicNodeForm.nodes[index].input1 = selectedPersonnel.toString();
      this.dynamicNodeForm.nodes[index].inputIds = selectedPersonIds.toString();
      this.addPersonFlg = false;
    }
  }
}
</script>
<style scoped>
</style>
