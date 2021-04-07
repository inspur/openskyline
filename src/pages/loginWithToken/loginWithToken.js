import Vue from 'vue';
import VueCookie from 'vue-cookie';
import progressbar from 'components/progressbar/progressbar.js';
Vue.use(VueCookie);
// 路由映射
import LoginWithToken from './LoginWithToken.vue';
Vue.use(progressbar, {
  color: '#bffaf3',
  failedColor: 'red',
  thickness: '3px'
});

// 4. 创建和挂载根实例。
// 记得要通过 router 配置参数注入路由，
// 从而让整个应用都有路由功能
const app = new Vue({
  el: '#loginWithToken',
  template: '<login-with-token />',
  components: {
    LoginWithToken
  }
});
