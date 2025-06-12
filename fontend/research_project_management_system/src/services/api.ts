import axios from 'axios';
import type { UserLogin } from '../types/user';

const api = axios.create({
  baseURL: '/api',
});

export const loginUser = async (credentials : UserLogin ) => {
  const response = await api.post('/login', credentials);
  return response.data;
};