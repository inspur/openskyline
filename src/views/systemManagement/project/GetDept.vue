<template>
  <el-dialog :title="$t('base.selectDepartment')" :visible.sync="visible">
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">取 消</el-button>
      <el-button type="primary" @click="confirmFun">确 定</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"newDepart",
  data() {
    return {
      visible:false
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
      this.visible = false;
    }
  }
}
</script>