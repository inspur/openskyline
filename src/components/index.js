import MainFrame from './MainFrame';
import OperationPanel from './OperationPanel';
import OperationPanelNew from './OperationPanelNew';
import Ztree from './ztree/index';
import Panel from './panel/Panel';
import IEcharts from 'vue-echarts-v3/src/full.vue';
import Affix from './affix/';
import Page from './page/Page';
import ColumnHover from './columnHover/ColumnHover';
import IcosTag from './icos/tag/Tag';
import ICOSPageHeader from './icos-page-header';
import ICOSPage from './icos-page';
import TableAttachment from './icos/tableAttachment/TableAttachment';
import SelectProject from './selectProject/SelectProject';
import SelectUser from './selectUser/SelectUser';
import ExpandableCell from './expandableCell/ExpandableCell';
import ICOSColumnSelector from './icos-column-selector';
import ICOSSearchBar from './icos-search-bar';
import Element2Dialog from './element2/Dialog';
import Element2Transfer from './element2/Transfer';
import Element2Select from './element2/Select';
import Element2Option from './element2/Option';
import Element2Tooltip from './element2/Tooltip';
const iComponents = {
  MainFrame: MainFrame,
  OperationPanel: OperationPanel,
  OperationPanelNew: OperationPanelNew,
  IcosTag: IcosTag,
  TableAttachment: TableAttachment,
  Ztree: Ztree,
  Panel: Panel,
  IEcharts: IEcharts,
  Affix: Affix,
  Page: Page,
  SelectProject,
  SelectUser,
  ExpandableCell: ExpandableCell,
  ColumnHover: ColumnHover,
  'icos-column-selector': ICOSColumnSelector,
  'icos-search-bar': ICOSSearchBar,
  'icos-page-header': ICOSPageHeader,
  'icos-page': ICOSPage,
  'el2-dialog': Element2Dialog,
  'el2-transfer': Element2Transfer,
  'el2-select': Element2Select,
  'el2-option': Element2Option,
  'el2-tooltip': Element2Tooltip
};

const install = function(Vue, opts = {}) {
  Object.keys(iComponents).forEach((key) => {
    Vue.component(key, iComponents[key]);
  });
};

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

module.exports = Object.assign(iComponents, { install }); // eslint-disable-line no-undef
