<template>
  <el-dialog
    :title="$t('task.outputData')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
      <el-form ref="outputDataForm" :model="outputDataForm" label-width="0px" v-loading="loading" class="me-required-form">
<!--         <el-form-item label="" prop="outputData">
          <el-input type="textarea" :autosize="{minRows:2}" v-model="outputDataForm.outputData" readonly></el-input>
        </el-form-item> -->
        <div class="table_panel">
          <table class="table table-content table-hover idatatable" border="1">
            <tbody>
              <template v-for="(item, index) in outputDataForm.outputArray">
                <tr :class="index%2==0?'odd':'even'">
                  <th class="idatath">{{item.name}}</th>
                  <td class="idatatd">{{tzOutputFormatter(item.nameValue)}}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel" type="primary">{{$t('lang.confirm')}}</el-button>
      </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "OutputDataDetail",
    props:{
      selectedRowData:{
        type:Object,
        default:() => {
          return {};
        }
      }
    },
    data() {
      return {
        outputDataForm: {
          outputData:"",
          outputArray:[]
        },
        dialogVisible: true,
        loading:false
      }
    },
    mouted() {
       // this.initForm = Object.assign({}, this.outputDataForm);
    },
    methods: {
      show() {
        this.dialogVisible = true;
        this.initWorkFlowExeDetails();
      },
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      },
      cancel() {
        var self = this;
        self.dialogVisible = false;
      },
      async initWorkFlowExeDetails() {
        let self = this;
        let serviceUrl = "";
        serviceUrl = "api/mistral/v2/executions/" + this.selectedRowData.id;
        try {
          self.loading = true;
          let workFlowExeDetail = await this.$ajax({
            type: 'get',
            url: serviceUrl
          });
          self.outputDataForm.outputData = this.tzOutputFormatter(workFlowExeDetail.output);
          var outputJson = this.outputDataForm.outputData;
          console.log(outputJson);
          if (outputJson != '-') {
            var temp = JSON.parse(outputJson);
            console.log(temp);
            var jsonArr = [];
            for (var a in temp) {
              jsonArr.push({"name":a, "nameValue":temp[a]});
            }
            // console.log(jsonArr);
            if (jsonArr.length == 0) {
              jsonArr.push({"name":"-", "nameValue":"-"});
            }
            this.outputDataForm.outputArray = jsonArr;
          } else {
            this.outputDataForm.outputArray = [{"name":"-", "nameValue":"-"}];
          }
          self.loading = false;
        } catch (data) {
          self.loading = false;
          console.log('获取任务日志详情失败');
        }
      },
      tzOutputFormatter(output) {
        let outputFr = output;
        var outputTo = '';
        if (outputFr == '{}' || outputFr == '' || outputFr == null) {
          outputTo = '-';
        } else {
          outputTo = outputFr;
        }
        return outputTo;
      }
    }
  }
</script>
