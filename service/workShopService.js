const dao = require("../dao/dao");
var settings = require('../settings.js');
const workShopService = require("../service/workShopService");
exports.overView = async function(request,reply) { 
    var user = request.auth.credentials;
    var displayGoods;
    var displayGoodsArr = [];
    var goodsArr;
    var goods = await dao.find(request,'exgoods',{},{},{sortFlag:-1});
     if (goods.length <= 0) {

         reply({
            "message":"无商品!",
            "statusCode":102,
            "status":false
        });
         return;
    }
    // 查找正在加工中的商品
    var produce  = await dao.findOne(request,'produce',{user_id:user._id + "",status:{$ne:3}});
    if (produce){
        await workShopService.updateProduce(request,produce);
        displayGoods = await dao.findById(request,'exgoods',produce.goods_id);
        if (displayGoods) {
            displayGoods.status = produce.status;
            displayGoods.inProduce = 1;
            displayGoods.produceTime = produce.createTime;
        } else {
             await dao.del(request,'produce',{_id:produce._id + ""});
             displayGoods = goods[0];
        }
    } else {
        displayGoods = goods[0];
        displayGoods.status = 0;
        displayGoods.inProduce = 0; 
    }
    console.log('displayGoods',displayGoods);
    if (displayGoods) {
        displayGoodsArr = [displayGoods];
    }
    console.log('displayGoodsArr',displayGoodsArr);
    var bhdGoods = await workShopService.removeGoods(request,goods,displayGoods._id + "");
    console.log('bhdGoods',bhdGoods);
    goodsArr = displayGoodsArr.concat(bhdGoods);
    console.log('goodsArr',goodsArr);
    await workShopService.goodsArrPropFeeAdd(request,goodsArr);
    reply({
        "message":"查询成功!",
        "statusCode":101,
        "status":true,
        "resource":{displayGoods:displayGoods,goodsArr:goodsArr}
    });
}
exports.produceGoods = async function(request,reply) { 
    var user = request.auth.credentials;
    var produce  = await dao.findOne(request,'produce',{user_id:user._id + "",status:1});
    if (produce) {
        reply({
                "message":"一次只能加工一个商品!",
                "statusCode":102,
                "status":false
        });   
        return;
    }
    var time = new Date().getTime();
    var goods = await dao.findById(request,'exgoods',request.params.id);
    if (goods.u_class > user.class) {
        reply({
                "message":"您还未解锁该商品!",
                "statusCode":102,
                "status":false
        });   
        return;
    }
    if (goods.needProp > 0) {
        var prop = await dao.findOne(request,'warahouse',{user_id:user._id + "",propId:goods.needProp,count:{$gte:goods.needCount}});
        if (!prop) {
            reply({
                "message":"您没有足够的合成道具!",
                "statusCode":102,
                "status":false
            });   
            return;
        }
        await dao.updateIncOne(request,'warahouse',{_id:prop._id + ""},{count:-goods.needCount});
    }
    if (user.plt_sessence < goods.plt_sessence) {
        reply({
                "message":"您没有足够的健康能量!",
                "statusCode":102,
                "status":false
            });
        return;
        
    }

    await dao.updateIncOne(request,'user',{_id:user._id + ""},{plt_sessence:-goods.plt_sessence});
   
    var produce = {};
    produce.name = goods.name;
    produce.img = goods.img;
    produce.createTime = time;
    produce.harvestTime = time + goods.time * 1000;
    produce.user_id = user._id + "";
    produce.status = 1; // 1   2 加工完成 3 已收获
    produce.goodsId = goods.id;
    produce.goods_id = goods._id + "";
    produce.propId = goods.propId;
    produce.time = goods.time;
    await dao.save(request,'produce',produce);

    reply({
        "message":"已经开始加工!",
        "statusCode":101,
        "status":true,
        "resource":{produce:produce}
    });
    return;
}

exports.harvestProduce = async function(request,reply) {   
    var user = request.auth.credentials;
    var inProduce  = await dao.findOne(request,'produce',{user_id:user._id + "",status:1});
    if (inProduce) {
         await workShopService.updateProduce(request,inProduce);
    }
    var produce  = await dao.findOne(request,'produce',{user_id:user._id + "",status:2});
    if (!produce) {
        reply({
            "message":"还未加工完成!",
            "statusCode":102,
            "status":false
        });
        return;
    }
    var prop = await dao.findOne(request,'prop',{id:produce.propId});
    if (!prop) {
        prop = {};
        // await dao.updateOne(request,'produce',{_id:produce._id + ""},{status:3});
        prop.name = produce.name;
        prop.img = produce.img;

        await dao.del(request,'produce',{_id:produce._id + ""});
        reply({
            "message":"收获失败，该商品已经下架!",
            "statusCode":102,
            "status":true,
            "resource":prop
        });
        return;
    }
    prop.count = 1;
    var prop_id = prop._id + "";
    var propId = prop.id; 
    var propInHouse = await dao.findOne(request,'warahouse',{prop_id:prop._id + "",user_id:user._id + ""});
    console.log('33333',propInHouse);
    if (propInHouse) {
        await dao.updateIncOne(request,'warahouse',{_id:propInHouse._id + ""},{count:prop.count});
    } else {
        delete prop._id;
        delete prop.id;
        propInHouse = prop;
        propInHouse.prop_id = prop_id;
        propInHouse.propId = propId;
        propInHouse.user_id = user._id + "";
        propInHouse.username = user.username;
        await dao.save(request,'warahouse',propInHouse);
    }
    await dao.updateOne(request,'produce',{_id:produce._id + ""},{status:3});
    prop.name = produce.name;
    prop.img = produce.img;
    reply({
        "message":"收获成功!",
        "statusCode":101,
        "status":true,
        "resource":prop
    });
}
exports.updateProduce = async function(request,produce) {  
    var time = new Date().getTime();
    console.log('111produce',produce);
    if (time >= produce.createTime + produce.time * 1000) {
        produce.status = 2;
        await dao.updateOne(request,'produce',{_id:produce._id  + ""},{status:2});
        console.log('222produce',produce);
    }
}
exports.goodsPropFeeAdd = async function(request,goods) { 
    var prop; 
    if (goods.needProp > 0) {
        prop = await dao.findOne(request,"prop",{id:goods.needProp});
    }
    if (prop) {
        goods.prop = prop;
    }
}
// 所需道具
exports.goodsArrPropFeeAdd = async function(request,goodsArr) { 
   if (goodsArr.length > 0) {
       for (var index in goodsArr) {
           var goods = goodsArr[index];
           await workShopService.goodsPropFeeAdd(request,goods);
       }
   }
}
exports.removeGoods = async function(request,goods,goods_id) {  
    var goodsArr = [];
    if (goods.length > 0) {
        for (var index in goods) {
            var good = goods[index];
            if (good._id + "" != goods_id) {
                good.status = 0;
                good.inProduce = 0;
                goodsArr.push(good);
            }
        }
    }
    return goodsArr;
}

exports.sendToHome = async function(request,reply) {  
    var user = request.auth.credentials;
    var time = new Date().getTime();
    var warahouseProp = await dao.findById(request,'warahouse',request.params.id);
    if (warahouseProp.type != 2) {
        reply({
            "message":"该道具不是商品!",
            "statusCode":102,
            "status":false
        });
        return;
    }
    console.log('');
    if (user.appLevel.levelName != "黄金店主" && user.appLevel.levelName != "销售经理") {
        reply({
            "message":"只有黄金店主和销售经理才能邮寄商品!",
            "statusCode":102,
            "status":false
        });
        return;
    }
    if (warahouseProp.count < warahouseProp.sendStrCount) {
        reply({
            "message":"未到起送数量!",
            "statusCode":102,
            "status":false
        });
        return;
    }
    await dao.updateIncOne(request,'warahouse',{_id:warahouseProp._id + ""},{count:-warahouseProp.count});
    // var goods = await
    var sendBill = {};
    sendBill.createTime = time;
    sendBill.order_statue = "1";
    sendBill.pay_time = Math.round(time / 1000);
    sendBill.uid = user.username;
    sendBill.address = request.payload.address;
    sendBill.out_trade_no = randomChar(3,3);
    sendBill.phone = request.payload.phone;
    sendBill.status = "0";
    sendBill.item_id = warahouseProp.item_id;
    sendBill.pay_channel = "2";
    sendBill.id = await dao.inc(request,'sendOrderIds',3001010) + "";
    sendBill.name = request.payload.name;
    sendBill.goods_number = warahouseProp.count;
    sendBill.total_amount = 0;
    await dao.save(request,'sendOrder',sendBill);
    reply({
        "message":"订单已提交!",
        "statusCode":101,
        "status":true,
        "resource":sendBill
    });
    return;
}

exports.sendOrders = async function(request,reply) {  
    if (request.payload.apikey != settings.key) {
        reply({
            "message":"apiKey错误!",
            "statusCode":1081,
            "status":false     
        });
        return;
    }
    var startTime = new Date(request.payload.start_time).getTime();
    var endTime = new Date(request.payload.end_time).getTime();
    console.log('startTime',startTime);
    console.log('startTime',endTime);
    var sort;
    if (request.payload.sort == 1) {
        sort = {pay_time:-1};
    } else {
        sort = {pay_time:1};
    }
    console.log('api KEY',request.payload.apikey);
    var orders = await dao.find(request,'sendOrder',{createTime:{$gt:startTime,$lt:endTime}},{createTime:0},sort,request.payload.size,request.payload.page);
    if (orders.length > 0 ) {
        reply({
            "message":"查询成功!",
            "statusCode":107,
            "status":true,
            "resource":orders
        });
    } else {
        reply({
            "message":"暂无订单!",
            "statusCode":1072,
            "status":true
        });
    }
}  
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

function randomChar(l)  {
    var  x = "0123456789qwertyuioplkjhgfdsazxcvbnm";
    var  tmp = "";
    var timestamp = new Date().getTime();
    timestamp = orderFormat(new Date(timestamp));
    for(var  i = 0; i <  l; i++)  {
        tmp  +=  x.charAt(Math.ceil(Math.random()*100000000)%x.length);
    }
    return  timestamp+tmp;
}
function randomCharNum(l,n)  {
    var  x = "0123456789";
    var y = "qwertyuioplkjhgfdsazxcvbnm";
    var  tmp = "";
    var timestamp = new Date().getTime();
    timestamp = orderFormat(timestamp);
    for(var  i = 0; i <  l; i++)  {
        tmp  +=  x.charAt(Math.ceil(Math.random()*100000000) % x.length);
    }
    for(var  j = 0; j <  n; j ++)  {
        tmp  +=  y.charAt(Math.ceil(Math.random()*100000000)%y.length);
    }
    return  timestamp+tmp;
}

// 生成随机数
function RndNum(n){
    var rnd="";
    for(var i=0;i<n;i++)
        rnd+=Math.floor(Math.random()*10);
    return rnd;
}