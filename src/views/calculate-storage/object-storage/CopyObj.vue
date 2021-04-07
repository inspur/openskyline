<template>
<div>
  <el-dialog :title="$t('storage.copyObj')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="copyObjForm" class="me-required-form" :model="copyObjForm" label-width="100px" :rules="rules">
      <el-form-item :label="$t('storage.instruction')" prop="threshold">
       <span style="color:red" class="formspan">{{$t('storage.carefulOperation')}}</span>
      </el-form-item>
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="copyObjForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.desContainer')" prop="containerName" class="is-required">
        <el-select v-model="copyObjForm.containerName" size="small" @change="containerChange" filterable>
          <el-option v-for="item in containers" :key="item.name" :label="item.name" :value="item.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.desCatalog')" prop="desPathName">
        <el-input class="col-8" v-model="copyObjForm.desPathName" auto-complete="off" :readonly="true" @focus="openPathDialog" ></el-input>
      </el-form-item>
      <!-- <el-form-item>
        <ztree
          ref="deZtree"
          :data="treeData"
          :setting="setting"
          style="position: relative; min-height: 500px;max-height: 800px;"
          v-loading="treeLoading"
          element-loading-text="正在加载数据"
          ></ztree>
      </el-form-item> -->
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
 <get-path ref="getPath" :selectContainerName ="selectContainerName" v-if="pathFlg" @setPath="setPath"></get-path>
 </div>
</template>
<script>
import GetPath from './GetPath'
export default {
  name:"copyObj",
  props: ['containerTempName', 'fileName', 'contentType'],
  data() {
    return {
      copyObjForm:{
        name:"",
        containerName:"",
        desPathName:this.$t('storage.rootPath'),
        desPathid:"default"
      },
      containers: [],
      visible:true,
      treeLoading:false,
      pathFlg:false,
      selectContainerId:"",
      selectContainerName:"",
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          { type: 'onlyLetter_MinusPointBracketNumberChinese' },
          {type: 'maxByte', value: 255}
        ],
        containerName: [
          { type: 'required', trigger: 'blur change' }
        ]
      }
    }
  },
  mounted() {
    var self = this;
    self.loadContainers();
  },
  methods:{
    handleClose(done) {
      this.$emit("handleCopyShow", {});
      done();
    },
    containerChange(value, lable) {
      this.selectContainerName = value;
    },
    openPathDialog() {
      let me = this;
      me.pathFlg = true;
      me.$nextTick(() => {
        me.$refs.getPath.show();
      });
    },
    setPath(id, path) {
      this.copyObjForm.desPathid = id;
      this.copyObjForm.desPathName = path;
    },
    async loadContainers() {
      var self = this;
      var resultData = [];
      var roleType = Vue.roleType + "";
      var projectId = this.$cookie.get('pid');
      var url = "api/swift/v1/" + projectId + "?format=json";
      if ("2" == roleType || "3" == roleType) { //超级
        url = "api/swift/v1/" + projectId + "?format=json";
      }
      try {
        let result = await self.$ajax({
          type: 'GET',
          url: url,
          showErrMsg: true
        });
        resultData = result;
        self.containers = resultData;
      } catch (res) {
      }
    },
    confirmFun() {
      this.$refs.copyObjForm.validate(async(valid) => {
        if (valid) {
          var self = this;
          var str = self.fileName;
          var num = str.lastIndexOf('/');
          if (num>= 0) {
            str = str.substring(0, str) + "/";
          } else {
            str ="";
          }
          let name = self.copyObjForm.name;
          let pathId = self.copyObjForm.desPathid;
          if (pathId !== "default" && self.copyObjForm.desPathName) {
            name = self.copyObjForm.desPathName + name;
          }
          let containerName = self.copyObjForm.containerName;
          name =encodeURI(name);
          containerName = encodeURI(containerName);
          self.containerTempName = encodeURI(self.containerTempName);
          self.fileName = encodeURI(self.fileName);
          var destination = "/" + self.containerTempName + "/" + self.fileName;
          var contentType = self.contentType;
          var projectId = this.$cookie.get('pid');
          let url = "api/swift/v1/" + projectId + "/" + containerName + "/" + name;
          let type = "put";
          let msg = this.$t('storage.copyObjSuccess');
          try {
            let ret = await this.$ajax({
              url: url,
              type: type,
              contentType: contentType,
              headers:{
               "X-Copy-From":destination,
               "Content-length":0
              },
              log:{
                description:{
                  en:"Copy Object:" + decodeURI(name),
                  zh_cn:"复制对象:" + decodeURI(name)
                },
                target:Vue.logTarget.storage_object_storage
              },
              successMsg: msg,
              successFun: this.successFunction()
            });
          } catch (data) {
            __DEV__ && console.error(data);
          }
        } else {
          return false;
        }
      });
    },
    successFunction() {
      this.$emit("handleCopyShow", {});
      this.$emit("onRefresh", {});
    },
    changeFlagValue() {}
  },
  components: {
    GetPath
  }
}
</script>