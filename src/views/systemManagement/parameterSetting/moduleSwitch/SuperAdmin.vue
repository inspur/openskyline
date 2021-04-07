<template>
  <div>
  <div style="margin-bottom:10px;">
    <el-button type="primary" @click="saveFun">{{$t('base.save')}}</el-button>
  </div>
   <el-row :gutter="10">
    <el-col :span="8">
      <template v-for="item in lmoduleswitch">
        <el-card style="margin-bottom: 10px;">
          <div slot="header" class="clearfix">
            <span>{{item.name}}</span>
            <el-switch v-model="item.enable" style="float:right;" @change="changeFun(item)" v-if="item.id!='m.systemmanage'"></el-switch>
          </div>
          <template v-for="citem in item.children">
            <div :style="switchDiv" v-if="citem.id=='m.systemmanage.paramsetting'||citem.id=='m.systemmanage.serialnumber'">
              <el-checkbox :style="checkStyle" v-model="citem.enable" :disabled="true">{{citem.name}}</el-checkbox>
            </div>
            <div :style="switchDiv" v-if="citem.id!='m.systemmanage.paramsetting'&&citem.id!='m.systemmanage.serialnumber'">
              <el-checkbox @change="nameClick(citem,item)" :style="checkStyle" v-model="citem.enable">{{citem.name}}</el-checkbox>
            </div>
          </template>
        </el-card>
      </template>

    </el-col>
    <el-col :span="8">
      <template v-for="item in mmoduleswitch">
        <el-card style="margin-bottom: 10px;">
          <div slot="header" class="clearfix">
            <span>{{item.name}}</span>
            <el-switch v-model="item.enable" style="float:right;" @change="changeFun(item)" v-if="item.id!='m.calculate'"></el-switch>
          </div>
          <template v-for="citem in item.children">
            <div :style="switchDiv" v-if="citem.parent_menu_code=='m.calculate'">
              <el-checkbox :style="checkStyle" v-model="citem.enable"
                :disabled="citem.id!='m.calculate.objectStorage'
                  &&citem.id!='m.calculate.fileStorage'&&citem.id!='m.calculate.physical'
                  &&citem.id!='m.calculate.baremetal'"
                >{{citem.name}}
              </el-checkbox>
            </div>
            <div :style="switchDiv" v-if="citem.parent_menu_code!='m.calculate'">
              <el-checkbox @change="nameClick(citem,item)" :style="checkStyle" v-model="citem.enable">{{citem.name}}</el-checkbox>
            </div>
          </template>
        </el-card>
      </template>
    </el-col>
    <el-col :span="8">
      <template v-for="item in rmoduleswitch">
        <el-card style="margin-bottom: 10px;">
          <div slot="header" class="clearfix">
            <span>{{item.name}}</span>
            <el-switch v-model="item.enable" style="float:right;" @change="changeFun(item)" v-if="item.id!='m.network'"></el-switch>
          </div>
          <template v-for="citem in item.children">
            <div :style="switchDiv" v-if="citem.parent_menu_code=='m.network'">
              <el-checkbox :style="checkStyle" v-model="citem.enable" :disabled="citem.id!='m.network.firewall' 
              &&citem.id!='m.network.flaotingip'&&citem.id!='m.network.balance'&&citem.id!='m.network.vpn'">{{citem.name}}</el-checkbox>
            </div>
            <div :style="switchDiv" v-if="citem.parent_menu_code!='m.network'">
              <el-checkbox @change="nameClick(citem,item)" :style="checkStyle" v-model="citem.enable">{{citem.name}}</el-checkbox>
            </div>
          </template>
        </el-card>
      </template>
    </el-col>
   </el-row>
  </div>
</template>
<script>
export default {
  name: "",
  data () {
    return {
      lmoduleswitch:[],
      mmoduleswitch:[],
      rmoduleswitch:[],
      switchDiv: {
        display:"inline-block",
        minWidth:"160px",
        height:'36px',
        lineHeight:"36px",
        cursor:"pointer"
      },
      checkStyle: {
        marginRight:'16px'
      }
    }
  },
  watch: {
  },
  mounted () {
    this.getData();
  },
  methods: {
    async getData() {
      let me = this;
      let language = this.$cookie.get('defaultLanguage');
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/0/moduleswitch/list"
      })
      me.dataRender(ret)
    },
    dataRender(ret) {
      let me = this;
      let obj = {};
      ret.moduleswitch.forEach((item) => { //一级菜单放入数组
        if (!item.parent_menu_code) {
          if (Vue.AuthList[item.id]!==false) {
            item.children = [];
            item.enable = !item.disabled;
            if (language=="en") {
              item.name = item.ename;
            }
            obj[item.id] = item;
          }
        }
      })
      //二级菜单放入一级菜单
      ret.moduleswitch.forEach((item) => {
        if (item.parent_menu_code) {
          if (Vue.AuthList[item.id]!==false) {
            if (obj[item.parent_menu_code]) {
              item.enable = !item.disabled;
              if (language=="en") {
                item.name = item.ename;
              }
              if (item.ename === "Balance Manage" && !Vue.service["octavia"]) {
                return;
              }
              obj[item.parent_menu_code].children.push(item);
            }
          }
        }
      })
      for (let key in obj) {
        switch (key) {
          case "m.startpage":
            me.lmoduleswitch.push(obj[key]);
            break;
          case "m.systemmanage":
            me.lmoduleswitch.push(obj[key]);
            break;
          case "m.calculate":
            me.mmoduleswitch.push(obj[key]);
            break;
          case "m.network":
            me.rmoduleswitch.push(obj[key]);
            break;
          case "m.docker_server":
            me.rmoduleswitch.push(obj[key]);
            break;
          case "m.heat":
            me.mmoduleswitch.push(obj[key]);
            break;
          case "m.senlin":
            me.lmoduleswitch.push(obj[key]);
            break;
          case "m.operationmanage":
            if (Vue.service['leo']) {
              me.rmoduleswitch.push(obj[key]);
            }
            break;
          case "m.workflow":
            me.mmoduleswitch.push(obj[key]);
            break;
          default:
            me.lmoduleswitch.push(obj[key]);
            break;
        }
      }
    },
    nameClick(citem, item) {
      let flg = item.children.some((uitem) => {
        return uitem.enable;
      })
      if (flg) {
        item.enable = true;
      } else {
        flg = item.children.every((uitem) => {
          return !uitem.enable;
        })
        if (flg) {
          item.enable = false;
        }
      }
    },
    changeFun(item) {
      item.children.forEach((citem) => {
        citem.enable = item.enable;
      })
    },
    async saveFun() {
      let carr = [];
      findMemuCode(this.lmoduleswitch);
      findMemuCode(this.mmoduleswitch);
      findMemuCode(this.rmoduleswitch);
      let ret = await this.$ajax({
        type: 'post',
        url: "api/keystone/v3/inspur/0/moduleswitch",
        data:JSON.stringify({
          modules:carr
        }),
        successMsg:Vue.t('base.saveSuccess'),
        log:{
          description:{
            en:"module switch setting",
            zh_cn:"模块开关设置"
          },
          target:Vue.logTarget.parameterSetting
        }
      })
      this.saveNetworkToProjectAdmin(carr);
      this.saveNetworkToProjectUser(carr);
      function findMemuCode(arr) {
        arr.forEach((item) => {
          if (!item.enable) {
            carr.push(item.id);
          }
          item.children.forEach((ritem) => {
            if (!ritem.enable) {
              carr.push(ritem.id);
            }
          })
        })
      }
    },
    // 网络单独处理，需要同步到项目管理员和项目用户
    async saveNetworkToProjectAdmin(carr) {
      let self = this;
      let networkcarr = [];
      let retProjectAdmin = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/2/moduleswitch/list"
      })
      let carrProjectAdmin = [];
      dataRender(retProjectAdmin);
      function dataRender(ret) {
        let obj = {};
        ret.moduleswitch.forEach((item) => { //一级菜单放入数组
          if (!item.parent_menu_code) {
            if (Vue.AuthList[item.id]!==false) {
              item.children = [];
              item.enable = !item.disabled;
              if (language=="en") {
                item.name = item.ename;
              }
              obj[item.id] = item;
            }
          }
        })
        //二级菜单放入一级菜单
        ret.moduleswitch.forEach((item) => {
          if (item.parent_menu_code) {
            if (Vue.AuthList[item.id]!==false) {
              if (obj[item.parent_menu_code]) {
                item.enable = !item.disabled;
                if (language=="en") {
                  item.name = item.ename;
                }
                if (item.ename === "Balance Manage" && !Vue.service["octavia"]) {
                  return;
                }
                obj[item.parent_menu_code].children.push(item);
              }
            }
          }
        })
        let lmoduleswitch = [];
        let mmoduleswitch = [];
        let rmoduleswitch = [];
        for (let key in obj) {
          if (key.indexOf('m.network')== -1) {
            switch (key) {
              case "m.startpage":
                lmoduleswitch.push(obj[key]);
                break;
              case "m.systemmanage":
                lmoduleswitch.push(obj[key]);
                break;
              case "m.calculate":
                mmoduleswitch.push(obj[key]);
                break;
              case "m.network":
                rmoduleswitch.push(obj[key]);
                break;
              case "m.docker_server":
                rmoduleswitch.push(obj[key]);
                break;
              case "m.heat":
                mmoduleswitch.push(obj[key]);
                break;
              case "m.senlin":
                lmoduleswitch.push(obj[key]);
                break;
              case "m.operationmanage":
                if (Vue.service['leo']) {
                  rmoduleswitch.push(obj[key]);
                }
                break;
              case "m.workflow":
                mmoduleswitch.push(obj[key]);
                break;
              default:
                lmoduleswitch.push(obj[key]);
                break;
            }
          }
        }
        findMemuCode(lmoduleswitch)
        findMemuCode(mmoduleswitch)
        findMemuCode(rmoduleswitch)
        for (let j=0; j<carr.length; j++) {
          if (carr[j].indexOf('m.network') > -1) {
            carrProjectAdmin.push(carr[j]);
          }
        }
        self.saveNetworkProjectAdmin(carrProjectAdmin);
      }
      function findMemuCode(arr) {
        arr.forEach((item) => {
          if (!item.enable) {
            carr.push(item.id);
          }
          item.children.forEach((ritem) => {
            if (!ritem.enable) {
              carrProjectAdmin.push(ritem.id);
            }
          })
        })
      }
    },
    saveNetworkProjectAdmin(carrProjectAdmin) {
      this.$ajax({
        type: 'post',
        url: "api/keystone/v3/inspur/2/moduleswitch",
        data:JSON.stringify({
          modules:carrProjectAdmin
        })
      })
    },
    async saveNetworkToProjectUser(carr) {
      let self = this;
      let retProjectUser = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/3/moduleswitch/list"
      })
      let carrProjectUser = [];
      dataRender(retProjectUser);
      function dataRender(ret) {
        let obj = {};
        ret.moduleswitch.forEach((item) => { //一级菜单放入数组
          if (!item.parent_menu_code) {
            if (Vue.AuthList[item.id]!==false) {
              item.children = [];
              item.enable = !item.disabled;
              if (language=="en") {
                item.name = item.ename;
              }
              obj[item.id] = item;
            }
          }
        })
        //二级菜单放入一级菜单
        ret.moduleswitch.forEach((item) => {
          if (item.parent_menu_code) {
            if (Vue.AuthList[item.id]!==false) {
              if (obj[item.parent_menu_code]) {
                item.enable = !item.disabled;
                if (language=="en") {
                  item.name = item.ename;
                }
                if (item.ename === "Balance Manage" && !Vue.service["octavia"]) {
                  return;
                }
                obj[item.parent_menu_code].children.push(item);
              }
            }
          }
        })
        let lmoduleswitch = [];
        let mmoduleswitch = [];
        let rmoduleswitch = [];
        for (let key in obj) {
          if (key.indexOf('m.network')== -1) {
            switch (key) {
              case "m.startpage":
                lmoduleswitch.push(obj[key]);
                break;
              case "m.systemmanage":
                lmoduleswitch.push(obj[key]);
                break;
              case "m.calculate":
                mmoduleswitch.push(obj[key]);
                break;
              case "m.network":
                rmoduleswitch.push(obj[key]);
                break;
              case "m.docker_server":
                rmoduleswitch.push(obj[key]);
                break;
              case "m.heat":
                mmoduleswitch.push(obj[key]);
                break;
              case "m.senlin":
                lmoduleswitch.push(obj[key]);
                break;
              case "m.operationmanage":
                if (Vue.service['leo']) {
                  rmoduleswitch.push(obj[key]);
                }
                break;
              case "m.workflow":
                mmoduleswitch.push(obj[key]);
                break;
              default:
                lmoduleswitch.push(obj[key]);
                break;
            }
          }
        }
        findMemuCode(lmoduleswitch)
        findMemuCode(mmoduleswitch)
        findMemuCode(rmoduleswitch)
        for (let j=0; j<carr.length; j++) {
          if (carr[j].indexOf('m.network') > -1) {
            carrProjectUser.push(carr[j]);
          }
        }
        self.saveNetworkProjectUser(carrProjectUser);
      }
      function findMemuCode(arr) {
        arr.forEach((item) => {
          if (!item.enable) {
            carr.push(item.id);
          }
          item.children.forEach((ritem) => {
            if (!ritem.enable) {
              carrProjectUser.push(ritem.id);
            }
          })
        })
      }
    },
    saveNetworkProjectUser(carrProjectUser) {
      let self = this;
      let networkcarr = [];
      this.$ajax({
        type: 'post',
        url: "api/keystone/v3/inspur/3/moduleswitch",
        data:JSON.stringify({
          modules:carrProjectUser
        })
      })
    }
  }
}
</script>
