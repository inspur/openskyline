// 权限拦截
const titleInterceptor = (router) => (to, from, next) => {
  const { meta, path } = to;
  document.title = to.meta.title || Vue.oemSwitch === true ? Vue.oemProductName : (Vue.archIs('x86') ? Vue.t('base.mainTitle') : Vue.t('base.mainTitleAK'));
  next();
};

export default titleInterceptor;
