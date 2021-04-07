<template>
  <el-dialog
    :title="$t('monitor.NOTIFICATION_SETTING')"
    :visible.sync="visible"
    class="setting-dialog"
  >
    <el-form :inline="true" :model="data" :rules="rules" ref="form" label-width="100px">
      <el-form-item :label="$t('monitor.alarmSwitch')">
        <el-switch v-model="data.alarmSwitch" on-text off-text></el-switch>
      </el-form-item>

      <el-form-item :label="$t('monitor.contactName')" prop="contactName" class="is-required">
        <el-input v-model="data.contactName" :disabled="!data.alarmSwitch"></el-input>
      </el-form-item>

      <el-form-item :label="$t('monitor.notificationMethod')">
        <el-checkbox-group v-model="checkboxGroup" :min="1">
          <el-checkbox
            v-for="i in checkboxOptions"
            :key="i"
            :label="i"
            :disabled="!data.alarmSwitch"
          >{{i}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item
        v-if="data.noticeType.message.flag"
        :label="data.noticeType.message.placeholder"
        class="is-required"
        prop="message"
      >
        <el-input
          v-model="data.noticeType.message.value"
          :disabled="!data.alarmSwitch"
          :placeholder="data.noticeType.message.placeholder"
        ></el-input>
        <span class="setting-dialog-tip">{{$t('base.numberPrompt')}}</span>
      </el-form-item>
      <el-form-item
        v-if="data.noticeType.mail.flag"
        :label="data.noticeType.mail.placeholder"
        class="is-required"
        prop="mail"
      >
        <el-input
          v-model="data.noticeType.mail.value"
          :disabled="!data.alarmSwitch"
          :placeholder="data.noticeType.mail.placeholder"
        ></el-input>
        <span class="setting-dialog-tip">{{$t('base.emailPrompt')}}</span>
      </el-form-item>
      <el-form-item :label="$t('monitor.alarmLevel')">
        <el-checkbox
          v-for="i in data.alarmLevel"
          :key="i.key"
          v-model="i.checked"
          :disabled="!data.alarmSwitch"
        >{{i.name}}</el-checkbox>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="close">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirm" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { utils } from "../../public/utils";
export default {
  name: "SettingDialog",
  props: {},
  components: {},
  watch: {
    $route(to, from) {},
    "data.alarmSwitch": function(v) {
      // this.$emit("callback", { type: "alarmSwitch", value: v });
    },
    checkboxGroup(to, from) {
      this.data.noticeType.message.flag =
        to.indexOf(this.checkboxOptions[0]) != -1;
      this.data.noticeType.mail.flag =
        to.indexOf(this.checkboxOptions[1]) != -1;
    }
  },
  computed: {},
  data() {
    return {
      saving: false,
      checkboxGroup: [],
      checkboxOptions: [Vue.t("base.shortMessage"), Vue.t("base.mail")],
      visible: false,
      rules: {
        contactName: [
          { type: "required", trigger: "blur change" },
          { type: "maxSize", value: 40 },
          { type: "onlyLetter_NumberChinese", value: 40 }
        ],
        message: {
          message: Vue.t("base.numberWarn"),
          type: "phone",
          validator: (rule, value, callback) => {
            let v = this.data.noticeType.message.value;
            let f = this.data.noticeType.message.flag;
            if (f && !v) {
              return callback(new Error());
            }
            let a = v.split(";").filter(v => v);
            let r = /^1\d{10}$/;
            if (a.every(v => r.test(v))) {
              callback();
            } else {
              callback(new Error());
            }
          }
        },
        mail: {
          message: Vue.t("base.emailWarn"),
          type: "email",
          validator: (rule, value, callback) => {
            let v = this.data.noticeType.mail.value;
            let f = this.data.noticeType.mail.flag;
            this.data.noticeType.mail.error = f && !v;
            if (this.data.noticeType.mail.error) {
              return callback(new Error());
            }
            let a = v.split(";").filter(v => v);
            let r = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (a.every(v => r.test(v))) {
              callback();
            } else {
              callback(new Error());
            }
          }
        }
      },
      data: {
        modelName: "",
        alarmSwitch: false,
        contactName: "",
        noticeType: {
          message: {
            value: "",
            flag: false,
            placeholder: Vue.t("monitor.telephoneNumber")
          },
          mail: {
            value: "",
            flag: false,
            placeholder: Vue.t("base.email")
          }
        },
        alarmLevel: [
          { key: "OK", name: Vue.t("base.normal"), checked: 0 },
          { key: "WARNING", name: Vue.t("base.slightAlarm"), checked: 0 },
          { key: "CRITICAL", name: Vue.t("base.critAlarm"), checked: 0 }
        ]
      }
    };
  },
  created() {},
  mounted() {},
  methods: {
    close(v) {
      this.visible = false;
    },
    show(v) {
      this.data.modelName = v["model_name"] || "";
      this.data.alarmSwitch = Boolean(+v["notice_flag"]);
      this.data.contactName = v["notice_username"] || "";

      let nt = parseInt(v["notice_type"]);
      let maf = nt == 0 || nt == 1;
      this.data.noticeType.mail.flag = maf;
      this.data.noticeType.mail.value = v["notice_email"] || "";
      let mef = nt == 0 || nt == 2;
      this.data.noticeType.message.flag = mef;
      this.data.noticeType.message.value = v["notice_phone"] || "";

      this.checkboxGroup = [];
      if (mef) {
        this.checkboxGroup.push(this.checkboxOptions[0]);
      }
      if (maf) {
        this.checkboxGroup.push(this.checkboxOptions[1]);
      }

      let nl = v["notice_level"] || "";
      nl = nl.split(",") || [];
      this.data.alarmLevel.forEach(e => {
        e.checked = nl.indexOf(e.key) != -1;
      });

      this.visible = true;
    },
    confirm(v) {
      let vm = this;
      let asf = this.data.alarmSwitch;
      let mef = this.data.noticeType.message.flag;
      let maf = this.data.noticeType.mail.flag;

      if (!mef && !maf) {
        this.$message({
          type: "warning",
          message: Vue.t("monitor.NOTIFICATION_METHOD_TIP")
        });
        return;
      }

      vm.$refs["form"].validate(v => {
        if (!v) {
          return;
        }
        this.close();
        this.setData();
      });
    },
    setData(v) {
      let vm = this;

      let asf = this.data.alarmSwitch;
      let d = {
        notice_flag: asf ? 1 : 0
      };

      let me = this.data.noticeType.message;
      let ma = this.data.noticeType.mail;
      let nl = this.data.alarmLevel.filter(v => v.checked);
      d["notice_level"] = nl.map(v => v.key).join(",");
      d["model_name"] = this.data.modelName;
      if (me.flag) {
        d["notice_phone"] = me.value;
      }
      if (ma.flag) {
        d["notice_email"] = ma.value;
      }
      d["notice_username"] = this.data.contactName;

      if (me.flag && ma.flag) {
        d["notice_type"] = 0;
      } else if (ma.flag) {
        d["notice_type"] = 1;
      } else if (me.flag) {
        d["notice_type"] = 2;
      }

      vm.saving = true;
      vm.$ajax({
        type: "post",
        url: `api/pluto/v1/model_notice`,
        data: JSON.stringify(d),
        successFun: function() {
          vm.$message({
            type: "success",
            message: Vue.t("monitor.successed")
          });

          vm.$emit("success");
          vm.saving = false;
        },
        errFun: function() {
          vm.saving = false;
        },
        log: {
          description: {
            en: `modify event monitoring notification settings，model name:${vm.data.modelName}`,
            zh_cn: `修改事件监控通知设置，model name:${vm.data.modelName}`
          },
          target: Vue.logTarget.eventMonitor
        }
      });
    }
  }
};
</script>

<style scoped>
.setting-dialog {
  overflow: hidden;
  text-align: center;
}
.setting-dialog::after {
  content: "";
  display: inline-block;
  vertical-align: middle;
  height: 100%;
  width: 0;
}
.setting-dialog >>> .el-dialog {
  display: inline-block;
  vertical-align: middle;
  position: unset;
  transform: unset;
  margin-bottom: unset;
  text-align: left;
}
.setting-dialog >>> .el-input {
  width: 280px;
}
.setting-dialog >>> .placeholder .el-form-item__label {
  opacity: 0;
}
.setting-dialog >>> .el-form .el-form-item .el-form-item__label {
  display: inline-block;
  width: 80px;
  text-align: right;
  margin-right: 15px;
}
.setting-dialog >>> .el-form .el-form-item {
  margin-bottom: 20px;
  display: block;
}
.setting-dialog >>> .el-dialog {
  width: 777px;
}
.setting-dialog-tip {
  color: #aaa;
  font-size: 12px;
}
</style>