var schedule = require('node-schedule');
const dao = require('../dao/dao');
// const { server } = require("../
const app = require("../app");

exports.robotTask =  async function(){ 
    schedule.scheduleJob('1  0 0 * * *',async  function(){  
        var request = {server:app.server} ;
        var users = await dao.find(request,'user',{robot:1});
        var currentTimeStamp = new Date().getTime();
        var currentDateTime = new Date(currentTimeStamp);
        var currentFormatTimeString = format(currentDateTime);
        var today23clockFormatString = currentFormatTimeString.split(" ")[0] + " 23:59:59";
        var today23clockTimeStamp = Date.parse(new Date(today23clockFormatString));       
        if (users.length > 0) {
            for (var userIndex in users) {
                var user = users[userIndex];
                // 更新狗狗和机器人

                if (user.dogV == 1) {
                    if (new Date().getTime() > user.dog_end_time) {
                        await dao.updateOne(request,'user',{username:user.username},{dogV:0});
                    }
                }

                if (user.robot == 1) {
                    if (new Date().getTime() > user.robot_end_time) {
                        await dao.updateOne(request,'user',{username:user.username},{robot:0});
                        continue;
                    }
                }
                
                // 12.18 0:0:0  1513526400000   12.18 23:59:59  1513612799000
                var conversingLands = await dao.find(request,'land',{user_id:user._id,status:{$ne:0},lastConverseClock23:{$ne:today23clockTimeStamp}});
                if (conversingLands.length > 0) {
                var updateIncone = await dao.updateIncAll(request,'land',{user_id:user._id,status:{$ne:0},lastConverseClock23:{$ne:today23clockTimeStamp}},{converse_count:1});
                var updateRes = await dao.update(request,'land',{user_id:user._id,status:{$ne:0},lastConverseClock23:{$ne:today23clockTimeStamp}},{lastConverseClock23:today23clockTimeStamp,lastConverseTime:new Date().getTime()});
                    for (var landIndex in conversingLands) {
                        var land = conversingLands[landIndex];
                        var dynamic = {};
                        dynamic.type = 1;
                        dynamic.username = user.username;
                        dynamic.land_code = land.code;
                        dynamic.land_type = land.type;
                        dynamic.dynamic_time = new Date().getTime();
                        dynamic.clock23 = today23clockTimeStamp;
                        dynamic.robot = 1;
                        dynamic.seedname = land.seed.seedname;
                        dynamic.seedcount = land.plant_count;
                        dynamic.dynamic_time = new Date().getTime();
                        await dao.save(request,'dynamic',dynamic);
                    }
                
                }
            }
        }
    });
}

exports.todayMoneyTask = async  function(){  
    var request = {server:app.server} ;
    //  var users =  await dao.find(request,'user',{});
    // // console.log('yser us ',users);;
    // return;
   
    schedule.scheduleJob('00 59 23 * * *', async function(){  
        var stealMoney;
        var currentTimeStamp = new Date().getTime();
        var currentDateTime = new Date(currentTimeStamp);
        var currentFormatTimeString = format(currentDateTime);
        var today23clockFormatString = currentFormatTimeString.split(" ")[0] + " 23:59:59";
        var today24clockTimeStamp = Date.parse(new Date(today23clockFormatString)) + 1000; 
        // var today00clockFormatString = currentFormatTimeString.split(" ")[0] + " 00:00:01";
        var today00ClockStamp = today24clockTimeStamp - 24 * 60 * 60  * 1000;
        var today00ClockDateString = new Date(today00ClockStamp);
        var today00ClockFomatString = format(today00ClockDateString);
        var JobTime = new Date(today24clockTimeStamp);
        // schedule.scheduleJob(JobTime, async function(){ 
        var users = await dao.find(request,'user',{});
        // console.log('usres is',users);
        for (var index in users) {
            var user = users[index];
            var todayMoneyRes = await dao.find(request,'todayMoney',{date:{$gt:today00ClockStamp,$lt:today24clockTimeStamp},username:user.username});
            if (todayMoneyRes.length > 0) {
                continue;
            }
            var findRes = await dao.find(request,'financeRecord',{finance_time:{$gt:today00ClockStamp,$lt:today24clockTimeStamp},username:user.username});
            if (findRes.length <=0) {
                var todayMoney = {};
                todayMoney.static_income = 0;
                todayMoney.dynamic_income = 0;
                todayMoney.steal_income = 0;
                todayMoney.total_income = 0;
                todayMoney.date = new Date().getTime();
                todayMoney.today24clockTimeStamp = today24clockTimeStamp;
                todayMoney.username = user.username;
                // console.log("todayMoney",todayMoney);
                await dao.save(request,'todayMoney',todayMoney);
                continue;
            }
            
            var financeStealSum = await dao.findSum(request,"financeRecord",{$match:{username:user.username,type:3,finance_time:{$gt:today00ClockStamp,$lt:today24clockTimeStamp}}},{$group:{_id:null,sum:{$sum:"$income"}}});
            var financeStaticSum =  await dao.findSum(request,"financeRecord",{$match:{username:user.username,type:1,finance_time:{$gt:today00ClockStamp,$lt:today24clockTimeStamp}}},{$group:{_id:null,sum:{$sum:"$income"}}});
            var financeMarketSum = await dao.findSum(request,"financeRecord",{$match:{username:user.username,type:4,finance_time:{$gt:today00ClockStamp,$lt:today24clockTimeStamp}}},{$group:{_id:null,sum:{$sum:"$income"}}});
            var financeSeedSum = await dao.findSum(request,"financeRecord",{$match:{username:user.username,type:2,finance_time:{$gt:today00ClockStamp,$lt:today24clockTimeStamp}}},{$group:{_id:null,sum:{$sum:"$income"}}});
            
            var static_income = 0;
            if (financeStaticSum.length > 0) {
                static_income = financeStaticSum[0].sum;
            }
            
            var seed_income = 0;
            if (financeSeedSum.length > 0) {
                seed_income = financeSeedSum[0].sum;
            }
            var steal_income = 0;
            if (financeStealSum.length > 0) {
                steal_income = financeStealSum[0].sum;
            }
            var marketIncome = 0;
            if (financeMarketSum.length > 0) {
                marketIncome = financeMarketSum[0].sum;
            }

            var todayMoney = {};
            todayMoney.static_income = static_income;
            todayMoney.dynamic_income = seed_income + marketIncome;
            todayMoney.steal_income = steal_income;
            todayMoney.total_income = todayMoney.static_income + todayMoney.dynamic_income + todayMoney.steal_income;
            todayMoneyTemp.total_income  = parseFloat(todayMoneyTemp.total_income.toFixed(2));
            todayMoney.date = new Date().getTime();
            todayMoney.username = user.username;
            // todayMoney.
            // console.log("todayMoney",todayMoney);
            await dao.save(request,'todayMoney',todayMoney);
            }
        // });
     });
   

    // var dynamics = await dao.find(request,'dynamic',{type:2},{})
    // var dynamic = await 

}
exports.scheduleCronstyle =  async function(){ 
    // console.log("131231");
    //  var request = {server:app.server};
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