import dateFormat from "./date";
import formatterUtils from "./formatterUtils";
import trimQS from './trimQs';
import vueMsg from "./vueMsg";
import vueAjax from "./vueAjax";
import vueMixins from "./vueMixins";
import vueGlobal from "./vueGlobal";
import vueBackTop from "./vueBackTop";
import vueTopoCommon from "./topoCommon";
import recordLog from './recordLog';
import sortFormatter from './sortFormatter';
import isJSON from './isJSON';
import computeStrWidth from './computeStrWidth';
import directives from './directives';
import stringToDate from './stringToDate';
import archIs from './archIs';
import util from './util';

const components = {
  vueAjax,
  vueMixins,
  vueGlobal,
  vueBackTop,
  vueMsg,
  vueTopoCommon,
  formatterUtils,
  recordLog,
  sortFormatter,
  isJSON,
  computeStrWidth,
  directives,
  stringToDate,
  archIs
};

Object.keys(components).forEach((key, index) => {
  Vue.use(components[key]);
});

export {
  dateFormat,
  trimQS,
  util
};
