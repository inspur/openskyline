// 面包屑动态标题
const titleInterceptor = (router) => (to, from, next) => {
  const { meta, path } = to;
  if (to.query.des) {
    to.matched.forEach( (item, index) => {
      if (item.meta.breadNum) {
        item.meta.des = to.query.des;
        return;
      }
    } );
  }
  next();
};

export default titleInterceptor;
