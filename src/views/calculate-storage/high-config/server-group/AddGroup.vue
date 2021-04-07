<template>
  <div>
    <el-dialog :title="$t('calcStorLang.addServerGroup')" :visible.sync="dialogVisible" :before-close="handleClose" size="small">
      <el-form ref="addResSpecForm" :model="keyPair" label-width="80px" :rules="rules">
        <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
          <el-input class="col-20" v-model="keyPair.name"></el-input>
        </el-form-item>
        <el-form-item prop="projectId" :label="$t('lang.project')" class="is-required" v-if="roleType === '0'">
          <el-input class="col-20" :placeholder="$t('base.selectProjectTitle')" auto-complete="off" size="small" :icon="keyPair.projectId === '' ? '' : 'close'" :on-icon-click="clearProject" :readonly="true" @focus="showSelectProjectDialog" v-model="keyPair.projectName"></el-input>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.groupStrategies')" class="is-required" v-if="keyPair.type==1">
          <el-select class="col-20" v-model="keyPair.option">
            <el-option :label="$t('calcStorLang.groupAffinity')" value="affinity"></el-option>
            <el-option :label="$t('calcStorLang.groupAntiAffinity')" value="anti-affinity"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" @click="confirmAddSpec" :loading="saving">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
    <select-project ref="selectProject" v-if="selectProjectDialog.visible" @getSelectProjects="handleSelectProject"></select-project>
  </div>
</template>
<script>
export default {
  name: 'AddGroup',
  data() {
    return {
      roleType: Vue.roleType + '',
      keyPair: {
        name: '',
        projectId: '',
        projectName: '',
        type: '1',
        option: 'anti-affinity',
        publicKey: ''
      },
      isShow: false,
      dialogVisible: false,
      saving: false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 255 },
          { type: 'startwithLetter_NoChineseDot' }
        ],
        projectId: [
          { type: 'required', trigger: 'blur change' }
        ]
      },
      selectProjectDialog: {
        visible: false
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.addResSpecForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    handleCancel() {
      this.$emit("handleShow", {});
    },
    handleClose(done) {
      this.$emit("handleShow", {});
      done();
    },
    confirmAddSpec() {
      this.$refs.addResSpecForm.validate(async(valid) => {
        if (valid) {
          this.saving = true;
          let name = this.keyPair.name;
          let type = this.keyPair.option;
          let url = `api/nova/v2.1/os-inspur-server-groups`;
          let body = {
            server_group: {
              name: name,
              policy: this.keyPair.option,
              project_id: this.roleType === '0' ? this.keyPair.projectId : this.$cookie.get('pid')
            }
          };
          try {
            let ret = await this.$ajax({
              url: url,
              data: JSON.stringify(body),
              type: 'post',
              successMsg: Vue.t('calcStorLang.addServerGroupSuccess'),
              headers: {
                'X-OpenStack-Nova-API-Version': 2.64
              },
              log: {
                description: {
                  en: "Add Group Affinity Strategy:" + name,
                  zh_cn: "创建亲和性策略：" + name
                },
                target: Vue.logTarget.computeServerGroup
              }
            });
            // this.loading = false;
            this.$emit("handleShow", {});
            this.$emit("loadServerGroupList", {});
          } catch (data) {
            this.saving = false;
            this.loading = false;
          }
        } else {
          return false;
        }
      });
    },
    clearProject() {
      this.keyPair.projectId = '';
      this.keyPair.projectName = '';
    },
    showSelectProjectDialog() {
      this.selectProjectDialog.visible = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    handleSelectProject(id, name) {
      this.keyPair.projectId = id;
      this.keyPair.projectName = name;
      this.selectProjectDialog.visible = false;
    }
  }
}
</script>
