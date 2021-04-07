<template>
  <div>
  <el-form class="margin-tb20 me-required-form" ref="createTemplateForm" :model="createTemplateForm" :rules=rules label-width="130px">
    <!-- <el-form-item :label="$t('cloudData.pluginname')">
      <span>ambari</span>
    </el-form-item>
    <el-form-item :label="$t('cloudData.pluginversion')">
      <span>2.7</span>
    </el-form-item> -->
    <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
      <el-input class="col-12" v-model="createTemplateForm.name" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item :label="$t('lang.desc')" prop="description">
      <el-input class="col-12" type="textarea"  v-model="createTemplateForm.description"></el-input>
    </el-form-item>
    <el-form-item :label="$t('cloudData.VM_TYPE')" prop="vmType" class="is-required">
      <el-select class="col-12" v-model="createTemplateForm.vmType">
        <el-option v-for="item in flavorOptions" :key="item.id" :label="item.detail" :value="item.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('db.availabilityZone')" prop="availabilityZone">
      <el-select class="col-12" v-model="createTemplateForm.availabilityZone">
        <el-option v-for="item in availabilityZoneOptions" :key="item.zoneName" :label="item.zoneName" :value="item.zoneName"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('cloudData.storagePosition')" prop="storagePosition" class="is-required">
      <el-select class="col-12" v-model="createTemplateForm.storagePosition">
        <el-option v-for="item in storagePositionOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('cloudData.CINDER_EVERY_NODE')" prop="storageNum" class="is-required" v-if="createTemplateForm.storagePosition=='2'">
      <el-input class="col-12" v-model="createTemplateForm.storageNum" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item :label="$t('container.volumeSizeGB')" prop="storageSize" class="is-required" v-if="createTemplateForm.storagePosition=='2'">
      <el-input class="col-12" v-model="createTemplateForm.storageSize" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item :label="$t('storage.volumetype')" prop="volumeType" v-if="createTemplateForm.storagePosition=='2'">
      <el-select class="col-12" v-model="createTemplateForm.volumeType" filterable clearable>
        <el-option v-for="item in volumeTypeOptions" :key="item.id" :label="item.name" :value="item.id" :title="item.name"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('cloudData.VOLUME_DOMAIN')" prop="volumeType" v-if="createTemplateForm.storagePosition=='2'">
      <el-select class="col-12" v-model="createTemplateForm.volumeDomain" filterable clearable>
        <el-option v-for="item in volumeDomainOptions" :key="item.zoneName" :label="item.zoneName" :value="item.zoneName"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="实例的本地卷" prop="volumeToLocal" v-if="createTemplateForm.storagePosition=='2'">
      <el-checkbox v-model="createTemplateForm.volumeToLocal"></el-checkbox>
      <el-tooltip  effect="dark" placement="top">
        <div slot="content">实例和它所挂载的卷将被创建在同一台物理主机上。</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('cloudData.basicImage')" prop="basicImage">
      <el-select class="col-12" v-model="createTemplateForm.basicImage">
        <el-option v-for="item in imageOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('cloudData.floatingipPool')" prop="floatingIps">
      <el-select class="col-12" v-model="createTemplateForm.floatingIps">
        <el-option v-for="item in floatingipOptions" :key="item.id" :label="item.name" :value="item.networkId"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('cloudData.autoConfig')" prop="autoConfig">
      <el-checkbox v-model="createTemplateForm.autoConfig"></el-checkbox>
      <el-tooltip  effect="dark" placement="top">
        <div slot="content">如果已选择，节点组的实例将自动在集群创建的时候被配置。否则你需要手动配置。</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('cloudData.gatewayProxy')" prop="gatewayProxy">
      <el-checkbox v-model="createTemplateForm.gatewayProxy"></el-checkbox>
      <el-tooltip  effect="dark" placement="top">
        <div slot="content">Sahara 将使用这个节点组中的实例以访问其它集群中的实例。</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('lang.public')" prop="ispublic">
      <el-checkbox v-model="createTemplateForm.ispublic"></el-checkbox>
      <el-tooltip  effect="dark" placement="top">
        <div slot="content">如果选择，节点组模板会在所有租户之间共享。</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('base.protected')" prop="isprotected">
      <el-checkbox v-model="createTemplateForm.isprotected"></el-checkbox>
      <el-tooltip  effect="dark" placement="top">
        <div slot="content">如果选择，节点组模板会被保护而不能再修改，除非不再选择这个。</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
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
    name: "CreateContainerClusterStepOne",
    props: ["editTag", "row"],
    data() {
      return {
        createTemplateForm: {
          name:"",
          description: "",
          vmType: "",
          availabilityZone: "",
          storagePosition: "1",
          basicImage: "",
          floatingIps: "",
          autoConfig: true,
          gatewayProxy: false,
          ispublic: false,
          isprotected: false,
          storageNum: "1",
          storageSize: "10",
          volumeType: "",
          volumeDomain: "",
          volumeToLocal: ""
        },
        flavorOptions: [],
        availabilityZoneOptions: [],
        storagePositionOptions: [{
          id: "1",
          name: Vue.t("cloudData.TEMP_STORAGE")
        }, {
          id: "2",
          name: Vue.t("cloudData.CINDER_STORAGE")
        }],
        imageOptions: [],
        floatingipOptions: [],
        volumeTypeOptions: [],
        volumeDomainOptions: [],
        projectId: this.$cookie.get('pid'),
        rules: {
          name: [
            { type: 'required', trigger: 'blur change' },
            { type: 'maxSize', value: 40 },
            { type: 'onlyLetterMinusNumber' }
          ],
          description: [
            {type: 'maxSize', value:255}
          ],
          storagePosition: [
            { type: 'required', trigger: 'blur change' }
          ],
          vmType: [
            { type: 'required', trigger: 'blur change' }
          ]
        }
      }
    },
    created() {
      this.getFlavorList();
      this.getAvailabilityZone();
      this.getImageList();
      this.getFloatingipList();
      this.getVolumeType();
      this.getVolumeDomains();
    },
    mounted() {
      if (this.editTag == "edit") {
        console.log(this.row)
        this.createTemplateForm.name = this.row.name;
        this.createTemplateForm.description = this.row.description;
        this.createTemplateForm.vmType = this.row.flavor_id;
        this.createTemplateForm.availabilityZone = this.row.availability_zone;
        if (this.row.volumes_per_node != 0 && this.row.volumes_size != 0) {
          this.createTemplateForm.storageNum = this.row.volumes_per_node;
          this.createTemplateForm.storageSize = this.row.volumes_size;
          this.createTemplateForm.volumeType = this.row.volume_type;
          this.createTemplateForm.volumeDomain = this.row.volumes_availability_zone;
          this.createTemplateForm.volumeToLocal = this.row.volume_local_to_instance;
          this.createTemplateForm.storagePosition = "2";
        } else {
          this.createTemplateForm.storagePosition = "1";
        }
        this.createTemplateForm.basicImage = this.row.image_id;
        this.createTemplateForm.floatingIps = this.row.floating_ip_pool;
        this.createTemplateForm.autoConfig = this.row.use_autoconfig;
        this.createTemplateForm.gatewayProxy = this.row.is_proxy_gateway;
        this.createTemplateForm.ispublic = this.row.is_public;
        this.createTemplateForm.isprotected = this.row.is_protected;
      }
    },
    methods: {
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
            data.detail = data.name + ' (' + data.vcpus + this.$t('db.cores') + ', ' +
                            (data.ram / 1024) + 'GB ' + this.$t('db.memory') + ', ' + data.disk + 'GB ' + this.$t('db.hardDisk') + ')';
            this.flavorOptions.push(data);
          }
        } catch (data) {
        }
      },
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
          }
        });
      },
      async getImageList() {
        let ajaxParam = {
          type: 'GET',
          url: "api/sahara/v2/"+this.projectId+"/images"
        };
        let ret = await this.$ajax(ajaxParam);
        let dataList = ret.images;
        this.imageOptions = dataList;
      },
      async getFloatingipList() {
        let self = this;
        await this.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/inspur/inspur-network-ip-availabilities?router:external=true&ip_version=4",
          successFun: function (res) {
            let availability = res.inspur_network_ip_availabilities;
            let externalnetOptionsArr = [];
            for (let i = 0; i < availability.length; i++) {
              if (availability[i].subnets.length) {
                const subnets = availability[i].subnets;
                for (let j = 0; j < subnets.length; j++) {
                  if (subnets[j].ips.length) {
                    externalnetOptionsArr.push({
                      id: subnets[j].id,
                      networkId: availability[i].network_id,
                      name: availability[i].network_name + "("+ subnets[j].cidr+")"
                    })
                  }
                }
              }
            }
            self.floatingipOptions = externalnetOptionsArr;
          },
          errorKey: "NeutronError"
        });
      },
      async getVolumeType() {
        let self = this;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: "api/cinderv3/v3/" + this.projectId + "/inspur-types",
            showErrMsg: true
          });
          self.volumeTypeOptions = result['volume_types'];
        } catch (res) {
          self.$message.error( Vue.t('storage.getFailed'));
        }
      },
      async getVolumeDomains() {
       let self = this;
       try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/cinder/v2/' + this.projectId + '/os-availability-zone'
        });
        let list = result['availabilityZoneInfo'];
        let zones = [];
        if (list != null) {
          for (let z = 0; z < list.length; z++) {
            let zone = list[z];
            if (zone['zoneName'] != "internal") {
              zones.push(zone);
            }
          }
        }
        self.volumeDomainOptions = zones;
      } catch (res) {
      }
    },
      nextStep() {
        this.$refs.createTemplateForm.validate((valid) => {
          if (valid) {
            this.$emit("stepOneDone", this.createTemplateForm);
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