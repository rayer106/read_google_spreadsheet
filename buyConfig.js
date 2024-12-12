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
        "tinyurl.com":{//这个如：http://tinyurl.com/Burberry-Sneaker，会跳转到cnfans里面去
            "handler":this.handleSearchParams.bind(this, "foreignHostParams","cnfans.com", true),
        },
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
            "handler":this.handleSearchParams.bind(this, "foreignHostParams","cnfans.com"),
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
            "handler":this.handleSearchParams.bind(this, "foreignHostParams","joyabuy.com"),
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
            "handler":this.handleSearchParams.bind(this, "foreignHostParams","oopbuy.com"),
        },
        "hoobuy.cc":{//这个：https://hoobuy.cc/nE5kJZdR，会跳转到hoobuy.com
            "handler":this.handlePathParams.bind(this, "foreignHostParams","hoobuy.com", true),
        },
        "hoobuy.com":{
            "template":"https://hoobuy.com/product/%s/%s",
            "keys":[/product\/(\d+)\/(\d+)/],
            "id_key":/product\/\d+\/(\d+)/,
            "shop_key":/product\/(\d+)\/\d+/,
            "shop_key_enum":{
                "0":this.domesticHostTemplate["1688.com"],
                "1":this.domesticHostTemplate["taobao.com"],
                "2":this.domesticHostTemplate["weidian.com"]
            },
            "handler":this.handlePathParams.bind(this, "foreignHostParams","hoobuy.com"),
        },
        "cssbuy.com":{
            "template":"https://cssbuy.com/item-%s-%s.html",
            "keys":[/item-(?:\w+-)?(\d+)\.html/,/item-(\w+)(?=-)/],
            "id_key":/item-(?:\w+-)?(\d+)\.html/,
            "shop_key":/item-(\w+)(?=-)/,
            "shop_key_enum":{
                "micro":this.domesticHostTemplate["weidian.com"],
                "taobao":this.domesticHostTemplate["taobao.com.com"],//如果是淘宝的话，这里是空的，第一个%s是没有值的
                "1688":this.domesticHostTemplate["1688.com"],
            },
            "handler":this.handlePathParams.bind(this, "foreignHostParams","cssbuy.com"),
        },
        "acbuy.com":{//这个如：https://l.acbuy.com/ax/855771584，会跳转到allchinabuy.com
            "handler":this.handleSearchParamsUrl.bind(this, "foreignHostParams","allchinabuy.com", true),
        },
        "allchinabuy.com":{
            "template":"https://www.allchinabuy.com/en/page/buy/?url=%s",//这个%s是各个国内的链接
            "url_key":"url",//可以直接拿到国内的链接
            "handler":this.handleSearchParamsUrl.bind(this, "foreignHostParams","allchinabuy.com"),
        },
        "allapp.link":{

        }
    };
    foreignHostParamsWithContent = {
        "yupoo.com":{}
    };

    hostTemplate = Object.assign({}, this.domesticHostTemplate, this.foreignHostParams);

    async getRedirectUrl(rawUri){
        try{
            const instance = axios.create({
                maxRedirects: 0 // 禁用自动重定向
            });
            let url = null;
            // 监听重定向事件
            instance.interceptors.response.use(null, (error) => {
                const { response } = error;
                if (response && (response.status === 301 || response.status == 302)) {
                    // 处理301,302重定向，例如记录日志或者其他逻辑
                    url = response.headers.location;
                    console.log(`getRedirectUrl:${response.status},${url}`);
                }
                // 之后你可以选择如何处理错误，比如重新请求或者抛出错误
                //return Promise.reject(error);
            });
            // 使用该实例发送请求
            await instance.get(rawUri.href);
            return url;
        } catch (err) {
            console.error("getRedirectUrl:", err.message);
            return null;
        }
    }

    async handleSearchParamsUrl(params, rootHost, isRedirect = false, rawUri) {
        //console.log('this:',this[params][rootHost]);
        //console.log('rawUri:',rawUri);
        try {
            let url = null;
            if(isRedirect) {
                url = await this.getRedirectUrl(rawUri);
                if(!url){
                    throw new Error("获取重定向地址失败:"+rawUri.href);
                }
            }
            const redirectUri = new URL(url);
            const hostConfig = this[params][rootHost];
            const domesticUri = redirectUri.searchParams.get(hostConfig.url_key);
            if(!domesticUri){
                throw new Error(`缺少参数：${hostConfig.domesticUri}`);
            }
            return this.getStandardUrls(domesticUri);
        } catch (err) {
            console.error(`handleSearchParamsUrl:${err.message}`);
            return null;
        }
    }

    async handlePathParams(params, rootHost, isRedirect = false, rawUri) {
        //console.log('this:',this[params][rootHost]);
        //console.log('rawUri:',rawUri);
        try {
            let url = rawUri.href;
            if(isRedirect) {
                url = await this.getRedirectUrl(rawUri);
                if(!url){
                    throw new Error("获取重定向地址失败");
                }
            }
            const itemID = "";
            const shopType = "";
            const hostConfig = this[params][rootHost];
            if(rootHost === "cssbuy.com"){
                // const url = 'https://cssbuy.com/item-micro-7240628629.html';
                // 使用正则表达式提取信息
                const regex = hostConfig.id_key;///item-(?:\w+-)?(\d+)\.html/; // 适应没有前缀和连接符的情况
                const match = url.match(regex);
                if (match) {
                    itemID = match[1]; // 提取的数字
                    const prefixMatch = url.match(hostConfig.shop_key); // 提取前缀（如果存在）
                    shopType = prefixMatch ? prefixMatch[1] : "taobao"; // 如果有前缀则返回，否则返回默认值
                    console.log(`提取的前缀: ${prefix}`);
                    console.log(`提取的数字: ${number}`);
                } else {
                    console.log('未能匹配到所需的信息');
                }
            } else {
                const match = url.match(hostConfig.keys[0]);
                if (match) {
                    shopType = match[1];
                    itemID = match[2];
                    console.log(`First number: ${shopType}`);
                    console.log(`Second number: ${itemID}`);
                } else {
                    console.log("No match found");
                }
            }
            return this.getDomesticUrl(hostConfig, shopType, itemID);
        } catch (err) {
            console.error(`handlePathParams:${err.message}`);
            return null;
        }
        //在这里处理国内平台链接
    }

    async handleSearchParams(params, rootHost, isRedirect = false, rawUri) {
        //console.log('this:',this[params][rootHost]);
        //console.log('rawUri:',rawUri);
        try {
            let url = rawUri.href;
            if(isRedirect) {
                url = await this.getRedirectUrl(rawUri);
                if(!url){
                    throw new Error("handleSearchParams:获取重定向地址失败");
                }
            }
            const redirectUri = new URL(url);
            const hostConfig = this[params][rootHost];
            const shopType = redirectUri.searchParams.get(hostConfig.shop_key);
            if(!shopType){
                throw new Error(`handleSearchParams:缺少参数:shopType`);
            }
            const id = redirectUri.searchParams.get(hostConfig.id_key);
            if(!id){
                throw new Error(`handleSearchParams:缺少参数:id`);
            }
            return this.getDomesticUrl(hostConfig, shopType, id);
        } catch (err) {
            console.error(`handleSearchParams:${err.message}`);
            return null;
        }
    }
    
    getDomesticUrl(hostConfig, shopType, id){
        try {
            const shop_key_enums = Object.keys(hostConfig.shop_key_enum);
            if(!shop_key_enums.includes(shopType)){
                throw new Error(`不支持的店铺类型：${shopType}`);
            }
            const domesticTemplate = hostConfig.shop_key_enum[shopType].template;
            const domesticUri = format(domesticTemplate, id);
            console.log(`getDomesticUrls:`, domesticUri);
            return domesticUri;
        }catch (err) {
            console.error(`getDomesticUrl:${err.message}`);
            return null;
        }
    }

    //通过buy域名找国内的,用async是因为有可能要调用getRedirectUrl方法，这个方法是异步的
    async getDomesticUrls(rawUriStr){
        try {
            let rawUri = new URL(rawUriStr);
            const rootHost = this.getRootHost(rawUri);
            const hostConfig = this.foreignHostParams[rootHost];
            if(!hostConfig){
                throw new Error(`不支持的foreign域名:${rootHost}`);
            }
            return await hostConfig.handler(rawUri);
        } 
        catch (err) {
            console.error("getDomesticUrls:"+err.message);
            return null;
        }
    }

    getRootHost(rawUri){
        try {
            const hostParts = rawUri.host.split('.');
            return hostParts.slice(-2).join('.'); 
        } catch (err) {
            console.error(`getRootHost:${err.message}`);
            return null;
        }
    }

    getStandardUrls(rawUriStr){
        let rawUri = null;
        try {
            rawUri = new URL(rawUriStr);
        } catch (err) {
            console.error(err.message);
            return null;
        }
        const rootHost = this.getRootHost(rawUri);
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
}