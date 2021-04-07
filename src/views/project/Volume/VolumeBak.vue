<template>
 <div>
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
      prop="size"
      align="left"
      label="大小"
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
    <el-table-column v-if="columnsChecked.indexOf('volumeName') >= 0"
      prop="volumeName"
      align="left"
      label="卷名称"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('move') >= 0"
      prop="move"
      align="left"
      label="动作"
      width="150">
      <template slot-scope="scope">
        <el-dropdown split-button type="info" @click="handleClick" size="small" @command="handleCommand">
          动作
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="动作1">动作1</el-dropdown-item>
            <el-dropdown-item command="动作1">动作2</el-dropdown-item>
            <el-dropdown-item command="动作3">动作3</el-dropdown-item>
            <el-dropdown-item command="动作4">动作4</el-dropdown-item>
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
  name: "VolumeBak",
  data() {
    return {
      formInline: {
      },
      multipleSelection:[],
      tableData:[],
      listPara:{
        page:1,
        pageSize:10
      },
      loading:false,
      columnsChecked:["name", "desc", "size", "sta", "volumeName", "move"],
      columns:[{
        prop:"name",
        label:"名称"
      }, {
        prop:"desc",
        label:"描述"
      }, {
        prop:"size",
        label:"大小"
      }, {
        prop:"sta",
        label:"状态"
      }, {
        prop:"volumeName",
        label:"卷名称"
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
          name:"名称"+parseInt(startNum+i),
          desc:"描述"+parseInt(startNum+i),
          size:parseInt(Math.random(1)*5)+"GB",
          sta:parseInt(Math.random(1)*2),
          volumeName:"卷名称"+parseInt(startNum+i)
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
      alert("动作");
    },
    handleCommand(c) {
      alert(c);
    }
  }
}
</script>
