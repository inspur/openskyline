<template>
<div>
  <el-form class="margin-tb20 me-require-form" ref="createInstanceForm" :model="createInstanceForm" :rules=rules label-width="100px">
    <el-form-item :label="$t('container.cluster')" prop="k8sClusterId" class="is-required">
      <el-select class="col-12" v-model="createInstanceForm.k8sClusterId" @change="clusterChange">
        <el-option v-for="item in k8sClusterOptions" :key="item.uuid" :label="item.name" :value="item.uuid"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('container.appName')" prop="app_name" class="is-required">
      <el-input class="col-12" v-model="createInstanceForm.app_name" auto-complete="off" @change="nameChange"></el-input>
    </el-form-item>
    <el-form-item :label="$t('container.copyNumber')" prop="replicas" class="is-required">
      <el-input-number class="col-12" v-model="createInstanceForm.replicas" :min="1" :max="10"></el-input-number>
      <el-tooltip placement="right-start">
        <div slot="content">{{$t('container.replicasNote')}}</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('container.applicationType')" prop="appType" class="is-required">
      <el-radio-group v-model="createInstanceForm.app_type" @change="apptypeChange">
        <el-radio class='radio' label="deployment">{{$t('container.stateless')}}</el-radio>
        <el-radio class='radio' label="statefulset">{{$t('container.stateful')}}</el-radio>
      </el-radio-group>
      <el-tooltip placement="right-start">
        <div slot="content">{{$t('container.statefulDesc')}}</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('container.hpa')" prop="hpaState" class="is-required">
      <el-radio-group v-model="createInstanceForm.hpaState">
        <el-radio class='radio' label="0">{{$t('lang.no')}}</el-radio>
        <el-radio class='radio' label="1" :disabled="createInstanceForm.app_type=='statefulset'">{{$t('lang.yes')}}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-card class="box-card col-12" style="padding-bottom:5px;" v-if="createInstanceForm.hpaState=='1' && createInstanceForm.app_type=='deployment'">
      <div slot="header" class="clearfix">
        <span>{{$t('container.setScalingSet')}}</span>
      </div>
      <el-form-item :label="$t('container.minCopyNumber')" prop="min_replicas" class="is-required" v-if="createInstanceForm.hpaState=='1' && createInstanceForm.app_type=='deployment'">
        <el-input class="col-12" v-model="createInstanceForm.min_replicas" auto-complete="off"></el-input>
         <el-tooltip placement="right-start">
          <div slot="content">{{$t('container.minReplicasTip')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('container.maxCopyNumber')" prop="max_replicas" class="is-required" v-if="createInstanceForm.hpaState=='1' && createInstanceForm.app_type=='deployment'" >
        <el-input class="col-12" v-model="createInstanceForm.max_replicas" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('container.cpuThreshold')" prop="cpu_average" class="is-required" v-if="createInstanceForm.hpaState=='1' && createInstanceForm.app_type=='deployment'">
        <el-input class="col-12" v-model="createInstanceForm.cpu_average" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('container.memThreshold')" prop="mem_average" class="is-required" v-if="createInstanceForm.hpaState=='1' && createInstanceForm.app_type=='deployment'">
        <el-input class="col-12" v-model="createInstanceForm.mem_average" auto-complete="off"></el-input>
      </el-form-item>
    </el-card>    
    <el-form-item :label="$t('lang.desc')" prop="describe" class="">
      <el-input class="col-12" v-model="createInstanceForm.describe" auto-complete="off" type="textarea"></el-input>
    </el-form-item>
    <!-- 标签 -->
    <el-form-item :label="$t('calcStorLang.high')">
      <el-switch v-model="tagsFlag" on-text="" off-text=""></el-switch>
    </el-form-item>
    <el-form-item :label="$t('container.tags')" v-show="tagsFlag">
      <el-row>
      <el-col class="col-8">
        <el-form-item prop="labelKey">
          <el-input v-model="createInstanceForm.labelKey" :placeholder="$t('container.key')" @change="checkLabelKey"></el-input>
          <div class="el-form-item__error" id="label-key-exist-error" hidden>{{$t('container.keyExistError')}}</div>
          <div class="el-form-item__error" id="key-error" hidden>{{$t('container.required')}}</div>
          <div class="el-form-item__error" id="key-input-error" hidden>{{$t('validation.containerApplicationLabelRule')}}</div>
        </el-form-item>
      </el-col>
      <el-col class="col-8" style="padding-left:5px;">
        <el-form-item prop="labelValue">
          <el-input v-model="createInstanceForm.labelValue" :placeholder="$t('container.value')" @change="checkLabelValue"></el-input>
          <div class="el-form-item__error" id="value-error" hidden>{{$t('container.required')}}</div>
          <div class="el-form-item__error" id="value-input-error" hidden>{{$t('validation.containerApplicationLabelRule')}}</div>
        </el-form-item>
      </el-col>
      <el-col class="col-3" style="padding-left:5px;">
        <el-form-item>
          <el-button type="primary" icon='fa-plus' size="small" @click="addLabel()">{{$t('container.add')}}</el-button>
        </el-form-item>
      </el-col>
      </el-row>
    </el-form-item>
    <el-form-item style="width: 620px; max-height: 250px;overflow-y:auto;overflow-x:hidden;padding-top:5px;" v-show="tagsFlag">
      <el-table ref="labelTable" :data="createInstanceForm.labels" highlight-current-row stripe border row-key="id">
        <el-table-column prop="key" :label="$t('container.key')" align="left" show-overflow-tooltip min-width="150"></el-table-column>
        <el-table-column prop="value" :label="$t('container.value')" align="left" show-overflow-tooltip min-width="250"></el-table-column>
        <el-table-column prop="operate" :label="$t('container.operate')" align="left" show-overflow-tooltip min-width="70">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="removeLabel(scope.row)" v-if="scope.row.key!='app'">{{$t('lang.delete')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
  </el-form>
  <div class="me-form-footer">
    <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    <el-button @click="nextStep" type="primary" >{{$t('lang.nextStep')}}</el-button>
  </div>
</div>
</template>
<script>
  export default {
    name: "CreateInstanceStepOne",
    data() {
      return {
        createInstanceForm: {
          app_name:"",
          rancher_cluster_id:"",
          app_type:"deployment",
          replicas:"1",
          describe:"",
          labels : [],
          k8sClusterId:"",
          hpaState:"0",
          labelKey: '',
          labelValue: '',
          min_replicas: '',
          max_replicas: '',
          cpu_average: '',
          mem_average: ''
        },
        k8sClusterOptions: [],
        insecure_registry_id:'',
        insecure_registry:'',
        user_id:"",
        labelTableId:0,
        tagsFlag: false,
        cnidriver: "",
        rules: {
          k8sClusterId: [
            {type: 'required', trigger: 'blur change'}
          ],
          app_name: [
            {type: 'required', trigger: 'blur change'},
            {type: 'maxSize', value: 40},
            {type: 'containerApplicationNameRule'}
          ],
          describe: [
            {type: 'maxSize', value: 255}
          ],
          replicas:[
            {type: 'integer'}
          ],
          labelKey: [
            {type: 'maxSize', value: 40}
          ],
          labelValue: [
            {type: 'maxSize', value: 63}
          ],
          min_replicas: [
            {type: 'required', trigger: 'blur change'},
            {type: 'integer'},
            {type: 'max', value:10},
            {type: 'min', value:1}
          ],
          max_replicas: [
            {type: 'required', trigger: 'blur change'},
            {type: 'integer'},
            {type: 'max', value:10},
            {type: 'min', value:1}
          ],
          cpu_average: [
            {type: 'required', trigger: 'blur change'},
            {type: 'integer'},
            {type: 'max', value:100},
            {type: 'min', value:1}
          ],
          mem_average: [
            {type: 'required', trigger: 'blur change'},
            {type: 'integer'},
            {type: 'max', value:100},
            {type: 'min', value:1}
          ]
        }
      }
    },
    mounted() {
      this.getK8sClusterList();
      this.initLabelTable();
    },
    methods: {
      async getK8sClusterList() {
        let me = this;
        let param = {};
        let allDataList = [];
        me.k8sClusterOptions = [];
        if (Vue.roleType + "" != "0") {
          param["project_id"] = this.$cookie.get('pid');
        }
        let queryData = Object.assign({}, param);
        let ajaxParam = {
          type: 'POST',
          url: "api/cetus/v1/cluster/index",
          data: JSON.stringify(queryData)
        };
        let ret = await this.$ajax(ajaxParam);
        allDataList = ret.result;
        allDataList.forEach(function(obj, i) {
          if (['active', 'UPDATE_IN_PROGRESS'].indexOf(obj.status) > -1) {
            me.k8sClusterOptions.push(obj);
          }
        });
      },
      initLabelTable() {
        this.labelTableId++;
        this.createInstanceForm.labels.push({
          id:this.labelTableId, key:'app', value:"", operate:""
        });
      },
      nameChange(value) {
        for (let i = 0; i < this.createInstanceForm.labels.length; i++) {
          if (this.createInstanceForm.labels[i].key == "app") {
            this.createInstanceForm.labels[i].value = value;
          }
        }
      },
      checkLabelKey(val) {
        $('#label-key-exist-error').hide();
        $("#key-error").hide();
        $("#key-input-error").hide();
        let reg = /^[0-9a-zA-Z]+([0-9a-zA-Z_]*[0-9a-zA-Z]+)?$/;
        if (val != "") {
          let flg = true;
          for (let i = 0; i < this.createInstanceForm.labels.length; i++ ) {
            if (this.createInstanceForm.labelKey == this.createInstanceForm.labels[i].key) {
              $('#label-key-exist-error').show();
              flg = false;
              return false;
            }
          }
          if (flg) {
            if (!reg.test(val)) {
              $("#key-input-error").show();
              return false;
            }
          }
        } else {
          $("#key-error").show();
          return false;
        }
        return true;
      },
      checkLabelValue(val) {
        $("#value-error").hide();
        $("#value-input-error").hide();
        if (val != "") {
          let reg = /^[0-9a-zA-Z]+([0-9a-zA-Z_]*[0-9a-zA-Z]+)?$/;
          if (!reg.test(val)) {
            $("#value-input-error").show();
            return false;
          }
        } else {
          $("#value-error").show();
          return false;
        }
        return true;
      },
      addLabel() {
        if (!this.checkLabelKey(this.createInstanceForm.labelKey)) {
          return false;
        }
        if (!this.checkLabelValue(this.createInstanceForm.labelValue)) {
          return false;
        }
        this.labelTableId++;
        let key = this.createInstanceForm.labelKey;
        let value = this.createInstanceForm.labelValue;
        this.createInstanceForm.labels.push({
          id:this.labelTableId, key:key, value:value, operate:""
        });
        this.createInstanceForm.labelKey = "";
        this.createInstanceForm.labelValue = "";
      },
      removeLabel(row) {
        this.labelTableId--;
        const test = this.createInstanceForm.labels.filter(item => item.id !== row['id']);
        this.createInstanceForm.labels.length = 0;
        this.createInstanceForm.labels.push.apply(this.createInstanceForm.labels, test);
      },
      apptypeChange(value) {
        if (value === "statefulset") {
          this.createInstanceForm.hpaState = "0";
        } else {
        }
      },
      clusterChange(value) {
        for (let i=0; i<this.k8sClusterOptions.length; i++) {
          if (value == this.k8sClusterOptions[i]['uuid']) {
            this.insecure_id = this.k8sClusterOptions[i]['insecure_id'];
            this.insecure_registry = this.k8sClusterOptions[i]['insecure_registry'];
            this.insecure_registry_id = this.k8sClusterOptions[i]['insecure_registry_id'];
            this.createInstanceForm.rancher_cluster_id = this.k8sClusterOptions[i]['rancher_cluster_id'];
            this.user_id = this.k8sClusterOptions[i]['user_id'];
            this.cnidriver = this.k8sClusterOptions[i]["network_driver"];
            this.createInstanceForm.hpaState = "0";
          }
        }
      },
      cancel() {
        this.$emit("cancel");
      },
      nextStep() {
        this.$refs.createInstanceForm.validate((valid) => {
          if (!valid) {
            return false;
          }
          if (this.createInstanceForm.hpaState=='1' && this.createInstanceForm.app_type=='deployment') {
            if (parseInt(this.createInstanceForm.max_replicas) <= parseInt(this.createInstanceForm.min_replicas)) {
              this.$notify.warning({
                message: Vue.t("container.replicasCompare")
              })
              return false;
            }
          }
          this.$emit("stepDone", 1, this.createInstanceForm);
        });
      }
    }
  }
</script>
<style scoped>

</style>
