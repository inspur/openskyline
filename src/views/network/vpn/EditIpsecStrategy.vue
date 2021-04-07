<template>
  <el-dialog :title="$t('network.editipsecStrategy')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-row>
    <el-col :span="12">
     <el-form ref="form" :model="form" class="me-required-form" label-width="140px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-22" v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" class="col-22" v-model="form.description"></el-input>
      </el-form-item>
      <el-button type="text" style="padding-left:10px;" @click="showDetail()" href="advanceBtn"><span>{{advanceName}}</span></el-button>
      <div v-show="moreAttribute">
      <el-form-item :label="$t('network.authalgorithm')">
        <el-input class="col-10" v-model="form.authalgorithm" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.encryptionalgorithm')">
        <el-select v-model="form.encryption">
          <el-option label="aes-128" value="aes-128"></el-option>
          <el-option label="3des" value="3des"></el-option>
          <el-option label="aes-192" value="aes-192"></el-option>
          <el-option label="aes-256" value="aes-256"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.fengzhuang')">
        <el-select v-model="form.encapsulationmode">
          <el-option label="tunnel" value="tunnel"></el-option>
          <el-option label="transport" value="transport"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.ikeunits')">
        <el-input class="col-10" v-model="form.units" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.lifetime')" prop="lifetime">
        <el-input class="col-20" v-model="form.lifetime"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.psf')">
        <el-select v-model="form.pfs">
          <el-option label="group5" value="group5"></el-option>
          <el-option label="group2" value="group2"></el-option>
          <el-option label="group14" value="group14"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.transformprotocol')">
        <el-select v-model="form.transformprotocol">
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
      <el-button @click="cancel">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="saveAdd" :disabled="isDisabled">{{$t('base.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name:"EditIpsecStrategy",
  props: ["editrow"],
  data() {
    return {
      oldForm: new Map(),
      dialogVisible: false,
      form: {
        name: "",
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
          {type: "required"},
          {type: 'maxSize', value: 40}
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
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
      this.form.name = this.editrow["name"];
      this.form.description = this.editrow["description"];
      this.form.authalgorithm = this.editrow["auth_algorithm"];
      this.form.encryption = this.editrow["encryption_algorithm"];
      this.form.encapsulationmode = this.editrow["encapsulation_mode"];
      this.form.units = this.editrow["lifetime"]["units"];
      this.form.lifetime = this.editrow["lifetime"]["value"];
      this.form.pfs = this.editrow["pfs"];
      this.form.transformprotocol = this.editrow["transform_protocol"];
      for (let [k, v] of Object.entries(this.form)) {
        this.oldForm.set(k, v);
      }
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
          let formLabel = {
            name: Vue.t('lang.name'),
            description: Vue.t('lang.desc'),
            authalgorithm: Vue.t('network.authalgorithm'),
            encryption: Vue.t('network.encryptionalgorithm'),
            pfs: Vue.t('network.psf'),
            encapsulationmode: Vue.t('network.fengzhuang'),
            transformprotocol: Vue.t('network.transformprotocol'),
            units: Vue.t('network.ikeunits'),
            lifetime: Vue.t('network.lifetime')
          };
          let logStr = '修改IPSec策略';
          for (let [k, v] of Object.entries(formLabel)) {
            logStr = logStr + `${v}修改前: ${self.oldForm.get(k)},${v}修改后: ${self.form[k]} `;
          }
          self.isDisabled = true;
          self.loading = true;
          let reqdata = {"ipsecpolicy":{
            "name": self.form.name,
            "description": self.form.description,
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
            self.loading = true;
            let result = await self.$ajax({
              type: "PUT",
              url: "api/neutron/v2.0/vpn/ipsecpolicies/"+self.editrow["id"],
              data: JSON.stringify(reqdata),
              errorKey: "NeutronError",
              successMsg: Vue.t('network.saveSuccess'),
              success: function(result) {
                self.loading = false;
                self.isDisabled = false;
                self.$emit("handleEditShow", {});
              },
              errFun(xhr, status) {
                if (xhr.status == "404") {
                  self.$emit("handleEditShow", {});
                }
                self.loading = false;
                self.isDisabled = false;
              },
              log:{
                description:{
                  en:"Before edit IPSec:"+self.editrow["name"]+", After edit IPSec:"+self.form.name,
                  zh_cn:logStr
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
