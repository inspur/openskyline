<template>
  <div>
    <div v-show="objStormainVisable">
      <el-form :inline="true" v-model="formInline" class="form-inline">
        <el-form-item :label="$t('lang.name')">
          <el-input :placeholder="$t('lang.name')" size="small" v-model="containerName"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon='fa-search' size="small" @click="queryClick()">{{$t('lang.query')}}</el-button>
        </el-form-item>
      </el-form>
      <div class="divider clearfix"></div>
      <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
      <el-table ref="objStorTable" :data="tableData" :element-loading-text="$t('lang.loading')" highlight-current-row border stripe style="width: 100%;" slot="empty" row-key="name" :default-sort="{prop: 'name', order: 'descending'}" @selection-change="handleSelectionChange" @sort-change="sortChange">
        <el-table-column reserve-selection type="selection" align="center" width="55">
        </el-table-column>
        <el-table-column align="left" width="50">
          <template slot-scope="scope">
            <el-button type="text" icon="arrow-right" @click="showBucketDetail(scope.row.name)"></el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" align="left" sortable="custom" min-width="100">
          <template slot-scope="scope">
            <el-button @click="showDetail(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('count') >= 0" prop="count" align="left" :label="$t('lang.objNum')" min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('bytes') >= 0" prop="bytes" align="left" :label="$t('lang.usedStor')" min-width="100">
          <template slot-scope="scope">
            <span v-html="sizeRender(scope.row.bytes, scope.row)"></span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onRefresh">
            </el-button>
            <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
            <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
              </div>
            </el-popover>
          </el-col>
          <el-col :span="19">
            <page :totalData="totalData" :objStorFlag="objStorFlag" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
          </el-col>
        </el-row>
        <create-container ref="createContainer" @handleAddShow="handleAddShow" @onAddRefresh="onAddRefresh" v-if="createContainerFlg"></create-container>
        <upload-doc ref="uploadDoc" v-if="uploadDocFlg" :containerTempName="containerTempName" @handleUploadShow="handleUploadShow" @onRefresh="onAddRefresh"></upload-doc>
        <public-visit ref="publicVisit" v-if="publicVisitFlag" :containerTempName="containerTempName" @hide="publicVisitFlag=false" @refresh="onRefresh"></public-visit>
        <container-quota ref="containerQuota" v-if="containerQuotaFlag" :containerTempName="containerTempName" @hide="containerQuotaFlag=false" @refresh="onRefresh"></container-quota>
      </div>
    </div>
    <catalog v-show="objectListVisable" ref="catalog" @onBack="onBack"></catalog>
    <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix">
            <el-button type="text" icon="fa-arrow-right" @click="detailFlag = false">{{$t("lang.back")}}</el-button>
          </div>
          <div style="text-align: left;">
            <bucket-detail ref="bucketDetail" :containerTempName="currentBucketName"></bucket-detail>
          </div>
        </panel>
      </div>
    </transition>
  </div>
</template>
<script>
import Catalog from './Catalog'
import CreateContainer from './CreateContainer'
import UploadDoc from './UploadDoc'
import PublicVisit from './PublicVisit'
import ContainerQuota from './ContainerQuota'
import BucketDetail from './BucketDetail'
export default {
  name: "DocStor",
  data() {
    return {
      sortObj: {
        sortOrder: "descending",
        sortField: "name"
      },
      formInline: {
      },
      containerName: "",
      containerTempName: "",
      objStorFlag: false,
      publicVisitFlag: false,
      containerQuotaFlag: false,
      objStormainVisable: true,
      objectListVisable: false,
      catalogFlg: false,
      createContainerFlg: false,
      uploadDocFlg: false,
      multipleSelection: [],
      detailFlag: false,
      currentBucketName: '',
      operationMenus: [{
        icon: "fa-plus",
        name: this.$t('lang.createContainer'),
        //showflg: true,
        showflg: (Vue.roleType + "" == "2"),
        readOnly: true,
        handler: function (selectRows) {
          let me = this;
          me.createContainerFlg = true;
        }.bind(this)
      }, {
        icon: "fa-upload",
        name: this.$t('lang.uploadDoc'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          let self = this;
          self.uploadDocFlg = true;
          self.containerTempName = selectRows[0].name;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          if (rowData.count == 0) {
            return true;
          } else {
            return false;
          }
        },
        handler: function (selectRows) {
          var self = this;
          self.$prompt(this.$t('lang.inputYesToContinue'), this.$t('lang.confirm'), {
            confirmButtonText: this.$t('lang.confirm'),
            cancelButtonText: this.$t('lang.cancel'),
            inputPattern: /^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage: this.$t('lang.onlyAcceptYesOrNo')
          }).then(async ({ value }) => {
            if ("yes" == value.toLowerCase()) {
              var projectId = this.$cookie.get('pid');
              self.$sequence({
                type: 'delete',
                url: 'api/swift/v1/' + projectId + '/{name}',
                params: selectRows,
                log: {
                  description: {
                    en: "Delete container",
                    zh_cn: "删除存储桶"
                  },
                  key: "name",
                  target: Vue.logTarget.storage_object_storage
                },
                successMsg: this.$t('lang.sendDeleteSuccess')
              }).then((data) => {
                self.loading = true;
                self.$refs.objStorTable.clearSelection();
                self.currentPage = 1;
                setTimeout(function () {
                  self.loadData();
                  self.loading = false;
                }, 5000);
              }).catch((err) => { });
            }
          }).catch(() => {
            //取消
          });
        }.bind(this)
      },
      {
        icon: "fa-bullhorn",
        name: this.$t('calcStorLang.publicVisit'),
        showflg: true, //(Vue.roleType + "" == "2"),
        enable: function () {
          return true;
        },
        handler: function (selectRows) {
          let me = this;
          me.containerTempName = selectRows[0].name;
          me.publicVisitFlag = true;
        }.bind(this)
      },
      {
        icon: "fa-sliders",
        name: this.$t('calcStorLang.containerQuota'),
        showflg: true,
        enable: function () {
          return true;
        },
        handler: function (selectRows) {
          let me = this;
          me.containerTempName = selectRows[0].name;
          me.containerQuotaFlag = true;
        }.bind(this)
      }],
      tableData: [],
      totalData: [],
      listPara: {
        page: 1,
        pageSize: 10
      },
      loading: false,
      columnsChecked: ["name", "count", "bytes"],
      columns: [{
        prop: "name",
        label: this.$t('lang.name')
      }, {
        prop: "count",
        label: this.$t('lang.objNum')
      }, {
        prop: "bytes",
        label: this.$t('lang.usedStor')
      }],
      headStr: ".r:*,.rlistings",
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 50, 200],
      total: 1
    }
  },
  watch: {
    '$route'(to, from) {
      let self = this;
      self.objStormainVisable = true;
      self.objectListVisable = false;
      self.$refs.objStorTable.clearSelection();
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder: column.order,
        sortField: column.prop
      };
    },
    showBucketDetail(bucketName) {
      const $this = this;
      $this.currentBucketName = bucketName;
      $this.detailFlag = true;
      $this.$nextTick(() => {
        $this.$refs.bucketDetail.loadData();
      })
    },
    queryClick() {
      this.loadData();
    },
    async loadData() {
      var self = this;
      this.$refs.objStorTable.clearSelection();
      var resultData = [];
      //查询条件
      var containerName = self.containerName;
      var roleType = Vue.roleType + "";
      var projectId = this.$cookie.get('pid');
      /*var url = "api/swift/swift/v1?format=json";
      if ("2" == roleType || "3" == roleType) { //超级
        url = "api/swift/swift/v1?format=json";
      }*/
      var url = "api/swift/v1/" + projectId + "?format=json";
      if ("2" == roleType || "3" == roleType) { //超级
        url = "api/swift/v1/" + projectId + "?format=json";
      }

      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'GET',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        let containers = result;
        for (var i = 0; i < containers.length; i++) {
          let container = containers[i];
          if ('' == containerName) {
            resultData.push(container);
          } else {
            if (container.name.indexOf(containerName) >= 0) {
              resultData.push(container);
            }
          }
        }
        self.totalData = resultData;
        // self.tableData = result['servers'];
        self.total = resultData.length;
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    handleAddShow() {
      this.createContainerFlg = false;
    },
    handleUploadShow() {
      this.uploadDocFlg = false;
      this.$refs.objStorTable.clearSelection();
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    sizeRender(value, rowData) {
      var self = this;
      var size = 0;
      var initFlag = 0;
      var unitFlag = " Bytes";
      while (value >= 1024) {
        value = value / 1024;
        initFlag++;
      }
      switch (initFlag) {
        case 1:
          unitFlag = " KB";
          break;
        case 2:
          unitFlag = " MB";
          break;
        case 3:
          unitFlag = " GB";
          break;
        default:
          break;
      }
      if (value) {
        value = value.toFixed(2);
      } else {
        value = 0;
      }
      size = value + unitFlag;
      return size;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.loadData();
    },
    onAddRefresh() {
      var self = this;
      setTimeout(function () {
        self.queryClick();
      }, 5000);
    },
    /*onUploadRefresh() {
      var self = this;
      setTimeout(function() {
         self.queryClick();
        }, 10000);
    },*/
    handleSizeChange(val) {
      this.listPara.pageSize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      this.listPara.page = val;
      this.loadData();
    },
    onBack() {
      this.objectListVisable = false;
      this.objStormainVisable = true;
      this.loadData();
    },
    showDetail(index, row) {
      var containerName = row.name;
      this.objStorFlag = true;
      this.objectListVisable = true;
      this.objStormainVisable = false;
      this.$refs.catalog.initData(containerName);
    },
    async getPublicVisit(name) {
      var self = this;
      var projectId = this.$cookie.get('pid');
      var url = "api/swift/v1/" + projectId + "/" + name + "?format=json";
      try {
        let result = await self.$ajax({
          type: 'GET',
          url: url,
          showErrMsg: true,
          successFun: function (res, xhr) {
            let head = xhr.getResponseHeader("X-Container-Read");
            if (head && (head.indexOf(self.headStr) >= 0)) {
              return Vue.t("lang.public");
            } else {
              return Vue.t("lang.private");
            }
          },
          errFun: function () {
            return Vue.t("lang.private");
          }
        });
      } catch (res) {
        self.loading = false;
        return "-";
      }
    }
  },
  components: {
    Catalog,
    CreateContainer,
    UploadDoc,
    PublicVisit,
    BucketDetail,
    ContainerQuota
  }
}
</script>
<style scoped>

</style>
