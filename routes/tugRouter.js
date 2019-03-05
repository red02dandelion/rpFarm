const Joi = require('joi');
const tugService = require('../service/tugService');
module.exports = [ 
      // 活动是否开启
    {
        method:'GET',
        path:'/tug/eventStatus',
        handler:tugService.eventStatus,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '用户登陆接口',
            notes: '用户登陆接口',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
     // 活动是否开启
    {
        method:'GET',
        path:'/tug/joinTug',
        handler:tugService.joinTug,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '用户登陆接口',
            notes: '用户登陆接口',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

     // 活动是否开启
    {
        method:'GET',
        path:'/tug/tugDetail',
        handler:tugService.tugDetail,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '用户登陆接口',
            notes: '用户登陆接口',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

      // 收获
    {
        method:'GET',
        path:'/tug/harvest/{id}',
        handler:tugService.harvestTug,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '用户登陆接口',
            notes: '用户登陆接口',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description('记录id')
                }
            }
        }
    },
]