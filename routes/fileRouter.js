/**
 * Created by shichenda on 2016/5/17.
 */

const Joi = require('joi');
const fileService = require('../service/fileService');

module.exports = [

    //文件上传
    {
        method:'POST',
        path:'/files',
        handler:fileService.uploadImg,
        config:{
            auth:false,
            description: '获取商品列表',
            notes: '获取商品资源列表',
            //tags: ['api'],
            payload:{
                maxBytes:5242880
            }
        }
    },

    {
        method:'GET',
        path:'/upload/img/{fileName}',
        handler: function (request, reply) {
            let path = __dirname+'/../upload/img/'+request.params.fileName;
            return reply.file(path);
        }
    },
     {
        method:'GET',
        path:'/upload/seed/{seedno}/{seedname}',
        handler: function (request, reply) {
            let path = __dirname+'/../upload/seed/'+request.params.seedno +"/" + request.params.seedname;
            // console.log('---path',path);
            return reply.file(path);
        }
    },

    {
        method:'POST',
        path:'/file',
        handler:fileService.uploadFile,
        config:{
            auth:false,
            description: '获取商品列表',
            notes: '获取商品资源列表',
            //tags: ['api'],
            payload:{
                maxBytes:5242880
            }
        }
    },

]