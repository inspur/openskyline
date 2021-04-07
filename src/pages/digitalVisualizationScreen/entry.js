
import Vue from 'vue';
import index from './index.vue';
window.location.hash = '#';
import "utils/";
import vuecookie from 'vue-cookie';
Vue.use(vuecookie);
import vueLocal from "../../locale";

import fileSize from '../../filters/fileSize';

Vue.filter('fileSize', fileSize);

vueLocal.init(Vue.Language || Vue.cookie.get('defaultLanguage'));
document.title = document.title = Vue.oemSwitch === true ? Vue.oemProductName : (Vue.archIs('x86') ? Vue.t('base.mainTitle') : Vue.t('base.mainTitleAK'));

import progressbar from 'components/progressbar/progressbar.js';
Vue.use(progressbar, {
  color: 'rgb(34, 153, 221)',
  failedColor: 'red',
  thickness: '3px'
});

const app = new Vue({
  el: '#digitalVisualizationScreen',
  template: '<index/>',
  components: {
    index
  }
});
