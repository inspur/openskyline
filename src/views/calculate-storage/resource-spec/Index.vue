<template>
  <div>
    <icos-page-header :title="$t('calcStorLang.resourcespec')" />
    <icos-page>
      <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" @search="handleSearch" />
      <div class="divider clearfix"></div>
      <div class="operation-panel">
        <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
        </operation-panel>
      </div>
      <div class="divider clearfix"></div>
      <el-table ref="acTable" :data="tableData" v-loading="loading" highlight-current-row stripe border style="width: 100%" row-key="id" :default-sort="{prop: 'name', order: 'ascending'}" @selection-change="handleSelectionChange"  @sort-change="sortChange">
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
        <el-table-column v-if="columnsChecked.indexOf('id') >= 0" label="ID" prop="id" min-width="80">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('vcpus') >= 0" prop="vcpus" :label="$t('calcStorLang.cpuCore')" min-width="50" sortable="custom">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('ram') >= 0" prop="ram" :label="$t('calcStorLang.memGB')" min-width="50" sortable="custom">
        <template slot-scope="scope">
            <span v-html="ramRender(scope.row.ram, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('disk') >= 0" prop="disk" :label="$t('calcStorLang.diskGB')" min-width="50" sortable="custom">
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
            <span>{{$t('lang.currentSelected') + multipleSelection.length + " " + $tc('lang.item', multipleSelection.length)}}</span>
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
            <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
          </el-col>
        </el-row>
      </div>
      <add-spec v-if="resSpecFlag" @handleShow="handleShow" @getData="getData" @onRefresh="onRefresh" :resOperType="resOperType" :specUuid="specUuid"></add-spec>
      <res-spec-share ref="specShare" :specUuid="specUuid" :flavorName="flavorName" v-if="specShareFlag" @handleShareShow="handleShareShow"></res-spec-share>
      <qos v-if="qosFlag" @handleQosShow="handleQosShow" @getData="getData" :flavorId="specUuid" :flavorName="flavorName"></qos>
      <metadata v-if="metadataFlag" @handleMetaShow="handleMetaShow" :flavor="selectedFlavor" @getData="getData"></metadata>
    </icos-page>
  </div>
</template>
<script>
import AddSpec from './AddSpec';
import ResSpecShare from './ResSpecShare';
import Qos from './QosManage';
import Metadata from './RefreshMetadata';
import MetadataDetail from './MetadataDetail'
export default {
  name: 'ResourceSpecList',
  components: { AddSpec, ResSpecShare, Qos, Metadata, MetadataDetail },
  data() {
    return {
      formInline: '',
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      query_name: "",
      total: 0,
      pageSizes: [10, 20, 30],
      pageSize: 10,
      resSpecFlag: false,
      specShareFlag: false,
      qosFlag: false,
      metadataFlag: false,
      resOperType: '1', // 1 添加 2 编辑
      specUuid: '',
      flavorName:'',
      selectedFlavor: {},
      currentPage: 1,
      showBorder: true,
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "id",
        label: "ID"
      }, {
        prop: "vcpus",
        label: Vue.t('calcStorLang.cpuCore')
      }, {
        prop: "ram",
        label: Vue.t('calcStorLang.memGB')
      }, {
        prop: "disk",
        label: Vue.t('calcStorLang.diskGB')
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
          name: Vue.t('calcStorLang.create'),
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
          name: Vue.t('base.delete'),
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
              confirmMsg: Vue.t('calcStorLang.deleteConfirmComm') + Vue.t('calcStorLang.resourceSpec') + "？",
              successMsg: Vue.t('calcStorLang.deleteSuccess'),
              log: {
                description: {
                  en: "Delete flavor",
                  zh_cn: "删除资源规格"
                },
                key: "name",
                target: Vue.logTarget.computeSpec
              }
            }).then((data) => {
              self.$refs.acTable.clearSelection();
              self.getData();
            }).catch((err) => {
              self.$refs.acTable.clearSelection();
              self.getData();
            });
          }.bind(this)
        }, {
          icon: "fa-cogs",
          name: Vue.t('calcStorLang.specShare'),
          showflg: true,
          multi: false,
          enable(rowData) {
            return !rowData['os-flavor-access:is_public'];
          },
          handler: function(selectRows) {
            this.specUuid = selectRows[0].id;
            this.flavorName = selectRows[0].name;
            this.specShareFlag = true;
            this.$nextTick(() => {
            this.$refs.specShare.show();
          });
          }.bind(this)
        }, {
          icon: "fa-cog",
          name: "QoS",
          showflg: true,
          multi: false,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            this.qosFlag = true;
            this.specUuid = selectRows[0].id;
            this.flavorName = selectRows[0].name;
          }.bind(this)
        }, {
          icon: "fa-refresh",
          name: Vue.t('calcStorLang.updateMedata'),
          showflg: true,
          multi: false,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            this.selectedFlavor = selectRows[0];
            this.metadataFlag = true;
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
    this.getData();
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
    async getData() {
      var self = this;
      let name = 'name' in self.searchBar.validatedParams ? self.searchBar.validatedParams.name.toLowerCase() : '';
      try {
        self.loading = true;
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
        var middleData2 = dataResult1.concat(result1['flavors']);
        var middleData = [];
        for (let i = middleData2.length - 1; i >= 0; i--) {
          if (middleData2[i].name.indexOf("Bare@") < 0) {
            middleData.push(middleData2[i]);
          }
        }
        self.totalData = [];
        for (let i = middleData.length - 1; i >= 0; i--) {
          if (middleData[i].name.toLowerCase().indexOf(name) >= 0) {
            self.totalData.push(middleData[i]);
          }
        }
      } catch (res) {
        self.loading = false;
        self.$message.error(Vue.t('calcStorLang.getError'));
      }
    },
    memoryRender(value, row) {
      return value / 1024;
    },
    statusRender(value, row) {
      if ("false" == (row['os-flavor-access:is_public'] + "")) {
        return Vue.t('lang.no');
      } else {
        return Vue.t('lang.yes');
      }
    },
    ramRender(value, row) {
      return value/1024;
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
      // if (val != null) {
      //   var list = [];
      //   list.push(val);
      //   this.multipleSelection = list;
      // }
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.acTable.toggleRowSelection(row, false);
      // })
      this.multipleSelection = val;
    },
    onRefresh() {
      this.query_name = '';
      this.$refs.acTable.clearSelection();
      this.multipleSelection = [];
      this.getData();
    },
    getCurrentData(param) {
        this.tableData = param;
    },
    handleSearch(params) {
      const $this = this;
      this.searchBar.validatedParams = params;
      $this.getData();
      $this.$refs.acTable.clearSelection();
    }
  }
}

</script>
<style scoped>


</style>
