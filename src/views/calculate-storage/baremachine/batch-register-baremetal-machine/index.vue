<template>
  <div>
    <step-one v-if="currentStep === 1" @close="handleClose" @next="handleStepOneNext" />
    <step-two v-if="currentStep === 2" :machines="formData.machines" @close="handleDone" />
  </div>
</template>

<script>
import StepOne from './StepOne';
import StepTwo from './StepTwo';
export default {
  name: 'BatchRegisterBaremetalMachine',
  components: {
    StepOne, StepTwo
  },
  data() {
    return {
      saving: false,
      currentStep: 1,
      formData: {
        machines: []
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },
    handleStepOneNext(machines) {
      this.formData.machines = machines;
      this.currentStep = 2;
    },
    handleDone() {
      this.$emit('refresh');
      this.$emit('close');
    }
  },
  mounted() {
  }
}
</script>

<style>

</style>
