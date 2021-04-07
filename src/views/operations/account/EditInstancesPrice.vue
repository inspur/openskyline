<template>
  <el-dialog :title="$t('opt.editInstancesPrice')" :visible.sync="dialogVisible">
    <el-form class="me-required-form" ref="editform" :model="editform"  label-position="right" label-width="160px" :rules="rules" v-loading="loading" :element-loading-text="$t('opt.dataLoading')">
      <el-form-item :label="$t('opt.resourceStandard')" class="is-required" prop="reStandard">
        <el-input v-model="editform.reStandard" :value="editform.reStandardId" class="col-18" filterable disabled>
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('opt.price')" class="is-required" prop="bmPrice">
        <el-input class="col-18" v-model="editform.bmPrice"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="dialogVisible=false">{{$t('opt.cancel')}}</el-button>
    	<el-button type="primary" @click="editConfirm" :loading="isDisabled">{{$t('opt.submit')}}</el-button>
    </span>
  </el-dialog>  
</template>
<script type="text/javascript">
export default {
  name:"editInstancesPrice",
  props: ["id", "formatMaps"],
  data() {
    return {
      dialogVisible: false,
      isDisabled: false,
      loading: false,
      formatMap: new Map(),
      editform: {
        reStandard: "",
        bmPrice: ""
      },
      rules: {
        reStandard: [
           {type: 'required'}
        ],
        bmPrice: [
           {type: 'required'},
           {type: 'integerNO000'},
           {type: 'min', value: 1},
           {type: 'max', value: 100}
        ]
      }
    }
  },
  mounted() {
    this.getTypeList();
  },
  methods: {
    show(obj) {
      var self = this;
      self.dialogVisible = true;
      self.editform.reStandard = obj.reStandard;
      self.editform.reStandardId = obj.reStandardId;
      self.editform.bmPrice = obj.bmPrice;
    },
    async getTypeList() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          data: {"is_public": true},
          url: 'api/nova/v2.1/flavors/detail',
          showErrMsg: true
        });
        let result1 = await self.$ajax({
          type: 'get',
          data: {"is_public": false},
          url: 'api/nova/v2.1/flavors/detail',
          showErrMsg: true
        });
        self.loading = false;
        var dataResult = result['flavors'];
        var dataResult1 = [];
        for (let i = 0; i < dataResult.length; i++) {
          if (dataResult[i]['os-flavor-access:is_public'] == true) {
            dataResult1.push(dataResult[i]);
          }
        }
        var middleData = dataResult1.concat(result1['flavors']);
        for (var q = 0; q < middleData.length; q++) {
          self.formatMap.set(middleData[q].name, middleData[q].id);
        }
      } catch (res) {
        self.loading = false;
        self.$message.error(self.$t('opt.getResourceStandardListFailed'));
      }
    },
    editConfirm() {
      var self = this;
      let bmPrice = self.editform.bmPrice;
      let reStandardName = self.editform.reStandard;
      let reStandardId = self.editform.reStandardId;
      let reqdata = {
        "service_name": "compute",
        "field_name": "flavor_id",
        "cost": Number(bmPrice),
        "value": reStandardId,
        "map_type": "flat"
      };
      this.$refs.editform.validate(async(valid) => {
        if (valid) {
          try {
            self.isDisabled = true;
            let result = await self.$ajax({
              type: "POST",
              url: "api/cloudkitty/v1/rating/module_config/hashmap/prices",
              data: JSON.stringify(reqdata),
              success: function(result) {
                self.$notify({
                  message: self.$t('opt.editPriceSettingSuccess'),
                  type: "success"
                });
                self.loading = false;
                self.isDisabled = false;
                self.$emit("clearSelOption", {});
                self.$emit("handleShow", {});
                self.$emit("getTableData", {});
              },
              log:{
                description:{
                  en:"modify billing strategy:"+reStandardName,
                  zh_cn:self.$t('opt.modifyBillingStrategy')+reStandardName
                },
                target:Vue.logTarget.billing_strategy
              }
            });
          } catch (data) {
            self.loading = false;
            self.isDisabled = false;
            __DEV__ && console.error(data);
          }
        } else {
          return false;
        }
      });
    }
  }
}
</script>