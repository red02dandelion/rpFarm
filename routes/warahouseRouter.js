const Joi = require('joi');
const warahouseService = require('../service/warahouseService');
module.exports = [
       // 用户登录
    {
        method:'GET',
        path:'/warahouse/sell/{id}',
        handler:warahouseService.sellGoods,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '加工厂',
            notes: '加工厂',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("物品ID")
                }
            }
        }
    },
]