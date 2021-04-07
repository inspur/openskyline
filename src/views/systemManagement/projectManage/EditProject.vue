<template>
  <div>
  <el-dialog :title="title" :visible.sync="visible" class="sys-edit-project-dialog">
    <el-tabs v-model="activeName" v-loading="loading" :element-loading-text="$t('base.sendingData')" @tab-click="tabClick">
      <el-tab-pane :label="$t('base.projectMembers')" name="second">
        <div>
          {{$t('base.authorityDescription')}}
          <el-tooltip effect="dark">
            <div slot="content" v-html="message"></div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card>
              <div slot="header" class="clearfix">
                <span>{{$t('base.allUser')}}</span>
                <el-input v-model="input1" size="small" style="float:right;width:65%;position:relative;top:-4px;" :readonly="selValue1==0" @focus="getDeptFun('input1', 'selValue1')">
                  <el-select v-model="selValue1" slot="prepend" size="small" @change="input1=''" style="width:80px;">
                    <el-option :label="$t('base.accountNumber')" value="1"></el-option>
                    <el-option :label="$t('base.department')" value="0"></el-option>
                  </el-select>
                  <el-button slot="append" icon="search" size="small" @click="lproMemSearch"></el-button>
                </el-input>
              </div>
              <div style="height: 290px;overflow: auto;">
                <template v-for="item in projectUsers">
                  <div class="alluser1" :title="item.name" v-if="item.show!==false">
                    <div :style="style2">{{item.name}}</div>
                    <el-button style="position:absolute;right:0px;top:2px;" type="primary" :uid="item.id" icon="plus" size="small" @click="memberPlusFun"></el-button>
                  </div>
                </template>
                <div :style="style0" v-if="currentPage*50<total" @click="getMoreUsers"><a>{{$t('base.lookMore')}}</a></div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <div slot="header" class="clearfix">
                <span>{{$t('base.projectMembers')}}</span>
                <el-input v-model="input2" size="small" style="float:right;width:65%;position:relative;top:-4px;" :readonly="selValue2==0" @focus="getDeptFun('input2', 'selValue2')">
                  <el-select v-model="selValue2" slot="prepend" size="small" @change="input2=''" style="width:80px;">
                    <el-option :label="$t('base.accountNumber')" value="1"></el-option>
                    <el-option :label="$t('base.department')" value="0"></el-option>
                  </el-select>
                  <el-button slot="append" icon="search" size="small" @click="rproMemSearch"></el-button>
                </el-input>
              </div>
              <div style="height: 290px;overflow: auto;">
                <template v-for="item in projectMembers">
                  <div class="alluser1" v-if="item.show!==false">
                    <el-tooltip placement="top">
                      <div slot="content">
                        <span>{{$t('base.haveRoles')}}:</span>
                        <template v-for="role in item.roles"><span>{{role.role_name+";"}}</span></template>
                      </div>
                      <div :style="style3" :title="item.name"><i v-if="item.roles[0].role_type==2" class="el-icon-fa-user" style="margin-right: 5px;"></i>{{item.name}}</div>
                    </el-tooltip>
                    <el-button type="primary" :uid="item.id" icon="minus" size="small" v-if="userId!=item.id" style="position:absolute;right:0px;top:2px;" @click="memberMinusFun"></el-button>
                    <el-button type="primary" :uid="item.id" icon="setting" @click="userSetRole" v-if="userId!=item.id" :title="$t('base.roleSetting')" size="small" style="position:absolute;right:40px;top:2px;"></el-button>
                  </div>
                </template>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane :label="$t('base.group')" name="third" v-if="!isLdap">
        <div>
          {{$t('base.authorityDescription')}}
          <el-tooltip effect="dark">
            <div slot="content" v-html="message"></div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card>
              <div slot="header" class="clearfix">
                <span>{{$t('base.allGroup')}}</span>
                </el-input>
                <el-input v-model="input3" size="small" style="float:right;width:65%;position:relative;top:-4px;">
                  <el-button slot="append" icon="search" size="small" @click="lproGroupSearch"></el-button>
                </el-input>
              </div>
              <div style="height: 290px;overflow: auto;">
                <template v-for="item in groups">
                  <div class="alluser1" :title="item.name" v-if="item.show||item.eshow">
                    <div :style="style2">{{item.name}}</div>
                    <el-button style="position:absolute;right:0px;top:2px;" type="primary" :uid="item.id" icon="plus" size="small" @click="groupPlusFun"></el-button>
                  </div>
                </template>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <div slot="header" class="clearfix">
                <span>{{$t('base.group')}}</span>
                <el-tooltip effect="dark" :content="groupMessage">
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
                <el-input v-model="input4" size="small" style="float:right;width:65%;position:relative;top:-4px;">
                  <el-button slot="append" icon="search" size="small" @click="rproGroupSearch"></el-button>
                </el-input>
              </div>
              <div style="height: 290px;overflow: auto;">
                <template v-for="item in projectGroups">
                  <div class="alluser1" v-if="item.show||item.eshow">
                    <el-tooltip placement="top">
                      <div slot="content">
                        <span>{{$t('base.group')}}:</span>
                        <template v-for="role in item.roles"><span>{{role.role_name+";"}}</span></template>
                      </div>
                      <div :style="style3" :title="item.name"><i v-if="item.roles[0].role_type==2" class="el-icon-fa-user" style="margin-right: 5px;"></i>{{item.name}}</div>
                    </el-tooltip>
                    <el-button type="primary" :uid="item.id" v-if="!item.hasOwer" icon="minus" size="small" style="position:absolute;right:0px;top:2px;" @click="groupMinusFun"></el-button>
                    <el-button type="primary" :uid="item.id" v-if="!item.hasOwer" icon="setting" @click="groupSetRole1" :title="$t('base.roleSetting')" size="small" style="position:absolute;right:40px;top:2px;"></el-button>
                  </div>
                </template>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="btnFlg" @click="visible=false">{{$t('base.cancel')}}</el-button>
      <el-button :disabled="btnFlg" type="primary" @click="confirmProjectFun">{{$t('base.confirm')}}</el-button>
    </div>
 </el-dialog>
 <el-dialog :title="$t('base.roleSetting')" :visible.sync="roleSettingFlg">
    <el-form ref="roleSetForm" label-width="120px" label-position="left" :model="roleSet" :rules="roleSetRule">
      <el-form-item :label="$t('base.roleType')">
        <el-select v-model="roleSet.roleType" style="width:500px;" @change="roleTypeChange">
          <el-option :label="$t('base.projectAdmin')" :value="2"></el-option>
          <el-option :label="$t('base.projectUser')" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('base.role')" v-if="roleSet.roleType==2" prop="roleValue1">
        <el-select v-model="roleSet.roleValue1" multiple style="width:500px;">
          <el-option v-for="item in roleList" :key="item.role_id" :value="item.role_id" :label="item.role_name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('base.role')" v-if="roleSet.roleType==3" prop="roleValue2">
        <el-select v-model="roleSet.roleValue2" multiple style="width:500px;">
          <el-option v-for="item in roleList" :key="item.role_id" :value="item.role_id" :label="item.role_name"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="roleSettingFlg=false">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="roleSettingFun">{{$t('base.confirm')}}</el-button>
    </div>
  </el-dialog>
  <el-dialog :title="$t('base.roleSetting')" :visible.sync="roleSettingFlg1">
    <el-form ref="roleSetForm1" label-width="120px" label-position="left" :model="roleSet1" :rules="roleSetRule1">
      <el-form-item :label="$t('base.roleType')">
        <el-select v-model="roleSet1.roleType" style="width:500px;" @change="roleTypeChange1">
          <el-option :label="$t('base.projectAdmin')" :value="2"></el-option>
          <el-option :label="$t('base.projectUser')" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('base.role')" v-if="roleSet1.roleType==2" prop="roleValue1">
        <el-select v-model="roleSet1.roleValue1" style="width:500px;" size="small">
          <el-option v-for="item in roleList1" :key="item.role_id" :value="item.role_id" :label="item.role_name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('base.role')" v-if="roleSet1.roleType==3" prop="roleValue2">
        <el-select v-model="roleSet1.roleValue2" style="width:500px;" size="small">
          <el-option v-for="item in roleList1" :key="item.role_id" :value="item.role_id" :label="item.role_name"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="roleSettingFlg1=false">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="roleSettingFun1">{{$t('base.confirm')}}</el-button>
    </div>
  </el-dialog>
  <el-dialog :title="$t('base.selectDepartment')" :visible.sync="getDeptFlg">
    <el-card>
      <ztree
        ref="deZtree"
        :data="treeData"
        :setting="setting"
        style="position: relative; min-height: 300px;max-height: 400px;"
        ></ztree>
      <h2 style="text-align: center; min-height: 300px;" v-if="!treeData || treeData.length<0">{{emptyText}}</h2>
    </el-card>
    <div slot="footer" class="dialog-footer">
      <el-button @click="getDeptFlg=false">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="confirmDeptFun">{{$t('base.confirm')}}</el-button>
    </div>
 </el-dialog>
  </div>
</template>
<script>
export default {
  name:"editProject",
  props:["name"],
  data() {
    return {
      isLdap:Vue.isLdap,
      userId:Vue.userId,
      currentPage:1,
      total:0,
      id:this.$cookie.get("pid"),
      visible:false,
      treeData:[],
      roleSettingFlg:false,
      roleSettingFlg1:false,
      getDeptFlg:false,
      loading:false,
      projectUsers:[],
      projectMembers:[],
      groups:[],
      projectGroups:[],
      projectMemFlg:false,
      projectGroupFlg:false,
      selValue1:'1',
      selValue2:'1',
      input1:'',
      input2:"",
      input3:'',
      input4:"",
      operateId:"",
      searchKey:"",
      roleSet:{
        roleType:"2",
        roleValue1:[],
        roleValue2:[]
      },
      roleList:[],

      roleSet1:{
        roleType:"2",
        roleValue1:[],
        roleValue2:[]
      },
      roleList1:[],

      activeName:"",
      title:Vue.t('base.editProject'),
      btnFlg:false,
      roleSetRule:{
        roleValue1:[{required:true, message:Vue.t('base.selectRole'), trigger:'change', type:'array'}],
        roleValue2:[{required:true, message:Vue.t('base.selectRole'), trigger:'change', type:'array'}]
      },

      roleSetRule1:{
        roleValue1:[{required:true, message:Vue.t('base.selectRole'), trigger:'change'}],
        roleValue2:[{required:true, message:Vue.t('base.selectRole'), trigger:'change'}]
      },

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
      style0:{
        height:'34px',
        lineHeight:'34px',
        position: 'relative',
        textAlign:'center',
        color: '#3372a9',
        cursor: 'pointer'
      },
      style1:{
        height:'34px',
        lineHeight:'34px',
        position: 'relative'
      },
      style2:{
        overflow:'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all',
        paddingRight:'40px'
      },
      style3:{
        overflow:'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all',
        paddingRight:'80px'
      },
      message:[
        '<div style="line-height: 26px;">',
          Vue.t('base.authorityDescription1'),
        '</div>',
        '<div style="line-height: 26px;">',
          Vue.t('base.authorityDescription2'),
        '</div>',
        '<div style="line-height: 26px;">',
          Vue.t('base.authorityDescription3'),
        '</div>',
        '<div style="line-height: 26px;">',
          Vue.t('base.authorityDescription4'),
        '</div>'
      ].join(''),
      groupMessage:Vue.t('base.projectGroupSetPrompt')
    }
  },
  mounted() {
  },
  methods:{
    show(activeName) {
      this.currentPage = 1;
      this.projectUsers = [];
      this.visible = true;
      this.projectMemFlg = false;
      this.projectGroupFlg = false;
      this.loading = false;
      this.btnFlg = false;
      this.selValue1 = "1";
      this.selValue2 = '1';
      this.input1 = '';
      this.input2 = "";
      this.input3 = '';
      this.input4 = "";
      this.activeName = activeName;
      this.loadData(activeName);
    },
    loadData(name) {
      if (name=="second") {
        this.loadProjectMember();
      } else {
        this.loadProjectGroup();
      }
    },
    async confirmProjectFun() {
      try {
        this.loading = true;
        this.btnFlg = true;
        if (this.projectMemFlg) {
          await this.updateMember(this.id);
        }
        if (this.projectGroupFlg) {
          await this.updateGroup(this.id);
        }
        this.loading = false;
        this.btnFlg = false;
        this.visible = false;
        this.$emit('refreshData');
      } catch (data) {
        this.loading = false;
        this.btnFlg = false;
        this.visible = false;
        console.log('创建失败，请联系管理员');
      }
    },
    async updateMember(id) {
      let users = [];
      let removeUsers = [];
      for (let i=0; i<this.projectMembers.length; i++) {
        var item = this.projectMembers[i];
        if (item.flg=="add") {
          users.push({
            "user_id": item.id,
            "role_ids":(function(roles) {
              let arr = [];
              roles.forEach((item) => {
                arr.push(item.role_id);
              });
              return arr
            })(item.roles)
          })
        } else if (item.flg=="remove") {
          removeUsers.push({
            "user_id": item.id,
            "role_ids":(function(roles) {
              let arr = [];
              roles.forEach((item) => {
                arr.push(item.role_id);
              });
              return arr
            })(item.roles)
          })
        } else if (item.editFlg) {
          users.push({
            "user_id": item.id,
            "role_ids":(function(roles) {
              let arr = [];
              roles.forEach((item) => {
                arr.push(item.role_id);
              });
              return arr
            })(item.roles)
          })
        }
      }
      let ret = await this.$ajax({
        type: 'post',
        url: "api/keystone/v3/inspur/assignments/projects/"+id,
        data: JSON.stringify({
          project_roles:{
            "users":users
          }
        }),
        log:{
          description:{
            en:"project("+this.name+")modify members",
            zh_cn:"项目("+this.name+")修改成员"
          },
          target:Vue.logTarget.project
        }
      })
      let rret = await this.$ajax({
        type: 'delete',
        url: "api/keystone/v3/inspur/assignments/projects/"+id,
        data: JSON.stringify({
          project_roles:{
            "users":removeUsers
          }
        })
      })
    },
    async updateGroup(id) {
      let groups = [];
      let removeGroups = [];
      for (let i=0; i<this.projectGroups.length; i++) {
        var item = this.projectGroups[i];
        if (item.flg=="add") {
          groups.push({
            "group_id": item.id,
            "role_ids":(function(roles) {
              let arr = [];
              roles.forEach((item) => {
                arr.push(item.role_id);
              });
              return arr
            })(item.roles)
          })
        } else if (item.flg=="remove") {
          removeGroups.push({
            "group_id": item.id,
            "role_ids":(function(roles) {
              let arr = [];
              roles.forEach((item) => {
                arr.push(item.role_id);
              });
              return arr
            })(item.roles)
          })
        } else if (item.editFlg) {
          groups.push({
            "group_id": item.id,
            "role_ids":(function(roles) {
              let arr = [];
              roles.forEach((item) => {
                arr.push(item.role_id);
              });
              return arr
            })(item.roles)
          })
        }
      }
      let option = {
        type: 'post',
        url: "api/keystone/v3/inspur/assignments/projects/"+id+"/groups",
        data: JSON.stringify({
          project_roles:{
            "groups":groups
          }
        })
      }
      option.log = {
        description:{
          en:"project("+this.name+")modify group",
          zh_cn:"项目("+this.name+")修改组"
        },
        target:Vue.logTarget.project
      }
      let ret = await this.$ajax(option)
      let rret = await this.$ajax({
        type: 'delete',
        url: "api/keystone/v3/inspur/assignments/projects/"+id+"/groups",
        data: JSON.stringify({
          project_roles:{
            "groups":removeGroups
          }
        })
      })
    },
    tabClick() {
      if (this.activeName == "second" && !this.projectMemFlg) { //第一次点击项目成员，加载成员信息
        this.loadProjectMember();
      } else if (this.activeName == "third" && !this.projectGroupFlg) {
        this.loadProjectGroup();
      }
    },
    async loadProjectMember() {
      let mret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/assignments/projects/"+this.id+"/users"
      })
      //遍历数据将角色数据合并到人员下面
      let users = mret.users;
      let arr = [];
      for (let i=0; i<users.length; i++) {
        users[i].user.roles = this.$convertRoleLanguage(users[i].roles, "role_name");
        users[i].user.show = true;
        users[i].user.isDefault = true;
        arr.push(users[i].user);
      }
      this.projectMembers = arr;
      this.getLeftProjectMember(); //查询左侧不在项目中的人员
      this.projectMemFlg = true;
    },
    async getLeftProjectMember() {
      let param = {remove_project_id:this.id, domain_id:"default", limit:50, page:this.currentPage};
      if (this.selValue1=="1"&&this.input1!="") {
        param.name = this.input1;
      }
      if (this.selValue1==0&&this.input1!='') {
        param.department = this.input1id;
      }
      let uret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/users?"+ $.param(param)
      })
      this.projectUsers = [...this.projectUsers, ...this.filterUserData(uret.users)];
      this.total = uret.total;
    },
    //处理左侧获取到的人员数据，第一：和右侧isDefault!=true的人员对比，剔除右侧已添加过的人员；
    //第二：获取第一页人员的时候，添加因为删除右侧isDefault=true的人员
    filterUserData(users) {
      //剔除
      let me = this;
      for (var i=users.length-1; i>=0; i--) {
        let index = this.projectMembers.findIndex((user) => {
          return !user.isDefault&&user.id==users[i].id;
        })
        if (index>-1) { //重复，需要剔除
          users.splice(i, 1);
        }
      }
      //添加右侧删除人员
      if (this.currentPage==1) {
        let key,
          value;
        if (this.selValue1=="1") { //账号查询
          key = 'name';
        } else { //部门查询
          key = 'department_name';
        }
        value = this.input1;
        //获取右侧删除的默认人员
        let deleteUsers = [];
        this.projectMembers.forEach((ritem) => {
          let item = $.extend({}, ritem);
          if (item.flg=='remove'&&item.isDefault) {
            //如果有过滤条件，需要过滤下
            if (item[key] == null || item[key] == undefined) {
              item[key] = "";
            }
            if ((key=="name"&&item[key].indexOf(value)>-1)||(key=="department_name"&&item[key]==value)) {
              item.show = true;
              item.flg = '';
              deleteUsers.push(item);
            }
          }
        })
        users = [...deleteUsers, ...users];
      }
      return users;
    },
    getMoreUsers() {
      this.currentPage = this.currentPage + 1;
      this.getLeftProjectMember();
    },
    async loadProjectGroup() {
      let param = {
        project_id:this.id
      }
      let mret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/assignments/projects/groups?"+$.param(param)
      })
      //遍历数据将角色数据合并到人员下面
      let groups = mret.groups;
      let arr = [];
      for (let i=0; i<groups.length; i++) {
        groups[i].group.roles = this.$convertRoleLanguage(groups[i].roles, "role_name");
        groups[i].group.hasOwer = groups[i].users.some((item, index) => {
          return item.id == Vue.userId
        })
        groups[i].group.show = true;
        arr.push(groups[i].group);
      }
      this.projectGroups = arr;
      let uret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/assignments/projects/groups?"+ $.param({except_project_id:this.id})
      })
      this.groups = this.proGroupSearch2(function(arr) {
        let list = [];
        arr.forEach((item, index) => {
          // item.group.hasOwer = item.users.some((item1, index1) => {
          //   return item1.id == Vue.userId
          // })
          list.push(item.group);
        })
        return list;
      }(uret.groups));
      this.projectGroupFlg = true;
    },
    lproMemSearch() {
      //this.projectUsers = this.proMemSearch1(this.projectUsers);
      this.currentPage = 1;
      this.projectUsers = [];
      this.getLeftProjectMember();
    },
    rproMemSearch() {
      this.projectMembers = this.proMemSearch2(this.projectMembers);
    },
    lproGroupSearch() {
      this.groups = this.proGroupSearch1(this.groups);
    },
    rproGroupSearch() {
      this.projectGroups = this.proGroupSearch2(this.projectGroups);
    },
    memberPlusFun(ele) { //项目成员新增按钮fun
      let id;
      if (ele.target.tagName == "I") {
        id = ele.target.parentElement.getAttribute("uid");
      } else {
        id = ele.target.getAttribute("uid");
      }
      //查找删除的人的索引
      let index = this.projectUsers.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let add = Object.assign({}, this.projectUsers[index]);
      if (!add.roles) {
        add.roles = [];
      }
      if (add.roles.length==0) { //如果没有角色，默认一个内置的项目成员的角色
        add.roles.push({
          role_id:"ProjectUser",
          role_name:Vue.t('base.projectUser'),
          role_type:3
        })
      }
      //查找右侧中是否已有该人员
      let rindex = this.projectMembers.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let radd = Object.assign({}, add);
      if (rindex<0) { //如果不是右侧删除过来的数据
        add.show = false;
        add.flg = "remove"; //表示在左侧被删除了
        Vue.set(this.projectUsers, index, add);
        radd.flg = "add";
        radd.show = true;
        this.projectMembers.unshift(radd);
      } else { //如果有，则肯定是删除的数据
        this.projectUsers.splice(index, 1);
        radd.flg = "";
        radd.show = true;
        Vue.set(this.projectMembers, rindex, radd);
      }
    },
    groupPlusFun(ele) { //项目组新增按钮fun
      let id;
      if (ele.target.tagName == "I") {
        id = ele.target.parentElement.getAttribute("uid");
      } else {
        id = ele.target.getAttribute("uid");
      }
      let index = this.groups.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let add = Object.assign({}, this.groups[index]);
      if (!add.roles) {
        add.roles = [];
      }
      if (add.roles.length==0) { //如果没有角色，默认一个内置的项目成员的角色
        add.roles.push({
          role_id:"ProjectUser",
          role_name:Vue.t('base.projectUser'),
          role_type:3
        })
      }
      //查找右侧中是否已有该组
      let rindex = this.projectGroups.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let radd = Object.assign({}, add);
      radd.eshow = true;
      if (rindex<0) {
        add.show = false;
        add.eshow = false;
        add.flg = "remove"; //表示在左侧被删除了
        Vue.set(this.groups, index, add);
        radd.flg = "add";
        this.projectGroups.unshift(radd);
      } else { //如果有，则肯定是删除的数据
        this.groups.splice(index, 1);
        radd.flg = "";
        Vue.set(this.projectGroups, rindex, radd);
      }
    },
    memberMinusFun(ele) { //项目成员删除按钮
      let id;
      if (ele.target.tagName == "I") {
        id = ele.target.parentElement.getAttribute("uid");
      } else {
        id = ele.target.getAttribute("uid");
      }

      //查找删除的人的索引
      let index = this.projectMembers.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let remove = Object.assign({}, this.projectMembers[index]);
      if (!remove.isDefault) { //如果是新增过来的数据
        this.projectMembers.splice(index, 1); //删除右侧数据
        remove.show = true;
        remove.flg = "";
        let lindex = this.projectUsers.findIndex(function(value, index, arr) {
          return value.id == id;
        })
        if (lindex>-1) { //左侧存在的话
          Vue.set(this.projectUsers, lindex, remove);
        } else { //不存在的话，(不存在的原因是：重新查询过左侧数据),需要添加到左侧
          this.projectUsers.unshift(remove);
        }
      } else { //如果不是新增过来的,是数据库中本来就存在的
        remove.show = false;
        remove.flg = "remove";
        Vue.set(this.projectMembers, index, remove);
        let lremove = Object.assign({}, remove);
        lremove.show = true;
        lremove.flg = "";
        this.projectUsers.unshift(lremove);
      }
    },
    groupMinusFun(ele) { //项目组删除按钮
      let id;
      if (ele.target.tagName == "I") {
        id = ele.target.parentElement.getAttribute("uid");
      } else {
        id = ele.target.getAttribute("uid");
      }
      let index = this.projectGroups.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let remove = Object.assign({}, this.projectGroups[index]);
      if (remove.flg=="add") { //如果是新增过来的数据
        this.projectGroups.splice(index, 1);
        remove.eshow = true;
        remove.flg = "";
        let lindex = this.groups.findIndex(function(value, index, arr) {
          return value.id == id;
        })
        Vue.set(this.groups, lindex, remove);
      } else { //如果不是新增过来的
        remove.eshow = false;
        remove.show = false;
        remove.flg = "remove";
        Vue.set(this.projectGroups, index, remove);
        let lremove = Object.assign({}, remove);
        lremove.eshow = true;
        lremove.flg = "";
        this.groups.unshift(lremove);
      }
    },
    proMemSearch2(arr) { //右侧项目成员查询
      let key,
          value;
      if (this.selValue2=="1") { //账号查询
        key = 'name';
      } else { //部门查询
        key = 'department_name';
      }
      value = this.input2;
      arr.forEach((item) => {
        if (item[key] == null || item[key] == undefined) {
          item[key] = "";
        }
        if (item.flg!="remove"&&((key=="name"&&item[key].indexOf(value)>-1)||(key=="department_name"&&(value==""||item[key]==value)))) {
          item.show = true;
        } else {
          item.show = false;
        }
        item.eshow = false;
      });
      return arr;
    },
    proGroupSearch1(arr) { //左侧项目组查询
      let value = this.input3;
      arr.forEach((item) => {
        if (item["name"] == null || item["name"] == undefined) {
          item.group["name"] = "";
        }
        if (item.flg!="remove"&&(item["name"].indexOf(value)>-1)) {
          item.show = true;
        } else {
          item.show = false;
        }
        item.eshow = false;
      });
      return arr;
    },
    proGroupSearch2(arr) { //右侧项目组查询
      let value = this.input4;
      arr.forEach((item) => {
        if (item["name"] == null || item["name"] == undefined) {
          item.group["name"] = "";
        }
        if (item.flg!="remove"&&(item["name"].indexOf(value)>-1)) {
          item.show = true;
        } else {
          item.show = false;
        }
        item.eshow = false;
      });
      return arr;
    },
    userSetRole(ele) {
      this.operateType = "user";
      this.setRole(ele, this.projectMembers);
    },
    groupSetRole(ele) {
      this.operateType = "group";
      this.setRole(ele, this.projectGroups);
    },
    //临时用,以后修改需求再删掉
    groupSetRole1(ele) {
      this.operateType = "group";
      this.setRole1(ele, this.projectGroups);
    },
    //临时用,以后修改需求再删掉
    async setRole1(ele, arr) {
      this.roleSettingFlg1 = true;
      this.roleSet1.roleValue1 = "";
      this.roleSet1.roleValue2 = "";
      this.roleList1 = [];
      let id;
      if (ele.target.tagName == "I") {
        id = ele.target.parentElement.getAttribute("uid");
      } else {
        id = ele.target.getAttribute("uid");
      }
      this.operateId = id;
      let index = arr.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let croles = arr[index].roles;
      this.roleSet1.roleType = parseInt(croles[0].role_type);
      //获取角色名称
      let roles = await this.powerFun1();
      if (this.roleSet1.roleType==2) {
        this.roleSet1.roleValue1 = croles[0].role_id;
      } else {
        this.roleSet1.roleValue2 = croles[0].role_id;
      }
      let list = [];
      for (var k=0; k<roles.length; k++) {
        list.push({
          role_id:roles[k].id,
          role_name:roles[k].name,
          role_type:roles[k].type
        });
      }
      this.roleList1 = this.$convertRoleLanguage(list, "role_name");
    },
    async setRole(ele, arr) {
      this.roleSettingFlg = true;
      this.roleSet.roleValue1 = [];
      this.roleSet.roleValue2 = [];
      this.roleList = [];
      let id;
      if (ele.target.tagName == "I") {
        id = ele.target.parentElement.getAttribute("uid");
      } else {
        id = ele.target.getAttribute("uid");
      }
      this.operateId = id;
      let index = arr.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let croles = arr[index].roles;
      this.roleSet.roleType = parseInt(croles[0].role_type);
      //获取角色名称
      let roles = await this.powerFun();
      for (var i=0; i<croles.length; i++) {
        if (this.roleSet.roleType==2) {
          this.roleSet.roleValue1.push(croles[i].role_id);
        } else {
          this.roleSet.roleValue2.push(croles[i].role_id);
        }
      }
      let list = [];
      for (var k=0; k<roles.length; k++) {
        list.push({
          role_id:roles[k].id,
          role_name:roles[k].name,
          role_type:roles[k].type
        });
      }
      this.roleList = this.$convertRoleLanguage(list, "role_name");
    },
    async roleTypeChange() {
      let arr = [];
      let roles = await this.powerFun();
      for (var k=0; k<roles.length; k++) {
        arr.push({
          role_id:roles[k].id,
          role_name:roles[k].name,
          role_type:roles[k].type
        });
      }
      this.roleList = this.$convertRoleLanguage(arr, "role_name");
    },
    //临时用
    async roleTypeChange1() {
      let arr = [];
      let roles = await this.powerFun1();
      for (var k=0; k<roles.length; k++) {
        arr.push({
          role_id:roles[k].id,
          role_name:roles[k].name,
          role_type:roles[k].type
        });
      }
      this.roleList1 = this.$convertRoleLanguage(arr, "role_name");
    },
    async powerFun() {
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/roles?"+ $.param({type:this.roleSet.roleType})
      });
      return ret.roles;
    },
    async powerFun1() {
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/roles?"+ $.param({type:this.roleSet1.roleType})
      });
      return ret.roles;
    },
    roleSettingFun() {
      if (this.roleSet.roleType==2) {
        this.$refs.roleSetForm.validateField('roleValue1');
        if (this.roleSet.roleValue1.length==0) {
          return;
        }
      } else {
        this.$refs.roleSetForm.validateField('roleValue2');
        if (this.roleSet.roleValue2.length==0) {
          return;
        }
      }
      this.roleSettingFlg = false;
      let me = this;
      let croles = [];
      let arr = this.roleSet.roleType==2?this.roleSet.roleValue1:this.roleSet.roleValue2;
      for (var i=0; i<arr.length; i++) {
        let cindex = this.roleList.findIndex(function(value, index) {
          return value.role_id == arr[i];
        })
        if (cindex>-1) {
          croles.push(this.roleList[cindex]);
        }
      }
      if (this.operateType=="user") {
        let index = this.projectMembers.findIndex(function(value, index, arr) {
          return value.id == me.operateId;
        })
        this.projectMembers[index].roles = croles;
        this.projectMembers[index].editFlg = true;
      } else {
        let index = this.projectGroups.findIndex(function(value, index, arr) {
          return value.id == me.operateId;
        })
        this.projectGroups[index].roles = croles;
        this.projectGroups[index].editFlg = true;
      }
    },
    //临时用
    roleSettingFun1() {
      let me = this;
      if (this.roleSet1.roleType==2) {
        this.$refs.roleSetForm1.validateField('roleValue1');
        if (this.roleSet1.roleValue1=="") {
          return;
        }
      } else {
        this.$refs.roleSetForm1.validateField('roleValue2');
        if (this.roleSet1.roleValue2=="") {
          return;
        }
      }
      this.roleSettingFlg1 = false;
      let croles = [];
      let arr = [this.roleSet1.roleType==2?this.roleSet1.roleValue1:this.roleSet1.roleValue2];
      for (var i=0; i<arr.length; i++) {
        let cindex = this.roleList1.findIndex(function(value, index) {
          return value.role_id == arr[i];
        })
        if (cindex>-1) {
          croles.push(this.roleList1[cindex]);
        }
      }
      let index = this.projectGroups.findIndex(function(value, index, arr) {
        return value.id == me.operateId;
      })
      this.projectGroups[index].roles = croles;
      this.projectGroups[index].editFlg = true;
    },
    getDeptFun(val, selVal) {
      this.searchKey = val;
      if (this[selVal]==0) {
        this.getDeptFlg = true;
        this.$nextTick(async () => {
          let ret = await this.$ajax({
            type: 'get',
            url: "api/keystone/v3/inspur/departments"
          })
          var arr = ret.departments;
          arr.forEach(function(item, key) {
            item.pId = item.parent_id?item.parent_id:"default";
            item.icon = './static/img/ztree/department.png';
          });
          arr.unshift({id:"default", name:Vue.t('base.all'), icon:"./static/img/ztree/department.png"});
          this.treeData = arr;
          this.$nextTick(() => {
            let node = this.$refs.deZtree.action('getNodesByParam', "level", 0)[0];
            this.$refs.deZtree.action("expandNode", node);
          })
        });
      }
    },
    confirmDeptFun() {
      var nodes = this.$refs.deZtree.action("getSelectedNodes");
      if (nodes.length==0) {
        this.$message({
          message: Vue.t('base.selectDepartmentWarn'),
          type: "warning"
        });
        return;
      }
      this[this.searchKey] = nodes[0].id=="default"?"":nodes[0].name;
      this[this.searchKey+"id"] = nodes[0].id=="default"?"":nodes[0].id;
      this.getDeptFlg = false;
    }
  },
  components:{
  }
}
</script>
<style>
  .sys-edit-project-dialog .el-dialog--small{
    min-width:800px;
  }
</style>