<template>
<div>
  <el-dialog :title="$t('network.createSafeteam')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="sgName">
        <el-input class="col-12"  v-model="form.sgName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.project')" class="is-required" prop="projectName" v-if="roleType == '0'">
        <!--<el-select class="col-12" v-model="form.project_id" filterable clearable>
          <el-option v-for="item in query_porject"
          :key="item.id"
          :label="item.name"
          :value="item.id"></el-option>
        </el-select>-->
        <el-input auto-complete="off" class="col-12" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="form.projectName"></el-input>
      </el-form-item>
      <el-row><el-col :span="24">
      <el-form-item :label="$t('lang.desc')"  prop="description">
         <el-input type="textarea" class="col-12"  v-model="form.description"></el-input>
      </el-form-item>
      </el-col></el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="handleConfirm" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
  <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script type="text/javascript">
export default {
  name:"AddSafeteam",
  data() {
    return {
      dialogVisible: false,
      roleType: Vue.roleType + "",
      loading: false,
      isDisabled: false,
      query_porject: [],
      selProjectFlg:false,
      close: "",
      form: {
        project_id: "",
        projectName:"",
        sgName: "",
        description: ""
      },
      rules: {
        projectName: [
          {type: 'requiredNet'}
        ],
        sgName: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: 'requiredNet'},
          {type: 'maxSize', value: 40}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ]
      }
    }
  },
  mounted() {
    this.$parent.$parent.active = "Safeteam";
    this.initDialog();
    let roleType = Vue.roleType + "";
    if (roleType == "0") {
      this.query_porject = Vue.projectListforNet;
    } else {
      this.form.project_id = Vue.cookie.get('pid');
    }
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      this.$emit("handleAddShow", {});
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.form.project_id = id;
      this.form.projectName = name;
      this.close = 'close';
    },
    onIconClick() {
      this.form.project_id = '';
      this.form.projectName = '';
      this.close = '';
    },
    async getSafe() {
      let self = this;
      let projectId = self.form.project_id;
      try {
        let url = "";
        url = "api/neutron/v2.0/security-groups?tenant_id=" + projectId;
        await self.$ajax({
          type: "GET",
          url: url,
          errorKey: "NeutronError"
        });
      } catch (res) {
      }
    },
    handleConfirm() {
      var self = this;
      let name = self.form.sgName;
      let desc = self.form.description;
      let proId = self.form.project_id;
      let roleType = Vue.roleType + "";
      let reqdata = {"security_group":{
        "name": name,
        "description": desc,
        "project_id": proId}
      };
      self.$refs.form.validate(async(valid) => {
        if (valid) {
          try {
            self.loading = true;
            self.isDisabled = true;
            if (roleType === "0") {
              await self.getSafe();
            }
            let result = await self.$ajax({
              type: "POST",
              url: "api/neutron/v2.0/security-groups",
              data: JSON.stringify(reqdata),
              successMsg: Vue.t('network.saveSuccess'),
              success: function(result) {
                self.loading = false;
                self.isDisabled = false;
                self.cancel();
              },
              errFun() {
                self.loading = false;
                self.isDisabled = false;
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en:"Create Security Group:" + name,
                  zh_cn:"创建安全组:" + name
                },
                target:Vue.logTarget.securityGroup
              }
            });
          } catch (res) {
            console.log(res);
          }
          return true;
        } else {
          return false;
        }
      });
    }
  }
}
</script>
