const Joi = require('joi');
const moneyTreeService = require('../service/moneyTreeService');
module.exports = [
//    公告列表
    {
        method:'GET',
        path:'/message/hbRecord/{page}/{size}',
        handler:moneyTreeService.latestHbRecord,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '公告列表',
            notes: '公告列表Api',
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
    },

        {
        method:'POST',
        path:'/hb/back',
        handler:moneyTreeService.backHb,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '公告列表',
            notes: '公告列表Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    hb:Joi.number().required().description('红包数')
                }
            }
        }
    },

        {
        method:'GET',
        path:'/hb/offLineRewards',
        handler:moneyTreeService.offLineReward,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '公告列表',
            notes: '公告列表Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    {
        method:'GET',
        path:'/hb/offLineRewards/harvest',
        handler:moneyTreeService.harvestReward,
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
                }).unknown()
            }
        }
    }
]