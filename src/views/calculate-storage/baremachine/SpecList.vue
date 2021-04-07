<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="acTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="id" :default-sort="{prop: 'name', order: 'ascending'}" @selection-change="handleSelectionChange"  @sort-change="sortChange">
      <el-table-column type="expand" align="center" width="55">
        <template slot-slot-scope="props" slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item>
               <metadata-detail :flavorId="scope.row.id"></metadata-detail>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column reserve-selection type="selection" width="55" align="center">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" min-width="80" sortable="custom">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('vcpus') >= 0" prop="vcpus" :label="$t('calcStorLang.cpuCore')" min-width="50" sortable="custom">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('ram') >= 0" prop="ram" :label="$t('calcStorLang.memGB')" min-width="50" sortable="custom">
      <template slot-scope="scope">
          <span v-html="ramRender(scope.row.ram, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('disk') >= 0" prop="disk" :label="$t('calcStorLang.ROOT_DISK') + '(GB)'" min-width="50" sortable="custom">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('public') >= 0" prop="os-flavor-access:is_public" :label="$t('calcStorLang.isPublic')" min-width="50" sortable="custom">
        <template slot-scope="scope">
          <span v-html="statusRender(scope.row.public, scope.row)"></span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}} {{$tc("lang.item", multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page ref="pageComponent" :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
        </el-col>
      </el-row>
    </div>
    <add-spec v-if="resSpecFlag" @handleShow="handleShow" @getTestData="getTestData" @onRefresh="onRefresh" :resOperType="resOperType" :specUuid="specUuid"></add-spec>
  </div>
</template>
<script>
import AddSpec from './AddSpec';
import MetadataDetail from './MetadataDetail'
export default {
  name: 'DomainManagement',
  components: { AddSpec, MetadataDetail },
  data() {
    return {
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      total: 0,
      pageSizes: [10, 20, 30],
      pageSize: 10,
      resSpecFlag: false,
      resOperType: '1', // 1 添加 2 编辑
      specUuid: '',
      flavorName:'',
      currentPage: 1,
      showBorder: true,
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "vcpus",
        label: Vue.t('calcStorLang.cpuCore')
      }, {
        prop: "ram",
        label: Vue.t('calcStorLang.memGB')
      }, {
        prop: "disk",
        label: Vue.t('calcStorLang.ROOT_DISK') + '(GB)'
      }, {
        prop: "public",
        label: Vue.t('calcStorLang.isPublic')
      }],
      loading: true,
      columnsChecked: ['name', 'vcpus', 'ram', 'disk', 'public'],
      tableData: [],
      totalData:[],
      multipleSelection: [],
      operationMenus: [{
          icon: "fa-plus",
          name: Vue.t("calcStorLang.create"),
          showflg: true,
          readOnly: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            this.resSpecFlag = true;
            this.resOperType = 1;
          }.bind(this)
        }, {
          icon: "fa-times",
          name: Vue.t("calcStorLang.deleted"),
          showflg: true,
          multi: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            var self = this;
            self.$sequence({
              type: 'delete',
              url: 'api/nova/v2.1/flavors/{id}',
              params: selectRows,
              confirmMsg: Vue.t("lang.confirm") + Vue.t("calcStorLang.deleted") + Vue.t("calcStorLang.bareSpec") + "？",
              successMsg: self.$t('calcStorLang.deleteSuccess'),
              log: {
                description: {
                  en: "Delete bare flavor",
                  zh_cn: "删除裸机规格"
                },
                key: "name",
                target: Vue.logTarget.bareMachineSpec
              }
            }).then((data) => {
              self.$refs.acTable.clearSelection();
              self.getTestData();
            }).catch((err) => {
              console.log(err);
            });
          }.bind(this)
        }
      ],
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
    this.getTestData();
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
    sortChange(column) {
       var self = this;
       var key = column.prop;
       if (!key) { return; }
       if (key == "name") {
         self.sortObj = {
           sortOrder:column.order,
           sortField:column.prop
         };
       } else {
         self.sortObj = {
           sortOrder:column.order,
           sortField:column.prop,
           sortType: "number"
         };
       }
    },
    async getTestData() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          data: {"is_public": true},
          url: 'api/nova/v2.1/flavors/detail',
          showErrMsg: true
        });
        let result1 = await self.$ajax({
          type: 'get',
          data: {"is_public": false},
          url: 'api/nova/v2.1/flavors/detail',
          showErrMsg: true
        });
        self.loading = false;
        var dataResult = result['flavors'];
        var dataResult1 = [];
        for (let i = 0; i < dataResult.length; i++) {
          if (dataResult[i]['os-flavor-access:is_public'] == true) {
            dataResult1.push(dataResult[i]);
          }
        }
        var middleData1 = dataResult1.concat(result1['flavors']);
        var middleData = [];
        for (let i in middleData1) {
          if (middleData1[i].name.indexOf("Bare@") >= 0) {
            middleData.push(middleData1[i]);
          }
        }
        let queryName = '';
        if (self.searchBar.validatedParams.name) {
          queryName = self.searchBar.validatedParams.name.toLowerCase();
        }
        self.totalData = [];
        let totalData = [];
        for (let i = middleData.length - 1; i >= 0; i--) {
          if (middleData[i].name.toLowerCase().indexOf(queryName) >= 0) {
            totalData.push(middleData[i]);
          }
        }
        self.totalData = totalData;
      } catch (res) {
        self.loading = false;
        self.$message.error(self.$t('calcStorLang.getError'));
      }
    },
    memoryRender(value, row) {
      return value / 1024;
    },
    statusRender(value, row) {
      if ("false" == (row['os-flavor-access:is_public'] + "")) {
        return Vue.t("lang.no");
      } else {
        return Vue.t("lang.yes");
      }
    },
    ramRender(value, row) {
      return value/1024;
    },
    queryClick() {
      var self = this;
      self.getTestData();
      self.$refs.acTable.clearSelection();
    },
    handleShow() {
      this.resSpecFlag = false;
    },
    handleShareShow() {
      this.specShareFlag = false;
    },
    handleQosShow() {
      this.qosFlag = false;
    },
    handleMetaShow() {
      this.metadataFlag = false;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.$refs.acTable.clearSelection();
      this.getTestData();
    },
    getCurrentData(param) {
        this.tableData = param;
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.$refs.acTable.clearSelection();
      this.getTestData();
      this.$refs.pageComponent.setCurrentPage(1);
    }
  }
}

</script>
<style scoped>


</style>
