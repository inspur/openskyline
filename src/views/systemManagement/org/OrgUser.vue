<template>
  <div>
    <icos-page-header :title="$t('base.personnelManintenance')" :show-back="true" @back="handlePageHeaderBack" />
    <icos-page>
      <el-form :inline="true" :model="formInline" class="form-inline">
        <el-form-item :label="$t('base.accountNumber')">
          <el-input v-model="formInline.name" @blur="blurFun('name')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.email')">
          <el-input v-model="formInline.email" @blur="blurFun('email')"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon='fa-search' @click="getTableData" size="small">{{$t('base.query')}}</el-button>
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
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
          prop="name"
          :label="$t('base.accountNumber')"
          align="left"
          min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('email') >= 0"
          prop="email"
          align="left"
          :label="$t('base.email')"
          min-width="100">
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="getTableData(false)">
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
        <add-org-user ref="addOrgUser" v-if="addOrgUserFlg" :groupid="$route.params.id" :name="$route.params.name" @refreshData="getTableData"></add-org-user>
      </div>
    </icos-page>
</div>
</template>
<script>
import AddOrgUser from './AddOrgUser'
export default {
  name:"orgUser",
  data() {
    return {
      addOrgUserFlg:false,
      tableData:[],
      allData:[],
      loading:false,
      emptyText:Vue.t('base.noData'),
      formInline:{
        email:"",
        name:""
      },
      multipleSelection: [],
      columns: [{
        prop: "name",
        label: this.$t('base.accountNumber')
      }, {
        prop: "email",
        label: this.$t('base.email')
      }],
      columnsChecked:["name", "email"],
      operationMenus:[{
        icon: "fa-plus-circle",
        name: this.$t('base.addGroupUser'),
        showflg: true,
        readOnly: true,
        handler: function() {
          let me = this;
          me.addOrgUserFlg = true;
          me.$nextTick(() => {
            me.$refs.addOrgUser.show();
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('base.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return rowData.id!=Vue.userId;
        },
        handler: async function(selectedRows) {
          this.$confirm(Vue.t('base.deleteDataWarn'), this.$t('base.deleteConfirm'), {
            confirmButtonText:this.$t('base.confirm'),
            cancelButtonText:this.$t('base.cancel'),
            type:'warning'
          }).then(async () => {
            let me = this;
            let list = [];
            for (var i=0; i<selectedRows.length; i++) {
              list.push(me.deleteData(selectedRows[i]));
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
    this.getTableData()
  },
  methods: {
    async getTableData(flg=true) {
      this.loading = true;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/groups/"+this.$route.params.id+"/users"
      })
      this.allData = this.filter(ret.users);
      if (flg) {
        this.$nextTick(() => {
          this.$refs.deTable.clearSelection();
        });
      }
      this.loading = false;
    },
    deleteData(item) {
      let me = this;
      return new Promise((resolve) => {
        this.$ajax({
          type: 'delete',
          url: 'api/keystone/v3/groups/'+this.$route.params.id+'/users/'+item.id,
          log:{
            description:{
              en:"group("+this.$route.params.name+")delete user:"+item.name,
              zh_cn:"组("+this.$route.params.name+")删除人员:"+item.name
            },
            target:Vue.logTarget.group
          }
        }).then(() => {
          return resolve({})
        }, () => {
          return resolve({error:true})
        })
      })
    },
    filter(data) {
      let me = this;
      data.forEach((item, key) => {
        if (!item.email) {
          item.email = "";
        }
      })
      let d = data.filter((item, index) => {
        return item.name.indexOf(me.formInline.name)>-1&&item.email.indexOf(me.formInline.email)>-1;
      })
      return d;
    },
    getCurrentData(data) {
      this.tableData = data;
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    blurFun(key) {
      if (this.formInline[key].length>40) {
        this.formInline[key] = '';
        this.$notify({
          message:Vue.t('base.ultraLong'),
          type:'warning'
        });
      }
    },
    backFun() {
      this.$router.push({
        path: '/systemManagement/org'
      });
    },
    handlePageHeaderBack() {
      window.history.go(-1);
    }
  },
  components: {
    AddOrgUser
  }
}
</script>
