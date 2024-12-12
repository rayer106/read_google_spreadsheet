import { readSpreadSheet, readTaobao, readAli1688 } from './puppeteerCrawler.js';
import { main } from './googleApiReader.js';
import {buyDataParse} from './buyDataParse.js';
import {buyConfig} from './buyConfig.js';
import axios from 'axios';
// 执行主函数
 const buy_config = new buyConfig();
 await buy_config.getDomesticUrlByForeignHost("https://cnfans.com/product/?id=624501840976&shop_type=taobao&ref=131132");
 await buy_config.getDomesticUrlByForeignHost("http://tinyurl.com/Burberry-Sneaker");
 await buy_config.getDomesticUrlByForeignHost("https://oopbuy.com/product/0/652894214777");
 await buy_config.getDomesticUrlByForeignHost("https://hoobuy.cc/nE5kJZdR");
 await buy_config.getDomesticUrlByForeignHost("https://hoobuy.com/product/2/7258665479?utm_source=share&utm_medium=product_details");
 await buy_config.getDomesticUrlByForeignHost("https://cssbuy.com/item-micro-7240628629.html");
 await buy_config.getDomesticUrlByForeignHost("https://l.acbuy.com/ax/855771584");

//  const cnFans = buy_config.foreignHostParams['cnfans.com'];
//  const cnFansHandler = buy_config.foreignHostParams['cnfans.com'].handler;
//  cnFansHandler.call(cnFans);

// const url = buy_config.getDomesticUrlByForeignHost("https://cnfans.com/product/?id=624501840976&shop_type=taobao&ref=131132");
// const rawurl = buy_config.getStandardUrls("https://cnfans.com/product/?id=624501840976&shop_type=taobao&ref=131132");
const urls = [
    // 'https://docs.google.com/spreadsheets/d/1d8d3BLMxaUomRufs6aWnssNY5RWEXPl5kbUO-8Be-5Y/edit?gid=402318860#gid=402318860',
    // 'https://docs.google.com/spreadsheets/d/1UWW5tnFU_9ENnHjScnC7ohWx9bgwER92gSEvV57dJlk/edit?gid=0#gid=0',
    // 'https://docs.google.com/spreadsheets/d/1NBjLdRjfgDKFeFg-gQJ094wdppi1HMpZyNSd0MzUSas/edit?gid=0#gid=0',
    // 'https://docs.google.com/spreadsheets/d/1n2_c818R24PV9cFnWOz2PF0HnC4pKaEoss--UBVSHtY/edit?gid=1718005552#gid=1718005552',
    // 'https://docs.google.com/spreadsheets/d/1tMuQqvnYzjdsh5cMPsEORdFYtOpf-jg6dNMM1Roik3Q/edit?gid=40502416#gid=40502416',
    'https://docs.google.com/spreadsheets/d/1VOxuSTYDX7Lt4rdrr4hRZ_EwY6pr9h69iPLHyvae_MU/edit?gid=1139652394#gid=1139652394',
    'https://docs.google.com/spreadsheets/d/1JOXfU9hnjo3o6ZCWfMhDPOWswvxVIXPh9RkaYhmXW7E/edit?gid=0#gid=0',
    'https://docs.google.com/spreadsheets/d/1RnU7VEYMHnBRVF65gEDzBXV7jFHLRitDvj-Ep50FAsM/edit?gid=98437900#gid=98437900',
    'https://docs.google.com/spreadsheets/d/1q6FFJxxYpaO9CAinecgpaC5StLA1PkgAFcz11a2XIKo/edit?gid=0#gid=0',
    'https://docs.google.com/spreadsheets/d/10kTV6P11KYR0XNR7vd1yZMyvrQFeLqpeLdNPn72gQcI/edit?gid=1033818333#gid=1033818333',
    'https://docs.google.com/spreadsheets/d/1js0mFBlC0070YD2qaN57HKXtGtQwDmxCWpZgpmXG5uM/edit?gid=0#gid=0&fvid=2076329314',
];

// const url = 'https://cssbuy.com/item-7240628629.html';
// // 使用正则表达式提取信息
// const regex = /item-(?:\w+-)?(\d+)\.html/; // 适应没有前缀和连接符的情况
// const match = url.match(regex);

// if (match) {
//     const number = match[1]; // 提取的数字
//     const prefixMatch = url.match(/item-(\w+)(?=-)/); // 提取前缀（如果存在）
//     const prefix = prefixMatch ? prefixMatch[1] : "没有前缀"; // 如果有前缀则返回，否则返回默认值
    
//     console.log(`提取的前缀: ${prefix}`);
//     console.log(`提取的数字: ${number}`);
// } else {
//     console.log('未能匹配到所需的信息');
// }

// // 创建一个 axios 实例
// const instance = axios.create({
//     maxRedirects: 0 // 禁用自动重定向
// });
// let url = "";
// // 监听重定向事件
// instance.interceptors.response.use(null, (error) => {
//     const { response } = error;
//     if (response && (response.status === 301 || response.status == 302)) {
//         // 处理301重定向，例如记录日志或者其他逻辑
//         console.log('重定向到:', response.headers.location);
//         url = response.headers.location;
//     }
//     // 之后你可以选择如何处理错误，比如重新请求或者抛出错误
//     //return Promise.reject(error);
// });
// // 使用该实例发送请求
// await instance.get('http://tinyurl.com/Burberry-Sneaker');
// console.log("url:",url);

const urlMaps = new Map();
const dataParse = new buyDataParse();
for (const element of urls) {//一个spread链接获取一次
    const _ret = await main(element);
    await dataParse.parse(_ret);
    //下面是用来打印的
    for (const [category, items] of _ret) {
        //console.log(`Category: ${category}`);
        for(let item of items) {
            //console.log(`  ${item.link}`);
            try {
                const url = new URL(item.link); // 使用 URL 对象来解析链接
                
                const hostParts = url.host.split('.');
                const host = hostParts.slice(-2).join('.');
    
                // 仅当主机在 hostsName 中时才添加链接
                if (!urlMaps.has(host)) {
                    console.log(`  hostsName ${host}:`, item.link);
                    urlMaps.set(host, []);
                }
                //urlMaps.get(host).push(link);
            } catch (e) {
                console.error(`Invalid URL: ${link}:`, e.message);
            }
        }
    }
    //await buyDataParse(_ret);
};

// const dataParse = new buyDataParse();
//await getDataFromTaobao("https://item.taobao.com/item.htm?id=772459929808");
//await getDataFromAli1688("https://detail.1688.com/offer/769199890261.html");
// const data = await dataParse.getDataFromWeidian("https://weidian.com/item.html?itemID=7293684807");
// console.log(data);
//await readTaobao("https://item.taobao.com/item.htm?id=772459929808");
//await readAli1688("https://detail.1688.com/offer/769199890261.html");