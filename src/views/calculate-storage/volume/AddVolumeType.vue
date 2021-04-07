<template>
  <el-dialog :title="$t('storage.createVolType')" :visible.sync="visible" v-dialogDrag>
    <el-form ref="addVolumeTypeForm" :model="addVolumeType" label-width="80px" :rules="rules" label-position="right" v-loading="saving">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="addVolumeType.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-8" v-model="addVolumeType.description" @keydown.native="noEnter($event)" auto-complete="off" type="textarea"></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.public')"  class="is-required" prop="public">
        <el-switch v-model ="addVolumeType.public" :on-text="$t('storage.yes')" :off-text="$t('storage.no')" @change="changeFlagValue" disabled></el-switch>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAddVType" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"addVolumeType",
  data() {
    return {
      addVolumeType:{
        id:"",
        name:"",
        description:"",
        public:true
      },
      saving: false,
      visible:false,
      projectOptions:[],
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 200},
          {type: 'onlyLetterNumber_Chinese'}
        ],
        description: [
          {trigger: 'blur change'},
          {type: 'maxSize', value: 255}
        ]
      }
    }
  },
  mounted() {
  },
  methods:{
    noEnter(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        return false;
      }
    },
    show() {
      this.visible = true;
      this.addVolumeType.name = "";
      this.addVolumeType.description = "";
      this.addVolumeType.public = true;
    },
    hide() {
      this.visible = false;
    },
    confirmAddVType() {
      this.$refs.addVolumeTypeForm.validate(async(valid) => {
        if (valid) {
          this.saving = true;
          let name = this.addVolumeType.name;
          let description = this.addVolumeType.description;
          let ispublic = this.addVolumeType.public;
          var pUuid = this.$cookie.get("pid");
          let url = "api/cinderv2/v2/" + pUuid + "/types";
          let type = "post";
          let msg = this.$t('storage.createVolTypeSuccess');
          let body = {"volume_type": {"name": name, "description":description, "os-volume-type-access:is_public":ispublic}};
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: type,
              successMsg: msg,
              log:{
                description:{
                  en:"Create volume type:" + name,
                  zh_cn:"创建云硬盘类型:" + name
                },
                target:Vue.logTarget.storage_volume_type
              }
            });
            this.saving = false;
            this.$emit("clearSelOption", {});
            this.$emit("handleShow", {});
            this.$emit("getData", {});
          } catch (data) {
            this.saving = false;
            __DEV__ && console.error(data);
          }
        } else {
          return false;
        }
      });
    },
    changeFlagValue() {}
  }
}
</script>