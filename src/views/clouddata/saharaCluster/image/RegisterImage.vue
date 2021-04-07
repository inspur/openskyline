<template>
  <el-dialog
    :title="$t('cloudData.registerImage')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
      <el-form ref="createHarborForm" :model="createHarborForm" :rules=rules label-width="120px" class="me-required-form" v-loading="loading">
        <el-form-item :label="$t('base.image')" prop="imageName" class="is-required">
          <el-select class="col-12" v-model="createHarborForm.imageName">
            <el-option v-for="item in imageListOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('base.userName')" prop="userName" class="is-required">
          <el-input class="col-12" v-model="createHarborForm.userName" disabled></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.desc')" prop="description">
          <el-input class="col-12" type="textarea" v-model="createHarborForm.description"></el-input>
        </el-form-item>
        <!-- <el-form-item label="">
          <el-tag v-for="tag in tagsList" :key="tag" :closable="true" type="gray">{{tag}}</el-tag>
        </el-form-item>
        <el-form-item :label="$t('cloudData.pluginType')" prop="pluginType" class="is-required">
          <el-select class="col-12" v-model="createHarborForm.pluginType" @change="pluginTypeChange">
            <el-option v-for="item in pluginTypeOptions" :key="item.name" :label="item.name" :value="item.name"></el-option>
          </el-select>
          <el-select class="col-6" v-model="createHarborForm.pluginVersion">
            <el-option v-for="item in pluginVersionOptions" :key="item" :label="item" :value="item"></el-option>
          </el-select>
          <el-button type="default" icon="fa-plus" @click="addToTags1"></el-button>
        </el-form-item>
        <el-form-item :label="$t('container.diyTag')" prop="diytag" class="is-required">
          <el-input class="col-12" v-model="createHarborForm.diytag"></el-input>
          <el-button type="default" icon="fa-plus" @click="addToTags2"></el-button>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button @click="createHarbor" type="primary" :loading="loading">{{$t('lang.confirm')}}</el-button>
      </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "CreateImage",
    data() {
      return {
        createHarborForm: {
          imageName:"",
          userName: "centos",
          description:"",
          pluginType: "",
          pluginVersion: "",
          diytag: ""
        },
        imageListOptions: [],
        projectId: this.$cookie.get('pid'),
        pluginTypeOptions: [],
        pluginVersionOptions: [],
        tagsList: [],
        rules: {
          imageName: [
            {type: 'required'}
          ],
        //   userName: [
        //     {type: 'required'},
        //     { type: 'maxSize', value: 40 }
        //   ],
        //   pluginType: [
        //     {type: 'required'}
        //   ],
        //   pluginVersion: [
        //     {type: 'required'}
        //   ],
          description: [
            {type: 'maxSize', value:255}
          ]
        },
        dialogVisible: true,
        isDisabled: false,
        loading:false
      }
    },
    mouted() {
    },
    methods: {
      show() {
        this.dialogVisible = true;
        this.getImageList();
        // this.getTagList();
      },
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      },
      cancel() {
        let self = this;
        self.dialogVisible = false;
        this.$emit("handleAddShow", {});
      },
      async getImageList() {
        let self = this;
        let url = `api/glance/v2/images/list?limit=99999`;
        let ret = await self.$ajax({
          url: url,
          type: 'post',
          data: JSON.stringify({}),
          showErrMsg: false
        });
        self.imageListOptions = [];
        let images = ret.images;
        for (var i = 0; i < images.length; i++) {
          let image = images[i];
          if (image.tags.indexOf('*') > -1 && image.status !='active') {
            continue;
          }
          self.imageListOptions.push(image);
        }
      },
      async getTagList() {
        let self = this;
        await this.$ajax({
          type: 'get',
          url: "api/sahara/v2/"+this.projectId+"/plugins",
          successFun(result) {
            self.pluginTypeOptions = [];
            self.pluginVersionOptions = [];
            let plugins = result.plugins;
            if (plugins.length > 0) {
              plugins.forEach(function(item) {
                self.pluginTypeOptions.push(item);
              });
              self.createHarborForm.pluginType = plugins[0].name;
              self.pluginVersionOptions = plugins[0].versions;
            }
          }
        });
      },
      pluginTypeChange(val) {
        this.pluginVersionOptions = [];
        this.createHarborForm.pluginVersion = "";
        for (let i=0; i<this.pluginTypeOptions.length; i++) {
          let plugin = this.pluginTypeOptions[i];
          if (val == plugin.name) {
            this.pluginVersionOptions = plugin.versions;
            break;
          }
        }
      },
      addToTags1() {
        let tag1 = this.createHarborForm.pluginType + "_"+ this.createHarborForm.pluginVersion;
        let flg = true;
        for (let i=0; i<this.tagsList.length; i++) {
          if (tag1 == this.tagsList[i]) {
            this.$message.error(Vue.t("cloudDes.IMAGE_TAG_EXISTED"));
            flg = false;
            break;
          }
        }
        if (flg) {
          this.tagsList.push(tag1);
        }
      },
      addToTags2() {
        let tag2 = this.createHarborForm.diytag;
        let flg = true;
        for (let i=0; i<this.tagsList.length; i++) {
          if (tag2 == this.tagsList[i]) {
            this.$message.error(Vue.t("cloudDes.IMAGE_TAG_EXISTED"));
            flg = false;
            break;
          }
        }
        if (flg) {
          this.tagsList.push(tag2);
        }
      },
      createHarbor() {
        this.$refs.createHarborForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            let data = JSON.stringify({
              username: this.createHarborForm.userName,
              description: this.createHarborForm.description
            });
            let self = this;
            this.$ajax({
              type: 'post',
              url: "api/sahara/v2/images/"+this.createHarborForm.imageName,
              data: data,
              log:{
                description:{
                  en:"Add image:" + this.createHarborForm.imageName,
                  zh_cn:"添加云数镜像:" + this.createHarborForm.imageName
                },
                target:Vue.logTarget.saharaImage
              },
              successMsg:this.$t('container.createSuccessMsg'),
              successFun:(result) => {
                self.$ajax({
                  type: 'put',
                  url: "api/sahara/v2/images/"+this.createHarborForm.imageName+"/tags",
                  data:  JSON.stringify({
                    tags: ['ambari', '2.7']
                  }),
                  showErrMsg: false,
                  successFun:() => {
                    self.loading = false;
                    self.$emit("handleAddShow", {});
                    self.$emit("refreshData");
                  },
                  errFun:(err) => {
                    self.loading = false;
                  }
                });
              },
              errFun:(err) => {
                self.loading = false;
              }
            });
          } else {
            return false;
          }
        });
      }
    }
  }
</script>
