<template>
  <el-dialog title="关联网络" :visible.sync="visible">
    <el-form ref="createNetForm" :model="createNet" label-width="100px" :rules="rules" class="is-required">
      <el-form-item label="名称" prop="name"  class="is-required">
        <el-input class="col-8" v-model="createNet.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="网络" prop="netId" class="is-required">
        <el-select v-model="createNet.netId">
          <el-option v-for="item in netOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="子网" prop="subnetId" class="is-required">
        <el-select v-model="createNet.subnetId" @change="originChange">
          <el-option v-for="item in subnetOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input class="col-8" v-model="createNet.description" auto-complete="off" type="textarea"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">取 消</el-button>
      <el-button type="primary" @click="confirmFun">确 定</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"createNet",
  data() {
    return {
      createNet:{
        user:"",
        netId:"",
        description:"",
        subnetId:""
      },
      size:2,
      visible:false,
      rules: {
        user: [
          {type: 'required'}
        ]
      },
      subnetOptions:[{value:'1', label:'subNet2'}, {value:'2', label:'subNet2'}],
      netOptions:[{value:'1', label:'netTest'}]
    }
  },
  mounted() {
  },
  methods:{
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      let me = this;
      this.$emit("addData");
    },
    originChange(val) {
      if (val == '1') {
        this.soltFlag = false;
        this.imageFlag = false;
        this.volumeFlag = false;
      } else if (val == '2') {
        this.soltFlag = true;
        this.imageFlag = false;
        this.volumeFlag = false;
      } else if (val == '3') {
        this.soltFlag = false;
        this.imageFlag = true;
        this.volumeFlag = false;
      } else if (val == '4') {
        this.soltFlag = false;
        this.imageFlag = false;
        this.volumeFlag = true;
      }
    }
  }
}
</script>