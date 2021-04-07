<template>
  <div>
    <!--
    <el-form :inline="true" v-model="formInline" class="form-inline">
      <el-form-item :label="$t('opt.resourceStandard')" v-if="hostTypeFlag">
        <el-select v-model="formInline.query_reType" filterable clearable>
          <el-option v-for="item in total_Data" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" size="small" @click="queryClick()">{{$t('opt.doQuery')}}</el-button>
      </el-form-item>
    </el-form>
    -->

    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" @search="searchHandle" />

    <div class="divider clearfix"></div>
    <operation-panel
      class="margin-tb5"
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
    <el-table
      ref="hostTable"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('opt.dataLoading')"
      highlight-current-row
      style="width: 100%"
      row-key="id"
      :default-sort="{prop:'reStandard', order:'ascending'}"
      @row-click="rowClick"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column
        reserve-selection
        type="selection"
        align="center"
        width="55">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('reStandard') >= 0"
        prop="reStandard"
        :label="$t('opt.resourceStandard')"
        align="left"
        sortable="custom"
        min-width="100">
        <!-- <template slot-scope="scope">
          <span v-html="formatRender(scope.row.reStandard, scope.row)"></span>
        </template> -->
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('bmPrice') >= 0"
        prop="bmPrice"
        align="left"
        :label="$t('opt.price')"
        min-width="100">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
            <span>{{$t('opt.currentSelected')}}{{multipleSelection.length}}{{$t('opt.item')}}</span>
            <el-popover
              placement="right"
              trigger="click">
              <el-checkbox-group class="vertical"
                v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>{{$t('opt.selectColumn')}}</el-tag>
              </div>
            </el-popover>
        </el-col>
        <el-col :span="19">
          <page ref="page" :totalData="allData" :sortObj="sortObj" @getCurrentData="getCurrentData"></page>
        </el-col>
      </el-row>
      <add-instances-price ref="addInstancesPrice" v-if="addFlg" :allData="allData" :formatMaps="formatMaps" @handleShow="handleShow" @getTableData="getTableData" @clearSelOption="clearSelOption"></add-instances-price>
      <edit-instances-price ref="editInstancesPrice" v-if="editFlg" :id="editId" :formatMaps="formatMaps" @handleShow="handleShow" @getTableData="getTableData" @clearSelOption="clearSelOption"></edit-instances-price>
    </div>
  </div>
</template>
<script>
import AddInstancesPrice from './AddInstancesPrice'
import EditInstancesPrice from './EditInstancesPrice'
export default {
  name:"",
  watch:{
    multipleSelection:function (arr) {
      this.editId = arr.length==0?"":arr[0].id;
    }
  },
  data() {
    return {
      searchBar: {
        conditions: {
          query_reType: {
            label: this.$t("opt.resourceStandard"),
            type: "select",
            visible: String(Vue.roleType) === "0",
            options: []
          }
        }
      },
      formInline: {
        query_reType: ""
      },
      selectdata:[],
      total_Data: [],
      hostTypeFlag: Vue.roleType == 0,
      tableData:[],
      allData:[],
      addFlg:false,
      editFlg:false,
      loading:false,
      formatMaps: new Map(),
      usedformatMaps: [],
      editId:"",
      sortObj:{
        sortOrder:"ascending",
        sortField:"reStandard"
      },
      multipleSelection: [],
      columns: [{
        prop: "reStandard",
        label: this.$t('opt.resourceStandard')
      }, {
        prop: "bmPrice",
        label: this.$t('opt.price')
      }],
      columnsChecked:["reStandard", "bmPrice"],
      operationMenus:[{
        icon: "fa-plus",
        name: this.$t('opt.add'),
        showflg: true,
        readOnly: true,
        handler: function() {
          let me = this;
          me.addFlg = true;
          me.$nextTick(() => {
            me.$refs.addInstancesPrice.show();
          });
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: this.$t('opt.edit'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          let me = this;
          me.editFlg = true;
          me.$nextTick(() => {
            me.$refs.editInstancesPrice.show(selectedRows[0]);
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('opt.delete'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: async function(selectRows) {
          var self = this;
          var row = selectRows[0];
          var id = row["id"];
          var name = row["reStandard"];
          self.$ajax({
            type: 'DELETE',
            url: "api/cloudkitty/v1/rating/module_config/hashmap/mappings?mapping_id=" + id,
            confirmMsg: Vue.t('opt.confirmDelBillingStrategy'),
            log:{
              description:{
                en:"delete billing strategy:"+name,
                zh_cn:self.$t('opt.deleteBillingStrategy')+name
              },
              target:Vue.logTarget.billing_strategy
            }
          }).then(() => {
            self.$message.success(self.$t('opt.deleteSuccess'));
            self.$refs.hostTable.clearSelection();
            self.getTableData();
          }, () => {
            self.getTableData();
          })
        }.bind(this)
      }]
    }
  },
  mounted() {
    var self = this;
    Promise.all([self.getTypeList()]).then(function(result) {
      self.getTableData();
    });
    // this.getTypeList();
  },
  methods: {
    searchHandle(v = {}) {
      this.formInline.query_reType = v.query_reType ? v.query_reType : '';

      this.queryClick();
    },
    async getTableData() {
      let self = this;
      self.loading = true;
      var queryResType = self.formInline.query_reType;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/cloudkitty/v1/rating/module_config/hashmap/prices?service_name=compute&field_name=flavor_id&value=" + queryResType
        });
        self.loading = false;
        self.allData = [];
        if (ret.inspur_mappings.length > 0) {
          for (let i=0; i<ret.inspur_mappings.length; i++) {
            var obj = {
              reStandard: "",
              bmPrice: "",
              reStandardId: ""
            };
            obj.id = ret.inspur_mappings[i].mapping_id;
            obj.reStandardId = ret.inspur_mappings[i].value;
            obj.reStandard = self.formatMaps.get(obj.reStandardId);
            obj.bmPrice = ret.inspur_mappings[i].cost;
            self.allData.push(obj);
          }
        }
        self.loading = false;
        self.usedformatMaps = self.allData;
      } catch (res) {
        self.loading = false;
        console.log(self.$t('opt.getHostPriceSettingFailed'));
      }
    },
    rowClick(row) {
      this.$refs.hostTable.toggleRowSelection(row);
    },
    async getTypeList() {
      var self = this;
      self.total_Data = [];
      try {
        let result = await self.$ajax({
          type: 'get',
          data: {"is_public": true},
          url: 'api/nova/v2.1/flavors/detail',
          showErrMsg: true
        });
        let result1 = await self.$ajax({
          type: 'get',
          data: {"is_public": false},
          url: 'api/nova/v2.1/flavors/detail',
          showErrMsg: true
        });
        self.loading = false;
        var dataResult = result['flavors'];
        var dataResult1 = [];
        for (let i = 0; i < dataResult.length; i++) {
          if (dataResult[i]['os-flavor-access:is_public'] == true) {
            dataResult1.push(dataResult[i]);
          }
        }
        var middleData = dataResult1.concat(result1['flavors']);
        self.total_Data = middleData;
        self.formatMaps = new Map();
        self.searchBar.conditions.query_reType.options = [];
        for (var q = 0; q < self.total_Data.length; q++) {
          var entity = {"value":self.total_Data[q].id, "key":self.total_Data[q].name};
          self.formatMaps.set(self.total_Data[q].id, self.total_Data[q].name);

          self.searchBar.conditions.query_reType.options.push(
            {
              label: self.total_Data[q].name,
              value: self.total_Data[q].id
            }
          );
        }
      } catch (res) {
        self.loading = false;
        self.$message.error(self.$t('opt.getResourceStandardListFailed'));
      }
    },
    formatRender(value, rowData) {
      var self = this;
      var reStandardId = rowData['reStandard'];
      var result = "";
      if (reStandardId != "") {
        result = self.formatMaps.get(reStandardId);
      } else {
        result = "-";
      }
      return result;
    },
    sortChange(obj) {
      if (!obj.prop) { return; }
      this.sortObj = {
        sortOrder:obj.order,
        sortField:obj.prop
      };
    },
    onRefresh() {
      this.getTableData();
      this.$refs.hostTable.clearSelection();
    },
    getCurrentData(data) {
      this.tableData = data;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    queryClick() {
      var self = this;
      self.getTableData();
      this.$refs.hostTable.clearSelection();
    },
    handleShow() {
      this.addFlg = false;
      this.editFlg = false;
    },
    clearSelOption() {
      var self = this;
      self.$refs.hostTable.clearSelection();
    }
  },
  components: {
    AddInstancesPrice,
    EditInstancesPrice
  }
}
</script>
