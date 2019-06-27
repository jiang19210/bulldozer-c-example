/****
 *   *****抓取大众点评数据，并存储入库mysql和mongodb，主要数据：店铺id，店铺url，店铺所在城市，店铺名称*****
 *  注意：大众点评有可能会中风控，此例子并没有处理大众点评的风控，假设一切正常访问
 * （1）抓取http://www.dianping.com/hangzhou/ch10/r1665页面所有的链接地址、星级，将数据作为模板数据存储在redis中
 * （2）从redis中读取模板数据并进行抓取详情页面的店铺名称、店铺id并存储在数据库中
 * */

var queue_url = 'dianping_test_queue';
const BulldozerC = require('bulldozer-c');
const util = require("util");
const events = require("events");
const cheerio = require("cheerio");

BulldozerC.prototype.withProxy = function (callback, handlerContext) {
    handlerContext.request.proxy = {'host': '127.0.0.1', 'port': 8888};//重写BulldozerC.prototype.withProxy方法，设置此次请求代理
    callback(handlerContext);
};

var bc = new BulldozerC();

global.http_proxy = {'host': '127.0.0.1', 'port': 8888};  //设置代理，全局变量global.http_proxy可以设置代理, global.proxymodel='default'

function Dianping_task() {
    global.serverhost = '127.0.0.1';   //服务端地址  服务端地址也可以在 config/default.json中配置
    global.serverport = '9966';        //服务端接口
    global.proxymodel = 'default';     //代理模式，default 模式会用 global.http_proxy 设置的代理，其余模式需要用withProxy方法设置代理  ，dynamic 模式需要重写withProxy 获取代理
    events.EventEmitter.call(this);
    var prototypes = ['first', 'detailUrl'];//注册的函数事件
    for (var i = 0; i < prototypes.length; i++) {
        this.on(prototypes[i], this[prototypes[i]]); //给MeiTuan增加事件，将方法名作为事件名称
    }
}

util.inherits(Dianping_task, events.EventEmitter);
///////////////////////////////////////////////

Dianping_task.prototype.detailUrl = function (prehandlerContext) {
    var body = prehandlerContext.response.body;//请求返回内容
    var $ = cheerio.load(body);
    var lis = $('#shop-all-list > ul > li');

    var dataUrl = [];
    for (var i = 0; i < lis.length; i++) {
        var li = $(lis[i]);
        var star = li.find('.sml-rank-stars').attr('title');
        var href = li.find('a').attr('href');
        var handlerContext = bc.httpUtils.buildHttpcontext('GET', {
            'next': 'first',
            'url': href,
            'star': star,
            'cityName': '北京',
        }, undefined, 1000);
        //handlerContext  待访问url的模板数据
        dataUrl.push(handlerContext);
    }
    var collection = {'name': queue_url, 'data': dataUrl};
    bc.dbClient.saddDistincts(collection);//会在redis生成两个key，dianping_test_queue(存放url模板数据的key)，dianping_test_queue:distinct(存放url模板数据md5的key，主要用于url去重)
};

Dianping_task.prototype.first = function (prehandlerContext) {
    var data = prehandlerContext.data;//上一个请求带过来的数据
    var shopId = data.url.match(/\d+/)[0];
    var body = prehandlerContext.response.body;//请求返回内容
    var $ = cheerio.load(body);
    var shopName = $('.shop-name').text().trim().split(' ')[0];
    console.log('shopName==' + shopName);
    var result = {
        'Url': data.url,
        'CityName': data.cityName,
        'ShopName': shopName,
        'ShopId': shopId
    };
    var collection = {'name': 'dianping_test_table', data: [result]};
    bc.dbClient.save(collection);//保存在mongodb
    var duplicate = [];
    duplicate.push('CityName');
    duplicate.push('ShopName');
    collection.duplicate = duplicate;
    bc.dbClient.mysql_save(collection);//保存在mysql(需要先建表),支持ON DUPLICATE KEY UPDATE语句
};

var dianping = new Dianping_task();

var handlerContext = {
    'mainProgram': dianping,        //mainProgram 处理请求结果对象，包含各种处理对应请求的函数及函数事件
    "request": {
        "options": {
            "method": "GET",
            "path": "http://www.dianping.com/hangzhou/ch10/r1665"
        },
        "timeout": 1000
    },
    "response": {},
    "data": {//请求带过去的数据都放在data里面
        "url": "http://www.dianping.com/hangzhou/ch10/r1665",
        "city": "北京",
        "next": "detailUrl"    //处理此次返回结果的函数事件，
    }
};
bc.dbClient.sadds({'name': queue_url, 'data':[handlerContext]});  //入口链接， 将爬取请求模板存储到redis set队列dianping_test_queue中，bc.runTask会定时执行

bc.runTask({'name': queue_url}, dianping, '大众点评测试', 2, bc.spop);  //时间间隔2s一次去redis set队列dianping_test_queue取爬取请求模板进行抓取
