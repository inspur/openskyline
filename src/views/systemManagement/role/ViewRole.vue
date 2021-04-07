<template>
<div>
  <div class="table_panel">
  <table class="table table-content table-hover idatatable" style="table-layout: fixed;" border="1">
    <tbody>
      <tr class="odd">
        <th class="idatath" style="width: 180px;">{{$t('base.name')}}：</th>
        <td class="idatatd">{{roleData.name}}</td>
      </tr>
      <tr class="even">
        <th class="idatath">{{$t('base.roleType')}}：</th>
        <td class="idatatd">{{roleData.type}}</td>
      </tr>
      <tr class="odd">
        <th class="idatath">{{$t('base.jurisdiction')}}：</th>
        <td class="idatatd">
          <ztree
          ref="deZtree"
          :data="treeData"
          :setting="setting"
          style="position: relative; max-height: 300px;margin-top:0px;"
          v-loading="loading"
          :element-loading-text="$t('base.loadingData')"
          ></ztree>
          <h2 style="text-align: center; max-height: 300px;" v-if="!treeData || treeData.length<0">{{emptyText}}</h2>
        </td>
      </tr>
      <tr class="even">
        <th class="idatath">{{$t('base.desc')}}：</th>
        <td class="idatatd">{{roleData.description}}</td>
      </tr>
    </tbody>
  </table>
  </div>
</div>
</template>
<script>
export default {
  name:"viewRole",
  props:["roleId"],
  data() {
    return {
      setting: {
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
        type:"",
        description:""
      }
    }
  },
  mounted() {
  },
  methods:{
    async getData() {
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/roles/"+ this.roleId
      });
      let language = this.$cookie.get('defaultLanguage');
      if (language=="en") {
        let obj = {
          "超级管理员角色":"Super Administrator Role",
          "项目管理员角色":"Project Management Role",
          "项目用户角色":"Project User Role"
        }
        ret.name = obj[ret.name]?obj[ret.name]:ret.name;
        ret.description = obj[ret.description]?obj[ret.description]:ret.description;
      }
      this.roleData = ret;
      this.roleData.type = this.roleData.type == 0 ? Vue.t('base.superAdmin') : (this.roleData.type == 2 ? Vue.t('base.projectAdmin') : Vue.t('base.projectUser'));
      //某些服务关闭时，过滤相关的菜单码
      var noAuth = [];
      for (var key in Vue.AuthList) {
        !Vue.AuthList[key]&&(noAuth.push(key));
      }
      for (var i=ret.menus.length-1; i>=0; i--) {
        let item = ret.menus[i];
        let index = noAuth.findIndex((code) => {
          return item.id.indexOf(code)>-1;
        })
        if (index>=0) {
          ret.menus.splice(i, 1);
        }
      }
      ret.menus.forEach(function(item, key) {
        if (language=="en") {
          item.name = item.ename;
        }
        item.pId = item.parent_menu_code?item.parent_menu_code:"";
        item.icon = './static/img/ztree/item.png';
      });
      this.treeData = ret.menus.sort((a, b) => {
        return a.display_no - b.display_no;
      });
    }
  }
}
</script>