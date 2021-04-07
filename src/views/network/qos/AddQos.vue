<template>
<div>
  <el-dialog :title="$t('network.createQosstrategy')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-12"  v-model="form.name"></el-input>
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
      <el-form-item :label="$t('lang.desc')"  prop="description">
        <el-input type="textarea" class="col-12"  v-model="form.description"></el-input>
      </el-form-item>
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
  name:"AddQos",
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
        name: "",
        description: ""
      },
      rules: {
        projectName: [
          {type: 'required'}
        ],
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: 'required'},
          {type: 'maxSize', value: 40}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ]
      }
    }
  },
  mounted() {
    this.$parent.$parent.active = "RuleView";
    this.dialogVisible = true;
    let roleType = Vue.roleType + "";
    if (roleType == "0") {
      this.query_porject = Vue.projectListforNet;
    } else {
      this.form.project_id = Vue.cookie.get('pid');
    }
  },
  methods: {
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
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
    handleConfirm() {
      let self = this;
      let name = self.form.name;
      let desc = self.form.description;
      let proId = self.form.project_id;
      let reqdata = {"policy":{
        "name": name,
        "description": desc,
        "project_id": proId}
      };
      self.$refs.form.validate(async(valid) => {
        if (valid) {
          try {
            self.loading = true;
            self.isDisabled = true;
            let result = self.$ajax({
              type: "POST",
              url: "api/neutron/v2.0/qos/policies",
              data: JSON.stringify(reqdata),
              successMsg: Vue.t('network.saveSuccess'),
              complete: function(XMLHttpRequest, textStatus) {
                self.loading = false;
                self.isDisabled = false;
              },
              success: function(result) {
                self.$emit("handleAddShow", {});
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en:"Create QoS:" + name,
                  zh_cn:"创建QoS策略:" + name
                },
                target:Vue.logTarget.qosList
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