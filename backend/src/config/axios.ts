import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
export const apiWhatsapp = axios.create({
  baseURL: process.env.API_WPP_URL,
  headers: {
    Authorization:
      'Bearer $2b$10$gv8sh02lEd5mMTm5yefZpe79r0I90kd9xU9uHIS_2E.2UN_.8NOjC',
    'Content-Type': 'application/json',
  },
});
