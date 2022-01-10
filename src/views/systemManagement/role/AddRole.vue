<template>
  <div>
    <icos-page-header :title="$t('base.addRole')" :show-back="true" @back="handlePageHeaderBack" />
    <icos-page>
      <el-form ref="addRoleForm" label-width="100px" :model="roleData" :rules="rules" class="me-required-form">
        <el-form-item :label="$t('base.name')" class="is-required" prop="name">
          <el-input auto-complete="off" style="width:500px;" v-model="roleData.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.desc')" prop="description">
          <el-input auto-complete="off" type="textarea" v-model="roleData.description" style="width:500px;"></el-input>
        </el-form-item>
      </el-form>
      <div style="padding-left: 100px;">
        <el-button @click="cancel">{{$t('base.cancel')}}</el-button>
        <el-button type="primary" @click="confirmFun">{{$t('base.confirm')}}</el-button>
      </div>
    </icos-page>
  </div>
</template>
<script>
export default {
  name:"addRole",
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
      loading:false,
      treeData:[],
      roleData:{
        name:"",
        type:0,
        description:""
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
  mounted() {
    // this.getTreeData();
  },
  methods:{
    async getTreeData() {
      this.loading = true;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/menus/"+this.roleData.type
      })
      var arr = ret.menus;
      let language = this.$cookie.get('defaultLanguage');
      //某些服务关闭时，过滤相关的菜单码
      arr.sort((a, b) => {
        return a.oper_level - b.oper_level;
      })
      var noAuth = [];
      for (var key in Vue.AuthList) {
        !Vue.AuthList[key]&&(noAuth.push(key));
      }
      for (var i=arr.length-1; i>=0; i--) {
        let item = arr[i];
        let index = noAuth.findIndex((code) => {
          return item.id.indexOf(code)>-1;
        })
        if (index>=0) {
          arr.splice(i, 1);
        }
      }
      arr.forEach(function(item, key) {
        if (language=="en") {
          item.name = item.ename;
        }
        item.pId = item.parent_menu_code?item.parent_menu_code:"all_role";
        item.icon = './static/img/ztree/item.png';
      });
      arr.sort((a, b) => {
        return a.display_no - b.display_no;
      });
      arr.unshift({
        name:Vue.t('base.all'),
        icon:'./static/img/ztree/item.png',
        id:"all_role"
      });
      this.treeData = arr;
      this.$nextTick(() => {
        let fnode = this.$refs.deZtree.action("getNodeByParam", "level", "0");
        this.$refs.deZtree.action("expandNode", fnode);
      })
      this.loading = false;
    },
    typeChange(value) {
      this.getTreeData();
    },
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    cancel() {
      this.$router.push({
        path: '/systemManagement/role'
      });
    },
    confirmFun() {
      this.$refs.addRoleForm.validate((valid) => {
        if (!valid) {
          return;
        }
        this.addRole();
      });
    },
    async addRole() {
      let me = this;
      let ret = await this.$ajax({
        type: 'post',
        url: "api/keystone/v3/roles",
        data: JSON.stringify({
          role:{
            name:this.roleData.name,
            description:this.roleData.description
          }
        }),
        log:{
          description:{
            en:"add role"+"("+this.roleData.name+")",
            zh_cn:"添加角色"+"("+this.roleData.name+")"
          },
          target:Vue.logTarget.role
        }
      })
      this.$router.push({
        path: '/systemManagement/role'
      });
    },
    handlePageHeaderBack() {
      window.history.go(-1);
    }
  }
}
</script>