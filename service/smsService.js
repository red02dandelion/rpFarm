/**
 * 短信验证码
 * Created by chenda on 2016/4/27.
 */
var http = require('http');
var settings = require('../settings.js');
const dao = require("../dao/dao");
var xml2js = require('xml2js');
var iconv = require('iconv-lite');


//发送注册验证码
exports.sendRegSMS = async function(request,reply){

    const reqData = request.payload;
    var smsVerification =await dao.findOne(request,"smsVerification",{"mobile":reqData.mobile,"type":"register"});

    if(smsVerification!=null){
        if(smsVerification.createTime+60000>new Date().getTime()){
            reply({"message":"您的发送请求过于频繁，请在一分钟后再试。","statusCode":102,"status":false});
            return;
        }
    }

    //查找手机号是否有重复
    var findeUser = await dao.findOne(request,"user",{"userName":reqData.mobile});
    if(findeUser!=null){
        reply({"message":"该手机号已被注册，请提交新的手机号码。","statusCode":102,"status":false});
        return;
    }

    const host = "106.ihuyi.cn";
    const path = '/webservice/sms.php?method=Submit';
    var smsCode = num();
    
    const data = {
        account:"cf_yuntu",
        password:"shichenda123@",
        mobile:reqData.mobile,
        content:"您的验证码是："+smsCode+"。请不要把验证码泄露给其他人。如非本人操作，可不用理会！"
        // content:"今冬有雪，连绵不绝。周末里不妨和最爱的Ta去看一场电影,吃一顿火锅，热烈的爱情才是抵御寒冷的良方。优胜科技祝您周末愉快。【水瓶座】本周运势：动荡不安，大起大落，不宜做过激的决定。今日爱情运势：相处上有点问题，除了意见不合外，注意不要受到工作上负面情绪的影响。"
    }
    var smsResult = await postFrom(path,host,require('querystring').stringify(data));

    if(smsResult==null){
        reply({"message":"验证码获取失败，请重新获取。","statusCode":102,"status":false});
    }else{
        xml2js.parseString(smsResult, {explicitArray: false},async function (err, result) {
            var smsResult = null;
            if (result.SubmitResult.code == "2") {
                if(smsVerification!=null){
                    const id = smsVerification._id+""
                    smsVerification.code = smsCode;
                    smsVerification.createTime = new Date().getTime();
                    delete smsVerification._id;
                    smsResult = await dao.updateOne(request,"smsVerification",{"_id":id},smsVerification);
                }else{
                    const smsData = {
                        code : smsCode,
                        createTime: new Date().getTime(),
                        type:"register",
                        mobile:data.mobile
                    }
                    smsResult =await dao.save(request,"smsVerification",smsData);
                }
                if(smsResult==null){
                    reply({"message":"验证码发送失败，请重新发送","statusCode":102,"status":false});
                }else{
                    reply({"message":"验证码发送成功","statusCode":101,"status":true});
                }
            }else{
                reply({"message":"验证码发送失败，"+result.SubmitResult.msg,"statusCode":102,"status":false});
            }
        });
    }
}

//发送找回密码验证码
exports.sendSetPwdSMS = function(request,reply){


}

//短信验证码登录
exports.sendLoginSMS = function(request,reply){

}

//短信通知消息
exports.sendLoginSMS = function(phoneNumber,content){

}

//随机数
function num(){
    var mm=Math.random();
    var six ="";
    if(mm>0.1)
    {
        six=Math.round(mm*1000000);
    }else{
        mm += 0.1;
        six = Math.round(mm*1000000);
    }
    return six;
}


//表单提交。
function postFrom(path,host,postData){
    return new Promise(function(resolve,reject) {
        var options = {
            host:host,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }

        var req1 = http.request(options, function (res1) {
            if (res1.statusCode !== 200) {
                options = JSON.stringify(options)
                var Time = new Date()
                var ReTime = Time.getFullYear() + '-' + (Time.getMonth() + 1) + '-' + Time.getDate() + ' ' + Time.getHours() + ':' + Time.getMinutes()
                console.log(ReTime + ' POST请求数据库错误')
                console.log(ReTime + '请求头：' + options)
                var errMessage = JSON.stringify({
                    'status': false,
                    'info': ReTime + ' POST请求数据' + res1.statusCode + '错误，请联系系统管理员'
                })
                esolve(null);
            }
            var postDataStr = [];
            var size = 0;
            res1.on('data', function (chunk) {
                postDataStr.push(chunk)
                size += chunk.length
            })
            res1.on('end', function () {
                var buf = Buffer.concat(postDataStr, size);
                var str = iconv.decode(buf, 'utf8');
                //var posts = JSON.parse(str)
                resolve(str);
            })
        }).on('error', function (err) {
            if (err) {
                options = JSON.stringify(options)
                var Time = new Date()
                var ReTime = Time.getFullYear() + '-' + (Time.getMonth() + 1) + '-' + Time.getDate() + ' ' + Time.getHours() + ':' + Time.getMinutes()
                console.log(ReTime + ' POST请求数据库500错误,请求头：' + options + ',请求内容:' + postData + '，错误代码：' + err)
                resolve(null);
            }
        })
        req1.write(postData + "\n")
        req1.end();
    });
}