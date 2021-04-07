<template>
<div>
  <el-dialog :title="$t('storage.extending')" :visible.sync="visible" :before-close="cancel">
    <el-form ref="expandVolumeForm" :model="expandVolume" :rules="rules" class="me-required-form" label-width="100px" v-loading="saving">
      <el-form-item :label="$t('heat.volume_name')" prop="name">
        <el-input class="col-8" v-model="expandVolume.name" auto-complete="off" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('container.volumeSizeGB')" class="is-required" prop="size">
        <el-row>
          <el-col :span="6">
            <el-input-number v-model="expandVolume.size" :min="oneMinCap" :max="oneMaxCap" size="small"></el-input-number>
            <el-tooltip placement="top" trigger="hover" :content="$t('container.maxSizeOnevolCapa')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
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
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirm" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
   </el-dialog>
 </div>
</template>
<script>
export default {
  name:"VolumeExpend",
  props: ['selectedRowData'],
  data() {
    return {
      expandVolume:{
        name: this.selectedRowData["name"],
        size: 0
      },
      oneMaxCap:131072,
      oneMinCap:parseInt(this.selectedRowData.size),
      oldSize: parseInt(this.selectedRowData.size),
      percentage:0,
      totalSize: '',
      usedSize: 0,
      freeSize: 0,
      visible:true,
      rules:{
        size: [
          {type: 'required', trigger: 'blur change'},
          {type: 'unsignedPositiveInteger'},
          {type: 'min', value: parseInt(this.selectedRowData.size)},
          {type: 'max', value: 131072}
        ]
      },
      saving:false
    }
  },
  mounted() {
    this.getVolumeInfo();
    this.getcountValueLimit();
  },
  methods:{
    getVolumeInfo() {
      let data = {
        rancher_cluster_id: this.selectedRowData.rancher_cluster_id,
        user_id: this.selectedRowData.namespace,
        volume_name: this.selectedRowData.name
      };
      let ret = this.$ajax({
        type: 'post',
        url: "api/cetus/v1/storage/get_volume",
        data: JSON.stringify(data),
        showErrMsg: false,
        successFun:(response) => {
          if (response.result == "success") {
            let size = response.result["metadata"]["volumeSize"];
            let realsize = this.sizeRender(size);
            this.expandVolume.size = parseInt(realsize) + 1;
          } else {
          }
        }
      });
    },
    async getcountValueLimit() {
      let self = this;
      try {
        let ret = await self.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + self.$cookie.get("pid") + "/limits?usages=True"
        });
        let data = ret['limits'].absolute;
        self.analyzeQuotaSizeData(data['maxTotalVolumeGigabytes'], data['totalGigabytesUsed']);
      } catch (data) {
      }
    },
    analyzeQuotaSizeData(maxTotalVolumes, totalVolumesUsed) {
      let self = this;
      self.usedSize = totalVolumesUsed;
      if (maxTotalVolumes == "-1") {
        self.totalSize = this.$t('storage.infinite');
        self.freeSize = this.$t('storage.infinite');
        self.percentage = 0;
      } else {
        let size = maxTotalVolumes;
        self.totalSize = maxTotalVolumes;
        self.freeSize = size - self.usedSize;
        self.percentage = ((self.usedSize/size)*100).toFixed(2) * 1;
        self.oneMaxCap = self.oldSize + self.freeSize;
        if (self.oneMaxCap >= 131072) {
          self.oneMaxCap = 131072;
        }
        self.rules.size = [
          {type: 'required'},
          {type: 'unsignedPositiveInteger'},
          {type: 'min', value:self.oneMinCap},
          {type: 'max', value:self.oneMaxCap}
        ]
      }
    },
    confirm() {
      let self = this;
      this.$refs.expandVolumeForm.validate(async (valid) => {
        if (valid) {
          if (self.totalSize != this.$t('storage.infinite')) {
            if (self.expandVolume.size - self.oldSize + self.usedSize > self.totalSize) {
              self.$message({
                showClose: true,
                message: Vue.t('storage.maxSizeVolCapa', self.oldSize + self.freeSize),
                type: 'warning'
              });
              return;
            }
          }
          if (self.expandVolume.size == self.oldSize) {
            self.$message({
              showClose: true,
              message: Vue.t('storage.capabilityNotChanged'),
              type: 'warning'
            });
            return;
          }
          this.confirmFun();
        } else {
          return false;
        }
      });
    },
    async confirmFun() {
      let self = this;
      let data = {
        rancher_cluster_id: this.selectedRowData.rancher_cluster_id,
        user_id: this.selectedRowData.namespace,
        new_size: this.expandVolume.size,
        volume_name: this.selectedRowData.name
      };
      self.saving = true;
      let ret = self.$ajax({
        type: 'post',
        url: "api/cetus/v1/storage/extend_volume",
        data: JSON.stringify(data),
        log:{
          description:{
            en:"Container volume" + self.selectedRowData.name + " extend " + self.expandVolume.size+"GB",
            zh_cn:"容器卷" + self.selectedRowData.name + "扩容到" + self.expandVolume.size + "GB"
          },
          target:Vue.logTarget.containerVolume
        },
        successFun:(response) => {
          self.saving = false;
          if (response.result == "success") {
            self.$notify({
              message: self.$t('storage.expansionSuccess'),
              type: "success"
            });
            this.$emit("handleAddShow", {});
            this.$emit("refreshData");
          } else {
            self.$notify({
              message: response.result,
              type: "error"
            });
          }
        }
      });
      self.saving = true;
    },
    cancel() {
      this.$emit("handleAddShow", {});
    },
    sizeRender(size) {
      if (!size) {
        return "";
      }
      let realsize = parseInt(size.substring(0, size.length -2 ));
      let sizeunit = size.substring(size.length -2, size.length);
      if (sizeunit == "Ti") {
        realsize = realsize*1024;
      }
      return realsize;
    }
  }
}
</script>
