var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');
var request = require('request');
var iconvlite = require('iconv-lite');
var events = require('events');

var emitter = new events.EventEmitter();

var app = express();

app.get('/', function(req, res, next) {
    
  // 用 superagent 去抓取 https://cnodejs.org/ 的内容
  superagent.get('https://cnodejs.org/')
    .end(function (err, sres) {
      // 常规的错误处理
      if (err) {
        return next(err);
      }
      // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
      // 剩下就都是 jquery 的内容了
      var $ = cheerio.load(sres.text);
      var items = [];
      $('#topic_list .topic_title').each(function (idx, element) {
        var $element = $(element);
        console.log($element);
        items.push({
          title: $element.attr('title'),
          href: $element.attr('href')
        });
      });

      res.send(items);
    });    

});

app.get('/baidu', function(req, res, next) {
   request('https://www.baidu.com/', function(err, res, body) {
       if (!err && res.statusCode == 200) {
           var $ = cheerio.load(body);
           var result = $('#su').val();
           console.log(result);
       }
   });
});

app.get('/163', function() {
    var options = {
        url: 'http://www.163.com/',
        encoding: null
    }

    request(options, function(err, res, body) {
        if (!err && res.statusCode == 200) {
            var str = iconvlite.decode(body, 'gbk'); //iconv.decode is not a function
            var $ = cheerio.load(str);
            console.log($('#_link_auto').text());
        }
    });

});

app.get('/new163', function(err, res, body) {
    var options = {
        url: 'http://www.163.com/',
        encoding: null,
        headers: {
        'user-agent': 'xx',
        }
    }
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            str = iconvlite.decode(body, 'gbk');
            console.log(str) 
        }
    })
});


app.get('/segmentfault', function(req, res, next) {
    var options = {
        url: 'https://segmentfault.com/',
        headers: {
            'cookie': 'PHPSESSID=web1~3dgsojg42lvcjij59sg0qhcf15; showRegister2=true; showRegister=false; sf_remember=c7c1f2e87b752de58dcee681ae0db712; _ga=GA1.2.1591263881.1495797693; _gid=GA1.2.1778500152.1496195811; Hm_lvt_e23800c454aa573c0ccb16b52665ac26=1495797694,1495880942,1496195810; Hm_lpvt_e23800c454aa573c0ccb16b52665ac26=1496221153; io=dLCqdHg2Ks0iVuVFIcgT'
        }
    }
    
    request(options, function(err, res, body) {
        var $ = cheerio.load(body);
        var items = [];
        $('.summary .title').each(function (idx, element) {
            var $element = $(element);
            console.log($element);
            items.push({
                title: $element.text(),
            });
        });
        console.log(items);
    })
});

//segmentfault页面带cookie信息
app.get('/mysegmentfault', function(req, res, next) {
    var options = {
        url: 'https://segmentfault.com/u/sll/articles',
        headers: {
            'cookie': 'PHPSESSID=web3~ucqjoc8g4nrec026ujbem8hj85; path=/'
        }
    }
    
    request(options, function(err, res, body) {
        var $ = cheerio.load(body);
        var items = [];
        $('.profile-mine__content--title').each(function (idx, element) {
            var $element = $(element);
            items.push({
                title: $element.text(),
            });
        });
        console.log(items);
    })
});

/**
 * 使用superagent模拟登录，带cookie信息
 */
app.get('/mysegmentfault2', function(req, res, next) {

    var emitter = new events.EventEmitter();

    setCookeie();
    emitter.on("setCookeie", getTitles);   

    function setCookeie () {
        superagent.post('https://segmentfault.com/api/user/login')  // 登录
            .type("form")
            .send({fastloginfield:"username"})
            .send({username:"418954781@qq.com"})     
            .send({password:"xxx"}) //密码已修改
            .send({quickforward:"yes"})
            .send({handlekey:"ls"})
                .end(function(err, res){
                //if (err) return next(err);
                var cookie = res.header['set-cookie']             //从response中得到cookie
                emitter.emit("setCookeie", cookie)
                })
    }

    function getTitles (cookie) {
        var options = {
            url: 'https://segmentfault.com/u/sll/articles',
            headers: {
                'cookie': cookie
            }
        }
        request(options, function(err, res, body) {
            var $ = cheerio.load(body);
            var items = [];
            $('.profile-mine__content--title').each(function (idx, element) {
                var $element = $(element);
                items.push({
                    title: $element.text(),
                });
            });
            console.log(items);
        })
    
    };

});

app.get('/mysegmentfault3', function(req, res, next) {
    var emitter = new events.EventEmitter();

    setCookeie();
    emitter.on("setCookeie", getTitles);   

    function setCookeie () {
        superagent.post('https://segmentfault.com/api/user/login')  // 登录
            .type("form")
            .send({fastloginfield:"username"})
            .send({username:"418954781@qq.com"})     
            .send({password:"xxx"})
            .send({quickforward:"yes"})
            .send({handlekey:"ls"})
                .end(function(err, res){
                //if (err) return next(err);
                var cookie = res.header['set-cookie']             //从response中得到cookie
                emitter.emit("setCookeie", cookie)
                })
    }

    // 使用superagent存在一些问题，找不到页面
    function getTitles (cookie) {
        superagent.get("https://segmentfault.com/u/sll/articles")             // 显示
        .set("Cookie", cookie)                 //在resquest中设置得到的cookie，只设置第四个足以（具体情况具体分析）
            .end(function(err, sres){
                if (err){
                    console.log(err);
                    return;
                };

                var $ = cheerio.load(sres.text);
                console.log(sres.text);
                console.log(cookie[0]);
                var items = [];
                $('.profile-mine__content--title').each(function (idx, element) {
                    var $element = $(element);
                    items.push({
                        title: $element.text(),
                    });
                });
                console.log(items);


            })
    }

})


app.listen(3000, function() {
    console.log('start');
})
