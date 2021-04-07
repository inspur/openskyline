<template>
  <el-form class="margin-tb20"  label-position="left" :model="projectCreateForm" :rules=rules ref="projectCreateForm" label-width="150px">
    <el-form-item label="选择源" prop="netmask" class="is-required">
      <el-input class="col-8" v-model="projectCreateForm.netmask"></el-input>
    </el-form-item>
    <el-form-item label="选择scheduler hint" prop="netmask" class="is-required">
      <el-transfer
      filterable
      v-model="valueT"
      :data="data">
      </el-transfer>
    </el-form-item>
    <el-form-item>
      <el-button @click="prevStep" type="primary" >上一步</el-button>
      <el-button @click="nextStep" type="primary" >完成</el-button>
      <el-button @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: 'StepFour',
  data() {
    const generateData = _ => {
        const data = [];
        for (let i = 1; i <= 15; i++) {
          data.push({
            key : i,
            label: `备选项 ${i}`,
            disabled: i % 4 === 0
          })
        }
          return data;
      };
    return {
      activeIndex: 1,
      projectCreateForm: {
        netmask: '',
        ipPoolTable: []
      },
      data: generateData(),
      valueT: [1, 4],
      rules: {
        netmask: [
          {type: 'required', trigger: 'blur change'}
        ],
        vlan: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'min', value: 0},
          {type: 'max', value: 4000}
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.projectCreateForm);
    this.ruleStore = Object.assign({}, this.rules);
  },
  methods: {
    nextStep() {
      this.$refs.projectCreateForm.validate((valid) => {
        if (valid) {
          this.$emit("stepFourDone", {});
        } else {
          return false;
        }
      });
    },
    prevStep() {
      this.$emit("prevFourStep", 0);
    },
    cancel() {
      this.$emit("cancel");
    }
  }
}
</script>
<style scoped>
</style>