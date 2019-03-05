const Joi = require('joi');
const functionService = require('../service/functionService');

module.exports = [

     // 已读
    {
        method:'GET',
        path:'/function/newTips',
        handler:functionService.newTips,
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
                }).unknown()

            }
        }
    },

    // 已读
    {
        method:'GET',
        path:'/function/readTips/{id}',
        handler:functionService.readTip,
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
                params:{
                     id:Joi.string().required().description("tipId"),
                    //  wallet_type:Joi.number().required().description("钱包类型"),
                    //  trade_no:Joi.string().required().description("交易码"),
                    //  account:Joi.string().required().description("将要付款的账号")
                    //  username:Joi.string().required().description("充值账号")
                } 

            }
        }
    },
]