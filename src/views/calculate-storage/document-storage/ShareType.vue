<template>
<div>
  <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" :advanced-disabled="true"/>
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
    highlight-current-row
    border
    stripe
    style="width: 100%;"
    slot="empty"
    row-key="id"
    :default-sort="{prop: 'name', order: 'descending'}"
    @selection-change="handleSelectionChange" @sort-change="sortChange">
    <el-table-column
      reserve-selection
      type="selection"
      align="center"
      width="55">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('id') >= 0"
      prop="id"
      align="left"
      label="ID"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
      prop="name"
      :label="$t('lang.name')"
      align="left"
      sortable="custom"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('public') >= 0"
      prop="public"
      align="left"
      :label="$t('storage.public')"
      min-width="100">
      <template slot-scope="scope">
        <span v-html="shareIsPublic(scope.row['os-share-type-access:is_public'], scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('extraspecs') >= 0"
      prop="extraspecs"
      align="left"
      :label="$t('storage.extraSpecs')"
      min-width="100">
      <template slot-scope="scope">
        <span v-html="showExtraspecs(scope.row['extra_specs'], scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('desc') >= 0"
      prop="desc"
      align="left"
      :label="$t('lang.desc')"
      min-width="100">
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh">
        </el-button>
          <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc("lang.item", multipleSelection.length)}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
      </el-col>
      <el-col :span="19">
        <page :totalData="totalData"  @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
      </el-col>
    </el-row>
    <create-share-type ref="createShareType" v-if="createShareTypeFlg" @addData="addData" @handleShow="handleShowCreate"></create-share-type>
    <edit-share-type ref="editShareType" v-if="editShareTypeFlg" :shareTypeData="editSTData" @freshData="addData" @handleClose="handleCloseEdit"></edit-share-type>
    <edit-share-type-new ref="editShareTypeNew" v-if="editShareTypeNewFlg" :shareTypeData="editSTData" @freshData="addData" @handleClose="handleCloseEdit"></edit-share-type-new>
  </div>
 </div>
</template>
<script>
import CreateShareType from './CreateShareType'
import EditShareType from './EditShareType'
import EditShareTypeNew from './EditShareTypeNew'
  export default {
  name: "DocStor",
  data() {
    return {
      sortObj:{
        sortOrder:"descending",
        sortField:"name"
      },
      searchBar: {
        conditions: {
          query_name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumber'));
              }
            }
          }
        }
      },
      searchBarValidatedParams: {},
      createShareTypeFlg:false,
      editShareTypeFlg:false,
      editShareTypeNewFlg:false,
      editSTData:'',
      query_name: '',
      multipleSelection:[],
      extraspecsList:["create_share_from_snapshot_support", "revert_to_snapshot_support", "mount_snapshot_support", "snapshot_support", "driver_handles_share_servers", "share_backend_name"],
      operationMenus:[{
        icon: "fa-plus",
        name: this.$t('storage.create'),
        showflg: true,
        readOnly: true,
         handler: function(selectRows) {
          let me = this;
          me.createShareTypeFlg = true;
          me.$nextTick(() => {
            me.$refs.createShareType.show();
          });
        }.bind(this)
      }, {
        icon: "fa-arrows",
        name: this.$t('storage.manageExpandSpec'),
        showflg: true,
        enable(rowData) {
          return true;
        },
         handler: function(selectRows) {
          let me = this;
          me.editSTData = selectRows[0];
          //me.editShareTypeFlg = true;
          me.editShareTypeNewFlg = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('lang.delete'),
        multi: true,
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          let self = this;
          this.$confirm(this.$t('lang.ifDeleteData'), this.$t('lang.confirm'), {
            confirmButtonText:this.$t('lang.confirm'),
            cancelButtonText:this.$t('lang.cancel'),
            type:'warning'
          }).then(async () => {
            self.$sequence({
              type: 'delete',
              url: 'api/manila/v2/' + this.$cookie.get('pid') + "/types/{id}",
              params: selectRows,
              // successMsg: this.$t('lang.sendDeleteSuccess'),
              errorKey: "badRequest",
              log:{
                description:{
                  en:"Delete share type{name}({id})",
                  zh_cn:"删除文件存储类型{name}({id})"
                },
                target:Vue.logTarget.storage_share_type
              },
              successFun: function() {
                self.loading = true;
                self.$refs.shTable.clearSelection();
                self.currentPage = 1;
                setTimeout( function() {
                  self.loadData();
                  self.loading = false;
                }, 5000);
              }
            }).then((data) => {
              self.$message(Vue.t("lang.sendDeleteSuccess"));
            }).catch((err) => {});
          }).catch(() => {
            //取消
          });
        }.bind(this)
      }],
      tableData:[],
      totalData:[],
      listPara:{
        page:1,
        pageSize:10
      },
      loading:false,
      columnsChecked:["name", "public", "extraspecs"],
      columns:[{
        prop:"id",
        label:"ID"
      }, {
        prop:"name",
        label:this.$t('lang.name')
      }, {
        prop:"public",
        label:this.$t('storage.public')
      }, {
        prop:"extraspecs",
        label:this.$t('storage.extraSpecs')
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
    sortChange(column) {
       let self = this;
       if (!column.prop) { return; }
       self.sortObj = {
         sortOrder:column.order,
         sortField:column.prop
       };
    },
    async loadData() {
      this.$refs.shTable.clearSelection()
      let me = this;
      let qName = this.searchBarValidatedParams.query_name;
      try {
        let result = await me.$ajax({
          type: 'get',
          url: "api/manila/v2/" + this.$cookie.get("pid") + "/types",
          showErrMsg: false
        });
        if (qName) {
          me.totalData = [];
          for (let i = result['share_types'].length - 1; i >= 0; i--) {
            if (result['share_types'][i].name.indexOf(qName) >= 0) {
              me.totalData.push(result['share_types'][i]);
            }
          }
        } else {
          me.totalData = result['share_types'];
        }
      } catch (res) {
      }
    },
    handleSearch(params) {
      this.searchBarValidatedParams = params;
      this.loadData();
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
    handleShowCreate() {
      this.createShareTypeFlg = false;
    },
    handleCloseEdit() {
      let self = this;
      this.editShareTypeFlg = false;
      this.editShareTypeNewFlg = false;
      setTimeout( function() {
        self.addData();
                }, 3000);
    },
    getCurrentData(param) {
        this.tableData = param;
    },
    addData() {
      this.onRefresh();
    },
    shareIsPublic(value, rowData) {
      let dataPub = rowData['share_type_access:is_public'];
      if (true == dataPub) {
        return this.$t('storage.yes');
      } else {
        return this.$t('storage.no');
      }
    },
    showExtraspecs(value, rowData) {
      let temp = "";
      let temp1= "";
      if (value.share_backend_name) {
        temp1 = `${this.getI18n('share_backend_name')}=${value.share_backend_name}`;
      }
      for (let key in value) {
        let tempValue = value[key];
        //过滤掉值为false的内置规格，自定义规格不过滤。
        if (this.extraspecsList.indexOf(key) > -1 && tempValue && tempValue.toString().toLowerCase() === "false") {
          continue;
        }
        if (key === "share_backend_name") {
          continue;
        }
        let i18nValue = this.getI18n(key);
        temp = temp+ `<li>${i18nValue}=${tempValue}</li>`;
      }
      return temp1 + `<ul style="list-style-type: disc; list-style-position: inside;">` + temp + `</ul>`;
    },
    getI18n(key) {
      if (key) {
          const I18N_FILE_NAME ="storage.";
          let i18nVal =this.$t(I18N_FILE_NAME + key);
          if (i18nVal != I18N_FILE_NAME + key) {
            key = i18nVal;
          }
      }
      return key;
    }
  },
  components: {
    CreateShareType, EditShareType, EditShareTypeNew
  }
}
</script>
