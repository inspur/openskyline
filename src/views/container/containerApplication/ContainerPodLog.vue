<template>
  <div v-loading="loading">
    <el-input type="textarea" :autosize="{minRows:2, maxRows:20}" v-model="podLogContent" readonly></el-input>
  </div>
</template>
<script>
  export default {
    name: 'ContainerPodLog',
    data () {
      return {
        podLogContent:"",
        rancherClusterId:this.$route.params.rancherClusterId,
        nameSpace:this.$route.params.nameSpace,
        podName:this.$route.params.podName,
        loading:false
      };
    },
    mounted () {
      this.getPodLog();
    },
    methods: {
      async getPodLog() {
        let self = this;
        try {
          self.loading = true;
          self.podLogContent = "";
          let log = await this.$ajax({
            type: 'post',
            url: 'api/cetus/v1/app/get_pod_log',
            data:JSON.stringify({
              pod_name:self.podName,
              user_id:self.nameSpace,
              rancher_cluster_id:self.rancherClusterId
            })
          });
          self.loading = false;
          self.podLogContent = log.result;
        } catch (data) {
          self.loading = false;
        }
      }
    }
  }
</script>