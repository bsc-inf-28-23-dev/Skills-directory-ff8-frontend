import React, { useMemo, useState } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { providerConversations } from '../../../data/providerConversations';
import './Inbox.css';

export const Inbox: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const conversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return providerConversations.filter((conversation) =>
      conversation.otherPartyName.toLowerCase().includes(query),
    );
  }, [search]);

  return (
    <div className="inbox-page">
      <div className="inbox-workspace">
        <aside className="inbox-sidebar">
          <header className="inbox-header">
            <div>
              <p>Skillz Directory</p>
              <h1 className="inbox-title">Messages</h1>
              <span className="inbox-subtitle">
                {providerConversations.length} conversation
                {providerConversations.length !== 1 ? 's' : ''}
              </span>
            </div>
            <MessageCircle size={21} aria-hidden="true" />
          </header>

          <label className="inbox-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
            />
          </label>

          <div className="inbox-list">
            {conversations.map((c) => {
              const time = new Date(c.lastMessageAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <button
                  type="button"
                  key={c.id}
                  className="inbox-row"
                  onClick={() =>
                    navigate(`/provider/conversation/${c.otherPartyId}`)
                  }
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
            {conversations.length === 0 && (
              <p className="inbox-no-results">No conversations found.</p>
            )}
          </div>
        </aside>

        <section className="inbox-welcome">
          <MessageCircle size={54} strokeWidth={1.3} aria-hidden="true" />
          <h2>Keep your conversations close</h2>
          <p>Select a conversation to continue messaging.</p>
        </section>
      </div>
    </div>
  );
};