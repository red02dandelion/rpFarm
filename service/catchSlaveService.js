/**
 * 系统配置资源处理器
 * Created by chenda on 2017/3/9.
 */

const dao = require("../dao/dao");
const petService = require('../service/petService');
const catchSlaveService = require('../service/catchSlaveService');
// 抓跟班
exports.cathSlave = async function(request,reply){
    var user = request.auth.credentials;
    var systemSet = await dao.findOne(request,'systemSet',{});
    var time = new Date().getTime();
    var slave = await dao.findById(request,'user',request.payload.user_id);
    if (!slave) {
        reply({"message":"用户不存在","statusCode":102,"status":false});
        return; 
    }
    if (slave.guanjiaTime && slave.guanjiaTime > time) {
        reply({"message":"对方有管家，抓不住啊！","statusCode":102,"status":false});
        return; 
    }
    var work = await dao.findOne(request,'workArea',{id:request.payload.work_id});
    if (!work) {
        reply({"message":"建筑不存在！","statusCode":102,"status":false});
        return; 
    }
    // 判断当前工位是不是有奴隶
    var myCatchRecord = await dao.findOne(request,'catchRecord',{work_id:request.payload.work_id,user_id:user._id + ""});
    // console.log('1123123213123123',{work_id:request.payload.work_id,user_id:user._id + ""});
    if (myCatchRecord) {
        // console.log('myCatchRecord',myCatchRecord);
         await updatecatchRecord(request,myCatchRecord);
         if (myCatchRecord.endStatus == 0) {
            reply({"message":"当前已经有奴隶了！！","statusCode":102,"status":false});
            return; 
         }
    }
    // var hisCatchRecord = await dao.findOne(request,'catchRecord',{slave_id:slave._id + ""});
    var enemay = slave;
    // console.log('3333333',hisCatchRecord);
    // var isTakeAway = false;
    // if (hisCatchRecord) {
    //     await updatecatchRecord(request,hisCatchRecord);
    //     if (hisCatchRecord.endStatus == 0) {
    //         enemay = await dao.findById(request,'user',hisCatchRecord.user_id + ""); 
    //         // console.log('1111enemay._id',enemay._id);
    //          // console.log('22222user._id',user._id);
    //         if (enemay._id + "" == user._id + "") {
    //             reply({"message":"他已经是您的奴隶了！","statusCode":102,"status":false});
    //             return; 
    //         }
    //     }
    // }
    var hisCatchRecord = await dao.findOne(request,'catchRecord',{slave_id:slave._id + ""});
    
    var fightResult = await petService.fightWithUser(request,enemay);
    
    if (fightResult.status == false) {
         reply({"message":"战斗失败，系统出错！","statusCode":107,"status":fightResult.status});
         return;
    } 

    if (fightResult.winner != user.username ) {
        reply({"message":"战斗完成：失败！","statusCode":102,"status":true,resource:fightResult});
        return;
    }

    if (isTakeAway == true) {
        var takeAwayRecord = {};
        takeAwayRecord.user_id = enemay._id + "";
        takeAwayRecord.username = enemay.username;
        takeAwayRecord.nickname = enemay.nickname;
        takeAwayRecord.avatar = enemay.avatar;
        takeAwayRecord.takeUser_id = user._id + "";
        takeAwayRecord.takeUsername = user.username;
        takeAwayRecord.takeNickname = user.nickname;
        takeAwayRecord.takeAvatar = user.avatar;
        takeAwayRecord.createTime = new Date().getTime();
        await dao.save(request,'takeAwayRecord',takeAwayRecord);
    }
    
    var time = new Date().getTime();   
    var endHour = work.maxHour < systemSet.slaveWorkHour?work.maxHour:systemSet.slaveWorkHour;
    var endTime = time + endHour * 60 * 60 * 1000;
   
    var systemSet = await dao.findOne(request,'systemSet',{});
    var catchRecord = {};
    catchRecord.user_id = user._id + "";
    catchRecord.username = user.username;
    catchRecord.nickname = user.nickname;
    catchRecord.avatar = user.avatar;
    catchRecord.createTime = time;
    catchRecord.updateTime = time;
    catchRecord.slave_id = slave._id + "";
    catchRecord.slave_user = slave.username;
    catchRecord.slave_nickname = slave.nickname;
    catchRecord.slave_avatar = slave.avatar;
    catchRecord.endStatus = 0; 
    catchRecord.all_harvest = 0;
    catchRecord.work_id = request.payload.work_id;
    catchRecord.harvestFixedTime = 0;
    catchRecord.harvestDropTime = 0;
    catchRecord.slaveLeaveTime = endTime;
    // catchRecord.
    var result =  await dao.save(request,'catchRecord',catchRecord);
    catchRecord = result.ops[0];
    var workProductDash = await dao.findOne(request,'workProductDash',{work_id:request.payload.work_id,user_id:user._id + ""});
    if (!workProductDash) {
        var workProductDash = {};
        workProductDash.user_id = catchRecord.user_id + "";
        workProductDash.username = catchRecord.username;
        workProductDash.experience = 0;  // 经验
        workProductDash.gold = 0;        // 金币
        workProductDash.props = [];       // 道具
        workProductDash.totalExperience = 0;   //
        workProductDash.totalGold = 0;
        workProductDash.thisFixedTime = 0;
        workProductDash.thisDropTime = 0;
        workProductDash.totalFixedTime = 0;
        workProductDash.totalDropTime = 0;
        workProductDash.work_id = request.payload.work_id;
        await dao.save(request,'workProductDash',workProductDash);
    }
    reply({"message":"抓捕成功！","statusCode":107,"status":true,"resource":fightResult});    
}


// 抓跟班
exports.catchSlave = async function(request,reply){
    var user = request.auth.credentials;
    var systemSet = await dao.findOne(request,'systemSet',{});
    var time = new Date().getTime();
    var slave = await dao.findById(request,'user',request.payload.user_id);
    if (!slave) {
        reply({"message":"用户不存在","statusCode":102,"status":false});
        return; 
    }
    if (slave.guanjiaTime && slave.guanjiaTime > time) {
        reply({"message":"对方有管家，抓不住啊！","statusCode":102,"status":false});
        return; 
    }
    var work = await dao.findOne(request,'workArea',{id:request.payload.work_id});
    if (!work) {
        reply({"message":"建筑不存在！","statusCode":102,"status":false});
        return; 
    }

    // 判断当前工位是不是有奴隶
    // // var myCatchRecord = await dao.findOne(request,'catchRecord',{work_id:request.payload.work_id,user_id:user._id + ""});
    // var myCatchRecord = await dao.findOne(req);
    // // // console.log('1123123213123123',{work_id:request.payload.work_id,user_id:user._id + ""});
    // if (myCatchRecord) {
    //     // // console.log('myCatchRecord',myCatchRecord);
    //      await updatecatchRecord(request,myCatchRecord);
    //      if (myCatchRecord.endStatus == 0) {
    //         reply({"message":"当前已经有奴隶了！！","statusCode":102,"status":false});
    //         return; 
    //      }
    // }

 


    // var building = await dao.findOne(request,'buildings',{user_id:user._id + "",work_id:request.payload.work_id});
    // if (!building) {
    //     building.slaveFlag = false;  
    //     building.status = 0; // 0 建筑闲置 1 建筑正常工作中 2 建筑工作停止
    //     building.slaveStatus = 0;  // 0 没有跟班 1 有跟班累瘫 2 有跟班被抢走 
    //     building.slave = null;   // 跟班
    //     building.work_id = request.payload.work_id;
    //     building.username = user.username;
    //     building.workingTime = 0; // 已工作时间
    //     building.harvest = null;
    //     building.catch_id = "";
    //     building.catchTime = -1;
    //     building.ortherFlag = false;
    //     building.other = null;
    //     // building.
        
    // }
   
    // if (workProductDash.slaveFlag == true) {
    //     reply({"message":"当前已经有奴隶了！！","statusCode":102,"status":false});
    //     return; 
    // }
    

    // var hisCatchRecord = await dao.findOne(request,'catchRecord',{slave_id:slave._id + ""});
    // var enemay = slave;
    // // console.log('3333333',hisCatchRecord);
    // var isTakeAway = false;
    // if (hisCatchRecord) {
    //     await updatecatchRecord(request,hisCatchRecord);
    //     if (hisCatchRecord.endStatus == 0) {
    //         enemay = await dao.findById(request,'user',hisCatchRecord.user_id + "");
    //         isTakeAway = true;
    //         // console.log('1111enemay._id',enemay._id);
    //         // console.log('22222user._id',user._id);
    //         if (enemay._id + "" == user._id + "") {
    //             reply({"message":"他已经是您的奴隶了！","statusCode":102,"status":false});
    //             return; 
    //         }
    //     }
    // }
    
    var hisCatchRecord = await dao.findOne(request,'catchRecord',{slave_id:slave._id + ""});
    var enemay = slave;
    var isTakeAway = false;
    if (hisCatchRecord) {
        await updatecatchRecord(request,hisCatchRecord);
    }

    var fightResult = await petService.fightWithUser(request,enemay);
    
    if (fightResult.status == false) {
         reply({"message":"战斗失败，系统出错！","statusCode":107,"status":fightResult.status});
         return;
    } 

    if (fightResult.winner != user.username ) {
        reply({"message":"战斗完成：失败！","statusCode":102,"status":true,resource:fightResult});
        return;
    }

    if (isTakeAway == true) {

        // 结算被抢者收益
        await dao.updateOne(request,'catchRecord',{_id:hisCatchRecord._id + ""},{slaveLeaveTime:time,otherQiangFlag:1}); // 等于缩短了记录的累瘫时间
        await updatecatchRecord(request,hisCatchRecord);


        var hisWorkProductDash = await dao.findOne(request,'workProductDash',{work_id:request.payload.work_id,user_id:enemay._id + ""});
 
        var other = {};
        other.username = user.username;
        other.avatar = user.avatar;
        other.user_id = user._id + "";
        other.nickname = user.nickname;
        other.name = user.name;

        // 更新被抢者状态
        await dao.updateOne(request,'workProductDash',{_id:hisWorkProductDash._id + ""},{status:2,slaveStatus:3,ortherFlag:true,other:other});
        
        var takeAwayRecord = {};
        takeAwayRecord.user_id = enemay._id + "";
        takeAwayRecord.username = enemay.username;
        takeAwayRecord.nickname = enemay.nickname;
        takeAwayRecord.avatar = enemay.avatar;
        takeAwayRecord.takeUser_id = user._id + "";
        takeAwayRecord.takeUsername = user.username;
        takeAwayRecord.takeNickname = user.nickname;
        takeAwayRecord.takeAvatar = user.avatar;
        takeAwayRecord.createTime = new Date().getTime();
        await dao.save(request,'takeAwayRecord',takeAwayRecord);
    }
    
   
    var endHour = work.maxHour < systemSet.slaveWorkHour?work.maxHour:systemSet.slaveWorkHour; //跟班在一个工作区工作的最后时间
    var endTime = time + endHour * 60 * 60 * 1000;  // 理想情况下跟班停止工作的时间
   
    var systemSet = await dao.findOne(request,'systemSet',{});
    var catchRecord = {};
    catchRecord.user_id = user._id + "";
    catchRecord.username = user.username;
    catchRecord.nickname = user.nickname;
    catchRecord.avatar = user.avatar;
    catchRecord.createTime = time;
    catchRecord.updateTime = time;
    catchRecord.slave_id = slave._id + "";
    catchRecord.slave_user = slave.username;
    catchRecord.slave_nickname = slave.nickname;
    catchRecord.slave_avatar = slave.avatar;
    catchRecord.endStatus = 0;
    catchRecord.all_harvest = 0;
    catchRecord.work_id = request.payload.work_id;
    catchRecord.harvestFixedTime = 0;
    catchRecord.harvestDropTime = 0;
    catchRecord.slaveLeaveTime = endTime;
    catchRecord.maxTime = time + work.maxHour * 60 * 60 * 1000;
    catchRecord.slaveEndTime = time + systemSet.slaveWorkHour * 60 * 60 * 1000;
    // catchRecord.
    var result =  await dao.save(request,'catchRecord',catchRecord);
    catchRecord = result.ops[0];
    var workProductDash = await dao.findOne(request,'workProductDash',{work_id:request.payload.work_id,user_id:user._id + ""});
     console.log('111',workProductDash);
    if (!workProductDash) {
        workProductDash = {};
        workProductDash.user_id = catchRecord.user_id;
        workProductDash.username = catchRecord.username;
        workProductDash.experience = 0;  // 经验
        workProductDash.gold = 0;        // 金币
        workProductDash.props = [];       // 道具
        workProductDash.totalExperience = 0;   //
        workProductDash.totalGold = 0;
        workProductDash.thisFixedTime = 0;
        workProductDash.thisDropTime = 0;
        workProductDash.totalFixedTime = 0;
        workProductDash.totalDropTime = 0;
        workProductDash.work_id = request.payload.work_id;
        workProductDash.slaveFlag = true;  // 跟班标识
        workProductDash.fullFlag = false; // 产出是否已满
        workProductDash.status = 1; // 0 建筑闲置 1 建筑正常工作中 2 建筑工作停止
        workProductDash.slaveStatus = 1;  // 0 没有跟班 1 有跟班正常 2 有跟班累瘫 3 有跟班被抢走 
        workProductDash.slave = slave;   // 跟班信息
        workProductDash.work_id = request.payload.work_id;
        workProductDash.workingTime = 0;
        workProductDash.catch_id = catchRecord._id; 
        workProductDash.catchTime = time;  // 抓住跟班的时间
        workProductDash.ortherFlag = false; 
        workProductDash.other = null; 
        workProductDash.maxTime = work.maxHour * 60 * 60 * 1000; // 建筑最大时间
        var dashResult = await dao.save(request,'workProductDash',workProductDash);
        workProductDash = dashResult.ops[0];
    } else {
       
        console.log('222',slave)
        await dao.updateOne(request,'workProductDash',{_id:workProductDash._id + ""},{
            status:1,
            slaveStatus:1,
            slaveFlag:true,
            slave:slave,
            catch_id:catchRecord._id + "",
            catchTime:time,
            fullFlag:false,
            ortherFlag:false,
            other:null
        });
    }
    reply({"message":"抓捕成功！","statusCode":107,"status":true,"resource":fightResult});    
}


// 抓跟班
exports.freeSlave = async function(request,reply){ 
    var user = request.auth.credentials;
    var workProductDash = await dao.findOne(request,'workProductDash',{user_id:user._id + "",work_id:request.payload.work_id});
    if (!workProductDash) {
        reply({"message":"您还没有跟班！","statusCode":108,"status":false});    
        return;
    }
    if (workProductDash.slaveFlag == false) {
        reply({"message":"您还没有跟班！","statusCode":108,"status":false});    
        return;
    }
    var catchRecord = await dao.findOne(request,'catchRecord',{_id:workProductDash.catch_id + ""});
    if (!catchRecord) {
        reply({"message":"您还没有跟班！","statusCode":108,"status":false});    
        return;
    }
    await updatecatchRecord(request,catchRecord);
    await dao.updateOne(request,'catchRecord',{_id:catchRecord._id + ""},{endStatus:1});
    await dao.updateOne(request,'workProductDash',{_id:workProductDash._id + ""},{slaveFlag:false,status:0,slaveStatus:0,catch_id:"",slave:null,ortherFlag:false,other:null});
    reply({"message":"解雇成功！","statusCode":107,"status":true});    
}

exports.newTips = async function(request,reply){ 
    var user = request.auth.credentials;
    await catchSlaveService.checkTips(request);
    var tips = await dao.find(request,'newPlayTip',{user_id:user._id + "",read:0},{},{createTime:1});
    reply({"message":"查询成功！","statusCode":107,"status":true,resource:tips}); 
}
exports.checkTips = async function(request){  
    var user = request.auth.credentials;
    var newPlayTips = [];
    // 1 工作区解锁
    var tipId = "newBuilding";
    var workArears = await dao.find(request,'workArea',{});
    var needTips = [];
    for (var index in workArears) {
        var workArea = workArears[index];
        if (user.class >= workArea.unlockClass ) {
            var hasTips = await dao.findOne(request,'newPlayTip',{tipId:tipId,siteId:workArea.id});
            if (!hasTips) {
                var tip = {};
                tip.tipId = tipId;
                tip.siteId = workArea.id;
                tip.des = '解锁一块新工作区';
                tip.createTime = new Date().getTime();
                tip.unclockClass = workArea.unlockClass;
                tip.unlockType = 1; // 1 工作区 2 土地 3 养殖场
                tip.username = user.username;
                tip.user_id = user._id + "";
                tip.userid = user.userid;
                tip.nickname = user.nickname;
                tip.read = 0;
                await dao.save(request,'newPlayTip',tip);
            }
        }
    }   
}

exports.addLandUnlockTips = async function(request,user,code,unlockClass){
    var tipId = "newLand";
    var tipType = 2;
    var tip = {};
    tip.tipId = tipId;
    tip.siteId = code;
    tip.des = '解锁一块新土地';
    tip.createTime = new Date().getTime();
    tip.unclockClass = unlockClass;
    tip.unlockType = tipType; // 1 工作区 2 土地 3 养殖场
    tip.username = user.username;
    tip.user_id = user._id + "";
    tip.userid = user.userid;
    tip.nickname = user.nickname;
    tip.read = 0;
    await dao.save(request,'newPlayTip',tip);
}
exports.addFarmUnlockTips = async function(request,user,code,unlockClass){
    var tipId = "newFarm";
    var tipType = 3;
    var tip = {};
    tip.tipId = tipId;
    tip.siteId = code;
    tip.des = '解锁一块新牧场';
    tip.createTime = new Date().getTime();
    tip.unclockClass = unlockClass;
    tip.unlockType = tipType; // 1 工作区 2 土地 3 养殖场
    tip.username = user.username;
    tip.user_id = user._id + "";
    tip.userid = user.userid;
    tip.nickname = user.nickname;
    tip.read = 0;
    await dao.save(request,'newPlayTip',tip);
}
exports.myWorkStatus = async function(request,reply){ 
    // console.log('11123123123');
    var user = request.auth.credentials;
    var myDashs = await dao.find(request,'workProductDash',{username:user.username});
    for (var index in myDashs) {
        var dash = myDashs[index];
        if (dash.slave == null) {
            if (dash.slaveStatus == 3 && dash.other == null) {
                await dao.updateOne(request,'workProductDash',{_id:dash._id + ""},{slaveStatus:0,status:0});
            } else if (dash.slaveStatus != 0) {
                await dao.updateOne(request,'workProductDash',{_id:dash._id + ""},{slaveStatus:0,status:0});
            }
        }
    }
    var workStatusess = [];
    var time = new Date().getTime();
    var workAreas = await dao.find(request,'workArea',{});
    // var catchRecords = await dao.find(request,'catchRecord',{user_id:user._id + "",endStatus:0});
    // if (catchRecords.length > 0) {
    //     for (var index in catchRecords) {
    //         var catchRecord = catchRecords[index];
    //         await updatecatchRecord(request,catchRecord);
    //     }
    // }
    //  // console.log('22222222');   
    /* 
        status:0  // 0 没有跟班  1 
    */
    for (var index in workAreas) {
        var workStatus = {};
        var workArea = workAreas[index];
        var catchrecord = await dao.findOne(request,'catchRecord',{work_id:workArea.id,user_id:user._id + "",endStatus:0});
        // console.log('catchrecord',catchrecord);
        if (catchrecord) {
            // console.log('updatecatchRecord')
            await updatecatchRecord(request,catchrecord);
        }
        // workStatus.unlockClass = workArea.unlockClass;
        var workProductDash = await dao.findOne(request,'workProductDash',{user_id:user._id + "",work_id:workArea.id});
        if (!workProductDash) {

            if (!catchrecord) {
                workProductDash = {};
                workProductDash.user_id = user._id + "";
                workProductDash.username = user.username;
                workProductDash.experience = 0;  // 经验
                workProductDash.gold = 0;        // 金币
                workProductDash.props = [];       // 道具
                workProductDash.totalExperience = 0;   // 
                workProductDash.totalGold = 0;
                workProductDash.thisFixedTime = 0;
                workProductDash.thisDropTime = 0;
                workProductDash.totalFixedTime = 0;
                workProductDash.totalDropTime = 0;
                workProductDash.work_id = workArea.id;
                workProductDash.slaveFlag = false;  // 跟班标识
                workProductDash.fullFlag = false; // 产出是否已满
                workProductDash.status = 0; // 0 建筑闲置 1 建筑正常工作中 2 建筑工作停止
                workProductDash.slaveStatus = 0;  // 0 没有跟班 1 有跟班正常 2 有跟班累瘫 3 有跟班被抢走 
                workProductDash.slave = null;   // 跟班信息
                workProductDash.workingTime = 0;
                workProductDash.catch_id = "";
                workProductDash.catchTime = 0;
                workProductDash.ortherFlag = false;
                workProductDash.other = null; 
                workProductDash.maxTime = workArea.maxHour * 60 * 60 * 1000; // 建筑最大时间
                var dashResult = await dao.save(request,'workProductDash',workProductDash);
                workProductDash = dashResult.ops[0];
            } else {
                // // console.log('!updatecatchRecord');
                //  await updatecatchRecord(request,catchRecord);
            }
          
        }


        // workStatus.work_id = workArea.id;
        // workStatus.name = workArea.name;
        // var catchRecord = await dao.findOne(request,'catchRecord',{user_id:user._id + "",endStatus:0,work_id:workArea.id});
        // if (catchRecord){
        //     workStatus.slaveStatus = true;
        //     var slave = {};
        //     slave.user_id = catchRecord.slave_id;
        //     slave.username = catchRecord.slave_user;
        //     slave.nickname = catchRecord.slave_nickname;
        //     slave.avatar = catchRecord.slave_avatar;
        //     // console.log('slave',slave);
        //     workStatus.slave = slave;
        // } else {
        //     workStatus.slaveStatus = false;
        //     workStatus.slave = null;
    
        // }
        // workStatus.workProductDash = workProductDash;
        workProductDash.unlockClass = workArea.unlockClass;
        workStatusess.push(workProductDash);
    }
    // console.log('workStatusessw',workStatusess);
    reply({"message":"查询成功！","statusCode":107,"status":true,"resource":workStatusess});    
}
exports.myCatched = async function(request,reply){ 
    var user = request.auth.credentials;
    var workProductDashs = await dao.find(request,'workProductDash',{"slave.username":user.username + "",slaveFlag:true});
    // console.log();
    if (workProductDashs.length <= 0) {
        reply({"message":"查询成功！","statusCode":107,"status":true,"resource":{catchedStatus:false,master:null}});    
        return ;
    }
    // var catchRecord = await dao.findOne(request,"catchRecord",{slave_id:user._id + "",endStatus:0});
    // if (!catchRecord) {
    //     reply({"message":"查询成功！","statusCode":107,"status":true,"resource":{catchedStatus:false,master:null}});    
    //     return ;
    // }
    var workProductDash =  workProductDashs[0];
    var catchRecord = await dao.findById(request,'catchRecord',workProductDash.catch_id);
    if (catchRecord) {
        await updatecatchRecord(request,catchRecord);
    }
    var master = {};
    master.username = catchRecord.username;
    master.nickname = catchRecord.nickname;
    master.avatar = catchRecord.avatar;
    master.work_id = catchRecord.work_id;
    reply({"message":"查询成功！","statusCode":107,"status":true,"resource":{catchedStatus:true,master:master}});    
    // if (catchRecord.endStatus == 0) {
    //     var master = {};
    //     master.username = catchRecord.username;
    //     master.nickname = catchRecord.nickname;
    //     master.avatar = catchRecord.avatar;
    //     master.work_id = catchRecord.work_id;
    //     reply({"message":"查询成功！","statusCode":107,"status":true,"resource":{catchedStatus:true,master:master}});    

    // } else {
    //     reply({"message":"查询成功！","statusCode":107,"status":true,"resource":{catchedStatus:false,master:null}});    
    //     return ;
    // }
}
exports.harvestMyWork = async function(request,reply){ 
    // console.log('harvestMyWork');
    var user = request.auth.credentials;
    var work = await dao.findOne(request,'workArea',{id:request.payload.work_id});
    if (user.class < work.unlockClass) {
         reply({"message":"建筑还未解锁，没有收益！","statusCode":108,"status":false});
         return; 
    }
    var dashRecord = await dao.findOne(request,'workProductDash',{user_id:user._id + "",work_id:work.id});
    if (dashRecord.experience == 0 && dashRecord.gold == 0 && dashRecord.props.length <= 0) {
        reply({"message":"没有可收取的东西！","statusCode":108,"status":false});
        return; 
    }
    // console.log('dashRecord',dashRecord);
    var harvest = {};
    harvest.experience = dashRecord.experience;
    harvest.gold = dashRecord.gold;
    harvest.props = dashRecord.props;
    var harvestRecord = {};
    harvestRecord.experience = dashRecord.experience;
    harvestRecord.gold = dashRecord.gold;
    harvestRecord.props = dashRecord.props;
    harvestRecord.work_id = dashRecord.work_id;
    harvestRecord.createTime = new Date().getTime();
    harvestRecord.user_id = user._id + "";
    harvestRecord.username = user.username;
    await dao.save(request,'gbHarvestRecord',harvestRecord);
    // 收取掉落组装备
    if (dashRecord.props.length > 0) {
        for (var index in dashRecord.props) {
                var prop = dashRecord.props[index];
                var prop_id = prop._id + "";
                var propId = prop.id; 
                var propInHouse = await dao.findOne(request,'warahouse',{prop_id:prop._id + "",user_id:user._id + ""});
                // console.log('33333',propInHouse);
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

    // 收取经验和道具
    await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:harvest.gold,experience:harvest.experience});
    // 更新dash
    await dao.updateOne(request,'workProductDash',{_id:dashRecord._id + ""},{experience:0,gold:0,props:[],workingTime:0,fullFlag:false});
    await dao.updateIncOne(request,'workProductDash',{_id:dashRecord._id + ""},{
        totalDropTime:dashRecord.thisDropTime,
        totalFixedTime:dashRecord.thisFixedTime,
        totalGold:dashRecord.gold,
        totalExperience:dashRecord.experience
    });
    console.log('harvestRecord',harvestRecord);
    reply({"message":"收取成功！","statusCode":101,"status":true,resource:harvestRecord});
    return;
}
// 更新抓捕记录的状态和工作区的收益
async function updatecatchRecord(request,catchRecord){ 
    if (catchRecord.endStatus != 0) {
        return;
    }

        // // console.log("updatecatchRecord");
    var systemSet = await dao.findOne(request,'systemSet',{});
    var time = new Date().getTime();

    var workArea = await dao.findOne(request,'workArea',{id:catchRecord.work_id});
    var slave = await dao.findById(request,'user',catchRecord.slave_id + "");
    var workProductDash = await dao.findOne(request,'workProductDash',{work_id:catchRecord.work_id,user_id:catchRecord.user_id + ""});
    var deadline =  time;  // 本次收益的计算截止时间
    var addTime = deadline - catchRecord.updateTime; // 此次工作的时间
    
    if (!workProductDash) {
        workProductDash = {};
        workProductDash.user_id = catchRecord.user_id + "";
        workProductDash.username = catchRecord.username;
        workProductDash.experience = 0;  // 经验
        workProductDash.gold = 0;        // 金币
        workProductDash.props = [];       // 道具
        workProductDash.totalExperience = 0;   // 
        workProductDash.totalGold = 0;
        workProductDash.thisFixedTime = 0;
        workProductDash.thisDropTime = 0;
        workProductDash.totalFixedTime = 0;
        workProductDash.totalDropTime = 0;
        workProductDash.work_id = workArea.id;
        workProductDash.slaveFlag = true;  // 跟班标识
        workProductDash.fullFlag = false; // 产出是否已满
        workProductDash.status = 1; // 0 建筑闲置 1 建筑正常工作中 2 建筑工作停止
        workProductDash.slaveStatus = 0;  // 0 没有跟班 1 有跟班正常 2 有跟班累瘫 3 有跟班被抢走 
        workProductDash.slave = slave;   // 跟班信息
        workProductDash.workingTime = addTime;
        workProductDash.catch_id = catchRecord._id + "";
        workProductDash.catchTime = catchRecord.createTime;
        workProductDash.ortherFlag = false;
        workProductDash.other = null; 
        workProductDash.maxTime = workArea.maxHour * 60 * 60 * 1000; // 建筑最大时间
        var dashResult = await dao.save(request,'workProductDash',workProductDash);
        workProductDash = dashResult.ops[0];
    }

    var status = 0;  // 建筑状态  0 建筑闲置 1 建筑正常工作中 2 建筑工作停止
    var slaveStatus = 0;  // 0 没有跟班 1 有跟班正常 2 有跟班累瘫 3 有跟班被抢走 
    
    
    if (time >= catchRecord.slaveLeaveTime) { // 如果跟班已结束，即到了最大工作时间
        status = 2;
        slaveStatus = 2;
        if (catchRecord.otherQiangFlag == 1) {
            slaveStatus = 3;  // 表示被抢夺
        } else {
            slaveStatus = 2;  // 表示在的情况下已经停止工作
        }
        catchRecord.updateTime = time;  // 更新的时间
        await dao.updateOne(request,'catchRecord',{_id:catchRecord._id + ""},{endStatus:1,updateTime:deadline});
        deadline = catchRecord.slaveLeaveTime;   // 这个表示收益的停止时间
        
    } else {
        status = 1;
        slaveStatus = 1;
    }

    // // 如果跟班还未结束
    // if (catchRecord.endStatus == 0) {
    //     status = 1; // 正常工作
    //     slaveStatus = 1; // 正常工作
    
    
    // } 
    
  
   
    var fixedProductTotalCount = parseInt((deadline - catchRecord.createTime ) / (60 * 1000));
    // console.log('fixedProductTotalCount',fixedProductTotalCount);
    var dropProductTotalCount = parseInt((deadline - catchRecord.createTime ) / (30 * 60 * 1000));
   
    var fullFlag = false;
    if (workProductDash.workingTime >= workProductDash.maxTime) {
        fullFlag = true;
    }

    var thisFixedTime = fixedProductTotalCount - catchRecord.harvestFixedTime;
    // console.log('thisFixedTime',thisFixedTime);
    var thisDropTime = dropProductTotalCount - catchRecord.harvestDropTime;
    await dao.updateIncOne(request,'workProductDash',{_id:workProductDash._id + ""},{thisDropTime:thisDropTime,thisDropTime:thisDropTime,totalFixedTime:thisFixedTime,totalDropTime:thisDropTime});
    // 计算收益
    var work = await dao.findOne(request,'workArea',{id:catchRecord.work_id});
    var thisExperience = work.experience * thisFixedTime;
    var thisGold = work.gold * thisFixedTime;
    await dao.updateIncOne(request,'workProductDash',{_id:workProductDash._id + ""},{
        experience:thisExperience,
        gold:thisGold,
        workingTime:addTime
    });
    // 计算额外掉落
    var dropGruops = await dao.find(request,'dropGroups',{id:work.dropId});
    // // console.log('1111111',dropGruops);
    var props = workProductDash.props;
    if (dropGruops.length > 0) {
       for (var i = 0; i < thisDropTime; i ++) {
        //    // console.log('i',i);
            for (var index in dropGruops) {
                var group = dropGruops[index];
                // // console.log('index',index);
                var sucRand = Math.random();
                // 掉落
                if (sucRand <= group.rate) {
                    var count = Math.round(Math.random() * (group.max - group.min) + group.min);
                    var prop = await dao.findOne(request,'prop',{id:group.propId});
                    // // console.log('222222',prop);
                    if (prop) {
                        prop.count = count;
                        await pushPropNoRepeat(props,prop);
                    }
                }
            }
        }
    }
    // 更新建筑收益、产出是否已满、工作状态、跟班状态
    await dao.updateOne(request,'workProductDash',{_id:workProductDash._id + ""},{
        props:props,
        thisFixedTime:thisFixedTime,
        thisDropTime:thisDropTime,
        fullFlag:fullFlag,
        status:status,
        slaveStatus:slaveStatus
    });
    await dao.updateOne(request,'catchRecord',{_id:catchRecord._id + ""},{
        harvestFixedTime:fixedProductTotalCount,
        harvestDropTime:dropProductTotalCount,
        updateTime:time
    });
}
// 更新道具数量
async function pushPropNoRepeat(props,prop){  
    var haveFlag = false;
    for (var index in props) {
        var tempProp = props[index];
        if (tempProp.id == prop.id) {
            
            tempProp.count = tempProp.count + prop.count;
            haveFlag = true;
            break;
        }
    }
    if (haveFlag == false) {
        props.push(prop);
    }
}

// 更新道具数量
async function pushPropsNoRepeat(props,newProps){  
    for (var index in newProps) {
        var prop = newProps[index];
        await pushPropNoRepeat(props,prop);
    }
}
 exports.workStatus = async function(request,reply){ 
    var user = request.auth.credentials;
    // console.log();
    var works = await dao.find(request,'workArea',{});
    var workStatusess = [];
    if (works.length < 0) {
         reply({"message":"查询失败","statusCode":108,"status":false});
         return;
    }
    for (var index in works) {
        const work = works[index];
        var workStatus = {};
        workStatus.id = work.id;
        workStatus.slaveFlag = false;
        workStatus.slave = null;
        var catchRecord = await dao.findOne(request,'catchRecord',{user_id:user._id + "",endStatus:0});
        if (!catchRecord) {
            workStatus.endStatus = 1;
            workStatus.harvestStatus = 1;
            workStatus.gold = 0;
            workStatus.experience = 0;
        } else {
            await updatecatchRecord(request,catchRecord);
            if (catchRecord.endStatus == 0) {
                workStatus.slaveFlag = true;
                var slave = {};
                slave.username = catchRecord.slave_user;
                slave.nickname = catchRecord.slave_nickname;
                slave.avatar = catchRecord.slave_avatar;
                workStatus.slave = slave;
            }
            catchRecord = await dao.findOne(request,'catchRecord',{user_id:user._id + "",endStatus:0});
            var dashRecord = await dao.findOne(request,'workProductDash',{user_id:user._id + "",work_id:work.id});
            if (dashRecord.experience == 0 && dashRecord.gold == 0 && dashRecord.props.length <= 0) {
                workStatus.haveHarvest = false;
            } else {
                workStatus.haveHarvest = true;
            }
            workStatus.props = dashRecord.props;
            workStatus.gold = dashRecord.gold;
            workStatus.experience = dashRecord.experience;
           
        }
        workStatusess.push(workStatus);
        
    }

    // console.log('workStatuess',workStatusess);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":workStatusess});
 }
// 推荐用户
exports.randUsers = async function(request,reply){
    var user = request.auth.credentials;
    var count = request.payload.count;
    var sum = await dao.findCount(request,'user',{username:{$ne:user.username}});
    var findRes = await dao.find(request,'user',{username:{$ne:user.username}});
    if (sum <= count) {
        for (var index in findRes) {
            var temUser = findRes[index];
            // console.log('temUser',temUser);
            await updateUserCatchedStatus(request,temUser);
        }
        reply({"message":"获取用户列表成功","statusCode":107,"status":true,"resource":findRes,"sum":findRes.length});
        return ;
    }
    var incnos = [];
    var arr = [];
    
    while(arr.length < count){
        var number = Math.floor(Math.random()*findRes.length);
        if(incnos.length == 0){
           
            await updateUserCatchedStatus(request,findRes[number]);
            if (findRes[number].master.username != user.username) {
                incnos.push(number);
                arr.push(findRes[number]);
            } else {
                console.log('findRes[number]',findRes[number]);
            }
           
            // // console.log('arrr',arr);
        } else {
            var hasNumber = false;
            for(var i=0;i<incnos.length;i++){
                if(number == incnos[i]){
                    hasNumber = true;
                    break;
                }
            }
            if(hasNumber == false){
                await updateUserCatchedStatus(request,findRes[number]);
                if (findRes[number].master.username != user.username) { 
                    arr.push(findRes[number]);
                    incnos.push(number); 
                } else {
                   console.log('findRes[number]',findRes[number]);
                }
               
            }
        }
        
    }
    reply({"message":"获取用户列表成功","statusCode":107,"status":true,"resource":arr,"sum":arr.length});

}
const updateUserCatchedStatus = async function(request,user) {
    // console.log("updateUserCatchedStatus");
    
    var workProductDashs = await dao.find(request,'workProductDash',{"slave.username":user.username,slaveFlag:true});
    if (workProductDashs.length <= 0) { 
        user.catchedStatus = false;
        user.master = {};
    } else {
        var workProductDash = workProductDashs[0];
        var catchRecord = await dao.findById(request,'catchRecord',workProductDash.catch_id);
        await updatecatchRecord(request,catchRecord);
        var master = {};
            // console.log('---------catchRecord',catchRecord);
        master.username = catchRecord.username;
        master.nickname = catchRecord.nickname;
        master.avatar = catchRecord.avatar;
        user.catchedStatus = true;
        master.work_id = catchRecord.work_id;
        user.master = {};
    }

    // var catchRecord = await dao.findOne(request,'catchRecord',{slave_id:user._id + "",endStatus:0});
    // if (!catchRecord) {
    //     user.catchedStatus = false;
    //     user.master = {};
    // } else {
    //     await updatecatchRecord(request,catchRecord);
    //     if (catchRecord.endStatus == 0) {
    //         user.catchedStatus = true;
    //         var master = {};
    //         // console.log('---------catchRecord',catchRecord);
    //         master.username = catchRecord.username;
    //         master.nickname = catchRecord.nickname;
    //         master.avatar = catchRecord.avatar;
    //         master.work_id = catchRecord.work_id;
            
    //         user.master = master;
    //         // console.log('user',user);
    //     } else {
    //         user.catchedStatus = false;
    //         user.master = {};
    //     }
    // }

    return;
}
const rescueQuery = function(request,catch_id) {
    var user = request.auth.credentials;
    var req  = require('urllib-sync').request;
    var path = settings.host + 'jmmall.farm.register.count';
    var tugScene = "rescue-" + catch_id;
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
