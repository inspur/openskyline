// 强制刷新
const titleInterceptor = (router) => (to, from, next) => {
  const { meta, path } = to;
  if (to.meta.force) {
    // to.query.__ = +new Date();
  }

  next();
};

export default titleInterceptor;
