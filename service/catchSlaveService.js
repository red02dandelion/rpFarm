/**
 * 系统配置资源处理器
 * Created by chenda on 2017/3/9.
 */

const dao = require("../dao/dao");
const petService = require('../service/petService');
// 抓跟班
exports.cathSlave = async function(request,reply){
    var user = request.auth.credentials;
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
    // 判断当前工位是不是有奴隶
    var myCatchRecord = await dao.findOne(request,'catchRecord',{work_id:request.payload.work_id,user_id:user._id + ""});
    if (myCatchRecord) {
         await updatecatchRecord(request,myCatchRecord);
         if (myCatchRecord.endStatus == 0) {
            reply({"message":"当前已经有奴隶了！！","statusCode":102,"status":false});
            return; 
         }
    }
    var hisCatchRecord = await dao.findOne(request,'catchRecord',{slave_id:slave._id + ""});
    var enemay = slave;
    if (hisCatchRecord) {
        await updatecatchRecord(request,hisCatchRecord);
        if (hisCatchRecord.endStatus == 0) {
            enemay = await dao.findById(request,'user',hisCatchRecord.user_id + "");
        }
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
        
    var time = new Date().getTime();
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
    catchRecord.slaveLeaveTime = time + systemSet.slaveWorkHour * 60 * 60 * 1000;
    // catchRecord.
    var result =  await dao.save(request,'catchRecord',catchRecord);
    catchRecord = result.ops[0];
    var workProductDash = await dao.findOne(request,'workProductDash',{work_id:request.payload.work_id,user_id:user._id + ""});
    if (!workProductDash) {
        var workProductDash = {};
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
        await dao.save(request,'workProductDash',workProductDash);
    }
    reply({"message":"抓捕成功！","statusCode":107,"status":true,"resource":fightResult});    
}
// 抓跟班
exports.freeSlave = async function(request,reply){ 
    var user = request.auth.credentials;
    var catchRecord = await dao.findOne(request,'catchRecord',{user_id:user._id + "",endStatus:0,work_id:request.payload.work_id});
    if (!catchRecord) {
         reply({"message":"您还没有跟班！","statusCode":108,"status":false});    
         return;
    }
    updatecatchRecord(request,catchRecord);
    if (catchRecord.endStatus == 1) {
        reply({"message":"您还没有跟班！","statusCode":108,"status":false});    
        return;
    }
    await dao.updateOne(request,'catchRecord',{_id:catchRecord._id + ""},{endStatus:1});
    reply({"message":"解雇成功！","statusCode":107,"status":true});    
}
exports.myWorkStatus = async function(request,reply){ 
    console.log('11123123123');
    var user = request.auth.credentials;
    var workStatusess = [];
    var workAreas = await dao.find(request,'workArea',{});
    var catchRecords = await dao.find(request,'catchRecord',{user_id:user._id + "",endStatus:0});
    if (catchRecords.length > 0) {
        for (var index in catchRecords) {
            var catchRecord = catchRecords[index];
            await updatecatchRecord(request,catchRecord);
        }
    }
     console.log('22222222');
    for (var index in workAreas) {
        var workStatus = {};
        var workArea = workAreas[index];
        
        workStatus.unlockClass = workArea.unlockClass;
        var workProductDash = await dao.findOne(request,'workProductDash',{user_id:user._id + "",work_id:workArea.id});
        if (!workProductDash) {
            workProductDash = {};
            workProductDash.user_id = user._id + "";
            workProductDash.username = user.username;
            workProductDash.experience = 0;
            workProductDash.gold = 0;
            workProductDash.props = [];
            workProductDash.totalExperience = 0;
            workProductDash.totalGold = 0;
            workProductDash.thisFixedTime = 0;
            workProductDash.thisDropTime = 0;
            workProductDash.totalFixedTime = 0;
            workProductDash.totalDropTime = 0;
            workProductDash.work_id = workArea.id;
            await dao.save(request,'workProductDash',workProductDash);
        }
        workStatus.work_id = workArea.id;
        workStatus.name = workArea.name;
        var catchRecord = await dao.findOne(request,'catchRecord',{user_id:user._id + "",endStatus:0});
        if (catchRecord){
            workStatus.slaveStatus = true;
            var slave = {};
            slave.user_id = catchRecord.slave_id;
            slave.username = catchRecord.slave_user;
            slave.nickname = catchRecord.slave_nickname;
            slave.avatar = catchRecord.slave_avatar;
            console.log('slave',slave);
            workStatus.slave = slave;
        } else {
            workStatus.slaveStatus = false;
            workStatus.slave = null;
    
        }
        workStatus.workProductDash = workProductDash;
       
        workStatusess.push(workStatus);
    }
    reply({"message":"查询成功！","statusCode":107,"status":true,"resource":workStatusess});    
}
exports.myCatched = async function(request,reply){ 
    var user = request.auth.credentials;
    var catchRecord = await dao.findOne(request,"catchRecord",{slave_id:user._id + "",endStatus:0});
    if (!catchRecord) {
        reply({"message":"查询成功！","statusCode":107,"status":true,"resource":{catchedStatus:false,master:null}});    
        return ;
    }
    if (catchRecord) {
        await updatecatchRecord(request,catchRecord);
    }
    if (catchRecord.endStatus == 0) {
        var master = {};
        master.username = catchRecord.username;
        master.nickname = catchRecord.nickname;
        master.avatar = catchRecord.avatar;
        master.work_id = catchRecord.work_id;
        reply({"message":"查询成功！","statusCode":107,"status":true,"resource":{catchedStatus:true,master:master}});    

    } else {
        reply({"message":"查询成功！","statusCode":107,"status":true,"resource":{catchedStatus:false,master:null}});    
        return ;
    }
}
exports.harvestMyWork = async function(request,reply){ 
    var user = request.auth.credentials;
    var workArea = await dao.findOne(request,'workArea',{id:request.payload.work_id});
    if (user.class < workArea.unlockClass) {
         reply({"message":"建筑还未解锁，没有收益！","statusCode":108,"status":false});
         return; 
    }
    var dashRecord = await dao.findOne(request,'workProductDash',{user_id:user._id + "",work_id:work.id});
    if (dashRecord.experience == 0 && dashRecord.gold == 0 && dashRecord.props.length <= 0) {
        reply({"message":"没有可收取的东西！","statusCode":108,"status":false});
        return; 
    }
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
                console.log('33333',propInHouse);
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
    await dao.updateOne(request,'workProductDash',{_id:dashRecord._id + ""},{experience:0,gold:0,props:[]});
    await dao.updateIncOne(request,'workProductDash',{_id:dashRecord._id + ""},{
        totalDropTime:dashRecord.thisDropTime,
        totalFixedTime:thisFixedTime,
        totalGold:dashRecord.gold,
        totalExperience:dashRecord.experience
    });

}
// 更新记录的状态和收益
async function updatecatchRecord(request,catchRecord){ 
    console.log("updatecatchRecord");
    var systemSet = await dao.findOne(request,'systemSet',{});
    var time = new Date().getTime();
    var deadline =  time;
    if (time >= catchRecord.slaveLeaveTime) {
        catchRecord.endStatus = 1;
        await dao.updateOne(request,'catchRecord',{_id:catchRecord._id + ""},{endStatus:1});
        deadline = catchRecord.slaveLeaveTime;
    }
    var fixedProductTotalCount = parseInt((deadline - catchRecord.createTime ) / (60 * 1000));
    var dropProductTotalCount = parseInt((deadline - catchRecord.createTime ) / (30 * 60 * 1000));
    var dashRecord = await dao.findOne(request,'workProductDash',{work_id:catchRecord.work_id,user_id:catchRecord.user_id + ""});
    if (!dashRecord) {
        var workProductDash = {};
        workProductDash.user_id = catchRecord.user_id;
        workProductDash.username = catchRecord.username;
        workProductDash.experience = 0;
        workProductDash.gold = 0;
        workProductDash.props = [];
        workProductDash.totalExperience = 0;
        workProductDash.totalGold = 0;
        workProductDash.thisFixedTime = 0;
        workProductDash.thisDropTime = 0;
        workProductDash.totalFixedTime = 0;
        workProductDash.totalDropTime = 0;
        workProductDash.work_id = request.payload.work_id;
        var result = await dao.save(request,'workProductDash',workProductDash);
        dashRecord = result.ops[0];
    }
    var thisFixedTime = fixedProductTotalCount - catchRecord.harvestFixedTime;
    var thisDropTime = dropProductTotalCount - catchRecord.harvestDropTime;
    await dao.updateIncOne(request,'workProductDash',{_id:dashRecord._id + ""},{thisDropTime:thisDropTime,thisDropTime:thisDropTime,totalFixedTime:thisFixedTime,totalDropTime:thisDropTime});
    // 计算收益
    var work = await dao.findOne(request,'workArea',{id:catchRecord.work_id});
    var thisExperience = work.experience * thisFixedTime;
    var thisGold = work.gold * thisFixedTime;
    await dao.updateIncOne(request,'workProductDash',{_id:dashRecord._id + ""},{experience:thisExperience,gold:thisGold});
    // 计算额外掉落
    var dropGruops = await dao.find(request,'dropGroups',{id:work.dropId});
    console.log('1111111',dropGruops);
    var props = dashRecord.props;
    if (dropGruops.length > 0) {
       for (var i = 0; i < thisDropTime; i ++) {
           console.log('i',i);
            for (var index in dropGruops) {
                var group = dropGruops[index];
                console.log('index',index);
                var sucRand = Math.random();
                // 掉落
                if (sucRand <= group.rate) {
                    var count = Math.round(Math.random() * (group.max - group.min) + group.min);
                    var prop = await dao.findOne(request,'prop',{id:group.propId});
                    // console.log('222222',prop);
                    if (prop) {
                        prop.count = count;
                        await pushPropNoRepeat(props,prop);
                    }
                }
            }
        }
    }

    await dao.updateOne(request,'workProductDash',{_id:dashRecord._id + ""},{props:props,thisFixedTime:thisFixedTime,
        thisDropTime:thisDropTime});
    await dao.updateOne(request,'catchRecord',{_id:catchRecord._id + ""},{
        harvestFixedTime:fixedProductTotalCount,
        harvestDropTime:dropProductTotalCount,
    });
     reply({"message":"收获成功！","statusCode":101,"status":true,"resource":harvest}); 
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
        var catchRecord = await dao.findOne(request,'catchRecord',{user_id:user._id + "",endStatus:0});
        if (!catchRecord) {
            workStatus.endStatus = 1;
            workStatus.harvestStatus = 1;
            workStatus.gold = 0;
            workStatus.experience = 0;
        } else {
            await updatecatchRecord(request,catchRecord);
            catchRecord = await dao.findOne(request,'catchRecord',{user_id:user._id + "",endStatus:0});
            var dashRecord = await dao.findOne(request,'workProductDash',{user_id:user._id + "",work_id:work.id});
            if (dashRecord.experience == 0 && dashRecord.gold == 0 && dashRecord.props.length <= 0 && catchRecord.endStatus == 1) {
                workStatus.harvestStatus = 1;
            } else {
                workStatus.harvestStatus = 0;
            }
            workStatus.props = dashRecord.props;
            workStatus.gold = dashRecord.gold;
            workStatus.experience = dashRecord.experience;
           
        }
        workStatusess.push(workStatus);
        
    }
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
            console.log('temUser',temUser);
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
            incnos.push(number);
            await updateUserCatchedStatus(request,findRes[number]);
            arr.push(findRes[number]);
            // console.log('arrr',arr);
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
                arr.push(findRes[number]);
                // console.log('arrr',arr);
                incnos.push(number); 
            }
        }
        
    }
    reply({"message":"获取用户列表成功","statusCode":107,"status":true,"resource":arr,"sum":arr.length});

}
const updateUserCatchedStatus = async function(request,user) {
    console.log("updateUserCatchedStatus");
    var catchRecord = await dao.findOne(request,'catchRecord',{slave_id:user._id + "",endStatus:0});
    if (!catchRecord) {
        user.catchedStatus = false;
        user.master = {};
    } else {
        await updatecatchRecord(request,catchRecord);
        if (catchRecord.endStatus == 0) {
            user.catchedStatus = true;
            var master = {};
            console.log('---------catchRecord',catchRecord);
            master.username = catchRecord.username;
            master.nickname = catchRecord.nickname;
            master.avatar = catchRecord.avatar;
            master.work_id = catchRecord.work_id;
            user.master = master;
            console.log('user',user);
        } else {
            user.catchedStatus = false;
            user.master = {};
        }
    }

    return;
}
const rescueQuery = function(request,catch_id) {
    var user = request.auth.credentials;
    var req  = require('urllib-sync').request;
    var path = settings.host + 'jmmall.farm.register.count';
    var tugScene = "rescue-" + catch_id;
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
            }

        });
    console.log('result.data',result.data.toString());
    var data = JSON.parse(result.data.toString());
    if (data.c != 200) {
        return 0;
    } 
    console.log('count',data.d.tugScene);
    return data.d.tugScene;
} 
