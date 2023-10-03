export function mapearValoresPlanilha(vetor) {
  const mappedArray = [];

  for (const item of vetor) {
    const mappedItem = {};

    for (const key in item) {
      const mesData = item[key];
      const mesStr = `${mesData.status} - ${mesData.valor}`;
      mappedItem[key] = mesStr;
    }
    mappedArray.push(mappedItem);
  }
  return mappedArray;
}

export function getFaturasStatusByMeses(objeto) {
  const meses = Object.keys(objeto);
  let statusGeral = 'paga'; // Supõe que todos os meses estão pagos por padrão

  for (const mes of meses) {
    if (objeto[mes].status !== 'PAGA') {
      statusGeral = 'pendente'; // Se encontrar um mês não pago, altera para pendente
      break;
    }
  }
  return { STATUS: statusGeral.toUpperCase() };
}

export function extrairDadosFaturas(message: string) {
  const regex = /(\w+)\s*-\s*\*([\w\s]+)\*\s*-\s*R\$\s*([\d.,]+)/g;
  const matches = [];
  let match;

  while ((match = regex.exec(message)) !== null) {
    const MES = match[1].toUpperCase();
    const STATUS = match[2].toUpperCase();
    const VALOR = match[3].toUpperCase();

    const dados = { MES, STATUS, VALOR };
    matches.push(dados);
  }
  const obj = transformarVetorEmObjeto(matches);
  return obj;
}

export function transformarVetorEmObjeto(vetor) {
  const objetoTransformado = {};

  for (const item of vetor) {
    const mes = item.MES;
    objetoTransformado[mes] = {
      status: item.STATUS,
      valor: item.VALOR,
    };
  }

  return objetoTransformado;
}
