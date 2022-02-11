<template>
 <div>
    <el-form :inline="true" :model="formInline" class="form-inline">
      <el-form-item :label="$t('base.resouceType')">
        <el-input v-model="formInline.name" size="small" @blur="blurFun"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' @click="onSubmit" size="small">{{$t('base.query')}}</el-button>
      </el-form-item>
    </el-form>
    <div class="divider clearfix"></div>
    <operation-panel
      class="margin-tb5"
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
    <el-table
      ref="deTable"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('base.loadingData')"
      highlight-current-row
      style="width: 100%; margin-top: 16px;"
      row-key="namespace"
      @row-click="rowClick"
      @selection-change="handleSelectionChange">
      <el-table-column
        reserve-selection
        type="selection"
        align="center"
        width="55">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('namespace') >= 0"
        prop="namespace"
        :label="$t('base.namespace')"
        align="left"
        min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('display_name') >= 0"
        prop="display_name"
        :label="$t('base.name')"
        align="left"
        min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('description') >= 0"
        prop="description"
        :label="$t('base.desc')"
        :show-overflow-tooltip="false"
        min-width="200">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('type') >= 0"
        prop="type"
        :label="$t('base.resouceType')"
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <div v-html="comType(scope.row.resource_type_associations)"></div>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('visibility') >= 0"
        prop="visibility"
        :label="$t('base.public')"
        align="left"
        min-width="60">
        <template slot-scope="scope">
          <span>{{scope.row.visibility=="public"?$t('base.yes'):$t('base.no')}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('protected') >= 0"
        prop="protected"
        :label="$t('base.protected')"
        align="left"
        min-width="60">
        <template slot-scope="scope">
          <span>{{scope.row.protected?$t('base.yes'):$t('base.no')}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="getData">
          </el-button>
            <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
            <el-popover
              placement="right"
              trigger="click">
              <el-checkbox-group class="vertical"
                v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
              </div>
            </el-popover>
        </el-col>
        <el-col :span="19">
          <page ref="page" :totalData="allData" @getCurrentData="getCurrentData"></page>
        </el-col>
      </el-row>
    </div>

    <import-metadata ref="importMetaData" v-if="importFlg" @refreshData="getData">
    </import-metadata>

    <edit-metadata ref="editMetaData" v-if="editFlg" @refreshData="getData">
    </edit-metadata>
 </div>
</template>
<script>
import ImportMetadata from './ImportMetaData'
import EditMetadata from './EditMetaData'
export default {
  name:"metaData",
  data() {
    return {
      tableData:[],
      allData:[],
      loading:false,
      formInline:{
        name:""
      },
      importFlg:false,
      editFlg:false,
      multipleSelection: [],
      columns: [{
        prop:"namespace",
        label:this.$t('base.namespace')
      }, {
        prop: "display_name",
        label: this.$t('base.name')
      }, {
        prop: "description",
        label: this.$t('base.desc')
      }, {
        prop: "type",
        label: this.$t('base.resouceType')
      }, {
        prop: "visibility",
        label: this.$t('base.public')
      }, {
        prop: "protected",
        label: this.$t('base.protected')
      }],
      columnsChecked:["namespace", "display_name", "description", "type", "visibility", "protected"],
      operationMenus:[{
        icon: "fa-plus-circle",
        name: this.$t('base.importNameSpace'),
        showflg: true,
        readOnly: true,
        handler: function() {
          let me = this;
          me.importFlg = true;
          me.$nextTick(() => {
            me.$refs.importMetaData.show();
          });
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: this.$t('base.edit'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selRows) {
          let me = this;
          me.editFlg = true;
          me.$nextTick(() => {
            me.$refs.editMetaData.show(selRows[0]);
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('base.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          if (rowData.protected) {
            return false;
          }
          return true;
        },
        handler: async function(selectedRows) {
          let me = this;
          let ret = await this.$sequence({
            type: 'DELETE',
            url: "api/glance/v2/metadefs/namespaces/{namespace}",
            confirmMsg:Vue.t('base.deleteDataWarn'),
            params: selectedRows,
            successMsg:"",
            log:{
              description:{
                en:"delete metadata",
                zh_cn:"删除元数据"
              },
              target:Vue.logTarget.parameterSetting,
              key:"display_name"
            }
          }).then(() => {
            me.$message.success(Vue.t('base.deleteSuccess'));
            me.getData();
          }, () => {
            me.getData();
          })
        }.bind(this)
      }]
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData(flag=true) {
      this.loading = true;
      let param = {limit:99999999};
      if (this.formInline.name) {
        param.resource_types = this.formInline.name;
      }
      let ret = await this.$ajax({
        type: 'get',
        url: "api/glance/v2/metadefs/namespaces?"+$.param(param)
      });
      this.allData = ret.namespaces;
      if (flag) {
        this.$refs.deTable.clearSelection();
      }
      this.loading = false;
    },
    async deleteNamespace(obj) {
      try {
        let ret = await this.$ajax({
          type: 'DELETE',
          url: "api/glance/v2/metadefs/namespaces/"+obj.namespace,
          data: {},
          successMsg: Vue.t('base.deleteSuccess'),
          log:{
            description:{
              en:"delete metadata"+"("+obj.display_name+")",
              zh_cn:"删除元数据"+"("+obj.display_name+")"
            },
            target:Vue.logTarget.parameterSetting
          }
        })
        this.getData();
      } catch (data) {
        console.log('删除失败，请联系管理员');
      }
    },
    comType(arr) {
      let str = '';
      if (arr) {
        for (let i=0; i<arr.length; i++) {
          if (i<arr.length-1) {
            str += arr[i].name+'<br/>';
          } else {
            str += arr[i].name;
          }
        }
      }
      return str;
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    getCurrentData(data) {
      this.tableData = data;
    },
    onSubmit() {
      this.getData();
    },
    blurFun() {
      if (this.formInline.name.length>40) {
        this.formInline.name = '';
        this.$notify({
          message:Vue.t('base.ultraLong'),
          type:'warning'
        });
      }
    }
  },
  components: {
    ImportMetadata,
    EditMetadata
  }
}
</script>
