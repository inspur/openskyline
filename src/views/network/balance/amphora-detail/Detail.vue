<template>
  <div>
    <el-collapse v-model="activeNames" style="text-align:left">
      <el-collapse-item :title="$t('calcStorLang.instDetailBaseproperty')" name="baseProperty">
        <el-col :span="12">
          <div class="table_panel">
            <table
              class="table table-content table-hover idatatable"
              border="1"
              v-loading="loading"
            >
              <tbody>
                <tr>
                  <th class="idatath">{{$t('lang.name')}}:</th>
                  <td class="idatatd">
                    <el-tooltip
                      :content="server.name"
                      v-show="server.name&&server.name.length > 20"
                    >
                      <span>{{server.name.substring(0, 20) + "..."}}</span>
                    </el-tooltip>
                    <span v-show="server.name&&server.name.length <= 20">{{server.name}}</span>
                  </td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('calcStorLang.status')}}:</th>
                  <td class="idatatd">{{server.status}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('calcStorLang.createTime')}}:</th>
                  <td class="idatatd">{{server.time}}</td>
                </tr>
                <!-- <tr>
                  <th class="idatath">{{$t('calcStorLang.instDetailUserName')}}:</th>
                  <td class="idatatd">
                    <el-tooltip
                      :content="server.user"
                      v-show="server.user&&server.user.length > 20"
                    >
                      <span>{{server.user.substring(0, 20) + "..."}}</span>
                    </el-tooltip>
                    <span v-show="server.user&&server.user.length <= 20">{{server.user}}</span>
                  </td>
                </tr> -->
              </tbody>
            </table>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="table_panel">
            <table
              class="table table-content table-hover idatatable"
              border="1"
              v-loading="loading"
            >
              <tbody>
                <tr>
                  <th class="idatath">{{$t('calcStorLang.UUID')}}:</th>
                  <td class="idatatd">
                    <span>{{server.id}}</span>
                  </td>
                </tr>
                <!-- <tr>
                  <th class="idatath">{{$t('lang.desc')}}:</th>
                  <td
                    class="idatatd"
                    @mouseenter="descEditForm.editButtonShown = true"
                    @mouseleave="descEditForm.editButtonShown = false"
                  >
                    <div v-show="!descEditForm.editMode">
                      <el-tooltip
                        :content="server.description"
                        v-show="server.description&&server.description.length > 20"
                      >
                        <span>{{server.description.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span
                        v-show="server.description&&server.description.length <= 20"
                      >{{server.description}}</span>
                      <i
                        class="el-icon-edit"
                        v-if="descEditForm.editButtonShown"
                        @click="handleDescEdit();"
                        style="cursor: pointer;"
                      />
                    </div>
                    <div v-show="descEditForm.editMode">
                      <el-input
                        ref="descEditInput"
                        v-model="descEditForm.desc"
                        type="textarea"
                        @blur="handleDescEditSubmit"
                        :autofocus="true"
                        :disabled="saving"
                      />
                    </div>
                  </td>
                </tr> -->
                <tr>
                  <th class="idatath">{{$t('calcStorLang.host')}}:</th>
                  <td class="idatatd">{{server.host}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('lang.projectName')}}:</th>
                  <td class="idatatd">
                    <el-tooltip
                      :content="server.project"
                      v-show="server.project&&server.project.length > 20"
                    >
                      <span>{{server.project.substring(0, 20) + "..."}}</span>
                    </el-tooltip>
                    <span v-show="server.project&&server.project.length <= 20">{{server.project}}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-col>
      </el-collapse-item>
      <el-collapse-item :title="$t('calcStorLang.instDetailHardwareInfo')" name="disk">
        <el-col :span="24">
          <div class="table_panel">
            <table
              class="table table-content table-hover idatatable"
              border="1"
              v-loading="loading"
            >
              <tbody>
                <tr>
                  <th class="idatath" style="width:230px">CPU：</th>
                  <td class="idatatd">{{server.vcpus}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('calcStorLang.memory')}}：</th>
                  <td class="idatatd">{{server.memory}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('calcStorLang.instDetailStartupDisk')}}：</th>
                  <td class="idatatd">{{server.disk}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-col>
      </el-collapse-item>
      <el-collapse-item :title="$t('calcStorLang.instDetailNetDetail')" name="netaddr">
        <el-table
          id="netcardTbl"
          ref="specTable"
          :data="netTableData"
          highlight-current-row
          border
          stripe
          row-key="key"
          v-loading="loading"
        >
          <el-table-column prop="name" :label="$t('calcStorLang.instNetworkName')" align="left"></el-table-column>
          <el-table-column prop="ip" align="left" label="IP">
            <template slot-scope="scope">
              <template v-if="scope.row.ip.length > 0">
                <div v-for="obj in scope.row.ip" :key="obj">
                  <span>{{obj}}</span>
                </div>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="fip" align="left" :label="$t('network.floatingIP')">
            <template slot-scope="scope">
              <template v-if="scope.row.fip.length > 0">
                <div v-for="obj in scope.row.fip" :key="obj">
                  <span>{{obj}}</span>
                </div>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="mac" align="left" label="MAC" />
        </el-table>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import moment from "moment";

export default {
  name: "detail",
  props: ["data"],
  components: {},
  data() {
    return {
      netTableData: [],
      loading: false,
      server: {
        name: "-",
        id: "-",
        host: "-",
        status: "-",
        os: "-",
        time: "-",
        project: "-",
        user: "-",
        vcpus: "-",
        memory: "-",
        description: "-",
        disk: "-"
      },
      activeNames: ["baseProperty", "disk", "netaddr"],
      roleType: Vue.roleType + "",
      saving: false,
      descEditForm: {
        editButtonShown: false,
        editMode: false,
        desc: "",
        saving: false
      }
    };
  },
  watch: {
    data: {
      handler: function(rows, oldVal) {
        Promise.all([this.getData()]).then(result => {
          this.loading = false;
        });
      },
      deep: true
    }
  },
  mounted() {
    this.loading = true;
    Promise.all([this.getData()]).then(result => {
      this.loading = false;
    });
  },
  methods: {
    initData() {
      Object.keys(this.server).forEach(k => {
        let t = Object.prototype.toString;
        if (
          t.call(this.server[k]) === "[object String]" ||
          t.call(this.server[k]) === "[object Number]"
        ) {
          this.server[k] = "-";
        } else if (this.server[k]) {
          this.server[k] = new this.server[k].constructor();
        }
      });
    },
    async getData() {
      this.loading = true;
      let result =
        (await this.$ajax({
          type: "get",
          url: "api/nova/v2.1/servers-inspur/" + this.data.instanceID,
          complete: function(XMLHttpRequest, textStatus) {},
          headers: {
            "X-OpenStack-Nova-API-Version": 2.41
          }
        }).catch(v => {
          this.initData();
        })) || {};

      this.server = result["server"] || this.server;

      this.server.id = this.server["id"] || "-";
      this.server.name = this.server["name"] || "-";
      this.server.description = this.server["description"] || "-";
      this.server.host =
        this.server["OS-EXT-SRV-ATTR:hypervisor_hostname"] || "-";
      this.server.status = this.statusRender(this.server["status"]);
      let os = "-";
      if (
        this.server["system_metadata"] &&
        this.server["system_metadata"]["image_os_distro"]
      ) {
        os = this.server["system_metadata"]["image_os_distro"];
      }
      this.server.os = os;
      let time = this.server["created"] || "-";
      if (time && time !== "-") {
        this.server.time = moment(time).format("YYYY-MM-DD HH:mm:ss");
      }
      this.server.project = this.projectRender(this.server["tenant_id"]) || "-";
      this.server.user = this.data.userMaps.get(this.server["user_id"]) || "-";
      this.server.vcpus = this.server["vcpus"] || "-";
      if (this.server.vcpus !== "-") {
        this.server.vcpus += ` ${Vue.t("calcStorLang.core")}`;
      }

      let mm = this.server["memory_mb"] || "-";
      if (mm !== "-") {
        if (Object.prototype.toString.call(3) === "[object Number]") {
          mm = mm.toFixed(0);
        }
        if (mm >= 1024) {
          mm = mm / 1024;
          mm += " GB";
        } else {
          mm += " MB";
        }
      }
      this.server.memory = mm;

      this.server.disk = this.server["root_gb"] || "-";
      if (this.server["root_bdm"]) {
        this.server.disk = this.server["root_bdm"]["volume_size"] || "-";
      }
      if (this.server.disk !== "-") {
        this.server.disk += " GB";
      }

      const addresses = this.server["addresses"] || {};
      const netCards = [];
      Object.keys(addresses).forEach(k => {
        let a = addresses[k] || [];

        a.forEach(v => {
          let netCard = netCards.find(
            i => i.id === v.network_id && i.mac === v["OS-EXT-IPS-MAC:mac_addr"]
          );
          if (!netCard) {
            const n = this.data.networkMaps.get(v.network_id);
            netCard = {
              id: v.network_id || "-",
              name: n || "-",
              ip: [],
              fip: [],
              mac: "-"
            };
            netCards.push(netCard);
          }
          if (v["OS-EXT-IPS:type"] === "fixed") {
            netCard.ip.push(v.addr);
            netCard.mac = v["OS-EXT-IPS-MAC:mac_addr"] || "-";
          }
        });
      });
      Object.keys(addresses).forEach(k => {
        let a = addresses[k] || [];
        a.forEach(v => {
          let netCard = netCards.find(
            i => i.id === v.network_id && i.mac === v["OS-EXT-IPS-MAC:mac_addr"]
          );
          if (netCard && v["OS-EXT-IPS:type"] === "floating") {
            netCard.fip.push(v.addr);
          }
        });
      });
      netCards.forEach(v => {
        if (!v.ip.length) {
          v.ip = ["-"];
        }
        if (!v.fip.length) {
          v.fip = ["-"];
        }
      });
      this.netTableData = netCards;
    },
    statusRender(value) {
      if (value == "BUSY") {
        return "<i class='el-icon-loading'></i>";
      } else if (value == "ACTIVE") {
        return Vue.t("calcStorLang.running");
      } else if (value == "BUILD") {
        return Vue.t("calcStorLang.build");
      } else if (value == "DELETED") {
        return Vue.t("calcStorLang.instDetailDeleted");
      } else if (value == "SOFT_DELETED") {
        return Vue.t("calcStorLang.instDetailSoftDeleted");
      } else if (value == "ERROR") {
        return Vue.t("calcStorLang.error");
      } else if (value == "REBOOT") {
        return Vue.t("calcStorLang.instDetailReboot");
      } else if (value == "HARD_REBOOT") {
        return Vue.t("calcStorLang.instDetailHardReboot");
      } else if (value == "PAUSED") {
        return Vue.t("calcStorLang.paused");
      } else if (value == "MIGRATING") {
        return Vue.t("calcStorLang.migrating");
      } else if (value == "PASSWORD") {
        return Vue.t("calcStorLang.password");
      } else if (value == "REBUILD") {
        return Vue.t("calcStorLang.rebuild");
      } else if (value == "RESCUE") {
        return Vue.t("calcStorLang.rescue");
      } else if (value == "REVERT_RESIZE") {
        return Vue.t("calcStorLang.revert_resize");
      } else if (value == "SHELVED") {
        return Vue.t("calcStorLang.shelved_offloaded");
      } else if (value == "SHELVED_OFFLOADED") {
        return Vue.t("calcStorLang.shelved_offloaded");
      } else if (value == "SHUTOFF") {
        return Vue.t("calcStorLang.closed");
      } else if (value == "SUSPENDED") {
        return Vue.t("calcStorLang.suspended");
      } else if (value == "UNKNOW") {
        return Vue.t("calcStorLang.unknow");
      } else if (value == "VERIFY_RESIZE") {
        return Vue.t("calcStorLang.verify_resize");
      } else {
        return "-";
      }
    },
    projectRender(value) {
      if (Vue.roleType == "3") {
        let n = "";
        let l = Vue.projectList;
        for (let p = 0; p < l.length; p++) {
          let obj = l[p];
          if (obj.id == value) {
            n = obj.name;
            break;
          }
        }
        return n;
      } else {
        return this.data.projectMaps.get(value);
      }
    },
    handleDescEdit() {
      this.descEditForm.desc = this.server.description;
      this.descEditForm.editMode = true;
      this.$nextTick(() => {
        this.$refs.descEditInput.$el.children[0].focus();
      });
    },
    async handleDescEditSubmit() {
      this.descEditForm.desc = this.descEditForm.desc.trim();
      if (this.descEditForm.desc === this.server.description) {
        // 没有变化就直接退出编辑模式，不执行保存逻辑
        this.descEditForm.editMode = false;
      } else {
        if (this.descEditForm.desc.length > 255) {
          this.$message.error(
            this.$t("calcStorLang.INSTANCE_DETAIL_EDIT_DESC_MAX_LENGTH_TIPS")
          );
        } else {
          try {
            this.descEditForm.saving = true;
            await this.$ajax({
              type: "put",
              url: `api/nova/v2.1/servers/${this.data.instanceID}`,
              headers: {
                "X-OpenStack-Nova-API-Version": 2.67
              },
              data: JSON.stringify({
                server: {
                  description: this.descEditForm.desc
                }
              }),
              log: {
                description: {
                  en: `server Edit Description (Name: ${this.server.name}, Id: ${this.data.instanceID})`,
                  zh_cn: `云主机编辑描述(云主机名：${this.server.name}, Id: ${this.data.instanceID})`
                },
                target: Vue.logTarget.computeinstance
              }
            });
            this.server.description = this.descEditForm.desc;
            this.descEditForm.saving = false;
            this.descEditForm.editMode = false;
            this.$message.success(
              this.$t("calcStorLang.INSTANCE_DETAIL_EDIT_DESC_SUCCESSFULLY")
            );
          } catch (e) {
            this.descEditForm.saving = false;
            __DEV__ && console.error(e);
          }
        }
      }
    }
  }
};
</script>
<style scoped>
.el-button--small {
  margin-bottom: 5px;
}
.table {
  table-layout: fixed;
}
</style>
