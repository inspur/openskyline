<template>
  <el-form class="margin-tb20" label-position="left" :model="projectCreateForm" :rules=rules ref="projectCreateForm" label-width="100px">
    <span v-show="roleType != '3' && (detailConfig.type + '') == '1'">{{$t('calcStorLang.groupAffinity') + $t('calcStorLang.groupStrategies')}}</span>
    <el-table v-show="roleType != '3'  && (detailConfig.type + '') == '1'" ref="acTable" :data="tableData" v-loading="loading" :element-loading-text="$t('calcStorLang.dataLoading')" border stripe @row-click="handleRowClick" row-key="id" @sort-change="sortChange">
      <el-table-column width="30">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.selected" style="pointer-events: none;" />
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" show-overflow-tooltip  min-width="70" align="left"  sortable="custom">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('id') >= 0" label="ID" prop="id" min-width="80">
      </el-table-column>
      <el-table-column  prop="policies" show-overflow-tooltip align="left" :label="$t('network.strategy')" min-width="80" >
        <template slot-scope="scope">
          <span v-html="serverStatisRender(scope.row.policies, scope.row)"></span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative" v-show="roleType != '3' && (detailConfig.type + '') == '1'">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData"  @getCurrentData="getCurrentData" :pageCount="pageCount"></page>
        </el-col>
      </el-row>
    </div>
    <el-collapse class="col-24">
      <el-collapse-item :title="$t('calcStorLang.advanceOptions')" name="11" label-width="200px">
        <el-card class="margin-bottom-15" :body-style="{ 'margin-bottom': '-12px' }">
          <el-form-item :label="$t('calcStorLang.createInstConsoleTip1')" prop="vncPassword">
            <el-input :placeholder="$t('calcStorLang.createInstConsoleTip2')" @change="passChange" size="small" v-model="projectCreateForm.vncPassword" type="password" class="col-10"></el-input>
            <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstancePasWarn')">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('lang.confirmPassword')" prop="vncConfirmPass">
            <el-input :placeholder="$t('calcStorLang.createInstConsoleTip2')" size="small" v-model="projectCreateForm.vncConfirmPass" type="password" class="col-10"></el-input>
          </el-form-item>
        </el-card>
        <el-card class="margin-bottom-15" :body-style="{ 'margin-bottom': '-12px' }">
          <el-form-item :label="$t('calcStorLang.instBlueScreenStragegy')">
            <el-select v-model="projectCreateForm.screenStrategy">
              <el-option  :label="$t('network.nothing')" value=""></el-option>
              <el-option  :label="$t('calcStorLang.poweroff')" value="shutdown"></el-option>
              <el-option  :label="$t('calcStorLang.instLogReboot')" value="reboot"></el-option>
            </el-select>
          </el-form-item>
        </el-card>
        <el-card class="margin-bottom-15" :body-style="{ 'margin-bottom': '-12px' }">
          <el-form-item :label="$t('calcStorLang.CREATE_INSTANCE_USER_DATA')" v-if="roleType !== '3'">
            <el-input v-model="projectCreateForm.userData" type="textarea" :rows="5" />
            <el-tooltip placement="top" trigger="hover">
              <div slot="content" v-html="$t('calcStorLang.CREATE_INSTANCE_USER_DATA_TIPS')" />
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
        </el-card>
      </el-collapse-item>
    </el-collapse>
    <!-- </el-form-item> -->
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="fivePrevStep" type="primary">{{$t('lang.preStep')}}</el-button>
      <el-button @click="finshStep" type="primary" :disabled="isDisabled">{{$t('lang.finish')}}</el-button>
    </div>
  </el-form>
</template>
<script>
export default {
  name: 'StepFour',
  props: ['projectId', 'detailConfig'],
  data() {
    return {
      projectCreateForm: {
        netmask: '',
        vncPassword: '',
        vncConfirmPass: '',
        screenStrategy: '',
        userData: ''
      },
      totalData: [],
      tableData: [],
      pageCount: 5,
      formInline: '',
      currentPage: 1,
      showBorder: true,
      isDisabled:false,
      total: 0,
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "policies",
        label: Vue.t('calcStorLang.groupStrategies')
      }],
      columnsChecked: ['name', 'id', 'policies'],
      multipleSelection: [],
      loading: false,
      roleType: Vue.roleType + "",
      rules: {
        vncPassword: [
          { type: 'passwordLegal' }
        ],
        vncConfirmPass: [
          { type: 'passwordEquals', context: this, value: "projectCreateForm.vncPassword" }
        ]
      }
    }
  },
  watch: {
    projectId: {
      immediate: false,
      handler: function(val) {
        var self = this;
        if (self.roleType == "0" && val != "") {
          self.multipleSelection = [];
          var serverGroup = [];
          Promise.all([self.loadServerGroupList()]).then(function(result) {
             var data1 = result[0];
             self.$nextTick(() => {
               data1.forEach(item => {
                 item['selected'] = false;
               });
               self.totalData = data1;
             });
          });
        }
      }
    },
    'detailConfig.type':{
      immediate: false,
      handler: function(val) {
        var self = this;
        if (self.roleType == "0" && val == "2") {
          self.multipleSelection = [];
        }
      }
    }
  },
  mounted() {
    var self = this;
    self.init();
  },
  methods: {
    sortChange(column) {
       var self = this;
       var key = column.prop;
       var keyOrder = column.order;
       if (keyOrder != null && self.totalData != null) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder));
       }
    },
    passChange() {
      this.$refs.projectCreateForm.validate();
    },
    init() {
       var self = this;
       Promise.all([self.loadServerGroupList()]).then(function(result) {
           var data1 = result[0];
           data1.forEach(item => {
             item['selected'] = false;
           });
           self.totalData = data1;
       });
    },
    async loadServerGroupList() {
      var self = this;
      var url = "api/nova/v2.1/os-server-groups?all_projects=True";
      var serverProjectId = self.detailConfig.proId;
      if (self.detailConfig.roleType == '2') {
          url = "api/nova/v2.1/os-server-groups?all_projects=True";
          serverProjectId = this.$cookie.get("pid");
      }
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.13
          }
        });
        self.loading = false;
        var sList = result['server_groups'];
        var resultList = [];
        if (sList != null) {
          for (let a = 0; a < sList.length; a++) {
            var server = sList[a];
            if (server['project_id'] == serverProjectId) {
              resultList.push(server);
            }
          }
        }
        return resultList;
      } catch (res) {
        self.loading = false;
      }
    },
    statusNetFilter() {
       var self = this;
       var netName = self.projectCreateForm.netName;
       var status = self.netStatus == "0"?"":self.netStatus;
       if (self.netList != null && status != "") {
          var results = self.searchByKey("status", status);
          self.totalData = results;
       } else {
          self.totalData = self.netList;
       }
    },
    searchNetList() {
       var self = this;
       var netName = self.projectCreateForm.netName;
       var status = self.netStatus == "0"?"":self.netStatus;
       var resultList = [];
       if ( netName != "" && status != "") {
          for (let nn = 0; nn < self.netList.length; nn++) {
            var obj = self.netList[nn];
            if (obj.name.indexOf(netName) >= 0 && obj.status == status) {
               resultList.push(obj);
            }
         }
       } else if (netName == "" && status != "") {
          resultList = self.searchByKey("status", status);
       } else if (netName != "" && status == "") {
          resultList = self.searchByKey("name", netName);
       } else {
          resultList = self.netList;
       }
         self.totalData = resultList;
    },
    searchByKey(key, value) {
       var self = this;
       var rets = [];
       for (let k = 0; k < self.netList.length; k++) {
          var obj = self.netList[k];
          if (key == "name") {
            if (obj[key].indexOf(value) >= 0) {
              rets.push(obj);
            }
          } else {
            if (obj[key] == value) {
             rets.push(obj);
            }
          }
       }
         return rets;
    },
    serverStatisRender(value, rowData) {
      var self = this;
      if ("affinity" == value) {
        return Vue.t('calcStorLang.groupAffinity');
      } else {
        return Vue.t('calcStorLang.groupAntiAffinity')
      }
    },
    subnetStatusRender(value, row) {
      if (row["status"] === "ACTIVE") {
        return this.$t('lang.ACTIVE')
      } else if (row["status"] === "DOWN") {
        return this.$t('lang.DOWN')
      } else if (row["status"] === "BUILD") {
        return this.$t('lang.BUILD')
      } else if (row["status"] === "ERROR") {
        return this.$t('lang.ERROR')
      }
    },
    fivePrevStep() {
      var self = this;
      self.$refs.projectCreateForm.validate((valid) => {
        if (valid) {
          self.$emit("fivePrevStep", 3);
        } else {
          self.$message({
            showClose: true,
            message: Vue.t('calcStorLang.vncPasswordTip'),
            type: 'warning'
          });
        }
      });
    },
    finshStep() {
      this.isDisabled = true;
      var self = this;
      self.$refs.projectCreateForm.validate((valid) => {
        if (valid) {
          self.$emit("finshStep");
        } else {
          this.isDisabled = false;
        }
      });
    },
    cancel() {
      this.$emit("cancel");
    },
    handleRowClick(val) {
      const id = val.id;
      this.multipleSelection = [];
      this.totalData.forEach(item => {
        if (item.id === id) {
          item.selected = !item.selected;
          if (item.selected) {
            this.multipleSelection.push(item);
          }
        } else {
          item.selected = false;
        }
      });
    },
    getCurrentData(param) {
        this.tableData = param;
    },
    onRefresh() {
      var self = this;
      self.$refs.acTable.clearSelection();
      this.multipleSelection = [];
      self.init();
    }
  }
}

</script>

<style scoped>
.margin-bottom-15 {
  margin-bottom: 15px;
}
</style>
