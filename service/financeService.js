const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");


// 充值
exports.recharge = async function(request,reply){
    var user = request.auth.credentials;
    
    // var rechargeUser = await dao.findOne(request,'user',{username:request.payload.username});
    // if ()
    // if (rechargeUser == null) {
    //     // if 
    //      reply({
    //             "message":"要充值的账号不存在",
    //             "statusCode":102,
    //             "status":false
    //         });

    //         return;
    // }


    let outTradeId =  Date.now().toString();   
    var gold = parseFloat(request.payload.gold.toFixed(2));
    if (gold <= 0) {
         reply({
                "message":"输入金额不合法",
                "statusCode":102,
                "status":false
            });
            return;
    }

    var rechargeBill = {};
    rechargeBill.bill_no = outTradeId;
    rechargeBill.createTime = new Date().getTime();
    rechargeBill.complete_status = 0;
    rechargeBill.gold = gold;
    rechargeBill.wallet_type = request.payload.wallet_type;
    rechargeBill.username = user.username;
    rechargeBill.nickname = user.nickname;
    rechargeBill.user_id = user._id;
    rechargeBill.recharger = user.username;
    rechargeBill.acount = request.payload.acount;
    rechargeBill.trade_no = request.payload.trade_no;
    var saveRes  = await dao.save(request,'recharge',rechargeBill);

    reply({"message":"充值成功","statusCode":101,"status":true});
}
// 充值记录
exports.rechargeList = async function(request,reply){
    var user = request.auth.credentials;
    var sum = await dao.find(request,'recharge',{username:user.username});
    var rechargeList = await dao.find(request,'recharge',{username:user.username},{},{createTime:-1},request.params.size,request.params.page);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":rechargeList,sum:sum});
}
// 提现
exports.withdraw = async function(request,reply){
    var user = request.auth.credentials;
    var systemSet = await dao.findOne(request,'systemSet',{});
    var gold = parseFloat(request.payload.gold.toFixed(2));
    var fee = gold * systemSet.withdraw_ratio;
    fee = parseFloat(fee.toFixed(2));
    let outTradeId =  Date.now().toString();
    if (gold <= 0) {
        reply({
                "message":"输入金额不合法",
                "statusCode":102,
                "status":false
            });
        return;
    }
    if (gold + fee > user.gold) {
        reply({
                "message":"您没有这么多钱",
                "statusCode":102,
                "status":false
            });
        return;
    }

    
    var serverPwd = user.pay_password;
    var decrptPwd = CryptoJS.AES.decrypt(serverPwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);;
    if (decrptPwd != request.payload.pay_password) {
        reply({
                "message":"支付密码错误",
                "statusCode":102,
                "status":false
        });

        return ;
    }

    var withDrawlBill = {};
    withDrawlBill.bill_no = outTradeId;
    withDrawlBill.createTime = new Date().getTime();
    withDrawlBill.complete_status = 0;
    withDrawlBill.gold = gold;
    withDrawlBill.wallet_type = request.payload.wallet_type;
    withDrawlBill.username = user.username;
    withDrawlBill.nickname = user.nickname;
    withDrawlBill.user_id = user._id;
    withDrawlBill.trade_no = num() + "";
    withDrawlBill.withdraw_ratio = systemSet.withdraw_ratio;
    withDrawlBill.fee = fee;
    withDrawlBill.final_gold = withDrawlBill.gold - withDrawlBill.fee;
    if (request.payload.wallet_type == 1) {
        withDrawlBill.ali_number = request.payload.number;
    } else if (request.payload.wallet_type == 2) {
        withDrawlBill.weixin = request.payload.number;
    } else {
        withDrawlBill.bank = request.payload.bank;
        withDrawlBill.bank_card = request.payload.number;
        withDrawlBill.bank_username = request.payload.bank_username;
    }
    var totalGold = gold + fee;
    var goldIncRes = await dao.updateIncOne(request,'user',{mobile:user.mobile},{"gold":-totalGold});
    var saveRes  = await dao.save(request,'withdraw',withDrawlBill);
    reply({"message":"提交成功","statusCode":101,"status":true});
}
// 提现记录
exports.withdrawList = async function(request,reply){
    var user = request.auth.credentials;
    var withdrawList = await dao.find(request,'withdraw',{username:user.username},{},{createTime:-1},request.params.size,request.params.page);
    var sum = await dao.findCount(request,'withdraw',{username:user.username});
    
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":withdrawList,sum:sum});
}

// 转账
exports.transfer = async function(request,reply){
    var user = request.auth.credentials;
    var friend = await dao.findOne(request,'user',{username:request.params.username});
    if (friend == null) {
        reply({"message":"用户不存在","statusCode":102,"status":false});
        return;
    }
    if (user.username == friend.username) {
        reply({"message":"不支持转账给自己","statusCode":102,"status":false});
        return;
    }
    var serverPwd = user.pay_password;
    var decrptPwd = CryptoJS.AES.decrypt(serverPwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);;
    if (decrptPwd != request.payload.pay_password) {
        reply({
                "message":"支付密码错误",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    // Number()


    
    
    var systemSet = await dao.findOne(request,'systemSet',{});
    var gold = parseFloat(request.payload.gold.toFixed(2));
    var fee = gold * systemSet.transfer_fee_ratio;
    var totalGold = gold + fee;
    fee = parseFloat(fee.toFixed(2));
    // console.log('fee is',fee);
    // console.log('gold is',gold);
    // console.log('totalGold is',totalGold);
    // console.log('systemSet.withdraw_ratio is',systemSet.withdraw_ratio);
    if (gold <= 0) {
        reply({
                "message":"输入金额不合法",
                "statusCode":102,
                "status":false
            });
        return;
    }

    if (gold + fee > user.gold) {
        reply({
                "message":"您没有这么多钱",
                "statusCode":102,
                "status":false
            });
        return;
    }


    var landTotalClass = await dao.findSum(request,'land',{$match:{user_id:user._id,dayString:dayString}},{$group:{_id:null,sum:{$sum:"$class_id"}}});
    var classTotal = 0; 
    if (landTotalClass.length > 0) {
        classTotal = parseFloat(parseFloat(landTotalClass[0].sum).toFixed(2));
    }
    // var dayQuota = classTotal * 100;
    var dayQuota = 0;
    console.log('classtotal is',classTotal);
    if (0 < classTotal < 15) {
        dayQuota = 500;
    } else if (classTotal >= 15 && classTotal < 30) {
        dayQuota = 1000;
    }else if (classTotal >= 30 && classTotal < 45) {
        dayQuota = 2000;
    } else {
        dayQuota = 5000;
    }
    if (gold > dayQuota) {
        reply({
                "message":"超出每日转账限额",
                "statusCode":102,
                "status":false
            });
        return;
    }

    var hasTranfer = 0;

    const currentTime = new Date().getTime();
    const currentDateTime = new Date(currentTime);
    const dayString = formatDateDay(currentDateTime);

    var findTransferRes = await dao.findOne(request,'dayTransfer',{user_id:user._id,dayString:dayString});
   
    if (findTransferRes) {
        var restQuota = dayQuota - findTransferRes.sum;
        if (gold > restQuota) {
            reply({
                "message":"超出每日转账限额",
                "statusCode":102,
                "status":false
            });
            return;
        }
         
        await dao.updateIncOne(request,'dayTransfer',{_id:findTransferRes._id},{sum:gold});

    } else {
        
        var dayTransfer = {};
        dayTransfer.sum = gold;
        dayTransfer.dayString = dayString;
        dayTransfer.user_id = user._id;
        dayTransfer.username = user.username;
        dayTransfer.createTime = new Date().getTime();
        await dao.save(request,'dayTransfer',dayTransfer);
    }
    let outTradeId =  Date.now().toString();
    var transferBill = {};
    transferBill.bill_no = outTradeId;
    transferBill.createTime = new Date().getTime();
    transferBill.complete_status = 1;
    transferBill.gold = gold;
    // transferBill.wallet_type = request.payload.wallet_type;
    transferBill.username = user.username;
    transferBill.nickname = user.nickname;
    transferBill.user_id = user._id;
    // transferBill.trade_no = num() + "";
    transferBill.transfer_fee_ratio = systemSet.transfer_fee_ratio;
    transferBill.fee = fee;
    transferBill.to_username = friend.username;
    transferBill.to_user_id = friend._id;
    transferBill.to_nickname = friend.nickname;
    var saveRes  = await dao.save(request,'transfer',transferBill);

    var goldIncRes = await dao.updateIncOne(request,'user',{mobile:user.mobile},{"gold":-totalGold});
    var otherGoldRes = await dao.updateIncOne(request,'user',{_id:friend._id},{gold:gold});
    reply({"message":"提交成功","statusCode":101,"status":true});
}

// 转账记录
exports.transferList = async function(request,reply){
    var user = request.auth.credentials;
    var sum = await dao.findCount(request,'transfer',{$or:[{user_id:user._id},{to_user_id:user._id}]});
    var transferList = await dao.find(request,'transfer',{$or:[{user_id:user._id},{to_user_id:user._id}]},{},{createTime:-1},request.params.size,request.params.page);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":transferList,sum:sum});
}
// 转账记录
exports.consumeList = async function(request,reply){
    var user = request.auth.credentials;
    var sum = await dao.findCount(request,'consume',{user_id:user._id});
    var consumeList = await dao.find(request,'consume',{user_id:user._id},{},{createTime:-1},request.params.size,request.params.page);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":consumeList,sum:sum});
}

exports.tradeNo = async function(request,reply){
    var trade_no = num() + "";
    reply({"message":"获取成功","statusCode":107,"status":true,"resource":trade_no});
}

// 抽奖
exports.award = async function(request,reply){
    var user = request.auth.credentials;
    var systemSet = await dao.findOne(request,'systemSet',{});
    if (user.gold < systemSet.bet_wheel_fee) {
        reply({
                "message":"您的余额不足",
                "statusCode":102,
                "status":true
        });

        return ;
    }
    var gamSet = systemSet.wheels;
    var wheels = getValues(gamSet);
    // console.log('wheels is',wheels);
    var number ;
    var select = Choose(wheels);
    var fee = Number(0 - systemSet.bet_wheel_fee);
    var isProp = false;
    var prop;
    var message;
    // var code;
    switch(select){
        case 3:
            // data.status = 0;
            message = "恭喜您获得一个可爱猫";
            number = 0;
            prop = await dao.findOne(request,'seed',{code:1});
            isProp = true;
            prop.count = 1;
            // dao.updateOne(request,"user",{"_id":user._id+""},{gold:user.gold-gold});
            dao.updateIncOne(request,'user',{_id:user._id},{gold:fee});
            break;
        case 4:
            message = "恭喜您获得1个肥皂!";
            number = 0;
            prop = await dao.findOne(request,'prop',{type:3});
            isProp = true;
            prop.count = 1;
            // fee = fee;
            dao.updateIncOne(request,'user',{_id:user._id},{gold:fee});
            break;
        case 5:
            message = "恭喜您获得1个熊猫！";
            number = 0;
            // fee = fee + 10;
            isProp = true;
            prop = await dao.findOne(request,'seed',{code:3});
            prop.count = 1;
            dao.updateIncOne(request,'user',{_id:user._id},{gold:fee});
            // 
            break;
        case 0:
            message = "恭喜您获得1个刷子！";
            number = 0;
            dao.updateIncOne(request,'user',{_id:user._id},{gold:fee});
            isProp = true;
            prop = await dao.findOne(request,'prop',{type:2});
            prop.count = 1;
            break;
        case 1:
            message = "恭喜您获得1个可爱狗！";
            number = 0;
            // fee += 30;
            isProp = true;
            prop = await dao.findOne(request,'seed',{code:3});
            prop.count = 1;
            dao.updateIncOne(request,'user',{_id:user._id},{gold:fee});
            break;
        case 2:
            message = "恭喜您获得1个饲料";
            number = 0;
            dao.updateIncOne(request,'user',{_id:user._id},{gold:fee});
            isProp = true;
            prop = await dao.findOne(request,'prop',{type:1});
            prop.count = 1;
            break;
    }

    if (isProp == true) {
        var findRes = await dao.find(request,"user",{username:user.username,"warahouse._id":prop._id,"warahouse.wara_cata":2});
        var updateRes;
        if (findRes.length > 0) {
            // var addedCount = findRes[0].count + request.payload.count;
            updateRes  = await dao.updateIncOne(request,'user',{username:user.username,"warahouse._id":prop._id},{"warahouse.$.count":prop.count});
        } else {
            updateRes =  await dao.updatePushOne(request,'user',{username:user.username},{'warahouse':prop});
        }
    }
    
   

    var data = {
        userId:user._id+"",
        name:user.username,
        createTime:new Date().getTime(),
        message:message,
        number:number,
        // expend:gold,
        // status:1,
        select:select,
        isProp:isProp,
        prop:prop,
        gold:number,
        fee:Number(0 - fee),
        success:true
    }
    var result = await dao.save(request,"awardRecord",data);
    reply({
                // "message":"抽奖成功",
                "statusCode":101,
                "status":true,
                "message":message,
                "data":select
     });
    return ;

}


//查看用户操作记录
exports.getAwardList = async function(request,reply){
    var user = request.auth.credentials;
    // var db = request.server.plugins['hapi-mongodb'].db;
    // var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    var userId = user._id;;
    // if(where._id){
    //     var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    //     where._id = new ObjectID(where._id);
    // }
     //列表
    var data = await dao.find(request,"awardRecord",{userId:userId + ""},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"awardRecord",{userId:userId + ""});
    if(data == null){
        reply({"message":"查找用户列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找用户列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}




/* 日期格式化 */

var orderFormat = function(date) {

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10) ? '0' + month : month;
        var day = date.getDate();

        var hour = date.getHours();
        var minute = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes();
        //var minute = date.getMinutes();
        var second = (date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds();
        //var second = date.getSeconds();

        return year.toString()  + month.toString()  + day.toString() + hour.toString()  + minute.toString()  + second.toString();
}
 

var formatDateDay = function(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10) ? '0' + month : month;
    var day = date.getDate();

    
    //var second = date.getSeconds();

    return year.toString()  + "-" + month.toString()  + "-" + day.toString();
}

var formatDateMonth = function(date) {

    var year = date.getFullYear();
    console.log('year  to string ',year.toString());
    var month = date.getMonth() + 1;
    month = (month < 10) ? '0' + month : month;
        console.log('month  to string ',month.toString());
    

    
    //var second = date.getSeconds();

    return year.toString()  + "-" + month.toString();
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


/* 随机数 */
//随机数
function num(){
    var mm=Math.random();
    var six ="";
    if(mm>0.1)
    {
        six=Math.round(mm*1000000);
    }else{
        mm += 0.1;
        six = Math.round(mm*1000000);
    }
    return six;
}

function getValues(obj){
 
    let objList =[];
    for(let item in obj){
        // console.log(item);
        // console.log(obj[item]);
        objList.push(obj[item]);
    }
    return objList;
}

/**
 * 概率计算方法
 */
function Choose(probs){  
    var total = 0;  
    //首先计算出概率的总值，用来计算随机范围  
    for(var i=0;i<probs.length;i++){  
        total+=probs[i];  
    }  
    var rd  = Math.random() * total;  
    for(var j=0;j<probs.length;j++)  
        {  
        if(rd<probs[j]){  
            return j;  
        }else{  
            rd-=probs[j];  
        }  
    }  
    return probs.length-1;  
} 