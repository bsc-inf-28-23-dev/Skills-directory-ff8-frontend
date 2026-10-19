import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Message } from '../../../types/message';
import { ChatWindow } from '../../../components/chat/ChatWindow';

const FAKE_PROVIDER_ID = 'prov-1';
const FAKE_PROVIDER_NAME = 'Rapid Flow Plumbing';
const RESIDENT_NAME = 'Resident A';

const FAKE_HISTORY: Message[] = [
  {
    id: 'm1',
    roomId: 'resident-1__prov-1',
    senderId: 'prov-1',
    senderName: FAKE_PROVIDER_NAME,
    content: 'Hi! How can I help you today?',
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'm2',
    roomId: 'resident-1__prov-1',
    senderId: 'resident-1',
    senderName: RESIDENT_NAME,
    content: 'Hey, my kitchen sink is leaking badly.',
    createdAt: new Date(Date.now() - 45000).toISOString(),
  },
];

export const ProviderConversation: React.FC = () => {
  const { residentId = '' } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(FAKE_HISTORY);

  const handleSend = (text: string) => {
    const newMsg: Message = {
      id: `local-${Date.now()}`,
      roomId: `resident-1__prov-1`,
      senderId: FAKE_PROVIDER_ID,
      senderName: FAKE_PROVIDER_NAME,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <ChatWindow
      myRole="provider"
      myId={FAKE_PROVIDER_ID}
      otherPartyId={residentId}
      otherPartyName={RESIDENT_NAME}
      messages={messages}
      onSend={handleSend}
      onBack={() => navigate('/provider/messages')}
    />
  );
};