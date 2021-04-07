<template>
 <div>
  <el-form :inline="true" :model="formInline" class="form-inline">
    <el-form-item>
      <el-input size="small"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon='fa-search' size="small">查询</el-button>
    </el-form-item>
  </el-form>
  <div class="divider clearfix"></div>
  <operation-panel
    class="margin-tb5"
    :select-rows="multipleSelection"
    :operation-menus="operationMenus">
  </operation-panel>

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
    <el-table-column v-if="columnsChecked.indexOf('desc') >= 0"
      prop="desc"
      align="left"
      label="描述"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('size') >= 0"
      prop="level"
      align="left"
      label="审批级别"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('sta') >= 0"
      prop="sta"
      align="left"
      label="状态"
      min-width="100">
      <template slot-scope="scope">
        <span>{{scope.row.sta==0?"可用":"不可用"}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('move') >= 0"
      prop="move"
      align="left"
      label="动作"
      min-width="100">
      <template slot-scope="scope">
        <el-dropdown split-button type="info" @click="handleClick" size="small" @command="handleCommand">
          操作
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="扩展卷">修改</el-dropdown-item>
            <el-dropdown-item command="管理连接">删除</el-dropdown-item>
            <el-dropdown-item command="创建快照">启用</el-dropdown-item>
            <el-dropdown-item command="创建备份">禁用</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
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
  </div>
 </div>
</template>
<script>
export default {
  name: "VolumeList",
  data() {
    return {
      formInline: {
      },
      multipleSelection:[],
      operationMenus:[{
        icon: "fa-plus",
        name: "定制流程",
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          let parentPath = this.$route.matched[1].path;
          this.$router.push({
            path: '/process/process-add'
          });
        }.bind(this)
      }],
      tableData:[],
      listPara:{
        page:1,
        pageSize:10
      },
      loading:false,
      columnsChecked:["name", "desc", "level", "sta", "move"],
      columns:[{
        prop:"name",
        label:"名称"
      }, {
        prop:"desc",
        label:"描述"
      }, {
        prop:"level",
        label:"审批级别"
      }, {
        prop:"sta",
        label:"状态"
      }, {
        prop:"move",
        label:"动作"
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
          name:"卷名称"+parseInt(startNum+i),
          desc:"卷描述"+parseInt(startNum+i),
          size:parseInt(Math.random(1)*5)+"GB",
          sta:parseInt(Math.random(1)*2),
          type:"",
          enableyu:"nova"
        });
      }
      this.tableData = arr;
      this.total = 1000;
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
      alert("编辑卷");
    },
    handleCommand(c) {
      alert(c);
    }
  }
}
</script>