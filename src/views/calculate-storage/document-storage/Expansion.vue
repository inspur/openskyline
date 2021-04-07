<template>
  <el-dialog title="扩容" :visible.sync="visible">
    <el-form ref="expandVolumeForm" :model="expandVolume" label-width="100px" :rules="rules">
      <el-form-item :label="$t('lang.name')" prop="count" class="is-required">
        <el-input class="col-8" v-model="expandVolume.name" auto-complete="off" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.capabilityGB')" :prop="$t('storage.capability')" class="is-required">
      <el-row>
          <el-col :span="12">
            <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage" :status="proStatus" v-bind:style="{top:'10px'}"></el-progress>
          </el-col>
          <el-col :span="12">
            <div class="sub-tittle">共2048GB，已使用1948GB</div>
          </el-col>
        </el-row>
        <el-slider v-model="expandVolume.size" :value="50" show-input :min="20" v-bind:style="{width:'70%'}" @change="sizeChange"></el-slider>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"expandVolume",
  data() {
    return {
      expandVolume:{
        name:"",
        size:"50"
      },
      size:2,
      visible:false,
      rules:{},
      countpercentage:60,
      countproStatus:"success",
      percentage:90,
      proStatus:"success"
    }
  },
  mounted() {
    this.expandVolume.size = 50;
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
    sizeChange(val) {
      var p = ((Number(val) + 1948)/2048).toFixed(2) * 100;
      this.proStatus = p > 100 ? "exception" : "success";
      this.percentage = p > 100 ? 100 : p;
    }
  }
}
</script>