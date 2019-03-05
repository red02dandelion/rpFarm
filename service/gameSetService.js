const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");

// 购买宠物窝
exports.gameSetInfo = async function(request,reply){
    var systemSet = await dao.findOne(request,'systemSet',{});
    reply({"message":"查询成功","statusCode":107,"status":true,"resource":systemSet});
}