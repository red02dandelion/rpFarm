const Joi = require('joi');
const userService = require('../service/userService');

module.exports = [
	/*******  USER API 用户资源接口  start *******/

    // 用户登录
    {
        method:'GET',
        path:'/user/login',
        handler:userService.userLogin,
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
    // 用户登录
    {
        method:'GET',
        path:'/user/ability',
        handler:userService.userAlibilty,
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
    //  // paipaiTest
    // {
    //     method:'GET',
    //     path:'/user/paipaiTest',
    //     handler:userService.paipaiServer,
    //     config:{
    //         //拦截器
    //         auth:false,
    //         description: '派派测试',
    //         notes: '派派测试Api',
    //         //tags: ['api']
    //     }
    // },
 // 仓库
    {
        method:'GET',
        path:'/user/warahouse',
        handler:userService.warahouse,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            }, 
            description: '仓库',
            notes: '仓库',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
     // 仓库
    {
        method:'GET',
        path:'/user/warahouse/detail',
        handler:userService.warahouse,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            }, 
            description: '仓库',
            notes: '仓库',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
     // paipaiTest
    {
        method:'GET',
        path:'/user/saveTest',
        handler:userService.saveTest,
        config:{
            //拦截器
            auth:false,
            description: '派派测试',
            notes: '派派测试Api',
            //tags: ['api']
        }
    },

     // paipaiTest
    {
        method:'GET',
        path:'/user/updateTest',
        handler:userService.updateTest,
        config:{
            //拦截器
            auth:false,
            description: '派派测试',
            notes: '派派测试Api',
            //tags: ['api']
        }
    },

       // 服务端同步
    {
        method:'GET',
        path:'/user/serverUpto/{userid}/{token}',
        handler:userService.serverUpto,
        config:{
            //拦截器
            auth:false,
            description: '同步用户',
            notes: '同步用户',
            //tags: ['api'],
            validate: {
                 params:{
                    userid:Joi.string().description('用户id'),
                    token:Joi.string().description('TOKEN')
                }
            }
        }
    },

     // 升级
    {
        method:'GET',
        path:'/user/upgrade',
        handler:userService.upgrade,
        config:{
            //拦截器
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            },
            description: '升级',
            notes: '升级',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
       // 同步用户
    {
        method:'POST',
        path:'/user/upto',
        handler:userService.upto,
        config:{
            //拦截器
            auth: false,
            description: '同步用户',
            notes: '同步用户',
            //tags: ['api'],
            validate: {
                payload:{
                    username:Joi.string().description('app唯一标识'),
                    nickname:Joi.string().description('昵称'),
                    friends:Joi.array().description('好友列表'),
                    ali_number:Joi.string().description('支付宝账号'),
                    // mobile:Joi.string().description('手机号'),
                    step:Joi.string().description('昨日步数'),
                    aixin_gold:Joi.string().description('爱信币')
                }
            }
        }
    },

       // 测试数据
    {
        method:'GET',
        path:'/user/testInfo/{username}',
        handler:userService.testInfo,
        config:{
            //拦截器
            auth: false,
            description: '测试用户旧数据',
            notes: '测试用户旧数据接口',
            //tags: ['api'],
            validate: {
                params:{
                    username:Joi.string().required().description("用户id")
                }
            }
        }
    },

//    // 注册用户
//     {
//        method:'POST',
//        path:'/user/register',
//        handler:userService.rigister,
//        config:{
//            auth:false,
//            description: '注册用户',
//            notes: '注册用户',
//            //tags: ['api'],
//            validate: {
//                payload: {
//                     username: Joi.string().required().description('用户账号'),
//                     mobile:Joi.string().required().description("电话号码"),
//                     pay_password: Joi.string().required().description('交易用户密码'),
//                     // secondpwd:Joi.string().description('用户二级密码'),
//                     // transpwd:Joi.string().required().description('用户交易密码'),
//                     smscode: Joi.string().required().description('短信验证码'),
//                     password: Joi.string().required().description('用户密码'),
//                     nickname: Joi.string().required().description('昵称'),
//                     parentUsername:Joi.string().description("推荐人账号"),
//                     weixin:Joi.string().default("").description("微信号"),
//                     ali_number:Joi.string().default("").description("支付宝账号"),
//                     bank:Joi.string().default("").description("开户行"),
//                     bank_card:Joi.string().default("").description("卡号"),
//                     bank_username:Joi.string().default("").description("开户行姓名")
//                }
//            }
//        }
//     },



      // 更新用户信息
    {
       method:'POST',
       path:'/user/updateUser',
       handler:userService.putUser,
       config:{
           auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
           description: '更新用户信息',
           notes: '更新用户信息',
           //tags: ['api'],
           validate: {
               payload: {
                    phone:Joi.string().default("").description("快递电话"),
                    address: Joi.string().description('交易用户密码'),
                    name: Joi.string().description('真实姓名')
               }
           }
       }
    },

  

    //   // 更新登录密码
    // {
    //    method:'POST',
    //    path:'/user/putPwd',
    //    handler:userService.putPassword,
    //    config:{
    //        auth: {
    //             strategy: 'bearer',
    //             scope: 'USER'
    //         },
    //        description: '更新登录密码',
    //        notes: '更新登录密码',
    //        //tags: ['api'],
    //        validate: {
    //            payload: {
    //                 oldPwd: Joi.string().required().description('旧密码'),
    //                 password: Joi.string().required().description('新密码')   
    //            }
    //        }
    //    }
    // },
    
      // 更新支付密码
    {
       method:'POST',
       path:'/user/setPayPwd',
       handler:userService.putPayPassword,
       config:{
           auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
           description: '更新支付密码',
           notes: '更新支付密码',
           //tags: ['api'],
           validate: {
               payload: {
                    oldPwd: Joi.string().required().description('旧密码'),
                    pay_password: Joi.string().required().description('新密码')   
               }
           }
       }
    },
    // // 土地列表
    // {
    //     method:'GET',
    //     path:'/user/lands',
    //     handler:userService.landInfo,
    //     config:{
    //         //拦截器
    //         auth: {
    //             strategy: 'bearer',
    //             scope: 'USER'
    //         },
    //         description: '土地列表',
    //         notes: '土地列表Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown()
    //         }
    //     }
    // },
   
    //    // 装备宠物
    // {
    //     method:'GET',
    //     path:'/user/dogUse/{id}',
    //     handler:userService.dogUse,
    //     config:{
    //         //拦截器
    //         auth: {
    //             strategy: 'bearer',
    //             scope: 'USER'
    //         },
    //         description: '装备宠物',
    //         notes: '装备宠物Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 id:Joi.string().required().description("宠物ID")
    //             }
    //         }
    //     }
    // },

      // 装备房屋
    // {
    //     method:'GET',
    //     path:'/user/houseUse/{id}',
    //     handler:userService.houseUse,
    //     config:{
    //         //拦截器
    //         auth: {
    //             strategy: 'bearer',
    //             scope: 'USER'
    //         },
    //         description: '装备宠物',
    //         notes: '装备宠物Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 id:Joi.string().required().description("房屋ID")
    //             }
    //         }
    //     }
    // },
    
    // //用户信息
    // {
    //     method:'GET',
    //     path:'/user/info/{type}',
    //     handler:userService.user_info,
    //     config:{
    //         //拦截器
    //         auth: {
    //             strategy: 'bearer',
    //             scope: 'USER'
    //         },
    //         description: '用户登陆接口',
    //         notes: '用户登陆接口',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 type:Joi.number().required().description("需要传土地类型")
    //             }
    //         }
    //     }
    // },
//       //用户信息
//     {
//         method:'GET',
//         path:'/user/out_info',
//         handler:userService.out_info,
//         config:{
//             //拦截器
//             auth: {
//                 strategy: 'bearer',
//                 scope: 'USER'
//             },
//             description: '出局信息接口',
//             notes: '出局信息接口',
//             //tags: ['api'],
//             validate: {
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
            
//             }
//         }
//     },
    
//     //获取用户列表
//     {
//         method:'GET',
//         path:'/user/list/{page}/{size}',
//         handler:userService.getUserList,
//         config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["ADMIN"] //or ["user",admin]
//             },
//             description: '获取用户列表',
//             notes: '获取用户资源列表',
//             //tags: ['api'],
//             validate: {
//                 params:{
//                     page : Joi.string().default("0").description("页数"),
//                     size : Joi.string().default("0").description("长度")
//                 },
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
//             }
//         }
//     },

//     //添加用户
//     {
//         method:'POST',
//         path:'/user/addUser',
//         handler:userService.rigister,
//         config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["USER","ADMIN"]
//             },
//             description: '添加用户',
//             notes: '添加用户',
//             //tags: ['api'],
//             validate: {
//                 payload: {
//                     username: Joi.string().required().description('用户账号'),
//                     mobile:Joi.string().default("").description("电话号码"),
//                     pay_password: Joi.string().required().description('交易用户密码'),
//                     // secondpwd:Joi.string().description('用户二级密码'),
//                     // transpwd:Joi.string().required().description('用户交易密码'),
//                     password: Joi.string().required().description('用户密码'),
//                     nickname: Joi.string().description('昵称'),
                   
//                     parentUsername:Joi.string().description("推荐人账号"),
//                     // parentTranpwd:Joi.string().description('推荐人交易密码'),
//                     // email:Joi.string().default("").description("邮箱号"),
//                     weixin:Joi.string().default("").description("微信号"),
//                     pay_number:Joi.string().default("").description("支付宝账号"),
//                 },
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
//             }
//         }
//     },


//     //删除某个用户
//     {
//         method:'DELETE',
//         path:'/user/{id}',
//         handler:userService.delUser,
//         config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: "ADMIN"
//             },
//             description: '删除用户',
//             notes: '删除用户',
//             //tags: ['api'],
//             validate: {
//                 params: {
//                     id: Joi.string().required().description('用户id')
//                 },
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
//             }
//         }
//     },

//     //更新某个用户
//     {
//         method:'POST',
//         path:'/user/{id}',
//         handler:userService.updateUser,
//         config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["ADMIN","USER"]
//             },
//             description: '修改用户',
//             notes: '修改用户',
//             //tags: ['api'],
//             validate: {
//                 params: {
//                     id: Joi.string().required().description('用户id')
//                 },
//                 payload: {
//                     oldpwd:Joi.string().description('旧交易密码'),
//                     password: Joi.string().description('用户密码'),
//                     pay_password:Joi.string().description('用户交易密码'),
//                     nickname: Joi.string().description('用户姓名'),
//                     mobile:Joi.string().description("电话号码"),
//                     // email:Joi.string().description("邮箱号"),
//                     weixin:Joi.string().description("微信号"),
//                     pay_number:Joi.string().description("支付宝账号"),
//                     bank:Joi.string().description("银行"),
//                     card_number:Joi.string().description("银行卡号"),
//                 },
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
//             }
//         }
//     },

//     //更新某个用户
//     {
//         method:'POST',
//         path:'/user/admin/{id}',
//         handler:userService.updateUser,
//         config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["ADMIN","USER"]
//             },
//             description: '修改用户',
//             notes: '修改用户',
//             //tags: ['api'],
//             validate: {
//                 params: {
//                     id: Joi.string().required().description('用户id')
//                 },
//                 payload: {
//                     username: Joi.string().description('用户账号'),
//                     oldpwd:Joi.string().description('旧交易密码'),
//                     password: Joi.string().description('用户密码'),
//                     secondpwd:Joi.string().description('用户二级密码'),
//                     tranpwd:Joi.string().description('用户交易密码'),
//                     name: Joi.string().description('用户姓名'),
//                     mobile:Joi.string().description("电话号码"),
//                     email:Joi.string().description("邮箱号"),
//                     wechat:Joi.string().description("微信号"),
//                     alipay:Joi.string().description("支付宝账号"),
//                     note:Joi.string().description("账号说明"),
//                     state:Joi.number().description("用户状态0为冻结，1存在"),
//                     gold:Joi.number().description("用户积分"),
//                     mermaid:Joi.number().description("美人鱼个数")
//                 },
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
//             }
//         }
//     },

  //   同意申请
    {
        method:'GET',
        path:'/user/search/{username}',
        handler:userService.searchUser,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            }, 
            description: '搜索用户',
            notes: '搜索用户',
            tags: ['api'],
            validate: {
                 headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    username:Joi.string().required().description('username')
                }
                
            }
        }
    },

    // 添加好友
    {
        method:'POST',
        path:'/user/friend/{username}',
        handler:userService.addFriend,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            }, 
            description: '添加好友',
            notes: '添加好友',
            //tags: ['api'],
            validate: {
                 headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    username:Joi.string().required().description('userID')
                }
            }
        }
    },
    //  获取好友申请列表
    {
        method:'GET',
        path:'/user/apllys',
        handler:userService.apllyList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            }, 
            description: '获取用户申请列表',
            notes: '获取用户申请列表',
            //tags: ['api'],
            validate: {
                 headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //   同意申请
    {
        method:'POST',
        path:'/user/aplly/{id}',
        handler:userService.receveFriend,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            }, 
            description: '同意申请',
            notes: '同意申请',
            //tags: ['api'],
            validate: {
                 headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description('apllyId')
                },
                 payload: {
                     status:Joi.number().required().description('状态')
                 }
                
            }
        }
    },

     //获取用户好友列表
    {
        method:'GET',
        path:'/user/friends/{page}/{size}',
        handler:userService.getUserFriend,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            }, 
            description: '获取用户好友列表',
            notes: '获取用户好友列表',
            //tags: ['api'],
            validate: {
                 headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page : Joi.number().default(0).description("页数"),
                    size : Joi.number().default(0).description("长度")
                },                
            }
        }
    },

    // 删除好友
    // {
    //     method:'POST',
    //     path:'/user/friends/del/{id}',
    //     handler:userService.delFriend,
    //     config:{
    //         auth:{
    //             strategy: 'bearer',
    //             scope: ["USER"]
    //         }, 
    //         description: '获取用户好友列表',
    //         notes: '获取用户好友列表',
    //         //tags: ['api'],
    //         validate: {
    //              headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 id:Joi.string().required().description('用户ID')
    //             }
    //         }
    //     }
    // },


    
    // 好友信息
       {
        method:'GET',
        path:'/user/friend/{userId}',
        handler:userService.friendInfo,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            }, 
            description: '好友信息',
            notes: '好友信息Api',
            //tags: ['api'],
            validate: {
                 headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    userId:Joi.string().required().description('用户ID')
                }
            }
        }
    },


        


        // 用户槟榔数
       {
        method:'POST',
        path:'/user/iareca/md5',
        handler:userService.tokenMd5,
        config:{
            auth:false, 
            description: '用户槟榔数',
            notes: '用户槟榔数Api',
            //tags: ['api'],
            validate: {
                payload:{
                    userId:Joi.string().required().description('用户ID'),
                    token:Joi.string().required().description('token')
                }
            }
        }
    },
    //     // 用户土地
    //    {
    //     method:'GET',
    //     path:'/user/lands/{userId}',
    //     handler:userService.userLands,
    //     config:{
    //         auth:{
    //             strategy: 'bearer',
    //             scope: ["USER"]
    //         }, 
    //         description: '用户土地',
    //         notes: '用户土地Api',
    //         //tags: ['api'],
    //         validate: {
    //              headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 userId:Joi.string().required().description('用户ID')
    //             }
    //         }
    //     }
    // },


//      //获取用户好友列表
//     {
//         method:'GET',
//         path:'/user/teafriends/{land_type}',
//         handler:userService.teaFriends,
//         config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["USER"]
//             }, 
//             description: '获取用户好友列表',
//             notes: '获取用户好友列表',
//             //tags: ['api'],
//             validate: {
//                  headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown(),
//                 params:{
//                     land_type:Joi.number().required().description('传递园区类型')
//                 }
//             }
//         }
//     },
//     //搜索用户好友的数据列表
//     {
//         method:'POST',
//         path:'/user/friends/search',
//         handler:userService.getSearchFriendsList,
//         config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["USER"]
//             },
//             description: '搜索用户数据列表',
//             notes: '搜索用户数据列表',
//             //tags: ['api'],
//             validate: {
//                 payload: {
//                     keyword: Joi.string().description('搜索关键词')
//                 },
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
//             }
//         }
//     },

//     //搜索用户数据列表
//     {
//         method:'POST',
//         path:'/user/search/{page}/{size}',
//         handler:userService.getSearchList,
//         config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["ADMIN"]
//             },
//             description: '搜索用户数据列表',
//             notes: '搜索用户数据列表',
//             //tags: ['api'],
//             validate: {
//                 params:{
//                     page : Joi.string().default("0").description("页数"),
//                     size : Joi.string().default("0").description("长度")
//                 },
//                 payload: {
//                     where: Joi.object().description('搜索')
//                 },
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
//             }
//         } 
//     },

//     //排序用户数据列表
//     {
//         method:'POST',
//         path:'/user/order/{page}/{size}',
//         handler:userService.getOrderList,
//         config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["ADMIN"]
//             },
//             description: '排序用户数据列表',
//             notes: '排序用户数据列表',
//             //tags: ['api'],
//             validate: {
//                 params:{
//                     page : Joi.string().default("0").description("页数"),
//                     size : Joi.string().default("0").description("长度")
//                 },
//                 payload: {
//                     where: Joi.object().description('搜索')
//                 },
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
//             }
//         } 
//     },
//     //获取某个用户
//     {
//        method:'GET',
//        path:'/user/{id}',
//        handler:userService.getUser,
//        config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["ADMIN"]
//             },
//             description: '获取某个用户',
//             notes: '获取某个用户',
//             //tags: ['api'],
//             validate: {
//                 params: {
//                     id: Joi.string().required().description('用户id')
//                 },
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
//             }
//         }
//     }, 

//     //偷取好友金币
//     {
//         method:'POST',
//         path:'/user/steal/{id}',
//         handler:userService.stealUser,
//         config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["USER"]
//             },
//             description: '偷取好友仙桃',
//             notes: '偷取好友仙桃',
//             //tags: ['api'],
//             validate: {
//                  params: {
//                     id: Joi.string().required().description('偷取用户id')
//                 },
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头'),
//                 }).unknown()
//             }
//         }
//     },
// //一键采蜜
//     {
//         method:'GET',
//         path:'/user/stealAll',
//         handler:userService.allStealUser,
//         config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["USER"]
//             }, 
//             description: '一键采蜜功能',
//             notes: '一键采蜜功能',
//             //tags: ['api'],
//             validate: {
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
//             }
//         }
//     },
// //订购一键采蜜

//     {
//      method:'GET',
//        path:'/user/shopStealAll',
//        handler:userService.shopStealUser,
//        config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["USER"]
//             },
//             description: '订购一键采蜜',
//             notes: '订购一键采蜜',
//             //tags: ['api'],
//             validate: {
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
//             }
//         }
//     }, 

//     //添加用户
//     {
//         method:'POST',
//         path:'/user/admin',
//         handler:userService.addAdminUser,
//         config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["ADMIN"]
//             },
//             description: '添加用户',
//             notes: '添加用户',
//             //tags: ['api'],
//             validate: {
//                 payload: {
//                     username: Joi.string().required().description('用户账号'),
//                     password: Joi.string().required().description('用户密码'),
//                     secondpwd:Joi.string().description('用户二级密码'),
//                     tranpwd:Joi.string().required().description('用户交易密码'),
//                     name: Joi.string().description('用户姓名'),
//                     mobile:Joi.string().default("").description("电话号码"),
//                     parentUsername:Joi.string().description("推荐人用户名"),
//                     parentTranpwd:Joi.string().description('推荐人交易密码'),
//                     email:Joi.string().default("").description("邮箱号"),
//                     wechat:Joi.string().default("").description("微信号"),
//                     alipay:Joi.string().default("").description("支付宝账号"),
//                     note:Joi.string().default("").description("账号说明"),
//                     state:Joi.number().default(1).description("用户状态0为冻结，1存在"),
//                     gold:Joi.number().default(0).description("用户积分"),
//                     mermaid:Joi.number().default(0).description("美人鱼个数"),
//                     remdNumber:Joi.number().default(0).description("推荐人数")
//                 },
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
//             }
//         }
//     },

//  // 充值会员

//     {
//      method:'POST',
//        path:'/user/buyVip',
//        handler:userService.buyVip,
//        config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["USER"]
//             },
//             description: '订购一键采蜜',
//             notes: '订购一键采蜜',
//             //tags: ['api'],
//             validate: {
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown(),
//                 payload:{
//                     time:Joi.number().required().description('需要购买的时间'),
//                     walletType:Joi.number().description("购买数量"),
//                     device:Joi.number().description("终端类型")
//                 }
//             }
//         }
//     },

//     // 充值会员支付状态查询

//     {
//      method:'GET',
//        path:'/user/vip/{order_no}',
//        handler:userService.vipStatus,
//        config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["USER"]
//             },
//             description: '查询充值支付状态',
//             notes: '查询充值支付状态',
//             //tags: ['api'],
//             validate: {
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown(),
//                params:{
//                    order_no:Joi.string().required().description('充值编号')
//                }
//             }
//         }
//     },

// // 充值记录 vipRechargeList
//    {
//      method:'GET',
//        path:'/user/vip-records',
//        handler:userService.vipRechargeList,
//        config:{
//             auth:{
//                 strategy: 'bearer',
//                 scope: ["USER"]
//             },
//             description: '订购一键采蜜',
//             notes: '订购一键采蜜',
//             //tags: ['api'],
//             validate: {
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
//             }
//         }
//     },

// /*******  USER API 用户资源接口  end *******/
//  //仓库列表
//     {
//         method:'GET',
//         path:'/user/warahouses',
//         handler:userService.userwarahouse,
//         config:{
//              auth: {
//                 strategy: 'bearer',
//                 scope: 'USER'
//             },
//             // auth:false,
//             description: '购买物品',
//             notes: '购买物品Api',
//             //tags: ['api'],
//             validate: {
//                 headers: Joi.object({
//                     'authorization': Joi.string().required().description('需要加token请求头')
//                 }).unknown()
//             }
//         }
//     },
]