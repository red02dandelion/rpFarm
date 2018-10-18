const Joi = require('joi');
const gameSetService = require('../service/gameSetService');
  
module.exports = [
// 系统设置
    {
        method:'GET',
        path:'/system/info',
        handler:gameSetService.gameSetInfo,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '系统参数接口',
            notes: '系统参数接口',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
]