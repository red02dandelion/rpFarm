const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");
const functionService = require('../service/functionService');
exports.newTips = async function(request,reply){ 
    var user = request.auth.credentials;
    await functionService.checkTips(request);
    var tips = await dao.find(request,'newPlayTip',{user_id:user._id + "",read:0},{},{createTime:1});
    reply({"message":"查询成功！","statusCode":107,"status":true,resource:tips}); 
}

// 购买宠物窝
exports.readTip = async function(request,reply){
    var tip = await dao.findById(request,'newPlayTip',request.params.id);
    await dao.updateOne(request,'newPlayTip',{_id:tip._id + ""},{read:1});
    reply({"message":"更新成功！","statusCode":107,"status":true});
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
    
    // 2 好友解锁
    if (user.stealUnlocked == 1) {

    } else {
        var playerSetting = await dao.findOne(request,'playerSetting',{id:1002});
        if (user.class >= playerSetting.class) {
            await dao.updateOne(request,'user',{_id:user._id + ""},{stealUnlocked:1});
            var tipId = "friend";
            var tip = {};
            tip.tipId = tipId;
            tip.siteId = -1;
            tip.des = playerSetting.tip;
            tip.createTime = new Date().getTime();
            tip.unclockClass = playerSetting.class;
            tip.unlockType = 4; // 1 工作区 2 土地 3 养殖场 4 好友
            tip.username = user.username;
            tip.user_id = user._id + "";
            tip.userid = user.userid;
            tip.nickname = user.nickname;
            tip.read = 0;
            await dao.save(request,'newPlayTip',tip);
        }
    }

    // 宠物
     if (user.petUnlocked == 1) {

     } else {
        var playerSetting = await dao.findOne(request,'playerSetting',{id:1003});
        if (user.class >= playerSetting.class) {
            await dao.updateOne(request,'user',{_id:user._id + ""},{petUnlocked:1});
            var tipId = "pet";
            var tip = {};
            tip.tipId = tipId;
            tip.siteId = -1;
            tip.des = playerSetting.tip;
            tip.createTime = new Date().getTime();
            tip.unclockClass = playerSetting.class;
            tip.unlockType = 4; // 1 工作区 2 土地 3 养殖场 4 好友
            tip.username = user.username;
            tip.user_id = user._id + "";
            tip.userid = user.userid;
            tip.nickname = user.nickname;
            tip.read = 0;
            await dao.save(request,'newPlayTip',tip);
        }
     }

     // 转盘
     if (user.wheelUnlocked == 1) {

     } else {
        var playerSetting = await dao.findOne(request,'playerSetting',{id:1005});
        if (user.class >= playerSetting.class) {
            await dao.updateOne(request,'user',{_id:user._id + ""},{wheelUnlocked:1});
            var tipId = "wheel";
            var tip = {};
            tip.tipId = tipId;
            tip.siteId = -1;
            tip.des = playerSetting.tip;
            tip.createTime = new Date().getTime();
            tip.unclockClass = playerSetting.class;
            tip.unlockType = 6; // 1 工作区 2 土地 3 养殖场 4 好友 5 宠物 6 转盘
            tip.username = user.username;
            tip.user_id = user._id + "";
            tip.userid = user.userid;
            tip.nickname = user.nickname;
            tip.read = 0;
            await dao.save(request,'newPlayTip',tip);
        }
     }

    // 牧场
     if (user.farmUnlocked == 1) {

     } else {
        var playerSetting = await dao.findOne(request,'playerSetting',{id:1011});
        if (user.class >= playerSetting.class) {
            await dao.updateOne(request,'user',{_id:user._id + ""},{farmUnlocked:1});
            var tipId = "farm";
            var tip = {};
            tip.tipId = tipId;
            tip.siteId = -1;
            tip.des = playerSetting.tip;
            tip.createTime = new Date().getTime();
            tip.unclockClass = playerSetting.class;
            tip.unlockType = 7; // 1 工作区 2 土地 3 养殖场 4 好友 5 宠物 6 转盘 7 牧场
            tip.username = user.username;
            tip.user_id = user._id + "";
            tip.userid = user.userid;
            tip.nickname = user.nickname;
            tip.read = 0;
            await dao.save(request,'newPlayTip',tip);
        }
    }

     // 加工厂
     if (user.workshopUnlocked == 1) {

     } else {
        var playerSetting = await dao.findOne(request,'playerSetting',{id:1007});
        if (user.class >= playerSetting.class) {
            await dao.updateOne(request,'user',{_id:user._id + ""},{workshopUnlocked:1});
            var tipId = "wokrshop";
            var tip = {};
            tip.tipId = tipId;
            tip.siteId = -1;
            tip.des = playerSetting.tip;
            tip.createTime = new Date().getTime();
            tip.unclockClass = playerSetting.class;
            tip.unlockType = 7; // 1 工作区 2 土地 3 养殖场 4 好友 5 宠物 6 转盘 7 牧场 8 加工厂
            tip.username = user.username;
            tip.user_id = user._id + "";
            tip.userid = user.userid;
            tip.nickname = user.nickname;
            tip.read = 0;
            await dao.save(request,'newPlayTip',tip);
        }
    }
}