<template>
  <el-dialog title="编辑消费者" :visible.sync="visible" v-dialogDrag>
    <el-form ref="editConsumerForm" :model="editConsumer" label-width="100px" :rules="rules"  label-position="left">
      <el-form-item label="当前消费者" prop="now"  class="is-required">
        <el-input class="col-8" v-model="editConsumer.now" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="新建QoS规格消费者" prop="newCostumer"  class="is-required">
        <el-select v-model="editConsumer.newCostumer">
          <el-option v-for="item in ncOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-form>
      <span>说明：
每个QoS规格实体都有一个"消费者"的值，指明管理员 希望QoS策略实施的位置。该值可以是"前端"(Nova计算服务)， "后端" (Cinder后端)，或者"前后两端"。</span>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">取 消</el-button>
      <el-button type="primary" @click="confirmFun">确 定</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"editConsumer",
  data() {
    return {
      ncOption:[{value:'1', label:'请选择'}, {value:'2', label:'后端'}, {value:'3', label:'前后两端'}],
      editConsumer:{
        now:"前端",
        newCostumer:"1"
      },
      size:2,
      visible:false,
      rules: {}
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
    changeFlagValue() {}
  }
}
</script>