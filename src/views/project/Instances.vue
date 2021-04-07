<template>
 <div>
  <el-form :inline="true" v-model="formInline" class="form-inline">
    <el-form-item  label="名称">
      <el-input  placeholder="名称" size="small"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon='fa-search'  size="small">查询</el-button>
    </el-form-item>
  </el-form>
  <div class="divider clearfix"></div>
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
    @selection-change="handleSelectionChange">
    <el-table-column
      reserve-selection
      fixed="left"
      type="selection"
      width="55">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('name') >= 0"
      label="实例名称"
      prop="name"
      min-width="100">
      <template slot-scope="scope">
        <el-tag type="primary">
          <el-icon name="time"></el-icon>
          <span style="margin-left: 10px" @click="instanceDetail(scope.row.name)">{{ scope.row.name }}</span>
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('mirrorName') >= 0"
      prop="mirrorName"
      label="镜像名称"
      min-width="110">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('address') >= 0"
      label="IP 地址"
      prop="address">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('type') >= 0"
      prop="type"
      label="实例类型"
      min-width="60">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('key') >= 0"
      prop="key"
      label="密钥对"
      min-width="50">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('status') >= 0"
      prop="status"
      label="状态"
      min-width="50">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('domain') >= 0"
      prop="domain"
      label="可用域"
      min-width="70">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('task') >= 0"
      prop="task"
      label="任务"
      min-width="50">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('powerStatus') >= 0"
      prop="powerStatus"
      label="电源状态"
      min-width="80">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('date') >= 0"
      prop="date"
      label="时间"
      min-width="80">
    </el-table-column>
    <!-- <el-table-column
      label="操作"
      min-width="80">
      <template slot-scope="scope">
        <el-dropdown trigger="click" split-button type="primary">
          编辑
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item class="clearfix">开启</el-dropdown-item>
            <el-dropdown-item class="clearfix">关闭</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </el-table-column> -->
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
          :page-sizes="[10, 20, 30, 40]"
          :page-size="10"
          layout="total, sizes, prev, pager, next, jumper"
          :total="40">
        </el-pagination>
      </el-col>
    </el-row>
    <edit-instance @handleShow="handleShow" ref="editInstance" :instName="instanceName" v-if="editFlag"></edit-instance>
  </div>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import EditInstance from './instance/EditInstance';
export default {
  name: "Instances",
  components: {
    EditInstance
  },
  props: ['flag1', 'flag2'],
  data() {
    return {
      formInline: '',
      currentPage: 1,
      showBorder: true,
      instanceName: '',
      editFlag: false,
      columns: [{
        prop: "name",
        label: "名称"
      }, {
        prop: "mirrorName",
        label: "镜像名称"
      }, {
        prop: "address",
        label: "IP 地址"
      }, {
        prop: "type",
        label: "实例类型"
      }, {
        prop: "key",
        label: "密钥对"
      }, {
        prop: "status",
        label: "状态"
      }, {
        prop: "domain",
        label: "可用域"
      }],
      columnsChecked: ['name', 'mirrorName', 'address', 'type', 'key', 'status', 'domain', 'task', 'powerStatus', 'date'],
      tableData: [],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: "创建实例",
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          let parentPath = this.$route.matched[1].path;
          this.$emit("changeValue");
          this.$router.push({
            path: '/project/instances/add-instance',
            query: {
              parent: "testh",
              refer: this.$route.path
            }
          });
        }.bind(this)
      }, {
        icon: "fa-times-circle-o",
        name: "编辑实例",
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.instanceName = selectRows[0].name;
          this.editFlag = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: "删除实例",
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          selectRows.forEach((item, index) => {

          });
          self.$sequence({
            type: 'post',
            url: 'api/ibase/v1/user/{userId}/action/delete',
            params: selectRows,
            confirmMsg: "确定删除实例？",
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
  computed: {
      ...mapGetters({
        routers: 'getRouters'
      })
    },
  mounted() {
    this.tableData = this.getData(this.currentPage);
    let url = this.$route.matched[2] || this.$route.matched[3];
    if ( null != url ) {
       this.$emit("changeValue");
    }
  },
  methods: {
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
          name: '实例名称' + page + (i + 1),
          mirrorName: 'cirroscirros-0.3.' + i + '-x86_64-disk.img',
          key: '-',
          domain: 'domain',
          type: '11' + i,
          status: (i % 5 === 0)?'错误':'运行',
          powerStatus: (i % 3 === 0)?'关闭':'运行中',
          task: '无',
          date: "2017-08-09",
          address: '100.2.12.' + i
        })
      }
      return data;
    },
    instanceDetail(name) {
      this.$emit("changeValue", [name]);
      this.$router.push({
        path: '/project/instances/instance-detail',
        params: {
          name: name
        }
      });
    },
    handleShow() {
      this.editFlag = false;
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
      })
      this.multipleSelection = val;
    },
    onRefresh() {
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
