<template>
<div>
  <el-row :gutter="10" v-loading="loading" :element-loading-text="text">
    <el-col :span="12">
      <el-card style="height:150px;">
        <div slot="header" class="clearfix">
          <span>{{$t('base.automaticallyDeleteLog')}}</span>
          <el-switch v-model="obj.deleteSwitch" style="float:right;" @change="deleteLogChange"></el-switch>
        </div>
        <el-form ref="logSettingForm" label-width="90px" :rules="rules" :model="obj">
          <el-form-item :label="$t('base.logRetentionTime')" prop="log_auto_delete_days">
            <el-input-number :controls="false" :min="1" :max="180" style="width:214px;" v-model="obj.log_auto_delete_days" :disabled="!(obj.deleteSwitch)"></el-input-number>
            <span>{{$t('base.day')}}</span>
            <span>
              <el-tooltip effect="dark" :content="$t('base.deleteLogWarn')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </span>
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" @click="recordSettingClick" :disabled="!(obj.deleteSwitch)">{{$t('base.confirm')}}</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card style="margin-top:6px;height:150px;">
        <div slot="header" class="clearfix">
          <span>{{$t('base.logDeleting')}}</span>
        </div>
        <el-form label-width="90px" label-position="right">
          <el-form-item :label="$t('base.delete')">
            <el-select v-model="value" >
              <el-option :label="$t('base.oneMonth')" value="1M"></el-option>
              <el-option :label="$t('base.threeMonth')" value="3M"></el-option>
              <el-option :label="$t('base.sixMonth')" value="6M"></el-option>
              <el-option :label="$t('base.oneYear')" value="1Y"></el-option>
            </el-select>
            <span>{{$t('base.previousLog')}}</span>
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" @click="deleteLog">{{$t('base.confirm')}}</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card style="height:308px;">
        <div slot="header" class="clearfix">
          <span>{{$t('base.logWarnSetting')}}</span>
          <el-switch v-model="obj.warnSwitch" style="float:right;" @change="warnChange"></el-switch>
        </div>

        <el-form ref="logWarnForm" label-width="180px" :rules="rules" :model="obj">
          <el-form-item :label="$t('base.diskOccCurrentLog')" v-if="obj.disk_monitor.length>0">
            <template v-for="item in obj.disk_monitor">
              <div style="display: inline-block;text-align: center;background: #ccc;color:#151515;padding: 2px 8px;margin-right: 2px;">
                <div>{{item.name}}</div>
                <div>{{item.value+"%"}}</div>
              </div>
            </template>
          </el-form-item>
          <el-form-item :label="$t('base.warnNotification')">
            <el-select v-model="obj.log_auto_warn_way" :disabled="!(obj.warnSwitch)">
              <el-option :label="$t('base.email')" value="email"></el-option>
              <el-option :label="$t('base.shortMessage')" value="sms"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('base.logAlarmThreshold')" prop="log_auto_warn_threshold">
            <el-input @change="changeFun" @blur="blurFun" style="width:214px;" v-model="obj.log_auto_warn_threshold" :disabled="!(obj.warnSwitch)"></el-input>
            <span>%</span>
            <span>
              <el-tooltip effect="dark" :content="$t('base.warnLogWarn')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </span>
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" :disabled="!(obj.warnSwitch)" @click="logWarnClick">{{$t('base.confirm')}}</el-button>
          </el-form-item>
        </el-form>
        <div style="line-height: 30px;">{{$t('base.warnLogPrompt')}}</div>
      </el-card>
    </el-col>
  </el-row>
</div>
</template>
<script>
export default {
  name:"project",
  data() {
    return {
      text:Vue.t('base.loadingData'),
      loadText:Vue.t('base.loadingData'),
      saveText:Vue.t('base.sendingData'),
      arr:[],
      bak:"",
      loading:false,
      value:"1M",
      obj:{
        deleteSwitch:false,
        warnSwitch:false,
        log_auto_delete:"",
        log_auto_delete_days:"",
        log_auto_warn:"",
        log_auto_warn_threshold:"",
        log_auto_warn_way:"",
        disk_monitor:[]
      },
      rules:{
        log_auto_delete_days:[
          {type: 'integer'}
        ]
      }
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      let me = this;
      this.loading = true;
      let ret = this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/logs/param",
        successFun(data) {
          data.forEach((item, index) => {
            if (item.disk_monitor) { //占有率
              me.obj.disk_monitor.push({
                name:item.id,
                value:item.value
              })
            } else {
              me.obj[item.id] = item.value;
            }
          })
          me.bak = me.obj.log_auto_warn_threshold;
          me.obj.deleteSwitch = me.obj.log_auto_delete == "ON";
          me.obj.warnSwitch = me.obj.log_auto_warn == "ON";
          me.loading = false;
        }
      })
    },
    deleteLogChange(value) {
      if (!value) {
        let me = this;
        me.loading = true;
        me.text = me.saveText;
        let ret = this.$ajax({
          type: 'patch',
          url: "api/keystone/v3/inspur/logs/param",
          data:JSON.stringify({
            params:{
              log_auto_delete:"OFF"
            }
          }),
          successMsg:Vue.t('base.closeSuccess'),
          successFun(data) {
            me.loading = false;
          },
          log:{
            description:{
              en:"automatically delete log settings",
              zh_cn:"自动删除日志设置"
            },
            target:Vue.logTarget.parameterSetting
          }
        })
      }
    },
    recordSettingClick() {
      let me = this;
      this.$refs.logSettingForm.validate((valid) => {
        if (!valid) {
          return;
        }
        me.loading = true;
        me.text = me.saveText;
        let ret = this.$ajax({
          type: 'patch',
          url: "api/keystone/v3/inspur/logs/param",
          data:JSON.stringify({
            params:{
              log_auto_delete_days:me.obj.log_auto_delete_days,
              log_auto_delete:"ON"
            }
          }),
          successMsg:Vue.t('base.saveSuccess'),
          successFun(data) {
            me.loading = false;
          },
          log:{
            description:{
              en:"automatically delete log settings",
              zh_cn:"自动删除日志设置"
            },
            target:Vue.logTarget.parameterSetting
          }
        })
      })
    },
    warnChange(value) {
      if (!value) {
        let me = this;
        me.loading = true;
        me.text = me.saveText;
        let ret = this.$ajax({
          type: 'patch',
          url: "api/keystone/v3/inspur/logs/param",
          data:JSON.stringify({
            params:{
              log_auto_warn:"OFF"
            }
          }),
          successMsg:Vue.t('base.closeSuccess'),
          successFun(data) {
            me.loading = false;
          }
        })
      }
    },
    logWarnClick() {
      let me = this;
      this.$refs.logWarnForm.validate((valid) => {
        if (!valid) {
          return;
        }
        me.loading = true;
        me.text = me.saveText;
        let ret = this.$ajax({
          type: 'patch',
          url: "api/keystone/v3/inspur/logs/param",
          data:JSON.stringify({
            params:{
              log_auto_warn_threshold:me.obj.log_auto_warn_threshold,
              log_auto_warn_way:me.obj.log_auto_warn_way,
              log_auto_warn:"ON"
            }
          }),
          successMsg:Vue.t('base.saveSuccess'),
          successFun(data) {
            me.loading = false;
          },
          log:{
            description:{
              en:"log alarm setting",
              zh_cn:"日志告警设置"
            },
            target:Vue.logTarget.parameterSetting
          }
        })
      })
    },
    deleteLog() {
      this.$confirm(Vue.t('base.deleteLogPrompt'), this.$t('base.deleteConfirm'), {
        confirmButtonText:this.$t('base.confirm'),
        cancelButtonText:this.$t('base.cancel'),
        type:'warning'
      }).then(() => {
        let ret = this.$ajax({
          type: 'DELETE',
          url: "api/keystone/v3/inspur/logs",
          data:JSON.stringify({
            period:this.value
          }),
          successMsg:Vue.t('base.deleteSuccess'),
          log:{
            description:{
              en:"delete logs",
              zh_cn:"日志删除"
            },
            target:Vue.logTarget.parameterSetting
          }
        })
      });
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
        this.obj.log_auto_warn_threshold = this.bak;
      } else {
        if (val.indexOf('.')>-1) {
          this.obj.log_auto_warn_threshold = this.bak;
        } else {
          if (val < 30) {
            this.obj.log_auto_warn_threshold = 30;
          } else if (val > 99) {
            this.obj.log_auto_warn_threshold = 99;
          }
        }
      }
      this.bak = parseInt(this.obj.log_auto_warn_threshold);
    }
  },
  components: {
  }
}
</script>
