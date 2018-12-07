/**
 * 用户数据处理文件
 * Created by chenda on 2016/4/14.
 */
var uploadFile =require("./fileService");
const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");
var svgCaptcha = require('svg-captcha');
var userService = require("../service/userService");
var landService = require("../service/landService");
// var petService = require("../service/petService");
// var farmService = require("../service/farmService");
// var secretUtils = require("../service/secretUtils");
const settings = require('../settings');
var hosts = settings.host+":"+settings.hostPort;
const grouthService = require("../service/grouthService");
//  
exports.saveTest = async function(request,reply) { 
    for (var index = 1;index < 10;index ++){
        var testObjg = {};
        testObjg.name = index + "";
        testObjg.id = index;
        var saveRes = await dao.save(request,'test',testObjg);
        console.log('saveRes',saveRes.ops[0]);
    }
    reply('ojbk');
} 
exports.updateTest = async function(request,reply) { 
    var tests = await dao.find(request,'test',{});
    var test0 = tests[0];
    console.log('tests',tests);
    console.log('test0',test0);
    await userService.updateObj(request,test0);
    console.log('test0',test0);
    await userService.updateObjs(request,tests);
    console.log('tests',tests);
    // await userService.updateObj(test);
    var upadteAllRes = await dao.updateAll(request,'test',{},{up:"12313"});
    
    console.log('upadteAllRes',upadteAllRes);
    var upadteOneRes = await dao.updateOne(request,'test',{},{up:"12313"});
    console.log('upadteOneRes',upadteOneRes);
    
    reply('ojbk');
}
exports.updateObj = async function(request,obj) { 
   obj.id = 1000;                                   
}
exports.updateObjs = async function(request,objs) { 
   for (var index in objs) {
       var obj = objs[index];
       await userService.updateObj(request,obj);
   }
}
// 用户注册  
exports.rigister = async function(request,reply) { 

    var payload = request.payload;
    var findRes = await dao.find(request,'user',{username:request.payload.username});
    if (findRes.length > 0) {
        reply({status:false,statusCode:120,message:"用户名已存在"});
        return;
    }
    var friends = [];
    var parent;
    if (request.payload.parentUsername) {
        findRes = await dao.find(request,"user",{username:request.payload.parentUsername});
        if (findRes.length <= 0) {
            reply({status:false,statusCode:120,message:"推荐人账号不存在"});
            return;
        }
        parent = findRes[0];
        // console.log('parent is',parent);
        friends = [parent._id];
        var hasFriend = false;
        if (user.friends && user.friends.length > 0) {
            for (var index in user.friends) {
                var thatId = user.friends[index];
                if (thatId == parent._id) {
                    hasFriend = true;
                    break;
                }
            }
        }
        
        if (hasFriend == false) {
            //  互相添加好友
            var selfPushRes = await dao.updatePushOne(request,'user',{_id:user._id},{friends:parent._id});
            var ortherPushRes = await dao.updatePushOne(request,'user',{_id:parent._id},{friends:user._id});
        }
       
    }

    if  (request.payload.mobile ) {
        findRes = await dao.find(request,'user',{mobile:request.payload.mobile});
        if (findRes.length > 0) {
            reply({status:false,statusCode:120,message:"手机已注册"});
            return;
        }
  
    }
    var user = request.payload;
    user.password = CryptoJS.AES.encrypt(request.payload.password,"AiMaGoo2016!@.")+"";
    user.pay_password = CryptoJS.AES.encrypt(request.payload.pay_password,"AiMaGoo2016!@.")+"";
    user.sonsum = 0;         // 后代数量
    user.areca = 100000000;           // 金币数量
    user.state = 1;          // 账号状态
    user.buy_seed_sum = 0;   // 购买总值
    user.recharge_sum = 0;   // 充值总额
    user.withdraw_sum = 0;     // 提现总额
    user.createTime = new Date().getTime();
    user.scope = ["USER"];
    user.totalRevenue = 0;
    user.random = Math.random();
    user.friends = friends;
    user.warahouse = [];
    user.payPwdStatus = 0;
    // user.issteal = 1;

    var allUserResCount = await dao.findCount(request,'user');
    user.incno = allUserResCount + 1;
    var userSaveRes = await dao.save(request,"user",user);
    user = await dao.findOne(request,'user',{username:user.username});
    
    var areca_tree = {};
    // var 
    
    let dateTime = format1("yyyy/M/d",new Date());
        var todoyAdd = await dao.find(request,"userRecord",{createTime:format1("yyyy/M/d",new Date())});
        if(todoyAdd.length!=0){
            await dao.updateOne(request,"userRecord",{createTime:dateTime},{number:todoyAdd[0].number+1});
        }else{
            var addUserSum = {
                dateTime:new Date().getTime(),
                createTime:format1("yyyy/M/d",new Date()),
                number:1
            }
            await dao.save(request,"userRecord",addUserSum);
    }

    // var userSaveRes = await dao.save(request,"user",user);
    if (userSaveRes) {
         reply({"message":"注册成功","statusCode":101,"status":true,"data":user});
    }

}

//登录验证
exports.userLogin = async function(request,reply){
    var user = request.auth.credentials;
    delete user.password;
    delete user.token;
    delete user.raw_password;
    delete user.scope;
    delete user.hmac_password;
    // console.log('loginuser11111',user);
    // delete user.hmac_password;
    await userService.updateLandLockstatus(request,user);
    // await userService.updateFarmLockstatus(request,user);
    await landService.updateUserLandGrows(request,user);
    // await farmService.updateUserLandGrows(request,user);
    // await userService.updateTl(request);
    user.nextExe = await nextExe(request,user);
    var growSetting = await dao.findOne(request,'settingUserGrow',{class:user.class});
    if (growSetting) {
        user.needExe = growSetting.nex_exe;
    } else {
        // 所需经验为-1就是满级
        user.needExe = -1;
    }

    var afterSetting = await dao.findOne(request,'settingUserGrow',{class:user.class + 1});
    if (!afterSetting) {
          user.needExe = -1;
    }
    var lands = await dao.find(request,'land',{user_id:user._id + ""});
    // var farms = await dao.find(request,'farm',{user_id:user._id + ""});
    var cf = await dao.findOne(request,'systemSet',{});
    var landUlcCdts = await dao.find(request,'landUlcCdts',{},{},{code:1});
    // var farmUlcCdts = await dao.find(request,'farmUlcCdts',{},{},{code:1});
    var currentTime = new Date().getTime();
    var data = {
        user:user,
        lands:lands,
        // farms:farms,
        cf:cf,
        landUlcCdts:landUlcCdts,
        // farmUlcCdts:farmUlcCdts,
        currentTime:currentTime
    };
    reply({"message":"用户登陆成功","statusCode":101,"status":true,"resource":data});
}
//登录验证
exports.userAlibilty = async function(request,reply){
    var user = request.auth.credentials;
    var ability = await dao.findOne(request,'settingUserGrow',{class:user.class});
    reply({"message":"查询成功","statusCode":101,"status":true,"resource":ability});
}

exports.updateTl = async function(request){ 
    var user = request.auth.credentials;
    // console.log('user',user);
    var time = new Date().getTime();
    var tlSystemSet = await dao.findOne(request,'systemSet2',{});
    // 第一次进入游戏
    if (!user.updateTlTime) {
        // console.log('11111',{updateTlTime:time});
        // console.log('121212',{_id:user._id + ""});
        await dao.updateOne(request,'user',{_id:user._id + ""},{updateTlTime:time}); 
        // console.log('22222');
        return;
    }
    // console.log('33333');
    var ygRecoveryTime = Math.round((time - user.updateTlTime) / 100 / tlSystemSet.tlRecoverySecs);
    
    var afterTl = (user.power + ygRecoveryTime * tlSystemSet.tlRecoveryValue) > tlSystemSet.tlMax ? tlSystemSet.tlMax : (user.power + ygRecoveryTime * systemSet2.tlRecoveryValue);
   console.log('afterTl',afterTl);
    await dao.updateOne(request,'user',{_id:user._id + ""},{power:afterTl});
}
exports.serverUpto = async function(request,reply){
    var userid = request.params.userid;
    var token = request.params.token;
    // console.log('userid',userid);
    // console.log('token',token)
    var urllib = require('urllib');
    var url =  settings.host +  "jmmall.farm.userInfo.get";
    var urllib = require('urllib');
    var reqData = {
        "h": {
            "t": token,
            "c": userid
        },
        "d": {
            "a": 1
        }
    }
    urllib.request(url,{
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        data: JSON.stringify(reqData),
        timeout:20000,
    }, async function (err, data, res) {
    if (err) {
        // console.log('用户信息同步失败');
        // console.log('err',err);
        reply({"message":"用户信息同步失败","statusCode":102,"status":false});
        // throw err; // you need to handle error
        return;
    }

        // console.log(data.toString());
        var jsonData = JSON.parse(data);

    
        if (jsonData.c != 200) {
          
            reply({"message":"用户信息同步失败","statusCode":102,"status":false});
            return;
        }
       
        var appUser = jsonData.d;
        // console.log('appuser',appUser);
        var uptoUser = {};
        uptoUser.userid = appUser.userid;
        uptoUser.nickname = appUser.nikename;
        uptoUser.avatar = appUser.avatar;
        uptoUser.appLevel = appUser.level;
        uptoUser.token = token;
        // uptoUser.appLevel = appUser.appLevel;
        // 查询用户记录
        var usersRecords = await dao.find(request,'user',{userid:appUser.userid});
        var dbUser;
    // 如果没有用户记录
        if (usersRecords.length <= 0) {
            var user = uptoUser;
            var systemSet = await dao.findOne(request,'systemSet',{});
            var systemSet2 = await dao.findOne(request,'systemSet2',{});
            user.username = user.userid;
            user.hmac_password = CryptoJS.HmacMD5(appUser.userid,"paipai").toString();
            user.password = CryptoJS.AES.encrypt(user.hmac_password,"AiMaGoo2016!@.")+"";
            
            // 属性
            user.class = 1;  // 等级
            user.experience = 0;   // 经验值
            user.power = systemSet2.tlMax;     // 体力
            // 币种
            user.gold = systemSet.originGold; 
            user.dimond = 0; // 钻石
            user.plt_sessence = 0; // 植物精华
            user.hb = 0;
            // 信息
            user.addressed = 0;
            user.scope = ["USER"];
            user.createTime = new Date().getTime();
            await dao.save(request,'user',user);
            user = await dao.findOne(request,'user',{username:user.username});
            // console.log()
            dbUser = user;
            // 农场
            for (var index = 1;index < 13;index ++ ){
                var land = {};
                land.unlocked = 0;
                land.code = index;
                land.status = 0; // 0 未解锁 1 解锁闲置 2 生长中 3 已成熟
                land.user_id = user._id + "";
                land.username = user.username;
                land.nickname = user.nickname;
                await dao.save(request,'land',land); 
            }

            // 牧场
            for (var i = 1;i < 13;i ++ ){
                var land = {};
                land.unlocked = 0;
                land.code = i;
                land.status = 0; // 0 未解锁 1 解锁闲置 2 生长中 3 已成熟
                land.user_id = user._id + "";
                land.username = user.username;
                land.nickname = user.nickname;
                await dao.save(request,'farm',land); 
            }
            
            // await userService.updateLandLockstatus(request,user);
            let dateTime = format("yyyy-M-d",new Date());
            var todoyAdd = await dao.find(request,"userRecord",{createTime:format("yyyy-M-d",new Date())});
            if(todoyAdd.length != 0){
                await dao.updateOne(request,"userRecord",{createTime:dateTime},{number:todoyAdd[0].number+1});
            } else{
                var addUserSum = {
                    dateTime:new Date().getTime(),
                    createTime:format("yyyy-M-d",new Date()),
                    number:1
                }
                dao.save(request,"userRecord",addUserSum);
            
            }
        } else {
            var user = usersRecords[0];
            dbUser = user;
            var payload = uptoUser;
            await dao.updateOne(request,'user',{_id:user._id},payload); 
            for (var j = 1;j < 13;j ++ ){
                var farm = await dao.findOne(request,'farm',{user_id:user._id + "",code:j});
               console.log("farm",farm);
                if (!farm) {
                    var land = {};
                    land.unlocked = 0;
                    land.code = j;
                    land.status = 0;  // 0 未解锁 1 解锁闲置 2 生长中 3 已成熟
                    land.user_id = user._id + "";
                    land.username = user.username;
                    land.nickname = user.nickname;
                    await dao.save(request,'farm',land); 
                }
            }    
        }
        // console.log('user',user);
        // console.log('dbuser',dbUser);
        // await userService.updatePlantCbRecord(request,dbUser);
        // await userService.updateAnimalCbRecord(request,dbUser);
        var systemSet = await dao.findOne(request,'systemSet',{});
        var dog = await dao.findOne(request,'dog',{user_id:dbUser._id + ""});
        if (!dog) {
            var dog = {};
            dog.name = "哈士奇";
            dog.class = 1;
            dog.username = dbUser.username;
            dog.user_id = dbUser._id + "";
            dog.createTime = new Date().getTime();
            dog.bsd = systemSet.petMaxBsd;
            dog.updateTime = new Date().getTime();
            await dao.save(request,'dog',dog);
        }
        var req = require('urllib-sync').request;
        var path = settings.host + 'jmmall.farm.friendlist';
        var result = req(path,{
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                "h": {
                     "t": dbUser.token //当前登录用户token
                },
                "d": {
                    "a": 1,
                    "page": 1, //页码，从1开始
                    "pagesize": 1000000 //分页大小
                }
            }

            });
        var data = JSON.parse(result.data.toString());
        // console.log(data.result_list.length);
        console.log('data',data);
        if (data.c == 200 && data.d.l.length > 0) {
            for (var index in data.d.l) {
                var friendUser = data.d.l[index];
                console.log('index ',index)
                // console.log('friendUser',friendUser);
                var friend = await dao.findOne(request,'user',{username:friendUser.userid});
                if (friend) {
                    console.log('addFriend',friend);
                    var hasFriend = await dao.findOne(request,'friend',{username:dbUser.username,friend:friend.userid});
                    if (!hasFriend) {
                        var selfFriendAdd = {};
                        selfFriendAdd.username = dbUser.username;
                        selfFriendAdd.createTime = new Date().getTime();
                        selfFriendAdd.friend = friend.username;
                        selfFriendAdd.user_id = dbUser._id + "";
                        selfFriendAdd.friend_id = friend._id + "";
                        selfFriendAdd.gameFlag = 0;
                        await dao.save(request,'friend',selfFriendAdd);  
                    }
                    var hasMe = await dao.findOne(request,'friend',{username:friend.username,friend:dbUser.username});
                    if (hasMe == null) {
                        var parentFriendAdd = {};
                        parentFriendAdd.friend = dbUser.username;
                        parentFriendAdd.createTime = new Date().getTime();
                        parentFriendAdd.username = friend.username;
                        parentFriendAdd.friend_id = dbUser._id + "";
                        parentFriendAdd.user_id = friend._id + "";
                        parentFriendAdd.gameFlag = 0;
                        await dao.save(request,'friend',parentFriendAdd);
                    }
                }
                
            }
        }
        
        // 分享功能表
        
        // 先定需要查询的土地

        var path2 = settings.host + 'jmmall.farm.register.count';
        // var dse = JSON.stringify();
        var result2 = req(path2,{
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                "h": {
                     "t": dbUser.token //当前登录用户token
                },
                "d": {
                    "a": 1,
                    "scenes": ["landUnlock","game02"]
                }
            }

        });
        console.log('success111222',result2.data.toString());
        var data = JSON.parse(result2.data.toString());
        // console.log('success111222',data);
        reply({"message":"用户信息同步成功","statusCode":101,"status":true});
    });
}






// 更新土地解锁状态
exports.updateLandLockstatus = async function(request,user){ 
    var lands = await dao.find(request,'land',{user_id:user._id + "",unlocked:0,status:0});
    for (var index in lands ) {
        var land = lands[index];
        var ldClsSettings = await dao.findOne(request,'landUlcCdts',{landCode:land.code});
        if (ldClsSettings.cdtTpye == 1 ) { // 1 人物等级解锁 2 邀请好友解锁 3 钻石解锁
           if (user.class >= ldClsSettings.personClass) {
               await dao.updateOne(request,'land',{_id:land._id + ""},{unlocked:1,status:1});
           }
        } 
    }
}

// 更新土地解锁状态
exports.updateFarmLockstatus = async function(request,user){ 
    var lands = await dao.find(request,'farm',{user_id:user._id + "",unlocked:0,status:0});
    for (var index in lands ) {
        var land = lands[index];
        var ldClsSettings = await dao.findOne(request,'farmUlcCdts',{landCode:land.code});
        if (ldClsSettings.cdtTpye == 1 ) { // 1 人物等级解锁 2 邀请好友解锁 3 钻石解锁
           if (user.class >= ldClsSettings.personClass) {
               await dao.updateOne(request,'farm',{_id:land._id + ""},{unlocked:1,status:1});
           }
        } 
    }
}

// 更新植物解锁状态
exports.updatePlantCbRecord = async function(request,user){ 
    var plants = await dao.find(request,'plant',{free:1});
    if (plants.length > 0) {
        for (var index in plants) {
            var plant = plants[index];
            var cbRecord = await dao.findOne(request,'sdCbRecord',{plt_id:plant._id + "",user_id:user._id + ""});
            if (!cbRecord) {
                var cbRecord = {};
                cbRecord.user_id = user._id + "";
                cbRecord.plt_id = plant._id + "";
                cbRecord.createTime = new Date().getTime();
                await dao.save(request,'sdCbRecord',cbRecord);
            }
        }
    }
}

// 更新植物解锁状态
exports.updateAnimalCbRecord = async function(request,user){ 
    var plants = await dao.find(request,'animal',{free:1});
    if (plants.length > 0) {
        for (var index in plants) {
            var plant = plants[index];
            var cbRecord = await dao.findOne(request,'sdCbRecord',{plt_id:plant._id + "",user_id:user._id + ""});
            if (!cbRecord) {
                var cbRecord = {};
                cbRecord.user_id = user._id + "";
                cbRecord.plt_id = plant._id + "";
                cbRecord.createTime = new Date().getTime();
                console.log('cbRecord',cbRecord);
                await dao.save(request,'sdCbRecord',cbRecord);
            }
        }
    }
}
// 同步用户信息
exports.upto = async function(request,reply){
    var usersRecords = await dao.find(request,'user',{username:request.payload.username});
    // console.log('usersRecords is',usersRecords);
    // var md5Passwordtest = CryptoJS.HmacMD5(request.payload.username,"areca").toString();
    // console.log('md5Passwordtest is',md5Passwordtest);   
    // console.log('req payload is',request.payload);
    // console.log('req');
    // 更新步数信息
    var currentTime = new Date().getTime();
    var currentTimeDateTime = new Date(currentTime);
    var currentTimeTimeString = format(currentTimeDateTime);
    var today23clockFormatString = currentTimeTimeString.split(" ")[0] + " 23:59:59";
    var today23clockTimeStamp =  Date.parse(new Date(today23clockFormatString));
    var today24clockTimeStamp =  today23clockTimeStamp + 1000;
    var today00ClockTimeStamp = today24clockTimeStamp - 24 * 60 * 60 * 1000;
    const dayString = formatDateDay(currentTimeDateTime);

    var yesterday23clockTimeStamp  = today00ClockTimeStamp - 60 * 1000;
    var yesterday23DateTime = new Date(yesterday23clockTimeStamp);
    var yesterdayString = formatDateDay(yesterday23DateTime);
    if (request.payload.step) {
      
        // console.log('yesterdayString is ',yesterdayString);
        var stepRecord = await dao.findOne(request,'step',{username:areca.username,dayString:yesterdayString});
            if (stepRecord == null) {
                stepRecord = {};
                stepRecord.username = request.payload.username;
                stepRecord.yesterdayString = yesterdayString;
                stepRecord.createTime = currentTime;
                await dao.save(request,'step',stepRecord);
            } else {
                await dao.updateOne(request,'step',{_id:stepRecord._id},{step:request.payload.step});
            }

      }
    



    var serverFriends = [];
    if (usersRecords.length <= 0) {
        var user = request.payload;
        for (var index in user.friends) {
            var friend = user.friends[index];
            var serverUser = await dao.findOne(request,'user',{username:friend});
            //  console.log('friend is',friend);
            if (serverUser) {
                serverFriends.push(friend);
            }
        }
        user.friends = serverFriends;
        user.raw_password = CryptoJS.HmacMD5(request.payload.username,"areca").toString();
        user.password = CryptoJS.AES.encrypt(user.raw_password,"AiMaGoo2016!@.")+"";
        // user.password  = 
        // console.log(user.md5Password);
        user.areca = 0;
        // user.pay_password = CryptoJS.AES.encrypt(request.payload.pay_password,"AiMaGoo2016!@.")+"";
        // console.log('user is',user);
        user.scope = ["USER"];
        user.createTime = new Date().getTime();
        await dao.save(request,'user',user);
        user = await dao.findOne(request,'user',{username:user.username});
       
        var areca = {};
        areca.user_id = user.id + "";
        areca.createTime = new Date().getTime();
        areca.username = user.username;
        areca.nickname = user.nickname;
        areca.status = 1;
        areca.arecaCount = 9;
        areca.start_time = new Date().getTime();
        areca.grow_start_time = areca.start_time;
        areca.stealed = 0;
        await dao.save(request,'areca',areca);
        areca = await dao.findOne(request,'areca',{username:user.username});
        var grouth = {};
        grouth.areca_id = areca._id + "";
        grouth.areca = areca.arecaCount;
        grouth.username = user.username;
        grouth.createTime = new Date().getTime();
        grouth.start_time = new Date().getTime();
        grouth.grow_start_time = grouth.start_time;
        grouth.user_id = user._id + "";
        grouth.circle = 1;
        await dao.save(request,'grouth',grouth);
        grouth = await dao.findOne(request,'grouth',{username:user.username,createTime:grouth.createTime});
        await dao.updateOne(request,'areca',{_id:areca._id + ""},{grouth_id:grouth._id + "",circle:grouth.circle});
        
        var stepToCountRecord = {};
        stepToCountRecord.username = areca.username;
        stepToCountRecord.yesterdayString = yesterdayString;
        stepToCountRecord.arecaCount = 9;
        stepToCountRecord.createTime = new Date().getTime();
        await dao.save(request,'stepToCount',stepToCountRecord);
       
   
    } else {
        var user = usersRecords[0];
        var payload = request.payload;
        for (var index in user.friends) {
            var friend = user.friends[index];
            var serverUser = await dao.findOne(request,'user',{username:friend});
            if (serverUser) {
                serverFriends.push(friend);
            }
        }
        payload.friends = serverFriends;
        await dao.updateOne(request,'user',{_id:user._id},payload);
        
    }

     reply({"message":"用户信息同步成功","statusCode":101,"status":true});
}
// testInfo
exports.testInfo = async function(request,reply){  
    var username = request.params.username; 
    var testInfo =  await dao.findOne(request,'oldInfo',{username:username});
    // if (testInfo = )
    reply({"message":"获取成功","statusCode":101,"status":true,"resource":testInfo});
}
exports.putUser = async function(request,reply){   
    var user = request.auth.credentials;
    var apply = request.payload;
    if (apply.address) {
        apply.addressed = 1;
    }
    await dao.updateOne(request,'user',{_id:user._id},apply);
    reply({"message":"更新成功","statusCode":101,"status":true});
}
exports.putPassword = async function(request,reply){   
    var user = request.auth.credentials;

    var serverPwd = user.password;
    var decrptPwd = CryptoJS.AES.decrypt(serverPwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);;
    if (decrptPwd != request.payload.oldPwd) {
        reply({
                "message":"原密码输入错误",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    var newPassword = CryptoJS.AES.encrypt(request.payload.password,"AiMaGoo2016!@.")+"";
    await dao.updateOne(request,'user',{_id:user._id},{password:newPassword});
    reply({
                "message":"更改成功",
                "statusCode":101,
                "status":true
    });
}
exports.putPayPassword = async function(request,reply){   
    var user = request.auth.credentials;
    // console.log(request.payload);
    var serverPwd = user.pay_password;
    var decrptPayPwd = CryptoJS.AES.decrypt(serverPwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);;
    if (decrptPayPwd != request.payload.oldPwd) {
        reply({
                "message":"原密码输入错误",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    var newPassword = CryptoJS.AES.encrypt(request.payload.password,"AiMaGoo2016!@.")+"";
    await dao.updateOne(request,'user',{_id:user._id},{pay_password:newPassword,payPwdStatus:1});
    reply({
                "message":"更改成功",
                "statusCode":101,
                "status":true
    });
    
}
exports.friendInfo = async function(request,reply){  
    var user = request.auth.credentials;
    var friend = await dao.findById(request,'user',request.params.userId);
    delete friend.password;
    delete friend.pay_password;
    delete friend.friends;
    var areca = await dao.findOne(request,'areca',{username:friend.username});
    await grouthService.updateGrowStatus(request,areca);
    await grouthService.updateGrowInfo(request,areca);

    areca = await dao.findOne(request,'areca',{username:friend.username});
    // console.log('areca is',areca);
    // var arecaFruits = await dao.find(request,'arecaFruit',{grouth_id:areca.grouth_id});
    var data = {
        user:friend,
        areca:areca
      
    };
    
    reply({"message":"获取成功","statusCode":101,"status":true,"resource":data});
}

exports.iarecaCount = async function(request,reply){  
    // var user = request.auth.credentials;

    var user = await dao.findOne(request,'user',{username:request.payload.userId});

    var areca_count;
    if (user == null) {
        reply({"message":"用户未登录过游戏","statusCode":102,"status":false,"data":{areca_count:0}});
        return;
    }
    if (user.token == null) {
        reply({"message":"用户未登录过游戏","statusCode":102,"status":false,"data":{areca_count:0}});
        return;
    }
    var md5String = CryptoJS.MD5(request.payload.userId + user.token);
    if (md5String != request.payload.mac) {
        reply({"message":"mac校验失败","statusCode":102,"status":false,"data":{areca_count:0}});
        return;
    }
    // if (user.token != request.params.token) {
    //     reply({"message":"token验证错误","statusCode":102,"status":false,"data":{areca_count:0}});
    //     return;
    // }
    // delete user.password;
    // delete user.pay_password;
    // var areca = await dao.findOne(request,'areca',{username:friend.username});
    // await grouthService.updateGrowStatus(request,areca);
    // await grouthService.updateGrowInfo(request,areca);
    // areca = await dao.findOne(request,'areca',{username:user.username});
    
    // var arecaFruits = await dao.find(request,'arecaFruit',{grouth_id:areca.grouth_id});
    // var data = {
    //     user:friend,
    //     areca:areca
      
    // };
    
    reply({"message":"获取成功","statusCode":101,"status":true,"resource":{areca_count:user.areca}});
}
exports.tokenMd5 = async function(request,reply){  
    reply(CryptoJS.MD5(request.payload.userId + request.payload.token).toString());
}
// exports.userLands = async function(request,reply){
//     var friend = await dao.findById(request,'user',request.params.userId);
//     var lands = await dao.find(request,'land',{user_id:friend._id},{},{code:-1});
//     for (var index in lands) {
//         var land = lands[index];
//         await grouthService.updateGrowStatus(request,land);
//         await grouthService.updateGrowInfo(request,land);
//     }
//     lands = await dao.find(request,'land',{user_id:friend._id},{},{code:-1});
//     reply({"message":"获取成功","statusCode":101,"status":true,"resource":lands});
// }

exports.user_info = async function(request,reply){  

    var user = request.auth.credentials;

    // 更新狗狗和机器人
    if (user.robot == 1) {
        if (new Date().getTime() > user.robot_end_time) {
            await dao.updateOne(request,'user',{username:user.username},{robot:0});
        }
    }

    if (user.dogV == 1) {
        if (new Date().getTime() > user.dog_end_time) {
            await dao.updateOne(request,'user',{username:user.username},{dogV:0});
        }
    }

    var lands = await dao.find(request,'land',{user_id:user._id,type:request.params.type},{},{code:1});
    var system = await dao.findOne(request,'systemSet');
    
    var currentTimeStamp = new Date().getTime();
    var currentDateTime = new Date(currentTimeStamp);
    var currentFormatTimeString = format(currentDateTime);
    var today23clockFormatString = currentFormatTimeString.split(" ")[0] + " 23:59:59";
    var today23clockTimeStamp = Date.parse(new Date(today23clockFormatString));
    // land.conversed = 0;
    var conversed1 = 0;
    var conversed2 = 0;
    var conversed3 = 0;
    var lastConversed23dianTimeStamp1;
    var lastConversed23dianTimeStamp2;
    var lastConversed23dianTimeStamp3;
    // 计算三个园区是否养护
    switch (request.params.type) {
        case 1:
                if (user.lastConversed1Time) {
                var lastRipendDateTime = new Date(user.lastConversed1Time);
                var lastRipendFomatSting =  format(lastRipendDateTime);
                var lastRipendDay23dianFormatString = lastRipendFomatSting.split(" ")[0] + " 23:59:59";
                lastConversed23dianTimeStamp1 = Date.parse(new Date(lastRipendDay23dianFormatString));
                if (lastConversed23dianTimeStamp1 == today23clockTimeStamp) {
                    conversed1 = 1;
                }

            }
            break;
            case 2:
                if (user.lastConversed2Time) {
                var lastRipendDateTime = new Date(user.lastConversed1Time);
                var lastRipendFomatSting =  format(lastRipendDateTime);
                var lastRipendDay23dianFormatString = lastRipendFomatSting.split(" ")[0] + " 23:59:59";
                lastConversed23dianTimeStamp2 = Date.parse(new Date(lastRipendDay23dianFormatString));
                if (lastConversed23dianTimeStamp2 == today23clockTimeStamp) {
                    conversed2 = 1;
                }
            }
            break;
            case 3:
                if (user.lastConversed3Time) {
                var lastRipendDateTime = new Date(user.lastConversed1Time);
                var lastRipendFomatSting =  format(lastRipendDateTime);
                var lastRipendDay23dianFormatString = lastRipendFomatSting.split(" ")[0] + " 23:59:59";
                lastConversed23dianTimeStamp3 = Date.parse(new Date(lastRipendDay23dianFormatString));
                if (lastConversed23dianTimeStamp3 == today23clockTimeStamp) {
                    conversed3 = 1;
                }
            }
            break;
        default:
            break;
    }
    
    for (var index in lands) {
        var land = lands[index];

        // 处理每块宠物窝的状态
        if (land.status != 0) {
            // 如果当前时间还未到成熟期的一般 则为幼苗
            // console.log("land us ",land);
            // console.log('----宠物窝编号：',land.seed.seedday07);
            if (new Date().getTime() - land.plant_time < land.seed.seedday07 * 24 * 60 * 60 * 1000 / 2) {
                // console.log('----宠物窝编号：',land.code);
                //  console.log('----宠物窝状态：幼苗');
                land.status = 1;
                var updateStatusRes = await dao.updateOne(request,'land',{_id:land._id},{status:land.status});
                
            }
            var badday = land.seed.bad_day == -1?system.bad_day:land.seed.bad_day;
             // 如果当前时间已到成熟期的一半 但未成熟 则为中期
            if (new Date().getTime() - land.plant_time < land.seed.seedday07 * 24 * 60 * 60 * 1000   && new Date().getTime() - land.plant_time >=  land.seed.seedday07 * 24 * 60 * 60 * 1000 / 2) {
                // console.log('----宠物窝编号：',land.code);
                //  console.log('----宠物窝状态：中期');
                land.status = 2;
                var updateStatusRes = await dao.updateOne(request,'land',{_id:land._id},{status:land.status});
            }
            // 如果当前时间已超过成熟期 则为成熟
             if (new Date().getTime() - land.plant_time >= land.seed.seedday07 * 24 * 60 * 60 * 1000  ) {
                //   console.log('----宠物窝编号：',land.code);
                //  console.log('----宠物窝状态：成熟');
                land.status = 3;
                var updateStatusRes = await dao.updateOne(request,'land',{_id:land._id},{status:land.status});
            }
            // 如果超过一定天数未养护则枯萎
            var plantDateTime = new Date(land.plant_time);
            var plantTimeFomatSting =  format(plantDateTime);
	        var plantTim23dianFormatString = plantTimeFomatSting.split(" ")[0] + " 23:59:59";
	        var plantTimDay23dianTimeStamp = Date.parse(new Date(plantTim23dianFormatString));
            var expectConversCount;
            if (currentTimeStamp < plantTimDay23dianTimeStamp) {
		        expectConversCount = 1;
	        } else {
		        expectConversCount = parseInt((currentTimeStamp -  plantTimDay23dianTimeStamp) / (24 * 60 * 60 * 1000)) + 2;
            }
        
            if (expectConversCount -land.converse_count > badday) {
                land.status = 4;
                var updateStatusRes = await dao.updateOne(request,'land',{_id:land._id},{status:land.status});
            } 
        
        }
       
    }

    
    if (user.dogV == 1) {
        user.doghunger = 1;
        if (user.dogFeedTime) {
            if (new Date().getTime() - user.dogFeedTime < 1000 * 60 * 60 * 24 * 7) {
                user.doghunger = 0;
            }
        }
    }
    user.lands = lands;
    // console.log('user',user);
    reply({"message":"查询成功","statusCode":101,"status":true,"resource":user});
}
exports.searchUser = async function(request,reply) {  
    var user = request.auth.credentials;
    var friend = await dao.findOne(request,'user',{username:request.params.username});
    if (!friend) {
        reply({"message":"用户不存在","statusCode":102,"status":false});
        return;
    }
    reply({"message":"查询成功","statusCode":101,"status":true,"resource":friend});
}

exports.addFriend = async function(request,reply) { 
    var user = request.auth.credentials;
    var friend = await dao.findOne(request,'user',{username:request.params.username});
    if (!friend) {
         reply({"message":"用户不存在","statusCode":102,"status":false});
         return;
    }
    console.log('friend username is',friend.username);
    console.log('user username is',user.username);
    if (user.username == friend.username) {
        reply({"message":"不能添加自己为好友！","statusCode":102,"status":false});
        return;
    }
    var hasFriend = await dao.findOne(request,'friend',{username:user.username,friend:friend.username});;
    console.log(hasFriend);
    if (hasFriend) {
        reply({"message":"好友已经存在！","statusCode":102,"status":false});
        return;
    }

    var apllyList = await dao.find(request,'aplly',{from_id:user._id + "",status:0,to_id:friend._id + ""},{to_id:0,from_id:0},{createTime:-1});
    if (apllyList.length > 0) {
        reply({"message":"好友申请已存在，等待对方处理！","statusCode":102,"status":false});
        return;
    }
    var aplly = {};
    aplly.createTime = new Date().getTime();
    aplly.from = user.username;
    aplly.from_id = user._id + "";
    aplly.to = friend.username;
    aplly.to_id = friend._id + "";
    aplly.status = 0;
    aplly.from_nickname = user.nickname;
    aplly.to_nickname = friend.nickname;
    aplly.from_avatar = user.avatar;
    var saveres = await dao.save(request,'aplly',aplly);
    
    reply({"message":"申请已经发送","statusCode":101,"status":true});
}

exports.apllyList = async function(request,reply) { 
    var user = request.auth.credentials;
    var apllyList = await dao.find(request,'aplly',{to_id:user._id + "",status:0},{to_id:0,from_id:0},{createTime:-1});
    reply({"message":"查询成功","statusCode":101,"status":true,"resource":apllyList});
}

exports.receveFriend = async function(request,reply) {  
    var user = request.auth.credentials;
    var aplly = await dao.findById(request,'aplly',request.params.id);
    console.log('aplly',aplly);
    if (aplly == null) {
        reply({"message":"申请不存在","statusCode":102,"status":false});
        return;
    }
    var updateRes = await dao.updateOne(request,'aplly',{_id:request.params.id},{status:request.payload.status});
    if (request.payload.status == 1) {
        var friend = await dao.findOne(request,'user',{username:aplly.from});
        if (!friend) {
            reply({"message":"用户不存在","statusCode":102,"status":false});
            return;
        }
        console.log('friend username is',friend.username);
        console.log('user username is',user.username);
        if (user.username == friend.username) {
            reply({"message":"不能添加自己为好友！","statusCode":102,"status":false});
            return;
        }
        var hasFriend = await dao.findOne(request,'friend',{username:user.username,friend:friend.username});
        if (!hasFriend) {
            var selfFriendAdd = {};
            selfFriendAdd.username = user.username;
            selfFriendAdd.createTime = new Date().getTime();
            selfFriendAdd.friend = friend.username;
            selfFriendAdd.user_id = user._id + "";
            selfFriendAdd.friend_id = friend._id + "";
            selfFriendAdd.gameFlag = 1;
            await dao.save(request,'friend',selfFriendAdd); 
        }
        // console.log('1221122122');
        var hasMe = await dao.findOne(request,'friend',{username:friend.username,friend:user.username});
        if (hasMe == null) {
            var parentFriendAdd = {};
            parentFriendAdd.friend = user.username;
            parentFriendAdd.createTime = new Date().getTime();
            parentFriendAdd.username = friend.username;
            parentFriendAdd.friend_id = user._id + "";
            parentFriendAdd.user_id = friend._id + "";
            parentFriendAdd.gameFlag = 1;
            await dao.save(request,'friend',parentFriendAdd);
        }
        reply({"message":"添加成功","statusCode":101,"status":true});
    } else {
        reply({"message":"拒绝成功","statusCode":101,"status":true});
    }
    
}

exports.delFriend = async function(request,reply) {  
    var user = request.auth.credentials;
    var hasFriend = await dao.findOne(request,'friend',{username:user.username,friend:request.params.username});
    if (!hasFriend) {
        reply({"message":"好友不存在！","statusCode":102,"status":false});
        return;
    }
    if (hasFriend.gameFlag != 1) {
        reply({"message":"该好友无法删除！","statusCode":102,"status":false});
        return;
    }
    await dao.del(request,'friend',{_id:hasFriend._id + ""});
    var hasMe = await dao.findOne(request,'friend',{username:request.params.username,friend:user.username});
    if (hasMe) {
        await dao.del(request,'friend',{_id:hasMe._id + ""});
    }
    reply({"message":"删除成功！","statusCode":101,"status":true});

}
// 好友列表
exports.getUserFriend = async function(request,reply){
    var user = request.auth.credentials; 
    // user = await dao.findOne(request,'user',{username:user.username});
    var friends = await dao.find(request,'friend',{username:user.username + ""},{},{},request.params.size,request.params.page);
    var sum = await dao.findCount(request,'friend',{username:user.username + ""});
    var displayFriends = [];
    if (friends.length > 0) {
        for (var index in friends) {
            var curFriend = friends[index];
            var friend = await dao.findOne(request,'user',{username:curFriend.friend});
            if (friend) {
                // await userService.updateLandLockstatus(request,friend);
                friend.nextHavest = 0;
                friend.nextHavestTime = -1;
                friend.land_id = "";
                var lands = await dao.find(request,'land',{user_id:friend._id + "",$or:[{status:2},{status:3}]},{},{harvestTime:1});
                if (lands.length > 0) {
                    console.log('lands',lands);
                    var findStealRecord = await dao.findOne(request,'stealRecrod',{username:user.username,grow_id:lands[0].grow_id});
                    if (!findStealRecord) {
                        friend.nextHavestTime = lands[0].harvestTime;
                        friend.nextHavest = 1; 
                        friend.land_id = lands[0]._id + "";   
                    }               
                }
                displayFriends.push(friend);
            }
        }
    }
    console.log('displayFriends',displayFriends);
    reply({"message":"获取用户好友列表成功","statusCode":107,"status":true,"resource":displayFriends,sum:sum});
}
exports.friends1 = async function(request,reply) {
    var user = request.auth.credentials;
    //第一层
    var users = [];
    var users1 = await dao.find(request,"user",{"parentUsername":user.username,"state":1},{"password":0},{createTime:-1});
    // var one = await dao.findCount(request,"user",{"parentUsername":user.username,"state":1},{"password":0},{createTime:-1})

    var username1 = [];
    // var username2 = [];
    if(users1.length==0){
        reply({"message":"获取用户好友列表成功","statusCode":107,"status":true,"resource":[],"sum":0});
        return;
    }else{
       
       let list1 = users1.map(async(value)=>{
            value.generation = 1;
            username1.push(value.username);
            users.push(value);
        });
    }
    // 第二层
    var users2 = await dao.find(request,"user",{"parentUsername":{$in:username1},"state":1},{"password":0},{createTime:-1});
     var username2 = [];
    if(users2.length!=0){
        
       let list1 = users2.map(async(value)=>{
           value.generation= 2;
           username2.push(value.username);
           users.push(value);
        });
    }
    // username1.push(user.username);
    // 三代好友
    var users3 = await dao.find(request,"user",{"parentUsername":{$in:username2},"state":1},{"password":0},{createTime:-1});
    // var newDate = new Date(format("yyyy-M-d",new Date())).getTime();
    // var records = await dao.find(request,"growthRecord",{userId:user._id+"",createTime:{$gt:newDate}});
    // console.log(users);
    // console.log(records);
      if(users3.length!=0){
        
       let list1 = users3.map(async(value)=>{
           value.generation= 3;
           users.push(value);
        //    username2.push(value.username);
        });
    }
    
    var sum = await dao.findCount(request,"user",{"parentUsername":{$in:username1},"state":1});
    dao.updateOne(request,"user",{"_id":user._id+""},{sonSum:sum});
    if(users == null){
        reply({"message":"获取用户好友列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"获取用户好友列表成功","statusCode":107,"status":true,"resource":users,"sum":users.length});
    }
}

exports.teaFriends = async function(request,reply) {
    var user = request.auth.credentials;
    var sum = await dao.findCount(request,'user',{username:{$ne:user.username}});
    var findRes = await dao.find(request,'user',{username:{$ne:user.username}});
    if (sum <= 20) {
        for (var index in findRes) {
            var teaFriend = findRes[index];
            var ripeLands = await dao.find(request,'land',{status:3,user_id:teaFriend._id});
            if (ripeLands.length > 0) {
                teaFriend.hasMatrued = 1;
            } else {
                teaFriend.hasMatrued = 0;
            }
        }
        reply({"message":"获取茶友列表成功","statusCode":107,"status":true,"resource":findRes,"sum":findRes.length});
        return ;
    }

    var incnos = [];
    var arr = [];
    while(arr.length < 20){
        var bFlag = true;
        var number = Math.floor(Math.random()*findRes.length);
        if(arr.length == 0){
            arr.push(number);
        }
        for(var i=0;i<arr.length;i++){
            if(number == arr[i]){
                bFlag = false;
            }
        }
        if(bFlag){
            arr.push(number); 
        }
    }

    var teaFriends = await dao.find(request,'user',{incno:{$in:arr},username:{$ne:user.username}});
    for (var index in teaFriends) {
            var teaFriend = teaFriends[index];
            var ripeLands = await dao.find(request,'land',{status:3,user_id:teaFriend._id});
            if (ripeLands.length > 0) {
                teaFriend.hasMatrued = 1;
            } else {
                teaFriend.hasMatrued = 0;
            }
    }
    reply({"message":"获取茶友列表成功","statusCode":107,"status":true,"resource":teaFriends,"sum":teaFriends.length});
    return;

    var teaFriends = [];
    while (incnos.length < 20) { 
        var random = Math.random();
        var no = parseInt(findRes.length * random + 1);
        var randomUser = await dao.findOne(request,'user',{incno:no,username:{$ne:user.username},incno:{$nin:incnos}});
        if (randomUser != null) {
            teaFriends.push(randomUser);
            incnos.push(no);
        }
     }



    console.log('params is',request.params);
    var findRes = await dao.find(request,'user',{username:{$ne:user.username}});

    // if (findRes.length <= 20) {
       
        for (var index in findRes) {
            var teaFriend = findRes[index];
            console.log('teaFriend',teaFriend);
            console.log('---------req .request.params.lant_type',request.params.land_type);
            var ripeLands = await dao.find(request,'land',{status:3,user_id:teaFriend._id,type:request.params.land_type});
             console.log('ripelands',ripeLands);
            if (ripeLands.length > 0) {
                teaFriend.hasMatrued = 1;
            } else {
                teaFriend.hasMatrued = 0;
            }
        }
        reply({"message":"获取茶友列表成功","statusCode":107,"status":true,"resource":findRes,"sum":findRes.length});
        return ;
    // }
         
    var teaFriends = [];
    while (teaFriends.length < 20) {
        var random = Math.random();
        console.log("---random ",random);
        var no = parseInt(findRes.length * random + 1);
        console.log("---random inno ",no);
        var randomUser = await dao.findOne(request,'user',{incno:no,username:{$ne:user.username}});
        var hasUser = false;
        let list = teaFriends.map(async(value) =>{
            if (value._id == randomUser._id){
                hasUser = true;
            }
         });
        if (hasUser = false) {
            teaFriends.push(randomUser);
        }
    }
      console.log('ripelands',teaFriends);
    for (var index in teaFriends) {
        var teaFriend = teaFriends[index];
        console.log('teaFriend',teaFriend);
        var ripeLands = await dao.find(request,'land',{status:3,user_id:teaFriend._id,type:request.params.land_type});
        console.log('ripelands',ripeLands);
        if (ripeLands.length > 0) {
            teaFriend.hasMatrued = 1;
        } else {
            teaFriend.hasMatrued = 0;
        }
        // if (teaFriend.issteal == )
    }
    reply({"message":"获取茶友列表成功","statusCode":107,"status":true,"resource":findRes,"sum":findRes.length});
}

exports.randomTest = async function(request,reply) { 
    var arr = [];
    while(arr.length < 20){
        var bFlag = true;
        var number = Math.floor(Math.random()*20);
        if(arr.length == 0){
            arr.push(number);
        }
        for(var i=0;i<arr.length;i++){
            if(number == arr[i]){
                bFlag = false;
            }
        }
        if(bFlag){
            arr.push(number); 
        }
    }
    reply({arr:arr});
}

exports.buyVip = async function(request,reply) { 
    var user = request.auth.credentials;

    // 计算会员卡结束时间
    // var card_start_time = new Date().getTime();
    // var vipTime = request.payload.time * 24 * 60 * 60 * 1000 * 30;
    // if (user.vipLastTime) {
    //     if (user.vipLastTime > card_start_time) {
    //          card_start_time = user.vipLastTime;
    //     }  
    // }
    
    // 计算结束年份和月份
    var date = new Date(new Date().getTime());
    var currentYear = date.getFullYear();
    // for (var index = 0; index < array.length; index++) {
    //     var element = array[index];
        
    // }
    console.log("currrent year is",currentYear);
    var startYear;
    if (user.vipYear == null || user.vipYear < currentYear) {
        startYear = currentYear;
    } else {
        startYear = user.vipYear;
    }
    
    var currentMonth = date.getMonth() + 1;
    var startMonth;
    // 如果当前会员没有超过今年
    if (startYear == currentYear) {
    
        if (user.vipMonth == null || user.vipMonth < currentMonth) {
            startMonth = currentMonth;
        }
    } else {
        startMonth = user.vipMonth;
    }

    var endMonth = startMonth + request.payload.time;
    var endYears = startYear;
    if (endMonth > 12) {
        var years = Math.floor(endMonth / 12);
         console.log("years is",currentYear);
        endYears = startYear + years;
        endMonth = endMonth % 12;
        endMonth = endMonth == 0 ? 12:endMonth;
    }
    console.log("endYears is",endYears);
    var monthString =   (endMonth < 10) ? '0' + endMonth : endMonth;
    var endDate = endYears + "-" + monthString;
    // console.log("endDate is ",endDate);
    // console.log("year is",year);
    // year += 1;
    // console.log("year is",year);
    // var month = date.getMonth();
    // console.log("getMonth is",month);
    // month += 1;
    // console.log("getMonth is",month);
    // var vipYear = 0;
    // if (user.vipYear) {
    //     vipYear = user.vi
    // }

    var gold = 0;
    switch (request.payload.time) {
        case 1:
            gold = 10;
            break;
        case 3:
            gold = 28;
            break;
        case 6:
             gold = 55;
            break;
        case 12:
            gold = 100;
            break;
        default:
            break;
    }
    
    // 生成充值订单
    var vipCount = await dao.findCount(request,'vipRecord',vipRecord);
    var currentDateTime = new Date(new Date().getTime());
    var recharge_no = orderFormat(currentDateTime) + vipCount + "";
    // var card_end_time = card_start_time + vipTime; 
    var vipRecord = {};
    vipRecord.recharge_time = new Date().getTime();
    vipRecord.time = request.payload.time;
    vipRecord.username = user.username;
    // vipRecord.card_end_time = card_end_time;
    vipRecord.pay_status = 0;
    vipRecord.recharge_no = recharge_no;
    vipRecord.gold = gold;
    vipRecord.endMonth = endMonth;
    vipRecord.endYears = endYears;
    vipRecord.endDate = endDate;
    var saveRes = await dao.save(request,'vipRecord',vipRecord);

    var trancode;
    var path;
    var walletType = request.payload.walletType;
    console.log('request.payload.device',request.payload.device);
    switch (request.payload.device) {
        case 1:
            // 微信支付
            trancode = "SZZF014";
            walletType = 2;
            path = "payment/H5pagepay";
        break;
        
        case 2:
            // 二维码支付宝支付
            trancode = "SZZF004";
            walletType = 1;
            path = "payment/precreate";
           
        break;
         case 3:
            // 二维码支付
            trancode = "SZZF004";
            path = "payment/precreate";
           
        break;
        default:
            break;
    }

    // 请求支付
   
     var data = {
        merchantid:"210709",
        bizOrderNumber:recharge_no,
        srcAmt:gold,
        // srcAmt:0.01,
        redirectUrl:settings.host,
        notifyUrl:hosts + "/payStatus/vip",
        goods_desc:"购买Vip"  + request.payload.time + "个月",
        memo:"购买会员",
        tranCode:trancode,
        walletType:walletType,
        "merchantInput":"alice"
     };
    data = JSON.stringify(data);
    var device = request.payload.device;
    var nodeUrl = "http://payhub.shuzutech.com:8088/shuzu/" + path;
    secretUtils.shuzhu_pay(request,reply,data,nodeUrl,trancode,device);
    return;


    var phpData = {};
     phpData.data =  data;
     phpData.trancode = trancode;
     phpData.path = path;
    //  var php_json = JSON.encrypt();
    var cooperatorAESKey = "566af22e6f7e414d";
    var php_json = JSON.stringify(phpData);
    console.log('php json is ',php_json);

    var urllib = require('urllib');
    var path = 'http://47.92.88.214:5512';
    urllib.request(path, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        data: JSON.stringify(phpData),
        timeout:20000,
    },
    async function(err,data,res){

    var dataString = data.toString();
        console.log('------data  is ',dataString);
        var dataArr = dataString.split('/>');
        console.log('------dataArr  is ',dataArr);
        if (dataArr.length > 1) {
            dataString = dataArr[dataArr.length - 1];
            console.log('------after dataString  is ',dataString);
        }
        var jsonData = JSON.parse(dataString);
        console.log('------data reqcode  is ',jsonData.code);
            if (jsonData.code == "00000") {
                var data = JSON.parse(jsonData.data);
                jsonData.data = data;
                if (request.payload.device == 1) {
                    
                     jsonData.data.url   = "http://paymgmt.shuzutech.com/pay/redirect_pay.php?id=" + jsonData.data.id;
                    
                 } 
                if (request.payload.device == 2) {
                      jsonData.data.url = jsonData.data.qrcode;
                }
                console.log('--- jsonData.data',jsonData.data);
                reply({
                    "message":"已提交支付",
                    "statusCode":101,
                    "status":true,
                    "resource":jsonData.data
                })
            } else {

                reply({
                    "message":jsonData.resMsg,
                    "statusCode":102,
                    "status":false
                });
            }

        // console.log('------response err is ',err);
        // console.log('------response data is ',data.toString());
        // console.log('------response res is ',res);
    //      if(err) {
    //         console.log('err is ',err);
    //     } else { 
    //     var jsonData = JSON.parse(data);
        
    //     console.log('data is ',jsonData);
    //     console.log('jsonData.data is ',jsonData.data);
    //     if (jsonData.code == "00000") {
    //         reply({
    //             "message":"已提交支付",
    //             "statusCode":101,
    //             "status":true,
    //             "resource":jsonData.data
    //         })
    //     } else {
    //         reply({
    //             "message":jsonData.resMsg,
    //             "statusCode":102,
    //             "status":false
    //         });
    //     }
    // }
    

    // return;
    // console.log('------data reqcode  is ',jsonData.code);
    // reply({
    //     "message":"请求成功",
    //     "statusCode":101,
    //     "status":true,
    //     "data":data
    // });

        return;
        // var jsonData = JSON.parse(dataString);
        // console.log('------response jsonData is ',jsonData);
        //  console.log('data is ',data);
        //  console.log('res is ',res);
        // if(err) {
        //     console.log('err is ',err);
        // } else {
        //     var jsonData = data.toString();
        //     // var json = JSON.parse(jsonData);
        //     // var json = JSON.parse(json);
        //     console.log("jsonData is ",jsonData);
        //     // reply(json);

        //     // 对data进行解密
        // }
            
            //var json2 = JSON.parse(json.data);
            // if (json.state==false){
            //     await dao.updateOne(request,"tixianRecord",{_id:order._id+""},{status:3});
            //     var user =  await dao.findById(request,"user",order.userId);
            //      await dao.updateOne(request,"user",{_id:user._id+""},{withdrawGold:user.withdrawGold+order.number});
            //     reply({"message":json.msg,"message1":"请重新提现","statusCode":106,"status":false});
            // }else{
            //     dao.updateOne(request,"tixianRecord",{_id:order._id+""},{status:2});
            //     reply({"message":json.msg,"statusCode":105,"status":true});
            // }
     });

    return;
     

      

}
exports.vipStatus = async function(request,reply) {  
    var user = request.auth.credentials;
    var vipRecrod = await dao.findOne(request,'vipRecord',{username:user.username,recharge_no:request.params.order_no});
    if (vipRecrod == null) {
        reply({"message":"无此记录","statusCode":108,"status":false}); 
        return;
    }
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":vipRecrod});
}
exports.vipRechargeList = async function(request,reply) {
    var user = request.auth.credentials; 
    var vipRechargeList = await dao.find(request,'vipRecord',{username:user.username,pay_status:1},{},{recharge_time:-1});
    if (vipRechargeList.length <= 0) {
        reply({"message":"查询成功","statusCode":107,"status":true}); 
        return;
    } 
    reply({"message":"查询成功","statusCode":107,"status":true,resource:vipRechargeList}); 
}
exports.userwarahouse = async function(request,reply) {
   var user = request.auth.credentials;
    var warahouse = user.warahouse;
    if (warahouse == null || warahouse.length <= 0) {
         reply({"message":"仓库空空如也！","statusCode":107,"status":true});
         return ;
    }
    
    reply({"message":"查询成功！","statusCode":108,"status":true,"resource":warahouse,sum:warahouse.length});  

}

//添加用户
exports.updateUserClass = async function(request,reply,username) { 
    console.log('更新上级的会员等级2');
    var user = await dao.findOne(request,'user',{username:username});
    var systemSet = await dao.findOne(request,'systemSet');
    // var parent = await dao.findOne(request,'user',{username:user.parentUsername});
    var info  = "用户" + user.username + "的后代数为" + user.sonsum + "总收益为" + user.pureGoldRevenue + "购买总值" + user.buy_seed_sum; 
    console.log(info);
    // 如果上级是经理
    if (user.class_id == 2) {
        info = "用户" + user.username + "是经理"
        if (user.sonsum >= systemSet.JINGLI_NEED_SON_SUM && user.buy_goods_sum >= systemSet.JINGLI_NEED_REVANUE_SUM) {
            var calssParentClassId = await dao.updateOne(request,'user',{username:user.username},{class_id:3});
            var dynamicRecord = await dao.find(request,'dynamic',{username:username,type:5,class_id:3});
            if (dynamicRecord.length <=0 ) {
                var dynamic = {};
                dynamic.dynamic_time = new Date().getTime();
                dynamic.random = Math.random();
                dynamic.type = 5;
                dynamic.class_id = 3;
                dynamic.username = user.username;
                var saveRes = await dao.save(request,'dynamic',dynamic);
            }
        }
    } 
    // 如果上级是总监
    if (user.class_id == 3) {
        if (user.sonsum  >= systemSet.ZONGJIAN_NEED_SON_SUM && user.buy_goods_sum >= systemSet.ZONGJIAN_NEED_REVANUE_SUM) {
            var calssParentClassId = await dao.updateOne(request,'user',{username:user.username},{class_id:4});
            var dynamicRecord = await dao.find(request,'dynamic',{username:username,type:5,class_id:4});
            if (dynamicRecord.length <=0 ) {
                var dynamic = {};
                dynamic.dynamic_time = new Date().getTime();
                dynamic.random = Math.random();
                dynamic.type = 5;
                dynamic.class_id = 4;
                dynamic.username = user.username;
                var saveRes = await dao.save(request,'dynamic',dynamic);
            }
        }
    } 

}

// 更新出局信息
exports.updateOutStatus = async function(request,reply = {},username) { 
    var user = await dao.findOne(request,'user',{username:username});
    if (user == null) {
        return;
    }
    var sysSet = await dao.findOne(request,'systemSet',{});
    // FIRST_MONTH_OUT_START_QUOTA  FIRST_MONTH_10P_QUOTA FIRST_MONTH_20P_QUOTA
    var out_quota;
    if (0 <= user.sonSum_1stMon  &&  user.sonSum_1stMon < 10) {
        out_quota = sysSet.FIRST_MONTH_OUT_START_QUOTA;
    } else if (10 <= user.sonSum_1stMon && user.sonSum_1stMon < 20 ) {
        out_quota = sysSet.FIRST_MONTH_10P_QUOTA;
    } else if (50 <= user.sonSum_1stMon) {
        out_quota = sysSet.FIRST_MONTH_20P_QUOTA;
    } else {
        out_quota = sysSet.FIRST_MONTH_OUT_START_QUOTA;
    }
    var buy_goods_sum = 0;
    if (user.buy_goods_sum) {
        buy_goods_sum = user.buy_goods_sum;
    }
    out_quota += buy_goods_sum * 0.3;
    await dao.update(request,'user',{username:username},{out_quota:out_quota});
    if (user.pureGoldRevenue >= out_quota) {
        await dao.updateOne(request,'user',{username:username},{out_status:1});
    }
}

//添加用户
exports.addUser = async function(request,reply) {
    var credentials = request.auth.credentials;
    var user = request.payload;
    var users = await dao.find(request,"user",{username:user.username});
    var mobiles = await dao.find(request,"user",{mobile:user.mobile});
    var parentuser = await dao.find(request,"user",{username:user.parentUsername});
    var policy = await dao.find(request,"systemSet");
    var times = await dao.findById(request,"systemSet","5916eb0b80ddb01289f5b937");
    // console.log(credentials);
    // console.log(user.parentTranpwd);
    // console.log(credentials.tranpwd);
    // console.log(CryptoJS.AES.decrypt(credentials.tranpwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8));
    // if(request.payload.parentTranpwd){
    if(request.payload.parentTranpwd!=CryptoJS.AES.decrypt(credentials.tranpwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8)){
            reply({"message": "推荐人交易密码不正确，请重试！", "statusCode": 102, "status": false});
            return;
        }
    // }

    if(parentuser==0){
        reply({"message":"推荐用户不存在，请重新输入！","statusCode":102,"status":false});
        return;
    }
    if(users.length!=0){
        reply({"message":"用户名已存在，请重新输入！","statusCode":102,"status":false});
        return;
    }
    if(mobiles!=0){
        reply({"message":"此手机号已注册过，请重新输入手机号！","statusCode":102,"status":false});
        return;
    }
    user.createTime = new Date().getTime();
    user.lastTime = new Date(format("yyyy-M-d",new Date())).getTime();
    user.scope = ["USER"];
    user.password = CryptoJS.AES.encrypt(user.password,"AiMaGoo2016!@.")+"";
    user.tranpwd = CryptoJS.AES.encrypt(user.tranpwd,"AiMaGoo2016!@.")+"";
    if(user.parentUsername){
        if(credentials.landlord==0){
            if(credentials.gold<330){
                reply({"message":"开发新用户失败,葫芦不足!","statusCode":102,"status":false});
                return;
            }
        }else{
            if(credentials.gold<300){
                reply({"message":"开发新用户失败,葫芦不足!","statusCode":102,"status":false});
                return;
            }
        }
    }
    user.registerName = credentials.username;
    user.gold = 300;//初始金钱
    user.landlord = 0;//用户状态，0为普通用户，1为庄园主
    user.fertilizers = 0;//拆分收益
    user.splitSum = 0;//拆分总和
    user.fertilizerSums = 0;//喂养总和
    user.seed = 0;//种子数
    user.transactionSum = 0;//每日交易数量总和
    user.fertilizerStatus = 0;//喂养状态
    user.embattle = 0;//老君布阵状态，默认0，开启后为1
    user.stealTime = 0;//一键采蜜时间
    user.totalRevenue = 0;//总的收益
    user.totalSteal = 0;//采蜜总数
    user.monkeyTime = times.monkeyTime;//大圣来袭时间
    user.sonSum = 0;//后代人数
    var result = await dao.save(request,"user",user);
    if(result==null){
        reply({"message":"添加用户失败","statusCode":102,"status":false});
    }else{
        if(credentials.landlord==0){
            dao.updateOne(request,"user",{"_id":credentials._id+""},{gold:credentials.gold-330});
        }else{
            dao.updateOne(request,"user",{"_id":credentials._id+""},{gold:credentials.gold-300});
        }
        var seedRecord = {
            userId:parentuser[0]._id+"",
            sonName:user.name,
            createTime:new Date().getTime(),
            number : policy[0].seed,
            note : "您推荐了"+user.name+"加入福禄仙岛，获得"+policy[0].seed+"颗种子！",
        }
        await dao.save(request,"seedRecord",seedRecord);
        let dateTime = format("yyyy-M-d",new Date());
        var todoyAdd = await dao.find(request,"userRecord",{createTime:format("yyyy-M-d",new Date())});
        if(todoyAdd.length!=0){
            await dao.updateOne(request,"userRecord",{createTime:dateTime},{number:todoyAdd[0].number+1});
        }else{
            var addUserSum = {
                createTime:format("yyyy-M-d",new Date()),
                number:1
            }
            await dao.save(request,"userRecord",addUserSum);
        }
        //addparentNumber(request,activate.refereeid,true);
        dao.updateOne(request,"user",{"_id":parentuser[0]._id+""},{seed:parentuser[0].seed+policy[0].seed});
        addparentNumber(request,parentuser[0].username,true);
        reply({"message":"注册成功","statusCode":101,"status":true});
    }
}
//删除用户
exports.delUser = async function(request,reply){
    var user  = await dao.findById(request,'user',request.params.id);
    if (user == null) {
         reply({"message":"用户不存在","statusCode":102,"status":false});
    }
    var result = await dao.del(request,"user",{"_id":request.params.id});
    var plant = await dao.find(request,"land",{"user_id":request.params.id});
    for (var i = 0; i < plant.length; i++) {
        await dao.del(request,"land",{user_id:request.params.id});
    }
    if(result==null){
        reply({"message":"删除用户失败","statusCode":102,"status":false});
    }else{
        reply({"message":"删除用户成功","statusCode":101,"status":true});
    }
}
// 更新用户
exports.upgrade = async function(request,reply){
    var user = request.auth.credentials;
    // 下一级所需总经验
    var next_exe = await nextExe(request,user);
    var beforeSetttings = await dao.findOne(request,'settingUserGrow',{class:user.class});
    var afterSettings = await dao.findOne(request,'settingUserGrow',{class:user.class + 1});
     if (!beforeSetttings) {
        reply({"message":"已经满级无需升级！","statusCode":102,"status":false});
        return ;
    }
    if (!afterSettings) {
        reply({"message":"已经满级无需升级！","statusCode":102,"status":false});
        return ;
    }
    if (user.gold < beforeSetttings.upGradeGold) {
         reply({"message":"金币不足","statusCode":102,"status":false});
         return;
    }
    // 增加注释
    var systemSet  = await dao.findOne(request,'systemSet',{});
    if (user.class >= systemSet.userClassLimit) {
        var dog = await dao.findOne(request,'dog',{user_id:user._id + ""});
        if (dog) {
            if (user.class - dog.class >= systemSet.petMaxGrater) {
                reply({"message":"人物不得大于宠物" + systemSet.petMaxGrater + "级！","statusCode":102,"status":false});
                return ;
            }
        }
    }
    if (user.experience > next_exe) {
        await dao.updateIncOne(request,'user',{_id:user._id + ""},{class:1});
        await dao.updateIncOne(request,'user',{_id:user._id + ""},{gold:-beforeSetttings.upGradeGold});

        var goldUseRecord = {};
        goldUseRecord.username = user.username;
        goldUseRecord.user_id = user._id + "";
        goldUseRecord.type = 3; // 1 解锁种子 2 种植种子  3 升级人物  4 出售道具 
        goldUseRecord.goodsName = "人物升级";
        goldUseRecord.des = "人物升级";
        goldUseRecord.goods_id = "";
        goldUseRecord.gold =  -beforeSetttings.upGradeGold;
        goldUseRecord.preBlance = user.gold;
        goldUseRecord.createTime = new Date().getTime();
        goldUseRecord.count = 1;
        user = await dao.findById(request,'user',user._id + "");
        goldUseRecord.afterBlance = user.gold;
        await dao.save(request,'goldUseRecord',goldUseRecord);
        
        await userService.updateLandLockstatus(request,user);
        var beforeData = {class:user.class - 1,setting:beforeSetttings};
        var afterData = {class:user.class,setting:afterSettings};
        console.log('datas',[beforeData,afterData]);
        // 添加dw 
        reply({"message":"升级成功！","statusCode":101,"status":true,resource:[beforeData,afterData]});
    } else {
        reply({"message":"经验还不够升级！","statusCode":102,"status":false});
    }
}
//更新用户
exports.updateUser = async function(request,reply){
    var user = await dao.findById(request,"user",request.params.id);
    // console.log(request.payload);
    // console.log(CryptoJS.AES.decrypt(user.tranpwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8));
    //查找手机号是否有重复
    var statusCode = 101;
    if(request.payload.mobile){
        if(user.username != request.payload.username){
            var findeUser = await dao.findOne(request,"user",{"username":request.payload.username});
            if(findeUser!=null) {
                reply({"message": "该账号已被注册！", "statusCode": 102, "status": false});
                return;
            }
        }
    }
    // console.log(CryptoJS.AES.decrypt(user.tranpwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8));
    if(request.payload.oldpwd){
        if(request.payload.oldpwd!=CryptoJS.AES.decrypt(user.pay_password,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8)){
            reply({"message": "原交易密码不正确，请重试！", "statusCode": 102, "status": false});
            return;
        }
    }
    if(request.payload.state==0){
            await dao.updateOne(request,"user",{"_id":request.params.id},{scope:"[]"});
        }else{
            await dao.updateOne(request,"user",{"_id":request.params.id},{scope:["USER"]});
        }
    if(request.payload.password){
        statusCode = 105;
        request.payload.password = CryptoJS.AES.encrypt(request.payload.password,"AiMaGoo2016!@.")+"";
    }
    if(request.payload.pay_password){
        request.payload.pay_password = CryptoJS.AES.encrypt(request.payload.pay_password,"AiMaGoo2016!@.")+"";
    }
    var result = await dao.updateOne(request,"user",{"_id":request.params.id},request.payload);
    if(result==null){
        reply({"message":"更新用户失败","statusCode":102,"status":false});
    }else{
        reply({"message":"更新用户成功","statusCode":statusCode,"status":true});
    }
}

// exports.updatePwd = async function(request,reply){ 



//获取某个user
exports.getUser = function(request,reply){
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

    db.collection('user').findOne({"_id":new ObjectID(request.params.id)},{"password":0},function(err,result){
        if(err){
            request.server.log(['error'],err);
            throw err;
            reply({"message":"查找用户失败","statusCode":108,"status":false});
        }else{
            reply({"message":"查找用户成功","statusCode":107,"status":true,"resource":result});
        }
    });
}




//获取userlist
exports.getUserList = async function(request,reply){
    //列表
    var data = await dao.find(request,"user",{},{"password":0},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"user",{});

    if(data == null){
        reply({"message":"查找用户列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找用户列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

// //获取用户好友列表
// exports.getUserFriends = async function(request,reply){
//     var user = request.auth.credentials;
//     //第一层
//     var users1 = await dao.find(request,"user",{"parentUsername":user.username,"state":1},{"password":0},{createTime:-1});
//     var one = await dao.findCount(request,"user",{"parentUsername":user.username,"state":1},{"password":0},{createTime:-1});
//     //第二层
//     var username1 = [];
//     var username2 = [];
//     if(users1.leng==0){
//         reply({"message":"获取用户好友列表成功","statusCode":107,"status":true,"resource":[],"sum":0});
//         return;
//     }else{
//        let list1 = users1.map(async(value)=>{
//             username1.push(value.username);
//         });
//     }
//     // //第三层
//     // var users2 = await dao.find(request,"user",{"parentUsername":{$in:username1},"state":1},{"password":0},{createTime:-1});
//     //  if(users2.leng!=0){
//     //    let list1 = users2.map(async(value)=>{
//     //         username1.push(value.username);
//     //     });
//     // }
//     username1.push(user.username);
//     var users = await dao.find(request,"user",{"parentUsername":{$in:username1},"state":1},{"password":0},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
//     var newDate = new Date(format("yyyy-M-d",new Date())).getTime();
//     var records = await dao.find(request,"growthRecord",{userId:user._id+"",createTime:{$gt:newDate}});
//     // console.log(users);
//     // console.log(records);
//     var sum = await dao.findCount(request,"user",{"parentUsername":{$in:username1},"state":1});
//     dao.updateOne(request,"user",{"_id":user._id+""},{sonSum:sum});
//     if(users == null){
//         reply({"message":"获取用户好友列表失败","statusCode":108,"status":false});
//     }else{
//         reply({"message":"获取用户好友列表成功","statusCode":107,"status":true,"resource":users,records,"sum":sum,one});
//     }
// }

//搜索用户好友列表
exports.getSearchFriendsList = async function(request,reply){
    var user = request.auth.credentials;
    //列表
    var data = await dao.find(request,"user",{"parentId":user._id+"",$or:[{"username":eval("/"+request.payload.keyword+"/")},{"name":eval("/"+request.payload.keyword+"/")},{"mobile":eval("/"+request.payload.keyword+"/")}]},{"password":0},{});
    if(data == null){
        reply({"message":"搜索用户好友列表","statusCode":108,"status":false});
    }else{
        reply({"message":"搜索用户好友列表","statusCode":107,"status":true,"resource":data});
    }
}

//搜索厂家商家列表
exports.getSearchList = async function(request,reply){
    //列表
    var data = await dao.find(request,"user",request.payload.where,{"password":0},{},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"user",request.payload.where);

    if(data == null){
        reply({"message":"搜索资源列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"搜索资源列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}//搜索厂家商家列表
exports.getOrderList = async function(request,reply){
    //列表
    console.log(request.payload.where);
    var data = await dao.find(request,"user",{},{"password":0},request.payload.where,parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"user",request.payload.where);

    if(data == null){
        reply({"message":"搜索资源列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"搜索资源列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//搜索厂家商家列表
exports.getSearchList = async function(request,reply){
    //列表
    var data = await dao.find(request,"user",request.payload.where,{"password":0},{},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"user",request.payload.where);

    if(data == null){
        reply({"message":"搜索资源列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"搜索资源列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//偷取用户葫芦
exports.stealUser = async function(request,reply){
    var user = request.auth.credentials;
    var result = await dao.findById(request,"user",request.params.id);
    var newDate = new Date(format("yyyy-M-d",new Date())).getTime();
    var records = await dao.find(request,"growthRecord",{userId:user._id+"",friendId:result._id+"",createTime:{$gt:newDate}});
    if(records.length!=0){
        reply({"message":"换一个好友吧，每个好友一天只能采一次哦！","statusCode":108,"status":false});
        return;
    }
    var friendPlant=await dao.find(request,"plant",{userId:result._id+""});
    var plantSum=0;
        for (var i = 0;i <friendPlant.length;i++){
            plantSum=plantSum+friendPlant[i].plantearnings;
        }
    //dao.updateOne(request,"user",{"_id":result._id+""},{gold:0});
    if(result.parentUsername==user.username){
        var gold = Math.floor(plantSum*0.1*100)/100;
    }else{
        if(user.remdNumber>=5){
        var gold = Math.floor(plantSum*0.05*100)/100;
        }else{
            reply({"message":"您还没有推荐够5位好友，不能偷取二代好友的葫芦！","statusCode":108,"status":false});
            return; 
        }
    }
    if(gold>0){
        var growthRecord = {
            userId:user._id+"",
            createTime:new Date().getTime(),
            number : gold,
            note : "对"+result.name+"的仙岛采蜜成功，获得"+gold+"个葫芦！",
            friendId:result._id+"",
            friendName:result.username
        }

        dao.updateOne(request,"user",{"_id":user._id+""},{gold:user.gold+gold,totalRevenue:user.totalRevenue+gold,totalSteal:user.totalSteal+gold});
        dao.save(request,"growthRecord",growthRecord);
        reply({"message":"采蜜成功，获得"+gold+"个葫芦！","statusCode":107,"status":false,gold:gold});
        return;
    }else{
        reply({"message":"此玩家还没有产生收益！","statusCode":108,"status":false});
        return;
    }
 } 
 //一键采蜜
exports.allStealUser = async function(request,reply){
    var user = request.auth.credentials;
    if(user.stealTime == 0){
        reply({"message":"您还没有订购一键采蜜，请点击一键采蜜按钮订购一键采蜜","statusCode":108,"status":false});
        return;
    }
    if(user.lastTime-user.stealTime>2592000000){
        await dao.updateOne(request,"user",{"_id":user._id+""},{stealTime:0});
        reply({"message":"您的一键采蜜已到期，如您需要，请重新订购","statusCode":108,"status":false});
        return;
    }
    //第一层
    var users1 = await dao.find(request,"user",{"parentUsername":user.username,"state":1},{"password":0},{createTime:-1});
    //第二层
    var username1 = [];
    if(users1.leng==0){
        reply({"message":"获取用户好友列表成功","statusCode":107,"status":true,"resource":[],"sum":0});
        return;
    }else{
       let list1 = users1.map(async(value)=>{
        username1.push(value.username);
    }); 
   }
    username1.push(user.username);
    //console.log(username1);
    var users = await dao.find(request,"user",{"parentUsername":{$in:username1},"state":1},{"password":0},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var newDate = new Date(format("yyyy-M-d",new Date())).getTime();
    //console.log(newDate);
    var records = await dao.find(request,"growthRecord",{userId:user._id+"",createTime:{$gt:newDate},number:{$gt:0}/*,createTime:{$lt:newDate+86400000}*/});
    //console.log(records);
    var recordName=[];
    var list2 = records.map(async(value)=>{recordName.push(value.friendName)});
    var userTwo = await dao.find(request,"user",{"parentUsername":{$in:username1},"username":{$nin:recordName},"state":1,"fertilizerStatus":1},{"password":0},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //console.log(recordName);
    //console.log(userTwo);
    //console.log(userTwo);
    // if(userTwo == 0){
    //     reply({"message":"您暂时没有可偷取的好友！","statusCode":102,"status":false});
    //     return;
    //}else{
    var aa="";
    var plantSums=0;
       // console.log(users.length);
       for (var i = 0;i <userTwo.length;i++){
        aa=userTwo[i]._id+"";
        var plantSum=0;
        var friendPlant=await dao.find(request,"plant",{"userId":aa});
        //console.log(friendPlant.length);
        for (var j = 0;j <friendPlant.length;j++){
            plantSum=plantSum+friendPlant[j].plantearnings;
            //await dao.updateOne(request,"user",{"_id":aa},{fertilizerStatus:0})
        } 
        var result = await dao.findById(request,"user",aa);  
        if(result.parentUsername==user.username){
            plantSum=Math.floor(plantSum*0.1*100)/100;
        }else{
            if(user.remdNumber>=5){
                plantSum=Math.floor(plantSum*0.05*100)/100;
            }else{
                plantSum=0; 
            }
        }
        //console.log(plantSum);
        if (plantSum>0){
            var growthRecord = {
                userId:user._id+"",
                createTime:new Date().getTime(),
                number : plantSum,
                note : "对"+result.name+"的仙岛采蜜成功，获得"+plantSum+"个葫芦！",
                friendName:result.username,
                friendId:result._id+""
            }
            dao.save(request,"growthRecord",growthRecord);
         }
        plantSums=plantSums+plantSum;
    }
    if(plantSums == 0){
        reply({"message":"您没有可采蜜的好友！","statusCode":108,"status":false});
        return;
    }
    dao.updateOne(request,"user",{"_id":user._id+""},{gold:user.gold+plantSums,totalRevenue:user.totalRevenue+plantSums,totalSteal:user.totalSteal+plantSums});
    reply({"message":"采蜜成功，获得"+Math.floor(plantSums*100)/100+"个葫芦！","statusCode":107,"status":false,plantSums:plantSums});
}
 //订购一键采蜜
 exports.shopStealUser = async function(request,reply){
    var user = request.auth.credentials;
    console.log(user);
    if(user.stealTime !=0){
        reply({"message":"您已经购买过了无需重复购买","statusCode":108,"status":false});
        return;
    }else if(user.gold<30){
        reply({"message":"购买失败,您的葫芦不足！","statusCode":102,"status":false});
            return;
    }else{
        var time = new Date().getTime();
        await dao.updateOne(request,"user",{"_id":user._id+""},{gold:user.gold-30,stealTime:time});
        reply({"message":"购买成功！","statusCode":101,"status":true,stealTime:time});
        //setTimeout(await dao.updateOne(request,"user",{"_id":user._id+""},{stealTime:0}),2592000000)
    }
}
//后台添加用户
exports.addAdminUser = async function(request,reply){
    var credentials = request.auth.credentials;
    var user = request.payload;
    var users = await dao.find(request,"user",{username:user.username});
    var mobiles = await dao.find(request,"user",{mobile:user.mobile});
    if(users.length!=0){
        reply({"message":"用户名已存在，请重新输入！","statusCode":102,"status":false});
        return;
    }
    if(mobiles!=0){
        reply({"message":"此手机号已注册过，请重新输入手机号！","statusCode":102,"status":false});
        return;
    }
    user.createTime = 1464246000000;
    user.lastTime = new Date(format("yyyy-M-d",new Date())).getTime();
    user.scope = ["USER"];
    user.password = CryptoJS.AES.encrypt(user.password,"AiMaGoo2016!@.")+"";
    user.tranpwd = CryptoJS.AES.encrypt(user.tranpwd,"AiMaGoo2016!@.")+"";
    user.gold = 300;//初始金钱
    user.landlord = 0;//用户状态，0为普通用户，1为庄园主
    user.fertilizers = 0;//拆分收益
    user.splitSum = 0;//拆分总和
    user.fertilizerSums = 0;//喂养总和
    user.seed = 0;//种子数
    user.transactionSum = 0;//每日交易数量总和
    user.fertilizerStatus = 0;//喂养状态
    user.embattle = 0;//老君布阵状态，默认0，开启后为1
    user.stealTime = 0;//一键采蜜时间
    user.totalRevenue = 0;//总的收益
    user.totalSteal = 0;//采蜜总数
    user.monkeyTime = 0;//大圣来袭时间
    var result = await dao.save(request,"user",user);
    if(result==null){
        reply({"message":"添加用户失败","statusCode":102,"status":false});
    }else{
     let dateTime = format("yyyy-M-d",new Date());
     var todoyAdd = await dao.find(request,"userRecord",{createTime:format("yyyy-M-d",new Date())});
     if(todoyAdd.length!=0){
        await dao.updateOne(request,"userRecord",{createTime:dateTime},{number:todoyAdd[0].number+1});
    }else{
        var addUserSum = {
            createTime:format("yyyy-M-d",new Date()),
            number:1
        }
        await dao.save(request,"userRecord",addUserSum);
    }
        reply({"message":"添加用户成功","statusCode":101,"status":true});
    }
}


// 仓库
exports.warahouse = async function(request,reply){ 
    var user = request.auth.credentials;
    var list = await dao.find(request,'warahouse',{user_id:user._id + "",count:{$gt:0}});
    reply({
                "message":"查询成功",
                "statusCode":101,
                "status":true,
                "resource":list
    });
}

// 仓库
exports.warahouseDetail = async function(request,reply){ 
    var user = request.auth.credentials;
    var warahouseDoc = await dao.findById(request,'warahouse',request.params.id);
    reply({
                "message":"查询成功",
                "statusCode":101,
                "status":true,
                "resource":list
    });
}
exports.rank = async function(request,reply){
    var currentTimeStamp = new Date().getTime();
    var currentDateTime = new Date(currentTimeStamp);
    var dayString = formatDateDay(currentDateTime);
    var dayRankRecord = await dao.findOne(request,'rank',{dayString:dayString});
    if (dayRankRecord == null) {
        reply({"message":"排行榜暂未统计","statusCode":108,"status":false});
        return;
    }
    //列表
    var data = dayRankRecord.ranks;
    var rewards = setting.rank_rewards;
    if(data == null){
        reply({"message":"查询失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查询成功","statusCode":107,"status":true,"resource":{users:data,rewards:rewards}});
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
//计算团队人数
async function addparentNumber(request,parentUsername,remdNumber = false){
    let parent = await dao.find(request,'user',{username:parentUsername});
    console.log(parent);
    if(parent){
        if(remdNumber){
           await dao.updateOne(request,"user",{'_id':parent[0]._id+""},{remdNumber:parent[0].remdNumber+1,teamNumber:parent[0].teamNumber+1}); 
        }else{
           await dao.updateOne(request,'user',{'_id':parent[0]._id+""},{teamNumber:parent[0].teamNumber+1});
        }
        if(parent[0].parentUsername){
          await addparentNumber(request,parent[0].parentUsername);
        }
    }
}

// 
async function nextExe(request,user) { //author: meizz 
    var settingUserGrows = await dao.find(request,'settingUserGrow',{},{},{class:1});
    // 用户的当前等级
    var flag = user.class<=settingUserGrows.length?user.class:settingUserGrows.length;
    var nextExe = 0;
    for (var index = 0;index < flag;index ++) {
        var settingGrow = settingUserGrows[index];
        nextExe = nextExe + settingGrow.nex_exe;
    }
    // 升级到下一级时的总经验
    return nextExe;
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
        console.log('year  to string ',year.toString());
        var month = date.getMonth() + 1;
        month = (month < 10) ? '0' + month : month;
         console.log('month  to string ',month.toString());
      

       
        //var second = date.getSeconds();

        return year.toString()  + "-" + month.toString();
}
