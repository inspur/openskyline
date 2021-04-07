<template>
  <el-col :span="24">
    <el-collapse v-model="activeNames" style="text-align:left">
      <el-collapse-item :title="$t('opt.baseInformation')" name="baseInformation">
        <el-form :inline="true" v-model="formInline" class="">
          <DetailApply :orderId="selOrderId" :applyData="applyData"></DetailApply>
        </el-form>
      </el-collapse-item>
    </el-collapse>
    <el-collapse v-model="activeNames1" style="text-align:left">
      <el-collapse-item :title="$t('opt.faultProcessingHistory')" name="dealHistoty">
        <el-form>
          <el-form-item v-for="(node, index) in approveHistoryInfo" :key="node.id" :label="node.level">
          </el-form-item>
        </el-form>
      </el-collapse-item>
    </el-collapse>
  </el-col>
</template>
<script>
import DetailApply from './FaultDetailApply';
export default {
  name: "Handle",
  components: {
    DetailApply
  },
  props: ['selOrderId', 'userMaps', 'faultTypeMaps'],
  data() {
    return {
      formInline: "",
      activeNames: "baseInformation",
      activeNames1: "dealHistoty",
      applyData: {
        oddNumber: "",
        faultLevel: "",
        faultType: "",
        processFeedback: "",
        description: ""
      },
      approveHistoryInfo: [{
        level: ""
      }]
    }
  },
  watch: {
    selOrderId: {
      handler: function(rows, oldVal) {
        this.getOrderHistory();
      }
    }
  },
  mounted() {
    this.getOrderHistory();
  },
  methods: {
    async getOrderHistory() {
      let self = this;
      var reqdata = {
        order_id: self.selOrderId,
        language: Vue.language
      };
      try {
        let ret = await this.$ajax({
          type: 'GET',
          url: "api/leo/v1/order/get_order_details?"+ $.param(reqdata)
        });
        self.orderEntity = ret.data;
        self.applyData.oddNumber = self.orderEntity.order_name;
        var orderData = JSON.parse(self.orderEntity.order_data);
        let faultLevel = orderData.fault_level;
        switch (faultLevel) {
          case "1":
          self.applyData.faultLevel = self.$t('opt.serious');
          break;
        case "2":
          self.applyData.faultLevel = self.$t('opt.commonly');
          break;
        case "6":
          self.applyData.faultLevel = self.$t('opt.slight');
          break;
        default:
          self.applyData.faultLevel = "-"
        };
        let faultTypeId = orderData.fault_type;
        self.applyData.faultType = self.faultTypeMaps.get(faultTypeId);
        self.applyData.description = self.orderEntity.op_desc;
        if (Vue.roleType == "2") {
          self.applyData.processFeedback = self.orderEntity.opinion_list[0];
        } else {
          let index = self.orderEntity.opinion_list.length - 1;
          self.applyData.processFeedback = self.orderEntity.opinion_list[index];
        }
        self.approveHistoryInfo = [];
        for (var n = 0; n < self.orderEntity.op_history.length; n++) {
          let opDesc = self.orderEntity.op_history[n].op_desc.split("-");
          let opName = self.userMaps.get(opDesc[1]);
          opDesc[1] = opName;
          self.approveHistoryInfo.push({
            level: opDesc.join("-")
          });
        }
      } catch (res) {
        console.error(self.$t('opt.getFaultHandledInformationFailed'));
      };
    }
  }
}
</script>
