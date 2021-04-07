/**
 * 按需全局化过滤器
 * 您还可以在组件定义时的 filters 属性中按需引入
 */
import Vue from 'vue';
import dateTimeFormatter from './dateTimeFormatter';
import render from './render';
import tzTimeFormatter from './tzTimeFormatter';
import fileSize from './fileSize';
import fillHyphen from './fillHyphen';

Vue.filter('dateTimeFormatter', dateTimeFormatter);
Vue.filter('tzTimeFormatter', tzTimeFormatter);
Vue.filter('fileSize', fileSize);
Vue.filter('fillHyphen', fillHyphen);

Object.keys(render).forEach((key) => {
  Vue.filter(key, render[key]);
});
