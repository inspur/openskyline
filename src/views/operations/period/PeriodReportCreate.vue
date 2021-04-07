<template>
  <div>
  <el-dialog :title="$t('report.createPeriodReport')" :visible.sync="dialogVisible"
    :before-close="handleClose" :close-on-click-modal="false" size="small">
    <el-form v-loading="loading" ref="createTriggerForm" :model="createTriggerForm" :rules=rules label-width="150px" class="me-required-form">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-12" v-model="createTriggerForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('task.excuteFrequency')" class="is-required">
        <el-radio-group v-model="createTriggerForm.type" @change="radioChange">
          <el-radio class='radio' label="1">{{$t('task.repeatExecution')}}</el-radio>
          <el-radio class='radio' label="2">{{$t('task.performOnce')}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="createTriggerForm.type == '2'" :label="$t('task.date')" prop="date" class="is-required">
        <el-date-picker v-model="createTriggerForm.date" type="date" :placeholder="$t('task.date')" :picker-options="pickerOptions" :clearable="false" :editable="false">
        </el-date-picker>
      </el-form-item>
      <!-- 周期 -->
      <el-form-item v-if="createTriggerForm.type == '1'" :label="$t('task.cycle')" prop="cycle" class="is-required">
        <el-select class="col-12" v-model="createTriggerForm.cycle" @change="typeChange">
          <el-option v-for="item in cycleListOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item v-show="createTriggerForm.cycle == '2' && createTriggerForm.type == '1'" :label="$t('task.dayNumber')" prop="number" class="is-required">
        <el-input class="col-12" v-model="createTriggerForm.number" auto-complete="off"></el-input> -->
        <!-- <el-tooltip placement="right-start">
          <div slot="content">{{$t('task.dayNumberDesc')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip> -->
      <!-- </el-form-item> -->
      <!-- <el-form-item v-if="createTriggerForm.cycle == '3' && createTriggerForm.type == '1'" :label="$t('task.hourNumber')" prop="number2" class="is-required"> -->
        <!-- <el-input class="col-12" v-model="createTriggerForm.number2" auto-complete="off"></el-input> -->
        <!-- <el-select v-model="createTriggerForm.number2" class="col-12" filterable>
          <el-option v-for="item in onedayhours" :key="item" :label="item" :value="item"></el-option>
        </el-select> -->
        <!-- <el-tooltip placement="right-start">
          <div slot="content">{{$t('task.hourNumberDesc')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip> -->
      <!-- </el-form-item> -->
      <el-form-item v-if="createTriggerForm.cycle == '4' && createTriggerForm.type == '1'" :label="$t('task.date')" prop="number3" class="is-required">
          <el-radio-group v-model="createTriggerForm.number3"> 
            <el-radio-button class="clearfix" v-for="item in weeks" :key="item.id" :label="item.id">{{item.name}}</el-radio-button> 
          </el-radio-group>
      </el-form-item>
      <el-form-item v-if="createTriggerForm.cycle == '5' && createTriggerForm.type == '1'" :label="$t('task.date')" prop="number4" class="is-required">
        <el-radio-group v-model="createTriggerForm.number4"> 
          <el-radio-button class="clearfix" v-for="item in months" :key="item.id" :label="item.id">{{item.name}}</el-radio-button>         
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="createTriggerForm.cycle==3?$t('lang.minute'):$t('task.time')" prop="time" class="is-required">
        <el-col class="col-5" style="display:inline-block"  v-if="createTriggerForm.cycle!=3 || createTriggerForm.type == '2'">
          <el-form-item prop="hour" class="is-required">
            <el-select v-model="createTriggerForm.hour" filterable :disabled="hourDisabled">
              <el-option v-for="item in hourOptions" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col class="col-2" style="display:inline-block; width:5px" v-if="createTriggerForm.cycle!=3">:</el-col>
        <el-col class="col-5" style="display:inline-block">
          <el-form-item prop="minute" class="is-required">
            <el-select v-model="createTriggerForm.minute" filterable>
              <el-option v-for="item in minuteOptions" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item :label="$t('report.resource')" class="is-required">
        <el-select class="col-12" v-model="createTriggerForm.resource" @change="getIndicatorList">
          <el-option v-for="item in resourceOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('report.indicator')" v-if="createTriggerForm.resource != 'system_overview'" class="is-required">
        <el-select class="col-12" v-model="createTriggerForm.indicator">
          <el-option v-for="item in indicatorOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <div v-show="false">
      <el-form-item :label="$t('lang.project') " v-if="roleType == '0' && createTriggerForm.resource != 'host' &&
      createTriggerForm.indicator != 'vm_alarm' && createTriggerForm.indicator != 'host_alarm' && createTriggerForm.resource != 'system_overview'">
        <el-input class="col-12" auto-complete="off" size="small" icon="circle-close" :on-icon-click="onIconClick" :readonly="true" @focus="showProject" v-model="createTriggerForm.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('report.user')" v-if="createTriggerForm.indicator=='vm_performance_report' && createTriggerForm.resource != 'system_overview'">
        <el-input class="col-12" auto-complete="off" size="small" icon="circle-close" :on-icon-click="onIconClick2" :readonly="true" @focus="showUser" v-model="createTriggerForm.userName"></el-input>
      </el-form-item>
      <!-- 云主机详细信息 -->
      <!-- <el-form-item :label="$t('lang.name')" v-if="createTriggerForm.resource == 'vm' && createTriggerForm.indicator != 'vm_alarm' && createTriggerForm.resource != 'system_overview'">
        <el-input class="col-12" v-model="createTriggerForm.name" size="small"></el-input>
      </el-form-item> -->
      <el-form-item :label="$t('lang.status')" v-if="createTriggerForm.resource == 'vm' && createTriggerForm.indicator == 'vm_detail' && createTriggerForm.resource != 'system_overview'">
        <el-select class="col-12" v-model="vmProps.status" clearable>
          <el-option :label="$t('calcStorLang.running')" value="ACTIVE"></el-option>
          <el-option :label="$t('calcStorLang.closed')" value="SHUTOFF"></el-option>
          <el-option :label="$t('calcStorLang.suspended')" value="SUSPENDED"></el-option>
          <el-option :label="$t('calcStorLang.paused')" value="PAUSED"></el-option>
          <el-option :label="$t('calcStorLang.error')" value="ERROR"></el-option>
          <el-option :label="$t('calcStorLang.rescue')" value="RESCUE"></el-option>
          <el-option :label="$t('calcStorLang.unknow')" value="UNKNOW"></el-option>
          <el-option :label="$t('calcStorLang.build')" value="BUILD"></el-option>
          <el-option :label="$t('calcStorLang.migrating')" value="MIGRATING"></el-option>
          <el-option :label="$t('calcStorLang.reboot')" value="REBOOT"></el-option>
          <el-option :label="$t('calcStorLang.hard_reboot')" value="HARD_REBOOT"></el-option>
          <el-option :label="$t('calcStorLang.shelved_offloaded')" value="SHELVED_OFFLOADED"></el-option>
          <el-option :label="$t('calcStorLang.password')" value="PASSWORD"></el-option>
          <el-option :label="$t('calcStorLang.rebuild')" value="REBUILD"></el-option>
          <el-option :label="$t('calcStorLang.revert_resize')" value="REVERT_RESIZE"></el-option>
          <el-option :label="$t('calcStorLang.verify_resize')" value="VERIFY_RESIZE"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('db.availabilityZone')" v-if="createTriggerForm.resource == 'vm' && createTriggerForm.indicator == 'vm_detail' && createTriggerForm.resource != 'system_overview'">
        <el-select class="col-12" v-model="vmProps.availability_zone" clearable>
          <el-option v-for="item in availabilityZoneOptions" :key="item.zoneName" :label="item.zoneName" :value="item.zoneName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.resourceSpec')" v-if="createTriggerForm.resource == 'vm' && createTriggerForm.indicator == 'vm_detail' && createTriggerForm.resource != 'system_overview'">
        <el-select class="col-12" v-model="vmProps.flavor" clearable>
          <el-option v-for="item in flavorOptions" :key="item.id" :label="item.detail" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.host')" v-if="roleType == '0' && createTriggerForm.resource == 'vm' && createTriggerForm.indicator == 'vm_detail' && createTriggerForm.resource != 'system_overview'">
        <el-select class="col-12" v-model="vmProps.host" clearable>
          <el-option v-for="item in hostOptions" :key="item.hypervisor_hostname" :label="item.hypervisor_hostname" :value="item.hypervisor_hostname"></el-option>
        </el-select>
      </el-form-item>
      <!-- 云主机告警 -->
      <el-form-item :label="$t('base.resourceName')" v-if="createTriggerForm.indicator == 'vm_alarm' || createTriggerForm.indicator == 'host_alarm' && createTriggerForm.resource != 'system_overview'">
        <el-input class="col-12" v-model="vmAlarm.resourceName" size="small"></el-input>
      </el-form-item>
      <el-form-item :label="$t('report.alarmLevel')" v-if="createTriggerForm.indicator == 'vm_alarm' || createTriggerForm.indicator == 'host_alarm' && createTriggerForm.resource != 'system_overview'">
        <el-select class="col-12" v-model="vmAlarm.level" size="small" clearable>
          <el-option :label="$t('network.serious')" value="LOST"></el-option>
          <el-option :label="$t('network.middlewarn')" value="CRITICAL"></el-option>
          <el-option :label="$t('network.slightwarn')" value="WARNING"></el-option>
          <el-option :label="$t('network.backtonormal')" value="OK_RECOVERY"></el-option>
          <el-option :label="$t('network.normal')" value="OK"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('base.ipAddress')" v-if="createTriggerForm.indicator == 'vm_alarm' || createTriggerForm.indicator == 'host_alarm' && createTriggerForm.resource != 'system_overview'">
        <el-input class="col-12" v-model="vmAlarm.ipAddress" size="small"></el-input>
      </el-form-item>
      <!-- 云主机告警 -->
       <!--主机性能报表start-->
      <el-form-item :label="$t('opt.selectTimeRange')" v-if="createTriggerForm.indicator == 'host_performance_report' || createTriggerForm.indicator == 'vm_performance_report' && createTriggerForm.resource != 'system_overview'">
        <el-select class="col-12" v-model="hostPerformanceSelect" filterable>
          <el-option :label="$t('base.last24Hour')" value="1"></el-option>
          <el-option :label="$t('base.lastWeek')" value="2"></el-option>
          <el-option :label="$t('base.lastMonth')" value="3"></el-option>
          <el-option :label="$t('network.selfDefine')" value="4"></el-option>
        </el-select>
      </el-form-item>
      <!--主机性能报表end-->
      <!-- 操作日志 -->
      <el-form-item :label="$t('base.accountNumber')" v-if="createTriggerForm.resource == 'operation_log' && createTriggerForm.resource != 'system_overview'">
        <el-input class="col-12" v-model="operationLog.user_name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.operationObject')" v-if="createTriggerForm.resource == 'operation_log' && createTriggerForm.resource != 'system_overview'">
        <el-select class="col-12" v-model="operationLog.target" filterable>
          <el-option :label="$t('base.all')" value=""></el-option>
          <el-option v-for="item in targetList" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="IP" v-if="createTriggerForm.resource == 'operation_log' && createTriggerForm.resource != 'system_overview'">
        <el-input class="col-12" v-model="operationLog.ip"></el-input>
      </el-form-item>
      <el-form-item :label="$t('task.startTime')" v-if="createTriggerForm.resource == 'operation_log' || hostPerformanceSelect=='4' && createTriggerForm.resource != 'system_overview'">
        <el-date-picker v-model="operationLog.start_time" type="date" :editable="false" :placeholder="$t('base.startDate')" :picker-options="spickerOption"></el-date-picker>
      </el-form-item>
      <el-form-item :label="$t('task.endTime')" v-if="createTriggerForm.resource == 'operation_log' || hostPerformanceSelect=='4' && createTriggerForm.resource != 'system_overview'">
        <el-date-picker v-model="operationLog.end_time" type="date" :editable="false" :placeholder="$t('base.endDate')" :picker-options="epickerOption"></el-date-picker>
      </el-form-item>
      <!-- 操作日志 end-->
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="createTriggerTask" type="primary" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
  </div>
</template>
<script>
  export default {
    name: "PeriodReportCreate",
    data() {
      return {
        loading: false,
        roleType:Vue.roleType,
        indicatorOption:[],
        resourceOption:[
          {id:"host", name: Vue.t('base.host')},
          {id:"operation_log", name: Vue.t('base.operateRecord')},
          {id:"system_overview", name: Vue.t('report.systemoverview')},
          {id:"vm", name: Vue.t('base.cloudHost')}
        ],
        periodRequestParam: {},
        requestBody:{},
        hourDisabled:false,
        availabilityZoneOptions:[],
        hostOptions:[],
        flavorOptions:[],
        onedayhours:[],
        hostPerformanceSelect:"1",
        saving:false,
        createTriggerForm:{
          name:'',
          date:new Date(),
          type:'1',
          cycle:1,
          number:"1", //天数
          number2:"1", //小时
          number3:"1", //每周
          number4:"1", //每月
          year:new Date().getFullYear(),
          month:new Date().getMonth()+1,
          day:new Date().getDate(),
          hour:(function(hour) {
            if (hour<10) return "0"+hour;
            return hour+"";
          })(new Date().getHours()),
          minute:(function(minute) {
            if (minute<10) return "0"+minute;
            return minute+"";
          })(new Date().getMinutes()),
          hourAndMin:new Date(),
          project_id:'',
          dateStr:'',
          first_execution_time:'',
          query_project:'',
          projectName:"",
          resource:"",
          indicator:"",
          userId:"",
          userName:""
        },
        hourOptions:[],
        minuteOptions:[],
        pickerOptions:{
          disabledDate(time) {
            return time.getTime() < Date.now() -8.64e7;
          }
        },
        cycleListOptions: [
          {id:3, name:Vue.t('container.everyHour')},
          {id:1, name :Vue.t('container.everyDay')},
          // {id:2, name:Vue.t('container.everyNDay')},
          {id:4, name:Vue.t('container.everyWeek')},
          {id:5, name:Vue.t('container.everyMonth')}
        ],
        weeks: [
          {id:0, name:Vue.t('container.sunday')},
          {id:1, name:Vue.t('container.monday')},
          {id:2, name:Vue.t('container.tuesday')},
          {id:3, name:Vue.t('container.wednesday')},
          {id:4, name:Vue.t('container.thursday')},
          {id:5, name:Vue.t('container.friday')},
          {id:6, name:Vue.t('container.saturday')}
        ],
        months: [
          {id:1, name :"1"}, {id:2, name:"2"}, {id:3, name:"3"}, {id:4, name:"4"}, {id:5, name:"5"},
          {id:6, name:"6"}, {id:7, name:"7"}, {id:8, name:"8"}, {id:9, name:"9"}, {id:10, name :"10"},
          {id:11, name :"11"}, {id:12, name:"12"}, {id:13, name:"13"}, {id:14, name:"14"}, {id:15, name:"15"},
          {id:16, name:"16"}, {id:17, name:"17"}, {id:18, name:"18"}, {id:19, name:"19"}, {id:20, name :"20"},
          {id:21, name :"21"}, {id:22, name:"22"}, {id:23, name:"23"}, {id:24, name:"24"}, {id:25, name:"25"},
          {id:26, name:"26"}, {id:27, name:"27"}, {id:28, name:"28"}, {id:29, name:"29"}, {id:30, name :"30"}, {id:31, name :"31"}
        ],
        vmProps:{
          status:"",
          availability_zone:"",
          flavor:"",
          host:""
        },
        vmAlarm:{
          resourceName:"",
          level:"",
          ipAddress:""
        },
        operationLog:{
          user_name:"",
          target:"",
          ip:"",
          start_time:(function(d) {
            let date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
            date.setDate(date.getDate()-7);
            return date;
          })(new Date()),
          end_time:(function(d) {
            let date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
            return date;
          })(new Date())
        },
        targetList:(function(obj, lan) {
          let arr = [];
          for (let key in obj) {
            let ar = [];
            if (obj[key].flg!=undefined) {
              ar = obj[key].flg.split(',');
            }
            if (undefined!==ar.find( (item) => { return item.trim()==Vue.roleType } )) {
              arr.push({
                id:obj[key][lan],
                name:obj[key][lan]
              });
            }
          }
          return arr;
        })(Vue.logTarget, Vue.language),
        spickerOption:function() {
          let me = this;
          return {
            disabledDate(time) {
              let date = new Date();
              date.setFullYear(1970);
              if (me.operationLog.end_time) {
                return time.getTime() < date.getTime() || time.getTime() > me.operationLog.end_time;
              } else {
                return time.getTime() < date.getTime() || time.getTime() > Date.now();
              }
            }
          }
        }.bind(this)(),
        epickerOption:function() {
          let me = this;
          return {
            disabledDate(time) {
              let date = new Date();
              date.setFullYear(1970);
              if (me.operationLog.start_time) {
                return time.getTime() < me.operationLog.start_time || time.getTime() > Date.now();
              } else {
                return time.getTime() < date.getTime() || time.getTime() > Date.now();
              }
            }
          }
        }.bind(this)(),
        rules: {
          name: [
            {type: 'required'},
            {type: 'startwithLetter_NoChineseDot'},
            {type: 'maxSize', value:40}
          ],
          cycle: [
            {type: 'required', trigger: 'blur change'}
          ],
          date: [
            {type: 'required', trigger: 'blur change'}
          ],
          hour: [
            // {type: 'required'},
            {type: 'integer'},
            {type: 'max', value:23},
            {type: 'min', value:0}
          ],
          minute: [
            // {type: 'required'},
            {type: 'integer'},
            {type: 'max', value:59},
            {type: 'min', value:0}
          ],
          // number: [
          //   {type: 'required'},
          //   {type: 'integer'},
          //   {type: 'max', value:100},
          //   {type: 'min', value:1}
          // ],
          // number2: [
          //   {type: 'required'},
          //   {type: 'integer'},
          //   {type: 'max', value:24},
          //   {type: 'min', value:1}
          // ],
          number3: [
            {type: 'required'}
          ],
          number4: [
            {type: 'required'}
          ]
        },
        flag: false,
        dialogVisible: false
      }
    },
    watch:{
    },
    mounted() {
      this.initDialog();
    },
    methods: {
      initDialog() {
        this.dialogVisible = true;
        this.getResourceList();
        this.hourOptions = [];
        this.minuteOptions = [];
        this.onedayhours = [];
        for (let i = 0; i < 24; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          this.hourOptions.push(i+"");
        }
        for (let i = 0; i < 60; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          this.minuteOptions.push(i+"");
        }
        for (let i = 1; i <= 24; i++) {
          this.onedayhours.push(i);
        }
      },
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      },
      cancel() {
        this.$emit("handleCancelShow", {});
      },
      radioChange(value) {
        if (value == '1') {
          this.createTriggerForm.cycle = 1;
          this.createTriggerForm.date = new Date();
        } else {
          this.createTriggerForm.date = new Date();
        }
        this.hourDisabled = false;
      },
      typeChange() {
        if (this.createTriggerForm.cycle == 3) {
          this.hourDisabled = true;
          this.createTriggerForm.hour = "08";
        } else {
          this.hourDisabled = false;
        }
        if (this.createTriggerForm.cycle != 2) {
          this.createTriggerForm.number = "1";
        }
      },
      async getResourceList() {
        try {
          await this.$ajax({
            url:"api/leo/v1/report/get_resource",
            type:"get",
            data:{
              roleType:self.roleType
            },
            successFun:(response) => {
              this.resourceOption = [];
              let resourceList = response.resources;
              if (resourceList && resourceList.length > 0) {
                for (let i = 0; i < resourceList.length; i++) {
                  let resource = resourceList[i];
                  let name = resource.name;
                  if (Vue.language == "en") {
                    name = resource.name_en;
                  }
                  this.resourceOption.push({
                    id:resource.id,
                    name:name
                  });
                }
                this.createTriggerForm.resource = resourceList[0].id;
                this.getIndicatorList(this.createTriggerForm.resource);
              }
            },
            errFun:() => {
              this.resourceOption = [];
            }
          });
        } catch (data) {
          this.resourceOption = [];
        }
      },
      async getIndicatorList(resourceId) {
        let self = this;
        self.loading = true;
        if (resourceId != "system_overview") {
          self.vmAlarm.resourceName = "";
          self.vmAlarm.ipAddress = "";
          await self.$ajax({
            url:"api/leo/v1/report/get_indicator",
            type:"get",
            data:{
              resource_id:resourceId,
              role_type:self.roleType
            },
            successFun:(response) => {
              self.indicatorOption = [];
              let indicatorList = response.indicators;
              if (indicatorList && indicatorList.length > 0) {
                for (let i = 0; i < indicatorList.length; i++) {
                  let indicator = indicatorList[i];
                  if (!Vue.service[indicator.module]) continue;
                  let name = indicator.name;
                  if (Vue.language == "en") {
                    name = indicator.name_en;
                  }
                  self.indicatorOption.push({
                    id:indicator.id,
                    name:name
                  });
                }
                self.createTriggerForm.indicator = self.indicatorOption[0].id;
              }
            }
          });
        }
        self.loading = false;
        // 根据不同资源调用接口
        if (resourceId == "vm") {
          self.getAvailabilityZone();
          self.getFlavorList();
          if (self.roleType == "0") {
            self.getHostList();
          }
        }
      },
      getPeriodParam() {
        let self = this;
        if ( this.createTriggerForm.resource == "system_overview") {
          this.createTriggerForm.indicator="system_overview";
        }
        let reqBody = {};
        let reqProps = {};
        if (self.createTriggerForm.resource == "vm") {
          if (self.createTriggerForm.indicator != "vm_alarm") {
            if (self.createTriggerForm.indicator == 'vm_performance_report') {
              if (self.hostPerformanceSelect == "1") {
                let date = new Date(new Date().getTime());
                let endTime = parseInt(new Date().getTime()/1000);
                let startTime = parseInt((date.setDate(date.getDate()-1))/1000);
                reqProps.starttime = startTime;
                reqProps.endtime = endTime;
              } else if (self.hostPerformanceSelect == "2") {
                let date = new Date(new Date().getTime());
                let endTime = parseInt(date.getTime()/1000);
                let startTime = parseInt((date.setDate(date.getDate()-7))/1000);
                reqProps.starttime = startTime;
                reqProps.endtime = endTime;
              } else if (self.hostPerformanceSelect == "3") {
                let date = new Date(new Date().getTime());
                let endTime = parseInt(date.getTime()/1000);
                let startTime = parseInt((date.setMonth(date.getMonth()-1))/1000);
                reqProps.starttime = startTime;
                reqProps.endtime = endTime;
              } else if (self.hostPerformanceSelect == "4") {
                if (self.operationLog.start_time == null || self.operationLog.start_time == "") {
                  self.$message.error(Vue.t("network.selectStartdata"));
                  return;
                }
                if (self.operationLog.end_time == null || self.operationLog.end_time == "") {
                  self.$message.error(Vue.t("network.selectEnddata"));
                  return;
                }
                reqProps.starttime = parseInt((new Date(self.operationLog.start_time).getTime())/1000);
                reqProps.endtime = parseInt((new Date(self.operationLog.end_time).getTime()+24*3600*1000-1)/1000);
              }
              reqProps.user_id = self.createTriggerForm.userId;
            }

            reqProps = Object.assign({}, reqProps, self.vmProps);
            // reqProps.name = self.createTriggerForm.name;
            reqProps.project_id = self.createTriggerForm.query_project;
          }
        } else if (self.createTriggerForm.resource == "operation_log") {
          if (self.operationLog.user_name.length > 40 || self.operationLog.ip.length > 40) {
            this.$message.error(this.$t('heat.fortyCharacterMaximum'));
            return;
          }
          let ipReg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
          if (self.operationLog.ip != "" && !ipReg.test(self.operationLog.ip)) {
            this.$message.error(this.$t('base.ipFormatError'));
            return false;
          }

          reqProps = Object.assign({}, reqProps, self.operationLog);
          reqProps.start_time = new Date(self.operationLog.start_time).getTime()+new Date().getTimezoneOffset()*60*1000;
          reqProps.end_time = new Date(self.operationLog.end_time).getTime()+new Date().getTimezoneOffset()*60*1000+24*3600*1000-1;
          reqProps.language = Vue.language || "zh_cn";
          reqProps.project_id = self.roleType==0?self.createTriggerForm.query_project:this.$cookie.get('pid');
          reqProps.region_id = this.$cookie.get("region_id");
          reqProps.field = "create_time";
          reqProps.dir = "desc";
          reqProps.user_name_accurate = "0";
        } else if (self.createTriggerForm.resource == "host") {
          if (self.hostPerformanceSelect == "1") {
            let date = new Date(new Date().getTime());
            let endTime = parseInt(new Date().getTime()/1000);
            let startTime = parseInt((date.setDate(date.getDate()-1))/1000);
            reqProps.starttime = startTime;
            reqProps.endtime = endTime;
          } else if (self.hostPerformanceSelect == "2") {
            let date = new Date(new Date().getTime());
            let endTime = parseInt(date.getTime()/1000);
            let startTime = parseInt((date.setDate(date.getDate()-7))/1000);
            reqProps.starttime = startTime;
            reqProps.endtime = endTime;
          } else if (self.hostPerformanceSelect == "3") {
            let date = new Date(new Date().getTime());
            let endTime = parseInt(date.getTime()/1000);
            let startTime = parseInt((date.setMonth(date.getMonth()-1))/1000);
            reqProps.starttime = startTime;
            reqProps.endtime = endTime;
          } else if (self.hostPerformanceSelect == "4") {
            if (self.operationLog.start_time == null || self.operationLog.start_time == "") {
              self.$message.error(Vue.t("network.selectStartdata"));
              return;
            }
            if (self.operationLog.end_time == null || self.operationLog.end_time == "") {
              self.$message.error(Vue.t("network.selectEnddata"));
              return;
            }
            reqProps.starttime = parseInt((new Date(self.operationLog.start_time).getTime())/1000);
            reqProps.endtime = parseInt((new Date(self.operationLog.end_time).getTime()+24*3600*1000-1)/1000);
          }
        } else if (self.createTriggerForm.indicator == "vm_alarm" || self.createTriggerForm.indicator == "host_alarm") {
          if (self.vmAlarm.resourceName.length > 40 || self.vmAlarm.ipAddress.length > 40) {
            this.$message.error(this.$t('heat.fortyCharacterMaximum'));
            return;
          }
          let ipReg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
          if (self.vmAlarm.ipAddress != "" && !ipReg.test(self.vmAlarm.ipAddress)) {
            this.$message.error(this.$t('base.ipFormatError'));
            return false;
          }

          reqProps = {};
          reqProps = {
            level:self.vmAlarm.level,
            resource_name:self.vmAlarm.resourceName,
            resource_ip:self.vmAlarm.ipAddress,
            page_num:1,
            page_size:999999
          }
        }

        if (self.roleType == '0') {
          reqBody.all_tenants = 1;
          reqProps.all_tenants = 1;
        } else {
          reqBody.all_tenants = 0;
        }
        reqBody.project_id = this.$cookie.get("pid");
        reqBody.indicator_id = self.createTriggerForm.indicator;
        reqBody.language = Vue.language || "zh_cn";
        reqBody.props = reqProps;
        reqBody.user_id = Vue.userId;

        this.periodRequestParam = reqBody;
      },
      createTriggerTask(param) {
        this.$refs.createTriggerForm.validate((valid) => {
          if (valid) {
            let self = this;
            let date2 = self.createTriggerForm.date;
            let year = date2.getFullYear();
            let month = date2.getMonth()+1;
            let day = date2.getDate();
            let formHour = self.createTriggerForm.hour;
            let formMinute = self.createTriggerForm.minute;
            //当前日期和时间
            let currentDate = new Date();
            let currentYear = currentDate.getFullYear();
            let currentMonth = currentDate.getMonth()+1;
            let currentDay = currentDate.getDate();
            let currentHour = currentDate.getHours();
            let currentMinute = currentDate.getMinutes();
            // 只有只执行一次的时候，需要验证时间不能
            if (self.createTriggerForm.type == '2') {
              //日期等于今天 输入小时和分钟不能小于当前的
              if (year < currentYear) {
                  self.$message.error(self.$t('task.earlyThanCurrentTimeErrorMsg'));
                  return;
              } else if (year == currentYear) {
                if (month < currentMonth) {
                  self.$message.error(self.$t('task.earlyThanCurrentTimeErrorMsg'));
                  return;
                } else if (month == currentMonth) {
                  if (day < currentDay) {
                    self.$message.error(self.$t('task.earlyThanCurrentTimeErrorMsg'));
                    return;
                  } else if (day == currentDay) {
                      if (formHour < currentHour || (formHour == currentHour && formMinute < currentMinute)) {
                        self.$message.error(self.$t('task.earlyThanCurrentTimeErrorMsg'));
                        return;
                      }
                  }
                }
              }
              if (currentYear == year && currentMonth == month && currentDay == day) {
                if (formHour < currentHour || (formHour == currentHour && formMinute <= currentMinute)) {
                  self.$message.error(self.$t('task.earlyThanCurrentTimeErrorMsg'));
                  return;
                }
              }
            }
            let dateStr = year + '-' + month + '-' + day;
            var firstExecutionTimeTemp = dateStr + ' ' + self.createTriggerForm.hour + ':' + self.createTriggerForm.minute;
            let commitForm = {};
            commitForm.name = self.createTriggerForm.name;
            commitForm.type = self.createTriggerForm.type;
            commitForm.cycle = self.createTriggerForm.cycle + '';
            commitForm.hour = self.createTriggerForm.hour + '';
            commitForm.minute = self.createTriggerForm.minute + '';
            commitForm.first_execution_time = firstExecutionTimeTemp;
            if (self.roleType == '0') {
              commitForm.all_tenants = '1';
            } else {
              commitForm.all_tenants = '0';
            }
            if (self.createTriggerForm.cycle == '2' && self.createTriggerForm.type == '1') {
              commitForm.number = self.createTriggerForm.number + "";
            }
            if (self.createTriggerForm.cycle == '3' && self.createTriggerForm.type == '1') {
              commitForm.number = self.createTriggerForm.number2 + "";
            }
            if (self.createTriggerForm.cycle == '4' && self.createTriggerForm.type == '1') {
              // var nList = self.createTriggerForm.number3;
              // let tempNum = '';
              // for (let i=0; i<nList.length; i++) {
              //   if (i==0) {
              //     tempNum = nList[i] + '';
              //   } else {
              //     tempNum = tempNum + ',' + nList[i];
              //   }
              // }
              commitForm.number = self.createTriggerForm.number3 + '';
            }
            if (self.createTriggerForm.cycle == '5' && self.createTriggerForm.type == '1') {
              // var nList2 = self.createTriggerForm.number4;
              // let tempNum = '';
              // for (let i=0; i<nList2.length; i++) {
              //   if (i==0) {
              //     tempNum = nList2[i] + '';
              //   } else {
              //     tempNum = tempNum + ',' + nList2[i];
              //   }
              // }
              commitForm.number = self.createTriggerForm.number4 + "";
            }
            let cornTask = {};
            cornTask.workflow_id = '1e7a144c-9b30-42aa-9c3e-e37d5d033244';
            cornTask.workflow_name = 'tasks_reportforms';
            self.getPeriodParam();
            cornTask.workflow_input = self.periodRequestParam;
            cornTask.workflow_params = {};
            cornTask.name = self.createTriggerForm.name;
            commitForm.cron_task = cornTask;
            self.requestBody = Object.assign({}, commitForm);
            self.loading = true;
            self.saving = true;
            try {
              let response = self.$ajax({
                type: 'post',
                url: 'api/mistral/v2/cloud_tasks',
                data:JSON.stringify(self.requestBody),
                successMsg:self.$t('task.createSuccessMsg'),
                log:{
                  description:{
                    en:"Create Period Report task:" + self.createTriggerForm.name,
                    zh_cn:"创建周期报表任务：" + self.createTriggerForm.name
                  },
                  target:Vue.logTarget.Report
                },
                successFun:(res) => {
                  self.loading = false;
                  self.saving = false;
                  self.$emit("handleAddShow", {});
                },
                showErrMsg: false,
                errFun:(res) => {
                  self.loading = false;
                  self.saving = false;
                  let resp = res["responseJSON"];
                  if (resp.faultstring.indexOf("Duplicate entry for cron trigger") > -1) {
                    self.$notify.error({
                      message: Vue.t('task.errorTaskNote1')
                    });
                  } else if (resp.faultstring.indexOf("Duplicate entry for cron cloud_task") > -1) {
                    self.$notify.error({
                      message: Vue.t('task.errorTaskNote22')
                    });
                  } else if (resp.faultstring.indexOf("Already") > -1) {
                    self.$notify.error({
                      message: Vue.t('task.errorTaskNote3')
                    });
                  } else if (resp.faultstring.indexOf("Duplicate entry for cloud_task") > -1) {
                    self.$notify.error({
                      message: Vue.t('task.errorTaskNote22')
                    });
                  } else {
                    self.$notify.error({
                      message: resp.faultstring
                    });
                  }
                }
              });
            } catch (data) {
              self.loading = false;
              self.saving = false;
              console.log("创建云计划任务失败");
            }
          }
        });
      },
      //以下可能用不着了-----------------------------------------
      onIconClick() {
        this.createTriggerForm.query_project = '';
        this.createTriggerForm.projectName = '';
      },
      onIconClick2() {
        this.createTriggerForm.userId = '';
        this.createTriggerForm.userName = '';
      },
      showProject() {
      },
      showUser() {
      },
      // 获取可用域
      async getAvailabilityZone() {
        let self = this;
        await this.$ajax({
          type:"get",
          url:"api/nova/v2.1/os-availability-zone",
          successFun:(response) => {
            let dataList = response.availabilityZoneInfo;
            self.availabilityZoneOptions = [];
            dataList.forEach(data => {
              if (data.zoneState.available === true) {
                self.availabilityZoneOptions.push(data);
              }
            });
          }
        });
      },
      // 获取实例规格
      async getFlavorList() {
        try {
          let publicFlavor = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/flavors/detail?is_public=true"
          });
          let privateFlavor = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/flavors/detail?is_public=false"
          });
          let dataList = [];
          let idList = [];
          publicFlavor.flavors.forEach(function(obj, index) {
            dataList.push(obj);
            idList.push(obj['id']);
          });
          privateFlavor.flavors.forEach(function(obj, index) {
            if (idList.indexOf(obj['id']) == -1) {
              dataList.push(obj);
            }
          });
          this.flavorOptions = [];
          for (let i = 0; i < dataList.length; i++) {
            let data = dataList[i];
            if (data.name.indexOf("Bare@") < 0) {
              data.detail = data.name;
              this.flavorOptions.push(data);
            }
          }
        } catch (data) {
        }
      },
       // 获取主机
      async getHostList() {
        let self = this;
        await this.$ajax({
          type:"get",
          url:"api/nova/v2.1/os-hypervisors/detail",
          successFun:(response) => {
            let dataList = response.hypervisors;
            self.hostOptions = [];
            dataList.forEach(data => {
              if (data['hypervisor_type'] == "ironic") {
                // continue;
              } else {
                self.hostOptions.push(data);
              }
            });
          }
        });
      }
    }
  }
</script>
<style scoped>

</style>