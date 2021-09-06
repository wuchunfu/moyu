/**
 * @description        全局工具函数
 * @author             shuxiaokai
 * @create             2021-06-15 22:55
 */
import { nanoid } from "nanoid/non-secure"
import type { ApidocHttpRequestMethod, ApidocProperty, ApidocPropertyType } from "@@/global"
import tips from "./tips"
import lodashIsEqual from "lodash/isEqual";
import lodashCloneDeep from "lodash/cloneDeep";
import lodashDebounce from "lodash/debounce";
import lodashThrottle from "lodash/throttle";
import dayjs from "dayjs";
import mitt from "mitt"
import Mock from "@/server/mock"

type Data = Record<string, unknown>

/**
 * 对象对比
 */
export const isEqual = lodashIsEqual;
/**
 * 深拷贝
 */
export const cloneDeep = lodashCloneDeep;
/**
 * 防抖函数
 */
export const debounce = lodashDebounce;
/**
 * 节流函数
 */
export const throttle = lodashThrottle;
/**
 * 全局事件订阅发布
 */
const emitter = mitt()

export const event = emitter;
/**
 * @description        返回uuid
 * @author             shuxiaokai
 * @create             2021-01-20 22:52
 * @return {string}    返回uuid
 */
export function uuid(): string {
    return nanoid();
}

/**
    @description   返回变量类型
    @author        shuxiaokai
    @create        2019-10-29 16:32"
    @param {any}   variable
    @return       小写对象类型(null,number,string,boolean,symbol,function,object,array,regexp)
*/
export function getType(variable: unknown): string {
    return Object.prototype.toString.call(variable).slice(8, -1).toLocaleLowerCase();
}

type ForestData = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [propName: string]: any,
}

/**
 * @description        遍历森林(深度优先)
 * @author             shuxiaokai
 * @create             2020-03-02 10:17
 * @param {array}      arrData 数组数据
 * @param {function}   fn 每次遍历执行得函数
 * @param {string}     childrenKey children对应字段
 */
export function forEachForest<T extends ForestData>(forest: T[], fn: (arg: T) => void, options?: { childrenKey?: string }): void {
    if (!Array.isArray(forest)) {
        throw new Error("第一个参数必须为数组类型");
    }
    const childrenKey = options?.childrenKey || "children";
    const foo = (forestData: T[], hook: (arg: T) => void) => {
        for (let i = 0; i < forestData.length; i += 1) {
            const currentData = forestData[i];
            hook(currentData);
            if (!currentData[childrenKey]) {
                continue;
            }
            if (!Array.isArray(currentData[childrenKey])) {
                continue;
            }
            if ((currentData[childrenKey] as T[]).length > 0) {
                foo(currentData[childrenKey] as T[], hook);
            }
        }
    };
    foo(forest, fn);
}

/**
 * 根据id查询父元素
 */
export function findParentById<T extends ForestData>(forest: T[], id: string, options?: { childrenKey?: string, idKey?: string }): T | null {
    if (!Array.isArray(forest)) {
        throw new Error("第一个参数必须为数组类型");
    }
    const childrenKey = options?.childrenKey || "children";
    const idKey = options?.idKey || "id";
    let pNode: T | null = null;
    let hasPNode = false;
    const foo = (forestData: ForestData, deep: number) => {
        for (let i = 0; i < forestData.length; i += 1) {
            const currentData = forestData[i];
            if (currentData[idKey] === id && deep !== 0) {
                hasPNode = true;
                break;
            }
            if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
                pNode = currentData;
                foo(currentData[childrenKey], deep + 1);
            }
        }
    };
    foo(forest, 0);
    if (hasPNode) {
        return pNode;
    } else {
        return null;
    }
}

/**
 * 根据id查询下一个兄弟节点
 */
export function findNextSiblingById<T extends ForestData>(forest: T[], id: string, options?: { childrenKey?: string, idKey?: string }): T | null {
    if (!Array.isArray(forest)) {
        throw new Error("第一个参数必须为数组类型");
    }
    const childrenKey = options?.childrenKey || "children";
    const idKey = options?.idKey || "id";
    let nextSibling: T | null = null;
    const foo = (forestData: ForestData) => {
        for (let i = 0; i < forestData.length; i += 1) {
            const currentData = forestData[i];
            if (currentData[idKey] === id) {
                nextSibling = forestData[i + 1]
                break;
            }
            if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
                foo(currentData[childrenKey]);
            }
        }
    };
    foo(forest);
    return nextSibling;
}
/**
 * 根据id查询上一个兄弟节点
 */
export function findPreviousSiblingById<T extends ForestData>(forest: T[], id: string, options?: { childrenKey?: string, idKey?: string }): T | null {
    if (!Array.isArray(forest)) {
        throw new Error("第一个参数必须为数组类型");
    }
    const childrenKey = options?.childrenKey || "children";
    const idKey = options?.idKey || "id";
    let previousSibling: T | null = null;
    const foo = (forestData: ForestData) => {
        for (let i = 0; i < forestData.length; i += 1) {
            const currentData = forestData[i];
            if (currentData[idKey] === id) {
                previousSibling = forestData[i - 1]
                break;
            }
            if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
                foo(currentData[childrenKey]);
            }
        }
    };
    foo(forest);
    return previousSibling;
}

/**
 * 根据id查询元素
 */
export function findNodeById<T extends ForestData>(forest: T[], id: string, options?: { childrenKey?: string, idKey?: string }): T | null {
    if (!Array.isArray(forest)) {
        throw new Error("第一个参数必须为数组类型");
    }
    let result = null;
    const childrenKey = options?.childrenKey || "children";
    const idKey = options?.idKey || "id";
    const foo = (forestData: ForestData) => {
        for (let i = 0; i < forestData.length; i += 1) {
            const currentData = forestData[i];
            if (currentData[idKey] === id) {
                result = currentData;
                break;
            }
            if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
                foo(currentData[childrenKey]);
            }
        }
    };
    foo(forest);
    return result;
}

type TreeNode<T> = {
    children: T[],
};
/**
 * 将树形数据所有节点转换为一维数组,数据会进行深拷贝
 */
export function flatTree<T extends TreeNode<T>>(root: T): T[] {
    const result: T[] = [];
    const foo = (nodes: T[]): void => {
        for(let i = 0; i < nodes.length; i ++) {
            const item = nodes[i];
            const itemCopy = cloneDeep(item);
            itemCopy.children = [];
            result.push(itemCopy);
            if (item.children && item.children.length > 0) {
                foo(item.children);
            }
        }
      
    }
    foo([root]);
    return result;
}

let canvas: HTMLCanvasElement | null;
/**
 * 获取字符串宽度
 */
export function getTextWidth(text: string, font: string): number {
    canvas || (canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    (context as CanvasRenderingContext2D).font = font;
    const metrics = (context as CanvasRenderingContext2D).measureText(text);
    return metrics.width;
}

/**
 * 获取提示信息
 */
export function randomTip(): string {
    const len = tips.length;
    const randomIndex = Math.ceil(Math.random() * len) - 1;
    return tips[randomIndex];
}

/**
 * 格式化时间
 */
export function formatDate(date: string | number | Date | dayjs.Dayjs | undefined, rule?: string): string {
    const realRule = rule || "YYYY-MM-DD HH:mm"
    const result = dayjs(date).format(realRule);
    return result;
}

/**
    @description  将数组对象[{id: 1}]根据指定的key值进行去重,key值对应的数组元素不存在则直接过滤掉，若不传入id则默认按照set形式进行去重。
    @create       2019-11-20 22:40
    @update       2019-11-20 22:42
    @param  {array}  array 需要处理的数组
    @param  {string?} key 指定对象数组的去重依据
    @return {Array}  返回一个去重后的新数组，不会改变原数组
    @example
        unique([{id: 1}, {id: 2}, {id: 1}], "id") => [{id: 1}, {id: 2}]
        unique([{id: 1}, {id: 2}, {id: 1}]) => [{id: 1}, {id: 2}, {id: 1}]
        unique([{id: 1}, {}, {id: 1}]) => [{id: 1}, {id: 2}, {id: 1}]
        unique([1, 2, 3, 4, 3, 3]) => [1, 2, 3, 4]
*/

export function uniqueByKey<T extends Data, K extends keyof T>(data: T[], key: K): T[] {
    const result: T[] = [];
    for (let i = 0, len = data.length; i < len; i += 1) {
        const isInResult = result.find((val) => val[key] === data[i][key]);
        if (data[i][key] != null && !isInResult) {
            result.push(data[i]);
        }
    }
    return result;
}

/**
 * 获取请求方法
 */
export function getRequestMethodEnum(): ApidocHttpRequestMethod[] {
    return ["GET", "POST", "PUT", "DELETE", "TRACE", "OPTIONS", "PATCH", "HEAD"];
}


/**
 * 生成一条接口参数
 */
export function apidocGenerateProperty<T extends ApidocPropertyType = "string">(type?: T): ApidocProperty<T> {
    const result = {
        _id: uuid(),
        key: "",
        type: type || "string",
        description: "",
        value: "",
        required: true,
        select: true,
        children: [],        
        editor: "",
        editorId: "",
    };
    return result as ApidocProperty<T>;
}

/*
|--------------------------------------------------------------------------
| 
|--------------------------------------------------------------------------
|
| 
|
*/
type Properties = ApidocProperty<ApidocPropertyType>[]
type PropertyValueHook = (value: ApidocProperty) => string | number | boolean;
type JsonConvertHook = (property: ApidocProperty<ApidocPropertyType>, itemData: JSON) => void;
type JSON = string | number | boolean | null | JsonObj | JsonArr
type JsonArr = JSON[]
type JsonObj = {
    [x: string]: JSON
}
type JsonValueType = "string" | "number" | "boolean" | "array" | "object"
type ConvertToObjectOptions = {
    result: Record<string, JSON> | JSON[],
    valueHook?: PropertyValueHook,
    jumpChecked?: boolean,
    parent: ApidocProperty<ApidocPropertyType>
}

function convertToJson(properties: Properties, options: ConvertToObjectOptions): void {
    const { result, parent, jumpChecked, valueHook } = options;
    for (let i = 0; i < properties.length; i += 1) {
        const property = properties[i];
        const { type, value, key, children } = property;
        const isParentArray = (parent && parent.type === "array");
        const isComplex = (type === "object" || type === "array" || type === "file");
        const keyValIsEmpty = key === "" && value === ""

        if (jumpChecked && !property.select) { //过滤掉_select属性为false的值
            continue;
        }
        if (!isParentArray && !isComplex && (key === "")) { //父元素不为数组并且也不是复杂数据类型
            continue
        }
        if (!isParentArray && isComplex && (key === "")) { //对象下面对象必须具备key
            continue
        }
        if (isParentArray && keyValIsEmpty && type === "number") { //数组下面为数字
            continue
        }
        if (isParentArray && keyValIsEmpty && type === "boolean") { //数组下面为布尔值
            continue
        }
        const convertValue = valueHook ? valueHook(property) : apidocConvertValue(value);
        if (isParentArray) { //父元素为数组
            if (type === "boolean") {
                (result as JSON[]).push(convertValue === "true" ? true : false);
            } else if (type === "string") {
                (result as JSON[]).push(convertValue);
            } else if (type === "number") {
                const isNumber = !isNaN(Number(convertValue));
                if (isNumber) {
                    (result as JSON[]).push(Number(convertValue));
                } else {
                    console.warn("参数无法被转换为数字类型，默认为0");
                    (result as JSON[]).push(0);
                }
            } else if (type === "file") {
                console.warn("不允许为file类型");
                (result as JSON[]).push(convertValue);
            } else if (type === "object") {
                const pushData = {};
                (result as JSON[]).push(pushData);
                convertToJson(children, {
                    result: pushData,
                    valueHook: valueHook,
                    jumpChecked: jumpChecked,
                    parent: property
                })
            } else if (type === "array") {
                const pushData: JSON[] = [];
                (result as JSON[]).push(pushData);
                convertToJson(children, {
                    result: pushData,
                    valueHook: valueHook,
                    jumpChecked: jumpChecked,
                    parent: property
                })
            }
        } else { //父元素为对象
            if (type === "boolean") {
                (result as Record<string, JSON>)[key] = convertValue === "true" ? true : false;
            } else if (type === "string") {
                (result as Record<string, JSON>)[key] = convertValue;
            } else if (type === "number") {
                const isNumber = !isNaN(Number(convertValue));
                if (isNumber) {
                    (result as Record<string, JSON>)[key] = Number(convertValue);
                } else {
                    console.warn("参数无法被转换为数字类型，默认为0");
                    (result as Record<string, JSON>)[key] = 0;
                }
            } else if (type === "file") {
                console.warn("不允许为file类型");
                (result as Record<string, JSON>)[key] = convertValue;
            } else if (type === "object") {
                (result as Record<string, JSON>)[key] = {};
                convertToJson(children, {
                    result: (result as Record<string, JSON>)[key] as Record<string, JSON>,
                    valueHook: valueHook,
                    jumpChecked: jumpChecked,
                    parent: property
                })
            } else if (type === "array") {
                (result as Record<string, JSON>)[key] = [];
                convertToJson(children, {
                    result: (result as Record<string, JSON>)[key] as JSON[],
                    valueHook: valueHook,
                    jumpChecked: jumpChecked,
                    parent: property
                })
            }
        }
    }
}
/**
 * @description        获取property字段类型
 * @author             shuxiaokai
 * @create             2021-8-29 13:38
 * @param {any}        value - 任意类型变量
 * @return {string}    返回参数类型
 */
function getJsonValueType(value: unknown): JsonValueType {
    let result: JsonValueType = "string";
    if (typeof value === "string") {
        result = "string"
    } else if (typeof value === "number") { //NaN
        result = "number"
    } else if (typeof value === "boolean") {
        result = "boolean"
    } else if (Array.isArray(value)) {
        result = "array"
    } else if (typeof value === "object" && value !== null) {
        result = "object"
    } else { // undefined ...
        result = "string"
    }
    return result;
}
/**
 * 将录入参数转换为json参数
 */
export function apidocConvertParamsToJsonData(properties: Properties, jumpChecked?: boolean, valueHook?: PropertyValueHook): JSON {
    if (properties.length === 0) {
        console.warn("无任何参数值")
        return null;
    }
    const rootType = properties[0].type;
    const rootValue = properties[0].value;
    if (rootType === "boolean") {
        return rootValue === "true" ? true : false;
    } else if (rootType === "string") {
        return rootValue;
    } else if (rootType === "number") {
        const isNumber = !isNaN(Number(rootValue));
        if (isNumber) {
            return Number(rootValue);
        } else {
            console.warn("参数无法被转换为数字类型，默认为0");
            return 0;
        }
    } else if (rootType === "file") {
        console.warn("根元素不允许为file");
        return null;
    } else if (rootType === "object") {
        const resultJson = {};
        const data = properties[0].children;
        if (data.every((p) => !p.key)) {
            return null;
        }
        convertToJson(properties[0].children, {
            result: resultJson,
            valueHook: valueHook,
            jumpChecked: jumpChecked,
            parent: properties[0]
        });
        return resultJson
    } else if (rootType === "array") {
        const resultJson: JSON[] = [];
        const data = properties[0].children;
        if (data.every((p) => ((p.type === "number" && p.value === "") || (p.type === "boolean" && p.value === "") ))) {
            return null;
        }
        convertToJson(properties[0].children, {
            result: resultJson,
            valueHook: valueHook,
            jumpChecked: jumpChecked,
            parent: properties[0]
        });
        return resultJson
    } else {
        return {};
    }
}

/**
 * 将json类型数据转换为moyu类型参数
 */
export function apidocConvertJsonDataToParams(jsonData: JSON, hook?: PropertyValueHook): Properties {
    const globalResult = [];
    const rootType = getJsonValueType(jsonData);
    if (rootType === "object" || rootType === "array") {
        const rootProperty = apidocGenerateProperty(rootType);
        globalResult.push(rootProperty);
        const foo = (obj: JSON, { result, deep, hook }: { result: Properties, deep: number, hook?: JsonConvertHook }) => {
            if (getJsonValueType(obj) === "object") {
                Object.keys(obj as JsonObj).forEach((key) => {
                    const itemValue = (obj as JsonObj)[key];
                    const itemType = getJsonValueType(itemValue);
                    if (itemType === "string" || itemType === "number" || itemType === "boolean") {
                        const property = apidocGenerateProperty(itemType);
                        property.key = key;
                        property.value = itemValue == null ? "null" : itemValue.toString();
                        if (hook) {
                            hook(property, itemValue);
                        }
                        result.push(property);
                    } else if (itemType === "object") {
                        const property = apidocGenerateProperty(itemType);
                        property.key = key;
                        if (hook) {
                            hook(property, itemValue);
                        }
                        result.push(property);
                        foo(itemValue, {
                            result: property.children, 
                            deep: deep + 1,
                            hook,
                        });
                    } else if (itemType === "array") {
                        const itemValue = (obj as JsonObj)[key] as JsonArr
                        const property = apidocGenerateProperty(itemType);
                        property.key = key;
                        if (hook) {
                            hook(property, itemValue);
                        }
                        result.push(property);
                        if (getJsonValueType(itemValue[0]) === "object") {
                            const property2 = apidocGenerateProperty("object");
                            property.children.push(property2)
                            foo(itemValue[0], {
                                result: property.children[0].children, 
                                deep: deep + 1,
                                hook,
                            });
                        } else {
                            foo(itemValue[0], {
                                result: property.children, 
                                deep: deep + 1,
                                hook,
                            });
                        }
                    }
                });
            } else {
                const valueType = getJsonValueType(obj);
                const property = apidocGenerateProperty(valueType);
                result.push(property)
            }
        }
        foo(jsonData, {
            result: rootProperty.children,
            deep: 1,
            hook,
        });
    } else {
        const rootProperty = apidocGenerateProperty(rootType);
        globalResult.push(rootProperty);
    }
    return globalResult;
}

/**
 * @description        apidoc转换value值
 * @author             shuxiaokai
 * @create             2021-8-26 21:56
 * @param {string}     value - 需要转换的值
 * @return {String}    返回转换后的字符串
 * @remark             这个方法具有强耦合性
 */
export function apidocConvertValue(value: string): string {
    if (value.startsWith("@")) {
        return Mock.mock(value);
    }
    return value;
}

/**
 * @description        将byte转换为易读单位
 * @author              shuxiaokai
 * @create             2020-10-26 21:56
 * @param {number}      byteNum - 字节数量
 * @return {String}    返回字符串
 */
export function formatBytes(byteNum: number): string {
    let result = "";
    if (!byteNum) {
        return "";
    }
    if (byteNum > 0 && byteNum < 1024) {
        //b
        result = `${byteNum}B`;
    } else if (byteNum >= 1024 && byteNum < 1024 * 1024) {
        //KB
        result = `${(byteNum / 1024).toFixed(2)}KB`;
    } else if (byteNum >= 1024 * 1024 && byteNum < 1024 * 1024 * 1024) {
        //MB
        result = `${(byteNum / 1024 / 1024).toFixed(2)}MB`;
    } else if (byteNum >= 1024 * 1024 * 1024 && byteNum < 1024 * 1024 * 1024 * 1024) {
        //GB
        result = `${(byteNum / 1024 / 1024 / 1024).toFixed(2)}GB`;
    }
    return result;
}

/**
 * @description        将毫秒转换为易读单位
 * @author              shuxiaokai
 * @create             2020-10-26 21:56
 * @param {number}      ms - 毫秒
 * @return {String}    返回字符串
 */
export function formatMs(ms: number): string {
    let result = "";
    if (!ms) {
        return "";
    }
    if (ms > 0 && ms < 1000) { //毫秒
        result = `${ms}ms`;
    } else if (ms >= 1000 && ms < 1000 * 60) { //秒
        result = `${(ms / 1000).toFixed(2)}s`;
    } else if (ms >= 1000 * 60) { //分钟
        result = `${(ms / 1000 / 60).toFixed(2)}m`;
    }
    return result;
}
