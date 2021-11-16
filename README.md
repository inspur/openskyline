[![image](https://lbworks-oss.oss-cn-qingdao.aliyuncs.com/Mulan-incubating-blue.svg)](http://mulanos.cn)

# skyline

![](https://lbworks-oss.oss-cn-qingdao.aliyuncs.com/skyline-logo-90x90.png
)

> Skyline是最好的OpenStack控制台，对标OpenStack社区Horizon项目，在易用性、页面性能等方面进行深度优化，提供简单、易用、高效的OpenStack控制台。
> 基于REST API进行业务功能设计，功能模块化设计符合高内聚、低耦合，可方便进行功能开发、扩展。
> 前后端开发完全分离，开发者更聚焦于UI展示、操作易用性、用户体验方面的开发。
> 引入主流的MVVM前端技术架构，让开发者从繁杂的DOM操作及维护数据和展示的一致性中脱离出来。
> 提供对原生OpenStack计算、存储、网络等云资源的管理，兼容OpenStack原生API。

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
