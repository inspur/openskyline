
const archIs = {};

archIs.install = function (Vue, options) {
  function archIsFunc(...archs) {
    let arch = Vue.arch ? Vue.arch.trim().toLowerCase() : 'x86';
    for (let i = 0; i < archs.length; i++) {
      archs[i] = archs[i].toLowerCase();
    }
    return archs.indexOf(arch) !== -1;
  }
  Vue.archIs = archIsFunc;
  Vue.prototype.$archIs = archIsFunc;
};

export default archIs;
