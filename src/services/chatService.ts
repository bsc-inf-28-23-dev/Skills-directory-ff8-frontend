import api from "./api";
import type { Conversation } from "../types/conversation";
import type { Message } from "../types/message";

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get<Conversation[]>("/conversations");
  return data;
}

export async function getConversationDetails(
  id: string,
): Promise<{ messages: Message[] }> {
  const { data } = await api.get<{ messages: Message[] }>(`/conversations/${id}`);
  return data;
}

export async function sendMessageAPI(
  conversationId: string,
  content: string,
): Promise<Message> {
  const { data } = await api.post<Message>(
    `/conversations/${conversationId}/messages`,
    { content },
  );
  return data;
}
