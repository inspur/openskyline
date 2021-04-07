<template>
  <el-dialog :title="startTitle" :visible.sync="dialogVisible">
    <el-form ref="startpageForm" :model="startpageForm" :rules=rules label-width="100px" class="me-required-form" v-loading="loading" style="margin-top:5px;">
      <el-form-item :label="$t('container.startPageCustom')">
        <el-checkbox-group v-model="checkList">
          <el-checkbox label="loadbalance">{{$t('base.loadBalancing')}}</el-checkbox>
          <el-checkbox label="database">{{$t('base.databaseInstance')}}</el-checkbox>
          <el-checkbox label="kbcluster">{{$t('container.containerCluster')}}</el-checkbox>
          <br>
          <el-checkbox label="objstorge">{{$t('calcStorLang.objectStorage')}}</el-checkbox>
          <el-checkbox label="filestorage">{{$t('base.fileStorage')}}</el-checkbox>
          <br>
          <el-checkbox label="physicalhost">{{$t('base.START_PAGE_THREE_VP_AMOUNT')}}</el-checkbox>
          <el-checkbox label="baremachine">{{$t('base.START_PAGE_THREE_BARE_METAL_AMOUNT')}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item :label="$t('container.bigscreenCustom')">
        <el-checkbox-group v-model="bigcheckList">
          <el-checkbox label="physicalhost">{{$t('base.START_PAGE_THREE_VP_AMOUNT')}}</el-checkbox>
          <el-checkbox label="baremachine">{{$t('base.START_PAGE_THREE_BARE_METAL_AMOUNT')}}</el-checkbox>
        </el-checkbox-group>
        <span style="color:#666666;font-size:12px;">{{$t('container.startpage_custom_note')}}</span>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible=false">{{$t('lang.cancel')}}</el-button>
      <el-button @click="pageSetConfirm" type="primary" :disabled="loading">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "StartPageSet",
  props:[""],
  data() {
    return {
      startpageForm: {
      },
      startTitle: Vue.t('container.customStartPage'),
      checkList: [],
      bigcheckList:[],
      roleType: Vue.roleType,
      dialogVisible: true,
      loading:false,
      rules: {
      }
    }
  },
  mounted() {
  },
  methods: {
    show() {
      this.dialogVisible = true;
      this.getCurrentSet();
    },
    getCurrentSet() {
      this.checkList = [];
      this.bigcheckList = [];
      let startcookie = this.$cookie.get('startpage');
      let bigscreen = this.$cookie.get('bigscreen');
      if (startcookie) {
        let ckList = startcookie.split(",");
        for (let i=0; i<ckList.length; i++) {
          this.checkList.push(ckList[i]);
        }
      } else {
        this.checkList = [];
      }
      if (bigscreen) {
        let ckList = bigscreen.split(",");
        for (let i=0; i<ckList.length; i++) {
          this.bigcheckList.push(ckList[i]);
        }
      } else {
        this.bigcheckList = [];
      }
    },
    pageSetConfirm() {
      let startcookie = "";
      if (this.checkList.length > 0) {
        for (let i=0; i<this.checkList.length; i++) {
          if (i == this.checkList.length - 1) {
            startcookie+= this.checkList[i];
          } else {
            startcookie+= this.checkList[i]+",";
          }
        }
      }
      let bigscreencookie = "";
      if (this.bigcheckList.length > 0) {
         for (let i=0; i<this.bigcheckList.length; i++) {
           if (i == this.bigcheckList.length - 1) {
            bigscreencookie+= this.bigcheckList[i];
          } else {
            bigscreencookie+= this.bigcheckList[i]+",";
          }
         }
      }
      this.$cookie.set('startpage', startcookie);
      this.$cookie.set('bigscreen', bigscreencookie);
      this.$notify({
        message: Vue.t('base.saveSuccess'),
        type: 'success'
      });
      this.$emit("handleStartPageShow", {});
      this.dialogVisible = false;
    }
  }
}
</script>
