import api from './api';
import type { Conversation } from '../types/conversation';

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get<Conversation[]>('/conversations');
  return data;
}