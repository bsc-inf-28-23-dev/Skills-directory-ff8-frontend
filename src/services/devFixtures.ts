
import type {
  ConversationSummary,
  ProviderSummary,
  Review,
  User,
} from "../types";

export const fixtureUser: User = {
  id: "dev-resident-1",
  fullName: "Resident A",
  email: "sample.resident@example.invalid",
  phone: "",
  role: "resident",
};

export const fixtureProviders: ProviderSummary[] = [
  {
    id: "dev-provider-1",
    name: "Plumber",
    category: "Plumbing",
    serviceArea: "Sample Area",
    averageRating: 4.5,
    reviewCount: 2,
    description: "Development sample provider. Not a real business.",
  },
  {
    id: "dev-provider-2",
    name: "Electrician",
    category: "Electrical Services",
    serviceArea: "Sample Area",
    averageRating: null,
    reviewCount: 0,
    description: "Development sample provider. Not a real business.",
  },
];

export const fixtureConversations: ConversationSummary[] = [
  {
    id: "dev-conv-1",
    participantName: " Capenter",
    lastMessage: "Development sample message.",
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
  },
];

export const fixtureReviews: Review[] = [
  {
    id: "dev-review-1",
    providerId: "dev-provider-1",
    providerName: " Provider A",
    reviewerId: "dev-resident-1",
    reviewerName: "Sample Resident",
    rating: 5,
    text: "Development sample review text, not a real customer testimonial.",
    createdAt: new Date(Date.now() - 86_400_000 * 3).toISOString(),
  },
  {
    id: "dev-review-2",
    providerId: "dev-provider-1",
    providerName: "Sample Provider A",
    reviewerId: "dev-resident-2",
    reviewerName: "Another Sample Resident",
    rating: 4,
    text: "Second development sample review, not a real customer testimonial.",
    createdAt: new Date(Date.now() - 86_400_000 * 10).toISOString(),
  },
];

export function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
