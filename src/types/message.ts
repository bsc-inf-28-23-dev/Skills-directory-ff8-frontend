export interface Message {
  id: string;
  conversationId: string; // <--- ADD THIS LINE
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}