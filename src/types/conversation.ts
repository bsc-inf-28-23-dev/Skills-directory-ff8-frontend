
export interface Conversation {
  id: string;
  otherPartyId: string;
  otherPartyName: string;
  otherPartyRole: 'resident' | 'provider';
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}
