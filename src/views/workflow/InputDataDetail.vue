<template>
  <el-dialog
    :title="$t('task.inputData')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
      <el-form ref="inputDataForm" :model="inputDataForm" label-width="0px" v-loading="loading" class="me-required-form">
<!--         <el-form-item label="" prop="inputData">
          <el-input type="textarea" :autosize="{minRows:2}" v-model="inputDataForm.inputData" readonly></el-input>
        </el-form-item> -->
        <div class="table_panel">
          <table class="table table-content table-hover idatatable" border="1">
            <tbody>
<!--               <tr class="odd">
                <th class="idatath" style="width:20%">资源类型</th>
                <td class="idatatd" style="width:80%">{{inputDataForm.inputData}}</td>
              </tr> -->
              <template v-for="(item, index) in inputDataForm.inputArray">
                <tr :class="index%2==0?'odd':'even'">
                  <th class="idatath">{{item.name}}</th>
                  <td class="idatatd">{{tzInputFormatter(item.nameValue)}}</td>
                </tr>
              </template>
              <!-- <tr class="odd">
                <th class="idatath">资源名称</th>
                <td class="idatatd">{{resourceDataForm.resourceData}}</td>
              </tr> -->
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
    name: "InputDataDetail",
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
        inputDataForm: {
          inputData:"",
          inputArray:[]
        },
        dialogVisible: true,
        loading:false
      }
    },
    mouted() {
       // this.initForm = Object.assign({}, this.inputDataForm);
    },
    methods: {
      show() {
        this.dialogVisible = true;
        this.inputDataForm.inputData = this.tzInputFormatter(this.selectedRowData.input);
        var inputJson = this.inputDataForm.inputData;
        // console.log(inputJson);
        if (inputJson != '-') {
          var temp = JSON.parse(inputJson);
          // console.log(temp);
          var jsonArr = [];
          for (var a in temp) {
            if (a == "snap_name") {
              jsonArr.push({"name":"snap_identifier", "nameValue":temp[a]});
            } else {
              jsonArr.push({"name":a, "nameValue":temp[a]});
            }
          }
          // console.log(jsonArr);
          if (jsonArr.length == 0) {
            jsonArr.push({"name":"-", "nameValue":"-"});
          }
          this.inputDataForm.inputArray = jsonArr;
        } else {
            this.inputDataForm.inputArray = [{"name":"-", "nameValue":"-"}];
          }
      },
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      },
      cancel() {
        var self = this;
        self.dialogVisible = false;
      },
      tzInputFormatter(input) {
        let inputFr = input;
        var inputTo = '';
        if (inputFr == '{}' || inputFr == '' || inputFr == null) {
          inputTo = '-';
        } else {
          inputTo = inputFr;
        }
        return inputTo;
      }
    }
  }
</script>
