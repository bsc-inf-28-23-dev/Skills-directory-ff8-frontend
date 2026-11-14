import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ChatWindow } from '../../../components/chat/ChatWindow';
import { useAuth } from '../../../hooks/useAuth';
import { useChatRoom } from '../../../hooks/useChatRoom';

export const Conversation: React.FC = () => {
  const { providerId = '' } = useParams();
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `/conversation/${providerId}` }}
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
  const providerName = 'Service provider';
  const roomId = `${userId}__${providerId}`;
  const { messages, sendMessage } = useChatRoom(roomId, []);

  return (
    <ChatWindow
      myRole="resident"
      myId={userId}
      otherPartyId={providerId}
      otherPartyName={providerName}
      messages={messages}
      onSend={(text) => sendMessage(text, userId, userName)}
    />
  );
}