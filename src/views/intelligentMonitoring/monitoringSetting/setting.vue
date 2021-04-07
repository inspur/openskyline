<template>
  <div v-loading="loading" class="monitoring-set">
    <icos-page-header :title="$t('monitor.EDIT_PAGE')" :show-back="true" @back="pageHeaderBackHandle" :show-bottom-border="false" />
    <el-collapse v-model="activeNames" v-if="selectedRow">
      <el-collapse-item :title="$t('base.baseInfo')" name="1">
        <span class="idatath">{{$t('monitor.GROUP_NAME')}}：</span>
        <span v-if="!defaultNameDisabled" class="idatatd" style="cursor: pointer;" @click="$refs.nameEdit.show({text:info.name,template_id:selectedRow.id})">{{info.name}}
          <i class="el-icon-edit" style="margin-left:5px;"></i>
        </span>
        <span v-else class="idatatd">{{info.name}}
        </span>

        <span class="idatath" style="margin-left:250px;">{{$t('monitor.alarmStatus')}}：</span>
        <span class="idatatd">
          <el-switch
            v-model="info.alarmStatus"
            v-if="operatorAuth"
            on-value="1"
            off-value="0"
            :on-text="$t('base.on')"
            :off-text="$t('base.off')"
            @change="alarmStatusChange"
            :disabled="defaultNameDisabled"
          ></el-switch>
          <span v-if="!operatorAuth">{{info.alarmStatus==0?$t('base.off'):$t('base.on')}}</span>
        </span>
      </el-collapse-item>

      <el-collapse-item name="3">
        <template slot="title">
          {{$t('base.notificationConf')}}
          <el-switch
           :disabled="defaultNameDisabled"
            style="margin-left:10px;"
            v-model="info.noticeStatus"
            v-if="operatorAuth"
            on-value="1"
            off-value="0"
            :on-text="$t('base.on')"
            :off-text="$t('base.off')"
            @change="noticeStatusChange"
          ></el-switch>
          <span style="margin-left:10px;" v-if="!operatorAuth">{{info.noticeStatus==0?$t('base.off'):$t('base.on')}}</span>
        </template>
        <el-row :gutter="10">
          <el-col :span="16">
            <el-form :disabled="defaultNameDisabled" ref="noticeSet" :model="noticeObj" label-width="160px" :rules="rules">
              <el-form-item :label="$t('monitor.contactName')" prop="notice_user">
                <el-input
                  v-model="noticeObj.notice_user"
                  auto-complete="off"
                  :disabled="info.noticeStatus==0 || defaultNameDisabled"
                ></el-input>
              </el-form-item>
              <el-form-item :label="$t('monitor.notificationMethod')" prop="mail_list">
                <el-row>
                  <el-col :span="6">
                    <el-checkbox
                      v-model="emailCheckbox"
                      :disabled="info.noticeStatus==0 || defaultNameDisabled"
                    >{{$t('base.mail')}}</el-checkbox>
                  </el-col>
                  <el-col :span="18">
                    <el-input
                      v-model="noticeObj.mail_list"
                      :placeholder="$t('monitor.mailAddress')"
                      auto-complete="off"
                      :disabled="info.noticeStatus==0||!emailCheckbox || defaultNameDisabled"
                    ></el-input>
                  </el-col>
                </el-row>
              </el-form-item>
              <el-form-item prop="phone_list">
                <el-row>
                  <el-col :span="6">
                    <el-checkbox
                      v-model="messageCheckbox"
                      :disabled="info.noticeStatus==0 || defaultNameDisabled"
                    >{{$t('base.shortMessage')}}</el-checkbox>
                  </el-col>
                  <el-col :span="18">
                    <el-input
                      v-model="noticeObj.phone_list"
                      :placeholder="$t('monitor.telephoneNumber')"
                      auto-complete="off"
                      :disabled="info.noticeStatus==0||!messageCheckbox || defaultNameDisabled"
                    ></el-input>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-form>
            <el-button
              type="primary"
              @click="saveNoticeFun"
              :disabled="info.noticeStatus==0 || defaultNameDisabled"
            >{{$t('base.save')}}</el-button>
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
            :disabled="defaultNameDisabled"
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
          <el-table-column
            prop="operating"
            :label="$t('base.operating')"
            min-width="50">
            <template slot-scope="scope">
              <el-button
                type="text"
                :disabled="(roleType=='0'&&$route.params.selectedRow.default_flag=='1') || defaultNameDisabled"
                @click="resourcesDeleteClick(scope.row)"
              >{{$t('base.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          class="right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </el-collapse-item>

      <el-collapse-item :title="$t('base.monAlarmSetting')" name="2">
        <span>{{isCN?'按告警分类筛选：':'filter by alarm classification'}}</span>
        <el-select v-model="collectDescribeItem" @change="collectDescribeChange" clearable>
          <el-option v-for="(v, i) in collectDescribe" :key="i" :label="v" :value="v" />
        </el-select>

        <el-button
          style="margin-bottom:6px;"
          v-if="info.alarmStatus==1&&operatorAuth"
          type="primary"
          @click="saveWarnFun"
          :disabled="defaultNameDisabled"
        >{{$t('base.save')}}</el-button>

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
              >{{scope.row.alert_display_name+(scope.row.alert_flag==2?'':"("+scope.row.threshold_unit+")")}}</span>
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
               :disabled="defaultNameDisabled"
                v-if="scope.row.interval_modify_flag==1&&operatorAuth"
                v-model="scope.row.collect_interval"
              ></el-input>
              <span v-if="scope.row.interval_modify_flag!=1">{{scope.row.collect_interval}}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="warn_threshold"
            :label="$t('base.minorThreshold')"
            min-width="100"
          >
            <template slot-scope="scope">
              <el-input
               :disabled="defaultNameDisabled"
                v-model="scope.row.warn_threshold"
                v-if="info.alarmStatus==1&&scope.row.alert_flag==1&&operatorAuth&&scope.row.threshold_display_type!='1'"
              ></el-input>
              <span
                v-if="info.alarmStatus==0||scope.row.alert_flag==0||scope.row.threshold_display_type=='1'"
              >
                <span>{{ scope.row.warn_threshold | displayOrMinus }}</span>
              </span>
              <span v-if="scope.row.alert_flag==2">-</span>
              <!-- <el-tooltip
                effect="dark"
                v-if="scope.row.alert_name=='docker_cpu_utilization'&&info.alarmStatus==1&&scope.row.alert_flag==1&&operatorAuth&&scope.row.threshold_display_type!='1'"
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
               :disabled="defaultNameDisabled"
                v-model="scope.row.crit_threshold"
                v-if="info.alarmStatus==1&&scope.row.alert_flag==1&&operatorAuth&&scope.row.threshold_display_type!='1'"
              ></el-input>
              <span
                v-if="info.alarmStatus==0||scope.row.alert_flag==0||scope.row.threshold_display_type=='1'"
              >
              <span>{{ scope.row.crit_threshold | displayOrMinus }}</span>
              </span>
              <span v-if="scope.row.alert_flag==2">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="alert_flag" :label="$t('monitor.alarmSwitch')" min-width="100">
            <template slot-scope="scope">
              <el-switch
               :disabled="defaultNameDisabled"
                v-model="scope.row.alert_flag"
                v-if="info.alarmStatus==1&&operatorAuth"
                on-value="1"
                off-value="0"
                :on-text="$t('base.on')"
                :off-text="$t('base.off')"
              ></el-switch>
              <span v-if="info.alarmStatus==0"
              >{{info.alarmStatus==0?$t('base.off'):$t('base.on')}}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>
    <div v-else class="tip">
      此页面禁止单独刷新，请从父页面点击跳转而来，因为单独刷新无法得到父页面的传来的数据。
    </div>
    <name-edit ref="nameEdit" @handler='nameEditHandler'></name-edit>
    <config ref="config" :selectedRow='selectedRow' :classId='$route.params.classID' @refreshData='getResources'></config>
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
      roleType: Vue.roleType + "",
      isCN: String(Vue.config.lang) === 'zh-cn',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      activeNames: ["1", "2", "3", '4'],
      resourcesLoading: false,
      resourcesData: [],
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
      colData: [],
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
    this.resetData();
  },
  mounted() {
    this.getResources();
    this.getAlertList();
  },
  computed: {
    defaultNameDisabled() {
      return this.roleType == '2' && this.$route.params.selectedRow.default_flag == '1';
    }
  },
  methods: {
    pageHeaderBackHandle(v) {
      let route = this.$route || {};
      let matched = route.matched || [];
      let p = matched[matched.length - 1].parent || {};
      this.$router.push({ path: p.path });
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getResources();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getResources();
    },
    rowClick(v) {

    },
    resourcesSelectionChange(v) {

    },
    async resourcesDeleteClick(v) {
      let r = await this.$confirm(
        '是否确认删除？',
        Vue.t("base.prompt"),
        {
          confirmButtonText: Vue.t("lang.confirm"),
          cancelButtonText: Vue.t("lang.cancel"),
          type: "warning"
        }
      ).catch(v => {
        return false;
      });

      if (!r) {
        return;
      }

      r = await this.$ajax({
        type: "post",
        url: "api/pluto/v1/template/resources/remove",
        headers: {
        },
        data: JSON.stringify({ids:[v.resource_id]}),
        log: {
          description: {
            en: '',
            zh_cn: '删除资源组：' + v.name
          },
          target: Vue.logTarget.monitor
        }
      });

      this.getResources();
    },
    resourcesClick(v) {
      v.stopPropagation();
      this.$refs.config.show({ selectedRow: this.selectedRow });
    },
    async getResources() {
      let data = {
        template_id: this.selectedRow.id,
        page_size: this.pageSize,
        subclass_id: this.$route.params.classID,
        current_page: this.currentPage
      }
      if (roleType == "0" && this.selectedRow.project_id != "-1") {
        data.project_id = this.selectedRow.project_id;
      } else if (roleType == "2") {
        data.project_id = this.$cookie.get("pid");
      }

      let r = await this.$ajax({
        type: "get",
        url: "api/pluto/v1/monitor/resources",
        data: data,
        headers: {
        }
      });
      r = r.resources || {};
      this.total = r.total;
      this.resourcesData = r.resource_list || [];
      this.resourcesData.forEach(v => {
        v.resource_name = this.isCN ? v.resource_name_cn : v.resource_name_en;
        v.resource_sc_name = this.isCN ? v.resource_sc_name_cn : v.resource_sc_name_en;
        // v.operating = Vue.t('base.delete');
      })
    },
    async getAlertList() {
      let r = await this.$ajax({
        type: "get",
        url: "api/pluto/v1/alert/list/" + this.selectedRow.id,
        headers: {
        }
      });
      this.collectDescribe = [];
      let l = r.alert_items || [];
      l.forEach(v => {
        v.describe = this.isCN ? v.collect_display_name_cn : v.collect_display_name_en;
        v.alert_display_name = this.isCN ? v.alert_display_name_cn : v.alert_display_name_en;

        if (!this.collectDescribe.includes(v.describe)) {
          this.collectDescribe.push(v.describe);
        }
      });
      this.alertList = l;
      this.alertList_ = JSON.parse(JSON.stringify(l));
      // alert_display_name_cn: "网络流入丢包率"
      // alert_display_name_en: "netin dropped packet rate"
      // alert_flag: "0"
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
        this.getBaseInfo();
      }
    },
    resetData() {
      let self = this;
      //编辑一个
      self.selectFirst = self.selectedRow;
      self.getBaseInfo();
      // Promise.all([self.getMonitorData()]).then(function(
      //   result
      // ) {
      //   self.setCurrnet();
      // });
    },
    alarmStatusChange(sta) {
      let self = this;
      if (sta == "0") {
        self
          .$confirm(
            Vue.t("monitor.closeAlarmConfirm") + "？",
            Vue.t("base.confirm"),
            {
              confirmButtonText: Vue.t("base.confirm"),
              cancelButtonText: Vue.t("base.cancel"),
              type: "warning"
            }
          )
          .then(() => {
            self.realalarmStatusChange(sta);
          })
          .catch(() => {
            self.info.alarmStatus = "1";
          });
      } else {
        self.realalarmStatusChange(sta);
      }
    },
    async realalarmStatusChange(sta) {
      let self = this;
      // var arr = [];
      let successMsg =
        sta == "0"
          ? Vue.t("monitor.closeSuccess")
          : Vue.t("monitor.startSuccess");
      let logMsg =
        sta == "0"
          ? "关闭告警，资源组：" + self.selectFirst.name
          : "开启告警，资源组：" + self.selectFirst.name;
      let logMsgEn =
        sta == "0"
          ? "Close Alarm" + self.selectFirst.name
          : "Open Alarm" + self.selectFirst.name;
      // arr.push(self.selectFirst.resource_id);
      let data = { template_id: this.selectedRow.id, alert_flag: sta };
      self.loading = true;
      let ret = await self.$ajax({
        type: "post",
        url: "api/pluto/v1/template/alert/off",
        data: JSON.stringify(data),
        headers: {
          FORWARD_UNION: self.centerId
        },
        // successMsg: successMsg,
        log: {
          description: {
            en: logMsgEn,
            zh_cn: logMsg
          },
          target: Vue.logTarget.monitor
        }
      }).catch(v => {
        self.loading = false;
        self.info.alarmStatus = sta == "0" ? "1" : "0";
      });

      self.loading = false;

      if (String(ret.status).toLowerCase() === 'error') {
        this.$notify({
          message: '没有权限',
          type: "warning"
        });
      } else {
      }

      self.getAlertList();
    },
    noticeStatusChange(sta) {
      let self = this;
      if (sta == "0") {
        self
          .$confirm(
            Vue.t("monitor.closeNoticeConfirm") + "？",
            Vue.t("base.confirm"),
            {
              confirmButtonText: Vue.t("base.confirm"),
              cancelButtonText: Vue.t("base.cancel"),
              type: "warning"
            }
          )
          .then(() => {
            self.noticeObj.notice_flag = '0';
            self.saveNoticeFun(sta);
            self.$refs.noticeSet.resetFields();
          })
          .catch(() => {
            self.info.noticeStatus = "1";
          });
      } else {
      }
    },
    // realnoticeStatusChange(sta) {
    //   let self = this;
    //   if (sta != "0") {
    //     //开启时需要点击保存
    //     return;
    //   }
    //   let successMsg =
    //     sta == "0"
    //       ? Vue.t("monitor.closeSuccess")
    //       : Vue.t("monitor.startSuccess");
    //   let logMsg =
    //     sta == "0"
    //       ? "关闭通知，资源：" + self.selectFirst.name
    //       : "开启通知，资源：" + self.selectFirst.name;
    //   let logMsgEn =
    //     sta == "0"
    //       ? "Close Notice" + self.selectFirst.name
    //       : "Open Notice" + self.selectFirst.name;
    //   self.loading = true;
    //   self.$ajax({
    //     type: "patch",
    //     headers: {
    //       FORWARD_UNION: self.centerId
    //     },
    //     url: "api/pluto/v1/notice/info",
    //     data: JSON.stringify({
    //       resources: [self.selectFirst.resource_id],
    //       notice_config: { notice_flag: sta }
    //     }),
    //     errFun() {
    //       self.loading = false;
    //       self.info.noticeStatus = sta == "0" ? "1" : "0";
    //     },
    //     successFun() {
    //       self.loading = false;
    //     },
    //     successMsg: successMsg,
    //     log: {
    //       description: {
    //         en: logMsgEn,
    //         zh_cn: logMsg
    //       },
    //       target: Vue.logTarget.monitor
    //     }
    //   });
    // },
    changeSel(sel) {
      let self = this;
      this.selectFirst = { resource_id: sel };
      Promise.all([this.getMonitorData()]).then(function(result) {
        self.setCurrnet();
      });
    },
    setCurrnet() {
      let self = this;
      if (self.colData.length > 0) {
        let frow = self.colData[0];
        self.$refs.colTable.setCurrentRow(frow);
      }
    },
    async getBaseInfo() {
      let self = this;
      let ret = await this.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: self.centerId
        },
        url: "api/pluto/v1/template/info/" + this.selectedRow.id
      });
      if (ret) {
        this.info.id = ret.id;
        this.info.collect_flag = ret.collect_flag;
        this.info.monitor_time = ret.monitor_time;
        this.info.alarmStatus = ret.alert_flag;
        this.info.noticeStatus = ret.notice_flag;
        this.info.name = ret.name;
          // this.isCN
          //   ? ret.resource_name_cn
          //   : ret.resource_name_en;
        this.messageCheckbox = ret.if_phone == "1";
        this.emailCheckbox = ret.if_email == "1";
        this.noticeObj.phone_list = ret.phone_list || "";
        this.noticeObj.mail_list = ret.mail_list || "";
        this.noticeObj.notice_user = ret.notice_user || "";
      }
    },
    async getMonitorData() {
      let ids = [];
      ids.push(this.selectFirst.resource_id);
      this.loading = true;
      let monitorret = await this.$ajax({
        type: "post",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url: "api/pluto/v1/monitor/resources/info/monitor_item",
        data: JSON.stringify({
          resources: ids
        })
      });
      this.loading = false;
      monitorret.monitor_items.forEach(item => {
        item.describe = this.isCN ? item.describe_cn : item.describe_en;
      });
      this.colData = monitorret.monitor_items;
    },
    // async getNotice() {
    //   let ids = [];
    //   ids.push(this.selectFirst.resource_id);
    //   let ret = await this.$ajax({
    //     type: "post",
    //     headers: {
    //       FORWARD_UNION: this.centerId
    //     },
    //     url: "api/pluto/v1/notice/info",
    //     data: JSON.stringify({
    //       resources: ids
    //     })
    //   });
    //   this.messageCheckbox = ret.notice_config.if_phone == "1";
    //   this.emailCheckbox = ret.notice_config.if_email == "1";
    //   this.noticeObj.phone_list = ret.notice_config.phone_list || "";
    //   this.noticeObj.mail_list = ret.notice_config.mail_list || "";
    //   this.noticeObj.notice_user = ret.notice_config.notice_user || "";
    // },
    async saveWarnFun() {
      let self = this;
      let flg = true;
      self.alertList.forEach((item) => {
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
        self.$notify({
          message: Vue.t("base.thresholdCheck"),
          type: "warning"
        });
        return;
      }

      let arr = [];
      self.alertList.forEach((item) => {
        let obj = {};
        obj.crit_threshold = "";
        if (item.crit_threshold != "-" && item.threshold_display_type != "1") {
          obj.crit_threshold = Math.abs(parseInt(item.crit_threshold)) + "";
        }
        obj.warn_threshold = "";
        if (item.warn_threshold != "-" && item.threshold_display_type != "1") {
          obj.warn_threshold = Math.abs(parseInt(item.warn_threshold)) + "";
        }
        obj.alert_id = item.alert_id;
        obj.alert_flag = item.alert_flag;
        // "alert_id": "openstack001",
        //     "warn_threshold": "WARNING",
        //     "crit_threshold": "ERROR",
        //     "alert_flag": "1"
        arr.push(obj);
      });

      let logMsgCN = [];
      let logMsgEN = [];
      self.alertList.forEach((v, i) => {
        let wdb = self.alertList_[i];
        let wtb = wdb["warn_threshold"];
        let ctb = wdb["crit_threshold"];
        let afb = wdb["alert_flag"];

        let wt = v["warn_threshold"];
        let ct = v["crit_threshold"];
        let af = v["alert_flag"];

        let afc = af != afb;
        let wtc = wt != wtb;
        let ctc = ct != ctb;
        let somec = afc || wtc || ctc;

        let s = "";
        let s2 = "";

        if (somec) {
          s += v["alert_display_name_cn"] + "【";
          s2 += v["alert_display_name_en"] + "[";
        }

        if (afc) {
          s += "开关";
          s +=
            " 由 " +
            (afb == "1" ? "开启" : "关闭") +
            "修改为" +
            (af == "1" ? "开启" : "关闭");
          s += "  ";

          s2 += "onoff";
          s2 +=
            " from " +
            (afb == "1" ? "on" : "off") +
            " to " +
            (af == "1" ? "on" : "off");
          s2 += "  ";
        }

        if (wtc) {
          s += "中度阈值";
          s += "由" + wtb + "修改为" + wt;
          s += "  ";

          s2 += "  warn threshold";
          s2 += " from " + wtb + " to " + wt;
          s2 += "  ";
        }

        if (ctc) {
          s += "严重阈值";
          s += "由" + ctb + "修改为" + ct;
          s += "  ";

          s2 += "  crit threshold";
          s2 += " from " + ctb + " to " + ct;
          s += "  ";
        }

        if (somec) {
          s += "】";
          s2 += "]";
          logMsgCN.push(s.trimEnd());
          logMsgEN.push(s2.trimEnd());
        }
      });

      self.loading = true;
      let ret = await self.$ajax({
        type: "post",
        headers: {
          FORWARD_UNION: self.centerId
        },
        errFun() {
          self.loading = false;
        },
        successFun() {
          self.loading = false;
        },
        url: "api/pluto/v1/alert/template/save",
        data: JSON.stringify({
          alert_items: arr,
          template_id: this.selectedRow.id
        }),
        // successMsg: Vue.t("base.saveSuccess"),
        log: {
          description: {
            en:
              "Resource:" +
              self.info.name +
              ",collection:" +
              self.collectName +
              " save Alarm Item" +
              "   message:{" +
              logMsgEN.join("、") +
              "}",
            zh_cn:
              "资源组:" +
              self.info.name +
              ",采集项:" +
              self.collectName +
              "保存告警项" +
              "   保存信息：｛" +
              logMsgCN.join("、") +
              "｝"
          },
          target: Vue.logTarget.monitor
        }
      });

      let m = Vue.t("base.saveSuccess");
      let t = 'success';
      if (String(ret.status).toLowerCase() === 'error') {
        m = '没有权限';
        t = 'warning';
      }

      this.$notify({
        message: m,
        type: t
      });

      this.getAlertList();
      this.$parent.getTableData && this.$parent.getTableData();
    },
    saveNoticeFun(v) {
      this.$refs.noticeSet.validate(valid => {
        if (!valid) {
          return;
        }
        this.noticeObj.if_phone = this.messageCheckbox ? "1" : "0";
        this.noticeObj.if_email = this.emailCheckbox ? "1" : "0";
        if (!this.messageCheckbox && !this.emailCheckbox) {
          this.$notify({
            message: Vue.t("monitor.promp3"),
            type: "warning"
          });
          return;
        }
        if (this.messageCheckbox && this.noticeObj.phone_list == "") {
          this.$notify({
            message: Vue.t("monitor.promp4"),
            type: "warning"
          });
          return;
        }
        if (this.noticeObj.phone_list.length > 200) {
          this.$notify({
            message: Vue.t("monitor.promp15"),
            type: "warning"
          });
          return;
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
          return;
        }
        if (this.emailCheckbox && this.noticeObj.mail_list == "") {
          this.$notify({
            message: Vue.t("monitor.promp5"),
            type: "warning"
          });
          return;
        }
        if (this.noticeObj.mail_list.length > 200) {
          this.$notify({
            message: Vue.t("monitor.promp14"),
            type: "warning"
          });
          return;
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
          return;
        }

        this.$ajax({
          type: "post",
          headers: {
            FORWARD_UNION: this.centerId
          },
          url: "api/pluto/v1/notice/update",
          data: JSON.stringify({
            ...this.noticeObj,
            template_id: this.selectedRow.id
          }),
          log: {
            description: {
              en: "Save Notice Type",
              zh_cn: "保存资源组:" + this.info.name + "的通知配置"
            },
            target: Vue.logTarget.monitor
          }
        }).then( v => {
          if (String(v.status).toLowerCase() === 'error') {
            this.$notify({
              message: '没有权限',
              type: "warning"
            });
          } else {
            this.$notify({
              message: this.$t('base.saveSuccess'),
              type: "success"
            });
            this.$parent.getTableData && this.$parent.getTableData();
          }
        });
      });
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