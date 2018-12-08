const Joi = require('joi');
const wheelService = require('../service/wheelService');

module.exports = [ 
// 放虫
       {
        method:'GET',
        path:'/wheelSet/wheels',
        handler:wheelService.rewards,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '转盘奖励',
            notes: '转盘奖励Api',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    // 
    {
        method:'POST',
        path:'/wheelSet/lottery',
        handler:wheelService.award,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '转盘奖励',
            notes: '转盘奖励Api',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload: {
                    type:Joi.number().required().description('消耗种类')
                }
            }
        }
    }
]