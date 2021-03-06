const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");
const grouthService = require("../service/grouthService");
var userService = require("../service/userService");
var landService = require("../service/landService");
exports.worm = async function(request,reply){ 
    var user = request.auth.credentials;
    if (request.params.id) {
        // console.log('id is',request.params.id);
    } else {
        // console.log('kong');
    }
    var areca = await dao.findOne(request,'areca',{_id:request.params.id});
    if (!areca) {
        reply({
                "message":"无此槟榔树",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    // var findRes = await dao.find(request,)
    if (areca.status == 2) {
        reply({
                "message":"槟榔树已经成熟无法放虫",
                "statusCode":102,
                "status":false
        });

        return ;
    }

    var  wormRecord = await dao.find(request,'worm',{user_id:user._id + "",grouth_id:areca.grouth_id});
    if (wormRecord.length > 0) {
         reply({
                "message":"该槟榔树您已经放过虫了",
                "statusCode":102,
                "status":false
        });

        return ;
    }


    const currentTime = new Date().getTime();
    const currentDateTime = new Date(currentTime);
    const dayString = formatDateDay(currentDateTime);

    var wormRecord = {};
    wormRecord.user_id = user._id + "";
    wormRecord.username = user.username;
    wormRecord.grouth_id = areca.grouth_id;
    wormRecord.areca_id = areca._id;
    wormRecord.dayString = dayString;
    wormRecord.createTime = currentTime;
    var saveRes = dao.save(request,'worm',wormRecord);
    
    reply({
        "message":"放虫成功",
        "statusCode":101,
        "status":true
    });
}


exports.insec = async function(request,reply){  
    var user = request.auth.credentials;
    var areca = await dao.findOne(request,'areca',{_id:request.params.id});
    if (!areca) {
        reply({
                "message":"无此槟榔树",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    // var findRes = await dao.find(request,)
    if (areca.status == 2) {
        reply({
                "message":"槟榔树已经成熟无法除虫",
                "statusCode":102,
                "status":false
        });

        return ;
    }

    var  wormRecord = await dao.find(request,'insec',{user_id:user._id + "",grouth_id:areca.grouth_id});
    if (wormRecord.length > 0) {
         reply({
                "message":"该槟榔树您已经除过虫了",
                "statusCode":102,
                "status":false
        });

        return ;
    }


    const currentTime = new Date().getTime();
    const currentDateTime = new Date(currentTime);
    const dayString = formatDateDay(currentDateTime);

    var wormRecord = {};
    wormRecord.user_id = user._id + "";
    wormRecord.username = user.username;
    wormRecord.grouth_id = areca.grouth_id;
    wormRecord.areca_id = areca._id;
    wormRecord.dayString = dayString;
    wormRecord.createTime = currentTime;
    var saveRes = dao.save(request,'insec',wormRecord);
    
    reply({
        "message":"除虫成功",
        "statusCode":101,
        "status":true
    });
}


exports.oneKeyInsec = async function(request,reply){  
    var user = request.auth.credentials;
    var lands = await dao.find(request,'land',{user_id:user._id,insec_status:0,status:1});
    if (lands <= 0) {
        reply({
                "message":"没有需要打扫的作物！",
                "statusCode":102,
                "status":false
        });

        return ;
    }
//    var land = await dao.findOne(request,'land',{user_id:user._id,code:request.params.code});
//     if (!land) {
//         reply({
//                 "message":"无此宠物窝",
//                 "statusCode":102,
//                 "status":false
//         });

//         return ;
//     }
    // var findRes = await dao.find(request,)
    // if (land.status == 0) {
    //     reply({
    //             "message":"未增养的宠物窝无法洗澡",
    //             "statusCode":102,
    //             "status":false
    //     });

    //     return ;
    // }


    // 宠物窝有植物
    const currentTime = new Date().getTime();
    const currentDateTime = new Date(currentTime);
    const dayString = formatDateDay(currentDateTime);

    // var insecRecords = await dao.find(request,'insecRecord',{land_id:land._id,dayString:dayString});
    // if (insecRecord.length > 0) {
    //     reply({
    //             "message":"该宠物窝今天已经洗澡过",
    //             "statusCode":102,
    //             "status":false
    //     });

    //     return ;
    // }
    var insecKiller;
    if (user.warahouse == null || user.warahouse.length < 0) {
         reply({
                "message":"您没有洗澡剂",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    for (var index in user.warahouse) {
        var item = user.warahouse[index];
        if (item.type == 3 && item.wara_cata == 2) {
            insecKiller = item;
        }
    }
    // if (!insecKiller) {
    //     reply({
    //             "message":"您没有洗澡剂",
    //             "statusCode":102,
    //             "status":false
    //     });

    //     return ;
    // }
    
     if (!insecKiller || insecKiller.count < lands.length) {
        reply({
                "message":"缺少洗澡剂",
                "statusCode":102,
                "status":false
        });

        return ;
    }

    // if (insecKiller.count == 1) {
    //    await dao.pullOne(request,'user',{_id:user._id },{"warahouse":{"_id":insecKiller._id}});
    // } else {
    //   await dao.updateIncOne(request,'user',{_id:user._id,"warahouse._id":insecKiller._id},{"warahouse.$.count":-1});
    // }

    if (insecKiller.count == lands.length) {
        await dao.pullOne(request,'user',{_id:user._id },{"warahouse":{"_id":insecKiller._id}});
    } else {
       await dao.updateIncOne(request,'user',{_id:user._id,"warahouse._id":insecKiller._id},{"warahouse.$.count":-lands.length});
    }


    // // 更新状态

    //  await dao.updateOne(request,'land',{_id:land._id + ""},{insec_status:1});

    for (var index in lands) {
        var land = lands[index];
        var insecRecord = {};
        insecRecord.dayString  = dayString;
        insecRecord.land_id = land._id;
        insecRecord.username = user.username;
        insecRecord.land_code = land.code;
        insecRecord.seedname = land.seed.seedname;
        insecRecord.grouth_id = land.grouth_id;
        insecRecord.season = land.season;
        var saveRes = await dao.save(request,'insecRecord',insecRecord);
         // 更新状态
       var updateLandWeedRes = await dao.updateOne(request,'land',{_id:land._id},{insec_status:1});
    }

     reply({
        "message":"洗澡成功",
        "statusCode":101,
        "status":true
    });
}

exports.water = async function(request,reply){  
    var user = request.auth.credentials;
    var areca = await dao.findOne(request,'areca',{_id:request.params.id});
    if (!areca) {
        reply({
                "message":"无此槟榔树",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    // var findRes = await dao.find(request,)
    if (areca.status == 2) {
        reply({
                "message":"槟榔树已经成熟无法浇水",
                "statusCode":102,
                "status":false
        });

        return ;
    }

    var  wormRecord = await dao.find(request,'water',{user_id:user._id + "",grouth_id:areca.grouth_id});
    if (wormRecord.length > 0) {
         reply({
                "message":"该槟榔树您已经浇过水了",
                "statusCode":102,
                "status":false
        });

        return ;
    }


    const currentTime = new Date().getTime();
    const currentDateTime = new Date(currentTime);
    const dayString = formatDateDay(currentDateTime);

    var wormRecord = {};
    wormRecord.user_id = user._id + "";
    wormRecord.username = user.username;
    wormRecord.grouth_id = areca.grouth_id;
    wormRecord.areca_id = areca._id;
    wormRecord.dayString = dayString;
    wormRecord.createTime = currentTime;
    var saveRes = dao.save(request,'water',wormRecord);
    
    reply({
        "message":"浇水成功",
        "statusCode":101,
        "status":true
    });
}


exports.oneKeyHarvest = async function(request,reply){ 
    var user = request.auth.credentials;
    var areca = await dao.findOne(request,'areca',{user_id:user._id + ""});
    if (areca == null) {
         reply({
            "message":"槟榔树不存在",
            "statusCode":102,
            "status":false
        });
          return;
    }
    if (areca.status == 1) {
        reply({
            "message":"槟榔树还未成熟",
            "statusCode":102,
            "status":false
        });  
        return;
    }
    // return;

    // var grouth = {};
    var oldGoouth = await dao.findById(request,'grouth',areca.grouth_id + "");
    if (oldGoouth == null) {
        reply({
            "message":"未知错误",
            "statusCode":102,
            "status":false
        });  
        return;
    }
    var grouth = {};
    grouth.areca_id = areca._id + "";
    grouth.areca = areca.arecaCount;
    grouth.username = user.username;
    grouth.createTime = new Date().getTime();
    grouth.grow_start_time = new Date().getTime();
    grouth.user_id = user._id + "";
    grouth.circle = oldGoouth.circle + 1;
    await dao.save(request,'grouth',grouth);
    grouth = await dao.findOne(request,'grouth',{username:user.username,createTime:grouth.createTime});
    await dao.updateOne(request,'areca',{_id:areca._id +""},{grouth_id:grouth._id + "",circle:grouth.circle,status:1,grow_start_time:grouth.createTime,stealed:0});
    await dao.updateIncOne(request,'user',{_id:user._id},{areca:areca.arecaCount});
    
    var harvest = {};
    harvest.grouth_id = areca.grouth_id;
    harvest.areca_id = areca._id + "";
    harvest.username = user.username;
    harvest.user_id = user._id + "";
    harvest.harvest_time = new Date().getTime();
    harvest.areca = areca.arecaCount;
    harvest.circle = oldGoouth.circle;
    await dao.save(request,'harvest',harvest);
    if (areca.arecaCount > 0) {
        reply({
            "message":"收获成功,获得" + areca.arecaCount + "个槟榔",
            "statusCode":101,
            "status":true
        });
    } else {
        reply({
            "message":"收获成功,该周期未长出槟榔，已开启下一次生长。",
            "statusCode":101,
            "status":true
        });
    }
    
  
}

exports.harvest = async function(request,reply){ 
    var user = request.auth.credentials;
    var land = await dao.findOne(request,'land',{user_id:user._id,code:request.params.code});
    if (!land) {
        reply({
                "message":"无此宠物窝",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    if (land.status == 0) {
        reply({
                "message":"该宠物窝还未增养",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    if (land.status != 2) {
        reply({
                "message":"该种子还未成熟",
                "statusCode":102,
                "status":false
        });

        return ;
    }

    if (land.seed == null) {
        reply({
                "message":"该种子还未种植",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    // var seed = await dao.findById(request,'seed',land.seed._id + "");
    
    //  // console.log('----------land',land);
    //  // console.log('land.seasopm',land.season);
    var curSeason;
    var seed = await dao.findById(request,'seed',land.seed._id + "");
    for (var index in seed.seasons) {
        var seasonInfo = seed.seasons[index];
         // console.log('index:'+index + ",seasoninfo.season" +seasonInfo.season + ",land.seasion" + land.season);
        if (seasonInfo.season == land.season) {
            curSeason = seasonInfo;
        }
    }
    // // console.log('curSeason',curSeason);
    if (!curSeason) {
        reply({
                "message":"该种子还未种植",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    // 当前季的收益
    var gold = await grouthService.grouthHarvest(request,land);
    gold = parseFloat(gold.toFixed(2));

    // 先收获当前季
    var harvest = {};
    harvest.grouth_id = land.grouth_id;
    harvest.land_id = land._id;
    harvest.username = user.username;
    harvest.user_id = user._id;
    harvest.season = curSeason.season;
    harvest.harvest_time = new Date().getTime();
    harvest.seedname = land.seed.seedname;
    harvest.islast = isLastSeason;
    harvest.gold = gold;
    harvest.code = land.code;
    await dao.save(request,'harvest',harvest);
    harvest.type = 1;
    harvest.createTime =  harvest.harvest_time;
    delete harvest.harvest_time;
    await dao.save(request,'dynamic',harvest);
    // 更新用户金钱
    var updateUser = await dao.updateIncOne(request,'user',{_id:user._id  },{gold:gold});

    var seasonHour = seed.seasons[0].hour;
    // // console.log('seasonHour',seasonHour);、
    var nextSeason;
    // 当前时间超过最后季成熟时间 收获后直接死亡 
    if (new Date().getTime() - land.plant_time >= seasonHour * seed.seasons.length * 60 * 60 * 1000) {
       
        nextSeason = seed.seasons.length + 1;
      //  当前时间还未超过成熟时间 收获后继续生长 收获后下一季根据时间计算
    } else {
        nextSeason = Math.floor( (new Date().getTime() - land.plant_time)  / (seasonHour * 60 * 60 * 1000)) + 1;
    }
    // console.log('nextSeason is',nextSeason);
    
    // 生成当前季到将要跳转的季节之间的收益
    for (var i = curSeason.season + 1;i < nextSeason;i ++) {
        var harvest = {};
        harvest.grouth_id = land.grouth_id;
        harvest.land_id = land._id;
        harvest.username = user.username;
        harvest.user_id = user._id;
        harvest.season = i;
        harvest.harvest_time = new Date().getTime();
        harvest.seedname = land.seed.seedname;
        harvest.islast = isLastSeason;
        harvest.gold = 0;
        harvest.code = land.code;
        await dao.save(request,'harvest',harvest);
        harvest.type = 1;
        harvest.createTime =  harvest.harvest_time;
        delete harvest.harvest_time;
         await dao.save(request,'dynamic',harvest);
    }

    // 是否是最后一季
    var isLastSeason = nextSeason == seed.seasons.length + 1?true:false;
   
    
    

    // 更新日常任务状态
    const currentTime = new Date().getTime();
    if (isLastSeason == true) {
        // console.log('isLastSeason last');
        var updateGrouth = await dao.updateOne(request,'grouth',{_id:land.grouth_id+""},{end_time:currentTime});
        var updateLandRes = await dao.updateOne(request,'land',{_id:land._id  },{
            status:3,
            plant_time:0,
            // seed:{},
            season:0,
            season_start_time:0,
            season_stealed:0,
            grouth_id:"",
            stealed_count:0
        });
    } else {
        // console.log('not last currentTime is ',currentTime);
        // console.log('now is',new Date().getTime());
        var updateLandRes = await dao.updateOne(request,'land',{_id:land._id  },{
            status:1,
            // plant_time:new Date().getTime(),
            season:nextSeason,
            season_start_time:currentTime,
            season_stealed:0,
            stealed_count:0
        });  

       
        const currentDateTime = new Date(currentTime);
        const dayString = formatDateDay(currentDateTime);
  

    }
    
    reply({
        "message":"收获成功,获得" + gold + "金币",
        "statusCode":101,
        "status":true
    });
}

exports.root = async function(request,reply){ 
    var user = request.auth.credentials;
    var land = await dao.findOne(request,'land',{user_id:user._id  ,code:request.params.code});
    if (!land) {
        reply({
                "message":"无此宠物窝",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    if (land.status == 0) {
        reply({
                "message":"该宠物窝还未增养",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    if (land.status != 3) {
        reply({
                "message":"该宠物窝还未枯萎",
                "statusCode":102,
                "status":false
        });

        return ;
    }

    var sholvel;
    if (user.warahouse == null || user.warahouse.length < 0) {
         reply({
                "message":"您没有铲子",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    for (var index in user.warahouse) {
        var item = user.warahouse[index];
        if (item.type == 4 && item.wara_cata == 2) {
            sholvel = item;
        }
    }

    if (!sholvel) {
        reply({
                "message":"您没有铲子",
                "statusCode":102,
                "status":false
        });

        return ;
    }

    if (sholvel.count == 1) {
      await dao.pullOne(request,'user',{_id:user._id  },{"warahouse":{"_id":sholvel._id}});
    } else {
      await dao.updateIncOne(request,'user',{_id:user._id  ,"warahouse._id":sholvel._id},{"warahouse.$.count":-1});
    }
    
     var updateLandRes = await dao.updateOne(request,'land',{_id:land._id  },{
        status:0,
        plant_time:0,
        season:0,
        season_start_time:0,
        season_stealed:0,
        seed:null
    });  

    reply({
        "message":"掩埋成功",
        "statusCode":101,
        "status":true
    });

}

exports.plt_steal = async function(request,reply){ 
    var user = request.auth.credentials;
    var land = await dao.findOne(request,'land',{_id:request.params.id});
    if (!land) {
        reply({
                "message":"无此土地！",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    var stealFromUser = await dao.findById(request,'user',land.user_id);
    if (stealFromUser.username == user.username) {
        reply({
                "message":"自己的土地无法偷取！",
                "statusCode":102,
                "status":false
        });
        
        return ;
    }
    await landService.updateUserLandGrows(request,stealFromUser);
    if (land.status != 3){
        reply({
                "message":"植物还未成熟！",
                "statusCode":102,
                "status":false
        });
       
        return ;
    }
    var stealRecords = await dao.find(request,'stealRecord',{land_id:land._id + "",grow_id:land.grow_id,username:user.username});
    if (stealRecords.length > 0) {
        reply({
                "message":"该次成熟已被偷过。",
                "statusCode":102,
                "status":false
        });

        return ;
    }

    // 走偷取逻辑
    var harvest = await dao.findOne(request,'harvest',{grow_id:land.grow_id + ""});
    var plant = await dao.findById(request,'plant',land.plt_id + "");
    
    var experience = 0;
    var stdExeSuccessRadm = Math.random();
    if (stdExeSuccessRadm <= plant.stdExeRate) {
        // 本次收获最大偷取量
        var canStdExe = plant.expirence * plant.stdExeMaxPp;
        // 本次收获保底量
        var minHarvExe = plant.experience - canStdExe;
        // 如果还有偷取的余地
        if (harvest.experience > minHarvExe) {
            // 偷取的数量按剩余可偷取量计算
            experience = Math.round((harvest.experience - minHarvExe) * Math.random());
        }
    }

    var hb = 0;
    var hbStdSuccessRadm = Math.random();
    if (hbStdSuccessRadm <= plant.stdHbRate) {
        var canStdHb = harvest.priHb * plant.stdHbMaxPp;
        var minHarvHb = harvest.priHb - canStdHb;
        if (harvest.hb > minHarvHb) {
            hb = Math.round((harvest.hb - minHarvHb) * Math.random() * 100) / 100;
        }
    }

    var ess = 0;
    var essStdSuccessRadm = Math.random();
    if (essStdSuccessRadm <= plant.stdEssRate) {
        var canStdEss = harvest.priEss * plant.stdEssMaxPp;
        var minHarvEss = harvest.priEss - canStdEss;
        if (harvest.plt_sessence > minHarvEss) {
            ess = Math.round((harvest.plt_sessence - minHarvEss) * Math.random());
        }
    }

    var gold = 0;
    var canStdGold = harvest.priGold * plant.stdGoldMaxPp;
    var minHarvGold = harvest.gold - canStdGold;
    if (harvest.gold > minHarvGold) {
        gold = Math.round((harvest.gold - minHarvGold) * Math.random());
    }
    // 更新用户数据
    await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:gold,experience:experience,plt_sessence:ess,hb:hb});
    var stealRecord = {};
    stealRecord.username = user.username;
    stealRecord.user_id = user._id + '';
    stealRecord.experience = experience;
    stealRecord.plt_ess = ess;
    stealRecord.gold = gold;
    stealRecord.hb = hb;
    stealRecord.createTime = new Date().getTime();
    stealRecord.stealFrom = stealFromUser.username;
    stealRecord.fromId = stealFromUser._id  + "";
    stealRecord.area = 1; // 1 农场 2 牧场
    stealRecord.land_id = land._id + "";
    stealRecord.grow_id = land.grow_id;
    stealRecord.harvest_id = harvest._id + "";
    await dao.save(request,'stealRecrod',stealRecord);
    // 更新收益
    await dao.updateIncOne(request,'harvest',{_id:harvest._id + ""},{gold:-gold,experience:-experience,plt_sessence:-ess,hb:-hb});
    var data = {};
    data.gold = gold;
    data.ess = ess;
    data.experience = experience;
    data.hb = hb;
    reply({
                "message":"偷取成功，获得金币"+gold+'个，植物精华'+ ess + "个，经验"+experience + ",红包" + hb +"元。",
                "statusCode":101,
                "status":true,
                "resource":data
    });
}

// 喂狗
exports.feed = async function(request,reply){
    var user = request.auth.credentials;
    var currentTime = new Date().getTime();
    if (user.dogV == 0) {
        reply({
                "message":"你还未装备狗狗",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    
    if (user.warahouse == null || user.warahouse.length < 0) {
         reply({
                "message":"您没有狗粮",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    var dogFood;
    for (var index in user.warahouse) {
        var item = user.warahouse[index];
        if (item.type == 5 && item.wara_cata == 2) {
            dogFood = item;
        }
    }
    if (!dogFood) {
        reply({
                "message":"您没有狗粮",
                "statusCode":102,
                "status":false
        });

        return ;
    }

    if (dogFood.count <= 1) {
       await dao.pullOne(request,'user',{_id:user._id },{"warahouse":{"_id":dogFood._id}});
    } else {
      await dao.updateIncOne(request,'user',{_id:user._id,"warahouse._id":dogFood._id},{"warahouse.$.count":-1});
    }

    var updateDogFeedRes = await dao.updateOne(request,'user',{"_id":user._id},{"dog.last_feed":currentTime});

    reply({
                "message":"喂养成功",
                "statusCode":101,
                "status":false
    });
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
