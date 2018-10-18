const Joi = require('joi');
const actionService = require('../service/actionService');

module.exports = [

    // 放虫
       {
        method:'POST',
        path:'/areca/worm/{id}',
        handler:actionService.worm,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '放虫',
            notes: '放虫Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("槟榔树ID")
                }
                // payload:{
                //     fertilizer_id:Joi.string().required().description("种子ID")
                // }

            }
        }
    },



     // 杀虫
    {
        method:'POST',
        path:'/areca/insec/{id}',
        handler:actionService.insec,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '杀虫',
            notes: '杀虫Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("槟榔树ID")
                }

            }
        }
    },

    // 收获
    // {
    //     method:'POST',
    //     path:'/areca/harvest/{code}',
    //     handler:actionService.harvest,
    //     config:{
    //         //拦截器
    //         auth: {
    //             strategy: 'bearer',
    //             scope: 'USER'
    //         },
    //         description: '收获',
    //         notes: '收获Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                  code:Joi.number().required().description("地块号")
    //             }

    //         }
    //     }
    // },

     // 收获
    {
        method:'POST',
        path:'/areca/harvest',
        handler:actionService.oneKeyHarvest,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '收获',
            notes: '收获Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()

            }
        }
    },

      // 浇水
    {
        method:'POST',
        path:'/areca/water/{id}',
        handler:actionService.water,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '浇水',
            notes: '浇水Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("槟榔树ID")
                }

            }
        }
    },
        // 偷取
    {
        method:'POST',
        path:'/areca/steal/{areca_id}',
        handler:actionService.steal,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '偷取',
            notes: '偷取Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                     areca_id:Joi.string().required().description("槟榔树Id")
                }

            }
        }
    }
     
]