<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel" @mousedown="detailMouseDown">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="acTable" :data="tableData" v-loading="loading" highlight-current-row stripe border style="width: 100%" row-key="keypair.name" @selection-change="handleSelectionChange" :default-sort="{prop: 'name', order: 'ascending'}" @row-click="rowClick">
      <el-table-column reserve-selection type="selection" width="55" align="center">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" min-width="80">
        <template slot-scope="scope">
          <el-button @click="pairDetail(scope.row)" type="text" size="small">{{scope.row.keypair.name}}</el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('fingerprint') >= 0" prop="fingerprint" :label="$t('calcStorLang.fingerprint')" min-width="50">
        <template slot-scope="scope">
          <span v-html="fingerprintRender(scope.row.fingerprint, scope.row)"></span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('calcStorLang.currentSelect')}} {{multipleSelection.length}} {{$t('calcStorLang.bar')}}</span>
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
          <page :totalData="totalData" @getCurrentData="getCurrentData" :objStorFlag="currentPageReset"></page>
        </el-col>
      </el-row>
    </div>
    <add-key-pair v-if="keyPairFlag" @handleShow="handleShow" @getData="onRefresh" @handlerPriKeyShow="handlerPriKeyShow" :specUuid="specUuid"></add-key-pair>
    <private-key v-if="privateKeyFlag" :privateKeyValue="privateKeyValue" @handlerPriKeyShow2="handlerPriKeyShow2"></private-key>
    <transition name="slide-right" mode="out-in">
        <div style="width: 800px;" class="slide-panel" v-if="keyDetailFlag">
          <panel style="height: 100%">
            <div slot="title" class="clearfix">
              <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
            </div>
            <div>
              <key-detail :keyooPairName="keyPairName" ref="keyDetailPage"></key-detail>
            </div>
          </panel>
        </div>
      </transition>
  </div>
</template>
<script>
import AddKeyPair from './AddKeyPair';
import KeyDetail from './KeyDetail';
import PrivateKey from './PrivateKey';
export default {
  name: 'keyPair',
  components: { AddKeyPair, KeyDetail, PrivateKey },
  data() {
    return {
      formInline: '',
      total: 0,
      keyList: [],
      keyPairFlag: false,
      keyDetailFlag: false,
      privateKeyFlag: false,
      privateKeyValue: '',
      specUuid: '',
      currentPage: 1,
      showBorder: true,
      columns: [],
      loading: true,
      columnsChecked: ['name', 'fingerprint'],
      tableData: [],
      totalData: [],
      currentPageReset: false,
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name:  Vue.t('calcStorLang.create'),
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.keyPairFlag = true;
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
          var lists = [];
          for (let r = 0; r < selectRows.length; r++) {
             var obj = selectRows[r].keypair;
             lists.push(obj);
          }
          self.$sequence({
              type: 'delete',
              url: 'api/nova/v2.1/os-keypairs/{name}',
              params: lists,
              confirmMsg: Vue.t('calcStorLang.deleteConfirm'),
              log: {
                description: {
                  en: "Delete KeyPair",
                  zh_cn: Vue.t('calcStorLang.deleteKeyPair')
                },
                key: "name",
                target: Vue.logTarget.computeKeyPair
              }
            }).then((data) => {
              self.$message(Vue.t('calcStorLang.deleteKeyPairSuccess'));
              self.$refs.acTable.clearSelection();
              self.currentPage = 1;
              self.getData();
              self.loading = false;
            }).catch((err) => {});
        }.bind(this)
      }],
      searchBar: {
        conditions: {
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumber'));
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
    let acTable = this.$refs.acTable;
    acTable.$children.forEach((item, index) => {
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
    detailMouseDown() {
      var self = this;
      self.keyDetailFlag = false;
    },
    async getData(currentPageReset=false) {
      var self = this;
      self.loading = true;
      let param = { "limit": this.pageSize };
      try {
        let res = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-keypairs',
          showErrMsg: true
        });
        let name = 'name' in self.searchBar.validatedParams ? self.searchBar.validatedParams.name.toLowerCase() : '';
        let results = res.keypairs.filter(item => {
          return item.keypair.name.toLowerCase().indexOf(name) !== -1
        });
        if (currentPageReset === true) {
          self.currentPageReset = true;
        }
        self.totalData = results;
        self.$nextTick(() => {
          self.currentPageReset = false;
        });
        self.loading = false;
      } catch (res) {
        __DEV__ && console.error(res);
        self.loading = false;
      }
    },
    async deleteSpecs(row) {
      var self = this;
      var pairKeyName = row['keypair'].name
      try {
        let result = await this.$ajax({
          type: 'delete',
          url: 'api/nova/v2.1/os-keypairs/' + pairKeyName,
          confirmMsg: Vue.t('calcStorLang.deleteConfirm'),
          successMsg: Vue.t('calcStorLang.deleteKeyPairSuccess'),
          log: {
            description: {
              en: "Delete KeyPair:" + pairKeyName,
              zh_cn: Vue.t('calcStorLang.deleteKeyPair') + pairKeyName
            },
            target: Vue.logTarget.computeKeyPair
          }
        });
        self.$refs.acTable.clearSelection();
        self.getData();
      } catch (data) {
        __DEV__ && console.error(data);
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    nameRender(value, row) {
      return row['keypair'].name;
    },
    fingerprintRender(value, row) {
       return row['keypair'].fingerprint;
    },
    pairDetail(row) {
      this.keyDetailFlag = true;
      this.keyPairName = row['keypair'].name;
      this.$refs.acTable.clearSelection();
    },
    onBack() {
      this.keyDetailFlag = false;
    },
    handleShow() {
      this.keyPairFlag = false;
    },
    handlerDetailShow() {
      this.keyDetailFlag = false;
    },
    handlerPriKeyShow(value) {
      this.privateKeyValue = value;
      this.privateKeyFlag = true;
    },
    handlerPriKeyShow2() {
      this.privateKeyFlag = false;
    },
    rowClick(row) {
      this.selectTblRow = row;
      this.$refs.acTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      /*val.forEach((row, index) => {
        if (index === val.length - 1) return;
        this.$refs.acTable.toggleRowSelection(row, false);
      })*/
      this.multipleSelection = val;
    },
    onRefresh() {
      this.getData();
      this.$refs.acTable.clearSelection();
    },
    handleSearch(params) {
      const $this = this;
      this.searchBar.validatedParams = params;
      $this.getData(true);
      $this.$refs.acTable.clearSelection();
    }
  }
}
</script>
<style scoped>
</style>
