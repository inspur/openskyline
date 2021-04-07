<template>
  <div>
    <el-form class="me-required-form margin-tb20" :model="createTemplateForm" ref="steptwoForm" label-width="120px">
      <el-checkbox-group v-model="createTemplateForm.processList">
        <el-form-item label="Ambari 进程">
          <el-checkbox label="Ambari" name="Ambari"></el-checkbox>
        </el-form-item>
        <el-form-item label="HDFS 进程">
          <el-checkbox label="DataNode" name="DataNode"></el-checkbox>
          <el-checkbox label="NameNode" name="NameNode"></el-checkbox>
          <el-checkbox label="SecondaryNameNode" name="SecondaryNameNode"></el-checkbox>
          <el-checkbox label="JournalNode" name="JournalNode"></el-checkbox>
        </el-form-item>
        <el-form-item label="YARN 进程">
          <el-checkbox label="YARN Timeline Server" name="YARN Timeline Server"></el-checkbox>
          <el-checkbox label="MapReduce History Server" name="MapReduce History Server"></el-checkbox>
          <el-checkbox label="NodeManager" name="NodeManager"></el-checkbox>
          <el-checkbox label="ResourceManager" name="ResourceManager"></el-checkbox>
        </el-form-item>
        <el-form-item label="ZooKeeper 进程">
          <el-checkbox label="ZooKeeper" name="ZooKeeper"></el-checkbox>
        </el-form-item>
        <el-form-item label="HBase 进程">
          <el-checkbox label="HBase Master" name="HBase Master"></el-checkbox>
          <el-checkbox label="HBase RegionServer" name="HBase RegionServer"></el-checkbox>
        </el-form-item>
        <el-form-item label="Flume 进程">
          <el-checkbox label="Flume" name="Flume"></el-checkbox>
        </el-form-item>
        <el-form-item label="Knox 进程">
          <el-checkbox label="Knox Gateway" name="Knox Gateway"></el-checkbox>
        </el-form-item>
        <el-form-item label="Sqoop 进程">
          <el-checkbox label="Sqoop" name="Sqoopy"></el-checkbox>
        </el-form-item>
        <el-form-item label="Ranger 进程">
          <el-checkbox label="Ranger Admin" name="Ranger Admin"></el-checkbox>
          <el-checkbox label="Ranger Usersync" name="Ranger Usersync"></el-checkbox>
        </el-form-item>
        <el-form-item label="Hive 进程">
          <el-checkbox label="Hive Metastore" name="Hive Metastore"></el-checkbox>
          <el-checkbox label="HiveServer" name="HiveServer"></el-checkbox>
        </el-form-item>
        <el-form-item label="Kafka 进程">
          <el-checkbox label="Kafka Broker" name="Kafka Broker"></el-checkbox>
        </el-form-item>
        <el-form-item label="Slider 进程">
          <el-checkbox label="Slider" name="Slider"></el-checkbox>
        </el-form-item>
        <el-form-item label="Storm 进程">
          <el-checkbox label="DRPC Server" name="DRPC Server"></el-checkbox>
          <el-checkbox label="Nimbus" name="Nimbus"></el-checkbox>
          <el-checkbox label="Storm UI Server" name="Storm UI Server"></el-checkbox>
          <el-checkbox label="Supervisor" name="Supervisor"></el-checkbox>
        </el-form-item>
        <el-form-item label="Oozie 进程">
          <el-checkbox label="Oozie" name="Oozie"></el-checkbox>
        </el-form-item>
        <el-form-item label="Falcon 进程">
          <el-checkbox label="Falcon Server" name="Falcon Server"></el-checkbox>
        </el-form-item>
        <el-form-item label="Spark 进程">
          <el-checkbox label="Spark History Server" name="Spark History Server"></el-checkbox>
        </el-form-item>
      </el-checkbox-group>
    </el-form>
    <div class="me-form-footer">
      <el-button @click="cancel" type="default">{{$t('lang.cancel')}}</el-button>
      <el-button @click="prevStep" type="primary">{{$t('lang.preStep')}}</el-button>
      <el-button @click="nextStep" type="primary">{{$t('lang.nextStep')}}</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: "CreateStepTwo",
  props: ["editTag", "row"],
  data() {
    return {
      createTemplateForm: {
        processList: []
      }
    };
  },
  mounted() {
  },
  methods: {
    editShow() {
      if (this.editTag == "edit") {
        console.log(this.row)
        this.createTemplateForm.processList = this.row.node_processes;
      }
    },
    nextStep() {
      if (this.createTemplateForm.processList.length < 1) {
        this.$message.error(Vue.t("cloudData.SELECT_ONE_PROCESS"));
        return false;
      } else {
        this.$emit("stepTwoDone", this.createTemplateForm);
      }
    },
    prevStep() {
      this.$emit("prevStep", 0);
    },
    cancel() {
      this.$emit("cancel");
    }
  }
};
</script>
