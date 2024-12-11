import axios from 'axios';
import * as cheerio from 'cheerio';
import {buyConfig} from './buyConfig.js';
import fs from 'fs';

export class buyDataParse {

    async dataParse(map) {
        // 遍历 Map，category是工作表名称，items是工作表中的数据
        for (const [category, items] of map) {
            console.log(`Category: ${category}`);
            for(let item of items) {
                console.log(`  ${item.link}`);
                let domesticLink = buyConfig.getDomesticUrls(item.link);
                if(!domesticLink) {
                    console.log(`link is null`);
                    continue;
                }
                const goodsContent = await getDataFromLink(domesticLink);
                console.log("goods content:",goodsContent);
                break;//TODO 这里是测试一个链接
            }
            break;//TODO 这里是测试一个工作表
        }
    };
    
    async getDataFromLink(rawUri) {
        if(!rawUri) {
            console.log('rawUri is null');
            return null;
        }
    
        if(rawUri.includes('weidian.com')) {
            return await this.getDataFromWeidian(rawUri);
        } else if(rawUri.includes('taobao.com')) {
            return await this.getDataFromTaobao(rawUri);
        } else if(rawUri.includes('1688.com')) {
            return await this.getDataFromAli1688(rawUri);
        } else {
            console.log('不支持的链接');
            return null;
        }
    }
    
    async getDataFromWeidian(rawUri) {
        try {
            const response = await axios.get(rawUri);
            const $ = cheerio.load(response.data);
            const data_obj = JSON.parse($('#__rocker-render-inject__').attr('data-obj'));
            if(!data_obj) {
                throw new Error('data_obj is null');
            }
    
            const goods = {"item_info":{},"shop_info":{},"sku_info":{}};
    
            goods.item_info.item_id = data_obj.result.default_model.item_info.item_id;
            goods.item_info.item_name = data_obj.result.default_model.item_info.item_name;
            goods.item_info.item_head = data_obj.result.default_model.item_info.item_head;
            goods.item_info.item_head_thumb = data_obj.result.default_model.item_info.item_head_thumb;
            goods.item_info.origin_price = data_obj.result.default_model.item_info.origin_price;
            goods.item_info.soldText = data_obj.result.default_model.item_info.soldText;
            
            goods.shop_info.shop_id = data_obj.result.default_model.shop_info.shop_id;
            goods.shop_info.shopName = data_obj.result.default_model.shop_info.shopName;
            goods.shop_info.shop_logo = data_obj.result.default_model.shop_info.shop_logo;
            goods.shop_info.shop_url = data_obj.result.default_model.shop_info.shop_url;
            goods.shop_info.shop_status = data_obj.result.default_model.shop_info.shop_status;
            goods.shop_info.shop_credit = data_obj.result.default_model.shop_info.shop_credit;
    
            goods.sku_info = data_obj.result.default_model.sku_properties;
    
            return goods;
        } catch (error) {
            console.error('Weidian数据结构变化, 解析失败', error.message);
            return null;
        }
    }

    async getDataFromAli1688(rawUri) {
        try {
            const response = await axios.get(rawUri);
            //const $ = cheerio.load(response.data);
    
            //const response = await axios.get("https://weidian.com/item.html?itemID=7261877317");
            //console.log(response.data);
            fs.writeFileSync('weidian.html', response.data);
            //const $ = cheerio.load(response.data);
            //const data_obj = $('#__rocker-render-inject__').attr('data-obj');
            //const data_obj = JSON.parse($('#__rocker-render-inject__').attr('data-obj'));
            //fs.writeFileSync('weidian_data_obj.html', data_obj);
            return null;
    
    
            //const data_obj = JSON.parse($('#__rocker-render-inject__').attr('data-obj'));
            if(!data_obj) {
                throw new Error('data_obj is null');
            }
    
            const goods = {"item_info":{},"shop_info":{},"sku_info":{}};
    
            goods.item_info.item_id = data_obj.result.default_model.item_info.item_id;
            goods.item_info.item_name = data_obj.result.default_model.item_info.item_name;
            goods.item_info.item_head = data_obj.result.default_model.item_info.item_head;
            goods.item_info.item_head_thumb = data_obj.result.default_model.item_info.item_head_thumb;
            goods.item_info.origin_price = data_obj.result.default_model.item_info.origin_price;
            goods.item_info.soldText = data_obj.result.default_model.item_info.soldText;
            
            goods.shop_info.shop_id = data_obj.result.default_model.shop_info.shop_id;
            goods.shop_info.shopName = data_obj.result.default_model.shop_info.shopName;
            goods.shop_info.shop_logo = data_obj.result.default_model.shop_info.shop_logo;
            goods.shop_info.shop_url = data_obj.result.default_model.shop_info.shop_url;
            goods.shop_info.shop_status = data_obj.result.default_model.shop_info.shop_status;
            goods.shop_info.shop_credit = data_obj.result.default_model.shop_info.shop_credit;
    
            goods.sku_info = data_obj.result.default_model.sku_properties;
    
            return goods;
        } catch (error) {
            console.error('Taobao数据结构变化, 解析失败', error.message);
            return null;
        }
    }
    
    async getDataFromTaobao(rawUri) {
        try {
            const response = await axios.get(rawUri);
            //const $ = cheerio.load(response.data);
    
            //const response = await axios.get("https://weidian.com/item.html?itemID=7261877317");
            //console.log(response.data);
            fs.writeFileSync('weidian.html', response.data);
            //const $ = cheerio.load(response.data);
            //const data_obj = $('#__rocker-render-inject__').attr('data-obj');
            //const data_obj = JSON.parse($('#__rocker-render-inject__').attr('data-obj'));
            //fs.writeFileSync('weidian_data_obj.html', data_obj);
            return null;
    
    
            //const data_obj = JSON.parse($('#__rocker-render-inject__').attr('data-obj'));
            if(!data_obj) {
                throw new Error('data_obj is null');
            }
    
            const goods = {"item_info":{},"shop_info":{},"sku_info":{}};
    
            goods.item_info.item_id = data_obj.result.default_model.item_info.item_id;
            goods.item_info.item_name = data_obj.result.default_model.item_info.item_name;
            goods.item_info.item_head = data_obj.result.default_model.item_info.item_head;
            goods.item_info.item_head_thumb = data_obj.result.default_model.item_info.item_head_thumb;
            goods.item_info.origin_price = data_obj.result.default_model.item_info.origin_price;
            goods.item_info.soldText = data_obj.result.default_model.item_info.soldText;
            
            goods.shop_info.shop_id = data_obj.result.default_model.shop_info.shop_id;
            goods.shop_info.shopName = data_obj.result.default_model.shop_info.shopName;
            goods.shop_info.shop_logo = data_obj.result.default_model.shop_info.shop_logo;
            goods.shop_info.shop_url = data_obj.result.default_model.shop_info.shop_url;
            goods.shop_info.shop_status = data_obj.result.default_model.shop_info.shop_status;
            goods.shop_info.shop_credit = data_obj.result.default_model.shop_info.shop_credit;
    
            goods.sku_info = data_obj.result.default_model.sku_properties;
    
            return goods;
        } catch (error) {
            console.error('Taobao数据结构变化, 解析失败', error.message);
            return null;
        }
    }
}