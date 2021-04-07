<template>
  <el-dialog title="创建安全策略" :visible.sync="visible">
    <el-form ref="createSafeStrategyForm" :model="createSafeStrategy" label-width="100px" :rules="rules" class="is-required">
      <el-form-item label="名称" prop="name" class="is-required">
        <el-input class="col-8" v-model="createSafeStrategy.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="type" class="is-required">
        <el-select v-model="createSafeStrategy.type">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
       <el-form-item label="IP" prop="ip">
        <el-input class="col-8" v-model="createSafeStrategy.ip" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="DNS" prop="dns">
        <el-input class="col-8" v-model="createSafeStrategy.dns" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="用户名" prop="userName">
        <el-input class="col-8" v-model="createSafeStrategy.userName" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input class="col-8" v-model="createSafeStrategy.password" auto-complete="off" type="password"></el-input>
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input class="col-8" v-model="createSafeStrategy.description" auto-complete="off" type="textarea"></el-input>
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
  name:"createSafeStrategy",
  data() {
    return {
      createSafeStrategy:{
        user:"",
        ip:"",
        dns:"",
        description:"",
        password:"",
        type:"",
        name:""
      },
      size:2,
      visible:false,
      isImageFlag:true,
      soltFlag:false,
      imageFlag:false,
      volumeFlag:false,
      rules: {
        user: [
          {type: 'required'}
        ]
      },
      typeOptions:[{value:'1', label:'ldap'}, {value:'2', label:'kerberos'}, {value:'1', label:'active_directory'}]
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
      }
    }
  }
</script>