<template>
<div>
  <el-dialog :title="$t('network.createipsecStrategy')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
  <el-row>
    <el-col :span="12">
    <el-form ref="form" :model="form" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-20" v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.project')" class="is-required" prop="projectName" v-if="roleType == '0'">
        <!--<el-select v-model="form.project_id" filterable clearable  class="col-20">
          <el-option v-for="item in query_porject"
          :key="item.id"
          :label="item.name"
          :value="item.id"></el-option>
        </el-select>-->
        <el-input auto-complete="off" class="col-20" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="form.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" class="col-20" v-model="form.description"></el-input>
      </el-form-item>
      <el-button type="text" style="padding-left:10px;" @click="showDetail()" href="advanceBtn"><span>{{advanceName}}</span></el-button>
      <div v-show="moreAttribute">
      <el-form-item :label="$t('network.authalgorithm')">
        <el-input v-model="form.authalgorithm" disabled  class="col-20"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.encryptionalgorithm')">
        <el-select v-model="form.encryption"  class="col-20">
          <el-option label="aes-128" value="aes-128"></el-option>
          <el-option label="3des" value="3des"></el-option>
          <el-option label="aes-192" value="aes-192"></el-option>
          <el-option label="aes-256" value="aes-256"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.fengzhuang')">
        <el-select v-model="form.encapsulationmode"  class="col-20">
          <el-option label="tunnel" value="tunnel"></el-option>
          <el-option label="transport" value="transport"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.ikeunits')">
        <el-input v-model="form.units" disabled  class="col-20"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.lifetime')" prop="lifetime">
        <el-input class="col-20" v-model="form.lifetime"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.psf')">
        <el-select v-model="form.pfs"  class="col-20">
          <el-option label="group5" value="group5"></el-option>
          <el-option label="group2" value="group2"></el-option>
          <el-option label="group14" value="group14"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.transformprotocol')">
        <el-select v-model="form.transformprotocol"  class="col-20">
          <el-option label="esp" value="esp"></el-option>
          <el-option label="ah" value="ah"></el-option>
        </el-select>
      </el-form-item>
      </div>
    </el-form>
  </el-col>
  <el-col :span="12">
    <div>
      {{$t('network.ipsecStrategyNote1')}}<br/>
      <span style='font-weight:bold'>{{$t('network.ipsecStrategyNote2')}}</span><br/>
      {{$t('network.ipsecStrategyNote3')}}<br/>
      <span style='font-weight:bold'>{{$t('network.ipsecStrategyNote4')}}</span><br/>
      {{$t('network.ipsecStrategyNote5')}}<br/>
      <span style='font-weight:bold'>{{$t('network.ipsecStrategyNote6')}}</span><br/>
      {{$t('network.ipsecStrategyNote7')}}<br/>
      <span style='font-weight:bold'>{{$t('network.ipsecStrategyNote8')}}</span><br/>
      {{$t('network.ipsecStrategyNote9')}}<br/>
      <span style='font-weight:bold'>{{$t('network.ipsecStrategyNote10')}}</span><br/>
      {{$t('network.ipsecStrategyNote11')}}<br/>
      <span style='font-weight:bold'>{{$t('network.ipsecStrategyNote12')}}</span><br/>
      {{$t('network.ipsecStrategyNote13')}}
    </div>
  </el-col>
  </el-row>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="saveAdd" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
  <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script type="text/javascript">
export default {
  name:"AddIpsecStrategy",
  data() {
    return {
      dialogVisible: false,
      selProjectFlg:false,
      close: "",
      form: {
        name: "",
        project_id: "",
        projectName:"",
        description: "",
        authalgorithm: "sha1",
        encryption: 'aes-128',
        encapsulationmode: 'tunnel',
        units: "seconds",
        lifetime: 3600,
        pfs: 'group5',
        transformprotocol: "esp"
      },
      loading: false,
      advanceName: Vue.t('network.advanceRight'),
      moreAttribute: false,
      isDisabled: false,
      query_porject: Vue.projectListforNet,
      roleType: Vue.roleType + "",
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: "requiredNet"},
          {type: 'maxSize', value: 40}
        ],
        projectName: [
          {type: "requiredNet"}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ],
        lifetime: [
          {type: "integer"},
          {type: "max", value: 2147483647},
          {type: "min", value: 60}
        ]
      }
    }
  },
  mounted() {
    this.$parent.$parent.active = "VpnList";
    this.initDialog();
    let roletype = Vue.roleType + "";
    if (roletype != "0") {
      this.form.project_id = Vue.cookie.get('pid');
    }
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.form.project_id = id;
      this.form.projectName = name;
      this.close = 'close';
    },
    onIconClick() {
      this.form.project_id = '';
      this.form.projectName = '';
      this.close = '';
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    showDetail() {
      if (this.moreAttribute == false) {
        this.moreAttribute = true;
        this.advanceName = Vue.t('network.advanceLeft');
      } else {
        this.moreAttribute = false;
        this.advanceName = Vue.t('network.advanceRight');
      }
    },
    saveAdd() {
      let self = this;
      self.$refs.form.validate(async(valid) => {
        if (valid) {
          let reqdata = {"ipsecpolicy":{
            "name": self.form.name,
            "description": self.form.description,
            "project_id": self.form.project_id,
            "auth_algorithm": self.form.authalgorithm,
            "encryption_algorithm": self.form.encryption,
            "pfs": self.form.pfs,
            "encapsulation_mode": self.form.encapsulationmode,
            "transform_protocol": self.form.transformprotocol,
            "lifetime": {
              "units": self.form.units,
              "value": self.form.lifetime
            }
          }};
          try {
            self.isDisabled = true;
            self.loading = true;
            let result = await self.$ajax({
              type: "POST",
              url: "api/neutron/v2.0/vpn/ipsecpolicies",
              data: JSON.stringify(reqdata),
              errorKey: "NeutronError",
              successMsg: Vue.t('network.saveSuccess'),
              success: function(result) {
                self.loading = false;
                self.isDisabled = false;
                self.$emit("handleAddShow", {});
              },
              errFun() {
                self.loading = false;
                self.isDisabled = false;
              },
              log:{
                description:{
                  en:"Add IPSec:"+self.form.name,
                  zh_cn:"创建IPSec策略:"+self.form.name
                },
                target:Vue.logTarget.ipsecStrategy
              }
            });
          } catch (res) {
          }
          return true;
        } else {
          return false;
        }
      });
    }
  }
}
</script>