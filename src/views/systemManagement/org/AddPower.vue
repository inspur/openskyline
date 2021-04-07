<template>
<div>
  <el-dialog :title="$t('base.addPermission')" :visible.sync="visible">
    <el-form v-loading="loading" :element-loading-text="$t('base.sendingData')" ref="addPowerForm" class="me-required-form" label-width="100px" :model="addPowerForm" label-position="left" :rules="rules">
      <el-form-item :label="$t('base.roleType')">
        <el-select v-model="addPowerForm.type" style="width:400px;" @change="changeFun" size="small">
          <el-option :label="$t('base.superAdmin')" value="SuperAdmin" v-if="id!=userId"></el-option>
          <el-option :label="$t('base.projectAdmin')" value="SuperProject"></el-option>
          <el-option :label="$t('base.projectUser')" value="ProjectUser"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('base.project')" class="is-required" v-if="proFlg" prop="projectName">
        <!-- <el-select v-model="addPowerForm.pid" :multiple="true" style="width:400px;" filterable size="small" placeholder="">
          <el-option v-for="item in proList" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select> -->
        <el-input auto-complete="off" style="width:400px;" :title="addPowerForm.projectName" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="addPowerForm.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.role')" class="is-required" prop="role">
        <el-select v-model="addPowerForm.role" style="width:400px;" size="small" placeholder="">
          <el-option v-for="item in roleList" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('base.cancel')}}</el-button>
      <el-button :loading="saving" type="primary" @click="confirmFun">{{$t('base.confirm')}}</el-button>
    </div>
 </el-dialog>
 <select-project ref="selectProject" :multiple="true" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
</div>
</template>
<script>
export default {
  name:"addPower",
  props:["id", "name"],
  data() {
    return {
      selProjectFlg:false,
      loading:false,
      saving:false,
      userId:Vue.userId,
      visible:false,
      proFlg:false,
      close:"",
      addPowerForm:{
        type:"SuperAdmin",
        projectName:"",
        pid:[],
        role:""
      },
      roleList:[],
      proList:[],

      rules: {
        role:[
          {required:true, message:Vue.t('base.selectRole'), trigger:'change'}
        ],
        projectName:[
          {type: 'required'}
        ]
      }
    }
  },
  mounted() {
    this.saving = false;
    this.visible = false;
  },
  methods:{
    changeFun(value) {
      // if (value=="SuperAdmin") {
      //   this.proFlg = false;
      // } else if (value=="SuperProject") {
      //   this.proFlg = true;
      // } else if (value=="ProjectUser") {
      //   this.proFlg = true;
      // }
      this.proFlg = (value!="SuperAdmin");
      this.getRole();
      this.addPowerForm.role = "";
    },
    async getProjects() {
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/projects?domain_id="+'default'
      });
      this.proList = ret.projects;
    },
    async getRole() {
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/roles?"+ $.param({type:(this.addPowerForm.type=="SuperAdmin"?"0":(this.addPowerForm.type=="SuperProject"?"2":"3"))})
      });
      this.roleList = this.$convertRoleLanguage(ret.roles);
    },
    show() {
      this.visible = true;
      this.proFlg = false;
      this.addPowerForm = {
        type:"SuperAdmin",
        projectName:"",
        pid:[],
        role:""
      };
      if (this.$refs.addPowerForm) {
        this.$refs.addPowerForm.resetFields();
      }
      this.getRole();
    },
    async confirmFun() {
      let flg = true;
      let me = this;
      if (this.proFlg&&this.addPowerForm.pid.length==0) {
        flg = false;
      }
      if (!this.addPowerForm.role) {
        flg = false;
      }
      if (!flg) {
        this.$refs.addPowerForm.validate((valid) => {
        });
        return;
      }
      this.loading = true;
      this.saving = true;
      let arr = [];
      if (this.proFlg) {
        this.addPowerForm.pid.forEach((item, index) => {
          arr.push({
            "role_id":this.addPowerForm.role,
            "project_id":item
          })
        })
      } else {
        arr.push({
          "role_id":this.addPowerForm.role,
          "project_id":this.addPowerForm.pid[0]
        })
      }
      let ret = await this.$ajax({
        type: 'post',
        url: "api/keystone/v3/inspur/assignments/groups/"+this.id+"/roles",
        data:JSON.stringify({assignments:arr}),
        errFun() {
          me.loading = false;
          me.saving = false;
        },
        log:{
          description:{
            en:"group("+this.name+") empowerment",
            zh_cn:"组("+this.name+")赋权"
          },
          target:Vue.logTarget.group
        }
      });
      this.loading = false;
      this.saving = false;
      this.visible = false;
      this.$emit('refresh');
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(idList, nameList) {
      this.addPowerForm.pid = idList;
      this.addPowerForm.projectName = nameList.join(';');
      this.close = 'close'
    },
    onIconClick() {
      this.addPowerForm.projectName = '';
      this.addPowerForm.pid = [];
      this.close = '';
    }
  }
}
</script>