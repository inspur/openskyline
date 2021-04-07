<template>
 <el-row :gutter="10">
   <el-col :span="12">
   	  <el-collapse v-model="activeNames" @change="handleChange">
    <el-collapse-item title="基本属性" name="1">
      <el-form :inline="true" v-model="formInline" class="form-inline">
        <el-form-item  label="主机池"></el-form-item>
        <el-form-item>1</el-form-item>
        <el-form-item>
          <el-button type="primary" icon='fa-search'  size="small">查询</el-button>
        </el-form-item>
      </el-form>
    </el-collapse-item>
    <el-collapse-item title="主机状态统计" name="2">
      <span>sdsd</span>
    </el-collapse-item>
  </el-collapse>
   </el-col>
   <el-col :span="12">
     <el-collapse v-model="activeNames" @change="handleChange">
    <el-collapse-item title="Top5主机CPU利用率" name="1">
      <el-form :inline="true" v-model="formInline" class="form-inline">
        <el-form-item  label="主机池">
          <el-input  placeholder="名称" size="small">1</el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon='fa-search'  size="small">查询</el-button>
        </el-form-item>
      </el-form>
    </el-collapse-item>
    <el-collapse-item title="主机状态统计" name="2">
      <span>sdsd</span>
    </el-collapse-item>
  </el-collapse>
   </el-col>
 </el-row> 
  
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
    name:"detail",
    props: ['naviName'],
    data() {
        return {
            formInline: {

            },
            activeNames: ['1', '2']
        }
    },
    methods: {
           handleChange() {
           }
    },
    computed: {
      ...mapGetters({
        routers: 'getRouters'
      })
    },
    mounted() {
       /*let navi = this.routers;
       navi[2].des = this.naviName;*/
    }
}
</script>