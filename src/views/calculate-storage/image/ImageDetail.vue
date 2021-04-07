<template>
  <div>
    <el-collapse :value="['1', '2', '3', '4']" style="text-align:left">
      <el-collapse-item :title="$t('calcStorLang.baseProperty')" name="1">
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
                <tr class="odd">
                  <th class="idatath">{{$t('calcStorLang.os')}}：</th>
                  <td class="idatatd">{{typeof(imageInfo.os_distro) == "undefined" ? '-' : imageInfo.os_distro}}</td>
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
                <tr class="odd">
                  <th class="idatath">{{$t('calcStorLang.IMAGE_VIRTUAL_SIZE')}}：</th>
                  <td class="idatatd">
                    <span v-if="imageInfo.inspur_virtual_size">
                      {{ imageInfo.inspur_virtual_size | fileSize }}
                    </span>
                    <span v-else>
                      -
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-col>
      </el-collapse-item>
      <el-collapse-item :title="$t('lang.detailInformation')" name="2">
        <el-col :span="12">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('calcStorLang.visibility')}}:</th>
                  <td class="idatatd">
                    {{visibilityRender(imageInfo.visibility)}}
                  </td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('calcStorLang.minMemory')}}：</th>
                  <td class="idatatd">{{imageInfo.min_ram|| '-'}}</td>
                </tr>
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
                <tr>
                  <th class="idatath">{{$t('calcStorLang.protected')}}：</th>
                  <td class="idatatd">
                    {{protectedRender(imageInfo.protected)}}
                  </td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('calcStorLang.minDisk')}}：</th>
                  <td class="idatatd">{{imageInfo.min_disk|| '-'}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('lang.updatedTime')}}：</th>
                  <td class="idatatd">
                    {{dateRender(imageInfo.updated_at)}}
                  </td>
                </tr>
                <tr>
                  <th class="idatath">{{ $t('calcStorLang.IMAGE_BACKEND_URL') }}</th>
                  <td class="idatatd">
                    <div v-div-wrap="{minHeight: '34px', expandText: $t('lang.EXPAND'), collapseText: $t('lang.COLLAPSE')}" v-html="imageInfo.locations.map(item => item.url).join('<br>')">
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-col>
      </el-collapse-item>
      <el-collapse-item :title="$t('lang.METADATA')" name="3">
        <div class="table_panel">
          <table v-if="metadata.length !== 0" class="table table-content table-hover idatatable" border="1">
            <tbody>
              <tr class="odd" v-for="(item, index) in metadata" :key="index">
                <th class="idatath">{{ item.key }}:</th>
                <td class="idatatd">{{ item.value }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else style="padding: 15px; text-align: center;">{{ $t('calcStorLang.IMAGE_METADATA_LIST_NONE') }}</div>
        </div>
      </el-collapse-item>
      <el-collapse-item :title="$t('calcStorLang.IMAGE_TAGS')" name="4">
        <div class="table_panel">
          <div v-if="imageTags.length === 0" style="padding: 15px; text-align: center;">{{ $t('calcStorLang.IMAGE_TAGS_NONE') }}</div>
          <div v-else>
            <el-tag type="primary" style="margin: 3.5px;" v-for="tag in imageTags" :key="tag" :close-transition="true" :closable="(imageInfo.roleType === '0' || imageInfo.owner === imageInfo.projectId) && imageInfo.status === 'active'" @close="handleDeleteTag(tag)">{{ tag }}</el-tag>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import _ from 'underscore';
import reservedMetadata from './ReservedMetadata';
export default {
  name: "detail",
  props: ['imageInfo', 'ownerName'],
  data() {
    return {
      activeNames: ['baseProperty', 'disk'],
      formInline: '',
      projectOwnerName: '',
      isSuperAdmin: Vue.roleType == "0",
      metadataSchema: [],
      metadata: [],
      imageTags: []
    }
  },
  watch: {
    imageInfo: {
      immediate: true,
      handler: async function(newValue, oldVal) {
        await this.loadProjectName();
        await this.loadMetadata();
        this.imageTags = JSON.parse(JSON.stringify(newValue.tags));
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
    },
    async loadMetadata() {
      const $this = this;
      $this.metadata = [];
      const res = await $this.$ajax({
        url: `api/glance/v2/images/${$this.imageInfo.id}`,
        type: 'get'
      });
      const metadata = [];
      for (let key in res) {
        if (reservedMetadata.find(item => item === key)) {
          continue;
        }
        if ($this.metadataSchema.hasOwnProperty(key) && $this.metadataSchema[key].hasOwnProperty('readOnly') && $this.metadataSchema[key]['readOnly'] === true) {
          continue;
        }
        let enums = [];
        metadata.push({
          key: key,
          value: res[key],
          enums
        });
      }
      $this.metadata = _.sortBy(metadata, 'key');
    },
    async loadMetadataSchema() {
      const $this = this;
      const res = await $this.$ajax({
        url: `api/glance/v2/schemas/image`,
        type: 'get'
      });
      $this.metadataSchema = res.properties;
    },
    async handleDeleteTag(tag) {
      const $this = this;
      await $this.$confirm(Vue.t('calcStorLang.IMAGE_TAGS_DELETE_CONFIRM'), Vue.t('base.prompt'), {
        type: 'warning'
      }).then(async () => {
        try {
          const projectId = Vue.roleType + '' === '0' ? $this.$cookie.get('pid') : $this.projectId;
          const res = await $this.$ajax({
            url: `api/glance/v2/images/${$this.imageInfo.id}/tags/${encodeURIComponent(tag)}`,
            headers: {
              'OpenStack-API-Version': 'compute 2.41',
              'X-OpenStack-Nova-API-Version': 2.41
            },
            type: 'DELETE',
            log: {
              description: {
                en: `Delete Image Tag: ${tag}, Image ID: ${$this.imageInfo.id}`,
                zh_cn: `删除镜像标签：${tag}，镜像ID：${$this.imageInfo.id}`
              },
              target: Vue.logTarget.computeMirror
            }
          })
          $this.$message.success(Vue.t('calcStorLang.IMAGE_TAGS_SUCCESS_DELETED'));
          $this.$emit('refresh');
          const i = $this.imageTags.findIndex(item => item === tag);
          if (i > -1) {
            $this.imageTags.splice(i, 1);
          }
        } catch (e) {
          __DEV__ && console.error(e);
        }
      })
    }
  },
  async mounted() {
    await this.loadMetadataSchema();
  }
}
</script>
<style scoped>
.testHH {
  text-align: lelf;
}
</style>
