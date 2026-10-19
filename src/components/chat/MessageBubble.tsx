import React from 'react';
import type { Message } from '../../types/message';
import type { Role } from '../../types/room';

interface Props {
  message: Message;
  myRole: Role;
  myId: string;
}

export const MessageBubble: React.FC<Props> = ({ message, myRole, myId }) => {
  const isOwn = message.senderId === myId;
  
  // Determine bubble color based on who sent it
  const bubbleRole: Role = isOwn
    ? myRole
    : myRole === 'resident'
    ? 'provider'
    : 'resident';

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`chat-row ${isOwn ? 'chat-row--own' : 'chat-row--other'}`}>
      <div
        className={`chat-bubble ${
          bubbleRole === 'resident'
            ? 'chat-bubble--resident'
            : 'chat-bubble--provider'
        }`}
      >
        {!isOwn && <div className="chat-bubble-sender">{message.senderName}</div>}
        <div className="chat-bubble-content">{message.content}</div>
        <div className="chat-bubble-time">{time}</div>
      </div>
    </div>
  );
};