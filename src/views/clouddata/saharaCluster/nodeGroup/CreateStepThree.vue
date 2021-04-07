<template>
<div>
  <el-row>
    <el-col :span="16">
      <el-form class="me-required-form margin-tb20" :model="createTemplateForm" ref="stepthreeForm" :rules=rules label-width="100px">
        <el-form-item :label="$t('cloudData.SAFE_GROUP_AUTO')">
          <el-checkbox v-model="createTemplateForm.autoSafe"></el-checkbox>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">为该节点组创建安全组。</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('network.securityTeam')">
          <el-select class="col-20" v-model="createTemplateForm.safeList" filterable multiple>
            <el-option v-for="item in safeGroupOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">在这些安全组中启动云主机。</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
  <div class="me-form-footer">
    <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    <el-button @click="prevStep" type="primary">{{$t('lang.preStep')}}</el-button>
    <el-button @click="nextStep" type="primary" >{{$t('lang.finish')}}</el-button>
  </div>
 </div>
</template>
<script>
export default {
  name: 'StepThree',
  props: ["editTag", "row"],
  data() {
    return {
      createTemplateForm: {
        autoSafe: true,
        safeList: []
      },
      safeGroupOptions: [],
      projectId: this.$cookie.get('pid'),
      rules: {}
    }
  },
  mounted() {
    this.getSafeTeamList();
  },
  methods: {
    editShow() {
      if (this.editTag == "edit") {
        this.createTemplateForm.autoSafe = this.row.auto_security_group;
        this.createTemplateForm.safeList = this.row.security_groups || [];
      }
    },
    async getSafeTeamList() {
      let self = this;
      let result = await self.$ajax({
        type: "GET",
        url:  "api/neutron/v2.0/security-groups?project_id=" + self.projectId,
        errorKey: "NeutronError"
      });
      let tempArr = result["security_groups"];
      self.safeGroupOptions = tempArr;
    },
    nextStep() {
      this.$refs.stepthreeForm.validate((valid) => {
        if (valid) {
          this.$emit("stepThreeDone", this.createTemplateForm);
        } else {
          return false;
        }
      });
    },
    prevStep() {
      this.$emit("prevStep", 1);
    },
    cancel() {
      this.$emit("cancel");
    }
  }
}
</script>
