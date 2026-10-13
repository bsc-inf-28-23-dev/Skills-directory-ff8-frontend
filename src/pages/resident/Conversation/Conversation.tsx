import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Message } from '../../../types/message';

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
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <div className="text-center">
          <div className="fw-bold">Rapid Flow Plumbing</div>
          <small className="text-success">● Online</small>
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div
        className="card shadow-sm d-flex flex-column"
        style={{ height: '70vh', background: '#f6f4ef' }}
      >
        <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
          {messages.map((m) => {
            const isOwn = m.senderId === FAKE_USER_ID;
            const time = new Date(m.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <div
                key={m.id}
                className={`d-flex mb-2 ${
                  isOwn ? 'justify-content-end' : 'justify-content-start'
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-3 shadow-sm ${
                    isOwn ? 'bg-warning text-dark' : 'bg-white text-dark'
                  }`}
                  style={{ maxWidth: '70%' }}
                >
                  {!isOwn && (
                    <div className="fw-bold small text-muted">
                      {m.senderName}
                    </div>
                  )}
                  <div>{m.content}</div>
                  <div
                    className="text-end small text-muted mt-1"
                    style={{ fontSize: '0.7rem' }}
                  >
                    {time}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="d-flex gap-2 p-3 border-top bg-light"
        >
          <input
            type="text"
            className="form-control"
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-warning fw-bold text-dark px-4"
            disabled={!text.trim()}
          >
            Send
          </button>
        </form>
      </div>

      <div className="text-center text-muted small mt-2">
        Chatting with provider #{providerId}
      </div>
    </div>
  );
};