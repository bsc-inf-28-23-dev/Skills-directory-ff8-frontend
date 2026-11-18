import React from 'react';
import './ChatLayout.css';

interface ChatLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ sidebar, children }) => {
  return (
    <div className="chat-layout-container">
      <div className="chat-layout-sidebar">
        {sidebar}
      </div>
      <div className="chat-layout-main">
        {children}
      </div>
    </div>
  );
};