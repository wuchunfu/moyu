/** 
 * @description        HTTP请求封装---基于got  https://www.npmjs.com/package/got
 * @author              shuxiaokai
 * @create             2020-12-07 19:02
 */

import got from "got";
class HttpClient {
    constructor(config = {}) {
        this.instance = null; //当前请求实例
        this.timeout = config.timeout || 60000; //超时时间
        this.method = null; //请求方式
        this.url = null; //请求地址
        this.headers = null; //请求头
        this.params = null; //请求参数
    }
    request(url, options) {
        this.method = options.method.toLowerCase();
        this.url = url;
        this.params = options.data;
        this.headers = options.headers;
        
        console.log(got)
    }
    /** 
     * @description        发送GET请求
     * @author              shuxiaokai
     * @create             2020-12-07 15:14
     * @return {String}    返回字符串
     */
    sendGetRequest() {

    }
}



export default HttpClient