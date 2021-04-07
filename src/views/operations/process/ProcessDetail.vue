<template>
  <div>
    <el-collapse v-model="activeNames" style="text-align:left">
      <el-collapse-item :title="$t('opt.baseInformation')" name="baseInformation">
        <el-form :inline="true" v-model="formInline" class="">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath" style="width:20%">{{$t('opt.detailName')}}</th>
                  <td class="idatatd" style="width:80%">{{process_name}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('opt.detailStatus')}}</th>
                  <td class="idatatd">{{process_state}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('opt.detailAutoApprove')}}</th>
                  <td class="idatatd">{{auto_approve}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('opt.detailResourceType')}}</th>
                  <td class="idatatd">{{process_type}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('opt.detailDesc')}}</th>
                  <td class="idatatd">
                    <el-tooltip :content="process_desc" v-show="process_desc.length > 40">
                      <span>{{process_desc.substring(0, 40) + "..."}}</span>
                    </el-tooltip>
                    <span v-show="process_desc.length <= 40">{{process_desc}}</span>
                  </td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('opt.detailApproveLevel')}}</th>
                  <td class="idatatd">{{process_level}}</td>
                </tr>
                <tr class="even" v-for="(node, index) in dynamicNodeForm.nodes" :key="node.key">
                  <th class="idatath">{{$t('opt.approvalHierarchy')+(index+1)}}：</th>
                  <td class="idatatd">
                    <el-form-item :label="$t('opt.detailRule')"></el-form-item>
                    <el-form-item>{{node.applyNodePolicy}}</el-form-item>
                    <el-form-item :label="$t('opt.detailApprover')"></el-form-item> 
                    <el-form-item>{{node.input1}}</el-form-item>
                  </td>
                </tr>
                <tr class="odd" v-show="isAdmin()">
                  <th class="idatath">{{$t('opt.detailProject')}}</th>
                  <td class="idatatd">{{process_project}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-form>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: 'ProcessDetail',
  props: ["ProcessId", "projectMaps"],
  data() {
    return {
      activeNames: 'baseInformation',
      formInline: '',
      process_name: '',
      auto_approve: '',
      process_desc: '',
      process_state: '',
      process_type: '',
      process_level: '',
      process_project: '',
      proEnd: this.$t('opt.disable'),
      proStart: this.$t('opt.available'),
      isAuto: this.$t('opt.yes'),
      noAuto: this.$t('opt.no'),
      proRule1: this.$t('opt.allPass'),
      proRule2: this.$t('opt.anyPass'),
      roleMaps: new Map(),
      dynamicNodeForm: {
        nodes: [{
          input1: "",
          applyNodePolicy: '',
          key: ''
        }]
      }
    }
  },
  watch: {
    ProcessId: {
      handler: function(rows, oldVal) {
        this.getData();
      }
    }
  },
  computed: {},
  mounted() {
    var self = this;
    this.dynamicNodeForm.nodes = [];
    self.getData();
  },
  methods: {
    show() {
    },
    async getData() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/leo/v1/flow/" + self.ProcessId,
          complete: function(XMLHttpRequest, textStatus) {
          }
        });
        var obj = '';
        let process = result.data['flow'];
        let prolevel = result.data['node_info'];
        self.process_name = process["name"];
        self.process_desc = process["op_desc"];
        self.process_state = self.getState(process["state"]);
        self.auto_approve = self.isAutoApprove(process["auto_approve"]);
        for (let k=0; k<process.resource.length; k++) {
          if (k == process.resource.length - 1) {
            if (process.resource[k] == 'VM') {
              process.resource[k] = self.$t('opt.cloudHost');
            } else if (process.resource[k] == 'VOLUME') {
              process.resource[k] = self.$t('opt.cloudHardDisk');
            } else if (process.resource[k] == 'HOST') {
              process.resource[k] = self.$t('opt.cloudPhysicalHost');
            }
            obj += process.resource[k];
          } else {
            if (process.resource[k] == 'VM') {
              process.resource[k] = self.$t('opt.cloudHost');
            } else if (process.resource[k] == 'VOLUME') {
              process.resource[k] = self.$t('opt.cloudHardDisk');
            } else if (process.resource[k] == 'HOST') {
              process.resource[k] = self.$t('opt.cloudPhysicalHost');
            }
            obj += process.resource[k] + ",";
          }
        }
        self.process_type = obj;
        self.process_level = process["node_number"];
        var roleType = Vue.roleType + "";
        if (roleType == "0") {
          if (process.project[0] != "") {
            var obj1 = '';
            for (let j=0; j<process.project.length; j++) {
              var projectId = process.project[j];
              if (j == process.project.length - 1) {
                obj1 += self.projectMaps.get(projectId);
              } else {
                obj1 += self.projectMaps.get(projectId) + ",";
              }
            }
          } else {
            obj1 = "-";
          }
          self.process_project = obj1;
        }
        self.dynamicNodeForm.nodes = [];
        let ruleAndnames = [];
        let allData = [];
        let ret = await self.$ajax({
          type: 'get',
          url: "api/keystone/v3/inspur/users"
        })
        allData = ret.users;
        for (let n=0; n<allData.length; n++) {
          self.roleMaps.set(allData[n].id, allData[n].name);
        }
        for (let i=0; i<prolevel.length; i++) {
          var ob = {};
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
          ob.input1 = strings;
          ob.applyNodePolicy = self.getRule(prolevel[i].node_rule);
          ob.key = Date.now();
          self.dynamicNodeForm.nodes.push(ob);
        }
      } catch (res) {
      }
    },
    isAutoApprove(value) {
      var self = this;
      if (value) {
        return self.isAuto;
      } else {
        return self.noAuto;
      }
    },
    getState(value) {
      if (value == "1") {
        return this.$t('opt.available');
      } else if (value == "0") {
        return this.$t('opt.disable');
      } else if (value == "2") {
        return this.$t('opt.error');
      } else {
        return "-";
      }
    },
    getRule(value) {
      var self = this;
      if (value == "ALLPASS") {
        return self.proRule1;
      } else {
        return self.proRule2;
      }
    },
    isAdmin() {
      var roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        return false;
      }
      return true;
    }
  }
}
</script>
