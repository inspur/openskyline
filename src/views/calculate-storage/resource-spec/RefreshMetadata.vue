<template>
  <div>
    <el-dialog :title="$t('calcStorLang.updateMedata')" :visible.sync="visible" :before-close="handleClose">
      <div>
        <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus"></operation-panel>
        <el-table ref="specTable" :data="tableData" v-loading="loading" border stripe style="width: 100%;" max-height="500" row-key="key" @selection-change="handleSelectionChange" @sort-change="sortChange">
          <el-table-column reserve-selection type="selection" align="center" width="55"></el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('key') >= 0" prop="key" :label="$t('calcStorLang.key')" align="left" sortable="custom" min-width="100" />
          <el-table-column v-if="columnsChecked.indexOf('value') >= 0" prop="value" align="left" :label="$t('calcStorLang.value')" min-width="100">
            <template slot-scope="scope">
              {{ valueUnit(scope.row.value, scope.row.key) }}
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
              <span>{{$t('lang.currentSelected') + multipleSelection.length + " " + $tc('lang.item', multipleSelection.length)}}</span>
              <el-popover placement="right" trigger="click">
                <el-checkbox-group class="vertical" v-model="columnsChecked">
                  <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}</el-checkbox>
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
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{$t('lang.close')}}</el-button>
      </div>
    </el-dialog>
    <refresh-metadata-edit
      v-if="editDialog.visible"
      :type="editDialog.type"
      :selected-key="editDialog.selectedKey"
      :incoming-values="editDialog.incomingValues"
      :existing-keys="editDialog.existingKeys"
      :numa-nodes="editDialog.numaNodes"
      :flavor="editDialog.flavor"
      @close="editDialog.visible = false"
      @refresh="onRefresh"
    />
  </div>
</template>
<script>
import RefreshMetadataEdit from './RefreshMetadataEdit';
export default {
  name: "RefreshMetadata",
  props: {
    flavor: {
      type: Object,
      default: () => {
        return {
          id: '',
          name: '',
          vcpus: 0,
          ram: 0,
          disk: 0
        };
      }
    }
  },
  components: {
    RefreshMetadataEdit
  },
  data() {
    return {
      sortObj: {
        sortOrder: "ascending",
        sortField: "key"
      },
      multipleSelection: [],
      visible: true,
      operationMenus: [
        {
          icon: "fa-plus",
          name: Vue.t("calcStorLang.create"),
          showflg: true,
          readOnly: true,
          handler: function(selectRows) {
            const $this = this;
            let numaNodesItem = $this.totalData.find(item => item.key === 'hw:numa_nodes');
            $this.editDialog.type = 'add';
            $this.editDialog.selectedKey = '';
            $this.editDialog.incomingValues = [];
            $this.editDialog.existingKeys = $this.totalData.map(item => item.key);
            $this.editDialog.numaNodes = numaNodesItem ? Number(numaNodesItem.value) : 0;
            $this.editDialog.flavor = JSON.parse(JSON.stringify($this.flavor));
            $this.editDialog.visible = true;
          }.bind(this)
        },
        {
          icon: "fa-minus",
          name: Vue.t("lang.delete"),
          showflg: true,
          multi: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            this.deleteSpecs(selectRows);
          }.bind(this)
        },
        {
          icon: "fa-pencil",
          name: Vue.t("lang.edit"),
          showflg: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            const $this = this;
            let row = selectRows[0];
            let numaNodesItem = $this.totalData.find(item => item.key === 'hw:numa_nodes');
            $this.editDialog.type = 'edit';
            if (['hw:cpu_cores', 'hw:cpu_threads', 'hw:cpu_sockets'].includes(row.key)) {
              $this.editDialog.selectedKey = 'hw:cpu_cores/hw:cpu_threads/hw:cpu_sockets';
              let cpuCores = $this.totalData.find(item => item.key === 'hw:cpu_cores');
              let cpuThreads = $this.totalData.find(item => item.key === 'hw:cpu_threads');
              let cpuSockets = $this.totalData.find(item => item.key === 'hw:cpu_sockets');
              $this.editDialog.incomingValues = [
                cpuCores ? cpuCores.value : '',
                cpuThreads ? cpuThreads.value : '',
                cpuSockets ? cpuSockets.value : ''
              ];
            } else if (row.key.startsWith('hw:numa_cpus.')) {
              $this.editDialog.selectedKey = 'hw:numa_cpus.n';
              let incomingValues = [];
              if (numaNodesItem) {
                for (let i = 0; i < String(numaNodesItem.value); i++) {
                  let numaCpuItem = $this.totalData.find(item => item.key === 'hw:numa_cpus.'+i);
                  incomingValues.push(numaCpuItem ? numaCpuItem.value : '');
                }
              }
              $this.editDialog.incomingValues = incomingValues;
            } else if (row.key.startsWith('hw:numa_mem.')) {
              $this.editDialog.selectedKey = 'hw:numa_mem.n';
              let incomingValues = [];
              if (numaNodesItem) {
                for (let i = 0; i < String(numaNodesItem.value); i++) {
                  let numaMemItem = $this.totalData.find(item => item.key === 'hw:numa_mem.'+i);
                  incomingValues.push(numaMemItem ? numaMemItem.value : '');
                }
              }
              $this.editDialog.incomingValues = incomingValues;
            } else {
              $this.editDialog.selectedKey = row.key;
              $this.editDialog.incomingValues = [row.value];
            }
            $this.editDialog.existingKeys = $this.totalData.map(item => item.key);
            $this.editDialog.numaNodes = numaNodesItem ? Number(numaNodesItem.value) : 0;
            $this.editDialog.flavor = JSON.parse(JSON.stringify($this.flavor));
            $this.editDialog.visible = true;
            $this.editDialog.type = 'edit';
          }.bind(this)
        }
      ],
      tableData: [],
      totalData: [],
      loading: false,
      columnsChecked: ["key", "value"],
      columns: [
        {
          prop: "key",
          label: Vue.t("calcStorLang.key")
        },
        {
          prop: "value",
          label: Vue.t("calcStorLang.value")
        }
      ],
      editDialog: {
        visible: false,
        type: 'add',  // 操作类型 add/edit
        selectedKey: '',
        incomingValues: [],
        existingKeys: [],
        numaNodes: 0,
        flavor: {
          id: '',
          name: '',
          vcpus: 0,
          ram: 0,
          disk: 0
        }
      }
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    sortChange(column) {
      var self = this;
      self.sortObj.sortOrder = column.order;
      self.sortObj.sortField = column.prop;
    },
    async loadData() {
      var self = this;
      var url = `api/nova/v2.1/flavors/${this.flavor.id}/os-extra_specs`;
      try {
        let result = await self.$ajax({
          type: "get",
          url: url
        });
        self.totalData = [];
        self.loading = false;
        let resultObject = result["extra_specs"];
        for (var item in resultObject) {
          if (item && item.indexOf("quota") >= 0) {
            continue;
          }
          self.totalData.push({
            key: item,
            value: resultObject[item]
          });
        }
      } catch (res) {
        self.loading = false;
      }
    },
    async deleteSpecs(selectRows) {
      const $this = this;
      let keysSet = new Set(selectRows.map(item => item.key));
      if (keysSet.has('hw:cpu_cores') || keysSet.has('hw:cpu_threads') || keysSet.has('hw:cpu_sockets')) {
        keysSet.add('hw:cpu_cores');
        keysSet.add('hw:cpu_threads');
        keysSet.add('hw:cpu_sockets');
      }
      if (keysSet.has('hw:numa_nodes')) {
        $this.totalData.forEach(item => {
          if (item.key.startsWith('hw:numa_cpus.')) {
            keysSet.add(item.key);
          }
        });
        $this.totalData.forEach(item => {
          if (item.key.startsWith('hw:numa_mem.')) {
            keysSet.add(item.key);
          }
        });
      }
      if (selectRows.find(item => item.key.startsWith('hw:numa_cpus.'))) {
        $this.totalData.forEach(item => {
          if (item.key.startsWith('hw:numa_cpus.')) {
            keysSet.add(item.key);
          }
        });
      }
      if (selectRows.find(item => item.key.startsWith('hw:numa_mem.'))) {
        $this.totalData.forEach(item => {
          if (item.key.startsWith('hw:numa_mem.')) {
            keysSet.add(item.key);
          }
        });
      }

      $this.$confirm(Vue.t("calcStorLang.resSpecDelTip"), Vue.t("base.prompt"), {
        confirmButtonText: Vue.t("base.confirm"),
        cancelButtonText: Vue.t("base.cancel"),
        type: "warning"
      }).then(async () => {
        $this.loading = true;
        let keys = Array.from(keysSet);
        for (let i = 0; i < keys.length; i++) {
          var key = keys[i];
          var url = `api/nova/v2.1/flavors/${$this.flavor.id}/os-extra_specs/${key}`;
          await $this.$ajax({
            type: "delete",
            url: url,
            errorKey: "badRequest",
            log: {
              description: {
                en: `Delete Flavor Metadata: Flavor: ${$this.flavor.name}, Metadata: ${key}.`,
                zh_cn: `资源规格删除元数据：资源规格：${$this.flavor.name}，元数据：${key}`
              },
              target: Vue.logTarget.computeSpec
            }
          });
        }
        $this.$message(Vue.t("calcStorLang.deleteSuccess"));
        $this.$refs.specTable.clearSelection();
        $this.loadData();
      });
    },
    handleClose() {
      this.$emit("handleMetaShow", {});
      this.$emit("getTestData");
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.loadData();
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    valueUnit(value, key) {
      if (key.startsWith('hw:numa_mem.')) {
        return `${value} (MB)`;
      }
      return value;
    }
  }
};
</script>