import * as utils from 'utils/';

/**
 * 不同页面间的跳转，把视图拉回顶部
 */
const scrollToTop = (to, from) => {
  if (utils.trimQS(to.path) !== utils.trimQS(from.path)) {
    // $.scrollTo('#navbar', 500)
    // let sTop = document.documentElement.scrollTop || document.body.scrollTop;
    let el = document.querySelector('.layout-content-main')|| {};
    Vue.scrollTop(el, el.scrollTop, 0);
  }
}

export default scrollToTop
