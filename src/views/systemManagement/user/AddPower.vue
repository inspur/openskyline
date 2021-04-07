<template>
<div>
  <el-dialog :title="$t('base.addPermission')" :visible.sync="visible">
    <el-form v-loading="loading" :element-loading-text="$t('base.sendingData')" ref="addPowerForm" class="me-required-form" label-width="100px" :model="addPowerForm" label-position="left" :rules="rules">
      <el-form-item :label="$t('base.roleType')">
        <el-select v-model="addPowerForm.type" style="width:400px;" @change="changeFun" size="small">
          <el-option :label="$t('base.superAdmin')" value="0" v-if="id!=userId"></el-option>
          <el-option :label="$t('base.projectAdmin')" value="2"></el-option>
          <el-option :label="$t('base.projectUser')" value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('base.project')" class="is-required" v-if="proFlg" prop="projectName">
        <!-- <el-select v-model="addPowerForm.pid" :multiple="true" style="width:400px;" filterable size="small">
          <el-option v-for="item in proList" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select> -->
        <el-input auto-complete="off" style="width:400px;" :title="addPowerForm.projectName" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="addPowerForm.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.role')" class="is-required" prop="role">
        <el-select v-model="addPowerForm.role" style="width:400px;" size="small">
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
      loading:false,
      saving:false,
      close:"",
      selProjectFlg:false,
      userId:Vue.userId,
      visible:false,
      proFlg:false,
      addPowerForm:{
        type:"0",
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
      if (value==0) {
        this.proFlg = false;
      } else if (value==2) {
        this.proFlg = true;
      } else if (value==3) {
        this.proFlg = true;
      }
      this.getRole();
      this.addPowerForm.role = "";
    },
    async getRole() {
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/roles?"+ $.param({type:this.addPowerForm.type})
      });
      this.roleList = this.$convertRoleLanguage(ret.roles);
    },
    show() {
      this.visible = true;
      this.proFlg = this.id==this.userId;
      this.addPowerForm = {
        type:this.id==this.userId?"2":"0",
        projectName:"",
        pid:[],
        role:""
      };
      if (this.$refs.addPowerForm) {
        this.$refs.addPowerForm.resetFields();
      }
      if (this.proFlg) {
        this.changeFun(2);
      } else {
        this.getRole();
      }
    },
    hide() {
      this.visible = false;
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
      let obj = {role_id:this.addPowerForm.role};
      if (this.proFlg) {
        obj.projects = this.addPowerForm.pid;
      }
      let role = me.roleList.find(item => item.id === me.addPowerForm.role);
      let logEn = '';
      let logZhCn = '';
      if (me.addPowerForm.type === '0') {
        logEn = `User:${this.name} empowerment ${role.name} `;
        logZhCn = `用户：${this.name} 赋权 ${role.name} `;
      } else {
        logEn = `User:${this.name}  empowerment, Project ${this.addPowerForm.projectName}'s ${role.name}`;
        logZhCn = `用户：${this.name} 赋权，项目 ${this.addPowerForm.projectName} 的 ${role.name}`;
      }
      let ret = await this.$ajax({
        type: 'post',
        url: "api/keystone/v3/inspur/assignments/users/"+this.id+"/roles",
        data:JSON.stringify({assignments:obj}),
        errFun() {
          me.loading = false;
          me.saving = false;
        },
        log: {
          description:{
            en: logEn,
            zh_cn: logZhCn
          },
          target:Vue.logTarget.user
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