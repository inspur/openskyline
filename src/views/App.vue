<template>
  <div class="layout" v-loading="loading" :element-loading-text="$t('base.loadingPage')">
    <div class="layout-header">
      <div class="layout-header-image logo-change-width" :style="style">
        <div :style="smallLogFlag ? logoSmall : logoBig" class="icos-logo"></div>
        <!--<div class="layout-logo">
          <img :src='logoImage'/>
        </div>-->
      </div>
      <div style="display: flex; flex-direction: row; height: 50px; justify-content: flex-end;">
        <div class="layout-header-selects" v-if="true">
          <el-select size="small" v-model="regionValue" @change="regionChange" style="width:120px;" v-if="regions.length>1">
            <el-option v-for="item in regions" :key="item.region_id" :label="item.region" :value="item.region_id">
            </el-option>
          </el-select>
          <el-select v-model="commandSelected" filterable size="small" @change="handleChange" style="width:120px;">
            <el-option v-for="item in commands" :key="item.uuid" :label="item.name" :value="item.uuid">
            </el-option>
          </el-select>
          <!-- <div class="main-page-t-img main-page-t-serious"></div> -->
          <el-badge v-if="flag&&orderFlag" :value="order.faultNum" :max="99" >
            <div @click="flowDeal">{{$t('base.order')}}</div>
          </el-badge>
          <el-badge v-if="flag&&faultFlag" :value="order.orderNum" :max="99" >
            <div @click="faultFault">{{$t('base.workOrder')}}</div>
          </el-badge>
        </div>
        <div class="layout-header-menus">
          <el-menu :default-active="operationIndex"  class="el-menu--transparent skin" mode="horizontal" @select="onOperationSelect" menu-trigger="hover">
            <template v-for="(menu, index) in operationMenus">
              <el-submenu :key="index" :index="menu.key" v-if="menu.flg&&menu.subMenus">
                <template slot="title">
                  <i :class="[menu.iconType, iconSize]"></i>
                  <span>{{menu.name}}</span>
                </template>
                <el-menu-item v-for="subMenu in menu.subMenus" :key="subMenu.key" :index="subMenu.key" v-if="subMenu.flg">
                  <span v-if="subMenu.style" :class="[subMenu.style, subMenu.isActive ? 'active' : '']">
                    <i v-if="subMenu.isActive" :class="{'el-icon-fa-check':true, 'active': subMenu.isActive}"></i>
                  </span>
                  <span v-if="subMenu.name">{{subMenu.name}}</span>
                </el-menu-item>
              </el-submenu>
              <el-menu-item :key="index" :index="menu.key" v-if="menu.flg&&!menu.subMenus">
                <i :class="[menu.iconType, iconSize]"></i>
                <span>{{menu.name}}</span>
              </el-menu-item>
            </template>
          </el-menu>
        </div>
      </div>
    </div>
    <div class="layout-content">
      <div class="layout-content-inner" v-if="commands.length!=0">
        <main-frame
          ref="mainFrame"
          :active-name="activeName"
          :active-openeds="activeOpeneds"
          :menus="menus"
          @changeLogoWidth="changeLogoWidth"
          :routers="routers"
          @menuChanged="menuChanged">
          <!-- <div slot="quickEnter" v-if="roleType==0" class="layout-content-header-more">
            <el-button type="primary" icon="more" size="small" @click="goToGrafana">MORE</el-button>
          </div> -->
        </main-frame>
      </div>

      <div class="layout-content-inner" v-if="commands.length==0">
        <router-view></router-view>
      </div>
    </div>
    <!-- set progressbar -->
    <vue-progress-bar></vue-progress-bar>

    <user-message ref="userMessage" v-if="userMessageFlg" @close="userMessageFlg = false"></user-message>
    <modify-password ref="modifyPassword" v-if="modifyPasswordFlg" @close="modifyPasswordFlg = false"></modify-password>
    <about-us ref="aboutUs" v-if="aboutUsFlg"></about-us>
    <start-page-set ref="startPage" v-if="startpageFlag" @handleStartPageShow="handleStartPageShow"></start-page-set>
  </div>
</template>
<script>
  import logoImageBig from 'assets/img/logo-big.png';
  import logoSmall from 'assets/img/logo-small.png';
  import projectImage from 'assets/img/1.png'
  import projectImage1 from 'assets/img/2.png'
  import projectImage2 from 'assets/img/3.png'
  import menus from './menus/index.js';
  import { mapGetters, mapMutations } from 'vuex';
  import UserMessage from './topDialog/UserMessage'
  import ModifyPassword from './topDialog/ModifyPassword'
  import AboutUs from './topDialog/AboutUs'
  import StartPageSet from "./startPage/StartPageSet";
  import moment from 'moment'
  import uuid from 'uuid';
  export default {
    name: 'app',
    data () {
      return {
        logoBig: {
          backgroundImage: Vue.oemSwitch ? `url(${Vue.oemProductLogo})` : `url(${logoImageBig})`
        },
        logoSmall: {
          backgroundImage: `url(${logoSmall})`
        },
        smallLogFlag: false,
        flag:Vue.roleType != "3",
        orderFlag:Vue.AuthList["m.operationmanage.orderapprove"] && Vue.service['leo'],
        faultFlag:Vue.AuthList["m.operationmanage.fault"] && Vue.service['leo'],
        roleType:Vue.roleType,
        loading:false,
        activeName: '',
        activeOpeneds: ['project'],
        operationIndex: "",
        projectImage: projectImage,
        projectImage1: projectImage1,
        projectImage2: projectImage2,
        iconSize: "icon-size-14",
        commands: (function(me) {
          Vue.projectList.forEach((item, key) => {
            if (item.roleType==0) {
              item.name = me.$t('base.ALL_PROJECTS');
            }
          });
          return Vue.projectList;
        }(this)),
        commandSelected: (function() {
          var selCommand = '';
          Vue.projectList.forEach((item, key) => {
            if (item.active) {
              selCommand = item.uuid;
              Vue.pid_roleType = item.uuid;
              Vue.project_name = item.name;
            }
          });
          return selCommand;
        }()),
        regions:Vue.regionList,
        regionValue:(function() {
          var value = '';
          Vue.regionList.forEach((item, key) => {
            if (item.active) {
              value = item.region_id;
              Vue.region = value;
            }
          });
          return value;
        }()),
        command: '',
        menus: menus.bind(this)(),
        userMessageFlg: false,
        modifyPasswordFlg: false,
        aboutUsFlg:false,
        startpageFlag:false,
        style:{
          width:this.$cookie.get("defaultLanguage")=="en"?"220px":"200px"
        },
        operationMenus: [{
          flg: true,
          iconType: "el-icon-fa-user",
          key: "user-name",
          name: Vue.roleType==""?Vue.userName:Vue.userName+"("+(Vue.roleType==0?this.$t('base.superAdmin'):(Vue.roleType==2?this.$t('base.projectAdmin'):this.$t('base.projectUser')))+")",
          subMenus: [{
            flg: true,
            key: "user-info",
            name: Vue.t('base.userInfo')
          }, {
            flg: true,
            key: "modify-password",
            name: Vue.t('base.modifyPassword')
          }]
        }, {
          flg: Vue.roleType == "0",
          iconType: "el-icon-fa-window-maximize",
          key: "big-screen",
          name: Vue.t('base.bigScreen'),
          subMenus: [
            // {
            //   flg: Vue.roleType==="0",
            //   key: "physicalResource",
            //   name: Vue.t('base.phResDis')
            // }, {
            //   flg: true,
            //   key: "virtualResource",
            //   name: Vue.t('base.virResDis')
            // },
            {
              flg: true,
              key: "digitalVisualizationScreen",
              name: Vue.t('base.BIG_SCREEN')
            },
            {
              flg: true,
              key: "customStartPage",
              name: Vue.t('container.customStartPage')
            }
          ]
        }, {
          flg: true,
          key: "help",
          iconType: "el-icon-fa-question-circle",
          name: Vue.t('base.help'),
          subMenus:[
            {
              flg: true,
              key: "about",
              iconType: "el-icon-menu",
              name: Vue.t('base.about')
            }]
        }, {
          flg: true,
          key: "logout",
          iconType: "el-icon-fa-sign-out",
          name: Vue.t('base.signOut')
        }],
        intelligentData:{
          crit_num:"", //中度
          recovery_num:"", //已修复
          warn_num:"" //轻微
        },
        licenseInfo: {
          nodeAmount: 1,
          trialEdition: true
        }
      };
    },
    computed: {
      ...mapGetters({
        routers: 'getRouters',
        order: 'getOrderInfo'
      })
    },
    watch: {
      // 切换页面
      '$route' (to, from) {
        if (this.commands.length!=0) {
          this.activeName = (this.$route.matched[1] || this.$route.matched[0]).name;
          let breadcrumbs = [];
          this.$route.matched.forEach((item, index) => {
            // 面包屑导航的路由传参
            let otherPath = item.meta.otherPath;
            let paramsMap = new Map();
            let params = this.$route.params;
            let routePath = item.path;
            let paramKeys = Object.keys(params);
            if (paramKeys && paramKeys.length > 0) {
              for (let index = 0; index < paramKeys.length; index++) {
                let paramKey = paramKeys[index];
                routePath = routePath.replace(":" + paramKey, params[paramKey] || "");
                paramsMap.set(paramKey, params[paramKey]);
              }
            } else {
              routePath = item.path;
            }
            if (item.meta.otherPath) {
              let path = item.meta.otherPath;
              let otherPathArr = path.split('/');
              for (let i = 0; i < otherPathArr.length; i++) {
                if (otherPathArr[i].indexOf(':') > -1) {
                  otherPathArr[i] = paramsMap.get(otherPathArr[i].split(":")[1]);
                }
              }
              otherPath = otherPathArr.join("/");
            }
            breadcrumbs.push({
              des: item.meta.des,
              path: routePath,
              otherPath: otherPath
            });
          });
          this.setRouters(breadcrumbs);
        }
      }
    },
    async mounted () {
      this.getLdapConfig();
      if (Vue.roleType == "0" || Vue.roleType == "2") {
        this.getOrderNum();
      };
      if (this.commands.length==0) {
        this.$router.push({
          path: '/projectApply'
        });
      }
      this.checkPasswordExpired();
      if (this.roleType === '0') {
        await this.checkLicenseExpired();
        await this.checkMaintenanceExpired();
      }
    },
    methods: {
      ...mapMutations({
        setRouters: 'setRouters',
        setOrderInfo: 'setOrderInfo'
      }),
      changeLogoWidth(val) {
        if (val) {
          this.style.width = `${val.logWidth}px`;
          this.smallLogFlag = true;
        } else {
          this.smallLogFlag = false;
          this.style.width = this.$cookie.get("defaultLanguage")=="en"?"220px":"200px";
        }
      },
      async getLdapConfig() {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/keystone/v3/inspur/domains/config/"+Vue.domainName
        })
        if (ret&&ret.identity&&ret.identity.driver=='ldap') {
          Vue.isLdap = true;
          this.operationMenus[0].subMenus[0].flg = false;
          this.operationMenus[0].subMenus[1].flg = false;
        }
      },
      async getOrderNum () {
        if (!Vue.service['leo']) { // 不部署时，不请求
          return;
        }
        var self = this;
        var approverId = Vue.userId;
        var projectId = "";
        if (Vue.roleType == "0") {
          projectId = "";
        } else {
          projectId = this.$cookie.get('pid');
        };
        var params = {
          "approver_id": approverId,
          "role_type": Vue.roleType,
          "project_id": projectId
        };
        params = JSON.stringify(params);
        var approvingOrderNum;
        var approvingFaultNum;
        try {
          let ret = await self.$ajax({
            type: "PUT",
            data: params,
            polling: true,
            url: "api/leo/v1/order/get_approve_order_amount"
          });
          approvingOrderNum = ret.data.flow_order_approve_amount;
          approvingFaultNum = ret.data.work_order_approve_amount;
        } catch (res) {
          console.log("获取待审批订单统计数目失败");
        };
        self.setOrderInfo({faultNum: approvingOrderNum, orderNum: approvingFaultNum});
      },
      getInteligentData() {
        let me = this;
        let ret = this.$ajax({
          type: 'get',
          url: "api/pluto/v1/alert/summary",
          successFun(data) {
            me.intelligentData = data.alert_info;
          }
        })
      },
      flowDeal() {
        this.$router.push({
          path: '/operations/flow'
        });
      },
      faultFault() {
        this.$router.push({
          path: '/operations/fault'
        });
      },
      checkStyleActive(style) {
        this.operationMenus[2].subMenus.forEach((item, index) => {
          item.isActive = false;
          if (item.key === style) {
            item.isActive = true;
          }
        });
      },
      async onOperationSelect(index, indexPath, vm) {
        let me = this;
        switch (index) {
          case 'logout':
            try {
              //退出之前记录日志
              let traceId = 'req-'+uuid.v1();
              await this.$ajax({
                type: 'post',
                url: "node-api/keystone/recordLog",
                contentType: "application/json",
                data:JSON.stringify({
                  logs:[{
                    region_id:this.$cookie.get('region_id')||"",
                    user_name: Vue.userName,
                    user_id:Vue.userId,
                    project_id:Vue.roleType==0?"":this.$cookie.get("pid"),
                    target:Vue.logTarget.user.en,
                    log_level:"info",
                    description:Vue.userName+" user exit logon",
                    language:"en",
                    trace_id: traceId
                  }, {
                    region_id:this.$cookie.get('region_id')||"",
                    user_name: Vue.userName,
                    user_id:Vue.userId,
                    project_id:Vue.roleType==0?"":this.$cookie.get("pid"),
                    target:Vue.logTarget.user.zh_cn,
                    log_level:"信息",
                    description:Vue.userName+"用户退出登录",
                    language:"zh_cn",
                    trace_id: traceId
                  }]
                })
              })
              let ret = await this.$ajax({
                type: "post",
                url: "node-api/logout",
                headers: {
                  'X-Openstack-Request-Id': traceId
                }
              });
              // this.$cookie.delete('pid');
              document.location.href = "login.html";
            } catch (data) {
              __DEV__ && console.warn(data);
            }
            break;
          case 'helpBook':
            window.open('/static/pdfjs/web/viewhelp.html?arch='+Vue.arch, '_blank');
            break;
          case 'sceneBase':
            const PORT_SCENCE = '8200';
            let host = window.location.host;
            let path = "";
            let port = window.location.port;
            if (port) {
              path = 'http://' + host.split(port)[0] + PORT_SCENCE;
            } else {
              path = 'http://' + host + ":" + PORT_SCENCE;
            }
            window.open(path);
            break;
          case 'user-info':
            this.userMessageFlg = true;
            this.$nextTick(() => {
              me.$refs.userMessage.show();
            });
            break;
          case 'modify-password':
            this.modifyPasswordFlg = true;
            this.$nextTick(() => {
              me.$refs.modifyPassword.show();
            });
            break;
          case 'about':
            this.aboutUsFlg = true;
            this.$nextTick(() => {
              me.$refs.aboutUs.show();
            });
            break;
          case 'customStartPage':
            this.startpageFlag = true;
            this.$nextTick(() => {
              me.$refs.startPage.show();
            });
            break;
          default:
        }
        if (['light', 'dark', 'blue'].indexOf(index) >= 0) {
          this.$cookie.set('theme', index, { expires: '1D' });
          this.checkStyleActive(index);
          window.location.reload();
        }
        if (["virtualResource", "physicalResource", "digitalVisualizationScreen"].indexOf(index)>=0) {
          let width = screen.availWidth;
          let height = screen.availHeight;
          switch (index) {
            case 'digitalVisualizationScreen':
              window.open('/digitalVisualizationScreen.html', '_blank', 'resizable=yes,left=0, top=0,width='+ width +', height='+height);
              break;
          }
        }
        this.operationIndex = Math.random()+"";
      },
      async getProjectToken(projectId) {
        try {
          document.location.href = "index.html";
        } catch (data) {
          __DEV__ && console.warn(data);
        }
      },
      handleChange(value) {
        this.loading = true;
        this.commandSelected = value;
        let pid = value.substring(0, value.length-2);
        this.$cookie.set("pid", pid, { expires: '1D' });
        this.$cookie.set("roleType", value.substring(value.length-1), { expires: '1D' });
        this.$cookie.set("switch", "project", { expires: '1D' });
        this.getProjectToken(pid);
      },
      regionChange(value) {
        this.loading = true;
        this.regionValue = value;
        this.$cookie.set("region_id", value, { expires: '1D' });
        this.$cookie.set("switch", "region", { expires: '1D' });
        document.location.href = "index.html";
      },
      menuChanged (name, path) {
        this.$router.push({
          path: path,
          query: {
            __: +new Date()
          }
        });
      },
      goToGrafana() {
        window.open("http://"+window.location.hostname+":3000");
      },
      async checkPasswordExpired() {
        const $this = this;
        try {
          const res = await $this.$ajax({
            type: 'get',
            showErrMsg: false,
            url: `api/keystone/v3/users/${Vue.userId}`
          });
          if (res.user.password_expires_at !== null) {
            const expiredAt = moment.utc(res.user.password_expires_at);
            expiredAt.local();
            const now = moment();
            const diff = expiredAt.diff(now, 'days');
            if (diff <= 30) {
              $this.$message.warning($this.$t('base.LOGIN_PASSWORD_EXPIRED_ALMOST_EXPIRED', Math.ceil(diff)));
            }
          }
        } catch (e) {
          __DEV__ && console.error(e);
        }
      },
      // 检查试用版序列号是否不足30天
      async checkLicenseExpired() {
        const $this = this;
        try {
          const res = await $this.$ajax({
            type: 'get',
            showErrMsg: false,
            url: 'api/keystone/v3/inspur/serialnumber'
          });
          $this.licenseInfo.nodeAmount = res.sn_detail.node_num;
          if (res.sn_list.findIndex(item => item.type === 'formal_license') !== -1) {
            $this.licenseInfo.trialEdition = false;
          }
          const licenseNoLongRemain = $this.$cookie.get('icosLicenseNoLongRemain');
          if (licenseNoLongRemain !== 'true') {
            if ('left_days' in res.sn_detail) {
              const leftDays = res.sn_detail.left_days;
              if (leftDays < 30 && leftDays >= 0) {
                const h = $this.$createElement;
                const notify = $this.$notify.warning({
                  title: $this.$t('base.SERIAL_NUMBER_NOTIFY_DUE'),
                  message: h('div', [$this.$t('base.SERIAL_NUMBER_NOTIFY_PRODUCT_DUE', leftDays), h('el-button', {
                    attrs: {
                      type: 'text'
                    },
                    style: {
                      padding: '2px'
                    },
                    on: {
                      click() {
                        $this.$cookie.set('icosLicenseNoLongRemain', 'true');
                        notify.close();
                      }
                    }
                  }, $this.$t('base.SERIAL_NUMBER_NOTIFY_NO_LONG_REMAIN'))]),
                  duration: 0
                });
              }
            }
          }
        } catch (e) {
          __DEV__ && console.error(e);
        }
      },
      // 检查维保序列号是否余量不足，不足则提示
      async checkMaintenanceExpired() {
        const $this = this;
        const maintenanceExpiredNoLongRemain = $this.$cookie.get('icosMaintenanceExpiredNoLongRemain');
        const maintenanceAlmostExpiredNoLongRemain = $this.$cookie.get('icosMaintenanceAlmostExpiredNoLongRemain');
        if (!$this.licenseInfo.trialEdition) {
          try {
            const res = await $this.$ajax({
              type: 'get',
              showErrMsg: false,
              url: `api/keystone/v3/inspur/maintenancenumber`
            });
            let maintenanceDays = res.info.maintenance / $this.licenseInfo.nodeAmount;
            maintenanceDays = Math.floor(maintenanceDays);

            let cookieKey = '';
            let notifyTitle = '';
            let notifyMessage = '';
            if (maintenanceDays < 0 && maintenanceExpiredNoLongRemain !== 'true') {
              cookieKey = 'icosMaintenanceExpiredNoLongRemain';
              notifyTitle = $this.$t('base.SERIAL_NUMBER_NOTIFY_EXPIRED');
              notifyMessage = $this.$t('base.SERIAL_NUMBER_NOTIFY_MAINTENANCE_EXPIRED');
            } else if (maintenanceDays >= 0 && maintenanceDays < 30 && maintenanceAlmostExpiredNoLongRemain !== 'true') {
              cookieKey = 'icosMaintenanceAlmostExpiredNoLongRemain';
              notifyTitle = $this.$t('base.SERIAL_NUMBER_NOTIFY_DUE');
              notifyMessage = $this.$t('base.SERIAL_NUMBER_NOTIFY_MAINTENANCE_DUE', maintenanceDays);
            }

            if (cookieKey !== '') {
              const h = $this.$createElement;
              const notify = $this.$notify.warning({
                title: notifyTitle,
                message: h('div', [notifyMessage, h('el-button', {
                  attrs: {
                    type: 'text'
                  },
                  style: {
                    padding: '2px'
                  },
                  on: {
                    click() {
                      $this.$cookie.set(cookieKey, 'true');
                      notify.close();
                    }
                  }
                }, $this.$t('base.SERIAL_NUMBER_NOTIFY_NO_LONG_REMAIN'))]),
                duration: 0
              });
            }
            $this.maintenanceCal();
          } catch (e) {
            __DEV__ && console.error(e);
          }
        }
      },
      // 自动触发维保序列号剩余时间计算，以防止自动计算数据被篡改
      async maintenanceCal() {
        const $this = this;
        await $this.$ajax({
          type: 'post',
          showErrMsg: false,
          url: 'api/keystone/v3/inspur/maintenancenumber/cal',
          data: JSON.stringify({})
        });
      },
      handleStartPageShow() {
        this.$router.push({
          path: '/startPage',
          query: {
            __: +new Date()
          }
        });
      }
    },
    components: {
      UserMessage,
      ModifyPassword,
      AboutUs,
      StartPageSet
    }
  };
</script>
<style>
.logo-change-width {
  transition: width .28s ease-out
}
.icos-logo {
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
  height: 100%;
  transition: all .3s cubic-bezier(1,0,1,.17), .3s;
}
.item {
  display:block;
  padding: 0 0 5px 0;
}
.name-wrapper {
  display: inline-block;
}
.vertical .el-checkbox+.el-checkbox {
  margin-left: 0;
}
.el-pagination {
  float: right;
}
.tab-pane-no-padding .el-tabs__content {
  padding: 0;
}
</style>
