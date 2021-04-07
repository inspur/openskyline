<template>
<div>
 <el-form :inline="true" v-model="formInline" class="form-inline">
    <el-form-item  label="名称">
      <el-input  placeholder="名称" size="small"></el-input>
    </el-form-item>
    <!-- <el-form-item  label="状态">
      <el-select v-model="volumeStatus" size="small">
        <el-option label="所有" value="0"></el-option>
        <el-option label="可用" value="1"></el-option>
        <el-option label="维护" value="2"></el-option>
        <el-option label="错误" value="3"></el-option>
      </el-select>
    </el-form-item> -->
    <el-form-item  label="网络类型">
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
    <el-table-column v-if="columnsChecked.indexOf('net') >= 0"
      prop="net"
      align="left"
      label="网络"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('subnet') >= 0"
      prop="subnet"
      align="left"
      label="子网"
      min-width="100">
       <template slot-scope="scope">
        <el-button @click="showDetail(scope.$index, scope.row)" type="text" size="small">{{scope.row.subnet}}</el-button>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('ipVersion') >= 0"
      prop="ipVersion"
      align="left"
      label="IP版本"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('netType') >= 0"
      prop="netType"
      align="left"
      label="网络类型"
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
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
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
    <create-net ref="createNet" v-if="createNetFlg" @addData="addData"></create-net>
    <set-safe-strategy ref="setSafeStrategy" v-if="setSafeStrategyFlg" @addData="addData"></set-safe-strategy>
    <transition name="slide-right" mode="out-in">
    <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
      <panel style="height: 100%">
        <div slot="title" class="clearfix" >
         <el-button type="text" icon="fa-arrow-left" @click="onBack">返回</el-button>
        </div>
        <div>
         <subnet-detail></subnet-detail> 
        </div>
      </panel>
    </div>
  </transition>
  </div>
 </div>
</template>
<script>
import CreateNet from './CreateNet'
import SetSafeStrategy from './SetSafeStrategy'
import SubnetDetail from '../../network/network/SubnetDetail';
  export default {
  name: "DocStor",
  data() {
    return {
      formInline: {
      },
      createNetFlg:false,
      detailFlag:false,
      refreshMetadataFlg:false,
      setSafeStrategyFlg:false,
      multipleSelection:[],
      operationMenus:[{
        icon: "fa-plus",
        name: "关联网络",
        showflg: true,
        readOnly: true,
         handler: function(selectRows) {
          let me = this;
          me.createNetFlg = true;
          me.$nextTick(() => {
            me.$refs.createNet.show();
          });
        }.bind(this)
      }, {
        icon: "fa-clone",
        name: "安全策略管理",
        showflg: true,
        enable(rowData) {
          return true;
        },
         handler: function(selectRows) {
          let me = this;
          me.setSafeStrategyFlg = true;
          me.$nextTick(() => {
            me.$refs.setSafeStrategy.show();
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
          me.createNetFlg = true;
          me.$nextTick(() => {
            me.$refs.createNet.show();
             me.$refs.createNet.createNet.name = selectRows[0].name;
          });
        }.bind(this)
      }],
      tableData:[],
      listPara:{
        page:1,
        pageSize:10
      },
      loading:false,
      columnsChecked:["name", "net", "subnet", "ipVersion", "netType"],
      columns:[{
        prop:"name",
        label:"名称"
      }, {
        prop:"net",
        label:"网络"
      }, {
        prop:"subnet",
        label:"子网"
      }, {
        prop:"ipVersion",
        label:"IP版本"
      }, {
        prop:"netType",
        label:"网络类型"
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
          name:"网络名称"+parseInt(startNum+i),
          net:"net" + parseInt(Math.random(1)*5),
          subnet:"子网" + parseInt(Math.random(1)*5),
          ipVersion:"1.1",
          netType:"-"
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
      this.$refs.createNet.hide();
    },
    showDetail(index, row) {
      this.detailFlag = true;
    },
    onBack() {
      this.detailFlag = false;
    }
  },
  components: {
    CreateNet,
    SetSafeStrategy,
    SubnetDetail
  }
}
</script>
<style scoped>

</style>
