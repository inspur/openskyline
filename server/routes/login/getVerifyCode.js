const logger = require('log4js').getLogger('GenVerifyCode');
const router = require('express').Router();
const BMP24 = require('gd-bmp').BMP24;
const crypto =require('crypto');
//Consts
const Consts = require('../../constants');
const request = require('request');
const SessionHelper = require('../../lib/SessionHelper');

//仿PHP的rand函数
function rand(min, max) {
    let ran = crypto.randomBytes(1)[0];
    ran = ran.toString().substr(-1)/10;
    return ran*(max-min+1) + min | 0; //特殊的技巧，|0可以强制转换为整数
}
//制造验证码图片
function makeCapcha() {
    var img = new BMP24(100, 40);
    // img.drawCircle(rand(0, 100), rand(0, 40), rand(10 , 40), rand(0, 0xffffff));
    //边框
    // img.drawRect(0, 0, img.w-1, img.h-1, rand(0, 0xffffff));
    // img.fillRect(rand(0, 100), rand(0, 40), rand(10, 35), rand(10, 35), rand(0, 0xffffff));
    //return img;
    // img.fillRect(rand(0, 100), rand(0, 40), rand(10, 35), rand(10, 35), 0xffffff);
    img.fillRect(0,0,100,40, 0xffffff); //bg
    for(var i=0; i<155; i++){
        img.drawLine(rand(0, 100), rand(0, 40), rand(0, 100), rand(0, 40), 0xd7e2d1);
    }



    //画曲线
    var w=img.w/2;
    var h=img.h;
    var color = rand(0, 0xffffff);
    var y1=rand(-5,5); //Y轴位置调整
    var w2=rand(10,15); //数值越小频率越高
    var h3=rand(4,6); //数值越小幅度越大
    var bl = rand(1,5);
    for(var i=-w; i<w; i+=0.1) {
        var y = Math.floor(h/h3*Math.sin(i/w2)+h/2+y1);
        var x = Math.floor(i+w);
        for(var j=0; j<bl; j++){
            img.drawPoint(x, y+j, color);
        }
    }

    // var p = "ABCDEFGHKMNPQRSTUVWXYZ3456789";
    var p = "123456789";
    var str = '';
    for(var i=0; i<4; i++){
        let ran = crypto.randomBytes(1)[0];
        ran = ran.toString().substr(-1)/10;
        str += p.charAt(ran * p.length |0);
    }

    var fonts = [BMP24.font8x16, BMP24.font12x24, BMP24.font16x32];
    var fonts = [BMP24.font16x32];
    // var x = 15, y=8;
    var x = 12, y=8;
    for(var i=0; i<str.length; i++){
        let ran = crypto.randomBytes(1)[0];
        ran = ran.toString().substr(-1)/10;
        var f = fonts[ran * fonts.length |0];
        // y = 8 + rand(-10, 10);
        y = 4;
        // img.drawChar(str[i], x, y, f, rand(0, 0xffffff));
        img.drawChar(str[i], x, y, f, rand(200, 0xffffff));
        x += f.w + rand(2, 8);
    }
    return {
        verifyCode: str,
        img: img
    }
}

module.exports = function(options, context) {
    router.all('/', function(req, res) {
        let body = req.body;
        let query = req.query;
        let type = "verifyCode";
        query.type && (type = query.type);
        let verifyResult = makeCapcha();
        SessionHelper.setVerifyCode(req, type, verifyResult.verifyCode);
        res.setHeader('Content-Type', 'image/bmp');
        res.header("Cache-Control", "no-cache");
        res.end(verifyResult.img.getFileData() );
    });

    return router;
};
