<template>
  <el-dialog :title="$t('network.CHANGE_ORDER')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <div style="margin-bottom: 10px">
      <el-button
        class="margin-l10"
        size="small"
        type="primary"
        :disabled="disabledUp"
        @click="handleUp()"
      >{{$t('network.MOVE_UP')}}</el-button>
      <el-button
        class="transfer-footer"
        size="small"
        type="primary"
        :disabled="disabledDown"
        @click="handleDown()"
      >{{$t('network.MOVE_DOWN')}}</el-button>
    </div>

    <el-table
      ref="deTable"
      :data="firewallRules"
      v-loading="loading"
      highlight-current-row
      max-height="400"
      style="width:100%;"
      row-key="id"
      @selection-change="handleSelectionChange"
    >
      <el-table-column reserve-selection type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column v-if="false" prop="id" :label="id" min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('base.name')" min-width="100">
      </el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="editRule" :disabled="idDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name:"RemoveRule",
  props: ["editId", "editName", "tableData"],
  data() {
    return {
      ruleNameBefore: [],
      ruleNameAfter: [],
      upIndex: null,
      downIndex: null,
      selectedIndex: null,
      moreOne: false,
      disabledUp: true,
      disabledDown: true,
      multipleSelection: [],
      dialogVisible: false,
      firewallRules: [],
      value: "",
      loading: false,
      idDisabled: false,
      columns: [{
        prop: "name",
        label: this.$t('base.name')
      }, {
        prop: "id",
        label: "id"
      }],
      columnsChecked: ["name", "id"]
    }
  },
  mounted() {
    this.initDialog();
    this.getData();
  },
  methods: {
    getData() {
      this.firewallRules = [].concat(this.tableData);
      this.ruleNameBefore = this.tableData.map((item) => {
        return item.name;
      });
    },
    checkUpDown() {
      this.disabledDown = false;
      this.disabledUp = false;
      this.upIndex = null;
      this.downIndex = null;
      if (this.firewallRules.length < 2 || !this.selectOnly.length) {
        this.disabledDown = true;
        this.disabledUp = true;
        return false;
      }
      let selected = this.selectOnly;
      let firewallRulesLength = this.firewallRules.length - 1;
      if (selected.length === 1) {
        this.moreOne = false;
        this.firewallRules.find((val, index, arr) => {
          if (val === selected[0]) {
            this.selectedIndex = index;
          }
        });
        if (this.selectedIndex === firewallRulesLength) {
          this.disabledDown = true;
        } else {
          this.downIndex = this.selectedIndex + 1;
        }
        if (this.selectedIndex === 0) {
          this.disabledUp = true;
        } else {
          this.upIndex = this.selectedIndex - 1;
        }
      } else {
        this.disabledDown = true;
        this.disabledUp = true;
        this.moreOne = true;
        return false;
      }
    },
    // 下移
    handleDown() {
      this.checkUpDown();
      if (this.moreOne) {
        this.$message(Vue.t('network.ONLY_ONE'));
        return;
      }
      if (this.downIndex) {
        this.firewallRules[this.downIndex] = this.firewallRules.splice(this.selectedIndex, 1, this.firewallRules[this.downIndex])[0];
        this.checkUpDown();
      }
    },
    // 上移
    handleUp() {
      this.checkUpDown();
      if (this.moreOne) {
        this.$message(Vue.t('network.ONLY_ONE'));
        return;
      }
      if (this.upIndex || (this.upIndex === 0)) {
        this.firewallRules[this.upIndex] = this.firewallRules.splice(this.selectedIndex, 1, this.firewallRules[this.upIndex])[0];
        this.checkUpDown();
      }
    },
    initDialog() {
      const self = this;
      self.dialogVisible = true;
    },
    handleClose(done) {
      this.$emit("handleChangeOrderCancel", {});
      done();
    },
    cancel() {
      this.$emit("handleChangeOrderCancel", {});
    },
    confirm() {
      this.$emit("handleChangeOrderShow", {});
    },
    async editRule() {
      let self = this;
      this.loading = true;
      let ruleIds = this.firewallRules.map((item) => {
        return item.id;
      });
      this.ruleNameAfter = this.firewallRules.map((item) => {
        return item.name;
      });
      let reqdata = {
        "firewall_policy": {
          "firewall_rules": ruleIds
        }
      };
      try {
        await self.$ajax({
          type: 'put',
          url: "api/neutron/v2.0/fw/firewall_policies/" + self.editId,
          data: JSON.stringify(reqdata),
          success: function(result) {
            self.$notify({
              message: Vue.t("network.RULE_CONFIGURATION_SUCCESS"),
              type: "success"
            });
            self.loading = false;
            self.confirm();
          },
          errFun() {
            self.loading = false;
          },
          log:{
            description:{
              en:"Strategy "+self.editName + "rule before edit: " + self.ruleNameBefore.join(",") + ", " + "after edit:" + this.ruleNameAfter.join(","),
              zh_cn: "策略" + self.editName + "规则: 修改前:" + self.ruleNameBefore.join(",") + ", " + "修改后:" + this.ruleNameAfter.join(",")
            },
            target:Vue.logTarget.firewallStrategy
          },
          errorKey: "NeutronError"
        })
      } catch (e) {
        self.loading = false;
      }
    },
    /**
     * 获取选择行的数据
     * @param val
     */
    handleSelectionChange(val) {
      this.selectOnly = val; //选中项进行移动时判断用
      this.checkUpDown();
      this.multipleSelection = val;
    }
  }
}
</script>
