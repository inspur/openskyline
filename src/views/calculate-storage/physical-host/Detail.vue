<template>
  <div>
    <el-collapse v-model="activeNames" style="text-align:left;height:100%;">
      <el-collapse-item :title="$t('calcStorLang.baseInfo')" name="baseProperty">
        <el-row :gutter="8">
          <el-col :span="12">
            <el-form label-width="170px" label-position="left" class="me-form">
              <el-form-item :label="$t('lang.name')">
                <span>{{physicalEntity.name || '-'}}</span>
              </el-form-item>
              <el-form-item label="ID">
                <span>{{physicalEntity.uuid || '-'}}</span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.maintenance')">
                <span>{{physicalEntity.maintenance == false?$t('lang.no'):$t('lang.yes')}}</span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.maintenanceReason')">
                <span>{{physicalEntity.maintenance_reason || '-'}}</span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.drive')">
                <span>{{physicalEntity.driver || '-'}}</span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.allowConsole')">
                <span>{{physicalEntity.console_enabled == false?$t('lang.no'):$t('lang.yes')}}</span>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12">
            <el-form label-width="170px" label-position="left" class="me-form">
              <el-form-item :label="$t('calcStorLang.physicalHost') + 'ID'">
                <span>{{physicalEntity.instance_uuid || '-'}}</span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.powerStatus')">
                <span>{{powerRender(physicalEntity.power_state)}}</span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.deployStatus')">
                <span>{{provisonRender(physicalEntity.provision_state)}}</span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.lastMistake')">
                <span>{{physicalEntity.last_error || '-'}}</span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.refreshOn')">
                <span>{{tzTimeFormatter(physicalEntity.updated_at)}}</span>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item :title="$t('calcStorLang.config') + $t('calcStorLang.outline')" name="config">
      <el-row :gutter="8">
      <el-col :span="8">
      <el-row :gutter="4">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item :label="$t('calcStorLang.outline') + $t('calcStorLang.baseInfo')+ '：'" style="font-weight:bold">
            </el-form-item>
          </el-form>
      </el-row>
      <el-row :gutter="4">
      <el-form label-width="170px" label-position="left" class="me-form">
              <el-form-item :label="$t('lang.name')">
                <span>{{physicalEntity.name || '-'}}</span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.createOn')">
                <span>{{tzTimeFormatter(physicalEntity.created_at)}}</span>
              </el-form-item>
      </el-form>
      </el-row>
          <el-row :gutter="4">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item :label="$t('calcStorLang.driveInfo') + '：'" style="font-weight:bold">
            </el-form-item>
          </el-form>
          </el-row>
      <el-row :gutter="4">
      <el-form label-width="170px" label-position="left" class="me-form">
              <el-form-item :label="'ipmi_terminal' + $t('lang.port')">
                <span v-html="portRender(physicalEntity)"></span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.bmcUserName')">
                <span v-html="bmcNameRender(physicalEntity)"></span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.bmcPassword')">
                <span v-html="bmcPassRender(physicalEntity)"></span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.bmcIP')">
                <span v-html="bmcIpRender(physicalEntity)"></span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.deployImageMomerydisk')">
                <span v-html="bmcRamdiskRender(physicalEntity)"></span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.deployImageKernal')">
                <span v-html="bmcKernelRender(physicalEntity)"></span>
              </el-form-item>
            </el-form>
            </el-row>
      </el-col>
      <el-col :span="8">
      <el-row :gutter="4">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item :label="$t('calcStorLang.propertyInfo') + '：'" style="font-weight:bold">
            </el-form-item>
          </el-form>
      </el-row>
      <el-row :gutter="4">
      <el-form label-width="170px" label-position="left" class="me-form">
              <el-form-item label="CPU">
                <span v-html="cpuRender(physicalEntity)"></span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.architecture')">
                <span v-html="cpuArchRender(physicalEntity)"></span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.memory')">
                <span v-html="memoryRender(physicalEntity)"></span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.rootDisk') + $t('calcStorLang.size')">
                <span v-html="localGbRender(physicalEntity)"></span>
              </el-form-item>
              <!--<el-form-item :label="$t('calcStorLang.PHYSICAL_DISK') + $t('calcStorLang.size')">
                <span v-html="physicalDisks.size"></span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.DISK_TYPE')">
                <span v-html="physicalDisks.rotational"></span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.VENDOR')">
                <span v-html="physicalDisks.vendor"></span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.MODEL_INFO')">
                <span v-html="physicalDisks.model"></span>
              </el-form-item>-->
      </el-form>
      </el-row>
      <el-row :gutter="4">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item :label="$t('calcStorLang.instanceInfo') + '：'" style="font-weight:bold">
            </el-form-item>
          </el-form>
      </el-row>
      <el-row :gutter="4">
      <el-form label-width="170px" label-position="left" class="me-form">
              <el-form-item :label="$t('calcStorLang.user') + $t('calcStorLang.image')">
                <span v-html="userImageRender(physicalEntity.instance_info)"></span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.userImageMomerydisk')">
                <span v-html="ramdiskRender(physicalEntity.instance_info)"></span>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.userImageKernal')">
                <span v-html="mediaRender(physicalEntity.instance_info)"></span>
              </el-form-item>
              <!-- <el-form-item label="根">
                <span>{{physicalEntity.instance_info.root_gb || '-'}}</span>
              </el-form-item> -->
            </el-form>
        </el-row>
      </el-col>
        <el-col :span="8">
        <el-row :gutter="4">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item :label="$t('calcStorLang.driverStatusValidate') + '：'" style="font-weight:bold">
            </el-form-item>
          </el-form>
      </el-row>
      <el-row :gutter="4">
        <el-form ref="physicalHost" label-width="100px">
          <el-table ref="umTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="id">
            <el-table-column prop="name" :label="$t('lang.name')" min-width="30">
            </el-table-column>
            <el-table-column prop="result" :label="$t('calcStorLang.isSuccess')" min-width="30">
              <template slot-scope="scope">
                <span>{{scope.row.result == false?$t('calcStorLang.fail'):$t('calcStorLang.success')}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="reason" :label="$t('calcStorLang.detail')" min-width="100">
          </el-table-column>
            </el-table-column>
          </el-table>
        </el-form>
        </el-row>
        </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import formatFileSize from 'utils/formatFileSize';
export default {
  name: 'PhyDetail',
  props: ['phyDetailUuid'],
  data() {
    return {
      physicalDisks: {},
      activeName: 'config',
      activeNames: ['baseProperty', 'config'],
      physicalEntity: '',
      formInline: '',
      tzTimeFormatter: this.$tzTimeFormatter,
      imagesMap: new Map(),
      formatFileSize:formatFileSize,
      tableData: []
    }
  },
  computed: {},
  mounted() {
    var self = this;
    Promise.all([self.loadImageList()]).then(function(result) {
        self.loadPhyHostDetail();
        self.loadPhyHostDetailList();
    });
  },
  methods: {
    async loadPhyHostDetail() {
      const self = this;
      const url = "api/ironic/v1/nodes/" + self.phyDetailUuid;
      try {
        let ret = await this.$ajax({
          url: url,
          headers: {
            "X-Openstack-Ironic-Api-Version": "latest"
          },
          type: 'get'
        });
        self.physicalEntity = ret;
        let properties = ret.properties;
        self.physicalDisks.size = "-";
        self.physicalDisks.rotational = "-";
        self.physicalDisks.vendor = "-";
        self.physicalDisks.model = "-";
        if (properties.physical_disks) {
          let physicalDisks = properties.physical_disks;
          let sizeArr = [];
          let rotationalArr = [];
          let vendorArr = [];
          let modelArr = [];
          for (let physicalDisk of physicalDisks) {
            let {size, rotational, vendor, model} = physicalDisk;
            size = formatFileSize(size, "Byte");
            sizeArr.push(size);
            rotationalArr.push(rotational);
            vendorArr.push(vendor);
            modelArr.push(model);
          }
          self.physicalDisks.size = sizeArr.join(";") || "-";
          self.physicalDisks.rotational = rotationalArr.join(";") || "-";
          self.physicalDisks.vendor = vendorArr.join(";") || "-";
          self.physicalDisks.model = modelArr.join(";") || "-";
        }
      } catch (data) {
        self.loading = false;
        __DEV__ && console.error(data);
      }
    },
    async loadPhyHostDetailList() {
      var self = this;
      var url = "api/ironic/v1/nodes/" + self.phyDetailUuid + "/validate";
      try {
        let ret = await this.$ajax({
          url: url,
          type: 'get'
        });
        var tempArr =[];
        for (var t in ret) {
            var obj = t;
            var objTemp = obj;
            switch (objTemp) {
              case "management":
              objTemp = Vue.t('calcStorLang.management');
              break;
              case "console":
              objTemp = Vue.t('calcStorLang.console');
              break;
              case "network":
              objTemp = Vue.t('calcStorLang.net');
              break;
              case "power":
              objTemp = Vue.t('calcStorLang.power');
              break;
              case "deploy":
              objTemp = Vue.t('calcStorLang.deploy');
              break;
              case "boot":
              objTemp = Vue.t('calcStorLang.guide');
              break;
              case "inspect":
              objTemp = Vue.t('calcStorLang.inspect');
              break;
              case "storage":
              objTemp = Vue.t('calcStorLang.storage');
              break;
              case "raid":
              objTemp = "raid";
              break;
              default:
              break;
            }
            var tableItem = {"name":objTemp, "result":ret[obj].result, "reason":ret[obj].reason};
            tempArr.push(tableItem);
        }
      self.tableData = tempArr;
      } catch (data) {
        self.loading = false;
        __DEV__ && console.error(data);
      }
    },
    async loadImageList() {
      var self = this;
      var url = "api/glance/v2/images?limit=99999";
      var rets = [];
      try {
        let ret = await this.$ajax({
          url: url,
          type: 'get'
        });
        let images = ret.images;
        for (var i = 0; i < images.length; i++) {
          let image = images[i];
          self.imagesMap.set(image.id, image.name + "(" + image.id + ")" );
        }
      } catch (data) {
        self.loading = false;
      }
    },
    userImageRender(key) {
       var self = this;
       if (typeof key == "undefined") {
           return "-";
       } else {
          var uuid = self.physicalEntity['instance_info']['image_source'] || "";
          if (uuid == "") {
            return "-";
          } else {
              return self.imagesMap.get(uuid);
          }
       }
    },
    ramdiskRender(key) {
       var self = this;
       if (typeof key == "undefined") {
           return "-";
       } else {
          var uuid = self.physicalEntity['instance_info']['ramdisk'] || "";
          if (uuid == "") {
            return "-";
          } else {
              return self.imagesMap.get(uuid);
          }
       }
    },
    mediaRender(key) {
       var self = this;
       if (typeof key == "undefined") {
           return "-";
       } else {
          var uuid = self.physicalEntity['instance_info']['kernel'] || "";
          if (uuid == "") {
            return "-";
          } else {
              return self.imagesMap.get(uuid);
          }
       }
    },
    portRender(entity) {
       if (typeof entity['driver_internal_info'] == "undefined") {
          return "-";
       } else {
          return entity['driver_internal_info']['allocated_ipmi_terminal_port'] || "-";
       }
    },
    bmcNameRender(entity) {
       if (typeof entity['driver_info'] == "undefined") {
          return "-";
       } else {
          return entity['driver_info']['ipmi_username'] || "-";
       }
    },
    bmcPassRender(entity) {
       if (typeof entity['driver_info'] == "undefined") {
          return "-";
       } else {
          return entity['driver_info']['ipmi_password'] || "-";
       }
    },
    bmcIpRender(entity) {
       if (typeof entity['driver_info'] == "undefined") {
          return "-";
       } else {
          return entity['driver_info']['ipmi_address'] || "-";
       }
    },
    bmcRamdiskRender(entity) {
       var self = this;
       if (typeof entity['driver_info'] == "undefined") {
          return "-";
       } else {
          var uuid = entity['driver_info']['deploy_ramdisk'] || "";
          if ("" != uuid) {
            return self.imagesMap.get(uuid);
          } else {
            return "-";
          }
       }
    },
    bmcKernelRender(entity) {
       var self = this;
       if (typeof entity['driver_info'] == "undefined") {
          return "-";
       } else {
          var uuid = entity['driver_info']['deploy_kernel'] || "";
          if ("" != uuid) {
            return self.imagesMap.get(uuid);
          } else {
            return "-";
          }
       }
    },
    cpuRender(entity) {
       if (typeof entity['properties'] == "undefined" || !entity['properties']['cpus']) {
          return "-";
       } else {
          return entity['properties']['cpus'] + "核"|| "-";
       }
    },
    cpuArchRender(entity) {
       if (typeof entity['properties'] == "undefined" || !entity['properties']['cpu_arch']) {
          return "-";
       } else {
          return entity['properties']['cpu_arch'] || "-";
       }
    },
    memoryRender(entity) {
       if (typeof entity['properties'] == "undefined" || !entity['properties']['memory_mb']) {
          return "-";
       } else {
          return this.formatFileSize(entity['properties']['memory_mb'], "MB", 0) || "-";
          // return entity['properties']['memory_mb'] + "MB"|| "-";
       }
    },
    localGbRender(entity) {
       if (typeof entity['properties'] == "undefined" || !entity['properties']['local_gb']) {
          return "-";
       } else {
          return entity['properties']['local_gb'] + "GB"|| "-";
       }
    },
    powerRender(value) {
       if ("power off" == value) {
        return Vue.t('calcStorLang.poweroff');
       } else if ("power on" == value) {
        return Vue.t('calcStorLang.poweron');
       } else if (undefined == value || null == value) {
        return "-";
       }
     },
    provisonRender(value) {
      if ("enroll" == value) {
        return Vue.t("calcStorLang.register");
      } else if ("available" == value) {
        return Vue.t("calcStorLang.active");
      } else if ("verifying" == value) {
        return Vue.t("calcStorLang.verifying");
      } else if ("manageable" == value) {
        return Vue.t("calcStorLang.manageable");
      } else if ("inspecting" == value) {
        return Vue.t("calcStorLang.inspecting");
      } else if ("inspect failed" == value) {
        return Vue.t("calcStorLang.inspectFailed");
      } else if ("cleaning" == value) {
        return Vue.t("calcStorLang.cleaning");
      } else if ("clean failed" == value) {
        return Vue.t("calcStorLang.cleanFailed");
      } else if ("deploying" == value) {
        return Vue.t("calcStorLang.deploying");
      } else if ("wait call-back" == value) {
        return Vue.t("calcStorLang.waittingCallback");
      } else if ("deploy failed" == value) {
        return Vue.t("calcStorLang.deployFailed");
      } else if ("active" == value) {
        return Vue.t("calcStorLang.running");
      } else if ("deleting" == value) {
        return Vue.t("calcStorLang.task_deleting");
      } else if ("error" == value) {
        return Vue.t("calcStorLang.error");
      } else if ("adopting" == value) {
        return Vue.t("calcStorLang.adopting");
      } else if ("adopt failed" == value) {
        return Vue.t("calcStorLang.adoptFailed");
      } else if ("rescue" == value) {
        return Vue.t("calcStorLang.rescue");
      } else if ("rescue wait" == value) {
        return Vue.t("calcStorLang.rescueWait");
      } else if ("rescue failed" == value) {
        return Vue.t("calcStorLang.rescueFailed");
      } else if ("rescuing" == value) {
        return Vue.t("calcStorLang.rescuing");
      } else if ("unrescuing" == value) {
        return Vue.t("calcStorLang.unrescuing");
      } else if ("unrescue failed" == value) {
        return Vue.t("calcStorLang.unrescueFailed");
      } else if ("clean wait" == value) {
        return Vue.t("calcStorLang.cleanWait");
      } else if ("inspect wait" == value) {
        return Vue.t("calcStorLang.inspectWait");
      } else if (undefined == value || null == value) {
        return "-";
      }
    }
  }
}

</script>
