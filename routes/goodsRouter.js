const Joi = require('joi');
const goodsService = require('../service/goodsService');

  // 用户登录
module.exports = [

     // 种子列表
    {
        method:'GET',
        path:'/goods/seeds',
        handler:goodsService.seeds,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '种子列表',
            notes: '种子列表Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

      // 道具列表
    {
        method:'GET',
        path:'/goods/props',
        handler:goodsService.props,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '道具列表',
            notes: '道具列表Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

       // 宠物列表
    {
        method:'GET',
        path:'/goods/dogs',
        handler:goodsService.dogs,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '宠物列表',
            notes: '宠物列表Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 房屋列表
    {
        method:'GET',
        path:'/goods/houses',
        handler:goodsService.houses,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '房屋列表',
            notes: '房屋列表Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 购买种子
       {
        method:'POST',
        path:'/goods/seed/buy/{id}',
        handler:goodsService.buySeed,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '购买种子',
            notes: '购买种子Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload: {
                    count: Joi.number().required().description('购买数量'),
                    // pay_password:Joi.string().required().description('支付密码')
                }, 
                params:{
                    id:Joi.string().required().description("种子ID")
                }
                
            }
        }
    },

      // 购买道具
       {
        method:'POST',
        path:'/goods/prop/buy/{id}',
        handler:goodsService.buyProp,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '购买道具',
            notes: '购买道具Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload: {
                    count: Joi.number().required().description('购买数量'),
                    // pay_password:Joi.string().required().description('支付密码')
                }, 
                params:{
                    id:Joi.string().required().description("种子ID")
                }
                
            }
        }
    },

     // 购买宠物
       {
        method:'POST',
        path:'/goods/dog/buy/{id}',
        handler:goodsService.buyDog,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '购买宠物',
            notes: '购买宠物Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("种子ID")
                }
                // payload:{
                //     pay_password:Joi.string().required().description('支付密码')
                // }
            }
        }
    },
        // 购买狗粮
       {
        method:'POST',
        path:'/goods/dogFood/buy',
        handler:goodsService.buyDogFood,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '购买狗粮',
            notes: '购买狗粮Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload: {
                    count: Joi.number().required().description('购买数量'),
                    // pay_password:Joi.string().required().description('支付密码')
                }
            }
        }
    },
    // 购买房屋
       {
        method:'POST',
        path:'/goods/house/buy/{id}',
        handler:goodsService.buyHouse,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '购买房屋',
            notes: '购买房屋Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("房屋ID")
                }
                // payload:{
                //     pay_password:Joi.string().required().description('支付密码')
                // }
            }
        }
    },


    // 确认购买成功
       {
        method:'POST',
        path:'/goods/areca/buy',
        handler:goodsService.buyAreca,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '购买种子',
            notes: '购买种子Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload: {
                    count: Joi.number().required().description('购买数量'),
                    // pay_password:Joi.string().required().description('支付密码')
                }
                
            }
        }
    },

    // 申请交易
    {
        method:'POST',
        path:'/goods/buybl',
        handler:goodsService.buyBL,
        config:{
            //拦截器
              //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '申请交易',
            notes: '申请交易Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload: {
                    token: Joi.string().required().description('用户Token'),
                    amount: Joi.string().required().description('花费金额'),
                    // opCode: Joi.string().required().description('用户USername'),
                    blnum: Joi.string().required().description('槟榔数量'),
                    // pay_password:Joi.string().required().description('支付密码')
                }
                
            }
            
        }
    },

     // 确认交易
    {
        method:'POST',
        path:'/goods/qrbuy',
        handler:goodsService.qrBuy,
        config:{
            //拦截器
  
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            // auth: false,
            description: '确认交易',
            notes: '确认交易Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload: {
                    seq: Joi.string().required().description('交易单号'),
                    pay_password:Joi.string().required().description('支付密码')
                }
                
            }
            
        }
    },

]