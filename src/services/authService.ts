
import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export async function loginUser(data: LoginData) {
  const response = await api.post('/auth/login', data);
  return response.data;
}
