import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../../components/EmptyState';
import ErrorAlert from '../../../components/ErrorAlert';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useAsync } from '../../../hooks/useAsync';
import { getConversations } from '../../../services/messageService';
import './Inbox.css';

export const Inbox: React.FC = () => {
  const navigate = useNavigate();
  const { data: conversations, loading, error, reload } = useAsync(getConversations);

  if (loading) return <LoadingSpinner label="Loading conversations..." />;
  if (error) return <ErrorAlert message={error.message} onRetry={reload} />;

  return (
    <div className="inbox-page">
      <div className="inbox-header">
        <h1 className="inbox-title">Messages</h1>
        <p className="inbox-subtitle">
          {conversations?.length ?? 0} conversation
          {conversations?.length !== 1 ? 's' : ''}
        </p>
      </div>

      {!conversations?.length ? (
        <EmptyState title="No conversations yet">
          Conversations with residents will appear here.
        </EmptyState>
      ) : (
        <div className="inbox-list">
          {conversations.map((conversation) => {
            const time = conversation.lastMessageAt
              ? new Date(conversation.lastMessageAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';
            return (
              <button
                key={conversation.id}
                className="inbox-row"
                onClick={() =>
                  navigate(`/provider/conversation/${conversation.otherPartyId}`, {
                    state: { otherPartyName: conversation.otherPartyName },
                  })
                }
              >
                <div className="inbox-avatar">
                  {conversation.otherPartyName
                    .split(' ')
                    .map((word) => word[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="inbox-body">
                  <div className="inbox-row-top">
                    <span className="inbox-name">{conversation.otherPartyName}</span>
                    <span className="inbox-time">{time}</span>
                  </div>
                  <div className="inbox-row-bottom">
                    <span className="inbox-preview">{conversation.lastMessage}</span>
                    {conversation.unreadCount > 0 && (
                      <span className="inbox-badge">{conversation.unreadCount}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
