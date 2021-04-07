<template>
  <div>
    <el-dialog :title="'QoS'+$t('calcStorLang.config')" :visible.sync="visible" :before-close="handleClose">
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
          <el-table-column v-if="columnsChecked.indexOf('type') >= 0"
            prop="type"
            :label="$t('calcStorLang.type')"
            align="left"
            min-width="100">
            <template slot-scope="scope">
              <span v-html="typeRender(scope.row.key, scope.row)"></span>
            </template>
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
            <template slot-scope="scope">
              <span v-html="valueRender(scope.row.value, scope.row)"></span>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="onRefresh">
              </el-button>
              <span>{{$t('lang.currentSelected') + multipleSelection.length + " " + $tc('lang.item', multipleSelection.length)}}</span>
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
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{$t('lang.close')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="theTitle" :visible.sync="createQosStandardFlg" v-if="createQosStandardFlg" :before-close="handleCreateClose">
      <el-form ref="createQosStandardForm" :model="createQosStandard" label-width="100px" :rules="rules">
        <el-form-item :label="$t('calcStorLang.type')" prop="type">
          <el-select v-model="createQosStandard.type" class="col-12" filterable :disabled="keyDis" @change="changeFlagType">
            <el-option v-for="item in typeOption" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.key')" prop="key" class="is-required">
          <el-select v-model="createQosStandard.key" class="col-12" filterable :disabled="keyDis" @change="changeFlagKey">
            <el-option v-for="item in ncOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.value')" prop="value" class="is-required">
          <el-input class="col-12" v-model="createQosStandard.value" auto-complete="off"></el-input>
          <span>{{unit}}</span>
          <el-tooltip placement="top" trigger="hover" :content="tip">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCreateClose">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "QoSPopList",
  props: ["flavorId", "flavorName"],
  data() {
    return {
      unit:"",
      keyDis:false,
      theTitle:Vue.t('calcStorLang.create')+'QoS',
      formInline: {
      },
      createQosStandardFlg:false,
      multipleSelection:[],
      typeOption:[
        {value:'1', label:"CPU", disabled: true},
        {value:'2', label:Vue.t('calcStorLang.memory'), disabled: true},
        {value:'3', label:Vue.t('calcStorLang.rootDisk'), disabled: false}
      ],
      ncOption:[{value:'quota:cpu_shares', label:'quota:cpu_shares'}, {value:'quota:cpu_period', label:'quota:cpu_period'}, {value:'quota:cpu_quota', label:'quota:cpu_quota'}],
      visible:true,
      saving: false,
      createQosStandard:{
        type:"3",
        key:"quota:cpu_shares",
        value:""
      },
      rules: {
        key: [
          {type: 'required', trigger: 'blur change'}
        ],
        value: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'max', value: 9999},
          {type: 'min', value: 0}
        ]
      },
      operationMenus:[{
        icon: "fa-plus",
        name: Vue.t('calcStorLang.create'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          let me = this;
          me.createQosStandardFlg = true;
          me.createQosStandard.type = "3";
          me.ncOption = [{value:'quota:cpu_shares', label:'quota:cpu_shares'}, {value:'quota:cpu_period', label:'quota:cpu_period'}, {value:'quota:cpu_quota', label:'quota:cpu_quota'}];
          me.createQosStandard.key = "quota:cpu_shares";
          me.createQosStandard.value = "";
          me.changeFlagType();
          me.changeFlagKey();
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('lang.delete'),
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
        name: Vue.t('lang.edit'),
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          let me = this;
          me.createQosStandardFlg = true;
          me.createQosStandard.key = selectRows[0].key;
          if (me.createQosStandard.key == 'quota:disk_read_bytes_sec' || me.createQosStandard.key == 'quota:disk_write_bytes_sec' || me.createQosStandard.key == 'quota:disk_total_bytes_sec') {
            me.createQosStandard.value = selectRows[0].value/1024;
          } else {
            me.createQosStandard.value = selectRows[0].value;
          }
          me.keyDis = true;
          if (selectRows[0].key == "quota:cpu_shares" || selectRows[0].key == "quota:cpu_period" || selectRows[0].key == "quota:cpu_quota") {
            me.createQosStandard.type = "1";
          } else if (selectRows[0].key == "quota:soft_limit") {
            me.createQosStandard.type = "2";
          } else {
            me.createQosStandard.type = "3";
          }
          me.changeFlagKey();
        }.bind(this)
      }],
      tip:"",
      tableData:[],
      totalData: [],
      totalMap:new Map(),
      listPara:{
        page:1,
        pageSize:10
      },
      loading:false,
      columnsChecked:["type", "key", "value"],
      columns:[{
        prop:"type",
        label:Vue.t('calcStorLang.type')
      }, {
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
    this.loadData();
  },
  updated() {
    let self = this;
    if (this.createQosStandard.key == 'quota:cpu_shares' ) {
      this.rules.value = [
        { type: 'required', trigger: 'blur change' },
        { type: 'integerNO000' },
        { type: 'min', value: 1 },
        { type: 'max', value: 1000000 }
      ];
    } else if (this.createQosStandard.key == 'quota:cpu_period') {
      this.rules.value = [
        { type: 'required', trigger: 'blur change' },
        { type: 'integerNO000' },
        { type: 'min', value: 1000 },
        { type: 'max', value: 1000000 }
      ];
    } else if (this.createQosStandard.key == 'quota:cpu_quota') {
      this.rules.value = [
        { type: 'required', trigger: 'blur change' },
        { type: 'integerNO000' },
        { type: 'min', value: 1000 },
        { type: 'max', value: 9007199254740991 }
      ];
    } else if (this.createQosStandard.key == 'quota:soft_limit') {
      this.rules.value = [
        { type: 'required', trigger: 'blur change' },
        { type: 'integerNO000' },
        { type: 'min', value: 1 },
        { type: 'max', value: 8388608 }
      ];
    } else if (this.createQosStandard.key == 'quota:disk_read_iops_sec' || this.createQosStandard.key == 'quota:disk_write_iops_sec' || this.createQosStandard.key == 'quota:disk_total_iops_sec') {
      this.rules.value = [
        { type: 'required', trigger: 'blur change' },
        { type: 'unsignedInteger' },
        { type: 'integer' },
        { type: 'max', value: 9999 },
        { type: 'min', value: 0 }
      ];
    } else if (this.createQosStandard.key == 'quota:disk_read_bytes_sec' || this.createQosStandard.key == 'quota:disk_write_bytes_sec' || this.createQosStandard.key == 'quota:disk_total_bytes_sec') {
      this.rules.value = [
        { type: 'required', trigger: 'blur change' },
        { type: 'unsignedInteger' },
        { type: 'integer' },
        { type: 'max', value: 99999999 },
        { type: 'min', value: 0 }
      ];
    } else {
      this.rules.value = [
        { type: 'integerNO000' },
        { type: 'unsignedInteger' },
        { type: 'max', value: 99999999 },
        { type: 'min', value: 0 }
      ];
    }
    if (this.keyDis) {
      this.theTitle = Vue.t('lang.edit') + "QoS";
    } else {
      this.theTitle = Vue.t('calcStorLang.create') + "QoS";
    }
  },
  methods: {
    async loadData() {
      var self = this;
      var url = "api/nova/v2.1/flavors/" + this.flavorId + "/os-extra_specs";
        try {
          let result = await self.$ajax({
            type: 'get',
            url: url
          });
          self.totalData = [];
          self.totalMap = new Map();
          self.loading = false;
          let resultObject = result['extra_specs'];
          for ( var item in resultObject ) {
            if (item && item.indexOf("quota") < 0) {
              continue;
            }
            this.totalMap.set(item, resultObject[item]);
            self.totalData.push({
            key: item,
            value: resultObject[item]
          })
          }
        } catch (res) {
          self.loading = false;
        }
    },
    async confirmFun() {
          this.$refs.createQosStandardForm.validate(async(valid) => {
          if (valid) {
              this.saving = true;
              //获取页面数据
              var self = this;
              var speckey = self.createQosStandard.key;
              var specvalue = self.createQosStandard.value;
              var extraspecs = {};
              if (speckey == 'quota:disk_read_bytes_sec' || speckey == 'quota:disk_write_bytes_sec' || speckey == 'quota:disk_total_bytes_sec') {
                specvalue = specvalue * 1024;
              }
              extraspecs[speckey] = specvalue;
              let url = "api/nova/v2.1/flavors/" + this.flavorId + "/os-extra_specs";
              let type = "POST";
              let msg = Vue.t('calcStorLang.configSuccess');
              let body = {"extra_specs" : extraspecs};
              body = JSON.stringify(body);
              self.loading = true;
              let operZh = self.keyDis ? "编辑" : "创建";
              let operEn = self.keyDis ? 'edit' : 'create';
              try {
                let ret = await this.$ajax({
                  url: url,
                  data: body,
                  type: type,
                  log: {
                    description: {
                      en: "Flavor:" + this.flavorName + " " + operEn + " QoS "+ speckey,
                      zh_cn: "资源规格:" + this.flavorName + " " + operZh + "QoS "+ speckey
                    },
                    target: Vue.logTarget.computeSpec
                  },
                  successMsg: msg
                });
               this.createQosStandardFlg = false;
               this.loadData();
               self.createQosStandard.key = "";
               self.createQosStandard.value = "";
               self.keyDis = false;
               self.$refs.specTable.clearSelection();
               this.saving = false;
              } catch (data) {
                this.saving = false;
                __DEV__ && console.error(data);
              }
           } else {
            this.saving = false;
          return false;
        }
      });
    },
    loadDeleteConfirmTip() {

    },
    async deleteSpecs(selectRows) {
      var self = this;
      var aa = this.$confirm(Vue.t('calcStorLang.resSpecDelMetedataTip'), Vue.t('base.prompt'), {
        confirmButtonText: Vue.t('base.confirm'),
        cancelButtonText: Vue.t('base.cancel'),
        type: 'warning'
      }).then(() => {
        self.loading = true;
        for (let i = 0; i <selectRows.length; i++) {
          var specObj = selectRows[i];
           var url = "api/nova/v2.1/flavors/" + this.flavorId + "/os-extra_specs/" + specObj.key;
           self.$ajax({
             type: "delete",
             url: url,
             errorKey: "badRequest",
             async: false,
             successFun: function() {
               self.$message(Vue.t('calcStorLang.deleteSendSuccess'));
               self.$refs.specTable.clearSelection();
               self.currentPage = 1;
               self.loadData();
               self.loading = false;
            },
            log: {
              description: {
                en: "Flavor:" + this.flavorName + " delete Qos " + specObj['key'],
                zh_cn:  "资源规格:" + this.flavorName + " 删除QoS " + specObj['key']
              },
              key: "key",
              target: Vue.logTarget.computeSpec
            }
            });
          }
          aa.close();
          }).catch(() => {
            $(".layout-content-workspace").attr("style", "width:100.05%");
          });
    },
   changeFlagKey() {
      let self = this;
      if (self.createQosStandard.key == 'quota:cpu_shares' ) {
         self.tip = Vue.t("calcStorLang.addResSpecTip1");
      } else if (self.createQosStandard.key == 'quota:cpu_period') {
        self.tip = Vue.t("calcStorLang.addResSpecTip2");
      } else if (self.createQosStandard.key == 'quota:cpu_quota') {
        self.tip = Vue.t("calcStorLang.addResSpecTip3");
      } else if (self.createQosStandard.key == 'quota:soft_limit') {
        self.tip = Vue.t("calcStorLang.addResSpecTip4");
      } else {
        self.tip = Vue.t("calcStorLang.addResSpecTip5");
      }
      if (self.createQosStandard.key == 'quota:disk_read_bytes_sec' || self.createQosStandard.key == 'quota:disk_write_bytes_sec' || self.createQosStandard.key == 'quota:disk_total_bytes_sec') {
      self.unit = "KBps";
      } else {
        self.unit = "";
      }
    },
    changeFlagType() {
      let self = this;
      let type = self.createQosStandard.type;
      if (type == "1") {
        self.ncOption = [{value:'quota:cpu_shares', label:'quota:cpu_shares'}, {value:'quota:cpu_period', label:'quota:cpu_period'}, {value:'quota:cpu_quota', label:'quota:cpu_quota'}];
        self.createQosStandard.key = "quota:cpu_shares";
      } else if (type == "2") {
        self.ncOption = [{value:'quota:soft_limit', label:'quota:soft_limit'}];
        self.createQosStandard.key = "quota:soft_limit";
      } else if (type == "3") {
        self.ncOption = [];
        var keys = [{value:'quota:disk_read_iops_sec', label:'quota:disk_read_iops_sec'},
                    {value:'quota:disk_write_iops_sec', label:'quota:disk_write_iops_sec'},
                    {value:'quota:disk_total_iops_sec', label:'quota:disk_total_iops_sec'},
                    {value:'quota:disk_read_bytes_sec', label:'quota:disk_read_bytes_sec'},
                    {value:'quota:disk_write_bytes_sec', label:'quota:disk_write_bytes_sec'},
                    {value:'quota:disk_total_bytes_sec', label:'quota:disk_total_bytes_sec'}];
        for (let i in keys) {
          var f1 = (this.totalMap.get("quota:disk_read_iops_sec") || this.totalMap.get("quota:disk_write_iops_sec")) && keys[i].value == 'quota:disk_total_iops_sec';
          var f2 = this.totalMap.get("quota:disk_total_iops_sec") && (keys[i].value == 'quota:disk_write_iops_sec' || keys[i].value == 'quota:disk_read_iops_sec');
          var f3 = (this.totalMap.get("quota:disk_read_bytes_sec") || this.totalMap.get("quota:disk_write_bytes_sec")) && keys[i].value == 'quota:disk_total_bytes_sec';
          var f4 = this.totalMap.get("quota:disk_total_bytes_sec") && (keys[i].value == 'quota:disk_write_bytes_sec' || keys[i].value == 'quota:disk_read_bytes_sec');
          if (f1 || f2 || f3 || f4) {
            continue;
          } else {
            self.ncOption.push(keys[i]);
          }
        }
        if (self.ncOption.length > 0) {
          self.createQosStandard.key = self.ncOption[0].value;
        }
      }
    },
    handleClose() {
     this.$emit("handleQosShow", {});
      this.$emit("getTestData");
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
      if (value == "quota:cpu_shares" || value == "quota:cpu_period" || value == "quota:cpu_quota") {
        return "CPU";
      } else if (value == "quota:soft_limit") {
        return Vue.t('calcStorLang.memory');
      } else {
        return Vue.t('calcStorLang.rootDisk');
      }
    },
    valueRender(value, rowData) {
      if (rowData["key"] == 'quota:disk_read_bytes_sec' || rowData["key"] == 'quota:disk_write_bytes_sec' || rowData["key"] == 'quota:disk_total_bytes_sec') {
        value = (value / 1024) + " KBps";
      }
      return value;
    },
    onRefresh() {
      this.loadData();
    },
    getCurrentData(param) {
      this.tableData = param;
    }
  }
}
</script>