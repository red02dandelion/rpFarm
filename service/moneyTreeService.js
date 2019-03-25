var settings = require('../settings.js');
var userService = require("../service/userService");
const dao = require("../dao/dao");
// 近三天红包记录
exports.latestHbRecord = async function(request,reply){
    var user = request.auth.credentials; 
    var time = new Date().getTime();
    var now00 = new Date(new Date().setHours(0,0,0,0)).getTime();
    var moneyTreeSet = await dao.findOne(request,'moneyTreeSet',{});

    var beforYesDay00 = now00 - 2 * 24 * 60 * 60 * 1000;
    var where = {hb:{$gt:0},fromId:user._id + "",createTime:{$gt:beforYesDay00,$lt:time}};
    var hbRecors = await dao.find(request,"stealTotalRecord",where);
    var groupSum = await dao.findSum(request,'stealTotalRecord',{$match:where},{$group:{_id:null,sum:{$sum:"$hb"}}});
    // var buyRecords = {};
    var total = 0;
    if (groupSum.length >0) {
         total = parseFloat(groupSum[0].sum).toFixed(2);
    }
    var withdrawalList = await dao.find(request,'withdraw',where,{},{commit_time:-1},request.params.size,request.params.page);
    var sum = await dao.findCount(request,'stealRecord',where);
    var needInvite = Math.round(Number(moneyTreeSet.hbToInviteCountCoi * total));
    let todayString = format1("yyyy/M/d",new Date());
    var todayInvite = await hbInviteQuery(request,user._id + "",todayString);
     reply({"message":"查询成功！","statusCode":101,"status":true,"resource":hbRecors,sum:sum,"total":total,needInvite:needInvite,todayInvite:todayInvite});
}

exports.backHb = async function(request,reply){ 
    var user = request.auth.credentials;
    let todayString = format1("yyyy/M/d",new Date());
    
    // var hbBackToday = 0;
    var now00 = new Date(new Date().setHours(0,0,0,0)).getTime();
    var now24 = now00 + 24 * 60 * 60 * 1000;
    var hbBackRecord = await dao.findOne(request,'hbGetRecord',{user_id:user._id + "",createTime:{$gte:now00,$lte:now24},type:4});
    if (!hbBackRecord) {
        reply({"message":"今天已经找回过红包了！","statusCode":102,"status":false});
        return;
    }
    var hb = Number(request.payload.hb);
    await dao.updateIncOne(request,'user',{_id:user._id + ""},{hb:hb});
    var time = new Date().getTime();
    var monthString = formatDateMonth(new Date(time));
    var myMonthHbRecord = await dao.findOne(request,"monthHbRecord",{user_id:user._id + "",monthString:monthString});
    if (!myMonthHbRecord) {
        myMonthHbRecord = {};
        myMonthHbRecord.hb = hb;
        myMonthHbRecord.createTime = time;
        myMonthHbRecord.user_id = user._id + "";
        myMonthHbRecord.username = user.username;
        myMonthHbRecord.nickname = user.nickname;
        myMonthHbRecord.avatar = user.avatar;
        myMonthHbRecord.name = user.name;
        myMonthHbRecord.monthString = monthString;
        await dao.save(request,'monthHbRecord',myMonthHbRecord);
    } else {
        await dao.updateIncOne(request,'monthHbRecord',{_id:myMonthHbRecord._id + ""},{hb:hb});
    }
    var hbGetRecord = {};
    hbGetRecord.createTime = timeStamp;
    hbGetRecord.monthString = formatDateMonth(new Date(timeStamp));
    hbGetRecord.hb = hb;
    hbGetRecord.type = 4; // 1 种地收获 2 养殖收获 3 偷取红包 4 红包找回 5 抽奖红包
    hbGetRecord.user_id = user._id + "";
    hbGetRecord.username = user.username;
    hbGetRecord.nickname = user.nickname;
    hbGetRecord.name = user.name;
    await dao.save(request,'hbGetRecord',hbGetRecord);
    reply({"message":"找回成功！","statusCode":102,"status":false});
}
exports.offLineReward = async function(request,reply){  
    var user = request.auth.credentials;
    var moneyTreeSet = await dao.findOne(request,'moneyTreeSet',{});
    var data = {};
    await offLineRewardCount(request,data,moneyTreeSet);
    reply({"message":"查询成功！","statusCode":107,"status":true,resource:data});
}
exports.harvestReward = async function(request,reply){  
    var user = request.auth.credentials;
    var time = new Date().getTime();
    var moneyTreeSet = await dao.findOne(request,'moneyTreeSet',{});
    var data = {};
    let todayString = format1("yyyy/M/d",new Date());
    await offLineRewardCount(request,data,moneyTreeSet);
    // console.log('harvestData11',data);
    var num = data.dimond + data.gold + data.experience + data.tl + data.hb + data.plt_sessence;
    if (data.props.length <= 0 && num <= 0) {
        console.log("没有收获！");
        reply({"message":"没有收获！","statusCode":108,"status":false,resource:data});
        return;
    }
    await dao.updateIncOne(request,'user',{_id:user._id + ""},{experience:data.experience,gold:data.gold,tl:data.tl,dimond:data.dimond,hb:data.hb,plt_sessence:data.plt_sessence});
    // 收取掉落组装备
   if (data.props.length > 0) {
       for (var index in data.props) {
            var prop = data.props[index];
            var prop_id = prop._id + "";
            var propId = prop.id; 
            var propInHouse = await dao.findOne(request,'warahouse',{prop_id:prop._id + "",user_id:user._id + ""});
            // // console.log('33333',propInHouse);
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
    var offlineRecord = data;
    offlineRecord.createTime = new Date().getTime();
    offlineRecord.user_id = user._id + "";
    offlineRecord.username = user.username;
    offlineRecord.dayString = todayString;
    await dao.save(request,'offLineRecord',offlineRecord);
    await dao.updateOne(request,'user',{_id:user._id + ""},{offlineTime:0,lastTime:time});
    // console.log('harvestData22',data);
    reply({"message":"收取成功！","statusCode":107,"status":true,resource:data});
}
const offLineRewardCount = async function(request,data,moneyTreeSet) {
    var user = request.auth.credentials;
    await userService.updateOffLineTime(request);
     // console.log("moneyTreeSet",moneyTreeSet);
     var cycleHour = moneyTreeSet.offlineRewardHour;
     var rewardTime = parseInt(user.offlineTime /(cycleHour * 60 * 60 * 1000));
    //   var rewardTime = parseInt(user.offlineTime /(60 * 1000));
    console.log('offlineTime',user.offlineTime);
    console.log('rewardTime',rewardTime);
     data.experience = Math.round(rewardTime * moneyTreeSet.experience);
     data.gold = Math.round(rewardTime * moneyTreeSet.gold);;
     data.tl = Math.round(rewardTime * moneyTreeSet.tl);;
     data.plt_sessence = Math.round(rewardTime * moneyTreeSet.plt_sessence);;
     data.dimond =Math.round(rewardTime * moneyTreeSet.dimond);;
     data.hb = Math.round(rewardTime * moneyTreeSet.hb);
     var props = [];
    // 计算额外掉落
    var dropGruops = await dao.find(request,'dropGroups',{id:moneyTreeSet.dropId});
    if (dropGruops.length > 0) {
        for (var i = 0; i < rewardTime; i ++) {
            // // console.log('i',i);
            for (var index in dropGruops) {
                if (props.length >= moneyTreeSet.maxPorp) {
                    break;
                }
                var group = dropGruops[index];
                // // console.log('index',index);
                var sucRand = Math.random();
                // 掉落
                if (sucRand <= group.rate) {
                    var count = Math.round(Math.random() * (group.max - group.min) + group.min);
                    var prop = await dao.findOne(request,'prop',{id:group.propId});
                    // // console.log('222222',prop);
                    if (prop) {
                        prop.count = count;
                        await pushPropNoRepeat(props,prop);
                    }
                }
            }
            if (props.length >= moneyTreeSet.maxPorp) {
                break;
            }
        }
    }
    data.props = props;
    // console.log('data',data);
}
const hbInviteQuery = function(request,user_id,dayString) {
    var user = request.auth.credentials;
    var req  = require('urllib-sync').request;
    var path = settings.host +  'jmmall.farm.register.count';
    var tugScene = "hbBack-" + user_id + "-" +  dayString;
    try{ 
        var result = req(path,{
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                    "h": {
                            "t": user.token //当前登录用户token
                    },
                    "d": {
                        "a": 1,
                        "scenes": [tugScene]
                    }
                },
                            timeout:30000,


            });
        // console.log('result.data',result.data.toString());
        var data = JSON.parse(result.data.toString());
        if (data.c != 200) {
            return 0;
        } 
        // console.log('count',data.d.tugScene);
            return data.d.tugScene;
    }catch(e){
        // console.log('查询邀请失败！');
        return 0;
    }
} 

// 更新道具数量
async function pushPropNoRepeat(props,prop){  
    var haveFlag = false;
    for (var index in props) {
        var tempProp = props[index];
        if (tempProp.id == prop.id) {
            tempProp.count = tempProp.count + prop.count;
            haveFlag = true;
            break;
        }
    }
    if (haveFlag == false) {
        props.push(prop);
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
var formatDateMonth = function(date) {

    var year = date.getFullYear();
    // console.log('year  to string ',year.toString());
    var month = date.getMonth() + 1;
    month = (month < 10) ? '0' + month : month;
        // console.log('month  to string ',month.toString());
        return year.toString()  + "-" + month.toString();
}


// exports.latestHbRecord = async function(request,reply){

// }

