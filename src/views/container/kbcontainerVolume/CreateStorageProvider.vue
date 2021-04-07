<template>
  <div>
    <el-dialog :title="$t('container.addStorageProvider')" :visible.sync="visible" :before-close="cancel" v-dialogDrag>
      <el-form ref="addNodeForm" :model="addNodeForm" :rules="rules" class="margin-tb20 me-required-form" v-loading="saving" label-width="120px">
        <el-form-item :label="$t('container.cluster')" prop="k8sClusterId" class="is-required">
          <el-select class="col-12" v-model="addNodeForm.k8sClusterId" @change="clusterChange">
            <el-option v-for="item in k8sClusterOptions" :key="item.uuid" :label="item.name" :value="item.uuid"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('lang.type')" class="is-required" prop="csi_type">
          <el-select class="col-12" v-model="addNodeForm.csi_type" size="small" filterable>
            <el-option label="cinder" value="cinder" key="cinder"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button @click="submitForm" type="primary" :loading="saving">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import uuid from 'uuid';
export default {
  name: "CreateStorageProvider",
  data() {
    return {
      addNodeForm: {
        csi_type: "cinder",
        userName: Vue.userName,
        k8sClusterId:"",
        rancher_cluster_id:""
      },
      k8sClusterOptions: [],
      clusterName:"",
      visible: true,
      saving: false,
      rules: {
        k8sClusterId: [
          {type: 'required', trigger: 'blur change'}
        ]
      },
      strategy:{
        password_regex: '',
        password_regex_description: ''
      }
    };
  },
  mounted() {
    this.getK8sClusterList();
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
        if (obj.status == "active" || obj.status == "UPDATE_IN_PROGRESS") {
          me.k8sClusterOptions.push(obj);
        }
      });
    },
    clusterChange(value) {
      for (let i=0; i<this.k8sClusterOptions.length; i++) {
        if (value == this.k8sClusterOptions[i]['uuid']) {
          this.addNodeForm.rancher_cluster_id = this.k8sClusterOptions[i]['rancher_cluster_id'];
          this.clusterName = this.k8sClusterOptions[i]['name'];
        }
      }
    },
    submitForm() {
      this.$refs.addNodeForm.validate(async valid => {
        if (valid) {
          let self = this;
          let body = {
            csi_type: self.addNodeForm.csi_type,
            project_id: self.$cookie.get('pid'),
            rancher_cluster_id: self.addNodeForm.rancher_cluster_id,
            cluster_id: self.addNodeForm.k8sClusterId
          };
          self.saving = true;
          let traceId = 'req-'+uuid.v1();
          let ret = await self.$ajax({
            url: "api/cetus/v1/csi/register_provider",
            data: JSON.stringify(body),
            type: "POST",
            headers: {
              'X-Openstack-Request-Id': traceId
            },
            successFun:(response) => {
              if (response.code != "200") {
                self.$notify({
                  message: response.result,
                  type: "error"
                });
                self.$recordLog({
                  target: Vue.logTarget.containerVolume,
                  level: {
                    en: "error",
                    zh_cn: "错误"
                  },
                  description: {
                    en: `cluster:${self.clusterName}add storage provider`,
                    zh_cn: `集群${self.clusterName}添加存储提供者`
                  },
                  trace_id: traceId
                });
              } else {
                self.$recordLog({
                  target: Vue.logTarget.containerVolume,
                  level: {
                    en: "info",
                    zh_cn: "信息"
                  },
                  description: {
                    en: `cluster:${self.clusterName}add storage provider`,
                    zh_cn: `集群${self.clusterName}添加存储提供者`
                  },
                  trace_id: traceId
                });
              }
            }
          });
          self.saving = false;
          self.$emit("handleAddShow", {});
          self.$emit("refreshData", {});
        }
      });
    },
    cancel() {
      let self = this;
      this.$emit("handleAddShow", {});
    }
  }
};
</script>
