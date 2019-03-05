/**
 * 系统配置资源处理器
 * Created by chenda on 2017/3/9.
 */

const dao = require("../dao/dao");

//添加系统信息
exports.addSystemSet = async function(request,reply){
    var systemSet = request.payload;
    var result = await dao.save(request,"systemSet",systemSet);
    if(result==null){
        reply({"message":"添加系统信息失败","statusCode":102,"status":false});
    }else{
        reply({"message":"添加系统信息成功","statusCode":101,"status":true,"resource":result.ops[0]});
    }
}

//更新系统信息
exports.updateSystemSet = async function(request,reply){
    let systemSet = request.payload;
    var set = await dao.findById(request,"systemSet",request.params.id);
    var result = await dao.updateOne(request,"systemSet",{"_id":request.params.id},systemSet);
    var user =  await dao.find(request,"user",{embattle:0});
    // console.log(user);
    if(result==null){
        reply({"message":"更新系统信息失败","statusCode":106,"status":false});
    }else{
         if(systemSet.monkeyTime&&set.monkeyTime!=systemSet.monkeyTime){
            var oneTime = new Date(systemSet.monkeyTime).getTime();
            var twoTime = new Date().getTime();
            var threeTime = oneTime-twoTime;
            var timeout = setTimeout(async function(){
    //var set =  dao.findById(request,"systemSet",request.params.id);
    //var data =  dao.find(request,"plant",{embattle:0},{"number":1});
                var aa="";
                var plantSums=0;
                var goldSum=0;
                var sum = set.monkey;
                for(var i = 0; i < user.length; i++){
                    var stealGoldNumber = user[i].gold*sum;
                    dao.updateOne(request,"user",{"_id":user[i]._id+""},{gold:user[i].gold-stealGoldNumber});
                    aa=user[i]._id+"";
                    var plantSum=0;
                    var stealSum=0;
                    var friendPlant=await dao.find(request,"plant",{"userId":aa});
                    for (var j = 0;j <friendPlant.length;j++){
                        if(friendPlant[j].pond<6){
                            if(friendPlant[j].number<=300){
                                var stealSum=0;
                            }else{
                                var stealSum=(friendPlant[j].number-300)*sum;
                                dao.updateOne(request,"plant",{"_id":friendPlant[j]._id+""},{number:friendPlant[j].number-stealSum});
                            }     
                        }
                        if(friendPlant[j].pond>=6 && friendPlant[j].pond<=10){
                            if(friendPlant[j].number<=1000){
                                var stealSum=0;
                            }else{
                                var stealSum=(friendPlant[j].number-1000)*sum;
                                dao.updateOne(request,"plant",{"_id":friendPlant[j]._id+""},{number:friendPlant[j].number-stealSum});
                            }     
                        }
                        if(friendPlant[j].pond>10 && friendPlant[j].pond<=15){
                            if(friendPlant[j].number<=2000){
                                var stealSum=0;
                            }else{
                                var stealSum=(friendPlant[j].number-2000)*sum;
                                dao.updateOne(request,"plant",{"_id":friendPlant[j]._id+""},{number:friendPlant[j].number-stealSum});
                            }     
                        }

                        plantSum=plantSum+stealSum;

                    }
                    var stealRecord = {
                        userId:aa,
                        createTime:new Date().getTime(),
                        number : plantSum+stealGoldNumber,
                        note : "大圣来袭您一共损失"+(plantSum+stealGoldNumber)+"个仙桃！",
                    }
                    dao.save(request,"stealRecord",stealRecord);

                    plantSums=plantSums+plantSum;
                    goldSum=goldSum+stealGoldNumber
                }
                var reduce=plantSums+goldSum;
                    //// console.log(reduce);
                    reply({"message":"更新系统信息成功,大圣来袭偷取总果子数"+reduce,"statusCode":105,"status":true});
                },threeTime);
            var users =  await dao.find(request,"user",{embattle:1});
            for(var s = 0; s < users.length; s++){
                dao.updateOne(request,"user",{"_id":users[s]._id+""},{embattle:0});
            }
        }else{
        reply({"message":"更新系统信息成功","statusCode":105,"status":true});
        }
    }
}
//获取systemSetlist
exports.getSystemSetList = async function(request,reply){
    //列表
    var data = await dao.find(request,"systemSet");
    if(data == null){
        reply({"message":"查找系统设置信息失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找系统设置信息成功","statusCode":107,"status":true,"resource":data});
        }
    }

// async function monkey(request,id){
//     var set = await dao.findById(request,"systemSet",id);
//     var user = await dao.find(request,"user",{embattle:1});
//     //var data = await dao.find(request,"plant",{embattle:0},{"number":1});
//     var aa="";
//     var plantSums=0;
//     var sum = set.monkey;
//     for(var i = 0; i < user.length; i++){
//         aa=user[i]._id+"";
//         var plantSum=0;
//         var stealSum=0;
//         var friendPlant=await dao.find(request,"plant",{"userId":aa});
//         for (var j = 0;j <friendPlant.length;j++){
//             if(friendPlant[j].pond<6){
//                 if(friendPlant[j].number<=300){
//                     var stealSum=0;
//                 }else{
//                     dao.updateOne(request,"plant",{"id":friendPlant[j]._id+""},{number:friendPlant[j].number-friendPlant[j].number*sum});
//                     var stealSum=friendPlant[j].number*sum;
//                     // console(stealSum);
//                 }     
//             }
//             if(friendPlant[j].pond>=6 && friendPlant[j].pond<=10){
//                 if(friendPlant[j].number<=1000){
//                     var stealSum=0;
//                 }else{
//                     dao.updateOne(request,"plant",{"id":friendPlant[j]._id+""},{number:friendPlant[j].number-friendPlant[j].number*sum});
//                     var stealSum=friendPlant[j].number*sum;
//                 }     
//             }
//             if(friendPlant[j].pond>10 && friendPlant[j].pond<=15){
//                 if(friendPlant[j].number<=2000){
//                     var stealSum=0;
//                 }else{
//                     dao.updateOne(request,"plant",{"id":friendPlant[j]._id+""},{number:friendPlant[j].number-friendPlant[j].number*sum});
//                     var stealSum=friendPlant[j].number*sum;
//                 }     
//             }
//             plantSum=plantSum+stealSum;
//         }
//         var stealRecord = {
//                 userId:aa,
//                 createTime:new Date().getTime(),
//                 number : plantSum,
//                 note : "大圣来袭您一共损失"+plantSum+"个仙桃！",
//             }
//         dao.save(request,"stealRecord",stealRecord);

//         plantSums=plantSums+plantSum;
//     } 
      
//     var reduce=plantSums;
//     return reduce;
//     }

//     var sum = set.monkey;
//     var plantSum=0;
//     for(var i = 0; i < data.length; i++) {
//         //var sum=data[i].plantearnings-data[i].plantearnings*0.1;
//         dao.updateOne(request,"plant",{"_id":data[i]._id+""},{number:data[i].number-data[i].number*sum});
//         plantSum=plantSum+data[i].number*sum;
       //reply({"message":"大圣来袭发动成功"+reduce+"！","statusCode":103,"status":true,reduce:reduce});
//     }
//     var reduce=plantSum*sum;
//     return reduce;
// }
async function monkey(request,id){
    var user = await dao.find(request,"user",{embattle:0});
    var set = await dao.findById(request,"systemSet",request.params.id);
    //var data = await dao.find(request,"plant",{embattle:0},{"number":1});
    var aa="";
    var plantSums=0;
    var goldSum=0;
    var sum = set.monkey;
    for(var i = 0; i < user.length; i++){
        var stealGoldNumber = user[i].gold*sum;
        dao.updateOne(request,"user",{"_id":user[i]._id+""},{gold:user[i].gold-stealGoldNumber});
        aa=user[i]._id+"";
        var plantSum=0;
        var stealSum=0;
        var friendPlant=await dao.find(request,"plant",{"userId":aa});
        for (var j = 0;j <friendPlant.length;j++){
            if(friendPlant[j].pond<6){
                if(friendPlant[j].number<=300){
                    var stealSum=0;
                }else{
                    var stealSum=(friendPlant[j].number-300)*sum;
                    dao.updateOne(request,"plant",{"_id":friendPlant[j]._id+""},{number:friendPlant[j].number-stealSum});
                }     
            }
            if(friendPlant[j].pond>=6 && friendPlant[j].pond<=10){
                if(friendPlant[j].number<=1000){
                    var stealSum=0;
                }else{
                    var stealSum=(friendPlant[j].number-1000)*sum;
                    dao.updateOne(request,"plant",{"_id":friendPlant[j]._id+""},{number:friendPlant[j].number-stealSum});
                }     
            }
            if(friendPlant[j].pond>10 && friendPlant[j].pond<=15){
                if(friendPlant[j].number<=2000){
                    var stealSum=0;
                }else{
                    var stealSum=(friendPlant[j].number-2000)*sum;
                    await dao.updateOne(request,"plant",{"_id":friendPlant[j]._id+""},{number:friendPlant[j].number-stealSum});
                }     
            }

            plantSum=plantSum+stealSum;

        }
        var stealRecord = {
            userId:aa,
            createTime:new Date().getTime(),
            number : plantSum+stealGoldNumber,
            note : "大圣来袭您一共损失"+(plantSum+stealGoldNumber)+"个仙桃！",
        }
        dao.save(request,"stealRecord",stealRecord);

        plantSums=plantSums+plantSum;
        goldSum=goldSum+stealGoldNumber
    }
    var users = await dao.find(request,"user",{embattle:1});
    for(var s = 0; s < users.length; s++){
        dao.updateOne(request,"user",{"_id":users[s]._id+""},{embattle:0});
    }
      
    var reduce=plantSums+goldSum;
    return reduce;
}