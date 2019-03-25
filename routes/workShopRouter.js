const Joi = require('joi');
const workShopService = require('../service/workShopService');
module.exports = [
       // 用户登录
    {
        method:'GET',
        path:'/workshop/overView',
        handler:workShopService.overView,
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
                }).unknown()
            }
        }
    },
       // 用户登录
    {
        method:'GET',
        path:'/workshop/produce/{id}',
        handler:workShopService.produceGoods,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '加工',
            notes: '加工',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                     id:Joi.string().required().description("商品ID")
                }
            }
        }
    },
     {
        method:'GET',
        path:'/workshop/harvest',
        handler:workShopService.harvestProduce,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '领取加工',
            notes: '领取加工',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

     {
        method:'POST',
        path:'/workshop/sendToHome/{id}',
        handler:workShopService.sendToHome,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '领取加工',
            notes: '领取加工',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("仓库道具ID")
                },
                payload:{
                    address:Joi.string().required().description("地址"),
                    phone:Joi.string().required().description("收货人电话"),
                    name:Joi.string().required().description("收货人")
                }
            }
        }
    },

    {
        method:'POST',
        path:'/workshop/sendOrders',
        handler:workShopService.sendOrders,
        config:{
            //拦截器
            auth: false,
            description: '订单查询',
            notes: '快递到家订单查询接口',
            tags: ['api'],
            validate: {
                payload:{
                    sort:Joi.number().required().default(0).description("排序 排序默认时间正序排列，1表示倒序排列"),
                    apikey:Joi.string().required().description("接口key"),
                    start_time:Joi.string().required().description("付款开始时间"),
                    end_time:Joi.string().required().description("付款结束时间"),
                    page:Joi.number().required().default(1).description("页数"),
                    size:Joi.number().required().default(20).description("条数")
                }
            }
        }
    },


]