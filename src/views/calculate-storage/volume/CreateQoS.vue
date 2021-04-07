<template>
  <el-dialog :title="$t('storage.createQosSpec')" :visible.sync="visible"  :before-close="handleClose" v-dialogDrag>
    <el-form ref="createQosForm" :model="createQos" label-width="100px" :rules="rules"  label-position="left">
      <el-form-item :label="$t('lang.name')" prop="name"  class="is-required">
        <el-input class="col-8" v-model="createQos.name" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAddQos" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"createQos",
  data() {
    return {
      createQos:{
        name:""
      },
      visible:true,
      saving: false,
      rules: {
       name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 255},
          {type: 'onlyLetter_NumberChinese'}
        ]
      }
    }
  },
  mounted() {
  },
  methods:{
    confirmAddQos() {
      this.$refs.createQosForm.validate(async(valid) => {
        if (valid) {
          this.loading = true;
          this.saving = true;
          let name = this.createQos.name;
          var pUuid = this.$cookie.get("pid");
          let url = "api/cinderv3/v3/" + pUuid + "/qos-specs";
          let type = "post";
          let msg = this.$t('storage.createQosSpecSuccess');
          let body = {"qos_specs": {"name": name, "consumer" : "front-end"}};
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: type,
              successMsg: msg,
              log:{
                description:{
                  en:"Create QoS:" + name,
                  zh_cn:"创建QoS:" + name
                },
                target:Vue.logTarget.storage_volume_QoS
              }
            });
            this.loading = false;
            this.saving = false;
            this.$emit("clearSelOption", {});
            this.$emit("handleShow", {});
            this.$emit("getData");
          } catch (data) {
            this.saving = false;
            this.loading = false;
            __DEV__ && console.error(data);
          }
        } else {
          return false;
        }
      });
    },
    handleClose() {
      this.$emit("handleShow", {});
    }
  }
}
</script>