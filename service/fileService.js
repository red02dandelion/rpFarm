var uploadFile =require("./fileService");
var settings = require('../settings.js');
var images = require("images");

var hosts = settings.host+":"+settings.hostPort;

exports.uploadImg = async function(request,reply){
    var imgPaths = [];
        var path = "/upload/img";
    var keys = Object.keys(request.payload);
    for(let i=0;i<keys.length;i++){
        let result = await uploadFile.saveImg(keys[i],__dirname+"/.."+path,request.payload[keys[i]], request.server.log);
        if(result){
            imgPaths.push(path+result);
        }
    }
    reply({paths:imgPaths});
}

exports.saveImg = function(imgName,path,data,log){
    var fs = require('fs');
    var fileName = new Date().getTime()+"original."+imgName.split(".")[imgName.split(".").length-1];

    // console.log(data);
    // console.log(fileName);
    return new Promise(function(resolve, reject){
        fs.exists(path,function(exist){
            if(!exist){
                fs.mkdir(path,function(err){
                    if(err){
                        log(['error'],err);
                        throw err;
                        resolve(null);
                    }else {
                        if(data.length>1048576){
                            images(data)                     //Load image from file
                            //加载图像文件
                                .size(800)
                            //等比缩放图像到1000像素宽
                                .save(path+fileName);
                            resolve(fileName);
                        }else{
                            images(data).save(path+fileName);
                            resolve(fileName);
                        }
                    }
                });
            }else{
                if(data.length>1048576){
                    images(data)                     //Load image from file
                    //加载图像文件
                        .size(800)
                        //等比缩放图像到1000像素宽
                        .save(path+fileName);
                    resolve(fileName);
                }else{
                    images(data).save(path+fileName);
                    resolve(fileName);
                }
            }
        });
    });



    //function writeFile(resolve){
    //    fs.writeFile(path+fileName,data,function(err){
    //        if(err){
    //            log(['error'],err);
    //            throw err;
    //            resolve(null);
    //        }else{
    //            var imgpath = path+fileName;
    //            var outimgpath = imgpath.replace("original","mini");
    //            resolve(fileName);
    //        }
    //    });
    //}
}

exports.uploadFile = async function(request,reply){
    // console.log(request.payload);
    var path = "/upload/img/";
    var imgName = request.payload.localUrl?request.payload.localUrl:request.payload.Filename;
    var result = await uploadFile.saveImg(imgName,__dirname+"/.."+path,request.payload.imgFile,request.server.log);
    if(result){
        // console.log(hosts+path+result);
        reply({"error":0,"url":path+result});
    }else{
        reply({"error":1,"message":"上传失败"});
    }
}