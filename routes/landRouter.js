const Joi = require('joi');
const landService = require('../service/landService');
// 系统设置
  
module.exports = [
    // 植物标签
    {
        method:'GET',
        path:'/plant/tags',
        handler:landService.tags,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '植物标签列表',
            notes: '植物标签列表',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    // 标签下植物
    {
        method:'GET',
        path:'/plant/seed/{id}',
        handler:landService.tagPlant,
        config:{
            //拦截器
             
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '某标签下植物列表',
            notes: '某标签下植物列表',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.number().description('标签ID')
                }
            }
        }
    },
    // 解锁植物
    {
        method:'GET',
        path:'/plant/unlock/{id}',
        handler:landService.unlockPlant,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '某标签下植物列表',
            notes: '某标签下植物列表',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.number().description('植物ID')
                }
            }
        }
    },

     // 合成植物
    {
        method:'GET',
        path:'/plant/cb/{id}',
        handler:landService.cbPlant,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '合成植物',
            notes: '合成植物',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().description('植物ID')
                }
            }
        }
    },
    // 种植
    {
        method:'POST',
        path:'/plant/{code}',
        handler:landService.plant,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '种植植物',
            notes: '种植植物Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    code:Joi.number().description('土地编号 传0则自动选择可种植的土地')
                },
                payload:{
                    id:Joi.string().description('种子ID')
                }
            }
        }
    },
  
     // 收获预览
    {
        method:'GET',
        path:'/plant/harvestPreview/{id}',
        handler:landService.harvestPreview,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '收获预览',
            notes: '收获预览',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().description('土地ID')
                }
            }
        }
    },
    // 收获
    {
        method:'GET',
        path:'/plant/harvest/{id}',
        handler:landService.harvest,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '收获单个土地',
            notes: '收获单个土地Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().description('要收取的土地ID')
                }
            }
        }
    },
    // 一键收获
    {
        method:'GET',
        path:'/plant/oneKeyHarvest',
        handler:landService.harvest,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '一键收获',
            notes: '一键收获',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
        // 偷红包
    {
        method:'POST',
        path:'/plant/plt/steal/{id}',
        handler:landService.plt_steal,
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
                     id:Joi.string().required().description("土地ID")
                }
            }
        }
    }
]