<template>
  <div>
    <!--
    <el-form :inline="true" v-model="formInline" class="form-inline">
      <el-form-item :label="$t('opt.type')">
        <el-input size="small" @blur="blurFun('name')" v-model="typeNameQ"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' size="small" @click="loadData()">{{$t('opt.doQuery')}}</el-button>
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
      ref="faultTable"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('opt.dataLoading')"
      highlight-current-row
      border
      stripe
      style="width: 100%;"
      slot="empty"
      max-height='500'
      row-key="errorTypeId"
      :default-sort="{prop:'name', order:'ascending'}"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column
        reserve-selection
        type="selection"
        align="center"
        width="55">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        align="left"
        :label="$t('opt.type')"
        sortable="custom"
        min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('fault_desc') >= 0"
        prop="fault_desc"
        align="left"
        :label="$t('opt.description')"
        min-width="100">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('opt.currentSelected')}} {{multipleSelection.length}}{{$t('opt.item')}}</span>
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
          <page :totalData="totalData"  @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
        </el-col>
      </el-row>
    </div>
    <type-operate ref='typeOperate' v-if="operFlag" :errorTypeId="errorTypeId" @handleShow="handleShow" @loadData="loadData" @clearSelOption="clearSelOption"></type-operate>
  </div>
</template>
<script>
import TypeOperate from './TypeOperate';
export default {
  name: 'Type',
  components: { TypeOperate },
  data() {
    return {
      searchBar: {
        conditions: {
          type: {
            label: this.$t("opt.type"),
            type: "input",
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          }
        }
      },
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      typeNameQ: '',
      formInline: '',
      listPara:{
        page:1,
        pageSize:10
      },
      errorTypeId:'',
      columns:[{
        prop:"name",
        label:this.$t('opt.type')
      }, {
        prop:"fault_desc",
        label:this.$t('opt.description')
      }],
      currentPage: 1,
      pageSize:10,
      pageSizes:[10, 50, 200],
      total:1,
      columnsChecked: ["name", "fault_desc"],
      totalData:[],
      tableData: [],
      multipleSelection: [],
      operFlag: false,
      loading:false,
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('opt.establish'),
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.errorTypeId = '';
          this.operFlag = true;
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: Vue.t('opt.edit'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.errorTypeId = selectRows[0].id;
          this.operFlag = true;
          this.$nextTick(() => {
            this.$refs.typeOperate.showData(selectRows[0].name, selectRows[0].fault_desc);
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('opt.delete'),
        multi: true,
        showflg: true,
        enable(rowData) {
          return !rowData['enabled'];
        },
        handler: function(selectRows) {
          var self = this;
          self.$prompt(self.$t('opt.enterYesContinuedOperation'), self.$t('opt.deleteConfirm'), {
            confirmButtonText: self.$t('opt.confirm'),
            cancelButtonText: self.$t('opt.cancel'),
            inputPattern:/^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage:self.$t('opt.onlyAcceptYesOrNo')
          }).then(async({ value }) => {
            if ("yes" == value.toLowerCase()) {
              self.$sequence({
                type: "DELETE",
                url: "api/leo/v1/fault/{id}",
                params: selectRows,
                success: function(result) {
                  self.$message.success(Vue.t('opt.deleteSuccess'));
                  self.$refs.faultTable.clearSelection();
                },
                log:{
                  description:{
                    en:"Delete faultType",
                    zh_cn:self.$t('opt.deleteFaultType')
                  },
                  key: "name",
                  target:Vue.logTarget.Fault_manage
                },
                errFun:function() {
                  self.$refs.faultTable.clearSelection();
                  setTimeout( function() {
                    self.loadData({
                      page: 1
                    });
                    self.loading = false;
                  }, 5000);
                }
              }).then((data) => {
                self.loading = true;
                self.$refs.faultTable.clearSelection();
                self.currentPage = 1;
                setTimeout( function() {
                  self.loadData({
                    page: 1
                  });
                  self.loading = false;
                }, 5000);
              }).catch((err) => {});
            }
          }).catch(() => {
          });
        }.bind(this)
      }]
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    searchHandle(v = {}) {
      this.typeNameQ = v.type ? v.type : '';

      this.loadData();
    },
    async loadData() {
      this.loading = true;
      this.$refs.faultTable.clearSelection();
      var url = "api/leo/v1/fault";
      if ("" != this.typeNameQ) {
        url = url + "?name=" + encodeURIComponent(this.typeNameQ);
      }
      try {
        let res = await this.$ajax({
          type: 'get',
          url: url
        });
        let ret = res.data;
        var dataList = [];
        for (let i = 0; i < ret.length; i++) {
           let obj = {};
           obj = ret[i];
           obj.errorTypeId = ret[i].id;
           dataList.push(obj);
        }
        if (this.typeNameQ == "") {
          this.totalData = ret;
        } else {
          this.totalData = [];
          for (let i = 0; i < dataList.length; i++) {
            if (dataList[i].name.indexOf(this.typeNameQ) >= 0) {
              this.totalData.push(dataList[i]);
            }
          }
        }
        this.loading = false;
      } catch (data) {
        this.loading = false;
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.loadData();
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleSizeChange(val) {
      this.listPara.pageSize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      this.listPara.page = val;
      this.loadData();
    },
    handleShow() {
      this.operFlag = false;
    },
    //排序
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
    },
    blurFun(key) {
      if (this.typeNameQ.length>40) {
        this.typeNameQ = '';
        this.$notify({
          message:this.$t('opt.overLength'),
          type:'warning'
        });
      }
    },
    clearSelOption() {
      var self = this;
      self.$refs.faultTable.clearSelection();
    }
  }
}
</script>
<style scoped>
</style>