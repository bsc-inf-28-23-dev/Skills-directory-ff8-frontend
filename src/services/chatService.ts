import axios from 'axios';


export const API_URL = 'http://localhost:3000/api'; 

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const getMe = async () => {
  const res = await api.get('/users/me');
  return res.data;
};

// Conversations
export const getConversations = async () => {
  const res = await api.get('/conversations');
  return res.data;
};

export const getConversationDetails = async (id: string) => {
  const res = await api.get(`/conversations/${id}`);
  return res.data;
};

export const sendMessageAPI = async (conversationId: string, content: string) => {
  const res = await api.post(`/conversations/${conversationId}/messages`, { content });
  return res.data;
};