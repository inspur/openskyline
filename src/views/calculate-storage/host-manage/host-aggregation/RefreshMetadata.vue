<template>
<div>
<el-dialog :title="$t('calcStorLang.updateMedata')" :visible.sync="visible" :before-close="handleClose">
 <div>
  <operation-panel
    class="margin-tb5"
    :select-rows="multipleSelection"
    :operation-menus="operationMenus">
  </operation-panel>

  <el-table
    ref="specTable"
    :data="tableData"
    v-loading="loading"
    :element-loading-text="$t('calcStorLang.dataLoading')"
    highlight-current-row
    border
    stripe
    style="width: 100%;"
    slot="empty"
    max-height='500'
    row-key="key"
    @selection-change="handleSelectionChange">
    <el-table-column reserve-selection type="selection" align="center" width="55">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('key') >= 0"
      prop="key"
      :label="$t('calcStorLang.key')"
      align="left"
      sortable
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('value') >= 0"
      prop="value"
      align="left"
      :label="$t('calcStorLang.value')"
      min-width="100">
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh">
        </el-button>
          <span>{{$t('lang.currentSelected') + multipleSelection.length + " " + $tc("lang.item", multipleSelection.length)}}</span>
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
  <span>{{$t('calcStorLang.resourceMetedataAddTip')}}</span>
 </div>
 <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('lang.close')}}</el-button>
    </div>
 </el-dialog>
 <el-dialog :title="theTitle" :visible.sync="createQosStandardFlg" v-if="createQosStandardFlg" :before-close="handleCreateClose">
    <el-form ref="createQosStandardForm" :model="createQosStandard" label-width="100px" :rules="rules">
      <el-form-item :label="$t('calcStorLang.key')" prop="key" class="is-required">
        <el-select v-model="createQosStandard.key" class="col-12" filterable :disabled="keyDis" @change="changeFlagKey">
          <el-option v-for="item in availableNcOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-tooltip placement="top" trigger="hover" :content="tip1">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.value')" prop="value" class="is-required" v-if="showKeyF">
        <el-input class="col-12" v-model="createQosStandard.value" auto-complete="off"></el-input>
        <el-tooltip placement="top" trigger="hover" :content="tip2">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.value')" prop="value1" class="is-required" v-if="!showKeyF">
       <el-select v-model="createQosStandard.value1" filterable class="col-12">
          <el-option v-for="item in value1Option" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-tooltip placement="top" trigger="hover" :content="tip3">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCreateClose">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
 </div>
</template>
<script>
export default {
  name: "QoSPopList",
  props: ["id", "hostName", "metadata"],
  data() {
    return {
      keyDis:false,
      theTitle:Vue.t("calcStorLang.create") + 'QoS',
      formInline: {
      },
      tip1:Vue.t("calcStorLang.hostAggregationMetadataTip1"),
      tip2:Vue.t("calcStorLang.hostAggregationMetadataTip2"),
      tip3:Vue.t("calcStorLang.hostAggregationMetadataTip3"),
      showKeyF:false,
      createQosStandardFlg:false,
      metadaOperate: 'create',
      multipleSelection:[],
      ncOption:[{value:'hpgs', label:'hpgs'}, {value:'availability_zone', label:'availability_zone'}, {value:'pinned', label:'pinned'}],
      visible:true,
      isDisabled: false,
      createQosStandard:{
        key:"hpgs",
        value:"",
        value1:"true"
      },
      rules: {
        key: [
          { type: 'required', trigger: 'blur change' }
        ],
          value: [
          { type: 'required', trigger: 'blur change' },
          { type: 'onlyLetter_MinusNumberChinese' },
          { type: 'maxSize', value: 255 }
        ],
         value1: [
          { type: 'required', trigger: 'blur change' },
          { type: 'onlyLetter_MinusNumberChinese' }
        ]
      },
      operationMenus:[{
        icon: "fa-plus",
        name: Vue.t("calcStorLang.create"),
        showflg: true,
        readOnly: true,
         handler: function(selectRows) {
          let me = this;
          me.metadaOperate = "create";
          me.createQosStandardFlg = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t("lang.delete"),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
         handler: function(selectRows) {
          this.deleteSpecs(selectRows);
        }.bind(this)
      }, {
        icon: "fa-pencil",
        name: Vue.t("lang.edit"),
        showflg: true,
        enable(rowData) {
          return true;
        },
         handler: function(selectRows) {
          let me = this;
          me.metadaOperate = "edit";
          me.createQosStandardFlg = true;
          me.createQosStandard.key = selectRows[0].key;
          me.keyDis = true;
          if (me.createQosStandard.key == 'hpgs' || me.createQosStandard.key == 'pinned' ) {
            me.showKeyF = false;
            me.createQosStandard.value1 = selectRows[0].value;
          } else {
            me.showKeyF = true;
            me.createQosStandard.value = selectRows[0].value;
          }
          me.changeFlagKey();
        }.bind(this)
      }],
      tip:"",
      tableData:[],
      totalData: [],
      value1Option: [{value:'true', label:'true'}, {value:'false', label:'false'}],
      listPara:{
        page:1,
        pageSize:10
      },
      loading:false,
      columnsChecked:["key", "value"],
      columns:[{
        prop:"key",
        label:Vue.t('calcStorLang.key')
      }, {
        prop:"value",
        label:Vue.t('calcStorLang.value')
      }],
      currentPage:1,
      pageSize:10,
      pageSizes:[10, 50, 200],
      total:1
    }
  },
  mounted() {
    let self = this;
    Promise.all([self.initData()]).then(function(result) {
      self.totalData = result[0];
    });
  },
  updated() {
    let self = this;
    if (this.keyDis) {
      this.theTitle = Vue.t("lang.edit") + Vue.t("calcStorLang.metadata");
    } else {
      this.theTitle = Vue.t("calcStorLang.create") + Vue.t("calcStorLang.metadata");
    }
  },
  methods: {
    loadData() {
      var self = this;
      self.totalData = self.initData();
    },
    initData() {
      var self = this;
      var data = self.metadata;
      self.totalData = [];
      var arr = [];
      for ( var item in data ) {
        var obj = {key: item, value : data[item]};
        arr.push(obj);
      }
      return arr;
    },
    async confirmFun() {
          this.$refs.createQosStandardForm.validate(async(valid) => {
          if (valid) {
              this.isDisabled = true;
              //获取页面数据
              var self = this;
              var speckey = self.createQosStandard.key;
              var specvalue = self.showKeyF?self.createQosStandard.value:self.createQosStandard.value1;
              var metadata = {};
              metadata[speckey] = specvalue;
              let url = "api/nova/v2.1/os-aggregates/" + this.id + "/action";
              let type = "POST";
              let msg = Vue.t("calcStorLang.configSuccess");
              let body = {"set_metadata" : {"metadata" : metadata}};
              body = JSON.stringify(body);
              var operateMsg = "创建元数据";
              if (self.metadaOperate == "edit") {
                  operateMsg = "编辑元数据";
              }
              self.loading = true;
              try {
                let ret = await this.$ajax({
                  url: url,
                  data: body,
                  type: type,
                  successMsg: msg,
                  log: {
                    description: {
                      en: "Config " + speckey,
                      zh_cn: "主机聚合:" + this.hostName + operateMsg + ":" + speckey
                    },
                    target: Vue.logTarget.hostaggregation
                  }
                });
               this.createQosStandardFlg = false;
               // this.loadData();
               self.createQosStandard.key = "";
               self.createQosStandard.value = "";
               self.createQosStandard.value1 = "";
               self.keyDis = false;
               self.$refs.specTable.clearSelection();
               // this.$emit("handleMetaShow", {});
               // this.$emit("getData");
               self.reloadMetaList();
               self.$emit("reaz", {});
               this.isDisabled = false;
              } catch (data) {
                self.loading = false;
                this.isDisabled = false;
                __DEV__ && console.error(data);
              }
           } else {
            this.isDisabled = false;
          return false;
        }
      });
    },
    async reloadMetaList() {
      var self = this;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-aggregates'
        });
        self.loading = false;
        var lengthOfhost = result['aggregates'].length;
        var arr = lengthOfhost > 0 ? result['aggregates'] : [];
        var mData = "";
        for (let i=0; i < arr.length; i++) {
          var obj = arr[i];
          if (obj['id'] == self.id) {
            mData = arr[i].metadata;
            break;
          }
        }
        var arrRestlt = [];
        for ( var item in mData ) {
          var metaObj = {key: item, value : mData[item]};
          arrRestlt.push(metaObj);
        }
        self.totalData = arrRestlt;
      } catch (res) {
        self.loading = false;
      }
    },
    async deleteSpecs(selectRows) {
      var self = this;
      self.$sequence({
            type: 'post',
            url: "api/nova/v2.1/os-aggregates/" + this.id + "/action",
            params: selectRows,
            datas:{
              "set_metadata":{
                "metadata":{
                  "{key}":null
                }
              }
            },
            paramKeys:["key"],
            errorKey: "badRequest",
            confirmMsg:Vue.t("calcStorLang.deleteConfirmComm") + "？",
            log: {
              description: {
                en: "Delete config of flavors.",
                zh_cn: "主机聚合:" + this.hostName + "删除元数据 "
              },
              key: "key",
              target: Vue.logTarget.hostaggregation
            }
          }).then((data) => {
            self.loading = true;
            self.$message(Vue.t("calcStorLang.deleteSendSuccess"));
            self.$refs.specTable.clearSelection();
            self.currentPage = 1;
            self.reloadMetaList();
            /*self.createQosStandardFlg = false;
            self.$emit("handleMetaShow", {});
            self.$emit("getData");*/
            /*setTimeout(function() {
              self.loading = false;
            }, 1000);*/
          }).catch((err) => {
             setTimeout(function() {
                self.$refs.specTable.clearSelection();
                self.reloadMetaList();
                self.loading = false;
              }, 1000);
          });
    },
   changeFlagKey() {
      let self = this;
      if (self.createQosStandard.key == 'hpgs' ) {
        self.showKeyF = false;
      } else if (self.createQosStandard.key == 'pinned') {
        self.showKeyF = false;
      } else {
        self.showKeyF = true;
      }
    },
    handleClose() {
     this.$emit("handleMetaShow", {});
      this.$emit("getData");
    },
    handleCreateClose() {
          this.createQosStandardFlg = false;
          this.createQosStandard.key = '';
          this.createQosStandard.value = '';
          this.keyDis = false;
          this.tip = "";
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    typeRender(value, rowData) {
      if (value == "quota:cpu_share" || value == "quota:cpu_period" || value == "quota:cpu_quota") {
        return "CPU";
      } else if (value == "quota:soft_limit") {
        return Vue.t("calcStorLang.memory");
      } else {
        return Vue.t("calcStorLang.rootDisk");
      }
    },
    onRefresh() {
      this.loadData();
    },
    getCurrentData(param) {
      this.tableData = param;
    }
  },
  computed: {
    availableNcOption() {
      return this.ncOption.filter(item => {
        return !this.tableData.map(t => t.key).includes(item.value);
      });
    }
  }
}
</script>