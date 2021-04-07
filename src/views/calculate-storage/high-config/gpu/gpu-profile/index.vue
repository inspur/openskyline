<template>
  <div>
    <operation-panel-new :select-rows="selectedProfiles" :operation-menus="profileOperationMenus" style="display:inline;" />
    <div class="divider clearfix"></div>
    <el-table ref="table" :data="tableData" row-key="uuid" @selection-change="handleSelectedProfileChange" v-loading="loading">
      <el-table-column reserve-selection type="selection" width="55" align="center"/>
      <el-table-column v-if="checkedColumns.includes('name')" :label="$t('calcStorLang.GPU_NAME')" prop="name" width="150" />
      <el-table-column v-if="checkedColumns.includes('groups')" :label="$t('calcStorLang.GPU_GROUP')">
        <template slot-scope="scope">
          <group-info :groups="scope.row.show_groups" :devices="devices" />
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('in_use')" :label="$t('calcStorLang.GPU_IN_USE')" width="100" align="left">
        <template slot-scope="scope">
          {{ scope.row.in_use | inUse }}
        </template>
      </el-table-column>
    </el-table>
    <el-row style="margin-top: 10px;">
      <el-col :span="5">
        <icos-column-selector
          name="GPUProfileList"
          @refresh="loadDeviceProfiles"
          @column-checked="handleColumnChecked"
          :selected-length="selectedProfiles.length"
          :columns="[
        {
          prop: 'name',
          label: $t('calcStorLang.GPU_NAME'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'groups',
          label: $t('calcStorLang.GPU_GROUP'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'in_use',
          label: $t('calcStorLang.GPU_IN_USE'),
          visible: true,
          defaultChecked: true
        }]" />
      </el-col>
      <el-col :span="19">
        <page :totalData="totalData" @getCurrentData="getCurrentData" />
      </el-col>
    </el-row>
    <edit-gpu-profile
      v-if="editProfileDialog.visible"
      :type="editProfileDialog.type"
      :profile="editProfileDialog.profile"
      @close="editProfileDialog.visible = false;"
      @refresh="loadDeviceProfiles()"
    />
  </div>
</template>

<script>
import ProfileOperationMenus from './ProfileOperationMenus';
import EditProfile from './EditProfile';
import GroupInfo from './GroupInfo';
export default {
  name: 'GPUProfileList',
  components: {
    'edit-gpu-profile': EditProfile,
    GroupInfo
  },
  data() {
    return {
      loading: false,
      totalData: [],
      tableData: [],
      devices: [],
      checkedColumns: [],
      selectedProfiles: [],
      editProfileDialog: {
        visible: false,
        type: 'add',
        profile: {}
      },
      profileOperationMenus: ProfileOperationMenus.bind(this)()
    };
  },
  mounted() {
    Promise.all([
      this.loadDevices()
    ]).then(res => {
      this.loadDeviceProfiles();
    });
  },
  methods: {
    async loadDeviceProfiles() {
      const $this = this;
      $this.loading = true;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/cyborg/v2/device_profiles`,
          showErrMsg: true,
          errorKey: 'error_message'
        });
        $this.totalData = res.device_profiles;
        $this.$refs.table.clearSelection();
        $this.loading = false;
      } catch (e) {
        $this.loading = false;
        __DEV__ && console.error(e);
      }
    },
    async loadDevices() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/cyborg/v2/devices`,
          showErrMsg: true,
          errorKey: 'error_message'
        });
        res.devices.forEach(item => {
          item.vendor_value = item.vendor_value.toUpperCase();
          item.product_id = item.product_id.toUpperCase();
        });
        $this.devices = res.devices;
        $this.loading = false;
      } catch (e) {
        $this.loading = false;
        __DEV__ && console.error(e);
      }
    },
    handleSelectedProfileChange(params) {
      this.selectedProfiles = params;
    },
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    getCurrentData(data) {
      this.tableData = data;
    }
  },
  filters: {
    inUse(value) {
      if (value) {
        return Vue.t('calcStorLang.GPU_IN_USE_TRUE');
      } else {
        return Vue.t('calcStorLang.GPU_IN_USE_FALSE');
      }
    }
  }
}
</script>

<style>

</style>