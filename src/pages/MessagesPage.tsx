import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getConversations, getConversationDetails, sendMessageAPI } from '../services/chatService';
import type { Conversation } from '../types/conversation';
import type { Message } from '../types/message';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatWindow } from '../components/chat/ChatWindow';
import { ChatLayout } from '../components/chat/ChatLayout';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth(); // We need this to know who is logged in
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch all conversations on load
  useEffect(() => {
    async function loadInbox() {
      try {
        const data = await getConversations();
        setConversations(data);
        if (data.length > 0) {
          setActiveConv(data[0]); // Auto-select the first chat
        }
      } catch (err) {
        console.error("Failed to load inbox", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadInbox();
  }, [user]);

  // 2. Fetch messages when active conversation changes
  useEffect(() => {
    async function loadMessages() {
      if (!activeConv) return;
      try {
        const data = await getConversationDetails(activeConv.id);
        setMessages(data.messages || []); // Assuming backend returns { messages: [] }
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    }
    loadMessages();
  }, [activeConv]);

  // 3. Send message
  const handleSend = async (text: string) => {
    if (!activeConv || !user) return;
    
    // Optimistic UI update
    const newMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: activeConv.id,
      senderId: user.id,
      senderName: user.fullName,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);

    try {
      const savedMsg = await sendMessageAPI(activeConv.id, text);
      // Replace temp msg with real one
      setMessages((prev) => prev.map(m => m.id === newMsg.id ? savedMsg : m));
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (loading) return <div className="p-5 text-center">Loading messages...</div>;
  if (!user) return <div className="p-5 text-center">Please log in to view messages.</div>;

  // Determine role for styling based on logged in user
  const myRole = user.role === 'provider' ? 'provider' : 'resident';

  return (
    <ChatLayout
      sidebar={
        <ChatSidebar
          conversations={conversations}
          activeId={activeConv?.id || null}
          onSelect={(conv) => setActiveConv(conv)}
        />
      }
    >
      {activeConv ? (
        <ChatWindow
          myRole={myRole}
          myId={user.id}
          otherPartyName={activeConv.otherPartyName}
          messages={messages}
          onSend={handleSend}
          isConnected={true}
        />
      ) : (
        <div className="d-flex align-items-center justify-content-center h-100 text-muted">
          Select a conversation to start chatting
        </div>
      )}
    </ChatLayout>
  );
};