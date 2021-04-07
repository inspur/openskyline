# ICOSSearchBar ICOS统一搜索条
## 概述

> 本组件提供了一种统一的搜索条，各组件可通过配置的方式引用本组件，并完成条件组装、校验、输出搜索字符串等功能。

## 概念解释

### 基础搜索

> 一次只能选择一个条件进行搜索。

### 高级搜索

> 组合查询，可同时支持多条件查询。

## 入参

### conditions 查询条件（object）

说明：

```
{
  key: {                        // 条件键
    label: '',                  // 显示名
    type: 'input',              // 输入方式，input手动输入 select下拉搜索 cascader级联选择
    options: []                 // select或cascader选择项
    validator: (value) => {},   // 校验函数，仅针对input方式有效
    visible: true               // 是否显示,
    placeholder: ''             // input类型支持指定placeholder，不设置默认为“请输入关键字”
}, ...}
```

select选择项：

```
[{
    label: '',                  // 显示值
    value: ''                   // 实际值
}, ...]
```

cascader选择项：

```
[{
    label: '',                  // 显示值
    value: ''                   // 实际值
    children: []                // 子项。没有子项可不写children
}, ...]
```

### advanced-disabled 是否禁用高级搜索（boolean）

说明：

```
    有些仅有一个条件的场景可手动禁用高级搜索，设为true即可。
```

## 事件

### search 搜索

说明：
```
  参数为params，即通过校验的参数对象。根据这个对象触发搜索业务。
```

对象转字符串方法：
```
  Object.keys(params).map(key => {
    return `${key}=${params[key]}`;
  }).join('&');
```

### condition-value-changed 条件值变化

说明：
```
  有些业务需要在条件值变化时发送通知，以便处理与之关联的字段。如项目-用户关联。
  参数为condition，包含key和value。如果是input类型的条件，则这个值时校验前的值。
  仅高级查询有效。
```