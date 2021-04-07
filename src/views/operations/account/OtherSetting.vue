<template>
  <div>
   <el-row :gutter="10">
    <el-col :span="8">
      <el-card style="margin-top:10px;">
        <div slot="header" class="clearfix">
          <span>{{$t('opt.volumePriceSetting')}}</span>
        </div>
        <div>
        <el-row :gutter="20">
          <el-col :span="15">
            <el-form ref="formVolume" :model="priceSetting" label-width="120px" :rules="rules" v-loading="volumeLoading" :element-loading-text="$t('opt.dataLoading')">
              <el-form-item :label="$t('opt.volumePrice')" class="is-required" prop="volumePrice">
                <el-input class="col-24" v-model="priceSetting.volumePrice"></el-input>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="9">
            <span style="display:inline-block;padding-left:1px;">{{$t('opt.priceUnit')}}</span>
          </el-col>
        </el-row>
        </div>
        <div style="text-align:center;">
          <el-button type="primary" size="small" @click="volumeConfirm">{{$t('opt.preservation')}}</el-button>
        </div>
      </el-card>  
    </el-col>
    <el-col :span="8">
      <el-card style="margin-top:10px;">
        <div slot="header" class="clearfix">
          <span>{{$t('opt.imagePriceSetting')}}</span>
        </div>
        <div>
        <el-row :gutter="20">
          <el-col :span="15">
            <el-form ref="formImage" :model="priceSetting" label-width="120px" :rules="rules" v-loading="imageLoading" :element-loading-text="$t('opt.dataLoading')">
              <el-form-item :label="$t('opt.imagePrice')" class="is-required" prop="imagePrice">
                <el-input class="col-24" v-model="priceSetting.imagePrice"></el-input>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="9">
            <span style="display:inline-block;padding-left:1px;">{{$t('opt.priceUnit')}}</span>
          </el-col>
        </el-row>
        </div>
        <div style="text-align:center;">
          <el-button type="primary" size="small" @click="imageConfirm">{{$t('opt.preservation')}}</el-button>
        </div>
      </el-card>  
    </el-col>
    <el-col :span="8">
      <el-card style="margin-top:10px;">
        <div slot="header" class="clearfix">
          <span>{{$t('opt.floatIpPriceSetting')}}</span>
        </div>
        <div>
        <el-row :gutter="20">
          <el-col :span="15">
            <el-form ref="formNetwork" :model="priceSetting" label-width="120px" :rules="rules"
            v-loading="networkLoading" :element-loading-text="$t('opt.dataLoading')">
              <el-form-item :label="$t('opt.floatIpPrice')" class="is-required" prop="networkPrice">
                <el-input class="col-24" v-model="priceSetting.networkPrice"></el-input>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="9">
            <span style="display:inline-block;padding-left:1px;">{{$t('opt.priceunit')}}</span>
          </el-col>
        </el-row>
        </div>
        <div style="text-align:center;">
          <el-button type="primary" size="small" @click="networkConfirm">{{$t('opt.preservation')}}</el-button>
        </div>
      </el-card>  
    </el-col>
   </el-row>
  </div>
</template>
<script>
export default {
  name: "otherSetting",
  data () {
    return {
      volumeLoading:false,
      imageLoading:false,
      networkLoading:false,
      priceSetting:{
        volumePrice:"1",
        imagePrice:"1",
        networkPrice:"1"
      },
      rules: {
        volumePrice: [
           {type: 'required'},
           {type: 'integerNO000'},
           {type: 'min', value: 1},
           {type: 'max', value: 100}
        ],
        imagePrice: [
           {type: 'required'},
           {type: 'integerNO000'},
           {type: 'min', value: 1},
           {type: 'max', value: 100}
        ],
        networkPrice: [
           {type: 'required'},
           {type: 'integerNO000'},
           {type: 'min', value: 1},
           {type: 'max', value: 100}
        ]
      }
    }
  },
  mounted () {
    this.getVolumeSet();
  },
  methods: {
    getVolumeSet() {
      let self = this;
      self.volumeLoading = true;
      self.$ajax({
        type: 'get',
        url: "api/cloudkitty/v1/rating/module_config/hashmap/prices?service_name=volume",
        successFun(res) {
          self.volumeLoading = false;
          if (res.inspur_mappings.length > 0) {
            self.priceSetting.volumePrice = res.inspur_mappings[0].cost;
          }
        }
      });
      self.imageLoading = true;
      self.$ajax({
        type: 'get',
        url: "api/cloudkitty/v1/rating/module_config/hashmap/prices?service_name=image",
        successFun(res) {
          self.imageLoading = false;
          if (res.inspur_mappings.length > 0) {
            self.priceSetting.imagePrice = res.inspur_mappings[0].cost;
          }
        }
      });
      self.networkLoading = true;
      self.$ajax({
        type: 'get',
        url: "api/cloudkitty/v1/rating/module_config/hashmap/prices?service_name=network.floating",
        successFun(res) {
          self.networkLoading = false;
          if (res.inspur_mappings.length > 0) {
            self.priceSetting.networkPrice = res.inspur_mappings[0].cost;
          }
        }
      })
    },
    volumeConfirm() {
      var self = this;
      let bmPrice = self.priceSetting.volumePrice;
      let mark = false;
      self.$refs.formVolume.validate((valid) => {
        mark = valid;
      });
      if (!mark) {
        return false;
      }
      self.volumeLoading = true;
      let reqdata = {
        "service_name": "volume",
        "cost": Number(bmPrice),
        "map_type": "flat"
      };
      self.$ajax({
        type: "POST",
        url: "api/cloudkitty/v1/rating/module_config/hashmap/prices",
        data: JSON.stringify(reqdata),
        successMsg: self.$t('opt.priceSettingSuccess'),
        successFun(data) {
          self.volumeLoading = false;
        },
        log:{
          description:{
            en:"volume billing strategy setting",
            zh_cn:self.$t('opt.volumeBillingStrategySetting')
          },
          target:Vue.logTarget.billing_strategy
        }
      })
    },
    imageConfirm() {
      var self = this;
      let bmPrice = self.priceSetting.imagePrice;
      let mark = false;
      self.$refs.formImage.validate((valid) => {
        mark = valid;
      });
      if (!mark) {
        return false;
      }
      self.imageLoading = true;
      let reqdata = {
        "service_name": "image",
        "cost": Number(bmPrice),
        "map_type": "flat"
      };
      self.$ajax({
        type: "POST",
        url: "api/cloudkitty/v1/rating/module_config/hashmap/prices",
        data: JSON.stringify(reqdata),
        successMsg: self.$t('opt.priceSettingSuccess'),
        successFun(data) {
          self.imageLoading = false;
        },
        log:{
          description:{
            en:"image billing strategy setting",
            zh_cn:self.$t('opt.imageBillingStrategySetting')
          },
          target:Vue.logTarget.billing_strategy
        }
      })
    },
    networkConfirm() {
      var self = this;
      let bmPrice = self.priceSetting.networkPrice;
      let mark = false;
      self.$refs.formNetwork.validate((valid) => {
        mark = valid;
      });
      if (!mark) {
        return false;
      }
      self.networkLoading = true;
      let reqdata = {
        "service_name": "network.floating",
        "cost": Number(bmPrice),
        "map_type": "flat"
      };
      self.$ajax({
        type: "POST",
        url: "api/cloudkitty/v1/rating/module_config/hashmap/prices",
        data: JSON.stringify(reqdata),
        successMsg: self.$t('opt.priceSettingSuccess'),
        successFun(data) {
          self.networkLoading = false;
        },
        log:{
          description:{
            en:"network billing strategy setting",
            zh_cn:self.$t('opt.floatIpBillingStrategySetting')
          },
          target:Vue.logTarget.billing_strategy
        }
      })
    }
  }
}
</script>
<style>
  
</style>
