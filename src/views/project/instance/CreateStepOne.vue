<template>
  <el-form class="margin-tb20"  label-position="left" :model="projectCreateForm" :rules=rules ref="projectCreateForm" label-width="160px">
    <el-form-item label="实例名称" prop="name" class="is-required">
      <el-input class="col-8" v-model="projectCreateForm.name" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item label="可用域" prop="domain" class="is-required">
      <el-select v-model="projectCreateForm.domain">
          <el-option v-for="item in netTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="数量" prop="count" class="is-required">
      <el-input-number v-model="number" :min="1" :max="10"></el-input-number>
    </el-form-item>
    <el-form-item>
      <el-button @click="nextStep" type="primary" >下一步</el-button>
      <el-button @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: 'StepOne',
  data() {
    return {
      activeIndex: 0,
      projectCreateForm: {
        name: '',
        domain: 'nova',
        count: ''
      },
      number: '1',
      netTypeOptions:[{value:'1', label:'nova'}],
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 20}
        ]
      },
      currentPage: 1,
      showBorder: true,
      pageSizes: [5, 10, 30],
      pageSize: 5,
      total: 0,
      columns: [],
      columnsChecked: ['name', 'description', 'vlanType', 'subNet', 'netMask', 'subNetNum'],
      tableData: [],
      multipleSelection: [],
      queryParam: {
        "page": 1,
        "pageSize": 5,
        field: "",
        dir: ""
      },
      loading: true
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.projectCreateForm);
    this.getData();
  },
  methods: {
    nextStep() {
      this.$refs.projectCreateForm.validate((valid) => {
        if (valid) {
          this.$emit("stepOneDone", {});
        } else {
          return false;
        }
      });
    },
    cancel() {
      this.$emit("cancel");
    },
    async getData(param) {
      var self = this;
    },
    handleSizeChange(val) {
      this.currentPage = 1;
      this.getData({
        page: this.currentPage,
        pageSize: val
      });
    },
    //分页
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getData({
        page: val
      });
    },
    onRefresh() {
      this.getData();
    }
  }
}
</script>