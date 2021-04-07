<template>
  <div>
    <el-form :inline="true" :model="formInline" class="form-inline">
      <el-form-item :label="$t('lang.name')">
        <el-input size="small" :placeholder="$t('lang.name')" v-model="query_name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' size="small" @click="queryClick()">{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form>
    <div class="divider clearfix"></div>
    <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
    </operation-panel>
    <div class="divider clearfix"></div>
    <el-form :inline="true" class="form-inline">
      <el-form-item :label="$t('storage.currentContainer')">
        <span>{{containerName}}</span>
      </el-form-item>
      <el-form-item :label="$t('storage.path')">
        <span>/{{path}}</span>
      </el-form-item>
    </el-form>
    <!-- <div class="divider clearfix"></div> -->
    <el-table ref="objectTable" :data="tableData" highlight-current-row border stripe style="width: 100%;" slot="empty" row-key="name" :default-sort="{prop: 'name', order: 'descending'}" @selection-change="handleSelectionChange" @sort-change="sortChange">
      <el-table-column reserve-selection type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column type="expand" align="center" width="55">
        <template slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-row :gutter="20" v-if="!(scope.row.hasOwnProperty('subdir'))">
              <el-col :span="2">
                <span class="formspan">{{$t('lang.name')}}:</span>
              </el-col>
              <el-col :span="5" class="contentspan">
                <el-tooltip :content="scope.row.name" v-show="scope.row.name.length > 0">
                  <span>{{scope.row.name.length>30?scope.row.name.substring(0,30):scope.row.name}}</span>
                </el-tooltip>
              </el-col>
              <el-col :span="2">
                <span class="formspan">{{$t('storage.size')}}:</span>
              </el-col>
              <el-col :span="10" class="contentspan">
                <span v-html="sizeRender(scope.row.bytes, scope.row)"></span>
                <!-- <span>{{scope.row.bytes || '-'}}</span>  -->
              </el-col>
            </el-row>
            <el-row :gutter="20" v-if="!(scope.row.hasOwnProperty('subdir'))">
              <el-col :span="2">
                <span class="formspan">{{$t('storage.contentType')}}</span>
              </el-col>
              <el-col :span="5" class="contentspan">
                <span>{{scope.row.content_type || '-'}}</span>
              </el-col>
              <el-col :span="2">
                <span class="formspan">{{$t('storage.updatedTime')}}</span>
              </el-col>
              <el-col :span="10" class="contentspan">
                <span>{{dateRender(scope.row.last_modified)}}</span>
              </el-col>
            </el-row>
            <el-row :gutter="20" v-if="!(scope.row.hasOwnProperty('subdir'))">
              <el-col :span="2">
                <span class="formspan">Hash:</span>
              </el-col>
              <el-col :span="10" class="contentspan">
                <span>{{scope.row.hash || '-'}}</span>
              </el-col>
            </el-row>
            <el-form-item :label="$t('storage.instruction')" v-if="(scope.row.hasOwnProperty('subdir'))">
              <span>{{$t('storage.catalogNotSupportDetail')}}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" align="left" sortable="custom" min-width="100">
        <template slot-scope="scope">
          <el-button v-if="scope.row.path.indexOf('/') >= 0" @click="ListData(scope.$index,scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
          <span v-else>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('bytes') >= 0" prop="bytes" align="left" :label="$t('storage.size')" min-width="100">
        <template slot-scope="scope">
          <span v-html="sizeRender(scope.row.bytes, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('type') >= 0" prop="type" align="left" :label="$t('storage.type')" min-width="100">
        <template slot-scope="scope">
          <span v-html="containerType(scope.row.type, scope.row)"></span>
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
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
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
      <create-catalog ref="createCatalog" v-if="createCatalogFlg" :containerTempName="containerName" :path="filePath" @handleAddCatalogShow="handleAddCatalogShow" @onRefresh="onAddRefresh"></create-catalog>
      <upload-doc ref="uploadDoc" v-if="uploadDocFlg" :containerTempName="containerName" :path="filePath" @handleUploadShow="handleUploadShow" @onRefresh="onAddRefresh"></upload-doc>
      <copy-obj ref="copyObj" v-if="copyDocFlg" :containerTempName="containerName" :fileName="objectName" :contentType="contentType" @handleCopyShow="handleCopyShow" @onRefresh="onAddRefresh"></copy-obj>
      <replace-upload-doc ref="replaceUploadDoc" v-if="replaceUploadDocFlg" :containerTempName="containerName" :fileName="objectName" @handleReplaceUploadShow="handleReplaceUploadShow" @onRefresh="onAddRefresh"></replace-upload-doc>
    </div>
  </div>
</template>
<script>
import CreateCatalog from './CreateCatalog';
import UploadDoc from './UploadDoc';
import CopyObj from './CopyObj';
import ReplaceUploadDoc from './ReplaceUploadDoc';
export default {
  name: "catalog",
  //  props: ['containerTempName'],
  data() {
    return {
      sortObj: {
        sortOrder: "descending",
        sortField: "name"
      },
      formInline: {
      },
      objStorFlag: false,
      dirbytes: "-",
      containerName: '',
      query_name: '',
      path: '',
      parentPath: "",
      pathList: [],
      filePath: '',
      objectName: '',
      contentType: '',
      createCatalogFlg: false,
      uploadDocFlg: false,
      copyDocFlg: false,
      replaceUploadDocFlg: false,
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: this.$t('storage.createCatalog'),
        showflg: true,
        readOnly: true,
        handler: function (selectRows) {
          let self = this;
          self.createCatalogFlg = true;
          self.filePath = self.path;
        }.bind(this)
      }, {
        icon: "fa-upload",
        name: this.$t('lang.uploadDoc'),
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          let self = this;
          self.uploadDocFlg = true;
          self.filePath = self.path;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          var rowName = rowData.path;
          if ((rowName.indexOf('/')) < 0) {
            return true;
          } else {
            var self = this;
            var num = 0;
            var listNameTemp = rowData.listName;
            for (var i = 0; i < listNameTemp.length; i++) {
              var nameTemp = listNameTemp[i];
              if (nameTemp.indexOf(rowName) >= 0 && nameTemp.replace(rowName, "").length > 0) {
                num++;
              }
            }
            if (num > 0) {
              return false;
            } else {
              return true;
            }
          }
        },
        handler: function (selectRows) {
          var self = this;
          var projectId = this.$cookie.get('pid');
          self.$prompt(this.$t('lang.inputYesToContinue'), this.$t('lang.confirm'), {
            confirmButtonText: this.$t('lang.confirm'),
            cancelButtonText: this.$t('lang.cancel'),
            inputPattern: /^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage: this.$t('lang.onlyAcceptYesOrNo')
          }).then(async ({ value }) => {
            if ("yes" == value.toLowerCase()) {
              var url = "api/swift/v1/" + projectId + "/" + self.containerName + "?path=" + self.path + "&format=json";
              try {
                await self.$ajax({
                  type: 'GET',
                  url: url,
                  showErrMsg: true,
                  success: function (result) {
                    var list = [];
                    for (var i = 0; i < result.length; i++) {
                      let objectData = result[i];
                      if (!objectData.hasOwnProperty('name')) {
                        var objectDir = objectData;
                        var str = objectData.subdir;
                        str = str.substring(0, str.length - 1);
                        var num = str.lastIndexOf('/');
                        str = str.substring(num + 1, str.length);
                        list.push(str + '/');
                      } else {
                        var objectdoc = objectData;
                        var strName = objectdoc.name;
                        objectdoc.pathName = strName;
                        var numName = strName.lastIndexOf('/');
                        strName = strName.substring(numName + 1, strName.length);
                        list.push(strName);
                      }
                    }

                    self.$message({
                      showClose: true,
                      message: Vue.t('lang.sendDeleteSuccess'),
                      type: 'success'
                    });

                    for (i = 0; i < selectRows.length; i++) {
                      var selcRow = selectRows[i];
                      var selcName = selcRow.name;
                      let tempName = selcName;
                      if (selcRow.pathName.lastIndexOf('/') == (selcRow.pathName.length - 1)) {
                        selcName = selcName + '/';
                      }

                      if (self.isInNameList(selcName, list)) {
                        self.$ajax({
                          type: 'delete',
                          url: 'api/swift/v1/' + projectId + '/' + self.containerName + '/' + selcRow.pathName,
                          showErrMsg: true,
                          log: {
                            description: {
                              en: "Send delete Object:" + tempName,
                              zh_cn: "删除对象:" + tempName
                            },
                            target: Vue.logTarget.storage_object_storage
                          }
                        });
                      } else {
                        self.$recordLog({
                          target: Vue.logTarget.storage_object_storage,
                          level: {
                            en: "info",
                            zh_cn: "信息"
                          },
                          description: {
                            en: "Delete:" + tempName,
                            zh_cn: "删除对象:" + tempName
                          }
                        });
                        self.$message({
                          showClose: true,
                          message: Vue.t('storage.targetNotExist') + tempName,
                          type: 'warning'
                        });
                      }
                    }

                    setTimeout(function () {
                      self.queryClick();
                    }, 2000);
                  }
                });
              } catch (res) {
              }
            }
          }).catch(() => {
            //取消
          });
        }.bind(this)
      }, {
        icon: "fa-clone",
        name: this.$t('storage.copy'),
        showflg: true,
        enable(rowData) {
          return (!(rowData.path.indexOf('/') >= 0));
        },
        handler: function (selectRows) {
          var self = this;
          self.copyDocFlg = true;
          self.objectName = selectRows[0].pathName;
          self.contentType = selectRows[0].content_type;
        }.bind(this)
      }, {
        icon: "fa-window-restore",
        name: this.$t('storage.replace'),
        showflg: true,
        enable(rowData) {
          return (!(rowData.path.indexOf('/') >= 0));
        },
        handler: function (selectRows) {
          var self = this;
          self.replaceUploadDocFlg = true;
          self.objectName = selectRows[0].pathName;
        }.bind(this)
      }, {
        icon: "fa-download",
        name: this.$t('storage.download'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return (!(rowData.path.indexOf('/') >= 0));
        },
        handler: function (selectRows) {
          var self = this;
          var projectId = this.$cookie.get('pid');
          var param = {
            // language:Vue.language,
            containerName: self.containerName,
            objectName: selectRows[0].pathName,
            projectId: projectId
          };
          document.location = 'node-api/keystone/downloadObject?' + $.param(param);
          self.$recordLog({
            target: Vue.logTarget.storage_object_storage,
            level: {
              en: "info",
              zh_cn: "信息"
            },
            description: {
              en: "Download file:" + selectRows[0].name,
              zh_cn: "下载文件:" + selectRows[0].name
            }
          });
        }.bind(this)
      }, {
        icon: "fa-reply",
        name: this.$t('storage.reply'),
        showflg: true,
        readOnly: true,
        handler: function (selectRows) {
          let self = this;
          self.query_name = "";
          self.initContainerAllChildList(self.containerName);
          if (self.pathList.length > 1) {
            self.pathList.pop();
            self.path = self.pathList[self.pathList.length - 1];
            console.log(this.$t('storage.reply') + self.path);
            self.queryClick();
          } else if (self.pathList.length == 1) {
            self.pathList.pop();
            self.path = "";
            self.queryClick();
          } else {
            self.$emit("onBack", {});
            // self.$router.push({
            //   path: '/calculate-storage/object-storage'
            // });
          }
        }.bind(this)
      }],
      totalData: [],
      tableData: [],
      listName: [],
      listPara: {
        page: 1,
        pageSize: 10
      },
      loading: false,
      columnsChecked: ["name", "bytes", "type"],
      columns: [{
        prop: "name",
        label: this.$t('lang.name')
      }, {
        prop: "bytes",
        label: this.$t('storage.size')
      },
      {
        prop: "type",
        label: this.$t('storage.type')
      }],
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 50, 200],
      total: 1
    }
  },
  mounted() {
    var self = this;
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
    clearSelOption() {
      var self = this;
      self.$refs.objectTable.clearSelection();
    },
    initData(containerName) {
      var self = this;
      self.containerName = containerName;
      Promise.all([self.initContainerAllChildList(containerName)]).then(function (result) {
        self.queryClick();
      });
    },
    async initContainerAllChildList(containerName) {
      var self = this;
      var allListData = [];
      var roleType = Vue.roleType + "";
      var projectId = this.$cookie.get('pid');
      var url = "api/swift/v1/" + projectId + "/" + containerName + "?format=json";
      if ("2" == roleType || "3" == roleType) { //超级
        url = "api/swift/v1/" + projectId + "/" + containerName + "?format=json";
      }
      try {
        let result = await self.$ajax({
          type: 'GET',
          url: url,
          showErrMsg: true
        });
        allListData = result;
        self.listName = [];
        for (var i = 0; i < allListData.length; i++) {
          let objectData = allListData[i];
          self.listName.push(objectData.name);
        }
      } catch (res) {
      }
    },
    ListData(index, row) {
      var self = this;
      self.objStorFlag = true;
      self.path = row.pathName;
      self.pathList.push(self.path);
      self.queryClick();
    },
    backToData() {
      let self = this;
      self.path = self.parentPath;
      self.queryClick();
    },
    queryClick() {
      var self = this;
      var queryName = self.query_name;
      self.loadData(queryName);
    },
    async loadData(queryName = '') {
      var self = this;
      var resultData = [];
      var queryData = [];
      var containerTempName = self.containerName;
      var roleType = Vue.roleType + "";
      var projectId = this.$cookie.get('pid');
      var url = "api/swift/v1/" + projectId + "/" + containerTempName + "?path=" + self.path + "&format=json";
      if ("2" == roleType || "3" == roleType) { //超级
        url = "api/swift/v1/" + projectId + "/" + containerTempName + "?path=" + self.path + "&format=json";
      }
      try {
        let result = await self.$ajax({
          type: 'GET',
          url: url,
          showErrMsg: true
        });
        resultData = result;
        for (var i = 0; i < resultData.length; i++) {
          let objectData = resultData[i];
          if (!objectData.hasOwnProperty('name')) {
            var objectDir = objectData;
            var str = objectData.subdir;
            str = str.substring(0, str.length - 1);
            var num = str.lastIndexOf('/');
            str = str.substring(num + 1, str.length);
            objectDir.name = str;
            objectDir.path = objectData.subdir;
            objectDir.pathName = objectData.subdir;
            objectDir.bytes = self.dirbytes;
            objectDir.listName = self.listName;
            objectDir.type = this.$t('storage.catalog');
          } else {
            var objectdoc = objectData;
            var strName = objectdoc.name;
            objectdoc.pathName = strName;
            var numName = strName.lastIndexOf('/');
            strName = strName.substring(numName + 1, strName.length);
            objectdoc.name = strName;
            objectdoc.path = objectData.name;
            objectdoc.listName = self.listName;
            objectdoc.type = this.$t('storage.document');
          }
          if ('' == queryName) {
            queryData.push(objectData);
          } else {
            if (objectData.name.indexOf(queryName) >= 0) {
              queryData.push(objectData);
            }
          }
        }
        self.$refs.objectTable.clearSelection();
        self.totalData = queryData;
        self.total = queryData.length;
      } catch (res) {
      }
    },
    isInNameList(name, nameList) {
      for (var i = 0; i < nameList.length; i++) {
        var tempName = nameList[i];
        if (name == tempName) {
          return true;
        }
      }
      return false;
    },
    dateRender(value, rowData) {
      var self = this;
      var time = Date.parse(new Date(value));
      return self.formatTimeStamp(time, "yyyy-MM-dd HH:mm:ss");
    },
    /**
     * 将时间戳格式化的方法
     * @param timeStamp时间戳值
     * @param fmt 要生成的格式，如yyyy-MM-dd HH:mm:ss
     * @returns
     */
    formatTimeStamp(timeStamp, fmt) {
      if (!timeStamp) {
        return "";
      }
      var date = new Date();
      date.setTime(timeStamp);
      var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时
        "H+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
      }
      if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : ""));
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
      }
      return fmt;
    },
    sizeRender(value, rowData) {
      if (value == this.dirbytes) {
        return value;
      } else {
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
      }
    },
    containerType(value, rowData) {
      if (typeof (value) == "undefined" || null == value) {
        return "-";
      }
      return value;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    onRefresh() {
      this.queryClick();
      this.clearSelOption();
    },
    onAddRefresh() {
      var self = this;
      setTimeout(function () {
        self.queryClick();
      }, 5000);
    },
    handleAddCatalogShow() {
      this.createCatalogFlg = false;
      this.$refs.objectTable.clearSelection();
    },
    handleUploadShow() {
      this.uploadDocFlg = false;
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
    handleSizeChange(val) {
      this.listPara.pageSize = val;
      this.queryClick();
    }/*,
    handleCurrentChange(val) {
      this.listPara.page = val;
      this.queryClick();
    }*/
  },
  components: {
    CreateCatalog, UploadDoc, CopyObj, ReplaceUploadDoc
  }
}
</script>
<style scoped>

</style>
