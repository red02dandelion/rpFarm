/**
 * 管理员服务层
 * Created by chenda on 2016/4/30.
 */

const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");
const userService = require('../service/userService');
const settings = require('../settings');
// var payService = require('../service/payService');

exports.userList = async function(request,reply){ 
    var userList = await dao.find(request,'user',{},{},{createTime:-1},request.params.size,request.params.page);
    var sum = await dao.findCount(request,"user");
    for (var index in userList) {
        var user = userList[index];
        userService.updateOutStatus(request,reply,user.username);
    }
    userList = await dao.find(request,'user',{},{},{createTime:-1},request.params.size,request.params.page);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":userList,"sum":sum});
}


exports.userListFilter = async function(request,reply){ 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    console.log('where',where);
    var userList = await dao.find(request,'user',where,{},{createTime:-1},request.params.size,request.params.page);
    var sum = await dao.findCount(request,"user",where);
    // for (var index in userList) {
    //     var user = userList[index];
    //     // userService.updateOutStatus(request,reply,user.username);
    // }
    // userList = await dao.find(request,'user',where,{},{createTime:-1},request.params.size,request.params.page);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":userList,"sum":sum});
}

exports.userdetail = async function(request,reply){
    var user = await dao.findById(request,'user',request.params.id);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":user});
}

exports.userNamedetail = async function(request,reply){
    var user = await dao.find(request,'user',{username:request.params.username});
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":user});
}

exports.putUser = async function(request,reply){ 
    var user = await dao.findById(request,'user',request.params.userId);
    console.log('req.payload is ',request.payload);
    var admin = request.auth.credentials;
    var apply = request.payload;
    if (apply.password) {
        apply.password = CryptoJS.AES.encrypt(apply.password,"AiMaGoo2016!@.")+"";
    }
     if (apply.pay_password) {
        apply.pay_password = CryptoJS.AES.encrypt(apply.password,"AiMaGoo2016!@.")+"";
    }
    if (apply.state == 1) {
        apply.scope = ["USER"];
    } else {
        apply.scope = [];
    }
    console.log('apply is ',apply);
    // if (apply.gold) {
    //     var newGold = parseFloat(apply.gold.toFixed(2));
    //     if (newGold != user.gold) {
    //         var 
    //     } 
    // }
    var updateRes = await dao.updateOne(request,'user',{_id:request.params.userId},apply);
    reply({"message":"更新成功","statusCode":101,"status":true});
}

exports.adminRecharge = async function(request,reply){ 
    var admin = request.auth.credentials;
    var user = await dao.findById(request,'user',request.params.userId);
    if (request.params.gold <= 0) {
        reply({"message":"金额不合法","statusCode":102,"status":false});
         return;
    }
    var gold = Math.round(request.payload.gold);
    var power = Math.round(request.payload.power);
    var dimond = Math.round(request.payload.dimond);
    var experience = Math.round(request.payload.experience);
    var hb = Math.round(request.payload.hb * 100) / 100;
    var plt_sessence = Math.round(request.payload.plt_sessence);
    await dao.updateIncOne(request,'user',{_id:request.params.userId + ""},{gold:gold,power:power,dimond:dimond,experience:experience,hb:hb,plt_sessence:plt_sessence});
    
    var adminRecarge = request.payload;
    adminRecarge.createTime = new Date().getTime();
    adminRecarge.admin_username = admin.username;
    adminRecarge.admin_name = admin.name;
    adminRecarge.username = user.username;
    adminRecarge.gold = gold;
    adminRecarge.power = power;
    adminRecarge.dimond = dimond;
    adminRecarge.experience = experience;
    adminRecarge.hb = hb;
    adminRecarge.plt_sessence = plt_sessence;
    await dao.save(request,'adminRecharge',adminRecarge);
    reply({"message":"更新成功","statusCode":101,"status":true});
}

// exports.adminRechargeList = async function(request,reply){ 
//    var where = {};
//     if (request.payload.where) {
//         where = request.payload.where;
//     }
//     // console.log('where',where);
//     var userList = await dao.find(request,'adminRecharge',where,{},{createTime:-1},request.params.size,request.params.page);
//     var sum = await dao.findCount(request,"adminRecharge",where);
//     // for (var index in userList) {
//     //     var user = userList[index];
//     //     // userService.updateOutStatus(request,reply,user.username);
//     // }
//     // userList = await dao.find(request,'user',where,{},{createTime:-1},request.params.size,request.params.page);
//     reply({"message":"查询成功","statusCode":107,"status":true,"resource":userList,"sum":sum});
// }

exports.sons = async function(request,reply){ 
    var user = await dao.findById(request,'user',request.params.id);
    
    var sons = await dao.find(request,'user',{parentUsername:user.username},{},{createTime:-1});
    console.log('son is' + sons);
    reply({"message":"查询成功","statusCode":101,"status":true,"resource":sons});
}


exports.rechageList = async function(request,reply){ 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    // console.log('where',where);
    var userList = await dao.find(request,'recharge',where,{},{createTime:-1},request.params.size,request.params.page);
    var sum = await dao.findCount(request,"recharge",where);
    var groupSum = await dao.findSum(request,'recharge',{$match:where},{$group:{_id:null,sum:{$sum:"$gold"}}});
    // var buyRecords = {};
    var total = 0;
    if (groupSum.length >0) {
         total = parseFloat(groupSum[0].sum).toFixed(2);
    }
    // for (var index in userList) {
    //     var user = userList[index];
    //     // userService.updateOutStatus(request,reply,user.username);
    // }
    // userList = await dao.find(request,'user',where,{},{createTime:-1},request.params.size,request.params.page);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":userList,"sum":sum,"total":total});
}
exports.putRechargeBill = async function(request,reply){ 
    var findRes = await dao.findById(request,'recharge',request.params.billId);
    if (findRes == null) {
        reply({"message":"无此订单","statusCode":102,"status":false});
        return;
    }
    if (findRes.complete_status == 2) {
        reply({"message":"该订单已经驳回！","statusCode":102,"status":false});
        return ;
    }
    if (findRes.complete_status == 1) {
        reply({"message":"该订单已经处理！","statusCode":102,"status":false});
        return ;
    }
   await dao.updateOne(request,'recharge',{_id:request.params.billId},{complete_status:request.payload.complete_status});
   if (request.payload.complete_status == 2) {      
       await dao.updateIncOne(request,'user',{_id:findRes._id},{"gold":findRes.gold});
   }
  reply({"message":"操作成功","statusCode":101,"status":true}); 
}



exports.systemInfo = async function(request,reply){ 
    var systemSet = await dao.findOne(request,'systemSet',{});
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":systemSet});
}

exports.putSystem = async function(request,reply){ 
    var systemSet = await dao.findOne(request,'systemSet',{});
    var aplly = request.payload.aplly;
    if (aplly == {}) {
        reply({"message":"内容错误","statusCode":102,"status":false});
    }
    if (aplly.tag1Name) {
        await dao.updateOne(request,'plantQuality',{id:1},{name:aplly.tag1Name});
    }
    if (aplly.tag2Name) {
        await dao.updateOne(request,'plantQuality',{id:2},{name:aplly.tag2Name});
    }
    if (aplly.tag3Name) {
        await dao.updateOne(request,'plantQuality',{id:3},{name:aplly.tag3Name});
    }
    if (aplly.tag4Name) {
        await dao.updateOne(request,'plantQuality',{id:4},{name:aplly.tag4Name});
    }
    if (aplly.tag5Name) {
        await dao.updateOne(request,'plantQuality',{id:5},{name:aplly.tag5Name});
    }
    if (aplly.tag6Name) {
        await dao.updateOne(request,'plantQuality',{id:6},{name:aplly.tag6Name});
    }
    if (aplly.tag7Name) {
        await dao.updateOne(request,'plantQuality',{id:0},{name:aplly.tag7Name});
    }
    console.log('--systemset' + systemSet + "aplly" + aplly);
    console.log('aplly is',aplly);

    var updateRes = await dao.updateOne(request,"systemSet",{_id:systemSet._id},aplly);
    // if ()
    reply({"message":"更新成功","statusCode":107,"status":true});
}

exports.putseed = async function(request,reply){
    var payload = request.payload;
    var seed = await dao.findById(request,'seed',request.params.id);
    if (seed == null) {
        reply({"message":"种子不存在","statusCode":102});
    }
    if (payload.name) {
        payload.seedname = payload.name;
    }
    delete payload.name;
    var updateRes = await dao.updateOne(request,'seed',{_id:request.params.id},payload);
    reply({"message":"修改成功","statusCode":101,"status":true});
}
exports.seedlist = async function(request,reply){  
    var seedList = await dao.find(request,'seed',{},{},{createTime:-1},request.params.size,request.params.page);
    var sum = await dao.findCount(request,"seed");
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":seedList,"sum":sum});
}
exports.seedDetail = async function(request,reply){  
    var seed = await dao.findById(request,'seed',request.params.id);
    if (seed == null) {
        reply({"message":"种子不存在","statusCode":108});
        return;
    }
    // var sum = await dao.findCount(request,"seed");
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":seed});
}

//房屋
exports.putHouse = async function(request,reply){
    var payload = request.payload;
    var seed = await dao.findById(request,'house',request.params.id);
    if (seed == null) {
        reply({"message":"房屋不存在","statusCode":102});
    }
     if (payload.name) {
        payload.housename = payload.name;
    }
    delete payload.name;
    var updateRes = await dao.updateOne(request,'house',{_id:request.params.id},payload);
    reply({"message":"修改成功","statusCode":101,"status":true});
}
exports.houselist = async function(request,reply){  
    var seedList = await dao.find(request,'house',{},{},{createTime:-1},request.params.size,request.params.page);
    var sum = await dao.findCount(request,"house");
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":seedList,"sum":sum});
}
exports.houseDetail = async function(request,reply){  
    var seed = await dao.findById(request,'house',request.params.id);
    if (seed == null) {
        reply({"message":"房屋不存在","statusCode":108});
        return;
    }
    // var sum = await dao.findCount(request,"seed");
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":seed});
}

// 宠物
exports.putDog = async function(request,reply){
    var payload = request.payload;
    if (payload.name) {
        payload.dogname = payload.name;
    }
    delete payload.name;
    // console.log('payload is',payload);
    // console.log('req params id is',request.params.id);
    var seed = await dao.findById(request,'dog',request.params.id);
    if (seed == null) {
        reply({"message":"宠物不存在","statusCode":102});
        return;
    }
    // console.log('dog is',seed);
    var updateRes = await dao.updateOne(request,'dog',{_id:request.params.id},payload);
    // console.log('updateRes is',updateRes);
    reply({"message":"修改成功","statusCode":101,"status":true});
}
exports.doglist = async function(request,reply){  
    var seedList = await dao.find(request,'dog',{},{},{createTime:-1},request.params.size,request.params.page);
    var sum = await dao.findCount(request,"dog");
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":seedList,"sum":sum});
}
exports.dogDetail = async function(request,reply){  
    var seed = await dao.findById(request,'dog',request.params.id);
    if (seed == null) {
        reply({"message":"没有这个狗子","statusCode":108});
        return;
    }
    // var sum = await dao.findCount(request,"seed");
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":seed});
}

// exports.withdrawalList = async function(request,reply){  
//     var withdrawalList = await dao.find(request,'withDrawlList',{},{},{commit_time:-1},request.payload.size,request.payload.page);
//     var sum = await dao.findCount(request,"withDrawlList");
//     reply({"message":"查询成功","statusCode":107,"status":true,"resource":seedList,"sum":sum});
// }
exports.updateWithdrawalList = async function(request,reply){   
    var updateRes = await dao.updateOne(request,'withDrawlList',{_id:request.payload.withdrawal_id,complete_status:request.payload.complete_status});
    reply({"message":"更新成功","statusCode":101,"status":true});
}
// exports.delseed = async function(request,reply){ 
//     var seed = request.payload;
//     var del = await dao.del(request,'seed',{_id:request.params.seed_id});
//     reply({"message":"删除成功","statusCode":101,"status":true});
// }


exports.putWithdrawalStatus = async function(request,reply){ 
    var findRes = await dao.findById(request,'withdraw',request.params.billId);
    if (findRes == null) {
         reply({"message":"记录不存在","statusCode":102,"status":false});
         return;
    }

    // if (findRes.type == 2) {
    //     var  updateRes = await dao.updateOne(request,'withdraw',{_id:request.params.billId},{complete_status:request.payload.complete_status});
    //     reply({"message":"操作成功","statusCode":101,"status":true});
    //     return;
    // } 
    if (findRes.complete_status != 0) {
        reply({"message":"该订单已处理过","statusCode":102,"status":false});
        return;
    }
    var updateRes = await dao.updateOne(request,'withdraw',{_id:request.params.billId},{complete_status:request.payload.complete_status});
    // if (findRes.complete_status == 3) {
    //     reply({"message":"已经驳回的订单无法再处理","statusCode":102,"status":false});
    //     return;
    // }
    if (request.payload.complete_status == 2) {
        var updateRes = await dao.updateIncOne(request,'user',{username:findRes.username},{gold:findRes.gold});
        // updateRes = await dao.updateOne(request,'withdraw',{_id:request.params.billId},{complete_status:request.payload.complete_status});
        reply({"message":"驳回成功","statusCode":101,"status":true});
        return;
    }

    reply({"message":"操作成功","statusCode":101,"status":true});
    // if (findRes.complete_status == 1 || findRes.complete_status == 2) {
    //     reply({"message":"该订单已处理过","statusCode":102,"status":false});
    //     return;
    // }
    // if (request.payload.complete_status == 1) {
    //    await payService.transferAlipay(request,reply,findRes);
    // }
    
    // reply({"message":"更新成功","statusCode":101,"status":true});
}
exports.withdrawalList = async function(request,reply) { 
    console.log('request is ',request); 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var groupSum = await dao.findSum(request,'withdraw',{$match:where},{$group:{_id:null,sum:{$sum:"$gold"}}});
    // var buyRecords = {};
    var total = 0;
    if (groupSum.length >0) {
         total = parseFloat(groupSum[0].sum).toFixed(2);
    }
    var withdrawalList = await dao.find(request,'withdraw',where,{},{commit_time:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'withdraw',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum,"total":total});
}

exports.transferList = async function(request,reply) { 
    // console.log('request is ',request); 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var groupSum = await dao.findSum(request,'transfer',{$match:where},{$group:{_id:null,sum:{$sum:"$gold"}}});
    // var buyRecords = {};
    var total = 0;
    if (groupSum.length >0) {
         total = parseFloat(groupSum[0].sum).toFixed(2);
    }
    var withdrawalList = await dao.find(request,'transfer',where,{},{createTime:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'transfer',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum,"total":total});
}

exports.tradeList = async function(request,reply) { 
    // console.log('request is ',request); 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var groupSum = await dao.findSum(request,'sale',{$match:where},{$group:{_id:null,sum:{$sum:"$gold"}}});
    // var buyRecords = {};
    var total = 0;
    if (groupSum.length >0) {
         total = parseFloat(groupSum[0].sum).toFixed(2);
    }
    var withdrawalList = await dao.find(request,'sale',where,{},{createTime:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'sale',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum,"total":total});
}

exports.stealList = async function(request,reply) { 
    // console.log('request is ',request); 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var groupSum = await dao.findSum(request,'stealRecord',{$match:where},{$group:{_id:null,sum:{$sum:"$gold"}}});
    // var buyRecords = {};
    var total = 0;
    if (groupSum.length >0) {
         total = parseFloat(groupSum[0].sum).toFixed(2);
    }
    var withdrawalList = await dao.find(request,'stealRecord',where,{},{createTime:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'stealRecord',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum,"total":total});
}

exports.buyList = async function(request,reply) { 
    // console.log('request is ',request); 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var groupSum = await dao.findSum(request,'buyRecord',{$match:where},{$group:{_id:null,sum:{$sum:"$gold"}}});
    // var buyRecords = {};
    var total = 0;
    if (groupSum.length >0) {
         total = parseFloat(groupSum[0].sum).toFixed(2);
    }
    var withdrawalList = await dao.find(request,'buyRecord',where,{},{createTime:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'buyRecord',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum,"total":total});
}

exports.awardList = async function(request,reply) { 
    // console.log('request is ',request); 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var groupSum = await dao.findSum(request,'awardRecord',{$match:where},{$group:{_id:null,sum:{$sum:"$gold"}}});
    // var buyRecords = {};
    var total = 0;
    if (groupSum.length >0) {
         total = parseFloat(groupSum[0].sum).toFixed(2);
    }
    var withdrawalList = await dao.find(request,'awardRecord',where,{},{createTime:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'awardRecord',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum,"total":total});
}
exports.adminRechargeList = async function(request,reply) { 
    // console.log('request is ',request); 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    // console.log(request.payload.where);
    var groupSum = await dao.findSum(request,'adminRecharge',{$match:where},{$group:{_id:null,sum:{$sum:"$gold"}}});
    // var buyRecords = {};
    var total = 0;
    if (groupSum.length >0) {
         total = parseFloat(parseFloat(groupSum[0].sum).toFixed(2)) ;
    }
    var withdrawalList = await dao.find(request,'adminRecharge',where,{},{createTime:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'adminRecharge',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum,"total":total});
}
// 
exports.plantList = async function(request,reply) { 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var withdrawalList = await dao.find(request,'plant',where,{},{createTime:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'plant',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum});
}

exports.animalList = async function(request,reply) { 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var withdrawalList = await dao.find(request,'animal',where,{},{createTime:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'animal',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum});
}
exports.plantDetail= async function(request,reply) { 
    var plant = await dao.findById(request,'plant',request.params.id);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":plant});
}
exports.animalDetail= async function(request,reply) { 
    var plant = await dao.findById(request,'animal',request.params.id);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":plant});
}
exports.putPlant = async function(request,reply) { 
    var plant = await dao.findById(request,'plant',request.params.id);
    var oldTag = plant.qualityId;
    if (plant == null) {
        reply({"message":"查询失败","statusCode":102,"status":false,"resource":plant});
        return ;
    }
   if (request.payload.animationId >= settings.plantBotId && request.payload.animationId <= settings.plantTopId) {
       if (request.payload.animationId != plant.animationId) {
           reply({"message":"基本植物的动效不能更改！","statusCode":102,"status":false,"resource":plant});
           return ;
       }
   }
    var tag = await dao.findOne(request,'plantQuality',{id:request.payload.qualityId});
    if (!tag) {
        reply({"message":"无此标签","statusCode":102,"status":false});
        return ;
    }
    request.payload.qualityName = tag.name;
    console.log('req payload',request.payload);
    var sortFlagPlant = await dao.findOne(request,'plant',{sortFlag:request.payload.sortFlag});
    if (sortFlagPlant && sortFlagPlant._id + "" != request.params.id) {
        reply({"message":"解锁顺序请不要重复！","statusCode":102,"status":false});
        return ;
    }
    if (request.payload.sortFlag <= 0) {
        reply({"message":"解锁顺序请输入大于0的整数！","statusCode":102,"status":false});
        return ;
    }
    
    if (request.payload.sortFlag % 1 != 0 ) {
        reply({"message":"请输入整数！","statusCode":102,"status":false});
        return ;
    }
    if (request.payload.sortFlag > 1) {
        var preSortFlag = request.payload.sortFlag - 1;
        var sortFlagPlant = await dao.findOne(request,'plant',{sortFlag:preSortFlag});
        if (!sortFlagPlant) {
            reply({"message":"请保证解锁顺序连续！","statusCode":102,"status":false});
            return ;
        }
    }

    if (request.payload.unlockTime <= 0 ) {
        request.payload.free = 1;
    } else {
        request.payload.free = 0;
         if (request.payload.everyPrice <= 0) {
            reply({"message":"请填写正确的解锁价格！","statusCode":102,"status":false});
            return ;
        }
    }

    var animationPlant = await dao.findOne(request,'plant',{id:request.payload.animationId});
    if (!animationPlant) {
        reply({"message":"无此动效！","statusCode":102,"status":false});
        return ;
    }
   
    console.log('req.animationId',request.payload.animationId);
    console.log('animationPlant',animationPlant);
    request.payload.animationName = animationPlant.animationName;
    request.payload.animationId = animationPlant.animationId;

    await dao.updateOne(request,'plant',{_id:request.params.id},request.payload);
    // if (request.payload.qualityId) {
        await dao.updateOne(request,'plantQuality',{id:request.payload.qualityId},{hasSeed:1});
    // }
    var oldTagPlants = await dao.find(request,'plant',{qualityId:oldTag});
    if (oldTagPlants.length <= 0) {
        await dao.updateOne(request,'plantQuality',{id:oldTag},{hasSeed:0});
    }

    

    reply({"message":"更新成功！","statusCode":101,"status":true,"resource":plant});
}

exports.putAnimal = async function(request,reply) { 
    var plant = await dao.findById(request,'animal',request.params.id);
    var oldTag = plant.qualityId;
    if (plant == null) {
        reply({"message":"查询失败","statusCode":102,"status":false,"resource":plant});
        return ;
    }
   if (request.payload.animationId >= settings.plantBotId && request.payload.animationId <= settings.plantTopId) {
       if (request.payload.animationId != plant.animationId) {
           reply({"message":"基本动物的动效不能更改！","statusCode":102,"status":false,"resource":plant});
           return ;
       }
   }
    var tag = await dao.findOne(request,'animalQuality',{id:request.payload.qualityId});
    if (!tag) {
        reply({"message":"无此标签","statusCode":102,"status":false});
        return ;
    }
    request.payload.qualityName = tag.name;
    console.log('req payload',request.payload);
    var sortFlagPlant = await dao.findOne(request,'animal',{sortFlag:request.payload.sortFlag});
    if (sortFlagPlant && sortFlagPlant._id + "" != request.params.id) {
        reply({"message":"解锁顺序请不要重复！","statusCode":102,"status":false});
        return ;
    }
    if (request.payload.sortFlag <= 0) {
        reply({"message":"解锁顺序请输入大于0的整数！","statusCode":102,"status":false});
        return ;
    }
    
    if (request.payload.sortFlag % 1 != 0 ) {
        reply({"message":"请输入整数！","statusCode":102,"status":false});
        return ;
    }
    if (request.payload.sortFlag > 1) {
        var preSortFlag = request.payload.sortFlag - 1;
        var sortFlagPlant = await dao.findOne(request,'animal',{sortFlag:preSortFlag});
        if (!sortFlagPlant) {
            reply({"message":"请保证解锁顺序连续！","statusCode":102,"status":false});
            return ;
        }
    }

    if (request.payload.unlockTime <= 0 ) {
        request.payload.free = 1;
    } else {
        request.payload.free = 0;
         if (request.payload.everyPrice <= 0) {
            reply({"message":"请填写正确的解锁价格！","statusCode":102,"status":false});
            return ;
        }
    }

    var animationPlant = await dao.findOne(request,'animal',{id:request.payload.animationId});
    if (!animationPlant) {
        reply({"message":"无此动效！","statusCode":102,"status":false});
        return ;
    }
   
    console.log('req.animationId',request.payload.animationId);
    console.log('animationPlant',animationPlant);
    request.payload.animationName = animationPlant.animationName;
    request.payload.animationId = animationPlant.animationId;

    await dao.updateOne(request,'plant',{_id:request.params.id},request.payload);
    // if (request.payload.qualityId) {
        await dao.updateOne(request,'animalQuality',{id:request.payload.qualityId},{hasSeed:1});
    // }
    var oldTagPlants = await dao.find(request,'plant',{qualityId:oldTag});
    if (oldTagPlants.length <= 0) {
        await dao.updateOne(request,'animalQuality',{id:oldTag},{hasSeed:0});
    }

    

    reply({"message":"更新成功！","statusCode":101,"status":true,"resource":plant});
}

exports.addPlant = async function(request,reply) { 
    var plant = request.payload;
    var tag = await dao.findOne(request,'plantQuality',{id:request.payload.qualityId});
    if (!tag) {
        reply({"message":"无此标签","statusCode":102,"status":false});
        return ;
    }
    var sortFlagPlant = await dao.findOne(request,'plant',{sortFlag:request.payload.sortFlag});
    if (sortFlagPlant) {
        reply({"message":"解锁顺序请不要重复！","statusCode":102,"status":false});
        return ;
    }
    if (request.payload.sortFlag <= 0) {
        reply({"message":"解锁顺序请输入大于0的整数！","statusCode":102,"status":false});
        return ;
    }
    
    if (request.payload.sortFlag % 1 != 0 ) {
        reply({"message":"请输入整数！","statusCode":102,"status":false});
        return ;
    }
    if (request.payload.sortFlag > 1) {
        var preSortFlag = request.payload.sortFlag - 1;
        var sortFlagPlant = await dao.findOne(request,'plant',{sortFlag:preSortFlag});
        if (!sortFlagPlant) {
            reply({"message":"请保证解锁顺序连续！","statusCode":102,"status":false});
            return ;
        }
    }

    if (plant.unlockTime <= 0 ) {
        plant.free = 1;
    } else {
        plant.free = 0;
        if (plant.everyPrice <= 0) {
            reply({"message":"请填写正确的解锁价格！","statusCode":102,"status":false});
            return ;
        }
    }

    var animationPlant = await dao.findOne(request,'plant',{id:plant.animationId});
    if (!animationPlant) {
        reply({"message":"无此动效！","statusCode":102,"status":false});
        return ;
    }
    
    var plants = await dao.find(request,'plant',{},{},{id:-1});
    var lastPlant = plants[0];
    plant.id = Number(Number(lastPlant.id) + 1);
    plant.createTime = new Date().getTime();
    // plant.sortFlag = lastPlant.id + 1;
    plant.qualityName = tag.name;
    plant.animationName = animationPlant.animationName;
    plant.animationId = animationPlant.animationId;
    await dao.save(request,'plant',plant);
    await dao.updateOne(request,'plantQuality',{id:request.payload.qualityId},{hasSeed:1});
    reply({"message":"添加成功","statusCode":101,"status":true,"resource":plant});
}

exports.addAnimal = async function(request,reply) { 
    var plant = request.payload;
    var tag = await dao.findOne(request,'animalQuality',{id:request.payload.qualityId});
    if (!tag) {
        reply({"message":"无此标签","statusCode":102,"status":false});
        return ;
    }
    var sortFlagPlant = await dao.findOne(request,'animal',{sortFlag:request.payload.sortFlag});
    if (sortFlagPlant) {
        reply({"message":"解锁顺序请不要重复！","statusCode":102,"status":false});
        return ;
    }
    if (request.payload.sortFlag <= 0) {
        reply({"message":"解锁顺序请输入大于0的整数！","statusCode":102,"status":false});
        return ;
    }
    
    if (request.payload.sortFlag % 1 != 0 ) {
        reply({"message":"请输入整数！","statusCode":102,"status":false});
        return ;
    }
    if (request.payload.sortFlag > 1) {
        var preSortFlag = request.payload.sortFlag - 1;
        var sortFlagPlant = await dao.findOne(request,'animal',{sortFlag:preSortFlag});
        if (!sortFlagPlant) {
            reply({"message":"请保证解锁顺序连续！","statusCode":102,"status":false});
            return ;
        }
    }

    if (plant.unlockTime <= 0 ) {
        plant.free = 1;
    } else {
        plant.free = 0;
        if (plant.everyPrice <= 0) {
            reply({"message":"请填写正确的解锁价格！","statusCode":102,"status":false});
            return ;
        }
    }

    var animationPlant = await dao.findOne(request,'animal',{id:plant.animationId});
    if (!animationPlant) {
        reply({"message":"无此动效！","statusCode":102,"status":false});
        return ;
    }
    
    var plants = await dao.find(request,'animal',{},{},{id:-1});
    var lastPlant = plants[0];
    plant.id = Number(Number(lastPlant.id) + 1);
    plant.createTime = new Date().getTime();
    // plant.sortFlag = lastPlant.id + 1;
    plant.qualityName = tag.name;
    plant.animationName = animationPlant.animationName;
    plant.animationId = animationPlant.animationId;
    await dao.save(request,'animal',plant);
    await dao.updateOne(request,'animalQuality',{id:request.payload.qualityId},{hasSeed:1});
    reply({"message":"添加成功","statusCode":101,"status":true,"resource":plant});
}

exports.delPlant = async function(request,reply) { 
    var prop = await dao.findById(request,'plant',request.params.id);
    if (!prop) {
        reply({"message":"植物不存在！","statusCode":102,"status":false});
        return;
    }
    await dao.del(request,'plant',{_id:request.params.id + ""});
    var plants = await dao.find(request,'plant',{qualityId:prop.qualityId});
    if (plants.length <= 0) {
        await dao.updateOne(request,'plantQuality',{id:prop.qualityId},{hasSeed:0});
    }

    reply({"message":"删除成功！","statusCode":101,"status":true});

}

exports.delAnimal = async function(request,reply) { 
    var prop = await dao.findById(request,'animal',request.params.id);
    if (!prop) {
        reply({"message":"动物不存在！","statusCode":102,"status":false});
        return;
    }
    await dao.del(request,'animal',{_id:request.params.id + ""});
    var plants = await dao.find(request,'animal',{qualityId:prop.qualityId});
    if (plants.length <= 0) {
        await dao.updateOne(request,'animalQuality',{id:prop.qualityId},{hasSeed:0});
    }

    reply({"message":"删除成功！","statusCode":101,"status":true});

}

exports.drops = async function(request,reply) { 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var withdrawalList = await dao.find(request,'dropGroups',where,{},{createTime:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'plant',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum});
}
exports.dropDetail= async function(request,reply) { 
    var plant = await dao.findById(request,'dropGroups',request.params.id);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":plant});
}
exports.putDrop = async function(request,reply) { 
    var plant = await dao.findById(request,'dropGroups',request.params.id);
    if (plant == null) {
        reply({"message":"无此记录","statusCode":102,"status":false});
        return ;
    }
    await dao.updateOne(request,'dropGroups',{_id:request.params.id},request.payload);
    reply({"message":"更新成功！","statusCode":101,"status":true,"resource":plant});
}
exports.addDrop = async function(request,reply) { 
    var plant = request.payload;
    // var tag = await dao.findOne(request,'',);
    var prop = await dao.findOne(request,'prop',{id:request.payload.propId});
    if (prop == null) {
        reply({"message":"无此道具！","statusCode":102,"status":false});
        return ;
    }
    plant.name = prop.name;
    await dao.save(request,'dropGroups',plant);
    reply({"message":"添加成功","statusCode":101,"status":true,"resource":plant});
}
// 品质等级
exports.tags = async function(request,reply) {  
    var tags = await dao.find(request,'plantQuality',{},{},{id:1});
     reply({"message":"查询成功","statusCode":107,"status":true,"resource":tags});
}

exports.grows = async function(request,reply) { 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var withdrawalList = await dao.find(request,'settingUserGrow',where,{},{createTime:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'settingUserGrow',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum});
}
exports.growDetail= async function(request,reply) { 
    var plant = await dao.findById(request,'settingUserGrow',request.params.id);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":plant});
}
exports.putGrow = async function(request,reply) { 
    var plant = await dao.findById(request,'settingUserGrow',request.params.id);
    if (plant == null) {
        reply({"message":"无此记录！","statusCode":102,"status":true});
        return ;
    }
    await dao.updateOne(request,'settingUserGrow',{_id:request.params.id},request.payload);
    reply({"message":"更新成功","statusCode":101,"status":true,"resource":plant});
}
exports.addGrow = async function(request,reply) { 
    var plant = request.payload;
    var classGrow = await dao.findOne(request,'settingUserGrow',{class:request.payload.class});
    if (classGrow) {
        reply({"message":"该等级成长参数已配置过！","statusCode":102,"status":false});
        return ;
    }
    var plants = await dao.find(request,'settingUserGrow',{},{},{id:-1});
    var lastPlant = plants[0];
    plant.id = Number(Number(lastPlant.id) + 1);
    // var tag = await dao.findOne(request,'',);
    await dao.save(request,'settingUserGrow',plant);
    reply({"message":"添加成功","statusCode":107,"status":true,"resource":plant});
}

exports.delGrow = async function(request,reply) { 
    var prop = await dao.findById(request,'settingUserGrow',request.params.id);
    if (!prop) {
        reply({"message":"数据不存在！","statusCode":102,"status":false});
        return;
    }
    await dao.del(request,'settingUserGrow',{_id:request.params.id + ""});
    reply({"message":"删除成功！","statusCode":101,"status":true});

}




exports.farmUlkSettings = async function(request,reply) { 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var withdrawalList = await dao.find(request,'settingUserGrow',where,{},{createTime:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'plant',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum});
}


exports.sendOrders = async function(request,reply) { 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var withdrawalList = await dao.find(request,'sendOrder',where,{},{createTime:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'sendOrder',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum});
}

exports.props = async function(request,reply) { 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var withdrawalList = await dao.find(request,'prop',where,{},{createTime:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'prop',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum});
}

exports.propDetail= async function(request,reply) { 
    var plant = await dao.findById(request,'prop',request.params.id);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":plant});
}
exports.putProp = async function(request,reply) { 
    var plant = await dao.findById(request,'prop',request.params.id);
    if (plant == null) {
        reply({"message":"无此记录","statusCode":102,"status":false});
        return ;
    }
    await dao.updateOne(request,'prop',{_id:request.params.id},request.payload);
    // payload
    // name:Joi.string().description('道具名称'),
    // img:Joi.string().description('道具ID'),
    // use:Joi.string().description("用途"),
    // des:Joi.string().description("描述"),
    // soldPrice:Joi.number().description("出售价格")
    // 道具到仓库

    await dao.updateAll(request,'warahouse',{propId:plant.id},request.payload);
    // 更新商品
    request.payload.note = request.payload.des;
    await dao.updateOne(request,'exgoods',{propId:plant.id},request.payload);
    reply({"message":"更新成功！","statusCode":101,"status":true,"resource":plant});
}
exports.addProp = async function(request,reply) { 
    var plant = request.payload;
    var plants = await dao.find(request,'prop',{},{},{id:-1});
    var lastPlant = plants[0];
    // console.log('plants',plants);
    // console.log('lastPlant',lastPlant);
    plant.id = Number(Number(lastPlant.id) + 1);
    plant.func_id = 1004;
    plant.type = 1;
    plant.sendStrCount = 0;
    await dao.save(request,'prop',plant);
    reply({"message":"添加成功","statusCode":101,"status":true,"resource":plant});
}

exports.deleteProp = async function(request,reply) { 
    var prop = await dao.findById(request,'prop',request.params.id);
    if (!prop) {
        reply({"message":"道具不存在！","statusCode":102,"status":false});
        return;
    }
    await dao.del(request,'prop',{_id:request.params.id + ""});
    reply({"message":"删除成功！","statusCode":101,"status":true});

}

exports.deleteDrop = async function(request,reply) { 
    var prop = await dao.findById(request,'dropGroups',request.params.id);
    if (!prop) {
        reply({"message":"数据不存在！","statusCode":102,"status":false});
        return;
    }
    await dao.del(request,'dropGroups',{_id:request.params.id + ""});
    console.log('req params',request.params);
    reply({"message":"删除成功！","statusCode":101,"status":true});

}

exports.goodsList = async function(request,reply) { 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var withdrawalList = await dao.find(request,'exgoods',where,{},{createTime:-1},request.params.size,request.params.page);
    
    var sum = await dao.findCount(request,'exgoods',where);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList,"sum":sum});
}
exports.goodsDetail= async function(request,reply) { 
    var plant = await dao.findById(request,'exgoods',request.params.id);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":plant});
}
exports.putGoods = async function(request,reply) { 
    var plant = await dao.findById(request,'exgoods',request.params.id);
    if (plant == null) {
        reply({"message":"未找到商品！","statusCode":102,"status":false});
        return ;
    }
    await dao.updateOne(request,'exgoods',{_id:request.params.id},request.payload);
    // var waraApply = {};
    // waraApply.time = request.payload.time;
    // waraApply
    request.payload.des = request.payload.note;
    await dao.updateAll(request,'warahouse',{propId:plant.propId},request.payload);
    var propApply = {};
    propApply.des = request.payload.note;
    propApply.name = request.payload.name;
    propApply.sendStrCount = request.payload.sendStrCount;
    propApply.soldPrice = request.payload.soldPrice;
    propApply.item_id = request.payload.item_id;
    propApply.use = request.payload.use;
    propApply.des = request.payload.note;
    propApply.img = request.payload.img;
    await dao.updateOne(request,'prop',{id:plant.propId},propApply);
    reply({"message":"更新成功","statusCode":102,"status":true,"resource":plant});
}
exports.addGoods = async function(request,reply) { 
    var plant = request.payload;
    // var tag = await dao.findOne(request,'',);
    var plants = await dao.find(request,'exgoods',{},{},{id:-1});
    var lastPlant = plants[0];
    plant.id = Number(Number(lastPlant.id) + 1);

    var props = await dao.find(request,'prop',{},{},{id:-1});
    console.log('props',props);
    var lastProp = props[0];
    console.log('lastProp',lastProp);
    plant.propId = Number(Number(lastProp.id) + 1);

    await dao.save(request,'exgoods',plant);
    // plant.sortFlag = lastPlant.id + 1;
 
    var prop = {};
    prop.id = Number(Number(lastProp.id) + 1);
    prop.type = 2;
    prop.name = plant.name;
    prop.sendStrCount = plant.sendStrCount;
    prop.soldPrice = plant.soldPrice;
    prop.item_id = plant.item_id;
    prop.use = plant.use;
    prop.des = plant.note;
    prop.img = plant.img;
    prop.func_id = 1003;
    await dao.save(request,'prop',prop);
    reply({"message":"添加成功","statusCode":107,"status":true,"resource":plant});
}

exports.deleteGoods = async function(request,reply) { 
    var prop = await dao.findById(request,'exgoods',request.params.id);
    if (!prop) {
        reply({"message":"商品不存在！","statusCode":102,"status":false});
        return;
    }
    // var produce = await dao.find(request,'produce',{goods_id:request.params.id});
    await dao.del(request,'exgoods',{_id:request.params.id + ""});
    await dao.delSum(request,'produce',{goods_id:request.params.id});
    console.log('req params',request.params);
    reply({"message":"删除成功！","statusCode":101,"status":true});

}
exports.landUlcS = async function(request,reply) { 
   
    var withdrawalList = await dao.find(request,'landUlcCdts',{},{},{landCode:1});
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawalList});
}
exports.ulcDetail = async function(request,reply) { 
    var plant = await dao.findById(request,'landUlcCdts',request.params.id);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":plant});
}
exports.putUlc = async function(request,reply) { 
    var plant = await dao.findById(request,'landUlcCdts',request.params.id);
    if (plant == null) {
        reply({"message":"未找到记录","statusCode":102,"status":false});
        return ;
    }
    await dao.updateOne(request,'landUlcCdts',{_id:request.params.id},request.payload);
    reply({"message":"更新成功！","statusCode":101,"status":true,"resource":plant});
}


exports.addNotes = async function(request,reply){ 
    var note = {};
    console.log('res addNotes');
    note.title = request.payload.title;
    note.content = request.payload.content;
    note.createTime = new Date().getTime();
    var saveRes = await dao.save(request,'note',note);
    reply({"message":"添加成功","statusCode":101,"status":true});

}

exports.delNote = async function(request,reply){ 
    var delRes = await dao.del(request,'note',{_id:request.params.id});
    reply({"message":"删除成功","statusCode":101,"status":true});
}

exports.putNote = async function(request,reply){ 
    var findRes = await dao.findById(request,'note',request.params.id);
    if (findRes == null) {
          reply({"message":"无此记录","statusCode":102,"status":true});
          return;
    }

    var updateRes = await dao.updateOne(request,'notes',{_id:request.params.id},request.payload.note);
    reply({"message":"更新成功","statusCode":101,"status":true});
}


// 管理员登录
exports.Login = async function(request,reply){
    var admin = request.auth.credentials;
    delete admin.password;
    var plants = await dao.find(request,'plant',{});
    if (plants.length > 0) {
        for (var index in plants) {
            var plant = plants[index];
            if (!plant.animationId) {
                await dao.updateOne(request,'plant',{_id:plant._id + ""},{animationId:plant.id,animationName:plant.name});
            }
        }
    }

    var animals = await dao.find(request,'animal',{});
    if (animals.length > 0) {
        for (var index in animals) {
            var animal = animals[index];
            if (!animal.animationId) {
                await dao.updateOne(request,'animal',{_id:animal._id + ""},{animationId:animal.id,animationName:animal.name});
            }
        }
    }
    var lands = await dao.find(request,'land',{status:{$gt:1}});
    
    reply({"message":"用户登陆成功","statusCode":107,"status":true,"resource":request.auth.credentials});
}

//添加管理员
exports.addAdmin = async function(request,reply){

    var admin = request.payload;
    // admin.roleName = "管理员";
    admin.createTime = new Date().getTime();
    console.log('payload',request.payload);
     console.log('payload roleId',request.payload.roleId);
     if (request.payload.roleId) {
        var role = await dao.findById(request,'role',request.payload.roleId);
        console.log('payload');
        if (role == null) {
             reply({"message":"权限信息不存在","statusCode":102,"status":false});
             return;
        }
        admin.scope = role.scope;
        admin.roleLevel = role.level;
        admin.roleName = role.name;
     }
    admin.scope = ["ADMIN"];
    admin.roleName = "超级管理员";
    admin.password = CryptoJS.AES.encrypt(admin.password,"AiMaGoo2016!@.")+"";
   
    var result = await dao.save(request,"admin",admin);
    if(result==null){
        reply({"message":"添加管理员失败","statusCode":102,"status":false});
    }else{
        reply({"message":"添加管理员成功","statusCode":101,"status":true,"resource":result.ops[0]});
    }
}

//获取管理员list
exports.getAdminList = async function(request,reply){

    //列表
    var data = await dao.find(request,"admin",{"state":1},{"password":0},{createTime:-1});

    //总数
    var sum = await dao.findCount(request,"admin",{"state":1});

    if(data == null){
        reply({"message":"查找管理员列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找管理员列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}


//更新管理员
exports.updateAdmin = async function(request,reply){
    var admin = request.payload;
    console.log(admin);
    if(admin.password){
        admin.password = CryptoJS.AES.encrypt(admin.password,"AiMaGoo2016!@.")+"";
    }
    console.log(admin);
    if (request.payload.roleId) {
        var role = await dao.findById(request,'role',request.payload.roleId);
        if (role == null) {
             reply({"message":"权限信息不存在","statusCode":102,"status":false});
        }
        admin.scope = role.scope;
        admin.roleLevel = role.level;
    }
    console.log(admin);
    var result = await dao.updateOne(request,"admin",{"_id":request.params.id},admin);

    if(result==null){
        reply({"message":"更新管理员失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新管理员成功","statusCode":105,"status":true});
    }
}

//删除管理员
exports.delAdmin = async function(request,reply){

    var admin = await dao.findById(request,'admin',request.params.id);
    if (admin.top == 1) {
         reply({"message":"删除管理员失败,最高级别管理员无法被删除！","statusCode":104,"status":false});
         return;
    }
    var result = await dao.del(request,"admin",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除管理员失败","statusCode":104,"status":false});
    }else{
        reply({"message":"删除管理员成功","statusCode":103,"status":true});
    }
}

// 财务管理
// 购买记录
exports.buyRecord = async function(request,reply){ 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var sum = await dao.findCount(request,"seedOrder",where);
    var buySeedsList = await dao.find(request,'seedOrder',where,{},{},request.params.size,request.params.page);
    // if (buySeedsList.length <= 0) {
    //     reply({"message":"暂无数据","statusCode":108,"status":t});
    //     return;
    // }
    // var donateSum = await dao.findSum(request,'welfare',{$match:{"info.createTime":{$ne:null}}},{$group:{_id:null,sum:{$sum:"$progress.count"}}});
    var groupSum = await dao.findSum(request,'seedOrder',{$match:where},{$group:{_id:null,sum:{$sum:"$gold"}}});
    var buyRecords = {};
    var total = 0;
    if (groupSum.length >0) {
         total = parseFloat(groupSum[0].sum).toFixed(2);
    }
    buyRecords.group_sum = total;
    buyRecords.list = buySeedsList;
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":buyRecords,"sum":sum});

}

// // 购买
// exports.buyRecord = async function(request,reply){  
//     var where = {};
//     if (request.payload) {
//         where = request.payload;
//     }
//     var sum = await dao.findCount(request,"withDrawlList",where);
//     var withDrawlList = await dao.find(request,'withDrawlList',where,{},{},request.params.size,request.params.page);
//     if (withDrawlList.length <= 0) {
//         reply({"message":"暂无数据","statusCode":108,"status":false});
//         return;
//     }
//     var groupSum = await dao.findSum(request,'seedOrder',{$match:where},{$group:{_id:null,sum:{$sum:"$amount"}}});
//     var buyRecords = {};
//     buyRecords.group_sum = groupSum[0].sum;
//     buyRecords.list = withDrawlList;
//     reply({"message":"查询成功","statusCode":107,"status":true,"resource":buyRecords,"sum":sum});
// }

// 收益记录
exports.incomRecord = async function(request,reply){ 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var sum = await dao.findCount(request,"harvest",where);
    var withDrawlList = await dao.find(request,'harvest',where,{},{},request.params.size,request.params.page);
    // if (withDrawlList.length <= 0) {
    //     reply({"message":"暂无数据","statusCode":108,"status":true});
    //     return;
    // }
    var groupSum = await dao.findSum(request,'harvest',{$match:where},{$group:{_id:null,sum:{$sum:"$income"}}});
    var buyRecords = {};
    var total = 0;
    if (groupSum.length >0) {
         total = parseFloat(groupSum[0].sum).toFixed(2);
    }
    buyRecords.group_sum = total;
    // buyRecords.group_sum = groupSum[0].sum;
    buyRecords.list = withDrawlList;
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":buyRecords,"sum":sum}); 
}
// 充值记录
exports.rechargeRecord = async function(request,reply){ 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var sum = await dao.findCount(request,"vipRecord",where);
    var withDrawlList = await dao.find(request,'vipRecord',where,{},{},request.params.size,request.params.page);
    // if (withDrawlList.length <= 0) {
    //     reply({"message":"暂无数据","statusCode":108,"status":true});
    //     return;
    // }
    var groupSum = await dao.findSum(request,'vipRecord',{$match:where},{$group:{_id:null,sum:{$sum:"$gold"}}});
    var buyRecords = {};
    var total = 0;
    if (groupSum.length >0) {
         total = parseFloat(groupSum[0].sum).toFixed(2);
    }
    buyRecords.group_sum = total;
    // buyRecords.group_sum = groupSum[0].sum;
    buyRecords.list = withDrawlList;
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":buyRecords,"sum":sum}); 
}

// 消费记录
exports.consumeRecord = async function(request,reply){ 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
    var sum = await dao.findCount(request,"consume",where);
    var withDrawlList = await dao.find(request,'consume',where,{},{createTime:-1},request.params.size,request.params.page);
    // if (withDrawlList.length <= 0) {
    //     reply({"message":"暂无数据","statusCode":108,"status":true});
    //     return;
    // }
    var groupSum = await dao.findSum(request,'consume',{$match:where},{$group:{_id:null,sum:{$sum:"$gold"}}});
    var buyRecords = {};
    var total = 0;
    if (groupSum.length >0) {
         total = parseFloat(groupSum[0].sum).toFixed(2);
    }
    buyRecords.group_sum = total;
    // buyRecords.group_sum = groupSum[0].sum;
    buyRecords.list = withDrawlList;
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":buyRecords,"sum":sum}); 
}

//道具列表
exports.propList = async function(request,reply){ 
    var props = await dao.find(request,'prop',{});
    var sum = props.length;
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":props,"sum":sum}); 

}
//道具详情
exports.propDetail = async function(request,reply){ 
    var prop = await dao.findById(request,'prop',request.params.id);
    // var sum = props.length;
    if (prop == null) {
        reply({"message":"道具不存在","statusCode":108,"status":false}); 
        return;
    }
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":prop}); 

}


exports.noteList = async function(request,reply) { 
    var where = {};
    if (request.payload.where) {
        where = request.payload.where;
    }
   var noteList = await dao.find(request,'note',where,{},{createTime:-1},request.params.size,request.params.page);
    var sum = await dao.findCount(request,"note",where);
    // for (var index in userList) {
    //     var user = userList[index];
    //     userService.updateOutStatus(request,reply,user.username);
    // }
    // userList = await dao.find(request,'user',{},{},{note_time:-1},request.params.size,request.params.page);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":noteList,"sum":sum});
}

exports.noteDetail = async function(request,reply) { 
    var note = await dao.findById(request,'note',request.params.id);
    if (note == null) {
        reply({"message":"无此公告","statusCode":108,"status":false});
        return;
    }
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":note})
}


// var number = 0;
exports.bianli2 = async function(request,reply){
    var list = await dao.find(request,"user",{});
    //console.log(list);
    for(let i =0;i<list.length;i++){
        var number = 0;
        var data = await dedai2(list[i],request,number,0,0);
        var user = list[i];
        console.log('user:'+ user.username + ",+team_num:" + data.number + "team_recharge_sum"+ data.rechargeSum + "team_withdraw_sum" + data.withdrawSum);
        await dao.updateOne(request,"user",{_id:list[i]._id+""},{teamNumber:data.number,team_recharge_sum:data.rechargeSum,team_withdraw_sum:data.withdrawSum});
    };
    reply({"message":"成功","statusCode":103,"status":true});
}

async function dedai2(parent,request,number,rechargeSum,withdrawSum){
    const userList = await dao.find(request,"user",{parentUsername:parent.username});
    for(let i =0;i<userList.length;i++){
        number = number+1;
        var user = userList[i];
        rechargeSum += user.recharge_sum;
        withdrawSum += user.withdraw_sum;
       
        await dedai2(userList[i],request);
    } 
    return {number:number,rechargeSum:rechargeSum,withdrawSum:withdrawSum};
}

var number = 0;
exports.bianli3 = async function(request,reply){
    var list = await dao.find(request,"user",{});
    //console.log(list);
    for(let i =0;i<list.length;i++){
        number = 0;
        await dedai2(list[i],request);
        await dao.updateOne(request,"user",{_id:list[i]._id+""},{teamNumber:number});
    };
    reply({"message":"成功","statusCode":103,"status":true});
}

// 仪表盘
exports.dashBoard = async function(request,reply){ 

    var currentTimeStamp = new Date().getTime();
    var currentDateTime = new Date(currentTimeStamp);
    var currentFormatTimeString = format(currentDateTime);
    var today23clockFormatString = currentFormatTimeString.split(" ")[0] + " 23:59:59";
    var today24clockTimeStamp = Date.parse(new Date(today23clockFormatString)) + 1000;
    var today00ClockStamp = today24clockTimeStamp - 24 * 60 * 60  * 1000;
    var today00ClockDateString = new Date(today00ClockStamp);
    var today00ClockFomatString = format(today00ClockDateString); 

    var newRecharges = await dao.findCount(request,'recharge',{complete_status:0});
    // var newWithDraw = await dao.findCount(request,"withdraw",{complete_status:0});
    var rechargeWhere = {complete_status:1,createTime:{$gt:today00ClockStamp,$lt:today24clockTimeStamp}};
    var rechargeGroupSum = await dao.findSum(request,'recharge',{$match:rechargeWhere},{$group:{_id:null,sum:{$sum:"$gold"}}});
    // var buyRecords = {};
    var rechargeTotal = 0;
    if (rechargeGroupSum.length >0) {
         rechargeTotal = parseFloat(parseFloat(groupSum[0].sum).toFixed(2));
    }

    // var withdrawWhere = {complete_status:1,createTime:{$gt:today00ClockStamp,$lt:today24clockTimeStamp}};
    // var withdrawGroupSum = await dao.findSum(request,'recharge',{$match:rechargeWhere},{$group:{_id:null,sum:{$sum:"$final_gold"}}});
    // // var buyRecords = {};
    // var withdrawTotal = 0;
    // if (withdrawGroupSum.length >0) {
    //      withdrawTotal = parseFloat(parseFloat(groupSum[0].sum).toFixed(2));
    // }

    var goldSum = await dao.findSum(request,'user',{$match:{}},{$group:{_id:null,sum:{$sum:"$gold"}}});
    // var buyRecords = {};
    var withdrawTotal = 0;
    var gold = 0;
    if (goldSum.length >0) {
         gold = parseFloat(parseFloat(goldSum[0].sum).toFixed(2));
    }

    var pltSum = await dao.findSum(request,'user',{$match:{}},{$group:{_id:null,sum:{$sum:"$plt_sessence"}}});
    var plt = 0;
    if (pltSum.length >0) {
         plt = parseFloat(parseFloat(pltSum[0].sum).toFixed(2));
    }
    

    var dimondSum = await dao.findSum(request,'user',{$match:{}},{$group:{_id:null,sum:{$sum:"$dimond"}}});
    var dimond = 0;
    if (dimondSum.length >0) {
         dimond = parseFloat(parseFloat(dimondSum[0].sum).toFixed(2));
    }
  

    // final_gold
    var dash = {};
    dash.todayRechargeSum = 239;   // 今日充值
    dash.weekAddUser = await weekAddUser(request);  
    dash.userCount = await dao.findCount(request,'user',{});  // 用户数
    dash.goldSum = gold;     // 金币总数
    dash.pltSum = plt;  // 精华总数
    dash.dimondSum = dimond;  // 钻石总数
    console.log('---- dash',dash);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":dash}); 
}

//近七日新增用户数量查询
async function weekAddUser(request){
    //查询倒叙
    var users = await dao.find(request,"userRecord",{},{},{dateTime:-1},11,1);
    console.log(users);
    return users;
}
async function dedai3(parent,request){
    const userList = await dao.find(request,"user",{parentUsername:parent.username});
    for(let i =0;i<userList.length;i++){
        number = number+1;
        await dedai2(userList[i],request);
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