import axios from 'axios';

// Axios instance with custom configuration
export const axiosGPT = axios.create({
  baseURL: 'https://api.openai.com/v1/chat/completions', 
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
    // Add any other default headers here
  },
});