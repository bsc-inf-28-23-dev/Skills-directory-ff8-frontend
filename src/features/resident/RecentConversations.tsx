import Avatar from "../../components/Avatar";
import EmptyState from "../../components/EmptyState";
import ErrorAlert from "../../components/ErrorAlert";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAsync } from "../../hooks/useAsync";
import { getRecentConversations } from "../../services/residentService";
import { formatDate } from "../../utils/format";

export default function RecentConversations() {
  const { data, loading, error, reload } = useAsync(() => getRecentConversations(5));

  if (loading) return <LoadingSpinner label="Loading conversations..." />;
  if (error) return <ErrorAlert message={error.message} onRetry={reload} />;
  if (!data || data.length === 0) {
    return (
      <EmptyState icon="bi-chat-dots" title="No conversations yet">
        When you contact a provider, your conversation will appear here.
      </EmptyState>
    );
  }

  return (
    <ul className="list-unstyled mb-0">
      {data.map((c) => (
        <li key={c.id} className="py-3 border-top d-flex align-items-center gap-3">
          <Avatar name={c.participantName} />
          <div className="flex-grow-1 min-w-0">
            <div className="d-flex justify-content-between gap-2">
              <span className="fw-semibold text-truncate">{c.participantName}</span>
              <span className="small text-muted-ink flex-shrink-0 text-uppercase" style={{ letterSpacing: "0.06em" }}>
                {formatDate(c.lastMessageAt)}
              </span>
            </div>
            {c.lastMessage && <div className="small text-muted-ink text-truncate">{c.lastMessage}</div>}
          </div>
          {!!c.unreadCount && (
            <span className="rating-badge" aria-label={`${c.unreadCount} unread`}>
              {c.unreadCount}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}