const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");
var urllib = require('urllib');
// const userService = require('../service/userService');

// 种子列表
exports.seeds = async function(request,reply){ 
    var seeds = await dao.find(request,'seed',{});
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":seeds});
}

// 购买种子
exports.buySeed = async function(request,reply){ 
    var user = request.auth.credentials;
    var seed = await dao.findById(request,'seed',request.params.id);
    if (!seed) {
        reply({"message":"无此种子","statusCode":102,"status":false});
        return;
    }
    if (request.payload.count <= 0) {
         reply({"message":"输入的数量不合法","statusCode":102,"status":false});
         return;
    }
    // var serverpay_password = user.pay_password;
    // var decrptpay_password = CryptoJS.AES.decrypt(serverpay_password,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);
    
    // if (decrptpay_password != request.payload.pay_password) {
    //     reply({
    //             "message":"支付密码错误",
    //             "statusCode":102,
    //             "status":false
    //     });

    //     return ;
    // }

    var gold = Number(seed.price * request.payload.count);
    if  (gold > user.gold) {
        reply({
                "message":"您的余额不足",
                "statusCode":102,
                "status":true
        });

        return ;
    }

    var updateIncOneRes = await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:-gold});
    seed.count = request.payload.count;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    var seed_id = new ObjectID(seed._id);
    var findRes = await dao.find(request,"user",{username:user.username,"warahouse._id":seed_id,"warahouse.wara_cata":1});
    var updateRes;
    if (findRes.length > 0) {
        // var addedCount = findRes[0].count + request.payload.count;
        updateRes  = await dao.updateIncOne(request,'user',{username:user.username,"warahouse._id":seed_id},{"warahouse.$.count":seed.count});
    } else {
        updateRes =  await dao.updatePushOne(request,'user',{username:user.username},{'warahouse':seed});
    }
   
    var consume = {};
    consume.user_id = user._id;
    consume.gold = gold;
    consume.username = user.username;
    consume.type = 1;
    consume.consumeType = 1;
    consume.goodsName = seed.seedname;
    consume.count = request.payload.count;
    consume.price = seed.price;
    consume.ad = seed.seedname;
    consume.createTime = new Date().getTime();
    await dao.save(request,'consume',consume);
     reply({
                "message":"购买成功",
                "statusCode":101,
                "status":true
        });
    // var updatePushRes = await 


}

// 购买种子
exports.buyAreca = async function(request,reply){ 
    var user = request.auth.credentials;
    var arecaCount = Number(request.payload.count);
    if(arecaCount <= 0) { 
        reply({
                "message":"出售数量不合法",
                "statusCode":102,
                "status":false
        });

        return ;
    }

    if(String(arecaCount).indexOf(".")>-1) {
        reply({
            "message":"输入数量不合法！",
            "statusCode":102,
            "status":false
        });
        return; 
    }
    await dao.updateIncOne(request,'user',{_id:user._id},{areca:arecaCount});

  
    reply({
        "message":"更新成功",
        "statusCode":101,
        "status":true
        });
   
}


// 道具列表
exports.props = async function(request,reply){
    // var props = await dao.find(request,'prop',{type:{$ne:4}});
    var props = await dao.find(request,'prop',{});
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":props});
}

// 购买道具
exports.buyProp = async function(request,reply){ 
    var user = request.auth.credentials;
    var prop = await dao.findById(request,'prop',request.params.id);
    if (!prop) {
        reply({"message":"无此道具","statusCode":102,"status":false});
        return;
    }
    if (request.payload.count <= 0) {
         reply({"message":"输入的数量不合法","statusCode":102,"status":false});
         return;
    }
    if  (String(request.payload.count).indexOf('.')>-1) {
         reply({"message":"请输入整数","statusCode":102,"status":false});
         return;
    }

    // var serverpay_password = user.pay_password;
    // var decrptpay_password = CryptoJS.AES.decrypt(serverpay_password,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);;
    // if (decrptpay_password != request.payload.pay_password) {
    //     reply({
    //             "message":"支付密码错误",
    //             "statusCode":102,
    //             "status":false
    //     });

    //     return ;
    // }

    var gold = Number(prop.price * request.payload.count);
    if  (gold > user.gold) {
        reply({
                "message":"您的余额不足",
                "statusCode":102,
                "status":true
        });

        return ;
    }

    var updateIncOneRes = await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:-gold});
    prop.count = request.payload.count;
    if (prop.type == 6) {
        // 购买一键收获
        await dao.updateOne(request,'user',{_id:user._id},{oneKeyHarvest:1});
        reply({
                "message":"购买成功",
                "statusCode":101,
                "status":true
        });

        return;
    }

    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    var prop_id = new ObjectID(prop._id);
    var findRes = await dao.find(request,"user",{username:user.username,"warahouse._id":prop_id,"warahouse.wara_cata":2});
    var updateRes;
    if (findRes.length > 0) {
        // var addedCount = findRes[0].count + request.payload.count;
        updateRes  = await dao.updateIncOne(request,'user',{username:user.username,"warahouse._id":prop_id},{"warahouse.$.count":prop.count});
    } else {
        updateRes =  await dao.updatePushOne(request,'user',{username:user.username},{'warahouse':prop});
    }

    var consume = {};
    consume.user_id = user._id;
    consume.gold = gold;
    consume.username = user.username;
    consume.type = 2;
    consume.consumeType = 1;
    consume.goodsName = prop.propname;
    consume.count = request.payload.count;
    consume.price = prop.price;
    consume.ad = prop.ad;
    consume.createTime = new Date().getTime();
    await dao.save(request,'consume',consume);

     reply({
                "message":"购买成功",
                "statusCode":101,
                "status":true
        });
        return;
    // var updatePushRes = await
}

// 宠物列表
exports.dogs = async function(request,reply){
    var items = await dao.find(request,'dog',{});
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":items});
}

// 购买宠物

exports.buyDog = async function(request,reply){ 
    var user = request.auth.credentials;
    var item = await dao.findById(request,'dog',request.params.id);
    if (!item) {
        reply({"message":"无此道具","statusCode":102,"status":false});
        return;
    }
    if (item.code == 3) {
         reply({"message":"无此饲养员","statusCode":102,"status":false});
        return;
    }

    // var serverpay_password = user.pay_password;
    // var decrptpay_password = CryptoJS.AES.decrypt(serverpay_password,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);;
    // if (decrptpay_password != request.payload.pay_password) {
    //     reply({
    //             "message":"支付密码错误",
    //             "statusCode":102,
    //             "status":false
    //     });

    //     return ;
    // }
    var currentTime = new Date().getTime();
    item.last_feed = currentTime;
    var gold = Number(item.price);
    if  (gold > user.gold) {
        reply({
                "message":"您的余额不足",
                "statusCode":102,
                "status":true
        });

        return ;
    }

    var updateIncOneRes = await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:-gold});
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    var item_id = new ObjectID(item._id);
    var findRes = await dao.find(request,"user",{username:user.username,"warahouse._id":item_id,"warahouse.wara_cata":3});

    if (findRes.length > 0 ) {
         reply({
                "message":"您已经有该饲养员了",
                "statusCode":102,
                "status":true
        });

        return ;
    }
    if (user.dog && user.dog._id == request.params.id) {
        reply({
                    "message":"您已经有该饲养员了",
                    "statusCode":102,
                    "status":true
         });

        return ;
    }
    var updateRes =  await dao.updatePushOne(request,'user',{username:user.username},{'warahouse':item});
    

    
    var consume = {};
    consume.user_id = user._id;
    consume.gold = gold;
    consume.username = user.username;
    consume.type = 2;
    consume.consumeType = 1;
    consume.goodsName = item.dogname;
    consume.count = 1;
    consume.price = item.price;
    consume.ad = item.ad;
    consume.createTime = new Date().getTime();
    await dao.save(request,'consume',consume);

     reply({
                "message":"购买成功",
                "statusCode":101,
                "status":true
        });
    // var updatePushRes = await
}

// 房屋列表

exports.houses = async function(request,reply){
    var items = await dao.find(request,'house',{});
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":items});
}
// 


// 购买房屋
exports.buyHouse = async function(request,reply){ 
    var user = request.auth.credentials;
    var item = await dao.findById(request,'house',request.params.id);
    if (!item) {Fbuy
        reply({"message":"无此道具","statusCode":102,"status":false});
        return;
    }

    // var serverpay_password = user.pay_password;
    // var decrptpay_password = CryptoJS.AES.decrypt(serverpay_password,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);;
    // if (decrptpay_password != request.payload.pay_password) {
    //     reply({
    //             "message":"支付密码错误",
    //             "statusCode":102,
    //             "status":false
    //     });

    //     return ;
    // }

    var gold = Number(item.price);
    if  (gold > user.gold) {
        reply({
                "message":"您的余额不足",
                "statusCode":102,
                "status":true
        });

        return ;
    }

    var updateIncOneRes = await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:-gold});
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    var item_id = new ObjectID(item._id);
    var findRes = await dao.find(request,"user",{username:user.username,"warahouse._id":item_id,"warahouse.wara_cata":4});

    if (findRes.length > 0) {
        reply({
                "message":"您已经有该房屋了",
                "statusCode":102,
                "status":true
        });

        return ;
    }
    if (user.house && user.house._id == request.params.id) {
        reply({
                "message":"您已经有该房屋了",
                "statusCode":102,
                "status":true
        });

        return ;
    }
    if (user.dogHouse && user.dogHouse._id == request.params.id) {
        reply({
                "message":"您已经有该房屋了",
                "statusCode":102,
                "status":true
        });

        return ;
    }
    var updateRes =  await dao.updatePushOne(request,'user',{username:user.username},{'warahouse':item});
    
     reply({
                "message":"购买成功",
                "statusCode":101,
                "status":true
        });
    // var updatePushRes = await

    var consume = {};
    consume.user_id = user._id;
    consume.gold = gold;
    consume.username = user.username;
    consume.type = 2;
    consume.consumeType = 1;
    consume.goodsName = item.housename;
    consume.count = 1;
    consume.price = item.price;
    consume.ad = item.ad;
    consume.createTime = new Date().getTime();
    await dao.save(request,'consume',consume);
}

// 购买狗粮
exports.buyDogFood = async function(request,reply){ 
    var user = request.auth.credentials;
    var item = await dao.findOne(request,'dog',{code:3});
    if (!item) {
        reply({"message":"无此种子","statusCode":102,"status":false});
        return;
    }
    if (request.payload.count <= 0) {
         reply({"message":"输入的数量不合法","statusCode":102,"status":false});
         return;
    }

    // var serverpay_password = user.pay_password;
    // var decrptpay_password = CryptoJS.AES.decrypt(serverpay_password,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);

    // if (decrptpay_password != request.payload.pay_password) {
    //     reply({
    //             "message":"支付密码错误",
    //             "statusCode":102,
    //             "status":false
    //     });

    //     return ;
    // }

    var gold = Number(item.price * request.payload.count);
    if  (gold > user.gold) {
        reply({
                "message":"您的余额不足",
                "statusCode":102,
                "status":true
        });

        return ;
    }

    var updateIncOneRes = await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:-gold});
    item.count = request.payload.count;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    var item_id = new ObjectID(item._id);
    var findRes = await dao.find(request,"user",{username:user.username,"warahouse._id":item_id,"warahouse.wara_cata":3});
    var updateRes;
    if (findRes.length > 0) {
        // var addedCount = findRes[0].count + request.payload.count;
        updateRes  = await dao.updateIncOne(request,'user',{username:user.username,"warahouse._id":item_id},{"warahouse.$.count":item.count});
    } else {
        updateRes =  await dao.updatePushOne(request,'user',{username:user.username},{'warahouse':item});
    }
    var consume = {};
    consume.user_id = user._id;
    consume.gold = gold;
    consume.username = user.username;
    consume.type = 2;
    consume.consumeType = 1;
    consume.goodsName = item.propname;
    consume.count = request.payload.count;
    consume.price = item.price;
    consume.ad = item.ad;
    consume.createTime = new Date().getTime();
    await dao.save(request,'consume',consume);
     reply({
                "message":"购买成功",
                "statusCode":101,
                "status":true
        });
    // var updatePushRes = await 

}

//第三方交易接口，购买第三商城槟榔接口
exports.buyBL = async function(request,reply){  
    var data = request.payload;
    var user = request.auth.credentials;
    if (user.integral < data.amount) {
        reply({
                "message":"您没有这么多积分",
                "statusCode":102,
                "status":false
            });
         return;
    }
    data.userId = user.username;
    data.objId = "99";
    data.timestamp = new Date().getTime() + "";
    data.opCode = "10010";
    console.log("befor data is",data);
    data.mac = CryptoJS.MD5(data.timestamp+data.userId+data.amount+data.objId+data.opCode+data.blnum+data.token).toString();
    delete data.token;
    console.log(data);
    urllib.request('http://letter.qzzapp.com/letter/api/reqTransaction.php',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        // content: JSON.stringify({"userId":"1","amount":1,"objId":99,"timestamp":1522465211066,"opCode":10010,"blnum":1,"mac":"cd251267ed429c81aba182cbc36169b6"})
        content: JSON.stringify(data)
    }).then(async function (result) {
    // result: {data: buffer, res: response object}
        console.log(result.data.toString());
        var res = result.data.toString();
        console.log('res',res);
        res = JSON.parse(res);
        // reply('12312312');
        if (res.head.error_code != 0) {
            reply({
                "message":res.head.error_msg,
                "statusCode":102,
                "status":false
            });
            return;
        }
        var order = {};
        order.username = user.username;
        order.user_id = user._id + "";
        order.createTime = new Date().getTime();
        order.amount = parseFloat(data.amount);
        order.blnum = parseInt(data.blnum);
        order.status = 0;
        order.seq = res.body.seq;
        order.from_flag = 99;
        await dao.save(request,'order',order);
        reply({
                "message":"订单已生成",
                "statusCode":101,
                "status":true,
                "data":{seq:res.body.seq}
        });
    }).catch(function (err) {
        console.error(err);
         reply({
                "message":"支付请求失败",
                "statusCode":102,
                "status":false
        });
    });
}

exports.qrBuy = async function(request,reply){   
    var data = request.payload;
    var user = request.auth.credentials;
    var serverpay_password = user.pay_password;
    var decrptpay_password = CryptoJS.AES.decrypt(serverpay_password,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);

    if (decrptpay_password != request.payload.pay_password) {
        reply({
                "message":"支付密码错误",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    var time = new Date().getTime();
    var data = {
        'seq':request.payload.seq + "",
        'timestamp':time+""
    };
    data.mac = CryptoJS.MD5(data.seq+data.timestamp+"kbrqgjpjNhe5DUOYpqDJ").toString();
    console.log('data is',data);
    urllib.request('http://letter.qzzapp.com/letter/api/confirmTransaction.php',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        // content: JSON.stringify({"userId":"1","amount":1,"objId":99,"timestamp":1522465211066,"opCode":10010,"blnum":1,"mac":"cd251267ed429c81aba182cbc36169b6"})
        content: JSON.stringify(data)
    }).then(async function (result) {
    // result: {data: buffer, res: response object}
        console.log(result.data.toString());
        var res = result.data.toString();
        console.log('res',res);
        res = JSON.parse(res);
        // reply('12312312');
        if (res.head.error_code != 0) {
            reply({
                "message":"支付失败，积分扣取失败！",
                "statusCode":102,
                "status":false
            });
            return;
        }
        var order = await dao.findOne(request,'order',{"seq":request.payload.seq});
        if (order == null) {
             reply({
                "message":"支付失败,无此订单",
                "statusCode":102,
                "status":false
            });
            return;
        }
        if (order.status == 0) {
            await dao.updateOne(request,'order',{seq:request.payload.seq},{status:1});
            console.log('order is',order);
            console.log('Number(order.blnum) is',Number(order.blnum));
            console.log('-Number(order.amount) is',-Number(order.amount));
            await dao.updateIncOne(request,'user',{_id:user._id+""},{areca:Number(order.blnum),integral:-Number(order.amount)});
            reply({
                "message":"交易完成！",
                "statusCode":101,
                "status":true
                // "data":{seq:res.body.seq}
             });
        } else {
            reply({
                "message":"订单已完成！",
                "statusCode":102,
                "status":false
                // "data":{seq:res.body.seq}
             });
        }
       
        
       
    }).catch(function (err) {
        console.error(err);
    });

}