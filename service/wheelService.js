const dao = require("../dao/dao");
// 抽奖
exports.rewards = async function(request,reply){ 
    var user = request.auth.credentials;
    var wheelSets = await dao.find(request,'wheelRewards',{});
    // type 1 经验 2 精华 3 金币 4 红包 5 体力 6 钻石 7 道具 8 谢谢参与
    for (var index in wheelSets) {
        var wheelSet = wheelSets[index];
        if (wheelSet.type == 7) {
            var prop = await dao.findById(request,'prop',wheelSet.prop_id);
            if (prop) {
                wheelSet.propName = prop.name;
                wheelSet.propImg = prop.img;
            }
        }
    }
    var wheelSetting = await dao.findOne(request,'wheelSet',{});

    reply({
                "message":"查询成功！",
                "statusCode":107,
                "status":true,
                "resource":wheelSets,
                "ext":wheelSetting
        });

        return ;
}

// 抽奖
exports.award = async function(request,reply){
    var user = request.auth.credentials;
    var wheelSet = await dao.findOne(request,'wheelSet',{});
    if (user.wheelUnlocked != 1) {
        reply({
                    "message":"转盘还未解锁！",
                    "statusCode":102,
                    "status":false
        });

        return ;
    }
    if (request.payload.type == 1) {  // 1 消耗金币 2 消耗优惠券
        if (user.gold < wheelSet.wheelFeeGold) {
            reply({
                    "message":"您没有那么多金币！",
                    "statusCode":102,
                    "status":false
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
    console.log("select",select);
    // console.log("wheelRewards",wheelRewards);
    // console.log("wheelReward",wheelReward);
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
     // type 1 经验 2 精华 3 金币 4 红包 5 体力 6 钻石 7 道具 8 谢谢参与\
    var count;
    switch(wheelReward.type) {
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
            prop.count = count;
            data.prop = prop;
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
    var mustData = {};
    // type 1 经验 2 精华 3 金币 4 红包 5 体力 6 钻石 7 道具 8 谢谢参与
    switch(wheelSet.mustRewardType) {
        case 1:
            count = wheelSet.mustRewardExe;
            // data.experience =  data.experience + count;
            mustData.experience = count;
            dao.updateIncOne(request,'user',{_id:user._id},{experience:count});
            break;
        case 2:
            count = wheelSet.mustRewardEss;
            // data.plt_sessence = data.plt_sessence + count;
            mustData.plt_sessence = count;
            dao.updateIncOne(request,'user',{_id:user._id},{plt_sessence:count});
            
            break;
        case 3:
            count = wheelSet.mustRewardGold;
            // data.gold = data.gold + count;
            mustData.gold = count;
            dao.updateIncOne(request,'user',{_id:user._id},{gold:count});
            break;
        case 4:
            count = wheelSet.mustRewardHb;
            // data.hb = data.hb + count;
            mustData.hb = count;
            dao.updateIncOne(request,'user',{_id:user._id},{hb:count});
            break;
        case 5:
            count = wheelSet.mustRewardTl;
            // data.plt_sessence = data.plt_sessence + count;
            mustData.tl = count;
            dao.updateIncOne(request,'user',{_id:user._id},{plt_sessence:count});
            break;
        case 6:
            count = wheelSet.mustRewardDimond;
            // data.dimond = data.dimond + count;
            mustData.dimond = count;
            dao.updateIncOne(request,'user',{_id:user._id},{dimond:count});
            break;
    }
    

    if (data.hb > 0 ) {
        var time = new Date().getTime();
        var monthString = formatDateMonth(new Date(time));
        var myMonthHbRecord = await dao.findOne(request,"monthHbRecord",{user_id:user._id + "",monthString:monthString});
        if (!myMonthHbRecord) {
            myMonthHbRecord = {};
            myMonthHbRecord.hb = data.hb;
            myMonthHbRecord.createTime = time;
            myMonthHbRecord.user_id = user._id + "";
            myMonthHbRecord.username = user.username;
            myMonthHbRecord.nickname = user.nickname;
            myMonthHbRecord.avatar = user.avatar;
            myMonthHbRecord.name = user.name;
            myMonthHbRecord.monthString = monthString;
            await dao.save(request,'monthHbRecord',myMonthHbRecord);
        } else {
            await dao.updateIncOne(request,'monthHbRecord',{_id:myMonthHbRecord._id + ""},{hb:data.hb});
        }

       

        var hbGetRecord = {};
        hbGetRecord.createTime = time;
        hbGetRecord.monthString = formatDateMonth(new Date(time));
        hbGetRecord.hb = data.hb;
        hbGetRecord.type = 1; // 5 种地收获 2 养殖收获 3 偷取红包 4 红包找回 5 抽奖红包
        hbGetRecord.user_id = user._id + "";
        hbGetRecord.username = user.username;
        hbGetRecord.nickname = user.nickname;
        hbGetRecord.name = user.name;
        await dao.save(request,'hbGetRecord',hbGetRecord);
    }

    console.log("data",data);
    reply({
                "message":"抽奖成功",
                "statusCode":101,
                "status":true,
                "resource":{select:select,data:mustData}
     });
    return ;

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

//时间格式化
function format(fmt,data) { //author: meizz 
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

// var stringTime = "1990-01-01 ";
// var timestamp = Date.parse(new Date(stringTime));


/**
 * 传入日期的的字符串  参数是个Date对象 
 * 
 * @param {any} date 参数是个Date对象 
 * @returns 
 */
var zlFormat = function(date) {

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

var formatDateDay = function(date) {

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10) ? '0' + month : month;
        var day = date.getDate();

       
        //var second = date.getSeconds();

        return year.toString()  + "-" + month.toString()  + "-" + day.toString();
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

var formatDateMonth = function(date) {

        var year = date.getFullYear();
        // console.log('year  to string ',year.toString());
        var month = date.getMonth() + 1;
        month = (month < 10) ? '0' + month : month;
         // console.log('month  to string ',month.toString());
      

       
        //var second = date.getSeconds();

        return year.toString()  + "-" + month.toString();
}
