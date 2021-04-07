<template>
  <div>
    <div class="text-regular module-desc">
      <span>{{$t('container.volumesupportTips')}}</span><br>
      <span>{{$t('container.ironicTips')}}</span>
    </div>
    <el-form class="margin-tb20 me-require-form" ref="createInstanceForm" :model="createInstanceForm" :rules=rules label-width="100px" v-loading="loading">
      <el-form-item :label="$t('container.containerVolume')" prop="volume_name" class="is-required">
        <el-select class="col-12" v-model="createInstanceForm.volume_name">
          <el-option v-for="item in volumeList" :key="item.volume_name" :label="item.volume_name" :value="item.volume_name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('container.attachPath')" prop="mount_path" class="is-required">
        <el-input class="col-12" v-model="createInstanceForm.mount_path" auto-complete="off"></el-input>
        <el-tooltip placement="right-start">
          <div slot="content">{{$t('container.attachPathTip1')}}</div>
          <div slot="content">{{$t('container.attachPathTip2')}}</div>
          <div slot="content">mysql:/var/lib/mysql</div>
          <div slot="content">tomcat:/tomcat/webapps</div>
          <div slot="content">{{$t('container.attachPathTip3')}}</div>
          <div slot="content">{{$t('container.attachPathTip4')}}</div>
          <div slot="content">{{$t('container.attachPathTip5')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="prevStep" type="primary" :disabled="loading">{{$t('lang.preStep')}}</el-button>
      <el-button @click="nextStep" type="primary" :disabled="loading">{{$t('lang.finish')}}</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: "CreateStepFour",
  props:["rancher_cluster_id", "user_id"],
  data() {
    return {
      createInstanceForm: {
        volume_name: "",
        mount_path: ""
      },
      volumeList: [],
      loading: false,
      rules: {
        volume_name: [
          {type: 'required', trigger: 'blur change'}
        ],
        mount_path: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 50},
          {type: 'linuxpath'}
        ]
      }
    }
  },
  mounted() {
  },
  methods: {
    getVolumtList() {
      this.volumeList = [];
      let data = {
        rancher_cluster_id: this.rancher_cluster_id,
        user_id: Vue.userId
      };
      let ret = this.$ajax({
        type: 'post',
        url: "api/cetus/v1/storage/list_volumes_by_user",
        data: JSON.stringify(data),
        showErrMsg: false,
        successFun:(response) => {
          let volumes = response.volumes;
          for (let i = 0; i<volumes.length; i++) {
            if (volumes[i]["volume_status"] == "Bound" && volumes[i]["mount_status"] == "unmounted") {
              this.volumeList.push(volumes[i]);
             }
          }
        }
      });
    },
    cancel() {
      this.$emit("cancel");
    },
    prevStep() {
      this.$emit("prevStep", 2, this.createInstanceForm);
    },
    nextStep() {
      let self = this;
      self.$refs.createInstanceForm.validate((valid) => {
        if (!valid) {
          return false;
        }
        self.loading = true;
        self.$emit("stepDone", 4, self.createInstanceForm);
      });
    }
  }
}
</script>


    