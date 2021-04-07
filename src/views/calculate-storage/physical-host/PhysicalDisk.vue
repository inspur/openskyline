<template>
  <div v-loading="loading">
   <!-- <div class="operation-panel" style="text-align:left">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
    </div>-->
    <div class="divider clearfix"></div>
    <el-table ref="acTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="id" @current-change="handleSelectionChange" :default-sort="{prop: 'name', order: 'ascending'}">
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('calcStorLang.RAID_POSITION_BACK_SLOT')" prop="position" min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('size') >= 0" :label="$t('calcStorLang.SIZE')" prop="size" min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('diskType') >= 0" :label="$t('calcStorLang.DISK_TYPE')" prop="medium" min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('model') >= 0" :label="$t('calcStorLang.MODEL')" prop="model" min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('controller') >= 0" :label="$t('calcStorLang.CONTROLLER')" prop="controller" min-width="100">
        <template slot-scope="scope">
          {{ $t('calcStorLang.RAID_RAID_CARD', [scope.row.adapter, scope.row.controllerModel]) }}
        </template>
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
  name: 'PhysicalDisk',
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
      }, {
        prop:"controller",
        label:Vue.t('calcStorLang.CONTROLLER')
      }],
      columnsChecked: ["name", "size", "diskType", "model", "controller"],
      loading: true,
      reloadTblFlag: false,
      phyUuid: this.phyDetailUuid,
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
        let properties = ret.properties;
        let allRaidCards = ret.properties.raid_controllers;
        if (properties.physical_disks) {
          let physicalDisks = properties.physical_disks;
          for (let physicalDisk of physicalDisks) {
            let {size} = physicalDisk;
            physicalDisk.size = formatFileSize(size, "Byte");
            let raidCard = allRaidCards.find(cItem => String(cItem.id) === String(physicalDisk.adapter));
            physicalDisk.controllerModel = raidCard.model;
          }
        }
        self.totalData = properties.physical_disks;
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
