import { Injectable, Logger } from '@nestjs/common';
import {
  ERROR_MESSAGE,
  MESSAGES,
  clearMessages,
  getAllMessagesContent,
  getFaturasMessage,
  getLastMessageContent,
  lastMessagehasPassed30Seconds,
  isFluxPhrase,
  sendMessage,
} from './utils/message.utils';
import {
  extrairDadosFaturas,
  getFaturasStatusByMeses,
  mapearValoresPlanilha,
} from './utils/faturas.utils';
import { getSpreadSheet, saveRows } from './config/sheets';
import { timer } from './utils/timer.utils';
import { convertExcelToJSON } from './utils/upload.utils';
@Injectable()
export class AppService {
  async upload(file: Express.Multer.File) {
    const clientesJSON = await convertExcelToJSON(file);
    await this.startBot(clientesJSON);
  }

  async startBot(planos: Array<any>) {
    await clearMessages();
    await sendMessage('Iniciando Bot...');
    await timer(5);

    let allMessages = await getAllMessagesContent();

    const spreadSheet = await getSpreadSheet();

    let faturaMessage = '';

    let lastMessage = allMessages[allMessages.length - 1];

    if (spreadSheet.getRows.length > 0) {
      await spreadSheet.clearRows();
    }

    for (let i = 0; i < planos.length; i++) {
      let progress = 0;
      while (progress < 4) {
        lastMessage = await getLastMessageContent();
        Logger.log(`-> cliente atual: ${i}`);
        Logger.log(`-> vendedor atual: ${planos[i].CPF_CNPJ}`);

        if (isFluxPhrase(lastMessage)) {
          Logger.log(`-> mensagem de fluxo? [${isFluxPhrase(lastMessage)}]`);
          // 1º FASE: Identificar mensagem de opções, enviar dígito 3
          if (lastMessage.includes(MESSAGES.MESSAGE_OPTIONS)) {
            progress = 1;
            Logger.log(
              `-> (1) ETAPA: ENVIAR OPÇÃO DESEJADA [${planos[i].CPF_CNPJ}]`,
            );
            Logger.log(`-> nível atual: [${progress}]`);
            await sendMessage('3');
            await timer(3);
          }
          // 2º FASE: Identificar mensagem de CPF, enviar CPF
          if (lastMessage.includes(MESSAGES.MESSAGE_CPF)) {
            progress = 2;
            Logger.log(
              `-> (2) ETAPA: ENVIAR CPF_CNPJ [${planos[i].VENDEDOR} - ${planos[i].CPF_CNPJ}]`,
            );
            Logger.log(`-> nível atual: [${progress}]`);
            const CPF_CNPJ = planos[i].CPF_CNPJ;
            await sendMessage(CPF_CNPJ);
            await timer(3);
          }
          // 3º FASE: Identificar mensagem de ENDEREÇO, enviar 'SIM'
          if (lastMessage.includes(MESSAGES.MESSAGE_ADDRESS)) {
            progress = 3;
            Logger.log(
              `-> (3) ETAPA: CONFIRMAR ENDEREÇO [${planos[i].CPF_CNPJ}]`,
            );
            Logger.log(`-> nível atual: [${progress}]`);
            await sendMessage('SIM');
            await timer(1);
          }

          await timer(4);

          faturaMessage = await getFaturasMessage();

          if (lastMessage == MESSAGES.WAITING) {
            const isOldWaitingMessage = await lastMessagehasPassed30Seconds();
            if (isOldWaitingMessage) {
              await sendMessage('PRÓXIMA MENSAGEM');
            }
          }
          if (
            lastMessage.includes(MESSAGES.END_FLUX_MESSAGE) ||
            lastMessage.includes(MESSAGES.AGRADECEMOS) ||
            lastMessage.includes(MESSAGES.PROTOCOLO_ATENDIMENTO)
          ) {
            await timer(3);
            allMessages = await getAllMessagesContent();

            const frasesEncontradas = allMessages.filter((message) => {
              if (message != undefined) {
                return message.includes(MESSAGES.FALHA_SOLICITACAO);
              } else {
                return null;
              }
            });
            if (frasesEncontradas.length != 0) {
              progress = 4;
              const row = {
                ...planos[i],
                STATUS: 'CPF INCONCLUSIVO',
              };
              await timer(2);
              await saveRows([row]);
            }
          }

          if (faturaMessage != undefined || faturaMessage != null) {
            if (faturaMessage.includes(MESSAGES.FATURA_MESSAGE)) {
              progress = 4;

              Logger.log(
                `-> (4) ETAPA: COLETAR DADOS [${planos[i].VENDEDOR} - ${planos[i].CPF_CNPJ}]`,
              );
              Logger.log(`-> nível atual: [${progress}]`);

              const faturas = extrairDadosFaturas(faturaMessage);
              const statusGeral = getFaturasStatusByMeses(faturas);
              const valores = mapearValoresPlanilha([faturas]);

              const newValores = valores.map((valor) => {
                return {
                  ...planos[i],
                  ...valor,
                  ...statusGeral,
                };
              });
              await saveRows(newValores);
              await clearMessages();
              await sendMessage('NOVO FLUXO');
              await timer(4);
            }
          }

          if (lastMessage.includes(MESSAGES.FATURA_UNICA)) {
            progress = 4;

            Logger.log(
              `-> (*) FATURA ÚNICA: COLETAR DADOS [${planos[i].VENDEDOR} - ${planos[i].CPF_CNPJ}]`,
            );
            Logger.log(`-> nível atual: [${progress}]`);

            const faturas = extrairDadosFaturas(faturaMessage);
            const valores = mapearValoresPlanilha([faturas]);

            const newValores = valores.map((valor) => {
              return {
                ...planos[i],
                ...valor,
                STATUS: 'FATURA UNICA',
              };
            });
            await saveRows(newValores);
            await clearMessages();
            await sendMessage('NOVO FLUXO');
            await timer(4);
          }

          if (lastMessage.includes(MESSAGES.DUPLICATE_ADDRESS)) {
            const clienteRow = {
              ...planos[i],
              STATUS: 'ENDERECO DUPLICADO',
            };
            await saveRows([clienteRow]);
            await sendMessage('ENDEREÇO DUPLICADO - PŔOXIMO CLIENTE...');
            await timer(3);
            progress = 4;
          }

          if (lastMessage.includes(ERROR_MESSAGE.NOT_FOUND)) {
            await timer(1);
            await sendMessage('CPF NÃO ENCONTRADO - PŔOXIMO CLIENTE');
            const clienteRow = {
              ...planos[i],
              STATUS: 'NÃO ENCONTRADO',
            };
            await saveRows([clienteRow]);
            await clearMessages();
            progress = 4;
          }
          if (lastMessage.includes(MESSAGES.OPTIONS_PAGAMENTO)) {
            await timer(4);
            await sendMessage('-> PRÓXIMA MENSAGEM (opcoes pgmt)');
          }

          if (lastMessage.includes(MESSAGES.END_FLUX_MESSAGE)) {
            const oldMessage = await lastMessagehasPassed30Seconds();
            if (oldMessage) {
              await sendMessage('-> PRÓXIMA MENSAGEM');
            }
          }
        } else {
          await timer(2);
          await sendMessage(' -> PRÓXIMA MENSAGEM ');
          if (lastMessage == ' -> PRÓXIMA MENSAGEM ') {
            await timer(4);
          }
          await timer(3);
        }
      }
    }
    await sendMessage('Relatório finalizado');
    return {
      message: `Relatório finalizado: ${planos.length} resultados extraídos `,
    };
  }
}
