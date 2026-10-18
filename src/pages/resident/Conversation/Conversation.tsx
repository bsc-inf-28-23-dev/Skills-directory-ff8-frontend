import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Message } from '../../../types/message';
import { ChatWindow } from '../../../components/chat/ChatWindow';

const FAKE_USER_ID = 'resident-1';
const FAKE_USER_NAME = 'You';
const PROVIDER_NAME = 'Rapid Flow Plumbing';

const FAKE_HISTORY: Message[] = [
  {
    id: 'm1',
    roomId: 'resident-1__prov-1',
    senderId: 'prov-1',
    senderName: PROVIDER_NAME,
    content: 'Hi! How can I help you today?',
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'm2',
    roomId: 'resident-1__prov-1',
    senderId: FAKE_USER_ID,
    senderName: FAKE_USER_NAME,
    content: 'Hey, my kitchen sink is leaking badly.',
    createdAt: new Date(Date.now() - 45000).toISOString(),
  },
  {
    id: 'm3',
    roomId: 'resident-1__prov-1',
    senderId: 'prov-1',
    senderName: PROVIDER_NAME,
    content: "No problem. Can you send a photo of where it's leaking?",
    createdAt: new Date(Date.now() - 20000).toISOString(),
  },
];

export const Conversation: React.FC = () => {
  const { providerId = '' } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(FAKE_HISTORY);

  const handleSend = (text: string) => {
    const newMsg: Message = {
      id: `local-${Date.now()}`,
      roomId: 'resident-1__prov-1',
      senderId: FAKE_USER_ID,
      senderName: FAKE_USER_NAME,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);

    setTimeout(() => {
      const reply: Message = {
        id: `reply-${Date.now()}`,
        roomId: 'resident-1__prov-1',
        senderId: providerId,
        senderName: PROVIDER_NAME,
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
      otherPartyName={PROVIDER_NAME}
      messages={messages}
      onSend={handleSend}
      onBack={() => navigate(-1)}
    />
  );
};