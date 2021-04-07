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
                        {{shareInfo.name}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.project')}}：</th>
                      <td class="idatatd">{{projectName}}</td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.status')}}：</th>
                      <td class="idatatd">
                        {{status}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('storage.size')}}：</th>
                      <td class="idatatd">
                        {{shareInfo.size}}GB
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('storage.protocolType')}}：</th>
                      <td class="idatatd">
                        {{shareInfo.share_proto}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('storage.createdTime')}}：</th>
                      <td class="idatatd">
                        {{dateRender(shareInfo.created_at)}}
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
                      <th class="idatath">ID：</th>
                      <td class="idatatd">{{shareInfo.id}}</td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('storage.owner')}}：</th>
                      <td class="idatatd">
                        {{userName}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.desc')}}：</th>
                      <td class="idatatd">
                        <el-tooltip :content="description" v-show="description.length > 0 && typeof (description) != 'undefined'">
                          <span>{{description.length>20?description.substring(0,20) + "...":description}}</span>
                        </el-tooltip>
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('storage.shareStorageType')}}：</th>
                      <td class="idatatd">
                        {{shareInfo.share_type_name}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('storage.availabilityZone')}}：</th>
                      <td class="idatatd">
                        {{shareInfo.availability_zone}}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-col>
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <el-col :span="24">
      <el-collapse v-model="activeNames" style="text-align:left">
        <el-collapse-item :title="$t('storage.shareStoragePath')" name="metadata">
          <el-form :inline="true" v-model="formInline" class="">
            <el-table ref="metaTable" :data="tableData" highlight-current-row border stripe style="width: 100%;" max-height='500' row-key="key">
              <el-table-column prop="id" align="left" label="ID"  min-width="100">
              </el-table-column>
              <el-table-column prop="path" align="left" :label="$t('storage.path')" min-width="100">
              </el-table-column>
            </el-table>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-col>
  </el-row>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: "detail",
  props: ['shareInfo', 'projectMaps', 'userMaps'],
  data() {
    return {
      activeNames: ['baseProperty', 'metadata'],
      formInline: '',
      tableData: [],
      status: '',
      description: '',
      source: '',
      projectName: '',
      userName: '',
      loading: false
    }
  },
  watch: {
    shareInfo: {
      handler: function(rows, oldVal) {
        this.loadData();
      }
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    show() {
    },
    loadData() {
      var self = this;
      if ( typeof (self.shareInfo.description) == "undefined" || null == self.shareInfo.description) {
        self.description = "";
      } else {
        self.description = self.shareInfo.description;
      }
      self.status = self.shareStatusRender(self.shareInfo.status, self.shareInfo);
      self.loadShareExportLocations();
      self.projectName = self.shareProjectRender(self.shareInfo.project_id, self.shareInfo);
      self.userName = self.shareUserRender(self.shareInfo.user_id, self.shareInfo);
    },
    showMetada(key, val) {
      return key + ":" + val;
    },
    async loadShareExportLocations() {
      try {
        var url = "api/manila/v2/" + this.$cookie.get("pid") + "/shares/" + this.shareInfo.id + "/export_locations";
        let result = await this.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        this.tableData = result['export_locations'];
      } catch (res) {
      }
    },
    shareProjectRender(value, rowData) {
      var name = this.projectMaps.get(value);
      if (null == name || "" == name) {
        return value;
      } else {
        return name;
      }
    },
    shareUserRender(value, rowData) {
      var name = this.userMaps.get(value);
      if (null == name || "" == name) {
        return value;
      } else {
        return name;
      }
    },
    shareStatusRender(value, rowData) {
       if ("available" == value) {
         return this.$t('storage.available');
       } else if ("creating" == value) {
         return this.$t('storage.creating');
       } else if ("deleted" == value) {
         return this.$t('storage.deleted');
       } else if ("inactive" == value) {
         return this.$t('storage.inactive');
       } else if ("manage_starting" == value) {
         return this.$t('storage.managing');
       } else if ("manage_error" == value) {
         return this.$t('storage.manageError');
       } else if ("unmanage_starting" == value) {
         return this.$t('storage.unmanageStarting');
       } else if ("deleting" == value) {
         return this.$t('storage.deleting');
       } else if ("error" == value) {
         return this.$t('storage.error');
       } else if ("error_deleting" == value) {
         return this.$t('storage.errorDeleting');
       } else if ("umanage_error" == value) {
         return this.$t('storage.umanageError');
       } else if ("unmanaged" == value) {
         return this.$t('storage.unmanaged');
       } else if ("extending" == value) {
         return this.$t('storage.extending');
       } else if ("extending_error" == value) {
         return this.$t('storage.extendingError');
       } else {
          if (value != null) {
            return value;
          } else {
            return '-';
          }
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
