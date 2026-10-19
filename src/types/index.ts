export type UserRole = "resident" | "provider";

export type Gender = "female" | "male" | "other" | "prefer_not_to_say";

export interface User {
  id: string;
  fullName: string;
  displayName?: string | null;
  email: string;
  phone?: string | null;
  role: UserRole;
  createdAt?: string;

  /* Profile bio fields */
  avatarUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  occupation?: string | null;
  languages?: string[] | null;
  gender?: Gender | null;
  dateOfBirth?: string | null; // ISO date, YYYY-MM-DD
}

export interface UpdateProfileInput {
  fullName: string;
  displayName?: string;
  phone?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  languages?: string[];
  gender?: Gender;
  dateOfBirth?: string;
}

export interface ProviderSummary {
  id: string;
  name: string;
  category: string;
  serviceArea?: string | null;
  profileImageUrl?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  description?: string | null;
}

export interface Review {
  id: string;
  providerId: string;
  providerName?: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  text: string;
  createdAt?: string;
}

export interface ReviewInput {
  rating: number;
  text: string;
}

export interface ReviewSummaryData {
  averageRating: number | null;
  reviewCount: number;
}

export interface ConversationSummary {
  id: string;
  participantName: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

/** Normalised error shape produced by the API client. */
export interface ApiError {
  status: number | null;
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
}