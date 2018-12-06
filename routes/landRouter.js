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
                    id:Joi.string().description('植物ID')
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

    // 解锁植物
    {
        method:'GET',
        path:'/plant/userDetail/{id}',
        handler:landService.userPlantDetail,
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
        handler:landService.onekeyHarvest,
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
        handler:landService.steal,
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
                     id:Joi.string().required().description("用户ID"),
                }
            }
        }
    },

        // 偷红包
    {
        method:'GET',
        path:'/plant/stealNews',
        handler:landService.stealNews,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '偷取',
            notes: '偷取Api',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
       // 阅读
    {
        method:'POST',
        path:'/plant/steal/read',
        handler:landService.readNews,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '阅读',
            notes: '阅读Api',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    ids:Joi.array().required().description('阅读偷取记录id')
                }
            }
        }
    },
    // 分享解锁土地
     {
        method:'POST',
        path:'/plant/land/share/{id}',
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
    },

     // 更新邀请土地状态
     {
        method:'POST',
        path:'/plant/land/share/put',
        handler:landService.updateSharelands,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '更新土地邀请解锁状态',
            notes: '更新土地邀请解锁状态api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

      // 分享进度查询
     {
        method:'GET',
        path:'/plant/land/share/{id}',
        handler:landService.shareProgress,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '分享进度查询',
            notes: '分享进度查询Api',
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
      // 分享配置查询
     {
        method:'POST',
        path:'/plant/land/share/settings',
        handler:landService.shareSettings,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '解锁查询',
            notes: '解锁查询Api',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    id:Joi.number().required().description('分享功能ID')
                }
            }
        }
    }
]