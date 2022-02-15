<template>
  <div>
    <div :style="styleNav" class="layout-sidebar layout-transition"  :class="{'layout-hide-text': isCollapse}" style="padding-bottom: 100px">
      <div style="padding-bottom: 100px">
        <el-menu :default-active="active" :default-openeds="openeds" :unique-opened="true" :collapse="isCollapse"  @select="onSelect">
          <template v-for="(menu, index) in menus">
            <el-submenu :index="menu.key" v-if="menu.flg && menu.subMenus">
              <template slot="title">
                <i :class="[menu.iconType, iconSize]"></i>
                <span class="layout-text" :title="$t(menu.name)">{{$t(menu.name)}}</span>
              </template>
              <el-menu-item v-for="(subMenu, index) in menu.subMenus" :key="subMenu.key" :index="subMenu.key" v-if="subMenu.flg">
                <i :class="[subMenu.iconType]"></i>
                <span class="layout-text" :title="$t(subMenu.name)">{{$t(subMenu.name)}}</span>
              </el-menu-item>
            </el-submenu>
            <el-menu-item :index="menu.key" v-if="menu.flg && !menu.subMenus">
              <i  :class="[menu.iconType, iconSize]"></i>
              <span slot="title" class="layout-text" :title="$t(menu.name)">{{$t(menu.name)}}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </div>
      <div class="sidebar-toggle" :style="toggleWidth" @click="toggleClick">
        <i :class="[isCollapse ? 'el-icon-fa-chevron-right' : 'el-icon-fa-chevron-left']"></i>
      </div>
    </div>
    <div :style="styleContent" class="layout-content-main" :class="{'layout-hide-text': isCollapse}">
      <div class="layout-content-header" style="" v-if="showHeader">
        <el-button type="text" :class="{ active: isCollapse }" size="large" icon="fa-bars" style="font-size: 20px; transition: all .5s ease-in-out"  @click="toggleClick">
        </el-button>
        <div class="layout-content-breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="(breadcrumb, index) in routers" :key="breadcrumb.path" :to="{path:(breadcrumb.otherPath || breadcrumb.path),query:{__:nowDate}}">
              {{$t(breadcrumb.des)}}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div>
          <slot name="quickEnter"></slot>
        </div>
      </div>
      <div class="layout-content-workspace">
        <div class="text-regular module-desc" style="font-weight: 350;" v-show="activeTitle!=null">{{$t(activeTitle)}}</div>
          <router-view :key="key"></router-view>
      </div>
      <div class="layout-copy">
        {{ copyright }}
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'MainFrame',
     // 声明 props
    props: ['activeName', 'activeOpeneds', "menus", "routers"],
    data () {
      return {
        showHeader: false,
        nowDate:Date.now(),
        isCollapse: false,
        activeTitle: "",
        active: this.activeName,
        openeds: this.activeOpeneds,
        key: '',
        toggleWidth: {
          width:this.$cookie.get("defaultLanguage")=="en"?"220px":"200px"
        },
        styleNav:{
          width:this.$cookie.get("defaultLanguage")=="en"?"220px":"200px"
        },
        styleContent:{
          left:this.$cookie.get("defaultLanguage")=="en"?"220px":"200px"
        },
        copyright: ''
      };
    },
    computed: {
      iconSize () {
        return this.isCollapse ? "icon-size-20" : "icon-size-14";
      }
    },
    mounted () {
      this.copyright = Vue.oemSwitch ? Vue.oemCopyright: '© 2022 OpenSkyline';
    },
    watch: {
      // 切换页面
      '$route' (to, from) {
        // this.showHeader=to.matched.filter(v => { return v.meta && v.meta.des }).length>1;

        if (from.matched.length && to.matched.length &&
          (from.matched[from.matched.length-1].path ===
            to.matched[to.matched.length-1].path) ) {
          this.key = this.$route.name + +new Date();
        }
        var matchList = this.$route.matched;
        if (matchList != null) {
           this.activeTitle = this.recurisiveRouter(matchList);
        }
        this.nowDate = Date.now();
      },
      activeName(newVal) {
        this.active = newVal;
      },
      activeOpeneds(newVal) {
        this.openeds = newVal;
      }
    },
    methods: {
      recurisiveRouter(list) {
        for (let a = list.length-1; a >=0; a--) {
           let obj = list[a];
           if (obj.meta != null && obj.meta.desContent != null) {
              return obj.meta.desContent;
           } else {
              continue;
           }
        }
            return null;
      },
      toggleClick () {
        this.isCollapse = !this.isCollapse;
        if (this.isCollapse) {
          this.styleNav = {};
          this.styleContent = {};
          this.toggleWidth = {
            width : "64px"
          };
          this.$emit("changeLogoWidth", {logWidth:"64", smallLog: true});
        } else {
          this.$emit("changeLogoWidth", "");
          this.toggleWidth = {
            width : this.$cookie.get("defaultLanguage")=="en"?"220px":"200px"
          };
          this.styleNav = {
            width:this.$cookie.get("defaultLanguage")=="en"?"220px":"200px"
          };
          this.styleContent = {
            left:this.$cookie.get("defaultLanguage")=="en"?"220px":"200px"
          }
        }
      },
      onSelect (name) {
        let path = "";
        this.menus.some((item, index) => {
          path = "";
          if (!item.key) {
            return false;
          }
          if (name === item.key ) {
            path = item.path || "";
            return true;
          }

          path += item.path || "";
          let flg = false;
          (item.subMenus ||[]).forEach((menu, key) => {
            if (name === menu.key) {
              path += menu.path || "";
              flg = true;
              return;
            }
          });
          if (flg) {
            return true;
          }

          return false;
        });
        this.$emit('menuChanged', name, path);
      }
    }
  }
</script>
<style scoped>
  .sidebar-toggle{
    transition: all .28s ease-out;
    position: fixed;
    height: 32px;
    background-color: #1B2C38;
    line-height: 32px;
    color: #FFFFFF;
    text-align: center;
    bottom: 8px;
    cursor: pointer;
  }
   .sidebar-toggle:hover{
     background-color: #2b4355;
   }
</style>
