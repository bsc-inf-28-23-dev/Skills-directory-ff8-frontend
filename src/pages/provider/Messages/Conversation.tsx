import React, { useState } from 'react';
import type { Message } from '../../../types/message';
import type { Conversation } from '../../../types/conversation';
import { ChatWindow } from '../../../components/chat/ChatWindow';
import { ChatSidebar } from '../../../components/chat/ChatSidebar';
import { ChatLayout } from '../../../components/chat/ChatLayout';

const FAKE_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    otherPartyId: 'resident-1',
    otherPartyName: 'Resident A',
    otherPartyRole: 'resident',
    lastMessage: 'Hey, my kitchen sink is leaking badly.',
    lastMessageAt: new Date().toISOString(),
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    otherPartyId: 'resident-2',
    otherPartyName: 'Resident B',
    otherPartyRole: 'resident',
    lastMessage: 'Thanks for the quick fix!',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0,
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    { id: 'm1', conversationId: 'conv-1', senderId: 'prov-1', senderName: 'You', content: 'Hi! How can I help?', createdAt: new Date().toISOString() },
    { id: 'm2', conversationId: 'conv-1', senderId: 'resident-1', senderName: 'Resident A', content: 'My sink is leaking.', createdAt: new Date().toISOString() },
  ],
  'conv-2': [
    { id: 'm3', conversationId: 'conv-2', senderId: 'resident-2', senderName: 'Resident B', content: 'Thanks for the quick fix!', createdAt: new Date().toISOString() },
  ],
};

export const ProviderConversation: React.FC = () => {
  const [activeConv, setActiveConv] = useState<Conversation>(FAKE_CONVERSATIONS[0]);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES[activeConv.id] || []);

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConv(conv);
    setMessages(MOCK_MESSAGES[conv.id] || []);
  };

  const handleSend = (text: string) => {
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      conversationId: activeConv.id,
      senderId: 'prov-1',
      senderName: 'You',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <ChatLayout
      sidebar={
        <ChatSidebar
          conversations={FAKE_CONVERSATIONS}
          activeId={activeConv.id}
          onSelect={handleSelectConversation}
        />
      }
    >
      <ChatWindow
        myRole="provider"
        myId="prov-1"
        otherPartyName={activeConv.otherPartyName}
        messages={messages}
        onSend={handleSend}
        isConnected={true}
      />
    </ChatLayout>
  );
};