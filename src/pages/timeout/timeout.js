// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import "utils/";
import Timeout from './Timeout.vue';

import vuecookie from 'vue-cookie';
Vue.use(vuecookie);
import vueLocal from "../../locale";

vueLocal.init(Vue.Language || Vue.cookie.get('defaultLanguage') );
document.title = Vue.archIs('x86') ? Vue.t('base.mainTitle') : Vue.t('base.mainTitleAK');

const app = new Vue({
  el: '#timeout',
  template: '<Timeout/>',
  components: {
    Timeout
  }
});
