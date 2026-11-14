import { useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import type { Message } from '../types/message';

export function useChatRoom(roomId: string, initialMessages: Message[]) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    const socket = getSocket();
    socket.auth = { token: localStorage.getItem('accessToken') };
    socket.connect();
    socket.emit('chat:join', { roomId });

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('message:new', handleNewMessage);

    return () => {
      socket.emit('chat:leave', { roomId });
      socket.off('message:new', handleNewMessage);
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = (content: string, senderId: string, senderName: string) => {
    const socket = getSocket();
    socket.emit('message:send', { roomId, content, senderId, senderName });
  };

  return { messages, sendMessage };
}