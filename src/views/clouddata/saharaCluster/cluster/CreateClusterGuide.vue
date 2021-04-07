<template>
  <div>
    <el-dialog :title="$t('cloudData.START_CLUSTER')" :visible.sync="visible" :before-close="cancel" v-dialogDrag>
      <el-form ref="addClusterForm" :model="addClusterForm" :rules="rules" class="me-required-form"  label-width="140px" v-loading="loading">
        <el-form-item :label="$t('container.clusterName')" prop="clusterName" class="is-required">
          <el-input class="col-12" v-model="addClusterForm.clusterName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.desc')" prop="description">
          <el-input class="col-12" v-model="addClusterForm.description" auto-complete="off" type="textarea"></el-input>
        </el-form-item>
        <el-form-item :label="$t('container.clusterTemplate')" prop="clusterTemplate" class="is-required">
          <el-select class="col-12" v-model="addClusterForm.clusterTemplate">
            <el-option v-for="item in clusterTemplateOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('cloudData.CLUSTER_NUMBER')" prop="clusterNum" class="is-required">
          <el-input class="col-12" v-model="addClusterForm.clusterNum"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.image')" prop="basicImage" class="is-required">
          <el-select class="col-12" v-model="addClusterForm.basicImage">
            <el-option v-for="item in basicImageOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('base.network')" prop="network" class="is-required">
          <el-select class="col-12" v-model="addClusterForm.network">
            <el-option v-for="item in networkOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.keypair')" prop="keypair">
          <el-select class="col-12" v-model="addClusterForm.keypair">
            <el-option v-for="item in keypairOptions" :key="item.name" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('lang.public')" prop="ispublic">
          <el-checkbox v-model="addClusterForm.ispublic"></el-checkbox>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">如果选择，集群会在所有租户之间共享。</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('base.protected')" prop="isprotected">
          <el-checkbox v-model="addClusterForm.isprotected"></el-checkbox>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">如果选择，集群会被保护而不能再修改，除非不再选择这个。</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button @click="submitForm" type="primary" :disabled="loading">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "CreateClusterGuide",
  data() {
    return {
      addClusterForm: {
        clusterName: "",
        description: "",
        clusterTemplate: "",
        clusterNum: 1,
        basicImage: "",
        keypair: "",
        network: "",
        ispublic: false,
        isProtected: false
      },
      clusterTemplateOptions: [],
      basicImageOptions: [],
      keypairOptions: [],
      networkOptions: [],
      projectId: this.$cookie.get('pid'),
      visible: true,
      rules: {
        clusterName: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumber' }
        ],
        description: [
          {type: 'maxSize', value:255}
        ],
        clusterTemplate: [
          { type: 'required', trigger: 'blur change' }
        ],
        network: [
          { type: 'required', trigger: 'blur change' }
        ],
        clusterNum: [
          { type: "integer" },
          { type: 'required', trigger: 'blur change' },
          { type: "min", value: 1 },
          { type: "max", value: 1000 }
        ]
      },
      loading: false
    };
  },
  mounted() {
    this.getWorkerList();
    this.getTemplateList();
    this.getImageList();
    this.getKeypairList();
  },
  methods: {
    async getWorkerList() {
      let self = this;
      let url = url = 'api/neutron/v2.0/networks?status=ACTIVE';
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.networkOptions = result['networks'];
      } catch (res) {}
    },
    async getTemplateList() {
      let self = this;
      try {
        let ajaxParam = {
          type: "GET",
          url: "api/sahara/v2/" + self.projectId + "/cluster-templates"
        };
        let ret = await this.$ajax(ajaxParam);
        let dataList = ret.cluster_templates;
        self.clusterTemplateOptions = dataList;
      } catch (res) {
      }
    },
    async getImageList() {
      let self = this;
      let ajaxParam = {
        type: 'GET',
        url: "api/sahara/v2/"+this.projectId+"/images"
      };
      let ret = await this.$ajax(ajaxParam);
      let dataList = ret.images;
      this.basicImageOptions = dataList;
    },
    async getKeypairList() {
      let self = this;
      try {
        let res = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-keypairs',
          showErrMsg: true
        });
        let results = res.keypairs;
        self.keypairOptions = [];
        for (let i=0; i<results.length; i++) {
          let result = results[i];
          self.keypairOptions.push(result["keypair"]);
        }
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    submitForm() {
      let self = this;
      this.$refs.addClusterForm.validate(async valid => {
        if (valid) {
          try {
            let self = this;
            let body = {
              "plugin_name": "ambari",
              "plugin_version": "2.7",
              "cluster_template_id": self.addClusterForm.clusterTemplate,
              "default_image_id": self.addClusterForm.basicImage,
              "description": self.addClusterForm.description,
              "name": self.addClusterForm.clusterName,
              "neutron_management_network": self.addClusterForm.network,
              "count": parseInt(self.addClusterForm.clusterNum)
            };
            if (self.addClusterForm.keypair!= "") {
              body["user_keypair_id"] = self.addClusterForm.keypair;
            }
            this.loading = true;
            let ret = await this.$ajax({
              url: "api/sahara/v2/"+self.projectId+"/clusters",
              data: JSON.stringify(body),
              type: "POST",
              log: {
                description: {
                  en: `Create cluster: ${this.addClusterForm.clusterName}`,
                  zh_cn: `创建集群：${this.addClusterForm.clusterName}`
                },
                target: Vue.logTarget.saharaCluster
              },
              successFun:(response) => {
              }
            });
            this.loading = false;
            this.$emit("handleAddShow", {});
            this.$emit("refreshData", {});
          } catch (data) {
            this.loading = false;
            __DEV__ && console.error(data);
          }
        }
      });
    },
    cancel() {
      this.$emit("handleAddShow", {});
    }
  }
};
</script>
