/****
 *   注意：大众点评有可能会中风控，此例子并没有处理大众点评的风控，假设一切正常访问
 * （1）抓取http://www.dianping.com/shop/2144533，并将店铺id，店铺url，店铺所在城市，店铺名称存储入库(mysql和mongodb)
 * */
const BulldozerC = require('bulldozer-c');
const util = require("util");
const events = require("events");
const cheerio = require("cheerio");

BulldozerC.prototype.withProxy = function (callback, handlerContext) {
    handlerContext.request.proxy = {'host': '127.0.0.1', 'port': 8888};
    callback(handlerContext);
};

var bc = new BulldozerC();
function Dianping_one() {
    global.serverhost = '127.0.0.1';   //服务端地址
    global.serverport = '9966';        //服务端接口
    global.proxymodel = 'dynamic';
    events.EventEmitter.call(this);
    var prototypes = ['first'];
    for (var i = 0; i < prototypes.length; i++) {
        this.on(prototypes[i], this[prototypes[i]]); //给MeiTuan增加事件，将方法名作为事件名称
    }
}
util.inherits(Dianping_one, events.EventEmitter);
///////////////////////////////////////////////

Dianping_one.prototype.first = function (prehandlerContext) {
    var data = prehandlerContext.data;//上一个请求带过来的数据
    console.log(JSON.stringify(data));

    var body = prehandlerContext.response.body;//请求返回内容
    var $ = cheerio.load(body);
    var shopName = $('.shop-name').text().trim().split(' ')[0];
    var result = {
        'Url' : data.url,
        'CityName' : data.city,
        'ShopName' : shopName,
        'ShopId' : data.shopId
    };
    console.log('result==%s', JSON.stringify(result));
    var collection = {'name':'dianping_test_table', data : [result]};
    bc.dbClient.save(collection);//保存在mongodb
    bc.dbClient.mysql_save(collection);//保存在mysql(需要先建表)
    var duplicate = [];
    duplicate.push('CityName');
    collection.duplicate = duplicate;
    result.CityName = '上海';
    bc.dbClient.mysql_save(collection);//保存在mysql(需要先建表),支持ON DUPLICATE KEY UPDATE语句
};


var dianping = new Dianping_one();

var handlerContext = {
    'mainProgram': dianping,        //mainProgram 处理请求结果对象，包含各种处理对应请求的函数及函数事件
    "request": {
        "options": {
            "method": "GET",
            "path": "http://www.dianping.com/shop/2144533"
        },
        "timeout": 1000
    },
    "response": {},
    "data": {//请求带过去的数据都放在data里面
        "url": "http://www.dianping.com/shop/2144533",
        "shopId": "2144533",
        "city": "北京",
        "next": "first"    //处理此次返回结果的函数事件，
    }
};
bc.startRequest(handlerContext);// 执行单个请求解析及存储流程,既：请求->解析->存储
