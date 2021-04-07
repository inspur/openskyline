<template>
  <div>
    <el-form ref="createTemplateForm" :model="createTemplateForm" :rules="rules"
      class="me-required-form" label-width="140px" v-loading="loading">
      <el-form-item :label="$t('cloudData.TEMPLATE_NAME')" prop="clusterName" class="is-required">
        <el-input class="col-12" v-model="createTemplateForm.clusterName" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.desc')" prop="description">
        <el-input class="col-12" v-model="createTemplateForm.description" auto-complete="off" type="textarea"></el-input>
      </el-form-item>
      <el-form-item :label="$t('cloudData.autoConfig')" prop="autoConfig">
        <el-checkbox v-model="createTemplateForm.autoConfig"></el-checkbox>
        <el-tooltip effect="dark" placement="top">
          <div slot="content">选择后，将在创建集群实例时进行自动配置，否则你需要手动配置。</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('lang.public')" prop="ispublic">
        <el-checkbox v-model="createTemplateForm.ispublic"></el-checkbox>
        <el-tooltip effect="dark" placement="top">
          <div slot="content">如果选择，集群模板会在所有租户之间共享。</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('base.protected')" prop="isprotected">
        <el-checkbox v-model="createTemplateForm.isprotected"></el-checkbox>
        <el-tooltip effect="dark" placement="top">
          <div slot="content">如果选择，集群模板会被保护而不能再修改，除非不再选择这个。</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="使用anti-affinity组" prop="isprotected">
        <el-checkbox-group v-model="createTemplateForm.antiaffinity">
          <el-checkbox v-for="item in antiArrays" :label="item" :key="item"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="nextStep" type="primary">{{$t('lang.nextStep')}}</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: "CreateStepOne",
  props: ["editTag", "row"],
  data() {
    return {
      createTemplateForm: {
        clusterName: "",
        description: "",
        autoConfig: true,
        ispublic: false,
        isProtected: false,
        antiaffinity: []
      },
      projectId: this.$cookie.get("pid"),
      visible: true,
      antiArrays: ['Flume', 'DataNode', 'NameNode', 'SecondaryNameNode', 'JournalNode', 'Knox Gateway', 'Sqoop', 'Ambari', 'Ranger Admin', 'Ranger Usersync',
      'ZooKeeper', 'Hive Metastore', 'HiveServer', 'Kafka Broker', 'Slider', 'YARN Timeline Server', 'MapReduce History Server', 'NodeManager', 'ResourceManager',
      'DRPC Server', 'Nimbus', 'Storm UI Server', 'Supervisor', 'Oozie', 'Falcon Server', 'HBase Master', 'HBase RegionServer', 'Spark History Server'],
      rules: {
        clusterName: [
          { type: "required", trigger: "blur change" },
          { type: "maxSize", value: 40 },
          { type: "onlyLetter_MinusNumber" }
        ],
        description: [{ type: "maxSize", value: 255 }]
      },
      loading: false
    };
  },
  created() {
  },
  mounted() {
    if (this.editTag == "edit") {
      console.log(this.row)
      this.createTemplateForm.clusterName = this.row.name;
      this.createTemplateForm.description = this.row.description;
      this.createTemplateForm.autoConfig = this.row.use_autoconfig;
      this.createTemplateForm.ispublic = this.row.is_public;
      this.createTemplateForm.isProtected = this.row.is_protected;
      this.createTemplateForm.antiaffinity = this.row.anti_affinity;
    }
  },
  methods: {
    nextStep() {
      this.$refs.createTemplateForm.validate((valid) => {
        if (valid) {
          this.$emit("stepOneDone", this.createTemplateForm);
        } else {
          return false;
        }
      });
    },
    cancel() {
      this.$emit("cancel");
    }
  }
};
</script>
<style scoped>
</style>