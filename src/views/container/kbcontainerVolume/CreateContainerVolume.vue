<template>
  <el-dialog :title="$t('container.createVolume')" :visible.sync="dialogVisible" :before-close="handleClose">
    <div class="text-regular module-desc">
      <span>{{$t('container.volumesupportTips')}}</span><br>
      <span>{{$t('container.ironicTips')}}</span>
    </div>
    <div class="divider clearfix"></div> 
    <el-form ref="createVolumeForm" :model="createVolumeForm" :rules=rules label-width="100px" class="me-required-form" v-loading="saving">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-12" v-model="createVolumeForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('container.cluster')" prop="k8sClusterId" class="is-required">
        <el-select class="col-12" v-model="createVolumeForm.k8sClusterId" @change="clusterChange">
          <el-option v-for="item in k8sClusterOptions" :key="item.uuid" :label="item.name" :value="item.uuid"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('container.storageProvider')" prop="storageProvider" class="is-required">
        <el-select class="col-12" v-model="createVolumeForm.storageProvider">
          <el-option v-for="item in storageProviderOptions" :key="item.value" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.volumetype')" prop="volumeType">
        <el-select class="col-12" v-model="createVolumeForm.volumeType" size="small" filterable clearable>
          <el-option v-for="item in volumeTypeList" :value="item.name" :key="item.id" :label="item.name.length > 50?item.name.substring(0, 50):item.name" :title="item.name.length > 50?item.name:''">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('container.volumeSizeGB')" class="is-required" prop="volumeSize">
        <!-- <el-input v-model="createVolumeForm.volumeSize" class="col-12"></el-input> -->
        <el-row>
          <el-col :span="6">
            <el-input-number v-model="createVolumeForm.volumeSize" :min="1" :max="oneMaxCap" size="small" @change="numberToInt"></el-input-number>
          </el-col>
          <el-col :span="15">
            <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage" status="success" v-bind:style="{top:'10px'}"></el-progress>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="30">
            <div class="sub-tittle">{{$t('storage.total')}}{{totalSize}}GB，{{$t('storage.used')}}{{usedSize}}GB，{{$t('storage.surplus')}}{{freeSize}}GB</div>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item :label="$t('container.volumeNumber')" class="is-required" prop="volumeNumber">
        <!-- <el-input v-model="createVolumeForm.volumeNumber" class="col-12"></el-input> -->
        <el-row>
          <el-col :span="6">
            <el-input-number v-model="createVolumeForm.volumeNumber" :min="1" :max="maxVolumeCount"  size="small"></el-input-number>
          </el-col>
          <el-col :span="15">
            <el-progress :text-inside="true" :stroke-width="18" :percentage="countpercentage" status="success" v-bind:style="{top:'10px'}"></el-progress>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="30">
            <div class="sub-tittle">{{$t('storage.total')}}{{totalCount}}{{$t('storage.pc')}}，{{$t('storage.used')}}{{inUsedCount}}{{$t('storage.pc')}}，{{$t('storage.surplus')}}{{freeCount}}{{$t('storage.pc')}}</div>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="createVolume" type="primary" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "CreateContainerVolume",
    data() {
      return {
        createVolumeForm: {
          name:"",
          volumeSize: 1,
          rbd_size: 0,
          k8sClusterId:"",
          rancher_cluster_id:"",
          user_id:Vue.userId,
          volumeType:"",
          storageProvider:"",
          volumeNumber:"1"
        },
        k8sClusterOptions:[],
        storageProviderOptions:[],
        volumeTypeList:[],
        unitRbdSize: 'G',
        oneMaxCap:128*1024,
        percentage:0,
        countpercentage:0,
        totalCount: 0,
        inUsedCount: 0,
        freeCount: 0,
        maxVolumeCount: 100,
        totalSize: '',
        usedSize: 0,
        freeSize: 0,
        rules: {
          name: [
            {type: 'required'},
            {type: 'containerApplicationNameRule'},
            {type: 'maxSize', value:40}
          ],
          volumeSize: [
            {type: 'required'},
            {type: 'unsignedPositiveInteger'},
            {type: 'min', value:1},
            {type: 'max', value:128*1024}
          ],
          k8sClusterId: [
            {type: 'required'}
          ],
          storageProvider: [
            {type: 'required'}
          ],
          volumeNumber: [
            {type: 'required'},
            {type: 'unsignedPositiveInteger'},
            {type: 'min', value:1},
            {type: 'max', value:100}
          ]
        },
        dialogVisible: true,
        saving:false
      }
    },
    mounted() {
       this.getK8sClusterList();
       this.loadVolumeType();
       this.getcountValueLimit();
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
      clusterChange(value) {
        this.createVolumeForm.storageProvider = "";
        this.storageProviderOptions = [];
        for (let i=0; i<this.k8sClusterOptions.length; i++) {
          if (value == this.k8sClusterOptions[i]['uuid']) {
            this.createVolumeForm.rancher_cluster_id = this.k8sClusterOptions[i]['rancher_cluster_id'];
            this.getStorageProvider();
          }
        }
      },
      async getStorageProvider() {
        let me = this;
        let param = {
          csi_type: "cinder",
          project_id: me.$cookie.get('pid'),
          rancher_cluster_id: me.createVolumeForm.rancher_cluster_id,
          cluster_id: me.createVolumeForm.k8sClusterId
        };
        me.storageProviderOptions = [];
        let ajaxParam = {
          type: 'POST',
          url: "api/cetus/v1/csi/list_provider",
          data: JSON.stringify(param)
        };
        let ret = await me.$ajax(ajaxParam);
        if (ret.code == "200") {
          let dataList = ret.result;
          for (let key in dataList) {
            let replicas = dataList[key];
            if (replicas["readyReplicas"] == replicas["replicas"]) {
               me.storageProviderOptions.push({value:replicas["name"], name: replicas["name"]});
            }
          }
        }
      },
      async loadVolumeType() {
        let self = this;
        self.volumeTypeList = [{ name: "", id: "None" }];
        let projectId = self.$cookie.get("pid");
        let url = "api/cinderv3/v3/" + self.$cookie.get("pid") + "/inspur-types?is_public=None";
        if ("2" == roleType || "3" == roleType) {
          url = "api/cinderv3/v3/" + projectId + "/inspur-types";
        }
        try {
          let result = await self.$ajax({
            type: "get",
            url: url,
            showErrMsg: false
          });
          let typeFullOptions = result['volume_types'];
          self.volumeTypeList = typeFullOptions.filter(function(item) {
            return item["extra_specs"]["multiattach"] != "<is> True";
          });
        } catch (res) {
        }
      },
      async getcountValueLimit() {
        let self = this;
        try {
          let ret = await self.$ajax({
            type: 'get',
            url: "api/cinderv3/v3/" + self.$cookie.get("pid") + "/limits?usages=True"
          });
          let data = ret['limits'].absolute;
          self.analyzeQuotaCountData(data['maxTotalVolumes'], data['totalVolumesUsed']);
          self.analyzeQuotaSizeData(data['maxTotalVolumeGigabytes'], data['totalGigabytesUsed']);
        } catch (data) {
        }
      },
      analyzeQuotaCountData(maxTotalVolumes, totalVolumesUsed) {
        let self = this;
        self.inUsedCount = totalVolumesUsed;
        if (maxTotalVolumes == "-1") {
          self.totalCount = this.$t('storage.infinite');
          self.freeCount = this.$t('storage.infinite');
          self.countpercentage = 0;
          self.maxVolumeCount = 100;
        } else {
          self.totalCount = maxTotalVolumes;
          self.freeCount = self.totalCount - self.inUsedCount;
          self.maxVolumeCount = self.freeCount;
          self.countpercentage = ((self.inUsedCount/maxTotalVolumes) * 100).toFixed(2) * 1;
          self.rules.volumeNumber = [
            {type: 'required'},
            {type: 'unsignedPositiveInteger'},
            {type: 'min', value:1},
            {type: 'max', value:self.freeCount}
          ]
        }
      },
      analyzeQuotaSizeData(maxTotalVolumes, totalVolumesUsed) {
        let self = this;
        self.usedSize = totalVolumesUsed;
        if (maxTotalVolumes == "-1") {
          self.totalSize = this.$t('storage.infinite');
          self.freeSize = this.$t('storage.infinite');
          self.oneMaxCap = 128*1024;
          self.percentage = 0;
        } else {
          let size = maxTotalVolumes;
          self.totalSize = maxTotalVolumes;
          self.freeSize = size - self.usedSize;
          if (self.freeSize > 131072) {
            self.oneMaxCap = 131072;
          } else {
            self.oneMaxCap = self.freeSize;
          }
          self.percentage = ((self.usedSize/size)*100).toFixed(2) * 1;
          self.rules.volumeSize = [
            {type: 'required'},
            {type: 'unsignedPositiveInteger'},
            {type: 'min', value:1},
            {type: 'max', value:self.oneMaxCap}
          ]
        }
      },
      show() {
        this.dialogVisible = true;
      },
      unitType() {
        var self = this;
        self.createVolumeForm.volumeSize = '';
      },
      numberToInt(value) {
        return Math.floor(value);
      },
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      },
      cancel() {
        var self = this;
        self.dialogVisible = false;
        this.$emit("handleAddShow", {});
      },
      createVolume() {
        let self = this;
        self.$refs.createVolumeForm.validate((valid) => {
          if (valid) {
            if (self.totalSize != self.$t('storage.infinite')) {
              if (self.totalSize < self.createVolumeForm.volumeNumber * self.createVolumeForm.volumeSize + self.usedSize) {
                self.$message({
                  showClose: true,
                    message: self.$t('storage.freeCapabilityNotEnough'),
                    type: 'warning'
                  });
                return false;
              }
            }
            self.saving = true;
            if (self.createVolumeForm.volumeNumber == "1") {
              let data = {
                rancher_cluster_id: this.createVolumeForm.rancher_cluster_id,
                user_id: Vue.userId,
                volume_size: this.createVolumeForm.volumeSize,
                storage_provider: this.createVolumeForm.storageProvider,
                volume_type: this.createVolumeForm.volumeType,
                volume_name: this.createVolumeForm.name
              };
              if (this.createVolumeForm.volumeType == "None") {
                delete data.volume_type;
              }
              let ret = this.$ajax({
                type: 'post',
                url: "api/cetus/v1/storage/create_volume",
                data: JSON.stringify(data),
                log:{
                  description:{
                    en:"Add container volume:" + this.createVolumeForm.name,
                    zh_cn:"创建容器卷:" + this.createVolumeForm.name
                  },
                  target:Vue.logTarget.containerVolume
                },
                // successMsg:this.$t('container.createSuccessMsg'),
                successFun:(response) => {
                  if (response.result == "success") {
                    self.$notify({
                      message: this.$t('container.createSuccessMsg'),
                      type: "success"
                    });
                    this.$emit("handleAddShow", {});
                    this.$emit("refreshData");
                  } else {
                    this.saving = false;
                    self.$notify({
                      message: response.result,
                      type: "error"
                    });
                  }
                },
                errFun() {
                  this.saving = false;
                }
              });
            } else {
              for (let i=0; i<self.createVolumeForm.volumeNumber; i++) {
                let data = {
                  rancher_cluster_id: this.createVolumeForm.rancher_cluster_id,
                  user_id: Vue.userId,
                  volume_size: this.createVolumeForm.volumeSize,
                  storage_provider: this.createVolumeForm.storageProvider,
                  volume_type: this.createVolumeForm.volumeType,
                  volume_name: this.createVolumeForm.name + "-" + i
                };
                if (this.createVolumeForm.volumeType == "None") {
                  delete data.volume_type;
                }
                self.$ajax({
                  type: 'post',
                  url: "api/cetus/v1/storage/create_volume",
                  data: JSON.stringify(data),
                  log:{
                    description:{
                      en:"Add container volume:" + this.createVolumeForm.name + "-" + i,
                      zh_cn:"创建容器卷:" + this.createVolumeForm.name + "-" + i
                    },
                    target:Vue.logTarget.containerVolume
                  },
                  // successMsg:this.$t('container.createSuccessMsg'),
                  successFun:(response) => {
                    if (response.result == "success") {
                      self.$notify({
                        message:  this.createVolumeForm.name + "-" + i + Vue.t("container.createSuccessMsg"),
                        type: "success"
                      });
                    } else {
                      this.saving = false;
                      self.$notify({
                        message: response.result,
                        type: "error"
                      });
                    }
                  },
                  errFun() {
                    this.saving = false;
                  }
                });
                if (i == parseInt(self.createVolumeForm.volumeNumber) - 1) {
                  self.$emit("handleAddShow", {});
                  self.$emit("refreshData");
                }
              }
            }
          } else {
            return false;
          }
        });
      }
    }
  }
</script>

