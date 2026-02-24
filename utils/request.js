import axios from 'axios';
import { OPENAI_KEY } from "@env";

const normalizedOpenAIKey = (OPENAI_KEY || "").trim().replace(/^["']|["']$/g, "");
export const hasOpenAIKey = normalizedOpenAIKey.length > 0;

// Axios instance with custom configuration
export const axiosGPT = axios.create({
  baseURL: 'https://api.openai.com/v1/chat/completions', 
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${normalizedOpenAIKey}`,
    // Add any other default headers here
  },
});
