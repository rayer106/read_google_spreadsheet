import { format } from 'util';
export class buyConfig {
    // 允许的主机名，必需的参数是template和keys,其他参数的是根据这两个参数来定的
    // 规则：
    // 1. 如果keys的数组中只有一个元素，且这个元素为1，则表明是正则表达式，需要读取searchPattern属性
    // 3. template中的参数顺序 和 keys数组中的元素顺序必须一致
    // 4. 需要一个ID，这个名字可以是ID也可以不是，但是需要有，用来和国内的template匹配，默认第一个参数就是
    // 4. 需要一个SHOP_TYPE，这个名字可以是SHOP_TYPE也可以不是，但是需要有，用来和国内的template匹配，默认第二个参数就是
    domesticHostTemplate = {
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
    };
    socialAccountTemplate = {
        "youtube.com":{},
        "tiktok.com":{},
        "t.me":{},
        "reddit.com":{},
        "instagram.com":{},
        "discord.gg":{},
        "yupoo.com":{},
        "youtu.be":{},
    };
    foreignHostParams = {
        "tinyurl.com":{"example":"http://tinyurl.com/Burberry-Sneaker"},//这个会跳转到cnfans里面去
        "cnfans.com":{
            "template":"https://cnfans.com/product/?id=%s&shop_type=%s",
            "keys":["id", "shop_type"],
            "id_key":"id",
            "shop_key":"shop_type",
            "shop_key_enum":{
                "weidian":this.domesticHostTemplate["weidian.com"],
                "taobao":this.domesticHostTemplate["taobao.com"],
                "ali_1688":this.domesticHostTemplate["1688.com"]
            },
        },
        "joyabuy.com":{
            "template":"https://joyabuy.com/product/?id=%s&shop_type=%s",
            "keys":["id", "shop_type"],
            "id_key":"id",
            "shop_key":"shop_type",
            "shop_key_enum":{
                "weidian":this.domesticHostTemplate["weidian.com"],
                "taobao":this.domesticHostTemplate["taobao.com"],
                "ali_1688":this.domesticHostTemplate["1688.com"]
            },
        },
        "oopbuy.com":{//https://oopbuy.com/product/0/652894214777;0-1688,1-taobao,2-weidian，这个有两个模板
            "template":"https://oopbuy.com/goods/details?id=%s&channel=%s",
            "keys":["id", "channel"],
            "id_key":"id",
            "shop_key":"channel",
            "shop_key_enum":{
                "weidian":this.domesticHostTemplate["weidian.com"],
                "taobao":this.domesticHostTemplate["taobao.com"],
                "1688":this.domesticHostTemplate["1688.com"],
            },
        },
        "hoobuy.cc":{//这个：https://hoobuy.cc/nE5kJZdR，会跳转到hoobuy.com
            "template":"https://hoobuy.com/product/%s/%s",
            "keys":[],
            "id_key":"",
            "shop_key":"",
            "shop_key_enum":{
                "0":this.domesticHostTemplate["1688.com"],
                "1":this.domesticHostTemplate["taobao.com"],
                "2":this.domesticHostTemplate["weidian.com"]
            }
        },
        "hoobuy.com":{
            "template":"https://hoobuy.com/product/%s/%s",
            "keys":[],
            "id_key":"",
            "shop_key":"",
            "shop_key_enum":{
                "0":this.domesticHostTemplate["1688.com"],
                "1":this.domesticHostTemplate["taobao.com"],
                "2":this.domesticHostTemplate["weidian.com"]
            }
        },
        "cssbuy.com":{
            "template":"https://cssbuy.com/item-%s-%s.html",
            "keys":[],
            "id_key":"",
            "shop_key":"",
            "shop_key_enum":{
                "micro":this.domesticHostTemplate["weidian.com"],
                "":this.domesticHostTemplate["taobao.com.com"],//如果是淘宝的话，这里是空的，第一个%s是没有值的
                "1688":this.domesticHostTemplate["1688.com"],

            }
        },
        "acbuy.com":{//allchinabuy的短链，需要抓取跳转后的链接,跳转后的商品链接是url参数，淘宝跟天猫是用的同样的链接格式，会跳转到正常的taobao和天猫域名
            "template":"https://www.allchinabuy.com/en/page/buy/?url=%s",//这个%s是各个国内的链接
            "keys":["url"],//可以直接拿到国内的链接
            "id_key":"",
            "shop_key":"",
            "shop_key_enum":{}
        },
        "allchinabuy.com":{
            "template":"https://www.allchinabuy.com/en/page/buy/?url=%s",//这个%s是各个国内的链接
            "keys":["url"],//可以直接拿到国内的链接
            "id_key":"",
            "shop_key":"",
            "shop_key_enum":{}
        },
        "allapp.link":{

        }

    };
    foreignHostParamsWithContent = {
        "yupoo.com":{}
    };

    hostTemplate = Object.assign({}, this.domesticHostTemplate, this.foreignHostParams);

    getStandardUrls(rawUriStr){
        let rawUri = null;
        try {
            rawUri = new URL(rawUriStr);
        } catch (err) {
            console.error(err.message);
            return null;
        }
        const hostParts = rawUri.host.split('.');
        const rootHost = hostParts.slice(-2).join('.');
        const hostConfig = this.hostTemplate[rootHost];
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

        if (template) {
            // 使用 util.format 方法替换模板中的参数
            const retUri = format(template, ...Object.values(params));
            console.log(`getStandardUrls:`, retUri);
            return retUri;
        } else {
            console.error(`缺少模板`);
            return null;
        }
    }

    getDomesticUrls(rawUriStr){
        let rawUri = null;
        try {
            rawUri = new URL(rawUriStr);
        } catch (err) {
            console.error("getDomesticUrls:"+err.message);
            return null;
        }
        const hostParts = rawUri.host.split('.');
        const rootHost = hostParts.slice(-2).join('.');
        const hostConfig = this.foreignHostParams[rootHost];
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
        console.log(`getDomesticUrls:`, domesticUri);
        return domesticUri;
    }
}