<template>
  <div>
    <icos-page-header :title="$t('calcStorLang.image')" :show-bottom-border="true" />
    <icos-page>
      <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
      <div class="divider clearfix"></div>
      <div class="operation-panel" @mousedown="detailMouseDown">
      <operation-panel
        ref="operationOperate"
        :select-rows="multipleSelection"
        :operation-menus="operationMenus"
        :operateMore="operateMore">
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
        <el-table-column v-if="columnsChecked.indexOf('id') >= 0"
          prop="id"
          label="ID"
          sortable="custom"
          min-width="50">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('owner') >= 0 && isAdmin"
          :label="$t('lang.project')"
          prop="owner"
          align="left"
          min-width="40">
          <template slot-scope="scope">
            <span v-html="queryProjectName(scope.row.owner, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('os_distro') >= 0"
          prop="os_distro"
          :label="$t('calcStorLang.os')"
          align="left"
          sortable="custom"
          min-width="50">
          <template slot-scope="scope">
            <span> {{typeof(scope.row.os_distro) == "undefined" ? '-' : scope.row.os_distro}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('disk_format') >= 0"
          prop="disk_format"
          :label="$t('calcStorLang.imageType')"
          sortable="custom"
          align="left"
          min-width="40">
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('status') >= 0"
          prop="status"
          :label="$t('lang.status')"
          sortable="custom"
          align="left"
          min-width="40">
          <template slot-scope="scope">
            <el-tag :type="statusTagRender(scope.row.status)">
              <span v-html="statusRender(scope.row.status, scope.row)"></span>
            </el-tag>
            <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.imageQueueTip')" v-show="uploadFlagShow(scope.row)">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
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
          v-if="columnsChecked.indexOf('virtual_size') >= 0"
          :label="$t('calcStorLang.IMAGE_VIRTUAL_SIZE')"
          align="left"
          min-width="40">
          <template slot-scope="scope">
            <span v-if="scope.row.inspur_virtual_size">
              {{ scope.row.inspur_virtual_size | fileSize }}
            </span>
            <span v-else>
              -
            </span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('visibility') >= 0"
          prop="visibility"
          :label="$t('calcStorLang.visibility')"
          align="left"
          sortable="custom"
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
          sortable="custom"
          min-width="40">
          <template slot-scope="scope">
            <span v-html="protectedRender(scope.row.protected, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('size') >= 0"
          prop="size"
          :label="$t('calcStorLang.size')"
          sortable="custom"
          align="left"
          min-width="40">
          <template slot-scope="scope">
            <span v-if="scope.row.size !== undefined && scope.row.size !== null">
              {{ scope.row.size | fileSize }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('created_at') >= 0"
          prop="created_at"
          sortable="custom"
          :label="$t('lang.createTime')"
          align="left"
          min-width="80">
          <template slot-scope="scope">
            {{ scope.row.created_at | dateTimeFormatter }}
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('description') >= 0"
          prop="description"
          :label="$t('lang.desc')"
          min-width="50">
          <template slot-scope="scope">
            <span>{{scope.row.description}}</span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="false" v-if="columnsChecked.indexOf('tags') >= 0 && roleType !== '3'" prop="tags" :label="$t('calcStorLang.IMAGE_TAGS')">
          <template slot-scope="scope">
            <expandable-cell>
              <el-tag type="primary" v-for="(tag, index) in scope.row.tags" :key="index" :close-transition="true" style="margin: 0 5px 0 0;">{{ tag }}</el-tag>
            </expandable-cell>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onTblRefresh">
            </el-button>
              <span>{{$t('calcStorLang.currentSelect')}} {{multipleSelection.length}}{{$t('calcStorLang.bar')}}</span>
              <el-popover
                placement="right"
                trigger="click">
                <el-checkbox-group class="vertical"
                  v-model="columnsChecked">
                  <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="index">{{item.label}}
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
        <transition name="slide-right" mode="out-in">
          <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
            <panel style="height: 100%">
              <div slot="title" class="clearfix" >
                <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
              </div>
              <div>
                <image-detail :imageInfo="imageInfo" :ownerName="detailOwnerName" @refresh="onRefresh"></image-detail> 
              </div>
            </panel>
          </div>
        </transition>
      </div>
      <add-image ref="addImage"  v-if="addFlag" @handleAddShow="handleAddShow" @onRefresh="onRefresh"></add-image>
      <add-image-break-resume
        v-if="addImageBreakResumeDialog.visible"
        @handleAddShow="addImageBreakResumeDialog.visible = false"
        @start-upload="startBreakResumeUpload"
        @refresh="onRefresh"
      />
      <image-break-resume
        v-if="imageBreakResumeDialog.visible"
        :id="imageBreakResumeDialog.id"
        :file="imageBreakResumeDialog.file"
        @close="imageBreakResumeDialog.visible = false; imageBreakResumeDialog.file = null;"
        @refresh="onRefresh" />
      <create-instance
        v-if="createInstanceDialog.visible"
        :preset-data="createInstanceDialog"
        @close="createInstanceDialog.visible = false"
        @refresh="gotoInstanceList"
      />
      <edit-image ref="editImage"  v-if="editFlag" :imageInfo="imageInfo" @handleEditShow="handleEditShow" @onRefresh="onRefresh"></edit-image>
      <new-volume ref="NewVolume"  v-if="newVolumeFlg" @handleShow="handleShow" :imageInfo="imageInfo" :entranceCode="'ImageList'"></new-volume>
      <res-image-share ref="resImageShare" v-if="shareImageFlag" @handleImageShareShow="handleImageShareShow" :imageInfo="imageInfo" :projecNameMap="projecNameMap"></res-image-share>
      <refresh-metadata ref="refreshMetadata" v-if="refreshMetadataFlg" @handleMetaDataShow="handleMetaDataShow">
      </refresh-metadata>
      <metadata-list v-if="metadataList.visible" @close="metadataList.visible = false" :imageId="metadataList.imageId" @onRefresh="onRefresh" />
      <image-tags v-if="imageTags.visible" @close="imageTags.visible = false" :imageId="imageTags.imageId" @refresh="onRefresh" />     
    </icos-page>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import OperateImage from './OperateImage';
import AddImage from './AddImage';
import AddImageBreakResume from './AddImageBreakResume';
import ImageBreakResume from './ImageBreakResume';
import CreateInstance from '../instance/create-instance';
import EditImage from './EditImage';
import NewVolume from '../volume/NewVolume';
import ImageDetail from './ImageDetail';
import RefreshMetadata from './RefreshMetadata';
import ResImageShare from './ResImageShare';
import MetadataList from './MetadataList';
import ImageTags from './ImageTags';
import osJson from './OsJson.json';
export default {
  name: "ImageList",
  components: {
    EditImage, AddImage, AddImageBreakResume, ImageBreakResume, CreateInstance, NewVolume, ImageDetail, RefreshMetadata, ResImageShare, MetadataList, ImageTags
  },
  data() {
    return {
      roleType: Vue.roleType + '',
      sortObj:{
        sortOrder:"descending",
        sortField:"created_at"
      },
      selProjectFlg:false,
      close:"",
      projectName:"",
      project_id:"",
      isAdmin: Vue.roleType === "0",
      projectlist: [],
      projecNameMap: new Map(),
      projectListMap: new Map(),
      detailOwnerName: '',
      project: '',
      hightFlag:false,
      imageInfo: '',
      imageType: '',
      imageOs: [],
      totalData: [],
      uploadProgressList: [],
      addFlag: false,
      startFlag:false,
      editFlag: false,
      newVolumeFlg: false,
      detailFlag: false,
      refreshMetadataFlg: false,
      reloadTblFlag: false,
      shareImageFlag: false,
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "id",
        label: "ID"
      }, {
        prop: "owner",
        label: Vue.t('lang.project')
      }, {
        prop: "os_distro",
        label: Vue.t('calcStorLang.os')
      }, {
        prop: "disk_format",
        label: Vue.t('calcStorLang.imageType')
      }, {
        prop: "status",
        label: Vue.t('lang.status')
      }, {
        prop: "uploaded",
        label: Vue.t('calcStorLang.IMAGE_UPLOADED')
      }, {
        prop: "virtual_size",
        label: Vue.t('calcStorLang.IMAGE_VIRTUAL_SIZE')
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
        prop: "created_at",
        label: Vue.t('lang.createTime')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      }],
      columnsChecked: ['name', 'id', 'owner', 'os_distro', 'disk_format', 'status', 'virtual_size', 'visibility', 'protected', 'created_at'],
      tableData: [],
      multipleSelection: [],
      operationMenus: OperateImage.bind(this)(),
      operateMore: false,
      metadataList: {
        visible: false,
        imageId: ''
      },
      imageTags: {
        visible: false,
        imageId: ''
      },
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
          owner: {
            label: this.$t('lang.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          },
          os_distro: {
            label: this.$t('calcStorLang.os'),
            type: 'cascader',
            options: []
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
            }, {
              label: 'iso',
              value: 'iso'
            }]
          },
          visibility: {
            label: this.$t('calcStorLang.visibility'),
            type: 'select',
            options: [{
              label: this.$t('lang.public'),
              value: 'public'
            }, {
              label: this.$t('lang.private'),
              value: 'private'
            }, {
              label: this.$t('calcStorLang.shared'),
              value: 'shared'
            }]
          },
          id: {
            label: 'ID',
            type: 'input',
            validator: (value) => {
              if (!/^[a-fA-F0-9\-]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyUUIDKeyword'));
              }
            }
          },
          tag: {
            label: this.$t('calcStorLang.IMAGE_TAGS'),
            type: 'input',
            validator: (value) => {
              if (!/^[0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetterNumberChinese'));
              }
            }
          }
        },
        validatedParams: {}
      },
      addImageBreakResumeDialog: {
        visible: false
      },
      imageBreakResumeDialog: {
        id: '',
        file: null,
        visible: false
      },
      createInstanceDialog: {
        visible: false,
        canSelectSource: false,
        sourceType: 'image',
        sourceId: '',
        sourceName: '',
        sourceOSDistro: '',
        sourceMinRam: 0,
        sourceMinDisk: 0,
        sourceImageFormat: '',
        sourceSize: 0,
        sourceVirtualSize: 0,
        projectId: '',
        projectIdLocked: false
      }
    };
  },
  beforeDestroy() {
    if (this.interVmValid != null) {
      clearInterval(this.interVmValid);
    }
  },
  watch: {
    tableData: {
      immediate: false,
      handler: function(list) {
        var self = this;
        self.reloadTblFlag = false;
        if (list != null) {
          for (var t = 0; t < list.length; t++) {
            var obj = list[t];
            if (obj['OS-EXT-STS:task_state'] != null || obj['status'] == "queued" || obj['status'] == "saving" || obj['status'] == "pending_delete" || obj['status'] == "importing") {
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
  async mounted() {
    this.loadOsList();
    let acTable = this.$refs.imageTable;
    await this.loadProjectList();
    this.getData();
    var roleType = Vue.roleType + "";
    if ("0" != roleType) {
      this.columns.splice(2, 1);
    }
    if (roleType !== '3') {
      this.columns.push({
        prop: "tags",
        label: Vue.t('calcStorLang.IMAGE_TAGS')
      });
    }
  },
  methods: {
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      if (column.prop == "size") {
        self.sortObj = {
          sortOrder:column.order,
          sortField:column.prop,
          sortType: "number"
        };
      } else {
        self.sortObj = {
          sortOrder:column.order,
          sortField:column.prop
        };
      }
    },
    getSelProjects(id, name) {
      this.project_id = id;
      this.projectName = name;
      this.close = 'close'
    },
    onIconClick() {
      this.project_id = '';
      this.projectName = '';
      this.close = '';
    },
    detailMouseDown() {
      var self = this;
      self.detailFlag = false;
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
    },
    async getData(page=1) {
      var self = this;
      await self.getAllFileUploadProgress('upload_images');
      var resultData = [];
      var roleType = Vue.roleType + "";
      var baseUrl = "api/glance/v2/images?limit=99999";
      var baseType = "get";
      if (roleType != "0") {
        baseUrl = "api/glance/v2/images"; //"?limit=99999";
        baseType = "get";
      }
      let projectId = this.$cookie.get('pid');
      var url = "";
      var osType = "";
      var query = Object.keys(self.searchBar.validatedParams).map(key => {
        if (key === 'name') { // glance查询接口对name的支持有问题，已知不支持下划线和中文
          return undefined;
        } else {
          const value = self.searchBar.validatedParams[key];
          if (value instanceof Array) {
            return `${key}=${value[value.length - 1]}`;
          } else {
            return `${key}=${value}`;
          }
        }
      }).join('&');
      if ("" != query) {
        url = baseUrl + "&" + query;
      } else {
        url = baseUrl;
      }
      let ret = await this.$ajax({
        type: baseType,
        url: url
        // ,
        // data: roleType == "0"?null:JSON.stringify({})
      });
      let images = ret.images;
      for (var i = 0; i < images.length; i++) {
        let image = images[i];
        let name = image['name'];
        let size = image['size'];
        image['projectId'] = projectId;
        image['projectName'] = self.projecNameMap.get(image['owner']);
        image['roleType'] = roleType;
        if (image.tags.indexOf('*') > -1) {
          continue;
        }
        if ("snapshot" == image['image_type'] || "backup" == image['image_type'] || typeof (image['block_device_mapping']) != "undefined") {
          continue;
        }
        if (roleType !== '0') {
          if (image['visibility'] === "private" && image['owner'] !== projectId) {
            continue;
          }
        }
        if (!('name' in self.searchBar.validatedParams)) {
          resultData.push(image);
        } else {
          if (self.searchBar.validatedParams.name !== null && image.name.toLowerCase().indexOf(self.searchBar.validatedParams.name.toLowerCase()) >= 0) {
            resultData.push(image);
          }
        }
      }
      self.totalData = resultData;
      self.loading = false;
    },
    async loadProjectList() {
      const $this = this;
      var url = `api/keystone/v3/projects?domain_id=default`;
      if ($this.roleType === '2' || $this.roleType === '3') { //非超级管理员，查询一个项目信息
        url = `api/keystone/v3/projects/${this.$cookie.get("pid")}`;
      }
      try {
        let result = await $this.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        $this.projecNameMap = new Map();
        var projects = result['projects'];
        for (var p = 0; p < projects.length; p++) {
          var tempP = projects[p];
          $this.projecNameMap.set(tempP.id, tempP.name);
          $this.projectListMap.set(tempP.id, tempP);
        }
        //$this.projectlist = projects;
        $this.projectlist = [];
        if ($this.roleType === '2' || $this.roleType === '3') {
          $this.projectlist.push(result['project']);
        } else {
          // $this.projectlist.push({"name":"", "id":""});
          $this.projectlist = $this.projectlist.concat(projects);
        }
        $this.searchBar.conditions.owner.options = result.projects.map(item => {
          return {
            label: item.name,
            value: item.id
          };
        });
      } catch (res) {
        $this.loading = false;
      }
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
    onBack() {
      this.detailFlag = false;
    },
    handleAddShow() {
      this.addFlag = false;
    },
    handleCreateInsShow() {
      this.startFlag = false;
    },
    handleEditShow() {
      this.editFlag = false;
    },
    handleShow() {
      this.newVolumeFlg = false;
    },
    handleMetaDataShow() {
      this.refreshMetadataFlg = false;
    },
    handleImageShareShow() {
      this.shareImageFlag = false;
    },
    rowClick(row) {
      this.$refs.imageTable.toggleRowSelection(row);
    },
    handleCurrentChange(val) {
      this.tableData = this.getData(val);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onTblRefresh() {
      var self = this;
      self.$refs.imageTable.clearSelection();
      self.project = "";
      self.imageOs = "";
      self.imageType = "";
      self.project_id = '';
      self.projectName = '';
      self.close = '';
      self.getData();
    },
    onRefresh() {
      this.getData();
      this.$refs.imageTable.clearSelection();
    },
    statusTagRender(status) {
      if (status === 'active' || status === 'reserved') {
        return 'success';
      } else if (status === 'killed' || status === 'pending_delete') {
        return 'gray';
      } else if (status === 'queued' ) {
        return 'loading';
      } else if (status === 'deleted') {
        return 'danger';
      } else if (status === 'in-use' ) {
        return 'info';
      } else if (status === 'deactivated') {
        return 'warning';
      } else if (status === 'saving' || status === 'importing') {
        return 'loading';
      } else {
        return '';
      }
    },
    statusRender(value, rowData) {
      if (value === 'queued') {
        return Vue.t('calcStorLang.queued');
      } else if (value === 'saving') {
        return Vue.t('calcStorLang.saving');
      } else if (value === 'active') {
        return Vue.t('calcStorLang.active');
      } else if (value === 'killed') {
        return Vue.t('calcStorLang.killed');
      } else if (value === 'deleted') {
        return Vue.t('calcStorLang.deleted');
      } else if (value === 'pending_delete') {
        return Vue.t('calcStorLang.pendingDelete');
      } else if (value === 'deactivated') {
        return Vue.t('calcStorLang.deactivated');
      } else if (value === 'importing') {
        return Vue.t('calcStorLang.importing');
      } else {
        return "-";
      }
    },
    uploadFlagShow(rowData) {
      var status = rowData['status'];
      if ("queued" == status) {
        var timeInterval = rowData['created_at'];
        if (timeInterval.lastIndexOf("Z") < 0 && timeInterval.lastIndexOf(".") >= 0) {
          timeInterval = timeInterval.substring(0, timeInterval.lastIndexOf(".")) + "Z";
        }
        var time = Date.parse(new Date(timeInterval));
        var time2 = Date.parse(new Date());
        if ((parseInt(time2) - parseInt(time)) > 24*60*60*1000) {
           return true;
        } else {
           return false;
        }
      } else {
        return false;
      }
    },
    visibilityRender(value) {
      if (value == "private") {
        return Vue.t('lang.private');
      } else if (value == "public") {
        return Vue.t('lang.public');
      } else if (value == "shared") {
        return Vue.t('calcStorLang.shared');
      } else {
        return "-";
      }
    },
    protectedRender(value) {
      if (value == true) {
        return Vue.t('lang.yes');
      } else if (value == false) {
        return Vue.t('lang.no');
      } else {
        return "-";
      }
    },
    queryProjectName(value, rowData) {
      return this.projecNameMap.get(value);
    },
    loadOsList() {
      let self = this;
      let results = [];
      let list = osJson;
      for (let o = 0; o < list.length; o++) {
        let obj = {
          value: list[o].system,
          label: list[o].system,
          distro: list[o].distro,
          osType: list[o].osType
        };
        if (list[o].system === 'fedora-atomic') {
            obj = {
              value: list[o].system,
              label: "Fedora-atomic",
              distro: list[o].distro,
              osType: list[o].osType
            };
        }
        let distro = results.find(item => item.value === obj.distro);
        if (!distro) {
          distro = {
            value: obj.distro,
            label: obj.distro,
            children: []
          };
          results.push(distro);
        }
        distro.children.push(obj);
      }
      self.searchBar.conditions.os_distro.options = results;
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.$refs.imageTable.clearSelection();
      this.$refs.operationOperate.reset(this.multipleSelection);
      this.getData(1);
      this.$refs.pageComponent.setCurrentPage(1);
    },
    startBreakResumeUpload(id, file) {
      this.imageBreakResumeDialog.id = id;
      this.imageBreakResumeDialog.file = file;
      this.imageBreakResumeDialog.visible = true;
    },
    gotoInstanceList() {
      this.$router.push({
        path: '/calculate-storage/instances-list'
      });
    }
  }
}
</script>

