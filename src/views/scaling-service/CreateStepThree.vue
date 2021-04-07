<template>
  <div>
    <el-form abel-position="left" class="me-required-form" :model="scalingSerCreateForm" :rules=rules ref="scalingSerCreateForm" label-width="120px" v-loading="loading">
      <el-form-item :label="$t('lang.userName')" prop="userName">
        <el-input class="col-15" v-model="scalingSerCreateForm.userName" auto-complete="off" disabled></el-input>
        <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstLoginTip1')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('lang.password')" prop="userPass" class="is-required">
        <el-input class="col-15" v-model="scalingSerCreateForm.userPass" auto-complete="off" type="password"></el-input>
        <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstLoginTip2')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('lang.confirmPassword')" prop="userConfirmPass" class="is-required">
        <el-input class="col-15" v-model="scalingSerCreateForm.userConfirmPass" auto-complete="off" type="password"></el-input>
      </el-form-item>
    </el-form>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="prevStep" type="primary" :disabled="loading">{{$t('lang.preStep')}}</el-button>
      <el-button @click="nextStep" type="primary" :disabled="loading">{{lbFlag?$t('lang.nextStep'):$t('lang.finish')}}</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: "CreateStepFour",
  props: ['lbFlag'],
  data() {
    return {
      loading: false,
      scalingSerCreateForm: {
        userName: "Administrator/root",
        userPass: "",
        userConfirmPass: ""
      },
      rules: {
        userPass: [
          { type: "required", trigger: "blur change" },
          { type: "passwordLegal" }
        ],
        userConfirmPass: [
          { type: "required", trigger: "blur change" },
          {
            type: "passwordEquals",
            context: this,
            value: "scalingSerCreateForm.userPass"
          }
        ]
      }
    };
  },
  methods: {
    nextStep() {
      let self = this;
      self.$refs.scalingSerCreateForm.validate(valid => {
        if (valid) {
          if (!self.lbFlag) {
            self.loading = true;
          }
          self.$emit("stepThreeDone", self.scalingSerCreateForm);
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
};
</script>
<style scoped>
</style>