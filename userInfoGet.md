### API规则
* **生产环境URL**：``https://api.ws.cn/rest/{method}``
* **测试环境URL**：``https://t.api.ws.cn/rest/{method}``
* **method接口名称命名规则**：项目名、组别、功能名拼接的方式，例如 ``jmmall.app.getVersion``
* **提交方式**：POST
* **格式**：JSON
* **参数**：``Content-Type: application/json``

#### jmmall.farm.userInfo.get 获取用户信息

||游客|会员|代理|
|:---|:---:|:---:|:---:|
|权限|×|√|√|

* 功能：获取用户信息。
* 参数：

```json
{
    "h":{
        "t": "token",
        "c": "userid"
    },
	"d": {
    	"a": 1
    }
}
```
说明：

|名称|是否必须|类型|默认值|说明|示例|
|:---|:---:|:---|:---:|:---|:---|
|h|是|Object||||
|d.t|是|Str||token字符串||
|d.c|否|Str||当前用户userid(邀请码)||
|d|是|Object||||
|d.a|是|Int||1：获取用户信息|1|


* 返回值：

```json
{
	"c": 200,
    "d": {
    	"nikename": "拼拼侠JMAZ8az",
        "userid": "JMAZ8az",
        "level": {
            "memberLevel": 3,
            "levelName": "销售经理"
        },
        "avatar": "https://domain/avatar.jpg"
    }
}
```

|名称|是否必须|类型|默认值|说明|示例|
|:---|:---:|:---|:---:|:---|:---|
|c|否|Int|200|200：成功，此时可略c<br>301：token无效，须登录后继续操作<br>300：成功，但无数据，主要用于多页操作时判断<br>400：参数错误/超出范围/不可识别的命令/不可预见的错误/不成功<br>401：功能要求必须登录下调用，而此时未登录或未成功登录<br>402：功能要求会员权限，此时应弹出加入会员的引导页<br>403：功能要求代理权限，此时应弹出加入代理的引导页||
|d.nickname|是|Str||用户昵称，未设置或未登录时，为空。||
|d.userid|是|Str||用户编码(个人推荐码），规则: 8位{a-zA-Z0-9}|JMAZ8az|
|d.level.memberLevel|是|||代理等级编号<br>-1:游客; 0:会员; 1:店主; 2: ; 3:服务经理|3|
|d.level.levelName|是|||当前等级|服务经理|
|d.avatar|是|||会员头像的URL地址,支持又拍云切图功能。||
