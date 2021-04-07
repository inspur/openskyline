<template>
  <el-dialog :title="$t('storage.volMigration')" :visible.sync="visible" :before-close="hide" v-dialogDrag>
    <el-form ref="volumeMoveForm" :model="volumeMove" label-position="right" label-width="120px" :rules="rules">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-30" v-model="volumeMove.name" auto-complete="off" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.currentInstance')" prop="host" class="is-required">
        <el-input class="col-30" v-model="volumeMove.host" auto-complete="off" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.desInstance')" prop="tohost" class="is-required">
       <el-select v-model="volumeMove.tohost">
       <el-option v-for="item in tohostOptions" :key="item.name" :label="item.name" :value="item.name"></el-option>
       </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.forceMigration')" class="is-required" prop="copy">
        <el-switch v-model ="volumeMove.copy" :on-text="$t('storage.yes')" :off-text="$t('storage.no')" @change="changeFlagValue"></el-switch>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="hide">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"volumeMove",
  data() {
    return {
      tohostOptions:[],
      volumeMove:{
        volumeId:"",
        name:"",
        host:"",
        tohost:"",
        copy:true
      },
      visible:false,
      rules: {}
    }
  },
  mounted() {
  },
  methods:{
    show() {
      this.visible = true;
      this.queryHostList();
    },
    hide() {
      this.visible = false;
    },
   async confirmFun() {
      var self = this;
      var volumeId = self.volumeMove.volumeId;
      var url = "api/cinder/v3/" + this.$cookie.get('pid') + "/volumes/" + volumeId + "/action";
      var body = {"os-migrate_volume": {"force_host_copy": self.volumeMove.copy, "host": self.volumeMove.tohost, "lock_volume": true}};
      body = JSON.stringify(body);
      try {
        let result = await self.$ajax({
          type: 'post',
          data: body,
          url: url,
          log:{
            description:{
              en:"Send migrate volume " + self.volumeMove.name + "(" + volumeId + ")",
              zh_cn:"发送迁移云硬盘" + self.volumeMove.name + "(" + volumeId + ")"
            },
            target:Vue.logTarget.storage_volume
          }
        });
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
      this.$emit("handleVolumeMove", {volumeId});
      this.$emit("onRefresh");
    },
    async queryHostList() {
      var self = this;
      self.loading = true;
      var roleType = Vue.roleType + "";
      var url = "api/cinder/v3/" + this.$cookie.get('pid') + "/scheduler-stats/get_pools?detail=true";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        self.loading = false;
        var hostArray = result['pools'];
        self.tohostOptions = [];
        for (var i = 0; i < hostArray.length; i++) {
          if (self.volumeMove.host != hostArray[i].name) {
            self.tohostOptions.push(hostArray[i]);
          }
        }
      } catch (res) {
        self.loading = false;
      }
    },
    changeFlagValue() {}
  }
}
</script>