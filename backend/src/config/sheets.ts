import { JWT } from 'google-auth-library';
import * as credentials from './credentials.json';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';

const serviceAccountAuth = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function getSpreadSheet() {
  try {
    const doc = new GoogleSpreadsheet(process.env.KEY_PLANILHA, serviceAccountAuth);
    await doc.loadInfo();
    const spreadSheet = doc.sheetsByIndex[0];
    return spreadSheet;
  } catch (error) {
    Logger.warn("Não foi possível obter dados da planilha", error)
  throw new HttpException({ error: "Não foi possível carregar os dados da planilha", describe: error.message}, HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

export async function saveRows(row){
  const spreadSheet = await getSpreadSheet();
  await spreadSheet.addRows(row)
    .then(r => Logger.log(`Cliente salvo com sucesso na planilha`))
    .catch(r=> {
      console.log(r)
      Logger.warn(`Cliente não foi salvo na planilha`)
    } )
    
}