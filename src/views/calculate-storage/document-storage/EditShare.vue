<template>
  <el-dialog :title="$t('storage.editShareStorage')" :visible.sync="visible" :before-close="cancelFun">
    <el-form ref="editShareForm" class="me-required-form" :model="editShare" label-position="right" label-width="80px" :rules="rules">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="editShare.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-8" v-model="editShare.description" auto-complete="off" type="textarea"></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.publicVisit')"  class="is-required" prop="isPublic" v-if='false'>
        <el-switch v-model ="editShare.isPublic" on-text="是" off-text="否" @change="changeFlagValue"></el-switch>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelFun">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"editShare",
  props: ["editShareData"],
  data() {
    return {
      editShare:{
        name:"",
        description:"",
        isPublic:"",
        oldName:name
      },
      size:2,
      visible:false,
      saving: false,
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 255},
          {type: 'onlyLetter_MinusNumber'}
        ],
        description: [
          { trigger: 'blur change' },
          { type: 'maxSize', value: 255 },
          { type: 'no_Chinese_mark' }
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
  },
  methods:{
    initDialog() {
      var self = this;
      self.visible = true;
    },
    show() {
      this.visible = true;
      this.editShare.oldName = this.editShare.name;
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      let self = this;
      self.$refs.editShareForm.validate(async(valid) => {
      if (valid) {
        var Pid = this.$cookie.get('pid');
        var name = self.editShare.name;
        var desc = self.editShare.description;
        var url = "api/manila/v2/" + Pid+ "/shares/"+self.editShareData.id;
        let body = {
          "share": {
            "display_name": name,
            "display_description": desc
          }
        };
        body = JSON.stringify(body);
        let logMsg = {
          en:"Before the name is edited:"+self.editShare.oldName+",after editing:"+name,
          zh:"名称编辑前:"+self.editShare.oldName+",编辑后:"+name
        }
        self.saving = true;
        try {
          let ret = await this.$ajax({
            url: url,
            data: body,
            type: 'put',
            // successMsg: "成功编辑云硬盘名称描述！",
            errorKey: "message",
            log:{
                description:{
                  en:"Edit storage share:" + name+"["+logMsg.en+"]",
                  zh_cn:"编辑文件存储:" + name+"["+logMsg.zh+"]"
                },
                target:Vue.logTarget.storage_share
              }
          });
          this.$emit("handleShow", {});
          this.$emit("onRefresh", {});
        } catch (data) {
          self.saving = false;
          __DEV__ && console.error(data);
        }
      } else {
          return false;
        }
      });
    },
    cancelFun() {
      this.$emit("handleShow");
    },
    changeFlagValue() {}
  }
}
</script>