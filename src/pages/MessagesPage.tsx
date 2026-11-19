import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getConversations,
  getConversationDetails,
  sendMessageAPI,
} from "../services/chatService";
import type { Conversation } from "../types/conversation";
import type { Message } from "../types/message";
import { ChatSidebar } from "../components/chat/ChatSidebar";
import { ChatWindow } from "../components/chat/ChatWindow";
import { ChatLayout } from "../components/chat/ChatLayout";

export default function MessagesPage() {
  const { user } = useAuth();
  const { providerId, residentId } = useParams();
  const peerId = providerId ?? residentId;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInbox() {
      setLoading(true);
      setError("");
      try {
        const data = await getConversations();
        if (!active) return;
        setConversations(data);
        const selected = peerId
          ? data.find((conversation) => conversation.otherPartyId === peerId)
          : data[0];
        setActiveConv(selected ?? null);
        if (peerId && !selected) {
          setError("That conversation could not be found in your inbox.");
        }
      } catch (loadError) {
        console.error("Failed to load inbox.", loadError);
        if (active) setError("Messages could not be loaded. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (user) void loadInbox();
    return () => {
      active = false;
    };
  }, [peerId, user]);

  useEffect(() => {
    let active = true;
    async function loadMessages() {
      if (!activeConv) {
        setMessages([]);
        return;
      }

      setError("");
      try {
        const data = await getConversationDetails(activeConv.id);
        if (active) setMessages(data.messages ?? []);
      } catch (loadError) {
        console.error("Failed to load conversation messages.", loadError);
        if (active) setError("This conversation could not be loaded. Please try again.");
      }
    }

    void loadMessages();
    return () => {
      active = false;
    };
  }, [activeConv]);

  async function handleSend(text: string) {
    if (!activeConv || !user) return;

    const temporaryId = `temp-${Date.now()}`;
    const newMessage: Message = {
      id: temporaryId,
      conversationId: activeConv.id,
      senderId: user.id,
      senderName: user.fullName,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((previous) => [...previous, newMessage]);
    setError("");

    try {
      const savedMessage = await sendMessageAPI(activeConv.id, text);
      setMessages((previous) =>
        previous.map((message) =>
          message.id === temporaryId ? savedMessage : message,
        ),
      );
    } catch (sendError) {
      console.error("Failed to send message.", sendError);
      setMessages((previous) =>
        previous.filter((message) => message.id !== temporaryId),
      );
      setError("Your message was not sent. Please try again.");
    }
  }

  if (!user) return null;
  if (loading) return <div className="p-5 text-center">Loading messages...</div>;

  const myRole = user.role === "provider" ? "provider" : "resident";

  return (
    <>
      {error && (
        <div className="alert alert-warning mx-auto mt-3" role="alert" style={{ maxWidth: 960 }}>
          {error}
        </div>
      )}
      <ChatLayout
        sidebar={
          <ChatSidebar
            conversations={conversations}
            activeId={activeConv?.id ?? null}
            onSelect={(conversation) => {
              setActiveConv(conversation);
              setError("");
            }}
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
            isConnected
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100 text-muted">
            {peerId
              ? "No conversation exists with this person yet."
              : "Select a conversation to start chatting."}
          </div>
        )}
      </ChatLayout>
    </>
  );
}
