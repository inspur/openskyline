[![svg](https://lbworks-oss.oss-cn-qingdao.aliyuncs.com/Mulan-incubating-blue-small.png)](http://mulanos.cn)

# OpenSkyline

![](./skyline-logo-90x90.png)

```
OpenSkyline是一个OpenStack控制台项目，对标OpenStack社区Horizon项目，在易用性、页面性能等方面进行深度优化，提供简单、易用、高效的OpenStack控制台。

基于REST API进行业务功能设计，功能模块化设计符合高内聚、低耦合，可方便进行功能开发、扩展。
前后端开发完全分离，开发者更聚焦于UI展示、操作易用性、用户体验方面的开发。

引入主流的MVVM前端技术架构，让开发者从繁杂的DOM操作及维护数据和展示的一致性中脱离出来。

提供对原生OpenStack计算、存储、网络等云资源的管理，兼容OpenStack原生API。
```

## 配置修改
```
1. 将`server/resouces/default/serviceAddr.template.json`复制到`server/resouces/default/serviceAddr.json`。
2. 修改keystone配置项为openstack平台keystone模块endpoint。例如10.49.38.52/identity
```

## 调试&构建

``` bash
# 安装依赖
npm install

# 启动开发环境（支持热更替）
npm run dev

# 启动开发环境（仅调试server端）
npm run dev-server

# 构建
npm run build

```
