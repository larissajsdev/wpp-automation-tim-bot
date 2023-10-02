import { HttpException, HttpStatus } from '@nestjs/common';
import { apiWhatsapp } from 'src/config/axios';
import { Logger } from '@nestjs/common';
import { timer } from './timer.utils';

export const isFluxPhrase = (frase) => {
  for (const key in MESSAGES) {
    if (frase.includes(MESSAGES[key])) {
      return true;
    }
  }
  return false; // Retorna false se a frase não contiver nenhum trecho
};

export const MESSAGES = {
  WAITING: 'Por favor aguarde',
  MESSAGE_OPTIONS: 'Este canal',
  MESSAGE_CPF: 'timo!',
  MESSAGE_ADDRESS: 'Identificamos o seu cadastro',
  FATURA_MESSAGE: 'Certo! Vi',
  FATURA_UNICA: 'Pronto! Aqui está sua fatura com ',
  PROTOCOLO_MESSAGE: 'O protocolo do seu atendimento',
  GREETINGS: 'Olá! Seja bem-vindo(a)',
  DUPLICATE_ADDRESS: 'Identificamos mais de uma',
  PROTOCOLO_ATENDIMENTO: 'O protocolo do seu atendimento',
  FALHA_SOLICITACAO: 'Ops, não conseguimos seguir com a',
  AGRADECEMOS: 'Agradecemos seu contato',
  END_MESSAGE1: 'Baixe o app - iO',
  END_FLUX_MESSAGE: 'Baixe o app - Andro',
  NOT_FOUND: 'Ops, não conseguimos loca',
  OPTIONS_PAGAMENTO: 'Se você já pagou',
};
export const ERROR_MESSAGE = {
  NOT_FOUND: 'Ops, não conseguimos loca',
};

export async function getFaturasMessage() {
  const response = await apiWhatsapp.get('all-messages-in-chat/552180563748');
  const allMessages = response.data.response;
  const faturaMessage = allMessages[allMessages.length - 2].content;
  return faturaMessage;
}

export async function getLastMessageContent() {
  try {
    const allMessages = await getAllMessagesContent();
    const lastMessage = allMessages[allMessages.length - 1];
    return lastMessage;
  } catch (error) {
    await sendMessage(' ----> NOVA MENSAGEM');
    await timer(2);
    console.log(error);
  }
}

export async function getAllMessagesContent() {
  try {
    const response = await apiWhatsapp.get(
      'all-messages-in-chat/5521980563748',
    );
    const allMessages = response.data.response;

    if (!allMessages) {
      await sendMessage('Iniciar');
    }
    const AllMessagesContent = allMessages.map((message) => message.content);
    return AllMessagesContent;
  } catch (error) {
    console.log(error);
    Logger.warn(
      'Houve um erro ao fazer chamada http para o wpp connect. Verifique as credenciais ou se a instância está ativa no momento',
    );
    throw new HttpException(
      { error: 'Não foi obter mensagens do whatsapp', describe: error },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function getLastMessage() {
  try {
    const response = await apiWhatsapp.get(
      'all-messages-in-chat/5521980563748',
    );
    const allMessages = response.data.response;
    const lastMessage: any = allMessages[allMessages.length - 1];

    return lastMessage;
  } catch (error1) {
    throw new HttpException(
      {
        error:
          'Erro enviar mensagem para a API do Whatsapp, verifique sua sessão do servidor',
        error1,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function lastMessagehasPassed30Seconds() {
  try {
    const lastMessage = await getLastMessage();
    console.log(lastMessage.timestamp + ': TIMESTAMP LAST MESSAGE');
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeDifference = currentTimestamp - lastMessage.timestamp;
    return timeDifference > 20;
  } catch (error1) {
    throw new HttpException(
      {
        error:
          'Erro enviar mensagem para a API do Whatsapp, verifique sua sessão do servidor',
        error1,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function sendTextMessage(text: string) {
  const payload = {
    number: process.env.TIM_NUMBER,
    options: {
      delay: 100,
      presence: 'composing',
      linkPreview: false,
    },
    textMessage: {
      text,
    },
  };

  try {
    await apiWhatsapp.post(
      `message/sendText/${process.env.INSTANCE_NAME}?apikey=${process.env.EVO_API_KEY}`,
      payload,
    );
  } catch (error) {
    throw new Error(error);
  }
}

export async function sendMessage(message) {
  const payload = {
    phone: '552180563748',
    message: message,
    isGroup: false,
  };

  try {
    await apiWhatsapp.post('/send-message', payload);
  } catch (error1) {
    throw new HttpException(
      {
        error:
          'Erro enviar mensagem para a API do Whatsapp, verifique sua sessão do servidor',
        error1,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function clearMessages() {
  try {
    await apiWhatsapp.post('/clear-chat', { phone: '552180563748' });
  } catch (error) {}
}
export function isNaoEncontradoParaCPFValido(message) {
  return message.includes('Ops, não conseguimos seguir com a sua');
}
