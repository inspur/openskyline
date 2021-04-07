/**
 * beforeEach 与 afterEach 最显著的区别是后者无法调用任何切换函数，详见：
 * https://github.com/vuejs/vue-router/blob/1.0/docs/zh-cn/api/before-each.md
 * https://github.com/vuejs/vue-router/blob/1.0/docs/zh-cn/api/after-each.md
 */
import authInterceptor from './beforeEach/authInterceptor'
import docTitleReplacer from './afterEach/docTitleReplacer'
import scrollToTop from './afterEach/scrollToTop'
import simpleLogger from './afterEach/simpleLogger'

import titleInterceptor from './beforeEach/titleInterceptor';
import toFirstMenuInterceptor from './beforeEach/toFirstMenuInterceptor';
import breadcrumbInterceptor from './beforeEach/breadcrumbInterceptor';
import forceInterceptor from './beforeEach/forceInterceptor';

export default (router) => {
  router.beforeEach(titleInterceptor(router));
  router.beforeEach(toFirstMenuInterceptor(router));
  router.beforeEach(forceInterceptor(router));
  router.beforeEach(breadcrumbInterceptor(router));
  router.afterEach(scrollToTop);

  router.beforeEach((to, from, next) => {
    Vue.Progress.hide();
    Vue.Progress.start();
    next();
  });

  router.afterEach( (to, from) => {
    Vue.Progress.finish();
  });
  // router.afterEach(docTitleReplacer)
  // if (__DEV__) {
  //     router.afterEach(simpleLogger)
  // }
}
