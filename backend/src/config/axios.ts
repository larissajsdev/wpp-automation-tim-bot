import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
export const apiWhatsapp = axios.create({
  baseURL: process.env.EVO_URL,
  headers: {
    'Content-Type': 'application/json',
    apikey: `${process.env.EVO_API_KEY}`,
  },
});
