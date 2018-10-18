const Joi = require('joi');
const grouthService = require('../service/grouthService');
module.exports = [
   // 植物详情
    {
        method:'GET',
        path:'/areca/info/{id}',
        handler:grouthService.grouthArecaInfo,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '植物详情',
            notes: '植物详情Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                     id:Joi.number().required().description("槟榔")
                }
            }
        }
    }
]