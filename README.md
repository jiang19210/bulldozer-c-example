# bulldozer-c-example

#### 项目介绍
爬虫客户端:https://github.com/jiang19210/bulldozer-c
爬虫服务端:https://github.com/jiang19210/bulldozer
****
#### 软件架构
![avatar](https://github.com/jiang19210/data/blob/master/bulldozer.png?raw=true)
****
#### 安装教程
1. 服务端安装：https://github.com/jiang19210/bulldozer
2. 执行npm install

#### 使用说明 mysql建表语句见sql.sql
1. node dianping_one.js 
2. node dianping_task.js 

*******************
全局变量说明：
1. global.HANDLER_CONTEXT_HEARDES 请求的头信息，既Heardes
2. global.TASK_SCHEDULE_ENABLE和global.TASK_SCHEDULE_STOP组成任务调度开关，默认都为true，只有都为true的时候任务才会正常运行
3. global.http_proxy = {'host': proxy.ipaddr, 'port': proxy.port}设置全局代理
4. 继承方法BulldozerC.prototype.withProxy，设置此次请求代理


******************
******************
******************
如有问题可以联系我：微信：814475047，邮箱：814475047@qq.com
******************
******************