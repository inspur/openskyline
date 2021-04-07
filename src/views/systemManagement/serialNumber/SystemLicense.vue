<template>
  <div>
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('base.SERIAL_NUMBER_IMPORT_SERIAL_NUMBER') }}</span>
      </div>
      <el-form :model="addNumberForm" label-width="80px" label-position="right" :element-loading-text="$t('base.loadingData')">
        <el-form-item :label="$t('base.machineCode')" style="margin-bottom: 0px;">
          <span style="font-size: 200%; color: #5cb85c;">{{machine_code}}</span>
        </el-form-item>
        <el-form-item :label="$t('base.activationCode')" style="margin-bottom: 5px;">
          <el-input type="textarea" style="width:600px;" :disabled="saving" :autosize="size" v-model="addNumberForm.value"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 0px;">
          <el-button type="primary" size="small" icon="fa-plus" @click="confirmToSubmit" :disabled="addNumberForm.value.length === 0" :loading="saving">{{$t('base.addTo')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin-top: 5px;" v-loading="loading">
      <div slot="header" class="clearfix">
        <span>{{ $t('base.SERIAL_NUMBER_SERIAL_NUMBER_INFO') }}</span>
      </div>
      <el-form :model="addNumberForm" label-width="150px" label-position="right">
        <el-form-item :label="$t('base.customerInformation')" style="margin-bottom: 0px;">
          {{ detail.user_info }}
        </el-form-item>
        <el-form-item :label="$t('base.useTime')" style="margin-bottom: 0px;">
          {{ detail.start_date+detail.end_date }}
          <span v-if="discard_time !== null">({{ $t('base.SERIAL_NUMBER_DISCARDED_AT', discard_time) }})</span>
        </el-form-item>
        <el-form-item :label="$t('base.maxNumberOfManNodes')" style="margin-bottom: 0px;">
          {{ detail.node_num }}
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
          prop="type"
          :label="$t('base.type')"
          min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.type=="trying_license"?$t('base.trialEdition'):$t('base.officialEdition')}}</span>
          </template>
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
          prop="end_time"
          :label="$t('base.expirationDate')"
          min-width="100">
          <template slot-scope="scope">
            <span>{{formatDate(scope.row.end_time, true)}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="valid"
          align="left"
          :label="$t('base.isValid')"
          min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.valid?$t('base.effective'):$t('base.invalid')}}</span>
            <span v-if="scope.row.type === 'formal_license' && scope.row.discard_status === 'discarding'">({{ $t('base.SERIAL_NUMBER_DISCARDING') }})</span>
            <span v-if="scope.row.type === 'formal_license' && scope.row.discard_status === 'discarded'">({{ $t('base.SERIAL_NUMBER_DISCARDED') }})</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="valid"
          align="left"
          :label="$t('base.SERIAL_NUMBER_ACTION')"
          min-width="100">
          <template slot-scope="scope">
            <el-button v-if="scope.row.discard_status !== 'discarding' && scope.row.type === 'formal_license' && scope.row.valid === true" type="text" @click="discard(scope.row.id)">{{ $t('base.SERIAL_NUMBER_ACTION_DISCARD') }}</el-button>
            <el-button v-if="scope.row.discard_status === 'discarding' && scope.row.type === 'formal_license' && scope.row.valid === true" type="text" @click="showDiscardNumber(scope.row.id)">{{ $t('base.SERIAL_NUMBER_ACTION_DISCARD_NUMBER') }}</el-button>
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
export default {
  name:"",
  data() {
    return {
      machine_code: "",
      tableData: [],
      loading: false,
      saving: false,
      emptyText:  Vue.t('base.noData'),
      size: {
        minRows: 10
      },
      addNumberForm: {
        value: ""
      },
      detail: {
        user_info: "",
        start_date: "",
        end_date: "",
        node_num: ""
      }
    }
  },
  mounted() {
    this.getMachineCode();
    this.getTableData();
  },
  methods: {
    async getMachineCode() {
      let res = await this.$ajax({
        type: 'get',
        url: 'api/keystone/v3/inspur/machinecode'
      })
      this.machine_code = res.machine_code;
    },
    async getActiveCodeInfo(activeCode) {
      let res = await this.$ajax({
        type: 'get',
        url: `api/keystone/v3/inspur/serialnumber/${activeCode}`
      })
      return res;
    },
    async getTableData() {
      this.loading = true;
      let res = await this.$ajax({
        type: 'get',
        url: 'api/keystone/v3/inspur/serialnumber'
      });
      this.tableData = res.sn_list;
      this.detail = {
        user_info:res.sn_detail.user_info,
        start_date:res.sn_detail.start_date?this.formatDate(res.sn_detail.start_date):Vue.t('base.permanentValidity'),
        end_date:res.sn_detail.end_date?"~"+this.formatDate(res.sn_detail.end_date-1000):"",
        node_num:res.sn_detail.node_num
      };
      let trialEdition = true;
      if (res.sn_list.findIndex(item => item.type === 'formal_license') !== -1) {
        trialEdition = false;
      }
      this.$emit('trial-edition-changed', trialEdition);
      this.$emit('node-amount-changed', res.sn_detail.node_num);
      this.loading = false;
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
    async confirmToSubmit() {
      const $this = this;
      try {
        $this.addNumberForm.value = $this.addNumberForm.value.trim();
        if ($this.addNumberForm.value === '') {
          $this.$message({
            message: $this.$t('base.activationCodeWarn'),
            type: "warning"
          });
        } else {
          let activeCodeInfo = await $this.getActiveCodeInfo($this.addNumberForm.value);
          if ($this.detail.user_info !== '' && $this.detail.user_info !== activeCodeInfo.customer_name) {
            $this.$confirm($this.$t('base.SERIAL_NUMBER_PLEASE_CONFIRM_TIPS',
              [
                $this.detail.user_info,
                activeCodeInfo.customer_name,
                $this.detail.node_num,
                activeCodeInfo.node_num
              ]),
              $this.$t('base.SERIAL_NUMBER_PLEASE_CONFIRM'), {
              type: 'warning'
            }).then(async() => {
              await $this.submit();
            });
          } else {
            await $this.submit();
          }
        }
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async submit() {
      const $this = this;
      if ($this.addNumberForm.value=="") {
        $this.$message({
          message: $this.$t('base.activationCodeWarn'),
          type: "warning"
        });
        return;
      }
      $this.saving = true;
      await $this.$ajax({
        type: 'post',
        url: "node-api/keystone/serialNumber",
        contentType: "application/json",
        data:JSON.stringify({
          serial_number: $this.addNumberForm.value,
          user_name: Vue.userName,
          user_id:Vue.userId
        }),
        successMsg: $this.$t('base.addSuccess'),
        errFun() {
          $this.saving = false;
        }
      });
      $this.saving = false;
      $this.$alert(Vue.t('base.reLoginWarn'), Vue.t('base.prompt'), {
        confirmButtonText:Vue.t('base.confirm'),
        type:"warning",
        callback: action => {
          document.location.href = "login.html";
        }
      });
    },
    async discard(id) {
      const $this = this;
      $this.$prompt(Vue.t('base.SERIAL_NUMBER_DISCARD_PROMPT'), Vue.t('lang.confirm'), {
        confirmButtonText: Vue.t('lang.confirm'),
        cancelButtonText: Vue.t('lang.cancel'),
        inputPattern:/^YES$|^NO$/i,
        inputValue: "NO",
        customClass: "promptConfirmDel",
        inputErrorMessage:Vue.t('lang.onlyAcceptYesOrNo')
      }).then(async ({ value }) => {
        if (value.toLowerCase() === 'yes') {
          try {
            const res = await $this.$ajax({
              type: 'delete',
              url: 'api/keystone/v3/inspur/serialnumber',
              data: JSON.stringify({
                id: id
              }),
              log: {
                description: {
                  en: `'Discard' License`,
                  zh_cn: `废弃序列号`
                },
                target:Vue.logTarget.serialNumber
              }
            });
            await $this.getTableData();
            $this.showDiscardNumber(id, $this.$t('base.SERIAL_NUMBER_DISCARD_SUCCESS'));
          } catch (e) {
            __DEV__ && console.error(e);
          }
        }
      });
    },
    async showDiscardNumber(id, prepand='') {
      const $this = this;
      const sn = $this.tableData.find(item => item.id === id);
      if (!sn) {
        $this.$message.error(`The serial number ${id} is not existed.`);
      } else {
        const h = $this.$createElement;
        $this.$msgbox({
          title: $this.$t('base.SERIAL_NUMBER_ACTION_DISCARD_NUMBER'),
          message: h('p', { style: 'word-break: break-all' }, prepand + $this.$t('base.SERIAL_NUMBER_DISCARD_NUMBER_IS', sn.discard_number)),
          type: 'info'
        });
      }
    }
  },
  computed: {
    discard_time() {
      const $this = this;
      const discardingSN = $this.tableData.find(item => item.discard_status === 'discarding');
      if (!discardingSN) {
        return null;
      } else {
        return $this.formatDate(discardingSN.end_time - 1000);
      }
    }
  }
}
</script>