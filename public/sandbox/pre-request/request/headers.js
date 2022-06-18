/**
 * 请求头
 */
const _headers = {}; //为了初始化的时候不执行赋值操作
const headers = new Proxy(_headers, {
    get(target, key) {
        if (typeof target[key] === "object") {
            console.warn(`请求头不支持嵌套`)
        } else {
            return target[key];
        }
    },
    set(obj, prop, value) {
        console.log("set", prop, value)
        let realValue = value;
        if (typeof value === "number") {
            console.warn(`请求头在给 【${prop}】 字段赋值时，值不为string类型，将通过toString进行转换`)
            realValue = value.toString();
        } else if (typeof value !== "string") {
            console.warn(`请求头在给 【${prop}】 字段赋值时出错，请求头类型只能为字符串`)
        }
        obj[prop] = realValue;
        self.postMessage({
            type: "prerequest-change-headers",
            value: JSON.parse(JSON.stringify(headers))
        })
        return true;
    },
    deleteProperty(target, prop) {
        delete target[prop];
        self.postMessage({
            type: "prerequest-change-headers",
            value: JSON.parse(JSON.stringify(headers))
        })
    },
})