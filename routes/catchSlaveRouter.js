const Joi = require('joi');
const catchSlaveService = require('../service/catchSlaveService');
module.exports = [   
// 抓跟班
    {
        method:'POST',
        path:'/cathSlave/cath',
        handler:catchSlaveService.cathSlave,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '充值',
            notes: '充值Api',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                     user_id:Joi.string().required().description("用户ID"),
                     work_id:Joi.number().required().description("工位ID")
                }
            }
        }
    },
     {
        method:'GET',
        path:'/cathSlave/workStatus',
        handler:catchSlaveService.myWorkStatus,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '工作状态',
            notes: '工作状态Api',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    {
        method:'POST',
        path:'/cathSlave/harvest',
        handler:catchSlaveService.harvestMyWork,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '工作状态',
            notes: '工作状态Api',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                     work_id:Joi.number().required().description("工位ID")
                }
            }
        }
    },

    {
        method:'POST',
        path:'/cathSlave/freeSlave',
        handler:catchSlaveService.freeSlave,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '解雇跟班',
            notes: '解雇跟班Api',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    work_id:Joi.number().required().description('工作ID')
                }

            }
        }
    },


     {
        method:'GET',
        path:'/cathSlave/myCatched',
        handler:catchSlaveService.myCatched,
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
                }).unknown()
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