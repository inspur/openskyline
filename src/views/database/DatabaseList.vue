<template>
  <div>
    <operation-panel v-if="roleType==2"
      class="margin-tb5"
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
    <div class="divider clearfix"></div>
    <el-table
      ref="table"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      border
      stripe
      :default-sort = "{prop: 'name', order: 'ascending'}"
      row-key="name"
      @row-click="rowClick"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column
        reserve-selection
        type="selection"
        align="center"
        width="55">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('lang.name')"
        show-overflow-tooltip
        align="left"
        sortable="custom"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('character_set') >= 0"
        prop="character_set"
        :label="$t('db.characterSet')"
        show-overflow-tooltip
        align="left"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('collate') >= 0"
        prop="collate"
        :label="$t('db.sortRule')"
        show-overflow-tooltip
        align="left"
        min-width="100">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}} {{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj" ref="pageComponent"></page>
        </el-col>
      </el-row>
    </div>

    <create-database ref="createDatabase" v-if="createDatabaseFlag" @handleAddShow="handleAddShow" @refreshData="getData" :dbInstanceDetail="{}" :createByService="false"></create-database>
  </div>
</template>
<script>
  import CreateDatabase from "./CreateDatabase"
  export default {
    name: 'DatabaseList',
    components: {
      CreateDatabase
    },
    data () {
      return {
        roleType:Vue.roleType,
        createDatabaseFlag:false,
        columns: [],
        columnsChecked:["name", "character_set", "collate"],
        tableData: [],
        totalData:[],
        multipleSelection: [],
        sortObj: {
          sortOrder:"descending",
          sortField:"name"
        },
        loading: false,
        operationMenus: [{
          icon: "fa-plus",
          name: this.$t('db.createDatabase'),
          showflg: true,
          readOnly: true,
          enable(rowData) {
            return true;
          },
          handler: function() {
            this.createDatabaseFlag = true;
          }.bind(this)
        }, {
          icon: "fa-remove",
          name: this.$t('lang.delete'),
          showflg: true,
          readOnly: false,
          multi:true,
          enable(rowData) {
            return true;
          },
          handler: function(selectedDatas) {
            let me = this;
            this.$confirm(this.$t('lang.ifDeleteData'), this.$t('lang.confirm'), {
              confirmButtonText:this.$t('lang.confirm'),
              cancelButtonText:this.$t('lang.cancel'),
              type:'warning'
            }).then(() => {
              let instanceId = this.$route.params.instanceId;
              this.$sequence({
                type: 'DELETE',
                url: "api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/" + instanceId + "/databases/{name}",
                params: selectedDatas,
                paramKeys: ["name"],
                successMsg: this.$t('db.deleteSuccess'),
                log:{
                  description:{
                    en:"Delete database:{name}",
                    zh_cn:"删除数据库:{name}"
                  },
                  target:Vue.logTarget.databaseService
                },
                successFun: () => {
                  this.getData();
                },
                errFun: () => {
                  this.getData();
                }
              });
            }).catch(() => {
            });
          }.bind(this)
        }]
      };
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
      let table = this.$refs.table;
      table.$children.forEach((item, index) => {
        if (item.label && item.prop) {
          this.columns.push({
            prop: item.prop,
            label: item.label
          });
        }
      });
      this.getData();
    },
    methods: {
      async getData(param, isClear = true) {
        var self = this;
        self.loading = true;
        let dbInstanceId = this.$route.params.instanceId;
        try {
          if (isClear) {
            // 是否清空选中
            self.$nextTick(() => {
              self.$refs.table.clearSelection();
            });
          }

          let response = await this.$ajax({
            type: 'get',
            url: "api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/" + dbInstanceId + "/databases"
          });
          self.loading = false;
          let dataList = response.databases;
          self.totalData = dataList;
        } catch (data) {
          self.loading = false;
        }
      },
      getCurrentData(param) {
        this.tableData = param;
      },
      //多选
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //排序
      sortChange(column) {
        let self = this;
        if (!column.prop) { return; }
        self.sortObj = {
          sortOrder:column.order,
          sortField:column.prop
        };
      },
      rowClick(row) {
        this.$refs.table.toggleRowSelection(row);
      },
      //刷新
      onRefresh() {
        this.getData({}, true);
      },
      handleAddShow() {
        this.createDatabaseFlag = false;
      }
    }
  };
</script>
<style scoped>

</style>
