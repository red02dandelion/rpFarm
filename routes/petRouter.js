const Joi = require('joi');
const petService = require('../service/petService');
module.exports = [
     // 用户登录
    {
        method:'GET',
        path:'/pet/dog',
        handler:petService.dog,  // 我要写个一等潇洒人物
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '用户登陆接口',
            notes: '用户登陆接口',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
        {
        method:'GET',
        path:'/pet/feed',
        handler:petService.feedDog,  
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '用户登陆接口',
            notes: '用户登陆接口',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    {
        method:'GET',
        path:'/pet/upgrade',
        handler:petService.upDog,  
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '用户登陆接口',
            notes: '用户登陆接口',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    }
]