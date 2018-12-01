"use strict";
const dao = require("../dao/dao");
const landService = require("../service/landService");
const farmService = require("../service/farmService");
var userService = require("../service/userService");
// 植物标签列表 
exports.tags = async function (request,reply) {
    var user = request.auth.credentials; 
    await userService.updatePlantCbRecord(request,user);
    var tags = await dao.find(request,'plantQuality',{hasSeed:1},{},{id:1});
    var plants = [];
    if (tags.length > 0) {
        var tag = tags[0];
        var plants = await dao.find(request,'plant',{qualityId:tag.id},{},{sortFlag:1});
        if (plants.length > 0) {
            for (var index in plants) {
                var plant = plants[index];
                var prop = {};
                prop.needProp = plant.needProp;
                prop.needCount = plant.needCount;
                prop.img = "";
                prop.prop_id = "";
                if (plant.needProp != -1) {
                    var needProp = await dao.findOne(request,'prop',{id:plant.needProp});
                    if (needProp) {
                        prop.img = needProp.img;
                        prop.prop_id = needProp._id + "";
                    }
                } else {
                    prop.img = plant.img;
                }
                plant.prop = prop;
                // console.log('plant',plant);
            }
        }
        //  console.log('plants',plants);
        await landService.hasPlantsUpdate(request,plants,user);
    }
    reply({
                "message":"请求成功！",
                "statusCode":107, 
                "status":true,
                "resource":{tags:tags,plants:plants}
    });
}

// 标签下植物
exports.tagPlant = async function (request,reply) {  
    var user = request.auth.credentials;
    var plants = await dao.find(request,'plant',{qualityId:request.params.id},{},{sortFlag:1});
    if (plants.length <= 0 ){
         reply({
                "message":"该标签下没有植物！",
                "statusCode":108,
                "status":false,
                "resource":{plants:plants}
         });
        return;
    }
    // console.log('plants',plants);
    await landService.hasPlantsUpdate(request,plants,user);
    // console.log('plants.length',plants.length);
    if (plants.length > 0) {
        for (var index in plants) {
            var plant = plants[index];
            var prop = {};
            prop.needProp = plant.needProp;
            prop.needCount = plant.needCount;
            prop.img = "";
            prop.prop_id = "";
            if (plant.needProp != -1) {
                var needProp = await dao.findOne(request,'prop',{id:plant.needProp});
                if (needProp) {
                    prop.img = needProp.img;
                    prop.prop_id = needProp._id + "";
                }
            }
            plant.prop = prop;
            // console.log('plant',plant);
        }
    }
    // console.log('plants',plants);
    reply({
                "message":"请求成功！",
                "statusCode":107,
                "status":true,
                "resource":{plants:plants}
    });
}
// 解锁植物 
exports.unlockPlant = async function (request,reply) { 
    var user = request.auth.credentials;
    var plant = await dao.findById(request,'plant',request.params.id);
    if (plant.free == 1) {
        reply({
                "message":"免费种子无须合成！",
                "statusCode":102,
                "status":false
        });

        return ;   
    }
    
    var unlockRecod = await dao.findOne(request,'sdCbRecord',{user_id:user._id + "",plt_id:request.params.id});
    if (unlockRecod) {
        reply({
                "message":"该种子以及合成过了",
                "statusCode":102,
                "status":false
        });

        return ;
    }
   if (plant.sortFlag > 1) {
        var preUnlockPlt = await dao.findOne(request,'plant',{sortFlag:plant.sortFlag - 1});       
        var preUnlcRecordCount = await dao.findCount(request,'sdCbRecord',{plt_id:preUnlockPlt._id + "",user_id:user._id + ""});
        if (preUnlcRecordCount <= 0) {
            reply({
                "message":"请按顺序解锁种子！",
                "statusCode":102,
                "status":false
            });
            return;
        }
   }
    var unlcRecordCount = await dao.findCount(request,'sdUlkRecord',{plt_id:request.params.id + "",user_id:user._id + ""});
    if (unlcRecordCount >= plant.unlockTime) {
        reply({
                "message":"该种子无须再解锁了！",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    // 判断解锁条件
   
    if (user.gold < plant.everyPrice) {
        reply({
                "message":"金币不足！",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    var gold = plant.everyPrice; // 
    await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:-gold});
    // console.log('1111111');
    var unlockRecord = {};
    // console.log('unlockRecod',unlockRecord);
    unlockRecord.user_id = user._id + "";
    unlockRecord.plt_id = request.params.id;
    // console.log('unlockRecord',unlockRecord);
    await dao.save(request,'sdUlkRecord',unlockRecord);
    plant.hasUnlockTime = unlcRecordCount + 1;
    reply({
            "message":"解锁成功！",
            "statusCode":101,
            "status":true,
            "resource":{plant:plant}
    });
}

// 合成种子
exports.cbPlant = async function (request,reply) { 
    var user = request.auth.credentials;
    var plant = await dao.findById(request,'plant',request.params.id);
    if (plant.free == 1) {
        reply({
                "message":"免费种子无须合成！",
                "statusCode":102,
                "status":false
        });

        return ;   
    }
    var unlockRecod = await dao.findOne(request,'sdCbRecord',{user_id:user._id + "",plt_id:request.params.id});
    if (unlockRecod) {
        reply({
                "message":"该种子以及合成过了",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    // 判断解锁条件
    var unlcRecordCount = await dao.findCount(request,'sdUlkRecord',{plt_id:request.params.id + "",user_id:user._id + ""});
    if (unlcRecordCount < plant.unlockTime) {
        reply({
                "message":"还未解锁完毕不能合成!",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    var unlockRecord = {};
    unlockRecord.user_id = user._id + "";
    unlockRecord.plt_id = request.params.id;
    await dao.save(request,'sdCbRecord',unlockRecord);
    plant.unclockStatus = 2;
    reply({
            "message":"合成成功！",
            "statusCode":101,
            "status":true,
            "resource":{plant:plant}
    });
}
exports.userPlantDetail = async function (request,reply) { 
    var user = request.auth.credentials;
    var plant = await dao.findById(request,'plant',request.params.id);
    if (plant) {
        await landService.hasPlantUpdate(request,plant,user);
        await landService.harvestDetail(request,plant,user);
    }
    reply({
            "message":"查询成功！",
            "statusCode":107,
            "status":true,
            "resource":{plant:plant}
    });
}
 
// 植物详情
exports.plantDetail = async function (request,reply) { 
    var user = request.auth.credentials;
    var plant = await dao.findById(request,'plant',request.params.id);
    reply({
            "message":"查询成功！",
            "statusCode":107,
            "status":true,
            "resource":{plant:plant}
    });
}

// 种植
exports.plant = async function (request,reply) { 
    var user = request.auth.credentials;
    console.log('plant2222');
    var plant = await dao.findById(request,'plant',request.payload.id);
   
    if (!plant) {
        reply({
            "message":"种子信息缺失！",
            "statusCode":108,
            "status":false
         });
        return;
    }
     console.log('plant',plant.animationId);
    await landService.hasPlantUpdate(request,plant,user);
    if (plant.unclockStatus != 2) {
         reply({
            "message":"该种子您还未合成无法种植！",
            "statusCode":108,
            "status":false,
            "resource":{plant:plant}
         });
        return;
    }
    var land;
    if (request.params.code == 0) {
        var freeLands = await dao.find(request,'land',{user_id:user._id + "",status:1},{},{code:1});
        if (freeLands.length <= 0) {
            reply({
                "message":"您没有闲置的土地可供种植！",
                "statusCode":1081,
                "status":false
            });
            return;
        }
        land = freeLands[0];

    } else {
        // console.log('land code ',request.params.code);
        land = await dao.findOne(request,'land',{user_id:user._id + "",code:request.params.code});
        if (land.status != 1) {
            reply({
                "message":"该土地当前不可种植！",
                "statusCode":108,
                "status":false
            });
            return;
        }
    }

    if (user.gold < plant.plantPrice) {
        reply({
                "message":"金币不足！",
                "statusCode":108,
                "status":false
        });
        return;
    }
    var userProp;
    if (plant.needProp > 0) {
        userProp = await dao.findOne(request,'warahouse',{propId:plant.needProp,count:{$gte:plant.needCount}});
        if (!userProp) {
            reply({
                "message":"所需道具不足！",
                "statusCode":108,
                "status":false
            });
            return;
        }
        await dao.updateIncOne(request,'warahouse',{_id:userProp._id + ""},{count:-plant.needCount});
        
    }
    await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:-plant.plantPrice});
   
    var time = new Date().getTime();
    // console.log('11111time',time);
    var grow = {};
    grow.createTime = time;
    grow.land_code = land.code;
    grow.land_id = land._id + "";
    grow.username = user.username;
    grow.user_id = user._id + "";
    grow.harvestTime = time + plant.growTime * 1000;
    grow.plt_id = plant._id + '';
    var saveRes = await dao.save(request,'growRecord',grow);
    grow = saveRes.ops[0];

    /**  生成收益  ****/
    var experience = plant.expirence;
    var harvestGold = Math.round((Math.random() * (plant.maxGold - plant.minGold) + plant.minGold)) ;
    var plt_essence = Math.round((Math.random() * (plant.maxEssence - plant.minEssence) + plant.minEssence));
    var hb = 0;
    // 首次种植必产出红包
    var hbHarvestRecord = await dao.findOne(request,'hbFstRecord',{user_id:user._id + "",plt_id:plant._id + "",plt_flag:1});
    if (hbHarvestRecord) {
        var hbSuccessRadm = Math.random();
        if (hbSuccessRadm <= plant.hbRate) {
            hb = Math.round((Math.random() * (plant.maxHb - plant.minHb) + plant.minHb) * 100) / 100;
        }
    } else {
         hb = plant.firHb;
         await dao.save(request,'hbFstRecord',{user_id:user._id + "",plt_id:plant._id + "",plt_flag:1});
    }

    var harvest = {};   
    harvest.gold = harvestGold;
    harvest.priGold = harvestGold;
    harvest.plt_sessence = plt_essence;
    harvest.priEss = plt_essence;
    harvest.experience = experience;
    harvest.hb = hb;
    harvest.priHb = hb;
     // 计算额外掉落
    var dropGruops = await dao.find(request,'dropGroups',{id:plant.dropId});
    // console.log('1111111',dropGruops);
    var props = [];
    if (dropGruops.length > 0) {
        for (var index in dropGruops) {
            var group = dropGruops[index];
            var sucRand = Math.random();
            // 掉落
            if (sucRand <= group.rate) {
                var count = Math.round(Math.random() * (group.max - group.min) + group.min);
                var prop = await dao.findOne(request,'prop',{id:group.propId});
                // console.log('222222',prop);
                if (prop) {
                    prop.count = count;
                    props.push(prop);
                }
            }
        }
    }
    harvest.props = props;
    harvest.user_id = user._id + "";
    harvest.grow_id = grow._id + "";
    harvest.status = 0; // 未收取
    harvest.land_id = land._id + "";
    harvest.land_code = land.code;
    await dao.save(request,'harvest',harvest);
    /**  生成收益  ****/  

    console.log('plant2222',plant.animationId);
    // console.log('grow',grow);
    await dao.updateOne(request,'land',{_id:land._id + ""},{status:2,free:0,plantTime:time,harvestTime:time + plant.growTime * 1000,grow_id:grow._id + "",plt_id:plant._id + "",animationId:plant.animationId, pltId:parseInt(plant.id)});
    // console.log('2222time',time);
    // console.log('3333time',land.plantTime);
    reply({
            "message":"种植成功！",
            "statusCode":107,
            "status":true,
            "resource":{land:land}
    });
}
exports.harvestPreview = async function (request,reply) { 
    var user = request.auth.credentials;
    var land = await dao.findById(request,'land',request.params.id);
    // console.log('land',land);
    if (!land) {
        reply({
                "message":"土地不存在!",
                "statusCode":108,
                "status":false
        });
        return;
    }
    await landService.updateGrowStataus(request,land);
    // console.log('land2222',land);
    if (land.status != 3) {
        reply({
                "message":"还未成熟！",
                "statusCode":108,
                "status":false
        });
        return;
    }
    var harvest = await dao.findOne(request,'harvest',{grow_id:land.grow_id});
    reply({
            "message":"查询成功！",
            "statusCode":107,
            "status":true,
            "resource":{harvest:harvest}
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
    console.log('111land.status',land.status);
    // await landService.updateUserLandGrows(request,stealFromUser);
    await landService.updateGrowStataus(request,land);
    console.log('2222land.status',land.status);
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

    var system2 = await dao.findOne(request,'systemSet2',{});
    if (user.power < system2.tlStlHbUse) {
        reply({
                "message":"体力不足！",
                "statusCode":102,
                "status":false
        });
       
        return ;
    }
    await dao.updateIncOne(request,'user',{_id:user._id + ""},{power:-system2.tlStlHbUse});
    // 走偷取逻辑
    var harvest = await dao.findOne(request,'harvest',{grow_id:land.grow_id + ""});
    var plant = await dao.findById(request,'plant',land.plt_id + "");
    
    var experience = 0;
    var stdExeSuccessRadm = Math.random();
    // console.log('plant',plant);
    // console.log('harvest',harvest);
    // console.log('stdExeSuccessRadm',stdExeSuccessRadm);
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
    // console.log('hbStdSuccessRadm',hbStdSuccessRadm);
    if (hbStdSuccessRadm <= plant.stdHbRate) {
        var canStdHb = harvest.priHb * plant.stdHbMaxPp;
        var minHarvHb = harvest.priHb - canStdHb;
        if (harvest.hb > minHarvHb) {
            hb = Math.round((harvest.hb - minHarvHb) * Math.random() * 100) / 100;
        }
    }
    
    var ess = 0;
    var essStdSuccessRadm = Math.random();
    // console.log('essStdSuccessRadm',essStdSuccessRadm);
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
        // console.log('gold',gold);
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
    console.log('data',data);
    reply({
                "message":"偷取成功，获得金币"+gold+'个，植物精华'+ ess + "个，经验"+experience + ",红包" + hb +"元。",
                "statusCode":101,
                "status":true,
                "resource":data
    });
}


exports.steal = async function(request,reply){ 
    var user = request.auth.credentials;
    var friend = await dao.findById(request,'user',request.params.id);
    if (!friend) {
        reply({
                "message":"无此用户！",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    if (friend.username == user.username) {
        reply({
                "message":"自己的土地无法偷取！",
                "statusCode":102,
                "status":false
        });
        
        return ;
    }

    var system2 = await dao.findOne(request,'systemSet2',{});
    if (user.power < system2.tlStlHbUse) {
        reply({
                "message":"体力不足！",
                "statusCode":102,
                "status":false
        });
       
        return ;
    }
    await dao.updateIncOne(request,'user',{_id:user._id + ""},{power:-system2.tlStlHbUse});
    await landService.updateUserLandGrows(request,friend);
    await farmService.updateUserLandGrows(request,friend);
    var harvestLands = await dao.find(request,'land',{user_id:friend._id + "",status:3},{},{harvestTime:1});
    console.log('111harvestLands',harvestLands);
    harvestLands = await userService.noStealHarvestLands(request,harvestLands);
    console.log('222harvestLands',harvestLands);
    var harvestFarms = await dao.find(request,'farm',{user_id:friend._id + "",status:3},{},{harvestTime:1});
    console.log('111harvestFarms',harvestFarms);
    harvestFarms = await userService.noStealHarvestFarms(request,harvestFarms);
    console.log('222harvestFarms',harvestFarms);
    var data = {};
    data.gold = 0;
    data.ess = 0;
    data.experience = 0;
    data.hb = 0;
    if (harvestLands.length > 0) {
        for (var index in harvestLands) {
            var land = harvestLands[index];
            if (!land) {
                continue;
            }
            if (land.status != 3){ 
                continue;
            }
            await stealLand(request,land,data,1,friend);
        }
    }

    if (harvestFarms.length > 0) {
        for (var index in harvestFarms) {
            // 偷取
            var land = harvestFarms[index];
            if (!land) {
                continue;
            }
            if (land.status != 3){ 
                continue;
            }
             await stealLand(request,land,data,2,friend);
        }
    }
    console.log('data',data);
    // 更新用户数据
    await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:data.gold,experience:data.experience,plt_sessence:data.ess,hb:data.hb});
    
    // 总偷取记录
    var stealRecord = {};
    stealRecord.username = user.username;
    stealRecord.user_id = user._id + '';
    stealRecord.experience = data.experience;
    stealRecord.plt_ess = data.ess;
    stealRecord.gold = data.gold;
    stealRecord.hb = data.hb;
    stealRecord.createTime = new Date().getTime();
    stealRecord.stealFrom = friend.username;
    stealRecord.fromId = friend._id  + "";
    if (data.hb > 0) {
        stealRecord.hbFlag = 1;
    }
    stealRecord.friendRead = 0;
    await dao.save(request,'stealTotalRecord',stealRecord);

    reply({
                "message":"偷取成功，获得金币"+data.gold+'个，植物精华'+ data.ess + "个，经验"+data.experience + ",红包" + data.hb +"元。",
                "statusCode":101,
                "status":true,
                "resource":data
    });
}
exports.stealNews = async function(request,reply){  
    var user = request.auth.credentials;
    var 
}
const stealLand = async function (request,land,data,type,stealFromUser) { 
    var user = request.auth.credentials;
    // 偷取
    // 走偷取逻辑
    var harvest = await dao.findOne(request,'harvest',{grow_id:land.grow_id + ""});
    var plant ;
    if (type == 1) {
        plant  = await dao.findById(request,'plant',land.plt_id + "");;  
    } else if (type == 2) {
        plant  = await dao.findById(request,'animal',land.plt_id + "");;  
    }
    if (!plant) {
        console.log('plant',plant);
        return;
    }
    var experience = 0;
    var stdExeSuccessRadm = Math.random();
    // console.log('plant',plant);
    // console.log('harvest',harvest);
    // console.log('stdExeSuccessRadm',stdExeSuccessRadm);
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
    // console.log('hbStdSuccessRadm',hbStdSuccessRadm);
    if (hbStdSuccessRadm <= plant.stdHbRate) {
        var canStdHb = harvest.priHb * plant.stdHbMaxPp;
        var minHarvHb = harvest.priHb - canStdHb;
        if (harvest.hb > minHarvHb) {
            hb = Math.round((harvest.hb - minHarvHb) * Math.random() * 100) / 100;
        }
    }
    
    var ess = 0;
    var essStdSuccessRadm = Math.random();
    // console.log('essStdSuccessRadm',essStdSuccessRadm);
    if (essStdSuccessRadm <= plant.stdEssRate) {
        var canStdEss = harvest.priEss * plant.stdEssMaxPp;
        var minHarvEss = harvest.priEss - canStdEss;
        if (harvest.plt_sessence > minHarvEss) {
            ess = Math.round((harvest.plt_sessence - minHarvEss) * Math.random());
        }
    }

    var gold = 0;
    var canStdGold = harvest.priGold * plant.stdGoldMaxPp;
    var minHarvGold = harvest.priGold - canStdGold;
    if (harvest.gold > minHarvGold) {
        // console.log('gold',gold);
        gold = Math.round((harvest.gold - minHarvGold) * Math.random());
    }
    
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
    stealRecord.type = type;
    await dao.save(request,'stealRecord',stealRecord);
    
    data.gold =  data.gold +  gold;
    data.ess = data.ess + ess;
    data.experience = data.experience + experience;
    data.hb = data.hb + hb;
     // 更新收益
    await dao.updateIncOne(request,'harvest',{_id:harvest._id + ""},{gold:-gold,experience:-experience,plt_sessence:-ess,hb:-hb});
    console.log('-----data------',data);
}
exports.harvest = async function (request,reply) { 
    var user = request.auth.credentials;
    var land = await dao.findById(request,'land',request.params.id);
    if (!land) {
        reply({
                "message":"土地不存在!",
                "statusCode":108,
                "status":false
        });
        return;
    }
    await landService.updateGrowStataus(request,land);
    // land = await dao.findById(request,'land',request.params.id);
    if (land.status != 3) {
        reply({
            "message":"土地还未成熟！",
            "statusCode":108,
            "status":false
        });

        return;
    }
    var plant = await dao.findById(request,'plant',land.plt_id + "");
    var harvest = await dao.findOne(request,'harvest',{grow_id:land.grow_id + ""});
    if (!harvest) {
        reply({
            "message":"异常！",
            "statusCode":108,
            "status":false
        });

        return;
    }
    delete harvest.status;
    delete harvest.user_id;

    // console.log('harvest',harvest)
   // 收取掉落组装备
   if (harvest.props.length > 0) {
       for (var index in harvest.props) {
            var prop = harvest.props[index];
            var prop_id = prop._id + "";
            var propId = prop.id; 
            var propInHouse = await dao.findOne(request,'warahouse',{prop_id:prop._id + "",user_id:user._id + ""});
            // console.log('33333',propInHouse);
            if (propInHouse) {
                await dao.updateIncOne(request,'warahouse',{_id:propInHouse._id + ""},{count:prop.count});
            } else {
                //prop进warahouse 除去_id、id增加prop_id、propId、user_id、username的全部信息
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
   }
    delete harvest.props;
    await dao.updateOne(request,'harvest',{_id:harvest._id + ""},{status:1});
    delete harvest._id;
    delete harvest.grow_id;
    delete harvest.land_id;
    delete harvest.land_code;
    // console.log('2222harvest',harvest)
    // 更新用户收益
    await dao.updateIncOne(request,'user',{_id:user._id + ""},harvest);
    // 更新土地
    await dao.updateOne(request,'land',{_id:land._id + ""},{status:1,free:1,plantTime:0,harvestTime:0,grow_id:"",plt_id:"",animationId:-1,pltId:0});
    // console.log('4444');
    reply({
        "message":"收获成功！!",
        "statusCode":101,
        "status":true,
        "resource":{harvest:harvest}
    });

}
exports.onekeyHarvest = async function (request,reply) { 
    var user = request.auth.credentials;
    var lands = await dao.find(request,'land',{user_id:user._id + "",status:3});
    if (lands.length <= 0 ){
         reply({
            "message":"没有需要收获的土地!",
            "statusCode":102,
            "status":false
        });
        return;
    }

    for (var index in lands) {
        var land = lands[index];
        // var land = await dao.findById(request,'land',request.params.id);
        await landService.updateGrowStataus(request,land);
        // land = await dao.findById(request,'land',request.params.id);
        // if (land.status != 3) {
        //     reply({
        //         "message":"土地还未成熟！",
        //         "statusCode":108,
        //         "status":false
        //     });

        //     return;
        // }
        var plant = await dao.findById(request,'plant',land.plt_id + "");
        var harvest = await dao.findOne(request,'harvest',{grow_id:land.grow_id + ""});
        if (!harvest) {
            break;
        }
        delete harvest.status;
        delete harvest.user_id;

        // console.log('harvest',harvest)
        // 收取掉落组装备
        if (harvest.props.length > 0) {
            for (var index in harvest.props) {
                    var prop = harvest.props[index];
                    var prop_id = prop._id + "";
                    var propId = prop.id; 
                    var propInHouse = await dao.findOne(request,'warahouse',{prop_id:prop._id + "",user_id:user._id + ""});
                    // console.log('33333',propInHouse);
                    if (propInHouse) {
                        await dao.updateIncOne(request,'warahouse',{_id:propInHouse._id + ""},{count:prop.count});
                    } else {
                        //prop进warahouse 除去_id、id增加prop_id、propId、user_id、username的全部信息
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
        }
        delete harvest.props;
        await dao.updateOne(request,'harvest',{_id:harvest._id + ""},{status:1});
        delete harvest._id;
        delete harvest.grow_id;
        delete harvest.land_id;
        delete harvest.land_code;
        // console.log('2222harvest',harvest);
        // 更新用户收益
        await dao.updateIncOne(request,'user',{_id:user._id + ""},harvest);
        // 更新土地
        await dao.updateOne(request,'land',{_id:land._id + ""},{status:1,free:1,plantTime:0,harvestTime:0,grow_id:"",plt_id:"",pltId:0});
    }
    reply({
        "message":"收获成功！!",
        "statusCode":101,
        "status":true
    });
}
// 分享土地
exports.shareLand = async function(request,reply){  
    var user = request.auth.credentials;
    var land = await dao.findById(request,'land',request.params.id);
    if (!land) {
        reply({
            "message":"土地不存在。",
            "statusCode":108,
            "status":false
        });
        return;
    }
    var landUlcCdt = await dao.findOne(request,'landUlcCdts',{code:land.code});
    if (landUlcCdt.type != 2) {
        reply({
            "message":"该土地无须分享解锁！",
            "statusCode":108,
            "status":false
        });
        return;
    }
    // // type 1 邀请解锁土地 2 普通分享 3 
    // var scene = "landUnlock-" + land.code;
    // var shareRecord = await dao.findOne(request,'shareRecord',{type:1,code:land.code,scene:scene});

    reply({
        "message":"该土地无须分享解锁！",
        "statusCode":108,
        "status":false
    });
    return;
}
// 根据合成记录返回植物解锁状态
exports.hasPlantsUpdate = async function (request,plants,user) { 
    for (var index in plants) {
        var plant = plants[index];
        var sdCbRecord = await dao.findOne(request,'sdCbRecord',{plt_id:plant._id + "",user_id:user._id + ""});
        if (sdCbRecord) {
            plant.unclockStatus = 2;// 0 未解锁 1 解锁中 2 已合成
        } else {
            var unclockCount = await dao.findCount(request,'sdUlkRecord',{plt_id:plant._id + "",user_id:user._id + ""});
            plant.hasUnlockTime = unclockCount;
            if (unclockCount > 0) {
                plant.unclockStatus = 1;
            } else {
                plant.unclockStatus = 0;
            }
        }
    
    }
}
exports.hasPlantUpdate = async function (request,plant,user) { 
    var sdCbRecord = await dao.findOne(request,'sdCbRecord',{plt_id:plant._id + "",user_id:user._id + ""});
    if (sdCbRecord) {
        plant.unclockStatus = 2;// 0 未解锁 1 解锁中 2 已合成
    } else {
        var unclockCount = await dao.findCount(request,'sdUlkRecord',{plt_id:plant._id + "",user_id:user._id + ""});
        plant.hasUnlockTime = unclockCount;
        if (unclockCount > 0) {
            plant.unclockStatus = 1;
        } else {
                plant.unclockStatus = 0;
        }
    }
}

exports.harvestDetail = async function (request,plant,user) {  
     // 计算额外掉落
    var dropGruops = await dao.find(request,'dropGroups',{id:plant.dropId});
    // console.log('1111111',dropGruops);
    var props = [];
    if (dropGruops.length > 0) {
        for (var index in dropGruops) {
            var group = dropGruops[index];
            // var sucRand = Math.random();
            // 掉落
            // if (sucRand <= group.rate) {
                // var count = Math.round(Math.random() * (group.max - group.min) + group.min);
                var prop = await dao.findOne(request,'prop',{id:group.propId});
                // console.log('222222',prop);
                if (prop) {
                    // prop.count = count;
                    props.push(prop);
                }
            // }
        }
    }
    plant.props = props;
}
exports.updateGrowStataus = async function (request,land) { 
    var time = new Date().getTime();
    if (land.status == 2) {
     
        if (time >= land.harvestTime) {
            land.status = 3;
            console.log('land.status == 3');
            await dao.updateOne(request,'land',{_id:land._id + ""},{status:3});
         }
    }

    // var plant = await dao.findById(request,'plant',land.plt_id + "");
    // console.log('plant.animationId',plant.animationId);

    if (land.status > 1) {
        if (land.animationId == null) {
            var plant = await dao.findOne(request,'plant',{_id:land.plt_id + ""});
            if (!plant) {
                return;
            }
            await dao.updateOne(request,"land",{_id:land._id + ""},{animationId:plant.animationId});
        }
    }
  
}
exports.updateUserLandGrows = async function (request,user) { 
    var lands = await dao.find(request,'land',{user_id:user._id + ""});
    if (lands.length > 0) {
        for (var index in lands) {
            var land = lands[index];
            await landService.updateGrowStataus(request,land);
        }  
    }
}

