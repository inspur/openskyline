<template>
   <el-form ref="imageCreateForm" :model="refreshMetadata" label-width="100px">
      <el-form-item label="" prop="" class="is-required">
        <el-transfer 
          filterable 
          v-model="valueT"
          :titles="[$t('calcStorLang.allMetadata') , $t('calcStorLang.selectedMetadata')]"
          :data="data">
        </el-transfer>
      </el-form-item>
      <div class="me-form-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button @click="prevStep" type="primary">{{$t('calcStorLang.previous')}}</el-button>
        <el-button @click="nextStep" type="primary">{{$t('calcStorLang.create')}}</el-button>
      </div>
    </el-form>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  name: 'StepTwo',
 data() {
    const generateData = _ => {
      const data = [];
      for (let i = 1; i <= 15; i++) {
        data.push({
          key: i,
          label: `node ${i}`,
          disabled: i % 4 === 0
        })
      }
      return data;
    };
    return {
      data: generateData(),
      valueT: [1, 4],
      refreshMetadata: {}
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.imageCreateForm);
  },
  methods: {
    nextStep() {
      this.$refs.imageCreateForm.validate((valid) => {
        if (valid) {
          this.$emit("stepTwoDone", {});
        } else {
          return false;
        }
      });
    },
    prevStep() {
      this.$emit("prevStep", 0);
    },
    cancel() {
      this.$emit("cancel");
    }
  }
}
</script>