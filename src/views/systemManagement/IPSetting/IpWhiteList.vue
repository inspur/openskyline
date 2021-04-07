<template>
<div>
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
    border
    stripe
    style="width: 100%"
    row-key="id"
    @row-click="rowClick"
    @selection-change="handleSelectionChange">
    <el-table-column
      reserve-selection
      type="selection"
      align="center"
      width="55">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('ipAddress') >= 0"
      prop="ip"
      :label="$t('base.ipAddress')"
      align="left"
      min-width="100">
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="getTableData">
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

  <add-white-ip ref="addWhiteIP" v-if="addWhiteFlg" @refreshData="getTableData"></add-white-ip>
</div>
</template>
<script>
import AddWhiteIp from './AddWhiteIP'
export default {
  name:"ipWhiteList",
  data() {
    return {
      addWhiteFlg:false,
      tableData:[],
      allData:[],
      loading:false,
      emptyText: Vue.t('base.noData'),
      multipleSelection: [],
      columns: [{
        prop: "ipAddress",
        label: this.$t('base.ipAddress')
      }],
      columnsChecked:["ipAddress"],
      operationMenus:[{
        icon: "fa-plus-circle",
        name: this.$t('base.add'),
        showflg: Vue.AuthList["m.systemmanage.ipsetting.add"],
        readOnly: true,
        handler: function() {
          let me = this;
          me.addWhiteFlg = true;
          me.$nextTick(() => {
            me.$refs.addWhiteIP.show("add");
          });
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: this.$t('base.edit'),
        showflg: Vue.AuthList["m.systemmanage.ipsetting.edit"],
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          let me = this;
          me.addWhiteFlg = true;
          me.$nextTick(() => {
            me.$refs.addWhiteIP.show("edit", selectedRows[0].ip, selectedRows[0].id);
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('base.delete'),
        showflg: Vue.AuthList["m.systemmanage.ipsetting.delete"],
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: async function(selectedRows) {
          let me = this;
          this.$confirm(Vue.t('base.deleteIpRuleWarn'), this.$t('base.deleteConfirm'), {
            confirmButtonText: this.$t('base.confirm'),
            cancelButtonText: this.$t('base.cancel'),
            type: 'warning'
          }).then(() => {
            if (selectedRows.length==me.allData.length) { //选择全部，一次性删除
              this.$ajax({
                type: 'delete',
                url: "api/keystone/v3/inspur/system/ipwhitelist/delete/all",
                log:{
                  description:{
                    en:"add all white ips",
                    zh_cn:"删除所有白名单"
                  },
                  target:Vue.logTarget.ipSetting
                },
                successMsg:Vue.t('base.deleteSuccess'),
                successFun() {
                  me.getTableData();
                }
              });
            } else {
              let list = [];
              selectedRows.forEach((item, index) => {
                list.push(me.deleteData(item.id, item.ip));
              })
              Promise.all(list).then((data) => {
                let flg = false;
                if (data&&data.length>0) {
                  flg = data.some(function (item, index) {
                    if (item) {
                      return item.hasOwnProperty('error')
                    } else {
                      return false;
                    }
                  })
                }
                if (flg) {
                  me.getTableData();
                } else {
                  me.$message.success(Vue.t('base.deleteSuccess'));
                  me.getTableData();
                }
              })
            }
          });
        }.bind(this)
      }]
    }
  },
  mounted() {
    this.getTableData();
  },
  methods: {
    async getTableData(flg=true) {
      this.loading = true;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/system/ipwhitelist"
      })
      this.allData = ret;
      if (flg) {
        this.$nextTick(() => {
          this.$refs.deTable.clearSelection();
        });
      }
      this.loading = false;
    },
    deleteData(id, ip) {
      return new Promise((resolve) => {
        this.$ajax({
          type: 'delete',
          url: "api/keystone/v3/inspur/system/ipwhitelist/"+id,
          data:JSON.stringify({}),
          log:{
            description:{
              en:"delete white ip("+ip+")",
              zh_cn:"删除白名单("+ip+")"
            },
            target:Vue.logTarget.ipSetting
          }
        }).then(() => {
          return resolve({})
        }, () => {
          return resolve({error:true})
        })
      })
    },
    getCurrentData(data) {
      this.tableData = data;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    }
  },
  components: {
    AddWhiteIp
  }
}
</script>
