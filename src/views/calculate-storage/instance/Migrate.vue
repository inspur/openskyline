<template>
  <el-dialog :title="this.type == 'offline'?$t('calcStorLang.instMigrate'):$t('calcStorLang.instOnlineMigrate')" :visible="true" :before-close="handleClose">
    <el-form v-loading="saving" :element-loading-text="loadingText" ref="migrateForm" label-width="140px" label-position="right">
      <el-form-item :label="$t('calcStorLang.sourceHost')" class="is-required">
        <el-input auto-complete="off" class="col-10" disabled v-model="host.hypervisor_hostname" />
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.targetHost')" class="is-required">
        <el-radio-group v-model="migrateForm.type" @change="migrateTypeSel">
          <el-radio class="radio" label="auto">{{$t('calcStorLang.createInstAuto')}}</el-radio>
          <el-radio class="radio" label="manual" :disabled="instances.length > 1">{{ $t('calcStorLang.createInstManual') }}</el-radio>
        </el-radio-group>
        <el-tooltip placement="right" trigger="hover" :content="$t('calcStorLang.MIGRATE_MANUAL_TIPS')">
          <i class="el-icon-fa-question-circle" v-show="instances.length > 1"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.hostList')" class="is-required" v-show="migrateForm.type==='manual'">
        <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" style="margin-bottom: 5px;">
          <el-checkbox v-if="type === 'online'" style="margin-left: 5px;" v-model="allowCPUCross" @change="handleAllowCPUCrossChanged">{{ $t('calcStorLang.MIGRATE_ALLOW_CROSS_CPU_MODEL') }}</el-checkbox>
        </icos-search-bar>
        <el-table ref="acTable" v-loading="loading" :data="tableData" row-key="id" :highlight-current-row="true" @current-change="handleSelectionChange" @sort-change="handleSortChanged" :default-sort="{prop: 'hypervisor_hostname', order: 'ascending'}">
          <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="hypervisor_hostname" min-width="50" sortable="custom" />
          <el-table-column v-if="columnsChecked.indexOf('vcpus') >= 0" prop="vcpus_used" :label="$t('calcStorLang.createInstCpuUsed')" min-width="80" sortable="custom">
            <template slot-scope="scope">
              <span v-html="cpuUsedRender(scope.row.vcpus, scope.row)" />
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('ram') >= 0" prop="memory_mb_used" :label="$t('calcStorLang.createInstMemoryUsed')" min-width="80" sortable="custom">
            <template slot-scope="scope">
              <span v-html="memUsedRender(scope.row.memory_mb, scope.row)" />
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('disk') >= 0" prop="local_gb_used" :label="$t('calcStorLang.createInstStorUsed')" min-width="80" sortable="custom">
            <template slot-scope="scope">
              <span v-html="diskUsedRender(scope.row.local_gb, scope.row)" />
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('arch') >= 0" prop="cpuInfoMap.model" :label="$t('calcStorLang.MIGRATE_CPU_ARCH')" min-width="80" sortable="custom" />
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="handleSearch(searchBar.validatedParams, false)" />
              <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
              <el-popover placement="right" trigger="click">
                <el-checkbox-group class="vertical" v-model="columnsChecked">
                  <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="index">{{item.label}}</el-checkbox>
                </el-checkbox-group>
              </el-popover>
            </el-col>
            <el-col :span="19">
              <page ref="paginator" :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj" />
            </el-col>
          </el-row>
        </div>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.blockDeviceMigrate')" v-if="this.type == 'online'">
        <el-switch v-model ="migrateForm.disk" :on-text="$t('lang.yes')" :off-text="$t('lang.no')" />
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.MIGRATE_ONLINE_COMPRESSION_METHOD')" v-if="type === 'online'">
        <el-checkbox v-model="onlineMigrateMetadata.compressionMt" :disabled="onlineMigrateMetadata.compressionXbzrle === true">{{ $t('calcStorLang.MIGRATE_ONLINE_COMPRESSION_METHOD_MT') }}</el-checkbox>
        <el-checkbox v-model="onlineMigrateMetadata.compressionXbzrle" :disabled="onlineMigrateMetadata.compressionMt === true">XBZRLE</el-checkbox>
        <el-checkbox v-model="onlineMigrateMetadata.autoConverge">{{ $t('calcStorLang.MIGRATE_ONLINE_COMPRESSION_METHOD_AUTO_CONVERGE') }}</el-checkbox>
        <el-tooltip effect="dark" placement="top" style="margin-left: 5px;">
          <div slot="content" v-html="$t('calcStorLang.MIGRATE_ONLINE_COMPRESSION_TIPS')" />
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.MIGRATE_ONLINE_COMPRESSION_PAGE_CACHE_SIZE')" v-if="type === 'online' && onlineMigrateMetadata.compressionXbzrle === true">
        <el-select v-model="onlineMigrateMetadata.cacheSizeByte">
          <el-option :value="67108864" label="64M" />
          <el-option :value="134217728" label="128M" />
          <el-option :value="268435456" label="256M" />
          <el-option :value="536870912" label="512M" />
          <el-option :value="1073741824" label="1G" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="this.type == 'online'">
        <span v-html="$t('calcStorLang.onlineMigrateTip')" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmMigrate" :disabled="migrateForm.type === 'manual' && multipleSelection.length === 0" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import formatFileSize from 'utils/formatFileSize';
export default {
  name: 'Migrate',
  props: {
    instances: {
      type: Array,
      default: []
    },
    type: {
      type: String,
      default: 'offline'
    }
  },
  data() {
    return {
      loading: false,
      saving: false,
      loadingText: '',
      hasEnoughHosts: false,
      host: {
        hypervisor_hostname: ''
      },
      cpuModel: null,
      allowCPUCross: false,
      tableData: [],
      totalData: [],
      hypervisors: [],
      searchBar: {
        conditions: {
          hostName: {
            label: this.$t('calcStorLang.hostName'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          }
        },
        validatedParams: {}
      },
      formatFileSize: formatFileSize,
      columns: [],
      columnsChecked: ['name', 'vcpus', 'ram', 'disk', 'arch'],
      multipleSelection: [],
      onlineMigrateMetadata: {
        compressionMt: false,
        compressionXbzrle: false,
        autoConverge: false,
        cacheSizeByte: 67108864
      },
      migrateForm: {
        type: 'auto',
        disk: false
      },
      sortObj: {
        sortOrder: 'ascending',
        sortField: 'hypervisor_hostname',
        sortType: 'string'
      }
    }
  },
  mounted() {
    const $this = this;
    $this.init();
  },
  methods: {
    async init() {
      const $this = this;
      try {
        let res = await $this.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-hypervisors/detail'
        });
        let hypervisors = res.hypervisors.map(item => {
          try {
            item.cpuInfoMap = JSON.parse(item.cpu_info);
          } catch (e) {
            item.cpuInfoMap = {};
          }
          return item;
        });
        let host = hypervisors.find(item => item.hypervisor_hostname === $this.instances[0]['OS-EXT-SRV-ATTR:host']);
        hypervisors = hypervisors.filter(item => item.hypervisor_type !== 'ironic' &&
                                                 item.hypervisor_hostname !== host.hypervisor_hostname &&
                                                 item.status !== 'disabled' &&
                                                 item.state !== 'down');
        if ($this.type === 'online') {
          $this.hasEnoughHosts = hypervisors.filter(item => item.cpuInfoMap.model === host.cpuInfoMap.model).length > 0;
        } else if ($this.type === 'offline') {
          $this.hasEnoughHosts = hypervisors.length > 0;
        }
        $this.host = host;
        $this.hypervisors = hypervisors;
        $this.cpuModel = await $this.getTopologyCPUModel($this.instances[0]['id']);
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    migrateTypeSel(value) {
      const $this = this;
      if (value === 'manual') {
        $this.handleSearch($this.searchBar.validatedParams, true);
      }
    },
    async getAZDetail(azName) {
      const $this = this;
      const res = await $this.$ajax({
        type: 'get',
        url: 'api/nova/v2.1/os-availability-zone/detail'
      });
      let azList = res.availabilityZoneInfo;
      let az = azList.find(item => item.zoneName === azName);
      if (!az) {
        throw new Error('Failed to get az detail.');
      }
      return az;
    },
    async loadHosts(name='') {
      const $this = this;
      $this.loading = true;
      try {
        let hypervisors = JSON.parse(JSON.stringify($this.hypervisors));
        if (hypervisors != null) {
          if ($this.type === 'offline') { // 冷迁移不支持跨AZ迁移，过滤
            let azName = $this.instances[0]['OS-EXT-AZ:availability_zone'];
            let az = await $this.getAZDetail(azName);
            hypervisors = hypervisors.filter(item => Object.keys(az.hosts).includes(item.hypervisor_hostname));
          }

          if ($this.type === 'online' && !$this.allowCPUCross) { // 在线迁移且不允许跨架构迁移时，过滤到不同架构
            let model = $this.host.cpuInfoMap.model;
            hypervisors = hypervisors.filter(item => item.cpuInfoMap.model === model);
          }

          if (name !== '') {
            hypervisors = hypervisors.filter(item => item.hypervisor_hostname.includes(name));
          }

          $this.totalData = hypervisors;
          $this.loading = false;
        }
      } catch (e) {
        __DEV__ && console.error(e);
        $this.loading = false;
      }
    },
    async getTopologyCPUModel(instanceId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers/${instanceId}/topology`,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.78
          }
        });
        return res.vcpu_model;
      } catch (e) {
        __DEV__ && console.error(e);
        return null;
      }
    },
    cpuUsedRender(value, rowData) {
      return rowData['vcpus_used'] + '/' + value;
    },
    memUsedRender(value, rowData) {
      return this.formatFileSize(rowData['memory_mb_used'], 'MB') + '/' + this.formatFileSize(value, 'MB');
    },
    diskUsedRender(value, rowData) {
      return this.formatFileSize(rowData['local_gb_used'], 'GB') + '/' + this.formatFileSize(value, 'GB');
    },
    handleSelectionChange(val) {
      if (val != null) {
        this.multipleSelection = [val];
      }
    },
    handleSizeChange(val) {
      this.currentPage = 1;
      this.getData({
        page: this.currentPage,
        pageSize: val
      });
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    close() {
      this.$emit('close');
    },
    handleClose(done) {
      this.$emit('close');
      done();
    },
    async handleAllowCPUCrossChanged() {
      const $this = this;
      if ($this.allowCPUCross === true) {
        if (!$this.host.cpuInfoMap.vendor || $this.host.cpuInfoMap.vendor.toLowerCase() !== 'intel') {
          $this.allowCPUCross = false;
          $this.$message.error($this.$t('calcStorLang.MIGRATE_CPU_INTEL_ONLY'));
        } else if ($this.cpuModel === 'custom' || $this.cpuModel === 'host-model' || $this.cpuModel === 'host-passthrough') {
          $this.allowCPUCross = false;
          $this.$message.error($this.$t('calcStorLang.MIGRATE_CPU_CROSS_BAN_TIPS', $this.vcpuModel($this.cpuModel)));
        } else {
          $this.$confirm($this.$t('calcStorLang.MIGRATE_CPU_CROSS_WARNING'), $this.$t('base.prompt'), {
            type: 'warning'
          }).then(async () => {
            await $this.handleSearch($this.searchBar.validatedParams, true);
          }).catch(() => {
            $this.allowCPUCross = false;
          });
        }
      } else {
        await $this.handleSearch($this.searchBar.validatedParams, true);
      }
    },
    async handleSearch(params, resetCurrentPage=true) {
      const $this = this;
      $this.multipleSelection = [];
      $this.searchBar.validatedParams = params;
      let hostName = params.hostName ? params.hostName : '';
      await $this.loadHosts(hostName);
      if (resetCurrentPage) {
        $this.$refs.paginator.setCurrentPage(1);
      }
    },
    confirmMigrate() {
      const $this = this;
      if ($this.migrateForm.type === 'auto' && !$this.hasEnoughHosts) {
        $this.$message.error($this.$t('calcStorLang.instMigrateTip1'));
      } else {
        if ($this.type === 'offline') {
          $this.$confirm($this.$t('calcStorLang.migrateInstConfrim'), $this.$t('base.prompt'), {
            type: 'warning'
          }).then(() => {
            $this.submitOfflineMigrate();
          });
        } else {
          $this.$confirm($this.$t('calcStorLang.onlineMigrateInstConfrim'), $this.$t('base.prompt'), {
            type: 'warning'
          }).then(() => {
            $this.submitOnlineMigrate();
          });
        }
      }
    },
    async submitOnlineMigrate() {
      const $this = this;
      $this.saving = true;
      let host = null;
      if ($this.migrateForm.type === 'manual') { // 指定目的主机
        host = this.multipleSelection[0].hypervisor_hostname;
      }
      if (host === null) {
        $this.loadingText = $this.$t('calcStorLang.MIGRATE_ONLINE_AUTO_SAVING_TEXT');
      }
      try {
        let hasError = false;
        for (let i = 0; i < $this.instances.length; i++) {
          const instance = $this.instances[i];
          try {
            let body = {
              'os-migrateLive': {
                'block_migration': $this.migrateForm.disk ? 'True' : 'False',
                'host': host,
                'disk_over_commit': 'False'
              }
            };
            if ($this.onlineMigrateMetadata.compressionMt === true || $this.onlineMigrateMetadata.compressionXbzrle === true || $this.onlineMigrateMetadata.autoConverge === true) {
              body['os-migrateLive']['metadata'] = {};
              if ($this.onlineMigrateMetadata.compressionMt === true) {
                body['os-migrateLive']['metadata']['compression_method'] = 'mt';
              }
              if ($this.onlineMigrateMetadata.compressionXbzrle === true) {
                body['os-migrateLive']['metadata']['compression_method'] = 'xbzrle';
                body['os-migrateLive']['metadata']['cache_size_byte'] = $this.onlineMigrateMetadata.cacheSizeByte;
              }
              if ($this.onlineMigrateMetadata.autoConverge === true) {
                body['os-migrateLive']['metadata']['auto_converge_enable'] = 'True';
              }
            }
            if ($this.allowCPUCross) {
              body['os-migrateLive']['allow_cpu_cross'] = 'True';
            }
            let result = await $this.$ajax({
              type: 'post',
              url: `api/nova/v2.1/servers-inspur/${instance.id}/action`,
              data: JSON.stringify(body),
              errorKey: 'badRequest',
              log: {
                description: {
                  en: `Online Migrate Instance: ${instance.name} (UUID: ${instance.id})`,
                  zh_cn: `在线迁移云主机: ${instance.name} (UUID: ${instance.id})`
                },
                key: 'name',
                target: Vue.logTarget.computeInstance
              }
            });
          } catch (res) {
            $this.loadingText = '';
            hasError = true;
          }
        }
        if (!hasError) {
          $this.$emit('refresh');
          $this.$message($this.$t('calcStorLang.onlineMigrateSuccess'));
        }
        $this.$emit('close');
        $this.saving = false;
      } catch (res) {
        $this.loadingText = '';
        $this.saving = false;
      }
    },
    async submitOfflineMigrate() {
      const $this = this;
      $this.saving = true;
      try {
        let body = [];
        if ($this.migrateForm.type === 'manual') {
          body = {
            'migrate': {
              'host': this.multipleSelection[0].hypervisor_hostname + ''
            }
          }
        } else {
          body = {
            'migrate': null
          }
        }
        let hasError = false;
        for (let i = 0; i < $this.instances.length; i++) {
          const instance = $this.instances[i];
          try {
            let result = await $this.$ajax({
              type: 'post',
              data: JSON.stringify(body),
              url: `api/nova/v2.1/servers-inspur/${instance.id}/action`,
              headers: {
                'X-OpenStack-Nova-API-Version': 2.56
              },
              showErrMsg: true,
              log: {
                description: {
                  en: `Migrate Instance: ${instance.name} (UUID: ${instance.id})`,
                  zh_cn: `迁移云主机: ${instance.name} (UUID: ${instance.id})`
                },
                key: 'name',
                target: Vue.logTarget.computeInstance
              }
            });
          } catch (res) {
            hasError = true;
          }
        }
        if (!hasError) {
          $this.$emit('refresh');
          $this.$message.success($this.$t('calcStorLang.instMigrateSuccess'));
        }
        $this.$emit('close');
        $this.saving = false;
      } catch (e) {
        $this.saving = false;
        __DEV__ && console.error(e);
      }
    },
    handleSortChanged(column) {
      let sortType = 'number';
      if (column.prop === 'hypervisor_hostname' || column.prop === 'cpuInfoMap.model') {
        sortType = 'string';
      }
      this.sortObj = {
        sortOrder: column.order,
        sortField: column.prop,
        sortType
      };
    },
    vcpuModel(value) {
      switch (value) {
        case 'host-passthrough':
          return this.$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_HOST_PASSTHROUGH');
        case 'host-model':
          return this.$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_HOST_MODEL');
        case 'none':
          return this.$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_NONE');
        case 'custom':
          return this.$t('calcStorLang.NG_CREATE_INSTANCE_CPU_MODE_CUSTOM');
        default:
          return value;
      }
    }
  }
}

</script>
<style scoped>


</style>
