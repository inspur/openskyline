<template>
  <div>
    <div class="operation-panel margin-tb5">
      <operation-panel
        :select-rows="multipleSelection"
        :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table
    ref="dataTable"
    :data="staticRouterData"
    highlight-current-row
    stripe
    border
    v-loading="loading"
    style="width: 100%"
    row-key="id"
    @row-click="rowClick"
    @selection-change="handleSelectionChange">
    <el-table-column
      reserve-selection
      type="selection"
      width="55" align="center">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('destination') >= 0"
      :label="$t('network.targetCidr')"
      prop="destination"
      min-width="100">
    </el-table-column>  
    <el-table-column
      v-if="columnsChecked.indexOf('nexthop') >= 0"
      prop="nexthop"
      :label="$t('network.nextJump')"
      min-width="100">
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
        <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
        <el-popover
          placement="right"
          trigger="click">
          <el-checkbox-group class="vertical"
            v-model="columnsChecked">
            <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
            </el-checkbox>
          </el-checkbox-group>
          <div slot="reference" class="name-wrapper">
            <el-tag>{{$t('network.columnSelected')}}</el-tag>
          </div>
        </el-popover>
      </el-col>
      <el-col :span="19">
        <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
      </el-col>
    </el-row>
  </div>
  <add-routertable ref="addinterface" v-if="addFlag" :router_Id="router_Id" @handleAddShow="handleAddShow"></add-routertable>
  </div>
</template>
<script type="text/javascript">
import { mapGetters, mapMutations } from 'vuex';
import AddRoutertable from './AddRoutertable';
export default {
  components: {
    AddRoutertable
  },
  props: ["router_Id", "check_project"],
  data() {
    return {
      formInline: '',
      loading: false,
      routerName: "",
      columns: [{
        prop: "destination",
        label: Vue.t('network.targetCidr')
      }, {
        prop: "nexthop",
        label: Vue.t('network.nextJump')
      }],
      columnsChecked: ['destination', 'nexthop'],
      addFlag: false,
      staticRouterData: [],
      totalData: [],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.addRoutertable'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.addFlag = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('network.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          let self = this;
          self.$confirm(Vue.t('network.confirmSimpleDelete'), Vue.t('network.attention'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            type: "warning",
            callback: (action, instance) => {
              if (action === "confirm") {
                self.loading = true;
                self.$refs.dataTable.clearSelection();
                let reqdata = {};
                reqdata.router = {};
                reqdata.router.routes = [];
                let olddata = self.staticRouterData;
                let delItems = [];//存放在页面中有的，而数据库中不存在的记录
                for (let j = selectRows.length - 1; j >= 0; j--) {
                  let row = selectRows[j];
                  delItems.push({"nexthop":row.nexthop, "destination":row.destination});
                }
                for (let i = olddata.length - 1; i >= 0; i--) {
                  let isDel = false;
                  for (let j = selectRows.length - 1; j >= 0; j--) {
                    let row = selectRows[j];
                    if (olddata[i].destination === row.destination && olddata[i].nexthop === row.nexthop) {
                      isDel =true;
                      break;
                    }
                  }
                  if (!isDel) {
                    reqdata.router.routes.push({"nexthop":olddata[i].nexthop, "destination":olddata[i].destination});
                  }
                }
                let totalDel = delItems.length;
                let curRouteId =this.router_Id;
                self.$ajax({
                  type: "GET",
                  url: "api/neutron/v2.0/routers/" +this.router_Id+"?fields=routes",
                  success: function(ret) {
                  let isExist = false;
                  for (var i = 0; i < delItems.length; i++) {
                    for (var j = ret['router'].routes.length - 1; j >= 0; j--) {
                      if (ret['router'].routes[j].destination == delItems[i].destination &&
                            ret['router'].routes[j].nexthop == delItems[i].nexthop) {
                          delItems.splice(i, 1);// 在数据库中存在该记录
                          i--;
                         break;
                      }
                    }
                    if (delItems.length <= 0) {
                      break;
                    }
                  }
                  if (delItems.length > 0) {
                      self.$message({
                        message: Vue.t('network.routerstaticNote1')+JSON.stringify(delItems),
                        type: "error"
                      });
                      self.$recordLog({
                        target:Vue.logTarget.staticlist,
                        level:{
                          en:"error",
                          zh_cn:"错误"
                        },
                        description:{
                          en:"Failed deleting static route table "+ self.routerName,
                          zh_cn:"删除" + self.routerName +"的静态路由表失败"
                        }
                      });
                      self.getData();
                      self.$refs.routerTable.clearSelection();
                  }
                  if (delItems.length < totalDel) {
                    self.$ajax({
                    type: "PUT",
                    url: "api/neutron/v2.0/routers/" + curRouteId,
                    // successMsg: "删除成功",
                    data: JSON.stringify(reqdata),
                    success: function(result) {
                      self.$notify({
                        message: Vue.t('network.deleteSuccess'),
                        type: "success"
                        });
                        self.getData();
                      },
                      errorKey: "NeutronError",
                      log:{
                        description:{
                          en:"Delete " + self.routerName +"’s Static Router List",
                          zh_cn:"删除" + self.routerName +"的静态路由表"
                        },
                        target:Vue.logTarget.staticlist
                      }
                    });
                  }
              },
              errorKey: "NeutronError"
            });
                setTimeout( function() {
                  self.loading = false;
                }, 2000)
              }
            }
          }).then(() => {
          }).catch(() => {
          });
        }.bind(this)
      }]
    }
  },
  watch: {
    columnsChecked: {
      handler: function (rows, oldVal) {
       this.columnsChecked = rows;
      },
      deep: true
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      var self = this;
      let data = [];
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/routers/"+this.router_Id,
          errorKey: "NeutronError"
        });
        let routes = [];
        routes = result["router"]["routes"];
        self.routerName = result["router"]["name"];
        for (let i = 0; i < routes.length; i++) {
          routes[i].id = (new Date().getTime()).toString() + i;
        }
        self.totalData = routes;
        self.$refs.dataTable.clearSelection();
      } catch (res) {
      }
    },
    getCurrentData(param) {
      this.staticRouterData = param;
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.dataTable.toggleRowSelection(row, false);
      // });
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.dataTable.toggleRowSelection(row);
    },
    handleAddShow() {
      this.addFlag = false;
      this.getData();
    },
    onRefresh() {
      this.$refs.dataTable.clearSelection();
      this.getData();
    }
  }
}
</script>