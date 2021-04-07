<template>
  <el-dialog
    :title="isAuth?title1:title2"
    :visible.sync="dialogVisible"
    :before-close="handleCancel"
    v-dialogDrag>
    <div>
    <el-table
      ref="userDatabaseTable"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      border
      stripe
      style="min-height:150px;"
      :default-sort = "{prop: 'name', order: 'ascending'}"
      row-key="name"
      @row-click="rowClick"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column v-if="isAuth"
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
        v-if="!isAuth"
        prop="unAuthUserdb"
        :label="$t('db.operation')"
        align="left"
        min-width="100">
        <template slot-scope="scope">
        <el-button @click="deleteAuthUserdb(scope.row)" size="small">{{$t('db.unauthorizeUser')}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span v-if="isAuth">{{$t('lang.currentSelected')}} {{multipleSelection.length}} {{$tc('lang.item', multipleSelection.length)}}</span>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj" ref="pageComponent"></page>
        </el-col>
      </el-row>
    </div>

    <div slot="footer" class="dialog-footer" v-if="isAuth">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="confirm" type="primary" :disabled="loading">{{$t('lang.confirm')}}</el-button>
    </div>
    <div slot="footer" class="dialog-footer" v-else>
      <el-button @click="handleCancel">{{$t('lang.close')}}</el-button>
    </div>
    </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "UserDatabaseList",
    props:{
      userRowData:{
        type:Object,
        default:() => {
          return {};
        }
      },
      // 授权标志，true授权，false取消授权
      isAuthdb:{
        type:Boolean,
        default:() => {
          return true;
        }
      }
    },
    data() {
      return {
        createDatabaseForm: {
          dbName: '',
          characterSet: '',
          collection: ''
        },
        isAuth:this.isAuthdb,
        title1:this.$t('db.selectDatabase'),
        title2:this.$t('db.unauthorize'),
        dialogVisible: false,
        loading:false,
        columns: [{
            prop: "name",
            label: this.$t('lang.name')
          }],
        columnsChecked:["name"],
        tableData: [],
        totalData:[],
        multipleSelection: [],
        sortObj: {
          sortOrder:"descending",
          sortField:"name"
        }
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
      // let table = this.$refs.userDatabaseTable;
      // table.$children.forEach((item, index) => {
      //   if (item.label && item.prop) {
      //     this.columns.push({
      //       prop: item.prop,
      //       label: item.label
      //     });
      //   }
      // });
    },
    methods: {
      initDialog() {
        this.dialogVisible = true;
        this.getUserDataBaseData(true, true);
      },
      async getAllDataBaseData(userdbList) {
        var self = this;
        let dbInstanceId = this.$route.params.instanceId;
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/" + dbInstanceId + "/databases"
          });
          let dataList = response.databases;
          if (userdbList && userdbList.length > 0) {
            let authedList = [];
            for (let i = 0; i < userdbList.length; i++) {
              authedList.push(userdbList[i].name);
            }

            self.totalData = [];
            dataList.forEach(data => {
              if (authedList.indexOf(data.name) < 0) {
                self.totalData.push(data);
              }
            });
          } else {
            self.totalData = dataList;
          }
        } catch (data) {
        }
      },
      async getUserDataBaseData(isloading = false, isClear = true) {
        var self = this;
        if (isloading) {
          self.loading = true;
        }
        if (isClear) {
          // 是否清空选中
          self.$nextTick(() => {
            self.$refs.userDatabaseTable.clearSelection();
          });
        }
        let dbInstanceId = this.$route.params.instanceId;
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/trove/v1.0/" + this.$cookie.get("pid") +
                "/instances/" + dbInstanceId + "/users/" + self.userRowData.name + encodeURIComponent("@"+self.userRowData.host)+"/databases"
          });
          self.loading = false;
          let dataList = response.databases;
          if (self.isAuthdb) {
            self.getAllDataBaseData(dataList);
          } else {
            self.totalData = dataList;
          }
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
        this.$refs.userDatabaseTable.toggleRowSelection(row);
      },
      //刷新
      onRefresh() {
        this.getUserDataBaseData(false, false);
      },
      handleCancel() {
        this.$emit("handleAddShow");
      },
      confirm() {
        let self = this;
        if (self.multipleSelection.length <= 0) {
          self.$message.error(this.$t('db.selectDatabaseErrorMsg'));
          return false;
        }

        if (self.isAuthdb) {
          self.loading = true;
          let selectedDBs = self.multipleSelection;
          let dbInstanceId = this.$route.params.instanceId;
          this.$ajax({
            type: 'put',
            url: "api/trove/v1.0/" + this.$cookie.get("pid") +
                "/instances/" + dbInstanceId + "/users/" + self.userRowData.name + encodeURIComponent("@"+self.userRowData.host)+"/databases",
            data:JSON.stringify({
              databases:selectedDBs
            }),
            log:{
              description:{
                en:"Authorize database user:" + self.userRowData.name,
                zh_cn:"授权数据库用户:" + self.userRowData.name
              },
              target:Vue.logTarget.databaseService
            },
            successMsg:this.$t('db.authorizeSuccessMsg'),
            successFun: () => {
              self.loading = false;
              self.$emit("handleAddShow");
              self.$emit("refreshData");
            },
            errFun: () => {
              self.loading = false;
            }
          });
        } else {
          self.loading = true;
          let userDbs = self.multipleSelection;
          let dbInstanceId = this.$route.params.instanceId;
          this.$sequence({
            type: 'delete',
            url: "api/trove/v1.0/" + this.$cookie.get("pid") +
                "/instances/" + dbInstanceId + "/users/" + self.userRowData.name + "/databases/{name}",
            params: userDbs,
            paramKeys: ["name"],
            log:{
              description:{
                en:"Unauthorize database user:" + self.userRowData.name,
                zh_cn:"回收授权数据库用户:" + self.userRowData.name
              },
              target:Vue.logTarget.databaseService
            },
            successMsg:this.$t('db.unauthorizeSuccessMsg'),
            successFun: () => {
              self.loading = false;
              self.$emit("handleAddShow");
              self.$emit("refreshData");
            },
            errFun: () => {
              self.loading = false;
            }
          });
        }
      },
      deleteAuthUserdb(rowData) {
        let self = this;
        let userDbs = rowData;
        let dbInstanceId = this.$route.params.instanceId;
        self.loading = true;
        this.$ajax({
          type: 'delete',
          url: "api/trove/v1.0/" + this.$cookie.get("pid") +
              "/instances/" + dbInstanceId + "/users/" + self.userRowData.name + encodeURIComponent("@"+self.userRowData.host)+"/databases/" + rowData.name,
          log:{
            description:{
              en:"Unauthorize database user:" + self.userRowData.name,
              zh_cn:"回收授权数据库用户:" + self.userRowData.name
            },
            target:Vue.logTarget.databaseService
          },
          successMsg:this.$t('db.unauthorizeSuccessMsg'),
          successFun: () => {
            self.$emit("refreshData");
            self.getUserDataBaseData(false, true);
          },
          errFun: () => {
            self.loading = false;
          }
        });
      }
    }
  }
</script>