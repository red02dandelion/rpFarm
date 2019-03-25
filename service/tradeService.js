const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");

exports.commitSale = async function(request,reply){ 
     var user = request.auth.credentials;
     var needArecaCount = request.payload.count * 1.1;
     if(request.payload.count <= 0) { 
        reply({
                "message":"出售数量不合法",
                "statusCode":102,
                "status":false
        });

        return ;
    }

    if(String(request.payload.count).indexOf(".")>-1) {
        reply({
            "message":"输入数量不合法！",
            "statusCode":102,
            "status":false
        });
        return; 
    }

     if (needArecaCount > user.areca) {
        reply({
                "message":"本次出售消耗槟榔" + needArecaCount + '个，您没有那么多槟榔',
                "statusCode":102,
                "status":false
        });

        return ;
     }
    var serverpay_password = user.pay_password;
    // console.log('serverpay_password is',serverpay_password);
     var decrptpay_password = CryptoJS.AES.decrypt(serverpay_password,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);
     // console.log('decrptpay_password is',decrptpay_password);
    if (decrptpay_password != request.payload.pay_password) {
        reply({
                "message":"支付密码错误",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    var seller = {};
    seller.mobile = user.mobile;
    seller.wechat_number = user.wenxin;
    seller.ali_number = user.ali_number;
    seller.nickname = user.nickname;
    seller.username = user.username;
    
    var sale = {};
    sale.username = user.username;
    sale.createTime = new Date().getTime();
    sale.count = request.payload.count;
    sale.nickname = user.nickname;
    sale.ali_number = user.ali_number;
    sale.wechat_number = user.wenxin;
    sale.seller = seller;
    sale.trade_status = 0;
    sale.buyer = "";
    sale.buyer_user = {};
    sale.buyer_confirmed = 0;
    sale.seller_confirmed = 0;
    sale.price = request.payload.price;
    sale.total_count = needArecaCount;
    sale.fee = needArecaCount - sale.count;
    await dao.save(request,'sale',sale);


    await dao.updateIncOne(request,'user',{_id:user._id+""},{areca:-needArecaCount});

    reply({
                "message":"提交成功",
                "statusCode":101,
                "status":true
    });

}

exports.saleList = async function(request,reply){  
    var saleList = await dao.find(request,'sale',{trade_status:0},{},{createTime:-1},request.params.size,request.params.page);
    reply({
            "message":"查询成功",
            "statusCode":107,
            "status":true,
            "saleList":saleList
    });
}

exports.buySale = async function(request,reply){  
    // // console.log('id is ',request.params.id);
    var user = request.auth.credentials;
    var sale = await dao.findById(request,'sale',request.params.id + "");
    if (sale == null) {
        reply({
            "message":"无此出售记录",
            "statusCode":102,
            "status":false
         });
         return;
    }

    if (sale.username == user.username) {
         reply({
            "message":"不能购买自己的订单",
            "statusCode":102,
            "status":false
         });
         return;
    }
    var serverpay_password = user.pay_password;
    // // console.log('serverpay_password is',serverpay_password);
    var decrptpay_password = CryptoJS.AES.decrypt(serverpay_password,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);
    // // console.log('decrptpay_password is',decrptpay_password);
    if (decrptpay_password != request.payload.pay_password) {
        reply({
                "message":"支付密码错误",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    var buyer_user = {};
    buyer_user.username = user.username;
    buyer_user.nickname = user.nickname;
    buyer_user.mobile = user.mobile;
    buyer_user.ali_number = user.ali_number;
    buyer_user.wechat_number = user.wenxin;
    // var user = request.auth.credentials;
    await dao.updateOne(request,'sale',{_id:sale._id + ""},{trade_status:1,buyer:user.username,buyer_user:buyer_user});
    reply({
                "message":"匹配成功",
                "statusCode":101,
                "status":true
        });
}

exports.buyOrderPay = async function(request,reply){  
    var sale = await dao.findById(request,'sale',request.params.id + "");
    var user = request.auth.credentials;
    if (sale == null) {
        reply({
            "message":"无此出售记录",
            "statusCode":102,
            "status":false
         });
        return;
    }

  
    if (sale.seller_confirmed == 1){
          await dao.updateOne(request,'sale',{_id:sale._id + ""},{trade_status:2,buyer_confirmed:1});
          await dao.updateIncOne(request,'user',{username:user.username},{areca:sale.count});
    } else {
          await dao.updateOne(request,'sale',{_id:sale._id + ""},{buyer_confirmed:1});
    }
  
    reply({
            "message":"操作成功",
            "statusCode":101,
            "status":true
     });
}


exports.saleConfirmPay = async function(request,reply){  
    var sale = await dao.findById(request,'sale',request.params.id + "");
    if (sale == null) {
        reply({
            "message":"无此出售记录",
            "statusCode":102,
            "status":false
         });
         return;
    }
    
   
    var user = request.auth.credentials;

    var serverpay_password = user.pay_password;
    var decrptpay_password = CryptoJS.AES.decrypt(serverpay_password,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);

    if (decrptpay_password != request.payload.pay_password) {
        reply({
                "message":"支付密码错误",
                "statusCode":102,
                "status":false
        });

        return ;
    }

    if (sale.buyer_confirmed == 1) {
         await dao.updateOne(request,'sale',{_id:sale._id + ""},{trade_status:2,seller_confirmed:1});
         await dao.updateIncOne(request,'user',{username:sale.buyer},{areca:sale.count});
    } else {
        await dao.updateOne(request,'sale',{_id:sale._id + ""},{seller_confirmed:1});
    }
    
    reply({
            "message":"操作成功",
            "statusCode":101,
            "status":true
     });
    
}


exports.cancelBuy = async function(request,reply){
   
    var sale = await dao.findById(request,'sale',request.params.id + "");
    if (sale == null) {
        reply({
            "message":"无此出售记录",
            "statusCode":102,
            "status":false
         });
        return;
    }
    
    var user = request.auth.credentials;
    if (sale.buyer != user.username) {
         reply({
            "message":"您没有资格取消该订单",
            "statusCode":102,
            "status":false
         });
        return;
    } else {
        await dao.updateOne(request,'sale',{_id:sale._id + ""},{buyer:{},buyer_confirmed:0});
    }
    
    reply({
            "message":"操作成功",
            "statusCode":101,
            "status":true
     });
}


exports.cancelSale = async function(request,reply){ 
    var sale = await dao.findById(request,'sale',request.params.id + "");
    // console.log('req payload is',request.payload);
    if (sale == null) {
        reply({
            "message":"无此出售记录",
            "statusCode":102,
            "status":false
         });
         return;
    }

    var user = request.auth.credentials;
      if (sale.username != user.username) {
         reply({
            "message":"您没有资格取消该订单",
            "statusCode":102,
            "status":false
         });
        return;
    } else {
        if (request.payload.type == 1) {
            await dao.updateOne(request,'sale',{_id:sale._id + ""},{buyer:{},buyer_confirmed:0});
        } else {
            // 取消出售
            await dao.del(request,'sale',{_id:sale._id + ""});
            await dao.updateIncOne(request,'user',{_id:user._id + ""},{areca:sale.count});
        }   
    }
     reply({
            "message":"取消出售成功",
            "statusCode":101,
            "status":true
         });
}  


exports.myOrders = async function(request,reply){ 
    var user = request.auth.credentials;
    var orders;
    // console.log('type',request.payload.type);
    if (request.payload.type == 1) {
        orders = await dao.find(request,'sale',{username:user.username},{},{createTime:-1},request.params.size,request.params.page);
    } else {
        orders = await dao.find(request,'sale',{buyer:user.username},{},{createTime:-1},request.params.size,request.params.page);
    }
    reply({
            "message":"查询成功",
            "statusCode":107,
            "status":true,
            "resource":orders
    });
   
}

exports.makeTransfer = async function(request,reply){ 
    
    var user = request.auth.credentials;
    var friend = await dao.findOne(request,'user',{username:request.payload.username});
    if (friend == null) {
        reply({
                "message":"账号不存在",
                "statusCode":102,
                "status":false
        });
            return;
    }
    if (friend.username == user.username) {
         reply({
                "message":"您不能给自己赠送槟榔",
                "statusCode":102,
                "status":false
        });
            return; 
    }
    var needArecaCount = request.payload.count;
    // needArecaCount = parseFloat()
     if(request.payload.count <= 0) { 
        reply({
                "message":"输入数量不合法",
                "statusCode":102,
                "status":false
        });

        return ;
    }

    if(String(request.payload.count).indexOf(".")>-1) {
        reply({
            "message":"输入数量不合法！",
            "statusCode":102,
            "status":false
        });
        return; 
    }

     if (needArecaCount > user.areca) {
        reply({
                "message":"本次转出消耗槟榔" + needArecaCount + '个，您没有那么多槟榔',
                "statusCode":102,
                "status":false
        });

        return ;
     }
     var serverpay_password = user.pay_password;
     var decrptpay_password = CryptoJS.AES.decrypt(serverpay_password,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);

    if (decrptpay_password != request.payload.pay_password) {
        reply({
                "message":"支付密码错误",
                "statusCode":102,
                "status":false
        });

        return ;
    }
    
    var seller = {};
    seller.mobile = user.mobile;
    seller.wechat_number = user.wenxin;
    seller.ali_number = user.ali_number;
    seller.nickname = user.nickname;
    seller.username = user.username;

    var buyer_user = {};
    buyer_user.username = friend.username;
    buyer_user.nickname = friend.nickname;
    buyer_user.mobile = friend.mobile;
    buyer_user.ali_number = friend.ali_number;
    buyer_user.wechat_number = friend.wenxin;

    var sale = {};
    sale.username = user.username;
    sale.createTime = new Date().getTime();
    sale.count = request.payload.count;
    sale.nickname = user.nickname;
    sale.ali_number = user.ali_number;
    sale.wechat_number = user.wechat_number;
    sale.trade_status = 2;
    sale.seller = seller;
    sale.buyer_user = buyer_user;
    sale.buyer = request.payload.username;
    sale.buyer_confirmed = 0;
    sale.seller_confirmed = 0;
    sale.total_count = needArecaCount;
    await dao.save(request,'transfer',sale);


    await dao.updateIncOne(request,'user',{username:user.username},{areca:-needArecaCount});
    await dao.updateIncOne(request,'user',{username:friend.username},{areca:needArecaCount});

    reply({
                "message":"赠送成功",
                "statusCode":101,
                "status":true
    });

}

exports.receiveOrderPay = async function(request,reply){ 

    var sale = await dao.findById(request,'transfer',request.params.id + "");
    if (sale == null) {
        reply({
            "message":"无此转账记录",
            "statusCode":102,
            "status":false
         });
        return;
    }

    var user = request.auth.credentials;
    if (sale.buyer_confirmed == 1) {
         await dao.updateOne(request,'transfer',{_id:sale._id + ""},{trade_status:2,seller_confirmed:1});
    } else {
        await dao.updateOne(request,'transfer',{_id:sale._id + ""},{seller_confirmed:1});
    }
    
    reply({
            "message":"操作成功",
            "statusCode":101,
            "status":true
     });
}

exports.saleTransferPay = async function(request,reply){  
    var sale = await dao.findById(request,'transfer',request.params.id + "");
    if (sale == null) {
        reply({
            "message":"无此出售记录",
            "statusCode":102,
            "status":false
         });
    } 
    return;
    var user = request.auth.credentials;
    if (sale.buyer_confirmed == 1) {
         await dao.updateOne(request,'transfer',{_id:sale._id + ""},{trade_status:2,seller_confirmed:1});
    } else {
        await dao.updateOne(request,'transfer',{_id:sale._id + ""},{seller_confirmed:1});
    }
    
    reply({
            "message":"操作成功",
            "statusCode":101,
            "status":true
     });
    
}

exports.myTransfers = async function(request,reply){  
    var user = request.auth.credentials;
    var orders;
    // console.log('request type is ',request.payload.type);
    if (request.payload.type == 1) {
        orders = await dao.find(request,'transfer',{username:user.username},{},{createTime:-1},request.params.size,request.params.page);
    } else {
        orders = await dao.find(request,'transfer',{buyer:user.username},{},{createTime:-1},request.params.size,request.params.page);
    }
    reply({
            "message":"查询成功",
            "statusCode":107,
            "status":true,
            "resource":orders
    });
}

exports.cancelTransfer = async function(request,reply){ 

    var sale = await dao.findById(request,'transfer',request.params.id + "");
    if (sale == null) {
        reply({
            "message":"无此出售记录",
            "statusCode":102,
            "status":false
         });
        return;
    }

    var user = request.auth.credentials;
    if ((sale.username != user.username)&&(sale.buyer != user.username)) {
         reply({
            "message":"您没有资格取消该转账",
            "statusCode":102,
            "status":false
         });
    } else {
        // if (request.payload.type == 1) {
        //     await dao.updateOne(request,'transfer',{_id:sale._id + ""},{buyer:{},buyer_confirmed:0});
        // } else {
            // 取消出售
            await dao.del(request,'transfer',{_id:sale._id + ""});
            await dao.updateIncOne(request,'user',{username:sale.areca + ""},{areca:sale.needArecaCount});
        // }   
    }

      reply({
            "message":"取消转账成功",
            "statusCode":101,
            "status":true
         });
}

