import axios from "axios";
import * as dotenv from "dotenv"
dotenv.config()
export const apiWhatsapp = axios.create({
  baseURL: process.env.WPP_URL,
  headers:{"Authorization":`Bearer ${process.env.WPP_TOKEN}`}
})