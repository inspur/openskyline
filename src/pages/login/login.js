// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
// 路由映射
import '../../filters/';
import 'assets/styles/common/reset.css';
import 'assets/styles/element-ui/index-default.css';
import 'assets/styles/element-ui/element-fix.css';
import 'assets/styles/common/font-awesome/font-awesome.css';
import progressbar from 'components/progressbar/progressbar.js';
import Login from './Login.vue';
Vue.use(progressbar, {
  color: '#bffaf3',
  failedColor: 'red',
  thickness: '3px'
});
//UI框架
//UI框架Element
import ElementUI from 'element-ui';
Vue.use(ElementUI);
window.location.hash = '#';
import "utils/";
import vuecookie from 'vue-cookie';
Vue.use(vuecookie);
import vueLocal from "../../locale";
import rule from '../../rule';

vueLocal.init(Vue.Language || Vue.cookie.get('defaultLanguage') );
document.title = Vue.oemSwitch === true ? Vue.oemProductName : (Vue.archIs('x86') ? Vue.t('base.mainTitle') : Vue.t('base.mainTitleAK'));

rule.init();
const app = new Vue({
  el: '#login',
  template: '<Login/>',
  components: {
    Login
  }
});
