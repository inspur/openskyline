<template>
  <div>
    <el-dialog :title="$t('storage.extraSpecs')" :visible.sync="visible" :before-close="close" v-dialogDrag>
      <div>
        <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
        </operation-panel>

        <el-table ref="shTable" :data="tableData" v-loading="loading" highlight-current-row border stripe style="width: 100%;" slot="empty" max-height='500' row-key="key" @selection-change="handleSelectionChange" @sort-change="sortChange">
          <el-table-column reserve-selection type="selection" align="center" width="55">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('i18n_key') >= 0" prop="i18n_key" :label="$t('storage.key')" align="left" sortable="custom" min-width="100">
            <template slot-scope="scope">
              <span>{{ scope.row.i18n_key }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('key') >= 0" prop="key" :label="'扩展规格的键名'" align="left" sortable="custom" min-width="100">
            <template slot-scope="scope">
              <span>{{ scope.row.key }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('value') >= 0" prop="value" align="left" :label="$t('storage.value')" min-width="100">
            <template slot-scope="scope">
              <span>{{ scope.row.value }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="onRefresh">
              </el-button>
              <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc("lang.item", multipleSelection.length)}}</span>
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
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">{{$t('lang.close')}}</el-button>
      </div>
    </el-dialog>
    <createVTExS ref="createVTExS" v-if="createVolumeTypeExStandardFlg" :shareTypeId="shareTypeId"  :existedKeyList="existedKeyList" @addData="loadData" @handleShow="handleShowCreate"></createVTExS>
    <editVTExS ref="editVTExS" v-if="editVolumeTypeExStandardFlg" :editVTExS="editVTExS" :shareTypeId="shareTypeId" @handleEdit="handleEdited" @handleClose="handleEditClose"></editVTExS>
  </div>
</template>
<script>
import CreateVTExS from './CreateVTExS'
import EditVTExS from './EditVTExS'
export default {
  name: "editShareType",
  props: ['shareTypeData'],
  components: {
    CreateVTExS,
    EditVTExS
  },
  data() {
    return {
      sortObj: {
        sortOrder: "descending",
        sortField: "key"
      },
      keyDis: false,
      formInline: {
      },
      extraspecsList:["create_share_from_snapshot_support", "revert_to_snapshot_support", "mount_snapshot_support", "snapshot_support", "driver_handles_share_servers"],
      extraspecsList1:["share_backend_name", "create_share_from_snapshot_support", "revert_to_snapshot_support", "mount_snapshot_support", "snapshot_support", "driver_handles_share_servers"],
      existedKeyList:[],
      createVolumeTypeExStandardFlg: false,
      editVolumeTypeExStandardFlg: false,
      multipleSelection: [],
      visible: false,
      shareTypeId:"",
      editVTExS: {},
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
        showflg: false,
        readOnly: true,
        handler: function (selectRows) {
          let me = this;
          me.shareTypeId = me.shareTypeData.id;
          me.createVolumeTypeExStandardFlg = true;
          me.existedKeyList = me.totalData.map(function (item) {
            return item["key"];
          });
          let i18nKeyList = me.extraspecsList1.map(function (item) {
            return me.transferI18n(item);
          });
          me.existedKeyList= me.extraspecsList.concat(i18nKeyList);
          me.$nextTick(() => {
          me.$refs.createVTExS.show();
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('lang.delete'),
        multi: true,
        showflg: false,
        enable(rowData) {
          let extraspecsList = ["create_share_from_snapshot_support", "revert_to_snapshot_support", "mount_snapshot_support", "snapshot_support", "driver_handles_share_servers", "share_backend_name"];
          return extraspecsList.indexOf(rowData.key) == -1;
        },
        handler: async function (selectRows) {
          var self = this;
          self.$sequence({
            type: 'DELETE',
            url: "api/manila/v2/" + this.$cookie.get("pid") + "/types/" + self.shareTypeData.id + "/extra_specs/{key}",
            confirmMsg: this.$t('storage.deleteExtengSpecConfirm'),
            params: selectRows,
            errorKey: "badRequest",
            log: {
              description: {
                en: "Delete extra specification",
                zh_cn: "删除扩展规格"
              },
              key: "key",
              target: Vue.logTarget.storage_share_type
            }
          }).then((data) => {
            self.loading = true;
            self.$message(Vue.t('storage.sendDeleteSuccess'));
            self.$refs.shTable.clearSelection();
            self.currentPage = 1;
            setTimeout(function () {
              self.loadData();
              self.loading = false;
            }, 1000);
          }).catch((err) => { });
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: this.$t('lang.edit'),
        showflg: true,
        enable(rowData) {
          let extraspecsList = ["create_share_from_snapshot_support", "revert_to_snapshot_support", "mount_snapshot_support", "snapshot_support", "driver_handles_share_servers"];
          return extraspecsList.indexOf(rowData.key) == -1;
        },
        handler: function (selectRows) {
          let me = this;
          me.editVolumeTypeExStandardFlg = true;
          me.shareTypeId = me.shareTypeData.id;
          me.editVTExS = selectRows[0];
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
      columnsChecked: ["i18n_key", "value"],
      columns: [{
        prop: "i18n_key",
        label: this.$t('storage.key')
      }, {
        prop: "key",
        label: "扩展规格的键名"
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
    close () {
      this.$refs.shTable.clearSelection();
      this.$emit("freshData", {});
      this.visible=false;
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder: column.order,
        sortField: column.prop
      };
    },
    async loadData() {
      let self = this;
      this.loading = true;
      var Pid = this.$cookie.get('pid');
      let url= "api/manila/v2/" + this.$cookie.get("pid") + "/types/" + this.shareTypeData.id;
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        let extrMap = result['share_type']["extra_specs"];
        self.totalData = Object.keys(extrMap).filter(function (item) {
          return self.extraspecsList.indexOf(item) == -1 || extrMap[item].toString().toLowerCase() != "false";
        }).map(function (el) {
            return { "i18n_key": self.transferI18n(el), "key":el, "value": extrMap[el] };
        });
    },
    transferI18n(key) {
      if (key) {
        const I18N_FILE_NAME ="storage.";
        let i18nVal =this.$t(I18N_FILE_NAME + key);
        if (i18nVal != I18N_FILE_NAME + key) {
          key = i18nVal;
        }
      }
      return key;
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
  }
}
</script>