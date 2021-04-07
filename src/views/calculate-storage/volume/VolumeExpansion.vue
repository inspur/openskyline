<template>
  <el-dialog :title="dialogTittle" :visible.sync="visible" v-loading="loading">
    <el-form ref="expandVolumeForm" label-position="left" :model="expandVolume" label-width="100px" :rules="rules" class="me-required-form">
      <el-form-item :label="$t('lang.name')" prop="count">
        <el-input class="col-8" v-model="expandVolume.name" auto-complete="off" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.capabilityGB')" class="is-required">
        <el-row>
          <el-col :span="6">
            <el-form-item prop="size">
            <el-input v-model="expandVolume.size" size="small" style="width:80%;"></el-input>
            <el-tooltip placement="top" trigger="hover" :content="$t('storage.maxSizeOnevolCapa')">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="15" v-show="isUserFlag">
            <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage" :status="proStatus" v-bind:style="{top:'10px'}"></el-progress>
          </el-col>
        </el-row>
        <el-row v-show="isUserFlag">
          <el-col :span="15">
            <div class="sub-tittle">{{$t('storage.extendingInfo', totalSize, usedSize, reservedSize, freeSize)}}</div>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirm" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"expandVolume",
  props: ['detailVolume', "dialogTittle"],
  data() {
    return {
      expandVolume:{
        projectId: "",
        volumeId: "",
        name:"",
        size: 0,
        status: ""
      },
      oldSize: 0,
      totalSize: 0,
      usedSize: 0,
      freeSize: 0,
      reservedSize:0,
      totalCapacity: 1,
      isInfinite: false,
      maxCap: 131072,
      maxCapValue: 0,
      minCapValue: 0,
      visible:false,
      saving: false,
      isUserFlag: "",
      canSubmited: true,
      rules:{
        size: [
          {type: 'required', trigger: 'blur change'},
          {type: 'unsignedPositiveInteger'},
          {type: 'min', value: 1},
          {type: 'max', value: 131072}
        ]
      },
      percentage:50,
      proStatus:"success",
      loading:false
    }
  },
  mounted() {
    this.expansionTitle = (Vue.roleType + "" == "3") ? this.$t('storage.applyExpansion') : (this.detailVolume.status === "in-use") ? this.$t('storage.onlineExtending') : this.$t('storage.offlineExtending');
    //查询一下云硬盘是否有快照，有的话不允许删除。
    this.canSubmited = true;
 },
  methods:{
    show() {
      this.visible = true;
      this.saving = false;
      this.getCountValue();
      this.isUserFlag = this.isUser();
    },
    hide() {
      this.visible = false;
    },
    isUser() {
      var roleType = Vue.roleType + "";
      if ("3" == roleType) {
        return false;
      }
      return true;
    },
    confirm() {
     this.$refs.expandVolumeForm.validate(async (valid) => {
        if (valid) {
         this.confirmFun();
        } else {
          return false;
        }
      });
    },
    async qryVolhasSnapsolt(volumeId) {
      let self = this;
      let Pid = self.$cookie.get('pid');
      var roleType = Vue.roleType + "";
      let url = "api/cinderv3/v3/" + Pid + "/snapshots/detail?all_tenants=True&";
      if ("0" != roleType) {
        url = "api/cinderv3/v3/" + Pid + "/snapshots/detail?";
      }
      url = url + "volume_id=" + volumeId;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          headers: {
            "OpenStack-API-Version": "volume 3.45"
          }
        });
        let snapshotsData = result['snapshots'];
        if (snapshotsData.length > 0) {
          self.canSubmited = false;
          self.$message({
            showClose: true,
            message: Vue.t('storage.cantExpansion'),
            type: 'error'
          });
        } else {
          self.canSubmited = true;
        };
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    async confirmFun() {
      let self = this;
      let projectId = self.$cookie.get('pid');
      var newSize = self.expandVolume.size;
      if (!self.canSubmited) {
        self.$message({
          showClose: true,
          message: Vue.t('storage.cantExpansion'),
          type: 'error'
        });
        return;
      }
      if (self.oldSize == newSize) {
        self.$message({
              showClose: true,
              message: Vue.t('storage.capabilityNotChanged'),
              type: 'warning'
            });
            return;
      } else if (self.oldSize > newSize) {
        self.$message({
              showClose: true,
              message: Vue.t('storage.notAllowExpansion'),
              type: 'warning'
            });
            return;
      } else if (newSize > self.maxCapValue) {
        self.$message({
              showClose: true,
              message: Vue.t('storage.maxSizeVolCapa', self.maxCapValue),
              type: 'warning'
            });
            return;
      } else {
        self.saving = true;
        var applyData = {};
        var body = {"os-extend": {"new_size": newSize}};
        //R版本无os-extend-live扩展
        // if (self.expandVolume.status === "in-use") {
        //   body = {"os-extend-live": {"new_size": newSize}};
        // }
        body = JSON.stringify(body);
        var url = "api/cinderv3/v3/" + self.$cookie.get("pid") + "/volumes/" + self.expandVolume.volumeId + "/action";
        var msg = self.$t('storage.expansionSuccess');
        var logContent = {};
        logContent = {
             "description": {
                  en:self.expansionTitle + " : " + self.detailVolume.name + "(" + self.expandVolume.volumeId + ")",
                  zh_cn:self.expansionTitle + " : " + self.detailVolume.name + "(" + self.expandVolume.volumeId + ")"
                },
                "target": Vue.logTarget.storage_volume
         };
        if (Vue.roleType + "" == "3") {
          url = "api/leo/v1/order/create_order";
          msg = self.$t('storage.applyExpansionSuccess');
          applyData = JSON.stringify({"volume_id":self.expandVolume.volumeId, "volume_name":self.expandVolume.name, "os-extend": {"new_size": newSize}});
          applyData = {"op_desc":"", "applicant_id":Vue.userId, "project_id":projectId, "resource_type":"VOLUME.UPDATE", "order_data":applyData};
          applyData = JSON.stringify(applyData);
          logContent = {
             "description": {
                  en:"Apply expansion volume:" + self.detailVolume.name + "(" + self.expandVolume.volumeId + ")",
                  zh_cn:"申请扩容云硬盘:" + self.detailVolume.name + "(" + self.expandVolume.volumeId + ")"
                },
                "target": Vue.logTarget.storage_volume
         };
        }
        try {
          let ret = await self.$ajax({
            url: url,
            data: Vue.roleType + "" == "3"?applyData:body,
            type: 'post',
            headers: {
            "OpenStack-API-Version": "volume 3.42"
            },
            showErrMsg: true,
            successFun: function(data) {
                self.$message({
                  showClose: true,
                  message: msg,
                  type: 'success'
                });
                self.loading = false;
                self.visible=false;
                self.$emit("handleShow", {});
                self.$emit("onRefresh", {});
              },
              errFun: function() {
                self.loading = false;
                self.saving = false;
              },
              log:logContent
          });
        } catch (data) {
          self.loading = false;
          self.saving = false;
          __DEV__ && console.error(data);
        }
      }
    },
    /**
     *TODO:做一下转换，求一下容量的最大值
     *currentSzie当前云硬盘的容量
     *freeSzie当前项目剩余可用空间
     */
    calcMaxCap(currentSize, freeSzie) {
      if (self.isInfinite) {
        return this.maxCap;
      }
      return currentSize + freeSzie < this.maxCap ? currentSize + freeSzie : this.maxCap;
    },
    async getCountValue() {
      var self = this;
      var projectId = self.detailVolume['os-vol-tenant-attr:tenant_id'];
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + self.$cookie.get("pid") + "/os-quota-sets/" + projectId + "?usage=true"
        });
        //配额及容量使用状况
        var data = ret['quota_set'].gigabytes;
        self.reservedSize = data['reserved'];
        self.usedSize = data['in_use'];
        var size = data['limit'];
        if (size == -1 ) {
           self.isInfinite = false;
           self.totalSize = this.$t('storage.infinite');
           self.freeSize = this.$t('storage.infinite');
           self.percentage = 0;
        } else {
           self.isInfinite = true;
           self.totalSize = size;
           self.freeSize = self.totalSize - self.usedSize - self.reservedSize;
           self.percentage = (((self.usedSize + self.reservedSize)/size)*100).toFixed(2) * 1;
        }
        self.minCapValue = this.oldSize;//最小值为扩容前的云硬盘的size。
        self.maxCapValue = self.calcMaxCap(self.minCapValue, self.freeSize);
        console.log(self.minCapValue + "--"+self.maxCapValue);
        this.proStatus = self.percentage >= 90 ? "exception" : "success";
      } catch (ret) {
        self.loading = false;
      }
    }
  }
}
</script>
<style scoped>
.el-form-item {
  margin-bottom: 10px;
}
</style>