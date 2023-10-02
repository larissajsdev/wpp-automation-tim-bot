// eslint-disable-next-line @typescript-eslint/no-var-requires
const excelToJson = require('convert-excel-to-json');
export async function convertExcelToJSON(file: Express.Multer.File) {
  const convertedSheets = excelToJson({
    sourceFile: `${file.destination}/${file.filename}`,
    header: { rows: 1 },
    columnToKey: {
      '*': '{{columnHeader}}',
    },
  });

  return getFirstSheet(convertedSheets);
}

function getFirstSheet(convertedSheets) {
  return convertedSheets[`${getFirstSheetName(convertedSheets)}`];
}
function getFirstSheetName(convertedSheets: any) {
  return Object.keys(convertedSheets)[0];
}
