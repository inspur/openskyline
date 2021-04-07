### 加速器业务开发规则

加速器规格的groups组装格式：
```
    trait:CUSTOM_GPU_PRODUCT_ID_1DB6
    trait:CUSTOM_GPU_NVIDIA
    resources:PGPU
```
这3条组成1个group
其中第一行的1DB6是产品的product_id；
第二行的NVIDIA是vendor；
第三行的PGPU是type。

使用时需使用正则表达式将他们抽出，保存时按照此格式进行保存。

由于group的特殊定义，并没有办法保存产品名，也无法在后端联查。所以产品名与product_id的对应在前端进行，对应需要对照加速器列表。

加速器规格中，同一个type-vendor-product_id只能有一条。数量不可超过这个type-vendor-product_id的总数。

由于后端接口返回数据大小写不统一，因此在获取数据以后都转为大写进行操作，保存时也保存大写。
