import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { ChatWindow } from '../../../components/chat/ChatWindow';
import { useAuth } from '../../../hooks/useAuth';
import { useChatRoom } from '../../../hooks/useChatRoom';

export const ProviderConversation: React.FC = () => {
  const { residentId = '' } = useParams();
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'provider') {
    return (
      <Navigate
        to="/provider/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return (
    <ProviderConversationSession
      key={`${residentId}-${user.id}`}
      residentId={residentId}
      userId={user.id}
      userName={user.fullName}
      residentName={
        (location.state as { otherPartyName?: string } | null)?.otherPartyName ??
        'Resident'
      }
    />
  );
};

function ProviderConversationSession({
  residentId,
  userId,
  userName,
  residentName,
}: {
  residentId: string;
  userId: string;
  userName: string;
  residentName: string;
}) {
  const roomId = `${residentId}__${userId}`;
  const { messages, sendMessage } = useChatRoom(roomId, []);

  return (
    <ChatWindow
      myRole="provider"
      myId={userId}
      otherPartyId={residentId}
      otherPartyName={residentName}
      messages={messages}
      onSend={(text) => sendMessage(text, userId, userName)}
    />
  );
}