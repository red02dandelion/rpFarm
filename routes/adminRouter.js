const Joi = require('joi');
const adminService = require('../service/adminService');
module.exports = [ 
/*******  ADMIN API 管理员资源接口  start *******/
    //管理员登陆接口
    {
        method:'GET',
        path:'/admin/login',
        handler: adminService.Login,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ['ADMIN',"USER_REALATIONSHIP"]
            },
            description: '管理员登陆接口',
            notes: '管理员登陆接口',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    
    //获取管理员列表
    {
        method:'GET',
        path:'/admin/list',
        handler: adminService.getAdminList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '获取管理员列表',
            notes: '获取管理员资源列表',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    {
        method:'POST',
        path:'/admin',
        handler: adminService.addAdmin,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: [ "ROLE_MANAGE", "ADMIN_ADD_EDIT", "ADMIN_DELETE","ADMIN"]
            },
            description: '管理员添加',
            notes: '管理员添加接口',
            //tags: ['api'],
            validate: {
                payload: {
                    username: Joi.string().required().description('管理员账号'),
                    password: Joi.string().required().description('管理员密码'),
                    name: Joi.string().description('真实名称'),
                    state: Joi.number().default(1).description('管理员状态 0冻结 1 正常'),
                    headImg: Joi.string().default("").description('管理员头像'),
                    telephone: Joi.string().description('管理员手机号')
                    // roleId: Joi.string().required().description('角色id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    {
        method:'PUT',
        path:'/admin/{id}',
        handler: adminService.updateAdmin,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: [ 
                            "ADMIN", 
                            "ROLE_MANAGE", 
                            "ADMIN_ADD_EDIT"
                        ]
            },
            description: '管理员修改',
            notes: '管理员修改接口',
            //tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('管理员id')
                },
                payload: {
                    username: Joi.string().description('管理员账号'),
                    password: Joi.string().description('管理员密码'),
                    name: Joi.string().description('真实名称'),
                    state: Joi.number().description('管理员状态'),
                    headImg: Joi.string().description('管理员头像'),
                    telephone: Joi.string().description('管理员手机号'),
                    roleId: Joi.string().description('角色id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //删除某个管理员
    {
        method:'DELETE',
        path:'/admin/{id}',
        handler:adminService.delAdmin,
        config:{
            auth:{
                strategy: 'bearer',
                "scope" : [ 
                            "ADMIN", 
                            "ROLE_MANAGE", 
                            "ADMIN_ADD_EDIT"
                        ]
            },
            description: '删除管理员',
            notes: '删除管理员',
            //tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('管理员ID')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

/*******  ADMIN API 管理员资资源接口  end *******/


/********************* 用户管理 start ***************/
// 用户列表
    {
        method:'POST',
        path:'/admin/users/{page}/{size}',
        handler:adminService.userListFilter,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '用户列表',
            notes: '用户列表Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                },
                payload:{
                    where:Joi.object().description("查询条件"),
                },
            }
        }
    },
   
    // 用户详情
    {
        method:'GET',
        path:'/admin/user/{id}',
        handler:adminService.userdetail,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '用户详情',
            notes: '用户详情Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("用户Id")
                    // size:Joi.number().required().description('条数')
                }
            }
        }
    },

      // 更新用户
      {
        method:'PUT',
        path:'/admin/user/update/{userId}',
        handler:adminService.putUser,
        config:{
            auth: {
            strategy: 'bearer',
            scope: ["ADMIN","USER_ADD_EDIT"]
        },
        description: '编辑用户',
        notes: '编辑用户Api',
        //tags: ['api'],
        validate: {
            headers: Joi.object({
                'authorization': Joi.string().required().description('需要加token请求头')
            }).unknown(),
            payload:{
                // mobile:Joi.string().default("").description("电话号码"),
                name: Joi.string().description('交易用户密码'),
                // secondpwd:Joi.string().description('用户二级密码'),
                // transpwd:Joi.string().required().description('用户交易密码'),
                phone: Joi.string().description('用户密码'),
                address: Joi.string().description('地址'),
                // parentUsername:Joi.string().description("推荐人账号"),
                // weixin:Joi.string().default("").description("微信号"),
                // ali_number:Joi.string().default("").description("支付宝账号"),
                // bank:Joi.string().default("").description("开户行"),
                // bank_card:Joi.string().default("").description("卡号"),
                // bank_username:Joi.string().default("").description("开户行姓名"),
                state:Joi.number().default("").description("用户状态")
                // gold:Joi.number().default("").description("金币")
            },
            params:{
                userId:Joi.string().description('用户ID')
            }

        }
      }
    },

    //  // 用户详情
    // {
    //     method:'GET',
    //     path:'/admin/user/putTeam',
    //     handler:adminService.bianli2,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: '团队信息',
    //         notes: '团队信息Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown()
    //         }
    //     }
    // },

      // 用户详情用户名
    // {
    //     method:'GET',
    //     path:'/user/Chaone/{username}',
    //     handler:adminService.userNamedetail,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: ['ADMIN',"USER_REALATIONSHIP"]
    //         },
    //         description: '用户详情用户名',
    //         notes: '用户详情用户名Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 username:Joi.string().required().description("用户username")
    //                 // size:Joi.number().required().description('条数')
    //             }
    //         }
    //     }
    // },
     // 管理员充值
      {
        method:'PUT',
        path:'/admin/user/gold/{userId}',
        handler:adminService.adminRecharge,
        config:{
            auth: {
            strategy: 'bearer',
            scope: ["ADMIN","USER_ADD_EDIT"]
        },
        description: '管理员充值',
        notes: '管理员充值Api',
        // //tags: ['api'],
        validate: {
            headers: Joi.object({
                'authorization': Joi.string().required().description('需要加token请求头')
            }).unknown(),
            payload:{
                gold:Joi.number().default(0).description("金币"),
                power:Joi.number().default(0).description("体力"),
                dimond:Joi.number().default(0).description("钻石"),
                experience:Joi.number().default(0).description("经验"),
                hb:Joi.number().default(0).description("红包"),
                plt_sessence:Joi.number().default(0).description("植物精华")
            },
            params:{
                userId:Joi.string().description('用户ID')
            }

        }
      }
    },

    // // 会员图谱
    // {
    //     method:'GET',
    //     path:'/user/allfriend/{id}',
    //     handler:adminService.sons,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: ['ADMIN',"USER_REALATIONSHIP"]
    //         },
    //         description: '用户列表',
    //         notes: '用户列表Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
                   
    //                 id:Joi.string().required().description('用户名')

    //             },
                
    //         }
    //     }
    // },
    //  // 团队统计
    // {
    //     method:'GET',
    //     path:'/admin/user/team/{username}/{page}/{size}',
    //     handler:adminService.userList,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: '用户列表',
    //         notes: '用户列表Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 page:Joi.number().required().description("页数"),
    //                 size:Joi.number().required().description('条数'),
    //                 username:Joi.string().required().description('用户名')

    //             },
                
    //         }
    //     }
    // },

/********************* 用户管理 end  ***************/
/********************* 订单管理  ***************/

    // 充值订单
    {
        method:'POST',
        path:'/admin/recharge/list/{page}/{size}',
        handler:adminService.rechageList,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '充值列表',
            notes: '充值列表API',
            // //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                 
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },

    
/********************* 订单管理 end ****************/
// /************************** 游戏设置 *************/
    {
        method:'GET',
        path:'/admin/systemSet/info',
        handler:adminService.systemInfo,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '获取系统设置',
            notes: '获取系统设置Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
                
            }
        }
    },

    {
        method:'PUT',
        path:'/admin/systemSet',
        handler:adminService.putSystem,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '更新系统设置',
            notes: '更新系统设置Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    aplly:Joi.object().description('参数')
                }
                
            }
        }
    },
     
    /************************** 游戏设置 **************/

     // 植物列表
    {
        method:'GET',
        path:'/admin/tags',
        handler:adminService.tags,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员植物列表',
            notes: '管理员植物列表API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

     // 植物列表
    {
        method:'POST',
        path:'/admin/plants/{page}/{size}',
        handler:adminService.plantList,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员植物列表',
            notes: '管理员植物列表API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },


     // 动物列表
    {
        method:'POST',
        path:'/admin/animals/{page}/{size}',
        handler:adminService.animalList,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员植物列表',
            notes: '管理员植物列表API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },


    // 植物详情
    {
        method:'GET',
        path:'/admin/plant/{id}',
        handler:adminService.plantDetail,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员植物列表',
            notes: '管理员植物列表API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("页数")
                }
            }
        }
    },

    // 动物详情
    {
        method:'GET',
        path:'/admin/animal/{id}',
        handler:adminService.plantDetail,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员植物列表',
            notes: '管理员植物列表API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("页数")
                }
            }
        }
    },

       {
        method:'PUT',
        path:'/admin/plant/{id}',
        handler:adminService.putPlant,
        config:{
             auth: {
                strategy: 'bearer',
                scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
            },
            description: '修改植物',
            notes: '修改植物API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description('道具编号')
                },
                payload:{
                    name:Joi.string().description('植物名称'),
                    sortFlag:Joi.number().description('解锁顺序'),
                    img:Joi.string().description('图片'),
                    img1:Joi.string().description('无底框图片'),
                    qualityId:Joi.number().required().default(0).description('品质等级'),
                    animationId:Joi.number().required().description('动效ID'),
                    unlockTime:Joi.number().description('解锁次数'),
                    everyPrice:Joi.number().description('每次解锁花费金币'),
                    plantPrice:Joi.number().description('种植价格'),
                    needProp:Joi.number().description('种植所需道具ID'),
                    needCount:Joi.number().description('种植所需道具数量'),
                    growTime:Joi.number().description('成熟时间（s）'),
                    expirence:Joi.number().description('经验收益'),
                    firHb:Joi.number().description('首次种植获得红包额'),
                    hbRate:Joi.number().description('红包掉落概率'),
                    minHb:Joi.number().description('最低红包收益'),
                    maxHb:Joi.number().description('最高红包收益'),
                    minEssence:Joi.number().description('最低植物精华收益'),
                    maxEssence:Joi.number().description('最高植物精华收益'),
                    minGold:Joi.number().description('最低金币收益'),
                    maxGold:Joi.number().description('最高金币收益'),
                    stdExeRate:Joi.number().description('偷走经验几率'),
                    stdExeMaxPp:Joi.number().description('偷走经验比例上限'),
                    stdHbRate:Joi.number().description('偷走红包几率'),
                    stdHbMaxPp:Joi.number().description('偷走红包比例上限'),
                    stdEssRate:Joi.number().description('偷走精华几率'),
                    stdEssMaxPp:Joi.number().description('偷走精华比例上限'),
                    stdGoldMaxPp:Joi.number().description('偷走金币比例上限'),
                    dropId:Joi.number().description('掉落组ID')
                }
            }
        }
    },

     {
        method:'PUT',
        path:'/admin/animal/{id}',
        handler:adminService.putPlant,
        config:{
             auth: {
                strategy: 'bearer',
                scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
            },
            description: '修改植物',
            notes: '修改植物API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description('道具编号')
                },
                payload:{
                    name:Joi.string().description('植物名称'),
                    sortFlag:Joi.number().description('解锁顺序'),
                    img:Joi.string().description('图片'),
                    img1:Joi.string().description('无底框图片'),
                    qualityId:Joi.number().required().default(0).description('品质等级'),
                    animationId:Joi.number().required().description('动效ID'),
                    unlockTime:Joi.number().description('解锁次数'),
                    everyPrice:Joi.number().description('每次解锁花费金币'),
                    plantPrice:Joi.number().description('种植价格'),
                    needProp:Joi.number().description('种植所需道具ID'),
                    needCount:Joi.number().description('种植所需道具数量'),
                    growTime:Joi.number().description('成熟时间（s）'),
                    expirence:Joi.number().description('经验收益'),
                    firHb:Joi.number().description('首次种植获得红包额'),
                    hbRate:Joi.number().description('红包掉落概率'),
                    minHb:Joi.number().description('最低红包收益'),
                    maxHb:Joi.number().description('最高红包收益'),
                    minEssence:Joi.number().description('最低植物精华收益'),
                    maxEssence:Joi.number().description('最高植物精华收益'),
                    minGold:Joi.number().description('最低金币收益'),
                    maxGold:Joi.number().description('最高金币收益'),
                    stdExeRate:Joi.number().description('偷走经验几率'),
                    stdExeMaxPp:Joi.number().description('偷走经验比例上限'),
                    stdHbRate:Joi.number().description('偷走红包几率'),
                    stdHbMaxPp:Joi.number().description('偷走红包比例上限'),
                    stdEssRate:Joi.number().description('偷走精华几率'),
                    stdEssMaxPp:Joi.number().description('偷走精华比例上限'),
                    stdGoldMaxPp:Joi.number().description('偷走金币比例上限'),
                    dropId:Joi.number().description('掉落组ID')
                }
            }
        }
    },

    {
        method:'POST',
        path:'/admin/plant',
        handler:adminService.addPlant,
        config:{
             auth: {
                strategy: 'bearer',
                scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
            },
            description: '修改植物',
            notes: '修改植物API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
    
                payload:{
                    name:Joi.string().description('植物名称'),
                    sortFlag:Joi.number().required().description('解锁顺序'),
                    img:Joi.string().description('图片'),
                    img1:Joi.string().description('无底框图片'),
                    qualityId:Joi.number().description('品质等级'),
                    animationId:Joi.number().required().description('动效ID'),
                    unlockTime:Joi.number().default(0).description('解锁次数'),
                    everyPrice:Joi.number().description('每次解锁花费金币'),
                    plantPrice:Joi.number().description('种植价格'),
                    needProp:Joi.number().description('种植所需道具ID'),
                    needCount:Joi.number().description('种植所需道具数量'),
                    growTime:Joi.number().description('成熟时间（s）'),
                    expirence:Joi.number().description('经验收益'),
                    firHb:Joi.number().description('首次种植获得红包额'),
                    hbRate:Joi.number().description('红包掉落概率'),
                    minHb:Joi.number().description('最低红包收益'),
                    maxHb:Joi.number().description('最高红包收益'),
                    minEssence:Joi.number().description('最低植物精华收益'),
                    maxEssence:Joi.number().description('最高植物精华收益'),
                    minGold:Joi.number().description('最低金币收益'),
                    maxGold:Joi.number().description('最高金币收益'),
                    stdExeRate:Joi.number().description('偷走经验几率'),
                    stdExeMaxPp:Joi.number().description('偷走经验比例上限'),
                    stdHbRate:Joi.number().description('偷走红包几率'),
                    stdHbMaxPp:Joi.number().description('偷走红包比例上限'),
                    stdEssRate:Joi.number().description('偷走精华几率'),
                    stdEssMaxPp:Joi.number().description('偷走精华比例上限'),
                    stdGoldMaxPp:Joi.number().description('偷走金币比例上限'),
                    dropId:Joi.number().description('掉落组ID')
                }
            }
        }
    },

     {
        method:'POST',
        path:'/admin/animal',
        handler:adminService.addPlant,
        config:{
             auth: {
                strategy: 'bearer',
                scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
            },
            description: '修改植物',
            notes: '修改植物API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
    
                payload:{
                    name:Joi.string().description('植物名称'),
                    sortFlag:Joi.number().required().description('解锁顺序'),
                    img:Joi.string().description('图片'),
                    img1:Joi.string().description('无底框图片'),
                    qualityId:Joi.number().description('品质等级'),
                    animationId:Joi.number().required().description('动效ID'),
                    unlockTime:Joi.number().default(0).description('解锁次数'),
                    everyPrice:Joi.number().description('每次解锁花费金币'),
                    plantPrice:Joi.number().description('种植价格'),
                    needProp:Joi.number().description('种植所需道具ID'),
                    needCount:Joi.number().description('种植所需道具数量'),
                    growTime:Joi.number().description('成熟时间（s）'),
                    expirence:Joi.number().description('经验收益'),
                    firHb:Joi.number().description('首次种植获得红包额'),
                    hbRate:Joi.number().description('红包掉落概率'),
                    minHb:Joi.number().description('最低红包收益'),
                    maxHb:Joi.number().description('最高红包收益'),
                    minEssence:Joi.number().description('最低植物精华收益'),
                    maxEssence:Joi.number().description('最高植物精华收益'),
                    minGold:Joi.number().description('最低金币收益'),
                    maxGold:Joi.number().description('最高金币收益'),
                    stdExeRate:Joi.number().description('偷走经验几率'),
                    stdExeMaxPp:Joi.number().description('偷走经验比例上限'),
                    stdHbRate:Joi.number().description('偷走红包几率'),
                    stdHbMaxPp:Joi.number().description('偷走红包比例上限'),
                    stdEssRate:Joi.number().description('偷走精华几率'),
                    stdEssMaxPp:Joi.number().description('偷走精华比例上限'),
                    stdGoldMaxPp:Joi.number().description('偷走金币比例上限'),
                    dropId:Joi.number().description('掉落组ID')
                }
            }
        }
    },

                  // 删除植物
    {
        method:'DELETE',
        path:'/admin/plant/{id}',
        handler:adminService.delPlant,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '删除系统公告',
            notes: '删除系统公告API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
    
                params:{
                    id:Joi.string().required().description("id"),
                 
                }
            }
        }
    },

                   // 删除动物
    {
        method:'DELETE',
        path:'/admin/animal/{id}',
        handler:adminService.delPlant,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '删除系统公告',
            notes: '删除系统公告API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
    
                params:{
                    id:Joi.string().required().description("id"),
                 
                }
            }
        }
    },


    // 掉落组
    {
        method:'POST',
        path:'/admin/drops/{page}/{size}',
        handler:adminService.drops,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员掉落组',
            notes: '管理员掉落组Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },


    // 植物详情
    {
        method:'GET',
        path:'/admin/drop/{id}',
        handler:adminService.dropDetail,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员植物列表',
            notes: '管理员植物列表API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("页数")
                }
            }
        }
    },

      {
        method:'PUT',
        path:'/admin/drop/{id}',
        handler:adminService.putDrop,
        config:{
             auth: {
                strategy: 'bearer',
                scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
            },
            description: '修改掉落组',
            notes: '修改掉落组Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("页数")
                },
                payload:{
                    id:Joi.number().description('掉落组ID'),
                    propId:Joi.number().description('道具ID'),
                    rate:Joi.number().description("掉落几率"),
                    min:Joi.number().description("最少个数"),
                    max:Joi.number().description("最大个数")
                }
            }
        }
    },
     {
        method:'POST',
        path:'/admin/drop',
        handler:adminService.addDrop,
        config:{
             auth: {
                strategy: 'bearer',
                scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
            },
            description: '添加掉落组',
            notes: '添加掉落组Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    id:Joi.number().description('掉落组ID'),
                    propId:Joi.number().description('道具ID'),
                    rate:Joi.number().description("掉落几率"),
                    min:Joi.number().description("最少个数"),
                    max:Joi.number().description("最大个数")
                }
            }
        }
    },

        {
        method:'DELETE',
        path:'/admin/drop/{id}',
        handler:adminService.deleteDrop,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '删除系统公告',
            notes: '删除系统公告API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
    
                params:{
                    id:Joi.string().required().description("id"),
                 
                }
            }
        }
    },


    // 商品列表
    {
        method:'POST',
        path:'/admin/goods/list/{page}/{size}',
        handler:adminService.goodsList,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '商品列表',
            notes: '商品列表Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },


    // 商品详情
    {
        method:'GET',
        path:'/admin/goods/{id}',
        handler:adminService.goodsDetail,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '商品详情',
            notes: '商品详情API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("页数")
                }
            }
        }
    },

      {
        method:'PUT',
        path:'/admin/goods/{id}',
        handler:adminService.putGoods,
        config:{
             auth: {
                strategy: 'bearer',
                scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
            },
            description: '修改商品',
            notes: '修改商品Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("商品ID")
                },
                payload:{
                    u_class:Joi.number().description('解锁等级'),
                    name:Joi.string().description('名称'),
                    note:Joi.string().description('描述'),
                    img:Joi.string().description("图片"),
                    needProp:Joi.number().description("合成所需道具ID"),
                    needCount:Joi.number().description("所需道具数量"),
                    plt_sessence:Joi.number().description("植物精华"),
                    soldPrice:Joi.number().description("出售价格"),
                    item_id:Joi.string().description("真实商品ID"),
                    sendStrCount:Joi.number().description("起送数量"),
                    time:Joi.number().description("加工时间"),
                    sortFlag:Joi.number().description("排序")
                }
            }
        }
    },
     {
        method:'POST',
        path:'/admin/goods',
        handler:adminService.addGoods,
        config:{
             auth: {
                strategy: 'bearer',
                scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
            },
            description: '添加掉落组',
            notes: '添加掉落组Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    u_class:Joi.number().description('解锁等级'),
                    name:Joi.string().description('名称'),
                    note:Joi.string().description('描述'),
                    img:Joi.string().description("图片"),
                    needProp:Joi.number().description("合成所需道具ID"),
                    needCount:Joi.number().description("所需道具数量"),
                    plt_sessence:Joi.number().description("植物精华"),
                    soldPrice:Joi.number().description("出售价格"),
                    item_id:Joi.string().description("真实商品ID"),
                    sendStrCount:Joi.number().description("起送数量"),
                    time:Joi.number().description("加工时间"),
                    sortFlag:Joi.number().description("排序")
                }
            }
        }
    },


             // 删除商品
    {
        method:'DELETE',
        path:'/admin/goods/{id}',
        handler:adminService.deleteGoods,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '删除系统公告',
            notes: '删除系统公告API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
    
                params:{
                    id:Joi.string().required().description("id"),
                 
                }
            }
        }
    },

    // 土地解锁设置
    {
        method:'GET',
        path:'/admin/landUlcs',
        handler:adminService.landUlcS,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '商品列表',
            notes: '商品列表Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

      // 商品详情
    {
        method:'GET',
        path:'/admin/ulc/{id}',
        handler:adminService.ulcDetail,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '商品详情',
            notes: '商品详情API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("页数")
                }
            }
        }
    },

      {
        method:'PUT',
        path:'/admin/land/unlock/{id}',
        handler:adminService.putUlc,
        config:{
             auth: {
                strategy: 'bearer',
                scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
            },
            description: '修改解锁配置',
            notes: '修改解锁配置Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("记录ID")
                },
                payload:{
                    
                    cdtTpye:Joi.number().description('1 等级解锁 2 邀请解锁 3 钻石解锁'),
                    personClass:Joi.number().description('解锁等级'),
                    inviteCount:Joi.number().description("邀请数量"),
                    dimond:Joi.number().description("钻石数量")
                }
            }
        }
    },

     // 商品列表
    {
        method:'POST',
        path:'/admin/grows/{page}/{size}',
        handler:adminService.grows,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '商品列表',
            notes: '商品列表Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },


    // 成长表设置
    {
        method:'GET',
        path:'/admin/grow/{id}',
        handler:adminService.growDetail,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '商品详情',
            notes: '商品详情API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("页数")
                }
            }
        }
    },

      {
        method:'PUT',
        path:'/admin/grow/{id}',
        handler:adminService.putGrow,
        config:{
             auth: {
                strategy: 'bearer',
                scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
            },
            description: '修改个人成长表',
            notes: '修改个人成长表Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("商品ID")
                },
                payload:{
                    class:Joi.number().description('等级'),
                    nex_exe:Joi.number().description('升到下一级所需经验'),
                    upGradeGold:Joi.number().description('升级所需金币'),
                    hp:Joi.number().description("生命值"),
                    damage:Joi.number().description("伤害"),
                    vitality:Joi.number().description("气质"),
                    crit_rate:Joi.number().description("暴击率"),
                    crit_coefficient:Joi.number().description("暴击系数")
                }
            }
        }
    },

     {
        method:'POST',
        path:'/admin/grow',
        handler:adminService.addGrow,
        config:{
             auth: {
                strategy: 'bearer',
                scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
            },
            description: '添加掉落组',
            notes: '添加掉落组Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    class:Joi.number().description('等级'),
                    nex_exe:Joi.number().description('升到下一级所需经验'),
                    upGradeGold:Joi.number().description('升级所需金币'),
                    hp:Joi.number().description("生命值"),
                    damage:Joi.number().description("伤害"),
                    vitality:Joi.number().description("气质"),
                    crit_rate:Joi.number().description("暴击率"),
                    crit_coefficient:Joi.number().description("暴击系数")
                }
            }
        }
    },

              // 删除商品
    {
        method:'DELETE',
        path:'/admin/grow/{id}',
        handler:adminService.delGrow,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '删除系统公告',
            notes: '删除系统公告API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
    
                params:{
                    id:Joi.string().required().description("id"),
                 
                }
            }
        }
    },
 
     // 发货订单
    {
        method:'POST',
        path:'/admin/sendorders/{page}/{size}',
        handler:adminService.sendOrders,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '商品列表',
            notes: '商品列表Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },

       // 道具列表
    {
        method:'POST',
        path:'/admin/props/{page}/{size}',
        handler:adminService.props,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '商品列表',
            notes: '商品列表Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },
     // 植物详情
    {
        method:'GET',
        path:'/admin/prop/{id}',
        handler:adminService.propDetail,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员植物列表',
            notes: '管理员植物列表API',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("页数")
                }
            }
        }
    },

   

      {
        method:'PUT',
        path:'/admin/prop/{id}',
        handler:adminService.putProp,
        config:{
             auth: {
                strategy: 'bearer',
                scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
            },
            description: '修改掉落组',
            notes: '修改掉落组Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("页数")
                },
                payload:{
                    name:Joi.string().description('道具名称'),
                    img:Joi.string().description('道具ID'),
                    use:Joi.string().description("用途"),
                    des:Joi.string().description("描述"),
                    soldPrice:Joi.number().description("出售价格")
                }
            }
        }
    },
     {
        method:'POST',
        path:'/admin/prop',
        handler:adminService.addProp,
        config:{
             auth: {
                strategy: 'bearer',
                scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
            },
            description: '添加掉落组',
            notes: '添加掉落组Api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                payload:{
                    name:Joi.string().description('道具名称'),
                    img:Joi.string().description('道具ID'),
                    use:Joi.string().description("用途"),
                    des:Joi.string().description("描述"),
                    soldPrice:Joi.number().description("出售价格")
                }
            }
        }
    },

             // 删除商品
    {
        method:'DELETE',
        path:'/admin/prop/{id}',
        handler:adminService.deleteProp,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '删除系统公告',
            notes: '删除系统公告API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
    
                params:{
                    id:Joi.string().required().description("id"),
                 
                }
            }
        }
    },
    //    {
    //     method:'POST',
    //     path:'/admin/seeds',
    //     handler:adminService.seedlist,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: '种子列表',
    //         notes: '种子列表Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown()
                
    //         }
    //     }
    // },
    //     {
    //     method:'GET',
    //     path:'/admin/seed/{id}',
    //     handler:adminService.seedDetail,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: '种子详情',
    //         notes: '种子详情Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 id:Joi.string().required().description('种子ID')
    //             }
    //         }
    //     }
    // },
    // {
    //     method:'PUT',
    //     path:'/admin/seed/{id}',
    //     handler:adminService.putseed,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
    //         },
    //         description: '修改种子',
    //         notes: '修改种子Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 id:Joi.string().required().description('道具编号')
    //             },
    //             payload:{
    //                 price:Joi.number().description('种子价格'),
    //                 name:Joi.string().description('种子名称'),
    //                 steal_count:Joi.number().description('偷取次数'),
    //                 seasons:Joi.array().description('季节')
    //             }
    //         }
    //     }
    // },
    //  {
    //     method:'POST',
    //     path:'/admin/props',
    //     handler:adminService.propList,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: '道具列表',
    //         notes: '道具列表Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown()
                
    //         }
    //     }
    // },
    //    {
    //     method:'PUT',
    //     path:'/admin/prop/{id}',
    //     handler:adminService.putProp,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
    //         },
    //         description: '修改道具',
    //         notes: '修改道具Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 id:Joi.string().required().description('道具编号')
    //             },
    //             payload:{
    //                 price:Joi.number().description('道具价格'),
    //                 name:Joi.string().description('道具名称'),
    //                 ad:Joi.string().description("描述"),
    //             }
    //         }
    //     }
    // },
    // {
    //     method:'GET',
    //     path:'/admin/prop/{id}',
    //     handler:adminService.propDetail,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: '道具详情',
    //         notes: '道具详情Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 id:Joi.string().required().description('道具id')
    //             }
    //         }
    //     }
    // },
    //    {
    //     method:'GET',
    //     path:'/admin/house/{id}',
    //     handler:adminService.houseDetail,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: '房屋详情',
    //         notes: '房屋详情Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 id:Joi.string().required().description('道具id')
    //             }
    //         }
    //     }
    // },
    //  {
    //     method:'POST',
    //     path:'/admin/houses',
    //     handler:adminService.houselist,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: '房屋列表',
    //         notes: '房屋列表Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown()
                
    //         }
    //     }
    // },

    //   {
    //     method:'PUT',
    //     path:'/admin/house/{id}',
    //     handler:adminService.putHouse,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
    //         },
    //         description: '修改房屋',
    //         notes: '修改房屋Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 id:Joi.string().required().description('道具编号')
    //             },
    //             payload:{
    //                 price:Joi.number().description('道具价格'),
    //                 name:Joi.string().description('道具名称'),
    //                 up_bite_ratio:Joi.number().description('宠物抓人提升率'),
    //                 ad:Joi.string().description("描述")
    //             }
    //         }
    //     }
    //   }
    // ,
    //    {
    //     method:'GET',
    //     path:'/admin/dog/{id}',
    //     handler:adminService.dogDetail,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: '宠物详情',
    //         notes: '宠物详情Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 id:Joi.string().required().description('道具id')
    //             }
    //         }
    //     }
    // },
    //  {
    //     method:'POST',
    //     path:'/admin/dogs',
    //     handler:adminService.doglist,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: '宠物列表',
    //         notes: '宠物列表Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown()
                
    //         }
    //     }
    // },

    //   {
    //     method:'PUT',
    //     path:'/admin/dog/{id}',
    //     handler:adminService.putDog,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope:[ 'ADMIN', "SYSTEM_SET_EDIT"]
    //         },
    //         description: '修改宠物',
    //         notes: '修改宠物Api',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 id:Joi.string().required().description('道具编号')
    //             },
    //             payload:{
    //                 price:Joi.number().description('道具价格'),
    //                 name:Joi.string().description('道具名称'),
    //                 base_bite_ratio:Joi.number().description('宠物抓人提升率'),
    //                 ad:Joi.string().description("描述"),
    //                 hunger_bite_ratio:Joi.number().description("饥饿抓人率"),
                    
    //             }
    //         }
    //     }
    // },
     /************************** 游戏设置 - 道具设置**************/
     
     /************************** 财务统计 **************/
     // 购买记录
   
    {
        method:'POST',
        path:'/admin/buy/list/{page}/{size}',
        handler:adminService.buyList,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '购买记录',
            notes: '购买记录API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                 
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },

    // 收益记录
    {
        method:'POST',
        path:'/admin/income/list/{page}/{size}',
        handler:adminService.incomRecord,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '收益记录',
            notes: '收益记录API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                 
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },

      // 偷取记录
    {
        method:'POST',
        path:'/admin/steal/list/{page}/{size}',
        handler:adminService.stealList,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '偷取记录',
            notes: '偷取记录API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                 
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },
      //交易记录
    // {
    //     method:'POST',
    //     path:'/admin/trade/list/{page}/{size}',
    //     handler:adminService.tradeList,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: '交易记录',
    //         notes: '交易记录API',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 page:Joi.number().required().description("页数"),
    //                 size:Joi.number().required().description('条数')
                 
    //             },
    //             payload:{
    //                 where:Joi.object().description('筛选条件')
    //             }
    //         }
    //     }
    // },
         // 添加系统公告
    {
        method:'POST',
        path:'/admin/adboard',
        handler:adminService.addNotes,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '添加系统公告',
            notes: '添加系统公告',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
    
                payload:{
                    title:Joi.string().description('公告标题'),
                    content:Joi.string().description('公告内容')
                }
            }
        }
    },

             // 删除系统公告
    {
        method:'DELETE',
        path:'/admin/adboard/{id}',
        handler:adminService.delNote,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '删除系统公告',
            notes: '删除系统公告API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
    
                params:{
                    id:Joi.string().required().description("id"),
                 
                }
            }
        }
    },
// 更新系统公告
     {
        method:'PUT',
        path:'/admin/adboard/{id}',
        handler:adminService.putNote,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '更新系统公告',
            notes: '更新系统公告API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
    
                params:{
                    id:Joi.string().required().description("id"),
                 
                },
                payload:{
                    note:Joi.object().required().description('更新内容')
                }
            }
        }
    },

    
     // 公告列表
    {
        method:'POST',
        path:'/admin/notes/list/{page}/{size}',
        handler:adminService.noteList,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '公告列表',
            notes: '公告列表API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                 
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },
     // 公告详情
    {
        method:'GET',
        path:'/admin/note/{id}',
        handler:adminService.noteDetail,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '公告列表',
            notes: '公告列表API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    id:Joi.string().required().description("页数")  
                }
            }
        }
    },

     // 转账列表
    {
        method:'POST',
        path:'/admin/transfer/list/{page}/{size}',
        handler:adminService.transferList,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '转账记录',
            notes: '转账记录API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                 
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },

       // 交易记录
    {
        method:'POST',
        path:'/admin/trade/list/{page}/{size}',
        handler:adminService.tradeList,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '交易记录',
            notes: '交易记录API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                 
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },

    //   // 抽奖记录
    // {
    //     method:'POST',
    //     path:'/admin/award/list/{page}/{size}',
    //     handler:adminService.awardList,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: '抽奖记录',
    //         notes: '抽奖记录API',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 page:Joi.number().required().description("页数"),
    //                 size:Joi.number().required().description('条数')
    //             },
    //             payload:{
    //                 where:Joi.object().description('筛选条件')
    //             }
    //         }
    //     }
    // },


     // 交易记录
    // {
    //     method:'POST',
    //     path:'/admin/trade/list/{page}/{size}',
    //     handler:adminService.transferList,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: '转账记录',
    //         notes: '转账记录API',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 page:Joi.number().required().description("页数"),
    //                 size:Joi.number().required().description('条数')
                 
    //             },
    //             payload:{
    //                 where:Joi.object().description('筛选条件')
    //             }
    //         }
    //     }
    // },

     // 管理员充值记录
    {
        method:'POST',
        path:'/admin/rechargs/{page}/{size}',
        handler:adminService.adminRechargeList,
        config:{
             auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员充值记录',
            notes: '管理员充值记录API',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown(),
                params:{
                    page:Joi.number().required().description("页数"),
                    size:Joi.number().required().description('条数')
                },
                payload:{
                    where:Joi.object().description('筛选条件')
                }
            }
        }
    },

      //仪表盘
    {
        method:'GET',
        path:'/admin/dashbord',
        handler: adminService.dashBoard,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '仪表盘',
            notes: '仪表盘api',
            //tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //    // 管理员充值记录
    // {
    //     method:'POST',
    //     path:'/admin/recharge/list/{page}/{size}',
    //     handler:adminService.adminRechargeList,
    //     config:{
    //          auth: {
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: '抽奖记录',
    //         notes: '抽奖记录API',
    //         //tags: ['api'],
    //         validate: {
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown(),
    //             params:{
    //                 page:Joi.number().required().description("页数"),
    //                 size:Joi.number().required().description('条数')
    //             },
    //             payload:{
    //                 where:Joi.object().description('筛选条件')
    //             }
    //         }
    //     }
    // },
    
  

]