##任务系统
### 配置表
```taskSetting```
```taskSetting.id---- id 配置标识```
```taskSetting.typeId---- id 任务种类 1 userUp 2 petUp 3 plant 4 feed 5 unlockBuilding 6 unlockWorkShop 7 unlockPet 8 unlockFarm 9 unlockSteal 10 steal 11 sign 12 buySeed 13  buyAnimal 14 useProp 15 share 16 harvestPlant 15 harvestFarm ```

```taskSetting.endClass---- 结束条件等级```
```taskSetting.endCount---- 结束条件次数```
```taskSetting.extId---- 关联ID```
```taskSetting.title---- 任务标题```
```taskSetting.tip---- 任务提示```
```taskSetting.steps----总进度```

```taskSetting.repeat---- 是否是重复任务 1 是 2 否```
```taskSetting.type ---- 类型 1 成长 2 日常 3 成就```
```taskSetting.autoReceive ---- 是否自动领取 1 是 2 否``` 
```taskSetting.condition ---- 领取条件0无 1 等级 2 前置``` 
```taskSetting.conClass ---- 领取条件等级限制``` 
```taskSetting.beforeId ---- 前置任务```
```taskSetting.timeLimit---- 是否限时```
```taskSetting.limitTime----任务时间```
 
```taskSetting.goTo ---任务触发```

```taskSetting.rewardGold----奖励金币```
```taskSetting.rewardExperience----奖励经验```
```taskSetting.rewardHb----奖励红包```
```taskSetting.rewardDrop----奖励道具组```
```taskSetting.rewardTl----奖励体力```
```taskSetting.rewardEss---奖励植物精华```
```taskSetting.rewardDimond ---奖励钻石```

```taskRecord```
```taskRecord.startTime --- 开始时间```
```taskRecord.progress---- 当前进度```
```taskRecord.task_id---- settingId```
```taskRecord.compeleted---- 完成状态 0 未完成 1 已完成未领取 2已完成已领取```
```taskRecord.status---- 状态 1 进行中 2 已失效```
```taskRecord.username---- 用户名```
```taskRecord.user_id---- 用户_id```

### 后台管理说明
#### 位置
后台管理 > 系统参数 > 任务列表 
#### 任务列表接口
##### 接口
```js
GET /admin/tasks/{page}/{size}
```
##### 示例 

``` js
{
  "message": "查询成功",
  "statusCode": 107,
  "status": true,
  "resource": [
    {
      "_id": "5c9ae1c5ad21f807f4269b15",
      "type": 2,  // 1 成长任务 2 日常任务 3 成就任务
      "title": "每日签到",  
      "tip": "每日登陆签到即可完成任务！",
      "typeId": "sign",  // 任务种类  userUp:用户升级  petUp:宠物升级plant:种植植物 feed:养殖动物 sign:每日签到 buySeed:购买种子 buyAnimal:购买动物 useProp:使用道具 share:分享邀请任务 harvestPlant:收获植物  harvestFarm:收获动物 
      "extId": 0,   // 关联任务id: 0 :无  >0:显示返回数字
      "autoReceive":0,// 是否自动领取 0 否 1 是
      "condition": 0, // 领取条件 0 无 1 等级 2 前置
      "conClass": 0,  //  领取等级要求 0 :无  >0:显示数字
      "beforeId": 0,  //  前置任务 0 :无  >0:显示数字
      "timeLimit": 0, //  是否限时 0 :否  1:是
      "limitTime": 0, //  限时时间（h） 实际数字
      "endClass": 0,  //  结束条件（等级） 0 :无  >0:显示数字
      "endCount": 0,  //  结束条件（次数） 0 :无  >0:显示数字
      "goTo": "跳转至任务列表！",
      "rewardGold": 10, 
      "rewardExperience": 10,
      "rewardHb": 0,
      "rewardTl": 0,
      "rewardEss": 0,
      "rewardDimond": 10,
      "rewardDrop": 1001,
      "steps": 1,
      "repeat": 0,
      "id": 1000
    }
  ],
  "sum": 1
}
```
##### 显示格式
后台管理显示标题|任务标题|任务描述|任务类型|任务种类|关联ID|是否自动领取|领取条件|领取等级|前置任务ID|是否限时|限时时间(h)|结束条件等级|结束条件次数|任务总步数|任务触发|奖励金币|奖励经验|奖励红包|奖励体力|奖励精华|奖励钻石|奖励道具掉落组
---|---|----|------|------|------|------|------|------|------|------|------|------|------|------|------|------|------|------|------|------|------|----
后台显示值|每日签到 |每日登陆签到即可完成任务！ | 日常任务| 签到任务|无|否|无|0|无|否|0|0|0|1|跳转至任务列表！|10|0|0|0|0|0|1001
数据库字段|title|tip|type|typeId|extId|autoReceive|condition|conClass|beforeId|timeLimit|limitTime|endClass|endCount|steps|goTo|rewardGold|rewardExperience|rewardHb|rewardTl|rewardEss|rewardDimond|rewardDrop
接口返回值|每日签到 |每日登陆签到即可完成任务！ | 2| sign|0|0|0|0|0|0|0|0|0|1|跳转至任务列表！|10|0|0|0|0|0|1001

#### 添加任务接口
##### 接口
```js
POST /admin/taskSetting

// 参数意义同任务列表 其中 type、typeId、condition、autoReceive、timeLimit 要让用户知道选择的意义，做成选择框等
payload:{
    type:Joi.number().description('类型 '),
    title:Joi.string().description('任务标题'),
    tip:Joi.string().description('任务描述'),
    typeId:Joi.string().description('任务类型ID'),
    extId:Joi.number().description('关联ID'),
    autoReceive:Joi.number().description('是否自动领取'),
    condition:Joi.number().description("接受条件"),
    conClass:Joi.number().description("接受条件等级"),
    beforeId:Joi.number().description("前置任务ID"),
    timeLimit:Joi.number().description("是否限时"),
    limitTime:Joi.number().description("任务时间"),
    endClass:Joi.number().description("结束条件等级"),
    endCount:Joi.number().description("结束条件次数"),
    goTo:Joi.string().description('任务触发'),
    rewardGold:Joi.number().description("任务奖励金币"),
    rewardExperience:Joi.number().default(-1).description("任务奖励经验"),
    rewardHb:Joi.number().default(-1).description("任务奖励红包"),
    rewardTl:Joi.number().default(-1).description("任务奖励体力"),
    rewardEss:Joi.number().default(-1).description("任务奖励植物精华"),
    rewardDimond:Joi.number().default(-1).description("任务奖励植物钻石"),
    rewardDrop:Joi.number().default(-1).description("任务奖励植掉落组")
}
```
#### 编辑任务接口
##### 接口
```js
PUT /admin/taskSetting/{id}

title:Joi.string().description('任务标题'),
tip:Joi.string().description('任务描述'),
autoReceive:Joi.number().description('是否自动领取'),
timeLimit:Joi.number().description("是否限时"),
limitTime:Joi.number().description("任务时间"),
goTo:Joi.string().description('任务触发'),
rewardGold:Joi.number().description("任务奖励金币"),
rewardExperience:Joi.number().default(-1).description("任务奖励经验"),
rewardHb:Joi.number().default(-1).description("任务奖励红包"),
rewardTl:Joi.number().default(-1).description("任务奖励体力"),
rewardEss:Joi.number().default(-1).description("任务奖励植物精华"),
rewardDimond:Joi.number().default(-1).description("任务奖励植物钻石"),
rewardDrop:Joi.number().default(-1).description("任务奖励植掉落组")

```
### 删除任务接口
##### 接口
```js
method:'DELETE',
path:'/admin/taskSetting/{id}',
```