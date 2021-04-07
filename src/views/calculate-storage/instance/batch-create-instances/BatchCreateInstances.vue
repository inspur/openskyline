<template>
  <div>
    <step-one v-if="currentStep === 1" @next="handleStepOneNext" @close="handleClose" />
    <step-two v-if="currentStep === 2" :projectId="formData.projectId" :userId="formData.userId" @close="handleClose" @next="handleStepTwoNext" />
    <step-three v-if="currentStep === 3" :projectId="formData.projectId" :userId="formData.userId" :instances="instances" @close="handleDone" />
  </div>
</template>

<script>
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
export default {
  name: 'BatchCreateInstances',
  components: {
    StepOne, StepTwo, StepThree
  },
  props: ['projectId', 'userId'],
  data() {
    return {
      saving: false,
      currentStep: 1,
      formData: {
        projectId: '',
        userId: ''
      },
      instances: []
    }
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },
    handleStepOneNext(projectId, userId) {
      this.formData.projectId = projectId;
      this.formData.userId = userId;
      this.currentStep = 2;
    },
    handleStepTwoNext(instances) {
      this.instances = instances;
      this.currentStep = 3;
    },
    handleDone() {
      this.$emit('refresh');
      this.$emit('close');
    }
  },
  mounted() {
    this.roleType = Vue.roleType + '';
    if (this.roleType === '0') {
      this.formData.projectId = '';
      this.formData.projectName = '';
    } else if (this.roleType === '2') {
      this.formData.projectId = this.$cookie.get('pid');
      this.formData.userId = Vue.userId;
      this.currentStep = 2;
    }
  }
}
</script>

<style>

</style>
