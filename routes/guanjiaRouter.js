const Joi = require('joi');
const guanjiaService = require('../service/guanjiaService');

module.exports = [
   // 管家状态
    {
        method:'GET',
        path:'/guanjia/status',
        handler:guanjiaService.guanjiaStatus,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '植物详情',
            notes: '植物详情Api',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    // 管家状态
    {
        method:'GET',
        path:'/guanjia/start',
        handler:guanjiaService.startGuanjia,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '植物详情',
            notes: '植物详情Api',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
      // 管家状态
    {
        method:'GET',
        path:'/guanjia/harvest',
        handler:guanjiaService.gjharvest,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '植物详情',
            notes: '植物详情Api',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
       // 管家状态
    {
        method:'POST',
        path:'/guanjia/harvest/view',
        handler:guanjiaService.confirmHarvest,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '植物详情',
            notes: '植物详情Api',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    }
]