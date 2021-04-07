<template>
  <div>
  <icos-page>
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" :advanced-disabled="true"/>
    <div class="divider clearfix" v-if="roleType!='0'"></div>
    <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus" v-if="roleType!='0'"></operation-panel>
    <div class="divider clearfix"></div>
    <el-table ref="table" :data="tableData" v-loading="loading" :element-loading-text="$t('lang.loading')" highlight-current-row
      stripe :default-sort = "{prop: 'name', order: 'ascending'}" row-key="id"
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
          <el-button @click="rowNameClick(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
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
    <!-- <el-table-column
        v-if="columnsChecked.indexOf('username') >= 0"
        prop="username"
        :label="$t('base.user')"
        show-overflow-tooltip
        align="left"
        min-width="100">
    </el-table-column>
    <el-table-column
        v-if="columnsChecked.indexOf('tags') >= 0"
        prop="tags"
        :label="$t('container.tags')"
        show-overflow-tooltip
        align="left"
        min-width="100">
      <template slot-scope="scope">
        <span v-html="tagsRender(scope.row.tags)"></span>
      </template>
    </el-table-column> -->
    <el-table-column
        v-if="columnsChecked.indexOf('created') >= 0"
        prop="created"
        :label="$t('lang.createTime')"
        show-overflow-tooltip
        align="left"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
        <span>{{dateFormatter(scope.row.created)}}</span>
        </template>
    </el-table-column>
    <el-table-column
        v-if="columnsChecked.indexOf('updated') >= 0"
        prop="updated"
        :label="$t('lang.modifyTime')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
        <span>{{dateFormatter(scope.row.updated)}}</span>
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

    <register-image ref="CreateHarbor" v-if="createImageFlag" @handleAddShow="handleAddShow" @refreshData="getData"></register-image>
    <!-- <update-harbor ref="UpdateHarbor" v-if="updateHarborFlag" @handleAddShow="handleAddShow" :selectedRowData="multipleSelection[0]" @refreshData="getData"></update-harbor> -->
  </icos-page>
  </div>
</template>
<script>
  import RegisterImage from "./RegisterImage"
//   import UpdateHarbor from "./UpdateHarbor"
  import moment from "moment"
  export default {
    name: 'ImageList',
    components: {
      RegisterImage
    },
    data () {
      return {
        projectId:"",
        roleType:Vue.roleType,
        createImageFlag:false,
        updateHarborFlag:false,
        reloadTblFlag:false,
        objStorFlag: true,
        total: 0,
        columns: [],
        columnsChecked:["name", "status", "created", "updated", "description"],
        tableData: [],
        totalData:[],
        multipleSelection: [],
        queryParam: {
          filed: "",
          dir: ""
        },
        searchBar: {
          conditions: {
            name: {
              label: this.$t("lang.name"),
              type: "input",
              validator: (value) => {
                if (!/^[_\-0-9a-zA-Z]+$/.test(value)) {
                  throw new Error(
                    this.$t("validation.onlyLetter_MinusNumber")
                  );
                }
              }
            }
          }
        },
        searchBarValidatedParams: {},
        loading: false,
        operationMenus: [{
          icon: "fa-plus",
          name: this.$t('cloudData.registerImage'),
          showflg: true,
          readOnly: true,
          handler: function() {
            this.createImageFlag = true;
            this.$nextTick(() => {
              this.$refs.CreateHarbor.show();
            });
          }.bind(this)
        }, {
          icon: "fa-remove",
          name: this.$t('cloudData.destroyImage'),
          showflg: true,
          readOnly: false,
          multi:true,
          enable(rowData) {
            return true;
          },
          handler: function(selectedRows) {
            this.$confirm(this.$t('cloudData.REMOVE_IMAGE_CONFIRM'), this.$t('lang.confirm'), {
              confirmButtonText:this.$t('lang.confirm'),
              cancelButtonText:this.$t('lang.cancel'),
              type:'warning'
            }).then(() => {
              this.$sequence({
                type:'delete',
                url:'api/sahara/v2/images/{id}',
                params:selectedRows,
                log:{
                  description:{
                    en:"Delete image:{name}",
                    zh_cn:"移除镜像:{name}"
                  },
                  target:Vue.logTarget.saharaImage
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
      async getData(isClear = true) {
        let self = this;
        self.loading = false;
        if (isClear) {
          // 是否清空选中
          self.$nextTick(() => {
            self.$refs.table.clearSelection();
          });
        }
        try {
          self.projectId = this.$cookie.get('pid');
          let ajaxParam = {
            type: 'GET',
            url: "api/sahara/v2/"+self.projectId+"/images"
          };
          let ret = await this.$ajax(ajaxParam);
          self.loading = false;
          let dataList = ret.images;
          self.totalData = this.filterFun(dataList);
        } catch (data) {
          self.loading = false;
        }
      },
      filterFun(allData) {
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
        return nameFilteredData;
      },
      handleSearch(params) {
        this.searchBarValidatedParams = params;
        this.getData();
      },
      statusTagRender(value) {
        let tagType = "";
        if (value === "ACTIVE") {
          tagType = "success";
        } else if (value === "ADDING" || value === "UPDATING") {
          tagType = "info";
        } else if (value === "HARBOR_SERVER_ERROR" ||
          value === "AUTH_ERROR" || value === "IP_PORT_ERROR") {
          tagType = "danger";
        } else {
          tagType = "info";
        }
        return tagType;
      },
      statusRender(value, rowData) {
        let status = value;
        if (value === "ACTIVE") {
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
      handleAddShow() {
        this.createImageFlag = false;
        this.updateHarborFlag = false;
      },
      dateFormatter(date) {
        if (date) {
          let dateJson = new Date(date).toJSON();
          let newDate = moment(+new Date(dateJson) + 8*3600*1000).format("YYYY-MM-DD HH:mm:ss");
          return newDate;
        } else {
          return "";
        }
      },
      tagsRender(tags) {
        let t = "";
        if (Array.isArray(tags)) {
          for (let i=0; i<tags.length; i++) {
            if (i!=tags.length-1) {
              t+= tags[i]+",";
            } else {
              t+= tags[i];
            }
          }
        } else {
          t = tags;
        }
        return t;
      },
      rowNameClick(rowData) {
        let detailRowDataId = rowData["id"];
        this.$router.push({
          path:"/clouddata/image/" + detailRowDataId +"/imageDetail"
        });
      }
    }
  };
</script>

