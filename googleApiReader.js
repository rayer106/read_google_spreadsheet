import { google } from 'googleapis';
import fs from 'fs';

// 加载服务帐号的凭据
const credentials = JSON.parse(fs.readFileSync('sylvan-stream-444209-r4-4435e8e651a5.json'));

// 创建 JWT 客户端
const { client_email, private_key } = credentials;
const jwtClient = new google.auth.JWT(
    client_email,
    null,
    private_key,
    ['https://www.googleapis.com/auth/spreadsheets.readonly']
);

// 获取所有工作表名称
const getSheetTitles = async (sheetId) => {
    const sheets = google.sheets({ version: 'v4', auth: jwtClient });
    
    const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
    });

    return response.data.sheets.map(sheet => sheet.properties.title);
};

// 批量请求数据的函数
const batchGetSpreadsheetData = async (sheetId, titles) => {
    const sheets = google.sheets({ version: 'v4', auth: jwtClient });

    // 设置范围
    const ranges = titles.map(title => `${title}!A1:Z3000`); // 修改为所需的范围
    const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
        ranges: ranges,
        includeGridData: true, // 在请求中包含 Grid 数据
    });

    return response.data.sheets; // 返回获取到的数据
};

// 访问 Google Sheets API，读取指定工作表的数据
const accessSpreadsheet = async (sheetId, titles) => {
    const sheetsData = await batchGetSpreadsheetData(sheetId, titles);
    const hostMap = new Map();

    sheetsData.forEach((sheet) => {
        if(sheet.properties.hidden) {
            console.log(`Sheet 【${sheet.properties.title}】 is hidden, skipping...`);
            return;
        }
        const title = sheet.properties.title;
        console.log(`Data from 【${title}】...`);
        if (!hostMap.has(title)) {
            hostMap.set(title, []);
        }
        const rowData = sheet.data[0].rowData;
        if(!rowData) {
            console.log(`No data found from 【${title}】`);
            return;
        }
        rowData.forEach((row, rowIndex) => {
            const cells = row.values || []; // 获取当前行的所有单元格

            cells.forEach((cell, colIndex) => {
                // 检查每个单元格是否有链接
                if (cell.hyperlink) {
                    if(cell.hyperlink.startsWith('http')) {
                        hostMap.get(title).push({
                            text: cell.formattedValue || "No Text",
                            link: cell.hyperlink,
                            //position: { row: rowIndex + 1, col: colIndex + 1 } // 行和列索引
                        });
                        //console.log(`Text: ${cell.formattedValue}, Link: ${cell.hyperlink}`);
                    }
                }
            });
            // // 输出找到的链接
            // if (links.length) {
            //     links.forEach(link => {
            //         console.log(`Text: ${link.text}, Link: ${link.link}, Position: ${link.position.row}, ${link.position.col}`);
            //     });
            // }
        });
    });
    return hostMap;
};

// 主执行函数
export async function main(url) {
    const regex = /\/d\/(.*?)(\/|$)/;
    const match = url.match(regex);
    const sheetId = match ? match[1] : null;
    if (!sheetId) {
        console.error('Invalid Google Sheets URL');
        return;
    }
    
    // 获取所有工作表
    const sheetTitles = await getSheetTitles(sheetId);
    console.log(`${sheetId} Found sheets:`, sheetTitles);
    
    // 读取每个工作表的数据
    const maps = await accessSpreadsheet(sheetId, sheetTitles);
    //console.log(`${sheetId} links length:`, links.length);
    return maps;
};