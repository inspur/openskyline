<template>
  <div>
    <el-form class="margin-tb20 me-required-form" ref="createDBInstanceForm" :model="createDBInstanceForm" :rules=rules label-width="120px">
      <el-form-item :label="$t('db.availabilityZone')" prop="availabilityZone" class="is-required">
        <el-select class="col-12" v-model="createDBInstanceForm.availabilityZone">
          <el-option v-for="item in availabilityZoneOptions" :key="item.zoneName" :label="item.zoneName" :value="item.zoneName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-12" v-model="createDBInstanceForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('db.hardDiskType')" prop="volumeType">
        <el-select class="col-12" v-model="createDBInstanceForm.volumeType" clearable filterable>
          <el-option v-for="item in volumeTypeOptions" :key="item.id" :label="item.name" :value="item.id" :title="item.title"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('db.diskSizeGB')" prop="diskSize" class="is-required">
        <el-input-number class="col-12" v-model="createDBInstanceForm.diskSize" :min="1" :max="2000"></el-input-number>
      </el-form-item>
      <el-form-item :label="$t('db.flavor')" prop="flavor" class="is-required">
        <el-select class="col-12" v-model="createDBInstanceForm.flavor" filterable>
          <el-option v-for="item in flavorOptions" :key="item.id" :label="item.detail" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('db.network')" prop="network" class="is-required">
        <el-select class="col-12" v-model="createDBInstanceForm.network" filterable>
          <el-option v-for="item in networkOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-tooltip placement="right-start">
          <div slot="content">{{$t('db.networkDesc')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('db.databaseType')" prop="databaseType" class="is-required">
        <el-select class="col-12" v-model="createDBInstanceForm.databaseType" @change="getDatabaseVersions">
          <el-option v-for="item in databaseTypeOptions" :key="item.value" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('db.databaseVersion')" prop="databaseVersion" class="is-required">
        <el-select class="col-12" v-model="createDBInstanceForm.databaseVersion">
          <el-option v-for="item in databaseVersions" :key="item.name" :label="item.name" :value="item.name"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="亲和性" prop="locality">
        <el-select class="col-12" v-model="createDBInstanceForm.locality">
          <el-option v-for="item in localityOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-tooltip placement="right-start">
          <div slot="content">实例是否复制到同一主机。</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item> -->
    </el-form>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="nextStep" type="primary">{{$t('lang.nextStep')}}</el-button>
    </div>
  </div>
</template>
<script>
  export default {
    name: "CreateDBInstanceStepOne",
    data() {
      return {
        createDBInstanceForm: {
          name:"",
          availabilityZone: "",
          diskSize: "",
          volumeType: "",
          flavor:"",
          network:"",
          databaseType:"mysql",
          databaseVersion: "" //,
          // locality:""
        },
        availabilityZoneOptions: [],
        volumeTypeOptions:[],
        flavorOptions:[],
        networkOptions:[],
        databaseTypeOptions:[{
          name:"mysql", value:"mysql"
        }, {
          name:"redis", value:"redis"
        }, {
          name:"mongodb", value:"mongodb"
        }],
        databaseVersions:[],
        /*localityOptions:[{
          label: "", value: ""
        }, {
          label: "亲和", value: "affinity"
        }, {
          label: "不亲和", value: "anti-affinity"
        }],*/
        rules: {
          name: [
            {type: 'required', trigger: 'blur change'},
            {type:'onlyLetterNumber_Chinese'},
            {type:'maxSize', value:40}
          ],
          availabilityZone: [
            {type: 'required', trigger: 'blur change'}
          ],
          diskSize: [
            {type: 'required'},
            {type: 'integerNO000'}
          ],
          network: [
            {type: 'required', trigger: 'blur change'}
          ],
          flavor: [
            {type: 'required', trigger: 'blur change'}
          ],
          databaseVersion: [
            {type: 'required', trigger: 'blur change'}
          ]
        }
      }
    },
    created() {
      this.getAvailabilityZone();
      this.getVolumeTypes();
      this.getFlavorList();
      this.getNetworkList();
      this.getDatabaseVersions(this.createDBInstanceForm.databaseType);
    },
    methods: {
      // 获取可用域
      async getAvailabilityZone() {
        let self = this;
        await this.$ajax({
          type:"get",
          url:"api/nova/v2.1/os-availability-zone",
          successFun:(response) => {
            let dataList = response.availabilityZoneInfo;
            self.availabilityZoneOptions = [];
            dataList.forEach(data => {
              if (data.zoneState.available === true) {
                self.availabilityZoneOptions.push(data);
              }
            });
            if (self.availabilityZoneOptions.length > 0) {
              self.createDBInstanceForm.availabilityZone = self.availabilityZoneOptions[0].zoneName;
            }
          }
        });
      },
      // 获取云硬盘类型
      async getVolumeTypes() {
        let self = this;
        let projectId = self.$cookie.get("pid");
        let param = "";
        if (Vue.roleType == 0) {
          param = "?is_public=None";
        }
        await this.$ajax({
          type:"get",
          url:"api/cinderv3/v3/" + projectId + "/types" + param,
          successFun:(response) => {
            let dataList = response.volume_types;
            dataList.forEach((item) => {
              item.title = item.name;
              if (item.name.length>50) {
                item.name = item.name.substring(0, 50) + "...";
              }
            })
            self.volumeTypeOptions = dataList;
          }
        });
      },
      // 获取实例规格
      async getFlavorList() {
        try {
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
            if (data.disk >= 10 && data.name.indexOf("Bare@") < 0) {
              data.detail = data.name + ' (' + data.vcpus + this.$t('db.cores') + ', ' +
                            (data.ram / 1024) + 'GB ' + this.$t('db.memory') + ', ' + data.disk + 'GB ' + this.$t('db.hardDisk') + ')';
              // data.detail = data.name + ' (' + data.vcpus + '核, ' + (data.ram / 1024) + 'GB内存, ' + data.disk + 'GB硬盘)';
              this.flavorOptions.push(data);
            }
          }
        } catch (data) {
        }
      },
      async getNetworkList() {
        try {
          // 查询本项目下的非共享网络
          let response1 = await this.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/networks?not-tags=bm_deploy",
            data:{
              project_id:this.$cookie.get("pid"),
              shared:false
            }
          });
          let dataList1 = response1.networks;
          //  查询所有共享网络
          let response2 = await this.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/networks?not-tags=bm_deploy",
            data:{
              shared:true
            }
          });
          let dataList2 = response2.networks;

          this.networkOptions = dataList1.concat(dataList2);
        } catch (data) {
        }
      },
      // 获取数据库版本
      async getDatabaseVersions(val) {
        let self = this;
        let projectId = self.$cookie.get("pid");
        self.createDBInstanceForm.databaseVersion = "";
        self.databaseVersions = [];
        // mysql redis mongodb
        await this.$ajax({
          type:"get",
          url:"api/trove/v1.0/" + projectId + "/datastores/" + val + "/versions",
          successFun:(response) => {
            let dataList = response.versions;
            self.databaseVersions = dataList;
            if (dataList && dataList.length > 0) {
              self.createDBInstanceForm.databaseVersion = dataList[0].name;
            }
          }
        });
      },
      nextStep() {
        this.$refs.createDBInstanceForm.validate((valid) => {
          if (!valid) {
            return false;
          }
          this.$emit("stepOneDone", this.createDBInstanceForm);
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