<template>
  <el-dialog :title="$t('network.addRoutertable')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="addRouterTableForm" :model="addRouterTableForm"  class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('network.targetCidr')" class="is-required" prop="destCidr">
        <el-input class="col-12"  v-model="addRouterTableForm.destCidr"></el-input>
        <el-tooltip  effect="dark" :content="$t('network.networkNote13')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.nextJump')" class="is-required" prop="nextjump">
        <el-input class="col-12"  v-model="addRouterTableForm.nextjump"></el-input>
        <el-tooltip  effect="dark" :content="$t('network.networkNote10')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="addRouterTable" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>  
</template>
<script>
export default {
  name: 'addRouterTable',
  props: ["router_Id"],
  data() {
    return {
      flag: false,
      loading: false,
      dialogVisible: false,
      isDisabled: false,
      routerName:"",
      addRouterTableForm: {
        nextjump: "",
        destCidr: ""
      },
      routes: [],
      rules: {
        destCidr: [
          {
            type: 'cidr4cidr6',
            validator: function (rule, value, cb, source, options) {
              if (value === "") { return cb(); }
              let regV4V6 = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;
              let cidr4 = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2}((\/[0-9])|(\/[12][0-9])|(\/3[012])))|(2[0-4][0-9])((\/[0-9])|(\/[12][0-9])|(\/3[012]))|(25[0-5])((\/[0-9])|(\/[12][0-9])|(\/3[012])))$/;
              if (cidr4.test(value)) { return cb(); }
              let fields = value.split("/");
              if (fields.length === 2) {
                let subNet = fields[1];
                let ipv6 = fields[0];
                if (regV4V6.test(ipv6) && Number(subNet) >= 0 && Number(subNet) <= 128) {
                  return cb();
                } else {
                  cb(new Error(options.messages[rule.type]));
                }
              }
              cb(new Error(options.messages[rule.type]));
            }
          },
          {type: "requiredNet"},
          {type: 'forbiddenSpace'}
        ],
        nextjump: [
          {type: 'ipv4oripv6'},
          {type: "requiredNet"},
          {type: 'forbiddenSpace'}
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
      self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/routers/"+this.router_Id,
        success: function(result) {
          let routerInfo = result['router'];
          if (routerInfo.hasOwnProperty('routes')) {
            self.routes = routerInfo.routes;
          }
          self.routerName = routerInfo["name"];
        },
        errorKey: "NeutronError"
      });
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      this.$emit("handleAddShow", {});
    },
    addRouterTable() {
      let self = this;
      self.$refs.addRouterTableForm.validate(async(valid) => {
        if (valid) {
          self.isDisabled = true;
          self.loading = true;
          let logobj = {
            "destination": self.addRouterTableForm.destCidr,
            "nexthop": self.addRouterTableForm.nextjump
          };
          let routeObj = [{
            "destination": self.addRouterTableForm.destCidr,
            "nexthop": self.addRouterTableForm.nextjump
          }];
          if (self.routes.length > 0) {
            for (let i = self.routes.length - 1; i >= 0; i--) {
              routeObj.push(self.routes[i]);
            }
          }
          let reqdata = {};
          reqdata.router = {};
          reqdata.router.routes = routeObj;
          self.loading = true;
          let result = self.$ajax({
            type: "PUT",
            url: "api/neutron/v2.0/routers/" + this.router_Id,
            data: JSON.stringify(reqdata),
            success: function(result) {
              self.$notify({
                message: Vue.t('network.saveSuccess'),
                type: "success"
              });
              self.isDisabled = false;
              self.loading = false;
              self.cancel();
            },
            errorKey: "NeutronError",
            errFun() {
              self.isDisabled = false;
              self.loading = false;
            },
            log:{
              description:{
                en:self.routerName+" Add Static Router Table:" + JSON.stringify(logobj),
                zh_cn:self.routerName+"添加静态路由表:" + JSON.stringify(logobj)
              },
              target:Vue.logTarget.staticlist
            }
          });
          return true;
        } else {
          return false;
        }
      });
    }
  }
}
</script>