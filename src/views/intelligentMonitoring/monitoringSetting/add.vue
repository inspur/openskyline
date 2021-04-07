<template>
  <div v-loading="loading" class="monitoring-set">
    <icos-page-header :title="$t('monitor.ADD_PAGE')" :show-back="true" @back="pageHeaderBackHandle" :show-bottom-border="false" />
    <el-collapse v-model="activeNames">
      <el-collapse-item :title="$t('base.baseInfo')" name="1" style="min-width:1200px;">
        <span class="idatath">{{$t('monitor.GROUP_NAME')}}：</span>
        <span class="idatatd"><el-input style="width:auto;" v-model="info.name"></el-input></span>

        <span class="idatath" style="margin-left:250px;">{{$t('monitor.alarmStatus')}}：</span>
        <span class="idatatd">
          <el-switch
            v-model="info.alarmStatus"
            on-value="1"
            off-value="0"
            :on-text="$t('base.on')"
            :off-text="$t('base.off')"
          ></el-switch>
        </span>

        <span class="idatath" style="margin-left:250px;" v-if="projectSelectShow">{{$t('base.project')}}：</span>
        <el-select v-model="project" clearable v-if="projectSelectShow" @change="resourcesData=[]">
          <el-option v-for="(v, i) in projects" :key="i" :label="v.label" :value="v.value" />
        </el-select>
      </el-collapse-item>

      <el-collapse-item name="3">
        <template slot="title">
          {{$t('base.notificationConf')}}
          <el-switch
            style="margin-left:10px;"
            v-model="info.noticeStatus"
            v-if="operatorAuth"
            on-value="1"
            off-value="0"
            :on-text="$t('base.on')"
            :off-text="$t('base.off')"
            @change="noticeStatusChange"
          ></el-switch>
        </template>
        <el-row :gutter="10">
          <el-col :span="16">
            <el-form ref="noticeSet" :model="noticeObj" label-width="160px" :rules="rules">
              <el-form-item :label="$t('monitor.contactName')" prop="notice_user">
                <el-input
                  v-model="noticeObj.notice_user"
                  auto-complete="off"
                  :disabled="info.noticeStatus==0"
                ></el-input>
              </el-form-item>
              <el-form-item :label="$t('monitor.notificationMethod')" prop="mail_list">
                <el-row>
                  <el-col :span="6">
                    <el-checkbox
                      v-model="emailCheckbox"
                      :disabled="info.noticeStatus==0"
                    >{{$t('base.mail')}}</el-checkbox>
                  </el-col>
                  <el-col :span="18">
                    <el-input
                      v-model="noticeObj.mail_list"
                      :placeholder="$t('monitor.mailAddress')"
                      auto-complete="off"
                      :disabled="info.noticeStatus==0||!emailCheckbox"
                    ></el-input>
                  </el-col>
                </el-row>
              </el-form-item>
              <el-form-item prop="phone_list">
                <el-row>
                  <el-col :span="6">
                    <el-checkbox
                      v-model="messageCheckbox"
                      :disabled="info.noticeStatus==0"
                    >{{$t('base.shortMessage')}}</el-checkbox>
                  </el-col>
                  <el-col :span="18">
                    <el-input
                      v-model="noticeObj.phone_list"
                      :placeholder="$t('monitor.telephoneNumber')"
                      auto-complete="off"
                      :disabled="info.noticeStatus==0||!messageCheckbox"
                    ></el-input>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="8">
            <el-form>
              <el-form-item label>&nbsp;</el-form-item>
              <el-form-item :label="$t('base.emailPrompt')"></el-form-item>
              <el-form-item :label="$t('base.numberPrompt')"></el-form-item>
            </el-form>
          </el-col>
        </el-row>
      </el-collapse-item>

      <el-collapse-item name='4'>
        <template slot="title">
          {{$t('base.resourceList')}}
          <el-button
            style="margin-left:10px;"
            type="primary"
            @click="resourcesClick"
          >{{$t('base.addTo')}}</el-button>
        </template>
        <el-table
          ref="resourcesTable"
          :data="resourcesData" v-loading="resourcesLoading"
          :element-loading-text="$t('base.loadingData')"
          highlight-current-row
          style="width: 100%"
          row-key="resource_id"
          @row-click="rowClick"
          @selection-change="resourcesSelectionChange">
          <el-table-column
            prop="resource_name"
            :label="$t('base.resourceName')"
            min-width="100">
          </el-table-column>
          <el-table-column
            prop="resource_address"
            :label="$t('base.address')"
            min-width="100">
          </el-table-column>
          <el-table-column
            prop="resource_sc_name"
            :label="$t('base.resouceType')"
            min-width="100">
          </el-table-column>
        </el-table>
      </el-collapse-item>

      <el-collapse-item :title="$t('base.monAlarmSetting')" name="2">
        <span>{{isCN?'按告警分类筛选：':'filter by alarm classification'}}</span>
        <el-select v-model="collectDescribeItem" @change="collectDescribeChange" clearable>
          <el-option v-for="(v, i) in collectDescribe" :key="i" :label="v" :value="v" />
        </el-select>

        <div><span>{{$t('base.FrequRange')}}</span></div>
        <span>{{$t('base.thresholdRange')}}</span>
        <span>{{$t('monitor.promp1')}}</span>
        <el-table ref="itemTable" :data="alertList" highlight-current-row style="width: 100%">
          <el-table-column
            prop="alert_display_name"
            :label="$t('base.alarnItem')+'('+$t('base.unit')+')'"
            min-width="100"
          >
            <template slot-scope="scope">
              <span
                v-if="scope.row.threshold_unit !== '-' && scope.row.threshold_unit !== ''"
              >{{scope.row.alert_display_name+(scope.row.default_alert_flag==2?'':"("+scope.row.threshold_unit+")")}}</span>
              <span v-else>{{ scope.row.alert_display_name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="describe"
            :label="isCN?'告警分类':'alarm classification'"
            min-width="100"
          ></el-table-column>
          <el-table-column
            prop="collect_interval"
            :label="$t('base.frequency')+'('+$t('base.unit')+':s)'"
            min-width="100"
          >
            <template slot-scope="scope">
              <el-input
                v-if="scope.row.interval_modify_flag==1&&operatorAuth"
                v-model="scope.row.collect_interval"
              ></el-input>
              <span v-if="scope.row.interval_modify_flag!=1||!operatorAuth">{{scope.row.collect_interval}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="warn_threshold"
            :label="$t('base.minorThreshold')"
            min-width="100"
          >
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.warn_threshold"
                v-if="info.alarmStatus==1&&scope.row.default_alert_flag==1&&operatorAuth&&scope.row.threshold_display_type!='1'"
              ></el-input>
              <span
                v-if="info.alarmStatus==0||scope.row.default_alert_flag==0||!operatorAuth||scope.row.threshold_display_type=='1'"
              >
                <span>{{ scope.row.warn_threshold | displayOrMinus }}</span>
              </span>
              <span v-if="scope.row.default_alert_flag==2">-</span>
              <!-- <el-tooltip
                effect="dark"
                v-if="scope.row.alert_name=='docker_cpu_utilization'&&info.alarmStatus==1&&scope.row.default_alert_flag==1&&operatorAuth&&scope.row.threshold_display_type!='1'"
              >
                <div slot="content">0~999999的整数</div>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip> -->
            </template>
          </el-table-column>

          <el-table-column
            prop="crit_threshold"
            :label="$t('base.moderateThreshold')"
            min-width="100"
          >
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.crit_threshold"
                v-if="info.alarmStatus==1&&scope.row.default_alert_flag==1&&operatorAuth&&scope.row.threshold_display_type!='1'"
              ></el-input>
              <span
                v-if="info.alarmStatus==0||scope.row.default_alert_flag==0||!operatorAuth||scope.row.threshold_display_type=='1'"
              >
                <span>{{ scope.row.crit_threshold | displayOrMinus }}</span>
              </span>
              <span v-if="scope.row.default_alert_flag==2">-</span>
              <!-- <el-tooltip
                effect="dark"
                v-if="scope.row.alert_name=='docker_cpu_utilization'&&info.alarmStatus==1&&scope.row.default_alert_flag==1&&operatorAuth&&scope.row.threshold_display_type!='1'"
              >
                <div slot="content">0~999999的整数</div>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip> -->
            </template>
          </el-table-column>
          <el-table-column prop="default_alert_flag" :label="$t('monitor.alarmSwitch')" min-width="100">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.default_alert_flag"
                v-if="info.alarmStatus==1&&operatorAuth&&scope.row.default_alert_flag!='2'"
                on-value="1"
                off-value="0"
                :on-text="$t('base.on')"
                :off-text="$t('base.off')"
              ></el-switch>
              <span
                v-if="(info.alarmStatus==0||!operatorAuth)&&scope.row.default_alert_flag!='2'"
              >{{scope.row.default_alert_flag==0?$t('base.off'):$t('base.on')}}</span>
              <span v-if="scope.row.default_alert_flag==2">-</span>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>
    <name-edit ref="nameEdit" @handler='nameEditHandler'></name-edit>
    <config ref="config" :selectedRow='selectedRow' from='add' @updateData='updateResources' :classId='$route.params.classID' :project='project'></config>
    <el-button
      type="primary"
      @click="saveData.bind(this)()"
    >{{$t('base.save')}}</el-button>
  </div>
</template>
<script>
import nameEdit from "./name-edit";
import config from "./config";

export default {
  name: "Setting",
  components: { nameEdit, config },
  props: ["centerId"],
  data() {
    var phoneCheck = (rule, value, callback) => {
      if (value == "") {
        callback();
        // callback(new Error(Vue.t("validation.required")));
      } else {
        let reg = /(^\d{10,11}$)|(^\d{7,8}$)|(^(\d{3,4})\-(\d{7,8})$)|(^(\d{3,4})\-(\d{7,8})\-(\d{1,4})$)|(^(\d{7,8})\-(\d{1,4})$)/;
        let arr = value.split(";");
        let flg = arr.every(item => {
          if (item == "") {
            return true;
          } else {
            return reg.test(item);
          }
        });
        if (flg) {
          callback();
        } else {
          callback(new Error(Vue.t("base.numberWarn")));
        }
      }
    };
    var emailCheck = (rule, value, callback) => {
      if (value == "") {
        callback();
        // callback(new Error(Vue.t("validation.required")));
      } else {
        let reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let arr = value.split(";");
        let flg = arr.every(item => {
          if (item == "") {
            return true;
          } else {
            return reg.test(item);
          }
        });
        if (flg) {
          callback();
        } else {
          callback(new Error(Vue.t("base.emailWarn")));
        }
      }
    };
    return {
      isCN: String(Vue.config.lang) === 'zh-cn',
      activeNames: ["1", "2", "3", '4'],
      resourcesLoading: false,
      resourcesData: [],
      project: '',
      projects: [],
      projectSelectShow: false,
      collectDescribeItem: '',
      collectDescribe: [],
      info: {
        id: "",
        collect_flag: "",
        monitor_time: "",
        alarmStatus: "1",
        noticeStatus: "",
        name: ""
      },
      collectName: "",
      emailCheckbox: false,
      messageCheckbox: false,
      operatorAuth: true, //Vue.AuthList["m.monitor.operator"],
      loading: false,
      selectedRowsRadio: "",
      selectFirst: "",
      warnData: [],
      warnDataBak: [],
      noticeObj: {
        notice_user: "",
        notice_flag: "1",
        phone_list: "",
        mail_list: ""
      },
      rules: {
        notice_user: [{ type: "required" }, { type: "maxSize", value: 40 }],
        phone_list: [
          // { type: "required" },
          { validator: phoneCheck, trigger: "blur" }
        ],
        mail_list: [
          // { type: "required" },
          { validator: emailCheck, trigger: "blur" }
        ]
      },
      selectedRow: {},
      alertList_: [],
      alertList: []
    };
  },
  created() {
    this.selectedRow = this.$route.params.selectedRow || {};
  },
  mounted() {
    this.projectSelectShow = Vue.roleType == '0' && (this.$route.params.classID == 'vm' || this.$route.params.classID == 'cpm');

    if (this.projectSelectShow) {
      this.loadProject();
    }
    this.getAlertList();
  },
  methods: {
    pageHeaderBackHandle(v) {
      let route = this.$route || {};
      let matched = route.matched || [];
      let p = matched[matched.length - 1].parent || {};
      this.$router.push({ path: p.path });
    },
    updateResources(v) {
      this.resourcesData = JSON.parse(JSON.stringify(v));
      this.resourcesData.forEach(v => {
        let cn = Vue.config.lang === "zh-cn";
        v.resource_name = cn ? v.resource_name_cn : v.resource_name_en;
        v.resource_sc_name = cn ? v.resource_sc_name_cn : v.resource_sc_name_en;
      });
    },
    rowClick(v) {

    },
    resourcesSelectionChange(v) {

    },
    resourcesClick(v) {
      v.stopPropagation();
      if (this.projectSelectShow && !this.project) {
        this.$notify({title: Vue.t('base.prompt'), type: 'warning', message: '请在基本信息里先选中一项项目ID'});
        return;
      }
      this.$refs.config.show({ selectedRow: this.selectedRow });
    },
    async loadProject(v) {
      let url = `api/keystone/v3/inspur/projects?domain_id=default`;
      const r = await this.$ajax({
        type: "get",
        url: url
      });
      let a = r.projects || [];
      this.projects = Array.from(a, v => {
        return { label: v.name, value: v.id };
      });
    },
    async saveData() {
      if (!this.info.name) {
        this.$notify({title: Vue.t('base.prompt'), type: 'warning', message: this.isCN ? '组名不能为空' : 'name is not empty'});
        return;
      }

      if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(this.info.name)) {
        this.$notify({title: Vue.t('base.prompt'), type: 'warning', message: `${this.$t("monitor.GROUP_NAME")}:${this.$t("validation.onlyLetter_MinusNumberChinese")}`});
        return;
      }

      if (this.info.name.length > 40) {
        this.$notify({title: Vue.t('base.prompt'), type: 'warning', message: '组名称长度不能大于40'});
        return;
      }

      if (this.projectSelectShow && !this.project) {
        this.$notify({title: Vue.t('base.prompt'), type: 'warning', message: '请在基本信息里先选中一项项目ID'});
        return;
      }

      let flg = true;
      if (this.info.noticeStatus == '1') {
        this.$refs.noticeSet.validate(valid => {
          // if (!valid) {
          //   this.$notify({
          //     message: Vue.t("monitor.promp3"),
          //     type: "warning"
          //   });
          //   return valid;
          // }

          if (this.noticeObj.notice_user == '') {
            this.$notify({
              message: '联系人姓名不能为空',
              type: "warning"
            });
            flg = false;
            return false;
          }
          if (this.noticeObj.notice_user.length > 40) {
            this.$notify({
              message: '联系人姓名字数不能大于40个',
              type: "warning"
            });
            flg = false;
            return false;
          }

          this.noticeObj.if_phone = this.messageCheckbox ? "1" : "0";
          this.noticeObj.if_email = this.emailCheckbox ? "1" : "0";
          if (!this.messageCheckbox && !this.emailCheckbox) {
            this.$notify({
              message: Vue.t("monitor.promp3"),
              type: "warning"
            });
            flg = false;
            return false;
          }
          if (this.messageCheckbox && this.noticeObj.phone_list == "") {
            this.$notify({
              message: Vue.t("monitor.promp4"),
              type: "warning"
            });
            flg = false;
            return false;
          }
          if (this.noticeObj.phone_list.length > 200) {
            this.$notify({
              message: Vue.t("monitor.promp15"),
              type: "warning"
            });
            flg = false;
            return false;
          }
          let phoneFlag = true;
          this.noticeObj.phone_list.split(";").forEach(item => {
            let re = /^1\d{10}$/;
            if (item != "" && !re.test(item)) {
              phoneFlag = false;
            }
          });
          if (!phoneFlag) {
            this.$notify({
              message: Vue.t("monitor.wrongPhone"),
              type: "warning"
            });
            flg = false;
            return false;
          }
          if (this.emailCheckbox && this.noticeObj.mail_list == "") {
            this.$notify({
              message: Vue.t("monitor.promp5"),
              type: "warning"
            });
            flg = false;
            return false;
          }
          if (this.noticeObj.mail_list.length > 200) {
            this.$notify({
              message: Vue.t("monitor.promp14"),
              type: "warning"
            });
            flg = false;
            return false;
          }
          let emailFlag = true;
          this.noticeObj.mail_list.split(";").forEach(item => {
            let reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (item != "" && !reg.test(item)) {
              emailFlag = false;
            }
          });
          if (!emailFlag) {
            this.$notify({
              message: Vue.t("monitor.wrongEmail"),
              type: "warning"
            });
            flg = false;
            return false;
          }
        });
      }

      if (!flg) {
        return;
      }

      this.alertList_.forEach((item) => {
        if (item.threshold_display_type == "1") {
          return;
        }
        if (!flg) {
          return;
        }

        let tu = item.threshold_unit;
        let ct = item.crit_threshold;
        let wt = item.warn_threshold;
        if (tu == "%") {
          let f = !isNaN(ct) &&
            ct.toString().indexOf(".") == -1 &&
            ct >= 0 &&
            ct <= 100 &&
            !isNaN(wt) &&
            wt.toString().indexOf(".") == -1 &&
            wt >= 0 &&
            wt <= 100;

          if (item.threshold_operator != null && item.threshold_operator.indexOf(">") >= 0) {
            f = f && parseInt(ct) > parseInt(wt);
          } else if (item.threshold_operator != null && item.threshold_operator.indexOf("<") >= 0) {
            f = f && parseInt(ct) < parseInt(wt);
          }
          flg = f;
        } else {
          let g = !isNaN(ct) &&
            ct.toString().indexOf(".") == -1 &&
            ct >= 0 &&
            ct <= 999999 &&
            !isNaN(wt) &&
            wt.toString().indexOf(".") == -1 &&
            wt >= 0 &&
            wt <= 999999;
          if (item.threshold_operator != null && item.threshold_operator.indexOf(">") >= 0) {
            g = g && parseInt(ct) > parseInt(wt);
          } else if (item.threshold_operator != null && item.threshold_operator.indexOf("<") >= 0) {
            g = g && parseInt(ct) < parseInt(wt);
          }
          flg = g;
        }
      });

      if (!flg) {
        this.$notify({
          message: Vue.t("base.thresholdCheck"),
          type: "warning"
        });
        return;
      }

      let a = [];
      this.alertList_.forEach(v => {
        let o = {};
        o.crit_threshold = '';
        if (v.crit_threshold != "-" && v.threshold_display_type != "1") {
          o.crit_threshold = Math.abs(parseInt(v.crit_threshold)) + '';
        }
        o.warn_threshold = '';
        if (v.warn_threshold != "-" && v.threshold_display_type != "1") {
          o.warn_threshold = Math.abs(parseInt(v.warn_threshold)) + '';
        }
        o.alert_id = v.alert_id;
        o.alert_flag = v.default_alert_flag;
        a.push(o);
      });
      let template = {
        "name": this.info.name,
        "sc_id": this.$route.params.classID,
        "if_phone": this.messageCheckbox ? '1' : '0',
        "if_email": this.emailCheckbox ? '1' : '0',
        "notice_flag": this.info.noticeStatus,
        "alert_flag": this.info.alarmStatus
      }
      if (this.info.noticeStatus == '1') {
        if (this.noticeObj.notice_user) {
          template.notice_user = this.noticeObj.notice_user;
        }
        if (this.noticeObj.mail_list) {
          template.mail_list = this.noticeObj.mail_list;
        }
        if (this.noticeObj.phone_list) {
          template.phone_list = this.noticeObj.phone_list;
        }
      }

      if (Vue.roleType == "2") {
        template.project_id = this.$cookie.get("pid");
      } else {
        if (this.project) {
          template.project_id = this.project;
        }
      }
      let data = {
        alert_items: a,
        resources: this.resourcesData.map(v => v.resource_id),
        template: template
      };
      let r = await this.$ajax({
        type: "put",
        url: "api/pluto/v1/template/add",
        headers: {
        },
        data: JSON.stringify(data),
        log: {
          description: {
            en: "",
            zh_cn: "添加组:" + this.info.name + "成功"
          },
          target: Vue.logTarget.monitor
        }
      });

        this.$notify({title: Vue.t('base.prompt'), type: 'success', message: Vue.t('base.addSuccess')});

        this.$emit("refreshData", true);
        this.$router.push({
          path: "/intelligentMonitoring/monitoringSetting"
        });
    },
    async getAlertList() {
      let r = await this.$ajax({
        type: "get",
        url: "api/pluto/v1/alert/info/default/" + this.$route.params.classID,
        headers: {
        }
      });
      this.collectDescribe = [];
      let l = r.result || [];
      l.forEach(v => {
        let cn = Vue.config.lang === "zh-cn";
        v.describe = cn ? v.collect_display_name_cn : v.collect_display_name_en;
        v.alert_display_name = cn ? v.alert_display_name_cn : v.alert_display_name_en;

        if (!this.collectDescribe.includes(v.describe)) {
          this.collectDescribe.push(v.describe);
        }
      });
      this.alertList_ = JSON.parse(JSON.stringify(l));
      this.alertList = this.alertList_;
      // alert_display_name_cn: "网络流入丢包率"
      // alert_display_name_en: "netin dropped packet rate"
      // default_alert_flag: "0"
      // alert_name: "net_io_dropin"
      // collect_display_name_cn: "网络信息采集"
      // collect_display_name_en: "net collector"
      // collect_interval: "60"
      // crit_threshold: "10"
      // id: "02d01d23-e9d0-4b12-970b-8d8c0bf2b974"
      // threshold_display_type: "0"
      // threshold_unit: "个/s"
      // warn_threshold: "5"
    },
    collectDescribeChange(v) {
      if (!v) {
        this.alertList = this.alertList_;
        return;
      }
      this.alertList = this.alertList_.filter(v_ => {
        return v === v_.describe;
      });
    },
    nameEditHandler(v) {
      if (v.type === 'success') {
       }
    },
    noticeStatusChange(sta) {
      let self = this;
      self.noticeObj.notice_flag = sta;
    },
    setCurrnet() {
    }
  },
  filters: {
    displayOrMinus(value) {
      if (value === "" || value === null || value === undefined) {
        return "-";
      } else {
        return value;
      }
    }
  }
};
</script>
<style scoped>
.monitoring-set >>> .el-button {
  height: 32px;
}
.tip {
  margin: 100px;
  text-align: center;
}
</style>