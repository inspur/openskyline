<template>
  <div>
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('base.SERIAL_NUMBER_IMPORT_SERIAL_NUMBER') }}</span>
      </div>
      <el-form :model="addNumberForm" label-width="80px" label-position="right" :element-loading-text="$t('base.loadingData')">
        <el-form-item :label="$t('base.machineCode')" style="margin-bottom: 0px;">
          <span style="font-size: 200%; color: #5cb85c;">{{ machine_code }}</span>
        </el-form-item>
        <el-form-item :label="$t('base.activationCode')" style="margin-bottom: 5px;">
          <el-input type="textarea" style="width:600px;" :disabled="saving" :autosize="size" v-model="addNumberForm.value"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 0px;">
          <el-button type="primary" size="small" icon="fa-plus" @click="addFun" :loading="saving">{{$t('base.addTo')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin-top: 5px;" v-loading="loading">
      <div slot="header" class="clearfix">
        <span>{{ $t('base.SERIAL_NUMBER_SERIAL_NUMBER_INFO') }}</span>
        <el-tooltip placement="right" trigger="hover">
          <div slot="content" v-html="$t('base.SERIAL_NUMBER_MAINTENANCE_CALC_EXPLAIN')" />
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </div>
      <el-form :model="addNumberForm" label-width="180px" label-position="right">
        <el-form-item :label="$t('base.SERIAL_NUMBER_REST_MAINTENANCE')" style="margin-bottom: 0px;">
          {{ info.maintenance }}
        </el-form-item>
        <el-form-item :label="$t('base.SERIAL_NUMBER_MAINTENANCE_EXPIRED_TIME')" style="margin-bottom: 0px;">
          <span v-if="info.maintenance >= 0">
            {{ info.maintenanceExpiredDate }}
          </span>
          <span v-else>
            {{ $t('base.SERIAL_NUMBER_EXPIRED') }}
          </span>
        </el-form-item>
      </el-form>
      <el-table
        ref="deTable"
        :data="tableData"
        style="width: 100%; margin-top: 5px;"
        row-key="id">
        <el-table-column
          prop="number"
          :label="$t('base.serialNumber')"
          min-width="100">
        </el-table-column>
        <el-table-column
          prop="create_time"
          :label="$t('base.registrationTime')"
          min-width="100">
          <template slot-scope="scope">
            <span>{{formatDate(scope.row.create_time, true)}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="valid"
          align="left"
          :label="$t('base.SERIAL_NUMBER_AVIALABLE_MAINTENANCE_AMOUNT')"
          min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.capacity }}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="getTableData">
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script>
import moment from 'moment';
export default {
  name: 'MaintenanceLicense',
  data() {
    return {
      machine_code: '',
      info: {
        maintenance: 0,
        maintenanceExpiredDate: ''
      },
      tableData: [],
      saving: false,
      loading: false,
      size:{
        minRows:10
      },
      addNumberForm:{
        value: ''
      }
    }
  },
  mounted() {
    this.getMachineCode();
    this.getTableData();
  },
  methods: {
    async getMachineCode() {
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/machinecode"
      })
      this.machine_code = ret.machine_code;
    },
    async getTableData() {
      const $this = this;
      $this.loading = true;
      const res = await $this.$ajax({
        type: 'get',
        url: `api/keystone/v3/inspur/maintenancenumber`
      })
      $this.tableData = res.sn_list;
      $this.info.maintenance = res.info.maintenance;
      $this.info.maintenanceExpiredDate = res.info.expire_date;
      $this.loading = false;
    },
    formatDate(time, showHour) {
      if (!time) {
        return '-';
      }
      let d = new Date(time);
      let year = d.getFullYear();
      let month = (d.getMonth()+1)+"";
      let da = d.getDate()+"";
      let hour = d.getHours()+"";
      let miu = d.getMinutes()+"";
      let sec = d.getSeconds()+"";
      if (showHour) {
        return year+"-"+(month.length==1?"0"+month:month)+"-"+(da.length==1?"0"+da:da)+" "+(hour.length==1?"0"+hour:hour)+":"+(miu.length==1?"0"+miu:miu)+":"+(sec.length==1?"0"+sec:sec);
      } else {
        return year+"-"+(month.length==1?"0"+month:month)+"-"+(da.length==1?"0"+da:da);
      }
    },
    async addFun() {
      let me = this;
      if (this.addNumberForm.value=="") {
        this.$message({
          message: Vue.t('base.activationCodeWarn'),
          type: "warning"
        });
        return;
      }
      me.saving = true;
      try {
        await this.$ajax({
          type: 'post',
          url: "api/keystone/v3/inspur/maintenancenumber", //v3/inspur/serialnumber
          data: JSON.stringify({
            active_code: this.addNumberForm.value
          }),
          successMsg:Vue.t('base.addSuccess'),
          log: {
            description: {
              en: `Import Maintenance License`,
              zh_cn: `导入维保序列号`
            },
            target:Vue.logTarget.serialNumber
          }
        });
        me.saving = false;
        me.getTableData();
      } catch (e) {
        __DEV__ && console.error(e);
        me.saving = false;
      }
    }
  }
}
</script>