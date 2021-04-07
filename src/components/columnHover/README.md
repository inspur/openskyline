## 参数列表

- type：非必选，可选值为text，值为“text”是为文字，不可点击，未传值或者不为“text”为可点击的文字按钮。

- content：必传，为单元格的内容部分。

- clickContent：当type值不为‘text’时必传，默认入参为所在表格数据行scope.row，为点击单元格内容content部分触发的事件对应的函数。当type为text的时候，不生效。

- icon：非必传，单元格左端的图标。已初始化的样式为margin-right：5px，font-size：1.5em，可通过iconStyle覆盖。

- iconStyle：非必传，左侧图标的样式，写法同style属性，给图标修改样式使用。

- row：必传，在组件内部注入到给各个传入的函数（clickContent和iconList），作为函数的参数。

- iconList：非必传，类型为数组，传入对象的字段包括icon、enabled和handler ，icon为按钮组的图标，handler为点击按钮时触发的函数，函数的默认入参为所在表格数据行的scope.row，enabled函数必须返回一个布尔值，判断所在行数据支不支持该图标按钮的展示，enabled可以不传，这时候图标默认展示。

## 使用示例

##### html部分

```html
<template slot-scope="scope">
  <column-hover type="text" :content="scope.row.name" :row="scope.row" @clickContent="clickContent" icon="fa fa-folder-open"  iconStyle="color: #ffb509" :iconList="iconList">
  </column-hover>
</template>
```

##### js部分

```js
//data部分 
iconList: [{
  icon: "fa fa-heart-o",
  enabled: function (row) {
    console.log(row); // 打印结果为所在行表格数据scope.row的值
    return row.name !== "王小虎";
  },
  handler: function (row) {
    console.log(row); // 打印结果为所在行表格数据scope.row的值
  }.bind(this)
}, {
  icon: "fa fa-share-alt",
  handler: function (row) {
    console.log(row); // 打印结果为所在行表格数据scope.row的值
  }.bind(this)
}, {
  icon: "fa fa-ellipsis-h",
  handler: function (row) {
    console.log(row); // 打印结果为所在行表格数据scope.row的值
  }.bind(this)
}]
//methods部分
clickContent (value) {
  console.log(value); // 打印结果为所在行表格数据scope.row的值
}
```


