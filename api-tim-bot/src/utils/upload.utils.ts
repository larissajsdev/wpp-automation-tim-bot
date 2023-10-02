import console = require('console');
import { Workbook } from 'exceljs';
import moment = require("moment");
export async function convertExcelToJSON(file: Express.Multer.File) {
  const workbook = new Workbook();
  await workbook.xlsx.readFile(file.path);
  const worksheet = workbook.worksheets[0];
  const jsonData = worksheet.getSheetValues();
  const headers = jsonData[1];
  const data = jsonData.slice(1);
  
  const jsonResult: any = data.map((row: any) => {
    const resultRow = {};

    row.forEach((value, index) => {
      console.log(value)
      if (value != undefined) {
        resultRow[headers[index]] = value;
      }
    });
    return resultRow;
  });


  return jsonResult;
}

