const Joi = require('joi');
const catchSlaveService = require('../service/catchSlaveService');
module.exports = [   
// 抓跟班
    {
        method:'POST',
        path:'/cathSlave/cath/{id}',
        handler:catchSlaveService.cathSlave,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '充值',
            notes: '充值Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                     user_id:Joi.string().required().description("用户ID"),
                     work_id:Joi.number().required().description("工位ID")
                },
                params:{
                     id:Joi.number().required().description("工位ID")
                }
            }
        }
    },
    // 工作状态
    {
        method:'POST',
        path:'/cathSlave/cath/{id}',
        handler:catchSlaveService.cathSlave,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '工作状态',
            notes: '工作状态Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                     user_id:Joi.string().required().description("用户ID"),
                     work_id:Joi.number().required().description("工位ID")
                },
                params:{
                     id:Joi.number().required().description("工位ID")
                }
            }
        }
    },
     // 随机用户
    {
        method:'POST',
        path:'/cathSlave/randusers',
        handler:catchSlaveService.randUsers,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '工作状态',
            notes: '工作状态Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                     count:Joi.number().required().description("用户数量")
                }
            }
        }
    }

]