<template>
   <div> 
    <el-form ref="" label-width="100px">
      <div class="operation-panel">
        <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
        </operation-panel>
      </div>
      <div class="divider clearfix"></div>
      <el-table ref="umTable" :data="tableData" highlight-current-row stripe border style="width: 100%" 
        row-key="id" @selection-change="handleSelectionChange">
        <el-table-column reserve-selection fixed="left" type="selection" width="55">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" label="名称" min-width="110">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('description') >= 0" prop="description" label="描述" >
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('hyperType') >= 0" prop="enabled" label="是否启用" min-width="60">
          <template slot-scope="scope">
            <span v-html="statusRender(scope.row.enabled, scope.row)"></span>
          </template>
        </el-table-column>
        </el-table-column>
      </el-table>
    </el-form>
    <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh">
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
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="10"
          layout="total, sizes, prev, pager, next, jumper"
          :total="10">
        </el-pagination>
      </el-col>
    </el-row>
  </div>
  <domain-operate v-if="operFlag" :domainId="domainId" @handleShow="handleShow" @getData="getData" @clearSelOption="clearSelOption"></domain-operate>
</div>
</template>
<script>
import DomainOperate from './DomainOperate';
export default {
  name: 'domain',
  components: { DomainOperate },
  data() {
    return {
      currentPage: 1,
      columns: [],
      columnsChecked: ['name', 'description', 'hyperType'],
      tableData: [],
      multipleSelection: [],
      operFlag: false,
      domainId: '',
      operationMenus: [{
        icon: "fa-plus",
        name: "创建",
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.domainId = "";
          this.operFlag = true;
        }.bind(this)
      }, {
        icon: "fa-plus",
        name: "编辑",
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.operFlag = true;
          this.domainId = selectRows[0].id;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: "删除",
        multi: false,
        showflg: true,
        enable(rowData) {
          return !rowData['enabled'];
        },
        handler: function(selectRows) {
          var self = this;
          self.deleteDomain(selectRows[0]);
          /*self.$sequence({
            type: 'delete',
            url: 'api/nova/v2.1/flavors/' + row['id'],
            params: selectRows,
            confirmMsg: "确定删除资源规格？",
            successMsg: self.$t('msg.successDelUser')
          }).then((data) => {
            self.$refs.acTable.clearSelection();
            self.currentPage = 1;
            self.getData({
              page: 1
            });
          }).catch((err) => {
            console.log(err);
          });*/
        }.bind(this)
      }]
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      var self = this;
      let data = [];
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/keystone/v3/domains'
        });
        self.loading = false;
        self.tableData = result['domains'];
        self.total = result['domains'].length;
      } catch (res) {
        self.loading = false;
        self.$message.error('获取失败!');
      }
    },
    async deleteDomain(row) {
      var self = this;
      try {
        let result = await this.$ajax({
          type: 'delete',
          url: 'api/keystone/v3/domains/' + row['id'],
          data: {},
          confirmMsg: "确定删除资源域？",
          successMsg: "成功删除资源域。"
        });
        self.$refs.umTable.clearSelection();
        self.getData();
      } catch (data) {
        __DEV__ && console.error(data);
      }
    },
    handleSelectionChange(val) {
      val.forEach((row, index) => {
        if (index === val.length - 1) return;
        this.$refs.umTable.toggleRowSelection(row, false);
      })
      this.multipleSelection = val;
    },
    handleShow() {
      this.operFlag = false;
    },
    clearSelOption() {
      var self = this;
      self.$refs.umTable.clearSelection();
    },
    statusRender(value, row) {
      if ( (value + "") == "true") {
          return '启用';
      } else {
          return '禁用';
      }
    }
  }
}
</script>
<style scoped>
</style>