<template>
<div class="padding-lr20">
  <el-steps :space="300" :active="activeIndex" process-status="process" finish-status="success">
    <el-step title="详情"></el-step>
    <el-step title="源"></el-step>
    <el-step title="配置"></el-step>
    <el-step title="scheduler hint"></el-step>
  </el-steps>
  <step-one @stepOneDone="stepOneDone" @cancel="cancel" v-show="activeIndex == 0" ref="stepOne"></step-one>
  <step-two @prevStep="prevStep" @stepTwoDone="stepTwoDone" @cancel="cancel" v-show="activeIndex == 1" ref="stepTwo" v-if="flag"></step-two>
  <step-three @prevThreeStep="stepOneDone" @stepThreeDone="stepThreeDone" @cancel="cancel" v-show="activeIndex == 2" ref="stepThree"></step-three>
  <step-four @prevFourStep="stepTwoDone" @stepFourDone="stepFourDone" @cancel="cancel" v-show="activeIndex == 3" ref="stepThree"></step-four>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import StepOne from './CreateStepOne';
import StepTwo from './CreateStepTwo';
import StepThree from './CreateStepThree';
import StepFour from './CreateStepFour';
export default {
  name: 'AddInstance',
  components: {
    StepOne, StepTwo, StepThree, StepFour
  },
  data() {
    return {
      activeIndex: 0,
      flag: false
    }
  },
  mounted() {
    this.$parent.$parent.active = "instances";
  },
  methods: {
    prevStep(activeIndex) {
      this.flag = false;
      this.activeIndex = activeIndex;
      Vue.scrollToHeader();
    },
    stepOneDone(param) {
      var self = this;
      self.flag = true;
      this.activeIndex = 1;
      Vue.scrollToHeader();
    },
    stepThreeDone() {
      var self = this;
      self.flag = false;
      this.activeIndex = 3;
      Vue.scrollToHeader();
    },
    stepFourDone() {
      var self = this;
      self.$message('提交完成！');
      self.$router.push({
        path: this.$route.query.refer
      });
    },
    stepTwoDone(param) {
      this.activeIndex = 2;
      Vue.scrollToHeader();
    },
    cancel() {
      this.$router.push({
        path: this.$route.query.refer
      })
    }
  }
}
</script>
<style scoped>
</style>
