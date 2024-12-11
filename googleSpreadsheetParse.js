import axios from 'axios';
import * as cheerio from 'cheerio';

// 允许的主机名
const hostsName = [
    "cnfans.com",
    "cnfansbestspreadsheet.com",
    "hoobuy.cc",
    "weidian.com",
    "oopbuy.com",
    "acbuy.com",
    "pandabuy.com",
    "allapp.link",
    "yupoo.com",
    "cssbuy.com",
];

async function fetchData(url) {
    const response = await axios.get(url);
    return response.data;
}

function extractLinks(html) {
    const $ = cheerio.load(html);
    const uniqueLinks = new Set(); // 用于去重
    const links = [];

    // 提取 <a> 标签中的链接
    $('a').each((_, element) => {
        const link = $(element).attr('href');
        if (link) {
            // 去除末尾的斜杠和反斜杠
            uniqueLinks.add(link); // 去重
        }
    });

    const httpsRegex = /https?:\/\/[\s/$.?#].[\s]*/gi;
    const plainTextLinks = [];
    $('body').contents().each(function(i, elem) {
        if (this.nodeType === 3) { // Node.TEXT_NODE
            const text = $(this).text();
            const matches = text.match(httpsRegex);
            if (matches) {
                plainTextLinks.push(...matches);
            }
        } else if (this.nodeType === 1) { // Node.ELEMENT_NODE
            $(this).contents().each(function() {
                // Recursively check child nodes
                if (this.nodeType === 3) {
                    const text = $(this).text();
                    const matches = text.match(httpsRegex);
                    if (matches) {
                        plainTextLinks.push(...matches);
                    }
                }
            });
        }
    });
    console.log("plaintTextLinks", plainTextLinks);return;

    // 正则表达式查找 JavaScript 中的链接
    const jsLinkRegex = /['"]?(https?:\/\/[^\s'"<>]+)['"]?/g; // 匹配 JavaScript 代码中的链接
    const scriptTags = $('script');
    
    scriptTags.each((_, script) => {
        const scriptContent = $(script).html();
        if (scriptContent) {
            let match;
            while ((match = jsLinkRegex.exec(scriptContent)) !== null) {
                // 去除末尾的斜杠和反斜杠
                uniqueLinks.add(match[1]); // 去重
            }
        }
    });

    // 将 Set 转换回数组，并返回
    uniqueLinks.forEach(link => {
        links.push(
            link.replace(/\\\\u003d/g, '=')
            .replace(/\\\\u0026/g, '&')
            .replace(/\\u003d/g, '=')
            .replace(/\\u0026/g, '=')
            .replace(/\\*/g, '')
        )
    });

    return links; // 返回去重的链接和链接计数
}

function categorizeLinksByHost(links) {
    const hostMap = new Map();

    links.forEach(link => {
        try {
            const url = new URL(link); // 使用 URL 对象来解析链接
            const hostParts = url.host.split('.');
            const host = hostParts.slice(-2).join('.');

            // 仅当主机在 hostsName 中时才添加链接
            if (hostsName.includes(host)) {
                if (!hostMap.has(host)) {
                    hostMap.set(host, []);
                }
                hostMap.get(host).push(link);
            }
        } catch (e) {
            console.error(`Invalid URL: ${link}`);
        }
    });

    return hostMap;
}

function sortHostsByCount(hostMap) {
    return Array.from(hostMap.entries()).sort((a, b) => b[1].length - a[1].length);
}

export async function parseGoodsSpreadsheets(urls) {
    const allLinks = [];

    for (const url of urls) {
        try {
            const html = await fetchData(url);
            const links = extractLinks(html);
            allLinks.push(...links);
        } catch (error) {
            console.error(`Error fetching ${url}: ${error.message}`);
        }
    }

    const hostMap = categorizeLinksByHost(allLinks); // 这里不用链接计数
    const sortedHosts = sortHostsByCount(hostMap);

    sortedHosts.forEach(([host, links]) => {
        console.log(`Host: ${host} (${links.length} links)`);
        links.forEach(link => {
            console.log(`  ${link}`);
        });
    });
}