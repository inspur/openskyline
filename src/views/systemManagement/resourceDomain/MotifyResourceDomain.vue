<template>
  <el-dialog :title="$t('base.MODIFY_DOMAIN_INFORMATION')" :visible.sync="visible">
    <el-alert title="" type="success"
      :description="$t('base.DOMAIN_DESCRIPTION')"
    ></el-alert>
    <el-form label-width="100px" style="margin-top:10px;" :model="motifyDomain" label-position="left">
      <el-form-item :label="$t('base.name')" class="is-required" prop="source">
        <el-input v-model="motifyDomain.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.desc')" prop="file">
        <el-input v-model="motifyDomain.desc" type="textarea"></el-input>
      </el-form-item>
      <el-form-item label="" class="is-required" prop="source1">
        <el-checkbox>激活</el-checkbox>
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
  name:"newDepart",
  data() {
    return {
      motifyDomain:{
        name:"default",
        desc:"The default domain1"
      },
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