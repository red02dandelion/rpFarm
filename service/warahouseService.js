const dao = require("../dao/dao");
var settings = require('../settings.js');
exports.sellGoods = async function(request,reply) {
    var user = request.auth.credentials;
    var time = new Date().getTime();
    var goods = await dao.findById(request,'warahouse',request.params.id);

    // soldPrice
    if (!goods) {
        reply({
                "message":"您没有该道具!",
                "statusCode":102,
                "status":false
        });   
        return;
    }
    var count = Number(goods.count);
    if (goods.soldPrice == null) {
        reply({
                "message":"参数缺失!",
                "statusCode":102,
                "status":false
        }); 
    }
    var gold = Number(count * goods.soldPrice);
    await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:gold});

    await dao.updateOne(request,'warahouse',{_id:goods._id + ""},{count:0});

    var goldUseRecord = {};
    goldUseRecord.username = user.username;
    goldUseRecord.user_id = user._id + "";
    goldUseRecord.type = 4; // 1 解锁种子 2 种植种子  3   4 出售道具 
    goldUseRecord.goodsName = goods.name;
    goldUseRecord.des = "出售道具";
    goldUseRecord.goods_id = goods._id + "";
    goldUseRecord.gold =  gold;
    goldUseRecord.preBlance = user.gold;
    goldUseRecord.createTime = time;
    goldUseRecord.count = count;
    user = await dao.findById(request,'user',user._id + "");
    goldUseRecord.afterBlance = user.gold;
    await dao.save(request,'goldUseRecord',goldUseRecord);

    var sellRecord = {};
    sellRecord.createTime = time;
    sellRecord.username = user.username;
    sellRecord.user_id = user._id + "";
    sellRecord.count = count;
    sellRecord.goodsName = goods.name;
    sellRecord.goodsId = goods._id + "";
    await dao.save(request,'sellRecord',sellRecord);
    reply({
        "message":"出售成功!",
        "statusCode":102,
        "status":true,
        "resource":{gold:gold}
    });
}