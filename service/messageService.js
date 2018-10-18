const dao = require("../dao/dao");
// 公告列表
exports.notes = async function(request,reply){
    var notes = await dao.find(request,'note',{},{},{note_time:-1},request.params.size,request.params.page);
    var sum = await dao.findCount(request,'note',{});
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":notes,sum:sum});
}

// 我的消息
exports.myDynamic = async function(request,reply){ 
    var user = request.auth.credentials;
    var sum = await dao.findCount(request,'dynamic',{$or:[{stealer_id:user._id},{stealFromId:user._id},{user_id:user._id}]});
    var myDynamics = await dao.find(request,'dynamic',{$or:[{stealer_id:user._id},{stealFromId:user._id},{user_id:user._id}]},{},{createTime:-1},request.params.size,request.params.page);
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":myDynamics,sum:sum});
}
