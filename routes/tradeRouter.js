const Joi = require('joi');
const tradeService = require('../service/tradeService.js');


module.exports = [
      // 提交出售
    {
        method:'POST',
        path:'/trade/sale',
        handler:tradeService.commitSale,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '出售槟榔',
            notes: '出售槟榔Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    count:Joi.number().required().description('出售个数'),
                    pay_password:Joi.string().description('交易密码'),
                    price:Joi.number().required().description('出售价格')
                }
            }
        }
    },

      // 购买订单
    {
        method:'POST',
        path:'/trade/buysale/{id}',
        handler:tradeService.buySale,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '购买槟榔',
            notes: '购买槟榔Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description('订单ID')
                },payload:{
                    pay_password:Joi.string().required().description('支付密码')
                }
            }
        }
    },

         // 购买订单
    {
        method:'POST',
        path:'/trade/buyOrderPay/{id}',
        handler:tradeService.buyOrderPay,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '买家确认支付',
            notes: '买家确认支付Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description('订单ID')
                },payload:{
                    pay_password:Joi.string().required().description('支付密码')
                }
            }
        }
    },

           // 确认已支付
    {
        method:'POST',
        path:'/trade/saleConfirmPay/{id}',
        handler:tradeService.saleConfirmPay,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: ' 卖家确认支付',
            notes: '卖家确认支付Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description('订单ID')
                },
                payload:{
                    pay_password:Joi.string().required().description('支付密码')
                }
            }
        }
    },

              // 取消购买
    {
        method:'POST',
        path:'/trade/cancelBuy/{id}',
        handler:tradeService.cancelBuy,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: ' 取消购买',
            notes: '取消购买Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description('需要的操作')
                }
            }
        }
    },

    // 取消出售
    {
        method:'POST',
        path:'/trade/cancelSale/{id}',
        handler:tradeService.cancelSale,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: ' 取消出售',
            notes: '取消购买Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description('订单Id')
                },payload:{
                    type:Joi.number().required().description('操作ID 1 取消匹配 2 取消出售'),
                    pay_password:Joi.string().required().description('支付密码')
                }
            }
        }
    },


    // 我的订单
    {
        method:'POST',
        path:'/trade/orders/{page}/{size}',
        handler:tradeService.myOrders,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: ' 我的订单',
            notes: ' 我的订单Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description('页数'),
                    size:Joi.number().required().description('条数'),
                },payload:{
                    type:Joi.number().required().description('订单类型')
                }
            }
        }
    },

     // 交易大厅
    {
        method:'GET',
        path:'/trade/sales/{page}/{size}',
        handler:tradeService.saleList,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: ' 交易大厅出售列表',
            notes: '交易大厅出售列表Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description('页数'),
                    size:Joi.number().required().description('条数'),
                }
            }
        }
    },

      // 转账
    {
        method:'POST',
        path:'/trade/transfer',
        handler:tradeService.makeTransfer,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '好友转账',
            notes: '好友转账Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    count:Joi.number().required().description('出售个数'),
                    pay_password:Joi.string().description('交易密码'),
                    username:Joi.string().description('交易密码')
                }
            }
        }
    },

        // 转账
    {
        method:'POST',
        path:'/trade/buyTransferPay/{id}',
        handler:tradeService.receiveOrderPay,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '转账买家确认支付',
            notes: '转账买家确认支付Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description('订单ID')
                }
            }
        }
    },

           // 确认已支付
    {
        method:'POST',
        path:'/trade/saleTransferPay/{id}',
        handler:tradeService.saleTransferPay,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '转账 卖家确认支付',
            notes: '转账卖家确认支付Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description('订单ID')
                }
            }
        }
    },

                  // 取消转账
    {
        method:'POST',
        path:'/trade/cancelTransfer/{id}',
        handler:tradeService.cancelTransfer,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: ' 取消转账',
            notes: '取消转账Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description('需要的操作')
                }
            }
        }
    },

        // 我的转账
    {
        method:'POST',
        path:'/trade/transfers/{page}/{size}',
        handler:tradeService.myTransfers,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: ' 我的转账',
            notes: ' 我的转账Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description('页数'),
                    size:Joi.number().required().description('条数'),
                },payload:{
                    type:Joi.number().required().description('订单类型')
                }
            }
        }
    },
]