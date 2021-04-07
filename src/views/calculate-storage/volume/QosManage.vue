<template>
<div>
<el-dialog :title="$t('storage.quoteOptions')" :visible.sync="visible" :before-close="handleClose" custom-class="qos-manage-custom" v-dialogDrag>
 <div>
  <operation-panel
    class="margin-tb5"
    :select-rows="multipleSelection"
    :operation-menus="operationMenus">
  </operation-panel>

  <el-table
    ref="specTable"
    :data="tableData"
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
          <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
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
      <el-form-item :label="$t('storage.key')" prop="key" class="is-required">
        <el-select v-model="createQosStandard.key" :disabled="keyDis">
          <el-option v-for="item in ncOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.value')" prop="value" class="is-required">
        <el-input class="col-8" v-model="createQosStandard.value" auto-complete="off"></el-input>
        <span v-show="unitShow">{{"byte"}}</span>
        <el-tooltip placement="top" trigger="hover" :content="$t('storage.ioBytesInstruction')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCreateClose">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="isDisabled">{{$t('lang.confirm')}}</el-button>
    </div>
</el-dialog>
</div>
</template>
<script>
export default {
  name: "QoSPopList",
  props: ["qosId"],
  data() {
    return {
      keyDis:false,
      theTitle:this.$t('storage.createQuote'),
      formInline: {
      },
      createQosStandardFlg:false,
      multipleSelection:[],
      ncOption:[{value:'read_iops_sec', label:'read_iops_sec'}, {value:'write_iops_sec', label:'write_iops_sec'}, {value:'total_iops_sec', label:'total_iops_sec'}, {value:'read_bytes_sec', label:'read_bytes_sec'}, {value:'write_bytes_sec', label:'write_bytes_sec'}, {value:'total_bytes_sec', label:'total_bytes_sec'}],
      visible:true,
      isDisabled: false,
      unitShow: "",
      createQosStandard:{
        key:"",
        value:""
      },
      rules: {
        value: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integerNO000'},
          {type: 'max', value: 2147483647},
          {type: 'min', value: 1}
        ],
        key: [
          {type: 'required', trigger: 'blur change'},
          {type: 'only_Letter'},
          {type: 'maxSize', value: 40}
        ]
      },
      operationMenus:[{
        icon: "fa-plus",
        name: this.$t('storage.create'),
        showflg: true,
        readOnly: true,
         handler: function(selectRows) {
          let me = this;
          me.createQosStandardFlg = true;
        }.bind(this)
      }, {
        icon: "fa-minus",
        name: this.$t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
         handler: function(selectRows) {
          this.deleteSpecs(selectRows);
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: this.$t('lang.edit'),
        showflg: true,
        enable(rowData) {
          return true;
        },
         handler: function(selectRows) {
          let me = this;
          me.createQosStandardFlg = true;
          me.createQosStandard.key = selectRows[0].key;
          me.createQosStandard.value = selectRows[0].value;
          me.keyDis = true;
        }.bind(this)
      }],
      tableData:[],
      totalData: [],
      listPara:{
        page:1,
        pageSize:10
      },
      loading:false,
      columnsChecked:["key", "value"],
      columns:[{
        prop:"key",
        label:this.$t('storage.key')
      }, {
        prop:"value",
        label:this.$t('storage.value')
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
    var self = this;
    if (this.createQosStandard.key == 'read_iops_sec' || this.createQosStandard.key == 'write_iops_sec' || this.createQosStandard.key == 'total_iops_sec') {
      this.unitShow = false;
      this.rules.value = [{type: 'required', trigger: 'blur change'}, {type: 'integer'}, {type: 'max', value: 2147483647}, { type: 'min', value: 1 }];
    } else if (this.createQosStandard.key == 'read_bytes_sec' || this.createQosStandard.key == 'write_bytes_sec' || this.createQosStandard.key == 'total_bytes_sec') {
      this.unitShow = true;
      this.rules.value = [{type: 'required', trigger: 'blur change'}, {type: 'integer'}, {type: 'max', value: 2147483647}, { type: 'min', value: 1 }];
    } else {
      this.rules.value = [{type: 'required', trigger: 'blur change'}];
    }
    if (this.keyDis) {
      this.theTitle = this.$t('storage.editQuote');
    } else {
      this.theTitle = this.$t('storage.createQuote');
    }
  },
  methods: {
    async loadData() {
      var Pid = this.$cookie.get('pid');
      var self = this;
      var url = "api/cinderv3/v3/" + Pid + "/qos-specs/" + this.qosId;
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
    },
    async confirmFun() {
          this.$refs.createQosStandardForm.validate(async(valid) => {
          if (valid) {
            this.isDisabled = true;
            //定义条件
            let hasrqos = false;
            let haswqos = false;
            let hastqos = false;
            let hasrbyte = false;
            let haswbyte = false;
            let hastbyte = false;
            //获取页面数据
            var Pid = this.$cookie.get('pid');
            var self = this;
            var speckey = self.createQosStandard.key;
            var specvalue = self.createQosStandard.value;
            //判断个条件的值
            switch (speckey) {
            case 'read_iops_sec':
              hasrqos = true;
              break
            case 'write_iops_sec':
              haswqos = true;
              break
            case 'total_iops_sec':
              hastqos = true;
              break
            case 'read_bytes_sec':
              hasrbyte = true;
             break
            case 'write_bytes_sec':
              haswbyte = true;
              break
            case 'total_bytes_sec':
              hastbyte = true;
             break
            default:
           };
          var hasdata = this.totalData;
          if (hasdata != null && hasdata.length > 0) {
            for (let i = hasdata.length - 1; i >= 0; i--) {
              switch (hasdata[i].key) {
                case 'read_iops_sec':
                  hasrqos = true;
                  break
                case 'write_iops_sec':
                  haswqos = true;
                  break
                case 'total_iops_sec':
                  hastqos = true;
                  break
                case 'read_bytes_sec':
                  hasrbyte = true;
                  break
                case 'write_bytes_sec':
                  haswbyte = true;
                  break
                case 'total_bytes_sec':
                  hastbyte = true;
                  break
                default:
                };
              }
          }
          let canCreateQos = !((hastqos && haswqos) || (hastqos && hasrqos) || (hastqos && haswqos && hasrqos));
          let canCreateByte = !((hastbyte && haswbyte) || (hastbyte && hasrbyte) || (hastbyte && haswbyte && hasrbyte));
          let canCreate = canCreateQos && canCreateByte;
         if (canCreate) {
          var url = "api/cinderv3/v3/" + Pid + "/qos-specs/" + this.qosId;
          let type = "put";
          let msg = this.$t('storage.createQosSpecOptionSuccess');
          var logMsgZh = "创建QoS规格属性:";
          var logMsgEn = "Create QoS specification:"
          if (this.keyDis) {
            msg = this.$t('storage.editeQosSpecOptionSuccess');
            logMsgEn = "Edit QoS specification:"
            logMsgZh = "修改QoS规格属性:";
          }
          var object1 ={};
          object1[speckey] = specvalue;
          let body = {"qos_specs": object1};
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: type,
              successMsg: msg,
              log:{
                description:{
                  en:logMsgEn + JSON.stringify(object1),
                  zh_cn:logMsgZh + JSON.stringify(object1)
                },
                target:Vue.logTarget.storage_volume_QoS
              }
            });
           this.createQosStandardFlg = false;
           this.loadData();
           self.createQosStandard.key = "";
           self.createQosStandard.value = "";
           self.keyDis = false;
           self.$refs.specTable.clearSelection();
           this.isDisabled = false;
          } catch (data) {
            this.isDisabled = false;
            __DEV__ && console.error(data);
          }
         } else {
          this.isDisabled = false;
          self.$message.error(Vue.t('storage.optionConflict'));
         }
           } else {
            this.isDisabled = false;
          return false;
        }
      });
    },
    async deleteSpecs(selectRows) {
      var self = this;
      var Pid = this.$cookie.get('pid');
      var object1 =[];
      for (let i = 0; i < selectRows.length; i++) {
          let row = selectRows[i];
          let key = row['key'];
          object1.push(key);
        }
      let body = {"keys": object1};
      body = JSON.stringify(body);
      this.$confirm(Vue.t('storage.deleteQosSpecCofirm'), this.$t('base.deleteConfirm'), {
          confirmButtonText: this.$t('base.confirm'),
          cancelButtonText: this.$t('base.cancel'),
          type: 'warning'
        }).then(() => {
          this.$ajax({
            type: 'put',
            url: "api/cinderv3/v3/" + Pid + "/qos-specs/" + this.qosId + "/delete_keys",
            data: body,
            //confirmMsg: this.$t('storage.deleteQosSpecCofirm'),
            successMsg: this.$t('storage.deleteQosSpecSucceee'),
            log:{
              description:{
                en:"Delete QoS specification: " + JSON.stringify(object1),
                zh_cn:"删除QoS规格属性:" + JSON.stringify(object1)
              },
              target:Vue.logTarget.storage_volume_QoS
            },
            successFun:function() {
              self.$refs.specTable.clearSelection();
              self.loadData();
            }
          });
          let modal = $(".v-modal:last").clone();
          let par = $(".qos-manage-custom").parent().parent();
          par.find(".v-modal").remove();
          par.append(modal);
          $(".v-modal:last").remove();
        }).catch(() => {
          let modal = $(".v-modal:last").clone();
          let par = $(".qos-manage-custom").parent().parent();
          par.find(".v-modal").remove();
          par.append(modal);
          $(".v-modal:last").remove();
        });
      },
    handleClose() {
      this.$emit("handleEditShow", {});
      this.$emit("getData");
    },
    handleCreateClose() {
          this.createQosStandardFlg = false;
          this.createQosStandard.key = '';
          this.createQosStandard.value = '';
          this.keyDis = false;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
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