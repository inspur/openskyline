<template>
  <el-dialog :title="$t('calcStorLang.netConfigQosConfig')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="form" :model="form" label-width="120px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('calcStorLang.netConfigQosConfig')" class="is-required" prop="qos">
        <el-select v-model="form.qos" class="col-8" :disabled="isDisabled" @change="getRule">
          <el-option v-for="item in qosOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-button type="primary" @click="submit()">{{buttonText}}</el-button>
      </el-form-item>
      <el-form-item :label="$t('network.rule')">
        <el-table ref="ruleTable" :data="ruleTableData" highlight-current-row stripe border style="width: 100%" row-key="id" v-loading="tblloading" :element-loading-text="$t('lang.loading')">
          <!-- <el-table-column reserve-selection type="selection" width="55">
          </el-table-column> -->
          <el-table-column v-if="columnsChecked.indexOf('type') >= 0" :label="$t('network.type')" prop="type" min-width="100">
            <template slot-scope="scope">
              <span>Bandwidth</span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('direction') >= 0" :label="$t('network.direction')" prop="direction" min-width="100">
            <template slot-scope="scope">
              <span v-if="scope.row.direction==='ingress'">{{$t('network.entrance')}}</span>
              <span v-if="scope.row.direction==='egress'">{{$t('network.chukou')}}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('max_kbps') >= 0" prop="max_kbps" :label="$t('network.maxkbpx')" min-width="100">
            <template slot-scope="scope">
              <span v-html="KbToKB(scope.row.max_kbps)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('max_burst_kbps') >= 0" prop="max_burst_kbps" :label="$t('network.burstkbps')" min-width="100">
            <template slot-scope="scope">
              <span v-html="KbToKB(scope.row.max_burst_kbps)"></span>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
        </div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.close')}}</el-button>
      <!-- <el-button type="primary" @click="submit()" :disabled="loading">{{$t('lang.confirm')}}</el-button> -->
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  props: ["entity"],
  data() {
    return {
      dialogVisible: true,
      loading: false,
      tblloading: false,
      qosOptions: [],
      columnsChecked: ["direction", "type", "max_kbps", "max_burst_kbps"],
      ruleTableData: [],
      columns: [
        {
          prop: "type",
          label: Vue.t("network.type")
        },
        {
          prop: "direction",
          label: Vue.t("network.direction")
        },
        {
          prop: "max_kbps",
          label: Vue.t("network.maxkbpx")
        },
        {
          prop: "max_burst_kbps",
          label: Vue.t("network.burstkbps")
        }
      ],
      totalData: [],
      multipleSelection: [],
      buttonText: "",
      isDisabled: false,
      form: {
        qos: ""
      },
      rules: {
        qos: [
          { type: "required" }
        ]
      }
    }
  },
  mounted() {
    if (this.entity.qos_policy_id) {
      this.form.qos = this.entity.qos_policy_id;
      this.buttonText = Vue.t("network.unbangding");
      this.isDisabled = true;
      this.getRule();
    } else {
      this.buttonText = Vue.t("network.bangding");
    }
    this.getQos();
  },
  methods: {
    handleClose() {
      this.$emit("hide");
    },
    async getRule() {
      let self = this;
      self.totalData = [];
      if (!self.form.qos) {
        return;
      }
      try {
        self.tblloading = true;
        let result = await self.$ajax({
          type: "GET",
          url:
          "api/neutron/v2.0/qos/policies/" + self.form.qos + "/bandwidth_limit_rules",
          errorKey: "NeutronError",
          showErrMsg: false,
          errFun() {
            self.$router.push({
              path: "/net/qosView"
            });
          }
        });
        self.totalData = result["bandwidth_limit_rules"];
        // self.getQoSDetail();
        if (self.totalData.length > 1) {
          self.addDisabled = true;
        } else {
          self.addDisabled = false;
        }
        self.tblloading = false;
      } catch (res) { }
    },
    getCurrentData(param) {
      this.ruleTableData = param;
    },
    cancel() {
      this.$emit("hide");
    },
    confirm() {
      this.$emit("hide");
      this.$emit("refresh");
    },
    async getQos() {
      var self = this;
      self.loading = true;
      try {
        await self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/qos/policies?project_id=" + self.entity.project_id,
          errorKey: "NeutronError",
          successFun: function (res) {
            self.loading = false;
            self.qosOptions = res["policies"];
          },
          errFun: function () {
            self.loading = false;
          }
        });
      } catch (res) {
        self.loading = false;
      }
    },
    async submit() {
      var self = this;
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          let id = null;
          let logMessageEn = "";
          let logMessageCh = "";
          let logId = "";
          let successMsg = "";
          if (this.entity.qos_policy_id) {
            logMessageEn = "Unbinding";
            logMessageCh = "解绑";
            logId = this.entity.qos_policy_id;
            successMsg = Vue.t('network.unbingsuccess');
          } else {
            logMessageEn = "Binding";
            logMessageCh = "绑定";
            id = this.form.qos;
            logId = id;
            successMsg = Vue.t('network.bindingsuccess');
          }
          let reqdata = {
            "floatingip": {
              "qos_policy_id": id
            }
          };
          let logQos = self.qosOptions.find((value, index, arr) => {
            return value.id == logId;
          });
          let name = logQos ? logQos.name : "-";
          self.loading = true;
          let result = self.$ajax({
            type: 'PUT',
            url: "api/neutron/v2.0/floatingips/" + self.entity.id,
            data: JSON.stringify(reqdata),
            success: function (result) {
              self.loading = false;
              self.$message.success(successMsg);
              self.confirm();
            },
            errFun() {
              self.loading = false;
            },
            errorKey: "NeutronError",
            log: {
              description: {
                en: logMessageEn + " QoS policy:" + name,
                zh_cn: logMessageCh + "QoS策略:" + name
              },
              target: Vue.logTarget.floatingIP
            }
          });
          return true;
        } else {
          return false;
        }
      });
    },
    KbToKB(value) {
      let KBValue = 0;
      KBValue = parseInt(parseInt(value)/8)
      return KBValue;
    }
  }
}
</script>