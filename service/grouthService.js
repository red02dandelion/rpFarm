"use strict";
const dao = require("../dao/dao");
const grouthService = require("../service/grouthService");
exports.grouthTime1 = async function(request,land){ 
    //  // console.log('grouthTime');
    if (land.status == 0 || land.seed == null) {
        return 0;
    }
    
    var curSeason ;
    for (var index in land.seed.seasons) {
        var thatSeason = land.seed.seasons[index];
        if (thatSeason.season == land.season) {
            curSeason = thatSeason;
        }
    }
    if (!curSeason) {
        return 0;
    }      


    // 当前时间
	var currentTimeStamp = new Date().getTime();
	var currentDateTime = new Date(currentTimeStamp);
	var currentFormatTimeString = format(currentDateTime);
	var today23clockFormatString = currentFormatTimeString.split(" ")[0] + " 23:59:59";
	var today23clockTimeStamp = Date.parse(new Date(today23clockFormatString));
    var today24clockTimeStamp =  today23clockTimeStamp + 1000;
    var tody00ClockTimeStamp = today24clockTimeStamp - 24 * 60 * 60 * 1000;
    const dayString = formatDateDay(currentDateTime);
    // 生长时间
    var seasonStartTime = new Date(land.season_start_time);
    // // console.log('seasonStartTime',land.season_start_time);
	var seasonStartFomatSting =  format(seasonStartTime);
	var seasonStart23dianFormatString = seasonStartFomatSting.split(" ")[0] + " 23:59:59";
    var seasonStartTimDay23dianTimeStamp = Date.parse(new Date(seasonStart23dianFormatString));
    // // console.log('seasonStart23dianFormatString',seasonStart23dianFormatString);
    var seasonStartTimDay24dianTimeStamp = seasonStartTimDay23dianTimeStamp + 1000;
    // 计算应日常次数
    var expectDailyCount;
    if (currentTimeStamp < seasonStartTimDay24dianTimeStamp) {
        expectDailyCount = 1;
    } else {
        expectDailyCount = parseInt((currentTimeStamp -  seasonStartTimDay24dianTimeStamp) / (24 * 60 * 60 * 1000)) + 2;
    }

    // 统计实际日常次数
    
    // 喂养次数
    var fertilizeCount =  await dao.findCount(request,'fertilizeRecord',{land_id:land._id,dayString:dayString,grouth_id:land.grouth_id,season:land.season});
    // 洗澡次数
    var insecCount = await dao.findCount(request,'insecRecord',{land_id:land._id,dayString:dayString,grouth_id:land.grouth_id,season:land.season});
    // 打扫次数
    var weedCount = await dao.findCount(request,'weedRecord',{land_id:land._id,dayString:dayString,grouth_id:land.grouth_id,season:land.season});

    var noDailyCout = 3 * expectDailyCount - fertilizeCount - insecCount - weedCount;

    var havertTime = curSeason.hour * 60 * 60 * 1000 + noDailyCout * 2 * 60 * 60 * 1000;
    // console.log(land.code + "号宠物窝" + '应日常次数：'+ expectDailyCount + ",洗澡次数："+insecCount + ",打扫次数"+ weedCount  + "喂养次数"+ fertilizeCount + "未日常次数：" + noDailyCout);
    return havertTime;

}



// 计算成熟时间
exports.grouthTime = async function(request,areca){ 

    // 当前时间
	var currentTimeStamp = new Date().getTime();
	var currentDateTime = new Date(currentTimeStamp);
	var currentFormatTimeString = format(currentDateTime);
	var today23clockFormatString = currentFormatTimeString.split(" ")[0] + " 23:59:59";
	var today23clockTimeStamp = Date.parse(new Date(today23clockFormatString));
    var today24clockTimeStamp =  today23clockTimeStamp + 1000;
    var tody00ClockTimeStamp = today24clockTimeStamp - 24 * 60 * 60 * 1000;
    const dayString = formatDateDay(currentDateTime);

    // 浇水
    var waterCount = await dao.findCount(request,'water',{grouth_id:areca.grouth_id + ""});
    // 除虫
    var insecCount = await dao.findCount(request,'insec',{grouth_id:areca.grouth_id + ""});
    // 放虫
    var wormCount = await dao.findCount(request,'worm',{grouth_id:areca.grouth_id + ""});

    var harvestHour = 20 + wormCount * 2 - insecCount * 2 - waterCount * 2;
    // console.log('hareverst hour',harvestHour);
    return harvestHour * 60 * 60 * 1000;
}


exports.grouthHarvest = async function(request,areca){ 

     // 当前时间
	// var currentTimeStamp = new Date().getTime();
	// var currentDateTime = new Date(currentTimeStamp);
	// var currentFormatTimeString = format(currentDateTime);
	// var today23clockFormatString = currentFormatTimeString.split(" ")[0] + " 23:59:59";
	// var today23clockTimeStamp = Date.parse(new Date(today23clockFormatString));
    // var today24clockTimeStamp =  today23clockTimeStamp + 1000;
    // var tody00ClockTimeStamp = today24clockTimeStamp - 24 * 60 * 60 * 1000;
    // const dayString = formatDateDay(currentDateTime);

    // var yesterday23clockTimeStamp = tody00ClockTimeStamp - 60 * 1000;
    // var yesterday23DateTime = new date(yesterday23clockTimeStamp);
    // var yesterdayString = formatDateDay(yesterday23DateTime);

    var growStartTime = areca.grow_start_time;
    var growDateTime = new Date(growStartTime);
    var growFormatTimeString = format(growDateTime);
    var grow23clockFormatString = growFormatTimeString.split(" ")[0] + " 23:59:59";
    var grow23clockTimeStamp =  Date.parse(new Date(grow23clockFormatString));
    var grow24clockTimeStamp =  grow23clockTimeStamp + 1000;
    var grow00ClockTimeStamp = grow24clockTimeStamp - 24 * 60 * 60 * 1000;
    const dayString = formatDateDay(growDateTime);

    var growYesterday23clockTimeStamp  = grow00ClockTimeStamp - 60 * 1000;
    var growYesterday23DateTime = new Date(growYesterday23clockTimeStamp);
    var yesterdayString = formatDateDay(growYesterday23DateTime);
    // console.log('yesterdayString',yesterdayString);
    var arecaCount = 0;
    var stepToCountRecord = await dao.findOne(request,'stepToCount',{username:areca.username,yesterdayString:yesterdayString});
    if (stepToCountRecord) {
        // console.log('stepToCountRecord',stepToCountRecord);
        arecaCount = stepToCountRecord.arecaCount;
    } else {
        var stepRecord = await dao.findOne(request,'step',{username:areca.username,dayString:yesterdayString});
        if (stepRecord) {
            // console.log('stepRecord',stepToCountRecord);
            arecaCount = Math.floor(stepRecord.step / 1000);
            arecaCount = arecaCount > 9 ? 9:arecaCount;
        } else {
            arecaCount = 0;
        }
        stepToCountRecord = {};
        stepToCountRecord.username = areca.username;
        stepToCountRecord.yesterdayString = yesterdayString;
        stepToCountRecord.arecaCount = arecaCount;
        stepToCountRecord.createTime = new Date().getTime();
        await dao.save(request,'stepToCount',stepToCountRecord);
    }
    // // console.log('arecaCount',arecaCount);

   return arecaCount;
}


exports.midGrouthHarvest = async function(request,land,season){ 
    var seed = {};
    if (land.seed) {
        seed = await dao.findById(request,'seed',land.seed._id + "");
    }  else {
        return 0;
    }
    var harvest;
    // 喂养次数(喂养)
    var fertilizeCount =  await dao.findCount(request,'fertilizeRecord',{land_id:land._id,grouth_id:land.grouth_id,season:season});
    // 洗澡次数()
    var insecCount = await dao.findCount(request,'insecRecord',{land_id:land._id,grouth_id:land.grouth_id,season:season});
    // 打扫次数
    var weedCount = await dao.findCount(request,'weedRecord',{land_id:land._id,grouth_id:land.grouth_id,season:season});

}

exports.updateGrowStatus = async function(request,areca){ 
    var currentTime = new Date().getTime();
    var arecaCount = await grouthService.grouthHarvest(request,areca);
    // for (var index = 1;index<=arecaCount;index ++) {
    //     var arecaFruit = {};
    //     arecaFruit.arecaId = areca._id + "";
    //     arecaFruit.grouth_id = areca.grouth_id;
    //     arecaFruit.code = index;
    //     await dao.save(request,'arecaFruit',arecaFruit);
    // }
    
    // // console.log('updateGrowStatus');
    var realCount = arecaCount - areca.stealed;
    await dao.updateOne(request,'areca',{_id:areca._id + ""},{arecaCount:realCount,harvest:arecaCount});
    // 生长中
    if (areca.status == 1) {
        var grouthTime = await grouthService.grouthTime(request,areca);
        // console.log('grouthTime',grouthTime);
        if (areca.grow_start_time + grouthTime <= currentTime) {
            // console.log('areca.grow_start_time',areca.grow_start_time);
            // console.log('currentTime',currentTime);
            await dao.updateOne(request,'areca',{_id:areca._id + ""},{status:2});
        }
    // 成熟
    }
}

exports.updateGrowStatus1 = async function(request,land){  
    // // console.log('updateGrowStatus');
    if (land.status == 0 ||land.status == 3) {return};
    var seed = {};
    if (land.seed) {
        seed = await dao.findById(request,'seed',land.seed._id + "");
    }  else {
        return ;
    }
    // 当前时间
    var currentTimeStamp = new Date().getTime();
    var curSeason ;
    for (var index in seed.seasons) {
        var thatSeason = seed.seasons[index];
        if (thatSeason.season == land.season) {
            curSeason = thatSeason;
        }
    }
    // var curSeasonHarvestTime = land.season * 24 * 60 * 60 * 1000;
    // // console.log('season',seed.seasons);
    var curSeasonHarvestTime = land.season * seed.seasons[0].hour * 60 * 60 * 1000
    if  (currentTimeStamp - land.plant_time >= curSeasonHarvestTime) {
        //  // console.log('2222222');
        var updateLandRes = await dao.updateOne(request,'land',{_id:land._id + ""},{status:2});
    } else {
        var updateLandRes = await dao.updateOne(request,'land',{_id:land._id + ""},{status:1});
    }
}

exports.updateGrowInfo = async function(request,land){ 
   

    //   // console.log('updateGrowInfo');
     // 洗澡(除虫)
    var inseced = 0;
    var insecRecords = await dao.find(request,'insecRecord',{land_id:land._id,season:land.season,grouth_id:land.grouth_id});
    if (insecRecords.length > 0) {
        inseced = 1;
    }
    // 打扫（打扫）
    var weeded = 0;
    var weedRecords = await dao.find(request,'weedRecord',{land_id:land._id,season:land.season,grouth_id:land.grouth_id});
    if (weedRecords.length > 0) {
        weeded = 1;
    }

    // // console.log("weeded is",weeded);
    // 浇水（）
    var watered = 0;
    var waterRecords = await dao.find(request,'waterRecord',{land_id:land._id,season:land.season,grouth_id:land.grouth_id});
    if (waterRecords.length > 0) {
        watered = 1;
    }

    // 喂养（喂养）
    var fertilized = 0;
    var fertilizeRecords = await dao.find(request,'fertilizeRecord',{land_id:land._id,season:land.season,grouth_id:land.grouth_id});
    if (fertilizeRecords.length > 0) {
        fertilized = 1;
    }
    // if(land.code == 22) {
    //     // // console.log('fertilized is',fertilized);
    //     //  // console.log('land._Id is',land._id + "");
    // }
    await dao.updateOne(request,'land',{_id:land._id + ""},{weed_status:weeded,fertilize_status:fertilized,water_status:watered,insec_status:inseced});


}

// exports.grouthIrecaInfo = async function(request,reply){   
//     var user = request.auth.credentials;
//     var areca = await dao.findOne(request,'areca',{user_id:user.id + ""});
//     // var arecaFruits = await dao.find(request,'arecaFruit',{grouth_id:areca.grouth_id});
//     // var areca_info = {
//     //     areca:areca
//     // };
//     reply({"message":"查询成功","statusCode":107,"status":true,"resource":areca});
// }

exports.updateAokenGrowInfo = async function(request,land){  
    if (land.status == 0) {return};
    // 当前时间
    const currentTime = new Date().getTime();
    const currentDateTime = new Date(currentTime);
    const dayString = formatDateDay(currentDateTime);

    // 洗澡
    var inseced = 0;
    var insecRecords = await dao.find(request,'insecRecord',{land_id:land._id,dayString:dayString,season:land.season,grouth_id:land.grouth_id});
    if (insecRecords.length > 0) {
        inseced = 1;
    }
    // 打扫
    var weeded = 0;
    var weedRecords = await dao.find(request,'weedRecord',{land_id:land._id,dayString:dayString,season:land.season,grouth_id:land.grouth_id});
    if (weedRecords.length > 0) {
        weeded = 1;
    }

    // // console.log("weeded is",weeded);
    // 浇水
    var watered = 0;
    var waterRecords = await dao.find(request,'waterRecord',{land_id:land._id,dayString:dayString,season:land.season,grouth_id:land.grouth_id});
    if (waterRecords.length > 0) {
        watered = 1;
    }

    // 喂养
    var fertilized = 0;
    var fertilizeRecords = await dao.find(request,'fertilizeRecord',{land_id:land._id,dayString:dayString,season:land.season,grouth_id:land.grouth_id});
    if (fertilizeRecords.length > 0) {
        fertilized = 1;
    }
    // if(land.code == 22) {
    //     // // console.log('fertilized is',fertilized);
    //     //  // console.log('land._Id is',land._id + "");
    // }
    await dao.updateOne(request,'land',{_id:land._id + ""},{weed_status:weeded,fertilize_status:fertilized,water_status:watered,insec_status:inseced});
    
}

exports.grouthArecaInfo = async function(request,reply){  
    // 当前季度 预计收益  剩余成熟时间 已被偷取  
    var user = request.auth.credentials;
    var areca = await dao.findOne(request,'areca',{user_id:user._id});
    if (!land) {
        reply({
                "message":"无此槟榔树",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    // var seed = {};
    // if (land.seed) {
    //     seed = await dao.findById(request,'seed',land.seed._id + "");
    // }  else {
    //     return ;
    // }

    if (areca.status == 0) {
         reply({
                "message":"槟榔树还未开始生长",
                "statusCode":102,
                "status":false
        });

        return
    }
    //  当前时间
    var currentTimeStamp = new Date().getTime();
   
    // var curSeasonHarvestTime = land.season * 24 * 60 * 60 * 1000;
   var harvestTime = areca.grow_start_time + grouthService.grouthTime(request,areca);
   var restTime = harvestTime - currentTimeStamp;
   restTime = restTime < 0 ? 0:restTime;

    
    var land_info = {};
    land_info.harvest_rest_time = restTime;
    // // console.log('00000000000');
    await grouthService.updateGrowStatus(request,areca);
    var harvest =  await grouthService.grouthHarvest(request,land);
    // // console.log('harvest is',harvest);
    
    land_info.status = areca.status;
    land_info.expected_harvest = harvest;
    // if(areca.status == 2) {
    land_info.stealed = areca.stealed;
    // }
    // var seed;
    // if (land.seed) {
    //     seed = await dao.findById(request,'seed',land.seed._id + "");
    //     land_info.seedname = seed.seedname;
    //     land_info.code = seed.code;
    //     land_info.season = land.season;
    //     land_info.season_stealed = land.season_stealed;
    //     // land_info.status = land.status;
    //     // // console.log('land.stauts',land.status);
    //     land_info.code = land.seed.code;
    //     land_info.seedname = land.seed.seedname;
    //     land_info.stealed_count = land.stealed_count;
    //     land_info.plant_time = land.plant_time;
    
    //     land_info.season_start_time = land.season_start_time;
       
    // } 
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":land_info});
    // return;
}

// 宠物窝详情
exports.grouthAokenInfo = async function(request,reply){  
    // 当前季度 预计收益  剩余成熟时间 已被偷取  
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

    var currentTime = new Date().getTime();
    var land_info = {};
    land_info.harvest_rest_time = 0;
    // var seed;
    if (land.seed) {
        land_info.season = land.season;
        var curSeason;
        for (var index in land.seed.seasons) {
            var thatSeason = land.seed.seasons[index];
            if (thatSeason.season == land.season){
                curSeason = thatSeason;
            }
        }
        land_info.expected_harvest = curSeason.harvest - land.season_stealed;
        land_info.season_stealed = land.season_stealed;
        if (land.status == null) {
            // console.log('adwaa a a');
            return;
        } 
        land_info.status = land.status;
        // console.log('land.stauts',land.status);
        land_info.code = land.seed.code;
        land_info.seedname = land.seed.seedname;
        if (land.status != 2) {
            var harvestTime = await grouthService.grouthTime(request,land);
            // // console.log('harvestTime is ',harvestTime);
             // console.log('currentTime is ',currentTime);
            land_info.harvest_rest_time = harvestTime - currentTime + land.season_start_time;
            land_info.harvest_rest_time = land_info.harvest_rest_time < 0?0:land_info.harvest_rest_time;
        }  
    }
  
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":land_info});
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