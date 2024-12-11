import { format } from 'util';
// 允许的主机名，必需的参数是template和keys,其他参数的是根据这两个参数来定的
// 规则：
// 1. 如果keys的数组中只有一个元素，且这个元素为1，则表明是正则表达式，需要读取searchPattern属性
// 3. template中的参数顺序 和 keys数组中的元素顺序必须一致
// 4. 需要一个ID，这个名字可以是ID也可以不是，但是需要有，用来和国内的template匹配，默认第一个参数就是
// 4. 需要一个SHOP_TYPE，这个名字可以是SHOP_TYPE也可以不是，但是需要有，用来和国内的template匹配，默认第二个参数就是
const domesticHostTemplate = {
    "weidian.com":{
        "template":"https://weidian.com/item.html?itemID=%s",
        "keys":["itemID"],
    },
    "taobao.com":{
        "template":"https://item.taobao.com/item.htm?id=%s",
        "keys":["id"],
    },
    "1688.com":{
        "template":"https://detail.1688.com/offer/%s.html",
        "keys":[1],//表明这是个正则表达式，需要读取searchPattern属性
        "searchPattern":/offer\/(\d+)\.html/,
    }
}
const socialAccountTemplate = {
    "youtube.com":{},
    "tiktok.com":{},
    "t.me":{},
    "reddit.com":{},
    "instagram.com":{},
    "discord.gg":{},
    "yupoo.com":{}
}
const foreignHostParams = {
    "cnfans.com":{
        "template":"https://cnfans.com/product/?id=%s&shop_type=%s",
        "keys":["id", "shop_type"],
        "id_key":"id",
        "shop_key":"shop_type",
        "shop_key_enum":{
            "weidian":domesticHostTemplate["weidian.com"],
            "taobao":domesticHostTemplate["taobao.com"],
            "ali_1688":domesticHostTemplate["1688.com"]
        },
    },
    "joyabuy.com":{
        "template":"https://joyabuy.com/product/?id=%s&shop_type=%s",
        "keys":["id", "shop_type"],
        "id_key":"id",
        "shop_key":"shop_type",
        "shop_key_enum":{
            "weidian":domesticHostTemplate["weidian.com"],
            "taobao":domesticHostTemplate["taobao.com"],
            "ali_1688":domesticHostTemplate["1688.com"]
        },
    },
};

const hostTemplate = Object.assign({}, domesticHostTemplate, foreignHostParams);

export function getStandardUrls(rawUriStr){
    let rawUri = null;
    try {
        rawUri = new URL(rawUriStr);
    } catch (err) {
        console.error(err.message);
        return null;
    }
    const hostParts = rawUri.host.split('.');
    const rootHost = hostParts.slice(-2).join('.');
    const hostConfig = hostTemplate[rootHost];
    if(!hostConfig){
        console.error(`不支持的主机：${rootHost}`);
        return null;
    }
    const template = hostConfig.template;
    const keys = hostConfig.keys;
    const searchPattern = hostConfig.searchPattern;
    const params = {};
    for(let i=0;i<keys.length;i++){
        const key = keys[i];
        const value = rawUri.searchParams.get(key);
        if(value){
            params[key] = value;
        }else if(searchPattern && key === 1){
            const match = searchPattern.exec(rawUri.pathname);
            if(match && match.length > 1){
                params[key] = match[1];
            } else {
                console.error(`缺少参数：${key}`);
                return null;
            }
        }else{
            console.error(`缺少参数：${key}`);
            return null;
        }
    }

    console.log(`params:`, params);
    console.log(`template:`, template);

   if (template) {
        // 使用 util.format 方法替换模板中的参数
        const retUri = format(template, ...Object.values(params));
        console.log(`returnUri:`, retUri);
        return retUri;
    } else {
        console.error(`缺少模板`);
        return null;
    }
}

export function getDomesticUrls(rawUriStr){
    let rawUri = null;
    try {
        console.log(`rawUriStr:`, rawUriStr);
        rawUri = new URL(rawUriStr);
    } catch (err) {
        console.error("getDomesticUrls:"+err.message);
        return null;
    }
    const hostParts = rawUri.host.split('.');
    const rootHost = hostParts.slice(-2).join('.');
    const hostConfig = foreignHostParams[rootHost];
    if(!hostConfig){
        console.error(`不支持的foreign域名：${rootHost}`);
        return null;
    }
    const shopType = rawUri.searchParams.get(hostConfig.shop_key);
    if(!shopType){
        console.error(`缺少参数：${hostConfig.shop_key}`);
        return null;
    }
    const id = rawUri.searchParams.get(hostConfig.id_key);
    if(!id){
        console.error(`缺少参数：${hostConfig.id_key}`);
        return null;
    }
    const shop_key_enums = Object.keys(hostConfig.shop_key_enum);
    if(!shop_key_enums.includes(shopType)){
        console.error(`不支持的店铺类型：${shopType}`);
        return null;
    }
    const domesticTemplate = hostConfig.shop_key_enum[shopType].template;
    const domesticUri = format(domesticTemplate, id);
    console.log(`domesticUri:`, domesticUri);
    return domesticUri;
}