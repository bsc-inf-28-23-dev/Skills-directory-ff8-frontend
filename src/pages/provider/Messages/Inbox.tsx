import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Conversation } from '../../../types/conversation';
import './Inbox.css';

const FAKE_CONVERSATIONS: Conversation[] = [
  {
    id: 'resident-1__prov-1',
    otherPartyId: 'resident-1',
    otherPartyName: 'Resident A',
    otherPartyRole: 'resident',
    lastMessage: 'Hey, my kitchen sink is leaking badly.',
    lastMessageAt: new Date(Date.now() - 45000).toISOString(),
    unreadCount: 2,
  },
  {
    id: 'resident-2__prov-1',
    otherPartyId: 'resident-2',
    otherPartyName: 'Resident B',
    otherPartyRole: 'resident',
    lastMessage: 'Thanks for the quick fix!',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0,
  },
];

export const Inbox: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="inbox-page">
      <div className="inbox-header">
        <h1 className="inbox-title">Messages</h1>
        <p className="inbox-subtitle">
          {FAKE_CONVERSATIONS.length} conversation
          {FAKE_CONVERSATIONS.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="inbox-list">
        {FAKE_CONVERSATIONS.map((c) => {
          const time = new Date(c.lastMessageAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          return (
            <button
              key={c.id}
              className="inbox-row"
              onClick={() => navigate(`/provider/conversation/${c.otherPartyId}`)}
            >
              <div className="inbox-avatar">
                {c.otherPartyName
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="inbox-body">
                <div className="inbox-row-top">
                  <span className="inbox-name">{c.otherPartyName}</span>
                  <span className="inbox-time">{time}</span>
                </div>
                <div className="inbox-row-bottom">
                  <span className="inbox-preview">{c.lastMessage}</span>
                  {c.unreadCount > 0 && (
                    <span className="inbox-badge">{c.unreadCount}</span>
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