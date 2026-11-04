import React, { useState } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import type { Message } from '../../../types/message';
import { ChatWindow } from '../../../components/chat/ChatWindow';
import { providers } from '../../../data/provider';
import { useAuth } from '../../../hooks/useAuth';

export const Conversation: React.FC = () => {
  const { providerId = '' } = useParams();
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `/conversation/${providerId}` }}
      />
    );
  }

  return (
    <ConversationSession
      key={`${providerId}-${user.id}`}
      providerId={providerId}
      userId={user.id}
      userName={user.fullName}
    />
  );
};

function ConversationSession({
  providerId,
  userId,
  userName,
}: {
  providerId: string;
  userId: string;
  userName: string;
}) {
  const navigate = useNavigate();
  const providerName =
    providers.find((provider) => provider.id === providerId)?.name ??
    'Service provider';
  const roomId = `${userId}__${providerId}`;
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'm1',
      roomId,
      senderId: providerId,
      senderName: providerName,
      content: 'Hi! How can I help you today?',
      createdAt: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: 'm2',
      roomId,
      senderId: userId,
      senderName: userName,
      content: 'I would like to ask about your services.',
      createdAt: new Date(Date.now() - 45000).toISOString(),
    },
    {
      id: 'm3',
      roomId,
      senderId: providerId,
      senderName: providerName,
      content: 'Sure. Tell me a little more about what you need.',
      createdAt: new Date(Date.now() - 20000).toISOString(),
    },
  ]);

  const handleSend = (text: string) => {
    const newMsg: Message = {
      id: `local-${Date.now()}`,
      roomId,
      senderId: userId,
      senderName: userName,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);

    setTimeout(() => {
      const reply: Message = {
        id: `reply-${Date.now()}`,
        roomId,
        senderId: providerId,
        senderName: providerName,
        content: 'Got it, looking into this now…',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };

  return (
    <ChatWindow
      myRole="resident"
      myId={userId}
      otherPartyId={providerId}
      otherPartyName={providerName}
      messages={messages}
      onSend={handleSend}
      onBack={() => navigate('/services')}
    />
  );
}