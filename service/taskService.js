const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");
const taskService = require("../service/taskService");
exports.task = async function(request,reply){  
     var user = request.auth.credentials;
     await taskService.autoReceiveTask(request,user);
      
     await taskService.updateShareTask(request,user);
     
     await taskService.updateTimeLimitTask(request,user);
     
     await taskService.updateSignTasks(request,user);
      
     await taskService.updateUserClassTask(request,user);
      
     var task;
    
     var taskRecords = await dao.find(request,'taskRecord',{user_id:user._id + "",compeleted:1},{},{startTime:1});
      
       
     if (taskRecords.length > 0) {
        
        task = taskRecords[0];
        task.reward = await taskService.taskArard(request,task);
        reply({"message":"查询成功","statusCode":107,"status":true,"resource":task});
        return;
     } else {
        var taskingRecord = await dao.find(request,'taskRecord',{user_id:user._id + "",compeleted:0},{},{startTime:1});
        if (taskingRecord.length > 0) {
            task = taskingRecord[0];
            task.reward = await taskService.taskArard(request,task);
            reply({"message":"查询成功","statusCode":107,"status":true,"resource":task});
            return;
        }
        var compeletedTasks = await dao.find(request,'taskRecord',{user_id:user._id + "",compeleted:2});
        var taskSettings = await dao.find(request,'taskSetting',{});
        // console.log('compeletedTasks',compeletedTasks);
        // console.log('taskSettings',taskSettings);
         var restTasks = await taskService.removeTasksInOther(taskSettings,compeletedTasks);
        //  console.log('restTasks',restTasks);
         if (restTasks.length > 0) {
             task = restTasks[0];
            task.reward = await taskService.taskArard(request,task);
            reply({"message":"查询成功","statusCode":107,"status":true,"resource":task});
            return;
         } else {
            reply({"message":"查询成功","statusCode":107,"status":true,"resource":null});
            return;
         }
       
     }
     
}
exports.removeTasksInOther = async function(tasks,taskArr){  
    // console.log('taskArr',taskArr);
    // console.log('tasks',tasks);
    if (taskArr.length <= 0 || tasks.length <= 0) {
        return tasks;
    }
    var restTasks = [];
    for (var index in tasks) {
        var task = tasks[index];
        var haveFlag = false;
        for (var i in taskArr) {
            var comTask = taskArr[i];
            if (comTask.id == task.id) {
                haveFlag = true;
            }
        }
        if (haveFlag == false) {
            restTasks.push(task);
        }
    }
    return restTasks;
}
exports.growTasks = async function(request,reply){  
   var user = request.auth.credentials;
   var tasks = await dao.find(request,'taskRecord',{user_id:user._id + "",compeleted:1,type:1},{},{startTime:1});
   var inTasks = await dao.find(request,'taskRecord',{user_id:user._id + "",compeleted:0,type:1},{},{startTime:1});
   tasks = tasks.concat(inTasks);
   var taskSettings = await dao.find(request,'taskSetting',{type:1},{},{id:1});
   await taskService.concantNoRepeatTask(tasks,taskSettings);
   for (var index in tasks) {
       var task = tasks[index];
       task.reward = await taskService.taskArard(request,task);
   }
   var newsCount = await taskService.newsCount(request,user);
   reply({"message":"查询成功","statusCode":107,"status":true,"resource":{tasks:tasks,newsCount:newsCount}});
}
exports.dayTask = async function(request,reply){   
    var user = request.auth.credentials;
    var time = new Date().getTime();

    const dayString = format1("yyyy/M/d",new Date());
    var tasks = await dao.find(request,'taskRecord',{user_id:user._id + "",compeleted:1,type:2,dayString:dayString},{},{startTime:1});   
    var inTasks = await dao.find(request,'taskRecord',{user_id:user._id + "",compeleted:0,type:2,dayString:dayString},{},{startTime:1});
    tasks = tasks.concat(inTasks);
    var taskSettings = await dao.find(request,'taskSetting',{type:2},{},{id:1});
    // var noInTask = [];
    // console.log('taskSettings',taskSettings);
    await taskService.concantNoRepeatTask(tasks,taskSettings);
    // console.log('22222222');
    for (var index in tasks) {
       var task = tasks[index];
       task.reward = await taskService.taskArard(request,task);
        console.log('333333');
    }
    var newsCount = await taskService.newsCount(request,user);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":{tasks:tasks,newsCount:newsCount}});
}

exports.achiveTask = async function(request,reply){  
    var user = request.auth.credentials;
    var tasks = await dao.find(request,'taskRecord',{user_id:user._id + "",compeleted:1,type:3},{},{startTime:1});
    var inTasks = await dao.find(request,'taskRecord',{user_id:user._id + "",compeleted:0,type:3},{},{startTime:1});
    tasks = tasks.concat(inTasks);
    var taskSettings = await dao.find(request,'taskSetting',{type:1},{},{id:1});
//    var noInTask = [];
    await taskService.concantNoRepeatTask(tasks,taskSettings);
    for (var index in tasks) {
       var task = tasks[index];
       task.reward = await taskService.taskArard(request,task);
    }
    var newsCount = await taskService.newsCount(request,user);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":{tasks:tasks,newsCount:newsCount}});
}
exports.newsCount = async function(request,user){  
    var growCount = await dao.findCount(request,'taskRecord',{user_id:user._id + "",compeleted:1,type:1});
    const dayString = format1("yyyy/M/d",new Date());
    var todayCount = await dao.findCount(request,'taskRecord',{user_id:user._id + "",compeleted:1,type:2,dayString:dayString});
    var achiveCount = await dao.findCount(request,'taskRecord',{user_id:user._id + "",compeleted:1,type:3}); 
    return {growCount:growCount,todayCount:todayCount,achiveCount:achiveCount};
}
exports.taskArard = async function(request,taskSetting){   
    var data = {};
    data.experience = taskSetting.rewardExperience;
    data.gold = taskSetting.rewardGold;
    data.dimond = taskSetting.rewardDimond;
    data.hb = taskSetting.rewardHb;
    data.plt_sessence = taskSetting.rewardEss;
    data.tl =  taskSetting.rewardTl;
    data.props = [];
    if (taskSetting.rewardDrop > 0) {
        // 计算额外掉落
        var dropGruops = await dao.find(request,'dropGroups',{id:taskSetting.rewardDrop});
        // // console.log('1111111',dropGruops);
        var props = [];
        if (dropGruops.length > 0) {
            for (var index in dropGruops) {
                var group = dropGruops[index];
                var sucRand = Math.random();
                // 掉落
                if (sucRand <= group.rate) {
                    var count = Math.round(Math.random() * (group.max - group.min) + group.min);
                    var prop = await dao.findOne(request,'prop',{id:group.propId});
                    // // console.log('222222',prop);
                    if (prop) {
                        prop.count = count;
                        props.push(prop);
                    }
                }
            }
        }
    }
   data.props = props;
   return data;
}
exports.concantNoRepeatTask = async function(tasks,taskArr){ 
    if (taskArr.length <= 0 ) {
        return tasks;
    }
    if (tasks.length <= 0) {
        return taskArr;
    }
    for (var index in taskArr) {
        var newTask = taskArr[index];
        var hasFalg = 0;
        for (var i in tasks) {
            var task = tasks[i];
            if (task.id = newTask.id) {
                hasFalg = 1;
            }
        }
        if (hasFalg == 0) {
            tasks.push(newTask);
        }
    }
}
exports.receiveTask = async function(request,reply){  
    var user = request.auth.credentials;
    var currentDateTime = new Date().getTime();
    var myTask = await dao.findOne(request,'taskRecord',{task_id:request.payload.id,user_id:user._id + ""});
    if (myTask) {
        reply({"message":"任务已经领取过！","statusCode":102,"status":false});
        return;
    }
    var taskSetting = await dao.findById(request,'taskSetting',request.payload.id + "");

    // 判断领取条件
    var isCanReceive = await taskService.isCanReceive(request,'user',taskSetting);
    if (isCanReceive.status == false){
        reply({"message":isCanReceive.msg,"statusCode":102,"status":false});
        return;
    }

    taskSetting.username = user.username;
    taskSetting.user_id = user._id + "";
    taskSetting.compeleted = 0;
    taskSetting.startTime = new Date().getTime();
    taskSetting.progress = 0;
    taskSetting.task_id = taskSetting._id + "";
    delete taskSetting._id;
    taskSetting.status = 1;
    if (taskSetting.type == 2) {
        const dayString = format1("yyyy/M/d",new Date());
        taskSetting.dayString = dayString;
    }
    await dao.save(request,'taskRecord',taskSetting);

    reply({"message":"领取成功！","statusCode":101,"status":true});
}

exports.getAwarad = async function(request,reply){   
    var user = request.auth.credentials;
    var taskRecord = await dao.findOne(request,'taskRecord',{user_id:user._id + "",compeleted:1,_id:request.payload.id});
    if (!taskRecord) {
        reply({"message":"任务还未完成！","statusCode":102,"status":false});
        return;
    }
    var data = {};
    data.experience = taskRecord.rewardExperience;
    data.gold = taskRecord.rewardGold;
    data.dimond = taskRecord.rewardDimond;
    data.hb = taskRecord.rewardHb;
    data.plt_sessence = taskRecord.rewardEss;
    data.tl =  taskRecord.rewardTl;
    data.props = [];
    if (taskRecord.rewardDrop > 0) {
        // 计算额外掉落
        var dropGruops = await dao.find(request,'dropGroups',{id:taskRecord.rewardDrop});
        // // console.log('1111111',dropGruops);
        var props = [];
        if (dropGruops.length > 0) {
            for (var index in dropGruops) {
                var group = dropGruops[index];
                var sucRand = Math.random();
                // 掉落
                if (sucRand <= group.rate) {
                    var count = Math.round(Math.random() * (group.max - group.min) + group.min);
                    var prop = await dao.findOne(request,'prop',{id:group.propId});
                    // // console.log('222222',prop);
                    if (prop) {
                        prop.count = count;
                        props.push(prop);
                    }
                }
            }
        }
    }
   data.props = props;
     // 收取掉落组装备
   if (props.length > 0) {
        for (var index in props) {
            var prop = props[index];
            var prop_id = prop._id + "";
            var propId = prop.id; 
            var propInHouse = await dao.findOne(request,'warahouse',{prop_id:prop._id + "",user_id:user._id + ""});
            // // console.log('33333',propInHouse);
            if (propInHouse) {
                await dao.updateIncOne(request,'warahouse',{_id:propInHouse._id + ""},{count:prop.count});
            } else {
                //prop进warahouse 除去_id、id增加prop_id、propId、user_id、username的全部信息
                delete prop._id;
                delete prop.id;
                propInHouse = prop;
                propInHouse.prop_id = prop_id;
                propInHouse.propId = propId;
                propInHouse.user_id = user._id + "";
                propInHouse.username = user.username;
                await dao.save(request,'warahouse',propInHouse);
            }
        }
   }

   if (data.experience > 0) {
       await dao.updateIncOne(request,'user',{_id:user._id + ""},{experience:data.experience});
   }
   if (data.gold > 0) {
       await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:data.gold});
   }
   if (data.plt_sessence > 0) {
       await dao.updateIncOne(request,'user',{_id:user._id + ""},{plt_sessence:data.plt_sessence});
   }
   if (data.tl > 0) {
       await dao.updateIncOne(request,'user',{_id:user._id + ""},{tl:data.tl});
    }
    if (data.dimond > 0) {
       await dao.updateIncOne(request,'user',{_id:user._id + ""},{dimond:data.dimond});
    }
    if (data.hb > 0) {
       await dao.updateIncOne(request,'user',{_id:user._id + ""},{hb:data.hb});
   }
    await dao.updateOne(request,'taskRecord',{_id:taskRecord._id + ""},{compeleted:2});
    reply({
                "message":"领取成功！",
                "statusCode":101,
                "status":true,
                "resource":{data:data}
     });
    return ;
}
exports.isCanReceive = async function(request,user,taskSetting){   
    if (taskSetting.condition == 1) {
        if (user.class >= taskSetting.conClass) {
            return {status:true,msg:"可领取",type:taskSetting.condition};
        } else {
            return {status:false,msg:"等级不够，无法领取！",type:taskSetting.condition};
        }
    } else if (taskSetting.condition == 2){
        var beforeTaskRecord = await dao.findOne(request,'taskRecord',{user_id:user._id + "",id:taskSetting.beforeId,compeleted:{$ne:0}});
        var beforeSetting = await dao.findOne(request,'taskSetting',{id:taskSetting.beforeId});
        if (beforeTaskRecord) {
             return {status:true,msg:"可领取",type:taskSetting.condition};
        } else {
           return {status:false,msg:"请先完成任务" + beforeSetting.title,type:taskSetting.condition};
        }
    } else {
        return {status:true,msg:"可以领取！",type:taskSetting.condition};
    }
}
exports.autoReceiveTask = async function(request,user){ 
    var autoTaskSettings = await dao.find(request,'taskSetting',{autoReceive:1});
   
    if (autoTaskSettings.length > 0) {
        for (var index in autoTaskSettings) {
            var autoTaskSetting = autoTaskSettings[index];
            var myTask = await dao.findOne(request,'taskRecord',{user_id:user._id + "",id:autoTaskSetting.id});
            if (!myTask) {
                // 如果有前置任务，前置任务没完成不可以接该任务
                if (autoTaskSetting.beforeId != -1) {
                    var beforeTaskRecord = await dao.findOne(request,'taskRecord',{user_id:user._id + "",id:autoTaskSetting.beforeId,compeleted:{$ne:0}});
                    if (!beforeTaskRecord) {
                        continue;
                    }
                }
                autoTaskSetting.username = user.username;
                autoTaskSetting.user_id = user._id + "";
                autoTaskSetting.compeleted = 0;
                autoTaskSetting.startTime = new Date().getTime();
                autoTaskSetting.progress = 0;
                autoTaskSetting.status = 1;
                autoTaskSetting.task_id = autoTaskSetting._id + "";
                delete autoTaskSetting._id;
                if (autoTaskSetting.type == 2) {
                    
                    const dayString =  format1("yyyy/M/d",new Date());
                    autoTaskSetting.dayString = dayString;
                }
                await dao.save(request,'taskRecord',autoTaskSetting);
            }
        }
    }
}

// 更新某个植物的购买任务
exports.updateBuySeedTask = async function(request,user,seed_id){
    var myTask = await dao.findOne(request,'taskRecord',{user_id:user._id + "",typeId:"buySeed",extId:seed_id,compeleted:0});
    if (myTask) {
        await dao.updateOne(request,'taskRecord',{_id:myTask._id + ""},{compeleted:1,progress:1});
    }
}
// 更新某个动物的购买任务
exports.updateBuyAnimalTask = async function(request,user,seed_id){
    var myTask = await dao.findOne(request,'taskRecord',{user_id:user._id + "",typeId:"buyAnimal",extId:seed_id,compeleted:0});
    if (myTask) {
        await dao.updateOne(request,'taskRecord',{_id:myTask._id + ""},{compeleted:1,progress:1});
    }
}
// 更新签到任务
exports.updateSignTasks = async function(request,user){
    const dayString = format1("yyyy/M/d",new Date());
    var signTasks = await dao.find(request,'taskRecord',{user_id:user._id + "",typeId:"sign",compeleted:0,dayString:dayString});
    if (signTasks.length > 0) {
        for (var index in signTasks) {
            var signTask = signTasks[index];
            await dao.updateOne(request,'taskRecord',{_id:signTask._id + ""},{compeleted:1,progress:signTask.steps});
        }
    }
}
// 更新某个植物的种植次数任务
exports.updateSeedPlantTask = async function(request,user,seed_id){ 
    var myTask = await dao.findOne(request,'taskRecord',{user_id:user._id + "",typeId:"plant",extId:seed_id,compeleted:0});
    if (myTask) {
         await dao.updateOne(request,'taskRecord',{_id:myTask._id + ""},{progress:1});
         if (myTask.myTask.progress >= myTask.endCount - 1) {
             await dao.updateOne(request,'taskRecord',{_id:myTask._id + ""},{compeleted:1});
         }
    }
}
// 更新某个植物的收获次数任务
exports.updateSeedHarvestTask = async function(request,user,seed_id){ 
    var myTask = await dao.findOne(request,'taskRecord',{user_id:user._id + "",typeId:"harvestPlant",extId:seed_id,compeleted:0});
    if (myTask) {
         await dao.updateOne(request,'taskRecord',{_id:myTask._id + ""},{progress:1});
         if (myTask.myTask.progress >= myTask.endCount - 1) {
             await dao.updateOne(request,'taskRecord',{_id:myTask._id + ""},{compeleted:1});
         }
    }
}
// 更新某个动物的喂养次数任务
exports.updateSeedFeedTask = async function(request,user,seed_id){ 
    var myTask = await dao.findOne(request,'taskRecord',{user_id:user._id + "",typeId:"feed",extId:seed_id,compeleted:0});
    if (myTask) {
         await dao.updateOne(request,'taskRecord',{_id:myTask._id + ""},{progress:1});
         if (myTask.myTask.progress >= myTask.endCount - 1) {
             await dao.updateOne(request,'taskRecord',{_id:myTask._id + ""},{compeleted:1});
         }
    }
}
// 更新某个动物的收获次数任务
exports.updateAnimalHarvestTask = async function(request,user,seed_id){ 
    var myTask = await dao.findOne(request,'taskRecord',{user_id:user._id + "",typeId:"harvestFarm",extId:seed_id,compeleted:0});
    if (myTask) {
         await dao.updateOne(request,'taskRecord',{_id:myTask._id + ""},{progress:1});
         if (myTask.myTask.progress >= myTask.endCount - 1) {
             await dao.updateOne(request,'taskRecord',{_id:myTask._id + ""},{compeleted:1});
         }
    }
}
// 更新人物等级任务
exports.updateUserClassTask = async function(request,user){ 
    var myTasks = await dao.find(request,'taskRecord',{user_id:user._id + "",typeId:"userUp",compeleted:0});
    if (myTasks.length > 0) {
        for (var index in myTasks) {
            var myTask = myTasks[index];
            if (user.class >= myTask.endClass){
                await dao.updateOne(request,'taskRecord',{_id:myTask._id + ""},{compeleted:1,progress:1});
            }
        }
    }
}
// 更新宠物等级任务
exports.updatePetClassTask = async function(request,user){ 
    var myTasks = await dao.find(request,'taskRecord',{user_id:user._id + "",typeId:"petUp",compeleted:0});
    var dog = await dao.findOne(request,'dog',{user_id:user._id + ""});
    if (myTasks.length > 0) {
        for (var index in myTasks) {
            var myTask = myTasks[index];
            if (dog.class >= myTask.endClass){
                await dao.updateOne(request,'taskRecord',{_id:myTask._id + ""},{compeleted:1,progress:1});
            }
        }
    }
}
// 更新使用道具任务
exports.updateUsePropTask = async function(request,user,propId){ 
    var myTask = await dao.findOne(request,'taskRecord',{user_id:user._id + "",typeId:"buySeed",extId:propId,compeleted:0});
    if (myTask) {
        await dao.updateOne(request,'taskRecord',{_id:myTask._id + ""},{compeleted:1,progress:1});
    }
}
// 更新分享任务
exports.updateUseShareTask = async function(request,user,shareId){ 
    var myTask = await dao.findOne(request,'taskRecord',{user_id:user._id + "",typeId:"buySeed",extId:shareId,compeleted:0});
    if (myTask) {
        await dao.updateOne(request,'taskRecord',{_id:myTask._id + ""},{compeleted:1,progress:1});
    }
}

// 更新限时任务
exports.updateTimeLimitTask = async function(request,user){ 
    var timeLimitTasks = await dao.find(request,'taskRecord',{user_id:user._id + "",timeLimit:1});
    var time = new Date().getTime();
    if (timeLimitTasks.length > 0) {
        for (var index in timeLimitTasks) {
            var timeLimitTask = timeLimitTasks[index];
            if (timeLimitTask.startTime + timeLimitTask.limitTime * 60 * 60 * 1000 > time) {
                await dao.updateOne(request,'taskRecord',{_id:timeLimitTask._id + ""},{status:2});
            }
        }
    }
}
// 更新分享任务
exports.updateShareTask = async function(request,user){  
    var shareTasks = await dao.find(request,'taskRecord',{typeId:"share",user_id:user._id + "",compeleted:0});
    if (shareTasks.length > 0) {
        for (var index in shareTasks.length) {
            var shareTask = shareTasks[index];
            var shareCount = await shareQuery(request,shareTask._id + "");
            if (shareCount != shareTask.progress) {
                await dao.updateOne(request,'taskRecord',{_id:shareTask._id + ""},{progress:shareCount});
                if (shareCount == shareTask.steps) {
                    await dao.updateOne(request,'taskRecord',{_id:shareTask._id + "",compeleted:1});
                }
            }
        }
    }
}
const shareQuery = function(request,task_id) {
    var user = request.auth.credentials;
    var req  = require('urllib-sync').request;
    var path = settings.host + 'jmmall.farm.register.count';
    var tugScene = "share-" + task_id;
    try{
        var result = req(path,{
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                    "h": {
                            "t": user.token //当前登录用户token
                    },
                    "d": {
                        "a": 1,
                        "scenes": [tugScene]
                    }
                },
                timeout:30000,

            });
        // console.log('result.data',result.data.toString());
        var data = JSON.parse(result.data.toString());
        if (data.c != 200) {
            return 0;
        } 
        // console.log('count',data.d.tugScene);
        return data.d.tugScene;
    }catch(e){
        // console.log('查询邀请失败！');
        return 0;
    }
} 

//时间格式化
function format1(fmt,data) { //author: meizz 
    var o = {
        "M+": data.getMonth() + 1, //月份 
        "d+": data.getDate(), //日 
        "h+": data.getHours(), //小时 
        "m+": data.getMinutes(), //分 
        "s+": data.getSeconds(), //秒 
        "q+": Math.floor((data.getMonth() + 3) / 3), //季度 
        "S": data.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (data.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
var formatDateDay = function(date) {

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10) ? '0' + month : month;
        var day = date.getDate();

       
        //var second = date.getSeconds();

        return year.toString()  + "-" + month.toString()  + "-" + day.toString();
}

