
import Vue from 'vue';
import 'assets/styles/element-ui/index-default.css';
import 'assets/styles/element-ui/element-fix.css';
import PhysicalResource from './PhysicalResource.vue';
window.location.hash = '#';
import "utils/";
import vuecookie from 'vue-cookie';
Vue.use(vuecookie);
import vueLocal from "../../locale";

import ElementUI from 'element-ui';
Vue.use(ElementUI);

vueLocal.init(Vue.Language || Vue.cookie.get('defaultLanguage') );
document.title = Vue.t('base.mainTitle');

import progressbar from 'components/progressbar/progressbar.js';
Vue.use(progressbar, {
  color: 'rgb(34, 153, 221)',
  failedColor: 'red',
  thickness: '3px'
});

const app = new Vue({
  el: '#physicalResource',
  template: '<physical-resource/>',
  components: {
    PhysicalResource
  }
});
