<template>
  <div>
    <el-dialog
      :title="$t('report.clearReportHistory')"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false">
        <el-form ref="historyClearForm" :model="historyClearForm" :rules=rules label-width="150px" class="me-required-form">
          <el-form-item :label="$t('report.currentReportSize')">
            <span>{{historyClearForm.totalSize}}</span>
          </el-form-item>

          <el-form-item :label="$t('report.clearAll')">
            <el-switch v-model="historyClearForm.isClerAll" :on-text="$t('lang.yes')" :off-text="$t('lang.no')"></el-switch>
          </el-form-item>
          <el-form-item label="" v-if="historyClearForm.isClerAll == false" prop="clearDate">
              <span>{{$t('report.clearDate1')}}</span>
              <el-date-picker type="date" v-model="historyClearForm.clearDate" :picker-options="datePickerOptions"
              :placeholder="$t('base.pleaseSelect')"></el-date-picker>
              <span>{{$t('report.clearDate2')}}</span>
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
          <el-button @click="doClear" type="primary" :loading="saving">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    name: "ReportHistoryClear",
    data() {
      return {
        dialogVisible:false,
        saving: false,
        historyClearForm:{
          totalSize:"0",
          isClerAll:true,
          clearDate:""
        },
        confirmDisabled: false,
        datePickerOptions:{
          disabledDate(time) {
            return time.getTime() > Date.now(); // time.getTime() < Date.now() -8.64e7;
          }
        },
        rules: {
          clearDate: [
            {type: 'required'}
          ]
        }
      }
    },
    mounted() {
      this.initDialog();
    },
    methods: {
      async initDialog() {
        let self = this;
        self.dialogVisible = true;
        self.getFileSize();
      },
      async getFileSize() {
        let self = this;
        try {
          await self.$ajax({
            type: "GET",
            url: "api/leo/v1/report/get_file_size",
            successFun:function (response) {
              if (response.m_size) {
                self.historyClearForm.totalSize = response.m_size + "MB";
                self.confirmDisabled = false;
              } else {
                self.historyClearForm.totalSize = "0MB";
                self.confirmDisabled = true;
                self.$emit('refreshData');
              }
            }
          })
        } catch (err) {
          console.log(err);
        }
      },
      async doClear() {
        let self = this;
        this.$refs.historyClearForm.validate(async (valid) => {
          if (valid) {
            let dataBody = {};
            if (!self.historyClearForm.isClerAll) {
              dataBody.start_time = self.historyClearForm.clearDate;
            }
            try {
              self.saving = true;
              await self.$ajax({
                type: "POST",
                url: "api/leo/v1/report/delete_task_by_time",
                data:JSON.stringify(dataBody),
                log:{
                  description:{
                    en:"Delete report history files",
                    zh_cn:"清除报表历史文件"
                  },
                  target:Vue.logTarget.Report
                },
                successFun:function (response) {
                  if (response.body.data == '0') {
                    self.$notify({
                      message: Vue.t('report.noHistoryDelete'),
                      type:'error'
                    });
                    self.getFileSize();
                    self.$emit('refreshData');
                  } else {
                    self.$emit('hideDialog');
                    self.$emit('refreshData');
                  }
                }
              })
              self.saving = false;
            } catch (err) {
              self.saving = false;
              console.log(err);
            }
          }
        });
      },
      cancel() {
        this.$emit('hideDialog');
      },
      handleClose() {
        this.$emit('hideDialog');
      }
    }
  }
</script>
