<template>
  <el-dialog :title="$t('calcStorLang.rescueInstTitle')" :visible.sync="dialogVisible" :before-close="handleClose">
  <div class="text-regular module-desc" style="font-weight: 350;">
  {{$t('calcStorLang.rescueInstTip1')}}
      <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.rescueInstTip2')">
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </div>
    <el-form ref="reconstForm" label-width="100px" label-position="left" :model="reconstForm" :rules="rules">
      <el-form-item :label="$t('calcStorLang.createInstTempSource')" class="is-required">
        <el-radio-group v-model="templateType" @change="templateTypeChange">
        <el-radio class="radio" label="1">{{$t('calcStorLang.image')}}</el-radio>
        <el-radio class="radio" label="2">{{$t('calcStorLang.instanceshot')}}</el-radio>
      </el-radio-group>
      </el-form-item>
      <el-form-item label="" class="is-required" label-width="100px">
        <span>{{$t('lang.name')}}</span>
        <el-input :class="colClass" v-model="searchName" auto-complete="off" class="col-6"></el-input>
        <span>{{$t('calcStorLang.os')}}</span>
        <el-input :class="colClass" v-model="osType" auto-complete="off" class="col-6"></el-input>
        <el-button type="primary" icon='fa-search' size="small" @click="queryClick()">{{$t('lang.query')}}</el-button>
    </el-form-item>
      <el-form-item :label="$t('calcStorLang.chooseTem')" class="is-required">
        <el-table ref="umTable" :data="tableData" highlight-current-row border stripe :default-sort="{prop: 'name', order: 'ascending'}" row-key="id" highlight-current-row @current-change="handleSelectionChange" @sort-change="sortChange">
          <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" show-overflow-tooltip sortable="custom" min-width="60" align="left">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('size') >= 0" prop="size" align="left" :label="$t('calcStorLang.size')" show-overflow-tooltip min-width="50">
            <template slot-scope="scope">
              <span v-html="diskRender(scope.row.size, scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('os') >= 0" prop="os_distro" show-overflow-tooltip :label="$t('calcStorLang.os')" min-width="50" align="left">
            <template slot-scope="scope">
              <span v-html="osRender(scope.row.size, scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('visibility') >= 0" prop="visibility" align="left" :label="$t('calcStorLang.visibility')" show-overflow-tooltip min-width="50">
            <template slot-scope="scope">
              <span v-html="visibilityRender(scope.row.visibility, scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('date') >= 0" prop="created_at" align="left" :label="$t('calcStorLang.createTime')" show-overflow-tooltip min-width="50">
            <template slot-scope="scope">
              <span>{{tzTimeFormatter(scope.row.created_at)}}</span>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <!-- <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="onRefresh">
              </el-button>
              <span>当前选中 {{multipleSelection.length}}条</span>
              <el-popover placement="right" trigger="click">
                <el-checkbox-group class="vertical" v-model="columnsChecked">
                  <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                  </el-checkbox>
                </el-checkbox-group>
                <div slot="reference" class="name-wrapper">
                  <el-tag>请选择列</el-tag>
                </div>
              </el-popover>
            </el-col> -->
            <el-col :span="24">
              <page :totalData="totalData" @getCurrentData="getCurrentData"  :pageCount="pageCount"></page>
            </el-col>
          </el-row>
        </div>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.reconInstPass')" class="is-required">
        <el-radio-group v-model="defaultType" @change="resetPass">
          <el-radio class="radio" :label="1" :disabled="originalFlag">{{$t('calcStorLang.oldPassword')}}</el-radio>
          <el-radio class="radio" :label="2" :disabled="resetFlag">{{$t('lang.resetPassword')}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('lang.userName')" prop="userName" class="is-required" v-show="passFlag">
          <el-input class="col-8" v-model="userName" auto-complete="off" disabled></el-input>
          <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstLoginTip1')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      <el-form-item :label="$t('lang.password')" prop="userPass" class="is-required" v-show="passFlag">
        <el-input class="col-8" auto-complete="off" type="password" v-model="reconstForm.userPass"></el-input>
        <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstLoginTip2')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('lang.confirmPassword')" prop="confirmPass" class="is-required" v-show="passFlag">
        <el-input class="col-8" auto-complete="off" type="password" v-model="reconstForm.confirmPass"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAddDisk" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import formatFileSize from 'utils/formatFileSize';
export default {
  name: 'LoadDisk',
  props: ['instUuid', 'instProjectId', 'instName', 'instImageId', 'instSource'],
  data() {
    return {
      reconstForm: {
        userPass: '',
        confirmPass: ''
      },
      defaultType: 1,
      colClass:this.$cookie.get("defaultLanguage")=="en"?"col-3":"col-5",
      userName: 'Administrator/root',
      formatFileSize: formatFileSize,
      templateType: "1",
      saving: false,
      resetFlag: false,
      originalFlag: false,
      pageCount: 5,
      totalData: [],
      currentPage: 1,
      searchName: '',
      osType: '',
      templateList: [],
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "size",
        label: Vue.t('calcStorLang.size')
      }, {
        prop: "os",
        label: Vue.t('calcStorLang.os')
      }, {
        prop: "visibility",
        label: Vue.t('calcStorLang.visibility')
      }, {
        prop: "date",
        label: Vue.t('calcStorLang.createTime')
      }],
      passFlag: false,
      tzTimeFormatter: this.$tzTimeFormatter,
      columnsChecked: ['name', 'os', 'size', 'visibility', 'date'],
      tableData: [],
      multipleSelection: [],
      dialogVisible: false,
      diskPartition: 'ssh',
      rules: {
        userPass: [
          { type: 'required', trigger: 'blur change' },
          { type: 'passwordLegal' }
        ],
        confirmPass: [
          { type: 'required', trigger: 'blur change' },
          { type: 'passwordEquals', context: this, value: "reconstForm.userPass" }
        ]
      }
    }
  },
  updated() {
     var self = this;
     if (1 === self.defaultType) {
        self.rules.userPass = [];
        self.rules.confirmPass = [];
      } else {
        self.rules.userPass = [{ type: 'required', trigger: 'blur change' }, { type: 'passwordLegal' }];
        self.rules.confirmPass = [{ type: 'required', trigger: 'blur change' }, { type: 'passwordEquals', context: this, value: "reconstForm.userPass" }];
      }
  },
  mounted() {
    this.initDialog();
    this.getData();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    resetPass(value) {
      var self = this;
      if (1 === value) {
        self.passFlag = false;
      } else {
        self.passFlag = true;
      }
    },
    templateTypeChange() {
       var self = this;
       self.multipleSelection = [];
       self.defaultType = 1;
       self.resetFlag = false;
       self.originalFlag = false;
       self.templateList = [];
       if ("1" == self.templateType + "") {
         self.getData();
       } else {
         self.loadVmSnapshotTypeList();
       }
    },
    getData() {
      var self = this;
      var middleList = [];
      var images = [];
      Promise.all([self.loadPublicImageList()]).then(function(result) {
        var data1 = result[0];
        // var data2 = result[1];
        middleList = data1;
        for (let m = 0; m < middleList.length; m++) { //遍历提出snap类型的镜像
          var obj = middleList[m];
          if (obj.tags.includes('*')) {
            continue;
          }
          if (obj['image_type'] == "backup") {
            continue;
          }
          if ((obj.hasOwnProperty("image_type") && obj['image_type'] == "snapshot") || typeof (obj['block_device_mapping']) != "undefined") {
            continue;
          } else {
            if ("private" == obj['visibility'] && self.instProjectId != obj['owner']) {
              continue;
            } else {
              images.push(obj);
            }
          }
        }
        self.totalData = images;
        self.templateList = images;
      });
    },
    async loadVmSnapshotTypeList() {
      var self = this;
      var snapshots = [];
      //主机快照
      Promise.all([self.loadInstanceSnapshot()]).then(function(result) {
        var data1 = result[0];
        for (let b = 0; b < data1.length; b++) {
          var entity2 = data1[b];
          entity2.snapshotType = "host"; //主机快照类型
          if (entity2.size > 0) {
             snapshots.push(entity2);
          }
        }
        self.totalData = snapshots;
        self.templateList = snapshots;
      });
    },
    //主机快照
    async loadInstanceSnapshot() {
      var self = this;
      var rets = [];
      let ret = await this.$ajax({
        type: 'get',
        url: "api/glance/v2/images?limit=99999&&status=active"
      });
      var list = ret.images;
      if (list != null) {
        for (let r = 0; r < list.length; r++) {
          var obj = list[r];
          if (typeof (obj['block_device_mapping']) != "undefined") {
            if ("private" == obj['visibility'] && self.instProjectId != obj['owner']) {
              continue;
            }
              rets.push(obj);
          } else {
            if (typeof (obj['image_type']) != "undefined" && (obj['image_type'] == "snapshot" || obj['image_type'] == "backup") ) {
               if ("private" == obj['visibility'] && self.instProjectId != obj['owner']) {
                 continue;
               }
               rets.push(obj);
            }
          }
        }
      }
      return rets;
    },
    //查询项目下私有镜像
    async loadProjectImageList() {
      var self = this;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/glance/v2/images?limit=99999&visibility=private&status=active",
          showErrMsg: true
        });
        self.loading = false;
        return result['images'];
      } catch (res) {
        self.loading = false;
      }
    },
    //public的镜像列表
    async loadPublicImageList() {
      var self = this;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/glance/v2/images?limit=99999&status=active",
          showErrMsg: true
        });
        self.loading = false;
        return result['images'];
      } catch (res) {
        self.loading = false;
      }
    },
    sortChange(column) {
       var self = this;
       var key = column.prop;
       var keyOrder = column.order;
       if (keyOrder != null && self.totalData != null) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder));
       }
    },
    handleCancel() {
      this.$emit("handleRescueFlag", {});
    },
    handleClose(done) {
      this.$emit("handleRescueFlag", {});
      done();
    },
    confirmAddDisk() {
      var self = this;
      self.$refs.reconstForm.validate(async (valid) => {
        if (valid) {
          if (self.multipleSelection.length === 0) {
            self.$message({
              showClose: true,
              message: this.$t('calcStorLang.instCreateChooseTemp'),
              type: 'warning'
            });
          } else {
            self.saving = true;
            var entity = self.multipleSelection[0];
            var body = {"rescue_inspur":{"rescue_image_ref": entity.id, adminPass: self.reconstForm.userPass}};
            if (self.defaultType == "2") {
                body['rescue_inspur'].adminPass = self.reconstForm.userPass;
            }
            body = JSON.stringify(body);
            try {
              let result = await self.$ajax({
                type: 'post',
                url: "api/nova/v2.1/servers-inspur/" + self.instUuid + "/action",
                data: body,
                showErrMsg: true,
                errorKey: "badRequest",
                log: {
                  description: {
                    en: "Rescue Instance:" + self.instName,
                    zh_cn: "援救云主机:" + self.instName
                  },
                  key: "name",
                  target: Vue.logTarget.computeInstance
               }
              });
              self.loading = false;
              self.$message(this.$t('calcStorLang.rescueInstSuccess'));
              self.$emit("handleRescueFlag", {});
              self.$emit("onRefresh");
            } catch (res) {
              self.saving = false;
              self.loading = false;
            }
          }
        }
      });
    },
    async loadImageDetail(id) {
      var self = this;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/glance/v2/images/" + id,
          showErrMsg: true
        });
        self.loading = false;
        return result['base_image_ref'];
      } catch (res) {
        self.loading = false;
      }
    },
    queryClick(value) {
      var self = this;
      var result = self.loadSearchTemplateList();
      self.totalData = result;
    },
    loadSearchTemplateList() {
       var self = this;
       var searchKeyList = self.initSearchKey();
       var sourceTemplateList = self.templateList;
       var templates = [];
       for (let t = 0; t < sourceTemplateList.length; t++) {
          var obj = sourceTemplateList[t];
          var matchCount = 0;
          for (let k = 0; k < searchKeyList.length; k++) {
             var sObj = searchKeyList[k];
             var sKey = sObj['key'];
             var sValue = sObj['value'];
             sValue = sValue.toLowerCase();
             if ( typeof (obj[sKey]) != "undefined" && obj[sKey].toLowerCase().indexOf(sValue) >= 0) {
                ++matchCount;
             } else {
                break;
             }
          }
          if (matchCount == searchKeyList.length) {
              templates.push(obj);
          }
       }
           return templates;
    },
    initSearchKey() {
       var self = this;
       var sourceName = self.searchName;
       var sourceOs = self.osType;
       var searchList = [];
       if (sourceName != "") {
         searchList.push({"key": "name", "value": sourceName});
       }
       if (sourceOs != "") {
         searchList.push({"key": "os_distro", "value": sourceOs});
        }
        return searchList;
    },
    diskRender(value, row) {
      var self = this;
      var size = row['size'];
      return self.formatFileSize(size, "Byte");
    },
    osRender(value, rowData) {
      var osName = rowData['os_distro'];
      if (osName == null || osName == "") {
        return '-';
      } else {
        return osName;
      }
    },
    visibilityRender(value, row) {
      if ("public" == value) {
        return this.$t('lang.public');
      } else if ("shared" == value) {
        return Vue.t('calcStorLang.shared');
      } else if ("private" == value) {
        return this.$t('lang.private');
      } else {
        return "-";
      }
    },
    onRefresh() {
      this.multipleSelection = [];
      this.templateTypeChange();
    },
    handleSelectionChange(val) {
      var self = this;
      var list = [];
      self.defaultType = 1;
      self.originalFlag = false;
      self.resetFlag = false;
      if (val != null) {
        /*if (val.os_distro != null) {
          self.resetFlag = false;
        } else {
          self.resetFlag = true;
        }*/
        list.push(val);
        var os = val.os_distro;
        if (os != null && os != "" && os.toLocaleLowerCase().indexOf("win") >= 0) {
          self.defaultType = 2;
          self.originalFlag = true;
          self.resetFlag = false;
        } else {
          self.loadSystemPass(val.id);
        }
      }
      self.multipleSelection = list;
    },
    /**
     * 举例
     * 已知变量：
     * vmImageId: 选择的某个云主机的所在的镜像ID
     * 1、云主机来源：镜像
     * a.援救来源：镜像
     *  对比：选中镜像的id 同vmImageId对比
     *  如果vmImageId == id 则 只能用 原始密码
     *  否则重置密码
     * b.援救来源：云主机快照
     *   对比：选中云主机快照的id 同vmImageId对比
     *   如果vmImageId == id 则 只能用 原始密码
     *   如果vmImageId != id 继续 调用image的detail接口(返回base_image_ref字段)继续对比，如果 vmImageId == *base_image_ref只能选原始密码，否则重置密码
     *2、云主机来源：云主机快照
     * a.援救来源：镜像
     *  对比：选中镜像的id 同vmImageId对比，
     *  如果vmImageId==id 则 用 原始密码，否则继续调用image的detail接口(返回base_image_ref字段)继续对比，
     *  此处调用detail传递参数为vmImageId，返回base_image_ref，
     *  如果id== base_image_ref， 只能选 原始密码，否则重置密码
     * b.援救来源：云主机快照
     *  对比：选中的云主机快照的id 同vmImageId对比，
     *  如果vmImageId== id 则用 原始密码，否则继续调用image的detail接口(返回base_image_ref字段)继续对比，
     * 此处一共需要调用两次接口detail,一次通过vmImageId调用detail返回的base_image_ref2，
     * base_image_ref2 == base_image_ref只能选择原始密码,否则重置密码
     *
     */
    loadSystemPass(templateId) {
      var self = this;
      var instSourceTemplate = self.instSource; //1:镜像 4:云主机快照
      var rescuseTemplate = self.templateType; //选择援救的 类型 1:镜像 2:云主机快照
      if (instSourceTemplate == "image") { //镜像
        if (rescuseTemplate == "1") {
          if (self.instImageId == templateId) {
             self.defaultType = 1;
             self.resetFlag = true;
          } else {
            self.defaultType = 2;
            self.originalFlag = true;
          }
        } else {
          Promise.all([self.loadImageDetail(templateId)]).then(function(result) {
            var baseImageRefId = result[0];
            if (self.instImageId == baseImageRefId) {
              self.defaultType = 1;
              self.resetFlag = true;
            } else {
              self.defaultType = 2;
              self.originalFlag = true;
            }
          });
        }
      } else if (instSourceTemplate == "snapshot") { //云主机快照
         if (rescuseTemplate == "1") {
           Promise.all([self.loadImageDetail(self.instImageId)]).then(function(result) {
             var baseImageRefId2 = result[0];
             if (baseImageRefId2 == templateId) {
               self.defaultType = 1;
               self.resetFlag = true;
             } else {
               self.defaultType = 2;
               self.originalFlag = true;
             }
           });
         } else {
           if (self.instImageId == templateId) {
              self.defaultType = 1;
              self.resetFlag = true;
           } else {
              Promise.all([self.loadImageDetail(self.instImageId), self.loadImageDetail(templateId)]).then(function(result) {
                  var baseImageRefId3 = result[0];
                  var baseImageRefId4 = result[1];
                  if (baseImageRefId3 == baseImageRefId4) {
                    self.defaultType = 1;
                    self.resetFlag = true;
                  } else {
                    self.defaultType = 2;
                    self.originalFlag = true;
                  }
              });
           }
         }
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    }
  }
}
</script>
<style scoped>
</style>
