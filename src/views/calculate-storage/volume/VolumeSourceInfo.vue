<template>
  <el-row>
    <el-col :span="24">
      <el-collapse v-model="activeNames" style="text-align:left">
        <el-collapse-item :title="$t('base.baseInfo')" name="sourceInfo">
          <el-col :span="20">
              <div class="table_panel">
                <table class="table table-content table-hover idatatable" border="1">
                  <tbody>
                    <tr class="odd" v-for="item in sourceInfoList" v-bind:key="item.name">
                      <th class="idatath">{{item.name}}：</th>
                      <td class="idatatd">{{item.value}}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-col>
        </el-collapse-item>
      </el-collapse>
    </el-col>
  </el-row>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: "VolumeSourceInfo",
  props: ["sourceInfo"],
  data() {
    return {
      activeNames: ["sourceInfo"],
      sourceInfoList: [],
      volumeStatusList: [
        { id: "available", name: this.$t("storage.available") },
        { id: "creating", name: this.$t("storage.creating") },
        { id: "in-use", name: this.$t("storage.inUsing") },
        { id: "reserved", name: this.$t("storage.reserved") },
        { id: "attaching", name: this.$t("storage.installing") },
        //{ id: "retyping", name: this.$t("storage.retyping") },
        { id: "detaching", name: this.$t("storage.uninstaling") },
        { id: "maintenance", name: this.$t("storage.migrationing") },
        { id: "deleting", name: this.$t("storage.deleting") },
        { id: "error", name: this.$t("storage.error") },
        { id: "extending", name: this.$t("storage.extendingStatus") },
        { id: "error_extending", name: this.$t("storage.extendingError") },
        { id: "error_restoring", name: this.$t("storage.bakRecoveryError") },
        { id: "error_deleting", name: this.$t("storage.errorDeleting") },
        { id: "backing-up", name: this.$t("storage.backUping") },
        { id: "error-backing-up", name: this.$t("storage.backUPError") },
        { id: "restoring-backup", name: this.$t("storage.bakRecoverying") },
        { id: "downloading", name: this.$t("storage.downloadImaging") },
        { id: "uploading", name: this.$t("storage.uploadImaging") },
        { id: "soft_deleted", name: this.$t("storage.soft_deleted") },
        { id: "soft_deleting", name: this.$t("storage.soft_deleting") },
        { id: "awaiting-transfer", name: this.$t("storage.waitTransfering") },
        { id: "data-copying", name: this.$t("storage.dataCopying") },
        { id: "removing", name: this.$t("storage.removing") },
        { id: "reverting", name: this.$t("storage.reverting") },
        { id: "cloning", name: this.$t("storage.CLONGING") },
        { id: "clone_error", name: this.$t("storage.clone_error") }
      ]
    }
  },
  mounted() {
      this.loadData()
  },
  watch: {
    sourceInfo: {
      handler: function(rows, oldVal) {
        this.loadData();
      }
    }
  },
  methods: {
    show() {
    },
    loadData() {
      console.log(this.sourceInfo);
      const sourceInfo = this.sourceInfo["sourceInfo"];
      if (this.sourceInfo.type === "VolumeSnapSolt") {
        let size = sourceInfo["volume_size"] + "G";
        let status = this.volumeSnapsoltStatusRender(sourceInfo["status"]);
        let createdAt = this.dateRender(sourceInfo["created_at"]);
        this.sourceInfoList = [
          {"name": "ID", "value": sourceInfo["id"] || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_NAME'), "value": sourceInfo["display_name"] || sourceInfo["name"] ||"-"},
          {"name": this.$t('storage.VOLUME_SOURCE_SIZE'), "value": size},
          {"name": this.$t('storage.VOLUME_SOURCE_STATUS'), "value": status},
          {"name": this.$t('storage.VOLUME_SOURCE_CREATE_AT'), "value":createdAt}
        ];
      }
      if (this.sourceInfo.type === "VolumeBackup") {
        let size = sourceInfo["size"] + "G";
        let status = this.volumeBackupStatusRender(sourceInfo["status"]);
        let createdAt = this.dateRender(sourceInfo["created_at"]);
        this.sourceInfoList = [
          {"name": "ID", "value": sourceInfo["id"] || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_NAME'), "value": sourceInfo["display_name"] || sourceInfo["name"] || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_SIZE'), "value": size},
          {"name": this.$t('storage.VOLUME_SOURCE_STATUS'), "value": status},
          {"name": this.$t('storage.VOLUME_SOURCE_TYPE'), "value": this.increaseNumRender(sourceInfo["is_incremental"]) || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_CREATE_AT'), "value": createdAt}
        ];
      }
      if (this.sourceInfo.type === "Volume") {
        console.log(sourceInfo);
        let size = sourceInfo["size"] + "G";
        let status = this.volumeStatusRender(sourceInfo["status"]);
        let bootable = this.volumeBootableRender(sourceInfo["bootable"]);
        let createdAt = this.dateRender(sourceInfo["created_at"]);
        this.sourceInfoList = [
          {"name": "ID", "value": sourceInfo["id"] || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_NAME'), "value": sourceInfo["display_name"] || sourceInfo["name"] || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_SIZE'), "value": size},
          {"name": this.$t('storage.VOLUME_SOURCE_STATUS'), "value": status},
          {"name": this.$t('storage.VOLUME_SOURCE_TYPE'), "value": (sourceInfo["volume_type"] && sourceInfo["volume_type"]["name"]) || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_BOOTABLE'), "value": bootable},
          {"name": this.$t('storage.VOLUME_SOURCE_CREATE_AT'), "value": createdAt},
          {"name": this.$t('storage.VOLUME_SOURCE_AVAILABILITY_ZONE'), "value": sourceInfo["availability_zone"] || "-"}
        ];
      }
      if (this.sourceInfo.type === "Image") {
        let minDisk = sourceInfo["min_disk"] + "G";
        let minRam = sourceInfo["min_ram"] + "MB";
        let size = this.sizeRender(sourceInfo["size"]);
        this.sourceInfoList = [
          {"name": this.$t('storage.VOLUME_SOURCE_IMAGE_ID'), "value": sourceInfo["image_id"] || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_IMAGE_NAME'), "value": sourceInfo["image_name"] || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_IMAGE_MIN_DISK'), "value": minDisk},
          {"name": this.$t('storage.VOLUME_SOURCE_IMAGE_MIN_RAM'), "value": minRam},
          {"name": this.$t('storage.VOLUME_SOURCE_OS_DISTRO'), "value": sourceInfo["os_distro"] || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_OS_TYPE'), "value": sourceInfo["os_type"] || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_IMAGE_SIZE'), "value": size},
          {"name": this.$t('storage.VOLUME_SOURCE_IMAGE_FORMAT'), "value": sourceInfo["disk_format"] || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_IMAGE_DESCRIPTION'), "value": sourceInfo["description"] || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_IMAGE_MD5'), "value": sourceInfo["checksum"] || "-"}
        ];
      }
      if (this.sourceInfo.type === "InstanceSolt") {
        let size = this.sizeRender(sourceInfo["size"]);
        let minDisk = sourceInfo["min_disk"] + "G";
        let minRam = sourceInfo["min_ram"] + "MB";
        this.sourceInfoList = [
          {"name": this.$t('storage.VOLUME_SOURCE_INSTANCE_ID'), "value": sourceInfo["instance_uuid"] || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_INSTANCE_NAME'), "value": sourceInfo["instance_name"] || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_INSTANCE_SNAPSHOT_SIZE'), "value":size},
          {"name": this.$t('storage.VOLUME_SOURCE_MIN_DISK'), "value":minDisk},
          {"name": this.$t('storage.VOLUME_SOURCE_MIN_RAM'), "value": minRam},
          {"name": this.$t('storage.VOLUME_SOURCE_OS_DISTRO'), "value": sourceInfo["os_distro"] || "-"},
          {"name": this.$t('storage.VOLUME_SOURCE_OS_TYPE'), "value": sourceInfo["os_type"] || "-"}
        ];
      }
    },
    volumeBootableRender(value) {
      if (value && "true" === value.toString().toLowerCase()) {
        return this.$t("storage.yes");
      } else {
        return this.$t("storage.no");
      }
    },
    increaseNumRender(value) {
      if (value && "true" === value.toString().toLowerCase()) {
        return this.$t("storage.increaseNum");
      } else {
        return this.$t("storage.allNum");
      }
    },
    sizeRender(value) {
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
    volumeBackupStatusRender(value = "") {
       if ("available" == value) {
         return this.$t('storage.available');
       } else if ("creating" == value) {
         return this.$t('storage.creating');
       } else if ("deleting" == value) {
         return this.$t('storage.deleting');
       } else if ("error" == value) {
         return this.$t('storage.error');
       } else if ("restoring" == value) {
         return this.$t('storage.recoverying');
       } else if ("error_restoring" == value) {
         return this.$t('storage.recoveryError');
       } else {
          if (value != null) {
            return value;
          } else {
            return '-';
          }
       }
    },
    volumeSnapsoltStatusRender(value = "") {
      if (value == "creating") {
        return this.$t('storage.creating');
      } else if (value == "available") {
        return this.$t('storage.available');
      } else if (value == "backing-up") {
        return this.$t('storage.backUping');
      } else if (value == "deleting") {
        return this.$t('storage.deleting');
      } else if (value == "error") {
        return this.$t('storage.error');
      } else if (value == "deleted") {
        return this.$t('storage.deleted');
      } else if (value == "unmanaging") {
        return this.$t('storage.unmanageStarting');
      } else if (value == "restoring") {
        return this.$t('storage.reverting');
      } else if (value == "error_deleting") {
        return this.$t('storage.errorDeleting');
      }
    },
    volumeStatusRender(value) {
      if (value != null) {
        let r = value;
        for (let i = 0; i < this.volumeStatusList.length; i++) {
          if (this.volumeStatusList[i].id == value) {
            r = this.volumeStatusList[i].name;
            break;
          }
        }
        return r;
      } else {
        return "-";
      }
    },
    instanceStatusRender(value = "") {
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
    imageStatusRender(value = "") {
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
