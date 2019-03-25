##服务器部署说明
### 环境要求 
##### 操作系统
为了避免打过多的补丁，项目希望运行在 windows server 2016 以上的操作系统上。
##### 运行环境
- [Node.js 6.10.2](https://nodejs.org/zh-cn/download/releases/)
- [MongoDB server 3.4.4](https://www.mongodb.com/download-center/community)
- [phpStudy 2016 ( PHP-5.4.45 )](http://phpstudy.php.cn/download.html)

### 部署方法
安装好必须的软件环境。

将数据库文件`dump`中包含的数据集合恢复到本地MongoDB数据库。

启动Mongodb，并指定数据的存储目录以及日志的输出目录。请注意：**数据库要进行权限控制，并以角色授权的方式开启。** 

相关指令：
```js 
db.createUser({user:"user",pwd:"pwd",roles:[{role:"readWrite",db:"db"}]}) 
```
服务端`app.js`里进行配置：

```js 
"url":"mongodb://user:pwd@127.0.0.1:27017/db"
```
 
运行服务端源码。**源码中不包含依赖的`node_modules`**，执行`npm i`安装依赖库。**服务所使用的端口须在云服务器中提前开启。**

将编译后的游戏前端源码、管理后台源码配置到`phpStudy`中并启动。**所需端口提前开启。**


### 数据备份
以计划任务的方式，每日执行脚本，对数据库进行自动备份。

### 注意事项
**数据库要进行权限控制，并以角色授权的方式开启。**
**打包的源码中不包含依赖的`node_modules`，执行`npm i`安装依赖库。**
**服务及前端页面所使用的端口须在服务器中提前开启。**
### 其它
如有问题，随时沟通。