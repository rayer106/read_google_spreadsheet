import puppeteer from 'puppeteer';
import fs from 'fs';
// const urls = [
//     //'https://docs.google.com/spreadsheets/d/1d8d3BLMxaUomRufs6aWnssNY5RWEXPl5kbUO-8Be-5Y/edit?gid=402318860#gid=402318860',
//     'https://docs.google.com/spreadsheets/d/1UWW5tnFU_9ENnHjScnC7ohWx9bgwER92gSEvV57dJlk/edit?gid=0#gid=0',
//     // 'https://docs.google.com/spreadsheets/d/1NBjLdRjfgDKFeFg-gQJ094wdppi1HMpZyNSd0MzUSas/edit?gid=0#gid=0',
//     // 'https://docs.google.com/spreadsheets/d/1n2_c818R24PV9cFnWOz2PF0HnC4pKaEoss--UBVSHtY/edit?gid=1718005552#gid=1718005552',
//     // 'https://docs.google.com/spreadsheets/d/1tMuQqvnYzjdsh5cMPsEORdFYtOpf-jg6dNMM1Roik3Q/edit?gid=40502416#gid=40502416',
//     // 'https://docs.google.com/spreadsheets/d/1VOxuSTYDX7Lt4rdrr4hRZ_EwY6pr9h69iPLHyvae_MU/edit?gid=1139652394#gid=1139652394',
//     // 'https://docs.google.com/spreadsheets/d/1JOXfU9hnjo3o6ZCWfMhDPOWswvxVIXPh9RkaYhmXW7E/edit?gid=0#gid=0',
//     // 'https://docs.google.com/spreadsheets/d/1RnU7VEYMHnBRVF65gEDzBXV7jFHLRitDvj-Ep50FAsM/edit?gid=98437900#gid=98437900',
//     // 'https://docs.google.com/spreadsheets/d/1q6FFJxxYpaO9CAinecgpaC5StLA1PkgAFcz11a2XIKo/edit?gid=0#gid=0',
// ];

export async function readSpreadSheet(spreadSheetUrl) {
    const browser = await puppeteer.launch({ headless: false , defaultViewport: null});
    const page = await browser.newPage();

    // 获取当前 Chrome 窗口大小
    const { width, height } = await page.evaluate(() => {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    });
    console.log(`Chrome window size is ${width}x${height}.`);
    // 设置浏览器窗口尺寸
    await page.setViewport({ width, height });
    console.log(`Viewport set to ${width}x ${height}.`);

    console.log('Navigating to Google Spreadsheet...');
    //'https://docs.google.com/spreadsheets/d/1d8d3BLMxaUomRufs6aWnssNY5RWEXPl5kbUO-8Be-5Y/edit?gid=402318860'
    await page.goto(spreadSheetUrl, {
    //await page.goto('https://docs.google.com/spreadsheets/d/1UWW5tnFU_9ENnHjScnC7ohWx9bgwER92gSEvV57dJlk/edit?gid=0#gid=0', {
        waitUntil: 'networkidle2', // 等待网络空闲
        timeout: 60000 // 设置超时时间为60秒
    });
    console.log('Page loaded.');

    // // 使用 transform 进行缩放
    // await page.evaluate(() => {
    //     document.body.style.transform = 'scale(0.5)'; // 50%缩放
    //     document.body.style.transformOrigin = '0 0'; 
    //     document.body.style.width = '200%'; // 更新宽度以适应缩放
    //     document.body.style.height = '3000px'; // 更新宽度以适应缩放
    // });
    // console.log('Page scaled to 100%.');

    //await page.waitForSelector('.grid-container');
    //await page.waitForSelector('.grid-bottom-bar');
    await page.waitForSelector('#docs-editor-container');
    console.log('Grid container and bottom bar ready.');

    // 在缩放后获取当前所有 Tab 的元素
    let tabs = await page.$$('.docs-sheet-tab');
    console.log(`Found ${tabs.length} tabs after scaling.`);

    // 遍历每个 Tab
    for (let [index, tab] of tabs.entries()) {
        console.log(`Clicking on tab ${index + 1}: ${await tab.evaluate(el => el.textContent.trim())}...`);
        const isVisible = await tab.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.pointerEvents !== 'none';
        });
    
        if (!isVisible) {
            console.log(`tab is invisible, skip.`);
            continue; // 如果不可见，则跳过当前循环
        }
        await tab.click();
        //await new Promise(resolve => setTimeout(resolve, 2000)); // 等待内容加载
        await page.waitForSelector('.grid-container'); // 等待编辑器准备好
        console.log('Grid container ready.');
        console.log('Loading more content...');
        //await autoScroll(page);

        // 替换为实际容器选择器
        await autoScrollContainer(page, '.native-scrollbar.native-scrollbar-ltr.native-scrollbar-y');

        // 提取当前页面中的所有链接
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a')).map(link => link.href);
        });

        console.log(`Links in tab ${index + 1}:`, links);
    }

    console.log('Finished processing all tabs.');
    await browser.close();
}

async function autoScrollContainer(page, selector) {
    // 监听浏览器控制台日志
    page.on('console', msg => console.log('Browser log:', msg.text()));

    await page.evaluate(async (selector) => {
        const element = document.querySelector(selector);
        if (element) {
            const distance = element.clientHeight; // 设置为容器的可视高度
            const scrollHeight = element.scrollHeight;
            let totalHeight = 0;

            console.log(`开始滚动，容器总高度: ${scrollHeight}, 每次滚动距离: ${distance}`);

            await new Promise((resolve) => {
                const timer = setInterval(() => {
                    element.scrollBy(0, distance);
                    totalHeight += distance;

                    console.log(`已滚动的总高度: ${totalHeight}`);

                    // 如果已经滚动到容器底部，则停止
                    if (totalHeight >= scrollHeight) {
                        console.log('已滚动到容器底部，停止滚动');
                        clearInterval(timer);
                        resolve();
                    }
                }, 100); // 每100毫秒滚动一次
            });
        } else {
            console.log(`未找到选择器: ${selector}`);
        }
    }, selector);
}

export async function readTaobao(uri) {
    const browser = await puppeteer.launch({ headless: false , defaultViewport: null});
    const page = await browser.newPage();
    
    // 获取当前 Chrome 窗口大小
    const { width, height } = await page.evaluate(() => {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    });
    console.log(`Chrome window size is ${width}x${height}.`);
    // 设置浏览器窗口尺寸
    await page.setViewport({ width, height });
    console.log(`Viewport set to ${width}x ${height}.`);

    let _response = null;
    console.log('Navigating to tabao:',uri);
    //await page.setRequestInterception(true);
    page.on('response', async (response) => {
        // 检查响应的URL或其他属性
        console.log(`Intercepted response: ${response.url()}`);
    
        // 根据需要决定是否修改响应内容
        if (response.url().includes('mtop.taobao.pcdetail.data.get')) {
          // 读取原始的响应内容
            const originalBody = await response.text();
            const responeBody = JSON.parse(originalBody);
            if(responeBody.data.item) {
                _response = responeBody.data;
            }
        }
    });
    await page.goto(uri, {
        waitUntil: 'networkidle2', // 等待网络空闲
        timeout: 60000 // 设置超时时间为60秒
    });
    console.log('Page loaded.');
    if(_response) {
        console.log('------------------原始数据----------:', _response.item);
    }
    console.log('------------------原始数据为空----------');
    // 拦截所有请求

    await browser.close();
}

export async function readAli1688(uri) {
    const browser = await puppeteer.launch({ headless: false , defaultViewport: null});
    const page = await browser.newPage();
    
    // 获取当前 Chrome 窗口大小
    const { width, height } = await page.evaluate(() => {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    });
    console.log(`Chrome window size is ${width}x${height}.`);
    // 设置浏览器窗口尺寸
    await page.setViewport({ width, height });
    console.log(`Viewport set to ${width}x ${height}.`);

    let _response = null;
    console.log('Navigating to tabao:',uri);
    //await page.setRequestInterception(true);
    page.on('response', async (response) => {
        // 检查响应的URL或其他属性
        console.log(`Intercepted response: ${response.url()}`);
    
        // 根据需要决定是否修改响应内容
        if (response.url().includes('mtop.taobao.pcdetail.data.get')) {
          // 读取原始的响应内容
            const originalBody = await response.text();
            const responeBody = JSON.parse(originalBody);
            if(responeBody.data.item) {
                _response = responeBody.data;
            }
        }
    });
    await page.goto(uri, {
        waitUntil: 'networkidle2', // 等待网络空闲
        timeout: 60000 // 设置超时时间为60秒
    });
    console.log('Page loaded.');
    if(_response) {
        console.log('------------------原始数据----------:', _response.item);
    }
    console.log('------------------原始数据为空----------');
    // 拦截所有请求

    //await browser.close();
}