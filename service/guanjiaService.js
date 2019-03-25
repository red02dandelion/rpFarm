const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");
var urllib = require('urllib');
const guanjiaService = require('../service/guanjiaService');
const landService = require("../service/landService");
const farmService = require("../service/farmService");
exports.guanjiaStatus  = async function(request,reply){  
   
    var gjStatus = await guanjiaService.gjStatus(request);
    reply({
        "message":"查询成功！",
        "statusCode":107,
        "status":true,
        "resource":gjStatus
    });
    return;
    
    var user = request.auth.credentials;
    var time = new Date().getTime();
    var  gaunjiaStatus;  // 0 未开启 1 已过期 2 工作中 3 闲置中 4 休息中
    var lastTime = 0;
    if (user.guanjiaEndTime == null ) { 
        gaunjiaStatus = 0;
    } else if (user.guanjiaEndTime < time) {
        gaunjiaStatus = 1;
    } else if (user.guanjiaTime && user.guanjiaTime > time) {
        gaunjiaStatus = 2;
        lastTime = user.guanjiaEndTime - time;
    } else {

        var now00 = new Date(new Date().setHours(0,0,0,0)).getTime();
        var now12 = now00 + 12 * 60 * 60 * 1000;
        var yester12 = now00 -   12 * 60 * 60 * 1000;
        var tomorrow12 = now12 + 24 * 60 * 60 * 1000;
        var guanjiaWorkRecord;
        if (time <= now12) {
            guanjiaWorkRecord = await dao.findOne(request,'gjWorkRecord',{user_id:user._id + "",createTime:{$gte:yester12,$lte:yester12}});
        } else {
            guanjiaWorkRecord = await dao.findOne(request,'gjWorkRecord',{user_id:user._id + "",createTime:{$gte:now12,$lte:tomorrow12}});
        }
        if (guanjiaWorkRecord) {
            gaunjiaStatus = 4;
        } else {
            gaunjiaStatus = 3;
        }
       lastTime = user.guanjiaEndTime - time;
    }   
    reply({
        "message":"查询成功！",
        "statusCode":107,
        "status":true,
        "resource":{status:gaunjiaStatus,lastTime:lastTime}
    });
}

exports.gjStatus  = async function(request){  
    var user = request.auth.credentials;
    var time = new Date().getTime();
    var  gaunjiaStatus;  // 0 未开启 1 已过期 2 工作中 3 闲置中 4 休息中
    var lastTime = 0;
    if (user.guanjiaEndTime == null ) { 
        gaunjiaStatus = 0;
    } else if (user.guanjiaEndTime < time) {
        gaunjiaStatus = 1;
    } else if (user.guanjiaTime && user.guanjiaTime > time) {
        gaunjiaStatus = 2;
        lastTime = user.guanjiaEndTime - time;
    } else {

        var now00 = new Date(new Date().setHours(0,0,0,0)).getTime();
        var now12 = now00 + 12 * 60 * 60 * 1000;
        var yester12 = now00 -   12 * 60 * 60 * 1000;
        var tomorrow12 = now12 + 24 * 60 * 60 * 1000;
        var guanjiaWorkRecord;
        if (time <= now12) {
            guanjiaWorkRecord = await dao.findOne(request,'gjWorkRecord',{createTime:{$gte:yester12,$lte:yester12}});
        } else {
            guanjiaWorkRecord = await dao.findOne(request,'gjWorkRecord',{createTime:{$gte:now12,$lte:tomorrow12}});
        }
        if (guanjiaWorkRecord) {
            gaunjiaStatus = 4;
        } else {
            gaunjiaStatus = 3;
        }
       lastTime = user.guanjiaEndTime - time;
    }   
    return {status:gaunjiaStatus,lastTime:lastTime};
}
exports.gjharvest  = async function(request,reply){  
    var user = request.auth.credentials;
    var harvest = {};
    var gjWorkRecord;
    if (user.gjworkdId) {
       gjWorkRecord  = await dao.findById(request,'gjWorkRecord',user.gjworkdId);
       if (gjWorkRecord && gjWorkRecord.harvest) {
            harvest = gjWorkRecord.harvest;
       }
    } else {
        var gjWorkRecords = await dao.find(request,'gjWorkRecord',{user_id:user._id + ""},{},{createTime:-1},10,1);
        if (gjWorkRecords.length > 0) {
            gjWorkRecord = gjWorkRecords[0];
            if (gjWorkRecord.harvest) {
                harvest = gjWorkRecord.harvest;
            }
        }
    }
    console.log('harvest',harvest);
    reply({
        "message":"查询成功！",
        "statusCode":107,
        "status":true,
        "resource":harvest
    });
}
exports.confirmHarvest  = async function(request,reply){ 
    var user = request.auth.credentials;
    if (user.gjworkdId) {
       var gjWorkRecord  = await dao.findById(request,'gjWorkRecord',user.gjworkdId);
       await dao.updateOne(request,'gjWorkRecord',{_id:gjWorkRecord._id + ""},{harvest:{}});
    }
     reply({
        "message":"确认成功！",
        "statusCode":107,
        "status":true
    });
}
exports.startGuanjia = async function(request,reply){  
    var user = request.auth.credentials;
    var time = new Date().getTime();
    var gjStatus = await guanjiaService.gjStatus(request);
    console.log("gjStatus",gjStatus);
    if (gjStatus.status == 0) {
        reply({
                "message":"服务未开启！",
                "statusCode":108,
                "status":false
         });
        return;
    }
    if (gjStatus.status == 1) {
        reply({
                "message":"服务未开启！",
                "statusCode":108,
                "status":false
         });
        return;
    }
    if (gjStatus.status == 2) {
        reply({
                "message":"管家已在工作中！",
                "statusCode":108,
                "status":false
         });
        return;
    }
    if (gjStatus.status == 4) {
        reply({
                "message":"今日工作已完成，正在休息！",
                "statusCode":108,
                "status":false
         });
        return;
    }
    if (gjStatus.lastTime < 8 * 60 * 60 * 1000) {
         reply({
                "message":"剩余时间不足！",
                "statusCode":108,
                "status":false
         });
        return;
    }
    var endTime = time + 8 * 60 * 60 * 1000;
    await dao.updateOne(request,'user',{_id:user._id + ""},{guanjiaTime:endTime});
    var gjWorkRecord = {};
    gjWorkRecord.createTime = time;
    gjWorkRecord.user_id = user._id + "";
    gjWorkRecord.username = user.username;
    gjWorkRecord.nickname = user.nickname;
    gjWorkRecord.name = user.name;
    var saveRes = await dao.save(request,'gjWorkRecord',gjWorkRecord);
    gjWorkRecord = saveRes.ops[0];
    await dao.updateOne(request,'user',{_id:user._id + ""},{gjworkdId:gjWorkRecord._id + ""});
    guanjiaService.autoPlantStart(request);
    reply({
            "message":"开启成功！",
            "statusCode":107,
            "status":true
        });
    return;
}

// 开启自动种植
exports.autoPlantStart = async function(request){  
    var user = request.auth.credentials;
    var freeLands = await dao.find(request,'land',{user_id:user._id + "",status:1},{},{code:1});
    if (freeLands.length > 0) {
        for (var index in freeLands) {
            var land = freeLands[index];
            landService.autoPlant(request,land._id + "");
        }
    }
}

// 开启自动种植
exports.autoAnimalStart = async function(request){  
    var user = request.auth.credentials;
    // if (user.farmUnlocked != 1) {
    //     return ;
    // }
    var freeLands = await dao.find(request,'farm',{user_id:user._id + "",status:1},{},{code:1});
    if (freeLands.length > 0) {
        for (var index in freeLands) {
            var land = freeLands[index];
            farmService.autoPlant(request,land._id + "");
        }
    }
}