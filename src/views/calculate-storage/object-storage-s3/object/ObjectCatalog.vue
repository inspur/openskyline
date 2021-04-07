<template>
  <div class="tableCSS">
    <icos-search-bar :conditions="searchBar.conditions" ref="icosSearchBar" @search="handleSearch" @resetQuery="resetQuery" :advanced-disabled="true"/>
    <div class="divider clearfix"></div>
    <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
    </operation-panel>
    <div class="divider clearfix"></div>
    <div class="col-20">
      <Breadcrumb :pathList="pathList" :separtor="'/'" @select-change="handleBreadcrumbSelected"></Breadcrumb>
    </div>
    <el-table ref="objectTable" :data="totalData" highlight-current-row border stripe style="width: 100%;" slot="empty" row-key="name" 
       :default-sort="{prop: 'motify_date', order: 'descending'}"  @selection-change="handleSelectionChange" @sort-change="sortChange" v-loading="loading">
      <el-table-column reserve-selection type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" align="left" min-width="100">
        <template slot-scope="scope">
          <column-hover :type="scope.row.type === 'catalog'?'button':'text'" :content="scope.row.name" :row="scope.row" @clickContent="openFolderFun" :icon="objectIconRender(scope.row)" :iconStyle="iconStyleRender(scope.row)" :iconList="iconList"></column-hover>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('bytes') >= 0" prop="bytes" align="left" :label="$t('storage.size')" min-width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.type != 'catalog'">{{sizeRender(scope.row.bytes, scope.row)}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('motify_date') >= 0" prop="motify_date" align="left" :label="$t('lang.modifyTime')" min-width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.type != 'catalog'">{{scope.row.motify_date | dateTimeFormatter}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('operator') >= 0" align="left" :label="$t('base.action')" min-width="100" prop="operator">
        <template slot-scope="scope">
          <span v-if="scope.row.type != 'catalog'"><a @click="handleGenerateUrlShow(scope.row)" class="startpage_more">{{$t('storage.makeTempUrl')}}</a></span>
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
          <div class="el-pagination">
            <span class="el-pagination__sizes">
              <el-select v-model="pageSize" @change="handleSizeChange">
                <el-option v-for="page in pageSizes" :key="page.label" :label="page.label" :value="page.value" />
              </el-select>
            </span>
            <el-tooltip placement="top" trigger="hover">
              <div slot="content">{{$t('storage.backToFirst')}}</div>
              <button type="button" :class="prevDisabled?'btn-prev disabled': 'btn-prev'" ref='prevButton' @click="turnToFirst" :disabled="prevDisabled"><i class="el-icon el-icon-d-arrow-left"></i></button>
            </el-tooltip>
            <el-tooltip placement="top" trigger="hover">
              <div slot="content">{{$t('storage.nextPage')}}</div>
              <button type="button" :class="nextDisabled?'btn-next disabled':'btn-next'" @click="turnToNext" :disabled="nextDisabled"><i class="el-icon el-icon-arrow-right"></i></button>
            </el-tooltip>
          </div>
        </el-col>
      </el-row>
    </div>
    <create-catalog ref="createCatalog" v-if="createCatalogFlg" :bucketName="bucketName" :path="filePath" @handleAddCatalogShow="handleAddCatalogShow" @onRefresh="onAddRefresh"></create-catalog>
    <upload-doc ref="uploadDoc" v-if="uploadDocFlg" :bucketName="bucketName" :path="filePath" @handleUploadShow="handleUploadShow" @onRefresh="onAddRefresh"></upload-doc>
    <object-info ref="objectInfo" v-if="objectInfoFlg" :bucketName="bucketName" :fileName="fileName" :fullPath="filePath" @handleObjectInfoShow="handleObjectInfoShow" @onRefresh="onAddRefresh"></object-info>
    <set-acl ref="setacl" v-if="setaclFlag" :bucketName="bucketName" :fileName="fileName" :fullPath="filePath" @handleAddCatalogShow="handleAddCatalogShow"  @onRefresh="onAddRefresh"></set-acl>
    <generate-url ref="generateUrl" v-if="generateUrlFlg" :bucketName="generateBucketName" :fileName="generateFileName" :fullPath="generateFilePath" @handleGenerateUrlShow="handleGenerateUrlShow"  @onRefresh="onAddRefresh"></generate-url>
    <copy-object
      v-if="copyObjectDialog.visible"
      :file-name="copyObjectDialog.fileName"
      :full-path="copyObjectDialog.fullPath"
      :default-bucket="bucketName"
      @close="copyObjectDialog.visible = false"
      @refresh="onAddRefresh" />
    <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="multipartFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix" >
           <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
          </div>
          <div>
           <multipart-upload :bucketName="bucketName" ref="multipart" @onBack="onBack"/>
          </div>
        </panel>
      </div>
    </transition>
  </div>
</template>
<script>
import Breadcrumb from '../common/Breadcrumb';
import Pagenation from '../common/Pagenation';
import CreateCatalog from './CreateCatalog';
import UploadDoc from './UploadDoc';
import OperationMenu from './OperationMenu';
import ObjectInfo from './ObjectInfo';
import SetAcl from './SetAcl';
import CopyObject from './CopyObject';
import MultipartUpload from './MulipartUpload';
import GenerateUrl from './GenerateUrl';
export default {
  name: "ObjectCatalog",
  data() {
    return {
      sortObj: {
        sortOrder: "aescending",
        sortField: "name"
      },
      searchBar: {
        conditions: {
          query_name: {
            label: this.$t('lang.name') + this.$t('storage.prefix'),
            type: 'input',
            validator: (value) => {
              if (!/^[_.\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_NumberChinese_Pointer'));
              }
            }
          }
        }
      },
      queryParam: {},
      dirbytes: "-",
      bucketName: "",
      currentPath: '',
      filePath: '',
      fileName: "",
      objectInfoFlg: false,
      createCatalogFlg: false,
      uploadDocFlg: false,
      copyDocFlg: false,
      canClickCatalogFlag: false,
      replaceUploadDocFlg: false,
      setaclFlag: false,
      multipartFlag: false,
      generateUrlFlg: false,
      generateFilePath: "",
      generateFileName: "",
      generateBucketName: "",
      multipleSelection: [],
      operationMenus: OperationMenu.bind(this)(),
      pathList: [],
      reqParams: {},
      totalData: [],
      tableData: [],
      loading: false,
      copyObjectDialog: {
        visible: false,
        fileName: '',
        fullPath: ''
      },
      // 分页属性
      currentPage: 1,
      pageSize: 10,
      pageSizes: [
        {label: '5 '+this.$t('el.pagination.pagesize'), value: 5},
        {label: '10 '+this.$t('el.pagination.pagesize'), value: 10},
        {label: '20 '+this.$t('el.pagination.pagesize'), value: 20},
        {label: '30 '+this.$t('el.pagination.pagesize'), value: 30},
        {label: '40 '+this.$t('el.pagination.pagesize'), value: 40},
        {label: '60 '+this.$t('el.pagination.pagesize'), value: 60},
        {label: '80 '+this.$t('el.pagination.pagesize'), value: 80},
        {label: '100 '+this.$t('el.pagination.pagesize'), value: 100}
      ],
      NextMarker: "",
      nextDisabled: false,
      prevDisabled: false,
      rules:{
        query_name:[
          { validator: (rule, value, cb) => {
            let reg = /^[_\-0-9a-zA-Z().\u4e00-\u9fa5]+$/;
            if (!value || reg.test(value)) {
              return cb();
            } else {
              cb(this.$t("validation.onlyLetter_MinusNumberChineseSp"));
            }
          }}
        ]
      },
      iconList: [{
        icon: "el-icon-fa-info-circle",
        enabled: function (row) {
          return row.type !== "catalog";
        },
        handler: function (row) {
          this.filePath = this.currentPath;
          this.fileName = row.name;
          this.objectInfoFlg = true;
        }.bind(this)
      }],
      columnsChecked: ["name", "bytes", "motify_date", "operator"],
      columns: [{
        prop: "name",
        label: this.$t('lang.name')
      }, {
        prop: "bytes",
        label: this.$t('storage.size')
      },
      {
        prop: "motify_date",
        label: this.$t('lang.modifyTime')
      },
      {
        prop: "operator",
        label: this.$t('base.operating')
      }]
    }
  },
  watch: {
  },
  beforeDestroy() {
    if (this.interVmValid != null) {
      clearInterval(this.interVmValid);
    }
  },
  mounted() {
    let self = this;
    self.bucketName = this.$route.params.bucketName;
    self.currentPath = "";
    self.pathList.push({
      "label": this.$t("storage.S3_ROOT_DIR"),
      "name": this.$t("storage.S3_ROOT_DIR"),
      "path": self.currentPath
    });
    self.queryData();
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
    handleSearch(params) {
      let self = this;
      self.queryParam = params;
      let prefix = self.currentPath;
      if (self.queryParam.query_name!="" && self.queryParam.query_name!=undefined) {
        prefix = prefix + self.queryParam.query_name;
        let reqParams = {
          "Prefix": prefix,
          "Delimiter": "/",
          "Marker": "",
          "MaxKeys": self.pageSize
        };
        self.$refs.objectTable.clearSelection();
        self.prevDisabled = true;
        self.loadData(reqParams);
      } else {
        self.NextMarker = self.currentPath;
        self.queryData();
      }
    },
    resetQuery(params) {
      let self = this;
      self.queryParam = params;
    },
    openFolderFun(rowData) {
      let self = this;
      if (self.canClickCatalogFlag) {
        return false;
      }
      self.canClickCatalogFlag = true;
      self.queryParam.query_name = "";
      self.currentPath = self.currentPath + rowData.name;
      self.pathList.push({
        "label": rowData.name.replace("/", ""),
        "name": rowData.name.replace("/", ""),
        "path": self.currentPath
      });
      self.NextMarker = self.currentPath;
      self.prevDisabled = true;
      self.reqParams = {
        "Prefix": self.currentPath,
        "Delimiter": "/",
        "Marker":  self.NextMarker,
        "MaxKeys": self.pageSize
      };
      self.$refs.icosSearchBar.clearValidatedBasicConditionNotSearch();
      self.loadData(self.reqParams);
      self.$refs.objectTable.clearSelection();
    },
    queryData() {
      let self = this;
      self.reqParams = {
        "Prefix": self.currentPath,
        "Delimiter": "/",
        "Marker": self.NextMarker,
        "MaxKeys": self.pageSize
      };
      self.$refs.objectTable.clearSelection();
      if (self.currentPage == 1) {
        self.prevDisabled = true;
      } else {
        self.prevDisabled = false;
      }
      self.loadData(self.reqParams);
    },
    nextData(clearFlag) {
      let self = this;
      let prefix = self.currentPath;
      if (self.queryParam.query_name!="" && self.queryParam.query_name!=undefined) {
        prefix = prefix + self.queryParam.query_name;
      }
      self.reqParams = {
        "Prefix": prefix,
        "Delimiter": "/",
        "Marker": self.NextMarker,
        "MaxKeys": self.pageSize
      };
      if (clearFlag) {
        self.$refs.objectTable.clearSelection();
      }
      if (self.currentPage == 1) {
        self.prevDisabled = true;
      } else {
        self.prevDisabled = false;
      }
      self.loadData(self.reqParams);
    },
    async loadData(param) {
      let self = this;
      let params = {
        Bucket: self.bucketName,
        ...param
      };
      self.loading = true;
      Vue.s3.listObjects(params, function(err, data) {
        if (err) {
          self.canClickCatalogFlag = false;
          self.loading = false;
        } else {
          self.loading = false;
          //获取目录列表
          self.NextMarker = data["NextMarker"];
          self.nextDisabled = !data["IsTruncated"];
          let catalogList = data["CommonPrefixes"] || [];
          let result = [];
          for (let i = 0; i < catalogList.length; i++) {
            const catalog = catalogList[i];
            result.push({
              //返回的目录列表带着查询前缀展示需要去掉
              "name": catalog["Prefix"].replace(self.currentPath, ""),
              "bytes": "",
              "type": "catalog",
              "motify_date": ""
            });
          }
          //获取对象列表
          let objectList = data["Contents"] || [];
          let result1 = [];
          for (let i = 0; i < objectList.length; i++) {
            const object = objectList[i];
            if (object["Key"] == self.currentPath) {
              continue;
            }
            result1.push({
              //返回的对象列表带着查询前缀展示需要去掉
              "name": object["Key"].replace(self.currentPath, ""),
              "bytes": object["Size"],
              "type": "object",
              "motify_date": object["LastModified"]
            });
          }
          self.totalData = result.concat(result1)
          self.canClickCatalogFlag = false;
        }
      });
    },
    // 分页功能
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.NextMarker = this.currentPath;
      this.prevDisabled = true;
      // this.queryData();
      this.handleSearch(this.queryParam);
    },
    turnToFirst() {
      this.currentPage = 1;
      this.NextMarker = this.currentPath;
      this.prevDisabled = true;
      // this.queryData();
      // this.handleSearch(this.queryParam);
      this.nextData();
    },
    turnToNext() {
      this.currentPage++;
      this.prevDisabled = false;
      this.nextData();
      // if (this.currentPage == 1) {
      //   this.prevDisabled = true;
      // } else {
      //   this.prevDisabled = false;
      // }
      // this.handleSearch(this.queryParam);
    },
    onRefresh() {
      this.NextMarker = this.currentPath;
      this.prevDisabled = true;
      this.nextData(true);
    },
    onAddRefresh() {
      this.currentPage = 1;
      this.NextMarker = this.currentPath;
      this.prevDisabled = true;
      let self = this;
      setTimeout(function () {
        self.queryData();
      }, 2000);
    },
    deleteButtonFun(selectRows) {
      let self = this;
      let objectList = [];
      let catalogList = [];
      for (let i = 0; i < selectRows.length; i++) {
        const item = selectRows[i];
        if (item.type === "catalog") {
          catalogList.push(item);
        } else {
          objectList.push({
            "Key" : self.currentPath + item.name
          });
        }
      };
      self.$message(Vue.t("lang.sendDeleteSuccess"));
      if (objectList && objectList.length > 0) {
        self.deleteObjectsFun(objectList, false, "", false);
      }
      if (catalogList && catalogList.length > 0) {
        self.deleteCatalogsFun(catalogList);
      }
    },
    deleteCatalogsFun(catalogList) {
      for (let i = 0; i < catalogList.length; i++) {
        const catalog = catalogList[i];
        this.listAllObjectFun(catalog, "");
      }
    },
    /**
     * @method listAllObjectFun
     * @description 查询某个目录下的全部对象，如果记录过多，被截断，
     * 递归调用自身直到全部查询完毕，同时调用删除对象方法本次查询出来的记录
     * @param {Object} catalog 待删除的目录
     * @param {String} nextMarker 上一次调用时，获取被截断位置的标记，可用于递归中，上一次查询结果截断位置开始向后继续查询
     */
    listAllObjectFun(catalog, nextMarker) {
      let self = this;
      let prefix = self.currentPath + catalog['name'];
      let params = {
        "Bucket": self.bucketName,
        "Prefix": prefix
      };
      if (nextMarker) {
        params["Marker"] = nextMarker;
      }
      Vue.s3.listObjects(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          self.deleteCatalogRecordLog(prefix, false);
        } else {
          //获取对象列表
          let objectList = data["Contents"] || [];
          let result = [];
          for (let i = 0; i < objectList.length; i++) {
            const object = objectList[i];
            result.push({
              "Key": object["Key"]
            });
          }
          self.deleteObjectsFun(result, true, prefix, data["IsTruncated"]);
          if (data["IsTruncated"] && data["NextMarker"]) {
            self.listAllObjectFun(catalog, data["NextMarker"]);
          }
        }
      });
    },
    /**
     * @method deleteObjectsFun
     * @description 删除对象主方法，同时区分记录删除目录删除对象，成功失败的日志
     * @param {Array} objectList 待删除的对象列表
     * @param {Boolean} isCatalog 区分删除操作来自删除对象还是删除目录
     * @param {String} catalogPath 标记要删除的对象列表来自哪个目录下，主要是为了记录日志
     * @param {Boolean} isTruncated 标记待删除某个目录下的对象列表是否已全部查询完毕,true代表查询记录被截断。
     */
    deleteObjectsFun(objectList, isCatalog, catalogPath, isTruncated) {
      let self = this;
      let params = {
        Bucket: self.bucketName,
        Delete: {
          Objects: objectList
        }
      }
      Vue.s3.deleteObjects(params, function(err, data) {
        if (err) {
          if (isCatalog) {
            self.deleteCatalogRecordLog(catalogPath, false);
          }
          console.log(err, err.stack); // an error occurred
        } else {
          let successList = data["Deleted"];
          let failedList = data["Errors"]
          if (!isCatalog) {
            if (successList && successList.length > 0) {
              for (let i = 0; i < successList.length; i++) {
                const item = successList[i];
                self.deleteObjectRecordLog(item["Key"], true);
              }
            }
            if (failedList && failedList.length > 0) {
              for (let i = 0; i < failedList.length; i++) {
                const item = failedList[i];
                if (!isCatalog) {
                  self.deleteObjectRecordLog(item["Key"], false);
                }
              }
            }
            self.$refs.objectTable.clearSelection();
          } else {
            if (!isTruncated) {
              if (!failedList || failedList.length == 0) {
                self.deleteCatalogRecordLog(catalogPath, true);
              } else {
                self.deleteCatalogRecordLog(catalogPath, false);
              }
            }
          }
          self.NextMarker = self.currentPath;
          self.prevDisabled = true;
          self.currentPage = 1;
          self.queryData();
        }
      });
    },
    /**
     * @method deleteObjectRecordLog
     * @description 记录删除对象的日志
     * @param {String} key 对象的名字
     * @param {Boolean} flag 区分删除成功还是失败
     */
    deleteObjectRecordLog(key, flag) {
      let self = this;
      if (!flag) {
        self.$recordLog({
         target: Vue.logTarget.storage_object_storage,
         level:{
           en:"error",
           zh_cn:"错误"
         },
         description: {
           en:`Delete object(${self.$t('storage.rootPath')}/${key}) in Bucket(${self.bucketName}) failed`,
           zh_cn: `删除存储桶(${self.bucketName})内的对象(${self.$t('storage.rootPath')}/${key})失败`
         }
       });
      } else {
        self.$recordLog({
          target: Vue.logTarget.storage_object_storage,
          level:{
            en:"info",
            zh_cn:"信息"
          },
          description: {
            en:`Delete object(${self.$t('storage.rootPath')}/${key}) in Bucket(${self.bucketName}) success`,
            zh_cn: `删除存储桶(${self.bucketName})内的对象(${self.$t('storage.rootPath')}/${key})成功`
          }
        });
      }
    },
    /**
     * @method deleteCatalogRecordLog
     * @description 记录删除目录的日志
     * @param {String} key 目录的名字
     * @param {Boolean} flag 区分删除成功还是失败
     */
    deleteCatalogRecordLog(key, flag) {
      let self = this;
      if (!flag) {
        self.$recordLog({
         target: Vue.logTarget.storage_object_storage,
         level:{
           en:"error",
           zh_cn:"错误"
         },
         description: {
           en:`Delete catalog(${self.$t('storage.rootPath')}/${key}) in Bucket(${self.bucketName}) failed`,
           zh_cn: `删除存储桶(${self.bucketName})内的目录(${self.$t('storage.rootPath')}/${key})失败`
         }
       });
      } else {
        self.$recordLog({
          target: Vue.logTarget.storage_object_storage,
          level:{
            en:"info",
            zh_cn:"信息"
          },
          description: {
            en:`Delete catalog(${self.$t('storage.rootPath')}/${key}) in Bucket(${self.bucketName}) success`,
            zh_cn: `删除存储桶(${self.bucketName})内的目录(${self.$t('storage.rootPath')}/${key})成功`
          }
        });
      }
    },
    sizeRender(value, rowData) {
      if (!value || value === 0) {
        return "0 Bytes";
      }
      let sizes = ["Bytes", "KB", "MB", "GB", "TB", "YB"];
      let num = 0;
      while (value >= 1024) {
        value = value / 1024;
        num++;
      }
      return value.toFixed(2) + " " + sizes[num];
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    showObjectInfo(row) {
      this.filePath = this.currentPath;
      this.fileName = row.name;
      this.objectInfoFlg = true;
    },
    handleBreadcrumbSelected(params) {
      let self = this;
      if (self.canClickCatalogFlag) {
        return false;
      }
      self.canClickCatalogFlag = true;
      self.queryParam.query_name = "";
      self.currentPath = params.path;
      self.NextMarker = self.currentPath;
      self.prevDisabled = true;
      self.currentPage = 1;
      self.reqParams = {
        "Prefix": self.currentPath,
        "Delimiter": "/",
        "Marker": self.NextMarker,
        "MaxKeys": self.pageSize
      };
      let index = self.pathList.findIndex((item) => item.path === self.currentPath);
      self.pathList = self.pathList.slice(0, index + 1);//slice(start, end)
      self.queryData();
    },
    objectIconRender(rowData) {
      if (rowData["type"] === "catalog") {
        return "el-icon-fa-folder-open el-icon-fa-lg ";
      } else {
        return "el-icon-fa-file el-icon-fa-lg";
      }
    },
    iconStyleRender(rowData) {
      if (rowData["type"] === "catalog") {
        return "color: #FFAD40;";
      } else {
        return "color: #BFCDB9";
      }
    },
    handleGenerateUrlShow(rowData) {
      console.log(rowData)
      this.generateUrlFlg = !this.generateUrlFlg;
      this.generateFileName = rowData.name;
      this.generateFilePath = this.currentPath;
      this.generateBucketName = this.bucketName;
      this.$refs.objectTable.clearSelection();
    },
    handleAddCatalogShow() {
      this.createCatalogFlg = false;
      this.setaclFlag = false;
      this.$refs.objectTable.clearSelection();
    },
    handleUploadShow() {
      this.uploadDocFlg = false;
      this.$refs.objectTable.clearSelection();
    },
    handleObjectInfoShow() {
      this.objectInfoFlg = false;
      this.$refs.objectTable.clearSelection();
    },
    handleCopyShow() {
      this.copyDocFlg = false;
      this.$refs.objectTable.clearSelection();
    },
    handleReplaceUploadShow() {
      this.replaceUploadDocFlg = false;
      this.$refs.objectTable.clearSelection();
    },
    onBack() {
      this.multipartFlag = false;
    }
  },
  components: {
    Breadcrumb,
    Pagenation,
    CreateCatalog,
    UploadDoc,
    ObjectInfo,
    SetAcl,
    CopyObject,
    MultipartUpload,
    GenerateUrl
  }
}
</script>
<style>
.el-pagination button.disabled {
  color: #e4e4e4;
  background-color: #fff;
  cursor: not-allowed;
}
</style>
