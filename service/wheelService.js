const dao = require("../dao/dao");
// 抽奖
exports.rewards = async function(request,reply){ 
    var user = request.auth.credentials;
    var wheelSets = await dao.find(request,'wheelRewards',{});
    // type 1 经验 2 精华 3 金币 4 红包 5 体力 6 钻石 7 道具 8 谢谢参与
    for (var index in wheelSets) {
        var wheelSet = wheelSet[index];
        if (wheelSet.type == 7) {
            var prop = await dao.findById(request,'prop',wheelSet.prop_id);
            if (prop) {
                wheelSet.propName = prop.name;
                wheelSet.propImg = prop.img;
            }
        }
    }
    reply({
                "message":"查询成功！",
                "statusCode":107,
                "status":true,
                "resource":wheelSet
        });

        return ;
}

// 抽奖
exports.award = async function(request,reply){
    var user = request.auth.credentials;
    var wheelSet = await dao.findOne(request,'wheelSet',{});
    if (request.payload.type == 1) {  // 1 消耗金币 2 消耗优惠券
        if (user.gold < wheelSet.wheelFeeGold) {
            reply({
                    "message":"您没有那么多金币！",
                    "statusCode":102,
                    "status":true
            });

            return ;
        } 

        await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:-Number(wheelSet.wheelFeeGold)});
    } else {
        var prop = await dao.findOne(request,'warahouse',{user_id:user._id + "",propId:wheelSet.couponPropId,count:{$gte:Number(wheelSet.wheelFeeCoupon)}});
        if (!prop) {
            reply({
                "message":"您没有足够的幸运券!",
                "statusCode":102,
                "status":false
            });   
            return;
        }
        await dao.updateIncOne(request,'warahouse',{_id:prop._id + ""},{count:-Number(wheelSet.wheelFeeCoupon)});

    }
   
    var wheelRewards = await dao.find(request,'wheelRewards',{},{},{id:1});
    var values = [];
    for (var index in wheelRewards) {
        var wheelRewardVaule = wheelRewards[index];
        values.push(wheelRewardVaule.weight);
    }
    var wheels = values;
    var select = Choose(wheels);
    var wheelReward = wheelRewards[select];
    var data = {};
    data.type = wheelReward.type;
    data.experience = 0;
    data.gold = 0;
    data.dimond = 0;
    data.hb = 0;
    data.plt_sessence = 0;
    data.tl = 0;
    data.propId = -1;
    data.prop_id = "";
    data.propCount = 0;
    data.feeType = request.payload.type;
    data.feeGold = wheelSet.wheelFeeGold;
    data.feeCoupon = wheelSet.wheelFeeCoupon;
     // type 1 经验 2 精华 3 金币 4 红包 5 体力 6 钻石 7 道具 8 谢谢参与
    switch(wheelSet.type) {
        case 1:
            count = wheelReward.experience;
            data.experience = count;
            dao.updateIncOne(request,'user',{_id:user._id},{experience:count});
            break;
        case 2:
            count = wheelReward.plt_sessence;
            data.plt_sessence = count;
            // message = "抽奖成功，获得精华" + count;
            dao.updateIncOne(request,'user',{_id:user._id},{plt_sessence:count});
            break;
        case 3:
            count = wheelReward.gold;
            data.gold = count;
            // message = "抽奖成功，获得金币" + count;
            dao.updateIncOne(request,'user',{_id:user._id},{gold:count});
            break;

        case 4:
            count = wheelReward.hb;
            data.hb = count;
            // message = "抽奖成功，获得经验" + count;
            dao.updateIncOne(request,'user',{_id:user._id},{hb:count});
            break;
        case 5:
            count = wheelReward.tl;
            data.tl = count;
            // message = "抽奖成功，获得经验" + count;
            dao.updateIncOne(request,'user',{_id:user._id},{tl:count});
            break;
        case 6:
            count = wheelReward.dimond;
            data.dimond = count;
            // message = "抽奖成功，获得经验" + count;
            dao.updateIncOne(request,'user',{_id:user._id},{dimond:count});
            break;
        case 7:
            count = wheelReward.propCount;
            data.propCount = count;
            var prop = await dao.findOne(request,'prop',{id:wheelReward.propId});
            var prop_id = prop._id + "";
            var propId = prop.id; 
            if (prop) {
                var propInHouse = await dao.findOne(request,'warahouse',{prop_id:prop._id + "",user_id:user._id + ""});
                if (propInHouse) {
                    await dao.updateIncOne(request,'warahouse',{_id:propInHouse._id + ""},{count:count});
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
            }
           
            break;
            
    }
    data.mustRewardType = wheelSet.mustRewardType;
    // type 1 经验 2 精华 3 金币 4 红包 5 体力 6 钻石 7 道具 8 谢谢参与
    switch(wheelSet.mustRewardType) {
        case 1:
            count = wheelSet.mustRewardExe;
            data.experience =  data.experience + count;
            dao.updateIncOne(request,'user',{_id:user._id},{experience:count});
            break;
        case 2:
            count = wheelSet.mustRewardEss;
            data.plt_sessence = data.plt_sessence + count;
            dao.updateIncOne(request,'user',{_id:user._id},{plt_sessence:count});
            
            break;
        case 3:
            count = wheelSet.mustRewardGold;
            data.gold = data.gold + count;
            dao.updateIncOne(request,'user',{_id:user._id},{gold:count});
            break;
        case 4:
            count = wheelSet.mustRewardHb;
            data.hb = data.hb + count;
            dao.updateIncOne(request,'user',{_id:user._id},{hb:count});
            break;
        case 5:
            count = wheelSet.mustRewardTl;
            data.plt_sessence = data.plt_sessence + count;
            dao.updateIncOne(request,'user',{_id:user._id},{plt_sessence:count});
            break;
        case 6:
            count = wheelSet.mustRewardDimond;
            data.dimond = data.dimond + count;
            dao.updateIncOne(request,'user',{_id:user._id},{dimond:count});
            break;
    }
    switch(select){
        case 3:
            // data.status = 0;
            message = "谢谢参与";
            number = 0;
            // dao.updateOne(request,"user",{"_id":user._id+""},{gold:user.gold-gold});
            dao.updateIncOne(request,'user',{_id:user._id},{gold:fee});
            break;
        case 4:
            message = "恭喜您获得10个金币!";
            number = 10;
            fee = fee + 10;
            dao.updateIncOne(request,'user',{_id:user._id},{gold:fee});
            break;
        case 5:
            message = "恭喜您获得5个狗粮！";
            number = 0;
            // fee = fee + 10;
            isProp = true;
            prop = await dao.findOne(request,'prop',{type:5});
             prop.count = 5;
            dao.updateIncOne(request,'user',{_id:user._id},{gold:fee});
            // 
            break;
        case 0:
            message = "恭喜您获得30个镰刀！";
            number = 0;
            dao.updateIncOne(request,'user',{_id:user._id},{gold:fee});
            isProp = true;
            prop = await dao.findOne(request,'prop',{type:2});
            prop.count = 30;
            break;
        case 1:
            message = "恭喜您获得30个金币！";
            number = 30;
            fee += 30;
            dao.updateIncOne(request,'user',{_id:user._id},{gold:fee});
            break;
        case 2:
            message = "恭喜您获得5个杀虫剂";
            number = 0;
            dao.updateIncOne(request,'user',{_id:user._id},{gold:fee});
            isProp = true;
            prop = await dao.findOne(request,'prop',{type:3});
            prop.count = 5;
            break;
    }  
    data.createTime = new Date().getTime();
    var result = await dao.save(request,"awardRecord",data);

    if (hb > 0 ) {
        
    }
    reply({
                "message":"抽奖成功",
                "statusCode":101,
                "status":true,
                "resource":{select:select,data:data}
     });
    return ;

}