<template>
  <div>
    <icos-page-header :title="$t('base.groupManagement')" />
    <icos-page>
      <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" @search="handleSearch" />
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
        style="width: 100%"
        row-key="id"
        :default-sort="{prop:'name'}"
        @row-click="rowClick"
        @sort-change="sortChange"
        @selection-change="handleSelectionChange">
        <el-table-column
          reserve-selection
          type="selection"
          align="center"
          width="55">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
          prop="name"
          :label="$t('base.name')"
          align="left"
          sortable="custom"
          min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('desc') >= 0"
          prop="description"
          align="left"
          :label="$t('base.desc')"
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
                  <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                  </el-checkbox>
                </el-checkbox-group>
                <div slot="reference" style="display: inline-block;">
                  <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
                </div>
              </el-popover>
          </el-col>
          <el-col :span="19">
            <page ref="page" :totalData="allData" :sortObj="sortObj" @getCurrentData="getCurrentData"></page>
          </el-col>
        </el-row>
      </div>

      <create-org v-if="createOrgFlg" ref="createOrg" @refreshData="getTableData"></create-org>

      <edit-org v-if="editOrgFlg" ref="editOrg" @refreshData="getTableData"></edit-org>
    </icos-page>
  </div>
</template>
<script>
import CreateOrg from './CreateOrg'
import EditOrg from './EditOrg'
export default {
  name:"orgList",
  data() {
    return {
      isLdap:false,
      createOrgFlg:false,
      editOrgFlg:false,
      tableData:[],
      allData:[],
      loading:false,
      emptyText: Vue.t('base.noData'),
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      multipleSelection: [],
      columns: [{
        prop: "name",
        label: this.$t('base.name')
      }, {
        prop: "desc",
        label: this.$t('base.desc')
      }],
      columnsChecked:["name", "desc"],
      operationMenus:[{
        icon: "fa-plus-circle",
        name: this.$t('base.newGroup'),
        showflg: Vue.AuthList["m.systemmanage.groupmanage.add"],
        readOnly: true,
        enable:function (rowData) {
          return !this.isLdap;
        }.bind(this),
        handler: function() {
          let me = this;
          me.createOrgFlg = true;
          me.$nextTick(() => {
            me.$refs.createOrg.show();
          });
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: this.$t('base.edit'),
        showflg: Vue.AuthList["m.systemmanage.groupmanage.edit"],
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          let me = this;
          me.editOrgFlg = true;
          me.$nextTick(() => {
            me.$refs.editOrg.show(selectedRows[0]);
          });
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: this.$t('base.groupEmpowerment'),
        showflg: Vue.AuthList["m.systemmanage.groupmanage.assignrole"],
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          this.$router.push({
            path: '/systemManagement/org/orgPower/'+selectedRows[0].id+"/"+selectedRows[0].domianid+"/"+selectedRows[0].name
          });
        }.bind(this)
      }, {
        icon: "fa-user-plus",
        name: this.$t('base.personnelManintenance'),
        showflg: Vue.AuthList["m.systemmanage.groupmanage.personmanage"],
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          this.$router.push({
            path: '/systemManagement/org/orgUser/'+selectedRows[0].id+"/"+selectedRows[0].name
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('base.delete'),
        showflg: Vue.AuthList["m.systemmanage.groupmanage.delete"],
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          let me = this;
          this.$confirm(Vue.t('base.deleteGroupWarn'), this.$t('base.deleteConfirm'), {
            confirmButtonText:this.$t('base.confirm'),
            cancelButtonText:this.$t('base.cancel'),
            type:'warning'
          }).then(async () => {
            let list = [];
            for (var i=0; i<selectedRows.length; i++) {
              let item = selectedRows[i];
              let flg = false;
              //如果里面有当前登陆人且该组拥有超级管理员权限,则不能删除
              let pret = await this.$ajax({
                type: 'get',
                url: "api/keystone/v3/inspur/assignments/groups/"+item.id+"/roles"
              })
              flg = pret.assignments.some((item1, index1) => {
                return item1.role_type==0;
              })
              if (flg) { //如果有超级管理员权限
                let ret = await this.$ajax({
                  type: 'get',
                  url: "api/keystone/v3/groups/"+item.id+"/users"
                })
                flg = ret.users.some((item, index) => {
                  return item.id==Vue.userId
                });
              }
              if (!flg) { //如果能删除
                list.push(me.deleteData(item));
              } else {
                this.$message({
                  message: Vue.t('base.deleteGroupStop')+"("+item.name+")",
                  type: "warning"
                });
              }
            }
            if (list.length>0) {
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
                  this.getTableData();
                } else {
                  this.$message.success(Vue.t('base.deleteSuccess'));
                  this.getTableData();
                }
              })
            }
          });
        }.bind(this)
      }],
      searchBar: {
        conditions: {
          name: {
            label: this.$t('base.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          }
        },
        validatedParams: {}
      }
    }
  },
  mounted() {
    this.getTableData();
    this.getLdapConfig();
  },
  methods: {
    deleteData(item) {
      return new Promise((resolve) => {
        this.$ajax({
          type: 'DELETE',
          url: "api/keystone/v3/inspur/groups/"+item.id
        }).then(() => {
          return resolve({})
        }, () => {
          return resolve({error:true})
        })
      })
    },
    async getLdapConfig() {
      // let ret = await this.$ajax({
      //   type: 'get',
      //   url: "api/keystone/v3/domains/config/default"
      // })
      //this.isLdap = ret.config.identity.driver=='ldap';
      this.isLdap = Vue.isLdap;
      this.operationMenus[0].readOnly = !this.isLdap;
    },
    async getTableData(flg=true) {
      this.loading = true;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/groups?"+ $.param({})
      })
      this.allData = this.filter(ret.groups);
      if (flg) {
        this.$nextTick(() => {
          this.$refs.deTable.clearSelection();
        });
      }
      this.loading = false;
    },
    getCurrentData(data) {
      this.tableData = data;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    filter(data) {
      let me = this;
      let d = data.filter((item, index) => {
        let name = '';
        if (me.searchBar.validatedParams.name) {
          name = me.searchBar.validatedParams.name;
        }
        return item.name.toLowerCase().indexOf(name.toLowerCase())>-1;
      })
      return d;
    },
    sortChange(obj) {
      if (!obj.prop) { return; }
      this.sortObj = {
        sortOrder:obj.order,
        sortField:obj.prop
      };
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.getTableData();
    }
  },
  components: {
    CreateOrg,
    EditOrg
  }
}
</script>
