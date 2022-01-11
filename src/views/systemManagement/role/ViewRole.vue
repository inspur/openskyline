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
      let {role} = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/roles/"+ this.roleId
      });
      this.roleData = role;
    }
  }
}
</script>