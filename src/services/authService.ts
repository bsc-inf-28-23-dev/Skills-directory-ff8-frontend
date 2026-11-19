
import api from './api';
import type { User, UserRole } from '../types';

export interface LoginData {
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
  token?: string;
}

export interface RegisterData extends Omit<LoginData, "role"> {
  fullName: string;
  phone: string;
  role: UserRole;
}

export async function loginUser(data: LoginData): Promise<AuthResponse> {
  const { data: response } = await api.post<AuthResponse>('/auth/login', data);
  return response;
}

export async function registerUser(data: RegisterData): Promise<void> {
  await api.post('/auth/register', data);
}
