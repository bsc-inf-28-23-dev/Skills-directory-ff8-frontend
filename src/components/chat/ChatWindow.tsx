import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Added
import type { Message } from '../../types/message';
import type { Role } from '../../types/room';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import './ChatWindow.css';

interface Props {
  myRole: Role;
  myId: string;
  otherPartyId: string;
  otherPartyName: string;
  messages: Message[];
  onSend: (text: string) => void;
}

export const ChatWindow: React.FC<Props> = ({
  myRole,
  myId,
  otherPartyName,
  messages,
  onSend,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation(); // Tells us exactly where we are

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleBack = () => {
    // Smart Back Logic: If Provider, go to Inbox. If Resident, go to Home.
    if (pathname.startsWith('/provider')) {
      navigate('/provider/messages');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="chat-back-btn" onClick={handleBack}>
          ← Back
        </button>

        <div className="chat-header-center">
          <div className="chat-provider-name">{otherPartyName}</div>
          <small className="chat-status" style={{ color: '#6b6375' }}>
            ○ Demo Mode
          </small>
        </div>

        <div className="chat-header-spacer" />
      </div>

      <div className="chat-card">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">No messages yet. Say hi 👋</div>
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} myRole={myRole} myId={myId} />
          ))}
          <div ref={bottomRef} />
        </div>

        <MessageInput onSend={onSend} />
      </div>

      <div className="chat-footer">
        {myRole === 'resident' ? 'Chatting with' : 'Resident'}: {otherPartyName}
      </div>
    </div>
  );
};