<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel" @mousedown="detailMouseDown">
    <operation-panel
      :select-rows="multipleSelection"
      :operation-menus="operationMenus"
      :operateMore="operateMore"
      :projectId="proId">
    </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table
      ref="imageTable"
      :data="tableData"
      highlight-current-row
      stripe
      border
      style="width: 100%"
      row-key="id"
      @row-click="rowClick"
      :default-sort="{prop: 'created_at', order: 'descending'}"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column
        reserve-selection
        type="selection"
        width="55" align="center"
        :selectable="function(row, index) { return !['pending_delete'].includes(row['status']) }">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        :label="$t('lang.name')"
        prop="name"
        align="left"
        sortable="custom"
        min-width="60">
        <template slot-scope="scope">
        <el-button @click="imageDetail(scope.row)" type="text" size="small" >
            <span>{{scope.row.name == null || scope.row.name == "" ? scope.row.id : scope.row.name}}</span>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('owner') >= 0 && isadmin"
        :label="$t('lang.project')"
        prop="owner"
        align="left"
        min-width="40">
        <template slot-scope="scope">
          <span v-html="queryProjecName(scope.row.owner, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('disk_format') >= 0"
        prop="disk_format"
        :label="$t('calcStorLang.imageType')"
        align="left"
        min-width="40">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('status') >= 0"
        prop="status"
        :label="$t('lang.status')"
        align="left"
        min-width="40">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.status)">
            <span v-html="statusRender(scope.row.status, scope.row)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('visibility') >= 0"
        prop="visibility"
        :label="$t('calcStorLang.visibility')"
        align="left"
        min-width="40">
        <template slot-scope="scope">
          <span v-html="visibilityRender(scope.row.visibility, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('protected') >= 0"
        prop="protected"
        :label="$t('calcStorLang.protected')"
        align="left"
        min-width="40">
        <template slot-scope="scope">
          <span v-html="protectedRender(scope.row.protected, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('size') >= 0"
        prop="size"
        :label="$t('calcStorLang.size')"
        align="left"
        min-width="40">
        <template slot-scope="scope">
          <span v-html="sizeRender(scope.row.size, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('uploaded') >= 0"
        :label="$t('calcStorLang.IMAGE_UPLOADED')"
        align="left"
        min-width="40">
        <template slot-scope="scope">
          <span v-if="getImageUploadedBytes(scope.row.id)">
            {{ (getImageUploadedBytes(scope.row.id)) | fileSize }}
          </span>
          <span v-else>
            -
          </span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('created_at') >= 0"
        prop="created_at"
        sortable="custom"
        :label="$t('calcStorLang.createTime')"
        align="left"
        min-width="80">
        <template slot-scope="scope">
          <span v-html="dateRender(scope.row.created_at, scope.row)"></span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onTblRefresh">
          </el-button>
            <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}} {{$tc("lang.item", multipleSelection.length)}}</span>
            <el-popover
              placement="right"
              trigger="click">
              <el-checkbox-group class="vertical"
                v-model="columnsChecked">
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
      <add-image
        ref="addImage"
        v-if="addFlag"
        @handleAddShow="handleAddShow"
        @start-upload="startBreakResumeUpload"
        @onRefresh="onRefresh" />
      <image-break-resume
        v-if="imageBreakResumeDialog.visible"
        :id="imageBreakResumeDialog.id"
        :file="imageBreakResumeDialog.file"
        @close="imageBreakResumeDialog.visible = false; imageBreakResumeDialog.file = null;"
        @refresh="onRefresh" />
      <edit-image
        ref="editImage"
        v-if="editFlag"
        :imageInfo="imageInfo"
        @handleEditShow="handleEditShow"
        @onRefresh="onRefresh" />
      <transition name="slide-right" mode="out-in">
        <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
          <panel style="height: 100%">
            <div slot="title" class="clearfix" >
            <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
            </div>
            <div>
            <image-detail :imageInfo="imageInfo" :ownerName="detailOwnerName" ></image-detail>
            </div>
          </panel>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import OperateImage from './OperateImage';
import AddImage from './AddImage';
import ImageBreakResume from '../../image/ImageBreakResume';
import EditImage from './EditImage';
import ImageDetail from './ImageDetail';
import osJson from '../../image/OsJson.json';
export default {
  name: "ImageList",
  components: {
    AddImage, ImageBreakResume, EditImage, ImageDetail
  },
  data() {
    return {
      sortObj:{
        sortOrder:"descending",
        sortField:"created_at"
      },
      isadmin: Vue.roleType == "0",
      projectlist: [],
      projecNameMap: new Map(),
      detailOwnerName: '',
      imageInfo: '',
      proId: this.$cookie.get('pid'),
      imageVisiabloe: '',
      totalData: [],
      addFlag: false,
      editFlag: false,
      detailFlag: false,
      reloadTblFlag: false,
      pageSizes: [10, 20, 30],
      pageSize: 10,
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "owner",
        label: Vue.t('lang.project')
      }, {
        prop: "disk_format",
        label: Vue.t('calcStorLang.imageType')
      }, {
        prop: "status",
        label: Vue.t('lang.status')
      }, {
        prop: "visibility",
        label: Vue.t('calcStorLang.visibility')
      }, {
        prop: "protected",
        label: Vue.t('lang.protected')
      }, {
        prop: "size",
        label: Vue.t('calcStorLang.size')
      }, {
        prop: "uploaded",
        label: Vue.t('calcStorLang.IMAGE_UPLOADED')
      }, {
        prop: "created_at",
        label: Vue.t('lang.createTime')
      }],
      columnsChecked: ['name', 'owner', 'disk_format', 'status', 'visibility', 'protected', 'size', 'created_at'],
      tableData: [],
      multipleSelection: [],
      operationMenus: OperateImage.bind(this)(),
      operateMore: false,
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
          },
          disk_format: {
            label: this.$t('calcStorLang.imageType'),
            type: 'select',
            options: [{
              label: 'qcow2',
              value: 'qcow2'
            }, {
              label: 'raw',
              value: 'raw'
            }, {
              label: 'aki',
              value: 'aki'
            }, {
              label: 'ari',
              value: 'ari'
            }]
          }
        },
        validatedParams: {}
      },
      imageBreakResumeDialog: {
        id: '',
        file: null,
        visible: false
      }
    }
  },
  beforeDestroy() {
    if (this.interVmValid != null) {
      clearInterval(this.interVmValid);
    }
  },
  watch: {
    columnsChecked: {
      handler: function(rows, oldVal) {
        this.columnsChecked = rows;
      },
      deep: true
    },
    tableData: {
      immediate: false,
      handler: function(list) {
        var self = this;
        self.reloadTblFlag = false;
        if (list != null) {
          for (var t = 0; t < list.length; t++) {
            var obj = list[t];
            if (obj['OS-EXT-STS:task_state'] != null || obj['status'] == "queued" || obj['status'] == "saving" || obj['status'] == "pending_delete") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.interVmValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interVmValid = setInterval(() => {
              this.getData()
            }, 5000);
        }
      }
    }
  },
  mounted() {
    let acTable = this.$refs.imageTable;
    this.getData();
  },
  methods: {
    sortChange(column) {
       var self = this;
       if (!column.prop) { return; }
       self.sortObj = {
         sortOrder:column.order,
         sortField:column.prop
       };
    },
    detailMouseDown() {
      var self = this;
      self.detailFlag = false;
    },
    async getData() {
      var self = this;
      await self.getAllFileUploadProgress('upload_images');
      self.loadProjectList();
      var resultData = [];
      var roleType = Vue.roleType + "";
      let projectId = this.$cookie.get('pid');
      let query = '';
      if (self.searchBar.validatedParams.disk_format) {
        query += `&disk_format=${self.searchBar.validatedParams.disk_format}`;
      }
      let ret = await this.$ajax({
        type: 'get',
        url: "api/glance/v2/images?limit=99999&tag=*" + query
      });
      let images = ret.images;
      for (var i = 0; i < images.length; i++) {
        let image = images[i];
        let name = image['name'];
        let size = image['size'];
        image['projectId'] = projectId;
        image['roleType'] = roleType;
        if (name == null) {
          continue;
        }
        if ("snapshot" == image['image_type'] || typeof (image['block_device_mapping']) != "undefined") {
          continue;
        }
         if ("2" == roleType || "3" == roleType) {
          if ("private" == image['visibility'] && projectId != image['owner']) {
              continue;
          }
        }
        let queryName = '';
        if (self.searchBar.validatedParams.name) {
          queryName = self.searchBar.validatedParams.name.toLowerCase();
        }
        if (image.name && image.name.toLowerCase().includes(queryName)) {
          resultData.push(image);
        }
      }
      self.totalData = resultData;
      self.loading = false;
    },
    isAdmin() {
      var roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        return false;
      }
      return true;
    },
     getCurrentData(param) {
      this.tableData = param;
    },
    imageDetail(row) {
      this.detailFlag = true;
      this.imageInfo = row;
      this.detailOwnerName = this.projecNameMap.get(row.owner)
      this.$refs.imageTable.clearSelection();
    },
     async loadProjectList() {
      //查询所有的项目列表
      var self = this;
      self.loading = true;
      var roleType = Vue.roleType + "";
      var url = "api/keystone/v3/projects?domain_id=default";
      if ("2" == roleType || "3" == roleType) { //非超级管理员，查询一个项目信息
        url = "api/keystone/v3/projects/" + this.$cookie.get("pid");
      }
       try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        self.loading = false;
        self.projecNameMap = new Map();
        var projects = result['projects'];
        for (var p = 0; p < projects.length; p++) {
          var tempP = projects[p];
          self.projecNameMap.set(tempP.id, tempP.name);
        }
        //self.projectlist = projects;
        self.projectlist = [];
        if ("2" == roleType || "3" == roleType) {
          self.projectlist.push(result['project']);
        } else {
          // self.projectlist.push({"name":"", "id":""});
          self.projectlist = self.projectlist.concat(projects);
        }
      } catch (res) {
        self.loading = false;
      }
    },
    onBack() {
      this.detailFlag = false;
    },
    handleAddShow() {
      this.addFlag = false;
    },
    handleEditShow() {
      this.editFlag = false;
    },
    rowClick(row) {
      this.$refs.imageTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onTblRefresh() {
       var self = this;
       self.$refs.imageTable.clearSelection();
       self.getData();
    },
    onRefresh() {
      this.$refs.imageTable.clearSelection();
      this.getData();
    },
    statusTagRender(status) {
        if ("active" == status || "reserved" == status) {
           return "success";
        } else if ("killed" == status || "pending_delete" == status) {
           return "gray";
        } else if ("queued" == status ) {
           return "info";
        } else if ("deleted" == status) {
           return "danger";
        } else if ("in-use" == status ) {
           return "info";
        } else if ("deactivated" == status) {
           return "warning";
        } else if ("saving" == status ) {
           return "info";
        } else {
          return "";
        }
    },
    statusRender(value, rowData) {
       if (value == "queued") {
           return Vue.t('calcStorLang.queued');
       } else if (value == "saving") {
           return Vue.t('calcStorLang.saving');
       } else if (value == "active") {
           return Vue.t('calcStorLang.active');
       } else if (value == "killed") {
           return Vue.t('calcStorLang.killed');
       } else if (value == "deleted") {
           return Vue.t('calcStorLang.deleted');
       } else if (value == "pending_delete") {
           return Vue.t('calcStorLang.pendingDelete');
       } else if (value == "deactivated") {
           return Vue.t('calcStorLang.deactivated');
       } else {
           return "-";
       }
    },
    visibilityRender(value, rowData) {
        if (value == "private") {
           return Vue.t('lang.private');
       } else if (value == "public") {
           return Vue.t('lang.public');
       } else if (value == "shared") {
           return Vue.t('lang.shared');
       } else {
           return "-";
       }
    },
    protectedRender(value, rowData) {
       if (value == true) {
           return Vue.t('lang.yes');
       } else if (value == false) {
           return Vue.t('lang.no');
       } else {
           return "-";
       }
    },
    queryProjecName(value, rowData) {
      return this.projecNameMap.get(value);
    },
    sizeRender(value, rowData) {
      var self = this;
      var size = 0;
      var initFlag = 0;
      var unitFlag = " Bytes";
      while (value>=1024) {
        value = value/1024;
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
      size = value+unitFlag;
      return size;
    },
    dateRender(value, rowData) {
      var self = this;
      if (value.lastIndexOf("Z") < 0 && value.lastIndexOf(".") >= 0) {
        value = value.substring(0, value.lastIndexOf(".")) + "Z";
      }
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
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.$refs.imageTable.clearSelection();
      this.getData(1);
      this.$refs.pageComponent.setCurrentPage(1);
    },
    startBreakResumeUpload(id, file) {
      this.imageBreakResumeDialog.id = id;
      this.imageBreakResumeDialog.file = file;
      this.imageBreakResumeDialog.visible = true;
    },
    getImageUploadedBytes(id) {
      let self = this;
      if (self.uploadProgressList) {
        let results = self.uploadProgressList.filter((uploadProgress) => {
          return (uploadProgress['Key'] || '').indexOf(id) >= 0;
        });
        if (results.length > 0) {
          return results[0].Uploaded;
        }
      }
      return 0;
    },
    async getAllFileUploadProgress(bucketName) {
      let _self = this;
      let data = await _self.$ajax({
        type: 'get',
        url: `node-api/fake-s3/${bucketName}/all-file/upload-progress`,
        showErrMsg: false
      });
      _self.uploadProgressList = data;
    }
  }
}
</script>

