<template>
<div>
  <el-dialog :title="$t('network.createike')"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    v-dialogDrag>
  <el-row>
    <el-col :span="12">
    <el-form ref="form" :model="form" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-20" v-model="form.name"></el-input>
      </el-form-item> 
      <el-form-item :label="$t('lang.project')" class="is-required" prop="projectName" v-if="roleType == '0'">
        <!--<el-select v-model="form.project_id" filterable clearable class="col-20">
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
      <el-button type="text" @click="showDetail()" href="advanceBtn"><span>{{advanceName}}</span></el-button>
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
        <el-input v-model="form.units" disabled class="col-20"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.lifetime')" prop="lifetime">
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
   <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script type="text/javascript">
export default {
  name:"Addike",
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
      query_porject: Vue.projectListforNet,
      roleType: Vue.roleType + "",
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: "required"},
          {type: 'maxSize', value: 40}
        ],
        projectName: [
          {type: "required"}
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
    handleClose(done) {
      this.$emit("handlerCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handlerCancelShow", {});
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
          let reqdata = {"ikepolicy":{
            "name": self.form.name,
            "description": self.form.description,
            "project_id": self.form.project_id,
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
            self.isDisabled = true;
            self.loading = true;
            let result = await self.$ajax({
              type: "POST",
              url: "api/neutron/v2.0/vpn/ikepolicies",
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
                  en:"Create IKE:" + self.form.name,
                  zh_cn:"创建IKE策略:" + self.form.name
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