<template>
  <div>
    <step-one v-if="currentStep === 1" :instances="instances" @close="handleClose" @next="handleStepOneNext" />
    <step-two v-if="currentStep === 2" :clones="formData.clones" @close="handleDone" />
  </div>
</template>

<script>
import StepOne from './StepOne';
import StepTwo from './StepTwo';
export default {
  name: 'InstanceClone',
  props: {
    instances: {
      type: Array,
      default: () => []
    }
  },
  components: {
    StepOne, StepTwo
  },
  data() {
    return {
      saving: false,
      currentStep: 1,
      formData: {
        clones: []
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },
    handleStepOneNext(clones) {
      this.formData.clones = clones;
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
