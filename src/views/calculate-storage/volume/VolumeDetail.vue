<template>
  <el-row>
    <el-col :span="24">
      <el-collapse v-model="activeNames" style="text-align:left">
        <el-collapse-item :title="$t('storage.baseProperty')" name="baseProperty">
          <el-col :span="12">
              <div class="table_panel">
                <table class="table table-content table-hover idatatable" border="1">
                  <tbody>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.name')}}：</th>
                      <td class="idatatd">
                        <el-tooltip :content="getVolumeName()" v-show="getVolumeName().length > 0">
                          <span>{{getVolumeName().length>20?getVolumeName().substring(0,20) + "...":getVolumeName()}}</span>
                        </el-tooltip>
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.project')}}：</th>
                      <td class="idatatd">{{vmpName}}</td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.status')}}：</th>
                      <td class="idatatd">
                        {{volumeStatusRender()}}
                      </td>
                    </tr>
                    <tr class="odd" v-show="isShow">
                      <th class="idatath">{{$t('storage.position')}}：</th>
                      <td class="idatatd">
                        {{detailVolume['os-vol-host-attr:host']}}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-col>
            <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="even">
                    <th class="idatath">ID：</th>
                    <td class="idatatd">{{detailVolume.id}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('storage.owner')}}：</th>
                    <td class="idatatd">{{userName}}</td>
                  </tr>
                  <tr class="even">
                      <th class="idatath">{{$t('lang.desc')}}：</th>
                      <td class="idatatd"> 
                        <el-tooltip :content="getVolumeDesc()" v-show="getVolumeDesc().length > 0">
                          <span>{{getVolumeDesc().length>20?getVolumeDesc().substring(0,20) + "...":getVolumeDesc()}}</span>
                        </el-tooltip>
                      </td>
                    </tr>
                </tbody>
              </table>
            </div>
          </el-col>
          <!-- <el-form :inline="true" v-model="formInline" class="">
           <el-row :gutter="20">
             <el-col :span="12">
              <el-form-item label="名称："  :span="6"></el-form-item>
              <el-form-item>
                <el-tooltip :content="getVolumeName()" v-show="getVolumeName().length > 0">
                  <span>{{getVolumeName().length>20?getVolumeName().substring(0,20) + "...":getVolumeName()}}</span>
                </el-tooltip>
              </el-form-item>
             </el-col>
             <el-col :span="12">
               <el-form-item label="ID："></el-form-item>
               <el-form-item>{{detailVolume.id}}</el-form-item>
             </el-col>
             <el-col :span="12">
               <el-form-item label="项目："></el-form-item>
               <el-form-item>{{vmpName}}</el-form-item>
             </el-col>
             <el-col :span="12">
               <el-form-item label="拥有者："></el-form-item>
               <el-form-item>{{userName}}</el-form-item>
             </el-col>
             <el-col :span="12">
                <el-form-item label="状态："></el-form-item>
                <el-form-item>{{volumeStatusRender()}}</el-form-item>
             </el-col>
             <el-col :span="12">
               <el-form-item label="描述："> </el-form-item>
               <el-form-item>
                  <el-tooltip :content="detailVolume.description" v-show="detailVolume.description.length > 0">
                    <span>{{detailVolume.description.length>20?detailVolume.description.substring(0,20) + "...":detailVolume.description}}</span>
                  </el-tooltip>
                </el-form-item>
             </el-col>
             <el-col :span="12" v-show="isShow">
               <el-form-item label="位置："></el-form-item>
               <el-form-item>{{detailVolume['os-vol-host-attr:host']}}</el-form-item>
             </el-col>
           </el-row>
          </el-form> -->
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <el-col :span="24">
      <el-collapse v-model="activeNames" style="text-align:left">
        <el-collapse-item :title="$t('storage.spec')" name="disk">
          <el-col :span="12">
              <div class="table_panel">
                <table class="table table-content table-hover idatatable" border="1">
                  <tbody>
                    <tr class="odd">
                      <th class="idatath">{{$t('storage.size')}}：</th>
                      <td class="idatatd">
                        {{detailVolume.size}}GB
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('storage.bootable')}}：</th>
                      <td class="idatatd">
                        {{isBootable()}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.createTime')}}：</th>
                      <td class="idatatd">
                        {{dateRender(detailVolume.created_at)}}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="table_panel">
                <table class="table table-content table-hover idatatable" border="1">
                  <tbody>
                    <tr class="odd">
                      <th class="idatath">{{$t('storage.region')}}：</th>
                      <td class="idatatd">{{detailVolume.availability_zone}}</td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('storage.encrypt')}}：</th>
                      <td class="idatatd">
                        {{isEncrypted()}}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-col>

          <!-- <el-form :inline="true" v-model="formInline" class="">
           <el-row :gutter="20">
              <el-col :span="12">
               <el-form-item label="大小："></el-form-item>
               <el-form-item>{{detailVolume.size}}GB</el-form-item>
             </el-col>
             <el-col :span="12">
               <el-form-item label="所在域："></el-form-item>
               <el-form-item>{{detailVolume.availability_zone}}</el-form-item>
             </el-col>
             <el-col :span="12">
               <el-form-item label="可启动："></el-form-item>
               <el-form-item>{{isBootable()}}</el-form-item>
             </el-col>
             <el-col :span="12">
               <el-form-item label="加密："></el-form-item>
              <el-form-item>{{isEncrypted()}}</el-form-item>
             </el-col>
             <el-col :span="12">
               <el-form-item label="创建时间："></el-form-item>
               <el-form-item>{{dateRender(detailVolume.created_at)}}</el-form-item>
             </el-col>
           </el-row>
          </el-form> -->
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <el-col :span="24">
      <el-collapse v-model="activeNames" style="text-align:left">
        <el-collapse-item :title="$t('storage.connectHost')" name="device">
          <el-form :inline="true" v-model="formInline" class="">
           <el-row :gutter="20">
             <el-col :span="24">
               <el-form-item>
                 <ul v-for="item in deviceUN.split(',')" :key="item">
                    <li>{{item}}</li>
                 </ul>
               </el-form-item>
             </el-col>
           </el-row>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <el-col :span="24">
      <el-collapse v-model="activeNames" style="text-align:left">
        <el-collapse-item :title="$t('calcStorLang.faultInfo')" name="metadata">
          <el-form :inline="true" v-model="formInline" class="">
           <el-row :gutter="20">
             <el-col :span="24">
               <el-form-item :label="$t('base.detailInformation')"></el-form-item>
               <el-form-item >{{faultInfo}}</el-form-item>
             </el-col>
           </el-row>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <!-- <el-col :span="24">
      <el-collapse v-model="activeNames" style="text-align:left">
        <el-collapse-item :title="$t('storage.metaData')" name="metadata">
          <el-form :inline="true" v-model="formInline" class="">
            <el-table ref="metaTable" :data="tableData" highlight-current-row border stripe style="width: 100%;" max-height='500' row-key="key">
              <el-table-column prop="key" align="left" :label="$t('storage.key')"  min-width="100">
              </el-table-column>
              <el-table-column prop="value" align="left" :label="$t('storage.value')" min-width="100">
              </el-table-column>
            </el-table>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-col> -->
  </el-row>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: "detail",
  props: ['detailVolume', 'userName', 'vmpName', 'deviceUN'],
  data() {
    return {
      activeNames: ["baseProperty", "disk", "device", "metadata"],
      isShow: Vue.roleType == "0",
      formInline: '',
      volumeName:'',
      bootable: '',
      status: '',
      description: '',
      source: '',
      encrypted: '',
      vmNames: '',
      host: '',
      faultInfo:"-",
      loading: false,
      tableData: [],
      statusList:[]
    }
  },
  watch: {
    detailVolume: {
      handler: function(rows, oldVal) {
        this.loadData();
      }
    }
  },
  mounted() {
    var self = this;
    self.buildStatusList();
    self.loadData();
  },
  methods: {
    show() {
    },
    isAdmin() {
      var roleType = Vue.roleType + "";
      if ("2" == roleType || "0" == roleType) {
        return false;
      }
      return true;
    },
    loadData() {
      this.loading = true;
        var metadatas = [];
        this.description = this.detailVolume['description'];
        this.qryFaultInfo(this.detailVolume["id"]);
        let metadataObject = this.detailVolume.metadata;
          for ( var item in metadataObject ) {
            metadatas.push({
            key: item,
            value: metadataObject[item]
          })
          }
          this.tableData = metadatas;
        this.volumeName = this.getVolumeName();
        this.loading = false;
    },
    showMetada(key, val) {
      return key + ":" + val;
    },
    async qryFaultInfo(id) {
      if (!id) {
        return false;
      }
      var Pid = this.$cookie.get("pid");
      var self = this;
      let data = [];
      var url = "api/cinderv3/v3/" + Pid + "/messages?resource_uuid="+ this.detailVolume["id"] +"&sort_key=created_at&limit=1";
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          headers: {
            "OpenStack-API-Version": "volume 3.55"
          }
        });
        this.faultInfo = "-";
        let messages = result["messages"];
        if (messages && messages[0] && messages[0]["user_message"]) {
          this.faultInfo = messages[0]["user_message"];
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    isBootable() {
      this.host = this.detailVolume['os-vol-host-attr:host'];
      if ("true" == this.detailVolume.bootable) {
        return this.$t('storage.yes');
      } else {
        return this.$t('storage.no');
      }
    },
    isEncrypted() {
     if (true == this.detailVolume.encrypted || "true" == this.detailVolume.encrypted) {
        return this.$t('storage.yes');
      } else {
        return this.$t('storage.no');
      }
    },
    getVolumeDesc() {
      if (typeof (this.detailVolume.description) == "undefined" || null == this.detailVolume.description || '' == this.detailVolume.description) {
        return '';
      } else {
        return this.detailVolume.description;
      }
    },
    getVolumeName() {
      var volName = this.detailVolume.id;
      if (typeof (this.detailVolume.name) == "undefined" || null == this.detailVolume.name || '' == this.detailVolume.name) {
        volName = this.detailVolume.id;
      } else {
        volName = this.detailVolume.name;
      }
      return volName;
    },
    volumeStatusRender() {
      let self = this;
      let value = self.detailVolume.status;
      self.statusList.forEach(item => {
        if (item.id === self.detailVolume.status) {
          value = item.name;
          return false;//跳出forEach循环
        }
      });
      return value;
    },
    buildStatusList() {
      this.statusList = [
        { id: "attaching", name: this.$t("storage.installing") },
        { id: "awaiting-transfer", name: this.$t("storage.waitTransfering") },
        { id: "available", name: this.$t("storage.available") },
        { id: "backing-up", name: this.$t("storage.backUping") },
        { id: "creating", name: this.$t("storage.creating") },
        { id: "data-copying", name: this.$t("storage.dataCopying") },
        { id: "deleting", name: this.$t("storage.deleting") },
        { id: "detaching", name: this.$t("storage.uninstaling") },
        { id: "downloading", name: this.$t("storage.downloadImaging") },
        { id: "error", name: this.$t("storage.error") },
        { id: "extending", name: this.$t("storage.extendingStatus") },
        { id: "error_extending", name: this.$t("storage.extendingError") },
        { id: "error_restoring", name: this.$t("storage.bakRecoveryError") },
        { id: "error_deleting", name: this.$t("storage.errorDeleting") },
        { id: "error-backing-up", name: this.$t("storage.backUPError") },
        { id: "in-use", name: this.$t("storage.inUsing") },
        { id: "maintenance", name: this.$t("storage.migrationing") },
        { id: "removing", name: this.$t("storage.removing") },
        { id: "reserved", name: this.$t("storage.reserved") },
        { id: "restoring-backup", name: this.$t("storage.bakRecoverying") },
        { id: "retyping", name: this.$t("storage.retyping") },
        { id: "reverting", name: this.$t("storage.reverting") },
        { id: "unmanaging", name: this.$t("storage.removing") },
        { id: "soft_deleted", name: this.$t("storage.soft_deleted") },
        { id: "soft_deleting", name: this.$t("storage.soft_deleting") },
        { id: "uploading", name: this.$t("storage.uploadImaging") },
        { id: "cloning", name: this.$t("storage.CLONGING") },
        { id: "clone_error", name: this.$t("storage.clone_error") }
      ];
    },
    dateRender(value) {
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
    }
  }
}
</script>
<style scoped>
.testHH {
  text-align: lelf;
}
</style>
