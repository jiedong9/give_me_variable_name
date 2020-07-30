"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
var querystring = __importStar(require("querystring"));
var http = __importStar(require("http"));
var md5 = require("md5");
var private_1 = require("./private");
var errorMap = {
    52000: '成功',
    52001: '请求超时',
    52002: '系统错误',
    52003: '未授权用户',
    54000: '必填参数为空',
    54001: '签名错误',
    54003: '访问频率受限',
    54004: '账户余额不足',
    54005: '长query请求频繁',
    58000: '客户端IP非法',
    58001: '译文语言方向不支持',
    58002: '服务当前已关闭',
    90107: '认证未通过或未生效',
};
exports.translate = function (word) {
    var salt = Math.random();
    var sign = md5(private_1.appId + word + salt + private_1.appSecret);
    var from, to;
    if (/[a-zA-Z]/.test(word[0])) {
        from = 'en';
        to = 'zh';
    }
    else {
        from = 'zh';
        to = 'en';
    }
    var query = querystring.stringify({
        q: word,
        from: from,
        to: to,
        appid: private_1.appId,
        salt: salt,
        sign: sign
    });
    var options = {
        hostname: 'api.fanyi.baidu.com',
        post: 443,
        path: '/api/trans/vip/translate?' + query,
        method: 'GET',
    };
    var request = http.request(options, function (response) {
        var chunk_list = [];
        response.on('data', function (chunk) {
            chunk_list.push(chunk);
        });
        response.on('end', function () {
            var string = Buffer.concat(chunk_list).toString();
            var object = JSON.parse(string);
            if (object.error_code) {
                console.error(errorMap[object.error_code] || object.error_msg);
                process.exit(2);
            }
            else {
                object.trans_result.map(function (obj) {
                    console.log(obj.dst);
                });
                process.exit(0);
            }
        });
    });
    request.on('error', function (e) {
        console.error("\u8BF7\u6C42\u9047\u5230\u95EE\u9898: " + e.message);
    });
    // 将数据写入请求主体。
    request.end();
};
