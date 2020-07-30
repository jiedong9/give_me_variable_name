import * as querystring from 'querystring'
import * as http from 'http'
import md5 = require('md5')
import {appId, appSecret} from './private'

type ErrorMap = {
  [key: string]: string
}

const errorMap: ErrorMap = {
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
}

export const translate = (word: string) => {

  const salt = Math.random()
  const sign = md5(appId + word + salt + appSecret)

  let from, to
  if (/[a-zA-Z]/.test(word[0])) {
    from = 'en'
    to = 'zh'
  } else {
    from = 'zh'
    to = 'en'
  }
  const query: string = querystring.stringify(
    {
      q: word,
      from,
      to,
      appid: appId,
      salt,
      sign
    }
  )

  const options = {
    hostname: 'api.fanyi.baidu.com',
    post: 443,
    path: '/api/trans/vip/translate?' + query,
    method: 'GET',
  };

  const request = http.request(options, (response) => {
    let chunk_list: Buffer[] = []
    response.on('data', (chunk: Buffer) => {
      chunk_list.push(chunk)
    });
    response.on('end', () => {
      const string = Buffer.concat(chunk_list).toString()
      type BaiduResult = {
        error_code?: string
        error_msg?: string
        from: string
        to: string
        trans_result: {
          src: string
          dst: string
        }[]
      }
      const object: BaiduResult = JSON.parse(string)
      if (object.error_code) {
        console.error(errorMap[object.error_code] || object.error_msg)
        process.exit(2)
      } else {
        object.trans_result.map(obj => {
          console.log(obj.dst)
        })
        process.exit(0)
      }
    })
  });

  request.on('error', (e) => {
    console.error(`请求遇到问题: ${e.message}`);
  });

// 将数据写入请求主体。
  request.end();
}
