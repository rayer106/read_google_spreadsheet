import { readSpreadSheet, readTaobao, readAli1688 } from './puppeteerCrawler.js';
import { main } from './googleApiReader.js';
import { buyDataParse, getDataFromWeidian, getDataFromTaobao, getDataFromAli1688} from './buyDataParse.js';
//import { getDomesticUrls, getStandardUrls } from './buyConfig.js';
// 执行主函数
//const url = getDomesticUrls("https://cnfans.com/product/?id=624501840976&shop_type=taobao&ref=131132");
//const rawurl = getStandardUrls("https://cnfans.com/product/?id=624501840976&shop_type=taobao&ref=131132");
const urls = [
    'https://docs.google.com/spreadsheets/d/1d8d3BLMxaUomRufs6aWnssNY5RWEXPl5kbUO-8Be-5Y/edit?gid=402318860#gid=402318860',
    // 'https://docs.google.com/spreadsheets/d/1UWW5tnFU_9ENnHjScnC7ohWx9bgwER92gSEvV57dJlk/edit?gid=0#gid=0',
    // 'https://docs.google.com/spreadsheets/d/1NBjLdRjfgDKFeFg-gQJ094wdppi1HMpZyNSd0MzUSas/edit?gid=0#gid=0',
    // 'https://docs.google.com/spreadsheets/d/1n2_c818R24PV9cFnWOz2PF0HnC4pKaEoss--UBVSHtY/edit?gid=1718005552#gid=1718005552',
    // 'https://docs.google.com/spreadsheets/d/1tMuQqvnYzjdsh5cMPsEORdFYtOpf-jg6dNMM1Roik3Q/edit?gid=40502416#gid=40502416',
    // 'https://docs.google.com/spreadsheets/d/1VOxuSTYDX7Lt4rdrr4hRZ_EwY6pr9h69iPLHyvae_MU/edit?gid=1139652394#gid=1139652394',
    // 'https://docs.google.com/spreadsheets/d/1JOXfU9hnjo3o6ZCWfMhDPOWswvxVIXPh9RkaYhmXW7E/edit?gid=0#gid=0',
    // 'https://docs.google.com/spreadsheets/d/1RnU7VEYMHnBRVF65gEDzBXV7jFHLRitDvj-Ep50FAsM/edit?gid=98437900#gid=98437900',
    // 'https://docs.google.com/spreadsheets/d/1q6FFJxxYpaO9CAinecgpaC5StLA1PkgAFcz11a2XIKo/edit?gid=0#gid=0',
    // 'https://docs.google.com/spreadsheets/d/10kTV6P11KYR0XNR7vd1yZMyvrQFeLqpeLdNPn72gQcI/edit?gid=1033818333#gid=1033818333',
    // 'https://docs.google.com/spreadsheets/d/1js0mFBlC0070YD2qaN57HKXtGtQwDmxCWpZgpmXG5uM/edit?gid=0#gid=0&fvid=2076329314',
];

for (const element of urls) {
    const _ret = await main(element);
    await buyDataParse(_ret);
};

//await getDataFromTaobao("https://item.taobao.com/item.htm?id=772459929808");

//await getDataFromAli1688("https://detail.1688.com/offer/769199890261.html");

//await getDataFromWeidian("https://weidian.com/item.html?itemID=7293684807");

//await readTaobao("https://item.taobao.com/item.htm?id=772459929808");

//await readAli1688("https://detail.1688.com/offer/769199890261.html");