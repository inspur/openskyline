<template>
  <div>
  <el-form class="margin-tb20 me-required-form" ref="createTemplateForm" :model="createTemplateForm" :rules=rules label-width="100px">
    <el-form-item :label="$t('container.availabilityZone')" prop="availability_zone" class="is-required">
      <el-select class="col-12" v-model="createTemplateForm.availability_zone" clearable>
        <el-option v-for="item in availabilityZoneOptions" :key="item.zoneName" :label="item.zoneName" :value="item.zoneName"></el-option>
      </el-select>
      <el-tooltip placement="right-start">
        <div slot="content">{{$t('container.availabilityZoneDesc')}}</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('container.clusterVersion')" prop="master_image_id" class="is-required">
      <el-select class="col-12" v-model="createTemplateForm.master_image_id" @change="imageChange">
        <el-option v-for="item in clusterversionOptions" :key="item.id" :label="item.kubernetes" :value="item.id"></el-option>
      </el-select>
      <el-tooltip placement="right-start">
        <div slot="content">{{$t('container.k8sValidatorDesc')}}</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.createInstLoginType')">
      <el-radio-group v-model="loginType" @change="keyPairType">
        <el-radio class="radio" :label="1">{{$t('lang.password')}}</el-radio>
        <el-radio class="radio" :label="2">{{$t('calcStorLang.keypair')}}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('lang.userName')" v-if="loginType == '1'">
      <el-input class="col-8" v-model="userName" disabled></el-input>
    </el-form-item>
    <el-form-item :label="$t('lang.password')" prop="userPass" class="is-required" v-show="loginType == '1'" key="userPass">
      <el-input class="col-8" v-model="createTemplateForm.userPass" auto-complete="off" type="password"></el-input>
    </el-form-item>
    <el-form-item :label="$t('lang.confirmPassword')" prop="userConfirmPass" class="is-required" v-show="loginType == '1'" key="userConfirmPass">
      <el-input class="col-8" v-model="createTemplateForm.userConfirmPass" auto-complete="off" type="password"></el-input>
    </el-form-item>
    <el-form-item :label="$t('container.keypair')" prop="keypair_id" class="is-required" v-show="loginType == '2'" key="keypair_id">
      <el-select class="col-12" v-model="createTemplateForm.keypair_id" clearable>
        <el-option v-for="item in keypairListOptions" :key="item.keypair.name" :label="item.keypair.name" :value="item.keypair.name"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('container.startMode')">
      <el-checkbox v-model="startMode" :label="$t('container.volumeStart')" @change="startModeChange"></el-checkbox>
    </el-form-item>
    <el-form-item :label="$t('storage.volumetype')" prop="volumeType" v-if="startMode">
      <el-select class="col-12" v-model="createTemplateForm.master_cinder_type" size="small" filterable clearable>
        <el-option v-for="item in volumeTypeList" :value="item.name" :key="item.id" :label="item.name.length > 50?item.name.substring(0, 50):item.name">
        </el-option>
      </el-select>
    </el-form-item>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{$t('container.masterConfig')}}</span>
      </div>
      <div>
        <el-form-item :label="$t('container.createStation')" class="is-required">
          <el-radio-group v-model="master_station" @change="masterstationChange">
            <el-radio label="1">{{$t('base.virtualMac')}}</el-radio>
            <el-radio label="2" :disabled="masterstationDisabled && startMode">{{$t('base.cloudPhysiceMachine')}}</el-radio>
          </el-radio-group>
          <el-tooltip placement="right-start">
            <div slot="content">{{$t('container.startModTip')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="Flavor" prop="master_flavor_id" class="is-required">
          <el-select class="col-12" v-model="createTemplateForm.master_flavor_id" filterable v-if="master_station=='1'">
            <el-option v-for="item in masterFlavorListOptions" :key="item.name" :label="item.detail" :value="item.name"></el-option>
          </el-select>
          <el-select class="col-12" v-model="createTemplateForm.master_flavor_id" filterable v-if="master_station=='2'">
            <el-option v-for="item in masterFlavorListOptions" :key="item.name" :label="item.name" :value="item.name"></el-option>
          </el-select>
          <el-tooltip placement="right-start">
            <div slot="content">{{$t('container.masterNodeFlavorDesc')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('monitor.nodes')" prop="master_count" class="is-required">
          <el-select class="col-12" v-model="createTemplateForm.master_count">
            <el-option label="1" value="1"></el-option>
            <el-option label="3" value="3"></el-option>
            <el-option label="5" value="5"></el-option>
          </el-select>
          <el-tooltip placement="right-start">
            <div slot="content">{{$t('container.addworkNote')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      </div>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{$t('container.workerConfig')}}</span>
      </div>
      <div>
        <el-form-item :label="$t('container.createStation')" class="is-required">
          <el-radio-group v-model="worker_station" @change="workerstationChange">
            <el-radio label="1">{{$t('base.virtualMac')}}</el-radio>
            <el-radio label="2" :disabled="workerstationDisabled && startMode">{{$t('base.cloudPhysiceMachine')}}</el-radio>
          </el-radio-group>
          <el-tooltip placement="right-start">
              <div slot="content">{{$t('container.startModTip2')}}</div>
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
        </el-form-item>
        <el-form-item label="Flavor" prop="worker_flavor_id" class="is-required">
          <el-select class="col-12" v-model="createTemplateForm.worker_flavor_id" filterable v-if="worker_station=='1'">
            <el-option v-for="item in flavorListOptions" :key="item.name" :label="item.detail" :value="item.name"></el-option>
          </el-select>
          <el-select class="col-12" v-model="createTemplateForm.worker_flavor_id" filterable v-if="worker_station=='2'">
            <el-option v-for="item in flavorListOptions" :key="item.name" :label="item.name" :value="item.name"></el-option>
          </el-select>
          <el-tooltip placement="right-start">
            <div slot="content">{{$t('container.nodeFlavorDesc')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('monitor.nodes')" prop="worker_count" class="is-required">
          <el-input class="col-12" v-model="createTemplateForm.worker_count"></el-input>
          <el-tooltip placement="right-start">
            <div slot="content">{{$t('container.addworkNote')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="">
          <el-checkbox v-model="whetherVolume" :label="$t('container.createVolume')" @change="volumeChange" :disabled="worker_station=='2'"></el-checkbox>
          <el-tooltip placement="right-start">
            <div slot="content">{{$t('container.volumeNote2')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('storage.volumetype')" prop="worker_cinder_type" v-if="whetherVolume">
          <el-select class="col-12" v-model="createTemplateForm.worker_cinder_type" filterable clearable>
            <el-option v-for="item in volumeTypeOptions" :key="item.id" :label="getSelectOptionName(item.name)" :value="item.name"></el-option>
          </el-select>
          <el-tooltip placement="right-start">
            <div slot="content">{{$t('container.volumeNote3')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('container.volumeSizeGB')" prop="docker_volume_size" class="is-required" v-if="whetherVolume">
          <el-input class="col-12" v-model="createTemplateForm.docker_volume_size"></el-input>
          <el-tooltip placement="right-start">
            <div slot="content">{{$t('container.volumeNote')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      </div>
    </el-card>
  </el-form>
  <div class="me-form-footer">
    <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    <el-button @click="prevStep" type="primary" >{{$t('lang.preStep')}}</el-button>
      <el-button @click="nextStep" type="primary" >{{$t('lang.nextStep')}}</el-button>
  </div>
  </div>
</template>
<script>
  export default {
    name: "CreateContainerClusterStepOne",
    data() {
      var K8sValidator = async (rule, value, callback) => {
        if (!value) {
          return callback(new Error(this.$t('container.required')));
        } else {
          for (let i=0; i<this.clusterversionOptions.length; i++) {
          if (value == this.clusterversionOptions[i].id) {
            let image = this.clusterversionOptions[i];
            this.k8s_versionVal = image["kubernetes"];
            let self = this;
            let body = {"k8s_version": this.k8s_versionVal};
            body = JSON.stringify(body);
            try {
              let result = await self.$ajax ({
                type: 'post',
                data: body,
                url: 'api/cetus/v1/cluster/check_k8s_version'
              });
              this.k8s_valid = result["result"];
            } catch (res) {
            }
            if ("success" != this.k8s_valid) {
              return callback(new Error(this.$t('container.k8sAlert')));
            } else {
              callback();
            }
            } else {
            }
          }
        }
      }
      return {
        createTemplateForm: {
          availability_zone:'',
          master_image_id: '',
          worker_image_id: '',
          keypair_id:'',
          master_flavor_id:'',
          master_count:'1',
          worker_flavor_id:'',
          worker_count:'1',
          docker_volume_size:'',
          userPass:'',
          userConfirmPass:'',
          admin_pass:'',
          worker_cinder_type:'',
          master_cinder_type:'',
          bootable_volume_size:'',
          block_device_mapping:'',
          k8s_version:'',
          master_host_enabled: false,
          minion_host_enabled: false
        },
        availabilityZoneOptions:[],
        clusterversionOptions:[],
        keypairListOptions:[],
        flavorListOptions:[],
        masterFlavorListOptions:[],
        volumeTypeOptions:[],
        volumeTypeList:[],
        minMem:0,
        minDisk:0,
        loginType:1,
        userName: "root",
        startMode: true,
        whetherVolume: false,
        maxworkernode: 0,
        master_station:"1",
        worker_station:"1",
        k8s_versionVal:"",
        k8s_valid:"",
        masterstationDisabled: true,
        workerstationDisabled: true,
        rules: {
          availability_zone: [
            {type: 'required'}
          ],
          master_image_id: [
            {validator: K8sValidator, trigger: 'blur change'}
          ],
          master_flavor_id: [
            {type: 'required', trigger: 'blur change'}
          ],
          worker_flavor_id: [
            {type: 'required', trigger: 'blur change'}
          ],
          worker_count: [
            {type: 'required', trigger: 'blur change'},
            {type:'integer'},
            {type:'min', value:1},
            {type:'max', value:200}
          ],
          docker_volume_size: [
            {type:'integer'},
            {type:'min', value:3},
            {type:'max', value:1024}
          ],
          userPass: [
            { type: 'required', trigger: 'blur change' },
            { type: 'passwordLegal' }
          ],
          userConfirmPass: [
            { type: 'required', trigger: 'blur change' },
            { type: 'passwordEquals', context: this, value: "createTemplateForm.userPass" }
          ]
        }
      }
    },
    created() {
      this.getAvailabilityZoneList();
      this.getImageList();
      this.getKeypairList();
      this.getVolumeType();
      this.getWorkerNumberLimit();
    },
    methods: {
      async getAvailabilityZoneList() {
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/os-availability-zone"
          });
          let dataList = response.availabilityZoneInfo;
          for (let i = 0; i < dataList.length; i++) {
            let data = dataList[i];
            if (data.zoneName != "internal") {
              this.availabilityZoneOptions.push(data);
            }
          }
        } catch (data) {
        }
      },
      async getImageList() {
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/glance/v2/images?limit=99999"
          });
          let dataList = response.images;
          for (let i = 0; i < dataList.length; i++) {
            let data = dataList[i];
            if (data.hasOwnProperty("kubernetes")) {
              this.clusterversionOptions.push(data);
            }
          }
        } catch (data) {
        }
      },
      imageChange(imageid) {
        for (let i=0; i<this.clusterversionOptions.length; i++) {
          if (imageid == this.clusterversionOptions[i].id) {
            let image = this.clusterversionOptions[i];
            this.minMem = image["min_ram"];
            this.minDisk = image["min_disk"];
            this.createTemplateForm.k8s_version = image["kubernetes"];
            this.getmasterFlavorList();
            this.getworkerFlavorList();
          }
        }
      },
      volumeChange(value) {
        if (value) {
          this.rules.docker_volume_size = [
            {type: 'required'},
            {type:'integer'},
            {type:'min', value:3},
            {type:'max', value:1024}
          ]
        }
      },
      masterstationChange(val) {
        this.getmasterFlavorList();
      },
      workerstationChange(val) {
        if (val == "2") {
          this.whetherVolume = false;
        }
        this.getworkerFlavorList();
      },
      async getmasterFlavorList() {
        let self = this;
        try {
          if (self.master_station == "2") {
            self.createTemplateForm.master_flavor_id = "";
            self.masterFlavorListOptions = [];
            let result = await self.$ajax({
              type: 'get',
              url: "api/nova/v2.1/flavors/detail"
            });
            let list = [];
            let flavors = result['flavors'];
            for (let i in flavors) {
              if (flavors[i].name != null && flavors[i].name.indexOf("Bare@") >= 0) {
                if (parseInt(flavors[i]["ram"]) >= parseInt(this.minMem) && parseInt(flavors[i]["disk"]) >= parseInt(this.minDisk)) {
                  list.push(flavors[i]);
                }
              }
            }
            self.masterFlavorListOptions = list;
          } else {
            self.createTemplateForm.master_flavor_id = "";
            this.masterFlavorListOptions = [];
            let publicFlavor = await this.$ajax({
              type: 'get',
              url: "api/nova/v2.1/flavors/detail?is_public=true"
            });
            let privateFlavor = await this.$ajax({
              type: 'get',
              url: "api/nova/v2.1/flavors/detail?is_public=false"
            });
            let dataList = [];
            let idList = [];
            publicFlavor.flavors.forEach(function(obj, index) {
              dataList.push(obj);
              idList.push(obj['id']);
            });
            privateFlavor.flavors.forEach(function(obj, index) {
              if (idList.indexOf(obj['id']) == -1) {
                dataList.push(obj);
              }
            });
            for (let i = 0; i < dataList.length; i++) {
              let data = dataList[i];
              if (parseInt(data["ram"]) >= parseInt(this.minMem) && parseInt(data["disk"]) >= parseInt(this.minDisk)) {
                data.detail = data.name + ' (' + data.vcpus + this.$t('container.core') + ', ' + (data.ram / 1024) + 'GB '+
                            this.$t('container.memory') + ', ' + data.disk + 'GB ' + this.$t('container.hardDisk') + ')';
                if (!data.name.startsWith("Bare@")) {
                  this.masterFlavorListOptions.push(data);
                }
              }
            }
          }
        } catch (data) {
        }
      },
      async getworkerFlavorList() {
        let self = this;
        try {
          if (self.worker_station == "2") {
            self.createTemplateForm.worker_flavor_id = "";
            self.flavorListOptions = [];
            let result = await self.$ajax({
              type: 'get',
              url: "api/nova/v2.1/flavors/detail"
            });
            let list = [];
            let flavors = result['flavors'];
            for (let i in flavors) {
              if (flavors[i].name != null && flavors[i].name.indexOf("Bare@") >= 0) {
                if (parseInt(flavors[i]["ram"]) >= parseInt(this.minMem) && parseInt(flavors[i]["disk"]) >= parseInt(this.minDisk)) {
                  list.push(flavors[i]);
                }
              }
            }
            self.flavorListOptions = list;
          } else {
            self.createTemplateForm.worker_flavor_id = "";
            self.flavorListOptions = [];
            let publicFlavor = await this.$ajax({
              type: 'get',
              url: "api/nova/v2.1/flavors/detail?is_public=true"
            });
            let privateFlavor = await this.$ajax({
              type: 'get',
              url: "api/nova/v2.1/flavors/detail?is_public=false"
            });
            let dataList = [];
            let idList = [];
            publicFlavor.flavors.forEach(function(obj, index) {
              dataList.push(obj);
              idList.push(obj['id']);
            });
            privateFlavor.flavors.forEach(function(obj, index) {
              if (idList.indexOf(obj['id']) == -1) {
                dataList.push(obj);
              }
            });
            for (let i = 0; i < dataList.length; i++) {
              let data = dataList[i];
              if (parseInt(data["ram"]) >= parseInt(this.minMem) && parseInt(data["disk"]) >= parseInt(this.minDisk)) {
                data.detail = data.name + ' (' + data.vcpus + this.$t('container.core') + ', ' + (data.ram / 1024) + 'GB '+
                            this.$t('container.memory') + ', ' + data.disk + 'GB ' + this.$t('container.hardDisk') + ')';
                if (!data.name.startsWith("Bare@")) {
                  self.flavorListOptions.push(data);
                }
              }
            }
          }
        } catch (data) {
        }
      },
      async getKeypairList() {
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/" + this.$cookie.get("pid") + "/os-keypairs"
          });
          let dataList = response.keypairs;
          this.keypairListOptions = dataList;
          if (this.keypairListOptions.length > 0) {
            let keypair = this.keypairListOptions[0]["keypair"];
            this.createTemplateForm.keypair_id = keypair["name"];
          }
        } catch (data) {
        }
      },
      async getVolumeType() {
        let self = this;
        let projectId = this.$cookie.get('pid');
        let url = "api/cinderv3/v3/" + projectId + "/types?is_public=None";
        try {
          let result = await self.$ajax({
            type: 'get',
            url: url,
            showErrMsg: true
          });
          self.volumeTypeOptions = result['volume_types'];
          self.volumeTypeList = result['volume_types'];
        } catch (res) {
          self.$message.error( Vue.t('storage.getFailed'));
        }
      },
      async getWorkerNumberLimit() {
        let comret = await this.$ajax({
          type: 'get',
          url: "api/nova/v2/os-quota-sets/"+this.$cookie.get('pid'),
          showErrMsg:false
        });
        this.maxworkernode = comret.quota_set.server_group_members;
        if (this.maxworkernode == "-1") {
          this.maxworkernode = 200;
        }
        this.rules.worker_count = [
          {type: 'required', trigger: 'blur change'},
          {type:'integer'},
          {type:'min', value:1},
          {type:'max', value:this.maxworkernode}
        ]
      },
      getSelectOptionName(value) {
        if (typeof (value) == "undefined" || null == value) {
          return value;
        }
        if (value.length > 80) {
          return value.substring(0, 80);
        }
        return value;
      },
      keyPairType(value) {
        if (value == "1") {
          this.rules.userPass = [
            { type: 'required', trigger: 'blur change' },
            { type: 'passwordLegal' }
          ];
          this.rules.userConfirmPass = [
            { type: 'required', trigger: 'blur change' },
            { type: 'passwordEquals', context: this, value: "createTemplateForm.userPass" }
          ];
          this.rules.keypair_id = [];
          this.createTemplateForm.userPass = "";
          this.createTemplateForm.userConfirmPass = "";
        } else {
          this.rules.keypair_id = [
            {type: 'required'}
          ];
          this.rules.userPass = [];
          this.rules.userConfirmPass = [];
          if (this.keypairListOptions.length > 0) {
            let keypair = this.keypairListOptions[0]["keypair"];
            this.createTemplateForm.keypair_id = keypair["name"];
          } else {
            this.createTemplateForm.keypair_id = "";
          }
        }
        this.$refs.createTemplateForm.validateField('userPass');
        this.$refs.createTemplateForm.validateField('userConfirmPass');
        this.$refs.createTemplateForm.validateField('keypair_id');
      },
      startModeChange(val) {
        if (this.startMode == true) {
          this.master_station = "1";
          this.worker_station = "1"
        }
      },
      prevStep() {
        this.$emit("prevStep", 0);
      },
      nextStep() {
        this.createTemplateForm.worker_image_id = this.createTemplateForm.master_image_id;
        this.$refs.createTemplateForm.validate((valid) => {
          if (valid) {
            if (parseInt(this.createTemplateForm.master_count) + parseInt(this.createTemplateForm.worker_count) > this.maxworkernode) {
              this.$message.error(Vue.t("container.addworkNote") + ":"+ this.maxworkernode);
              return;
            }
            if (this.loginType == "1") {
              this.createTemplateForm.admin_pass = this.createTemplateForm.userPass;
              delete this.createTemplateForm.keypair_id;
            } else {
              delete this.createTemplateForm.admin_pass;
            }
            delete this.createTemplateForm.userPass;
            delete this.createTemplateForm.userConfirmPass;
            if (this.startMode == true) {
              this.createTemplateForm.block_device_mapping = true;
              for (let i=0; i<this.masterFlavorListOptions.length; i++) {
                if (this.createTemplateForm.master_flavor_id == this.masterFlavorListOptions[i]['name']) {
                  let diskSize = this.masterFlavorListOptions[i]['disk'];
                  this.createTemplateForm.bootable_volume_size = parseInt(diskSize);
                  break;
                }
              }
            } else {
              delete this.createTemplateForm.master_cinder_type;
              delete this.createTemplateForm.block_device_mapping;
              delete this.createTemplateForm.bootable_volume_size;
            }
            if (this.master_station == "2") {
              this.createTemplateForm.master_host_enabled = true;
            }
            if (this.worker_station == "2") {
              this.createTemplateForm.minion_host_enabled = true;
              delete this.createTemplateForm.worker_cinder_type;
              this.createTemplateForm.docker_volume_size = 0;
            }
            this.$emit("stepTwoDone", this.createTemplateForm);
          } else {
            return false;
          }
        });
      },
      cancel() {
        this.$emit("cancel");
      }
    }
  }
</script>
<style scoped>

</style>
