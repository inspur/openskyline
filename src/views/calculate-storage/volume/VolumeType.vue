<template>
  <el-collapse v-model="activeNames" style="text-align:left">
    <el-collapse-item :title="$t('storage.volTypeList')" name="baseProperty">
      <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
      <div class="divider clearfix"></div>
      <div>
        <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
        </operation-panel>
        <div class="divider clearfix"></div>
        <el-table ref="vTypeTable" :data="tableData" v-loading="loading" highlight-current-row border stripe style="width: 100%;" slot="empty" row-key="id" @selection-change="handleSelectionChange" @sort-change="sortChange">
          <el-table-column reserve-selection type="selection" align="center" width="55">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" align="left" sortable="custom" min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('qos_specs_id') >= 0" prop="qos_specs_id" align="left" :label="$t('storage.connectedQos')" min-width="100">
            <template slot-scope="scope">
              <span v-html="idToNameRender(scope.row.qos_specs_id, scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('specs') >= 0" prop="extra_specs" align="left" :label="$t('storage.extraSpecs')" min-width="100">
            <template slot-scope="scope">
              <span v-html="extraSpecsRender(scope.row.extra_specs, scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('encrypt') >= 0" prop="encrypt" align="left" :label="$t('storage.encrypt')" min-width="100">
            <template slot-scope="scope">
              <span v-html="scope.row.encryptInfo"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('poolInfo') >= 0" prop="poolInfo" align="left" :label="$t('base.storageAllocate')" min-width="100">
            <template slot-scope="scope">
              <span v-html="scope.row.poolInfo"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('is_public') >= 0" prop="is_public" align=“left” :label="$t('storage.public')" min-width="100">
            <template slot-scope="scope">
              <span>{{scope.row.is_public?$t('storage.yes'):$t('storage.no')}}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('description') >= 0" prop="description" align="left" :label="$t('lang.desc')" min-width="100">
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="queryClick">
              </el-button> 
              <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
              <el-popover placement="right" trigger="click">
                <el-checkbox-group class="vertical" v-model="columnsChecked">
                  <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                  </el-checkbox>
                </el-checkbox-group>
                <div slot="reference" style="display: inline-block;">
                  <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
                </div>
              </el-popover>
            </el-col>
            <el-col :span="19">
              <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
            </el-col>
          </el-row>
          <add-volume-type ref="addVolumeType" v-if="addVolumeTypeFlg" @handleShow="handleShow" @getData="loadData" @clearSelOption="clearSelOption"></add-volume-type>
          <edit-volume-type ref="editVolumeType" :volTypeId="volTypeId" :volTypeEntity="volTypeEntity" v-if="editVolumeTypeFlg" @handleEditShow="handleEditShow" @getData="loadData" @clearSelOption="clearSelOption"></edit-volume-type>
          <encrypt-manage ref="encryptManage" v-if="showEncryptManageFlg" :volumeType="selectRow" @handleClose="handleEncryptManageClose" @refreshData="handleShow"></encrypt-manage>
          <expand-standard ref="expandStandard" :volTypeId="volTypeId" v-if="expandStandardFlg"></expand-standard>
          <qos-relation ref="qosRelation" v-if="qosRelationFlg" :volTypeId="volTypeId" :qosId="qosId" @handleRelaShow="handleRelaShow" @getData="loadData" @clearSelOption="clearSelOption"></qos-relation>
          <refresh-metadata ref="refreshMetadata" v-if="refreshMetadataFlg" @addData="addData"></refresh-metadata>
        </div>
      </div>
    </el-collapse-item>
    <el-collapse-item :title="$t('storage.qosSpec')" name="QosProperty">
      <volume-qos ref="volumeQos" v-show="managerQosFlag" @onRefresh="queryClick()"></volume-qos>
    </el-collapse-item>
  </el-collapse>
</template>
<script>
import VolumeQos from './VolumeQoS'
import AddVolumeType from './AddVolumeType'
import EditVolumeType from './EditVolumeType'
import EncryptManage from './EncryptManage'
import ExpandStandard from './ExpandStandard'
import QosRelation from './QosRelation'
import RefreshMetadata from './RefreshMetadata'
export default {
  name: "VolumeTypeList",
  data() {
    return {
      sortObj:{
        sortOrder:"descending",
        sortField:"name"
      },
      activeNames: 'baseProperty',
      volumeStatus: '0',
      selectRow: "",
      addVolumeTypeFlg: false,
      editVolumeTypeFlg: false,
      showEncryptManageFlg: false,
      expandStandardFlg: false,
      qosRelationFlg: false,
      refreshMetadataFlg: false,
      managerQosFlag: false,
      storageNameMap: new Map(),
      multipleSelection: [],
      totalData: [],
      qosMaps: new Map(),
      volTypeId: '',
      qosId: '',
      volTypeEntity: '',
      operationMenus: [{
        icon: "fa-plus",
        name: this.$t('storage.createVolType'),
        showflg: true,
        readOnly: true,
        handler: function (selectRows) {
          let me = this;
          me.addVolumeTypeFlg = true;
          me.$nextTick(() => {
            me.$refs.addVolumeType.show();
          });
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: this.$t('lang.edit'),
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          let me = this;
          me.editVolumeTypeFlg = true;
          me.volTypeEntity = selectRows[0];
          me.$nextTick(() => {
            me.$refs.editVolumeType.show();
            me.volTypeId = selectRows[0].id;
            me.$refs.editVolumeType.editVolumeType.name = selectRows[0].name;
            me.$refs.editVolumeType.editVolumeType.description = selectRows[0].description;
            me.$refs.editVolumeType.editVolumeType.public = selectRows[0].is_public;
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('lang.delete'),
        multi: true,
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: async function (selectRows) {
          var self = this;
          var pUuid = this.$cookie.get("pid");
          this.$confirm(this.$t('lang.ifDeleteData'), this.$t('lang.confirm'), {
            confirmButtonText:this.$t('lang.confirm'),
            cancelButtonText:this.$t('lang.cancel'),
            type:'warning'
          }).then(async () => {
            self.$sequence({
              type: 'delete',
              url: "api/cinderv3/v3/" + pUuid + "/types/{id}",
              params: selectRows,
              errorKey: "badRequest",
              log: {
                description: {
                  en: "Delete Volume Type",
                  zh_cn: "删除云硬盘类型"
                },
                key: "name",
                target: Vue.logTarget.storage_volume_type
              }
            }).then((data) => {
              self.loading = true;
              self.$message(Vue.t('lang.sendDeleteSuccess'));
              self.$refs.vTypeTable.clearSelection();
              self.currentPage = 1;
              setTimeout(function () {
                self.loadData();
                self.$refs.volumeQos.loadData();
                self.loading = false;
              }, 1000);
            }).catch((err) => {
              self.loading = true;
              self.$refs.vTypeTable.clearSelection();
              self.currentPage = 1;
              setTimeout(function () {
                self.loadData();
                self.$refs.volumeQos.loadData();
                self.loading = false;
              }, 1000);
            });
          }).catch(() => {
            //取消
          });
        }.bind(this)
      }, {
        icon: "fa-lock",
        name: this.$t('storage.encryptManage'),
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          let me = this;
          me.selectRow = selectRows[0];
          me.showEncryptManageFlg = true;
        }.bind(this)
      }, {
        icon: "fa-arrows",
        name: this.$t('storage.manageExpandSpec'),
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          let me = this;
          me.expandStandardFlg = true;
          me.volTypeId = selectRows[0].id;
          me.$nextTick(() => {
            me.$refs.expandStandard.show();
          });
        }.bind(this)
      }, {
        icon: "fa-cogs",
        name: this.$t('storage.connectQosConnect'),
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          let me = this;
          me.qosRelationFlg = true;
          me.volTypeId = selectRows[0].id;
          me.qosId = selectRows[0].qos_specs_id;
        }.bind(this)
      }, {
        icon: "fa-cogs",
        name: this.$t('storage.cancleQosConnection'),
        showflg: true,
        enable(rowData) {
          if (rowData.qos_specs_id == null) {
            return false;
          } else {
            return true;
          }
        },
        handler: function (selectRows) {
          let me = this;
          me.volTypeId = selectRows[0].id;
          me.qosId = selectRows[0].qos_specs_id;
          me.disQos();
        }.bind(this)
      }, {
        icon: "fa-refresh",
        name: this.$t('storage.refreshMetaData'),
        showflg: false,
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          let me = this;
          me.refreshMetadataFlg = true;
          me.$nextTick(() => {
            me.$refs.refreshMetadata.show();
          });
        }.bind(this)
      }],
      tableData: [],
      listPara: {
        page: 1,
        pageSize: 10
      },
      loading: false,
      columnsChecked: ["name", "qos_specs_id", "specs", "poolInfo", "encrypt", "is_public"],
      columns: [{
        prop: "name",
        label: this.$t('lang.name')
      }, {
        prop: "qos_specs_id",
        label: this.$t('storage.connectedQos')
      }, {
        prop: "specs",
        label: this.$t('storage.extraSpecs')
      }, {
        prop: "poolInfo",
        label: this.$t('base.storageAllocate')
      }, {
        prop: "encrypt",
        label: this.$t('storage.encrypt')
      }, {
        prop: "is_public",
        label: this.$t('storage.public')
      }, {
        prop: "description",
        label: this.$t('lang.desc')
      }],
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 50, 200],
      total: 1,
      searchBar: {
        conditions: {
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          },
          isPublic: {
            label: this.$t('storage.public'),
            type: 'select',
            options: [{
              label: this.$t('storage.yes'),
              value: '1'
            }, {
              label: this.$t('storage.no'),
              value: '0'
            }]
          }
        },
        validatedParams: {}
      }
    }
  },
  beforeDestroy() {
    if (this.interVmValid != null) {
      clearInterval(this.interVmValid);
    }
  },
  mounted() {
    this.handleQosShow();
    let self = this;
    Promise.all([self.setStorageChart()]).then(function() {
      self.loadData();
      self.interVmValid = setInterval(() => {
        self.loadData();
      }, 5000);
    });
  },
  methods: {
    sortChange(column) {
       var self = this;
       if (!column.prop) { return; }
       self.sortObj = {
         sortOrder:column.order,
         sortField:column.prop
       };
    },
    queryClick() {
      var self = this;
      self.$refs.vTypeTable.clearSelection();
      Promise.all([self.setStorageChart()]).then(function() {
        self.loadData();
      });
    },
    async loadData() {
      var Pid = this.$cookie.get('pid');
      var self = this;
      let data = [];
      var roleType = Vue.roleType + "";
      var url = "api/cinderv3/v3/" + Pid + "/qos-specs";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        let qosList = result['qos_specs'];
        if (qosList != null && qosList.length > 0) {
          for (let i = qosList.length - 1; i >= 0; i--) {
            self.qosMaps.set(qosList[i].id, qosList[i]);
          }
        }
        this.getVolTypeData();
      } catch (res) {
      }
    },
    setStorageChart() {
      let me = this;
      this.$ajax({
        type: 'get',
        url: "api/cinder/v3/"+this.$cookie.get("pid")+"/scheduler-stats/get_pools?detail=True",
        successFun(rtn) {
          me.storageNameMap = new Map();
          me.storageList = [];
          rtn.pools.forEach(pool => {
            if (pool && pool["capabilities"] && pool["capabilities"]["volume_backend_name"]) {
              let item = pool["capabilities"];
              let name = item["volume_backend_name"];
              me.storageNameMap[name] = item;
            }
          });
        }
      })
    },
    async getVolTypeData(resetCurrentPage=true) {
      var $this = this;
      var projectId = $this.$cookie.get('pid');
      var url = "";
      var isPublic = $this.searchBar.validatedParams.isPublic;
      if (typeof (isPublic) === "undefined" || isPublic === null || isPublic === '') {
        isPublic = "None";
      }
      url = "api/cinderv3/v3/" + projectId + "/inspur-types?is_public=" + isPublic;
      if (String(Vue.roleType) === '2' || String(Vue.roleType) === '3') { //超级
        url = "api/cinderv3/v3/" + projectId + "/inspur-types";
      }
      try {
        let result = await $this.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        $this.totalData = [];
        let totalData = []
        let volTypes = result['volume_types'];
        volTypes = volTypes.filter(item => {
          let validatedName = $this.searchBar.validatedParams.name ? $this.searchBar.validatedParams.name.toLowerCase() : '';
          return item.name.toLowerCase().includes(validatedName);
        });
        volTypes.forEach(volType => {
          //组装表格里的存储使用情况列
          if (volType["extra_specs"] && volType["extra_specs"]["volume_backend_name"]) {
            let key =volType["extra_specs"]["volume_backend_name"];
            if ($this.storageNameMap[key]) {
                let pool = $this.storageNameMap[key];
                let total = pool["total_capacity_gb"];
                let free = pool["free_capacity_gb"];
                volType.poolInfo = `IP: ${pool["ip_addr"]}<br/>
                ${$this.$t("monitor.totalAmount") + ": " + total.toFixed(0) + "G"}<br/>
                 ${$this.$t("base.notUsed") + ": " + free.toFixed(0) + "G"}`
            } else {
            volType.poolInfo = this.$t("storage.storageDown");
            }
          } else {
            volType.poolInfo = `-`;
          }
          //组装表格里的存储加密信息列
          if (volType["encrypt"]) {
            let encrypt = volType["encrypt"];
            volType.encryptInfo =
              `${$this.$t('storage.provider')}: ${encrypt["provider"]}<br/>
               ${$this.$t("storage.controlPosition")}: ${$this.cLocationRender(encrypt["control_location"])}<br/>
               ${$this.$t("storage.encryptAlgorithm")}: ${encrypt["cipher"]}<br/>
               ${$this.$t("storage.keySize")}: ${encrypt["key_size"]}<br/>`;
          } else {
            volType.encryptInfo = "-";
          }
          totalData.push(volType);
        });
        $this.totalData = totalData;
      } catch (e) {
        __DEV__ && console.error(e);
        $this.loading = false;
        // $this.$message.error(Vue.t('storage.getFailed'));
      }
    },
    cLocationRender(value) {
      if (value === 'front-end') {
        return Vue.t('storage.ENCRYPT_CONTROL_POSITION_FRONT_END');
      } else {
        return "";
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleQosShow() {
      var roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        this.managerQosFlag = false;
      } else {
        this.managerQosFlag = true;
      }
    },
    extraSpecsRender(value, row) {
      let r = [];
      if (value) {
        for (let v in value) {
          if (v === 'volume_backend_name') {
            r.push(Vue.t('storage.volumeBackendName') + ":" + value[v].replace("<", "&lt;").replace(">", "&gt;"));
          } else if (v === 'multiattach') {
            r.push(Vue.t('storage.multiattach') + ":" + (value[v] === '<is> True' ? Vue.t('storage.multiattachSupport') : value[v].replace("<", "&lt;").replace(">", "&gt;")));
          } else {
            r.push(v + ":" + value[v].replace("<", "&lt;").replace(">", "&gt;"));
          }
        }
      }
      return r.join("<br/>");
    },
    async disQos() {
      try {
        var Pid = this.$cookie.get('pid');
        var self = this;
        if (this.qosId) {
          let result = await this.$ajax({
            type: 'get',
            url: "api/cinderv3/v3/" + Pid + "/qos-specs/" + this.qosId + "/disassociate?vol_type_id=" + this.volTypeId,
            confirmMsg: this.$t('storage.cancleQosSpecConfirm'),
            successMsg: this.$t('storage.cancleConnectedQosSuccess'),
            log: {
              description: {
                en: "Disassociate QoS:" + this.getQosLogName(this.qosId),
                zh_cn: "取消QoS关联:" + this.getQosLogName(this.qosId)
              },
              target: Vue.logTarget.storage_volume_type
            }
          });
          this.loadData();
          this.$refs.volumeQos.loadData();
          this.clearSelOption();
        }
      } catch (data) {
        __DEV__ && console.error(data);
      }
    },
    getQosLogName(tempQosId) {
      let obj = this.qosMaps.get(tempQosId);
      var name = '';
      if (null == obj) {
        name = tempQosId;
      }
      if ("" == obj.name) {
        name = obj.id;
      } else {
        name = obj.name;
      }
      name = name + "(" + tempQosId + ")";
      return name;
    },
    handleSizeChange(val) {
      this.listPara.pageSize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      this.listPara.page = val;
      this.loadData();
    },
    handleShow() {
      this.addVolumeTypeFlg = false;
    },
    handleEditShow() {
      this.editVolumeTypeFlg = false;
    },
    handleEncryptManageClose() {
      this.showEncryptManageFlg = false;
    },
    handleExpandStandard() {
      this.expandStandardFlg = false;
    },
    handleRelaShow() {
      this.qosRelationFlg = false;
      this.$refs.volumeQos.loadData();
    },
    clearSelOption() {
      var self = this;
      self.$refs.vTypeTable.clearSelection();
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    idToNameRender(value, rowData) {
      let obj = this.qosMaps.get(value);
      if (null == obj) {
        return value;
      }
      if ("" == obj.name) {
        return obj.id;
      }
      return obj.name;
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
    }
  },
  components: {
    AddVolumeType,
    EditVolumeType,
    EncryptManage,
    ExpandStandard,
    QosRelation,
    RefreshMetadata,
    VolumeQos
  }
}

</script>
