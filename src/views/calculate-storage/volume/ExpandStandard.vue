<template>
  <div>
    <el-dialog :title="$t('storage.extraSpecs')" :visible.sync="visible" :before-close="handleClose">
      <div>
        <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
        </operation-panel>

        <el-table ref="shTable" :data="tableData" v-loading="loading" highlight-current-row border stripe style="width: 100%;" slot="empty" max-height='500' row-key="key" @selection-change="handleSelectionChange" @sort-change="sortChange">
          <el-table-column reserve-selection type="selection" align="center" width="55">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('key') >= 0" prop="key" :label="$t('storage.key')" align="left" sortable="custom" min-width="100">
            <template slot-scope="scope">
              <span v-if="scope.row.key === 'volume_backend_name'">{{ $t('storage.volumeBackendName') }}</span>
              <span v-else-if="scope.row.key === 'multiattach'">{{ $t('storage.multiattach') }}</span>
              <span v-else>{{ scope.row.key }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('value') >= 0" prop="value" align="left" :label="$t('storage.value')" min-width="100">
            <template slot-scope="scope">
              <span v-if="scope.row.key === 'multiattach' && scope.row.value === '<is> True'">{{ $t('storage.multiattachSupport') }}</span>
              <span v-else>{{ scope.row.value }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="onRefresh">
              </el-button>
              <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
              <el-popover placement="right" trigger="click">
                <el-checkbox-group class="vertical" v-model="columnsChecked">
                  <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
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
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{$t('lang.close')}}</el-button>
      </div>
    </el-dialog>
    <createVTExS ref="createVTExS" v-if="createVolumeTypeExStandardFlg" :volTypeId="volTypeId" @addData="loadData" @handleShow="handleShowCreate"></createVTExS>
    <editVTExS ref="editVTExS" v-if="editVolumeTypeExStandardFlg" :volTypeId="volTypeId" :selectedKey="editVTExS.key" :value="editVTExS.value" @handleEdit="handleEdited" @handleClose="handleEditClose()"></editVTExS>
  </div>
</template>
<script>
import CreateVTExS from './CreateVTExS'
import EditVTExS from './EditVTExS'
export default {
  name: "expandStandard",
  props: ['volTypeId'],
  data() {
    return {
      sortObj: {
        sortOrder: "descending",
        sortField: "key"
      },
      keyDis: false,
      formInline: {
      },
      createVolumeTypeExStandardFlg: false,
      editVolumeTypeExStandardFlg: false,
      multipleSelection: [],
      visible: false,
      editVTExS: {
        key: "",
        value: ""
      },
      expandMap: new Map(),
      rules: {
        key: [
          { type: 'required', trigger: 'blur change' },
          { type: 'onlyLetter_MinusNumberChinese' },
          { type: 'maxSize', value: 255 }
        ],
        value: [
          { type: 'required', trigger: 'blur change' },
          { type: 'onlyLetter_MinusNumberChineseBra' },
          { type: 'maxSize', value: 255 }
        ]
      },
      operationMenus: [{
        icon: "fa-plus",
        name: this.$t('storage.create'),
        showflg: true,
        readOnly: true,
        handler: function (selectRows) {
          let me = this;
          me.createVolumeTypeExStandardFlg = true;
          me.$nextTick(() => {
            me.$refs.createVTExS.show();
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
          self.$sequence({
            type: 'delete',
            url: 'api/cinderv3/v3/' + this.$cookie.get('pid') + "/types/" + self.volTypeId + "/extra_specs/{key}",
            confirmMsg: this.$t('storage.deleteExtengSpecConfirm'),
            params: selectRows,
            errorKey: "badRequest",
            log: {
              description: {
                en: "Delete extra specification",
                zh_cn: "删除扩展规格"
              },
              key: "key",
              target: Vue.logTarget.storage_volume_type
            }
          }).then((data) => {
            self.loading = true;
            self.$message(Vue.t('storage.sendDeleteSuccess'));
            self.$refs.shTable.clearSelection();
            self.currentPage = 1;
            setTimeout(function () {
              self.loadData();
              self.loading = false;
            }, 5000);
          }).catch((err) => { });
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: this.$t('lang.edit'),
        showflg: true,
        enable(rowData) {
          return rowData.key !== 'multiattach';
        },
        handler: function (selectRows) {
          let me = this;
          me.editVolumeTypeExStandardFlg = true;
          me.editVTExS.key = selectRows[0].key;
          me.editVTExS.value = selectRows[0].value;
          me.$nextTick(() => {
            me.$refs.editVTExS.show();
          });
        }.bind(this)
      }],
      tableData: [],
      totalData: [],
      listPara: {
        page: 1,
        pageSize: 10
      },
      loading: false,
      columnsChecked: ["key", "value"],
      columns: [{
        prop: "key",
        label: this.$t('storage.key')
      }, {
        prop: "value",
        label: this.$t('storage.value')
      }],
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 50, 200],
      total: 1
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder: column.order,
        sortField: column.prop
      };
    },
    async loadData() {
      var self = this;
      this.loading = true;
      var Pid = this.$cookie.get('pid');
      var url = "api/cinderv3/v3/" + Pid + "/types/" + self.volTypeId + "/extra_specs";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        var extrMap = result['extra_specs'];
        self.totalData = Object.keys(extrMap).map(function (el) {
          return { "key": el, "value": extrMap[el] };
        });
      } catch (res) {
        self.loading = false;
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.clearSelOption();
      this.loadData();
    },
    handleSizeChange(val) {
      this.listPara.pageSize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      this.listPara.page = val;
      this.loadData();
    },
    handleClick() {
    },
    handleCommand(c) {
    },
    addData() {
      this.$refs.addVolumeType.hide();
    },
    show() {
      this.visible = true;
      this.loadData();
    },
    hide() {
      this.visible = false;
    },
    handleShowCreate() {
      this.createVolumeTypeExStandardFlg = false;
    },
    handleEditClose() {
      this.editVolumeTypeExStandardFlg = false;
    },
    handleClose() {
      this.clearSelOption();
      this.visible=false
    },
    handleEdited() {
      this.loadData();
      this.editVolumeTypeExStandardFlg = false;
    },
    confirmFun() {
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    clearSelOption() {
      var self = this;
      self.$refs.shTable.clearSelection();
    }
  },
  components: {
    CreateVTExS,
    EditVTExS
  }
}
</script>