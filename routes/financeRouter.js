const Joi = require('joi');
const financeService = require('../service/financeService');
module.exports = [
    // 充值
    {
        method:'POST',
        path:'/gold/recharge',
        handler:financeService.recharge,
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
                     gold:Joi.number().required().description("充值金额"),
                     wallet_type:Joi.number().required().description("钱包类型"),
                     trade_no:Joi.string().required().description("交易码"),
                     account:Joi.string().required().description("将要付款的账号")
                    //  username:Joi.string().required().description("充值账号")
                }

            }
        }
    },

       // 充值列表 
    {
        method:'GET',
        path:'/gold/rechargelist/{page}/{size}',
        handler:financeService.rechargeList,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '充值记录',
            notes: '充值记录Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                }

            }
        }
    },
     // 提现
    {
        method:'POST',
        path:'/gold/withdraw',
        handler:financeService.withdraw,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '提现',
            notes: '提现Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    gold:Joi.number().required().description("提现金额"),
                    wallet_type:Joi.number().required().description('钱包类型'),
                    number:Joi.string().description('支付宝账号'),
                    bank:Joi.string().description('开户行'),
                    // bank_card:Joi.string().description('卡号'),
                    bank_username:Joi.string().description('开户人姓名'),
                    pay_password:Joi.string().required().description('支付密码')
                }

            }
        }
    },

         // 提现记录
    {
        method:'GET',
        path:'/gold/withdrawlist/{page}/{size}',
        handler:financeService.withdrawList,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '提现记录',
            notes: '提现记录Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                }
            }
        }
    },

        // 抽奖
    {
        method:'GET',
        path:'/gold/award',
        handler:financeService.award,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '抽奖记录',
            notes: '抽奖记录Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 转账
    {
        method:'POST',
        path:'/gold/transfer/{username}',
        handler:financeService.transfer,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '转账',
            notes: '转账Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    gold:Joi.number().required().description("提现金额"),
                    pay_password:Joi.string().required().description("支付密码")
                },
                params:{
                    username:Joi.string().required().description("对方账号")
                }

            }
        }
    },

      // 转账记录
    {
        method:'GET',
        path:'/gold/transferlist/{page}/{size}',
        handler:financeService.transferList,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '提现记录',
            notes: '提现记录Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                }
            }
        }
    },

     // 抽奖记录
    {
        method:'GET',
        path:'/gold/awardRecord/{page}/{size}',
        handler:financeService.getAwardList,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '抽奖记录',
            notes: '抽奖记录Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                }
            }
        }
    },
       // 随机交易码
    {
        method:'GET',
        path:'/gold/tradeno',
        handler:financeService.tradeNo,
        config:{
            //拦截器
            // auth: {
            //     strategy: 'bearer',
            //     scope: 'USER'
            // },
            auth:false,
            description: '获取交易码',
            notes: '获取交易码Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
      // 金币消费记录
    {
        method:'GET',
        path:'/gold/consumeList/{page}/{size}',
        handler:financeService.consumeList,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '金币消费记录',
            notes: '金币消费记录Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                }
            }
        }
    },
          // 抽奖
    {
        method:'GET',
        path:'/gold/award/',
        handler:financeService.award,
        config:{
            //拦截器
            // auth: {
            //     strategy: 'bearer',
            //     scope: 'USER'
            // },
            auth:false,
            description: '转盘抽奖',
            notes: '转盘抽奖Api',
            //tags: ['api'],
            validate: {
                // headers: Joi.object({
                //     'authorization': Joi.string().required().description('需要加token请求头')
                // }).unknown()
            }
        }
    }
]