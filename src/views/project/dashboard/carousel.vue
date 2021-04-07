<template>
  <div >
    <span style="font-size:20px;">轮播效果</span>
    <el-carousel height="150px">
      <el-carousel-item v-for="item in 4" :key="item">
        <h1>{{ item }}</h1>
      </el-carousel-item>
    </el-carousel>
  </div>

</template>
<style type="text/css">
  .el-carousel__item h1{
  	color:#475669;
  	font-size:24px;
  	line-height:150px;
    margin:100;
  }
  .el-carousel__item:nth-child(2n){
  	background-color: #99a9bf;
  }
  .el-carousel__item:nth-child(2n+1){
  	background-color: #d3dce6;
  }
</style>