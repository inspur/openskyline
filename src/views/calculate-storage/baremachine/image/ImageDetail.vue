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
                        {{imageInfo.name|| '-'}}
                      </td>
                    </tr>
                    <!-- <tr class="odd">
                      <th class="idatath">操作系统：</th>
                      <td class="idatatd">{{typeof(imageInfo.os_distro) == "undefined" ? '-' : imageInfo.os_distro}}</td>
                    </tr> -->
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.project')}}：</th>
                      <td class="idatatd">
                        {{projectOwnerName || '-'}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('calcStorLang.diskFormat')}}：</th>
                      <td class="idatatd">
                        {{imageInfo.disk_format|| '-'}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">ID：</th>
                      <td class="idatatd">
                        {{imageInfo.id|| '-'}}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-col>
        <!-- <el-col :span="12">
          <el-form  v-model="formInline" label-width="185px" label-position="left" class="me-form">
           <el-form-item label="名称">
             <span>{{imageInfo.name|| '-'}}</span>
           </el-form-item>
           <el-form-item label="操作系统">
             <span>{{typeof(imageInfo.os_distro) == "undefined" ? '-' : imageInfo.os_distro}}</span>
           </el-form-item>
           <el-form-item label="项目" >
             <span>{{projectOwnerName || '-'}}</span>
           </el-form-item>
           <el-form-item label="磁盘格式">
             <span>{{imageInfo.disk_format|| '-'}}</span>
           </el-form-item>
           <el-form-item label="ID">
             <span>{{imageInfo.id|| '-'}}</span>
           </el-form-item>
          </el-form>
      </el-col> -->
        <el-col :span="12">
              <div class="table_panel">
                <table class="table table-content table-hover idatatable" border="1">
                  <tbody>
                    <tr class="odd">
                      <th class="idatath">{{$t('calcStorLang.size')}}：</th>
                      <td class="idatatd">
                        {{sizeRender(imageInfo.size)}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.status')}}：</th>
                      <td class="idatatd">{{statusRender(imageInfo.status)}}</td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.createTime')}}：</th>
                      <td class="idatatd">
                        {{dateRender(imageInfo.created_at)}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.desc')}}：</th>
                      <td class="idatatd">
                        {{imageInfo.description|| '-'}}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-col>
      <!-- <el-col :span="12">
            <el-form  v-model="formInline" label-width="185px" label-position="left" class="me-form">           
             <el-form-item label="大小">
               <span>{{sizeRender(imageInfo.size)}}</span>
             </el-form-item>
             <el-form-item label="状态">
               <span>{{statusRender(imageInfo.status)}}</span>
             </el-form-item>
             <el-form-item label="创建时间">
               <span>{{dateRender(imageInfo.created_at)}}</span>
             </el-form-item>
             <el-form-item label="描述">
               <span>{{imageInfo.description|| '-'}}</span>
             </el-form-item>
             </el-form>
      </el-col> -->
    </el-collapse-item>
    </el-collapse>
    <el-col :span="24">
      <el-collapse v-model="activeNames" style="text-align:left">
        <el-collapse-item :title="$t('lang.detailInformation')" name="disk">
            <el-col :span="12">
              <div class="table_panel">
                <table class="table table-content table-hover idatatable" border="1">
                  <tbody>
                    <tr class="odd">
                      <th class="idatath">{{$t('calcStorLang.visibility')}}：</th>
                      <td class="idatatd">
                        {{visibilityRender(imageInfo.visibility)}}
                      </td>
                    </tr>
                    <!-- <tr class="odd">
                      <th class="idatath">最小内存(MB)：</th>
                      <td class="idatatd">{{imageInfo.min_ram|| '-'}}</td>
                    </tr> -->
                    <tr class="odd">
                      <th class="idatath">{{$t('calcStorLang.hashValue')}}：</th>
                      <td class="idatatd">
                        {{imageInfo.checksum|| '-'}}
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('calcStorLang.dockerFormat')}}：</th>
                      <td class="idatatd">
                        bare
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
                      <th class="idatath">{{$t('calcStorLang.protected')}}：</th>
                      <td class="idatatd">
                       {{protectedRender(imageInfo.protected)}}
                      </td>
                    </tr>
                   <!--  <tr class="odd">
                      <th class="idatath">最小磁盘(GB)：</th>
                      <td class="idatatd">{{imageInfo.min_disk|| '-'}}</td>
                    </tr> -->
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.updatedTime')}}：</th>
                      <td class="idatatd">
                        {{dateRender(imageInfo.updated_at)}}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-col>

        <!-- <el-col :span="12">
          <el-form  v-model="formInline" label-width="185px" label-position="left" class="me-form">           
           <el-form-item label="可见性">
             <span>{{visibilityRender(imageInfo.visibility)}}</span>
           </el-form-item>
           <el-form-item label="最小内存(MB)">
             <span>{{imageInfo.min_ram|| '-'}}</span>
           </el-form-item>
           <el-form-item label="哈希值">
             <span>{{imageInfo.checksum|| '-'}}</span>
           </el-form-item>
           <el-form-item label="容器格式">
             <span>bare</span>
           </el-form-item>
           </el-form>
        </el-col>
        <el-col :span="12">
          <el-form  v-model="formInline" label-width="185px" label-position="left" class="me-form">           
           <el-form-item label="受保护">
             <span>{{protectedRender(imageInfo.protected)}}</span>
           </el-form-item>
           <el-form-item label="最小磁盘(GB)">
             <span>{{imageInfo.min_disk|| '-'}}</span>
           </el-form-item>
           <el-form-item label="更新时间">
             <span>{{dateRender(imageInfo.updated_at)}}</span>
           </el-form-item>
           </el-form>
        </el-col> -->
        </el-collapse-item>
      </el-collapse>
    </el-col>
  </el-row>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: "detail",
  props: ['imageInfo', 'ownerName'],
  data() {
    return {
      activeNames: ['baseProperty', 'disk'],
      formInline: '',
      projectOwnerName: '',
      isSuperAdmin: Vue.roleType == "0"
    }
  },
  watch: {
     imageInfo: {
      immediate: true,
      handler: function(rows, oldVal) {
        this.loadProjectName();
      }
    }
  },
  methods: {
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
           return Vue.t('lang.shared');
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
    },
    async loadProjectName() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/keystone/v3/projects/"+ self.imageInfo['owner']
        });
        var entity = result["project"];
        self.projectOwnerName = entity['name'];
      } catch (res) {
      }
    }
  },
  mounted() {}
}
</script>
<style scoped>
.testHH {
  text-align: lelf;
}
</style>
