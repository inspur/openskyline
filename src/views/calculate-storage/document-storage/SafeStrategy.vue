<template>
<div>
  <el-form :inline="true" v-model="formInline" class="form-inline">
    <el-form-item  label="名称">
      <el-input  placeholder="名称" size="small"></el-input>
    </el-form-item>
    <el-form-item  label="类型">
      <el-select v-model="volumeType" size="small">
        <el-option label="所有" value="0"></el-option>
        <el-option label="type1" value="1"></el-option>
        <el-option label="type2" value="2"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon='fa-search'  size="small">查询</el-button>
    </el-form-item>
  </el-form>
  <div class="divider clearfix"></div>
  <operation-panel
    class="margin-tb5"
    :select-rows="multipleSelection"
    :operation-menus="operationMenus">
  </operation-panel>
  <div class="divider clearfix"></div>
  <el-table
    ref="shTable"
    :data="tableData"
    v-loading="loading"
    element-loading-text="数据加载中"
    highlight-current-row
    border
    stripe
    style="width: 100%;"
    slot="empty"
    max-height='500'
    row-key="id"
    @selection-change="handleSelectionChange">
    <el-table-column
      reserve-selection
      type="selection"
      align="center"
      width="55">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
      prop="name"
      label="名称"
      align="left"
      sortable="custom"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('type') >= 0"
      prop="type"
      align="left"
      label="类型"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('ip') >= 0"
      prop="ip"
      align="left"
      label="IP"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('userName') >= 0"
      prop="userName"
      align="left"
      label="用户名"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('desc') >= 0"
      prop="desc"
      align="left"
      label="描述"
      min-width="100">
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh">
        </el-button>
          <span>当前选中 {{multipleSelection.length}}条</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>选择列</el-tag>
            </div>
          </el-popover>
      </el-col>
      <el-col :span="19">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="pageSizes"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          style="float:right;">
        </el-pagination>
      </el-col>
    </el-row>
    <create-safe-strategy ref="createSafeStrategy" v-if="createSafeStrategyFlg" @addData="addData"></create-safe-strategy>
  </div>
 </div>
</template>
<script>
import CreateSafeStrategy from './CreateSafeStrategy'
  export default {
  name: "DocStor",
  data() {
    return {
      formInline: {
      },
      createSafeStrategyFlg:false,
      multipleSelection:[],
      operationMenus:[{
        icon: "fa-plus",
        name: "创建安全策略",
        showflg: true,
        readOnly: true,
         handler: function(selectRows) {
          let me = this;
          me.createSafeStrategyFlg = true;
          me.$nextTick(() => {
            me.$refs.createSafeStrategy.show();
          });
        }.bind(this)
      }, {
        icon: "fa-clone",
        name: "修改",
        showflg: true,
        enable(rowData) {
          return true;
        },
         handler: function(selectRows) {
          let me = this;
          me.createSafeStrategyFlg = true;
          me.$nextTick(() => {
            me.$refs.createSafeStrategy.show();
          });
        }.bind(this)
      }],
      tableData:[],
      listPara:{
        page:1,
        pageSize:10
      },
      loading:false,
      columnsChecked:["name", "type", "ip", "userName", "desc"],
      columns:[{
        prop:"name",
        label:"名称"
      }, {
        prop:"type",
        label:"类型"
      }, {
        prop:"ip",
        label:"IP"
      }, {
        prop:"userName",
        label:"用户名"
      }, {
        prop:"desc",
        label:"描述"
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
  methods: {
    loadData() {
      this.loading = true;
      let me = this;
      let startNum = this.listPara.pageSize*(this.listPara.page-1)+1;
      let arr = [];
      for (let i=0; i<this.listPara.pageSize; i++) {
        arr.push({
          id:i+startNum,
          name:"安全策略名称"+parseInt(startNum+i),
          type:"kerberos",
          ip:"100.2.12." + parseInt(Math.random(1)*5),
          userName:"-",
          desc:"-"
        });
      }
      this.tableData = arr;
      this.total = 100;
      setTimeout(function() {
        me.loading = false;
      }, 1300);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.loadData();
    },
    handleSizeChange(val) {
      this.listPara.pageSize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      this.listPara.page = val;
      this.loadData();
    },
    handleClick() {
    },
    handleCommand(c) {
    },
    addData() {
      this.$refs.newVolume.hide();
    }
  },
  components: {
    CreateSafeStrategy
  }
}
</script>
