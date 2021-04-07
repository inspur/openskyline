<template>
  <el-dialog :title="$t('storage.updateVolType')" :visible.sync="visible" v-dialogDrag>
    <el-form ref="editVolumeTypeForm" :model="editVolumeType" label-width="80px" :rules="rules" v-loading="saving" label-position="right">
       <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="editVolumeType.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-8" v-model="editVolumeType.description" auto-complete="off" @keydown.native="noEnter($event)" type="textarea"></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.public')"  class="is-required" prop="public">
        <el-switch v-model ="editVolumeType.public" :on-text="$t('storage.yes')" :off-text="$t('storage.no')" disabled></el-switch>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"editVolumeType",
  props: ['volTypeId', 'volTypeEntity'],
  data() {
    return {
      editVolumeType:{
        name:"",
        description:"",
        public:""
      },
      visible:false,
      saving: false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 200 },
          {type: 'onlyLetterNumber_Chinese'}
        ],
        description: [
          { trigger: 'blur change' },
          { type: 'maxSize', value: 255 }
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
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      this.$refs.editVolumeTypeForm.validate(async(valid) => {
        if (valid) {
          this.saving = true;
          let name = this.editVolumeType.name;
 //         let projectId = this.addVolumeType.projectList;
          let description = this.editVolumeType.description;
          let ispublic = this.editVolumeType.public;
          var pUuid = this.$cookie.get("pid");
          let url = "api/cinderv3/v3/" + pUuid + "/types/"+ this.volTypeId;
          let type = "put";
          let msg = this.$t('storage.updateVolTypeSuccess');
          let body = {"volume_type": {"name": name, "is_public":ispublic, "description":description}};
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: type,
              successMsg: msg,
              log:{
                description:{
                  en:"Edit volume type(" + this.volTypeId + ")" + "[Before the name is edited:" + this.volTypeEntity.name + ",after editing:" + name + "]",
                  zh_cn:"编辑云硬盘类型(" + this.volTypeId + ")" + "[名称编辑前:" + this.volTypeEntity.name + ",编辑后:" + name + "]"
                },
                target:Vue.logTarget.storage_volume_type
              }
            });
            this.saving = false;
            this.$emit("clearSelOption", {});
            this.$emit("handleEditShow", {});
            this.$emit("getData", {});
          } catch (data) {
            this.saving = false;
            __DEV__ && console.error(data);
          }
        } else {
          return false;
        }
      });
    }
  }
}
</script>