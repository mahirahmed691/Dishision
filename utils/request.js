import axios from 'axios';

// Axios instance with custom configuration
export const axiosInstance = axios.create({
  baseURL: 'https://api.openai.com/v1/chat/completions', // Set your API base URL here
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
    // Add any other default headers here
  },
});