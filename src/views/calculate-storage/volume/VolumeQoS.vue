<template>
 <div>
    <el-form :inline="true" v-model="formInline" class="form-inline" >
      <el-form-item :label="$t('lang.name')">
        <el-input  size="small" v-model="query_name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='search' size="small" @click="queryClick()">{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form>
    <div class="divider clearfix"></div>
  <operation-panel
    class="margin-tb5"
    :select-rows="multipleSelection"
    :operation-menus="operationMenus">
  </operation-panel>
  <div class="divider clearfix"></div>
  <el-table
    ref="shTable"
    :data="tableData"
    v-loading="loading"
    highlight-current-row
    border
    stripe
    style="width: 100%;"
    slot="empty"
    max-height='500'
    row-key="id"
    @selection-change="handleSelectionChange"
    @sort-change="sortChange">
    <el-table-column
      reserve-selection
      type="selection"
      align="center"
      width="55">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
      prop="name"
      :label="$t('lang.name')"
      align="left"
      sortable="custom"
      min-width="80">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('id') >= 0" label="ID" prop="id" align="left" min-width="70">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('specs') >= 0"
      prop="specs"
      align="left"
      :label="$t('storage.spec')"
      min-width="80">
      <template slot-scope="scope">
          <span v-html="specsRender(scope.row.specs, scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('unvolumetype') >= 0"
      prop="unvolumetype"
      align="left"
      :label="$t('storage.connectedVolType')"
      min-width="80">
      <template slot-scope="scope">
          <span v-html="getVolTypeNameByQosId(scope.row.id, scope.row)"></span>
      </template>
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh">
        </el-button>
          <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
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
              <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
      </el-col>
    </el-row>
    <create-qoS ref="createQoS" v-if="createQoSFlg"  @handleShow="handleShow" @getData="loadData" @clearSelOption="clearSelOption"></create-qoS>
    <qos-Manage ref="qosManage" v-if="qosManageFlg"  @handleEditShow="handleEditShow" @getData="loadData" :qosId="qosId"></qos-Manage>
    <edit-consumer ref="editConsumer" v-if="editConsumerFlg" ></edit-consumer>
  </div>
 </div>
</template>
<script>
import CreateQoS from './CreateQoS'
import QosManage from './QosManage'
import EditConsumer from './EditConsumer'
export default {
  name: "VolumeTypeList",
  data() {
    return {
      formInline: {
      },
      createQoSFlg:false,
      qosId: '',
      qosManageFlg:false,
      editConsumerFlg:false,
      multipleSelection:[],
      query_name: "",
      vTypeList: [],
      operationMenus:[{
        icon: "fa-plus",
        name: this.$t('storage.createQosSpec'),
        showflg: true,
        readOnly: true,
         handler: function(selectRows) {
          let me = this;
          me.createQoSFlg = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('storage.deleteQosSpec'),
        showflg: true,
        multi: true,
        enable(rowData) {
        return true;
      },
        // readOnly: true,
        handler: function(selectRows) {
        var self = this;
        var pUuid = this.$cookie.get("pid");
        self.$sequence({
          type: 'delete',
          url: "api/cinderv3/v3/" + pUuid + "/qos-specs/{id}?force=true",
          params: selectRows,
          confirmMsg: this.$t('storage.deleteQosSpecConfirm'),
          successMsg: this.$t('storage.deleteQosSpecSuccess'),
          log:{
            description:{
              en:"Delete QoS",
              zh_cn:"删除QoS"
            },
            key: "name",
            target:Vue.logTarget.storage_volume_QoS
          },
          successFun:function() {
          self.loading = true;
          self.$refs.shTable.clearSelection();
          self.currentPage = 1;
          setTimeout( function() {
                self.loadData();
                self.loading = false;
              }, 500);
          }
        }).then((data) => {
           this.$emit("onRefresh");
        }).catch((err) => {});
      }.bind(this)
      }, {
        icon: "fa-cogs",
        name: this.$t('storage.manageQosSpec'),
        showflg: true,
        enable(rowData) {
          return true;
        },
        // readOnly: true,
        handler: function(selectRows) {
          var self = this;
          let row = selectRows[0];
          self.qosId = row['id'];
          self.qosManageFlg = true;
        }.bind(this)
      }],
      totalData: [],
      tableData:[],
      listPara:{
        page:1,
        pageSize:10
      },
      loading:false,
      columnsChecked:["name", "specs", "unvolumetype"],
      columns:[{
        prop: "name",
        label:this.$t('lang.name')
      }, {
        prop:"id",
        label:"ID"
      }, {
        prop:"specs",
        label:this.$t('storage.spec')
      }, {
        prop:"unvolumetype",
        label:this.$t('storage.connectedVolType')
      }],
      currentPage:1,
      pageSize:10,
      pageSizes:[10, 50, 200],
      total:1
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData(queryname = "") {
      this.getVolTypeData();
      var Pid = this.$cookie.get('pid');
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/cinderv3/v3/" + Pid + "/qos-specs";
        try {
          let result = await self.$ajax({
            type: 'get',
            url: url
          });
          self.totalData = [];
          self.loading = false;
          var middleData = result['qos_specs'];
          if (queryname == "" || queryname == null) {
            self.totalData = middleData;
           } else {
            self.totalData = [];
            for (let i = middleData.length - 1; i >= 0; i--) {
              if (middleData[i].name.indexOf(queryname) >= 0) {
                self.totalData.push(middleData[i]);
               }
             }
           }
        } catch (res) {
          self.loading = false;
        }
    },
    async getVolTypeData() {
      this.loading = true;
      var projectId = this.$cookie.get('pid');
      var self = this;
      let data = [];
      var url = "";
      var roleType = Vue.roleType + "";
      var volTypeName = self.volTypeName;
      var ispublic = "None";
      url = "api/cinderv3/v3/" + projectId + "/types?is_public=" + ispublic;
      if ("2" == roleType || "3" == roleType) { //超级
        url = "api/cinderv3/v3/" + projectId + "/types";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        self.vTypeList = [];
        var vTypes = result['volume_types'];
        for (var vi = 0; vi < vTypes.length; vi++) {
          if (null != vTypes[vi].qos_specs_id && "" != vTypes[vi].qos_specs_id) {
            self.vTypeList.push(vTypes[vi]);
          }
        }
        //self.vTypeList = result['volume_types'];
      } catch (res) {
        self.loading = false;
        self.$message.error(Vue.t('storage.getFailed'));
      }
    },
    getVolTypeNameByQosId(qosId, rowData) {
      var volTypeName = "";
      var volTypeList = this.vTypeList;
      for (var volType in volTypeList ) {
        if (volTypeList[volType].qos_specs_id == qosId) {
          volTypeName = volTypeName + volTypeList[volType].name + "<br>";
        }
      }
      return volTypeName;
    },
    specsRender(value, rowData) {
      var specsObject = rowData['specs'];
      var specshtml = "";
      if (specsObject) {
              for ( var item in specsObject ) {
            specshtml += " "+item + "=" + specsObject[item] + "<br>";
       }
     }
      return specshtml;
    },
    sortChange(column) {
       var self = this;
       var key = column.prop;
       var keyOrder = column.order;
       if (keyOrder != null && self.totalData != null) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder));
       }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.loadData();
    },
    handleSizeChange(val) {
      this.listPara.pageSize = val;
      this.loadData();
    },
    queryClick() {
      var self = this;
      if (null != self.query_name && "" != self.query_name) {
        if (self.query_name.length > 255) {
          this.$message({
                    showClose: true,
                    message: Vue.t('storage.nameMaxLength'),
                    type: 'warning'
                 });
                 return;
        }
      }
      self.loadData(self.query_name);
    },
    handleCurrentChange(val) {
      this.listPara.page = val;
      this.loadData();
    },
    handleShow() {
      this.createQoSFlg = false;
    },
    handleEditShow() {
      this.qosManageFlg = false;
    },
    clearSelOption() {
      var self = this;
      self.$refs.shTable.clearSelection();
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleClick() {
    }
  },
  components: {
    CreateQoS,
    QosManage,
    EditConsumer
  }
}
</script>