<template>
  <el-dialog :title="$t('calcStorLang.reconstructionInst')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="reconstForm" label-width="100px" label-position="left" :rules="rules" :model="reconstForm">
      <el-form-item :label="$t('calcStorLang.createInstTempSource')" class="is-required">
        <el-radio-group v-model="templateType" @change="templateTypeChange">
        <el-radio class="radio" label="1">{{$t('calcStorLang.image')}}</el-radio>
        <el-radio class="radio" label="2">{{$t('calcStorLang.instanceshot')}}</el-radio>
      </el-radio-group>
      </el-form-item>
      <el-form-item label="" class="is-required" label-width="100px">
      <span>{{$t('lang.name')}}</span>
      <el-input class="col-5" v-model="searchName" auto-complete="off"></el-input>
      <span>{{$t('calcStorLang.os')}}</span>
      <el-input class="col-5" v-model="osType" auto-complete="off"></el-input>
      <span v-show="templateType=='1'">{{$t('calcStorLang.visibility')}}</span>
      <el-select v-model="visibleValue" class="col-5" v-show="templateType=='1'">
        <el-option :label="$t('lang.all')" value="0"></el-option>
        <el-option :label="$t('lang.public')" value="public"></el-option>
        <el-option :label="$t('lang.private')" value="private"></el-option>
        <el-option :label="$t('calcStorLang.shared')" value="shared"></el-option>
      </el-select>
      <el-button type="primary" icon='fa-search' size="small" @click="queryClick()">{{$t('lang.query')}}</el-button>
    </el-form-item>
      <el-form-item :label="$t('calcStorLang.createInstChooseTemplate')" class="is-required">
        <el-table ref="umTable" :data="tableData" highlight-current-row border stripe row-key="id" highlight-current-row @current-change="handleSelectionChange" @sort-change="sortChange">
          <!-- <el-table-column reserve-selection type="selection" align="center" width="55">
          </el-table-column> -->
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
          <el-radio class="radio" :label="1">{{$t('calcStorLang.oldPassword')}}</el-radio>
          <el-radio class="radio" :label="2" :disabled="resetFlag">{{$t('lang.resetPassword')}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('lang.userName')" prop="userName" class="is-required" v-show="passFlag">
          <!-- <span>超级管理员账户</span> -->
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
  props: ['instUuid', 'instProjectId', 'instUserId', 'instName'],
  data() {
    return {
      reconstForm: {
        userPass: '',
        confirmPass: ''
      },
      visibleValue: "0",
      searchName: '',
      osType: '',
      templateList: [],
      userName: 'Administrator/root',
      formatFileSize: formatFileSize,
      templateType: "1",
      saving: false,
      resetFlag: false,
      pageCount: 5,
      totalData: [],
      currentPage: 1,
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
      defaultType: 1,
      passFlag: false,
      tzTimeFormatter: this.$tzTimeFormatter,
      columnsChecked: ['name', 'os', 'size', 'visibility', 'date'],
      tableData: [],
      multipleSelection: [],
      dialogVisible: false,
      diskPartition: 'ssh',
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 20 }
        ],
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
    templateTypeChange() {
       var self = this;
       self.visibleValue = "0";
       self.searchName = "";
       self.osType = "";
       self.multipleSelection = [];
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
        self.templateList = images;
        self.totalData = images;
      });
    },
    queryClick(value) {
      var self = this;
      // var result = self.loadSearchByKey();
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
       var sourceType = self.templateType;
       var sourceName = self.searchName;
       var sourceOs = self.osType;
       var sourceVisiable = self.visibleValue + "" == "0"?"":self.visibleValue;
       var searchList = [];
       if ("1" == sourceType) { //镜像
          if (sourceName != "") {
             searchList.push({"key": "name", "value": sourceName});
          }
          if (sourceOs != "") {
             searchList.push({"key": "os_distro", "value": sourceOs});
          }
          if (sourceVisiable != "") {
             searchList.push({"key": "visibility", "value": sourceVisiable});
          }
       } else if ("2" == sourceType) { //云硬盘 Or 云硬盘快照
          if (sourceName != "") {
            searchList.push({"key": "name", "value": sourceName});
          }
          if (sourceOs != "") {
             searchList.push({"key": "os_distro", "value": sourceOs});
          }
       }
         return searchList;
    },
    async loadVmSnapshotTypeList() {
      var self = this;
      var snapshots = [];
      //主机快照
      Promise.all([self.loadInstanceSnapshot()]).then(function(result) {
        var data1 = result[0];
        // snapshots = data1;
        for (let b = 0; b < data1.length; b++) {
          var entity2 = data1[b];
          entity2.snapshotType = "host"; //主机快照类型
          if (entity2.size > 0) {
             snapshots.push(entity2);
          }
        }
        self.templateList = snapshots;
        self.totalData = snapshots;
      });
    },
    //主机快照
    async loadInstanceSnapshot() {
      var self = this;
      let projectUuid = this.$cookie.get('pid');
      var resultData = [];
      var roleType = Vue.roleType + "";
      let ret = await this.$ajax({
        type: 'get',
        url: "api/glance/v2/images?limit=99999&&status=active"
      });
      var list = ret.images;
      var rets = [];
      if (list != null) {
        for (let r = 0; r < list.length; r++) {
          var obj = list[r];
          if (typeof (obj['block_device_mapping']) != "undefined") {
            if ("private" == obj['visibility'] && self.instProjectId != obj['owner']) {
              continue;
            }
              rets.push(obj);
          } else {
            if (typeof (obj['image_type']) != "undefined" && (obj['image_type'] == "snapshot"|| obj['image_type'] == "backup") ) {
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
          type: 'post',
          url: `api/glance/v2/images/list?limit=99999&status=active`,
          data: JSON.stringify({
            project_id: self.instProjectId,
            user_id: self.instUserId
          }),
          showErrMsg: true
        });
        self.loading = false;
        return result['images'];
      } catch (res) {
        self.loading = false;
      }
    },
    resetPass(value) {
      var self = this;
      if (1 === value) {
        self.passFlag = false;
      } else {
        self.passFlag = true;
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
      this.$emit("handleReconFlag", {});
    },
    handleClose(done) {
      this.$emit("handleReconFlag", {});
      done();
    },
    confirmAddDisk() {
      var self = this;
      self.$refs.reconstForm.validate((valid) => {
        if (valid) {
          if (self.multipleSelection.length === 0) {
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateChooseTemp'),
              type: 'warning'
            });
          } else {
            self.$prompt(Vue.t('calcStorLang.reconstructionOperateConfirm'), Vue.t('calcStorLang.confirm'), {
              confirmButtonText: Vue.t('lang.confirm'),
              cancelButtonText: Vue.t('lang.cancel'),
              inputPattern: /^YES$|^NO$/i,
              inputValue: "NO",
              customClass: "promptConfirmDel",
              inputErrorMessage: Vue.t('lang.onlyAcceptYesOrNo')
            }).then(async ({ value }) => {
              if ("yes" === value.toLowerCase()) {
                self.saving = true;
                var entity = self.multipleSelection[0];
                var body = {"rebuild":{"imageRef": entity.id, adminPass: ""}};
                if (self.defaultType == "2") {
                    body['rebuild'].adminPass = self.reconstForm.userPass;
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
                        en: "Reconstruction Instance:" + self.instName,
                        zh_cn: "重建云主机:" + self.instName
                      },
                      target: Vue.logTarget.computeInstance
                  }
                  });
                  self.loading = false;
                  self.$message(Vue.t('calcStorLang.instReconstructionSuccess'));
                  self.$emit("handleReconFlag", {});
                  self.$emit("onRefresh");
                } catch (res) {
                  self.saving = false;
                  self.loading = false;
                }
              }
            }).catch(() => {
                //取消
            });
          }
        }
      });
    },
    diskRender(value, row) {
      var self = this;
      var size = row['size'];
      return self.formatFileSize(size, "Byte");
      // return (size / (1024 * 1024 * 1024)).toFixed(2) + "GB";
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
        return Vue.t('lang.public');
      } else if ("shared" == value) {
        return Vue.t('calcStorLang.shared');
      } else if ("private" == value) {
        return Vue.t('lang.private');
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
      if (val != null) {
        if (val.size > 0) {
          if (val.os_distro != null) {
            self.resetFlag = false;
          } else {
            self.resetFlag = true;
          }
        } else {
          self.resetFlag = true;
        }
        list.push(val);
      }
      self.multipleSelection = list;
    },
    getCurrentData(param) {
      this.tableData = param;
    }
  }
}
</script>
<style scoped>
</style>
