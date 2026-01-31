// front-end/src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true  // Important for cookies/session and proper CORS
});
export const pythonApi = axios.create({
  baseURL: "http://localhost:5001",
});

export default api;

