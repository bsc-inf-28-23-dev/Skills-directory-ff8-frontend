import React, { useMemo, useState } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { MessageCircle, Search } from 'lucide-react';
import Avatar from '../../../components/Avatar';
import type { Message } from '../../../types/message';
import { ChatWindow } from '../../../components/chat/ChatWindow';
import { providers } from '../../../data/provider';
import { useAuth } from '../../../hooks/useAuth';
import './Conversation.css';

export const Conversation: React.FC = () => {
  const { providerId = '' } = useParams();
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return (
    <ConversationSession
      key={`${providerId}-${user.id}`}
      providerId={providerId}
      userId={user.id}
      userName={user.fullName}
    />
  );
};

function ConversationSession({
  providerId,
  userId,
  userName,
}: {
  providerId: string;
  userId: string;
  userName: string;
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filteredProviders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return providers.filter((provider) =>
      `${provider.name} ${provider.category} ${provider.area}`
        .toLowerCase()
        .includes(query),
    );
  }, [search]);
  const activeProvider = providers.find((provider) => provider.id === providerId);
  const providerName = activeProvider?.name ?? 'Service provider';
  const roomId = `${userId}__${providerId}`;
  const [messages, setMessages] = useState<Message[]>(() =>
    providerId
      ? [
          {
            id: 'm1',
            roomId,
            senderId: providerId,
            senderName: providerName,
            content: 'Hi! How can I help you today?',
            createdAt: new Date(Date.now() - 60000).toISOString(),
          },
          {
            id: 'm2',
            roomId,
            senderId: userId,
            senderName: userName,
            content: 'I would like to ask about your services.',
            createdAt: new Date(Date.now() - 45000).toISOString(),
          },
          {
            id: 'm3',
            roomId,
            senderId: providerId,
            senderName: providerName,
            content: 'Sure. Tell me a little more about what you need.',
            createdAt: new Date(Date.now() - 20000).toISOString(),
          },
        ]
      : [],
  );

  const handleSend = (text: string) => {
    const newMsg: Message = {
      id: `local-${Date.now()}`,
      roomId,
      senderId: userId,
      senderName: userName,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);

    setTimeout(() => {
      const reply: Message = {
        id: `reply-${Date.now()}`,
        roomId,
        senderId: providerId,
        senderName: providerName,
        content: 'Got it, looking into this now…',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };

  return (
    <main className="wa-page">
      <section className={`wa-workspace${providerId ? ' has-selection' : ''}`}>
        <aside className="wa-sidebar">
          <header className="wa-sidebar__header">
            <div>
              <p>Skillz Directory</p>
              <h1>Messages</h1>
            </div>
            <MessageCircle size={21} aria-hidden="true" />
          </header>

          <label className="wa-sidebar__search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search providers"
              aria-label="Search providers"
            />
          </label>

          <div className="wa-sidebar__list">
            {filteredProviders.map((provider) => (
              <button
                type="button"
                key={provider.id}
                className={`wa-contact${
                  provider.id === providerId ? ' is-selected' : ''
                }`}
                onClick={() => navigate(`/resident/messages/${provider.id}`)}
              >
                <Avatar
                  name={provider.person || provider.name}
                  imageUrl={provider.photo}
                  size={48}
                />
                <span className="wa-contact__copy">
                  <strong>{provider.name}</strong>
                  <small>
                    {provider.category} · {provider.area}
                  </small>
                </span>
                <span className="wa-contact__chevron" aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
            {filteredProviders.length === 0 && (
              <p className="wa-sidebar__empty">No providers found.</p>
            )}
          </div>
        </aside>

        <section className="wa-chat-pane" aria-label="Conversation">
          {providerId ? (
            <ChatWindow
              myRole="resident"
              myId={userId}
              otherPartyId={providerId}
              otherPartyName={providerName}
              messages={messages}
              onSend={handleSend}
              onBack={() => navigate('/resident/messages')}
            />
          ) : (
            <div className="wa-welcome">
              <MessageCircle size={54} strokeWidth={1.3} aria-hidden="true" />
              <h2>Keep your service conversations together</h2>
              <p>Select a provider to view or start a conversation.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}