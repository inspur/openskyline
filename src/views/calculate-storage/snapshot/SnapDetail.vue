<template>
  <el-row>
      <el-collapse v-model="activeNames" style="text-align:left">
        <el-collapse-item :title="$t('calcStorLang.baseProperty')" name="baseProperty">
          <el-col :span="12">
              <div class="table_panel">
                <table class="table table-content table-hover idatatable" border="1">
                  <tbody>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.name')}}：</th>
                      <td class="idatatd">
                        {{snapInfo.name|| '-'}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">ID：</th>
                      <td class="idatatd">
                        {{snapInfo.id|| '-'}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.project')}}：</th>
                      <td class="idatatd">
                        {{projectOwnerName || '-'}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('calcStorLang.diskFormat')}}：</th>
                      <td class="idatatd">
                        {{snapInfo.disk_format|| '-'}}
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
                      <th class="idatath">{{$t('calcStorLang.os')}}：</th>
                      <td class="idatatd">{{typeof(snapInfo.os_distro) == "undefined" ? '-' : snapInfo.os_distro}}</td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('calcStorLang.mindiskGB')}}：</th>
                      <td class="idatatd">
                        {{snapInfo.min_disk>=0?snapInfo.min_disk:'-'}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('calcStorLang.minmemGB')}}：</th>
                      <td class="idatatd">
                        {{snapInfo.min_ram>=0?Number(snapInfo.min_ram/1024):'-'}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('calcStorLang.vmimage')}}：</th>
                      <td class="idatatd">
                        {{snapInfo.base_image_ref|| '-'}}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-col>
    </el-collapse-item>
    <el-collapse-item :title="$t('calcStorLang.otherProperty')" name="otherProperty" v-if="snapInfo.block_device_mapping">
      <h3>{{$t('calcStorLang.kuaiequ')}}
      <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.kuaips')">
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
      </h3>
      <div class="table_panel">
        <el-table ref="aaTable" :data="JSON.parse(snapInfo.block_device_mapping)" highlight-current-row border stripe>
          <el-table-column  prop="snapshot_id" :label="$t('calcStorLang.volumeSnapshot') + 'ID'" show-overflow-tooltip  min-width="100" align="left">
            <template slot-scope="scope">
              <el-popover ref="volDetailPop" placement="top" trigger="click">
                <div class="table_panel" style="width:410px">
                <table class="table table-content table-hover idatatable table-bordered" border="1">
                  <tbody>
                    <tr class="odd">
                      <th class="idatath">{{$t('calcStorLang.volumeSnapshot') + $t('base.name')}}：</th>
                      <td class="idatatd">
                        {{hardName|| '-'}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('calcStorLang.volumeSnapshot') + "ID"}}：</th>
                      <td class="idatatd">
                        {{hardId|| '-'}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.status')}}：</th>
                      <td class="idatatd">
                        <template>
                          <el-tag :type="statusTagRender(hardstatus)">
                            <span v-html="statustableRender(hardstatus, scope.row)"></span>
                          </el-tag>
                        </template>
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('calcStorLang.fvolume') + "ID"}}：</th>
                      <td class="idatatd">
                        {{fhardId|| '-'}}
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </el-popover>
              <el-button v-popover:volDetailPop type="text" @click="snapIdDetail(scope.row.snapshot_id)">{{instanceIdRender(scope.row.snapshot_id, scope.row)}}</el-button>
            </template>
          </el-table-column>
          <el-table-column  prop="volume_size" :label="$t('container.size') + '/GB'" show-overflow-tooltip  min-width="25" align="left">
          </el-table-column>
          <el-table-column  prop="boot_index" :label="$t('calcStorLang.bootdisk')" show-overflow-tooltip  min-width="25" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.boot_index+""=="0"?$t('lang.yes'):$t('lang.no')}}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-collapse-item>
    </el-collapse>
  </el-row>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: "detail",
  props: ['snapInfo', 'ownerName', 'adminId'],
  data() {
    return {
      activeNames: ['baseProperty'],
      hardName:"",
      hardId:"",
      hardstatus:"",
      fhardId:"",
      formInline: '',
      projectId:"",
      projectOwnerName: '',
      instanceName: '',
      isSuperAdmin: Vue.roleType == "0"
    }
  },
  watch: {
     snapInfo: {
      immediate: true,
      handler: function(rows, oldVal) {
        this.loadProjectName();
      }
    }
  },
  methods: {
    statusTagRender(status) {
        if ("available" == status) {
           return "success";
        } else if ("deleted" == status) {
           return "gray";
        } else if ("error" == status || "error_deleting" == status) {
           return "danger";
        } else if ("creating" == status || "backing-up" == status || "unmanaging" == status || "restoring" == status || "deleting" == status) {
           return "info";
        } else {
          return "";
        }
    },
    statustableRender(value) {
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
        return this.$t('storage.restoring');
      } else if (value == "error_deleting") {
        return this.$t('storage.errorDeleting');
      }
    },
    async snapIdDetail(id) {
      var self = this;
      var iturl = "";
      self.hardName = "";
      self.hardId = "";
      self.hardstatus = "";
      self.fhardId = "";
      try {
        if (Vue.roleType=="0") {
          iturl = "api/cinder/v3/" + self.adminId + "/snapshots/" + id
        } else {
          iturl = "api/cinder/v3/" + self.projectId + "/snapshots/" + id
        }
        let insResult = await self.$ajax({
          type: 'get',
          url: iturl
        });
        var instanceE = insResult["snapshot"];
        self.hardName = instanceE['name'];
        self.hardId = instanceE['id'];
        self.hardstatus = instanceE['status'];
        self.fhardId = instanceE['volume_id'];
      } catch (res) {
      }
    },
    instanceIdRender(value, rowData) {
      if ("" == value || null == value) {
        return "-";
      }
      return value;
    },
    async loadProjectName() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/keystone/v3/projects/"+ self.snapInfo['owner']
        });
        var entity = result["project"];
        self.projectOwnerName = entity['name'];
        self.projectId = entity['id'];
      } catch (res) {
      }
    },
  sizeRender(value) {
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
    statusRender(value) {
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
  },
  mounted() {}
}
</script>
<style scoped>
.kuai{
  text-align: left;
  line-height: 20px;
}
</style>
