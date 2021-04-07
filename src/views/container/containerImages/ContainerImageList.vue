<template>
  <div>
    <icos-page-header :title="$t('container.containerImage')" :show-bottom-border="true" />
    <icos-page>
      <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
      <div class="divider clearfix" v-if="roleType==='0'"></div>
      <operation-panel v-if="roleType==='0'"
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
        stripe
        :default-sort = "{prop: 'name', order: 'ascending'}"
        row-key="id"
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
          sortable="custom"
          min-width="100">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status === 'OK'" 
            @click="rowNameClick(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
            
            <span v-else>{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('status') >= 0"
          prop="status"
          :label="$t('lang.status')"
          show-overflow-tooltip
          align="left"
          sortable="custom"
          min-width="100">
          <template slot-scope="scope">
            <el-tag :type="statusTagRender(scope.row.status)">
              <span>{{statusRender(scope.row.status, scope.row)}}</span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('ip') >= 0"
          prop="ip"
          :label="$t('lang.ipAddress')"
          show-overflow-tooltip
          align="left"
          min-width="100">
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('port') >= 0"
          prop="port"
          :label="$t('lang.port')"
          show-overflow-tooltip
          align="left"
          min-width="100">
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('username') >= 0"
          prop="username"
          :label="$t('lang.userName')"
          show-overflow-tooltip
          align="left"
          min-width="100">
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('created_at') >= 0"
          prop="created_at"
          :label="$t('lang.createTime')"
          show-overflow-tooltip
          align="left"
          sortable="custom"
          min-width="100">
          <template slot-scope="scope">
            <span>{{dateFormatter(scope.row.created_at)}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('updated_at') >= 0"
          prop="updated_at"
          :label="$t('lang.modifyTime')"
          show-overflow-tooltip
          align="left"
          min-width="100">
          <template slot-scope="scope">
            <span>{{dateFormatter(scope.row.updated_at)}}</span>
          </template>
        </el-table-column> 
        <el-table-column
          v-if="columnsChecked.indexOf('description') >= 0"
          prop="description"
          :label="$t('lang.desc')"
          show-overflow-tooltip
          min-width="100" align="left">
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
                <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
              </div>
            </el-popover>
          </el-col>
          <page :totalData="totalData" @getCurrentData="getCurrentData" :objStorFlag="objStorFlag"></page>
        </el-row>
      </div>

      <create-harbor ref="CreateHarbor" v-if="createHarborFlag" @handleAddShow="handleAddShow" @refreshData="getData"></create-harbor>
      <update-harbor ref="UpdateHarbor" v-if="updateHarborFlag" @handleAddShow="handleAddShow" :selectedRowData="multipleSelection[0]" @refreshData="getData"></update-harbor>
    </icos-page>
  </div>
</template>
<script>
  let Base64 = require("js-base64").Base64;
  import CreateHarbor from "./CreateHarbor"
  import UpdateHarbor from "./UpdateHarbor"
  import moment from "moment"
  export default {
    name: 'ContainerImageList',
    components: {
      CreateHarbor,
      UpdateHarbor
    },
    data () {
      return {
        searchBar: {
          conditions: {
            name: {
              label: this.$t('lang.name'),
              type: 'input',
              validator: (value) => {
                if (!/^[_0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                  throw new Error(this.$t('validation.onlyLetterNumber_Chinese'));
                }
              }
            },
            ip: {
              label: this.$t('lang.ipAddress'),
              type: 'input',
              validator: (value) => {
                if (!/^[\.0-9]*$/.test(value)) {
                  throw new Error(this.$t('calcStorLang.RECYCLE_BIN_RULE_IP_MESSAGE'));
                }
              }
            }
          }
        },
        searchBarValidatedParams: {},
        roleType:Vue.roleType,
        createHarborFlag:false,
        updateHarborFlag:false,
        reloadTblFlag:false,
        objStorFlag: true,
        total: 0,
        columns: [],
        columnsChecked:["name", "status", "ip", "port", "username", "created_at", "updated_at", "description"],
        tableData: [],
        totalData:[],
        multipleSelection: [],
        queryParam: {
          filed: "",
          dir: ""
        },
        loading: false,
        operationMenus: [{
          icon: "fa-plus",
          name: this.$t('container.create'),
          showflg: true,
          readOnly: true,
          handler: function() {
            this.createHarborFlag = true;
            this.$nextTick(() => {
              this.$refs.CreateHarbor.show();
            });
          }.bind(this)
        }, {
          icon: "fa-edit",
          name: this.$t('lang.modify'),
          showflg: true,
          readOnly: false,
          enable(rowData) {
            return true;
          },
          handler: function(rowData) {
            this.updateHarborFlag = true;
            this.$nextTick(() => {
              this.$refs.UpdateHarbor.show();
            });
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
          handler: function(selectedRows) {
            this.$confirm(this.$t('lang.ifDeleteData'), this.$t('lang.confirm'), {
              confirmButtonText:this.$t('lang.confirm'),
              cancelButtonText:this.$t('lang.cancel'),
              type:'warning'
            }).then(() => {
              this.$sequence({
                type:'delete',
                url:'api/cetus/v1/harbor/{id}',
                params:selectedRows,
                log:{
                  description:{
                    en:"Delete container image server:{name}",
                    zh_cn:"删除容器镜像私服:{name}"
                  },
                  target:Vue.logTarget.containerImage
                },
                successMsg:this.$t('container.deleteSuccessMsg'),
                successFun:() => {
                  this.getData();
                },
                errFun:() => {
                  this.getData();
                }
              })
            }).catch(() => {
            });
          }.bind(this)
        }]
      };
    },
    beforeDestroy() {
      if (this.reloadTabelInterval != null) {
        clearInterval(this.reloadTabelInterval);
      }
    },
    watch: {
      columnsChecked: {
        handler: function (rows, oldVal) {
         this.columnsChecked = rows;
        },
        deep: true
      },
      tableData: {
        immediate: false,
        handler: function(dataList) {
          let self = this;
          self.reloadTblFlag = false;
          if (dataList != null) {
            for (let t = 0; t < dataList.length; t++) {
              let data = dataList[t];
              if (data['status'] == "ADDING" || data['status'] == "UPDATING") {
                self.reloadTblFlag = true;
                break;
              }
            }
          }
          clearInterval(self.reloadTabelInterval);

          if (self.reloadTblFlag && !self._isDestroyed) {
            self.reloadTabelInterval = setInterval(() => {
              this.getData(this.queryParam, false);
            }, 5000);
          }
        }
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
      dateFormatter(date) {
        if (date) {
          let dateJson = new Date(date).toJSON();
          let newDate = moment(+new Date(dateJson) + 8*3600*1000).format("YYYY-MM-DD HH:mm:ss");
          return newDate;
        } else {
          return "";
        }
      },
      async getData(param, isClear = true) {
        var self = this;
        self.loading = false;
        if (isClear) {
          // 是否清空选中
          self.$nextTick(() => {
            self.$refs.table.clearSelection();
          });
        }
        var data = {};
        data = Object.assign({}, this.queryParam, param);
        try {
          data = JSON.stringify(data);
          let ajaxParam = {
            type: 'post',
            url: "api/cetus/v1/harbor/index",
            data:data
          };
          let ret = await this.$ajax(ajaxParam);
          self.loading = false;
          let dataList = ret.result;
          // 查询过滤
          self.totalData = self.filterList(dataList);
          self.total = self.totalData.length;
          // 排序
          self.totalData.sort(this.$sortFormatter(self.queryParam.key, self.queryParam.keyOrder));
        } catch (data) {
          self.loading = false;
        }
      },
      filterList(allData) {
        let self = this;
        let nameFilteredData = [];
        if (self.searchBarValidatedParams.name == undefined || self.searchBarValidatedParams.name == "") {
          nameFilteredData = allData;
        } else {
          allData.forEach(function(obj) {
            if (obj.name.indexOf(self.searchBarValidatedParams.name) > -1) {
              nameFilteredData.push(obj);
            }
          });
        }
        let ipFilteredData = [];
        if (self.searchBarValidatedParams.ip == undefined || self.searchBarValidatedParams.ip == "") {
          ipFilteredData = nameFilteredData;
        } else {
          nameFilteredData.forEach(function(obj) {
            if (obj.ip.indexOf(self.searchBarValidatedParams.ip) > -1) {
              ipFilteredData.push(obj);
            }
          });
        }
        return ipFilteredData;
      },
      handleSearch(params) {
        this.searchBarValidatedParams = params;
        this.objStorFlag = true;
        this.getData();
      },
      statusTagRender(value) {
        let tagType = "";
        if (value === "OK") {
          tagType = "success";
        } else if (value === "ADDING" || value === "UPDATING") {
          tagType = "info";
        } else if (value === "HARBOR_SERVER_ERROR" ||
          value === "AUTH_ERROR" || value === "IP_PORT_ERROR") {
          tagType = "danger";
        }
        return tagType;
      },
      statusRender(value, rowData) {
        let status = "";
        if (value === "OK") {
          status = this.$t('container.ok');
        } else if (value === "ADDING") {
          status = this.$t('container.creating');
        } else if (value === "UPDATING") {
          status = this.$t('container.updating');
        } else if (value === "HARBOR_SERVER_ERROR") {
          status = this.$t('container.serverError');
        } else if (value === "AUTH_ERROR") {
          status = this.$t('container.authError');
        } else if (value === "IP_PORT_ERROR") {
          status = this.$t('container.ipPortError');
        }
        return status;
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
        var self = this;
        var key = column.prop;
        var keyOrder = column.order;
        self.queryParam.key = column.prop;
        self.queryParam.keyOrder = column.order;
        if (keyOrder != null && self.totalData != null) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder));
        }
      },
      rowClick(row) {
        this.$refs.table.toggleRowSelection(row);
      },
      //刷新
      onRefresh() {
        this.getData(this.queryParam, true);
      },
      rowNameClick(rowData) {
        let serverAddr = rowData.ip + ":" + rowData.port;
        this.$router.push({
          path:"/container/containerImages/imageGroup/"+rowData["id"] +"/" + serverAddr
        });
      },
      handleAddShow() {
        this.createHarborFlag = false;
        this.updateHarborFlag = false;
      }
    }
  };
</script>

