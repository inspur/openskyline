# skyline

![image](https://forgeplus.trustie.net/projects/ga0fei/skyline/tree/master/skyline-logo.png?raw=true)

> Skyline是最好的OpenStack控制台，对标OpenStack社区Horizon项目，在易用性、页面性能等方面进行深度优化，提供简单、易用、高效的OpenStack控制台。

## 配置修改
复制server/resouces/default/serviceAddr.template.json到server/resouces/default/serviceAddr.json
修改keystone配置项为openstack平台keystone模块Endpoint

## 代码构建

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:4001
npm run dev

# build for production with minification
npm run build

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```
