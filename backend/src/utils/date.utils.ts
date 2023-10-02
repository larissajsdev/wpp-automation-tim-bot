import moment = require("moment");

export const formattedDate = (inputDateStr: string) => {
   const inputDate: Date = new Date(inputDateStr)
  return `${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getDate().toString().padStart(2, '0')}-${inputDate.getFullYear()}`;
}

export const formatarDatasCliente = (cliente) => {


  const novoCliente = { ...cliente }; 
  for (const chave in novoCliente) {
    if (novoCliente.hasOwnProperty(chave) && typeof novoCliente[chave] === 'string' && new Date(novoCliente[chave]) instanceof Date) {
      novoCliente[chave] = moment(new Date(novoCliente[chave])).format('DD/MM/YYYY');
    }
  }
  return novoCliente;
}

