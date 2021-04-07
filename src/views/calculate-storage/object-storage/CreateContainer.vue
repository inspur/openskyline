<template>
  <el-dialog :title="$t('lang.createContainer')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="createContainerForm" :model="createContainer" label-width="100px" :rules="rules">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="createContainer.name" auto-complete="off"></el-input>
      </el-form-item>
      <!-- <el-form-item label="访问容器公有" prop="public">
        <el-switch v-model ="createContainer.public" on-text="是" off-text="否"></el-switch>
      </el-form-item> -->
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"createContainer",
  data() {
    return {
      createContainer:{
        name:""/*,
        public:""*/
      },
      containersData: [],
      visible:true,
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'onlyLetterNumber_Chinese'},
          {type: 'maxByte', value: 255},
          {type: 'minSize', value: 3}
        ]
      }
    }
  },
  mounted() {
    this.initData();
  },
  methods:{
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    async initData() {
      var self = this;
      self.containersData = [];
      var roleType = Vue.roleType + "";
      var projectId = this.$cookie.get('pid');
      var url = "api/swift/v1/" + projectId + "?format=json";
      if ("2" == roleType || "3" == roleType) { //超级
        url = "api/swift/v1/" + projectId + "?format=json";
      }
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'GET',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        let containers = result;
        for (var i = 0; i < containers.length; i++) {
        let container = containers[i];
        self.containersData.push(container.name);
       }
      } catch (res) {
        self.loading = false;
      }
    },
    confirmFun() {
      this.$refs.createContainerForm.validate(async(valid) => {
        if (valid) {
          var self = this;
          var containersData = self.containersData;
          let name = this.createContainer.name;
          var flag = false;
          for (var i = 0; i < containersData.length; i++) {
              let containerTemp = containersData[i];
              if (containerTemp == name) {
                self.$message({
                  showClose: true,
                  message: this.$t('storage.thereHasSameNameContainer'),
                  type: 'warning'
                });
                flag =true;
              }
           }
        if (!flag) {
          let name = this.createContainer.name;
          var projectId = this.$cookie.get('pid');
          let url = "api/swift/v1/" + projectId + "/" + name;
          let type = "put";
          let msg = this.$t('storage.createContainerSuccess');
          try {
            let ret = await this.$ajax({
              url: url,
              type: type,
              successMsg: msg,
              log:{
                description:{
                  en:"Create container:" + name,
                  zh_cn:"创建存储桶:" + name
                },
                target:Vue.logTarget.storage_object_storage
              },
              successFun: this.successFunction()
            });
          } catch (data) {
            __DEV__ && console.error(data);
          }
          } else {
          return;
        }
        } else {
          return false;
        }
      });
    },
    successFunction() {
      this.$emit("handleAddShow", {});
      this.$emit("onAddRefresh", {});
    },
    changeFlagValue() {}
  }
}
</script>