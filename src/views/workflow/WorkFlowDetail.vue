<template>
  <div>
    <el-form label-position="right" label-width="100px">
      <el-form-item label="">
        <el-input type="textarea" :autosize="{minRows:2}" v-model="workFlowDetailForm.definition" readonly></el-input>
      </el-form-item>
    </el-form>
<!--     <el-form ref="workFlowDetailForm" v-loading="loading" :model="workFlowDetailForm" label-width="170px" label-position="left" class="me-form" style="text-align:left;">
      <el-form-item label="工作流详情">
        <span>{{workFlowDetailForm.definition}}</span>
      </el-form-item>
    </el-form> -->
  </div>
</template>
<script>
  export default {
    name: 'WorkFlowDetail',
    props:{
      definition:String
    },
    data () {
      return {
        workFlowDetailForm: {
          definition:''
        },
        loading:false
      };
    },
    methods: {
      initWorkFlowDetails() {
        this.workFlowDetailForm.definition = this.definition;
      }
    }
  }
</script>
