import type { Conversation } from "../types/conversation";

export const providerConversations: Conversation[] = [
  {
    id: "resident-1__prov-1",
    otherPartyId: "resident-1",
    otherPartyName: "Resident A",
    otherPartyRole: "resident",
    lastMessage: "Hey, my kitchen sink is leaking badly.",
    lastMessageAt: new Date(Date.now() - 45000).toISOString(),
    unreadCount: 2,
  },
  {
    id: "resident-2__prov-1",
    otherPartyId: "resident-2",
    otherPartyName: "Resident B",
    otherPartyRole: "resident",
    lastMessage: "Thanks for the quick fix!",
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0,
  },
];
