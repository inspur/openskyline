import element from "./element";
import validation from './validation';
import code from './code';
import lang from './lang';
import opt from './opt';
import base from './base';
import calculateStorage from './calculateStorage';
import storage from './storage';
import scalingService from './scalingService';
import serviceOrchestration from './serviceOrchestration';
import database from './database';
import network from './network';
import container from './container';
import cloudTask from './cloudTask';
import report from './report';
import monitor from './monitor';
import operationAnalysis from './operationAnalysis';
import baremachine from "./baremachine";
import bigScreen from "./bigScreen";
import cloudData from "./cloudData";

export default {
  el: element.el,
  code: code,
  validation: validation,
  lang: lang.lang,
  opt: opt.opt,
  base: base.base,
  calcStorLang: calculateStorage.lang,
  storage: storage.storage,
  scalingService: scalingService.scalingService,
  heat: serviceOrchestration.heat,
  db: database.db,
  network: network.lang,
  container: container.container,
  task: cloudTask.task,
  report: report.report,
  monitor: monitor.lang,
  baremachine: baremachine.lang,
  operationAnalysis: operationAnalysis.lang,
  bigScreen: bigScreen,
  cloudData: cloudData.cloudData
};
