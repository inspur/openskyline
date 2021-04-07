<template>
  <el-dialog :title="$t('opt.instancesPrice')"
    :visible.sync="dialogVisible" :before-close="cancelDialog">
    <el-form class="me-required-form" ref="form" :model="formObj"  label-position="right" label-width="120px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('opt.resourceStandard')" class="is-required" prop="reStandard" v-if="hostTypeFlag">
        <el-select class="col-18" v-model="formObj.reStandard" filterable clearable>
          <el-option v-for="item in totalData" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('opt.price')" class="is-required" prop="bmPrice">
        <el-input class="col-18" v-model="formObj.bmPrice"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelDialog">{{$t('opt.cancel')}}</el-button>
      <el-button type="primary" @click="addConfirm" :loading="isDisabled">{{$t('opt.submit')}}</el-button>
    </div>
  </el-dialog>  
</template>
<script type="text/javascript">
export default {
  name:"addInstancesPrice",
  props: ['allData', 'formatMaps'],
  data() {
    return {
      dialogVisible: false,
      isDisabled: false,
      loading: false,
      hostTypeFlag: Vue.roleType == 0,
      totalData: [],
      formObj: {
        bmPrice: "",
        reStandard: ""
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
    let self = this;
    self.getTypeList();
  },
  methods: {
    show() {
      this.dialogVisible = true;
      this.formObj = {
        bmPrice: "",
        reStandard: ""
      }
    },
    cancelDialog() {
      this.dialogVisible = false;
      this.$emit("handleShow", {});
    },
    addConfirm() {
      let self = this;
      let bmPrice = self.formObj.bmPrice;
      let reStandardId = self.formObj.reStandard;
      let reStandardName = "";
      reStandardName = self.formatMaps.get(reStandardId);
      let reqdata = {
        "service_name": "compute",
        "field_name": "flavor_id",
        "cost": Number(bmPrice),
        "value": reStandardId,
        "map_type": "flat"
      };
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          try {
            self.isDisabled = true;
            let result = await self.$ajax({
              type: "POST",
              url: "api/cloudkitty/v1/rating/module_config/hashmap/prices",
              data: JSON.stringify(reqdata),
              success: function(result) {
                self.$notify({
                  message: self.$t('opt.addPriceSettingSuccess'),
                  type: "success"
                });
                self.isDisabled = false;
                self.$emit("clearSelOption", {});
                self.$emit("handleShow", {});
                self.$emit("getTableData", {});
              },
              log:{
                description:{
                  en:"add billing strategy:"+reStandardName,
                  zh_cn:self.$t('opt.addBillingStrategy')+reStandardName
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
    },
    async getTypeList() {
      let self = this;
      self.loading = true;
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
        self.totalData = [];
        let dataResult = result['flavors'];
        let dataResult1 = [];
        for (let i = 0; i < dataResult.length; i++) {
          if (dataResult[i]['os-flavor-access:is_public'] == true) {
            dataResult1.push(dataResult[i]);
          }
        }
        let middleData = dataResult1.concat(result1['flavors']);
        let tempData = [];
        for (let i = 0; i < middleData.length; i++) {
          let entity = "";
          entity = middleData[i]["id"];
          let tempflag = true;
          for (let j = 0; j < self.allData.length; j++) {
            if (self.allData[j].reStandardId == entity) {
              tempflag = false;
              break;
            }
          }
          if (tempflag) {
            tempData.push(middleData[i]);
          }
        }
        self.totalData = tempData;
      } catch (res) {
        self.loading = false;
        self.$message.error(self.$t('opt.getResourceStandardListFailed'));
      }
    }
  }
}
</script>