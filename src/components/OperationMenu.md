## OperationPanel 说明及示例

###### 文件位置：

**`src/componets/OperationMenupanel.vue`**

###### 控制优先级 nonSelected > readOnly >enable()

```javascript
[{
  //图标
  icon: "fa-camera",
  //按钮的文本内容
  name: this.$t("storage.createImage"),
  //控制是否展示，主要用于权限限制。
  showflg: this.isUser(),
  //是否收到‘更多选项’栏里。
  operateMore: true,
  //和列表选中内容无关，初始化可用，为避免歧义，选中需要置灰，取消选中恢复可用。
  nonSelected: true,
  //是否一直可用，和列表选中内容无关联。
  readOnly: true,
  //是否支持多选
  multi: true,
  //按钮是否可用。
  enable(rowData) {
    let roleType = Vue.roleType + "";
    return rowData["status"] == "available" 
  },
  //点击以后要执行的代码。
  handler: function (selectRows) {
    let me = this;
    let row = selectRows[0];
    me.volumeTempId = row["id"];
    me.temp_volume_name = row["name"];
    me.volumeImageFlg = true;
  }
}]
```

## 

##### 设计思路

- 界面初始化时
  
  1. 通过watch监控operationMenus，组件加载的时候初始化数据的传入，来初始化按钮组this.menus和this.menusMore，主要用于初始化各个按钮是否可用。当传入readOnly或nonSelected值时保证常亮。
  
  2. 通过按钮上的v-if="men.showflg",来控制按钮是否展示到当前界面。

- 当操作表格时（按照优先级）
  
  1. 首先判断nonSelected，该属性为true时的逻辑为，选中任意数据均置灰设置了nonSelected为true的按钮，当前无任意一条数据选中，取消置灰。 优先级最高
  
  2. 判断readOnly属性，该属性为true时的逻辑为无论什么时候都为可用状态。优先级其次
  
  3. 当noSelected和readOnly未传入或false的时候：
     
     - 当未选中任意数据时，按钮不可用
     
     - 当multi不为true时，即不支持多选，则选中数据大于一条，按钮不可用
     
     - 除去前边提到的以外的所有其他场景，需要遍历选中的列表，判断是否满足按钮的enable条件，同时需要判断按钮的enable函数是否传入了。不满足enable（）设置的条件 均设置按钮不可用。
