###后台管理Api-功能表设置
#### 1.功能解锁列表
#####位置
后台管理 > 系统参数 > 功能解锁列表
##### 接口名称
``` js
POST /admin/player/{page}/{size} 
body:
{
  "where": {} // 传空
}
```
##### 示例
``` js
{
  "message": "查询成功",
  "statusCode": 107,
  "status": true,
  "resource": [
    {
      "_id": "5c7cc4c67432163f4dc19a44",
      "id": 1001,
      "des": "解锁土地",
      "index": 3,
      "class": -1,
      "function": "解锁新土地",
      "tip": "解锁了一块新土地",
      "beizhu": "点击“确定”按钮关闭窗口！"
    }
  ],
  "sum": 1
}
```
##### 列表显示字段及说明
字段|显示名称|意义
---|----|------
id|id|id
function | 名称 | 功能名称
class|解锁等级|该功能解锁的等级
tip | 前端提示文字 | 解锁时显示在前端的提示文字
beizhu |备注 | 该功能的一些解释
#### 2.功能解锁设置详情
##### 接口名称
``` js
GET /admin/player/{id}
params:
id // 文档_id
```
##### 示例
``` js
{
  "message": "查询成功",
  "statusCode": 107,
  "status": true,
  "resource": {
    "_id": "5c7cc4c67432163f4dc19a44",
    "id": 1001,
    "des": "解锁土地",
    "index": 3,
    "class": -1,
    "function": "解锁新土地",
    "tip": "解锁了一块新土地",
    "beizhu": "点击“确定”按钮关闭窗口！"
  }
}
```
##### 详情显示字段及说明
同列表
#### 3.编辑功能解锁设置
##### 接口名称
``` js
PUT /admin/player/{id}
```
##### 接口可编辑参数
`tip` **参数名称：前端提示说明；类型：string;**
`class` **参数名称：解锁等级；类型：number;**
##### 示例
``` js
{
  "message": "更新成功！",
  "statusCode": 101,
  "status": true
}
```
##### 参数名称及意义
同列表
