<template>
  <div>
    <el-form abel-position="left" class="me-required-form" :model="scalingSerCreateForm" :rules=rules ref="scalingSerCreateForm" label-width="120px" v-loading="loading">
      <el-form-item :label="$t('scalingService.maxCapabilitySize')" prop="maxSize" class="is-required">
        <el-input class="col-15" v-model="scalingSerCreateForm.maxSize" auto-complete="off"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('scalingService.inputMaxCapabilty')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('scalingService.minCapabilitySize')" prop="minSize" class="is-required">
        <el-input class="col-15" v-model="scalingSerCreateForm.minSize" auto-complete="off"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('scalingService.inputMinCapabilty')}}</div>
          <div slot="content">{{$t('scalingService.capabiltyMinGreaterThanMax')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('scalingService.desiredCapacity')" prop="desiredSize" class="is-required">
        <el-input class="col-15" v-model="scalingSerCreateForm.desiredSize" auto-complete="off"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('scalingService.inputCurrentCapabilty')}}</div>
          <div slot="content">{{$t('scalingService.currentCapability')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('scalingService.addNodeNum')" prop="increaseSize" class="is-required">
        <el-input class="col-15" v-model="scalingSerCreateForm.increaseSize" auto-complete="off"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('scalingService.inputAddNodeNum')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('scalingService.reduceNodeNum')" prop="reduceSize" class="is-required">
        <el-input class="col-15" v-model="scalingSerCreateForm.reduceSize" auto-complete="off"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('scalingService.inputReduceNodeNum')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="prevStep" type="primary">{{$t('lang.preStep')}}</el-button>
      <el-button @click="nextStep" type="primary">{{$t('lang.nextStep')}}</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: "CreateStepThree",
  data() {
    return {
      loading:false,
      scalingSerCreateForm: {
        maxSize: "10",
        minSize: "1",
        desiredSize: "1",
        increaseSize: "1",
        reduceSize: "1"
      },
      rules: {
        maxSize: [
          { type: "required", trigger: "blur change" },
          { type: "integer" },
          { type: "max", value: 100 },
          { type: "min", value: 1 }
        ],
        minSize: [
          { type: "required", trigger: "blur change" },
          { type: "integer" },
          { type: "max", value: 100 },
          { type: "min", value: 1 }
        ],
        desiredSize: [
          { type: "required", trigger: "blur change" },
          { type: "integer" },
          { type: "max", value: 100 },
          { type: "min", value: 1 }
        ],
        increaseSize: [
          { type: "required", trigger: "blur change" },
          { type: "integer" },
          { type: "max", value: 100 },
          { type: "min", value: 0 }
        ],
        reduceSize: [
          { type: "required", trigger: "blur change" },
          { type: "integer" },
          { type: "max", value: 100 },
          { type: "min", value: 0 }
        ]
      }
    };
  },
  mounted() {
  },
  methods: {
    nextStep() {
      let self = this;
      self.$refs.scalingSerCreateForm.validate(valid => {
        if (valid) {
          if (parseInt(self.scalingSerCreateForm.maxSize) <= parseInt(self.scalingSerCreateForm.minSize)) {
            self.$notify.warning({
              message: Vue.t("container.scalingCompare")
            })
            return;
          }
          self.$emit("stepTwoDone", self.scalingSerCreateForm);
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
};
</script>
<style scoped>
</style>   