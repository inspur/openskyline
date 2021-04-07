<template>
  <el-dialog :title="$t('设置桶公开访问')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="createContainerForm" :model="createContainer" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item label="公有" prop="public">
        <el-switch v-model="createContainer.public" on-text="是" off-text="否"></el-switch>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "createContainer",
  props: ["containerTempName"],
  data() {
    return {
      createContainer: {
        public: false
      },
      loading:false,
      headStr: ".r:*,.rlistings",
      containersData: [],
      visible: true
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    handleClose() {
      this.$emit("hide");
    },
    async initData() {
      var self = this;
      var projectId = this.$cookie.get('pid');
      var url = "api/swift/v1/" + projectId + "/" + self.containerTempName + "?format=json";
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'GET',
          url: url,
          showErrMsg: true,
          successFun: function (res, xhr) {
            let head = xhr.getResponseHeader("X-Container-Read");
            if (head && (head.indexOf(self.headStr) >= 0)) {
              self.createContainer.public = true;
            }
            self.loading = false;
          },
          errFun: function () {
            self.loading = false;
          }
        });
      } catch (res) {
        self.loading = false;
      }
    },
    confirmFun() {
      var self = this;
      self.loading = true;
      var url = "api/swift/v1/" + this.$cookie.get('pid') + "/" + self.containerTempName;
      try {
        this.$ajax({
          url: url,
          type: "POST",
          successMsg: "设置成功！",
          headers: {
            "X-Container-Read": self.createContainer.public?self.headStr:'""'
          },
          log: {
            description: {
              en: "Container:" + self.containerTempName + "set public:" + (self.createContainer.public?"yes":"no"),
              zh_cn: "存储桶:" + self.containerTempName + "设置公开访问:" + (self.createContainer.public?"是":"否")
            },
            target: Vue.logTarget.storage_object_storage
          },
          successFun: function () {
            self.loading = false;
            self.$emit("hide");
            self.$emit("refresh");
          },
          errFun: function () {
            self.loading = false;
          }
        });
      } catch (data) {
      }
    }
  }
}
</script>