const Joi = require('joi');
const farmService = require('../service/farmService');
// 系统设置
  
module.exports = [
    // 植物标签
    {
        method:'GET',
        path:'/animal/tags',
        handler:farmService.tags,
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
        path:'/animal/seed/{id}',
        handler:farmService.tagPlant,
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
        path:'/animal/unlock/{id}',
        handler:farmService.unlockPlant,
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
                    id:Joi.string().description('植物ID')
                }
            }
        }
    },

     // 合成植物
    {
        method:'GET', 
        path:'/animal/cb/{id}',
        handler:farmService.cbPlant,
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
        path:'/animal/{code}',
        handler:farmService.plant,
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

    // 解锁植物
    {
        method:'GET',
        path:'/animal/userDetail/{id}',
        handler:farmService.userPlantDetail,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '植物详情',
            notes: '植物详情',
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
  
     // 收获预览
    {
        method:'GET',
        path:'/animal/harvestPreview/{id}',
        handler:farmService.harvestPreview,
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
        path:'/animal/harvest/{id}',
        handler:farmService.harvest,
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
        path:'/animal/oneKeyHarvest',
        handler:farmService.onekeyHarvest,
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
        path:'/animal/plt/steal/{id}',
        handler:farmService.plt_steal,
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
    },
    // 分享解锁土地
     {
        method:'POST',
        path:'/animal/land/share/{id}',
        handler:farmService.plt_steal,
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
    },
]