<template>
  <el-dialog :title="$t('network.editike')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
  <el-row>
    <el-col :span="12">
    <el-form ref="form" :model="form" class="me-required-form" label-width="155px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-20" v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" class="col-20" v-model="form.description"></el-input>
      </el-form-item>
      <el-button type="text" style="padding-left:10px;" @click="showDetail()" href="advanceBtn"><span>{{advanceName}}</span></el-button>
      <div v-show="moreAttribute">
      <el-form-item :label="$t('network.authalgorithm')">
        <!--
        <el-select v-model="form.authalgorithm" disabled>
          <el-option label="sha1" value="sha1"></el-option>
          <el-option label="sha256" value="sha256"></el-option>
          <el-option label="sha384" value="sha384"></el-option>
          <el-option label="sha512" value="sha512"></el-option>
        </el-select>
        -->
        <el-input class="col-20" v-model="form.authalgorithm" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.encryptionalgorithm')">
        <el-select v-model="form.encryption" class="col-20">
          <el-option label="aes-128" value="aes-128"></el-option>
          <el-option label="3des" value="3des"></el-option>
          <el-option label="aes-192" value="aes-192"></el-option>
          <el-option label="aes-256" value="aes-256"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.ikeversion')">
        <el-select v-model="form.ikeversion" class="col-20">
          <el-option label="v1" value="v1"></el-option>
          <el-option label="v2" value="v2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.ikeunits')">
        <!--
        <el-select v-model="form.units" disabled>
          <el-option label="seconds" value="seconds"></el-option>
        </el-select>
        -->
        <el-input class="col-20" v-model="form.units" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.lifetime')"  prop="lifetime">
        <el-input class="col-20" v-model="form.lifetime"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.psf')">
        <el-select v-model="form.pfs" class="col-20">
          <el-option label="group5" value="group5"></el-option>
          <el-option label="group2" value="group2"></el-option>
          <el-option label="group14" value="group14"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.ikephase')">
        <el-input class="col-20" v-model="form.phase1" disabled></el-input>
      </el-form-item>
      </div>
    </el-form>
    </el-col>
    <el-col :span="12">
      <div>
        {{$t('network.ikeNote1')}}<br/>
        <span style='font-weight:bold'>{{$t('network.ikeNote2')}}</span><br/>
        {{$t('network.ikeNote3')}}<br/>
        <span style='font-weight:bold'>{{$t('network.ikeNote4')}}</span><br/>
        {{$t('network.ikeNote5')}}<br/>
        <span style='font-weight:bold'>{{$t('network.ikeNote6')}}</span><br/>
        {{$t('network.ikeNote7')}}<br/>
        <span style='font-weight:bold'>{{$t('network.ikeNote8')}}</span><br/>
        {{$t('network.ikeNote9')}}<br/>
        <span style='font-weight:bold'>{{$t('network.ikeNote10')}}</span><br/>
        {{$t('network.ikeNote11')}}<br/>
        <span style='font-weight:bold'>{{$t('network.ikeNote12')}}</span><br/>
        {{$t('network.ikeNote13')}}
      </div>
    </el-col>
    </el-row>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="saveAdd" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name:"Editike",
  props: ["editrow"],
  data() {
    return {
      dialogVisible: false,
      oldForm: new Map(),
      form: {
        name: "",
        project_id: "",
        description: "",
        authalgorithm: "sha1",
        encryption: 'aes-128',
        ikeversion: 'v1',
        units: "seconds",
        lifetime: 3600,
        pfs: 'group5',
        phase1: "main"
      },
      loading: false,
      advanceName: Vue.t('network.advanceRight'),
      moreAttribute: false,
      isDisabled: false,
      roleType: Vue.roleType + "",
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: "requiredNet"},
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
    this.initDialog();
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
      this.form.name = this.editrow["name"];
      this.form.description = this.editrow["description"];
      this.form.authalgorithm = this.editrow["auth_algorithm"];
      this.form.encryption = this.editrow["encryption_algorithm"];
      this.form.ikeversion = this.editrow["ike_version"];
      this.form.units = this.editrow["lifetime"]["units"];
      this.form.lifetime = this.editrow["lifetime"]["value"];
      this.form.pfs = this.editrow["pfs"];
      this.form.phase1 = this.editrow["phase1_negotiation_mode"];
      for (let [k, v] of Object.entries(this.form)) {
        this.oldForm.set(k, v);
      }
    },
    handleClose(done) {
      this.$emit("handlerCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handlerCancelShow", {});
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
            ikeversion: Vue.t('network.ikeversion'),
            units: Vue.t('network.ikeunits'),
            lifetime: Vue.t('network.lifetime'),
            pfs: Vue.t('network.psf'),
            phase1: Vue.t('network.ikephase')
          };
          let logStr = '修改IKE策略';
          for (let [k, v] of Object.entries(formLabel)) {
            logStr = logStr + `${v}修改前: ${self.oldForm.get(k)},${v}修改后: ${self.form[k]} `;
          }
          self.isDisabled = true;
          self.loading = true;
          let reqdata = {"ikepolicy":{
            "name": self.form.name,
            "description": self.form.description,
            "auth_algorithm": self.form.authalgorithm,
            "encryption_algorithm": self.form.encryption,
            "pfs": self.form.pfs,
            "phase1_negotiation_mode": self.form.phase1,
            "lifetime": {
              "units": self.form.units,
              "value": self.form.lifetime
            },
            "ike_version": self.form.ikeversion
          }};
          try {
            self.loading = true;
            let result = await self.$ajax({
              type: "PUT",
              url: "api/neutron/v2.0/vpn/ikepolicies/"+self.editrow["id"],
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
                  en:"Before edit IKE name:"+self.editrow["name"]+", After edit IKE name:" + self.form.name,
                  zh_cn: logStr
                },
                target:Vue.logTarget.ikeStrategy
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
