import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Message } from '../../../types/message';
import './Conversation.css';

const FAKE_USER_ID = 'user-1';
const FAKE_USER_NAME = 'You';

const FAKE_HISTORY: Message[] = [
  {
    id: 'm1',
    roomId: 'demo',
    senderId: 'prov-1',
    senderName: 'Rapid Flow Plumbing',
    content: 'Hi! How can I help you today?',
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'm2',
    roomId: 'demo',
    senderId: FAKE_USER_ID,
    senderName: FAKE_USER_NAME,
    content: 'Hey, my kitchen sink is leaking badly.',
    createdAt: new Date(Date.now() - 45000).toISOString(),
  },
  {
    id: 'm3',
    roomId: 'demo',
    senderId: 'prov-1',
    senderName: 'Rapid Flow Plumbing',
    content: "No problem. Can you send a photo of where it's leaking?",
    createdAt: new Date(Date.now() - 20000).toISOString(),
  },
];

export const Conversation: React.FC = () => {
  const { providerId = '' } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>(FAKE_HISTORY);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMsg: Message = {
      id: `local-${Date.now()}`,
      roomId: 'demo',
      senderId: FAKE_USER_ID,
      senderName: FAKE_USER_NAME,
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setText('');

    setTimeout(() => {
      const reply: Message = {
        id: `reply-${Date.now()}`,
        roomId: 'demo',
        senderId: 'prov-1',
        senderName: 'Rapid Flow Plumbing',
        content: 'Got it, looking into this now…',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <button className="chat-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="chat-header-center">
          <div className="chat-provider-name">Rapid Flow Plumbing</div>
          <small className="chat-status">● Online</small>
        </div>
        <div className="chat-header-spacer" />
      </div>

      {/* Chat card */}
      <div className="chat-card">
        <div className="chat-messages">
          {messages.map((m) => {
            const isOwn = m.senderId === FAKE_USER_ID;
            const time = new Date(m.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <div
                key={m.id}
                className={`chat-row ${
                  isOwn ? 'chat-row--own' : 'chat-row--other'
                }`}
              >
                <div
                  className={`chat-bubble ${
                    isOwn ? 'chat-bubble--own' : 'chat-bubble--other'
                  }`}
                >
                  {!isOwn && (
                    <div className="chat-bubble-sender">{m.senderName}</div>
                  )}
                  <div className="chat-bubble-content">{m.content}</div>
                  <div className="chat-bubble-time">{time}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!text.trim()}
          >
            Send
          </button>
        </form>
      </div>

      <div className="chat-footer">Chatting with provider #{providerId}</div>
    </div>
  );
};