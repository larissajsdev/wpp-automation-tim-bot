import { Schema } from 'mongoose';

import { dbserver } from '../../libs/db.connect';
import { MessageRemarketing } from '../dto/typebot.dto';

class Session {
  remoteJid?: string;
  sessionId?: string;
  status?: string;
  createdAt?: number;
  updateAt?: number;
}

export class TypebotRaw {
  _id?: string;
  enabled?: boolean;
  url: string;
  typebot?: string;
  expire?: number;
  remarketing?: MessageRemarketing[]
  keyword_finish?: string;
  delay_message?: number;
  unknown_message?: string;
  listening_from_me?: boolean;
  sessions?: Session[];
}

const typebotSchema = new Schema<TypebotRaw>({
  _id: { type: String, _id: true },
  enabled: { type: Boolean, required: true },
  url: { type: String, required: true },
  typebot: { type: String, required: true },
  expire: { type: Number, required: true },
  remarketing: [{
    timeout_minutes: { type: Number, required: true },
    type: { type: String, required: true },
    content: { type: String, required: true }
  }],
  keyword_finish: { type: String, required: true },
  delay_message: { type: Number, required: true },
  unknown_message: { type: String, required: true },
  listening_from_me: { type: Boolean, required: true },
  sessions: [
    {
      remoteJid: { type: String, required: true },
      sessionId: { type: String, required: true },
      status: { type: String, required: true },
      createdAt: { type: Number, required: true },
      updateAt: { type: Number, required: true },
    },
  ],
});

export const TypebotModel = dbserver?.model(TypebotRaw.name, typebotSchema, 'typebot');
export type ITypebotModel = typeof TypebotModel;
