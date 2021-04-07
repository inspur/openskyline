<template>
  <div>
  <el-dialog :title="$t('storage.QosConnect')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="qosRelationForm" :model="qosRelation" label-width="130px" :rules="rules">
      <el-form-item :label="$t('storage.QosSpecConnect')" prop="qosName">
        <el-select v-model="qosRelation.qosObject"  @change="nameChange">
          <el-option v-for="item in qosObjectOptions" :key="item.value" :label="item.label.length>20?item.label.substring(0, 20) + '...':item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-table
      ref="specTable"
      :data="tableData"
      highlight-current-row
      border
      stripe
      style="width: 100%;"
      max-height='500'
      row-key="key">
      <el-table-column v-if="columnsChecked.indexOf('key') >= 0"
        prop="key"
        :label="$t('storage.key')"
        align="left"
        sortable
        min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('value') >= 0"
        prop="value"
        align="left"
        :label="$t('storage.value')"
        min-width="100">
      </el-table-column>
    </el-table>   
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
            <el-popover
              placement="right"
              trigger="click">
              <el-checkbox-group class="vertical"
                v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
              </div>
            </el-popover>
        </el-col>
              <el-col :span="19">
                <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
              </el-col>
      </el-row>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
 </div>
</template>
<script>
export default {
  name:"qosRelation",
  props: ["volTypeId", "qosId"],
  data() {
    return {
      qosObjectOptions:[],
      qosRelation:{
        qosObject: []
      },
      visible:true,
      saving: false,
      tableData:[],
      totalData: [],
      listPara:{
        page:1,
        pageSize:1
      },
      loading:false,
      multipleSelection:[],
      columnsChecked:["key", "value"],
      columns:[{
        prop:"key",
        label:this.$t('storage.key')
      }, {
        prop:"value",
        label:this.$t('storage.value')
      }],
      rules: {
        qosObject: [
          { type: 'required', trigger: 'blur change' }
        ]
      },
      currentPage:1,
      pageSize:10,
      pageSizes:[10, 50, 200],
      total:1
    }
  },
  mounted() {
        var self = this;
        Promise.all([self.getQosData()]).then(function(result) {
        self.loadData();
     });
  },
  methods:{
    async loadData() {
      let selectedPro = this.qosRelation.qosObject;
      let thisQosId = this.qosId;
      if (selectedPro.length != 0) {
        thisQosId = selectedPro;
      }
    if (!(thisQosId ==null || thisQosId == '')) {
      var Pid = this.$cookie.get('pid');
      var self = this;
      var url = "api/cinderv3/v3/" + Pid + "/qos-specs/" + thisQosId;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: url
          });
          self.totalData = [];
          self.loading = false;
          let resultObject = result['qos_specs']['specs'];
          for ( var item in resultObject ) {
            self.totalData.push({
            key: item,
            value: resultObject[item]
          })
          }
        } catch (res) {
          self.loading = false;
        }
      }
    },
    async getQosData() {
      var Pid = this.$cookie.get('pid');
      var self = this;
      var url = "api/cinderv3/v3/" + Pid + "/qos-specs";
        try {
          let result = await self.$ajax({
            type: 'get',
            url: url
          });
          self.qosObjectOptions = [{value:'', label:this.$t('storage.select')}]
          var middleData = result['qos_specs'];
          if (!this.qosId) {
            for (let i = middleData.length - 1; i >= 0; i--) {
                self.qosObjectOptions.push({
                 value: middleData[i]['id'],
                 label:middleData[i]['name']
                 });
             }
           } else {
            for (let i = middleData.length - 1; i >= 0; i--) {
              if (middleData[i].id != this.qosId) {
                self.qosObjectOptions.push({
                 value: middleData[i]['id'],
                 label:middleData[i]['name']
                 });
               }
             }
           }
        } catch (res) {
          self.loading = false;
        }
    },
    async confirmFun() {
      try {
        var self = this;
        this.$refs.qosRelationForm.validate(async(valid) => {
          if (valid) {
            this.saving = true;
            var qosSelect = this.qosRelation.qosObject;
            if (!qosSelect) {
              this.$emit("handleRelaShow", {});
              this.saving = false;
              return;
            }
            if (this.qosId) {
              Promise.all([self.disrelaQos()]).then(function(result) {
                if (result[0]) {
                  self.relaQosy();
                }
              });
            } else {
              self.relaQosn();
            }
          }
        });
      } catch (data) {
        this.saving = false;
      }
    },
    getQosLogName(tempQosId) {
      var logName = '';
      for (var i = 0; i < this.qosObjectOptions.length; i++) {
        if (tempQosId == this.qosObjectOptions[i].value) {
          logName = this.qosObjectOptions[i].label + "(" + tempQosId + ")";
          break;
        }
      }
      return logName;
    },
    async disrelaQos() {
      try {
         var Pid = this.$cookie.get('pid');
         var self = this;
      if (this.qosId) {
        let result = await this.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + Pid + "/qos-specs/" + this.qosId+ "/disassociate?vol_type_id=" + this.volTypeId,
          confirmMsg: this.$t('storage.QosSpecOptionConnectConfirm')
        });
       }
       return true;
      } catch (data) {
        this.saving = false;
      }
    },
    async relaQosy() {
      try {
         var Pid = this.$cookie.get('pid');
         var self = this;
            let selectedPro = this.qosRelation.qosObject;
            let thisQosId = '';
            if (selectedPro.length != 0) {
              thisQosId = selectedPro;
             }
            if (!(thisQosId == null || thisQosId == '')) {
              let qosLogName = this.getQosLogName(thisQosId);
              let result = await this.$ajax({
                  type: 'get',
                  url: "api/cinderv3/v3/" + Pid + "/qos-specs/" + thisQosId + "/associate?vol_type_id=" + this.volTypeId,
                  log:{
                    description:{
                      en:"Relation QoS:" + qosLogName,
                      zh_cn:"关联QoS:" + qosLogName
                    },
                    target:Vue.logTarget.storage_volume_type
                  }
                });
             this.$emit("clearSelOption", {});
             this.$emit("handleRelaShow", {});
             this.$emit("getData");
             this.qosRelation.qosObject = [];
             self.$message(Vue.t('storage.QosSpecConnectSuccee'));
           }
        } catch (data) {
          this.saving = false;
        }
    },
    async relaQosn() {
      try {
         var Pid = this.$cookie.get('pid');
         var self = this;
            let selectedPro = this.qosRelation.qosObject;
            let thisQosId = '';
            if (selectedPro.length != 0) {
              thisQosId = selectedPro;
             }
            if (!(thisQosId == null || thisQosId == '')) {
              let qosLogName = this.getQosLogName(thisQosId);
              let result = await this.$ajax({
                  type: 'get',
                  url: "api/cinderv3/v3/" + Pid + "/qos-specs/" + thisQosId + "/associate?vol_type_id=" + this.volTypeId,
                  confirmMsg: this.$t('storage.QosSpecConnectConfirm'),
                  log:{
                    description:{
                      en:"Relation QoS:" + qosLogName,
                      zh_cn:"关联QoS:" + qosLogName
                    },
                    target:Vue.logTarget.storage_volume_type
                  }
                });
             this.$emit("clearSelOption", {});
             this.$emit("handleRelaShow", {});
             this.$emit("getData");
             this.qosRelation.qosObject = [];
             this.saving = false;
             self.$message(Vue.t('storage.QosSpecConnectSuccee'));
           }
        } catch (data) {
          this.saving = false;
          __DEV__ && console.error(data);
        }
    },
    onRefresh() {
      this.loadData();
    },
    handleClose() {
      this.$emit("handleRelaShow", {});
      this.$emit("getData");
      this.qosRelation.qosObject = [];
    },
    handleCancel() {
      this.$emit("handleRelaShow", {});
      this.qosRelation.qosObject = [];
    },
    nameChange() {
      this.loadData();
    },
    getCurrentData(param) {
      this.tableData = param;
    }
  }
}
</script>