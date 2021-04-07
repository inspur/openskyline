<template>
<div>
  <el-dialog :title="$t('calcStorLang.RAID_CONF')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="editInstanceForm" label-width="100px" v-loading="loading" :model="physicalDiskForm">
      <el-form-item :label="$t('calcStorLang.CURRENT_RAID_CONFIG')">
        <el-table :data="currentRAIDConfig">
          <el-table-column :label="$t('calcStorLang.CONTROLLER')" prop="controller">
            <template slot-scope="scope">
              {{ $t('calcStorLang.RAID_RAID_CARD', [scope.row.controller, scope.row.controllerModel]) }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.SIZE')" prop="size" min-width="100">
            <template slot-scope="scope">
              {{ scope.row.size | fileSize }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.RAID_LEVEL')" prop="raid_level" min-width="100">
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.PHYSICAL_DISKS')" prop="physical_disks" min-width="100">
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.PHYSICAL_DISKS')" class="is-required">
        <el-select v-model="selectedRaidCard" @change="changeTableData" class="col-10">
          <el-option v-for="(raidCard, index) in raidCards" :key="index" :value="raidCard.id" :label="$t('calcStorLang.RAID_RAID_CARD', [raidCard.id, raidCard.model])"></el-option>
        </el-select>
        <el-table ref="umTable" :data="tableData" highlight-current-row stripe border style="width: 100%; margin-top: 5px;" row-key="name" @selection-change="handleSelectionChange">
          <el-table-column reserve-selection type="selection" width="55">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('calcStorLang.RAID_POSITION_BACK_SLOT')" prop="position" min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('size') >= 0" :label="$t('calcStorLang.SIZE')" prop="size" min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('diskType') >= 0" :label="$t('calcStorLang.DISK_TYPE')" prop="medium" min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('model') >= 0" :label="$t('calcStorLang.MODEL')" prop="model" min-width="100">
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="onRefresh">
              </el-button>
              <el-popover placement="right" trigger="click">
                <el-checkbox-group class="vertical" v-model="columnsChecked">
                  <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                  </el-checkbox>
                </el-checkbox-group>
                <div slot="reference" class="name-wrapper">
                  <el-tag>{{$t('network.columnSelected')}}</el-tag>
                </div>
              </el-popover>
            </el-col>
            <el-col :span="19">
              <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
            </el-col>
          </el-row>
        </div>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.RAID_LEVEL')" prop="domain" class="is-required">
        <el-select v-model="physicalDiskForm.raidLevel" class="col-10">
          <el-option v-for="item in raidLevelOptions" :key="item.value" :label="item.value" :value="item.value"></el-option>
        </el-select>
        <el-button type="primary" size="small"  @click="addLogical">{{$t('calcStorLang.ADD_LOGICAL')}}</el-button>
        <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.TOOLTIP_ADD_LOGICAL')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.LOGICAL_DISK')" class="is-required">
        <el-table ref="logicalTable" :data="logicalTableData" highlight-current-row stripe border style="width: 100%" row-key="id">
          <el-table-column :label="$t('calcStorLang.CONTROLLER')" prop="controller" min-width="100">
            <template slot-scope="scope">
              {{ $t('calcStorLang.RAID_RAID_CARD', [scope.row.controller, scope.row.controllerModel]) }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.RAID_LEVEL')" prop="raid_level" min-width="100">
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.PHYSICAL_DISKS')" prop="name" min-width="100">
          </el-table-column>
          <el-table-column :label="$t('calcStorLang.instOperate')" width="80px">
            <template slot-scope="scope">
              <el-button type="danger" size="small" @click="deleteOneByIndex(scope.$index)">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_DELETE') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</div>
</template>
<script>
import formatFileSize from 'utils/formatFileSize';
export default {
  name: 'RaidConfiguration',
  props: ['phyDetailUuid', 'phyName'],
  data() {
    return {
      dialogVisible: false,
      logicalTableData: [],
      raidLevelOptions: [],
      physicalDiskForm: {
        raidLevel: ""
      },
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' }
        ]
      },
      currentPage: 1,
      loading: false,
      saving: false,
      loadingText: Vue.t('calcStorLang.dataLoading'),
      reloadTblFlag: false,
      close: "",
      columns: [{
        prop:"name",
        label:Vue.t('calcStorLang.RAID_POSITION_BACK_SLOT')
      }, {
        prop:"size",
        label:Vue.t('calcStorLang.SIZE')
      }, {
        prop:"diskType",
        label:Vue.t('calcStorLang.DISK_TYPE')
      }, {
        prop:"model",
        label:Vue.t('calcStorLang.MODEL')
      }],
      columnsChecked: ["name", "size", "diskType", "model"],
      tableData: [],
      totalData: [],
      allPhysicalDisks: [],
      raidCards: [],
      selectedRaidCard: '',
      multipleSelection: [],
      currentRAIDConfig: []
    }
  },
  watch: {
  },
  beforeDestroy() {
    if (this.interVolumeValid != null) {
      clearInterval(this.interVolumeValid);
    }
  },
  mounted() {
    this.initDialog();
    this.loadPhyHostDetail();
  },
  methods: {
    deleteOneByIndex(index) {
      this.logicalTableData.splice(index, 1);
      this.changeTableData();
    },
    async confirmFun() {
      const self = this;
      if (!this.logicalTableData.length) {
        this.$message({
          message: Vue.t('calcStorLang.ADD_LOGICAL_WARING'),
          type: "warning"
        });
        return false;
      }
      self.$prompt(Vue.t("calcStorLang.ADD_LOGICAL_CONFIRM"), Vue.t("lang.confirmDo"), {
        confirmButtonText: Vue.t("lang.confirmDo"),
        cancelButtonText: Vue.t("lang.cancel"),
        inputPattern:/^YES$|^NO$/i,
        inputValue: "NO",
        customClass: "promptConfirmDel",
        inputErrorMessage:Vue.t("lang.onlyAcceptYesOrNo")
      }).then(async({ value }) => {
        if ("yes" == value.toLowerCase()) {
          self.saving = true;
          let data = {};
          let logicalDisks = [];
          for (let v of self.logicalTableData) {
            let names = [];
            names.push(v.name);
            logicalDisks.push({
              raid_level: v.raid_level,
              controller: String(v.controller),
              physical_disks: names
            });
          }
          data.logical_disks = logicalDisks;
          await self.$ajax({
            type: "PUT",
            url: "api/ironic/v1/nodes/" + self.phyDetailUuid + "/states/raid",
            data: JSON.stringify(data),
            headers: {
              "X-Openstack-Ironic-Api-Version": 1.46
            },
            errFun: function (result) {
              self.saving = false;
            }
          });
          let params = {
            "target": "clean",
            "clean_steps": [
              {
                "interface": "raid",
                "step": "delete_configuration"
              },
              {
                "interface": "raid",
                "step": "create_configuration"
              }
            ]
          }
          await self.$ajax({
            type: "PUT",
            url: "api/ironic/v1/nodes/" + self.phyDetailUuid + "/states/provision",
            data: JSON.stringify(params),
            headers: {
              "X-Openstack-Ironic-Api-Version": "latest"
            },
            log: {
              description: {
                en: self.phyName + " raid configuration",
                zh_cn: self.phyName + " RAID配置"
              },
              target: Vue.logTarget.bareMachine
            },
            successMsg:Vue.t('base.addSuccess'),
            successFun(data) {
              self.handleCancel();
              self.$emit("onRefresh");
            },
            errFun: function (result) {
              self.saving = false;
            }
          });
          self.saving = false;
        }
      }).catch(() => {
        //取消
      });
    },
    addLogical() {
      const self = this;
      if (!this.multipleSelection.length || !(parseInt(this.physicalDiskForm.raidLevel) >= 0)) {
        this.$message({
          message: Vue.t('calcStorLang.TOOLTIP_ADD_LOGICAL'),
          type: "warning"
        });
      } else if (this.multipleSelection.length) {
        let phyHostDiskArr = [];
        for (let i = 0; i < this.multipleSelection.length; i++) {
          phyHostDiskArr.push(this.multipleSelection[i].adapter);
        }
        let checkAdapter = [...new Set(phyHostDiskArr)];
        if (checkAdapter.length > 1) {
          this.$message({
            message: Vue.t('calcStorLang.CONTROLLER_CHECK'),
            type: "warning"
          });
          return false;
        }
        let raidLevel = this.physicalDiskForm.raidLevel;
        let controller = "";
        let controllerModel = '';
        if (!this.logicalTableData.length) {
          let phyNameArr = [];
          for (let phy of this.multipleSelection) {
            phyNameArr.push(phy.position);
            controller = phy.adapter;
          }
          let raidCard = self.raidCards.find(item => String(item.id) === String(controller));
          if (raidCard) {
            controllerModel = raidCard.model
          }
          let phyNameStr = phyNameArr.join(",");
          this.logicalTableData.push({name: phyNameStr, raid_level: raidLevel, controller: controller, controllerModel: controllerModel});
        } else {
          let phyNameArrCheck = [];
          for (let i = 0; i < this.logicalTableData.length; i++) {
            let nameArr = this.logicalTableData[i].name.split(",");
            phyNameArrCheck = phyNameArrCheck.concat([...new Set(nameArr)]);
          }
          let flag = true;
          let tableDataNameTemp = [];
          for (let phy of this.multipleSelection) {
            let phyName = phy.position;
            controller = phy.adapter;
            if (phyNameArrCheck.includes(phyName)) {
              flag = false;
              this.$message({
                message: Vue.t('calcStorLang.PHYSICAL_DISKS') + phyName + Vue.t('calcStorLang.ADD_LOGICAL_REPEAT'),
                type: "warning"
              });
            } else {
              tableDataNameTemp.push(phyName);
            }
          }
          let raidCard = self.raidCards.find(item => String(item.id) === String(controller));
          if (raidCard) {
            controllerModel = raidCard.model
          }
          if (flag) {
            let name = tableDataNameTemp.join(",");
            this.logicalTableData.push({name: name, raid_level: raidLevel, controller: controller, controllerModel: controllerModel});
          }
        }
        self.physicalDiskForm.raidLevel = "";
        this.$refs.umTable.clearSelection();
        self.multipleSelection = [];
        self.changeTableData();
      }
    },
    changeTableData() {
      let data = this.logicalTableData;
      let phyTableData = this.allPhysicalDisks.slice();
      for (let list of data) {
        let names = list.name.split(",");
        for (let name of names) {
          let tmpData = [];
          for (let phydata of phyTableData) {
            if (name != phydata.position) {
              tmpData.push(phydata);
            }
          }
          phyTableData = tmpData;
        }
      }
      phyTableData = phyTableData.filter(item => String(item.adapter) === String(this.selectedRaidCard));
      this.totalData = phyTableData;
    },
    async loadPhyHostDetail() {
      const $this = this;
      $this.loading = true;
      const url = "api/ironic/v1/nodes/" + $this.phyDetailUuid;
      try {
        let ret = await $this.$ajax({
          url: url,
          type: 'get'
        });
        $this.loading = false;
        let properties = ret.properties;
        if (properties.physical_disks) {
          let physicalDisks = properties.physical_disks;
          for (let physicalDisk of physicalDisks) {
            let {size} = physicalDisk;
            physicalDisk.size = formatFileSize(size, "Byte");
          }
        }
        $this.allPhysicalDisks = properties.physical_disks || [];
        let allControllers = ret.properties.raid_controllers;
        if ('logical_disks' in ret.raid_config) {
          $this.currentRAIDConfig = ret.raid_config.logical_disks.map(item => {
            let controller = allControllers.find(cItem => String(cItem.id) === String(item.controller));
            let result = {
              size: item.size_gb * 1024 * 1024 * 1024,
              raid_level: item.raid_level,
              physical_disks: item.physical_disks.join(','),
              controller: item.controller
            };
            if (controller) {
              result.controllerModel = controller.model;
            }
            return result;
          });
        }
        $this.raidCards = properties.raid_controllers;
        $this.selectedRaidCard = $this.raidCards.length === 0 ? '' : $this.raidCards[0].id;
        $this.changeTableData();
      } catch (data) {
        $this.loading = false;
        __DEV__ && console.error(data);
      }
    },
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    handleVolumeShow() {
      this.selVolumeFlg = true;
      this.$nextTick(() => {
        this.$refs.selectVolume.show();
      });
    },
    handleCancel() {
      this.$emit("hide", {});
    },
    handleClose(done) {
      this.$emit("hide", {});
      done();
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleSelectionChange(val) {
      //raidLevelOptions: [{value: "0"}, {value: "1"}, {value: "5"}, {value: "6"}],
      this.raidLevelOptions = [];
      this.multipleSelection = val;
      let count = this.multipleSelection.length;
      if (count >= 1) {
        this.raidLevelOptions.push({value: "0"});
      }
      if (count && (count % 2 === 0)) {
        this.raidLevelOptions.push({value: "1"});
      }
      if (count >= 3) {
        this.raidLevelOptions.push({value: "5"});
      }
      if (count >= 4) {
        this.raidLevelOptions.push({value: "6"});
      }
    },
    onRefresh() {
      this.loadPhyHostDetail();
      this.$refs.umTable.clearSelection();
    }
  }
}

</script>
<style scoped>


</style>
