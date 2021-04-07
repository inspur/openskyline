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
    style="width: 100%"
    row-key="id"
    @row-click="rowClick"
    @current-change="handleSelectionChange">
    <el-table-column v-if="columnsChecked.indexOf('type') >= 0"
      prop="type"
      :label="$t('base.resouceType')"
      align="left"
      min-width="100">
      <template slot-scope="scope">
        <span>{{scope.row.type==1?$t('base.cloudHost'):(scope.row.type==2?$t('base.cloudPhysiceMachine'):$t('base.cloudDisk'))}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('warn') >= 0"
      prop="remaining_days"
      align="left"
      :label="$t('base.expirationReminder')"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('warntype') >= 0"
      prop="remind_manner"
      align="left"
      :label="$t('base.reminderMode')"
      min-width="100">
      <template slot-scope="scope">
        <span>{{scope.row.remind_manner==1?$t('base.mail'):$t('base.shortMessage')}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('dotype') >= 0"
      prop="handle_manner"
      align="left"
      :label="$t('base.treatmentMode')"
      min-width="100">
      <template slot-scope="scope">
        <span>{{scope.row.handle_manner==1?$t('base.automaticallyDisable'):$t('base.automaticallyRecovery')}}</span>
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
        <el-pagination
          class="right"
          layout="total"
          :total="total">
        </el-pagination>
      </el-col>
    </el-row>
    <edit-source-lease ref="sourcelease" v-if="flg" :id="editId" @refreshData="getTableData"></edit-source-lease>
  </div>
</div>
</template>
<script>
import EditSourceLease from './EditSourceLease'
export default {
  name:"leaseSetting",
  watch:{
    multipleSelection:function (arr) {
      if (arr[0]) {
        this.editId = arr.length==0?"":arr[0].id;
      }
    }
  },
  data() {
    return {
      tableData:[],
      flg:false,
      loading:false,
      multipleSelection: [],
      editId:"",
      total: 0,
      columns: [{
        prop: "type",
        label: this.$t('base.resouceType')
      }, {
        prop: "warn",
        label: this.$t('base.expirationReminder')
      }, {
        prop: "warntype",
        label: this.$t('base.reminderMode')
      }, {
        prop: "dotype",
        label: this.$t('base.treatmentMode')
      }],
      columnsChecked:["type", "warn", "warntype", "dotype"],
      operationMenus:[{
        icon: "fa-edit",
        name: this.$t('base.edit'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          let me = this;
          me.flg = true;
          me.$nextTick(() => {
            me.$refs.sourcelease.show(selectedRows[0]);
          });
        }.bind(this)
      }]
    }
  },
  mounted() {
    this.getTableData();
  },
  methods: {
    async getTableData() {
      let me = this;
      this.loading = true;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/tenancy/resource/params",
        errFun() {
          me.loading = false;
        }
      })
      this.tableData = ret.resourceparams;
      this.total = this.tableData.length;
      this.multipleSelection = [];
      this.loading = false;
    },
    onRefresh() {
      this.getTableData();
    },
    handleSelectionChange(val) {
      if (val) {
        this.multipleSelection = [val];
      } else {
        this.multipleSelection = [];
      }
    },
    onSubmit() {
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    }
  },
  components: {
    EditSourceLease
  }
}
</script>
