<template>
  <div>
    <operation-panel v-if="roleType==2"
      class="margin-tb5"
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
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
      style="width: 100%;"
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
        v-if="columnsChecked.indexOf('host') >= 0"
        prop="host"
        :label="$t('lang.host')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span>{{scope.row.host.replace('%', '*')}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('databases') >= 0"
        prop="databases"
        :label="$t('db.authorizedDatabase')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span>{{showUserDB(scope.row.databases)}}</span>
        </template>
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

    <create-user ref="createDatabase" v-if="createUserFlag" @handleAddShow="handleAddShow" @refreshData="getData"></create-user>
    <user-database ref="userDatabase" v-if="userDatabaseFlag" :isAuthdb="userAuthdb" :userRowData="selectedRowData" @handleAddShow="handleAddShow" @refreshData="getData"></user-database>
  </div>
</template>
<script>
  import CreateUser from "./CreateDatabaseUser";
  import UserDatabase from "./UserDatabaseList";
  export default {
    name: 'UserList',
    components: {
      CreateUser, UserDatabase
    },
    data () {
      return {
        roleType:Vue.roleType,
        createUserFlag:false,
        userDatabaseFlag:false,
        userAuthdb:true,
        columns: [],
        columnsChecked:["name", "host", "databases"],
        tableData: [],
        totalData:[],
        multipleSelection: [],
        selectedRowData:{},
        sortObj: {
          sortOrder:"descending",
          sortField:"name"
        },
        loading: false,
        operationMenus: [{
          icon: "fa-plus",
          name: this.$t('db.createUser'),
          showflg: true,
          readOnly: true,
          enable(rowData) {
            return true;
          },
          handler: function() {
            this.createUserFlag = true;
          }.bind(this)
        }, {
          icon: "fa-check-circle",
          name: this.$t('db.authorize'),
          showflg: true,
          readOnly: false,
          multi:false,
          enable(rowData) {
            return true;
          },
          handler: function(selectedDatas) {
            let self = this;
            self.selectedRowData = selectedDatas[0];
            self.userDatabaseFlag = true;
            self.userAuthdb = true;
            self.$nextTick(() => {
              self.$refs.userDatabase.initDialog();
            });
          }.bind(this)
        }, {
          icon: "fa-times-circle",
          name: this.$t('db.unauthorize'),
          showflg: true,
          readOnly: false,
          multi:false,
          enable(rowData) {
            return rowData.databases != "";
          },
          handler: function(selectedDatas) {
            let self = this;
            self.selectedRowData = selectedDatas[0];
            self.userDatabaseFlag = true;
            self.userAuthdb = false;
            self.$nextTick(() => {
              self.$refs.userDatabase.initDialog();
            });
          }.bind(this)
        }, {
          icon: "fa-remove",
          name: this.$t('lang.delete'),
          showflg: true,
          readOnly: false,
          multi:false,
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
              selectedDatas.forEach((item) => {
                item.hostDel = encodeURIComponent(item.host);
              })
              this.$sequence({
                type: 'DELETE',
                url: "api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/" + instanceId + "/users/{name}"+encodeURIComponent("@")+"{hostDel}",
                params: selectedDatas,
                paramKeys: ["name", "hostDel"],
                successMsg: this.$t('db.deleteSuccess'),
                log:{
                  description:{
                    en:"Delete database user:{name}",
                    zh_cn:"删除数据库用户:{name}"
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
      this.getData(true, true);
    },
    methods: {
      async getData(isloading = false, isClear = true) {
        var self = this;
        if (isloading) {
          self.loading = true;
        }
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
            url: "api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/" + dbInstanceId + "/users"
          });
          self.loading = false;
          let dataList = response.users;
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
        this.getData(false, true);
      },
      handleAddShow() {
        this.createUserFlag = false;
        this.userDatabaseFlag = false;
      },
      showUserDB(dataList) {
        let res = [];
        if (dataList && dataList.length > 0) {
            dataList.forEach(data => {
              res.push(data.name);
            })
        }
        return res.toString();
      }
    }
  };
</script>
<style scoped>

</style>
