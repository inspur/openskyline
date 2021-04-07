<template>
  <el-dialog :title="$t('storage.applyVol')" :visible.sync="visible" :before-close="hide" v-dialogDrag>
    <!-- <el-col :span="12"> -->
    <el-form ref="applyVolumeForm" class="me-required-form" :model="applyVolume" label-width="100px" :rules="rules" v-loading="loading" label-position="left">

      <!-- <el-collapse class="col-24" v-model="activeNames">
      <el-collapse-item title="基本信息" name="applyProperty">
        <el-form-item label="申请单名称" prop="orderName" class="is-required">
          <el-input class="col-6" v-model="applyVolume.orderName" auto-complete="off" v-bind:style="widthStyle"></el-input>
        </el-form-item>
        <el-form-item label="申请单描述" prop="orderName" class="is-required">
          <el-input class="col-6" v-model="applyVolume.orderDesc" auto-complete="off" type="textarea" v-bind:style="widthStyle" ></el-input>
        </el-form-item>
      </el-collapse-item>
    </el-collapse> -->

      <!-- <el-collapse class="col-24" v-model="activeNames">
      <el-collapse-item title="云硬盘信息" name="volumeProperty"> -->
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="applyVolume.name" auto-complete="off" v-bind:style="widthStyle"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.type')" prop="type" v-show="!(soltFlag|| volumeFlag)">
        <el-select v-model="applyVolume.type" v-bind:style="widthStyle" filterable clearable @change="originOptionChange">
          <el-option v-for="item in typeOptions" :key="item.id" :label="getSelectOptionName(item.name)" :value="item.id" :title="getSelectOptionTitle(item.name)"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.number')" prop="count" class="is-required">
        <el-row v-bind:style="widthStyle">
          <el-col :span="6">
            <el-input-number v-model="applyVolume.count" :min="1" :max="10" size="small"></el-input-number>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item :label="$t('storage.capabilityGB')" prop="capacity" class="is-required">
        <el-input-number v-model="applyVolume.size" :min="1" :max="131072" size="small"></el-input-number>
        <el-tooltip placement="top" trigger="hover" :content="$t('storage.maxSizeOnevolCapa')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('storage.origin')" prop="origin" class="is-required">
        <el-select v-model="applyVolume.origin" @change="originChange" v-bind:style="widthStyle">
          <el-option v-for="item in originOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.volSnapshot')" prop="solt" class="is-required" v-show="soltFlag">
        <el-select v-model="applyVolume.solt" v-bind:style="widthStyle" filterable clearable>
          <el-option v-for="item in soltOptions" :key="item.id" :value="item.id" :label="item.name" :title="getSelectOptionTitle(item.name)">
            <span style="float:left">{{getSelectOptionName(item.name)}}</span>
            <span style="float:left;color:#8492a6;">{{item.size}}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.image')" prop="image" class="is-required" v-show="imageFlag">
        <el-select v-model="applyVolume.image" v-bind:style="widthStyle" filterable clearable>
          <el-option v-for="item in imageOptions" :key="item.id" :label="item.name" :value="item.id" :title="getSelectOptionTitle(item.name)">
            <span style="float:left">{{getSelectOptionName(item.name)}}</span>
            <span style="float:left;color:#8492a6;">{{item.size}}</span>
          </el-option>
        </el-select>
        <el-tooltip placement="top" trigger="hover" :content="$t('storage.volSizeAdvise')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('storage.volume')" prop="volumes" class="is-required" v-show="volumeFlag">
        <el-select v-model="applyVolume.volumes" v-bind:style="widthStyle" filterable clearable>
          <el-option v-for="item in volumesOptions" :key="item.id" :label="item.name" :value="item.id" :title="getSelectOptionTitle(item.name)">
            <span style="float:left">{{getSelectOptionName(item.name)}}</span>
            <span style="float:left;color:#8492a6;">{{item.size}}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item :label="$t('storage.volumeBak')" prop="backup_id" class="is-required" v-if="volumeBakFlag">
        <el-select v-model="applyVolume.backup_id" v-bind:style="widthStyle" filterable clearable>
          <el-option v-for="item in volumeBakOptions" :key="item.id" :label="item.name" :value="item.id" :title="getSelectOptionTitle(item.name)">
            <span>{{getSelectOptionName(item.name)}}</span>
          </el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item :label="$t('storage.instanceSolt')" prop="instanceSolt" class="is-required" v-show="instanceSoltFlag">
        <el-select v-model="applyVolume.instanceSolt" v-bind:style="widthStyle" filterable clearable>
          <el-option v-for="item in instanceSoltOptions" :key="item.id" :label="item.name" :value="item.id" :title="getSelectOptionTitle(item.name)">
            <span style="float:left">{{getSelectOptionName(item.name)}}</span>
            <span style="float:left;color:#8492a6;">{{item.size}}</span>
          </el-option>
        </el-select>
        <el-tooltip placement="top" trigger="hover" :content="$t('storage.volSizeMoreThanTeninstanceSoltSize')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('storage.volumeZone')" prop="domain" class="is-required" v-show="volumeZoneFlag">
        <el-select v-model="applyVolume.domain" v-bind:style="widthStyle" filterable clearable>
          <el-option v-for="item in zoneOptions" :key="item.value" :label="item.zoneName" :value="item.zoneName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.volDesc')" prop="description">
        <el-input class="col-8" v-model="applyVolume.description" auto-complete="off" type="textarea" v-bind:style="widthStyle"></el-input>
      </el-form-item>
      <!--  </el-collapse-item>
    </el-collapse> -->
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="hide">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "applyVolume",
  data() {
    return {
      activeNames: 'volumeProperty',
      applyVolume: {
        orderName: "",
        orderDesc: "",
        name: "",
        user: Vue.userId,
        project: this.$cookie.get('pid'),
        description: "",
        domain: "",
        count: 1,
        type: "",
        size: 0,
        origin: "1",
        volumes: "",
        // backup_id: "",
        image: "",
        solt: ""
      },
      loading: false,
      saving: false,
      roleType: Vue.roleType + "",
      size: 2,
      visible: false,
      soltFlag: false,
      volumeZoneFlag: true,
      imageFlag: false,
      volumeFlag: false,
      // volumeBakFlag: false,
      instanceSoltFlag: false,
      zoneOptions: [],
      instanceSoltOptions: [],
      maxCount: 1,
      totalCount: 0,
      inUsedCount: 0,
      freeCount: 0,
      inUsedOldCount: 0,
      totalCapacity: 1,
      totalSize: '',
      totalInfinite: false,
      usedSize: 0,
      freeSize: 0,
      usedOldSize: 0,
      rules: {
        orderName: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 255 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 255 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        count: [
          { type: 'required', trigger: 'blur change' }
        ],
        origin: [
          { type: 'required' }
        ],
        domain: [
          { type: 'required' }
        ],
        description: [
          { type: 'maxSize', value: 255 }
        ],
        orderDesc: [
          { type: 'maxSize', value: 1024 }
        ],
        capacity: [
          { type: 'required', trigger: 'blur change' }
        ]
        // backup_id: [
        //   { type: 'required' }
        // ]
      },
      domainOptions: [{ value: '1', label: 'domainTest' }],
      userOptions: [{ value: '1', label: 'userTest' }],
      typeOptions: [],
      originOptions: [
        { value: '1', label: this.$t('storage.new') },
        { value: '2', label: this.$t('storage.volSnapshot') },
        { value: '3', label: this.$t('storage.image') },
        { value: '5', label: this.$t('storage.instanceSolt') }
      ],
      nosShareOriginOptions: [
        { value: '1', label: this.$t('storage.new') },
        { value: '2', label: this.$t('storage.volSnapshot') },
        { value: '3', label: this.$t('storage.image') },
        { value: '5', label: this.$t('storage.instanceSolt') }
        // { value: '6', label: this.$t('storage.volumeBak') }
      ],
      shareOriginOptions: [
        { value: '1', label: this.$t('storage.new') },
        { value: '2', label: this.$t('storage.volSnapshot') }
        // { value: '6', label: this.$t('storage.volumeBak') }
      ],
      widthStyle: {
        width: "85%"
      },
      countpercentage: 0,
      countproStatus: "success",
      percentage: 0,
      proStatus: "success",
      soltOptions: [],
      imageOptions: [],
      volumesOptions: [],
      volumeBakOptions: [],
      imageSizeMap: new Map(),
      volumeSizeMap: new Map(),
      soltSizeMap: new Map()
    }
  },
  mounted() {
    var self = this;
    var roleType = Vue.roleType + "";
    self.initZones();
    self.getVolumeType();
    // self.getcountValueLimit();
    self.getSoltOptions();
    self.getImageOptions();
    self.getVolumesOptions();
    self.getVolumeBakOptions();
    self.getInstanceSoltOptions();
  },
  methods: {
    show() {
      this.visible = true;
    },
    hide() {
      this.$emit("handleShow", {});
    },
    getSelectOptionName(value) {
      if (typeof (value) == "undefined" || null == value) {
        return value;
      }
      if (value.length > 80) {
        return value.substring(0, 80);
      }
      return value;
    },
     async getInstanceSoltOptions() {
      var self = this;
      var resultData = [];
      var roleType = Vue.roleType + "";
      var selectProjectId = self.applyVolume.project;
      try {
        if ("2" == roleType || "3" == roleType) {
          let ret = await this.$ajax({
            type: 'get',
            url: "api/glance/v2/images?limit=99999&status=active"
          });
          let images = ret.images;
          for (var i = 0; i < images.length; i++) {
            let image = images[i];
            let name = image['name'];
            let size = image['size'];
            if ("snapshot" != image['image_type'] && image['image_type'] != "backup") {
              continue;
            }
            if ("private" == image['visibility'] && selectProjectId != image['owner']) {
              continue;
            }
            if ((size + "") == "0") {
              continue;
            }
            resultData.push({
              id: image['id'],
              name: name,
              size: '(' + self.sizeRender(size) + "," + image['disk_format'] + ')',
              sizeB: size
            });
            //this.imageSizeMap.set(image[id], size);
          }
          this.instanceSoltOptions = resultData;
        } else {
          //超级管理员组合查询，先查询项目私有的，然后查询公共的
          var owner = "";
          if ("" != selectProjectId ) {
            owner = "&owner=" + selectProjectId + "";
          }
          let ret = await this.$ajax({
            type: 'get',
            url: "api/glance/v2/images?limit=99999&status=active&visibility=private" + owner
          });
          let images = ret.images;
          for (i = 0; i < images.length; i++) {
            let image = images[i];
            let name = image['name'];
            let size = image['size'];
            if ("snapshot" != image['image_type'] && image['image_type'] != "backup") {
              continue;
            }
            if ((size + "") == "0") {
              continue;
            }
            resultData.push({
              id: image['id'],
              name: name,
              size: '(' + self.sizeRender(size) + "," + image['disk_format'] + ')',
              sizeB: size
            });
          }
          ret = await this.$ajax({
            type: 'get',
            url: "api/glance/v2/images?limit=99999&status=active&visibility=public"
          });
          images = ret.images;
          for (i = 0; i < images.length; i++) {
            let image = images[i];
            let name = image['name'];
            let size = image['size'];
            if ("snapshot" != image['image_type'] && image['image_type'] != "backup") {
              continue;
            }
            if ((size + "") == "0") {
              continue;
            }
            resultData.push({
              id: image['id'],
              name: name,
              size: '(' + self.sizeRender(size) + "," + image['disk_format'] + ')',
              sizeB: size
            });
            //this.imageSizeMap.set(image[id], size);
          }
          this.instanceSoltOptions = resultData;
        }
      } catch (data) {
        self.loading = false;
      }
    },
    getSelectOptionTitle(value) {
      if (typeof (value) == "undefined" || null == value) {
        return value;
      }
      if (value.length > 80) {
        return value;
      }
      return '';
    },
    async getcountValueLimit() {
      var self = this;
      var projectId = self.applyVolume.project;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + self.$cookie.get("pid") + "/limits"
        });
        var data = ret['limits'].absolute;
        if (data['maxTotalVolumes'] == "-1") {
          self.maxCount = 99999;
          self.totalCount = this.$t('storage.infinite');
          self.inUsedCount = data['totalVolumesUsed'];
          self.freeCount = this.$t('storage.infinite');
          self.countpercentage = 0;
        } else {
          self.maxCount = data['maxTotalVolumes'] - data['totalVolumesUsed'];
          self.totalCount = data['maxTotalVolumes'];
          self.inUsedCount = data['totalVolumesUsed'];
          self.freeCount = self.totalCount - self.inUsedCount;
          self.countpercentage = ((data['totalVolumesUsed'] / data['maxTotalVolumes']) * 100).toFixed(2) * 1;
        }
        //容量
        var data2 = ret['limits'].absolute;
        if (data2['maxTotalVolumeGigabytes'] == "-1") {
          self.totalSize = this.$t('storage.infinite');
          self.totalInfinite = true;
          self.usedSize = data2['totalGigabytesUsed'];
          self.freeSize = this.$t('storage.infinite');
          self.percentage = 0;
          self.totalCapacity = 99999;
        } else {
          var size = data2['maxTotalVolumeGigabytes'];
          self.totalSize = data2['maxTotalVolumeGigabytes'];
          self.totalInfinite = false;
          self.usedSize = data2['totalGigabytesUsed'];
          self.freeSize = size - data2['totalGigabytesUsed'];
          self.percentage = ((data2['totalGigabytesUsed'] / size) * 100).toFixed(2) * 1;
          self.totalCapacity = parseInt(size - data2['totalGigabytesUsed']);
        }
        self.inUsedOldCount = self.inUsedCount;
        self.usedOldSize = self.usedSize;
      } catch (data) {
        self.loading = false;
      }
    },
    async getCountValue() {
      var self = this;
      var projectId = self.applyVolume.project;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + self.$cookie.get("pid") + "/os-quota-sets/" + projectId + "?usage=true"
        });
        var data = ret['quota_set'].volumes;
        if (data['limit'] == "-1") {
          self.maxCount = 99999;
          self.totalCount = this.$t('storage.infinite');
          self.inUsedCount = data['in_use'];
          self.freeCount = this.$t('storage.infinite');
          self.countpercentage = 0;
        } else {
          self.maxCount = data['limit'] - data['in_use'];
          self.totalCount = data['limit'];
          self.inUsedCount = data['in_use'];
          self.freeCount = self.totalCount - self.inUsedCount;
          self.countpercentage = ((data['in_use'] / data['limit']) * 100).toFixed(2) * 1;
        }
        //容量
        var data2 = ret['quota_set'].gigabytes;
        if (data2['limit'] == "-1") {
          self.totalSize = this.$t('storage.infinite');
          self.totalInfinite = true;
          self.usedSize = data2['in_use'];
          self.freeSize = this.$t('storage.infinite');
          self.percentage = 0;
          self.totalCapacity = 99999;
        } else {
          var size = data2.limit;
          self.totalSize = size;
          self.totalInfinite = false;
          self.usedSize = data2['in_use'];
          self.freeSize = size - data2['in_use'];
          self.percentage = ((data2['in_use'] / size) * 100).toFixed(2) * 1;
          self.totalCapacity = parseInt(size - data2['in_use']);
        }
        self.inUsedOldCount = self.inUsedCount;
        self.usedOldSize = self.usedSize;
      } catch (data) {
        self.loading = false;
      }
    },
    async getCapacityValue() {
      var self = this;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + self.$cookie.get("pid") + "/scheduler-stats/get_pools?detail=true"
        });
        var data = ret['pools'];
        if (data != null && data.length > 0) {
          var size = data[0].capabilities['total_capacity_gb'];
          var freeSize = data[0].capabilities['free_capacity_gb'];
          self.totalSize = size;
          self.usedSize = (size - freeSize).toFixed(2);
          self.percentage = (((size - freeSize).toFixed(2)) / size) * 100;
          self.percentage = self.percentage.toFixed(2);
          self.totalCapacity = parseInt(freeSize);
        }
      } catch (data) {
        self.loading = false;
      }
    },
    async getSoltOptions() {
      var self = this;
      var resultData = [];
      let projectId = this.$cookie.get('pid');
      var roleType = Vue.roleType + "";
      var selectProjectId = self.applyVolume.project;
      var url = "api/cinderv3/v3/" + projectId + "/snapshots/detail?all_tenants=True&status=available";
      if ("2" == roleType || "3" == roleType) { //超级
        url = "api/cinderv3/v3/" + projectId + "/snapshots/detail?status=available";
      }
      try {
        let ret = await this.$ajax({
          type: 'get',
          //url: "api/cinderv3/v3/" + projectId + "/snapshots/detail?status=available"
          url: url
        });
        let snapshots = ret.snapshots;
        for (var i = 0; i < snapshots.length; i++) {
          let snapshot = snapshots[i];
          let name = snapshot['name'];
          let size = snapshot['size'];
          if ("0" == roleType && selectProjectId != snapshot['os-extended-snapshot-attributes:project_id']) {
            continue;
          }
          resultData.push({
            id: snapshot['id'],
            name: name,
            size: '(' + size + ' GB)',
            sizeGB: size
          });
          this.soltSizeMap.set(snapshot['id'], size);
        }
        this.soltOptions = resultData;
      } catch (data) {
        self.loading = false;
      }
    },
    async getImageOptions() {
      var self = this;
      var resultData = [];
      var roleType = Vue.roleType + "";
      var selectProjectId = self.applyVolume.project;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/glance/v2/images?limit=99999&status=active"
        });
        let images = ret.images;
        for (var i = 0; i < images.length; i++) {
          let image = images[i];
          let name = image['name'];
          let size = image['size'];
          if (typeof (image['image_type']) != "undefined" && null != image['image_type']) {
            if ("snapshot" == image['image_type'] || "backup" == image['image_type']) {
              continue;
            }
          }
          if ("private" == image['visibility'] && selectProjectId != image['owner']) {
            continue;
          }
          if (image.tags.includes('*')) {
            continue;
          }
          resultData.push({
            id: image['id'],
            name: name,
            size: '(' + self.sizeRender(size) + "," + image['disk_format'] + ')',
            sizeB: size
          });
          //this.imageSizeMap.set(image[id], size);
        }
        this.imageOptions = resultData;
      } catch (data) {
        self.loading = false;
      }
    },
    sizeRender(value) {
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
    async getVolumesOptions() {
      var self = this;
      var resultData = [];
      var projectId = this.$cookie.get('pid');
      var selectProjectId = self.applyVolume.project;
      var url = "api/cinderv2/v2/" + projectId + "/volumes/detail?project_id=" + selectProjectId + "&all_tenants=True";
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: url
        });
        let volumes = ret.volumes;
        for (var i = 0; i < volumes.length; i++) {
          let volume = volumes[i];
          let status = volume['status'];
          if (status == "available" || status == "in-use") {
            let volId = volume['id'];
            let name = volume['name'];
            if (name == "") {
              name = volId;
            }
            let size = volume['size'];
            resultData.push({
              id: volId,
              name: name,
              size: '(' + size + ' GB)',
              sizeGB: size
            });
            this.volumeSizeMap.set(volId, size);
          }
        }
        this.volumesOptions = resultData;
      } catch (data) {
        self.loading = false;
      }
    },
    async getVolumeBakOptions() {
      var self = this;
      var resultData = [];
      var projectId = this.$cookie.get('pid');
      var selectProjectId = self.applyVolume.project;
      var url = "api/cinderv3/v3/" + projectId + "/backups/detail";
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: url
        });
        // let volumes = ret.volumes;
        // for (var i = 0; i < volumes.length; i++) {
        //   let volume = volumes[i];
        //   let status = volume['status'];
        //   if (status == "available" || status == "in-use") {
        //     let volId = volume['id'];
        //     let name = volume['name'];
        //     if (name == "") {
        //       name = volId;
        //     }
        //     let size = volume['size'];
        //     resultData.push({
        //       id: volId,
        //       name: name,
        //       size: '(' + size + ' GB)',
        //       sizeGB: size
        //     });
        //     this.volumeSizeMap.set(volId, size);
        //   }
        // }
        this.volumeBakOptions = ret['backups'];
      } catch (data) {
        self.loading = false;
      }
    },
    async getVolumeType() {
      this.loading = true;
      var projectId = this.$cookie.get('pid');
      var self = this;
      let data = [];
      var url = "";
      var roleType = Vue.roleType + "";
      var volTypeName = self.volTypeName;
      var ispublic = self.volumeType;
      url = "api/cinderv3/v3/" + projectId + "/types?is_public=None";
      if ("2" == roleType || "3" == roleType) { //超级
        url = "api/cinderv3/v3/" + projectId + "/types";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.typeOptions = result['volume_types'];
        self.loading = false;
      } catch (res) {
        self.loading = false;
        self.$message.error(Vue.t('storage.getFailed'));
      }
    },
    confirmFun() {
      this.$refs.applyVolumeForm.validate(async (valid) => {
        if (valid) {
          this.saving = true;
          let name = this.applyVolume.name;
          let projectId = this.$cookie.get('pid');
          let size = this.applyVolume.size;
          let count = this.applyVolume.count;
          let zone = this.applyVolume.domain;
          let description = this.applyVolume.description;
          let vType = this.applyVolume.type;
          let userId = Vue.userId;
          // let backupId = this.applyVolume.backup_id;
          if (!Number.isInteger(size)) {
            this.$message({
              showClose: true,
              message: Vue.t('storage.capaMustBeInit'),
              type: 'warning'
            });
            this.saving = false;
            return;
          }
          let msg = this.$t('storage.sendApplyVolSuccess');
          let body = { "volume": { "name": name, "size": size, "description": description, "volume_type": vType, "project_id": projectId, "availability_zone": zone, "user_id": userId }, "num": count };
          //超级管理员选择项目
          var roleType = Vue.roleType + "";
          if (this.applyVolume.origin == "2") {
            body = {};
            let soltId = this.applyVolume.solt;
            if (!soltId) {
              this.$message({
                showClose: true,
                message: Vue.t('storage.originSnapshotCannotBeNull'),
                type: 'warning'
              });
              this.saving = false;
              return;
            }
            var soltSize = this.getSoltSize(soltId);
            if (soltSize > size) {
              //镜像大小大于卷的大小
              this.$message({
                showClose: true,
                message: Vue.t('storage.volCapaLessThanShot'),
                type: 'warning'
              });
              this.saving = false;
              return;
            }
            body = { "volume": { "name": name, "size": size, "description": description, "snapshot_id": soltId, "project_id": projectId, "user_id": userId }, "num": count };
          }
          if (this.applyVolume.origin == "3") {
            let imageId = this.applyVolume.image;
            if (!imageId) {
              this.$message({
                showClose: true,
                message: Vue.t('storage.imageNotAllowNull'),
                type: 'warning'
              });
              this.saving = false;
              return;
            }
            var imageSize = this.getImageSize(imageId);
            if (imageSize > size * 1024 * 1024 * 1024) {
              //镜像大小大于卷的大小
              this.$message({
                showClose: true,
                message: Vue.t('storage.volCapaLessThanimage'),
                type: 'warning'
              });
              this.saving = false;
              return;
            }
            body.volume['imageRef'] = imageId;
          }
          if (this.applyVolume.origin == "5") {
             let imageId = this.applyVolume.instanceSolt;
             if (!imageId) {
                this.$message({
                    showClose: true,
                    message: Vue.t('storage.instanceSoltNotAllowNull'),
                    type: 'warning'
                 });
                 this.saving = false;
                 return;
             }
             var instanceSolt = this.getInstanceSoltSize(imageId);
             if (instanceSolt > size * 1024 * 1024 * 1024) {
                //云主机快照大小大于卷的大小
                this.$message({
                    showClose: true,
                    message: Vue.t('storage.volCapaLessThaninstanceSolt'),
                    type: 'warning'
                 });
                 this.saving = false;
                 return;
             }
             body.volume['imageRef'] = imageId;
          }

          if (this.applyVolume.origin == "4") {
            body = {};
            let svolId = this.applyVolume.volumes;
            if (!svolId) {
              this.$message({
                showClose: true,
                message: Vue.t('storage.originVolNotAllowNull'),
                type: 'warning'
              });
              this.saving = false;
              return;
            }
            var svolSize = this.getSvolSize(svolId);
            if (svolSize > size) {
              //镜像大小大于卷的大小
              this.$message({
                showClose: true,
                message: Vue.t('storage.volCapaLessThanOriginVol'),
                type: 'warning'
              });
              this.saving = false;
              return;
            }
            body = { "volume": { "name": name, "size": size, "description": description, "source_volid": svolId, "project_id": projectId, "user_id": userId }, "num": count };
          }
          body = JSON.stringify(body);
          /*body = {"order_name":name, "op_desc":description, "applicant_id":this.applyVolume.user, "project_id":projectId, "resource_type":"VOLUME", "order_data":body};*/
          body = { "op_desc": description, "applicant_id": this.applyVolume.user, "project_id": projectId, "resource_type": "VOLUME.CREATE", "order_data": body };
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: "api/leo/v1/order/create_order",
              data: body,
              type: "post",
              successMsg: msg,
              log: {
                description: {
                  en: "Apply volume:" + name + ", count:" + count,
                  zh_cn: "申请云硬盘:" + name + ", 数量：" + count
                },
                target: Vue.logTarget.storage_volume
              }
            });
            this.$emit("handleShow", {});
            this.$emit("getData", {});
          } catch (data) {
            this.loading = false;
            this.saving = false;
            __DEV__ && console.error(data);
          }
        } else {
          return false;
        }
      });
    },
    getSoltSize(soltId) {
      for (var q = 0; q < this.soltOptions.length; q++) {
        var soltTemp = this.soltOptions[q];
        if (soltId == soltTemp.id) {
          return soltTemp.sizeGB;
        }
      }
      return 0;
    },
    getInstanceSoltSize(instanceSoltId) {
      for (var q = 0; q < this.instanceSoltOptions.length; q++) {
        var instanceSoltTemp = this.instanceSoltOptions[q];
        if (instanceSoltId == instanceSoltTemp.id) {
          return instanceSoltTemp.sizeB;
        }
      }
      return 0;
    },
    getImageSize(imageId) {
      for (var q = 0; q < this.imageOptions.length; q++) {
        var imageTemp = this.imageOptions[q];
        if (imageId == imageTemp.id) {
          return imageTemp.sizeB;
        }
      }
      return 0;
    },
    getSvolSize(svolId) {
      for (var q = 0; q < this.volumesOptions.length; q++) {
        var svolTemp = this.volumesOptions[q];
        if (svolId == svolTemp.id) {
          return svolTemp.sizeGB;
        }
      }
      return 0;
    },
    projectChange() {
      var roleType = Vue.roleType + "";
      this.applyVolume.count = 1;
      this.applyVolume.size = 1;
      /*if ("0" == roleType) {
         this.getCountValue();
      } else if ("2" == roleType || "3" == roleType) {
        this.getcountValueLimit();
      }*/
      this.getSoltOptions();
      this.getImageOptions();
      this.getVolumesOptions();
      this.getVolumeType();
      //self.getCapacityValue();
    },
    originOptionChange(val) {
      let originType = {};
      originType = this.typeOptions.find(
          item => {
            if (item.id == val) {
              return item;
            }
          }
        )
      if (originType!=null&&originType["extra_specs"]["multiattach"] === "<is> True") {
        this.originOptions = this.shareOriginOptions;
      } else {
        this.originOptions = this.nosShareOriginOptions;
      }
      this.applyVolume.origin = "1"
    },
    originChange(val) {
      if (val == '1') {
        this.soltFlag = false;
        this.imageFlag = false;
        this.volumeFlag = false;
        this.volumeZoneFlag = true;
        // this.volumeBakFlag = false;
        this.instanceSoltFlag = false;
      } else if (val == '2') {
        this.soltFlag = true;
        this.imageFlag = false;
        this.volumeFlag = false;
        this.volumeZoneFlag = false;
        // this.volumeBakFlag = false;
        this.instanceSoltFlag = false;
      } else if (val == '3') {
        this.soltFlag = false;
        this.imageFlag = true;
        this.volumeFlag = false;
        // this.volumeBakFlag = false;
        this.volumeZoneFlag = true;
        this.instanceSoltFlag = false;
      } else if (val == '4') {
        this.soltFlag = false;
        this.imageFlag = false;
        this.volumeFlag = true;
        // this.volumeBakFlag = false;
        this.volumeZoneFlag = true;
        this.instanceSoltFlag = false;
      } else if (val == '5') {
        this.soltFlag = false;
        this.imageFlag = false;
        this.volumeFlag = false;
        // this.volumeBakFlag = false;
        this.volumeZoneFlag = true;
        this.instanceSoltFlag = true;
      }
      // else if (val == '6') {
      //   this.soltFlag = false;
      //   this.imageFlag = false;
      //   this.volumeFlag = false;
      //   this.volumeBakFlag = true;
      //   this.volumeZoneFlag = false;
      //   this.instanceSoltFlag = false;
      // }
    },
    splitLengStr(str) {
      if (str.length <= 50) {
        return str;
      }
      var strArray = str.split("");
      var temp = "";
      for (var i = 1; i <= strArray.length; i++) {
        temp = temp + strArray[i - 1]
        if (i % 50 == 0) {
          temp = temp + "<br/>";
        }
      }
      return temp;
    },
    async initZones() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/cinder/v2/' + this.$cookie.get('pid') + '/os-availability-zone'
        });
        self.loading = false;
        var list = result['availabilityZoneInfo'];
        var zones = [];
        if (list != null) {
          for (var z = 0; z < list.length; z++) {
            var zone = list[z];
            if (zone['zoneName'] != "internal") {
              zones.push(zone);
            }
          }
        }
        self.zoneOptions = zones;
        if (zones.length > 0) {
          self.applyVolume.domain = zones[0].zoneName || "";
        }
      } catch (res) {
        self.loading = false;
      }
    }
  }
}
</script>length; i++ {
  if (i)
}