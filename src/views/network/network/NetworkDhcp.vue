<template>
  <div>
  <div class="operation-panel">
    <operation-panel
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
  </div>
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
      type="selection"
      width="70">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('name') >= 0"
      :label="$t('base.host')"
      prop="name"
      min-width="100">
    </el-table-column>  
    <el-table-column
      v-if="columnsChecked.indexOf('status') >= 0"
      prop="status"
      :label="$t('base.status')"
      min-width="50">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('admin_state_up') >= 0"
      prop="admin_state_up"
      :label="$t('network.manageStatues')"
      min-width="50">
    </el-table-column>
  </el-table>
    <add-dhcp ref="adddhcp" v-if="addFlag" @handleAddShow="handleAddShow"></add-dhcp>
  </div>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import AddDhcp from './AddDhcp';
export default {
  components: {
    AddDhcp
  },
  data() {
    return {
      formInline: '',
      showBorder: true,
      addFlag: false,
      addSubnetFlag: false,
      editFlag: false,
      columnsChecked: ['name', 'status', 'admin_state_up'],
      tableData: [],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('opt.addGroupUser'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.addFlag = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('base.delete'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          this.$confirm(Vue.t('network.confirmSimpleDelete'), Vue.t('base.prompt'), {
            confirmButtonText: Vue.t('base.confirm'),
            cancelButtonText: Vue.t('base.cancel'),
            closeOnClickModal: false,
            type: "warning"
          }).then(() => {
            this.$message({
              type: "success",
              message: Vue.t('base.deleteSuccess')
            });
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
   this.tableData = this.getData();
  },
  methods: {
    getData() {
      let data = [];
      for (let i = 0; i < 5; i++) {
        data.push({
          id: "id" + ( i + 1 ),
          name: 'node' + (i + 1),
          status: Vue.t('base.activation'),
          admin_state_up: Vue.t('base.startUp')
        })
      }
      return data;
    },
    handleAddShow() {
      this.addFlag = false;
    },
    handleSelectionChange(val) {
      val.forEach((row, index) => {
        if (index === val.length - 1) return;
        this.$refs.umTable.toggleRowSelection(row, false);
      });
      this.multipleSelection = val;
    },
    onRefresh() {
    },
    rowClick(row) {
    }
  }
}
</script>