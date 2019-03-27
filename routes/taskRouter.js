const Joi = require('joi');
const taskService = require('../service/taskService');
module.exports = [ 
    //当前任务
    {
        method:'GET',
        path:'/task/task',
        handler: taskService.task,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '当前任务',
            notes: '当前任务',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //成长任务列表
    {
        method:'GET',
        path:'/task/growTasks',
        handler: taskService.growTasks,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '获取角色列表',
            notes: '获取角色资源列表',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

       //日常任务列表
    {
        method:'GET',
        path:'/task/dayTasks',
        handler: taskService.dayTask,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '获取角色列表',
            notes: '获取角色资源列表',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
         //成就任务列表
    {
        method:'GET',
        path:'/task/achiveTasks',
        handler: taskService.achiveTask,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '获取角色列表',
            notes: '获取角色资源列表',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 领取任务
    {
        method:'POST',
        path:'/task/receive',
        handler: taskService.receiveTask,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '获取角色列表',
            notes: '获取角色资源列表',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    id:Joi.string().description('任务id')
                }
            }
        }
    },
    
     // 领取奖励
    {
        method:'POST',
        path:'/task/award',
        handler: taskService.getAwarad,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '获取角色列表',
            notes: '获取角色资源列表',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    id:Joi.string().description('任务id')
                }
            }
        }
    },

]