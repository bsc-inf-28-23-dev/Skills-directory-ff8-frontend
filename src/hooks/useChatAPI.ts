import { useEffect, useState } from 'react';
import type { Message } from '../types/message';
import { getConversationDetails, sendMessageAPI } from '../services/chatService';

export function useChatAPI(conversationId: string, fallbackMessages: Message[]) {
  const [messages, setMessages] = useState<Message[]>(fallbackMessages);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getConversationDetails(conversationId);
        if (!cancelled && data?.messages) {
          setMessages(data.messages);
          setIsConnected(true); // Backend is alive!
        }
      } catch (err) {
        console.warn('Backend not reachable — using fallback data');
        setIsConnected(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [conversationId]);

  const sendMessage = async (content: string, senderId: string, senderName: string) => {
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      roomId: conversationId,
      senderId,
      senderName,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const saved = await sendMessageAPI(conversationId, content);
      setMessages((prev) => prev.map(m => m.id === tempMsg.id ? { ...saved, senderName } : m));
    } catch (err) {
      console.warn('Failed to send to backend — message is local only');
    }
  };

  return { messages, sendMessage, isConnected, loading };
}