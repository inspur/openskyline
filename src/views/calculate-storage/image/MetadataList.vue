<template>
  <div>
    <el-dialog :visible="true" :before-close="handleBeforeClose" :title="$t('calcStorLang.IMAGE_METADATA_LIST')" size="middle">
      <operation-panel-new ref="operationOperate" :select-rows="multipleSelection" :operation-menus="operationMenus" style="margin-bottom: 15px;" />
      <el-table ref="metadataTable" :data="tableData" v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column reserve-selection type="selection" width="55">
        </el-table-column>
        <el-table-column v-if="checkedColumns.includes('key')" :label="$t('calcStorLang.IMAGE_METADATA_KEY')" prop="key">
        </el-table-column>
        <el-table-column v-if="checkedColumns.includes('value')" :label="$t('calcStorLang.IMAGE_METADATA_VALUE')" prop="value">
        </el-table-column>
      </el-table>
    
      <el-row type="flex" justify="space-between" align="center">
        <div>
          <icos-column-selector @refresh="loadMetadata" @column-checked="handleColumnChecked" :selected-length="multipleSelection.length" :columns="[{
            prop: 'key',
            label: $t('calcStorLang.IMAGE_METADATA_KEY'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'value',
            label: $t('calcStorLang.IMAGE_METADATA_VALUE'),
            visible: true,
            defaultChecked: true
          }]" />
        </div>
        <div>
          <page
            :totalData="totalData"
            :pageCount="5"
            @getCurrentData="handleGetCurrentData" />
        </div>
      </el-row>
      <span slot="footer">
        <el-button @click="close()">{{ $t('base.cancel') }}</el-button>
      </span>
    </el-dialog>
    <add-metadata v-if="addMetadataDialog.visible" @close="addMetadataDialog.visible = false" :imageId="addMetadataDialog.imageId" @refresh="loadMetadata" />
    <edit-metadata v-if="editMetadataDialog.visible" @close="editMetadataDialog.visible = false" :imageId="editMetadataDialog.imageId" :enums="editMetadataDialog.enums" :oriKey="editMetadataDialog.key" :oriValue="editMetadataDialog.value" @refresh="loadMetadata" />
  </div>
</template>

<script>
import _ from 'underscore';
import reservedMetadata from './ReservedMetadata';  // 保留的元数据，对用户不可见
import AddMetadata from './AddMetadata';
import EditMetadata from './EditMetadata';
export default {
  name: 'ImageMetadataList',
  props: ['imageId'],
  components: { AddMetadata, EditMetadata },
  data() {
    return {
      loading: false,
      metadataSchema: [],
      tableData: [],
      totalData: [],
      multipleSelection: [],
      checkedColumns: [],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('calcStorLang.IMAGE_METADATA_LIST_ADD'),
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.addMetadataDialog.imageId = this.imageId;
          this.addMetadataDialog.visible = true;
        }.bind(this)
      }, {
        icon: "fa-pencil",
        name: Vue.t('lang.edit'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return !rowData.readonly;
        },
        handler: function(selectRows) {
          this.editMetadataDialog.imageId = this.imageId;
          this.editMetadataDialog.enums = selectRows[0].enums;
          this.editMetadataDialog.key = selectRows[0].key;
          this.editMetadataDialog.value = selectRows[0].value;
          this.editMetadataDialog.visible = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return !rowData.readonly;
        },
        handler: function(selectRows) {
          this.removeMetadatas(selectRows);
        }.bind(this)
      }],
      addMetadataDialog: {
        visible: false,
        imageId: ''
      },
      editMetadataDialog: {
        visible: false,
        imageId: '',
        key: '',
        value: ''
      }
    };
  },
  methods: {
    async loadMetadataSchema() {
      const $this = this;
      const res = await $this.$ajax({
        url: `api/glance/v2/schemas/image`,
        type: 'get'
      });
      $this.metadataSchema = res.properties;
    },
    async loadMetadata() {
      const $this = this;
      $this.loading = true;
      $this.$refs.metadataTable.clearSelection();
      const res = await $this.$ajax({
        url: `api/glance/v2/images/${$this.imageId}`,
        type: 'get'
      });
      const metadata = [];
      for (let key in res) {
        if (reservedMetadata.find(item => item === key)) {
          continue;
        }
        if ($this.metadataSchema.hasOwnProperty(key) && $this.metadataSchema[key].hasOwnProperty('readOnly') && $this.metadataSchema[key]['readOnly'] === true) {
          continue;
        }
        let enums = [];
        if ($this.metadataSchema.hasOwnProperty(key) && $this.metadataSchema[key].hasOwnProperty('enum')) {
          enums = $this.metadataSchema[key]['enum'];
        }
        if ($this.metadataSchema.hasOwnProperty(key) && $this.metadataSchema[key].type === 'boolean') {
          enums = [true, false];
        }
        if (key === 'hw_qemu_guest_agent') {
          enums = ['yes', 'no'];
        }
        metadata.push({
          key: key,
          value: res[key],
          enums
        });
      }
      $this.totalData = _.sortBy(metadata, 'key');
      $this.loading = false;
    },
    close() {
      this.$emit("onRefresh");
      this.$emit("close");
    },
    handleBeforeClose(done) {
      this.close();
      done();
    },
    handleSelectionChange(rows) {
      this.multipleSelection = rows;
    },
    async removeMetadatas(rows) {
      const $this = this;
      await $this.$confirm(Vue.t('calcStorLang.IMAGE_METADATA_LIST_DELETE_CONFIRM'), Vue.t('base.prompt'), {
        confirmButtonText: Vue.t('base.confirm'),
        cancelButtonText: Vue.t('base.cancel'),
        type: 'warning'
      }).then(async () => {
        $this.loading = true;
        try {
          let body = [];
          let logsZhCn = `镜像(${$this.imageId})删除元数据 `;
          let logsEn = `Image (${$this.imageId}) Delete Metadata `;
          rows.forEach((row) => {
            body.push({
              'op': 'remove',
              'path': `/${row.key}`
            });
            logsZhCn += `${row.key}=${row.value} `;
            logsEn += `${row.key}=${row.value} `;
          });
          await $this.$ajax({
            url: `api/glance/v2/images/${$this.imageId}`,
            data: JSON.stringify(body),
            type: 'patch',
            contentType: 'application/openstack-images-v2.1-json-patch',
            log: {
              description: {
                en: logsEn,
                zh_cn: logsZhCn
              },
              target: Vue.logTarget.computeMirror
            }
          });
          $this.$message.success(Vue.t('calcStorLang.IMAGE_METADATA_LIST_DELETE_SUCCESS'));
          await $this.loadMetadata();
        } catch (e) {
          __DEV__ && console.error(e);
        }
        $this.loading = false;
      });
    },
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    handleGetCurrentData(data) {
      this.tableData = data;
    }
  },
  mounted() {
    this.$nextTick(async () => {
      // 加载所有预制元数据
      await this.loadMetadataSchema();
      // 加载当前镜像元数据
      await this.loadMetadata();
    });
  }
}
</script>

<style scoped>
.count-info {
  margin-top: 15px;
  color: #333;
  font-size: 12px;
}
</style>
