import startPage from './startPage';
import calculateStorage from './calculateStorage';
import network from './network';
import database from './database';
import container from './container';
import cloudData from "./cloudData";
import operationManage from './operations';
import serviceOrchestration from './serviceOrchestration';
import scalingService from './scalingService';
import workflow from './workflow';
import intelligentMonitoring from './intelligentMonitoring';
import operationAnalysis from './operationAnalysis';
import systemManagement from './systemManagement';

module.exports = function() {
  return [
    startPage.bind(this)(),
    calculateStorage.bind(this)(),
    network.bind(this)(),
    database.bind(this)(),
    container.bind(this)(),
    cloudData.bind(this)(),
    serviceOrchestration.bind(this)(),
    scalingService.bind(this)(),
    operationManage.bind(this)(),
    workflow.bind(this)(),
    intelligentMonitoring.bind(this)(),
    operationAnalysis.bind(this)(),
    systemManagement.bind(this)()
  ];
};
