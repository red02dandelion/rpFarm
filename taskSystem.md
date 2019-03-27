###任务系统
##### 配置表
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