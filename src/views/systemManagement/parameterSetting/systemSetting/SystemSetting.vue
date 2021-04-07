<template>
  <div>
   <el-row :gutter="10">
    <el-col :span="12">
      <el-card v-loading="mailSetLoading" :element-loading-text="loadText">
        <div slot="header" class="clearfix">
          <span>{{$t('base.mailSetting')}}</span>
          <el-switch v-model="mailModel.switch" style="float:right;" @change="mailSetFun"></el-switch>
        </div>
        <div>
        <el-row :gutter="26">
          <el-col :span="12">
            <el-form ref="mailForm" :label-width="labelWidth" class="me-required-form" :model="mailModel" :rules="mailRule">
              <el-form-item :label="$t('base.mailServerAddress')" class="is-required" prop="server">
                <el-input auto-complete="off" v-model="mailModel.server" :disabled="!(mailModel.switch)"></el-input>
              </el-form-item>
              <el-form-item :label="$t('base.sender')" class="is-required" prop="send_user">
                <el-input auto-complete="off" v-model="mailModel.send_user" :disabled="!(mailModel.switch)"></el-input>
              </el-form-item>
              <el-form-item :label="$t('base.mailTestAddress')" prop="testAddress">
                <el-input auto-complete="off" v-model="mailModel.testAddress" :disabled="!(mailModel.switch)" @focus="setMailRule"></el-input>
                <el-tooltip effect="dark" :content="$t('base.emailSetPrompt')" style="position:absolute;right:-16px;top:9px;">
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12">
            <el-form ref="mailForm1" class="me-required-form" label-width="60px" :model="mailModel" :rules="mailRule">
              <el-form-item :label="$t('base.port')" class="is-required" prop="port">
                <el-input auto-complete="off" v-model="mailModel.port" :disabled="!(mailModel.switch)"></el-input>
              </el-form-item>
              <el-form-item :label="$t('base.password')" class="is-required" prop="password">
                <el-input auto-complete="off" type="password" v-model="mailModel.password" :disabled="!(mailModel.switch)"></el-input>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <div style="text-align:center;">
          <el-button type="primary" size="small" :disabled="!(mailModel.switch)" @click="saveEmailSet">{{$t('base.apply')}}</el-button>
          <el-button type="primary" size="small" :disabled="!(mailModel.switch)" @click="testEmailFun">{{$t('base.test')}}</el-button>
        </div>
        </div>
      </el-card>

      <el-card style="margin-top:10px;" v-loading="loginModel.verifyCodeSetLoading||loginModel.smsValidSetLoading" :element-loading-text="loadText">
        <div slot="header" class="clearfix">
          <span>{{$t('base.loginSetting')}}</span>
        </div>
        <div>
        <el-row>
          <el-col :span="24">
            <el-form ref="loginForm" :label-width="labelWidth" :model="loginModel" :rules="loginRules">
              <el-form-item :label="$t('base.firstLandVerCode')" class="is-required">
                <el-radio-group v-model="loginModel.showVerifyCode">
                  <el-radio class="radio" label="1">{{$t('base.display')}}</el-radio>
                  <el-radio class="radio" label="0">{{$t('base.noShow')}}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="$t('base.LOGIN_SMS_ENABLE')" class="is-required">
                <el-radio-group v-model="loginModel.smsValid">
                  <el-radio class="radio" label="1">{{ $t('base.yes') }}</el-radio>
                  <el-radio class="radio" label="0">{{ $t('base.no') }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="$t('base.LOGIN_SMS_VALID_TIME')" prop="smsValidTime" class="is-required">
                <el-input v-model="loginModel.smsValidTime" :disabled="loginModel.smsValid !== '1'" style="width: 100px;" /> {{$t('base.minute')}}
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <div style="text-align:center;">
          <el-button type="primary" size="small" @click="verificationCodeSetFun">{{$t('base.apply')}}</el-button>
        </div>
        </div>
      </el-card>

      <el-card style="margin-top: 10px;" v-loading="oem.loading">
        <div slot="header" class="clearfix">
          <span>{{ $t('base.OEM') }}</span>
          <el-switch v-model="oem.switch" style="float:right;" @change="onOEMSwitchChanged"></el-switch>
        </div>
        <el-row style="height:150px;">
          <el-col :span="24">
          <el-form ref="oemForm" class="me-required-form" label-position="left" :label-width="labelWidth" :model="oem" :rules="oemRules">
            <el-form-item ref="productLogo" class="is-required" :label="$t('base.OEM_PRODUCT_LOGO')" prop="productLogo">
              <div class="transparent-bg" :style="{ width: Constants.OEM_LOGO_WIDTH + 'px', height: Constants.OEM_LOGO_HEIGHT + 'px' }">
                <img :width="Constants.OEM_LOGO_WIDTH" :height="Constants.OEM_LOGO_HEIGHT" :src="oem.productLogo">
              </div>
              <el-upload
                action=""
                list-type="picture"
                :multiple="false"
                :auto-upload="false"
                :on-change="oemProductLogoChanged"
                :show-file-list="false">
                <el-button type="primary" size="small" :disabled="!(oem.switch)" style="margin-top: 5px;">{{ $t('base.OEM_CHOOSE_IMAGE') }}</el-button>
              </el-upload>
              <div v-if="oem.productLogoWidth != Constants.OEM_LOGO_WIDTH || oem.productLogoHeight != Constants.OEM_LOGO_HEIGHT" style="font-size: 12px; color: #dd4b39; line-height: 1;">
                {{ $t('base.OEM_LOGO_SIZE_NOT_MATCH', oem.productLogoWidth, oem.productLogoHeight) }}
              </div>
            </el-form-item>
            <el-form-item ref="brandLogo" class="is-required" :label="$t('base.OEM_BRAND_LOGO')" prop="brandLogo">
              <div class="transparent-bg" :style="{ width: Constants.OEM_LOGO_WIDTH + 'px', height: Constants.OEM_LOGO_HEIGHT + 'px' }">
                <img :width="Constants.OEM_LOGO_WIDTH" :height="Constants.OEM_LOGO_HEIGHT" :src="oem.brandLogo">
              </div>
              <el-upload
                action=""
                list-type="picture"
                :multiple="false"
                :auto-upload="false"
                :on-change="oemBrandLogoChanged"
                :show-file-list="false">
                <el-button type="primary" size="small" :disabled="!(oem.switch)" style="margin-top: 5px;">{{ $t('base.OEM_CHOOSE_IMAGE') }}</el-button>
              </el-upload>
              <div v-if="oem.brandLogoWidth != Constants.OEM_LOGO_WIDTH || oem.brandLogoHeight != Constants.OEM_LOGO_HEIGHT" style="font-size: 12px; color: #dd4b39; line-height: 1;">
                {{ $t('base.OEM_LOGO_SIZE_NOT_MATCH', oem.brandLogoWidth, oem.brandLogoHeight) }}
              </div>
            </el-form-item>
            <el-form-item :label="$t('base.OEM_PRODUCT_NAME')" class="is-required" prop="productName">
              <el-input v-model="oem.productName" style="width: 300px;" :disabled="!oem.switch" />
            </el-form-item>
            <el-form-item :label="$t('base.OEM_VERSION')" class="is-required" prop="version">
              <el-input v-model="oem.version" style="width: 300px;" :disabled="!oem.switch" />
            </el-form-item>
            <el-form-item :label="$t('base.OEM_EMAIL')" class="is-required" prop="email">
              <el-input v-model="oem.email" style="width: 300px;" :disabled="!oem.switch" />
            </el-form-item>
            <el-form-item :label="$t('base.OEM_ADDRESS')" class="is-required" prop="address">
              <el-input v-model="oem.address" style="width: 300px;" :disabled="!oem.switch" />
            </el-form-item>
            <el-form-item :label="$t('base.OEM_COPYRIGHT')" class="is-required" prop="copyright">
              <el-input v-model="oem.copyright" style="width: 300px;" :disabled="!oem.switch" />
            </el-form-item>
          </el-form>
          <div style="text-align:center;">
            <el-button type="primary" size="small" :loading="oem.saving" :disabled="!(oem.switch)" @click="saveOEM">{{$t('base.apply')}}</el-button>
          </div>
          </el-col>
        </el-row>
      </el-card>

      <el-card style="margin-top:10px;" v-loading="storageTimeLoading">
        <div slot="header" class="clearfix">
          <span>{{$t('monitor.monitorDataLife')}}{{regionList.length>1?$t('monitor.monitorDataLifeNotes'):''}}</span>
        </div>
        <div>
        <el-form>
          <el-form-item :label="$t('monitor.duration')">
            <el-select v-model="storageTimeValue">
              <el-option :label="$t('monitor.oneWeek')" :value="7"></el-option>
              <el-option :label="$t('monitor.tenDay')" :value="10"></el-option>
              <el-option :label="$t('monitor.oneMonth')" :value="30"></el-option>
              <el-option :label="$t('monitor.threeMonth')" :value="90"></el-option>
              <el-option :label="$t('monitor.halfYear')" :value="180"></el-option>
              <el-option :label="$t('base.unlimited')" :value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span v-show="storageTimeValue==0">{{$t('monitor.monitorPrompt')}}</span>
        <div style="text-align:center;">
          <el-button type="primary" size="small" @click="saveStorageTime">{{$t('base.save')}}</el-button>
        </div>
        </div>
      </el-card>

    </el-col>
  
    <el-col :span="12">
      <el-card v-loading="smsLoading" :element-loading-text="loadText">
        <div slot="header" class="clearfix">
          <span>{{$t('base.smsServerSetting')}}</span>
          <el-switch v-model="smsModel.switch" style="float:right;" @change="smsSetChange"></el-switch>
        </div>
        <div>
        <el-row :gutter="26">
          <el-col :span="12" label-position="left">
            <el-form ref="smsForm" :label-width="labelWidth" class="me-required-form" :model="smsModel" :rules="smsRule">
              <el-form-item :label="$t('base.SMSServiceProvider')">
                <span>{{$t('base.smsServerName')}}</span>
              </el-form-item>
              <el-form-item :label="$t('base.userName')" class="is-required" prop="user">
                <el-input auto-complete="off" v-model="smsModel.user" :disabled="!(smsModel.switch)"></el-input>
              </el-form-item>
              <el-form-item :label="$t('base.testTelephoneNumber')" prop="testPhone">
                <el-input auto-complete="off" v-model="smsModel.testPhone" :disabled="!(smsModel.switch)"></el-input>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12">
            <el-form ref="smsForm1" label-width="60px" :model="smsModel" :rules="smsRule">
              <el-form-item label="">
                <span>&nbsp;</span>
              </el-form-item>
              <el-form-item :label="$t('base.password')" class="is-required" prop="password">
                <el-input auto-complete="off" type="password" v-model="smsModel.password" :disabled="!(smsModel.switch)"></el-input>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <div style="text-align:center;">
          <el-button type="primary" size="small" :disabled="!(smsModel.switch)" @click="smsSaveFun">{{$t('base.apply')}}</el-button>
          <el-button type="primary" size="small" :disabled="!(smsModel.switch)" @click="smsTestFun">{{$t('base.test')}}</el-button>
        </div>
        </div>
      </el-card>

      <el-card style="margin-top:10px;" v-loading="sessionLoading" :element-loading-text="loadText">
        <div slot="header" class="clearfix">
          <span>{{$t('base.sessionSetting')}}</span>
        </div>
        <div>
        <el-row :gutter="26">
          <el-col :span="12">
            <el-form :label-width="labelWidth">
              <el-form-item :label="$t('base.sessionTimeout')" class="is-required">
                <el-row>
                  <el-col :span="9">
                    <el-input auto-complete="off" @change="changeFun" @blur="blurFun" v-model="sessionModel.value"></el-input>
                  </el-col>
                  <el-col :span="15">
                    <span style="display:inline-block;padding-left:10px;">{{$t('base.minute')}}</span>
                    <span>
                      <el-tooltip effect="dark" :content="$t('base.sessionPrompt')">
                        <i class="el-icon-fa-question-circle"></i>
                      </el-tooltip>
                    </span>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12">
            <el-form :label-width="labelWidth">
              <el-form-item :label="$t('base.enableMultipleSession')">
                <el-radio-group v-model="sessionModel.multiSession">
                  <el-radio class="radio" label="1">{{$t('base.yes')}}</el-radio>
                  <el-radio class="radio" label="0">{{$t('base.no')}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <div style="text-align:center;">
          <el-button type="primary" size="small" @click="sessionSetFun">{{$t('base.apply')}}</el-button>
        </div>
        </div>
      </el-card>
      
      <el-card style="margin-top:10px;" :element-loading-text="loadText">
        <div slot="header" class="clearfix">
          <span>{{ $t('base.MAX_SESSION_SETTING') }}</span>
          <el-switch v-model="maxSessionModel.enable" @change="handleMaxSessionSwitchChange" style="float:right;"></el-switch>
        </div>
        <div>
          <el-form ref="maxSessionForm" label-width="120px" :model="maxSessionModel" :rules="maxSessionRules">
            <el-form-item :label="$t('base.MAX_SESSION')" class="is-required" prop="maxSession">
              <el-input v-model="maxSessionModel.maxSession" style="width: 300px;" :disabled="!maxSessionModel.enable" />
            </el-form-item>
            <el-form-item :label="$t('base.MAX_SESSION_VALID_TIME')" class="is-required" prop="time">
              <el-time-picker
                @change="handleMaxSessionTimeChange"
                v-model="maxSessionModel.time1"
                format="HH:mm"
                :editable="false"
                :disabled="!maxSessionModel.enable"
                :placeholder="$t('base.MAX_SESSION_VALID_TIME_START')" />
              <el-time-picker
                @change="handleMaxSessionTimeChange"
                v-model="maxSessionModel.time2"
                format="HH:mm"
                :editable="false"
                :disabled="!maxSessionModel.enable"
                :placeholder="$t('base.MAX_SESSION_VALID_TIME_END')" />
              <el-tooltip placement="top" trigger="hover" :content="$t('base.MAX_SESSION_ACROSS_DAY')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
          </el-form>
          <div style="text-align:center;">
            <el-button type="primary" size="small" @click="saveMaxSession">{{$t('base.apply')}}</el-button>
          </div>
        </div>
      </el-card>
      
      <el-card style="margin-top:10px;" v-loading="languageLoading" :element-loading-text="loadText">
        <div slot="header" class="clearfix">
          <span>{{$t('base.languageSetting')}}</span>
        </div>
        <div>
        <el-form style="height: 75px;" ref="languageForm" :label-width="labelWidth" label-position="left">
          <el-form-item :label="$t('base.language')">
            <el-select v-model="languageValue">
              <el-option :label="$t('base.chinese')" value="zh_CN"></el-option>
              <el-option :label="$t('base.english')" value="en_US"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div style="text-align:center;">
          <el-button size="small" type="primary" @click="languageSetFun">{{$t('base.apply')}}</el-button>
        </div>
        </div>
      </el-card>

      <el-card  style="margin-top:10px;" v-loading="logdataloading" :element-loading-text="loadText">
        <div slot="header" class="clearfix">
          <span>{{$t('operationAnalysis.logdataPeriod')}}{{regionList.length>1?$t('monitor.monitorDataLifeNotes'):''}}</span>
          <el-switch v-if="false" v-model="logobj.deleteSwitch" style="float:right;" @change="deleteLogChange"></el-switch>
        </div>
        <el-form ref="logSettingForm" :label-width="labelWidth" :rules="logobjrules" :model="logobj" style="height:120px;">
          <el-form-item :label="$t('base.timeLength')" prop="log_auto_delete_days">
            <el-input-number :controls="false" :min="1" :max="365" style="width:214px;" v-model="logobj.log_auto_delete_days" :disabled="!(logobj.deleteSwitch)"></el-input-number>
            <span>{{$t('base.day')}}</span>
            <span>
              <el-tooltip effect="dark" :content="$t('operationAnalysis.deleteLogWarn')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </span>
          </el-form-item>
        </el-form>
        <div style="text-align:center;">
          <el-button size="small" type="primary" @click="recordSettingClick" :disabled="!(logobj.deleteSwitch)">{{$t('base.apply')}}</el-button>
        </div>
      </el-card>
    </el-col>
   </el-row>
 
  </div>
</template>
<script>
const Constants = {
  OEM_LOGO_WIDTH: 314,
  OEM_LOGO_HEIGHT: 66,
  OEM_LOGO_TYPE: 'image/png',
  OEM_LOGO_MAX_SIZE: 32768
};
import uuid from 'uuid';
import moment from 'moment';
export default {
  name: "systemSetting",
  data () {
    var validatePass = function (rule, value, callback) {
      if (value=="") {
        callback(new Error(Vue.t('validation.required')));
      }
      callback();
    }
    return {
      storageTimeValue:30,
      storageTimeLoading:false,
      Constants,
      loadText:Vue.t('base.loadingData'),
      saveText:Vue.t('base.sendingData'),
      labelWidth:this.$cookie.get("defaultLanguage")=="en"?"165px":"150px",
      mailSetLoading:false,
      smsLoading:false,
      languageLoading:false,
      sessionLoading:false,
      logdataloading:false,
      loginModel: {
        verifyCodeSetLoading: false,
        smsValidSetLoading: false,
        showVerifyCode: '0',
        smsValidOrigin: '0',
        smsValid: '0',
        smsValidTime: '5'
      },
      loginRules: {
        smsValidTime: [
          {type: 'required'},
          {type: 'integer'},
          {type: 'max', value: 30},
          {type: 'min', value: 3}
        ]
      },
      mailModel:{
        server:"",
        port:"",
        send_user:"",
        password:"",
        enabled:1,
        testAddress:"",
        switch:true
      },
      smsModel:{
        switch:true,
        user:"",
        password:"",
        testPhone:""
      },
      sessionModel:{
        bak:"",
        value:"",
        multiSession:"0"
      },
      maxSessionRules: {
        maxSession: [{
          type: 'required'
        }, {
          type: 'integer'
        }, {
          validator: (rule, value, callback) => {
            if (isNaN(value)) {
              callback(new Error( this.$t('base.MAX_SESSION_NUMBER_TIPS') ));
            } else {
              if (parseInt(value) < 1 || parseInt(value) > 10000) {
                callback(new Error( this.$t('base.MAX_SESSION_NUMBER_TIPS') ));
              } else {
                callback();
              }
            }
          },
          trigger: 'change, blur, click'
        }],
        time: [{
          validator: (rule, value, callback) => {
            if (this.maxSessionModel.maxSession !== '-1' && !/^[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}$/.test(value)) {
              callback(new Error( this.$t('base.MAX_SESSION_VALID_TIME_TIPS') ));
            } else {
              callback();
            }
          },
          trigger: 'change, blur, click'
        }]
      },
      maxSessionModel: {
        enable: false,
        maxSession: '-1',
        time1: null,
        time2: null,
        time: null
      },
      mailRule:{
        server:[{type: 'required'}],
        port:[
          {type: 'required'},
          {type: 'integer'},
          {type: 'max', value: 65535},
          {type: 'min', value: 0}
        ],
        send_user:[
          {type: 'required'},
          {type: 'maxSize', value: 40},
          {type: "email"}
        ],
        password:[
          {validator:validatePass, trigger: 'blur change'}
        ],
        testAddress:[
          {type: 'required'},
          {type: 'maxSize', value: 40},
          {type: "email"}
        ]
      },
      smsRule:{
        user:[
          {type: 'required'},
          {type: 'maxSize', value: 20}
        ],
        password:[
          {validator:validatePass, trigger: 'blur change'},
          {type: 'maxSize', value: 30}
        ],
        testPhone:[
          {type: 'telephone'}
        ]
      },
      oem: {
        saving: false,
        switch: false,
        productLogo: '',
        brandLogo: '',
        productName: '',
        version: '',
        email: '',
        address: '',
        copyright: '',
        productLogoWidth: Constants.OEM_LOGO_WIDTH,
        productLogoHeight: Constants.OEM_LOGO_HEIGHT,
        brandLogoWidth: Constants.OEM_LOGO_WIDTH,
        brandLogoHeight: Constants.OEM_LOGO_HEIGHT
      },
      oemRules: {
        productLogo: [
          {type: 'required'}
        ],
        brandLogo: [
          {type: 'required'}
        ],
        productName: [
          {type: 'required'},
          {type: 'maxSize', value: 40}
        ],
        version: [
          {type: 'required'},
          {type: 'maxSize', value: 40}
        ],
        email: [
          {type: 'required'},
          {type: 'maxSize', value: 40}
        ],
        address: [
          {type: 'required'},
          {type: 'maxSize', value: 40}
        ],
        copyright: [
          {type: 'required'},
          {type: 'maxSize', value: 100}
        ]
      },
      languageValue:"zh_CN",
      arr:[],
      logobj:{
        deleteSwitch:true,
        log_auto_delete_days:""
      },
      logobjrules:{
        log_auto_delete_days:[
          {type: 'integer'}
        ]
      },
      regionList:Vue.regionList
    }
  },
  mounted () {
    this.getEmailSet();
    this.getLanguageSet();
    this.getVerifyCodeSet();
    this.getSmsValidSet();
    this.getSessionSet();
    this.getMaxSession();
    this.getSmsSet();
    this.getOEM();
    this.getLogdate();
    this.getStorageTime();
  },
  methods: {
    getStorageTime() {
      let me = this;
      me.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/storage/time",
        successFun(rtn) {
          me.storageTimeValue = parseInt(rtn.duration);
        }
      })
    },
    recordLog(v) {
      let me = this;
      let logs= [
            {
              region_id: me.$cookie.get("region_id") || "",
              user_name: Vue.userName,
              user_id: Vue.userId,
              project_id: Vue.roleType == 0 ? "" : me.$cookie.get("pid"),
              target: v.target ? (v.target.en ? v.target.en : "") : "",
              log_level: v.level.en,
              description: v.description
                ? v.description.en
                  ? v.description.en
                  : ""
                : "",
              language: "en",
              trace_id: v.trace_id
            },
            {
              region_id: me.$cookie.get("region_id") || "",
              user_name: Vue.userName,
              user_id: Vue.userId,
              project_id: Vue.roleType == 0 ? "" : me.$cookie.get("pid"),
              target: v.target ? (v.target.zh_cn ? v.target.zh_cn : "") : "",
              log_level: v.level.zh_cn,
              description: v.description
                ? v.description.zh_cn
                  ? v.description.zh_cn
                  : ""
                : "",
              language: "zh_cn",
              trace_id: v.trace_id
            }
          ];
      me.$ajax({
        type: "post",
        url: "node-api/keystone/recordLog",
        contentType: "application/json",
        data: JSON.stringify({logs:logs})
      });
    },
    saveStorageTime() {
      let me = this;
      let regions = Vue.regionList;
      let traceId = 'req-'+uuid.v1();
      regions.forEach((v, i, a) => {
        me.$ajax({
          type: 'post',
          regionId:v.region_id,
          url: "api/pluto/v1/monitor/storage/time",
          data:JSON.stringify({duration:me.storageTimeValue+""}),
          successMsg:Vue.t('base.saveSuccess'),
          headers: {
            'X-Openstack-Request-Id': traceId
          }
        });
      });
      me.recordLog({
        target: Vue.logTarget.parameterSetting,
        level: {
          en: "info",
          zh_cn: "信息"
        },
        description: {
          en: "edit monitor data life",
          zh_cn: "编辑监控数据的保存周期"
        },
        trace_id: traceId
      });
    },
    getEmailSet() {
      let me = this;
      me.mailSetLoading = true;
      let ret = this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/message/email/params",
        successFun(data) {
          if (data.message.server) {
            me.mailModel = $.extend(me.mailModel, data.message);
            me.mailModel.password = "";
            me.mailModel.switch = me.mailModel.enabled==1;
          } else {
            me.mailModel.switch = data.message.enabled==1;
          }
          me.mailSetLoading = false;
        }
      })
    },
    setMailRule() {
      this.mailRule.testAddress = [
        {type: 'maxSize', value: 40},
        {type: "email"}
      ];
    },
    saveEmailSet() {
      let me = this;
      this.mailRule.testAddress = [];
      let bak = $.extend({}, this.mailModel);
      this.$refs.mailForm.resetFields();
      this.$refs.mailForm1.resetFields();
      this.mailModel = bak;
      this.$nextTick(() => {
        this.$refs.mailForm.validate((valid) => {
          this.$refs.mailForm1.validate((valid1) => {
            if (!valid||!valid1) {
              return;
            }
            this.mailSetLoading = true;
            let ret = this.$ajax({
              type: 'post',
              url: "api/keystone/v3/inspur/message/email/params",
              data: JSON.stringify({
                server_info:{
                  server:me.mailModel.server,
                  port:me.mailModel.port,
                  send_user:me.mailModel.send_user,
                  password:me.mailModel.password,
                  enabled:me.mailModel.switch?1:0
                }
              }),
              successMsg:Vue.t('base.saveSuccess'),
              errFun() {
                me.mailSetLoading = false;
              },
              log:{
                description:{
                  en:"email parameters setting",
                  zh_cn:"邮件参数设置"
                },
                target:Vue.logTarget.parameterSetting
              }
            })
            me.mailSetLoading = false;
          });
        });
      });
    },
    mailSetFun(value) {
      let me = this;
      if (!value) {
        let bak = $.extend({}, this.mailModel);
        this.$refs.mailForm.resetFields();
        this.$refs.mailForm1.resetFields();
        this.mailModel = bak;
        let ret = this.$ajax({
          type: 'post',
          url: "api/keystone/v3/inspur/message/email/params",
          data: JSON.stringify({
            server_info:{
              enabled:0
            }
          }),
          successMsg:Vue.t('base.closeSuccess'),
          errFun() {
            me.mailSetLoading = false;
          },
          log:{
            description:{
              en:"email parameters setting:close",
              zh_cn:"邮件参数设置:关闭"
            },
            target:Vue.logTarget.parameterSetting
          }
        })
        me.mailSetLoading = false;
      }
    },
    testEmailFun() {
      let me = this;
      this.mailRule.testAddress = [
        {type: 'required'},
        {type: 'maxSize', value: 40},
        {type: "email"}
      ];
      this.$refs.mailForm.validate((valid) => {
        this.$refs.mailForm1.validate((valid1) => {
          if (!valid||!valid1) {
            return;
          }
          me.mailSetLoading = true;
          let ret = this.$ajax({
            type: 'post',
            url: "api/keystone/v3/inspur/message/email/test",
            data: JSON.stringify({
              server_info:{
                server:me.mailModel.server,
                port:parseInt(me.mailModel.port),
                send_user:me.mailModel.send_user,
                password:me.mailModel.password,
                enabled:1,
                test_user:me.mailModel.testAddress
              }
            }),
            successMsg:Vue.t('base.testSuccess'),
            showErrMsg:false,
            errFun() {
              me.mailSetLoading = false;
              me.$message.error(Vue.t('base.testFail'));
            },
            successFun() {
              me.mailSetLoading = false;
            },
            log:{
              description:{
                en:"email test",
                zh_cn:"邮件测试"
              },
              target:Vue.logTarget.parameterSetting
            }
          })
        });
      });
    },
    getSmsSet() {
      this.smsLoading = true;
      let me = this;
      let ret = this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/message/sms/params",
        successFun(data) {
          if (data.sms.user) {
            me.smsModel = $.extend(me.smsModel, data.sms);
            me.smsModel.password = "";
            me.smsModel.switch = me.smsModel.enabled==1;
          } else {
            me.smsModel.switch = data.sms.enabled==1;
          }
          me.smsLoading = false;
        }
      })
    },
    smsSaveFun() {
      let me = this;
      this.smsRule.testPhone = [];
      let bak = $.extend({}, this.smsModel);
      this.$refs.smsForm.resetFields();
      this.$refs.smsForm1.resetFields();
      this.smsModel = bak;
      this.$nextTick(() => {
        this.$refs.smsForm.validate((valid) => {
          this.$refs.smsForm1.validate((valid1) => {
            if (!valid||!valid1) {
              return;
            }
            this.smsLoading = true;
            let ret = this.$ajax({
              type: 'post',
              url: "api/keystone/v3/inspur/message/sms/params",
              data: JSON.stringify({
                sms:{
                  "user": this.smsModel.user,
                  "password": this.smsModel.password,
                  "enabled":1,
                  "vendor": "jxt"
                }
              }),
              successMsg:Vue.t('base.saveSuccess'),
              errFun() {
                me.smsLoading = false;
              },
              log:{
                description:{
                  en:"sms server parameters setting",
                  zh_cn:"短信服务器参数设置"
                },
                target:Vue.logTarget.parameterSetting
              }
            })
            me.smsLoading = false;
          });
        });
      });
    },
    smsTestFun() {
      let me = this;
      this.smsRule.testPhone = [
        {type: 'required'},
        {type: 'telephone'}
      ];
      this.$refs.smsForm.validate((valid) => {
        this.$refs.smsForm1.validate((valid1) => {
          if (!valid||!valid1) {
            return;
          }
          me.smsLoading = true;
          let ret = this.$ajax({
            type: 'post',
            url: "api/keystone/v3/inspur/message/sms/test",
            data: JSON.stringify({
              sms:{
                "user":me.smsModel.user,
                "password":me.smsModel.password,
                "phone":me.smsModel.testPhone
              }
            }),
            successMsg:Vue.t('base.testSuccess'),
            showErrMsg:false,
            errFun() {
              me.smsLoading = false;
              me.$message.error(Vue.t('base.testFail'));
            },
            successFun() {
              me.smsLoading = false;
            }
          })
        });
      });
    },
    smsSetChange(value) {
      let me = this;
      if (!value) {
        this.smsLoading = true;
        let bak = $.extend({}, this.smsModel);
        this.$refs.smsForm.resetFields();
        this.$refs.smsForm1.resetFields();
        this.smsModel = bak;
        let ret = this.$ajax({
          type: 'post',
          url: "api/keystone/v3/inspur/message/sms/params",
          data: JSON.stringify({
            sms:{
              enabled:0
            }
          }),
          successMsg:Vue.t('base.closeSuccess'),
          errFun() {
            me.smsLoading = false;
          },
          log:{
            description:{
              en:"sms server parameters setting:close",
              zh_cn:"短信服务器参数设置:关闭"
            },
            target:Vue.logTarget.parameterSetting
          }
        })
        me.smsLoading = false;
      }
    },
    async getLanguageSet() {
      let me = this;
      this.languageLoading = true;
      let param = {config_key:"messageLanguage"};
      let ret = this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/system/config?"+$.param(param),
        successFun(data) {
          me.languageValue = data.system_config.config_value;
          me.languageLoading = false;
        }
      })
    },
    languageSetFun() {
      let me = this;
      this.languageLoading = true;
      let ret = this.$ajax({
        type: 'post',
        url: "api/keystone/v3/inspur/system/config",
        data:JSON.stringify({
          "config_key":"messageLanguage",
          "config_value":this.languageValue
        }),
        successMsg:Vue.t('base.saveSuccess'),
        successFun(data) {
          me.languageLoading = false;
        },
        log:{
          description:{
            en:"language parameters setting",
            zh_cn:"语言参数设置"
          },
          target:Vue.logTarget.parameterSetting
        }
      })
    },
    getVerifyCodeSet() {
      let me = this;
      this.loginModel.verifyCodeSetLoading = true;
      let param = {config_key:"verificationCode"};
      let ret = this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/system/config?"+$.param(param),
        successFun(data) {
          me.loginModel.showVerifyCode = data.system_config.config_value;
          me.loginModel.verifyCodeSetLoading = false;
        }
      })
    },
    async getSmsValidSet() {
      const $this = this;
      this.loginModel.smsValidSetLoading = true;
      Promise.all([
        $this.getSmsValidSet$$1(),
        $this.getSmsValidSet$$2()
      ]).then((res) => {
        $this.loginModel.smsValidOrigin = res[0].system_config.config_value;
        $this.loginModel.smsValid = res[0].system_config.config_value;
        $this.loginModel.smsValidTime = res[1].system_config.config_value;
        $this.loginModel.smsValidSetLoading = false;
      }).catch(() => {
        $this.loginModel.smsValidSetLoading = false;
      })
    },
    async getSmsValidSet$$1() {
      let res = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/system/config?config_key=smsValid",
        showErrMsg: false
      });
      return res;
    },
    async getSmsValidSet$$2() {
      let res = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/system/config?config_key=smsValidTime",
        showErrMsg: false
      });
      return res;
    },
    async verificationCodeSetFun() {
      let $this = this;
      $this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          if ($this.loginModel.smsValid === '1' && $this.loginModel.smsValidOrigin === '0') {
            $this.$confirm($this.$t('base.LOGIN_SMS_ENABLE_WARNING'), $this.$t('base.prompt'), {
              confirmButtonText: $this.$t('base.confirm'),
              cancelButtonText: $this.$t('base.cancel'),
              type: 'warning'
            }).then(async () => {
              await $this.verificationCodeSetFun$$2();
            });
          } else {
            await $this.verificationCodeSetFun$$2();
          }
        }
      });
    },
    async verificationCodeSetFun$$2() {
      const $this = this;
      $this.loginModel.verifyCodeSetLoading = true;
      $this.loginModel.smsValidSetLoading = true;
      let logInfo = {
        description:{
          en:"login settings parameters setting",
          zh_cn:"登录设置参数设置"
        },
        target:Vue.logTarget.parameterSetting
      };
      try {
        await $this.$ajax({
          type: 'post',
          url: "api/keystone/v3/inspur/system/config",
          data:JSON.stringify({
            "config_key":"verificationCode",
            "config_value":$this.loginModel.showVerifyCode
          }),
          successFun(data) {
            $this.loginModel.verifyCodeSetLoading = false;
          }
        });
        await $this.$ajax({
          type: 'post',
          url: "api/keystone/v3/inspur/system/config",
          data:JSON.stringify({
            "config_key":"smsValid",
            "config_value":$this.loginModel.smsValid
          }),
          successFun(data) {
            $this.loginModel.smsValidSetLoading = false;
          }
        });
        await $this.$ajax({
          type: 'post',
          url: "api/keystone/v3/inspur/system/config",
          data:JSON.stringify({
            "config_key":"smsValidTime",
            "config_value":$this.loginModel.smsValidTime
          }),
          successFun(data) {
            $this.loginModel.smsValidSetLoading = false;
          }
        });
        $this.loginModel.smsValidOrigin = $this.loginModel.smsValid;
        $this.$message.success(Vue.t('base.saveSuccess'));
        await $this.$recordLog({
          ...logInfo,
          level: {
            en: 'info',
            zh_cn: '信息'
          }
        });
      } catch (e) {
        __DEV__ && console.error(e);
        await $this.$recordLog({
          ...logInfo,
          level: {
            en:"error",
            zh_cn:"错误"
          }
        });
      }
    },
    async getMaxSession() {
      const res1 = await this.$ajax({
        type: 'get',
        url: 'api/keystone/v3/inspur/system/config?config_key=maxSession'
      });
      this.maxSessionModel.maxSession = res1.system_config.config_value;
      this.maxSessionModel.enable = this.maxSessionModel.maxSession !== '-1'
      const res2 = await this.$ajax({
        type: 'get',
        url: 'api/keystone/v3/inspur/system/config?config_key=maxSessionTime'
      });
      this.maxSessionModel.time = res2.system_config.config_value;
      if (/^[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}$/.test(this.maxSessionModel.time)) {
        const times = this.maxSessionModel.time.split('-');
        const time1 = new Date();
        time1.setHours(times[0].split(':')[0]);
        time1.setMinutes(times[0].split(':')[1]);
        this.maxSessionModel.time1 = time1;
        const time2 = new Date();
        time2.setHours(times[1].split(':')[0]);
        time2.setMinutes(times[1].split(':')[1]);
        this.maxSessionModel.time2 = time2;
      }
    },
    handleMaxSessionTimeChange() {
      let time1 = this.maxSessionModel.time1 || '';
      let time2 = this.maxSessionModel.time2 || '';
      if (time1 instanceof Date && time2 instanceof Date) {
        this.maxSessionModel.time = `${moment(time1).format('HH:mm')}-${moment(time2).format('HH:mm')}`;
      } else if (time1 === '' && time2 === '') {
        this.maxSessionModel.time = null;
      } else {
        this.maxSessionModel.time = '';
      }
      this.$nextTick(() => {
        this.$refs.maxSessionForm.validateField('time');
      });
    },
    async handleMaxSessionSwitchChange(value) {
      if (value === false) { // 关闭
        this.maxSessionModel.time1 = null;
        this.maxSessionModel.time2 = null;
        this.maxSessionModel.time = null;
        this.maxSessionModel.maxSession = '-1';
        await this.$ajax({
          type: 'post',
          url: 'api/keystone/v3/inspur/system/config',
          data: JSON.stringify({
            'config_key': 'maxSession',
            'config_value': this.maxSessionModel.maxSession
          }),
          log: {
            description: {
              en: `Max session setting: max session ${this.maxSessionModel.maxSession}`,
              zh_cn: `最大会话数设置：最大会话数 ${this.maxSessionModel.maxSession}`
            },
            target: Vue.logTarget.parameterSetting
          }
        });
        const time = this.maxSessionModel.time || '';
        await this.$ajax({
          type: 'post',
          url: 'api/keystone/v3/inspur/system/config',
          data: JSON.stringify({
            'config_key': 'maxSessionTime',
            'config_value': time
          }),
          log: {
            description: {
              en: `Max session setting: time ${time}`,
              zh_cn: `最大会话数设置：时间 ${time}`
            },
            target: Vue.logTarget.parameterSetting
          }
        });
        this.$message.success(this.$t('base.closeSuccess'));
      }
    },
    async saveMaxSession() {
      this.$refs.maxSessionForm.validate(async (valid) => {
        if (valid) {
          await this.$ajax({
            type: 'post',
            url: 'api/keystone/v3/inspur/system/config',
            data: JSON.stringify({
              'config_key': 'maxSession',
              'config_value': this.maxSessionModel.maxSession
            }),
            log: {
              description: {
                en: `Max session setting: max session ${this.maxSessionModel.maxSession}`,
                zh_cn: `最大会话数设置：最大会话数 ${this.maxSessionModel.maxSession}`
              },
              target: Vue.logTarget.parameterSetting
            }
          });
          const time = this.maxSessionModel.time || '';
          await this.$ajax({
            type: 'post',
            url: 'api/keystone/v3/inspur/system/config',
            data: JSON.stringify({
              'config_key': 'maxSessionTime',
              'config_value': time
            }),
            log: {
              description: {
                en: `Max session setting: time ${time}`,
                zh_cn: `最大会话数设置：时间 ${time}`
              },
              target: Vue.logTarget.parameterSetting
            }
          });
          this.$message.success(this.$t('base.saveSuccess'));
        }
      });
    },
    getSessionSet() {
      let me = this;
      this.sessionLoading = true;
      this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/system/config?"+$.param({config_key:"sessionTimeout"}),
        successFun(data) {
          me.sessionModel.value = data.system_config.config_value;
          me.sessionModel.bak = data.system_config.config_value;
        }
      })
      this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/system/config?"+$.param({config_key:"multiSession"}),
        successFun(data) {
          me.sessionModel.multiSession = data.system_config.config_value;
          me.sessionLoading = false;
        }
      })
    },
    sessionSetFun() {
      let me = this;
      this.sessionLoading = true;
      this.$ajax({
        type: 'post',
        url: "api/keystone/v3/inspur/system/config",
        data:JSON.stringify({
          "config_key":"sessionTimeout",
          "config_value":this.sessionModel.value
        }),
        log:{
          description:{
            en:"session time parameters setting",
            zh_cn:"会话时间参数设置"
          },
          target:Vue.logTarget.parameterSetting
        }
      })
      this.$ajax({
        type: 'post',
        url: "api/keystone/v3/inspur/system/config",
        data:JSON.stringify({
          "config_key":"multiSession",
          "config_value":this.sessionModel.multiSession
        }),
        successMsg:Vue.t('base.saveSuccess'),
        successFun(data) {
          me.sessionLoading = false;
        }
      })
    },
    blurFun() {
      let val = arguments[0].target.value;
      this.arr.forEach((item) => {
        clearTimeout(item)
      })
      this.check(val);
    },
    changeFun(val) {
      this.arr.forEach((item) => {
        clearTimeout(item)
      })
      this.arr.push(setTimeout(() => {
        this.check(val);
      }, 3000));
    },
    check(val) {
      if (isNaN(val)) {
        this.sessionModel.value = this.sessionModel.bak;
      } else {
        if (val.indexOf('.')>-1) {
          this.sessionModel.value = this.sessionModel.bak;
        } else {
          if (val < 5) {
            this.sessionModel.value = 5;
          } else if (val > 60) {
            this.sessionModel.value = 60;
          }
        }
      }
      this.sessionModel.bak = this.sessionModel.value;
    },
    async onOEMSwitchChanged() {
      const $this = this;
      if ($this.oem.switch === false) {
        const res = await $this.$ajax({
          type: 'post',
          url: 'api/keystone/v3/inspur/customparam/oem_switch',
          data: JSON.stringify({
            param: {
              value: $this.oem.switch
            }
          }),
          successMsg:Vue.t('base.closeSuccess'),
          log: {
            description: {
              en: 'Custom Logo Setting: Close',
              zh_cn: '自定义品牌标识：关闭'
            },
            target: Vue.logTarget.parameterSetting
          }
        });
      }
    },
    oemProductLogoChanged(file, fileList) {
      const $this = this;
      if (file.raw.type !== Constants.OEM_LOGO_TYPE) {
        $this.$message.error($this.$t('base.OEM_LOGO_FILE_TYPE_ERROR'));
      } else if (file.raw.size > Constants.OEM_LOGO_MAX_SIZE) {
        $this.$message.error($this.$t('base.OEM_LOGO_FILE_TOO_LARGE'));
      } else {
        const reader = new FileReader();
        reader.onload = e => {
          $this.oem.productLogo = e.target.result;
          const image = new Image();
          image.onload = () => {
            $this.oem.productLogoWidth = image.width;
            $this.oem.productLogoHeight = image.height;
            $this.$refs.productLogo.validateState = '';
            $this.$refs.productLogo.validateMessage = '';
          }
          image.src = e.target.result;
        }
        reader.readAsDataURL(file.raw)
      }
    },
    oemBrandLogoChanged(file, fileList) {
      const $this = this;
      if (file.raw.type !== Constants.OEM_LOGO_TYPE) {
        $this.$message.error($this.$t('base.OEM_LOGO_FILE_TYPE_ERROR'));
      } else if (file.raw.size > Constants.OEM_LOGO_MAX_SIZE) {
        $this.$message.error($this.$t('base.OEM_LOGO_FILE_TOO_LARGE'));
      } else {
        const reader = new FileReader();
        reader.onload = e => {
          $this.oem.brandLogo = e.target.result;
          const image = new Image();
          image.onload = () => {
            $this.oem.brandLogoWidth = image.width;
            $this.oem.brandLogoHeight = image.height;
            $this.$refs.brandLogo.validateState = '';
            $this.$refs.brandLogo.validateMessage = '';
          }
          image.src = e.target.result;
        }
        reader.readAsDataURL(file.raw)
      }
    },
    async getOEM () {
      const $this = this;
      $this.oem.loading = true;
      Promise.all([
        $this.$ajax({
          type: 'get',
          url: 'api/keystone/v3/inspur/customparam/oem_switch'
        }),
        $this.$ajax({
          type: 'get',
          url: 'api/keystone/v3/inspur/customparam/oem_product_logo'
        }),
        $this.$ajax({
          type: 'get',
          url: 'api/keystone/v3/inspur/customparam/oem_brand_logo'
        }),
        $this.$ajax({
          type: 'get',
          url: 'api/keystone/v3/inspur/customparam/oem_info'
        })
      ]).then(results => {
        if (results[0].params instanceof Array) {
          $this.oem.switch = results[0].params[0].value === '1';
        }
        if (results[1].params instanceof Array) {
          $this.oem.productLogo = results[1].params[0].value;
        }
        if (results[2].params instanceof Array) {
          $this.oem.brandLogo = results[2].params[0].value;
        }
        if (results[3].params instanceof Array) {
          Object.assign($this.oem, JSON.parse(results[3].params[0].value));
        }
        $this.oem.loading = false;
      }).catch(e => {
        $this.oem.loading = false;
      });
    },
    async saveOEM() {
      const $this = this;
      $this.$refs.oemForm.validate(valid => {
        if (valid) {
          $this.oem.saving = true;
          let traceId = 'req-'+uuid.v1();
          Promise.all([
            $this.saveOEMSwitch(traceId),
            $this.saveOEMInfo(traceId),
            $this.saveOEMProductLogo(traceId),
            $this.saveOEMBrandLogo(traceId)
          ]).then(results => {
            $this.$message.success($this.$t('base.saveSuccess'));
            $this.recordLog({
              target: Vue.logTarget.parameterSetting,
              level: {
                en: 'info',
                zh_cn: '信息'
              },
              description:{
                en: 'Custom Logo Setting: Setup',
                zh_cn: '自定义品牌标识：设置'
              },
              trace_id: traceId
            });
            $this.oem.saving = false;
          }).catch(e => {
            $this.oem.saving = false;
          });
        }
      });
    },
    async saveOEMProductLogo (traceId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'post',
          url: 'api/keystone/v3/inspur/customparam/oem_product_logo',
          data: JSON.stringify({
            param: {
              value: $this.oem.productLogo
            }
          }),
          headers: {
            'X-Openstack-Request-Id': traceId
          }
        });
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async saveOEMBrandLogo (traceId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'post',
          url: 'api/keystone/v3/inspur/customparam/oem_brand_logo',
          data: JSON.stringify({
            param: {
              value: $this.oem.brandLogo
            }
          }),
          headers: {
            'X-Openstack-Request-Id': traceId
          }
        });
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async saveOEMInfo (traceId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'post',
          url: 'api/keystone/v3/inspur/customparam/oem_info',
          data: JSON.stringify({
            param: {
              value: JSON.stringify({
                productName: $this.oem.productName,
                version: $this.oem.version,
                email: $this.oem.email,
                address: $this.oem.address,
                copyright: $this.oem.copyright
              })
            }
          }),
          headers: {
            'X-Openstack-Request-Id': traceId
          }
        });
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async saveOEMSwitch (traceId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'post',
          url: 'api/keystone/v3/inspur/customparam/oem_switch',
          data: JSON.stringify({
            param: {
              value: $this.oem.switch
            }
          }),
          headers: {
            'X-Openstack-Request-Id': traceId
          }
        });
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    getLogdate() {
      let self = this;
      this.logdataloading = true;
      let ret = self.$ajax({
        type: 'get',
        url: "api/venus/v1/custom_config?id=es_index_length",
        successFun(data) {
          if (data) {
            self.logobj.log_auto_delete_days = data.value;
          }
        },
        complete: function(XMLHttpRequest, textStatus) {
          self.logdataloading = false;
        }
      })
    },
    recordSettingClick() {
      let self = this;
      self.$refs.logSettingForm.validate((valid) => {
        if (!valid) {
          return;
        }
        self.logdataloading = true;
        let regions = Vue.regionList;
        let traceId = 'req-'+uuid.v1();
        regions.forEach((v, i, a) => {
          let ret = self.$ajax({
            type: 'POST',
            regionId:v.region_id,
            url: "api/venus/v1/custom_config",
            data:JSON.stringify({
              id:"es_index_length",
              value:self.logobj.log_auto_delete_days
            }),
            headers: {
              'X-Openstack-Request-Id': traceId
            },
            successMsg:Vue.t('base.saveSuccess'),
            successFun(data) {
              self.logdataloading = false;
            },
            errFun() {
              self.logdataloading = false;
            }
          })
        })

        self.recordLog({
          target: Vue.logTarget.parameterSetting,
          level: {
            en: "info",
            zh_cn: "信息"
          },
          description:{
            en:"Set log data save days:"+self.logobj.log_auto_delete_days,
            zh_cn:"日志数据保存周期设置:"+self.logobj.log_auto_delete_days+"天"
          },
          trace_id: traceId
        });
      });
    }
  }
}
</script>

<style>
.transparent-bg {
  background-image: url('../../../../assets/img/transparent_bg.png')
}  
</style>
