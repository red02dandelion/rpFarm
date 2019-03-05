const Joi = require('joi');
const messageService = require('../service/messageService');

module.exports = [
   // 公告列表
    {
        method:'GET',
        path:'/message/notes/{page}/{size}',
        handler:messageService.notes,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '公告列表',
            notes: '公告列表Api',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description('页数'),
                    size:Joi.number().required().description('条数')
                }
            }
        }
    },
    // 我的消息
    {
        method:'GET',
        path:'/message/dynamic/{page}/{size}',
        handler:messageService.myDynamic,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '我的消息',
            notes: '我的消息Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description('页数'),
                    size:Joi.number().required().description('条数')
                }
            }
        }
    }
]