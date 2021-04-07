<template>
  <div>
   <!-- <div class="operation-panel" style="text-align:left">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
    </div>-->
    <div class="divider clearfix"></div>
    <el-table ref="acTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="id" @current-change="handleSelectionChange" :default-sort="{prop: 'name', order: 'ascending'}">
      <!--<el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" min-width="100">
      </el-table-column>-->
      <el-table-column v-if="columnsChecked.indexOf('controller') >= 0" :label="$t('calcStorLang.CONTROLLER')" prop="controller">
        <template slot-scope="scope">
          {{ $t('calcStorLang.RAID_RAID_CARD', [scope.row.controller, scope.row.controllerModel]) }}
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('size_gb') >= 0" :label="$t('calcStorLang.SIZE')" prop="size_gb" min-width="100">
        <template slot-scope="scope">
          {{ scope.row.size_gb | fileSize }}
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('raid_level') >= 0" :label="$t('calcStorLang.RAID_LEVEL')" prop="raid_level" min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('physical_disks') >= 0" :label="$t('calcStorLang.PHYSICAL_DISKS')" prop="physical_disks" min-width="100">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('lang.currentSelected') + multipleSelection.length + " " + $tc('lang.item', multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import formatFileSize from 'utils/formatFileSize';
export default {
  name: 'LogicalDisk',
  props: ['phyDetailUuid', 'phyStatus'],
  data() {
    return {
      physicalDisks: {},
      formInline: '',
      totalData: [],
      portMaps: new Map(),
      currentPage: 1,
      showBorder: true,
      portFlag: false,
      operateType: 1,
      portEntity: '',
      columns: [{
        prop:"controller",
        label:Vue.t('calcStorLang.CONTROLLER')
      }, {
        prop:"size_gb",
        label:Vue.t('calcStorLang.SIZE')
      }, {
        prop:"raid_level",
        label:Vue.t('calcStorLang.RAID_LEVEL')
      }, {
        prop:"physical_disks",
        label:Vue.t('calcStorLang.PHYSICAL_DISKS')
      }],
      loading: true,
      reloadTblFlag: false,
      phyUuid: this.phyDetailUuid,
      columnsChecked: ["controller", "size_gb", "raid_level", "physical_disks"],
      tableData: [],
      multipleSelection: []
    };
  },
  computed: {},
  mounted() {
    this.loadPhyHostDetail();
  },
  methods: {
    async loadPhyHostDetail() {
      const self = this;
      self.loading = true;
      const url = "api/ironic/v1/nodes/" + self.phyDetailUuid;
      try {
        let ret = await this.$ajax({
          url: url,
          type: 'get'
        });
        self.loading = false;
        let allRaidCards = ret.properties.raid_controllers;
        let raidConfig = ret.raid_config;
        if (raidConfig.logical_disks) {
          let logicalDisks = raidConfig.logical_disks;
          for (let logicalDisk of logicalDisks) {
            let raidCard = allRaidCards.find(cItem => String(cItem.id) === String(logicalDisk.controller));
            let {physical_disks} = logicalDisk;
            logicalDisk.physical_disks = physical_disks.join(',');
            logicalDisk.size_gb = logicalDisk.size_gb * 1024 * 1024 * 1024;
            logicalDisk.controllerModel = raidCard.model;
          }
          self.totalData = raidConfig.logical_disks;
        }
      } catch (data) {
        self.loading = false;
        __DEV__ && console.error(data);
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleSelectionChange(val) {
      if (val != null) {
        var list = [];
        list.push(val);
        this.multipleSelection = list;
      }
    },
    onRefresh() {
      this.multipleSelection = [];
      this.loadPhyHostDetail();
    }
  }
}

</script>
<style scoped>


</style>
