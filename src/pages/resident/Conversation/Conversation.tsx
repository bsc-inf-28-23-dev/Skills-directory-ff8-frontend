import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Message } from '../../../types/message';
import { ChatWindow } from '../../../components/chat/ChatWindow';
import { providers } from '../../../data/provider';

const FAKE_USER_ID = 'resident-1';
const FAKE_USER_NAME = 'You';

export const Conversation: React.FC = () => {
  const { providerId = '' } = useParams();
  return <ConversationSession key={providerId} providerId={providerId} />;
};

function ConversationSession({ providerId }: { providerId: string }) {
  const navigate = useNavigate();
  const providerName =
    providers.find((provider) => provider.id === providerId)?.name ??
    'Service provider';
  const roomId = `resident-1__${providerId}`;
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
      senderId: FAKE_USER_ID,
      senderName: FAKE_USER_NAME,
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
      senderId: FAKE_USER_ID,
      senderName: FAKE_USER_NAME,
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
      myId={FAKE_USER_ID}
      otherPartyId={providerId}
      otherPartyName={providerName}
      messages={messages}
      onSend={handleSend}
      onBack={() => navigate('/services')}
    />
  );
}