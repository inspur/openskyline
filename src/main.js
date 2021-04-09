import './assets/styles/index-light.css';
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
// 路由映射
import store from './store/index';
import './filters/';
import App from './views/App';
//UI框架Element
import ElementUI from 'element-ui';
Vue.use(ElementUI);

// 修改element-dialog默认配置 gerrit
ElementUI.Dialog.props.closeOnPressEscape.default = false;
ElementUI.Dialog.props.closeOnClickModal.default = false;
// 表格内容overflow默认配置
ElementUI.Table.props.tooltipEffect.default = "dark"; // dark/light
ElementUI.Table.props.border.default = true;
ElementUI.Table.props.stripe.default = true;
// 重写表格排序toggle方法 - 实现升序->降序->升序循环(ElementUI默认为升序->降序->无序->升序循环)
ElementUI.Table.components.TableHeader.methods.toggleOrder = function(order) {
  return !order ? 'ascending' : order === 'ascending' ? 'descending' : 'ascending';
};
ElementUI.TableColumn.props.showOverflowTooltip.default = true;
//form表单label位置默认设置
ElementUI.Form.props.labelPosition.default = "left";
// 分页组件每页显示条数选择配置 - 后端分页
ElementUI.Pagination.props.pageSizes.default = () => [5, 10, 20, 30, 40, 60, 80, 100];
//弹框遮罩层设置
ElementUI.Dialog.props.modalAppendToBody.default = false;

import VueCookie from 'vue-cookie';
Vue.use(VueCookie);

import progressbar from 'components/progressbar/progressbar.js';

Vue.use(progressbar, {
  // color: '#bffaf3',
  color: 'rgb(34, 153, 221)',
  failedColor: 'red',
  thickness: '3px'
});

//封装组件
import iComponents from "components/";

import "utils/";
import vueLocal from "./locale";
import rule from './rule';
import router from './routes/';
import { unflod, changeWidth } from 'directives/';
import logTarget from './logTarget.json';
Vue.use(unflod);
Vue.use(changeWidth);

Vue.use(iComponents);

//国际化
vueLocal.init(Vue.language);
//全局校验规则
rule.init();

//下拉默认的placeholder
ElementUI.Select.props.placeholder.default = Vue.t('base.pleaseSelect');
ElementUI.Cascader.props.placeholder.default = Vue.t('base.pleaseSelect');

//绑定logTarget
Vue.logTarget = logTarget;

// 4. 创建和挂载根实例。
// 记得要通过 router 配置参数注入路由，
// 从而让整个应用都有路由功能
const app = new Vue({
  // i18n,
  router: router.getInstance(),
  store,
  el: '#app',
  template: '<App/>',
  components: {
    App
  }
});

if (__DEV__) {
  console.warn("当前处于开发环境");
};

// app.$data === app // -> true
// app.$el === document.getElementById('example') // -> true
// // $watch 是一个实例方法
// app.$watch('a', function (newVal, oldVal) {
//   // 这个回调将在 `app.a`  改变后调用
// })

// 现在，应用已经启动了！
