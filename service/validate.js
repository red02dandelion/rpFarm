
/**
 * 验证服务器
 * auth加密方式 密码加密 访问地址:UID或者时间戳
 * auth信息格式：bearer 用户名:加密字符串:(管理员需要加最后一个参数admin)
 * Created by chenda on 2016/4/16.
 */

var CryptoJS = require("crypto-js");

//验证函数
exports.validateFunc = function(token, request, callback){
    // // console.log(token);
    var user;
    var tokens = token.split(":");
    // // console.log(tokens);
    var db = request.server.plugins['hapi-mongodb'].db;
    var collectionName;
    if(tokens.length==2){
        collectionName = 'user';
    }else if(tokens.length==3){
        collectionName = 'admin';
    }else{
        callback(null, false, null);
        return;
    }
      //// console.log("collectionName",collectionName);
    //查询用户是否存在
    db.collection(collectionName).findOne({$or:[{"username":tokens[0]},{"mobile":tokens[0]}]},function(err,result){
        
        if(err){
            request.server.log(['error'],err);
            throw err;
            callback(null, false, null);
            return;
        }
        if(result){
            user = result;
            console.log("user.offlineTime",user.offlineTime);
            var decoded;
            try {
                var password = CryptoJS.AES.decrypt(result.password,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);
                // // console.log("password",password);
                var passwordmd5 = CryptoJS.HmacMD5(password,password).toString();
                decoded = CryptoJS.AES.decrypt(tokens[1], passwordmd5).toString(CryptoJS.enc.Utf8).split(":");
            }catch (e){
                // //// console.log(12312312);
                callback(null, false, null);
                request.server.log(["error"],e);
                // throw e;
                return;
            }
            // console.log('decoded is',decoded);
            //// console.log('request.url.path is',request.url.path);
            //对比访问的url是否与token中的url相等
            if(decoded[0]!=request.url.path){
                // // console.log('decoded[0]',decoded[0]);
                // // console.log('request.url.path',request.url.path);
                callback(null, false, null);
                return;
            }
            //查询之前是否访问过
            db.collection('access_record').findOne({"guid":decoded[1]},function(err,result){
                if(err){
                    // ////// console.log('err is',err);
                    request.server.log(['error'],err);
                    throw err;
                    callback(null, false, null);
                    return;
                }
                if(result){
                    // //// console.log('result is',result);
                    callback(null, false, null);
                    return;
                }
                //// console.log("true 没访问过");
                //存储唯一路径
                db.collection('access_record').save({guid:decoded[1]},function(err,result){
                    if(err) {
                        request.server.log(['error'], err);
                        //// console.log('error is',err);
                        throw err;
                    }
                });
                // //// console.log("true");
                callback(null, true, user);
                 return;
            });
        }else{
        //    // console.log("用户不存在");
           callback(null, false, null);
        }
    });
}


exports.getToken = function(request,reply){
    var time = new Date().getTime();
    // // console.log(request.payload);
    var admin = "";
    if(request.payload.userORadmin == "admin"){
        admin = ":admin"
    }
    var token = "bearer "+request.payload.username+":"+CryptoJS.AES.encrypt(request.payload.url+":"+time,CryptoJS.HmacMD5(request.payload.pwd,request.payload.pwd).toString())+admin;
    reply({"toekn":token});
    //  reply(request.payload);
}

exports.getMac = function(request,reply){
   var time = new Date().getTime();
   var payload = request.payload;
   payload.mac = CryptoJS.MD5("1522465211066"+payload.userId+payload.amount+payload.objid+payload.opcode+payload.blnum+"kbrqgjpjNhe5DUOYpqDJ").toString();
   reply(payload);
}


exports.decrpt = function(request,reply){
   var pwd = request.payload.pwd;
   pwd = CryptoJS.AES.decrypt(pwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);
   reply({"token":pwd});
}
exports.tydecrpt = function(request,reply){
   var pwd = request.payload.pwd;
   pwd = CryptoJS.AES.decrypt(pwd,"TongYi@2017:").toString(CryptoJS.enc.Utf8);
   reply({"token":pwd});
}
exports.tyPaydecrpt = function(request,reply){
   var pwd = request.payload.pwd;
   pwd = CryptoJS.AES.decrypt(pwd,"TongYiPay@2017:").toString(CryptoJS.enc.Utf8);
   reply({"token":pwd});
}
exports.timeTest = function(request,reply){
    var user = {};
    // 计算结束年份和月份
    var date = new Date(new Date().getTime());
    var currentYear = date.getFullYear();
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
        // console.log("years is ",years);
        endYears = startYear + years;
        // console.log("endYears is ",endYears);
        endMonth = endMonth % 12;
    }
    var monthString =  (endMonth < 10) ? '0' + endMonth : endMonth;
    var endDate = endYears + "-" + monthString;
    // console.log("endDate is ",endDate);
    reply({endDate});
}