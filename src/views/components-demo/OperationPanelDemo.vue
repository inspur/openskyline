<template>
 <div>
  <operation-panel
    :select-rows="multipleSelection"
    :operation-menus="operationMenus">
  </operation-panel>
  <div class="divider clearfix"></div>
  <el-table
    ref="umTable"
    :data="tableData"
    highlight-current-row
    stripe
    border
    style="width: 100%"
    row-key="id"
    @row-click="rowClick"
    @selection-change="handleSelectionChange">
    <el-table-column
      reserve-selection
      fixed="left"
      type="selection"
      width="55">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('date') >= 0"
      label="日期"
      prop="date"
      min-width="180">
      <template slot-scope="scope">
        <el-icon name="time"></el-icon>
        <span style="margin-left: 10px">{{ scope.row.date }}</span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('name') >= 0"
      prop="name"
      label="姓名"
      min-width="180">
      <template slot-scope="scope">
        <el-popover trigger="hover" placement="top">
          <p>姓名: {{ scope.row.name }}</p>
          <p>住址: {{ scope.row.address }}</p>
          <div slot="reference" class="name-wrapper">
            <el-tag>{{ scope.row.name }}</el-tag>
          </div>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('operation') >= 0"
      label="操作"
      prop="operation">
      <template slot-scope="scope">
        <el-button
          size="small"
          @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
        <el-button
          size="small"
          type="danger"
          @click="handleDelete(scope.$index, scope.row)">删除</el-button>
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
            <div slot="reference" class="name-wrapper">
              <el-tag>请选择列</el-tag>
            </div>
          </el-popover>
      </el-col>
      <el-col :span="19">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[100, 200, 300, 400]"
          :page-size="100"
          layout="total, sizes, prev, pager, next, jumper"
          :total="400">
        </el-pagination>
      </el-col>
    </el-row>
  </div>

  <transition name="slide-right" mode="out-in">
  <div style="width: 700px;" class="slide-panel" v-if="testFlg">
    <panel style="height: 100%">
      <div slot="title" class="clearfix" >
        <el-button type="text" icon="fa-arrow-left" @click="onBack">返回</el-button>
      </div>
       <div >
        联动区域
        联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域
        联动区域
        联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域
        联动区域
        联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域
        联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域
        联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域
        联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域
        联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域
        联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域联动区域
      </div>
    </panel>
  </div>

  </transition>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: "Description",
  data() {
    return {
      testFlg: false,
      currentPage: 1,
      showBorder: true,
      columns: [{
        prop: "date",
        label: "日期"
      }, {
        prop: "name",
        label: "姓名"
      }, {
        prop: "operation",
        label: "操作"
      }],
      columnsChecked: ['name', 'date'],
      tableData: [],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: "创建",
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.userListFlg = false;
          this.addUserFlg = true;
        }.bind(this)
      }, {
        icon: "fa-times-circle-o",
        name: "禁止",
        showflg: true,
        multi: true,
        enable(rowData) {
          return rowData["isEnabled"] != "0" && rowData["userId"] != Vue.userId;
        },
        handler: function(selectRows) {
          var self = this;
          self.$sequence({
            type: 'post',
            url: 'api/ibase/v1/user/{userId}/action/disable',
            params: selectRows,
            successMsg: self.$t('msg.successDisenable')
          }).then((data) => {
            self.$refs.umTable.clearSelection();
            self.currentPage = 1;
            self.getData({
              page: 1
            });
          }).catch((err) => {
            console.log(err);
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: "删除",
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          selectRows.forEach((item, index) => {

          } );
          self.$sequence({
            type: 'post',
            url: 'api/ibase/v1/user/{userId}/action/delete',
            params: selectRows,
            confirmMsg: self.$t('msg.confirmDelUser'),
            successMsg: self.$t('msg.successDelUser')
          }).then((data) => {
            self.$refs.umTable.clearSelection();
            self.currentPage = 1;
            self.getData({
              page: 1
            });
          }).catch((err) => {
            console.log(err);
          });
        }.bind(this)
      }]
    }
  },
  watch: {
    columnsChecked: {
      handler: function (rows, oldVal) {
       this.columnsChecked = rows;
      },
      deep: true
    }
  },
  mounted() {
    let umTable = this.$refs.umTable;
    // this.columns = [];
    // umTable.$children.forEach((item, index) => {
    //   if (item.label && item.prop) {
    //     this.columns.push({
    //       prop: item.prop,
    //       label: item.label
    //     });
    //   }
    // });
    this.tableData = this.getData(this.currentPage);
  },
  methods: {
    async test(param) {
      var self = this;
      self.loading = true;
      var data = {};
      data = Object.assign({}, data, this.formInline);
      data = JSON.stringify(data);
      Object.assign(this.queryParam, param);
      try {
        let ret = await this.$ajax({
          type: 'post',
          data: data,
          url: 'api/icloudmonitor/v1/contact/list?' + $.param(this.queryParam)
        });
        self.loading = false;
        self.tableData = ret.resData.data;
        self.total = ret.resData.total;
      } catch (data) {
        self.loading = false;
      }
    },
    getData(page=1) {
      let data = [];

      function getNum() {
        return Math.floor(Math.random() * 10000 + 1);
      }
      for (let i = 0; i < 10; i++) {
        data.push({
          selectable: function() {
            return true;
          },
          id: "id" + page + ( i + 1 ),
          name: '推广名称' + page + (i + 1),
          // _checked: true,
          date: "2017-08-09",
          address: '上海市普陀区金沙江路 1518 弄'
        });
      }
      return data;
    },
    handleEdit(index, row) {
      console.log(index, row);
    },
    handleDelete(index, row) {
      console.log(index, row);
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.tableData = this.getData(val);
      console.log(`当前页: ${val}`);
    },
    handleSelectionChange(val) {
      val.forEach((row, index) => {
        if (index === val.length - 1) return;
        this.$refs.umTable.toggleRowSelection(row, false);
      });
      this.multipleSelection = val;
      // this.multipleSelection = val;
    },
    onBack() {
      this.testFlg = false;
    },
    onRefresh() {
    },
    rowClick(row) {
      this.testFlg = true;
      // this.$refs.umTable.toggleRowSelection(row);
    }
  }
}
</script>
<style scoped>
.item {
  display:block;
  padding: 0 0 5px 0;
}
.name-wrapper {
  display: inline-block;
}
.vertical .el-checkbox+.el-checkbox {
  margin-left: 0;
}
.el-pagination {
  float: right;
}
</style>
