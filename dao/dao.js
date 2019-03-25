/**
 * 数据库访问封装曾
 */

"use strict";

/**
 * 查询某条数据
 * @param request 请求上下文
 * @param where 查询条件
 * @param isShow 不希望查询某些字段如查找user时不想查询密码可以传入{password:0}
 * 如果只希望看到某些字段{name:1}
 */
exports.findById = function(request,collectionName,id = "",notShow = {}){

    return new Promise(function(resolve, reject){

        var db = request.server.plugins['hapi-mongodb'].db;
        var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
        // console.log('id is ',id);
        
        db.collection(collectionName).findOne({"_id": new ObjectID(id)},function(err,result){
            if(err){
                request.server.log(['error'],err);
                throw err;
                resolve(null);
            }else{
                resolve(result)
            }
        });
    });
}

/**
 * 查询某条数据
 * @param request 请求上下文
 * @param where 查询条件
 * @param isShow 不希望查询某些字段如查找user时不想查询密码可以传入{password:0}
 * 如果只希望看到某些字段{name:1}
 */
exports.findOne = function(request,collectionName,where = {},notShow = {}){

    return new Promise(function(resolve, reject){

        var db = request.server.plugins['hapi-mongodb'].db;
        if(where._id){
            var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
            where._id = new ObjectID(where._id);
            // console.log('----where',where);
        }
        // console.log('----where',where);
        db.collection(collectionName).findOne(where,notShow,function(err,result){
            if(err){
                request.server.log(['error'],err);
                // console.log("find one error",err);
                throw err;
                resolve(null);
            }else{
                // console.log("find one result",result);
                resolve(result)
            }
        });
    });
}

/**
 * 查询某个条数据
 * @param request 请求上下文
 * @param where 查询条件
 * @param notShow 不希望查询某些字段如查找user时不想查询密码可以传入{password:0}
 * @param sort 排序 {name:1} 1升序 -1 降序
 * @param limit 查询多少条
 * @param skip 从什么位置开始
 */
exports.find = function(request,collectionName,where = {},notShow = {},sort,limit,skip){

    return new Promise(function(resolve, reject){

        var db = request.server.plugins['hapi-mongodb'].db;
        
        if(where._id){
            var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
            where._id = new ObjectID(where._id);
        }
        // console.log('where is',where);、
        var sql = db.collection(collectionName).find(where,notShow);

        if(sort){
            sql = sql.sort(sort);
        }
        if(limit && limit>0){
            sql = sql.limit(limit);
        }
        if(skip && skip>0){
            if(limit && limit>0){
                sql = sql.skip((skip-1)*limit);
            }else{
                sql = sql.skip(skip);
            }
        }

        sql.toArray(function(err,result){
            if(err){
                request.server.log(['error'],err);
                throw err;
                resolve(null);
            }else{
                resolve(result)
            }
        });
    });
}


exports.findPriId = function(request,collectionName,where = {},notShow = {},sort,limit,skip){

    return new Promise(function(resolve, reject){

        var db = request.server.plugins['hapi-mongodb'].db;
        
        // if(where._id){
        //     var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
        //     where._id = new ObjectID(where._id);
        // }
        // console.log('where is',where);
        var sql = db.collection(collectionName).find(where,notShow);

        if(sort){
            sql = sql.sort(sort);
        }
        if(limit && limit>0){
            sql = sql.limit(limit);
        }
        if(skip && skip>0){
            if(limit && limit>0){
                sql = sql.skip((skip-1)*limit);
            }else{
                sql = sql.skip(skip);
            }
        }

        sql.toArray(function(err,result){
            if(err){
                request.server.log(['error'],err);
                throw err;
                resolve(null);
            }else{
                resolve(result)
            }
        });
    });
}

/**
 * 统计数据个数
 * @param request 请求上下文
 * @param where 查询条件
 */
exports.findCount = function(request,collectionName,where = {}){
    return new Promise(function(resolve, reject){
        var db = request.server.plugins['hapi-mongodb'].db;
        var sql = db.collection(collectionName).find(where).count(
            function(err,result){
                if(err){
                    request.server.log(['error'],err);
                    throw err;
                    resolve(null);
                }else{
                    resolve(result)
                }
            }
        );
    });
}

/**
 * 统计数据个数
 * @param request 请求上下文
 * @param where 查询条件
 */
exports.findSum = function(request,collectionName,where = {},pipeline={}){
    return new Promise(function(resolve, reject){
        var db = request.server.plugins['hapi-mongodb'].db;

        var sql = db.collection(collectionName).aggregate([where,pipeline],function(err,result) {
            if (err) {
                request.server.log(['error'], err);
                throw err;
                resolve(null);
            } else {
                resolve(result)
            }
        });
    });
}

/**
 * 更新一条数据
 * @param request 请求上下文
 * @param where  更新条件
 * @param reply 更新内容
 */
exports.updateOne = function(request,collectionName,where="",reply={}){

    return new Promise(function(resolve, reject) {

        var db = request.server.plugins['hapi-mongodb'].db;
        if(where._id){
            var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
            where._id = new ObjectID(where._id);
        }

        db.collection(collectionName).updateOne(
            where,
            {
                $set: reply
            },
            function (err, result) {
                if (err) {
                    request.server.log(['error'], err);
                    throw err;
                    resolve(null);
                } else {
                    resolve(result);
                }
            }
        );
    });
}
/**
 * 更新多条数据
 * @param request 请求上下文
 * @param where  更新条件
 * @param reply 更新内容
 */
exports.updateAll = function(request,collectionName,where="",reply={}){

    return new Promise(function(resolve, reject) {

        var db = request.server.plugins['hapi-mongodb'].db;
        if(where._id){
            var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
            where._id = new ObjectID(where._id);
        }

        db.collection(collectionName).update(
            where,
            {
                $set: reply
            },
            {
                "multi" : true,  // update only one document 
                "upsert" : false  // insert a new document, if no existing document match the query 
            },
            function (err, result) {
                if (err) {
                    request.server.log(['error'], err);
                    throw err;
                    resolve(null);
                } else {
                    resolve(result);
                }
            }
        );
    });
}
exports.updatePushOne = function(request,collectionName,where="",reply={}){

    return new Promise(function(resolve, reject) {

        var db = request.server.plugins['hapi-mongodb'].db;
        if(where._id){
            // console.log('\nwhere has _id where._id is ',where._id);
            var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
            where._id = new ObjectID(where._id);
           
        }
        // console.log('\n after where is ',where);
        // console.log('\n reply is ',reply);
        db.collection(collectionName).updateOne(
            where,
            {
                $push: reply
            },
            function (err, result) {
                if (err) {
                    request.server.log(['error'], err);
                    throw err;
                    resolve(null);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

exports.updatePushAll = function(request,collectionName,where="",reply={}){

    return new Promise(function(resolve, reject) {

        var db = request.server.plugins['hapi-mongodb'].db;
        if(where._id){
            var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
            where._id = new ObjectID(where._id);
            // console.log('\nwhere has _id where._id is ',where._id);
        }
        // console.log('\n after where is ',where);
        // console.log('\n reply is ',reply);
        db.collection(collectionName).update(
            where,
            {
                $push: reply
            },
            function (err, result) {
                if (err) {
                    request.server.log(['error'], err);
                    throw err;
                    resolve(null);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

exports.updateIncOne = function(request,collectionName,where="",reply={}){

    return new Promise(function(resolve, reject) {

        var db = request.server.plugins['hapi-mongodb'].db;
        if(where._id){
            var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
            where._id = new ObjectID(where._id);
        }

        db.collection(collectionName).updateOne(
            where,
            {
                $inc: reply
            },
            function (err, result) {
                if (err) {
                    request.server.log(['error'], err);
                    throw err;
                    resolve(null);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

// 自动增长的数据
exports.inc = function(request,collectionName,primaryCount) {
    return new Promise(function(resolve, reject){
      
        var db = request.server.plugins['hapi-mongodb'].db;
        
        db.collection(collectionName).findOne({idValue:primaryCount},function(err,res){
            if(err) {
                resolve('err');
            } else {
                if(res) {

                    db = request.server.plugins['hapi-mongodb'].db;

                    var sql = db.collection(collectionName).find();

                    sql = sql.sort({idValue:-1});
                    
                    sql.toArray(function(err,result){
                    if(err){
                        request.server.log(['error'],err);
                        throw err;
                        resolve('error');
                    }else{
                        var lastId = result[0].idValue;
                       
                        var newID = lastId + 1;
                        resolve(newID);
                        db.collection(collectionName).save({idValue:newID},function(err,reslut){
                            if(err) {
                                request.server.log(['error'], err);
                                throw err;
                            }
                        });
                    }});
                    
                } else {
                    
                    resolve(primaryCount);
                    db.collection(collectionName).save({idValue:primaryCount},function(err,reslut){
                            if(err) {
                                request.server.log(['error'], err);
                                throw err;
                            }
                        });
                }
            }
        });
              
    });
    
}
exports.updateIncAll = function(request,collectionName,where="",reply={}){

    return new Promise(function(resolve, reject) {

        var db = request.server.plugins['hapi-mongodb'].db;
        if(where._id){
            var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
            where._id = new ObjectID(where._id);
        }

        db.collection(collectionName).updateOne(
            where,
            {
                $inc: reply
            },
            {
                "multi" : true,  // update only one document 
                "upsert" : false  // insert a new document, if no existing document match the query 
             },
            function (err, result) {
                if (err) {
                    request.server.log(['error'], err);
                    throw err;
                    resolve(null);
                } else {
                    resolve(result);
                }
            }
        );
    });
}
exports.pullOne = function(request,collectionName,where="",reply={}){

    return new Promise(function(resolve, reject) {

        var db = request.server.plugins['hapi-mongodb'].db;
        if(where._id){
            var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
            where._id = new ObjectID(where._id);
        }

        db.collection(collectionName).updateOne(
            where,
            {
                $pull: reply
            },
            function (err, result) {
                if (err) {
                    request.server.log(['error'], err);
                    throw err;
                    resolve(null);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

/**
 * 更新多条数据
 * @param request 请求上下文
 * @param where  更新条件
 * @param reply 更新内容
 */
exports.update = function(request,collectionName,where,reply){

    var db = request.server.plugins['hapi-mongodb'].db;

    return new Promise(function(resolve, reject) {
        db.collection(collectionName).update(
            where,
            {
                $set: reply
            },{
                "multi" : true,  // update only one document 
                "upsert" : false  // insert a new document, if no existing document match the query 
             },
            function (err, result) {
                if (err) {
                    request.server.log(['error'], err);
                    throw err;
                    resolve(null);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

/**
 * 添加一条数据
 * @param request 请求上下文
 * @param where  更新条件
 * @param reply 更新内容
 */
exports.save = function(request,collectionName,data){
    var db = request.server.plugins['hapi-mongodb'].db;
    return new Promise(function(resolve, reject) {
        db.collection(collectionName).save(data, function (err, result) {
                if (err) {
                    request.server.log(['error'], err);
                    throw err;
                    resolve(null);
                } else {
                    resolve(result);
                }
            }
        );
    });
}


/**
 * 删除数据
 * @param request 请求上下文
 * @param where  更新条件
 * @param reply 更新内容
 */
exports.del = function(request,collectionName,where){
    var db = request.server.plugins['hapi-mongodb'].db;
    if(where._id){
        var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
        where._id = new ObjectID(where._id);
    }

    return new Promise(function(resolve, reject) {
        db.collection(collectionName).deleteOne(where, function (err, result) {
                if (err) {
                    request.server.log(['error'], err);
                    throw err;
                    resolve(null);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

/**
 * 删除多条数据
 * @param request 请求上下文
 * @param where  更新条件
 * @param reply 更新内容
 */
exports.delSum = function(request,collectionName,where){
    var db = request.server.plugins['hapi-mongodb'].db;
    if(where._id){
        var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
        where._id = new ObjectID(where._id);
    }
    return new Promise(function(resolve, reject) {
        db.collection(collectionName).remove(
            where, 
            function (err, result) {
                if (err) {
                    request.server.log(['error'], err);
                    throw err;
                    resolve(null);
                } else {
                    resolve(result);
                }
            }
        );
    });
}