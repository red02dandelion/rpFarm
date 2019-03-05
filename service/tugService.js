const dao = require("../dao/dao");
var tugService = require("../service/tugService");
const settings = require('../settings');

//登录验证
exports.eventStatus = async function(request,reply){
    var user = request.auth.credentials;
    var status = await tugService.isStart(request);
    var data = {};
    var joinStatus = 0; //  0 当前未参与拔河活动 1 参与正在进行中 2 参与已经结束（未收取）
    var tugSetting = await dao.findOne(request,'tugSetting',{});
    var tuggingRecords = await dao.find(request,'tugTaskRecord',{user_id:user._id + "",status:1}); // 1进行中 2 已完成
    if (tuggingRecords.length > 0) {
        joinStatus = 1;
        var tuggingRecord = tuggingRecords[0];
        await updateTugRecord(request,tuggingRecord);
        tuggingRecord = await dao.findById(request,'tugTaskRecord',tuggingRecord._id + "");
        data = tuggingRecord;
    }
    var tugingResults = await dao.find(request,'tugResult',{user_id:user._id + "",status:0}); // 0 未收取 1 已收取
    if (tugingResults.length > 0) {
        joinStatus = 2;
        data = tugingResults[0];
    }
    // console.log('data',{status:status,tugSetting:tugSetting,tuggingRecords:tuggingRecords});
    reply({"message":"查询成功","statusCode":101,"status":true,"resource":{status:status,joinStatus,tugSetting:tugSetting,tuggingRecords:data}});
}

exports.isStart = async function(request){
    var user = request.auth.credentials;
    var tugSetting = await dao.findOne(request,'tugSetting',{});
    if (!tugSetting) {
        return false;
    }
    var time = new Date(); 
    var day = time.getDay(); 
    // // console.log('day',day);
    // 日子是否符合
    var inDays = false;
    for (var index in tugSetting.tugDays) {
        // console.log(tugSetting.tugDays[index]);
        if (day === tugSetting.tugDays[index]) {
            inDays = true;
            break;
        }
    }
    // 时间段是否符合
    var now00 = new Date(new Date().setHours(0,0,0,0)).getTime();
    // // console.log('now00',format(new Date(now00)));
    var now = new Date().getTime();
    // // console.log('now',format(new Date(now)));
    var inTime = false;
    for (var i in tugSetting.eventTimes) {
        var settingStart = now00 + tugSetting.eventTimes[i].begin;
        // console.log(tugSetting.eventTimes[i]);
        // // console.log('settingStart',settingStart);
        // // console.log('settingStart',format(new Date(settingStart)));
        // console.log(tugSetting.eventTimes[i].begin);
        var settingEnd = now00 + tugSetting.eventTimes[i].end;
        // // console.log('settingEnd',settingEnd);
        // // console.log('settingEnd',format(new Date(settingEnd)));
        // console.log(tugSetting.eventTimes[i].begin);
        if(now >= settingStart && now <= settingEnd) {
            inTime = true;
            // // console.log('inTime i true',inTime);
            break;
        }
    }
    var randUser = await randUserExceptMe(request);
    // console.log('randUser',randUser);
    return inDays && inTime;

}

exports.harvestTug = async function(request,reply){ 
    var user = request.auth.credentials;
    var tugResult = await dao.findById(request,'tugResult',request.params.id);
    if (!tugResult) {
       reply({"message":"拔河记录都不存在！","statusCode":102,"status":false});
        return ; 
    }
    if (tugResult.winner == 1) {
        if (tugResult.props.length > 0) {
            for (var index in tugResult.props) {
                    var prop = tugResult.props[index];
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
    } else {
        await dao.updateIncOne(request,'user',{_id:user._id + ""},{hb:Number(tugResult.hb)});
    }
    await dao.updateOne(request,'tugResult',{_id:tugResult._id + ""},{status:1});
    reply({"message":"收获成功！","statusCode":101,"status":true});
}
exports.joinTug = async function(request,reply){ 
    var isStart = await tugService.isStart(request)
    if (isStart == false) {
        reply({"message":"当前不在活动期间！","statusCode":102,"status":false});
        return ;
    }
    var user = request.auth.credentials;
    var tugingResults = await dao.find(request,'tugResult',{user_id:user._id + "",status:0});
    if (tugingResults.length > 0) {
        reply({"message":"您有未收取的拔河奖励！","statusCode":102,"status":false});
        return ;
    }
    var tugSetting = await dao.findOne(request,'tugSetting',{});
    var now00 = new Date(new Date().setHours(0,0,0,0)).getTime();
    var dayString = formatTimeStamp(now00);
    var tugingRecord = await dao.findOne(request,'tugTaskRecord',{user_id:user._id + "",status:1});
    if (tugingRecord) {
        reply({"message":"您已有正在进行的拔河任务了！","statusCode":102,"status":false});
        return ;
    }
    var tugRecordCount = await dao.findCount(request,'tugTaskRecord',{user_id:user._id + "",day00:now00});
    if (tugRecordCount >= tugSetting.oneJoinMaxADay) {
         reply({"message":"参与次数已经用完啦！","statusCode":102,"status":false});
         return ;
    }

    var myStrength = Math.round(Math.random()* (tugSetting.everyOneUpMax - tugSetting.everyOneUpMin) + tugSetting.everyOneUpMin);
    var aiStrength = Math.round(Math.random()* (tugSetting.startStrenthMax - tugSetting.startStrenthMin) + tugSetting.startStrenthMin);
    // console.log("aiStrength",aiStrength);
    var aiInviteMax = Math.round(aiStrength / tugSetting.everyOneUpMin);
    var aiInviteMin = Math.round(aiStrength / tugSetting.everyOneUpMax);
    var aiStartInvite = Math.round(Math.random() * (aiInviteMax - aiInviteMin) + aiInviteMin);
    

    var  joinTugRecord = {};
    joinTugRecord.user_id = user._id + "";
    joinTugRecord.username = user.username;
    joinTugRecord.createTime = new Date().getTime();
    joinTugRecord.status = 1; // 1 进行中 2 已完成
    joinTugRecord.day00 = now00;
    joinTugRecord.dayString = dayString;
    joinTugRecord.myStrength = myStrength;
    joinTugRecord.aiStrength = aiStrength;
    joinTugRecord.myInvite = 1;
    joinTugRecord.aiInvite = aiStartInvite;
    joinTugRecord.updateTime = new Date().getTime();
    await dao.save(request,'tugTaskRecord',joinTugRecord);
    reply({"message":"参与成功！","statusCode":107,"status":true});
} 

exports.tugDetail = async function(request,reply){  
    var user = request.auth.credentials;
    var tugSetting = await dao.findOne(request,'tugSetting',{});
    var now00 = new Date(new Date().setHours(0,0,0,0)).getTime();
    var dayString = formatTimeStamp(now00);
    var time = new Date().getTime();
    var tugingRecord = await dao.findOne(request,'tugTaskRecord',{user_id:user._id + "",status:1});
    if (!tugingRecord) {
        reply({"message":"您没有正在进行的拔河任务！","statusCode":102,"status":false});
        return ;
    }
    await updateTugRecord(request,tugingRecord);
    tugingRecord = await dao.findOne(request,'tugTaskRecord',{_id:tugingRecord._id + ""});
    reply({"message":"查询成功！","statusCode":107,"status":true,"resource":tugingRecord});
}

const updateTugRecord = async function(request,tugingRecord) {   
    var user = request.auth.credentials;
    var time = new Date().getTime();
    var tugSetting = await dao.findOne(request,'tugSetting',{});
    // 本次计算的截止时间 可能是当前时间或者任务结束时间
    var termTime = (tugingRecord.createTime + tugSetting.taskMinutes * 60 * 1000) < time ? (tugingRecord.createTime + tugSetting.taskMinutes * 60 * 1000) : time;
    var restTime = termTime - tugingRecord.updateTime; // 机器人可能产生变化的总时间
    // console.log('termTime',format(new Date(termTime)));
    // console.log('restTime',restTime / 1000 / 60 );
    // console.log('tugingRecord.myStrength',tugingRecord.myStrength); 
    await refreshTugRecord(request,tugingRecord._id + "",tugSetting,tugingRecord.updateTime,restTime);
    await refreshMyInvite(request,tugingRecord._id + "",tugSetting);
    tugingRecord = await dao.findOne(request,'tugTaskRecord',{_id:tugingRecord._id + ""});
    // console.log('time',format(new Date(time)));
    // console.log('taskEndTime',format(new Date(tugingRecord.createTime + tugSetting.taskMinutes * 60 * 1000)));
    if (time >= tugingRecord.createTime + tugSetting.taskMinutes * 60 * 1000) {
        await dao.updateOne(request,'tugTaskRecord',{_id:tugingRecord._id + ""},{status:2});
        var winnerStatus;
        var hb = 0;
        var props = [];
        // console.log('tugingRecord',tugingRecord); 
        // console.log('tugingRecord.aiStrength',tugingRecord.aiStrength);
        // console.log('tugingRecord.myStrength',tugingRecord.myStrength); 
        if (tugingRecord.aiStrength > tugingRecord.myStrength) {
            winnerStatus = 1; // 机器人赢
             // 计算额外掉落
            var dropGruops = await dao.find(request,'dropGroups',{id:tugSetting.failDropId});
            // console.log('1111111',dropGruops);
           
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
            // hb = Math.round(tugingRecord.myStrength * tugSetting.hbPerStrenth);
        } else if (tugingRecord.aiStrength < tugingRecord.myStrength) {
            winnerStatus = 2; // 我赢
            hb = Math.round(tugingRecord.myStrength * tugSetting.hbPerStrenth);
        } else {
            winnerStatus = 0; // 平手
            hb = Math.round(tugingRecord.myStrength * tugSetting.hbPerStrenth / 2);
        }
        // console.log('hb',hb);
        var tugResult = {};
        tugResult.createTime = new Date().getTime();
        tugResult.username = user.username;
        tugResult.user_id = user._id + "";
        tugResult.myStrength = tugingRecord.myStrength;
        tugResult.myInvite = tugingRecord.myInvite;
        tugResult.aiStrength = tugingRecord.aiStrength;
        tugResult.aiInvite = tugingRecord.aiInvite;
        tugResult.winner = winnerStatus;  // 1 机器人赢 2 我赢 0 平手
        tugResult.hb = hb;
        tugResult.props = props;
        tugResult.status = 0; // 0 未收取  1 已收取
        await dao.save(request,'tugResult',tugResult);
    }
}
const refreshMyInvite = async function(request,tug_id,tugSetting) { 
    var tugingRecord = await dao.findById(request,'tugChangeRecord',tug_id);
    var totalInvite = await tugInviteQuery(request,tug_id);
    var newInvite = 0;
    var myInviteChanges = await dao.find(request,'tugChangeRecord',{tug_id:tug_id,isAi:0},{},{createTime:-1});
    if (myInviteChanges.length > 0) {
        var lastChangeRecord = myInviteChanges[0];
        newInvite = totalInvite - lastChangeRecord.preMyInvite - lastChangeRecord.changeInvite;
    }
    if (newInvite > 0 ) {
        var changeValueMax = Math.round(newInvite * tugSetting.everyOneUpMax);
        var changeValueMin = Math.round(newInvite * tugSetting.everyOneUpMin);
        var changeValue = Math.round(Math.random() * (changeValueMax - changeValueMin) + changeValueMin);
        await dao.updateIncOne(request,'tugTaskRecord',{_id:tugingRecord._id + ""},{aiStrength:changeValue,aiInvite:newInvite});

        var tugChangeRecord = {};
        tugChangeRecord.isAi = 0;
        tugChangeRecord.recordTime = new Date().getTime();
        tugChangeRecord.createTime = new Date().getTime();
        tugChangeRecord.preAiStrenth = tugingRecord.aiStrength;
        tugChangeRecord.premyStrength = tugingRecord.myStrength;
        tugChangeRecord.preAiInvite = tugingRecord.aiInvite;
        tugChangeRecord.preMyInvite = tugingRecord.myInvite;
        tugChangeRecord.changeValue = changeValue;
        tugChangeRecord.changeInvite = newInvite;
        tugChangeRecord.tugSetting = tugSetting;
        tugChangeRecord.biggerRnd = -1;
        tugChangeRecord.upRnd = 1;
        tugChangeRecord.restTime = 0;
        tugChangeRecord.tug_id = tug_id;
        await dao.save(request,'tugChangeRecord',tugChangeRecord);
    }
}
const refreshTugRecord = async function(request,tug_id,tugSetting,startTime,restTime) { 
    // console.log('restTime111',restTime);
    if (restTime < tugSetting.refreshIntervalMin ) {
        return ;
    }
    // // console.log('tugSetting',tugSetting);
    var thisRefreshIntervalMin = restTime < tugSetting.refreshIntervalMin ? restTime : tugSetting.refreshIntervalMin; // 固定为下限
    // console.log('thisRefreshIntervalMin',thisRefreshIntervalMin);
    var time = new Date().getTime();
    var refreshThisIntervals = Math.random() * (tugSetting.refreshIntervalMax - thisRefreshIntervalMin) + thisRefreshIntervalMin;
    // 随机得出的此次更新的时间
    var refreshIntervalms = Math.round(refreshThisIntervals * 1000);
    var tugingRecord = await dao.findById(request,'tugTaskRecord',tug_id);
    // 满足随机的时间，可以进行机器人的气力值变化判断流程
    if (restTime >= refreshIntervalms) {
        // 用户比较强
        if (tugingRecord.aiStrength < tugingRecord.myStrength) {
            // console.log('用户比较强');
            var upRnd = Math.random();
            // 解果是提升
            if (upRnd < tugSetting.userBigger.aiUpRate) {
                // console.log('结果是提升');
                var biggerRnd = Math.random();
                // 结果是超越
                if (biggerRnd < tugSetting.userBigger.aiStrongerRate) {
                    // console.log('结果是超越');
                    var changeMin = (tugingRecord.myStrength - tugingRecord.aiStrength) > tugSetting.userBigger.ifStongerChangeLqMin ? (tugingRecord.myStrength - tugingRecord.aiStrength) : tugSetting.userBigger.ifStongerChangeLqMin;
                    
                    var changeValue = Math.round(Math.random() * (tugSetting.userBigger.ifStrongerChangeLqMax - changeMin) + changeMin);
                   
                    var inviteMax = Math.round(changeValue / tugSetting.everyOneUpMin);
                    var inviteMin = Math.round(changeValue / tugSetting.everyOneUpMax);
                    var changeInvite = Math.round(Math.random() * (inviteMax - inviteMin) + inviteMin);
                    // console.log('changeValue',changeValue);
                    // console.log('changeInvite',changeInvite);
                    await dao.updateIncOne(request,'tugTaskRecord',{_id:tugingRecord._id + ""},{aiStrength:changeValue,aiInvite:changeInvite});
                
                    var tugChangeRecord = {};
                    tugChangeRecord.isAi = 1;
                    tugChangeRecord.recordTime = new Date().getTime();
                    tugChangeRecord.createTime = startTime + refreshIntervalms;
                    tugChangeRecord.preAiStrenth = tugingRecord.aiStrength;
                    tugChangeRecord.premyStrength = tugingRecord.myStrength;
                    tugChangeRecord.preAiInvite = tugingRecord.aiInvite;
                    tugChangeRecord.preMyInvite = tugingRecord.myInvite;
                    tugChangeRecord.changeValue = changeValue;
                    tugChangeRecord.changeInvite = changeInvite;
                    tugChangeRecord.tugSetting = tugSetting;
                    tugChangeRecord.biggerRnd = biggerRnd;
                    tugChangeRecord.upRnd = upRnd;
                    tugChangeRecord.restTime = restTime;
                    tugChangeRecord.tug_id = tug_id;
                    await dao.save(request,'tugChangeRecord',tugChangeRecord);
                    // 如果没有超越
                } else {
                    var changeMax = (tugingRecord.myStrength - tugingRecord.aiStrength) < tugSetting.userBigger.ifWeakerChangeLqMax ? (tugingRecord.myStrength - tugingRecord.aiStrength) : tugSetting.userBigger.ifWeakerChangeLqMax;
                    // console.log('changeMax',changeMax);
                    // console.log('如果没有超越');
                    // console.log('changeMax',changeMax);
                    var changeValue = Math.round(Math.random() * (changeMax - tugSetting.userBigger.ifWeakerChangeLqMin) + tugSetting.userBigger.ifStongerChangeLqMin);
                    var inviteMax = Math.round(changeValue / tugSetting.everyOneUpMin);
                    var inviteMin = Math.round(changeValue / tugSetting.everyOneUpMax);
                    var changeInvite = Math.round(Math.random() * (inviteMax - inviteMin) + inviteMin);
                    // console.log('changeValue',changeValue);
                    // console.log('changeInvite',changeInvite);
                    await dao.updateIncOne(request,'tugTaskRecord',{_id:tugingRecord._id + ""},{aiStrength:changeValue,aiInvite:changeInvite});
                    
                    var tugChangeRecord = {};
                    tugChangeRecord.isAi = 1;
                    tugChangeRecord.recordTime = new Date().getTime();
                    tugChangeRecord.createTime = startTime + refreshIntervalms;
                    tugChangeRecord.preAiStrenth = tugingRecord.aiStrength;
                    tugChangeRecord.premyStrength = tugingRecord.myStrength;
                    tugChangeRecord.preAiInvite = tugingRecord.aiInvite;
                    tugChangeRecord.preMyInvite = tugingRecord.myInvite;
                    tugChangeRecord.changeValue = changeValue;
                    tugChangeRecord.changeInvite = changeInvite;
                    tugChangeRecord.tugSetting = tugSetting;
                    tugChangeRecord.biggerRnd = biggerRnd;
                    tugChangeRecord.upRnd = upRnd;
                    tugChangeRecord.restTime = restTime;
                    tugChangeRecord.tug_id = tug_id;
                    await dao.save(request,'tugChangeRecord',tugChangeRecord);
                }
            }
            // 机器人比较强
        } else if (tugingRecord.aiStrength < tugingRecord.myStrength) {
            // console.log('机器人比较强');
            var upRnd = Math.random();
            // 结果是提升
            if (upRnd < tugSetting.aiBigger.aiUpRate) {
                // console.log('结果是提升');
                var changeMin = tugSetting.aiBigger.changeLqMin;
                var changeMax = tugSetting.aiBigger.changeLqMax;

                var changeValue = Math.round(Math.random() * (changeMax - changeMin) + changeMin);
                var inviteMax = Math.round(changeValue / tugSetting.everyOneUpMin);
                var inviteMin = Math.round(changeValue / tugSetting.everyOneUpMax);
                var changeInvite = Math.round(Math.random() * (inviteMax - inviteMin) + inviteMin);
                // console.log('changeValue',changeValue);
                // console.log('changeInvite',changeInvite);
                await dao.updateIncOne(request,'tugTaskRecord',{_id:tugingRecord._id + ""},{aiStrength:changeValue,aiInvite:changeInvite});
                
                var tugChangeRecord = {};
                tugChangeRecord.isAi = 1;
                tugChangeRecord.recordTime = new Date().getTime();
                tugChangeRecord.createTime = startTime + refreshIntervalms;
                tugChangeRecord.preAiStrenth = tugingRecord.aiStrength;
                tugChangeRecord.premyStrength = tugingRecord.myStrength;
                tugChangeRecord.preAiInvite = tugingRecord.aiInvite;
                tugChangeRecord.preMyInvite = tugingRecord.myInvite;
                tugChangeRecord.changeValue = changeValue;
                tugChangeRecord.changeInvite = changeInvite;
                tugChangeRecord.tugSetting = tugSetting;
                tugChangeRecord.biggerRnd = 1;
                tugChangeRecord.upRnd = upRnd;
                tugChangeRecord.restTime = restTime;
                tugChangeRecord.tug_id = tug_id;
                await dao.save(request,'tugChangeRecord',tugChangeRecord);
            }
        } else {
            // console.log('一样强');
            var upRnd = Math.random();
            // 结果是提升
            if (upRnd < tugSetting.equal.aiUpRate) {
                // console.log('结果是提升');
                var changeMin = tugSetting.equal.changeLqMin;
                var changeMax = tugSetting.equal.changeLqMax;

                var changeValue = Math.round(Math.random() * (changeMax - changeMin) + changeMin);
                var inviteMax = Math.round(changeValue / tugSetting.everyOneUpMin);
                var inviteMin = Math.round(changeValue / tugSetting.everyOneUpMax);
                var changeInvite = Math.round(Math.random() * (inviteMax - inviteMin) + inviteMin);
                // console.log('changeValue',changeValue);
                // console.log('changeInvite',changeInvite);
                await dao.updateIncOne(request,'tugTaskRecord',{_id:tugingRecord._id + ""},{aiStrength:changeValue,aiInvite:changeInvite});
                
                var tugChangeRecord = {};
                tugChangeRecord.isAi = 1;
                tugChangeRecord.createTime = new Date().getTime();
                tugChangeRecord.createTime = startTime + refreshIntervalms;
                tugChangeRecord.preAiStrenth = tugingRecord.aiStrength;
                tugChangeRecord.premyStrength = tugingRecord.myStrength;
                tugChangeRecord.preAiInvite = tugingRecord.aiInvite;
                tugChangeRecord.preMyInvite = tugingRecord.myInvite;
                tugChangeRecord.changeValue = changeValue;
                tugChangeRecord.changeInvite = changeInvite;
                tugChangeRecord.tugSetting = tugSetting;
                tugChangeRecord.biggerRnd = 1;
                tugChangeRecord.upRnd = upRnd;
                await dao.save(request,'tugChangeRecord',tugChangeRecord);
            }

        }
    
        restTime = restTime - refreshIntervalms;
        startTime = startTime + refreshIntervalms;
    } else {
        restTime = 0;
        startTime = startTime + restTime;
    }
   // 更新时间更新到当前模拟时间点
    await dao.updateOne(request,'tugTaskRecord',{_id:tugingRecord._id + ""},{updateTime:startTime});
    
    await refreshTugRecord(request,tug_id,tugSetting,startTime,restTime);
}



const randUserExceptMe = async function(request) { 
    var user = request.auth.credentials;
    var userCount = await dao.findCount(request,'user',{});
    var randUser = user;
    while (randUser.token == user.token) {
        randUser = null;
         while (!randUser) {
            var randIndex = Math.round(Math.random() * userCount);
            var randUserArr = await dao.find(request,'user',{},{},{},1,randIndex);
            if (randUserArr.length > 0) {
                randUser = randUserArr[0];
            }
        }
    }
    return randUser;
   
}

const tugInviteQuery = function(request,tug_id) {
    var user = request.auth.credentials;
    var req  = require('urllib-sync').request;
    var path = settings.host + 'jmmall.farm.register.count';
    var tugScene = "tug-" + tug_id;
    try {
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
                timeout:30000


            });
        // console.log('result.data',result.data.toString());
        var data = JSON.parse(result.data.toString());
        if (data.c != 200) {
            return 0;
        } 
        // console.log('count',data.d.tugScene);
        return data.d.tugScene;
    }catch(e) {
        // console.log('查询邀请失败！');
        return 0;
    }
} 
  
var format = function(date) {

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10) ? '0' + month : month;
        var day = date.getDate();

        var hour = date.getHours();
        var minute = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes();
        //var minute = date.getMinutes();
        var second = (date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds();
        //var second = date.getSeconds();

        return year.toString()  + "-" + month.toString()  + "-" + day.toString() + " " +  hour.toString()  + ":" + minute.toString()  + ":" + second.toString();
    }


    var formatTimeStamp = function(time) {
        var date = new Date(time);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10) ? '0' + month : month;
        var day = date.getDate();

        var hour = date.getHours();
        var minute = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes();
        //var minute = date.getMinutes();
        var second = (date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds();
        //var second = date.getSeconds();

        return year.toString()  + "-" + month.toString()  + "-" + day.toString() + " " +  hour.toString()  + ":" + minute.toString()  + ":" + second.toString();
    }





// function showTime(){ 
//     var show_day=new Array('星期一','星期二','星期三','星期四','星期五','星期六','星期日'); 
//     var time = new Date(); 
//     var year = time.getYear(); 
//     var month = time.getMonth(); 
//     var date = time.getDate(); 
//     var day = time.getDay(); 
//     var hour = time.getHours(); 
//     var minutes = time.getMinutes(); 
//     var second = time.getSeconds(); 
//     month < 10 ? month = '0' + month : month; 
//     month = month + 1; 
//     hour < 10 ? hour = '0' + hour : hour; 
//     minutes < 10 ? minutes = '0' + minutes : minutes; 
//     second < 10 ? second = '0' + second : second; 
//     var  
//     document.getElementById('showtime').innerHTML=now_time; 
//     setTimeout("showTime();",1000); 
// }

// // var timeStamp = new Date(new Date().setHours(0, 0, 0, 0)) / 1000;
// //一天是86400秒   故n天前的时间戳为
// var ThreeDayAgo = timeStamp - 86400 * n;
// // console.log(ThreeDayAgo)


// var date = new Date()
// var year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
// var dateStr = [year, month, day].join('-');
// var a = new Date(dateStr);
// a.getTime();

// const start = new Date(new Date(new Date().toLocaleDateString()).getTime());

// 今天的凌晨new Date(new Date().setHours(0,0,0,0))
// 3天以前的凌晨new Date(new Date(new Date().setDate(new Date().getDate()-3)).setHours(0,0,0,0)

// var date = new Date(new Date().setHours(0,0,0,0));
// function daytime(day){
//     // console.log(+time-3600*24*day);
// }
// daytime(4)//1484754854400