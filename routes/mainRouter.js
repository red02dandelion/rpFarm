/**
 * 路由文件
 * Created by chenda on 2016/4/14.
 */
const Joi = require('joi');
const roleService = require('../service/roleService');
const adminService = require('../service/adminService')
const userService = require('../service/userService');
const smsService = require('../service/smsService');
const token = require('../service/validate');
// const goodService = require('../service/goodsService');
module.exports = [
 


    //token生成器
    {
        method:'POST',
        path:'/get/token',
        config:{
            auth:false,
            handler:token.getToken,
            description: '获取token接口',
            notes: '获取token接口',
            tags: ['api'],
            validate: {
                payload: {
                    username: Joi.string().default('admin').description('用户名'),
                    pwd: Joi.string().default('123456').description('密码'),
                    url:Joi.string().description("要访问的路径"),
                    userORadmin:Joi.string().default('admin').description('管理员还是用户 admin or user')
                }
            }
        }
    },


    
    // 对接测试
    {
        method:'POST',
        path:'/get/mac',
        config:{
            auth:false,
            handler:token.getMac,
            description: '对接测试',
            notes: '对接测试',
            //tags: ['api'],
            validate: {
                payload: {
                    userId:Joi.string().default('1').description('用户名'),
                    amount:Joi.string().default('1').description('密码'),
                    objid:Joi.string().required().default('2').description("要访问的路径"),
                    opcode:Joi.string().default('10010').description('管理员还是用户 admin or user'),
                    blnum:Joi.string().default('1').description('管理员还是用户 admin or user')
                }
            }
        }
    },

       //解密
    {
        method:'POST',
        path:'/get/aes/decrpt',
        config:{
            auth:false,
            handler:token.decrpt,
            description: 'jiemi',
            notes: 'jiemi接口',
            //tags: ['api'],
            validate: {
                payload: {
      
                    pwd: Joi.string().default('123456').description('密码'),

                }
            }
        }
    },

      //解密
    {
        method:'POST',
        path:'/get/aes/tydecrpt',
        config:{
            auth:false,
            handler:token.tydecrpt,
            description: 'jiemi',
            notes: 'jiemi接口',
            //tags: ['api'],
            validate: {
                payload: {
      
                    pwd: Joi.string().default('123456').description('密码'),

                }
            }
        }
    },

        //解密
    {
        method:'POST',
        path:'/get/aes/tyPaydecrpt',
        config:{
            auth:false,
            handler:token.tyPaydecrpt,
            description: 'jiemi',
            notes: 'jiemi接口',
            //tags: ['api'],
            validate: {
                payload: {
      
                    pwd: Joi.string().default('123456').description('密码'),

                }
            }
        }
    },
    /**  SMS 短信接口  start **/

    {
        method:'POST',
        path:'/sms/reg',
        config:{
            auth:false,
            handler:smsService.sendRegSMS,
            description: '发送注册验证码',
            notes: '发送注册验证码API',
            //tags: ['api'],
            validate: {
                payload: {
                    mobile: Joi.string().required().description('电话号码'),
                }
            }
        }
    },

/**  SMS 短信接口  end **/

/*******  ROLE API 角色资源操作接口  start *******/

    // //获取权限组列表
    // {
    //     method:'GET',
    //     path:'/privilage/group',
    //     //异步控制方法
    //     handler: roleService.getPrivilageGroup,
    //     config: {
    //         //拦截器
    //         auth: {
    //             strategy: 'bearer',
    //             scope: 'ROLE_MANAGE'
    //         },
    //         description: '获取权限组',
    //         notes: '获取权限组',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown()
    //         }
    //     }
    // },

    //获取角色列表
    {
        method:'GET',
        path:'/role/list',
        handler: roleService.roleList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ROLE_MANAGE'
            },
            description: '获取角色列表',
            notes: '获取角色资源列表',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // //增加角色
    // {
    //     method:'POST',
    //     path:'/role',
    //     handler: roleService.addRole,
    //     config: {
    //         //拦截器
    //         auth: {
    //             strategy: 'bearer',
    //             scope: 'ROLE_MANAGE'
    //         },
    //         description: '增加角色资源',
    //         notes: '增加角色资源',
    //         //tags: ['api'],
    //         validate: {
    //             payload: {
    //                 name: Joi.string().required().description('角色名称'),
    //                 note: Joi.string().description('角色描述'),
    //                 isShow: Joi.number().default(1).description('是否显示'),
    //                 level: Joi.number().default(1).description('角色等级'),
    //                 scope: Joi.array().required().description('权限字符串数组如：["ADMIN_ADD_EDUT","ROLE_MANAGE"]')
    //             },
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown()
    //         }
    //     }
    // },

    //修改角色
    // {
    //     method:'PUT',
    //     path:'/role/{roleId}',
    //     handler: roleService.updateRole,
    //     config: {
    //         //拦截器
    //         auth: {
    //             strategy: 'bearer',
    //             scope: 'ROLE_MANAGE'
    //         },
    //         description: '修改角色资源',
    //         notes: '修改角色资源',
    //         //tags: ['api'],
    //         validate: {
    //             params:{
    //                 roleId : Joi.string().required().description("路径参数：角色id，类型：字符串")
    //             },
    //             payload: {
    //                 name: Joi.string().description('角色名称'),
    //                 note: Joi.string().description('角色描述'),
    //                 scope: Joi.array().description('权限字符串数组如：["ADMIN_ADD_EDUT","ROLE_MANAGE"]')
    //             },
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown()
    //         }
    //     }
    // },

    // //删除角色
    // {
    //     method:'DELETE',
    //     path:'/role/{roleId}',
    //     handler: roleService.delRole,
    //     config: {
    //         //拦截器
    //         auth: {
    //             strategy: 'bearer',
    //             scope: 'ROLE_MANAGE'
    //         },
    //         description: '删除角色资源',
    //         notes: '删除角色资源',
    //         //tags: ['api'],
    //         validate: {
    //             params:{
    //                 roleId : Joi.string().required().description("路径参数：角色id，类型：字符串")
    //             },
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown()
    //         }
    //     }
    // },


/*******  ROLE API 角色资源操作接口  end *******/



   {
        method:'GET',
        path:'/admin/bianli',
        handler: adminService.bianli2,
        config: {
          //  拦截器
            auth: false,
            description: 'bianli',
            notes: 'bianli',
            //tags: ['api'],
        }
    },

]

var format = function(date) {

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10) ? '0' + month : month;
        var day = date.getDate();

        var hour = date.getHours();
        var minute = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes();
        //var minute = date.getMinutes();
        var second = (date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds();
        //var second = date.getSeconds();

        return year.toString()  + "-" + month.toString()  + "-" + day.toString() + " " +  hour.toString()  + ":" + minute.toString()  + ":" + second.toString();
    }
 

