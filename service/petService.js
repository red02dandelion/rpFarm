
const dao = require("../dao/dao");
var petService = require("../service/petService");
exports.dog = async function(request,reply){   
    var user = request.auth.credentials;
    await petService.addAllDogs(request);
    var dog = await dao.findOne(request,'dog',{user_id:user._id + ""});
    if(!dog) {
         reply({"message":"查询失败，未发现宠物！","statusCode":108,"status":false});
         return;
    }
    var dogSetting = await dao.findOne(request,'settingPetGrow',{class:dog.class});
    var dogInfo = await petService.updateDog(request,dog,dogSetting);
    console.log('dogInfo',dogInfo);
    reply({"message":"查询成功！","statusCode":101,"status":true,resource:dogInfo});
}
exports.addAllDogs = async function(request){
    var users = await dao.find(request,'user',{});
    var systemSet = await dao.findOne(request,"systemSet",{});
    for (var index in users) {
        var user = users[index];
        var dog = await dao.findOne(request,'dog',{user_id:user._id + ""});
        if (!dog) {
            var dog = {};
            dog.name = "哈士奇";
            dog.class = 1;
            dog.username = user.username;
            dog.user_id = user._id + "";
            dog.createTime = new Date().getTime();
            dog.bsd = systemSet.petMaxBsd;
            dog.updateTime = new Date().getTime();
            await dao.save(request,'dog',dog);
        }
    } 
    
}
exports.feedDog = async function(request,reply){   
    var user = request.auth.credentials;
    var systemSet = await dao.findOne(request,'systemSet',{});
    var dog = await dao.findOne(request,'dog',{user_id:user._id + ""});
    var dogDetail = await dao.findOne(request,'settingPetGrow',{class:dog.class});
    if (!dogDetail) {
        reply({"message":"缺少配置！","statusCode":102,"status":false});
        return;
    }

    var dogFeedCount = await dao.findCount(request,'dogFeedRecord',{dog_id:dog._id + "",dogClass:dog.class});
    if (dogFeedCount >= systemSet.nexClass_needFeed) {
        reply({"message":"请先升级！","statusCode":102,"status":false});
        return;
    }
    var warahouseA;
    var warahouseB;
    if (user.gold < dogDetail.feedGold) {
        reply({"message":"金币不足！","statusCode":102,"status":false});
        return;
    }
    if (dogDetail.needPropA != -1) {
        warahouseA = await dao.findOne(request,'warahouse',{propId:dogDetail.needPropA,user_id:user._id +"",count:{$gte:dogDetail.needACount}});
        if (!warahouseA) {
            reply({"message":"缺少狗粮！","statusCode":102,"status":false});
            return;
        }
    }
    if (dogDetail.needPropB != -1) {
        warahouseB = await dao.findOne(request,'warahouse',{propId:dogDetail.needPropB,user_id:user._id +"",count:{$gte:dogDetail.needBCount}});
        if (!warahouseB) {
            reply({"message":"缺少狗粮！","statusCode":102,"status":false});
            return;
        }
    }

    if (dogDetail.needPropA != -1 && warahouseA) { 
        await dao.updateIncOne(request,'warahouse',{_id:warahouseA._id + ""},{count:-dogDetail.needACount});
    }
    if (dogDetail.needPropB != -1 && warahouseB) { 
        await dao.updateIncOne(request,'warahouse',{_id:warahouseB._id + ""},{count:-dogDetail.needBCount});
    }
    await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:-dogDetail.feedGold});
    var gold = -dogDetail.feedDog;
    var goldUseRecord = {};
    goldUseRecord.username = user.username;
    goldUseRecord.user_id = user._id + "";
    goldUseRecord.type = 5; // 1 解锁种子 2 种植种子  3 升级人物  4 出售道具 5 喂狗
    goldUseRecord.goodsName = "喂狗";
    goldUseRecord.des = "喂狗";
    goldUseRecord.goods_id = "";
    goldUseRecord.gold =  gold;
    goldUseRecord.preBlance = user.gold;
    goldUseRecord.createTime = new Date().getTime();
    goldUseRecord.count = 1;
    user = await dao.findById(request,'user',user._id + "");
    goldUseRecord.afterBlance = user.gold;
    await dao.save(request,'goldUseRecord',goldUseRecord);
    
    // 增加宠物饱食度
    var bsd = (dog.bsd + systemSet.BsdAddPerFeed) > systemSet.petMaxBsd ? systemSet.petMaxBsd :(dog.bsd + systemSet.BsdAddPerFeed);
    await dao.updateOne(request,'dog',{_id:dog._id + ""},{bsd:bsd});
    var dogFeedCount = await dao.findCount(request,'dogFeedRecord',{dog_id:dog._id + "",dogClass:dog.class});
    var feedRecord = {};
    feedRecord.createTime = new Date().getTime();
    feedRecord.dog_id = dog._id + "";
    feedRecord.class = dog.class;
    feedRecord.username = user.username;
    feedRecord.nickname = user.nickname;
    feedRecord.user_id = user._id + "";
    await dao.save(request,'feedRecord',feedRecord);
    if (dogFeedCount >= systemSet.nexClass_needFeed && dogDetail.nexClassNeedProp == -1 && dogDetail.upGradeGold == 0) {
        await dao.updateIncOne(request,'dog',{_id:dog._id + ""},{class:1});
    }
    console.log('bsd',bsd);
    reply({"message":"喂养成功","statusCode":101,"status":true});
}
exports.upDog = async function(request,reply){    
    var user = request.auth.credentials; var systemSet = await dao.findOne(request,'systemSet',{});
    var dog = await dao.findOne(request,'dog',{user_id:user._id + ""});
    var dogDetail = await dao.findOne(request,'settingPetGrow',{class:dog.class});
    if (!dogDetail) {
        reply({"message":"缺少配置！","statusCode":102,"status":false});
        return;
    }
    var upDogDetail = await dao.findOne(request,'settingPetGrow',{class:dog.class + 1});
    if (!upDogDetail) {
        reply({"message":"已经满级无法升级了！","statusCode":102,"status":false});
        return;
    }
    var warahouseProp;
    if (user.gold < dogDetail.upGradeGold) {
        reply({"message":"金币不足！","statusCode":102,"status":false});
        return;
    }
    if (dogDetail.nexClassNeedProp != -1) {
        warahouseProp = await dao.findOne(request,'warahouse',{propId:dogDetail.nexClassNeedProp,user_id:user._id +"",count:{$gte:dogDetail.nexClassNeedCount}});
        if (!warahouseProp) {
            reply({"message":"缺少道具！","statusCode":102,"status":false});
            return;
        }
    }
    if (dogDetail.nexClassNeedProp != -1 && warahouseProp) { 
        await dao.updateIncOne(request,'warahouse',{_id:warahouseProp._id + ""},{count:-dogDetail.nexClassNeedProp});
    }
    await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:-dogDetail.feedGold});
    var gold = -dogDetail.upGradeGold;
    var goldUseRecord = {};
    goldUseRecord.username = user.username;
    goldUseRecord.user_id = user._id + "";
    goldUseRecord.type = 6; // 1 解锁种子 2 种植种子  3 升级人物  4 出售道具 5 喂狗 6 升级宠物
    goldUseRecord.goodsName = "升级宠物";
    goldUseRecord.des = "升级宠物";
    goldUseRecord.goods_id = "";
    goldUseRecord.gold =  gold;
    goldUseRecord.preBlance = user.gold;
    goldUseRecord.createTime = new Date().getTime();
    goldUseRecord.count = 1;
    user = await dao.findById(request,'user',user._id + "");
    goldUseRecord.afterBlance = user.gold;
    await dao.save(request,'goldUseRecord',goldUseRecord);

    await dao.updateIncOne(request,'dog',{_id:dog._id + ""},{class:1});
    reply({"message":"喂养成功","statusCode":101,"status":true});
}
exports.updateDog = async function(request,dog,dogDetail){
    var user = request.auth.credentials;
    var userGrowSetting = await dao.findOne(request,'settingUserGrow',{class:user.class});
    // console.log();
    var systemSet = await dao.findOne(request,'systemSet',{});
    var time = new Date().getTime();
    var minute = Math.round((time - dog.updateTime ) / 1000 / 60);
    var bsd = dog.bsd - minute * systemSet.petBsdRdcPerMin;
    bsd = bsd <= 0?0:bsd;
    var petDamage = dogDetail.damage;
    var damageRate = 1;
    if (bsd < systemSet.petDebuffThreshold) {
        petDamage = dogDetail.damage * systemSet.debuffCoefficient;
        damageRate = systemSet.debuffCoefficient;
    }
    console.log('userGrowSetting',userGrowSetting);
    var totalBaseDamage =  userGrowSetting.damage + petDamage; // 总伤害 = 人的伤害 + 宠物的实时伤害
    console.log('totalBaseDamage',totalBaseDamage);
    var ordernaryDamage = totalBaseDamage * (userGrowSetting.vitality + dogDetail.vitality) * systemSet.ordernaryDmgCoe; // 普通伤害 = 总伤害 * 总气质 * 全局普通伤害系数A；
    console.log('ordernaryDamage',ordernaryDamage);
    var crit_Damage = ordernaryDamage * dogDetail.crit_coefficient * systemSet.critDmgCoe; // 暴击伤害 = 普通伤害 * 宠物暴击系数 * 全局暴击伤害系数B；
    var dogInfo = {};
    dogInfo.damage = petDamage;    // 伤害
    dogInfo.baseDamage = dogDetail.damage;
    dogInfo.damageRate = damageRate;
    dogInfo.hp = dogDetail.hp; // 生命值
    dogInfo.vitality = dogDetail.vitality; // 气质
    dogInfo.crit_rate = dogDetail.crit_rate; // 暴击率
    dogInfo.crit_Damage = crit_Damage;  // 暴击伤害
    dogInfo.bsd = bsd;  // 饱食度
    dogInfo.ordernaryDamage = ordernaryDamage;
    dogInfo.class = dog.class;
    dogInfo.nexClass_needFeed = dogDetail.nexClass_needFeed;
    dogInfo.feedCount = await dao.findCount(request,'feedRecord',{dog_id:dog._id + "",class:dog.class}); //
    dogInfo.feedGold = dogDetail.feedGold;
    dogInfo.upGradeGold = dogDetail.upGradeGold;
    var spendProps = [];
    var dogFeedCount = await dao.findCount(request,'dogFeedRecord',{dog_id:dog._id + "",dogClass:dog.class});
    if (dogInfo.feedCount < dogInfo.nexClass_needFeed) {
        if (dogDetail.needPropA != -1) {
            var needPropA = {}; 
            var propA = await dao.findOne(request,'prop',{id:dogDetail.needPropA});
            needPropA.img = propA.img;
            needPropA.needCount = dogDetail.needACount;
            needPropA.hasCount = 0;
            var warahouseA = await dao.findOne(request,'warahouse',{propId:propA.id,user_id:user._id + ""});
            if (warahouseA) {
                needPropA.hasCount = warahouseA.count;
            }
            needPropA.hasCount = warahouseA.count;
            spendProps.push(needPropA);
        }
        if (dogDetail.needPropB != -1) {
            var needPropB = {}; 
            var propB = await dao.findOne(request,'prop',{id:dogDetail.needPropB});
            needPropB.img = propB.img;
            needPropB.needCount = dogDetail.needBCount;
            needPropB.hasCount = 0;
            var warahouseB = await dao.findOne(request,'warahouse',{propId:propB.id,user_id:user._id + ""});
            if (warahouseB) {
                needPropB.hasCount = warahouseB.count;
            }
        
            spendProps.push(needPropB);
        }

    } else {
        if (dogDetail.nexClassNeedProp != -1) {
            var needProp = {}; 
            var prop = await dao.findOne(request,'prop',{id:dogDetail.nexClassNeedProp});
            needProp.img = prop.img;
            needProp.needCount = dogDetail.nexClassNeedCount;
            needProp.hasCount = 0;
            var warahouseProp = await dao.findOne(request,'warahouse',{propId:prop.id,user_id:user._id + ""});
            if (warahouseProp) {
                 needProp.hasCount = warahouseProp.count;
            }
            spendProps.push(needProp);
        }
    }
    dogInfo.spendProps = spendProps;
    await dao.updateOne(request,'dog',{_id:dog._id + ""},{updateTime:time,bsd:bsd});
    console.log('dogInfo',dogInfo);
    return dogInfo;
}

// exports.updateDog = async function(request,dog,dogDetail){ 

// }

exports.getFighter = async function(request,user){ 
    var dog = await dao.findOne(request,'dog',{user_id:user._id + ""});
    if (!dog) {
        return null;
    }
    var dogSetting = await dao.findOne(request,'settingPetGrow',{class:dog.class});
    var dogInfo = await petService.updateDog(request,dog,dogSetting);
    var userSetting = await dao.findOne(request,'settingUserGrow',{class:user.class});
    var fighter = {};
    fighter.ordernaryDamage = dogInfo.ordernaryDamage;
    fighter.crit_Damage = dogInfo.crit_Damage;
    fighter.crit_rate = dogInfo.crit_rate + userSetting.crit_rate;
    fighter.hp = dogInfo.hp + userSetting.hp;
    fighter.user_id = user._id + "";
    fighter.username = user.username;
    return fighter;
}

exports.fight = async function(request,reply){
    
    var user = request.auth.credentials;
    var enemy = await dao.findById(request,'user',request.params.enemyId);
    if(!enemy) {
         reply({"message":"对手不存在！","statusCode":102,"status":false});
         return;
    }
    // 计算谁先手
    var myDog = await dao.findOne(request,'dog',{user_id:user._id + ""});
    var enemyDog = await dao.findOne(request,'dog',{user_id:enemy._id + ""});
    var firAttacker;
    if (myDog.class != enemyDog.class) {
        firAttacker = myDog.class >  enemyDog.class ? user : enemy;
    } else {
        if (user.class != enemy.class) {
            firAttacker = user.class > enemy.class ? user : enemy;
        } else {
            firAttacker = user;
        }
    }
    var myFighter = await petService.getFighter(request,user);
    var enemyFighter = await petService.getFighter(request,enemy);
    var process = [];
    var selfAttFlag = user.username == firAttacker.username ? 1 : 0;
    var fightProcess = await fightRound(request,myFighter,enemyFighter,process,selfAttFlag);
    console.log("fightProcess",fightProcess);
    if (fightProcess == null) {
         reply({"message":"战斗失败，胜负未分！","statusCode":102,"status":false});
         return;
    }
    var fightRecord = {};
    fightRecord.attacker = user.username;
    fightRecord.other = enemy.username;
    fightRecord.winner = fightProcess.winner;
    fightRecord.process = fightProcess.fightProcess;
    var result =  await dao.save(request,'fightRecord',fightRecord);
    
    reply({"message":"战斗结束！","statusCode":101,"status":true,resource:fightProcess});
}

exports.fightWithUser = async function(request,enemy){
    var user = request.auth.credentials;
    // 计算谁先手
    var myDog = await dao.findOne(request,'dog',{user_id:user._id + ""});
    var enemyDog = await dao.findOne(request,'dog',{user_id:enemy._id + ""});
    var firAttacker;
    if (myDog.class != enemyDog.class) {
        firAttacker = myDog.class >  enemyDog.class ? user : enemy;
    } else {
        if (user.class != enemy.class) {
            firAttacker = user.class > enemy.class ? user : enemy;
        } else {
            firAttacker = user;
        }
    }
    var myFighter = await petService.getFighter(request,user);
    var enemyFighter = await petService.getFighter(request,enemy);
    var process = [];
    var selfAttFlag = user.username == firAttacker.username ? 1 : 0;
    var fightProcess = await fightRound(request,myFighter,enemyFighter,process,selfAttFlag);
    console.log("fightProcess",fightProcess);
    if (fightProcess == null) {
        var fightRecord = {};
        fightRecord.status = false;
        return fightRecord;
    }
    var fightRecord = {};
    fightRecord.status = true;
    fightRecord.attacker = user.username;
    fightRecord.other = enemy.username;
    fightRecord.winner = fightProcess.winner;
    fightRecord.process = fightProcess.fightProcess;
    var result =  await dao.save(request,'fightRecord',fightRecord);
    console.log('result.ops[0]',result.ops[0]);
    return result.ops[0];
}

async function fightRound(request,myFighter,enemyFighter,fightProcess,selfAttFlag){ 
    console.log("fightProcess",fightProcess);
    var attacker = enemyFighter;
    var sufferer = myFighter;
    console.log("selfAttFlag",selfAttFlag);
    console.log("myFighter1111",myFighter);
    console.log("enemyFighter1111",enemyFighter);
    if (selfAttFlag === 1) {
        attacker = myFighter;
        sufferer = enemyFighter;
    }
    var crit_rand = Math.random();
    var realDamage = attacker.ordernaryDamage;
    if (crit_rand <= attacker.crit_rate) {
        realDamage = attacker.crit_Damage;
    }
    sufferer.hp = sufferer.hp - realDamage;
    console.log("myFighter1111",myFighter);
    console.log("enemyFighter1111",enemyFighter);
    
    var myFighterCopy = copy(myFighter);
    var enemyFighterCopy = copy(enemyFighter);
    var attackerCopy = copy(attacker);
    var suffererCopy = copy(sufferer);

    var process = {};
    process.realDamage = realDamage;
    process.selfFlag = selfAttFlag;
    process.myFighter = myFighterCopy;
    process.enemyFighter = enemyFighterCopy;
    process.attacker = attackerCopy;
    process.sufferer = suffererCopy;
    fightProcess.push(process);
    var process = {winner:attacker.username,fightProcess:fightProcess};
    console.log('process111',process);
    if (sufferer.hp <= 0) {
        console.log('process222',process);
        return process;
    } else {
        selfAttFlag = 1 - selfAttFlag;
        return await fightRound(request,myFighter,enemyFighter,fightProcess,selfAttFlag);
    }
}

function copy(obj){
    var newobj = {};
    for ( var attr in obj) {
        newobj[attr] = obj[attr];
    }
    return newobj;
}
// exports.fightRound = async function(request,myFighter,enemyFighter,fightProcess,selfAttFlag){ 
//     console.log("fightProcess",fightProcess);
//     var attacker = enemyFighter;
//     var sufferer = myFighter;
//     console.log("selfAttFlag",selfAttFlag);
//     console.log("myFighter1111",myFighter);
//     console.log("enemyFighter1111",enemyFighter);
//     if (selfAttFlag === 1) {
//         attacker = myFighter;
//         sufferer = enemyFighter;
//     }
//     var crit_rand = Math.random();
//     var realDamage = attacker.ordernaryDamage;
//     if (crit_rand <= attacker.crit_rate) {
//         realDamage = attacker.crit_Damage;
//     }
//     sufferer.hp = sufferer.hp - realDamage;
//     console.log("myFighter1111",myFighter);
//     console.log("enemyFighter1111",enemyFighter);
//     var process = {};
//     process.realDamage = realDamage;
//     process.selfFlag = selfAttFlag;
//     process.myFighter = myFighter;
//     process.enemyFighter = enemyFighter;
//     process.attacker = attacker;
//     process.sufferer = sufferer;
//     fightProcess.push(process);
//     var process = {winner:attacker.username,fightProcess:fightProcess};
//     console.log('process111',process);
//     if (sufferer.hp <= 0) {
//         console.log('process222',process);
//         return process;
//     } else {
//         selfAttFlag = 1 - selfAttFlag;
//         await petService.fightRound(request,myFighter,enemyFighter,fightProcess,selfAttFlag);
//     }
// }
