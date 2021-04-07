<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus"></operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table
      ref="umTable"
      :data="tableData"
      v-loading="loading"
      stripe
      highlight-current-row
      border
      style="width: 100%"
      row-key="id"
      :default-sort="{prop: 'name'}"
      @selection-change="handleSelectionChange"
      @sort-change="sortChange">
      <el-table-column reserve-selection type="selection" width="55" align="center"></el-table-column>
      <el-table-column
        sortable
        v-if="columnsChecked.indexOf('name') >= 0"
        :label="$t('lang.name')"
        prop="name"
        min-width="60"
      >
        <template slot-scope="scope">
          <el-button @click="showSegmentHosts(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('uuid') >= 0"
        label="UUID"
        prop="uuid"
        min-width="100"
      ></el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('recovery_method') >= 0" prop="recovery_method"
        :label="$t('calcStorLang.recoveryMethod')" min-width="60">
        <template slot-scope="scope">
          <span v-html="recoveryRender(scope.row.recovery_method, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('service_type') >= 0"
        :label="$t('calcStorLang.serviceType')"
        prop="service_type"
        min-width="60"></el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('enable') >= 0"
        :label="$t('calcStorLang.haSwitch')"
        prop="enable" min-width="60"
      >
        <template slot-scope="scope">
          {{ scope.row.enable === true ? $t('calcStorLang.switchOn') : $t('calcStorLang.switchOff') }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('description') >= 0"
        :label="$t('lang.desc')"
        prop="description" min-width="160"
      ></el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
          <span>{{$t('lang.currentSelected') + multipleSelection.length + " " + $tc("lang.item", multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox
                class="item"
                v-for="(item, index) in columns"
                :label="item.prop"
                :key="index"
              >{{item.label}}</el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :objStorFlag="currentPageReset" :pageCount="10"></page>
        </el-col>
      </el-row>
    </div>

    <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="segmentHostsFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix" >
           <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
          </div>
          <div style="text-align: left;">
            <segment-hosts :segmentId="currentSegmentId" :segmentName="currentSegmentName"></segment-hosts>
          </div>
        </panel>
      </div>
    </transition>

    <add-segment v-if="addSegmentFlag" ref="addSegment" @handleClose="handleAddSegmentClose" @handleAddSegment="getData()"></add-segment>
    <edit-segment v-if="editSegmentFlag" ref="editSegment" @handleClose="handleEditSegmentClose" @handleEditSegment="getData()"  :segment_id="editSegmentId"></edit-segment>
  </div>
</template>
<script>
import AddSegment from "./AddSegment";
import EditSegment from "./EditSegment";
import SegmentHosts from "./SegmentHosts";

export default {
  name: "HaSegments",
  components: {
    AddSegment,
    EditSegment,
    SegmentHosts
  },
  data() {
    return {
      loading: true,
      manageHostFlag: false,
      metadataFlag: false,
      addSegmentFlag: false,
      editSegmentFlag: false,
      editSegmentId: "",
      segmentHostsFlag: false,
      currentSegmentId: '',
      currentSegmentName: '',
      currentPageReset: false,
      hostName: "",
      hostDomain: "",
      editId: "",
      currentPage: 1,
      showBorder: true,
      totalData: [],
      addedHosts: [],
      oldhosts: [],
      metadata: "",
      columns: [
        {
          prop: "name",
          label: Vue.t("lang.name")
        },
        {
          prop: "uuid",
          label: "UUID"
        },
        {
          prop: "recovery_method",
          label: Vue.t("calcStorLang.recoveryMethod")
        },
        // {
        //   prop: "service_type",
        //   label: Vue.t("calcStorLang.serviceType")
        // },
        {
          prop: "enable",
          label: Vue.t("calcStorLang.haSwitch")
        },
        {
          prop: "description",
          label: Vue.t("lang.desc")
        }
      ],
      columnsChecked: ["name", "uuid", "recovery_method", "enable", "description"],
      tableData: [],
      multipleSelection: [],
      operationMenus: [
        {
          icon: "fa-plus",
          name: Vue.t("calcStorLang.create"),
          showflg: true,
          readOnly: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            this.addSegmentShow();
          }.bind(this)
        },
        {
          icon: "fa-pencil-square-o",
          name: Vue.t("lang.edit"),
          showflg: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            this.editSegmentShow();
            this.editSegmentId = selectRows[0].uuid;
            this.$nextTick(() => {
              this.$refs["editSegment"].initDialog();
            });
          }.bind(this)
        },
        {
          icon: "fa-times",
          name: Vue.t("lang.delete"),
          showflg: true,
          multi: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            var self = this;
            self.$sequence({
                type: "delete",
                url: "api/masakari/v1/segments/{uuid}",
                params: selectRows,
                confirmMsg: Vue.t("calcStorLang.confirmDeleteSegment"),
                successMsg: Vue.t("calcStorLang.deleteSuccess"),
                log: {
                  description: {
                    en: "Delete Segment",
                    zh_cn: "删除高可用集群"
                  },
                  key: "name",
                  target: Vue.logTarget.hostHa
                },
                successFun: function() {
                  self.$refs.umTable.clearSelection();
                  self.currentPage = 1;
                  self.getData();
                }
              })
              .catch(err => {
                console.log(err);
              });
          }.bind(this)
        }
      ],
      searchBar: {
        conditions: {
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5\@]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChineseAt'));
              }
            }
          }
        },
        validatedParams: {}
      }
    };
  },
  computed: {},
  mounted() {
    this.getData(this.currentPage);
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  beforeRouteEnter(to, from, next) {
    next();
  },
  watch: {
    // 切换页面
    $route(to, from) {
      // 如果是当前页面切换分类的情况
    }
  },
  methods: {
    async getData(currentPageReset=false) {
      var self = this;
      let name = 'name' in self.searchBar.validatedParams ? self.searchBar.validatedParams.name.toLowerCase() : '';
      self.loading = true;
      self.$refs.umTable.clearSelection();
      try {
        let result = await self.$ajax({
          type: "get",
          url: "api/masakari/v1/segments"
        });
        self.loading = false;
        var lengthOfhost = result["segments"].length;
        self.total = lengthOfhost > 0 ? lengthOfhost : 0;
        var arr = lengthOfhost > 0 ? result["segments"] : [];
        let totalData = [];
        self.addedHosts = [];
        for (let i = 0; i < arr.length; i++) {
          self.addedHosts = self.addedHosts.concat(arr[i].hosts);
          if (arr[i].name.toLowerCase().indexOf(name) < 0) {
            continue;
          }
          totalData.push(arr[i]);
        }
        if (currentPageReset === true) {
          self.currentPageReset = true;
        }
        self.totalData = totalData;
        self.$nextTick(() => {
          self.currentPageReset = false;
        });
      } catch (res) {
        self.loading = false;
        __DEV__ && console.error(res);
      }
    },
    isAdmin() {
      var roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        return false;
      }
      return true;
    },
    handleShow() {
      this.hostFlag = false;
    },
    editHandleShow() {
      this.editHostFlag = false;
    },
    manHandleShow() {
      this.manageHostFlag = false;
    },
    sortChange(column) {
      var self = this;
      var key = column.prop;
      var keyOrder = column.order;
      if (keyOrder != null && self.totalData != null) {
        self.totalData.sort(this.$sortFormatter(key, keyOrder));
      }
    },
    reaz() {
      this.$refs.az.getData();
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    hostRender(value, row) {
      if ("" == value || null == value) {
        return "-";
      }
      var r = [];
      for (var i in value) {
        r.push(value[i]);
      }
      return r.join("<br/>");
    },
    metadataRender(value, row) {
      var mList = Object.keys(value).map(function(el) {
        return value[el];
      });
      if ("" == mList || null == mList) {
        return "-";
      }
      var r = [];
      for (var i in value) {
        r.push(i + ":" + value[i]);
      }
      return r.join("<br/>");
    },
    handleMetaShow() {
      this.metadataFlag = false;
    },
    addSegmentShow() {
      this.addSegmentFlag = true;
    },
    handleAddSegmentClose() {
      this.addSegmentFlag = false;
    },
    editSegmentShow() {
      this.editSegmentFlag = true;
    },
    showSegmentHosts(row) {
      this.segmentHostsFlag = true;
      this.currentSegmentId = row.uuid;
      this.currentSegmentName = row.name;
    },
    handleEditSegmentClose() {
      this.editSegmentFlag = false;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    emptyRender(value, rowData) {
      if ("" == value || null == value) {
        return "-";
      }
      return value;
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    onRefresh() {
      this.getData();
    },
    recoveryRender(value, row) {
      if (value === "auto") {
        return Vue.t("calcStorLang.editSegmentAuto")
      } else if (value === "reserved_host") {
        return Vue.t("calcStorLang.editSegmentReservedHost")
      } else if (value === "auto_priority") {
        return Vue.t("calcStorLang.editSegmentAutoPriority")
      } else if (value === "rh_priority") {
        return Vue.t("calcStorLang.editSegmentRHPriority")
      }
    },
    truefalseRender(value, row) {
      if (value == "true" || value == true) {
        return Vue.t("base.yes");
      } else if (value == "false" || value == false) {
        return Vue.t("base.no");
      } else {
        return value;
      }
    },
    haSwitchRender(value, row) {
      switch (value) {
        case "true":
          return Vue.t("calcStorLang.switchOff")
        case true:
          return Vue.t("calcStorLang.switchOff")
        case "false":
          return Vue.t("calcStorLang.switchOn")
        case false:
          return Vue.t("calcStorLang.switchOn")
        default:
          return value
      }
    },
    onBack() {
      this.segmentHostsFlag = false;
    },
    handleSearch(params) {
      var self = this;
      this.searchBar.validatedParams = params;
      self.getData(true);
      self.$refs.umTable.clearSelection();
    }
  }
};
</script>
