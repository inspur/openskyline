<template>
   <div>
  <el-dialog :title="$t('storage.visitControl')" :visible.sync="visible" :before-close="cancelFun">
    <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus"> </operation-panel>
    <div>
      <el-table ref="shTable"
       :data="tableData" highlight-current-row border stripe style="width: 100%;" slot="empty" max-height='500' row-key="id" :default-sort="{prop: 'id', order: 'descending'}"
        @selection-change="handleSelectionChange" @sort-change="sortChange">
        <el-table-column reserve-selection type="selection" align="center" width="55"></el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('id') >= 0" prop="id" label="ID" align="left" sortable="custom" min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('access_level') >= 0" prop="access_level" :label="$t('storage.level')" align="left" sortable="custom" min-width="100">
          <template slot-scope="scope">
            <span v-html="getlevel(scope.row['access_level'])"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('state') >= 0" prop="state" align="left" :label="$t('lang.status')" min-width="100">
          <template slot-scope="scope">
            <span v-html="getState(scope.row['state'])"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('access_type') >= 0" prop="access_type" align="left" :label="$t('storage.type')" min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('access_to') >= 0" prop="access_to" align="left" :label="$t('storage.accessTo')" min-width="100">
        </el-table-column>
      </el-table>
    </div>
    <div>
      <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="loadData">
        </el-button>
          <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc("lang.item", multipleSelection.length)}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData"  @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
        </el-col>
      </el-row>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelFun">{{$t('storage.close')}}</el-button>
      <!--<el-button type="primary" @click="confirmFun">确 定</el-button> -->
    </div>
 </el-dialog>
 <visit-control-grant ref="visitControlGrant" v-if="vistControlGrantFlag" @onRefresh="loadData" @handleShow="grantDataShow">
      </visit-control-grant>
    </div>
</template>
<script>
import VisitControlGrant from './VisitControlGrant'
export default {
  name:"vc",
  props: ['editShareData'],
  data() {
    return {
      sortObj:{
        sortOrder:"descending",
        sortField:"name"
      },
      vc:{
        net:""
      },
      shareId:'',
      storeType:'',
      loading:false,
      valueT: [1, 4],
      visible:false,
      dialogVisible: false,
      vistControlGrantFlag: false,
      netOptions:[{value:'1', label:'netTest'}],
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 20 }
        ],
        domain: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 20 }
        ]
      },
      multipleSelection:[],
      columnsChecked:["access_level", "state", "access_type", "access_to"],
      columns:[{
        prop:"id",
        label:"ID"
      }, {
        prop:"access_level",
        label:this.$t('storage.level')
      }, {
        prop:"state",
        label:this.$t('lang.status')
      }, {
        prop:"access_type",
        label:this.$t('lang.type')
      }, {
        prop:"access_to",
        label:this.$t('storage.accessTo')
      }],
      tableData:[],
      totalData:[],
      listPara:{
        page:1,
        pageSize:10
      },
      currentPage:1,
      pageSize:10,
      pageSizes:[10, 50, 200],
      total:1,
      operationMenus:[{
        icon: "fa-plus",
        name: this.$t('lang.addTo'),
        showflg: true,
        readOnly: true,
         handler: function(selectRows) {
          let me = this;
          me.vistControlGrantFlag = true;
          me.$nextTick(() => {
            me.$refs.visitControlGrant.show(this.editShareData, this.storeType);
            if (me.editShareData && me.editShareData.share_proto === "NFS") {
              me.$refs.visitControlGrant.info = me.$t('storage.accessToVisitCert');
            }
            if (me.editShareData && me.editShareData.share_proto === "CIFS") {
              me.$refs.visitControlGrant.info = me.$t('storage.accessToVisitCert1');
            }
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
         handler: function(selectRows) {
          var self = this;
          //二次确认是否移除
          self.$prompt(this.$t('lang.inputYesToContinue'), this.$t('lang.confirm'), {
              confirmButtonText:this.$t('lang.confirm'),
              cancelButtonText:this.$t('lang.cancel'),
              inputPattern:/^YES$|^NO$/i,
              inputValue: "NO",
              customClass: "promptConfirmDel",
              inputErrorMessage:this.$t('lang.onlyAcceptYesOrNo')
            }).then(async({ value }) => {
               if ("yes" == value.toLowerCase()) {
                  self.$sequence({
                    type: 'post',
                    url: 'api/manila/v2/' + this.$cookie.get('pid') + "/shares/" + this.shareId + "/action",
                    params: selectRows,
                    datas:{"deny_access":{"access_id":"{id}"}},
                    paramKeys:["id"],
                    successMsg: this.$t('storage.sendDeleteVisitAccessToSuccess'),
                    errorKey: "badRequest",
                    log:{
                      description:{
                        en:"Delete Share Vist Controller{access_to}({id})",
                        zh_cn:"删除文件存储访问控制记录{access_to}({id})"
                      },
                      target:Vue.logTarget.storage_share
                    },
                    successFun: function() {
                      for (var r = 0; r < selectRows.length; r++) {
                        var row = selectRows[r];
                        //var volume = self.volumeMaps.get(row.id);
                        row['state'] = "denying";
                      }
                      self.loading = true;
                      self.$refs.shTable.clearSelection();
                      self.currentPage = 1;
                      setTimeout( function() {
                        self.queryClick(true);
                        self.loading = false;
                      }, 5000);
                    }
                          // successMsg: "删除发送成功",
                  }).then((data) => {

                }).catch((err) => {});
              }
            }).catch(() => {
                    //取消
          });
        }.bind(this)
      }]
    }
  },
  watch: {
    tableData: {
      immediate: false,
      handler: function(list) {
        var self = this;
        self.reloadTblFlag = false;
        if (list != null) {
          for (var t = 0; t < list.length; t++) {
            var obj = list[t];
            if (obj['state'] == "queued_to_apply" || obj['state'] == "queued_to_deny" || obj['state'] == "applying" || obj['state'] == "denying") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.interVmValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interVmValid = setInterval(() => {
              this.queryClick(false)
            }, 5000);
        }
      }
    }
  },
  mounted() {
    console.log(this.editShareData);
    //this.initForm = Object.assign({}, this.hostCreateForm);
    //this.ruleStore = Object.assign({}, this.rules);
    //this.initDialog();
  },
  methods:{
    sortChange(column) {
       var self = this;
       if (!column.prop) { return; }
       self.sortObj = {
         sortOrder:column.order,
         sortField:column.prop
       };
    },
    show(shareId, storeType) {
      this.shareId = shareId;
      this.storeType = storeType;
      this.loadData();
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    handleCancel() {
      this.$emit("handleShow", {});
    },
    handleClose(done) {
      this.$emit("handleShow", {});
      done();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    grantDataShow() {
      this.vistControlGrantFlag = false;
    },
    getCurrentData(param) {
        this.tableData = param;
    },
    getlevel(param) {
      if ("ro" == param) {
        return this.$t('storage.readonly');
      } if ("rw" == param) {
        return this.$t('storage.readWrite');
      } else {
        return "-"
      }
    },
    getState(state) {
      if ("active" == state) {
        return this.$t('storage.active');
      } else if ("queued_to_apply" == state) {
        return this.$t('storage.queuedToApply');
      } else if ("applying" == state) {
        return this.$t('storage.applying');
      } else if ("error" == state) {
        return this.$t('storage.error');
      } else if ("queued_to_deny" == state) {
        return this.$t('storage.queuedToApply');
      } else if ("denying" == state) {
        return this.$t('storage.deleting');
      } else {
        return state;
      }
    },
    queryClick(clearSelect) {
      var self = this;
      //构建查询条件,URL中按照project,user,状态和volumeType查询，之后按照名称查询
      if (clearSelect) {
        self.$refs.shTable.clearSelection();
      }
      self.loadData();
    },
    async loadData() {
      this.loading = true;
      var body = {"access_list_inspur": null};
      body = JSON.stringify(body);
      var projectId = this.$cookie.get('pid');
      var url = "api/manila/v2/" + projectId + "/inspur-shares/" + this.shareId + "/action";
      try {
        let ret = await this.$ajax({
          type: 'post',
          data: body,
          url: url
        });
        var dataList = ret.access_list;
        this.totalData = dataList;
        this.loading = false;
      } catch (data) {
        this.loading = false;
      }
    },
    cancelFun() {
      clearInterval(this.interVmValid);
      this.$emit("handleShow");
    }
  },
  components: {
    VisitControlGrant
  }
}
</script>