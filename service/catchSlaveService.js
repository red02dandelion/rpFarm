/**
 * 系统配置资源处理器
 * Created by chenda on 2017/3/9.
 */

const dao = require("../dao/dao");
const petService = require('../service/petService');
// 购买宠物窝
exports.cathSlave = async function(request,reply){
    var user = request.auth.credentials;
    var slave = await dao.findById(request,'user',request.payload.user_id);
    if (!slave) {
        reply({"message":"用户不存在","statusCode":102,"status":false});
        return; 
    }
    
    // 判断对面是否有主人
    
    var time = new Date().getTime();
    var systemSet = await dao.findOne(request,'systemSet',{});
    var catchRecord = {};
    catchRecord.user_id = user._id + "";
    catchRecord.username = user.username;
    catchRecord.createTime = time;
    catchRecord.updateTime = time;
    catchRecord.slave_id = slave._id + "";
    catchRecord.slave_user = slave.username;
    catchRecord.endStatus = 0;
    catchRecord.all_harvest = 0;
    catchRecord.work_id = request.payload.work_id;
    catchRecord.harvestFixedTime = 0;
    catchRecord.harvestDropTime = 0;
    catchRecord.slaveLeaveTime = time + systemSet.slaveWorkHour * 60 * 60 * 1000;
    var result =  await dao.save(request,'catchRecord',catchRecord);
    catchRecord = result.ops[0];
    var workProductDash = await dao.findOne(request,'workProductDash',{work_id:request.payload.work_id,user_id:user._id + ""});
    if (!workProductDash) {
        var workProductDash = {};
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
        await dao.save(request,'workProductDash',workProductDash);
    }

    reply({"message":"查询成功","statusCode":107,"status":true,"resource":systemSet});
}

async function updatecatchRecord(request,catchRecord){ 
    var systemSet = await dao.findOne(request,'systemSet',{});
    var time = new Date().getTime();
    var deadline =  time;
    if (time >= systemSet.slaveLeaveTime) {
        catchRecord.endStatus = 1;
        await dao.updateOne(request,'catchRecord',{_id:catchRecord._id + ""},{endStatus:1});
        deadline = systemSet.slaveLeaveTime;
    }
    var fixedProductTotalCount = parseInt((deadline - catchRecord.createTime ) / (60 * 1000));
    var dropProductTotalCount = parseInt((deadline - catchRecord.createTime ) / (30 * 60 * 1000));
    var dashRecord = await dao.findOne(request,'workProductDash',{work_id:catchRecord.work_id,user_id:catchRecord.user_id + ""});
    var thisFixedTime = fixedProductTotalCount - dashRecord.totalFixedTime;
    var thisDropTime = dropProductTotalCount - dashRecord.totalDropTime;
    await dao.updateIncOne(request,'workProductDash',{_id:dashRecord._id + ""},{thisDropTime:thisDropTime,thisDropTime:thisDropTime,totalFixedTime:thisFixedTime,totalDropTime:thisDropTime});

    // 计算收益
    var work = await dao.findOne(request,'workArea',{id:catchRecord.work_id});

    // 计算额外掉落
    var dropGruops = await dao.find(request,'dropGroups',{id:work.dropId});
    console.log('1111111',dropGruops);
    var props = [];
    if (dropGruops.length > 0) {
        for (var index in dropGruops) {
            var group = dropGruops[index];
            var sucRand = Math.random();
            // 掉落
            if (sucRand <= group.rate) {
                var count = Math.round(Math.random() * (group.max - group.min) + group.min);
                var prop = await dao.findOne(request,'prop',{id:group.propId});
                // console.log('222222',prop);
                if (prop) {
                    prop.count = count;
                    props.push(prop);
                }
            }
        }
    }


}

 exports.workStatus = async function(request,reply){ 
     var user = request.auth.credentials;
    var works = await dao.find(request,'workArea',{});
    var workStatusess = [];
    for (var index in works) {
        const work = works[index];
        var workStatus = {};
        workStatus.id = work.id;
        var catchRecord = await dao.findOne(request,'catchRecord',{user_id:user._id + "",endStatus:0});
        await updatecatchRecord(catchRecord);
    }
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
         
        }
        reply({"message":"获取茶友列表成功","statusCode":107,"status":true,"resource":findRes,"sum":findRes.length});
        return ;
    }
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
