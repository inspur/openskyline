<template>
  <div>
    <icos-page-header :title="$t('base.modifyRole')" :show-back="true" @back="handlePageHeaderBack" />
    <icos-page>
      <el-form ref="editRoleForm" label-width="100px" :model="roleData" :rules="rules" class="me-required-form">
        <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
          <el-input auto-complete="off" style="width:500px;" v-model="roleData.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.roleType')">
          <span>{{roleData.type}}</span>
        </el-form-item>
        <el-form-item :label="$t('lang.jurisdiction')" class="is-required" style="width:500px;">
          <el-card>
            <ztree
              ref="deZtree"
              :data="treeData"
              :setting="setting"
              style="position: relative; max-height: 300px;"
              v-loading="loading"
              :element-loading-text="$t('base.loadingData')"
              ></ztree>
            <h2 style="text-align: center; max-height: 300px;" v-if="!treeData || treeData.length<0">{{emptyText}}</h2>
          </el-card>
        </el-form-item>
        <el-form-item :label="$t('lang.desc')" prop="description">
          <el-input auto-complete="off" type="textarea" v-model="roleData.description" style="width:500px;"></el-input>
        </el-form-item>
      </el-form>
      <div style="padding-left: 100px;">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" @click="confirmFun">{{$t('lang.confirm')}}</el-button>
      </div>
    </icos-page>
  </div>
</template>
<script>
export default {
  name:"editRole",
  data() {
    return {
      setting: {
        check : {
          enable : true
        },
        data : {
          simpleData : {
            enable : true
          },
          key:{
            name:"name"
          }
        }
      },
      emptyText:Vue.t('base.noData'),
      radio:"1",
      loading:false,
      treeData:[],
      roleData:{
        name:"",
        description:"",
        type:""
      },
      rules: {
        name: [
          {type: 'required'},
          {type: 'maxSize', value: 40},
          {type: "onlyLetter_MinusNumberChinese"}
        ],
        description:[
          {type: 'maxSize', value: 255}
        ]
      }
    }
  },
  async mounted() {
    let uret;
    let ret = await this.$ajax({
      type: 'get',
      url: "api/keystone/v3/inspur/roles/"+ this.$route.params.id
    });
    this.roleData = ret;
    if (this.roleData.type==0) {
      uret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/auth/menus/"+ (Vue.roleType==0?'-':this.$cookie.get("pid"))
      });
    } else {
      uret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/menus/"+this.roleData.type
      })
    }
    this.roleData.type = this.roleData.type == 0 ? Vue.t('base.superAdmin') : (this.roleData.type == 2 ? Vue.t('base.projectAdmin') : Vue.t('base.projectUser'));
    let language = this.$cookie.get('defaultLanguage');
    //某些服务关闭时，过滤相关的菜单码
    var noAuth = [];
    for (var key in Vue.AuthList) {
      !Vue.AuthList[key]&&(noAuth.push(key));
    }
    for (var i=uret.menus.length-1; i>=0; i--) {
      let item = uret.menus[i];
      let index = noAuth.findIndex((code) => {
        return (item.menu_code&&item.menu_code.indexOf(code)>-1)||(item.id&&item.id.indexOf(code)>-1);
      })
      if (index>=0) {
        uret.menus.splice(i, 1);
      }
    }
    uret.menus.forEach((item, key) => {
      if (language=="en") {
        item.name = item.ename;
      }
      item.pId = item.parent_menu_code?item.parent_menu_code:"";
      item.icon = './static/img/ztree/item.png';
      if (!item.id) {
        item.id = item.menu_code;
      }
    })
    ret.menus.forEach((item, key) => {
      let index = uret.menus.findIndex((value, index, arr) => {
        return value.id == item.id;
      })
      if (index>=0) {
        uret.menus.splice(index, 1);
      }
      if (language=="en") {
        item.name = item.ename;
      }
      item.pId = item.parent_menu_code?item.parent_menu_code:"";
      item.icon = './static/img/ztree/item.png';
      item.checked = true;
    })
    uret.menus = uret.menus.concat(ret.menus);
    this.treeData = uret.menus.sort((a, b) => {
      return a.display_no - b.display_no;
    });
  },
  methods:{
    cancel() {
      this.$router.push({
        path: '/systemManagement/role'
      });
    },
    async confirmFun() {
      let me = this;
      let menuArr = [];
      this.$refs.editRoleForm.validate(async (valid) => {
        if (!valid) {
          return;
        }
        let cheNodes = this.$refs.deZtree.action("getCheckedNodes");
        if (cheNodes.length==0) {
          this.$message({
            message:Vue.t('base.selectPermission'),
            type:'warning'
          });
          return;
        }
        cheNodes.forEach((item, index) => {
          menuArr.push(item.id);
        });
        let ret = await this.$ajax({
          type: 'patch',
          url: "api/keystone/v3/inspur/roles/"+this.$route.params.id,
          data: JSON.stringify({
            role:{
              name:this.roleData.name,
              description:this.roleData.description,
              rolemenu:menuArr
            }
          }),
          log:{
            description:{
              en:"edit role"+"("+this.roleData.name+")",
              zh_cn:"编辑角色"+"("+this.roleData.name+")"
            },
            target:Vue.logTarget.role
          }
        })
        this.$router.push({
          path: '/systemManagement/role'
        });
      })
    },
    handlePageHeaderBack() {
      window.history.go(-1);
    }
  }
}
</script>