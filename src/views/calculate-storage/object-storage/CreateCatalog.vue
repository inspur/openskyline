<template>
  <el-dialog :title="$t('storage.createCatalog')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="createCatalogForm" :model="createCatalog" label-width="100px" :rules="rules">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="createCatalog.name" auto-complete="off"></el-input>
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
  name:"createCatalog",
  props: ['containerTempName', 'path'],
  data() {
    return {
      createCatalog:{
        name:""
      },
      objectsData: [],
      visible:true,
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'onlyLetterNumberChinese'},
          {type: 'maxByte', value: 255}
        ]
      }
    }
  },
  mounted() {
    this.initData();
  },
  methods:{
    handleClose(done) {
      this.$emit("handleAddCatalogShow", {});
      done();
    },
    async initData() {
      var self = this;
      self.objectsData = [];
      var containerTempName = self.containerTempName;
      var roleType = Vue.roleType + "";
      var projectId = this.$cookie.get('pid');
      var url = "api/swift/v1/" + projectId + "/" +containerTempName+"?path=&format=json";
      if ("2" == roleType || "3" == roleType) { //超级
        url = "api/swift/v1/" + projectId + "/" +containerTempName+"?path=&format=json";
      }
      if (self.path) {
         url = "api/swift/v1/" + projectId + "/" +containerTempName+"?path="+self.path+"&format=json";
      }
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'GET',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        let objects = result;
        for (var i = 0; i < objects.length; i++) {
          let objectTemp = objects[i];
          if (objectTemp.hasOwnProperty('subdir')) {
            let name = objectTemp.subdir;
            name = name.substring(0, name.length-1)
            self.objectsData.push(name);
          }
       }
      } catch (res) {
      }
    },
    confirmFun() {
      this.$refs.createCatalogForm.validate(async(valid) => {
        if (valid) {
          var self = this;
          var objectsData = self.objectsData;
          let name = this.createCatalog.name;
          var projectId = this.$cookie.get('pid');
          if (self.path) {
           name = self.path + name;
           let arr =self.path.split("/");
           if (arr.length>=6) {
            self.$message({
                  showClose: true,
                  message: Vue.t('storage.catalogsNotMoreThanFiveLayers'),
                  type: 'warning'
                });
            return;
           }
          }
          var flag = false;
          for (var i = 0; i < objectsData.length; i++) {
              let objectTemp = objectsData[i];
              if (objectTemp == name) {
                self.$message({
                  showClose: true,
                  message: Vue.t('storage.thereHasSameNameCatalog'),
                  type: 'warning'
                });
                flag =true;
              }
           }
           if (!flag) {
             let containerName = self.containerTempName;
             let url = "api/swift/v1/" + projectId + "/" + containerName + "/" + name+ "/";
             let type = "put";
             let msg = this.$t('storage.createCatalogSuccess');
          try {
            let ret = await this.$ajax({
              url: url,
              type: type,
              successMsg: msg,
              successFun: this.successFunction(),
              log:{
                      description:{
                        en:"Container:"+containerName+" create catalog:"+name,
                        zh_cn:"存储桶:"+containerName+" 创建目录:"+name
                      },
                      target:Vue.logTarget.storage_object_storage
                    }
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
      this.$emit("handleAddCatalogShow", {});
      this.$emit("onRefresh", {});
    },
    changeFlagValue() {}
  }
}
</script>