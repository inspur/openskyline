<template>
  <div>
    <icos-page-header :title="$t('base.modifyRole')" :show-back="true" @back="handlePageHeaderBack" />
    <icos-page>
      <el-form ref="editRoleForm" label-width="100px" :model="roleData" :rules="rules" class="me-required-form">
        <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
          <el-input auto-complete="off" style="width:500px;" v-model="roleData.name"></el-input>
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
    let {role} = await this.$ajax({
      type: 'get',
      url: "api/keystone/v3/roles/"+ this.$route.params.id
    });
    this.roleData = role;
    console.log(this.roleData);
  },
  methods:{
    cancel() {
      this.$router.push({
        path: '/systemManagement/role'
      });
    },
    async confirmFun() {
      let me = this;
      this.$refs.editRoleForm.validate(async (valid) => {
        if (!valid) {
          return;
        }
        let ret = await this.$ajax({
          type: 'patch',
          url: "api/keystone/v3/roles/"+this.$route.params.id,
          data: JSON.stringify({
            role:{
              name:this.roleData.name,
              description:this.roleData.description
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