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
    <el-table-column v-if="columnsChecked.indexOf('objCount') >= 0"
      prop="objCount"
      align="left"
      label="对象数量"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('size') >= 0"
      prop="size"
      align="left"
      label="大小"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('createTime') >= 0"
      prop="createTime"
      align="left"
      label="创建时间"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('publicVisit') >= 0"
      prop="publicVisit"
      align="left"
      label="公开访问"
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
    <!-- <new-volume ref="newVolume" v-if="newVolumeFlg" @addData="addData">
        </new-volume> -->
  </div>
 </div>
</template>
<script>
  export default {
  name: "DocStor",
  data() {
    return {
      formInline: {
      },
      newVolumeFlg:false,
      multipleSelection:[],
      operationMenus:[{
        icon: "fa-plus",
        name: "创建文件存储",
        showflg: true,
        readOnly: true,
         handler: function(selectRows) {
          // let me = this;
          // me.newVolumeFlg = true;
          // me.$nextTick(() => {
          //   me.$refs.newVolume.show();
          // });
        }.bind(this)
      }],
      tableData:[],
      listPara:{
        page:1,
        pageSize:10
      },
      loading:false,
      columnsChecked:["name", "objCount", "size", "createTime", "publicVisit"],
      columns:[{
        prop:"name",
        label:"名称"
      }, {
        prop:"objCount",
        label:"对象数量"
      }, {
        prop:"size",
        label:"大小"
      }, {
        prop:"createTime",
        label:"创建时间"
      }, {
        prop:"publicVisit",
        label:"公开访问"
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
          name:"容器名称"+parseInt(startNum+i),
          objCount:"5",
          size:parseInt(Math.random(1)*5)+"GB",
          createTime:"2017-09-25",
          publicVisit:"-"
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
  }
}
</script>
<style scoped>

</style>
