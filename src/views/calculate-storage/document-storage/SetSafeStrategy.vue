<template>
  <el-dialog title="安全策略管理" :visible.sync="visible">
    <el-form ref="setSafeStrategyForm" :model="setSafeStrategy" label-width="100px" :rules="rules" class="is-required">
      <el-form-item label="选择安全策略" prop="strategyId" class="is-required">
        <el-select v-model="setSafeStrategy.strategyId">
          <el-option v-for="item in netOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
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
  name:"setSafeStrategy",
  data() {
    return {
      setSafeStrategy:{
        strategyId:""
      },
      size:2,
      visible:false,
      rules: {
        user: [
          {type: 'required'}
        ]
      },
      netOptions:[{value:'1', label:'无'}, {value:'2', label:'安全策略'}]
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