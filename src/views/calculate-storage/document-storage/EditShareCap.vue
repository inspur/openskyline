<template>
  <el-dialog :title="$t('storage.editShareStorageCapability')" :visible.sync="visible" :before-close="cancelFun">
    <el-form ref="editShareCapForm" class="me-required-form" :model="editShareCapData" label-position="right" label-width="80px" :rules="rules">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="editShareCapData.name" auto-complete="off" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.capabilityGB')" prop="cap" class="is-required">
        <el-row>
          <el-col :span="5">
             <el-input-number v-model="editShareCapData.cap" :min="1" :max="999999" size="small" ></el-input-number>
          </el-col>
          <el-col :span="12">
            <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage" :status="proStatus" v-bind:style="{top:'8px'}"></el-progress>
          </el-col>
          <el-col :span="12">
            <div class="sub-tittle">{{$t('storage.total')}}{{quota.totalGB}}GB，{{$t('storage.haveUsed')}}{{quota.in_useGB}}GB
              <el-tooltip placement="top" trigger="hover" :content="$t('storage.docExpandTip')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </div>
          </el-col>
        </el-row>
        <!-- <el-slider v-model="size" show-input v-bind:style="widthStyle" @change="sizeChange"></el-slider> -->
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelFun">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"editShareCap",
  props: ["editShareData"],
  data() {
    return {
      editShareCapData:{
        name:"",
        cap:0,
        oldCap:0
      },
      quota: {
        totalGB:0,
        in_useGB:0,
        totalC:0,
        in_useC:0
      },
      size:2,
      proStatus:"success",
      percentage:50,
      visible:false,
      saving: false,
      rules: {
        cap: [
          { type: 'required', trigger: 'blur change' },
          { type: 'integer' }
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
  },
  methods:{
    initDialog() {
      var self = this;
      self.visible = true;
    },
    show() {
      this.visible = true;
      this.loadProjectQuota();
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      let self = this;
      //容量判断
      if (-1 != self.quota.totalGB) {
        if (self.editShareCapData.cap < self.editShareCapData.oldCap) {
          this.$message({
            showClose: true,
            message: this.$t('storage.cannotSubmitExpansion'),
            type: 'warning'
          });
          return;
        }
        if (self.quota.totalGB < (self.quota.in_useGB + self.editShareCapData.cap - self.editShareCapData.oldCap)) {
          this.$message({
            showClose: true,
            message: this.$t('storage.freeCapabilityNotEnough'),
            type: 'warning'
          });
          return;
        }
      }
      self.$refs.editShareCapForm.validate(async(valid) => {
        if (valid) {
          var Pid = this.$cookie.get('pid');
          var size = self.editShareCapData.cap;
          var oldSize = self.editShareCapData.oldCap;
          var url = "api/manila/v2/" + Pid+ "/shares/"+self.editShareData.id + "/action";
          var body = {};
          if (size > oldSize) {
            //变大了
            body = {"extend":{"new_size": size}};
          } else if (size < oldSize) {
            //变小了
            body = {"shrink":{"new_size": size}};
          } else {
            //没有变化
            this.$emit("handleShow", {});
            this.$emit("onRefresh", {});
            return;
          }
          body = JSON.stringify(body);
          self.saving = true;
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: 'post',
              // successMsg: "成功编辑云硬盘名称描述！",
              errorKey: "message",
              log:{
                description:{
                  en:"Edit storage share " + this.editShareCapData.name + "capacity to:" + size,
                  zh_cn:"修改文件存储"+ this.editShareCapData.name + "容量到" + size
                },
                target:Vue.logTarget.storage_share
              }
            });
            this.$emit("handleShow", {});
            this.$emit("onRefresh", {});
          } catch (data) {
            self.saving = false;
            __DEV__ && console.error(data);
          }
        } else {
            return false;
        }
      });
    },
    async loadProjectQuota() {
       var self = this;
      self.loading = true;
      var roleType = Vue.roleType + "";
      //var url = "api/manila/v2/" + this.$cookie.get("pid") + "/os-quota-sets/" + this.$cookie.get("pid") + "/detail";
      var url = "api/manila/v2/" + this.$cookie.get("pid") + "/limits";
      if ("0" == roleType) {

      }
       try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        var quotaSet = result['limits'].absolute;
        self.quota.totalGB = quotaSet.maxTotalShareGigabytes;
        self.quota.in_useGB = quotaSet.totalShareGigabytesUsed;
        self.quota.totalC = quotaSet.maxTotalShares;
        self.quota.in_useC = quotaSet.totalSharesUsed;

        //容量判断
        var p = 0;
        if (-1 == self.quota.totalGB) {
          p = 0;
          this.percentage = 0;
          self.quota.totalGB = this.$t('storage.infinite');
          this.maxCapacity = self.quota.totalGB;
        } else {
          p = (parseFloat(self.quota.in_useGB/self.quota.totalGB)*100).toFixed(2);
          this.maxCapacity = self.quota.totalGB - self.quota.in_useGB;
        }
        this.proStatus = p > 100 ? "exception" : "success";
        this.percentage = p > 100 ? 100 : p;
        //数量判断
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    cancelFun() {
      this.$emit("handleShow");
    },
    changeFlagValue() {}
  }
}
</script>