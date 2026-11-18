import React, { useEffect, useRef } from 'react';
import type { Message } from '../../types/message';
import type { Role } from '../../types/room';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import './ChatWindow.css';

interface Props {
  myRole: Role;
  myId: string;
  otherPartyName: string;
  messages: Message[];
  onSend: (text: string) => void;
  isConnected?: boolean;
}

export const ChatWindow: React.FC<Props> = ({
  myRole,
  myId,
  otherPartyName,
  messages,
  onSend,
  isConnected = false,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-header-spacer" />

        <div className="chat-header-center">
          <div className="chat-provider-name">{otherPartyName}</div>
          <small className="chat-status" style={{ color: isConnected ? '#28a745' : '#6b6375' }}>
            {isConnected ? '● Connected' : '○ Offline'}
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