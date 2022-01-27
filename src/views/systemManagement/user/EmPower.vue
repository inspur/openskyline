<template>
  <div>
    <icos-page-header :title="$t('base.userEmpowerment')" :show-back="true" @back="handlePageHeaderBack" />
    <icos-page>
      <operation-panel
        class="margin-tb5"
        :select-rows="multipleSelection"
        :operation-menus="operationMenus">
      </operation-panel>
      <el-table
          ref="deTable"
          :data="tableData"
          :element-loading-text="$t('base.loadingData')"
          highlight-current-row
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
          <el-table-column
            prop="role_type"
            :label="$t('base.roleType')"
            align="left"
            min-width="100">
            <template slot-scope="scope">
              <span v-if="scope.row.role_type==0">{{$t('base.superAdmin')}}</span>
              <span v-if="scope.row.role_type==2">{{$t('base.projectAdmin')}}</span>
              <span v-if="scope.row.role_type==3">{{$t('base.projectUser')}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="project_name"
            :label="$t('base.project')"
            min-width="100">
            <template slot-scope="scope">
              <span>{{scope.row.role_type==0?"-":scope.row.project_name}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="role_name"
            :label="$t('base.role')"
            min-width="100">
          </el-table-column>
        </el-table>
        <div slot="footer" class="dialog-footer" style="text-align:center;margin-top:15px;">
          <el-button @click="confirmBtn">{{$t('base.back')}}</el-button>
        </div>
        <div class="divider clearfix"></div>
        <div style="text-align: left;">
          <h4 style="font-weight: 600;">{{$t('base.authorityDescription')}}:</h4>
          <div style="font-size:12px;">
              <div style="line-height: 26px;">
                {{$t('base.authorityDescription1')}}
              </div>
              <div style="line-height: 26px;">
                {{$t('base.authorityDescription2')}}
              </div>
              <div style="line-height: 26px;">
                {{$t('base.authorityDescription3')}}
              </div>
              <div style="line-height: 26px;">
                {{$t('base.authorityDescription4')}}
              </div>
            </div>
      </div>

      <add-power ref="addPower" v-if="addPowerFlg" :id="$route.params.id" :name="$route.params.name" @refresh="getData">
      </add-power>
    </icos-page>
  </div>
</template>
<script>
import AddPower from './AddPower'
export default {
  name:"empower",
  props:["id"],
  data() {
    return {
      tableData:[],
      multipleSelection:[],
      addPowerFlg:false,
      operationMenus:[{
        icon: "fa-plus-circle",
        name: this.$t('base.addPermission'),
        showflg: true,
        readOnly: true,
        handler: function() {
          let me = this;
          me.addPowerFlg = true;
          me.$nextTick(() => {
            me.$refs.addPower.show();
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('base.delete'),
        showflg: true,
        multi: true,
        enable: function(obj) {
          return !(Vue.userId==this.$route.params.id&&obj.role_type==0);
        }.bind(this),
        handler: function(selectedRows) {
          this.$confirm(Vue.t('base.deleteDataWarn'), this.$t('base.deleteConfirm'), {
            confirmButtonText: this.$t('base.confirm'),
            cancelButtonText: this.$t('base.cancel'),
            type: 'warning'
          }).then(() => {
            let me = this;
            let list = [];
            selectedRows.forEach((item, index) => {
              list.push(me.deleteData(item));
            })
            Promise.all(list).then(() => {
              me.$message.success(Vue.t('base.deleteSuccess'));
              me.getData();
            }, () => {
              me.getData();
            })
          });
        }.bind(this)
      }]
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/users/"+this.$route.params.id+"/roles"
      })
      this.$convertRoleLanguage(ret.assignments, "role_name")
      this.tableData = this.filter(ret.assignments);
      this.$nextTick(() => {
        this.$refs.deTable.clearSelection();
      });
    },
    async deleteData(item) {
      let me = this;
      let logEn = '';
      let logZhCn = '';
      if (item.role_type === 0) {
        logEn = `User: ${me.$route.params.name} Delete jurisdiction ${item.role_name} `;
        logZhCn = `用户：${me.$route.params.name} 删除权限，${item.role_name} `;
      } else {
        logEn = `User: ${me.$route.params.name} Delete jurisdiction: Project ${item.project_name}'s ${item.role_name} `;
        logZhCn = `用户：${me.$route.params.name} 删除权限，项目 ${item.project_name} 的 ${item.role_name} `;
      }
      await this.$ajax({
        type: 'post',
        url: "api/keystone/v3/assignments/users/"+me.$route.params.id+"/role/"+item.role_id,
        data:JSON.stringify({
          assignments:{
            "project_id":item.project_id,
            "user_role_id":item.id
          }
        }),
        async:false,
        log:{
          description:{
            en: logEn,
            zh_cn: logZhCn
          },
          target:Vue.logTarget.user
        }
      }).then(() => {
        return Promise.resolve()
      }).catch(() => {
        return Promise.reject()
      })
    },
    filter(arr) {
      return arr.filter((item, index) => {
        return item.is_group_role==0;
      })
    },
    confirmBtn() {
      this.$router.push({
        path: '/systemManagement/user'
      });
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handlePageHeaderBack() {
      window.history.go(-1);
    }
  },
  components:{
    AddPower
  }
}
</script>
