<template>
  <el-dialog :title="$t('network.EDIT_ENDPOINT')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-20" v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" class="col-20" v-model="form.description"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="saveAdd" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name:"EditVPNServer",
  props: ["editrow"],
  data() {
    return {
      oldForm: new Map(),
      dialogVisible: false,
      loading: false,
      isDisabled: false,
      roleType: Vue.roleType + "",
      form: {
        name: "",
        description: ""
      },
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: "requiredNet"},
          {type: 'maxSize', value: 40}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
      this.form.name = this.editrow["name"];
      this.form.description = this.editrow["description"];
      for (let [k, v] of Object.entries(this.form)) {
        this.oldForm.set(k, v);
      }
    },
    handleClose(done) {
      this.$emit("handlerCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handlerCancelShow", {});
    },
    saveAdd() {
      let self = this;
      self.$refs.form.validate(async(valid) => {
        if (valid) {
          let formLabel = {
            name: Vue.t('lang.name'),
            description: Vue.t('lang.desc')
          };
          let logStr = '修改Endpoint组';
          for (let [k, v] of Object.entries(formLabel)) {
            logStr = logStr + `${v}修改前: ${self.oldForm.get(k)},${v}修改后: ${self.form[k]} `;
          }
          self.isDisabled = true;
          self.loading = true;
          let reqdata = {"endpoint_group":{
              "name": self.form.name,
              "description": self.form.description,
              "admin_state_up": self.form.managestatus
            }
          };
          try {
            self.loading = true;
            let result = await self.$ajax({
              type: "PUT",
              url: "api/neutron/v2.0/vpn/endpoint-groups/" + self.editrow["id"],
              data: JSON.stringify(reqdata),
              errorKey: "NeutronError",
              successMsg: Vue.t('network.saveSuccess'),
              success: function(result) {
                self.loading = false;
                self.isDisabled = false;
                self.$emit("handleEditShow", {});
              },
              errFun(xhr, status) {
                if (xhr.status == "404") {
                  self.$emit("handleEditShow", {});
                }
                self.loading = false;
                self.isDisabled = false;
              },
              log:{
                description:{
                  en:"Before edit EndpointGroups:" + self.editrow["name"]+", After:" + self.form.name,
                  zh_cn: logStr
                },
                target:Vue.logTarget.endpointGroup
              }
            });
          } catch (res) {
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
