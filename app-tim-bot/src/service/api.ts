import axios from "axios";
export const api= axios.create({baseURL: process.env.NEXT_PUBLIC_API_URL})
export const apiWhatsapp= axios.create({baseURL: process.env.NEXT_PUBLIC_API_WPP_URL})