<template>
  <div class="host-ag">
    <el-alert :title="$t('calcStorLang.hostManageTip')" :closable="false" style="margin-bottom: 15px; background-color: #d2dbe2; color: #666666;" />
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="umTable" :data="tableData" v-loading="loading" highlight-current-row stripe border style="width: 100%" row-key="id" :default-sort="{prop: 'name'}" @selection-change="handleSelectionChange" @sort-change="sortChange">
      <el-table-column reserve-selection type="selection" width="55" align="center"></el-table-column>
      <el-table-column sortable v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" min-width="80">
      </el-table-column>
       <el-table-column v-if="columnsChecked.indexOf('id') >= 0" label="ID" prop="id" min-width="80">
      </el-table-column>
      <el-table-column sortable="custom" v-if="columnsChecked.indexOf('domain') >= 0" prop="availability_zone" :label="$t('calcStorLang.az')" min-width="120">
      <template slot-scope="scope">
        <span v-html="emptyRender(scope.row.availability_zone, scope.row)"></span>
      </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('metadata') >= 0" :label="$t('calcStorLang.metadata')" prop="metadata">
      <template slot-scope="scope">
        <span v-html="metadataRender(scope.row.metadata, scope.row)"></span>
      </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="false" sortable v-if="columnsChecked.indexOf('host') >= 0" :label="$t('calcStorLang.host')" prop="hosts" min-width="120">
        <template slot-scope="scope">
          <div v-if="scope.row.hosts == null">-</div>
          <div v-if="scope.row.hosts != null" class="hosts-expanded-button-area">
            <el-button v-if="!scope.row.expanded" type="text" icon="fa-angle-double-down" @click="scope.row.expanded = true;"></el-button>
            <el-button v-else type="text" icon="fa-angle-double-up" @click="scope.row.expanded = false;"></el-button>
          </div>
          <div v-if="scope.row.hosts != null" :class="{ 'hosts-collapsed': !scope.row.expanded, 'hosts-expanded': scope.row.expanded }">
            <el-tag type="primary" style="margin-right: 5px;" v-for="host in scope.row.hosts" :key="host" :close-transition="true">{{ host }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column v-if="columnsChecked.indexOf('date') >= 0" prop="date" label="时间" min-width="80">
      </el-table-column> -->
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('lang.currentSelected') + multipleSelection.length + " " + $tc("lang.item", multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
           <page :totalData="totalData" @getCurrentData="getCurrentData" :objStorFlag="currentPageReset"></page>
        </el-col>
      </el-row>
    </div>
    <availability-zones ref="az"></availability-zones>
    <add-host v-if="hostFlag" @handleShow="handleShow" @getData="getData" @reaz="reaz" :addedHosts="addedHosts"></add-host>
    <edit-host v-if="editHostFlag" @editHandleShow="editHandleShow" @getData="getData" :hostName="hostName" :hostDomain="hostDomain" :id="editId" @reaz="reaz"></edit-host>
    <manage-host v-if="manageHostFlag" :oldhosts="oldhosts" :id="editId" :hostName="hostName" @reaz="reaz" :addedHosts="addedHosts" @manHandleShow="manHandleShow" @getData="getData"></manage-host>
    <metadata v-if="metadataFlag" @handleMetaShow="handleMetaShow" :metadata="metadata" :id="editId"  @getData="getData" :hostName="hostName" @reaz="reaz"></metadata>
  </div>
</template>
<script>
import AvailabilityZones from '../../AvailabilityZones';
import AddHost from './AddHost';
import Metadata from './RefreshMetadata';
import EditHost from './EditHost';
import ManageHost from './ManageHost';
const _ = require('underscore');
export default {
  name: 'DomainManagement',
  components: { AddHost, EditHost, ManageHost, AvailabilityZones, Metadata },
  data() {
    return {
      loading: true,
      formInline: '',
      hostFlag: false,
      editHostFlag: false,
      manageHostFlag: false,
      metadataFlag:false,
      hostName: '',
      hostDomain: '',
      editId:"",
      currentPage: 1,
      currentPageReset: false,
      showBorder: true,
      totalData:[],
      addedHosts:[],
      oldhosts:[],
      metadata:"",
      expanded: false,
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "id",
        label: "ID"
      }, {
        prop: "domain",
        label: Vue.t('calcStorLang.az')
      }, {
        prop: "metadata",
        label: Vue.t('calcStorLang.metadata')
      }, {
        prop: "host",
        label: Vue.t('calcStorLang.host')
      }],
      columnsChecked: ['name', 'id', 'domain', 'host', 'metadata'],
      tableData: [],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('calcStorLang.create'),
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.hostFlag = true;
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: Vue.t('lang.edit'),
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.editHostFlag = true;
          this.editId = selectRows[0].id;
          this.hostName = selectRows[0].name;
          this.hostDomain = selectRows[0].availability_zone;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          self.$sequence({
            type: 'delete',
            url: 'api/nova/v2.1/os-aggregates/{id}',
            params: selectRows,
            confirmMsg: Vue.t('calcStorLang.deleteHostaggregationConfirm'),
            successMsg: Vue.t('calcStorLang.deleteSuccess'),
            log: {
               description: {
                en: "Delete host aggregation",
                zh_cn: "删除主机聚合组"
                },
               key: "name",
               target: Vue.logTarget.hostaggregation
            },
            successFun:function() {
              self.$refs.umTable.clearSelection();
              self.currentPage = 1;
              self.getData({
                page: 1
              });
            }
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
        icon: "fa-cogs",
        name: Vue.t('calcStorLang.manageHost'),
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.oldhosts = selectRows[0].hosts;
          this.editId = selectRows[0].id;
          this.hostName = selectRows[0].name;
          this.manageHostFlag = true;
        }.bind(this)
      }, {
        icon: "fa-refresh",
        name: Vue.t('calcStorLang.updateMedata'),
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.editId = selectRows[0].id;
          this.hostName = selectRows[0].name;
          this.metadataFlag = true;
          this.metadata = selectRows[0].metadata;
        }.bind(this)
      }],
      searchBar: {
        conditions: {
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          }
        },
        validatedParams: {}
      }
    };
  },
  computed: {},
  mounted() {
    this.getData(this.currentPage);
  },
  beforeRouteLeave(to, from, next) {
    next()
  },
  beforeRouteEnter(to, from, next) {
    next()
  },
  watch: {
    // 切换页面
    '$route' (to, from) {
      // 如果是当前页面切换分类的情况
    }
  },
  methods: {
    async getData(currentPageReset=false) {
      var self = this;
      let name = 'name' in self.searchBar.validatedParams ? self.searchBar.validatedParams.name : '';
      self.loading = true;
      self.$refs.umTable.clearSelection();
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-aggregates'
        });
        self.loading = false;
        var lengthOfhost = result['aggregates'].length;
        self.total = lengthOfhost > 0 ? lengthOfhost : 0;
        var arr = lengthOfhost > 0 ? result['aggregates'] : [];
        let totalData = [];
        self.addedHosts = [];
        for (let i=0; i < arr.length; i++) {
          self.addedHosts = self.addedHosts.concat(arr[i].hosts);
          if (arr[i].name.indexOf(name) < 0) {
            continue;
          }
          arr[i].expanded = false;
          totalData.push(arr[i]);
          arr[i].hosts = _.sortBy(arr[i].hosts, (item) => {
            return item.length;
          })
        }
        if (currentPageReset === true) {
          self.currentPageReset = true;
        }
        self.totalData = totalData;
        self.$nextTick(() => {
          self.currentPageReset = false;
        });
      } catch (res) {
        self.loading = false;
        __DEV__ && console.error(res);
      }
    },
    handleShow() {
      this.hostFlag = false;
    },
    editHandleShow() {
      this.editHostFlag = false;
    },
    manHandleShow() {
      this.manageHostFlag = false;
    },
    sortChange(column) {
       var self = this;
       var key = column.prop;
       var keyOrder = column.order;
       if (keyOrder != null && self.totalData != null) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder));
       }
    },
    reaz() {
      this.$refs.az.getData();
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    hostRender(value, row) {
      if ("" == value || null == value) {
        return "-";
      }
      // var r = [];
      let result = ``;
      for (var i in value) {
        result += `<el-tag type="primary">${value[i]}</el-tag>`
        // r.push(value[i]);
      }
      return result;
      // return r.join("<br/>");
    },
    metadataRender(value, row) {
      var mList = Object.keys(value).map(function(el) {
          return value[el];
      });
      if ("" == mList || null == mList) {
        return "-";
      }
      var r = [];
      for (var i in value) {
        r.push(i + ":" + value[i]);
      }
      return r.join("<br/>");
    },
    handleMetaShow() {
      this.metadataFlag = false;
    },
    handleCurrentChange(val) {
      this.tableData = this.getData(val);
      console.log(`当前页: ${val}`);
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.umTable.toggleRowSelection(row, false);
      // })
      this.multipleSelection = val;
    },
    emptyRender(value, rowData) {
      if ("" == value || null == value) {
        return "-";
      }
      return value;
    },
    getCurrentData(param) {
        this.tableData = param;
    },
    onRefresh() {
      this.getData();
    },
    handleSearch(params) {
      var self = this;
      this.searchBar.validatedParams = params;
      self.getData(true);
      self.$refs.umTable.clearSelection();
    }
  }
}

</script>

<style scoped>
.hosts-expanded-button-area {
  text-align: center;
  width: 20px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}
.hosts-expanded-button-area > button {
  width: 20px;
  height: 100%;
}
.hosts-collapsed {
  position: absolute;
  top: 5px;
  right: 26px;
  bottom: 5px;
  left: 6px;
  overflow: hidden;
}
.hosts-expanded {
  margin-right: 14px;
  max-height: 200px;
  overflow-y: auto;
}
/*.host-ag >>> .el-table__body tr:hover>td {
  background-color: #eef1f6;
  background-clip: padding-box;
}*/
</style>
