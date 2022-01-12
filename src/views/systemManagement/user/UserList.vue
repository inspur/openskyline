<template>
  <div>
    <icos-page-header :title="$t('base.userManagement')" />
    <icos-page>
      <el-row :gutter="10">          
          <el-col :span="isLdap?24:19" :offset="0">
            <el-form :inline="true" :model="formInline" class="form-inline">
              <el-form-item :label="$t('base.accountNumber')">
                <el-input v-model="formInline.name" @blur="blurFun('name')"></el-input>
              </el-form-item>
              <el-form-item :label="$t('base.email')" v-if="!infoEncrypt">
                <el-input v-model="formInline.email" @blur="blurFun('email')"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon='fa-search' size="small" @click="onQuery">{{$t('base.query')}}</el-button>
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
              v-loading="tableLoading"
              :element-loading-text="$t('base.loadingData')"
              highlight-current-row
              style="width: 100%"
              row-key="id"
              :default-sort="{prop:'name',order:'ascending'}"
              @sort-change="sortChange"
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
                :sortable="sortValue"
                min-width="100">
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('status') >= 0"
                prop="enabled"
                align="left"
                :label="$t('base.status')"
                min-width="100">
                <template slot-scope="scope">
                  <span>{{scope.row.enabled==1?$t('base.enable'):$t('base.disable')}}</span>
                </template>
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('locked') >= 0"
                prop="lock"
                align="left"
                :label="$t('base.locking')"
                min-width="100">
                <template slot-scope="scope">
                  <span>{{scope.row.lock?$t('base.yes'):$t('base.no')}}</span>
                </template>
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('email') >= 0"
                prop="email"
                :label="$t('base.email')"
                min-width="100">
              </el-table-column>S
              <el-table-column v-if="columnsChecked.indexOf('desc') >= 0"
                prop="description"
                :label="$t('base.desc')"
                min-width="160">
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('expired_date') >= 0"
                :label="$t('base.EXPIRED_DATE')"
                min-width="100">
                <template slot-scope="scope">
                  {{ scope.row.expired_date }}
                </template>
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
                  <el-pagination
                    class="right"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="currentPage"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
                  </el-pagination>
                </el-col>
              </el-row>
            </div>
          </el-col>
      </el-row>

      <edit-user ref="editUser" v-if="editUserFlg" :id="editId" @refreshData="getTableData">
      </edit-user>

      <motify-password ref="motifyPassword" @close="motifyPasswordFlg = false" v-if="motifyPasswordFlg" :id="editId">
      </motify-password>

      <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>

      <check-password ref="checkPassword" />

      <transition name="slide-right" mode="out-in">
      <div style="width: 700px;" class="slide-panel" v-if="viewPowerFlg">
        <panel style="height: 100%">
          <div slot="title" class="clearfix" >
            <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('base.back')}}</el-button>
          </div>
          <view-power ref="viewPower" :id="editId"></view-power>
        </panel>
      </div>
      </transition>
    </icos-page>
  </div>
</template>
<script>
import moment from 'moment';
import EditUser from './EditUser';
import MotifyPassword from './MotifyPassword';
import ViewPower from './ViewPower';
import CheckPassword from '../../topDialog/CheckPassword';
export default {
  name:"project",
  watch:{
    multipleSelection:function (arr) {
      this.editId = arr.length==0?"":arr[0].id;
    }
  },
  data() {
    return {
      isLdap:Vue.isLdap,
      infoEncrypt: false,
      sortValue:"custom",
      editUserFlg:false,
      motifyPasswordFlg:false,
      roleType:"3",
      projectValue:"0",
      viewPowerFlg:false,
      proList:[],
      setting: {
        check : {
          enable : false
        },
        data : {
          simpleData : {
            enable : true
          },
          key:{
            name:"name"
          }
        },
        callback: {
          onClick: this.onTreeNodeClick
        }
      },
      treeData: [],
      tableData:[],
      editId:"",
      desc:"asc",
      field:"name",
      treeLoading:false,
      tableLoading:false,
      selProjectFlg:false,
      emptyText: Vue.t('base.noData'),
      formInline:{
        deptName:"",
        role_type:"",
        project_id:"",
        projectName:"",
        name:"",
        alias:"",
        email:"",
        phone:""
      },
      multipleSelection: [],
      currentPage:1,
      pageSize: 10,
      total: 0,
      columns: [{
        prop: "name",
        label: this.$t('base.accountNumber')
      }, {
        prop: "status",
        label: this.$t('base.status')
      }, {
        prop: "dept",
        label: this.$t('base.department')
      }, {
        prop: "locked",
        label: this.$t('base.locking')
      }, {
        prop: "email",
        label: this.$t('base.email')
      }, {
        prop: "phone",
        label: this.$t('base.telephone')
      }, {
        prop: "alias",
        label: this.$t('base.fullName')
      }, {
        prop: "desc",
        label: this.$t('base.desc')
      }, {
        prop: "expired_date",
        label: this.$t('base.EXPIRED_DATE')
      }],
      columnsChecked:["name", "status", "dept", "alias", "locked", "email", "phone", "desc"],
      operationMenus:[{
        icon: "fa-plus-circle",
        name: this.$t('base.addUser'),
        showflg: Vue.AuthList["m.systemmanage.usermanage.add"],
        readOnly: true,
        enable:function () {
          return !this.isLdap;
        }.bind(this),
        handler: function() {
          this.$router.push({
            path: '/systemManagement/user/addUser'
          });
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: this.$t('base.edit'),
        showflg: Vue.AuthList["m.systemmanage.usermanage.edit"],
        multi: false,
        enable:function (rowData) {
          return !this.isLdap;
        }.bind(this),
        handler: function(selectedRows) {
          this.editUserFlg = true;
          this.$nextTick(() => {
            this.$refs.editUser.show();
          });
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: this.$t('base.userEmpowerment'),
        showflg: Vue.AuthList["m.systemmanage.usermanage.assignrole"],
        multi: false,
        enable(obj) {
          return true;
        },
        handler: function(selectedRows) {
          this.$router.push({
            path: '/systemManagement/user/emPower/'+this.multipleSelection[0].id+"/"+this.multipleSelection[0].name
          });
        }.bind(this)
      }, {
        icon: "fa-eye",
        name: Vue.t('base.permissionDetail'),
        showflg: Vue.AuthList["m.systemmanage.usermanage.userroledetail"],
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          this.viewPowerFlg = true;
          this.$nextTick(() => {
            this.$refs.viewPower.getData();
          })
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: this.$t('base.resetPassword'),
        showflg: Vue.AuthList["m.systemmanage.usermanage.resetpassword"],
        multi: false,
        enable:function (obj) {
          return !this.isLdap&&obj.id!=Vue.userId;
        }.bind(this),
        handler: function(selectedRows) {
          let me = this;
          me.motifyPasswordFlg = true;
          me.$nextTick(() => {
            me.$refs.motifyPassword.show(selectedRows[0].name);
          });
        }.bind(this)
      }, {
        icon: "fa-check",
        name: this.$t('base.enable'),
        showflg: Vue.AuthList["m.systemmanage.usermanage.enable"],
        multi: false,
        enable:function (obj) {
          return !this.isLdap&&obj.enabled!=1;
        }.bind(this),
        handler: function(selectedRows) {
          let me = this;
          let ret = this.$ajax({
            type: 'patch',
            url: "api/keystone/v3/users/"+selectedRows[0].id,
            data:JSON.stringify({
              user:{
                "enabled": true
              }
            }),
            successMsg:Vue.t('base.enableSuccess'),
            successFun() {
              me.getTableData();
            },
            log:{
              description:{
                en:"enabled user("+selectedRows[0].name+")",
                zh_cn:"启用用户("+selectedRows[0].name+")"
              },
              target:Vue.logTarget.user
            }
          })
        }.bind(this)
      }, {
        icon: "fa-ban",
        name: this.$t('base.disable'),
        showflg: Vue.AuthList["m.systemmanage.usermanage.disable"],
        multi: false,
        enable:function (obj) {
          return !this.isLdap&&obj.enabled==1&&obj.id!=Vue.userId;
        }.bind(this),
        handler: function(selectedRows) {
          let me = this;
          this.$confirm(Vue.t('base.disableWarn'), Vue.t('base.prompt'), {
            confirmButtonText:this.$t('base.confirm'),
            cancelButtonText:this.$t('base.cancel'),
            type:'warning'
          }).then(() => {
            let ret = this.$ajax({
              type: 'patch',
              url: "api/keystone/v3/users/"+selectedRows[0].id,
              data:JSON.stringify({
                user:{
                  "enabled": false
                }
              }),
              successMsg:Vue.t('base.disableSuccess'),
              successFun() {
                me.getTableData();
              },
              log:{
                description:{
                  en:"disable user("+selectedRows[0].name+")",
                  zh_cn:"禁用用户("+selectedRows[0].name+")"
                },
                target:Vue.logTarget.user
              }
            })
          });
        }.bind(this)
      }, {
        icon: "fa-unlock",
        name: this.$t('base.unlock'),
        showflg: Vue.AuthList["m.systemmanage.usermanage.unlock"],
        multi: false,
        enable:function (obj) {
          return !this.isLdap&&obj.lock;
        }.bind(this),
        handler: function(selectedRows) {
          let me = this;
          let ret = this.$ajax({
            type: 'patch',
            url: "api/keystone/v3/users/"+selectedRows[0].id,
            data:JSON.stringify({
              user:{
                "name": selectedRows[0].name
              }
            }),
            successMsg:this.$t('base.unlockSuccess'),
            successFun() {
              me.getTableData();
            },
            log:{
              description:{
                en:"unlock user("+selectedRows[0].name+")",
                zh_cn:"解锁用户("+selectedRows[0].name+")"
              },
              target:Vue.logTarget.user
            }
          })
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('base.delete'),
        showflg: Vue.AuthList["m.systemmanage.usermanage.delete"],
        multi: true,
        enable:function (obj) {
          return !this.isLdap&&obj.id!=Vue.userId&&obj.name!='admin';
        }.bind(this),
        handler: async function(selectedRows) {
          let me = this;
          me.$confirm(Vue.t('base.deleteDataWarn'), Vue.t('base.prompt'), {
            confirmButtonText: Vue.t('base.confirm'),
            cancelButtonText: Vue.t('base.cancel'),
            type: 'warning'
          }).then(async () => {
            if (Vue.forceCheckCurrentUser) {
              me.$refs.checkPassword.show(() => {
                me.deleteUsers(selectedRows);
              });
            } else {
              me.deleteUsers(selectedRows);
            }
          });
        }.bind(this)
      }],
      close:""
    }
  },
  mounted() {
    this.setLdapConfig();
    // this.getTreeData();
    // this.loadPasswordConf();
  },
  methods: {
    async getTreeData(id) {
      this.treeLoading = true;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/departments"
      })
      var arr = ret.departments;
      arr.forEach(function(item, key) {
        item.pId = item.parent_id?item.parent_id:"default";
        item.icon = './static/img/ztree/department.png';
      });
      arr.unshift({id:"default", name:Vue.t('base.all'), icon:"./static/img/ztree/department.png"});
      this.treeData = arr;

      this.$nextTick(() => {
        let node = null;
        if (!id) {
          node = this.$refs.deZtree.action('getNodesByParam', "level", 0)[0];
        } else {
          node = this.$refs.deZtree.action('getNodesByParam', "id", id)[0];
        }
        this.selectNode = node;
        this.$refs.deZtree.action("selectNode", node);
        this.$refs.deZtree.action("expandNode", node);
        this.treeLoading = false;
      });
    },
    async setLdapConfig() {
      if (this.isLdap) {
        this.operationMenus[0].showflg = false;
        this.operationMenus[1].showflg = false;
        this.operationMenus[4].showflg = false;
        this.operationMenus[5].showflg = false;
        this.operationMenus[6].showflg = false;
        this.operationMenus[7].showflg = false;
        this.operationMenus[8].showflg = false;
        this.sortValue = this.isLdap?false:"custom";
      }
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.formInline.project_id = id;
      this.formInline.projectName = name;
      this.close = "close";
    },
    onQuery() {
      this.getTableData();
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    async getTableData(flg=true) {
      this.tableLoading = true;
      var param = {dir:this.order, field:this.field, limit:this.pageSize, page:this.currentPage, domain_id:"default"};
      if (this.formInline.role_type) {
        param.role_type = this.formInline.role_type;
      }
      if (this.formInline.name!="") {
        param["name"] = this.formInline.name;
      }
      if (this.formInline.alias!="") {
        param["alias"] = this.formInline.alias;
      }
      if (this.formInline.email!="") {
        param["email"] = this.formInline.email;
      }
      if (this.formInline.phone!="") {
        param["phone"] = this.formInline.phone;
      }
      if (this.formInline.role_type!=0&&this.formInline.project_id) {
        param.project_id = this.formInline.project_id;
      }
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/users?"+ $.param(param)
      })
      ret.users.map(item => {
        if (!('expired_date' in item) || item.expired_date === null || item.expired_date === '') {
          item.expired_date = '-';
        } else {
          item.expired_date = moment(item.expired_date - (new Date().getTimezoneOffset()) * 60 * 1000).format('YYYY-MM-DD');
        }
      })
      this.tableData = ret.users;
      this.total = ret.total;
      if (flg) {
        this.$nextTick(() => {
          this.$refs.deTable.clearSelection();
        });
      }
      this.tableLoading = false;
    },
    async roleChange() {
      this.getTableData();
    },
    proChange() {
      this.getTableData();
    },
    onTreeNodeClick() {
      this.getTableData();
    },
    sortChange(obj) {
      if (!obj.prop) { return; }
      this.order = obj.order=="ascending"?"asc":"desc";
      this.field = obj.prop;
      this.getTableData();
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTableData(false);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getTableData(false);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      if (val.length!=1) {
        this.viewPowerFlg = false;
      }
    },
    onIconClick() {
      this.formInline.projectName = '';
      this.formInline.project_id = '';
      this.close = "";
    },
    onBack() {
      this.viewPowerFlg = false;
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
    loadPasswordConf() {  // 加载密码策略，如果目前信息是加密的，则不能根据邮箱和电话过滤用户
      const $this = this;
      $this.$ajax({
        type: 'get',
        url: 'api/keystone/v3/system/config/file-conf',
        successFun(data) {
          if ('info_encrypt' in data) {
            $this.infoEncrypt = data.info_encrypt;
          }
        }
      })
    },
    handleValidPasswordClose() {
      this.loading = false;
      this.btnFlg = false;
      this.validPasswordDialog.visible = false;
    },
    handleValidPasswordConfirm() {
      this.validPasswordDialog.visible = false;
      this.addUser();
    },
    async deleteUsers(users) {
      let me = this;
      let ret = await me.$sequence({
        type: 'DELETE',
        url: "api/keystone/v3/users/{id}",
        params: users,
        log:{
          description:{
            en:"delete user",
            zh_cn:"删除用户"
          },
          target:Vue.logTarget.user,
          key:"name"
        }
      }).then(() => {
        me.$message.success(Vue.t('base.deleteSuccess'));
        me.getTableData();
      }).catch(() => {
        me.getTableData();
      })
    }
  },
  components: {
    EditUser,
    MotifyPassword,
    ViewPower,
    CheckPassword
  }
}
</script>
