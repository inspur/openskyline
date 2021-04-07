<template>
  <div>
      <el-form ref="createTriggerForm" :model="createTriggerForm" :rules=rules label-width="80px" class="margin-tb20 me-required-form" v-loading="loading">
        <el-form-item :label="$t('report.planName')" prop="name" class="is-required">
          <el-input class="col-12" v-model="createTriggerForm.name" auto-complete="off" @change="nameCheckRender"></el-input>
          <div class="el-form-item__error" id="name-repert-error" hidden>{{$t('container.repeatnameError')}}</div>
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
        <el-form-item v-if="createTriggerForm.type == '1'" :label="$t('task.cycle')" prop="cycle" class="is-required">
          <el-select class="col-12" v-model="createTriggerForm.cycle" @change="typeChange">
            <el-option v-for="item in cycleListOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="createTriggerForm.cycle == '4' && createTriggerForm.type == '1'" :label="$t('task.date')" prop="number3" class="is-required">
            <el-checkbox-group v-model="createTriggerForm.number3"> 
              <el-checkbox-button class="clearfix" v-for="item in weeks" :key="item.id" :label="item.id">{{item.name}}</el-checkbox-button> 
            </el-checkbox-group>
        </el-form-item>
        <el-form-item v-if="createTriggerForm.cycle == '5' && createTriggerForm.type == '1'" :label="$t('task.date')" prop="number4" class="is-required">
          <el-checkbox-group v-model="createTriggerForm.number4"> 
            <el-checkbox-button class="clearfix" v-for="item in months" :key="item.id" :label="item.id">{{item.name}}</el-checkbox-button>         
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-if="createTriggerForm.cycle != '6' || createTriggerForm.type == '2' " :label="(createTriggerForm.cycle=='3' && createTriggerForm.type == '1')?$t('lang.minute'):$t('task.time')" prop="time" class="is-required">
          <el-col class="col-5" style="display:inline-block" v-if="createTriggerForm.type == '2' || createTriggerForm.cycle!=3">
            <el-form-item prop="hour" class="is-required">
              <el-select v-model="createTriggerForm.hour" filterable :disabled="hourDisabled">
                <el-option v-for="item in hourOptions" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="col-2" style="display:inline-block; width:5px" v-if="createTriggerForm.type == '2' || createTriggerForm.cycle!=3">:</el-col>
          <el-col class="col-5" style="display:inline-block">
            <el-form-item prop="minute" class="is-required">
              <el-select v-model="createTriggerForm.minute" filterable>
                <el-option v-for="item in minuteOptions" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item v-if="createTriggerForm.cycle == '6' && createTriggerForm.type == '1'" :label="$t('base.timeLength')" prop="number6" class="is-required">
          <el-select v-model="createTriggerForm.number6" filterable>
            <el-option v-for="item in minuteTwoOptions" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="me-form-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button @click="nextStep" type="primary" :disable='loading'>{{$t('lang.nextStep')}}</el-button>
        <el-button @click="createTrigger" type="primary" :disable='loading'>{{$t('lang.finish')}}</el-button>
      </div>
  </div>
</template>
<script>
  export default {
    name: "WorkFlowCreateTriggerStepOne",
    data() {
      return {
        requestBody:{},
        hourDisabled:false,
        createTriggerForm:{
          name:'',
          date:new Date(),
          type:'1',
          cycle:1,
          number:"1", //天数
          number2:"1", //小时
          number3:[1], //每周
          number4:[1], //每月
          number6:'05',
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
          first_execution_time:''
        },
        hourOptions:[],
        minuteOptions:[],
        minuteTwoOptions:['05', '10', '15', '30'],
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() < Date.now() -8.64e7;
          }
        },
        cycleListOptions: [
          {id:6, name:Vue.t('lang.minute')},
          {id:3, name:Vue.t('container.everyHour')},
          {id:1, name :Vue.t('container.everyDay')},
          // {id:2, name:Vue.t('container.everyNDay')},
          {id:4, name:Vue.t('container.everyWeek')},
          {id:5, name:Vue.t('container.everyMonth')}
        ],
        weeks: [
          {id:0, name :Vue.t('container.sunday')},
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
        rules: {
          templateData: [
            {type: 'required'}
          ],
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
          number3: [
            {type: 'required'}
          ],
          number4: [
            {type: 'required'}
          ]
        },
        loading:false,
        nameList:[]
      }
    },
    mounted() {
      this.initDialog();
    },
    methods: {
      radioChange(value) {
        if (value == '1') {
          this.createTriggerForm.cycle = 1;
          this.createTriggerForm.date = new Date();
        } else {
          this.createTriggerForm.date = new Date();
        }
        this.hourDisabled = false;
      },
      initDialog() {
        let self = this;
        self.getNameList();
        self.hourOptions = [];
        self.minuteOptions = [];
        for (let i = 0; i < 24; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          self.hourOptions.push(i+"");
        }
        for (let i = 0; i < 60; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          self.minuteOptions.push(i+"");
        }
      },
      async getNameList() {
        let self = this;
        let serviceUrl = "api/mistral/v2/cloud_tasks?project_id=" + this.$cookie.get("pid");
        self.nameList = [];
        try {
          let workFlowList = await this.$ajax({
            type: 'get',
            url: serviceUrl,
            showErrMsg:false
          });
          let dataResult = [];
          let tempResult = workFlowList.cloud_tasks;
          for (let temp of tempResult) {
            if (temp['workflow_name'] != 'tasks_reportforms') {
              dataResult.push(temp);
            }
          }
          let dataList = [];
          for (let i = 0; i < dataResult.length; i++) {
            self.nameList.push(dataResult[i].name);
          }
        } catch (data) {
        }
      },
      nameCheckRender(value) {
        let flag = false;
        if (value.length > 0) {
          for (let i=0; i<this.nameList.length; i++) {
            if (value == this.nameList[i]) {
              flag = true;
              break;
            }
          }
          if (flag) {
            $("#name-repert-error").show();
            return true;
          } else {
            $("#name-repert-error").hide();
            return false;
          }
        } else {
           $("#name-repert-error").hide();
           return false;
        }
      },
      nextStep() {
        if (this.nameCheckRender(this.createTriggerForm.name)) {
          return false;
        }
        this.$refs.createTriggerForm.validate((valid) => {
          if (valid) {
            let self = this;
            // 当前项目id，只有项目管理员能够创建
            //this.createTriggerForm.project_id =  self.$cookie.get("pid");
            let date2 = this.createTriggerForm.date;
            let year = date2.getFullYear();
            let month = date2.getMonth()+1;
            let day = date2.getDate();
            let formHour = this.createTriggerForm.hour;
            let formMinute = this.createTriggerForm.minute;
            //当前日期和时间
            let currentDate = new Date();
            let currentYear = currentDate.getFullYear();
            let currentMonth = currentDate.getMonth()+1;
            let currentDay = currentDate.getDate();
            let currentHour = currentDate.getHours();
            let currentMinute = currentDate.getMinutes();
            // 只有只执行一次的时候，需要验证时间不能
            if (this.createTriggerForm.type == '2') {
              //日期等于今天 输入小时和分钟不能小于当前的
              if (year < currentYear) {
                  this.$message.error(this.$t('task.earlyThanCurrentTimeErrorMsg'));
                  return;
              } else if (year == currentYear) {
                if (month < currentMonth) {
                  this.$message.error(this.$t('task.earlyThanCurrentTimeErrorMsg'));
                  return;
                } else if (month == currentMonth) {
                  if (day < currentDay) {
                    this.$message.error(this.$t('task.earlyThanCurrentTimeErrorMsg'));
                    return;
                  } else if (day == currentDay) {
                      if (formHour < currentHour || (formHour == currentHour && formMinute < currentMinute)) {
                        this.$message.error(this.$t('task.earlyThanCurrentTimeErrorMsg'));
                        return;
                      }
                  }
                }
              }
              if (currentYear == year && currentMonth == month && currentDay == day) {
                if (formHour < currentHour || (formHour == currentHour && formMinute < currentMinute)) {
                  this.$message.error(this.$t('task.earlyThanCurrentTimeErrorMsg'));
                  return;
                }
              }
            }
            let dateStr = year + '-' + month + '-' + day;
            var firstExecutionTimeTemp = dateStr + ' ' + this.createTriggerForm.hour + ':' + this.createTriggerForm.minute;
            let commitForm = {};
            commitForm.name = this.createTriggerForm.name;
            commitForm.type = this.createTriggerForm.type;
            commitForm.cycle = this.createTriggerForm.cycle + '';
            if (this.createTriggerForm.cycle == '2' && this.createTriggerForm.type == '1') {
              commitForm.number = this.createTriggerForm.number;
            }
            if (this.createTriggerForm.cycle == '3' && this.createTriggerForm.type == '1') {
              commitForm.number = this.createTriggerForm.number2;
            }
            if (this.createTriggerForm.cycle == '6' && this.createTriggerForm.type == '1') {
              commitForm.number = this.createTriggerForm.number2;
            }
            if (this.createTriggerForm.cycle == '4' && this.createTriggerForm.type == '1') {
              var nList = this.createTriggerForm.number3;
              let tempNum = '';
              for (let i=0; i<nList.length; i++) {
                //console.log(nList[i]);
                if (i==0) {
                  tempNum = nList[i] + '';
                } else {
                  tempNum = tempNum + ',' + nList[i];
                }
              }
              commitForm.number = tempNum;
            }
            if (this.createTriggerForm.cycle == '5' && this.createTriggerForm.type == '1') {
              var nList2 = this.createTriggerForm.number4;
              let tempNum = '';
              for (let i=0; i<nList2.length; i++) {
                if (i==0) {
                  tempNum = nList2[i] + '';
                } else {
                  tempNum = tempNum + ',' + nList2[i];
                }
              }
              commitForm.number = tempNum;
            }
            commitForm.hour = this.createTriggerForm.hour + '';
            commitForm.minute = this.createTriggerForm.minute + '';
            if (this.createTriggerForm.cycle == '6' && this.createTriggerForm.type == '1') {
              commitForm.minute = this.createTriggerForm.number6 + '';
            }
            commitForm.first_execution_time = firstExecutionTimeTemp;
            self.requestBody = Object.assign({}, commitForm);
            this.$emit("stepOneDone", self.requestBody);
          } else {
            return false;
          }
        });
      },
      createTrigger() {
        if (this.nameCheckRender(this.createTriggerForm.name)) {
          return false;
        }
        this.$refs.createTriggerForm.validate((valid) => {
          if (valid) {
            this.$confirm(this.$t('task.onlyCreateCloudTaskConfirmMsg'), this.$t('lang.confirm'), {
              confirmButtonText:this.$t('lang.confirm'),
              cancelButtonText:this.$t('lang.cancel'),
              type:'warning'
            }).then(() => {
              let self = this;
              // 当前项目id，只有项目管理员能够创建
              //this.createTriggerForm.project_id =  self.$cookie.get("pid");
              let date2 = this.createTriggerForm.date;
              let year = date2.getFullYear();
              let month = date2.getMonth()+1;
              let day = date2.getDate();
              let formHour = this.createTriggerForm.hour;
              let formMinute = this.createTriggerForm.minute;
              //当前日期和时间
              let currentDate = new Date();
              let currentYear = currentDate.getFullYear();
              let currentMonth = currentDate.getMonth()+1;
              let currentDay = currentDate.getDate();
              let currentHour = currentDate.getHours();
              let currentMinute = currentDate.getMinutes();
              // 只有只执行一次的时候，需要验证时间不能
              if (this.createTriggerForm.type == '2') {
                //日期等于今天 输入小时和分钟不能小于当前的
                if (year < currentYear) {
                    this.$message.error(this.$t('task.earlyThanCurrentTimeErrorMsg'));
                    return;
                } else if (year == currentYear) {
                  if (month < currentMonth) {
                    this.$message.error(this.$t('task.earlyThanCurrentTimeErrorMsg'));
                    return;
                  } else if (month == currentMonth) {
                    if (day < currentDay) {
                      this.$message.error(this.$t('task.earlyThanCurrentTimeErrorMsg'));
                      return;
                    } else if (day == currentDay) {
                        if (formHour < currentHour || (formHour == currentHour && formMinute < currentMinute)) {
                          this.$message.error(this.$t('task.earlyThanCurrentTimeErrorMsg'));
                          return;
                        }
                    }
                  }
                }
                if (currentYear == year && currentMonth == month && currentDay == day) {
                  if (formHour < currentHour || (formHour == currentHour && formMinute < currentMinute)) {
                    this.$message.error(this.$t('task.earlyThanCurrentTimeErrorMsg'));
                    return;
                  }
                }
              }
              let dateStr = year + '-' + month + '-' + day;
              var firstExecutionTimeTemp = dateStr + ' ' + this.createTriggerForm.hour + ':' + this.createTriggerForm.minute;
              let commitForm = {};
              commitForm.name = this.createTriggerForm.name;
              commitForm.type = this.createTriggerForm.type;
              commitForm.cycle = this.createTriggerForm.cycle + '';
              if (this.createTriggerForm.cycle == '2' && this.createTriggerForm.type == '1') {
                commitForm.number = this.createTriggerForm.number;
              }
              if (this.createTriggerForm.cycle == '3' && this.createTriggerForm.type == '1') {
                commitForm.number = this.createTriggerForm.number2;
              }
              if (this.createTriggerForm.cycle == '6' && this.createTriggerForm.type == '1') {
                commitForm.number = this.createTriggerForm.number2;
              }
              if (this.createTriggerForm.cycle == '4' && this.createTriggerForm.type == '1') {
                var nList = this.createTriggerForm.number3;
                let tempNum = '';
                for (let i=0; i<nList.length; i++) {
                  if (i==0) {
                    tempNum = nList[i] + '';
                  } else {
                    tempNum = tempNum + ',' + nList[i];
                  }
                }
                commitForm.number = tempNum;
              }
              if (this.createTriggerForm.cycle == '5' && this.createTriggerForm.type == '1') {
                var nList2 = this.createTriggerForm.number4;
                let tempNum = '';
                for (let i=0; i<nList2.length; i++) {
                  if (i==0) {
                    tempNum = nList2[i] + '';
                  } else {
                    tempNum = tempNum + ',' + nList2[i];
                  }
                }
                commitForm.number = tempNum;
              }
              commitForm.hour = this.createTriggerForm.hour + '';
              commitForm.minute = this.createTriggerForm.minute + '';
              if (this.createTriggerForm.cycle == '6' && this.createTriggerForm.type == '1') {
                commitForm.minute = this.createTriggerForm.number6 + '';
              }
              commitForm.first_execution_time = firstExecutionTimeTemp;
              self.requestBody = Object.assign({}, commitForm);
              self.loading = true;
              try {
                let response = this.$ajax({
                  type: 'post',
                  url: "api/mistral/v2/cloud_tasks",
                  data:JSON.stringify(self.requestBody),
                  successMsg:this.$t('task.createSuccessMsg'),
                  log:{
                    description:{
                      en:"Create cloud task:" + self.requestBody.name,
                      zh_cn:"创建云计划任务:" + self.requestBody.name
                    },
                    target:Vue.logTarget.workflowtask
                  },
                  successFun:() => {
                    this.$emit("handleClose", true);
                  },
                  showErrMsg: false,
                  errFun:(res) => {
                    self.loading = false;
                    let resp = res["responseJSON"];
                    if (resp.faultstring.indexOf("Duplicate entry for cron trigger") > -1) {
                      self.$notify.error({
                        message: Vue.t('task.errorTaskNote1')
                      });
                    } else if (resp.faultstring.indexOf("Duplicate entry for cron cloud_task") > -1) {
                      self.$notify.error({
                        message: Vue.t('task.errorTaskNote2')
                      });
                    } else if (resp.faultstring.indexOf("Already") > -1) {
                      self.$notify.error({
                        message: Vue.t('task.errorTaskNote3')
                      });
                    } else if (resp.faultstring.indexOf("Duplicate entry for cloud_task") > -1) {
                      self.$notify.error({
                        message: Vue.t('task.errorTaskNote2')
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
                console.log("创建云计划任务失败");
              }
            }).catch(() => {
              return false;
            });
          } else {
            return false;
          }
        });
      },
      cancel() {
        this.$emit("cancel");
      },
      typeChange() {
        if (this.createTriggerForm.cycle==3) {
          this.hourDisabled = true;
          this.createTriggerForm.hour = "08";
        } else {
          this.hourDisabled = false;
        }
      }
    }
  }
</script>
<style scoped>

</style>