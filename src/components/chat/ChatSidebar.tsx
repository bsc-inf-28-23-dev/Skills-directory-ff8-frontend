import React from 'react';
import type { Conversation } from '../../types/conversation';
import './ChatSidebar.css';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conversation: Conversation) => void;
}

export const ChatSidebar: React.FC<Props> = ({ conversations, activeId, onSelect }) => {
  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h2>Messages</h2>
      </div>
      <div className="sidebar-list">
        {conversations.map((conv) => {
          const isActive = activeId === conv.id;
          return (
            <button
              key={conv.id}
              className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
              onClick={() => onSelect(conv)}
            >
              <div className="sidebar-avatar">
                {conv.otherPartyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="sidebar-details">
                <div className="sidebar-top">
                  <span className="sidebar-name">{conv.otherPartyName}</span>
                  <span className="sidebar-time">
                    {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="sidebar-bottom">
                  <span className="sidebar-preview">{conv.lastMessage}</span>
                  {conv.unreadCount > 0 && (
                    <span className="sidebar-badge">{conv.unreadCount}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};