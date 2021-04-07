<template>
<div>
  <operation-panel
    class="margin-tb5"
    :select-rows="multipleSelection"
    :operation-menus="operationMenus">
  </operation-panel>
  <el-table
    ref="deTable"
    :data="tableData"
    v-loading="loading"
    :element-loading-text="$t('base.loadingData')"
    highlight-current-row
    :max-height="300"
    style="width: 100%"
    row-key="id"
    :default-sort="{prop:'duration'}"
    @row-click="rowClick"
    @sort-change="sortChange"
    @selection-change="handleSelectionChange">
    <el-table-column
      reserve-selection
      type="selection"
      align="center"
      width="55">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('leaseTime') >= 0"
      prop="duration"
      :label="$t('base.leaseTime')"
      align="left"
      sortable="custom"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('leaseDW') >= 0"
      prop="unit"
      align="left"
      :label="$t('base.leaseUnit')"
      min-width="100">
      <template slot-scope="scope">
        <span>{{emumeration[scope.row.unit]}}</span>
      </template>
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh">
        </el-button>
          <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
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
        <page ref="page" :totalData="allData" :sortObj="sortObj" @getCurrentData="getCurrentData"></page>
      </el-col>
    </el-row>

    <create-lease ref="createLease" v-if="createLeaseFlg" @refreshData="getTableData"></create-lease>

    <edit-lease ref="editLease" v-if="editLeaseFlg" :id="editId" @refreshData="getTableData"></edit-lease>
  </div>
</div>
</template>
<script>
import CreateLease from './CreateLease'
import EditLease from './EditLease'
export default {
  name:"",
  watch:{
    multipleSelection:function (arr) {
      this.editId = arr.length==0?"":arr[0].id;
    }
  },
  data() {
    return {
      tableData:[],
      allData:[],
      createLeaseFlg:false,
      editLeaseFlg:false,
      loading:false,
      editId:"",
      sortObj:{
        sortOrder:"ascending",
        sortField:"duration",
        sortType:"int"
      },
      emumeration:{
        'D':Vue.t('base.day'),
        'W':Vue.t('base.week'),
        'M':Vue.t('base.month'),
        'Q':Vue.t('base.quarter'),
        'Y':Vue.t('base.year'),
        'F':Vue.t('base.forever')
      },
      emptyText: Vue.t('base.noData'),
      multipleSelection: [],
      columns: [{
        prop: "leaseTime",
        label: this.$t('base.leaseTime')
      }, {
        prop: "leaseDW",
        label: this.$t('base.leaseUnit')
      }],
      columnsChecked:["leaseTime", "leaseDW"],
      operationMenus:[{
        icon: "fa-plus-circle",
        name: this.$t('base.add'),
        showflg: true,
        readOnly: true,
        handler: function() {
          let me = this;
          me.createLeaseFlg = true;
          me.$nextTick(() => {
            me.$refs.createLease.show();
          });
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: this.$t('base.edit'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          let me = this;
          me.editLeaseFlg = true;
          me.$nextTick(() => {
            me.$refs.editLease.show(selectedRows[0]);
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('base.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: async function(selectedRows) {
          let me = this;
          let ret = await this.$sequence({
            type: 'DELETE',
            url: "api/keystone/v3/inspur/tenancy/duration/param/{id}",
            confirmMsg:Vue.t('base.deleteDataWarn'),
            params: selectedRows,
            successMsg:Vue.t('deleteSuccess'),
            log:{
              description:{
                en:"long term parameters of delete lease term",
                zh_cn:"删除租期时长参数"
              },
              target:Vue.logTarget.parameterSetting
            }
          }).then(() => {
            me.$message.success(Vue.t('deleteSuccess'));
            me.getTableData();
          }, () => {
            me.getTableData();
          })
        }.bind(this)
      }]
    }
  },
  mounted() {
    this.getTableData();
  },
  methods: {
    async getTableData(flg=true) {
      let me = this;
      this.loading = true;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/tenancy/duration/params?",
        errFun() {
          me.loading = false;
        }
      })
      this.allData = ret.durationparams;
      if (flg) {
        this.$nextTick(() => {
          this.$refs.deTable.clearSelection();
        });
      }
      this.loading = false;
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    sortChange(obj) {
      if (!obj.prop) { return; }
      this.sortObj = {
        sortOrder:obj.order,
        sortField:obj.prop,
        sortType:"int"
      };
    },
    onRefresh() {
      this.getTableData();
    },
    getCurrentData(data) {
      this.tableData = data;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    }
  },
  components: {
    CreateLease,
    EditLease
  }
}
</script>
